import {
  createFileRoute,
  Outlet,
  useNavigate,
  Link,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Shield, Users, ShieldCheck, ArrowLeft } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate({ to: "/app", replace: true });
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Verificando permisos...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const onAdminsTab = pathname.endsWith("/admin/admins");

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-secondary leading-tight">
                Panel de Admin
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                Desayuno Fit
              </p>
            </div>
          </div>
          <Link to="/app">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al app</span>
            </Button>
          </Link>
        </div>

        <nav className="container mx-auto px-4 flex gap-1 -mb-px">
          <Link
            to="/admin"
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              !onAdminsTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Compradores
          </Link>
          <Link
            to="/admin/admins"
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              onAdminsTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Admins
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
