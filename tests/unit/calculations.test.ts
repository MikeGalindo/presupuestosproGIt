import { describe, expect, it } from 'vitest';
import {
  calcularBaseCentavos,
  calcularIvaCentavos,
  calcularRetencionCentavos,
  calcularTotales,
  importeLineaCentavos,
} from '../../src/domain/calculations';
import { formatearMXN } from '../../src/domain/money';
import type { LineaPresupuesto } from '../../src/domain/types';

function linea(cantidad: number, precioUnitario: number): LineaPresupuesto {
  return {
    id: `l-${cantidad}-${precioUnitario}`,
    descripcion: 'Servicio de prueba',
    cantidad,
    unidad: 'servicio',
    precioUnitario,
    origen: 'manual',
    servicioId: null,
  };
}

describe('cálculo de impuestos y totales (SC-002)', () => {
  it('calcula una línea de 2 × $1,000.00 como $2,000.00', () => {
    expect(importeLineaCentavos(linea(2, 100_000))).toBe(200_000);
  });

  it('con ISR activo: base 2000, IVA 320, ISR 200 y total 2120', () => {
    const lineas = [linea(2, 100_000)];
    const { baseCentavos, ivaCentavos, retencionCentavos, totalCentavos } = calcularTotales(lineas, true);
    expect(formatearMXN(baseCentavos)).toBe('$2,000.00');
    expect(formatearMXN(ivaCentavos)).toBe('$320.00');
    expect(formatearMXN(retencionCentavos)).toBe('$200.00');
    expect(formatearMXN(totalCentavos)).toBe('$2,120.00');
  });

  it('con ISR desactivado: la retención es 0 y el total es 2320', () => {
    const lineas = [linea(2, 100_000)];
    const { retencionCentavos, totalCentavos } = calcularTotales(lineas, false);
    expect(retencionCentavos).toBe(0);
    expect(formatearMXN(totalCentavos)).toBe('$2,320.00');
  });

  it('suma varias líneas en la base imponible', () => {
    expect(calcularBaseCentavos([linea(2, 100_000), linea(1, 50_000)])).toBe(250_000);
  });

  it('permite precio unitario 0 (cortesía) sin romper el cálculo', () => {
    const lineas = [linea(3, 0)];
    const { baseCentavos, ivaCentavos, totalCentavos } = calcularTotales(lineas, false);
    expect(baseCentavos).toBe(0);
    expect(ivaCentavos).toBe(0);
    expect(totalCentavos).toBe(0);
  });

  it('calcula IVA y retención como funciones independientes', () => {
    expect(calcularIvaCentavos(200_000)).toBe(32_000);
    expect(calcularRetencionCentavos(200_000, true)).toBe(20_000);
    expect(calcularRetencionCentavos(200_000, false)).toBe(0);
  });

  it('redondea céntimos de forma consistente (half-up)', () => {
    // 3 × $33.33 = $99.99 exacto; 3 × $33.335 se redondea a centavos.
    expect(importeLineaCentavos(linea(3, 3_333))).toBe(9_999);
    expect(importeLineaCentavos(linea(1, 3_333.5))).toBe(3_334);
  });
});
