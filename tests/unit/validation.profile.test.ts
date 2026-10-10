import { describe, expect, it } from 'vitest';
import { validarEmisor, validarServicio } from '../../src/domain/validation';

describe('validación del perfil del emisor (FR-001, FR-018)', () => {
  it('exige nombre, razón social y RFC', () => {
    const resultado = validarEmisor({ nombre: '', razonSocial: '', rfc: '' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.nombre).toBeDefined();
    expect(resultado.errores.razonSocial).toBeDefined();
    expect(resultado.errores.rfc).toBeDefined();
  });

  it('acepta un emisor completo', () => {
    const resultado = validarEmisor({ nombre: 'Ana', razonSocial: 'Ana Dev', rfc: 'AADD800101XXX' });
    expect(resultado.valido).toBe(true);
  });

  it('valida el correo solo si viene informado', () => {
    expect(validarEmisor({ nombre: 'Ana', razonSocial: 'Ana Dev', rfc: 'X', correo: 'malo' }).valido).toBe(false);
    expect(validarEmisor({ nombre: 'Ana', razonSocial: 'Ana Dev', rfc: 'X', correo: 'ana@dev.mx' }).valido).toBe(true);
  });
});

describe('validación de servicios (FR-003)', () => {
  it('exige el nombre', () => {
    expect(validarServicio({ nombre: '', precioUnitario: 100, unidad: 'hora' }).valido).toBe(false);
  });

  it('exige precio ≥ 0', () => {
    expect(validarServicio({ nombre: 'Diseño', precioUnitario: -1, unidad: 'hora' }).valido).toBe(false);
    expect(validarServicio({ nombre: 'Diseño', precioUnitario: 0, unidad: 'hora' }).valido).toBe(true);
  });

  it('exige una unidad', () => {
    expect(validarServicio({ nombre: 'Diseño', precioUnitario: 100, unidad: '' }).valido).toBe(false);
  });

  it('acepta un servicio válido', () => {
    expect(validarServicio({ nombre: 'Diseño', descripcion: 'Logo', precioUnitario: 150000, unidad: 'proyecto' }).valido).toBe(true);
  });
});
