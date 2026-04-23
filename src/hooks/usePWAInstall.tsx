import { useCallback, useEffect, useState } from "react";

type Platform = "android" | "ios" | "desktop" | null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const INSTALLED_KEY = "pwa-installed";
const FORCE_OPEN_KEY = "pwa-install-force-open";
// Cooldown curto: depois de dispensar, o banner volta no dia seguinte.
// Se a pessoa quer fechar pra sempre, o banner não é o caminho — o lembrete
// também aparece no /app/perfil, e quando instala, some pra sempre.
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const SHOW_DELAY_MS = 1500;

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function isPreviewHost(): boolean {
  const h = window.location.hostname;
  return h.includes("id-preview--") || h.includes("lovableproject.com");
}

/**
 * Permite forçar o banner mesmo no preview/iframe via `?pwa=preview` ou
 * via `usePWAInstall().forceOpen()`. Útil pra testar o visual e pra dar ao
 * usuário um botão manual de "Instalar app" (no perfil) que reabre o banner.
 */
function isForceOpen(): boolean {
  try {
    if (sessionStorage.getItem(FORCE_OPEN_KEY) === "1") return true;
    const params = new URLSearchParams(window.location.search);
    return params.get("pwa") === "preview";
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(display-mode: standalone)").matches;
  // iOS Safari exposes navigator.standalone
  const iosStandalone =
    typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === "boolean" &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return Boolean(mq || iosStandalone);
}

function detectIOS(): boolean {
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
  // iPadOS 13+ reports as Mac; detect via touch
  const isIPadOS = ua.includes("Mac") && "ontouchend" in document;
  return isIOS || isIPadOS;
}

function detectAndroid(): boolean {
  return /Android/i.test(window.navigator.userAgent);
}

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    if (value) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function wasInstalledBefore(): boolean {
  return readFlag(INSTALLED_KEY);
}

function markInstalled() {
  writeFlag(INSTALLED_KEY, true);
  // Limpa qualquer flag de "dismissed" antigo: se está instalado, não importa.
  try {
    localStorage.removeItem(DISMISS_KEY);
    sessionStorage.removeItem(FORCE_OPEN_KEY);
  } catch {
    /* ignore */
  }
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

/** Registra um service worker mínimo (network-only) para destravar o
 *  `beforeinstallprompt` no Chrome/Edge Android, que só dispara para PWAs
 *  installable (manifest + SW). Não cacheia nada, então não causa "stale". */
function registerMinimalServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (isPreviewHost() || isInIframe()) return;
  // Só em produção/HTTPS real.
  if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

  // Registra de forma silenciosa: erro não pode quebrar o app.
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .catch(() => {
      /* ignore — instalação simplesmente não disparará nesse navegador */
    });
}

export function usePWAInstall() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [forced, setForced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Registra o SW mínimo o quanto antes — sem ele, Android nunca dispara o prompt.
    registerMinimalServiceWorker();

    const force = isForceOpen();
    setForced(force);

    // No preview/iframe: ainda assim mostramos a prévia se `?pwa=preview` foi pedido.
    if ((isInIframe() || isPreviewHost()) && !force) return;

    // Se está aberto em modo standalone, é porque a usuária instalou:
    // grava persistente para que mesmo abrindo no navegador depois, o banner não volte.
    if (isStandalone()) {
      markInstalled();
      setInstalled(true);
      return;
    }

    // Já marcou como instalado em sessão anterior — nunca mais mostra,
    // exceto se forçado manualmente.
    if (wasInstalledBefore() && !force) {
      setInstalled(true);
      return;
    }

    if (wasRecentlyDismissed() && !force) return;

    const ios = detectIOS();
    const android = detectAndroid();
    let timeoutId: number | undefined;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
      timeoutId = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    };

    const handleInstalled = () => {
      markInstalled();
      setInstalled(true);
      setVisible(false);
      setDeferredPrompt(null);
    };

    // Detecta instalação tardia em iOS: usuária adiciona à tela de início e
    // reabre o app — `display-mode: standalone` passa a true.
    const standaloneMql = window.matchMedia?.("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) handleInstalled();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    standaloneMql?.addEventListener?.("change", handleDisplayModeChange);

    if (ios) {
      setPlatform("ios");
      timeoutId = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    } else if (android) {
      // Android sem `beforeinstallprompt` ainda recebe instruções genéricas
      // depois de um tempo maior (caso o evento nunca chegue).
      setPlatform("android");
      timeoutId = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS * 3);
    } else if (force) {
      // Forçado em desktop ou plataforma desconhecida: mostra como genérico.
      setPlatform("desktop");
      setVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      standaloneMql?.removeEventListener?.("change", handleDisplayModeChange);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      markInstalled();
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setVisible(false);
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      sessionStorage.removeItem(FORCE_OPEN_KEY);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  /** Reabre o banner manualmente (botão "Instalar app" no perfil). */
  const forceOpen = useCallback(() => {
    try {
      sessionStorage.setItem(FORCE_OPEN_KEY, "1");
      localStorage.removeItem(DISMISS_KEY);
      localStorage.removeItem(INSTALLED_KEY);
    } catch {
      /* ignore */
    }
    setInstalled(false);
    setForced(true);
    setVisible(true);
    if (!platform) {
      // Garante uma plataforma sensata pra renderização.
      if (detectIOS()) setPlatform("ios");
      else if (detectAndroid()) setPlatform("android");
      else setPlatform("desktop");
    }
  }, [platform]);

  return {
    visible: visible && (!installed || forced),
    platform,
    canPromptAndroid: Boolean(deferredPrompt),
    isInstalled: installed,
    promptInstall,
    dismiss,
    forceOpen,
  };
}
