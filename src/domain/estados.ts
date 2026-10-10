// Lógica pura de estados del presupuesto — FR-011…FR-013, data-model.md §1.
// Sin React, sin almacenamiento y sin estilos.

import type { EstadoCambiable, EstadoMostrado, EstadoPresupuesto, Presupuesto } from './types';

/** Etiquetas visibles en es-MX. Fuente única de los nombres de estado. */
export const ETIQUETAS_ESTADO: Record<EstadoMostrado, string> = {
  borrador: 'Borrador',
  enviado: 'Enviado',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
  caducado: 'Caducado',
};

/** Estados persistidos, en orden de ciclo de vida. */
export const ESTADOS_PERSISTIDOS: readonly EstadoPresupuesto[] = [
  'borrador',
  'enviado',
  'aceptado',
  'rechazado',
];

/** Estados mostrados (incluye el calculado). */
export const ESTADOS_MOSTRADOS: readonly EstadoMostrado[] = [
  'borrador',
  'enviado',
  'aceptado',
  'rechazado',
  'caducado',
];

/** ¿Es `valor` un estado persistido válido? */
export function esEstadoValido(valor: unknown): valor is EstadoPresupuesto {
  return (
    valor === 'borrador' ||
    valor === 'enviado' ||
    valor === 'aceptado' ||
    valor === 'rechazado'
  );
}

/** ¿Es `valor` un destino válido para cambiarEstado? */
export function esEstadoCambiable(valor: unknown): valor is EstadoCambiable {
  return valor === 'enviado' || valor === 'aceptado' || valor === 'rechazado';
}

/**
 * Estado que debe mostrarse. "Caducado" se calcula: un presupuesto ENVIADO cuya
 * fecha de validez ya pasó. Los borradores no caducan y los resueltos tampoco.
 */
export function estadoMostrado(
  presupuesto: Pick<Presupuesto, 'estado' | 'fechaValidez'>,
  hoy: string,
): EstadoMostrado {
  if (presupuesto.estado === 'enviado' && presupuesto.fechaValidez < hoy) {
    return 'caducado';
  }
  return presupuesto.estado;
}

/**
 * Transiciones admitidas (flujo flexible): desde Enviado se marca Aceptado o
 * Rechazado, se corrige entre ellos y se vuelve a Enviado. Nunca a Borrador.
 */
export function transicionValida(actual: EstadoPresupuesto, siguiente: EstadoCambiable): boolean {
  if (actual === 'borrador') return false;
  return esEstadoCambiable(siguiente);
}
