import { describe, expect, it } from 'vitest';
import { estadoMostrado, ETIQUETAS_ESTADO, transicionValida } from '../../src/domain/estados';
import type { EstadoPresupuesto } from '../../src/domain/types';

function presupuesto(estado: EstadoPresupuesto, fechaValidez: string) {
  return { estado, fechaValidez };
}

describe('estados del presupuesto (FR-011…FR-013)', () => {
  const hoy = '2026-06-01';

  it('calcula Caducado solo para un Enviado con la validez vencida', () => {
    expect(estadoMostrado(presupuesto('enviado', '2026-05-31'), hoy)).toBe('caducado');
    expect(estadoMostrado(presupuesto('enviado', '2026-06-02'), hoy)).toBe('enviado');
    expect(estadoMostrado(presupuesto('aceptado', '2026-05-31'), hoy)).toBe('aceptado');
    expect(estadoMostrado(presupuesto('rechazado', '2026-05-31'), hoy)).toBe('rechazado');
    expect(estadoMostrado(presupuesto('borrador', '2026-05-31'), hoy)).toBe('borrador');
  });

  it('admite el flujo flexible y prohíbe volver a Borrador', () => {
    expect(transicionValida('enviado', 'aceptado')).toBe(true);
    expect(transicionValida('enviado', 'rechazado')).toBe(true);
    expect(transicionValida('aceptado', 'enviado')).toBe(true);
    expect(transicionValida('rechazado', 'aceptado')).toBe(true);
    expect(transicionValida('borrador', 'enviado')).toBe(false);
  });

  it('define etiquetas en es-MX para los cinco estados', () => {
    expect(ETIQUETAS_ESTADO).toEqual({
      borrador: 'Borrador',
      enviado: 'Enviado',
      aceptado: 'Aceptado',
      rechazado: 'Rechazado',
      caducado: 'Caducado',
    });
  });
});
