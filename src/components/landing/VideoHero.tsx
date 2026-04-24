import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoHeroProps {
  /** URL pública do MP4 (ex: bucket Supabase). */
  src: string;
  /** Imagem de capa mostrada antes do play. */
  poster: string;
  /** Texto alternativo da capa para acessibilidade/SEO. */
  posterAlt: string;
  /** Proporção do vídeo. Padrão 9:16 (vertical). */
  aspect?: "9/16" | "16/9" | "4/5" | "1/1";
  className?: string;
}

/**
 * Player "lazy": exibe apenas a imagem de capa + botão de play.
 * Só carrega o <video> (e baixa o MP4) quando o usuário clica.
 * Otimizado para LCP — o poster é o único asset baixado no carregamento inicial.
 */
export function VideoHero({
  src,
  poster,
  posterAlt,
  aspect = "9/16",
  className,
}: VideoHeroProps) {
  const [activated, setActivated] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Quando ativa, dá play automaticamente (com som — é uma intenção de clique).
  useEffect(() => {
    if (activated && videoRef.current) {
      videoRef.current.play().catch(() => {
        // fallback silencioso: se browser bloquear, o usuário usa o controle nativo
      });
    }
  }, [activated]);

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
          {/* Vinheta sutil para destacar o botão */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
          {/* Play */}
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
          {/* Label inferior */}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs md:text-sm font-medium text-white/95 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full">
            ▶ Mira el video (1 min)
          </span>
        </button>
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover bg-black"
        >
          Tu navegador no soporta video HTML5.
        </video>
      )}
    </div>
  );
}
