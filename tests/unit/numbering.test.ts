import { describe, expect, it } from 'vitest';
import { maxConsecutivoDelAnio, siguienteNumero } from '../../src/domain/numbering';
import type { Presupuesto } from '../../src/domain/types';

function emitido(numero: string): Presupuesto {
  return {
    id: `p-${numero}`,
    estado: 'enviado',
    numero,
    clienteId: 'c1',
    clienteSnapshot: null,
    emisorSnapshot: null,
    lineas: [],
    retencionISR: false,
    fechaEmision: '2026-01-01',
    fechaValidez: '2026-01-31',
    baseCentavos: 0,
    ivaCentavos: 0,
    retencionCentavos: 0,
    totalCentavos: 0,
    creadoEn: '2026-01-01T00:00:00.000Z',
    actualizadoEn: '2026-01-01T00:00:00.000Z',
  };
}

describe('numeración AÑO-NN (FR-008, SC-003)', () => {
  it('el primer presupuesto de un año es AÑO-01', () => {
    expect(siguienteNumero([], 2026, 0)).toBe('2026-01');
  });

  it('genera números consecutivos', () => {
    const presupuestos = [emitido('2026-01'), emitido('2026-02')];
    expect(siguienteNumero(presupuestos, 2026, 2)).toBe('2026-03');
  });

  it('reinicia la cuenta en cada año natural', () => {
    const presupuestos = [emitido('2025-05'), emitido('2025-06')];
    expect(siguienteNumero(presupuestos, 2026, 0)).toBe('2026-01');
  });

  it('no reutiliza un número aunque se elimine el presupuesto (contador persistido)', () => {
    // El presupuesto 2026-02 se eliminó: no queda en la lista, pero el contador sí.
    const presupuestos = [emitido('2026-01')];
    expect(siguienteNumero(presupuestos, 2026, 2)).toBe('2026-03');
  });

  it('ignora números de otros años al calcular el máximo', () => {
    expect(maxConsecutivoDelAnio([emitido('2025-09'), emitido('2026-04')], 2026)).toBe(4);
  });

  it('crece de dígitos cuando supera 99', () => {
    expect(siguienteNumero([emitido('2026-99')], 2026, 99)).toBe('2026-100');
  });
});
