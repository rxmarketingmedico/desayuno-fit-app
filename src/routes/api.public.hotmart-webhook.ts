import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendWelcomeEmail } from "@/lib/email/welcome-email";
import type { Database } from "@/integrations/supabase/types";

type PlanType = Database["public"]["Enums"]["plan_type"];

// URL pública do app — usar published URL até DNS de desayunofitapp.com propagar.
// Quando o domínio estiver ativo, troque para "https://desayunofitapp.com".
const APP_URL = "https://desayuno-vital-fit.lovable.app";

// Mapeia o offer code da URL Hotmart para o tipo de plano.
const OFFER_TO_PLAN: Record<string, PlanType> = {
  "1957oc32": "mensual",
  usxp93xx: "semestral",
  ikzhxj2i: "anual",
};

const PLAN_DURATION_DAYS: Record<Exclude<PlanType, "inactivo">, number> = {
  mensual: 30,
  semestral: 180,
  anual: 365,
};

const PLAN_LABEL: Record<Exclude<PlanType, "inactivo">, string> = {
  mensual: "Mensual",
  semestral: "Semestral",
  anual: "Anual",
};

// Eventos que ativam ou estendem o plano.
const ACTIVATION_EVENTS = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE"]);

// Eventos que desativam o plano.
const DEACTIVATION_EVENTS = new Set([
  "PURCHASE_REFUNDED",
  "PURCHASE_CHARGEBACK",
  "PURCHASE_CANCELED",
  "PURCHASE_EXPIRED",
  "SUBSCRIPTION_CANCELLATION",
]);

