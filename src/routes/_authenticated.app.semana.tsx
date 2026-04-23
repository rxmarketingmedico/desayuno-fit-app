import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Sparkles, ShoppingBasket, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/app/semana")({
  component: SemanaPage,
});

interface Ingrediente {
  nombre: string;
  cantidad: string;
}

interface RecetaLite {
  id: string;
  slug: string;
  titulo: string;
  imagen_url: string;
  tiempo_minutos: number;
  calorias: number;
  categoria: string;
  categoria_ingrediente_principal: string | null;
  badges: string[];
  ingredientes: Ingrediente[];
}

interface DiaPlan {
  dia: string;
  receta_id: string;
  slug: string;
  titulo: string;
  imagen_url: string;
  tiempo_minutos: number;
  calorias: number;
  categoria: string;
}

interface ListaItem {
  item: string;
  cantidad: string;
  receta?: string;
  checked: boolean;
}

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

/**
 * Algoritmo de planificación:
 * 1. Filtra por preferencias del onboarding (sin_gluten, vegetariano, etc.)
 * 2. Varía categorías (no repite la misma 2 días seguidos)
 * 3. No repite categoria_ingrediente_principal en días consecutivos
 * 4. Si no hay suficientes opciones, relaja restricciones progresivamente
 */
function generarPlan(recetas: RecetaLite[], prefs: Record<string, boolean>): DiaPlan[] {
  const prefKeys = Object.entries(prefs)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const elegibles = prefKeys.length
    ? recetas.filter((r) => prefKeys.every((p) => r.badges.includes(p)))
    : [...recetas];

  const pool = elegibles.length >= 5 ? elegibles : [...recetas];
  const usados = new Set<string>();
  const plan: DiaPlan[] = [];
  let prevCat: string | null = null;
  let prevIng: string | null = null;

  for (let i = 0; i < 7; i++) {
    const candidatos = pool.filter(
      (r) =>
        !usados.has(r.id) &&
        r.categoria !== prevCat &&
        (r.categoria_ingrediente_principal ?? "") !== (prevIng ?? "_"),
    );
    let pick: RecetaLite | undefined =
      candidatos[Math.floor(Math.random() * candidatos.length)];
    if (!pick) {
      // Relaja: permite repetir categoria_ingrediente_principal
      const c2 = pool.filter((r) => !usados.has(r.id) && r.categoria !== prevCat);
      pick = c2[Math.floor(Math.random() * c2.length)];
    }
    if (!pick) {
      // Última: cualquiera no usada
      const c3 = pool.filter((r) => !usados.has(r.id));
      pick = c3[Math.floor(Math.random() * c3.length)];
    }
    if (!pick) {
      // Vacía usados y reinicia (pool muy pequeña)
      usados.clear();
      pick = pool[Math.floor(Math.random() * pool.length)];
    }
    usados.add(pick.id);
    prevCat = pick.categoria;
    prevIng = pick.categoria_ingrediente_principal;
    plan.push({
      dia: DIAS[i],
      receta_id: pick.id,
      slug: pick.slug,
      titulo: pick.titulo,
      imagen_url: pick.imagen_url,
      tiempo_minutos: pick.tiempo_minutos,
      calorias: pick.calorias,
      categoria: pick.categoria,
    });
  }
  return plan;
}

