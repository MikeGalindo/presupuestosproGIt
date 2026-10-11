import { describe, expect, it } from 'vitest';
import type { Presupuesto } from '../../src/domain/types';
import { limpiarNombreArchivo, nombrePdfCopia } from '../../src/lib/archivos';

function presupuesto(parcial: Partial<Presupuesto>): Presupuesto {
  return {
    id: 'p1',
    estado: 'enviado',
    numero: '2026-001',
    clienteId: 'c1',
    clienteSnapshot: { nombre: 'Estudio García' },
    emisorSnapshot: null,
    lineas: [],
    retencionISR: false,
    fechaEmision: '2026-01-01',
    fechaValidez: '2026-12-31',
    baseCentavos: 0,
    ivaCentavos: 0,
    retencionCentavos: 0,
    totalCentavos: 0,
    creadoEn: '',
    actualizadoEn: '',
    ...parcial,
  };
}

describe('limpieza de nombres de archivo', () => {
  it('sustituye los caracteres conflictivos por guiones', () => {
    expect(limpiarNombreArchivo('Diseño/Web S.L.')).toBe('Diseño-Web S.L.');
    expect(limpiarNombreArchivo('a\\b:c*d?e"f<g>h|i')).toBe('a-b-c-d-e-f-g-h-i');
  });

  it('conserva acentos, ñ y espacios normales; colapsa y recorta espacios', () => {
    expect(limpiarNombreArchivo('  Niño   Pérez  ')).toBe('Niño Pérez');
  });

  it('elimina caracteres de control', () => {
    expect(limpiarNombreArchivo('linea\u0001con\u007ftrol')).toBe('linea-con-trol');
  });
});

describe('nombre del PDF dentro de la copia', () => {
  it('usa el formato «número - cliente».pdf con limpieza', () => {
    const p = presupuesto({ clienteSnapshot: { nombre: 'Diseño/Web S.L.' } });
    expect(nombrePdfCopia(p)).toBe('2026-001 - Diseño-Web S.L..pdf');
  });

  it('conserva acentos y espacios en el nombre del cliente', () => {
    const p = presupuesto({ clienteSnapshot: { nombre: 'Estudio García' } });
    expect(nombrePdfCopia(p)).toBe('2026-001 - Estudio García.pdf');
  });

  it('usa "cliente" cuando no hay snapshot', () => {
    const p = presupuesto({ clienteSnapshot: null });
    expect(nombrePdfCopia(p)).toBe('2026-001 - cliente.pdf');
  });

  it('usa "borrador" cuando no hay número', () => {
    const p = presupuesto({ numero: null });
    expect(nombrePdfCopia(p)).toBe('borrador - Estudio García.pdf');
  });
});
