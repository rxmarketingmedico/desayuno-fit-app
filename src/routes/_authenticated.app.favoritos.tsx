import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavoritos } from "@/hooks/useFavoritos";
import { RecetaCard, RecetaCardSkeleton, type RecetaCardData } from "@/components/recetas/RecetaCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/favoritos")({
  component: FavoritosPage,
});

function FavoritosPage() {
  const { user } = useAuth();
  const { favoriteIds, toggle } = useFavoritos();
  const [recetas, setRecetas] = useState<RecetaCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    supabase
      .from("favoritos")
      .select(
        "receta_id, recetas(id, slug, titulo, imagen_url, tiempo_minutos, calorias, badges, categoria)",
      )
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          toast.error("No pudimos cargar tus favoritos");
        } else {
          const items = (data ?? [])
            .map((row) => row.recetas as unknown as RecetaCardData | null)
            .filter((r): r is RecetaCardData => Boolean(r));
          setRecetas(items);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  // Optimistic remove from list when un-favoriting
  const visible = recetas.filter((r) => favoriteIds.has(r.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-secondary">
          Tus favoritos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Cargando…" : `${visible.length} recetas guardadas`}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RecetaCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border">
          <Heart className="h-10 w-10 text-primary mx-auto" />
          <p className="mt-3 font-display text-lg text-secondary">
            Aún no tienes favoritos
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            Toca el corazón en cualquier receta para guardarla aquí.
          </p>
          <Link to="/app/recetas">
            <Button className="mt-5">Explorar recetas</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((r) => (
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
