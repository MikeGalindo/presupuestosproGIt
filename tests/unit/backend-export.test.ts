import { describe, expect, it } from 'vitest';
import { backend } from '../../src/data/backend';
import { CLAVE_ALMACENAMIENTO } from '../../src/data/localStorage';

describe('exportacion.obtenerCopia (operación de solo lectura)', () => {
  it('devuelve el agregado persistido completo', async () => {
    await backend.perfil.guardar({ nombre: 'Ana', razonSocial: 'Ana Dev', rfc: 'AADD800101XXX' });
    await backend.clientes.crear({ nombre: 'Acme' });
    await backend.servicios.crear({ nombre: 'Diseño', precioUnitario: 1000, unidad: 'servicio' });

    const copia = await backend.exportacion.obtenerCopia();
    expect(copia.version).toBe(2);
    expect(copia.perfil?.nombre).toBe('Ana');
    expect(copia.clientes).toHaveLength(1);
    expect(copia.clientes[0]?.nombre).toBe('Acme');
    expect(copia.servicios).toHaveLength(1);
    expect(copia.correlativos).toEqual({});
  });

  it('no modifica localStorage y devuelve una copia independiente', async () => {
    await backend.clientes.crear({ nombre: 'Acme' });
    const antes = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);

    const copia = await backend.exportacion.obtenerCopia();
    copia.clientes.push({
      id: 'x',
      nombre: 'Mutado',
      creadoEn: '',
      actualizadoEn: '',
    });

    expect(window.localStorage.getItem(CLAVE_ALMACENAMIENTO)).toBe(antes);
    const otra = await backend.exportacion.obtenerCopia();
    expect(otra.clientes).toHaveLength(1);
    expect(otra.clientes.some((c) => c.nombre === 'Mutado')).toBe(false);
  });
});
