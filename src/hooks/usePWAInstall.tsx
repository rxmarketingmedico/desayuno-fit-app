import { useCallback, useEffect, useState } from "react";

type Platform = "android" | "ios" | null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const INSTALLED_KEY = "pwa-installed";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SHOW_DELAY_MS = 3000;

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

export function usePWAInstall() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInIframe() || isPreviewHost()) return;

    // Se está aberto em modo standalone, é porque a usuária instalou:
    // grava persistente para que mesmo abrindo no navegador depois, o banner não volte.
    if (isStandalone()) {
      markInstalled();
      setInstalled(true);
      return;
    }

    // Já marcou como instalado em sessão anterior — nunca mais mostra.
    if (wasInstalledBefore()) {
      setInstalled(true);
      return;
    }

    if (wasRecentlyDismissed()) return;

    const ios = detectIOS();
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
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  return {
    visible: visible && !installed,
    platform,
    canPromptAndroid: Boolean(deferredPrompt),
    promptInstall,
    dismiss,
  };
}
