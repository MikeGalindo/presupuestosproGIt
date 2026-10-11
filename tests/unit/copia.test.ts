import { describe, expect, it } from 'vitest';
import type { Agregado } from '../../src/domain/types';
import { crearCopia } from '../../src/domain/copia';

const agregado: Agregado = {
  version: 2,
  perfil: {
    id: 'perfil-1',
    nombre: 'Ana',
    razonSocial: 'Ana Dev',
    rfc: 'AADD800101XXX',
    logo: 'data:image/png;base64,AAAA',
    actualizadoEn: '2026-01-01T00:00:00.000Z',
  },
  clientes: [
    { id: 'c1', nombre: 'Acme', creadoEn: '', actualizadoEn: '' },
  ],
  servicios: [
    { id: 's1', nombre: 'Diseño', precioUnitario: 100_000, unidad: 'servicio', creadoEn: '', actualizadoEn: '' },
  ],
  presupuestos: [
    {
      id: 'p1',
      estado: 'enviado',
      numero: '2026-001',
      clienteId: 'c1',
      clienteSnapshot: { nombre: 'Acme' },
      emisorSnapshot: null,
      lineas: [],
      retencionISR: false,
      fechaEmision: '2026-01-01',
      fechaValidez: '2026-12-31',
      baseCentavos: 200_000,
      ivaCentavos: 32_000,
      retencionCentavos: 0,
      totalCentavos: 232_000,
      creadoEn: '',
      actualizadoEn: '',
    },
  ],
  correlativos: { '2026': 1 },
};

describe('crearCopia (completitud de la copia)', () => {
  it('conserva version, exportadoEn, perfil (con logo), clientes, servicios, presupuestos y correlativos', () => {
    const copia = crearCopia(agregado, '2026-10-10T18:30:00.000Z');

    expect(copia.version).toBe(2);
    expect(copia.exportadoEn).toBe('2026-10-10T18:30:00.000Z');
    expect(copia.perfil?.logo).toBe('data:image/png;base64,AAAA');
    expect(copia.clientes).toEqual(agregado.clientes);
    expect(copia.servicios).toEqual(agregado.servicios);
    expect(copia.presupuestos).toEqual(agregado.presupuestos);
    expect(copia.correlativos).toEqual({ '2026': 1 });
  });

  it('admite un perfil nulo y catálogos vacíos', () => {
    const vacio: Agregado = {
      version: 2,
      perfil: null,
      clientes: [],
      servicios: [],
      presupuestos: [],
      correlativos: {},
    };
    const copia = crearCopia(vacio, '2026-10-10T00:00:00.000Z');
    expect(copia.perfil).toBeNull();
    expect(copia.clientes).toEqual([]);
    expect(copia.servicios).toEqual([]);
    expect(copia.presupuestos).toEqual([]);
    expect(copia.correlativos).toEqual({});
  });
});
