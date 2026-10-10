// Utilidades del logo del emisor — FR-010.
// @react-pdf/renderer solo incrusta imágenes PNG y JPEG; el resto de formatos
// (SVG, WebP, GIF, BMP…) se normalizan a PNG antes de guardarlos para que el
// logo aparezca siempre en el PDF.

export const TAMANO_MAXIMO_LOGO = 1024 * 1024; // ~1 MB
export const LADO_MAXIMO_LOGO = 512; // lado máximo (px) al normalizar a PNG
export const ACEPTA_LOGO = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';

const TIPOS_PDF_DIRECTOS = ['image/png', 'image/jpeg'];

/** Tipo MIME de una data URL (p. ej. `image/png`), o `null` si no es una data URL. */
export function tipoLogoDesdeDataUrl(dataUrl: string | null | undefined): string | null {
  if (!dataUrl) return null;
  const coincidencia = /^data:([^;,]+)[;,]/.exec(dataUrl);
  return coincidencia?.[1]?.toLowerCase() ?? null;
}

/** ¿La data URL del logo es un formato que el PDF puede incrustar directamente? */
export function logoCompatibleConPdf(dataUrl: string | null | undefined): boolean {
  const tipo = tipoLogoDesdeDataUrl(dataUrl);
  return tipo !== null && TIPOS_PDF_DIRECTOS.includes(tipo);
}

function leerComoDataUrl(archivo: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result === 'string') resolver(lector.result);
      else rechazar(new Error('No se pudo leer el archivo.'));
    };
    lector.onerror = () => rechazar(new Error('No se pudo leer el archivo.'));
    lector.readAsDataURL(archivo);
  });
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rechazar) => {
    const imagen = new Image();
    imagen.onload = () => resolver(imagen);
    imagen.onerror = () => rechazar(new Error('No se pudo procesar la imagen.'));
    imagen.src = src;
  });
}

/**
 * Devuelve una data URL **PNG** lista para el PDF.
 * Los formatos ya soportados (PNG/JPEG) se conservan tal cual; el resto se
 * convierten a PNG en un lienzo, redimensionando si superan `LADO_MAXIMO_LOGO`.
 */
export async function prepararLogo(archivo: File): Promise<string> {
  const original = await leerComoDataUrl(archivo);
  if (logoCompatibleConPdf(original)) return original;

  const imagen = await cargarImagen(original);
  const ancho = imagen.naturalWidth || imagen.width;
  const alto = imagen.naturalHeight || imagen.height;
  if (!ancho || !alto) {
    throw new Error('La imagen no tiene un tamaño válido.');
  }

  const escala = Math.min(1, LADO_MAXIMO_LOGO / Math.max(ancho, alto));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.max(1, Math.round(ancho * escala));
  lienzo.height = Math.max(1, Math.round(alto * escala));
  const contexto = lienzo.getContext('2d');
  if (!contexto) {
    throw new Error('No se pudo procesar la imagen.');
  }
  contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  return lienzo.toDataURL('image/png');
}
