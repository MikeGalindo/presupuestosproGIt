// Descarga del PDF generado en el cliente, sin diálogos adicionales — FR-010, Principio VII.

import { createElement } from 'react';
import type { Presupuesto } from '../../domain/types';

/** Nombre de archivo sugerido para el PDF de un presupuesto. */
export function nombreArchivoPdf(presupuesto: Presupuesto): string {
  const numero = presupuesto.numero ?? 'borrador';
  const cliente = (presupuesto.clienteSnapshot?.nombre ?? 'cliente').replace(/[^\p{L}\p{N}]+/gu, '-');
  return `Presupuesto-${numero}-${cliente}.pdf`;
}

/**
 * Genera el PDF en el cliente y lo descarga directamente.
 * Importa `@react-pdf/renderer` de forma diferida para no cargarlo en pantallas que no lo usan.
 */
export async function descargarPdf(presupuesto: Presupuesto): Promise<void> {
  const [{ pdf }, { BudgetDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./BudgetDocument'),
  ]);
  const elemento = createElement(BudgetDocument, { presupuesto }) as unknown as Parameters<typeof pdf>[0];
  const blob = await pdf(elemento).toBlob();
  descargarBlob(blob, nombreArchivoPdf(presupuesto));
}

function descargarBlob(blob: Blob, nombreArchivo: string): void {
  if (typeof URL.createObjectURL !== 'function') {
    return;
  }
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.rel = 'noopener';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  if (typeof URL.revokeObjectURL === 'function') {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
