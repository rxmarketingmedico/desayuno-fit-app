import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
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

const PAGE_SIZE = 24;

function RecetasPage() {
  const location = useLocation();
  const [recetas, setRecetas] = useState<RecetaCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState<string>("todos");
  const [activeBadges, setActiveBadges] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { favoriteIds, toggle } = useFavoritos();
  const isListRoute = location.pathname === "/app/recetas";
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isListRoute) return;

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
  }, [isListRoute]);

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

  // Reset paginação ao mudar filtros
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [categoria, activeBadges, query]);

  // Infinite scroll com IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

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
  const activeFilterCount =
    (categoria !== "todos" ? 1 : 0) + activeBadges.size + (query.length > 0 ? 1 : 0);

  if (!isListRoute) {
    return <Outlet />;
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-secondary">
            Recetas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Cargando…" : `${filtered.length} recetas listas para ti`}
          </p>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium active:scale-95 transition-transform"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca por nombre…"
          className="pl-9 pr-9 h-11 rounded-xl"
          enterKeyHint="search"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Categorías */}
      <FilterRow label="Categorías" icon={<SlidersHorizontal className="h-3.5 w-3.5" />}>
        {CATEGORIAS.map((c) => (
          <Chip
            key={c.value}
            active={categoria === c.value}
            onClick={() => setCategoria(c.value)}
          >
            {c.label}
          </Chip>
        ))}
      </FilterRow>

      {/* Badges */}
      <FilterRow label="Etiquetas">
        {BADGES_DESTAQUE.map((b) => (
          <Chip key={b} active={activeBadges.has(b)} onClick={() => toggleBadge(b)} variant="badge">
            {b}
          </Chip>
        ))}
      </FilterRow>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecetaCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onClear={clearFilters} hasFilters={hasFilters} />
      ) : (
        <>
          <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((r, i) => (
              <RecetaCard
                key={r.id}
                receta={r}
                isFavorite={favoriteIds.has(r.id)}
                onToggleFavorite={toggle}
                priority={i < 4}
              />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-6">
              <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-4">
      <div className="px-4 mb-2 hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        {icon}
        {label}
      </div>
      <div className="overflow-x-auto scrollbar-none snap-x-mandatory fade-edges-x">
        <div className="flex gap-2 px-4 min-w-max pb-1">
          {children}
        </div>
      </div>
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
        "snap-start-always whitespace-nowrap rounded-full px-4 h-9 inline-flex items-center text-sm font-medium border transition-colors capitalize active:scale-95",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
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
