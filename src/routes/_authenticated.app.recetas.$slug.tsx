import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock, Flame, Users, Heart, CheckCircle2, ShoppingBasket, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavoritos } from "@/hooks/useFavoritos";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import { transformImage } from "@/lib/image";

export const Route = createFileRoute("/_authenticated/app/recetas/$slug")({
  component: RecetaDetallePage,
});

interface Ingrediente {
  // O banco usa `nombre`, mas mantemos `item` como fallback para
  // compatibilidade com possíveis registros antigos.
  nombre: string;
  cantidad: string;
}

// Lê o nome de um ingrediente aceitando as duas chaves possíveis
// que apareceram no banco em momentos diferentes.
function getIngredienteNombre(ing: unknown): string {
  if (!ing || typeof ing !== "object") return "";
  const o = ing as Record<string, unknown>;
  return (
    (typeof o.nombre === "string" && o.nombre) ||
    (typeof o.item === "string" && o.item) ||
    (typeof o.name === "string" && o.name) ||
    ""
  );
}

function getIngredienteCantidad(ing: unknown): string {
  if (!ing || typeof ing !== "object") return "";
  const o = ing as Record<string, unknown>;
  return (typeof o.cantidad === "string" && o.cantidad) || "";
}

interface RecetaDetalle {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  tiempo_minutos: number;
  calorias: number;
  porciones: number;
  dificultad: string;
  categoria: string;
  badges: string[];
  ingredientes: Json;
  pasos: Json;
  tip_nutricionista: string | null;
  info_nutricional: Json;
}

