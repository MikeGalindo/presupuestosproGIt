// Vista exportable (copia de los datos) — no persistida, solo lectura.
// plan.md (Decisión 3), data-model.md, contracts/export-format.md §4.

import type { Agregado } from './types';

/**
 * Copia fiel del agregado persistido más los metadatos de la exportación.
 * Pensada para una futura importación/restauración.
 */
export interface CopiaExportada extends Agregado {
  /** Marca temporal (ISO) del momento de la exportación. */
  exportadoEn: string;
}

/**
 * Construye la copia exportable a partir del agregado y la marca de tiempo.
 * Incluye `version`, `exportadoEn`, `perfil` (con `logo`), `clientes`,
 * `servicios`, `presupuestos` y `correlativos` — FR-006.
 */
export function crearCopia(agregado: Agregado, exportadoEn: string): CopiaExportada {
  return {
    version: agregado.version,
    exportadoEn,
    perfil: agregado.perfil,
    clientes: agregado.clientes,
    servicios: agregado.servicios,
    presupuestos: agregado.presupuestos,
    correlativos: agregado.correlativos,
  };
}
