import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User as UserIcon, LogOut, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { openHotmart } from "@/config/hotmart";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/perfil")({
  component: PerfilPage,
});

interface Profile {
  nombre: string | null;
  email: string;
  plan_type: string;
  plan_end_date: string | null;
}

function PerfilPage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("nombre, email, plan_type, plan_end_date")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as Profile));
  }, [user]);

  const diasRestantes = profile?.plan_end_date
    ? Math.ceil(
        (new Date(profile.plan_end_date).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;
  const planPorVencer =
    diasRestantes !== null && diasRestantes >= 0 && diasRestantes < 14;

  const fechaVencimiento = profile?.plan_end_date
    ? new Date(profile.plan_end_date).toLocaleDateString("es-419", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const renovar = () => {
    const plan =
      profile?.plan_type === "anual" || profile?.plan_type === "semestral"
        ? profile.plan_type
        : "mensual";
    openHotmart(plan as "mensual" | "semestral" | "anual", () =>
      toast.info("Próximamente disponible"),
    );
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary mx-auto">
          <UserIcon className="h-10 w-10" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-secondary">
          {profile?.nombre ?? "Mi perfil"}
        </h1>
        <p className="text-sm text-muted-foreground">{profile?.email ?? user?.email}</p>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5 space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Tu plan</p>
        <p className="font-display text-lg font-semibold text-secondary capitalize">
          {profile?.plan_type ?? "—"}
        </p>
        {fechaVencimiento && (
          <p className="text-xs text-muted-foreground">Vigente hasta {fechaVencimiento}</p>
        )}
      </div>

      {planPorVencer && fechaVencimiento && (
        <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4 space-y-3">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-sm text-orange-900">
              <span className="font-semibold">Tu plan vence el {fechaVencimiento}.</span>{" "}
              Renueva para seguir disfrutando.
            </p>
          </div>
          <Button
            size="sm"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            onClick={renovar}
          >
            Renovar ahora
          </Button>
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Más opciones (preferencias, restricciones) llegan en la próxima etapa.
      </p>
    </div>
  );
}