function consolidarLista(
  plan: DiaPlan[],
  recetasPorId: Record<string, RecetaLite>,
): ListaItem[] {
  const map = new Map<string, ListaItem>();
  for (const d of plan) {
    const r = recetasPorId[d.receta_id];
    if (!r) continue;
    for (const ing of r.ingredientes) {
      const key = ing.nombre.toLowerCase().trim();
      const existing = map.get(key);
      if (existing) {
        // intenta sumar si las cantidades coinciden numéricamente
        existing.cantidad = mergeCantidades(existing.cantidad, ing.cantidad);
        existing.receta = `varias recetas`;
      } else {
        map.set(key, {
          item: ing.nombre,
          cantidad: ing.cantidad,
          receta: r.titulo,
          checked: false,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.item.localeCompare(b.item));
}

function mergeCantidades(a: string, b: string): string {
  // Suma simple si ambas comienzan con número y misma unidad
  const re = /^(\d+(?:\.\d+)?)\s*(.*)$/;
  const ma = a.trim().match(re);
  const mb = b.trim().match(re);
  if (ma && mb && ma[2].trim() === mb[2].trim()) {
    const sum = parseFloat(ma[1]) + parseFloat(mb[1]);
    return `${sum % 1 === 0 ? sum : sum.toFixed(1)} ${ma[2]}`.trim();
  }
  return `${a} + ${b}`;
}

function SemanaPage() {
  const { user } = useAuth();
  const semana = useMemo(() => startOfWeekISO(), []);
  const [recetas, setRecetas] = useState<RecetaLite[]>([]);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [plan, setPlan] = useState<DiaPlan[] | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingLista, setSavingLista] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const [{ data: recs }, { data: prof }, { data: planExistente }] = await Promise.all([
        supabase
          .from("recetas")
          .select(
            "id, slug, titulo, imagen_url, tiempo_minutos, calorias, categoria, categoria_ingrediente_principal, badges, ingredientes",
          ),
        supabase.from("profiles").select("preferencias").eq("id", user.id).maybeSingle(),
        supabase
          .from("semana_planificada")
          .select("id, dias")
          .eq("user_id", user.id)
          .eq("semana", semana)
          .maybeSingle(),
      ]);
      if (!active) return;
      setRecetas(
        ((recs ?? []) as unknown as RecetaLite[]).map((r) => ({
          ...r,
          ingredientes: (r.ingredientes ?? []) as unknown as Ingrediente[],
        })),
      );
      setPrefs((prof?.preferencias as Record<string, boolean>) ?? {});
      if (planExistente) {
        setPlanId(planExistente.id);
        setPlan(planExistente.dias as unknown as DiaPlan[]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, semana]);

  const recetasPorId = useMemo(() => {
    const m: Record<string, RecetaLite> = {};
    for (const r of recetas) m[r.id] = r;
    return m;
  }, [recetas]);

  const generar = async () => {
    if (!user || recetas.length === 0) return;
    setGenerating(true);
    try {
      const nuevo = generarPlan(recetas, prefs);
      const payload = {
        user_id: user.id,
        semana,
        dias: nuevo as unknown as Json,
      };
      if (planId) {
        const { error } = await supabase
          .from("semana_planificada")
          .update({ dias: payload.dias })
          .eq("id", planId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("semana_planificada")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        setPlanId(data.id);
      }
      setPlan(nuevo);
      toast.success("¡Tu semana está lista! 🌿");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error generando plan");
    } finally {
      setGenerating(false);
    }
  };

  const generarLista = async () => {
    if (!user || !plan) return;
    setSavingLista(true);
    try {
      const items = consolidarLista(plan, recetasPorId);
      const { data: existente } = await supabase
        .from("lista_compras")
        .select("id, items")
        .eq("user_id", user.id)
        .eq("semana", semana)
        .maybeSingle();

      if (existente) {
        // Conserva los checked de items que ya están en la lista
        const prev = (existente.items as unknown as ListaItem[]) ?? [];
        const checkedMap = new Map(
          prev.filter((p) => p.checked).map((p) => [p.item.toLowerCase(), true]),
        );
        const merged = items.map((i) => ({
          ...i,
          checked: checkedMap.get(i.item.toLowerCase()) ?? false,
        }));
        await supabase
          .from("lista_compras")
          .update({ items: merged as unknown as Json })
          .eq("id", existente.id);
      } else {
        await supabase.from("lista_compras").insert({
          user_id: user.id,
          semana,
          items: items as unknown as Json,
        });
      }
      toast.success(`Lista lista con ${items.length} ingredientes 🛒`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSavingLista(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 max-w-3xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-secondary">
            Mi semana
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan de desayunos personalizado, lunes a domingo.
          </p>
        </div>
        <Button onClick={generar} disabled={generating} className="gap-2">
          {plan ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {generating ? "Generando..." : plan ? "Regenerar" : "Generar mi semana"}
        </Button>
      </div>

      {!plan ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card">
          <CalendarDays className="h-12 w-12 text-primary mx-auto" />
          <p className="mt-4 font-display text-lg text-secondary">Aún no hay plan</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Toca <em>Generar mi semana</em> para que armemos 7 desayunos respetando tus
            preferencias y variando categorías.
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {plan.map((d) => (
              <li key={d.dia}>
                <Link
                  to="/app/recetas/$slug"
                  params={{ slug: d.slug }}
                  className="flex gap-4 rounded-2xl bg-card border border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-muted">
                    <img
                      src={d.imagen_url}
                      alt={d.titulo}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 py-3 pr-3 min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-primary font-semibold">
                      {d.dia}
                    </p>
                    <h3 className="font-display text-base sm:text-lg font-semibold text-secondary leading-tight line-clamp-2 mt-0.5">
                      {d.titulo}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{d.categoria}</span>
                      <span>·</span>
                      <span>{d.tiempo_minutos} min</span>
                      <span>·</span>
                      <span>{d.calorias} kcal</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl bg-accent/30 border border-accent/40 p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <p className="font-display text-base font-semibold text-secondary">
                ¿Lista para hacer mercado?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Consolidamos los ingredientes de tu semana en una sola lista.
              </p>
            </div>
            <Button onClick={generarLista} disabled={savingLista} className="gap-2 shrink-0">
              <ShoppingBasket className="h-4 w-4" />
              {savingLista ? "Guardando..." : "Generar lista de compras"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
