// Limpieza y normalización de nombres de archivo para la copia exportada —
// contract/export-format.md §3 (FR-005, FR-010).

import type { Presupuesto } from '../domain/types';

/**
 * Sustituye los caracteres conflictivos (`\ / : * ? " < > |` y los de control)
 * por `-`, colapsa espacios repetidos y recorta los extremos. Conserva acentos,
 * letras (incl. ñ) y espacios normales.
 */
export function limpiarNombreArchivo(nombre: string): string {
  return nombre
    .replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Nombre del PDF dentro de la copia: `«número» - «cliente».pdf`
 * (p. ej. `2026-001 - Diseño-Web S.L..pdf`). Distinto del nombre de la
 * descarga individual (`nombreArchivoPdf`).
 */
export function nombrePdfCopia(presupuesto: Presupuesto): string {
  const numero = presupuesto.numero ?? 'borrador';
  const cliente = limpiarNombreArchivo(presupuesto.clienteSnapshot?.nombre ?? 'cliente');
  return `${numero} - ${cliente}.pdf`;
}
