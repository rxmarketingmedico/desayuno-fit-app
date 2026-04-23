// Server functions usadas pelo painel /admin.
// Todas exigem que o usuário autenticado tenha role 'admin' (validado server-side).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendWelcomeEmail } from "@/lib/email/welcome-email";
import { listSales, getBuyerSummary } from "@/lib/hotmart/api.server";
import type { Database } from "@/integrations/supabase/types";
import {
  APP_URL,
  PLAN_LABEL,
  ensureAdmin,
} from "@/lib/admin/admin.helpers.server";

type PlanType = Database["public"]["Enums"]["plan_type"];

// =====================================================
// 1. Listar todos os compradores (com filtros)
// =====================================================

export const listBuyers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { search?: string; plan?: string }) => input)
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    let query = supabaseAdmin
      .from("profiles")
      .select(
        "id, email, nombre, plan_type, plan_start_date, plan_end_date, hotmart_transaction_id, onboarding_completado, created_at",
      )
      .order("created_at", { ascending: false });

    if (data.plan && data.plan !== "all") {
      query = query.eq("plan_type", data.plan as PlanType);
    }

    if (data.search?.trim()) {
      const term = `%${data.search.trim()}%`;
      query = query.or(`email.ilike.${term},nombre.ilike.${term}`);
    }

    const { data: rows, error } = await query.limit(500);
    if (error) throw new Error(error.message);

    return { buyers: rows ?? [] };
  });

// =====================================================
// 2. Resumo geral (stats do topo)
// =====================================================

export const getAdminStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);

    const { data: rows, error } = await supabaseAdmin
      .from("profiles")
      .select("plan_type, plan_end_date");
    if (error) throw new Error(error.message);

    const now = Date.now();
    const stats = {
      total: rows?.length ?? 0,
      activos: 0,
      inactivos: 0,
      mensual: 0,
      semestral: 0,
      anual: 0,
      vencenEn30Dias: 0,
    };

    for (const r of rows ?? []) {
      const end = r.plan_end_date ? new Date(r.plan_end_date).getTime() : 0;
      const isActive = r.plan_type !== "inactivo" && end > now;

      if (isActive) {
        stats.activos += 1;
        if (r.plan_type === "mensual") stats.mensual += 1;
        if (r.plan_type === "semestral") stats.semestral += 1;
        if (r.plan_type === "anual") stats.anual += 1;

        const diasRestantes = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        if (diasRestantes <= 30) stats.vencenEn30Dias += 1;
      } else {
        stats.inactivos += 1;
      }
    }

    return stats;
  });

// =====================================================
// 3. Buscar resumo Hotmart de um comprador
// =====================================================

export const getBuyerHotmartSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    try {
      const summary = await getBuyerSummary(data.email);
      return { ok: true as const, summary };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

// =====================================================
// 4. Histórico completo Hotmart (modal de transações)
// =====================================================

export const getBuyerTransactions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    try {
      const items = await listSales({
        buyer_email: data.email,
        max_results: 100,
      });
      return { ok: true as const, transactions: items };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

// =====================================================
// 5. Reenviar email de boas-vindas (gera novo magic link)
// =====================================================

export const resendWelcomeEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      userId: z.string().uuid(),
    }),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("email, nombre, plan_type")
      .eq("id", data.userId)
      .maybeSingle();

    if (error || !profile) {
      throw new Error("Usuario no encontrado");
    }

    const plan = profile.plan_type;
    const planLabel =
      plan === "inactivo" ? "Inactivo" : PLAN_LABEL[plan];

    const { data: linkData, error: linkErr } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: profile.email,
      });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkErr || !tokenHash) {
      throw new Error(
        `Error generando magic link: ${linkErr?.message ?? "vacío"}`,
      );
    }

    const magicLink = `${APP_URL}/auth/verify?token_hash=${encodeURIComponent(
      tokenHash,
    )}&type=magiclink`;

    await sendWelcomeEmail({
      to: profile.email,
      nombre: profile.nombre,
      magicLink,
      planLabel,
    });

    return { ok: true, sentTo: profile.email };
  });

