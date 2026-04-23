import { Link } from "@tanstack/react-router";
import { Heart, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildSrcSet } from "@/lib/image";

export interface RecetaCardData {
  id: string;
  slug: string;
  titulo: string;
  imagen_url: string;
  tiempo_minutos: number;
  calorias: number;
  badges: string[];
  categoria: string;
}

interface Props {
  receta: RecetaCardData;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  /** Eager-load para as primeiras imagens visíveis (LCP). */
  priority?: boolean;
}

export function RecetaCard({ receta, isFavorite, onToggleFavorite, priority = false }: Props) {
  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(receta.id);
  };

  // Card ocupa ~180px em mobile (2 colunas) e ~280px em desktop.
  const { src, srcSet } = buildSrcSet(receta.imagen_url, 320, { quality: 65 });

  return (
    <Link
      to="/app/recetas/$slug"
      params={{ slug: receta.slug }}
      className="group block rounded-2xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img
          src={src}
          srcSet={srcSet}
          sizes="(min-width: 1024px) 240px, (min-width: 768px) 280px, 45vw"
          alt={receta.titulo}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          width={320}
          height={240}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          type="button"
          onClick={handleFav}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          className="absolute top-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isFavorite ? "text-primary fill-primary" : "text-muted-foreground",
            )}
          />
        </button>
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-secondary capitalize">
          {receta.categoria}
        </span>
      </div>
      <div className="p-3 md:p-4">
        <h3 className="font-display text-sm md:text-base font-semibold text-secondary leading-snug line-clamp-2 min-h-[2.6em]">
          {receta.titulo}
        </h3>
        <div className="mt-2 md:mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {receta.tiempo_minutos} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" />
            {receta.calorias} kcal
          </span>
        </div>
        {receta.badges.length > 0 && (
          <div className="mt-2 md:mt-3 flex flex-wrap gap-1.5">
            {receta.badges.slice(0, 2).map((b) => (
              <span
                key={b}
                className="inline-flex items-center rounded-full bg-accent/30 text-secondary px-2 py-0.5 text-[10px] font-medium capitalize"
              >
                {b}
              </span>
            ))}
            {receta.badges.length > 2 && (
              <span className="text-[10px] text-muted-foreground self-center">
                +{receta.badges.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export function RecetaCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Imagem com shimmer real (gradiente animado) — mesma proporção do card */}
      <div className="aspect-[4/3] shimmer" />
      <div className="p-3 md:p-4 space-y-2.5">
        {/* Título: 2 linhas para casar com o min-height do card real */}
        <div className="h-3.5 rounded shimmer" />
        <div className="h-3.5 w-3/4 rounded shimmer" />
        {/* Linha de meta (tempo + kcal) */}
        <div className="flex gap-3 pt-1">
          <div className="h-3 w-14 rounded shimmer" />
          <div className="h-3 w-16 rounded shimmer" />
        </div>
        {/* Badges */}
        <div className="flex gap-1.5 pt-1">
          <div className="h-4 w-16 rounded-full shimmer" />
          <div className="h-4 w-12 rounded-full shimmer" />
        </div>
      </div>
    </div>
  );
}
