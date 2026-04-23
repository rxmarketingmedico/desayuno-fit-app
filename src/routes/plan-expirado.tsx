import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { openHotmart } from "@/config/hotmart";
import { toast } from "sonner";

export const Route = createFileRoute("/plan-expirado")({
  component: PlanExpiradoPage,
});

function PlanExpiradoPage() {
  const { signOut } = useAuth();

  const handleRenew = () => {
    openHotmart("mensual", () =>
      toast.info("Próximamente disponible", {
        description: "Estamos terminando de configurar el checkout.",
      }),
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center bg-card border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-secondary">
          Tu plan está inactivo 🌸
        </h1>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          Para seguir disfrutando de las recetas, el plan semanal y la lista de
          compras, renueva tu suscripción cuando quieras.
        </p>
        <Button onClick={handleRenew} size="lg" className="mt-6 w-full">
          Renovar mi plan
        </Button>
        <Button variant="ghost" size="sm" onClick={signOut} className="mt-3">
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
