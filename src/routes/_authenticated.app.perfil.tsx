import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User as UserIcon, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

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
        {profile?.plan_end_date && (
          <p className="text-xs text-muted-foreground">
            Vigente hasta {new Date(profile.plan_end_date).toLocaleDateString("es-419", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <Button variant="outline" className="w-full" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Más opciones (preferencias, restricciones) llegan en la próxima etapa.
      </p>
    </div>
  );
}
