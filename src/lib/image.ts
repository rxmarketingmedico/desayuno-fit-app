/**
 * Helpers para servir imagens otimizadas via Supabase Image Transformations.
 *
 * Converte URLs `/storage/v1/object/public/...` em `/storage/v1/render/image/public/...`
 * adicionando width/height/quality/format. WebP por padrão, com fallback para a URL
 * original quando a transformação não se aplica.
 */

const RENDER_PATH = "/storage/v1/render/image/public/";
const OBJECT_PATH = "/storage/v1/object/public/";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
}

export function transformImage(url: string, opts: ImageTransformOptions = {}): string {
  if (!url) return url;
  if (!url.includes(OBJECT_PATH)) return url;

  const rendered = url.replace(OBJECT_PATH, RENDER_PATH);
  const params = new URLSearchParams();
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  params.set("quality", String(opts.quality ?? 70));
  params.set("resize", opts.resize ?? "cover");

  const query = params.toString();
  return query ? `${rendered}?${query}` : rendered;
}

/**
 * Retorna `srcset` com 1x e 2x para uma largura base, usando WebP otimizado.
 */
export function buildSrcSet(url: string, baseWidth: number, opts: Omit<ImageTransformOptions, "width"> = {}) {
  const x1 = transformImage(url, { ...opts, width: baseWidth });
  const x2 = transformImage(url, { ...opts, width: baseWidth * 2 });
  return {
    src: x1,
    srcSet: `${x1} 1x, ${x2} 2x`,
  };
}
