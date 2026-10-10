// Adaptador de persistencia versionado sobre localStorage.
// Nadie fuera de `data/` conoce esta implementación (Principio IX).

import type { Agregado, EstadoPresupuesto, Presupuesto } from '../domain/types';
import { esEstadoValido } from '../domain/estados';

export const CLAVE_ALMACENAMIENTO = 'presupuestospro:v1';
export const VERSION_AGREGADO = 2;

/** Agregado inicial vacío. */
export function agregadoVacio(): Agregado {
  return {
    version: VERSION_AGREGADO,
    perfil: null,
    clientes: [],
    servicios: [],
    presupuestos: [],
    correlativos: {},
  };
}

/**
 * Migra un presupuesto almacenado a la versión actual del modelo.
 * Equivalencia de la spec 001: `emitido` → `enviado`. Valores inválidos → `borrador`.
 */
function migrarPresupuesto(crudo: unknown): Presupuesto {
  const p = (crudo ?? {}) as Omit<Presupuesto, 'estado'> & { estado: unknown };
  const bruto = p.estado;
  const estado: EstadoPresupuesto =
    bruto === 'emitido' ? 'enviado' : esEstadoValido(bruto) ? bruto : 'borrador';
  return { ...p, estado } as Presupuesto;
}

function normalizar(parcial: Partial<Agregado> | null | undefined): Agregado {
  const base = agregadoVacio();
  if (!parcial || typeof parcial !== 'object') return base;
  return {
    version: VERSION_AGREGADO,
    perfil: parcial.perfil ?? null,
    clientes: Array.isArray(parcial.clientes) ? parcial.clientes : [],
    servicios: Array.isArray(parcial.servicios) ? parcial.servicios : [],
    presupuestos: Array.isArray(parcial.presupuestos)
      ? parcial.presupuestos.map(migrarPresupuesto)
      : [],
    correlativos:
      parcial.correlativos && typeof parcial.correlativos === 'object' ? parcial.correlativos : {},
  };
}

/**
 * Lee el agregado persistido. Devuelve un agregado vacío si no hay datos.
 * Lanza si el contenido está corrupto (el backend lo traduce a `ALMACENAMIENTO`).
 */
export function leerAgregado(): Agregado {
  const crudo = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
  if (crudo === null) return agregadoVacio();
  const parseado = JSON.parse(crudo) as Partial<Agregado>;
  return normalizar(parseado);
}

/** Escribe el agregado completo bajo la clave versionada. */
export function escribirAgregado(agregado: Agregado): void {
  window.localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(agregado));
}

/** Borra todos los datos persistidos (útil en pruebas). */
export function limpiarAlmacenamiento(): void {
  window.localStorage.removeItem(CLAVE_ALMACENAMIENTO);
}
