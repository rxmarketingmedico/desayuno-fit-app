import { Download, Share, Plus, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import logo from "@/assets/logo.webp";

export function PWAInstallBanner() {
  const { visible, platform, canPromptAndroid, promptInstall, dismiss } = usePWAInstall();

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar aplicación"
      className="md:hidden fixed bottom-24 inset-x-3 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      <div className="relative rounded-2xl border border-border bg-card p-4 shadow-xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <img
            src={logo}
            alt=""
            className="h-12 w-12 shrink-0 rounded-xl object-contain"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              Instala Desayuno Fit en tu celular
            </h3>
            {platform === "ios" ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Toca <Share className="inline h-3.5 w-3.5 align-text-bottom" /> en la barra de Safari y luego{" "}
                <span className="font-medium text-foreground">
                  «Añadir a pantalla de inicio»
                  <Plus className="inline h-3.5 w-3.5 align-text-bottom ml-0.5" />
                </span>
              </p>
            ) : platform === "android" && !canPromptAndroid ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Abre el menú <span className="font-medium text-foreground">⋮</span> de Chrome y elige{" "}
                <span className="font-medium text-foreground">«Instalar app»</span> o{" "}
                <span className="font-medium text-foreground">«Añadir a pantalla principal»</span>.
              </p>
            ) : (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Acceso rápido desde tu pantalla de inicio, sin abrir el navegador.
              </p>
            )}
          </div>
        </div>

        {platform === "android" && canPromptAndroid && (
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={promptInstall} className="flex-1">
              <Download className="h-4 w-4" />
              Instalar app
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Ahora no
            </Button>
          </div>
        )}

        {(platform === "ios" || (platform === "android" && !canPromptAndroid)) && (
          <div className="mt-3">
            <Button size="sm" variant="ghost" onClick={dismiss} className="w-full">
              Entendido
            </Button>
          </div>
        )}

        {platform === "desktop" && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Smartphone className="h-3.5 w-3.5" />
            Abre desde un celular para instalar la app.
          </div>
        )}
      </div>
    </div>
  );
}
