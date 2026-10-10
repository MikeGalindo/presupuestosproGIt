// Resumen de actividad de la página de inicio — FR-003.
// Vista derivada y pura: no persiste nada y no introduce datos nuevos.

import { estadoMostrado } from '../../domain/estados';
import type { EstadoMostrado, Presupuesto } from '../../domain/types';

export interface ResumenActividad {
  porEstado: Record<EstadoMostrado, number>;
  clientes: number;
  servicios: number;
}

/** Cuenta los presupuestos por estado mostrado (incluye el calculado "caducado"). */
export function resumenActividad(
  presupuestos: ReadonlyArray<Presupuesto>,
  clientes: number,
  servicios: number,
  hoy: string,
): ResumenActividad {
  const porEstado: Record<EstadoMostrado, number> = {
    borrador: 0,
    enviado: 0,
    aceptado: 0,
    rechazado: 0,
    caducado: 0,
  };

  for (const presupuesto of presupuestos) {
    porEstado[estadoMostrado(presupuesto, hoy)] += 1;
  }

  return { porEstado, clientes, servicios };
}
