import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Página de callback do magic link / OAuth.
// O Supabase redireciona aqui depois de validar o token, com a sessão já
// no hash da URL (#access_token=...) ou nos query params (?code=...).
// O cliente Supabase processa isso automaticamente via detectSessionInUrl.
// Nosso trabalho é só esperar a sessão aparecer e redirecionar.
export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Tenta trocar o code por sessão (fluxo PKCE)
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errorDescription =
          url.searchParams.get("error_description") ||
          url.hash.match(/error_description=([^&]+)/)?.[1];

        if (errorDescription) {
          setError(decodeURIComponent(errorDescription));
          return;
        }

        if (code) {
          const { error: exchangeErr } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr && !cancelled) {
            setError(exchangeErr.message);
            return;
          }
        }

        // Para magic link clássico (token no hash) o detectSessionInUrl do
        // Supabase já processou. Vamos só checar se há sessão.
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (data.session) {
          // Checa se o onboarding já foi feito pra mandar pro lugar certo
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completado")
            .eq("id", data.session.user.id)
            .maybeSingle();

          if (cancelled) return;
          if (profile?.onboarding_completado) {
            navigate({ to: "/app", replace: true });
          } else {
            navigate({ to: "/app/onboarding", replace: true });
          }
        } else {
          // Sem sessão → manda pro login
          navigate({ to: "/login", replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      }
    };

    handleCallback();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-foreground">
            No pudimos iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <a
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ir al login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Iniciando sesión...</p>
    </div>
  );
}
