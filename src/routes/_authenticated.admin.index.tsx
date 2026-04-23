import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Loader2,
  Mail,
  Calendar,
  RefreshCw,
  Power,
  PowerOff,
  Eye,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CalendarPlus,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  listBuyers,
  getAdminStats,
  getBuyerHotmartSummary,
  getBuyerTransactions,
  resendWelcomeEmail,
  updateUserPlan,
} from "@/lib/admin/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminBuyersPage,
});

interface Buyer {
  id: string;
  email: string;
  nombre: string | null;
  plan_type: string;
  plan_start_date: string | null;
  plan_end_date: string | null;
  hotmart_transaction_id: string | null;
  onboarding_completado: boolean;
  created_at: string;
}

interface HotmartSummary {
  totalApproved: number;
  totalRefunded: number;
  currency: string | null;
  transactionCount: number;
}

interface Transaction {
  transaction: string;
  approved_date?: number;
  order_date?: number;
  status?: string;
  product?: { name?: string };
  payment?: { method?: string; installments_number?: number };
  price?: { value?: number; currency_code?: string };
}

function AdminBuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    activos: number;
    inactivos: number;
    mensual: number;
    semestral: number;
    anual: number;
    vencenEn30Dias: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const [hotmartCache, setHotmartCache] = useState<
    Record<string, HotmartSummary | { error: string } | "loading">
  >({});

  const [txModalEmail, setTxModalEmail] = useState<string | null>(null);
  const [txList, setTxList] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const [confirm, setConfirm] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const listBuyersFn = useServerFn(listBuyers);
  const getStatsFn = useServerFn(getAdminStats);
  const getSummaryFn = useServerFn(getBuyerHotmartSummary);
  const getTxFn = useServerFn(getBuyerTransactions);
  const resendFn = useServerFn(resendWelcomeEmail);
  const updatePlanFn = useServerFn(updateUserPlan);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [{ buyers: rows }, statsData] = await Promise.all([
        listBuyersFn({ data: { search, plan: planFilter } }),
        getStatsFn(),
      ]);
      setBuyers(rows);
      setStats(statsData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }, [listBuyersFn, getStatsFn, search, planFilter]);

  useEffect(() => {
    reload();
  }, [reload]);

  const loadHotmart = async (email: string) => {
    if (hotmartCache[email] && hotmartCache[email] !== "loading") return;
    setHotmartCache((c) => ({ ...c, [email]: "loading" }));
    try {
      const res = await getSummaryFn({ data: { email } });
      if (res.ok) {
        setHotmartCache((c) => ({ ...c, [email]: res.summary }));
      } else {
        setHotmartCache((c) => ({ ...c, [email]: { error: res.error } }));
      }
    } catch (err) {
      setHotmartCache((c) => ({
        ...c,
        [email]: {
          error: err instanceof Error ? err.message : "Error",
        },
      }));
    }
  };

  const openTransactions = async (email: string) => {
    setTxModalEmail(email);
    setTxLoading(true);
    setTxList([]);
    try {
      const res = await getTxFn({ data: { email } });
      if (res.ok) {
        setTxList(res.transactions);
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setTxLoading(false);
    }
  };

  const handleResend = (b: Buyer) => {
    setConfirm({
      title: "Reenviar email de bienvenida",
      description: `Se enviará un nuevo magic link a ${b.email}. ¿Continuar?`,
      onConfirm: async () => {
        try {
          await resendFn({ data: { userId: b.id } });
          toast.success(`Email enviado a ${b.email}`);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Error");
        }
      },
    });
  };

  const handleDeactivate = (b: Buyer) => {
    setConfirm({
      title: "Desactivar plan",
      description: `El usuario ${b.email} perderá acceso a las recetas inmediatamente. ¿Confirmar?`,
      onConfirm: async () => {
        try {
          await updatePlanFn({
            data: { userId: b.id, action: "deactivate" },
          });
          toast.success("Plan desactivado");
          reload();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Error");
        }
      },
    });
  };

  const handleExtend = (b: Buyer, days: number) => {
    setConfirm({
      title: `Extender plan ${days} días`,
      description: `Se sumarán ${days} días a la fecha de vencimiento de ${b.email}. ¿Confirmar?`,
      onConfirm: async () => {
        try {
          await updatePlanFn({
            data: { userId: b.id, action: "extend", extraDays: days },
          });
          toast.success(`Plan extendido ${days} días`);
          reload();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Error");
        }
      },
    });
  };

  const handleActivate = (b: Buyer, plan: "mensual" | "semestral" | "anual") => {
    setConfirm({
      title: `Activar plan ${plan}`,
      description: `Se activará un plan ${plan} para ${b.email} desde hoy. ¿Confirmar?`,
      onConfirm: async () => {
        try {
          await updatePlanFn({
            data: { userId: b.id, action: "activate", planType: plan },
          });
          toast.success("Plan activado");
          reload();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Error");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total"
          value={stats?.total ?? "—"}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-primary" />}
          label="Activos"
          value={stats?.activos ?? "—"}
        />
        <StatCard
          icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
          label="Inactivos"
          value={stats?.inactivos ?? "—"}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4 text-warning" />}
          label="Vencen ≤30d"
          value={stats?.vencenEn30Dias ?? "—"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los planes</SelectItem>
            <SelectItem value="mensual">Mensual</SelectItem>
            <SelectItem value="semestral">Semestral</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={reload} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comprador</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead>Hotmart</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : buyers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Sin compradores que coincidan.
                  </TableCell>
                </TableRow>
              ) : (
                buyers.map((b) => (
                  <BuyerRow
                    key={b.id}
                    buyer={b}
                    hotmart={hotmartCache[b.email]}
                    onLoadHotmart={() => loadHotmart(b.email)}
                    onViewTx={() => openTransactions(b.email)}
                    onResend={() => handleResend(b)}
                    onDeactivate={() => handleDeactivate(b)}
                    onExtend={(d) => handleExtend(b, d)}
                    onActivate={(p) => handleActivate(b, p)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de transações */}
      <Dialog
        open={!!txModalEmail}
        onOpenChange={(o) => !o && setTxModalEmail(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historial de transacciones</DialogTitle>
            <DialogDescription>
              Datos en tiempo real desde la API de Hotmart para{" "}
              <strong>{txModalEmail}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {txLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : txList.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                Sin transacciones encontradas.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txList.map((t) => (
                    <TableRow key={t.transaction}>
                      <TableCell className="text-xs">
                        {formatDate(t.approved_date ?? t.order_date)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {t.product?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {formatMoney(t.price?.value, t.price?.currency_code)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {t.payment?.method ?? "—"}
                        {t.payment?.installments_number &&
                        t.payment.installments_number > 1
                          ? ` (${t.payment.installments_number}x)`
                          : ""}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.status} />
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {t.transaction}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTxModalEmail(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação genérica */}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const fn = confirm?.onConfirm;
                setConfirm(null);
                await fn?.();
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="font-display text-2xl font-bold text-secondary mt-1">
        {value}
      </p>
    </div>
  );
}

function BuyerRow({
  buyer,
  hotmart,
  onLoadHotmart,
  onViewTx,
  onResend,
  onDeactivate,
  onExtend,
  onActivate,
}: {
  buyer: Buyer;
  hotmart: HotmartSummary | { error: string } | "loading" | undefined;
  onLoadHotmart: () => void;
  onViewTx: () => void;
  onResend: () => void;
  onDeactivate: () => void;
  onExtend: (days: number) => void;
  onActivate: (plan: "mensual" | "semestral" | "anual") => void;
}) {
  const isActive =
    buyer.plan_type !== "inactivo" &&
    !!buyer.plan_end_date &&
    new Date(buyer.plan_end_date) > new Date();

  return (
    <TableRow>
      <TableCell>
        <div className="space-y-0.5">
          <div className="font-medium text-sm">
            {buyer.nombre ?? "(sin nombre)"}
          </div>
          <div className="text-xs text-muted-foreground">{buyer.email}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={isActive ? "default" : "secondary"}
          className="capitalize"
        >
          {buyer.plan_type}
        </Badge>
        {!buyer.onboarding_completado && (
          <div className="text-[10px] text-warning mt-1">
            Onboarding pendiente
          </div>
        )}
      </TableCell>
      <TableCell className="text-xs">
        {buyer.plan_end_date ? (
          <>
            {formatDateShort(buyer.plan_end_date)}
            <div className="text-[10px] text-muted-foreground">
              {daysLeftLabel(buyer.plan_end_date)}
            </div>
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {hotmart === undefined ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={onLoadHotmart}
          >
            Ver
          </Button>
        ) : hotmart === "loading" ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : "error" in hotmart ? (
          <span className="text-[10px] text-destructive">Error API</span>
        ) : (
          <button
            onClick={onViewTx}
            className="text-left group"
            title="Ver historial completo"
          >
            <div className="font-medium text-xs group-hover:underline">
              {formatMoney(hotmart.totalApproved, hotmart.currency)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {hotmart.transactionCount} tx
              {hotmart.totalRefunded > 0 &&
                ` · ${formatMoney(hotmart.totalRefunded, hotmart.currency)} reemb.`}
            </div>
          </button>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1 flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={onViewTx}
            title="Ver transacciones"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={onResend}
            title="Reenviar magic link"
          >
            <Mail className="h-3.5 w-3.5" />
          </Button>
          {isActive ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                onClick={() => onExtend(30)}
                title="Extender 30 días"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-destructive hover:text-destructive"
                onClick={onDeactivate}
                title="Desactivar"
              >
                <PowerOff className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Select onValueChange={(v) => onActivate(v as "mensual")}>
              <SelectTrigger className="h-8 w-auto px-2 gap-1">
                <Power className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">Activar</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensual">Mensual (30 días)</SelectItem>
                <SelectItem value="semestral">Semestral (180 días)</SelectItem>
                <SelectItem value="anual">Anual (365 días)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "").toUpperCase();
  if (s === "APPROVED" || s === "COMPLETE") {
    return <Badge className="bg-primary/15 text-primary hover:bg-primary/15">{s}</Badge>;
  }
  if (s === "REFUNDED" || s === "CHARGEBACK") {
    return <Badge variant="destructive">{s}</Badge>;
  }
  return <Badge variant="secondary">{s || "—"}</Badge>;
}

function formatDate(epoch?: number): string {
  if (!epoch) return "—";
  return new Date(epoch).toLocaleString("es-419", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("es-419", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysLeftLabel(iso: string): string {
  const days = Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return `vencido hace ${Math.abs(days)}d`;
  if (days === 0) return "vence hoy";
  return `en ${days}d`;
}

function formatMoney(value?: number, currency?: string | null): string {
  if (value === undefined) return "—";
  const code = currency ?? "BRL";
  try {
    return new Intl.NumberFormat("es-419", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
}

// Calendar import to avoid TS unused warning if formatter changes
void Calendar;
