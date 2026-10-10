import { describe, expect, it } from 'vitest';
import { resumenActividad } from '../../src/features/home/resumen';
import type { Presupuesto } from '../../src/domain/types';

function presupuesto(estado: Presupuesto['estado'], fechaValidez: string): Presupuesto {
  return {
    id: `p-${estado}-${fechaValidez}`,
    estado,
    numero: estado === 'borrador' ? null : '2026-01',
    clienteId: 'c1',
    clienteSnapshot: null,
    emisorSnapshot: null,
    lineas: [],
    retencionISR: false,
    fechaEmision: '2026-01-01',
    fechaValidez,
    baseCentavos: 0,
    ivaCentavos: 0,
    retencionCentavos: 0,
    totalCentavos: 0,
    creadoEn: '2026-01-01T00:00:00.000Z',
    actualizadoEn: '2026-01-01T00:00:00.000Z',
  };
}

describe('resumenActividad (FR-003)', () => {
  const hoy = '2026-06-01';

  it('cuenta los presupuestos por estado persistido', () => {
    const resumen = resumenActividad(
      [
        presupuesto('borrador', '2099-12-31'),
        presupuesto('enviado', '2099-12-31'),
        presupuesto('aceptado', '2099-12-31'),
        presupuesto('rechazado', '2099-12-31'),
      ],
      2,
      3,
      hoy,
    );

    expect(resumen.porEstado.borrador).toBe(1);
    expect(resumen.porEstado.enviado).toBe(1);
    expect(resumen.porEstado.aceptado).toBe(1);
    expect(resumen.porEstado.rechazado).toBe(1);
    expect(resumen.porEstado.caducado).toBe(0);
    expect(resumen.clientes).toBe(2);
    expect(resumen.servicios).toBe(3);
  });

  it('cuenta como Caducado un Enviado con la validez vencida', () => {
    const resumen = resumenActividad(
      [presupuesto('enviado', '2026-05-31')],
      0,
      0,
      hoy,
    );

    expect(resumen.porEstado.caducado).toBe(1);
    expect(resumen.porEstado.enviado).toBe(0);
  });

  it('no marca Caducado a un Aceptado ni a un Borrador vencidos', () => {
    const resumen = resumenActividad(
      [presupuesto('aceptado', '2026-05-31'), presupuesto('borrador', '2026-05-31')],
      0,
      0,
      hoy,
    );

    expect(resumen.porEstado.aceptado).toBe(1);
    expect(resumen.porEstado.borrador).toBe(1);
    expect(resumen.porEstado.caducado).toBe(0);
  });
});
