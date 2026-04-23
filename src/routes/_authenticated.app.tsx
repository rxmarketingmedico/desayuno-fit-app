import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppHome,
});

function AppHome() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("nombre, onboarding_completado, plan_type, plan_end_date")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          navigate({ to: "/login" });
          return;
        }
        if (!data.onboarding_completado) {
          navigate({ to: "/onboarding" });
          return;
        }
        const planActivo =
          data.plan_type !== "inactivo" &&
          data.plan_end_date !== null &&
          new Date(data.plan_end_date) > new Date();
        if (!planActivo) {
          navigate({ to: "/plan-expirado" });
          return;
        }
        setNombre(data.nombre);
        setChecking(false);
      });
  }, [user, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="font-display text-xl font-bold text-secondary">Desayuno Fit</h1>
          <Button variant="ghost" size="sm" onClick={signOut}>Salir</Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary">
          Bienvenida{nombre ? `, ${nombre}` : ""} 🌸
        </h2>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
          El catálogo completo de recetas llega en la próxima etapa. Por ahora, ¡listo el acceso!
        </p>
      </main>
    </div>
  );
}
