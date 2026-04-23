import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { openHotmart } from "@/config/hotmart";
import logo from "@/assets/logo.webp";

const SIDE_IMG =
  "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1000&q=80";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Desayuno Fit" },
      {
        name: "description",
        content: "Accede a tus recetas, plan semanal y lista de compras de Desayuno Fit.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/app" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      toast.error(msg.includes("Invalid login") ? "Correo o contraseña incorrectos" : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    openHotmart("mensual", () =>
      toast.info("Próximamente disponible", {
        description: "Estamos terminando de configurar el checkout.",
      }),
    );
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Imagen lateral (solo desktop) */}
      <div className="hidden md:block relative">
        <img
          src={SIDE_IMG}
          alt="Smoothie bowl con frutas frescas"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/30 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-primary-foreground">
          <Link to="/" className="inline-flex items-center gap-3 drop-shadow" aria-label="Desayuno Fit">
            <img src={logo} alt="Desayuno Fit" className="h-16 w-16 object-contain bg-white/90 rounded-2xl p-1.5" />
          </Link>
          <p className="mt-4 text-lg text-white/90 max-w-sm drop-shadow">
            Tus recetas, tu plan semanal y tu lista de compras. Todo en un solo lugar.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header mobile */}
          <Link
            to="/"
            className="md:hidden flex items-center justify-center mb-6"
            aria-label="Desayuno Fit"
          >
            <img src={logo} alt="Desayuno Fit" className="h-20 w-20 object-contain" />
          </Link>

          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h1 className="font-display text-2xl font-semibold text-secondary">
              Bienvenida de vuelta
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Ingresa para acceder a tus recetas
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center text-sm">
              <span className="text-muted-foreground">¿Aún no tienes cuenta? </span>
              <button
                type="button"
                onClick={handleSignup}
                className="text-primary font-medium hover:underline"
              >
                Empieza aquí
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
