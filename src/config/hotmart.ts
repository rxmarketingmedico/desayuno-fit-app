// URLs de checkout Hotmart. Quando não definidas, retorna null e a UI mostra
// um toast "Próximamente disponible" no clique.
export const HOTMART_URLS = {
  mensual:
    import.meta.env.VITE_HOTMART_CHECKOUT_URL_MENSUAL ||
    "https://pay.hotmart.com/P105518866K?off=1957oc32&checkoutMode=10",
  semestral:
    import.meta.env.VITE_HOTMART_CHECKOUT_URL_SEMESTRAL ||
    "https://pay.hotmart.com/P105518866K?off=usxp93xx&checkoutMode=10",
  anual:
    import.meta.env.VITE_HOTMART_CHECKOUT_URL_ANUAL ||
    "https://pay.hotmart.com/P105518866K?off=ikzhxj2i&checkoutMode=10",
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
