import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useFavoritos() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    let active = true;
    supabase
      .from("favoritos")
      .select("receta_id")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          toast.error("No pudimos cargar tus favoritos");
        } else {
          setFavoriteIds(new Set((data ?? []).map((f) => f.receta_id)));
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const toggle = useCallback(
    async (recetaId: string) => {
      if (!user) return;
      const isFav = favoriteIds.has(recetaId);
      // Optimistic
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(recetaId);
        else next.add(recetaId);
        return next;
      });
      if (isFav) {
        const { error } = await supabase
          .from("favoritos")
          .delete()
          .eq("user_id", user.id)
          .eq("receta_id", recetaId);
        if (error) {
          setFavoriteIds((prev) => new Set(prev).add(recetaId));
          toast.error("No se pudo quitar de favoritos");
        }
      } else {
        const { error } = await supabase
          .from("favoritos")
          .insert({ user_id: user.id, receta_id: recetaId });
        if (error) {
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(recetaId);
            return next;
          });
          toast.error("No se pudo guardar en favoritos");
        }
      }
    },
    [favoriteIds, user],
  );

  return { favoriteIds, toggle, loading };
}
