import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '../../src/data/store';
import { AppRoutes } from '../../src/router';
import { backend } from '../../src/data/backend';

/** Renderiza la aplicación completa en una ruta con un router de memoria aislado. */
export function renderApp(ruta = '/') {
  return render(
    <StoreProvider>
      <MemoryRouter initialEntries={[ruta]}>
        <AppRoutes />
      </MemoryRouter>
    </StoreProvider>,
  );
}

/** Siembra un perfil de emisor válido. */
export async function sembrarPerfil() {
  return backend.perfil.guardar({ nombre: 'Ana', razonSocial: 'Ana Dev', rfc: 'AADD800101XXX' });
}

/** Siembra un cliente. */
export async function sembrarCliente(nombre: string) {
  return backend.clientes.crear({ nombre });
}

/** Crea y emite un presupuesto con una línea de `precioCentavos`. */
export async function sembrarEmitido(nombreCliente: string, precioCentavos = 100_000) {
  await sembrarPerfil();
  const cliente = await sembrarCliente(nombreCliente);
  const borrador = await backend.presupuestos.crearBorrador({
    clienteId: cliente.id,
    retencionISR: false,
    fechaValidez: '2099-12-31',
    lineas: [
      {
        descripcion: 'Servicio de prueba',
        cantidad: 2,
        unidad: 'servicio',
        precioUnitario: precioCentavos,
        origen: 'manual',
        servicioId: null,
      },
    ],
  });
  return backend.presupuestos.emitir(borrador.id);
}
