// Fuente única de identidad visual — FR-007, contracts/design-tokens.md.
// La aplicación consume estos valores como variables CSS (aplicarTokens) y el PDF
// los importa directamente. Ningún color de marca debe escribirse fuera de este archivo.

export const PALETA = {
  marca: '#1F3A5F',
  marcaOscura: '#14283F',
  marcaSuave: '#E8EEF5',
  acento: '#2E6B5E',
  texto: '#1B1F24',
  textoSuave: '#5B6470',
  borde: '#D9DEE4',
  fondo: '#F4F6F8',
  superficie: '#FFFFFF',
} as const;

// Las etiquetas en es-MX de cada estado viven en `domain/estados.ts`; aquí solo el color.
export type ClaveEstado = 'borrador' | 'enviado' | 'aceptado' | 'rechazado' | 'caducado';

export interface EstiloEstado {
  fondo: string;
  texto: string;
}

export const ESTADOS: Record<ClaveEstado, EstiloEstado> = {
  borrador: { fondo: '#FBF1DC', texto: '#7A5410' },
  enviado: { fondo: '#E3ECF7', texto: '#1F4E79' },
  aceptado: { fondo: '#E1F0E6', texto: '#1E6B3A' },
  rechazado: { fondo: '#FBE4E3', texto: '#9A2A22' },
  caducado: { fondo: '#ECEEF1', texto: '#566070' },
} as const;

export const ESPACIADO = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const TIPOGRAFIA = {
  familiaUI: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  familiaPDF: 'Helvetica',
  /** Escala en px: 12 · 14 · 16 · 18 · 22 · 28 · 36 */
  escala: [12, 14, 16, 18, 22, 28, 36],
} as const;

function aKebab(cadena: string): string {
  return cadena.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Escribe los tokens como variables CSS en `:root`. Se invoca una vez al arrancar
 * (`src/main.tsx`). `global.css` consume únicamente `var(--…)`.
 */
export function aplicarTokens(): void {
  const raiz = document.documentElement;

  (Object.entries(PALETA) as Array<[string, string]>).forEach(([clave, valor]) => {
    raiz.style.setProperty(`--${aKebab(clave)}`, valor);
  });

  (Object.keys(ESTADOS) as ClaveEstado[]).forEach((estado) => {
    raiz.style.setProperty(`--estado-${estado}-fondo`, ESTADOS[estado].fondo);
    raiz.style.setProperty(`--estado-${estado}-texto`, ESTADOS[estado].texto);
  });

  (Object.entries(ESPACIADO) as Array<[string, number]>).forEach(([clave, valor]) => {
    raiz.style.setProperty(`--esp-${clave}`, `${valor}px`);
  });

  TIPOGRAFIA.escala.forEach((valor, indice) => {
    raiz.style.setProperty(`--tipo-${indice}`, `${valor}px`);
  });

  raiz.style.setProperty('--tipo-familia', TIPOGRAFIA.familiaUI);
}