// =====================================================
// 6. Atualizar plano manualmente (ativar / desativar / estender)
// =====================================================

const updatePlanSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["activate", "deactivate", "extend"]),
  // Para activate / extend
  planType: z.enum(["mensual", "semestral", "anual"]).optional(),
  // Para extend (dias) — opcional, default 30
  extraDays: z.number().int().min(1).max(3650).optional(),
});

export const updateUserPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(updatePlanSchema)
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    const { data: current, error: readErr } = await supabaseAdmin
      .from("profiles")
      .select("plan_type, plan_end_date")
      .eq("id", data.userId)
      .maybeSingle();

    if (readErr || !current) {
      throw new Error("Usuario no encontrado");
    }

    const now = new Date();

    if (data.action === "deactivate") {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          plan_type: "inactivo",
          plan_end_date: now.toISOString(),
        })
        .eq("id", data.userId);
      if (error) throw new Error(error.message);
      return { ok: true, action: "deactivated" };
    }

    if (data.action === "activate") {
      if (!data.planType) throw new Error("planType requerido para activar");
      const days =
        data.planType === "mensual"
          ? 30
          : data.planType === "semestral"
            ? 180
            : 365;
      const end = new Date(now);
      end.setDate(end.getDate() + days);

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          plan_type: data.planType,
          plan_start_date: now.toISOString(),
          plan_end_date: end.toISOString(),
        })
        .eq("id", data.userId);
      if (error) throw new Error(error.message);
      return { ok: true, action: "activated", endDate: end.toISOString() };
    }

    // extend
    const extra = data.extraDays ?? 30;
    const base =
      current.plan_end_date && new Date(current.plan_end_date) > now
        ? new Date(current.plan_end_date)
        : now;
    const end = new Date(base);
    end.setDate(end.getDate() + extra);

    const update: {
      plan_end_date: string;
      plan_type?: PlanType;
      plan_start_date?: string;
    } = { plan_end_date: end.toISOString() };

    // Se estava inativo, reativa como mensal por default (ou planType passado)
    if (current.plan_type === "inactivo") {
      update.plan_type = (data.planType ?? "mensual") as PlanType;
      update.plan_start_date = now.toISOString();
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(update)
      .eq("id", data.userId);
    if (error) throw new Error(error.message);

    return { ok: true, action: "extended", endDate: end.toISOString() };
  });

// =====================================================
// 7. Listar admins
// =====================================================

export const listAdmins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);

    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    if (!roles?.length) return { admins: [] };

    const ids = roles.map((r) => r.user_id);
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, nombre")
      .in("id", ids);

    const map = new Map(profiles?.map((p) => [p.id, p]) ?? []);

    return {
      admins: roles.map((r) => ({
        userId: r.user_id,
        email: map.get(r.user_id)?.email ?? "(sin email)",
        nombre: map.get(r.user_id)?.nombre ?? null,
        createdAt: r.created_at,
        isSelf: r.user_id === context.userId,
      })),
    };
  });

// =====================================================
// 8. Promover email a admin
// =====================================================

export const promoteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    const email = data.email.toLowerCase().trim();

    // Procura profile pelo email
    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (pErr) throw new Error(pErr.message);
    if (!profile) {
      throw new Error(
        `No existe ningún usuario con el email ${email}. Pídele que se registre primero.`,
      );
    }

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: profile.id, role: "admin" });

    // 23505 = unique_violation (já é admin)
    if (insErr && insErr.code !== "23505") {
      throw new Error(insErr.message);
    }

    return { ok: true, alreadyAdmin: insErr?.code === "23505" };
  });

// =====================================================
// 9. Remover admin (não pode remover a si mesmo)
// =====================================================

export const demoteAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    if (data.userId === context.userId) {
      throw new Error("No puedes quitarte a ti mismo de admin.");
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "admin");

    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =====================================================
// 10. Verificar se o user atual é admin (usado pelo hook do client)
// =====================================================

export const checkIsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { isAdmin: !!data };
  });
