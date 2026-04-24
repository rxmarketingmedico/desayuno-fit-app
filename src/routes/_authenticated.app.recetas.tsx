import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RecetaCard, RecetaCardSkeleton, type RecetaCardData } from "@/components/recetas/RecetaCard";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

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

const PAGE_SIZE = 12;

interface RecetasFilters {
  categoria: string;
  badges: string[];
  query: string;
}

interface RecetasPage {
  items: RecetaCardData[];
  nextOffset?: number;
}

const DEFAULT_FILTERS: RecetasFilters = {
  categoria: "todos",
  badges: [],
  query: "",
};

const recetaSelect = "id, slug, titulo, imagen_url, tiempo_minutos, calorias, badges, categoria";

export const recetasInfiniteQueryOptions = (filters: RecetasFilters = DEFAULT_FILTERS) =>
  infiniteQueryOptions({
    queryKey: ["recetas", "list", filters.categoria, filters.badges.join("|"), filters.query],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<RecetasPage> => {
      const from = Number(pageParam) || 0;
      const to = from + PAGE_SIZE;

      let request = supabase
        .from("recetas")
        .select(recetaSelect)
        .order("titulo", { ascending: true })
        .range(from, to);

      if (filters.categoria !== "todos") {
        request = request.eq("categoria", filters.categoria);
      }

      if (filters.badges.length > 0) {
        request = request.contains("badges", filters.badges);
      }

      if (filters.query) {
        request = request.ilike("titulo", `%${filters.query}%`);
      }

      const { data, error } = await request;
      if (error) throw error;

      const rows = (data ?? []) as RecetaCardData[];
      const hasMore = rows.length > PAGE_SIZE;

      return {
        items: rows.slice(0, PAGE_SIZE),
        nextOffset: hasMore ? from + PAGE_SIZE : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

export const Route = createFileRoute("/_authenticated/app/recetas")({
  loader: ({ context }) => {
    context.queryClient.prefetchInfiniteQuery(recetasInfiniteQueryOptions());
  },
  component: RecetasPage,
});

function RecetasPage() {
  const location = useLocation();
  const isListRoute = location.pathname === "/app/recetas";

  const [categoria, setCategoria] = useState<string>("todos");
  const [activeBadges, setActiveBadges] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const { favoriteIds, toggle } = useFavoritos();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const badgeFilters = useMemo(() => Array.from(activeBadges).sort(), [activeBadges]);
  const filters = useMemo<RecetasFilters>(
    () => ({
      categoria,
      badges: badgeFilters,
      query: debouncedQuery.trim(),
    }),
    [categoria, badgeFilters, debouncedQuery],
  );

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...recetasInfiniteQueryOptions(filters),
    enabled: isListRoute,
  });

  useEffect(() => {
    if (isError) toast.error("No pudimos cargar las recetas");
  }, [isError]);

  const recetas = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, loadMore]);

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
            {isLoading
              ? "Cargando…"
              : hasNextPage
                ? `${recetas.length}+ recetas listas para ti`
                : `${recetas.length} recetas listas para ti`}
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

      <FilterRow label="Etiquetas">
        {BADGES_DESTAQUE.map((b) => (
          <Chip key={b} active={activeBadges.has(b)} onClick={() => toggleBadge(b)} variant="badge">
            {b}
          </Chip>
        ))}
      </FilterRow>

      {isLoading ? (
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecetaCardSkeleton key={i} />
          ))}
        </div>
      ) : recetas.length === 0 ? (
        <EmptyState onClear={clearFilters} hasFilters={hasFilters} />
      ) : (
        <>
          <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {recetas.map((r, i) => (
              <RecetaCard
                key={r.id}
                receta={r}
                isFavorite={favoriteIds.has(r.id)}
                onToggleFavorite={toggle}
                priority={i < 4}
              />
            ))}
          </div>

          {hasNextPage && (
            <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-6">
              {isFetchingNextPage && (
                <div
                  className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
                  aria-hidden="true"
                />
              )}
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Mostrando {recetas.length} recetas
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={isFetchingNextPage}
                className="min-w-40"
              >
                {isFetchingNextPage ? "Cargando..." : "Cargar más recetas"}
              </Button>
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
        <div className="flex gap-2 px-4 min-w-max pb-1">{children}</div>
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
