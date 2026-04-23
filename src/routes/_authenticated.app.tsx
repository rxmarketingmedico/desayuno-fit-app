import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, CalendarDays, ShoppingBasket, User } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppLayout,
});

interface ProfileLite {
  nombre: string | null;
}

const TABS = [
  { to: "/app/recetas", label: "Recetas", icon: BookOpen },
  { to: "/app/favoritos", label: "Favoritos", icon: Heart },
  { to: "/app/semana", label: "Mi semana", icon: CalendarDays },
  { to: "/app/compras", label: "Compras", icon: ShoppingBasket },
  { to: "/app/perfil", label: "Perfil", icon: User },
] as const;

function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;

    let active = true;
    setChecking(true);

    supabase
      .from("profiles")
      .select("nombre, onboarding_completado, plan_type, plan_end_date")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          console.error("Error cargando profile:", error);
          navigate({ to: "/login" });
          return;
        }

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

        setProfile({ nombre: data.nombre });
        setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [user, navigate]);

  // Redirect /app -> /app/recetas
  useEffect(() => {
    if (!checking && location.pathname === "/app") {
      navigate({ to: "/app/recetas", replace: true });
    }
  }, [checking, location.pathname, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Top header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <Link to="/app/recetas" className="flex items-center gap-2" aria-label="Desayuno Fit">
            <img src={logo} alt="Desayuno Fit" className="h-10 w-10 object-contain" />
            <span className="sr-only">Desayuno Fit</span>
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map((t) => (
              <DesktopNavLink key={t.to} to={t.to} icon={<t.icon className="h-4 w-4" />}>
                {t.label}
              </DesktopNavLink>
            ))}
          </nav>
          <div className="hidden md:block">
            <Button variant="ghost" size="sm" onClick={signOut}>Salir</Button>
          </div>
          <span className="md:hidden text-sm text-muted-foreground truncate max-w-[140px]">
            Hola {profile?.nombre ?? ""} 🌸
          </span>
        </div>
      </header>

      {/* Page content */}
      <main className="container mx-auto px-4 py-6 md:py-10">
        <Outlet />
      </main>

      {/* Mobile tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
        <ul className="grid grid-cols-5">
          {TABS.map((t) => (
            <li key={t.to}>
              <Link
                to={t.to}
                className="flex flex-col items-center justify-center gap-1 py-2 text-[11px]"
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
              >
                <t.icon className="h-5 w-5" />
                <span className="font-medium">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function DesktopNavLink({
  to,
  icon,
  children,
}: {
  to: (typeof TABS)[number]["to"];
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      activeProps={{ className: "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" }}
    >
      {icon}
      {children}
    </Link>
  );
}
