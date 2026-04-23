import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendWelcomeEmail } from "@/lib/email/welcome-email";

// Endpoint de teste para disparar o email de boas-vindas com magic link real.
// Protegido pelo HOTMART_HOTTOK para evitar abuso.
//
// Uso:
//   GET /api/public/test-welcome-email?email=tu@email.com&token=SEU_HOTTOK
//   Opcionais: &nombre=Maria&plan=mensual|semestral|anual
//
// IMPORTANTE: gera um magic link real — clicar no botão fará login de verdade.

const PLAN_LABEL: Record<string, string> = {
  mensual: "Mensual",
  semestral: "Semestral",
  anual: "Anual",
};

const APP_URL = process.env.APP_URL ?? "https://desayunofitapp.com";

export const Route = createFileRoute("/api/public/test-welcome-email")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token") ?? "";
        const email = url.searchParams.get("email")?.toLowerCase().trim();
        const nombre = url.searchParams.get("nombre");
        const plan = (url.searchParams.get("plan") ?? "mensual").toLowerCase();

        const hottok = process.env.HOTMART_HOTTOK;
        if (!hottok || token !== hottok) {
          return new Response("Unauthorized", { status: 401 });
        }

        if (!email || !email.includes("@")) {
          return new Response("Missing or invalid 'email' query param", {
            status: 400,
          });
        }

        const planLabel = PLAN_LABEL[plan] ?? "Mensual";

        try {
          const { data: linkData, error: linkErr } =
            await supabaseAdmin.auth.admin.generateLink({
              type: "magiclink",
              email,
              options: {
                redirectTo: `${APP_URL}/auth/callback`,
              },
            });

          if (linkErr || !linkData?.properties?.action_link) {
            console.error("Test email: erro gerando magic link", linkErr);
            return Response.json(
              { ok: false, step: "magic_link", error: linkErr?.message },
              { status: 500 },
            );
          }

          await sendWelcomeEmail({
            to: email,
            nombre: nombre ?? null,
            magicLink: linkData.properties.action_link,
            planLabel,
          });

          return Response.json({
            ok: true,
            sent_to: email,
            plan: planLabel,
            note: "Revisa tu bandeja (y spam). El magic link es real, hace login de verdad.",
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("Test email: erro enviando", err);
          return Response.json(
            { ok: false, step: "send", error: message },
            { status: 500 },
          );
        }
      },
    },
  },
});
