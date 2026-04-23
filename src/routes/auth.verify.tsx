import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Endpoint próprio de verificação de magic link.
// Não depende da config de Redirect URLs do Supabase — a gente troca o
// token_hash por uma sessão usando o cliente do Supabase no browser.
//
// Fluxo:
//   1. Email contém: https://desayunofitapp.com/auth/verify?token_hash=XXX&type=magiclink
//   2. Esta página chama supabase.auth.verifyOtp({ token_hash, type })
//   3. Sessão é estabelecida no localStorage via persistSession: true
//   4. Redireciona pra /app ou /onboarding
export const Route = createFileRoute("/auth/verify")({
  component: AuthVerifyPage,
});

function AuthVerifyPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type") ?? "magiclink";

        if (!tokenHash) {
          setError("Link inválido o expirado. Falta el token.");
          return;
        }

        const { data, error: verifyErr } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: type as any,
        });

        if (cancelled) return;

        if (verifyErr || !data.session) {
          setError(verifyErr?.message ?? "No pudimos validar el enlace.");
          return;
        }

        // Sessão criada — verifica onboarding pra escolher destino.
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completado")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (cancelled) return;

        // Usa redirect "duro" pra forçar refresh completo e garantir
        // que todos os providers leiam a nova sessão.
        const dest = profile?.onboarding_completado ? "/app" : "/onboarding";
        window.location.replace(dest);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-foreground">
            No pudimos iniciar sesión
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Es posible que el enlace haya expirado. Solicita uno nuevo o
            contáctanos.
          </p>
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
