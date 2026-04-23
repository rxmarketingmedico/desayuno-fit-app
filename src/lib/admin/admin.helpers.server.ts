// Helpers compartilhados pelos server functions de admin.
// IMPORTANTE: ficam num arquivo separado para evitar bugs do
// `tss-serverfn-split` quando handlers usam siblings do mesmo arquivo.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

type PlanType = Database["public"]["Enums"]["plan_type"];

export const APP_URL = process.env.APP_URL ?? "https://desayunofitapp.com";

export const PLAN_LABEL: Record<Exclude<PlanType, "inactivo">, string> = {
  mensual: "Mensual",
  semestral: "Semestral",
  anual: "Anual",
};

export async function ensureAdmin(userId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) throw new Error(`Error verificando rol: ${error.message}`);
  if (!data) throw new Error("Acceso denegado: solo admins.");
}
