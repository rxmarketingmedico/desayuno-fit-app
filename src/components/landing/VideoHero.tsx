import { useState, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoHeroProps {
  /** URL do MP4 em alta qualidade (1080p). */
  src: string;
  /** URL opcional do MP4 leve (720p) — usado em conexão lenta ou tela pequena. */
  srcLight?: string;
  /** Imagem de capa mostrada antes do play. */
  poster: string;
  /** Texto alternativo da capa para acessibilidade/SEO. */
  posterAlt: string;
  /** Proporção do vídeo. Padrão 9:16 (vertical). */
  aspect?: "9/16" | "16/9" | "4/5" | "1/1";
  className?: string;
}

/**
 * Decide qual versão do vídeo carregar com base em:
 * - Network Information API (conexão lenta → versão leve)
 * - Save-Data header
 * - Largura da tela (mobile pequeno → leve)
 */
function pickVideoSrc(src: string, srcLight?: string): string {
  if (!srcLight) return src;
  if (typeof navigator === "undefined") return src;

  // 1) Save-Data ativo (usuário pediu economia de dados)
  const conn = (navigator as Navigator & {
    connection?: {
      saveData?: boolean;
      effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
      downlink?: number;
    };
  }).connection;

  if (conn?.saveData) return srcLight;

  // 2) Conexão lenta (3g, 2g)
  if (conn?.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) {
    return srcLight;
  }

  // 3) Downlink baixo (<2 Mbps)
  if (typeof conn?.downlink === "number" && conn.downlink < 2) {
    return srcLight;
  }

  // 4) Tela muito pequena (mobile com largura <500px) — não vale 1080p
  if (typeof window !== "undefined" && window.innerWidth < 500) {
    return srcLight;
  }

  return src;
}

/**
 * Player "lazy": exibe apenas a imagem de capa + botão de play.
 * Só carrega o <video> quando o usuário clica.
 *
 * Estratégia robusta de autoplay:
 * 1. Tenta tocar com som (intenção de clique).
 * 2. Se o navegador bloquear, faz fallback para mudo + botão "Activar sonido".
 */
export function VideoHero({
  src,
  srcLight,
  poster,
  posterAlt,
  aspect = "9/16",
  className,
}: VideoHeroProps) {
  const [activated, setActivated] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>(src);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Escolhe a melhor versão no client (após mount, pra evitar mismatch SSR)
  useEffect(() => {
    setResolvedSrc(pickVideoSrc(src, srcLight));
  }, [src, srcLight]);

  useEffect(() => {
    if (!activated || !videoRef.current) return;
    const video = videoRef.current;

    const tryPlay = async () => {
      try {
        video.muted = false;
        video.volume = 1;
        await video.play();
        setIsMuted(false);
      } catch {
        // Bloqueado pelo navegador → fallback mudo
        try {
          video.muted = true;
          await video.play();
          setIsMuted(true);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("[VideoHero] play falhou:", err);
        }
      }
    };
    void tryPlay();
  }, [activated]);

  const handleUnmute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    videoRef.current.volume = 1;
    setIsMuted(false);
  };

  const aspectClass =
    aspect === "9/16"
      ? "aspect-[9/16]"
      : aspect === "16/9"
        ? "aspect-video"
        : aspect === "4/5"
          ? "aspect-[4/5]"
          : "aspect-square";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl bg-secondary shadow-2xl",
        aspectClass,
        className,
      )}
    >
      {!activated ? (
        <button
          type="button"
          onClick={() => setActivated(true)}
          aria-label="Reproducir video"
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <img
            src={poster}
            alt={posterAlt}
            width={1080}
            height={1920}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                "flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full",
                "bg-primary text-primary-foreground shadow-2xl shadow-primary/40",
                "transition-transform duration-300 group-hover:scale-110 group-active:scale-95",
                "ring-8 ring-white/20",
              )}
            >
              <Play className="h-9 w-9 md:h-11 md:w-11 fill-current ml-1" />
            </span>
          </div>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs md:text-sm font-medium text-white/95 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full">
            ▶ Mira el video (1 min)
          </span>
        </button>
      ) : (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls
            playsInline
            preload="auto"
            autoPlay
            className="absolute inset-0 h-full w-full object-contain bg-black"
            onError={(e) => {
              // eslint-disable-next-line no-console
              console.error("[VideoHero] erro de carregamento:", e.currentTarget.error);
            }}
          >
            <source src={src} type="video/mp4" />
            Tu navegador no soporta video HTML5.
          </video>

          {/* Fallback "Activar sonido" quando o navegador bloqueia autoplay com áudio */}
          {isMuted && (
            <button
              type="button"
              onClick={handleUnmute}
              className={cn(
                "absolute top-3 right-3 z-10 inline-flex items-center gap-1.5",
                "rounded-full bg-primary text-primary-foreground",
                "px-3 py-2 text-xs font-semibold shadow-lg",
                "hover:scale-105 active:scale-95 transition-transform",
              )}
              aria-label="Activar sonido"
            >
              <VolumeX className="h-4 w-4" />
              Activar sonido
            </button>
          )}
          {!isMuted && (
            <span
              aria-hidden
              className="absolute top-3 right-3 z-10 hidden md:inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur px-2.5 py-1 text-[10px] text-white/90"
            >
              <Volume2 className="h-3 w-3" />
              Sonido activo
            </span>
          )}
        </>
      )}
    </div>
  );
}
