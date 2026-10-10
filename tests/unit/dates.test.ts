import { describe, expect, it } from 'vitest';
import { fechaValidezPorDefecto, formatearFecha, sumarDias } from '../../src/lib/dates';

describe('formato de fechas es-MX', () => {
  it('formatea una fecha ISO (YYYY-MM-DD) como texto es-MX', () => {
    expect(formatearFecha('2026-10-08')).toBe('8 oct 2026');
  });

  it('interpreta una marca de tiempo completa en hora local, sin desfase por UTC', () => {
    const marca = '2026-10-08T23:30:00.000Z';
    const esperado = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(marca));
    expect(formatearFecha(marca)).toBe(esperado);
  });

  it('devuelve un guion para valores vacíos o inválidos', () => {
    expect(formatearFecha(null)).toBe('—');
    expect(formatearFecha('')).toBe('—');
    expect(formatearFecha('no-es-fecha')).toBe('—');
  });

  it('calcula la fecha de validez por defecto a 30 días', () => {
    expect(fechaValidezPorDefecto('2026-10-08')).toBe('2026-11-07');
    expect(sumarDias('2026-01-31', 1)).toBe('2026-02-01');
  });
});
