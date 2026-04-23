import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User as UserIcon, LogOut, AlertTriangle, Loader2, Shield, Download, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { openHotmart } from "@/config/hotmart";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/perfil")({
  component: PerfilPage,
});

interface Preferencias {
  sin_gluten?: boolean;
  alta_proteina?: boolean;
  sin_azucar?: boolean;
  vegetariano?: boolean;
}

interface Profile {
  nombre: string | null;
  email: string;
  plan_type: string;
  plan_end_date: string | null;
  preferencias: Preferencias;
}

const PREFS: { key: keyof Preferencias; label: string }[] = [
  { key: "sin_gluten", label: "Sin gluten" },
  { key: "alta_proteina", label: "Alta proteína" },
  { key: "sin_azucar", label: "Sin azúcar" },
  { key: "vegetariano", label: "Vegetariano" },
];

function PerfilPage() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { isInstalled, forceOpen: openInstallBanner } = usePWAInstall();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prefs, setPrefs] = useState<Preferencias>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("nombre, email, plan_type, plan_end_date, preferencias")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setProfile(data as Profile);
        setPrefs((data.preferencias as Preferencias) ?? {});
      });
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

  const togglePref = (key: keyof Preferencias) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const guardarPrefs = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ preferencias: prefs as Record<string, boolean> })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("No se pudieron guardar tus preferencias");
      return;
    }
    toast.success("Preferencias actualizadas");
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
        <div className="rounded-2xl border border-warning-border bg-warning-soft p-4 space-y-3">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">⚠️ Tu plan vence el {fechaVencimiento}.</span>{" "}
              Renueva para seguir disfrutando.
            </p>
          </div>
          <Button
            size="sm"
            className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
            onClick={renovar}
          >
            Renovar ahora
          </Button>
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-secondary">
            Preferencias dietéticas
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Personaliza tus recetas según tus necesidades.
          </p>
        </div>
        <div className="space-y-3">
          {PREFS.map(({ key, label }) => (
            <label
              key={key}
              htmlFor={`pref-${key}`}
              className="flex items-center gap-3 cursor-pointer rounded-lg p-2 -mx-2 hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={`pref-${key}`}
                checked={!!prefs[key]}
                onCheckedChange={() => togglePref(key)}
              />
              <Label htmlFor={`pref-${key}`} className="text-sm cursor-pointer flex-1">
                {label}
              </Label>
            </label>
          ))}
        </div>
        <Button
          className="w-full"
          onClick={guardarPrefs}
          disabled={saving}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar preferencias
        </Button>
      </div>

      {isAdmin && (
        <Link to="/admin">
          <Button variant="outline" className="w-full">
            <Shield className="h-4 w-4" /> Panel de admin
          </Button>
        </Link>
      )}

      <Button variant="outline" className="w-full" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </Button>
    </div>
  );
}
