import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RecetaCard, RecetaCardSkeleton, type RecetaCardData } from "@/components/recetas/RecetaCard";
import { useFavoritos } from "@/hooks/useFavoritos";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/recetas")({
  component: RecetasPage,
});

const CATEGORIAS = [
  { value: "todos", label: "Todo" },
  { value: "salado", label: "Salado" },
  { value: "dulce", label: "Dulce" },
  { value: "bebida", label: "Bebida" },
  { value: "snack", label: "Snack" },
] as const;

const BADGES_DESTAQUE = [
  "alto en proteina",
  "vegano",
  "vegetariano",
  "sin gluten",
  "sin azucar",
  "keto",
  "rapido",
  "meal prep",
];

function RecetasPage() {
  const [recetas, setRecetas] = useState<RecetaCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState<string>("todos");
  const [activeBadges, setActiveBadges] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const { favoriteIds, toggle } = useFavoritos();

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("recetas")
      .select("id, slug, titulo, imagen_url, tiempo_minutos, calorias, badges, categoria")
      .order("titulo", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          toast.error("No pudimos cargar las recetas");
        } else {
          setRecetas((data ?? []) as RecetaCardData[]);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recetas.filter((r) => {
      if (categoria !== "todos" && r.categoria !== categoria) return false;
      if (activeBadges.size > 0) {
        const hasAll = Array.from(activeBadges).every((b) => r.badges.includes(b));
        if (!hasAll) return false;
      }
      if (q && !r.titulo.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [recetas, categoria, activeBadges, query]);

  const toggleBadge = (b: string) => {
    setActiveBadges((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  };

  const clearFilters = () => {
    setCategoria("todos");
    setActiveBadges(new Set());
    setQuery("");
  };

  const hasFilters = categoria !== "todos" || activeBadges.size > 0 || query.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-secondary">
          Recetas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Cargando…" : `${filtered.length} recetas listas para ti`}
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca por nombre…"
          className="pl-9"
        />
      </div>

      {/* Categorías */}
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 min-w-max">
          {CATEGORIAS.map((c) => (
            <Chip
              key={c.value}
              active={categoria === c.value}
              onClick={() => setCategoria(c.value)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 min-w-max">
          {BADGES_DESTAQUE.map((b) => (
            <Chip key={b} active={activeBadges.has(b)} onClick={() => toggleBadge(b)} variant="badge">
              {b}
            </Chip>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <X className="h-3 w-3" /> Limpiar filtros
        </button>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecetaCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onClear={clearFilters} hasFilters={hasFilters} />
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((r) => (
            <RecetaCard
              key={r.id}
              receta={r}
              isFavorite={favoriteIds.has(r.id)}
              onToggleFavorite={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  variant = "category",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "category" | "badge";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium border transition-colors capitalize",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : variant === "category"
            ? "bg-card text-foreground border-border hover:bg-muted"
            : "bg-accent/20 text-secondary border-transparent hover:bg-accent/40",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
  return (
    <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border">
      <p className="font-display text-lg text-secondary">No encontramos recetas</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {hasFilters
          ? "Prueba quitar algún filtro o cambiar la búsqueda."
          : "Pronto tendremos más recetas disponibles."}
      </p>
      {hasFilters && (
        <Button onClick={onClear} variant="outline" size="sm" className="mt-4">
          Limpiar filtros
        </Button>
      )}
      <Link to="/app/favoritos" className="block mt-4 text-xs text-primary hover:underline">
        Ver mis favoritos →
      </Link>
    </div>
  );
}