function RecetaDetallePage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favoriteIds, toggle } = useFavoritos();
  const [receta, setReceta] = useState<RecetaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [savingHecha, setSavingHecha] = useState(false);
  const [addingToList, setAddingToList] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("recetas")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Error cargando receta:", error);
          toast.error("No pudimos cargar la receta");
          setLoading(false);
          return;
        }
        if (!data) {
          toast.error("Receta no encontrada");
          navigate({ to: "/app/recetas" });
          return;
        }
        setReceta(data as RecetaDetalle);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, navigate]);

  const ingredientes = useMemo<Ingrediente[]>(() => {
    if (!receta) return [];
    return Array.isArray(receta.ingredientes)
      ? (receta.ingredientes as unknown as Ingrediente[])
      : [];
  }, [receta]);

  const pasos = useMemo<string[]>(() => {
    if (!receta) return [];
    return Array.isArray(receta.pasos) ? (receta.pasos as unknown as string[]) : [];
  }, [receta]);

  const info = useMemo<Record<string, string>>(() => {
    if (!receta || typeof receta.info_nutricional !== "object" || !receta.info_nutricional) return {};
    return receta.info_nutricional as Record<string, string>;
  }, [receta]);

  const toggleIngrediente = (i: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleYaLaHice = async () => {
    if (!user || !receta) return;
    setSavingHecha(true);
    const { error } = await supabase.from("recetas_hechas").insert({
      user_id: user.id,
      receta_id: receta.id,
    });
    setSavingHecha(false);
    if (error) {
      toast.error("No se pudo guardar");
    } else {
      toast.success("¡Genial! Sumamos esta receta a tu historial 🌸");
    }
  };

  const handleAgregarLista = async () => {
    if (!user || !receta) return;
    setAddingToList(true);
    const semana = startOfWeekISO();
    const { data: existing } = await supabase
      .from("lista_compras")
      .select("id, items")
      .eq("user_id", user.id)
      .eq("semana", semana)
      .maybeSingle();

    const nuevosItems = ingredientes.map((ing) => ({
      item: getIngredienteNombre(ing),
      cantidad: getIngredienteCantidad(ing),
      receta: receta.titulo,
      checked: false,
    }));

    if (existing) {
      const merged = [...((existing.items as unknown as object[]) ?? []), ...nuevosItems];
      const { error } = await supabase
        .from("lista_compras")
        .update({ items: merged as unknown as Json })
        .eq("id", existing.id);
      setAddingToList(false);
      if (error) toast.error("No se pudo agregar a la lista");
      else toast.success("Ingredientes agregados a tu lista de compras 🛒");
    } else {
      const { error } = await supabase.from("lista_compras").insert({
        user_id: user.id,
        semana,
        items: nuevosItems as unknown as Json,
      });
      setAddingToList(false);
      if (error) toast.error("No se pudo agregar a la lista");
      else toast.success("Lista de compras creada con esta receta 🛒");
    }
  };

  if (loading || !receta) {
    return (
      <div className="space-y-4">
        <div className="aspect-[16/9] rounded-2xl bg-muted animate-pulse" />
        <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const isFav = favoriteIds.has(receta.id);

  return (
    <article className="space-y-6 max-w-3xl mx-auto">
      <Link
        to="/app/recetas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a recetas
      </Link>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-muted">
        <img
          src={transformImage(receta.imagen_url, { width: 1280, quality: 75 })}
          srcSet={`${transformImage(receta.imagen_url, { width: 640, quality: 70 })} 640w, ${transformImage(receta.imagen_url, { width: 960, quality: 72 })} 960w, ${transformImage(receta.imagen_url, { width: 1280, quality: 75 })} 1280w`}
          sizes="(min-width: 1024px) 900px, 100vw"
          alt={receta.titulo}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <button
          type="button"
          onClick={() => toggle(receta.id)}
          aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
          className="absolute top-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/90 backdrop-blur shadow"
        >
          <Heart className={cn("h-5 w-5", isFav ? "text-primary fill-primary" : "text-muted-foreground")} />
        </button>
      </div>

      {/* Header */}
      <header className="space-y-3">
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary">
          {receta.categoria}
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-secondary leading-tight">
          {receta.titulo}
        </h1>
        <p className="text-muted-foreground">{receta.descripcion}</p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {receta.tiempo_minutos} min</span>
          <span className="inline-flex items-center gap-1.5"><Flame className="h-4 w-4" /> {receta.calorias} kcal</span>
          <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {receta.porciones} {receta.porciones === 1 ? "porción" : "porciones"}</span>
          <span className="capitalize">Dificultad: {receta.dificultad}</span>
        </div>
        {receta.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {receta.badges.map((b) => (
              <span key={b} className="inline-flex items-center rounded-full bg-accent/30 text-secondary px-2.5 py-1 text-xs font-medium capitalize">
                {b}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Acciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button onClick={handleYaLaHice} disabled={savingHecha} variant="default" size="lg">
          <CheckCircle2 className="h-5 w-5" />
          {savingHecha ? "Guardando…" : "Ya la hice"}
        </Button>
        <Button onClick={handleAgregarLista} disabled={addingToList || ingredientes.length === 0} variant="outline" size="lg">
          <ShoppingBasket className="h-5 w-5" />
          {addingToList ? "Agregando…" : "Agregar a lista de compras"}
        </Button>
      </div>

      {/* Ingredientes */}
      <section className="rounded-2xl bg-card border border-border p-6">
        <h2 className="font-display text-xl font-semibold text-secondary">Ingredientes</h2>
        <p className="text-xs text-muted-foreground mt-1">Marca lo que ya tienes en casa</p>
        <ul className="mt-4 space-y-3">
          {ingredientes.map((ing, i) => {
            const checked = checkedIngredients.has(i);
            const nombre = getIngredienteNombre(ing);
            const cantidad = getIngredienteCantidad(ing);
            return (
              <li key={i} className="flex items-start gap-3">
                <Checkbox
                  id={`ing-${i}`}
                  checked={checked}
                  onCheckedChange={() => toggleIngrediente(i)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`ing-${i}`}
                  className={cn(
                    "flex-1 text-sm cursor-pointer",
                    checked && "line-through text-muted-foreground",
                  )}
                >
                  {cantidad && <span className="font-medium">{cantidad}</span>}
                  {cantidad && nombre ? " " : ""}
                  {nombre}
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Pasos */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-secondary">Paso a paso</h2>
        <ol className="space-y-4">
          {pasos.map((paso, i) => (
            <li key={i} className="flex gap-4 rounded-2xl bg-card border border-border p-5">
              <span className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg font-bold">
                {i + 1}
              </span>
              <p className="text-base leading-relaxed text-foreground pt-1">{paso}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Tip nutricionista */}
      {receta.tip_nutricionista && (
        <section className="rounded-2xl bg-accent/30 border border-accent p-6">
          <div className="flex items-center gap-2 text-secondary">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Tip de la nutricionista</h3>
          </div>
          <p className="mt-3 text-sm text-secondary/90 leading-relaxed">
            {receta.tip_nutricionista}
          </p>
        </section>
      )}

      {/* Info nutricional */}
      {Object.keys(info).length > 0 && (
        <section className="rounded-2xl bg-card border border-border p-6">
          <h3 className="font-display text-lg font-semibold text-secondary">
            Información nutricional
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Por porción</p>
          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(info).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-muted/50 p-3 text-center">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground capitalize">{k}</dt>
                <dd className="mt-1 font-display text-lg font-bold text-secondary">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </article>
  );
}

function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay(); // 0..6 (sun..sat)
  const diff = (day + 6) % 7; // monday-based
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}
