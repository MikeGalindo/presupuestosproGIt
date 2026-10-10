// Aritmética monetaria en centavos y formato es-MX/MXN — FR-014, Principio II.

import type { Centavos } from './types';

const formateadorMXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Redondeo half-up a centavos enteros. Se añade un epsilon para mitigar
 * errores de coma flotante (p. ej. `1.005 * 100`).
 */
export function redondearCentavos(valor: number): Centavos {
  if (!Number.isFinite(valor)) {
    return 0;
  }
  const signo = valor < 0 ? -1 : 1;
  return signo * Math.round(Math.abs(valor) * (1 + Number.EPSILON) + Number.EPSILON);
}

/** Convierte centavos a pesos (número decimal). */
export function centavosAPesos(centavos: Centavos): number {
  return centavos / 100;
}

/** Convierte pesos (número) a centavos enteros. */
export function pesosACentavos(pesos: number): Centavos {
  return redondearCentavos(pesos * 100);
}

/** Formatea centavos como moneda es-MX/MXN (p. ej. `$2,000.00`). */
export function formatearMXN(centavos: Centavos): string {
  return formateadorMXN.format(centavosAPesos(centavos));
}