export const Route = createFileRoute("/api/public/hotmart-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. Validação do HOTTOK — assinatura compartilhada da Hotmart.
        const hottok = process.env.HOTMART_HOTTOK;
        if (!hottok) {
          console.error("HOTMART_HOTTOK não configurado");
          return new Response("Server misconfiguration", { status: 500 });
        }

        const incoming =
          request.headers.get("x-hotmart-hottok") ||
          request.headers.get("X-HOTMART-HOTTOK") ||
          "";

        let payload: HotmartPayload;
        try {
          const raw = await request.text();
          payload = JSON.parse(raw) as HotmartPayload;
        } catch (err) {
          console.error("Hotmart webhook: payload inválido", err);
          return new Response("Bad payload", { status: 400 });
        }

        // A Hotmart também envia o hottok dentro do payload (alguns templates).
        const payloadHottok = payload?.hottok ?? payload?.data?.hottok ?? "";
        if (incoming !== hottok && payloadHottok !== hottok) {
          console.warn("Hotmart webhook: HOTTOK inválido");
          return new Response("Unauthorized", { status: 401 });
        }

        const event = payload.event ?? "";
        const buyer = payload.data?.buyer;
        const purchase = payload.data?.purchase;
        const transactionId = purchase?.transaction ?? null;
        const email = buyer?.email?.toLowerCase().trim();

        if (!email) {
          console.warn("Hotmart webhook: email do comprador ausente", { event });
          return new Response("Missing buyer email", { status: 400 });
        }

        // ---------- Desativação ----------
        if (DEACTIVATION_EVENTS.has(event)) {
          const { data: existing } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle();

          if (existing) {
            await supabaseAdmin
              .from("profiles")
              .update({
                plan_type: "inactivo",
                plan_end_date: new Date().toISOString(),
              })
              .eq("id", existing.id);
          }

          return Response.json({ ok: true, action: "deactivated" });
        }

        // ---------- Ativação / Renovação ----------
        if (!ACTIVATION_EVENTS.has(event)) {
          // Evento ignorado mas confirmamos recebimento para a Hotmart não reenviar.
          return Response.json({ ok: true, action: "ignored", event });
        }

        const planType = resolvePlan(payload);
        if (!planType) {
          console.warn("Hotmart webhook: plano não reconhecido", {
            offer: purchase?.offer,
            event,
          });
          return new Response("Unknown plan", { status: 400 });
        }

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + PLAN_DURATION_DAYS[planType]);

        // 2. Procura profile existente por email.
        const { data: existing } = await supabaseAdmin
          .from("profiles")
          .select("id, plan_end_date, onboarding_completado")
          .eq("email", email)
          .maybeSingle();

        let userId = existing?.id ?? null;
        let isNewUser = false;

        if (!userId) {
          // 3a. Cria usuário no Auth (sem senha — vai entrar por magic link).
          const { data: created, error: createErr } =
            await supabaseAdmin.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: {
                nombre: buyer?.name ?? null,
              },
            });

          if (createErr || !created.user) {
            console.error("Hotmart webhook: erro criando usuário", createErr);
            return new Response("Could not create user", { status: 500 });
          }

          userId = created.user.id;
          isNewUser = true;

          // O trigger handle_new_user já cria o profile com plan_type='inactivo'.
          // Vamos atualizar logo abaixo.
        }

        // 4. Atualiza profile com plan_type e datas. Renovação estende a partir
        // do maior entre (hoje, plan_end_date atual) para não perder dias.
        const baseDate =
          existing?.plan_end_date && new Date(existing.plan_end_date) > startDate
            ? new Date(existing.plan_end_date)
            : startDate;
        const finalEnd = new Date(baseDate);
        finalEnd.setDate(finalEnd.getDate() + PLAN_DURATION_DAYS[planType]);

        const { error: updateErr } = await supabaseAdmin
          .from("profiles")
          .update({
            plan_type: planType,
            plan_start_date: startDate.toISOString(),
            plan_end_date: finalEnd.toISOString(),
            hotmart_transaction_id: transactionId,
            nombre: buyer?.name ?? undefined,
          })
          .eq("id", userId);

        if (updateErr) {
          console.error("Hotmart webhook: erro atualizando profile", updateErr);
          return new Response("Could not update profile", { status: 500 });
        }

        // 5. Para usuário novo: gera magic link e envia email de boas-vindas.
        if (isNewUser) {
          try {
            const { data: linkData, error: linkErr } =
              await supabaseAdmin.auth.admin.generateLink({
                type: "magiclink",
                email,
                options: {
                  redirectTo: `${APP_URL}/app/onboarding`,
                },
              });

            if (linkErr || !linkData?.properties?.action_link) {
              throw linkErr ?? new Error("Magic link vazio");
            }

            await sendWelcomeEmail({
              to: email,
              nombre: buyer?.name ?? null,
              magicLink: linkData.properties.action_link,
              planLabel: PLAN_LABEL[planType],
            });
          } catch (err) {
            // Não derruba o webhook por falha no email — o plano já foi ativado.
            console.error("Hotmart webhook: erro enviando email", err);
          }
        }

        return Response.json({
          ok: true,
          action: isNewUser ? "created" : "renewed",
          plan: planType,
        });
      },
    },
  },
});

function resolvePlan(payload: HotmartPayload): Exclude<PlanType, "inactivo"> | null {
  const offer = payload.data?.purchase?.offer?.code?.toLowerCase().trim();
  if (offer && OFFER_TO_PLAN[offer] && OFFER_TO_PLAN[offer] !== "inactivo") {
    return OFFER_TO_PLAN[offer] as Exclude<PlanType, "inactivo">;
  }

  // Fallback pelo recurrency_period (em meses) caso o offer code não venha.
  const months = payload.data?.subscription?.plan?.recurrency_period;
  if (months === 1) return "mensual";
  if (months === 6) return "semestral";
  if (months === 12) return "anual";

  return null;
}

// Tipagem mínima do payload Hotmart (campos que usamos).
interface HotmartPayload {
  event?: string;
  hottok?: string;
  data?: {
    hottok?: string;
    buyer?: {
      email?: string;
      name?: string;
    };
    purchase?: {
      transaction?: string;
      offer?: {
        code?: string;
      };
    };
    subscription?: {
      plan?: {
        recurrency_period?: number;
      };
    };
  };
}
