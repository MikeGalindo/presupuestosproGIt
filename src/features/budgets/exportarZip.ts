// Orquestación de la exportación «Exportar todo (.zip)» — FR-001…FR-006, FR-017.
// Reutiliza el PDF de la app (identidad por construcción) y arma el contenedor
// con el escritor propio de `src/lib/zip.ts`. La operación es de solo lectura.

import type { Presupuesto } from '../../domain/types';
import type { CopiaExportada } from '../../domain/copia';
import { crearZip, type EntradaZip } from '../../lib/zip';
import { nombrePdfCopia } from '../../lib/archivos';
import { hoyISO } from '../../lib/dates';
import { generarPdfBlob } from '../pdf/download';

/** Nombre del archivo contenedor: `presupuestospro-copia-AAAA-MM-DD.zip` — FR-002. */
export function nombreZipCopia(): string {
  return `presupuestospro-copia-${hoyISO()}.zip`;
}

/** Progreso de la exportación: PDFs ya generados sobre el total a generar. */
export interface ProgresoExportacion {
  hechos: number;
  total: number;
}

const NOMBRE_DATOS = 'presupuestospro-datos.json';

/**
 * Construye en memoria el `.zip` de la copia: un PDF por presupuesto emitido
 * (`generarPdfBlob` + `nombrePdfCopia`) y un único archivo de datos JSON.
 * Notifica el progreso «x de N» a medida que genera cada PDF.
 */
export async function construirZipCopia(
  presupuestos: Presupuesto[],
  copia: CopiaExportada,
  onProgreso?: (progreso: ProgresoExportacion) => void,
): Promise<Blob> {
  const entradas: EntradaZip[] = [];
  const total = presupuestos.length;
  let hechos = 0;

  for (const presupuesto of presupuestos) {
    const blob = await generarPdfBlob(presupuesto);
    entradas.push({
      nombre: nombrePdfCopia(presupuesto),
      datos: new Uint8Array(await blob.arrayBuffer()),
    });
    hechos += 1;
    onProgreso?.({ hechos, total });
  }

  entradas.push({
    nombre: NOMBRE_DATOS,
    datos: new TextEncoder().encode(JSON.stringify(copia, null, 2)),
  });

  return crearZip(entradas);
}
