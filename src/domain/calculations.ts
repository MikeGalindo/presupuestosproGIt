// Cálculo automático de base, IVA, retención de ISR y total — FR-006, FR-007.

import type { Centavos, LineaPresupuesto } from './types';
import { redondearCentavos } from './money';

/** Tasa de IVA en v1 (siempre aplica). */
export const TASA_IVA = 16;
/** Tasa de retención de ISR cuando está activada. */
export const TASA_ISR = 10;

export interface Totales {
  baseCentavos: Centavos;
  ivaCentavos: Centavos;
  retencionCentavos: Centavos;
  totalCentavos: Centavos;
}

/** Importe de una línea = round(cantidad × precio unitario). */
export function importeLineaCentavos(linea: Pick<LineaPresupuesto, 'cantidad' | 'precioUnitario'>): Centavos {
  return redondearCentavos(linea.cantidad * linea.precioUnitario);
}

/** Base imponible = suma de los importes de las líneas. */
export function calcularBaseCentavos(lineas: ReadonlyArray<Pick<LineaPresupuesto, 'cantidad' | 'precioUnitario'>>): Centavos {
  return lineas.reduce((suma, linea) => suma + importeLineaCentavos(linea), 0);
}

/** IVA = round(base × 16 / 100). */
export function calcularIvaCentavos(baseCentavos: Centavos): Centavos {
  return redondearCentavos((baseCentavos * TASA_IVA) / 100);
}

/** Retención de ISR = retencionISR ? round(base × 10 / 100) : 0. */
export function calcularRetencionCentavos(baseCentavos: Centavos, retencionISR: boolean): Centavos {
  return retencionISR ? redondearCentavos((baseCentavos * TASA_ISR) / 100) : 0;
}

/** Calcula todos los totales del presupuesto. total = base + IVA − retención. */
export function calcularTotales(
  lineas: ReadonlyArray<Pick<LineaPresupuesto, 'cantidad' | 'precioUnitario'>>,
  retencionISR: boolean,
): Totales {
  const baseCentavos = calcularBaseCentavos(lineas);
  const ivaCentavos = calcularIvaCentavos(baseCentavos);
  const retencionCentavos = calcularRetencionCentavos(baseCentavos, retencionISR);
  const totalCentavos = baseCentavos + ivaCentavos - retencionCentavos;
  return { baseCentavos, ivaCentavos, retencionCentavos, totalCentavos };
}
