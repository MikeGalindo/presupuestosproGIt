import { describe, expect, it } from 'vitest';
import { validarCliente } from '../../src/domain/validation';

describe('validación de clientes (FR-002)', () => {
  it('exige el nombre / razón social', () => {
    const resultado = validarCliente({ nombre: '   ' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.nombre).toBeDefined();
  });

  it('acepta solo el nombre y deja RFC/correo/teléfono/dirección opcionales', () => {
    const resultado = validarCliente({ nombre: 'Cliente Demo' });
    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toEqual({});
  });

  it('valida el formato del correo cuando existe', () => {
    expect(validarCliente({ nombre: 'Cliente', correo: 'no-es-correo' }).valido).toBe(false);
    expect(validarCliente({ nombre: 'Cliente', correo: 'cliente@dominio.mx' }).valido).toBe(true);
  });

  it('no exige correo si está vacío', () => {
    expect(validarCliente({ nombre: 'Cliente', correo: '' }).valido).toBe(true);
  });
});
