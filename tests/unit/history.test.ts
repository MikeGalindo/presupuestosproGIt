import { beforeEach, describe, expect, it } from 'vitest';
import { backend } from '../../src/data/backend';
import { limpiarAlmacenamiento } from '../../src/data/localStorage';

async function sembrarEmitido(nombreCliente: string) {
  await backend.perfil.guardar({ nombre: 'Ana', razonSocial: 'Ana Dev', rfc: 'AADD800101XXX' });
  const cliente = await backend.clientes.crear({ nombre: nombreCliente, rfc: 'XAXX010101000' });
  const borrador = await backend.presupuestos.crearBorrador({
    clienteId: cliente.id,
    retencionISR: false,
    fechaValidez: '2099-12-31',
    lineas: [
      {
        descripcion: 'Servicio',
        cantidad: 2,
        unidad: 'servicio',
        precioUnitario: 100_000,
        origen: 'manual',
        servicioId: null,
      },
    ],
  });
  return backend.presupuestos.emitir(borrador.id);
}

describe('historial de emitidos y snapshot inmutable (FR-012, FR-013)', () => {
  beforeEach(() => {
    limpiarAlmacenamiento();
  });

  it('separa borradores de emitidos', async () => {
    await sembrarEmitido('Cliente Uno');
    const borradores = await backend.presupuestos.listarBorradores();
    const emitidos = await backend.presupuestos.listarEmitidos();
    expect(borradores).toHaveLength(0);
    expect(emitidos).toHaveLength(1);
    expect(emitidos[0]?.numero).toBe(`${new Date().getFullYear()}-01`);
  });

  it('conserva el snapshot del cliente aunque luego se edite o elimine', async () => {
    const emitido = await sembrarEmitido('Cliente Original');
    expect(emitido.clienteSnapshot?.nombre).toBe('Cliente Original');

    await backend.clientes.actualizar(emitido.clienteId, { nombre: 'Cliente Renombrado' });
    const trasEditar = await backend.presupuestos.obtener(emitido.id);
    expect(trasEditar.clienteSnapshot?.nombre).toBe('Cliente Original');

    await backend.clientes.eliminar(emitido.clienteId);
    const trasEliminar = await backend.presupuestos.obtener(emitido.id);
    expect(trasEliminar.clienteSnapshot?.nombre).toBe('Cliente Original');
    expect(trasEliminar.estado).toBe('enviado');
  });

  it('no reutiliza el número tras eliminar un presupuesto emitido', async () => {
    const primero = await sembrarEmitido('Cliente Uno');
    await backend.presupuestos.eliminar(primero.id);
    const segundo = await sembrarEmitido('Cliente Dos');
    const anio = new Date().getFullYear();
    expect(segundo.numero).toBe(`${anio}-02`);
  });
});
