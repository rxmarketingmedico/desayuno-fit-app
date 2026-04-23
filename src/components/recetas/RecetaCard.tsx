import { Link } from "@tanstack/react-router";
import { Heart, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function RecetaCard({ receta, isFavorite, onToggleFavorite }: Props) {
  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(receta.id);
  };

  return (
    <Link
      to="/app/recetas/$slug"
      params={{ slug: receta.slug }}
      className="group block rounded-2xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img
          src={receta.imagen_url}
          alt={receta.titulo}
          loading="lazy"
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
      <div className="p-4">
        <h3 className="font-display text-base font-semibold text-secondary leading-snug line-clamp-2 min-h-[2.6em]">
          {receta.titulo}
        </h3>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
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
          <div className="mt-3 flex flex-wrap gap-1.5">
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
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
