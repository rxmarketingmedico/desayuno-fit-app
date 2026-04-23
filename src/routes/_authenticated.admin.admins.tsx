import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, UserPlus, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import {
  listAdmins,
  promoteAdmin,
  demoteAdmin,
} from "@/lib/admin/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/admins")({
  component: AdminsPage,
});

interface AdminItem {
  userId: string;
  email: string;
  nombre: string | null;
  createdAt: string;
  isSelf: boolean;
}

function AdminsPage() {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [toRemove, setToRemove] = useState<AdminItem | null>(null);

  const listFn = useServerFn(listAdmins);
  const promoteFn = useServerFn(promoteAdmin);
  const demoteFn = useServerFn(demoteAdmin);

  const reload = async () => {
    setLoading(true);
    try {
      const { admins } = await listFn();
      setAdmins(admins);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setPromoting(true);
    try {
      const res = await promoteFn({ data: { email: newEmail.trim() } });
      if (res.alreadyAdmin) {
        toast.info("Este usuario ya es admin");
      } else {
        toast.success("Admin agregado");
      }
      setNewEmail("");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setPromoting(false);
    }
  };

  const handleDemote = async () => {
    if (!toRemove) return;
    const target = toRemove;
    setToRemove(null);
    try {
      await demoteFn({ data: { userId: target.userId } });
      toast.success(`${target.email} ya no es admin`);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-secondary">
            Agregar nuevo admin
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          La persona ya debe estar registrada en el app (vía login o compra
          Hotmart). Indica su email exacto.
        </p>
        <form onSubmit={handlePromote} className="flex gap-2">
          <Input
            type="email"
            placeholder="email@ejemplo.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={promoting}>
            {promoting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Promover"
            )}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-secondary">
            Admins actuales ({admins.length})
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (
              admins.map((a) => (
                <TableRow key={a.userId}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {a.nombre ?? "(sin nombre)"}
                        {a.isSelf && (
                          <Badge variant="secondary" className="text-[10px]">
                            tú
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString("es-419", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-destructive hover:text-destructive"
                      disabled={a.isSelf}
                      title={
                        a.isSelf
                          ? "No puedes quitarte a ti mismo"
                          : "Quitar admin"
                      }
                      onClick={() => setToRemove(a)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!toRemove}
        onOpenChange={(o) => !o && setToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitar permisos de admin</AlertDialogTitle>
            <AlertDialogDescription>
              {toRemove?.email} ya no podrá acceder al panel de admin. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDemote}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
