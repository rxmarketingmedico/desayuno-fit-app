// URLs de checkout Hotmart. Quando não definidas, retorna null e a UI mostra
// um toast "Próximamente disponible" no clique.
export const HOTMART_URLS = {
  mensual: import.meta.env.VITE_HOTMART_CHECKOUT_URL_MENSUAL || null,
  semestral: import.meta.env.VITE_HOTMART_CHECKOUT_URL_SEMESTRAL || null,
  anual: import.meta.env.VITE_HOTMART_CHECKOUT_URL_ANUAL || null,
} as const;

export type PlanKey = keyof typeof HOTMART_URLS;

export function openHotmart(plan: PlanKey, onUnavailable?: () => void) {
  const url = HOTMART_URLS[plan];
  if (!url) {
    onUnavailable?.();
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
