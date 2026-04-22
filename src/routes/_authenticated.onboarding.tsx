import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

const PREFERENCIAS = [
  { key: "sin_gluten", label: "Sin gluten" },
  { key: "alta_proteina", label: "Alta proteína" },
  { key: "sin_azucar", label: "Sin azúcar" },
  { key: "vegetariano", label: "Vegetariano" },
];

function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // If user already completed onboarding, skip
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("onboarding_completado, nombre")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.onboarding_completado) navigate({ to: "/app" });
        if (data?.nombre) setNombre(data.nombre);
      });
  }, [user, navigate]);

  const finish = async (skipped: boolean) => {
    if (!user) return;
    setLoading(true);
    try {
      const update: { onboarding_completado: boolean; nombre?: string; preferencias?: Record<string, boolean> } = {
        onboarding_completado: true,
      };
      if (!skipped) {
        if (nombre.trim()) update.nombre = nombre.trim();
        update.preferencias = prefs;
      }
      const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
      if (error) throw error;
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 flex justify-end">
        <Button variant="ghost" onClick={() => finish(true)} disabled={loading}>
          Saltar por ahora
        </Button>
      </div>
      <div className="container mx-auto px-4 max-w-xl pb-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-secondary text-center">
          ¡Bienvenida! 🌿
        </h1>
        <p className="text-center text-muted-foreground mt-3">
          Cuéntanos un poquito de ti para personalizar tus recetas. Puedes editarlo cuando quieras.
        </p>

        <div className="mt-8 bg-card rounded-2xl shadow-sm border border-border p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">¿Cómo te llamas?</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
          </div>

          <div className="space-y-3">
            <Label>¿Tienes alguna preferencia? (opcional)</Label>
            <div className="grid grid-cols-2 gap-3">
              {PREFERENCIAS.map((p) => (
                <label key={p.key} className="flex items-center gap-2 cursor-pointer rounded-lg border border-border p-3 hover:bg-muted/50 transition">
                  <Checkbox
                    checked={!!prefs[p.key]}
                    onCheckedChange={(v) => setPrefs((prev) => ({ ...prev, [p.key]: !!v }))}
                  />
                  <span className="text-sm">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={() => finish(false)} disabled={loading}>
            {loading ? "Guardando..." : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
