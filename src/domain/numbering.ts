// Numeración automática AÑO-NN — FR-008.

import type { Presupuesto } from './types';

/** Extrae el año (`YYYY`) de una fecha ISO `YYYY-MM-DD`. */
export function anioDeFecha(fechaISO: string): number {
  const anio = Number(fechaISO.slice(0, 4));
  return Number.isFinite(anio) ? anio : new Date().getFullYear();
}

/** Máximo consecutivo (`NN`) ya usado para un año entre los presupuestos emitidos. */
export function maxConsecutivoDelAnio(presupuestos: ReadonlyArray<Presupuesto>, anio: number): number {
  let maximo = 0;
  for (const p of presupuestos) {
    if (p.estado === 'borrador' || !p.numero) continue;
    const coincidencia = /^(\d{4})-(\d+)$/.exec(p.numero);
    if (!coincidencia) continue;
    if (Number(coincidencia[1]) !== anio) continue;
    const nn = Number(coincidencia[2]);
    if (Number.isFinite(nn) && nn > maximo) maximo = nn;
  }
  return maximo;
}

/**
 * Calcula el siguiente número `YYYY-NN` para `anio`.
 *
 * Considera tanto los presupuestos emitidos vigentes como el contador persistido
 * (`ultimoUsado`), de forma que un número eliminado no se reutilice (FR-008, SC-003).
 */
export function siguienteNumero(
  presupuestos: ReadonlyArray<Presupuesto>,
  anio: number,
  ultimoUsado = 0,
): string {
  const maximo = Math.max(maxConsecutivoDelAnio(presupuestos, anio), ultimoUsado);
  return `${anio}-${String(maximo + 1).padStart(2, '0')}`;
}
