import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBasket, Trash2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/app/compras")({
  component: ComprasPage,
});

interface Item {
  item: string;
  cantidad: string;
  receta?: string;
  checked: boolean;
}

function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

function ComprasPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [listId, setListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const semana = startOfWeekISO();
    let active = true;
    supabase
      .from("lista_compras")
      .select("id, items")
      .eq("user_id", user.id)
      .eq("semana", semana)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data) {
          setListId(data.id);
          setItems((data.items as unknown as Item[]) ?? []);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const persist = async (next: Item[]) => {
    if (!listId) return;
    await supabase
      .from("lista_compras")
      .update({ items: next as unknown as Json })
      .eq("id", listId);
  };

  const toggleItem = (i: number) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, checked: !it.checked } : it));
    setItems(next);
    persist(next);
  };

  const clearChecked = async () => {
    const next = items.filter((it) => !it.checked);
    setItems(next);
    await persist(next);
    toast.success("Listo, limpiamos lo comprado ✨");
  };

  const shareWhatsApp = () => {
    const lines = items.map((it) => `- ${it.cantidad} ${it.item}`).join("\n");
    const text = `Mi lista de compras 🛒\n\n${lines}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-secondary">
          Lista de compras
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Esta semana — agrega ingredientes desde cualquier receta.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border">
          <ShoppingBasket className="h-10 w-10 text-primary mx-auto" />
          <p className="mt-3 font-display text-lg text-secondary">Lista vacía</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Abre una receta y toca <em>Agregar a lista de compras</em>.
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl bg-card border border-border p-3">
                <Checkbox
                  id={`item-${i}`}
                  checked={it.checked}
                  onCheckedChange={() => toggleItem(i)}
                  className="mt-0.5"
                />
                <label htmlFor={`item-${i}`} className="flex-1 text-sm cursor-pointer">
                  <span className={it.checked ? "line-through text-muted-foreground" : ""}>
                    <span className="font-medium">{it.cantidad}</span> {it.item}
                  </span>
                  {it.receta && (
                    <span className="block text-[11px] text-muted-foreground mt-0.5">
                      Para: {it.receta}
                    </span>
                  )}
                </label>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={shareWhatsApp} className="bg-[#25D366] text-white hover:bg-[#1ebe5a]">
              <Share2 className="h-4 w-4" /> Compartir por WhatsApp
            </Button>
            {items.some((i) => i.checked) && (
              <Button variant="outline" size="sm" onClick={clearChecked}>
                <Trash2 className="h-4 w-4" /> Quitar lo comprado
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
