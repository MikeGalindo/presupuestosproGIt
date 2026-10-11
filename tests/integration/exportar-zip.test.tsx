import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderApp, sembrarCliente, sembrarEmitido, sembrarPerfil } from './utils';
import { backend } from '../../src/data/backend';

const hoisted = vi.hoisted(() => {
  const encoder = new TextEncoder();
  return {
    // Cola de resoluciones controlables para observar el progreso «x de N».
    pendientes: [] as Array<() => void>,
    fakePdf: (contenido: string) => {
      const bytes = encoder.encode(contenido);
      return { arrayBuffer: async () => bytes.buffer } as unknown as Blob;
    },
    generarPdfBlob: vi.fn(),
    descargarBlob: vi.fn(),
  };
});

vi.mock('../../src/features/pdf/download', () => ({
  generarPdfBlob: hoisted.generarPdfBlob,
  descargarBlob: hoisted.descargarBlob,
  descargarPdf: vi.fn(),
  nombreArchivoPdf: () => 'presupuesto.pdf',
}));

import { descargarBlob } from '../../src/features/pdf/download';

function blobABytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(new Uint8Array(lector.result as ArrayBuffer));
    lector.onerror = () => rechazar(lector.error);
    lector.readAsArrayBuffer(blob);
  });
}

/** Lector ZIP mínimo para inspeccionar las entradas descargadas. */
async function leerEntradas(blob: Blob): Promise<Map<string, Uint8Array>> {
  const bytes = await blobABytes(blob);
  const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i -= 1) {
    if (vista.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  const total = vista.getUint16(eocd + 10, true);
  let puntero = vista.getUint32(eocd + 16, true);
  const entradas = new Map<string, Uint8Array>();
  for (let i = 0; i < total; i += 1) {
    const nombreLen = vista.getUint16(puntero + 28, true);
    const extraLen = vista.getUint16(puntero + 30, true);
    const comentarioLen = vista.getUint16(puntero + 32, true);
    const offsetLocal = vista.getUint32(puntero + 42, true);
    const nombre = new TextDecoder().decode(bytes.subarray(puntero + 46, puntero + 46 + nombreLen));
    const lNombreLen = vista.getUint16(offsetLocal + 26, true);
    const lExtraLen = vista.getUint16(offsetLocal + 28, true);
    const tamano = vista.getUint32(offsetLocal + 18, true);
    const inicio = offsetLocal + 30 + lNombreLen + lExtraLen;
    entradas.set(nombre, bytes.subarray(inicio, inicio + tamano));
    puntero += 46 + nombreLen + extraLen + comentarioLen;
  }
  return entradas;
}

const descargarBlobMock = vi.mocked(descargarBlob);

beforeEach(() => {
  hoisted.pendientes.length = 0;
  hoisted.descargarBlob.mockClear();
  hoisted.generarPdfBlob.mockReset();
  hoisted.generarPdfBlob.mockImplementation(async (p: { numero: string | null }) =>
    hoisted.fakePdf(`PDF:${p.numero}`),
  );
});

describe('US1 — exportar todo en un único .zip', () => {
  it('descarga un .zip con un PDF por emitido y un archivo de datos (sin borradores)', async () => {
    const cliente = await sembrarCliente('Cliente Borrador');
    const primero = await sembrarEmitido('Cliente Uno');
    const segundo = await sembrarEmitido('Diseño/Web S.L.');
    const tercero = await sembrarEmitido('Cliente Tres');
    // Borrador que NO debe aparecer.
    await backend.presupuestos.crearBorrador({
      clienteId: cliente.id,
      retencionISR: false,
      fechaValidez: '2099-12-31',
      lineas: [],
    });

    const usuario = userEvent.setup();
    renderApp('/presupuestos');
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });

    await usuario.click(screen.getByRole('button', { name: /exportar todo/i }));

    await waitFor(() => expect(descargarBlobMock).toHaveBeenCalledTimes(1));
    const [blob, nombre] = descargarBlobMock.mock.calls[0]!;
    expect(nombre).toMatch(/^presupuestospro-copia-\d{4}-\d{2}-\d{2}\.zip$/);

    const entradas = await leerEntradas(blob as Blob);
    // Un único archivo de datos.
    expect(entradas.has('presupuestospro-datos.json')).toBe(true);
    // Un PDF por emitido, con el nombre «número - cliente».
    expect(entradas.has(`${primero.numero} - Cliente Uno.pdf`)).toBe(true);
    expect(entradas.has(`${segundo.numero} - Diseño-Web S.L..pdf`)).toBe(true);
    expect(entradas.has(`${tercero.numero} - Cliente Tres.pdf`)).toBe(true);
    // El borrador no aparece.
    expect([...entradas.keys()].some((n) => n.startsWith('borrador'))).toBe(false);
    // Identidad del PDF: el contenido es el que produce generarPdfBlob.
    expect(new TextDecoder().decode(entradas.get(`${primero.numero} - Cliente Uno.pdf`))).toBe(
      `PDF:${primero.numero}`,
    );
  });

  it('incluye el archivo de datos completo (US2)', async () => {
    await sembrarPerfil();
    await sembrarEmitido('Cliente Uno');

    const usuario = userEvent.setup();
    renderApp('/presupuestos');
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });
    await usuario.click(screen.getByRole('button', { name: /exportar todo/i }));

    await waitFor(() => expect(descargarBlobMock).toHaveBeenCalledTimes(1));
    const [blob] = descargarBlobMock.mock.calls[0]!;
    const entradas = await leerEntradas(blob as Blob);
    const datos = JSON.parse(new TextDecoder().decode(entradas.get('presupuestospro-datos.json'))) as Record<
      string,
      unknown
    >;

    expect(datos.version).toBe(2);
    expect(typeof datos.exportadoEn).toBe('string');
    expect(datos.perfil).not.toBeNull();
    expect(Array.isArray(datos.clientes)).toBe(true);
    expect(Array.isArray(datos.servicios)).toBe(true);
    expect(Array.isArray(datos.presupuestos)).toBe(true);
    expect(datos.correlativos).toBeTypeOf('object');
  });
});

describe('US3 — exportación clara y bajo control', () => {
  it('sin emitidos avisa y no descarga nada', async () => {
    const usuario = userEvent.setup();
    renderApp('/presupuestos');
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });

    await usuario.click(screen.getByRole('button', { name: /exportar todo/i }));

    expect(await screen.findByText(/no hay presupuestos emitidos/i)).toBeInTheDocument();
    expect(descargarBlobMock).not.toHaveBeenCalled();
  });

  it('muestra el progreso «x de N» y bloquea el botón durante la operación', async () => {
    await sembrarEmitido('Cliente Uno');
    await sembrarEmitido('Cliente Dos');

    hoisted.generarPdfBlob.mockImplementation(
      (p: { numero: string | null }) =>
        new Promise<Blob>((resolver) => {
          hoisted.pendientes.push(() => resolver(hoisted.fakePdf(`PDF:${p.numero}`)));
        }),
    );

    const usuario = userEvent.setup();
    renderApp('/presupuestos');
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });

    const boton = screen.getByRole('button', { name: /exportar todo/i });
    await usuario.click(boton);

    expect(boton).toBeDisabled();
    await waitFor(() => expect(hoisted.pendientes).toHaveLength(1));
    expect(screen.getByText(/Generando 0 de 2/)).toBeInTheDocument();

    hoisted.pendientes[0]!();
    await waitFor(() => expect(hoisted.pendientes).toHaveLength(2));
    expect(screen.getByText(/Generando 1 de 2/)).toBeInTheDocument();

    hoisted.pendientes[1]!();
    await waitFor(() => expect(descargarBlobMock).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: /exportar todo/i })).toBeEnabled();
  });

  it('aborta sin descargar si falla la generación de un PDF', async () => {
    await sembrarEmitido('Cliente Uno');
    hoisted.generarPdfBlob.mockRejectedValue(new Error('Fallo al generar el PDF'));

    const usuario = userEvent.setup();
    renderApp('/presupuestos');
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });

    await usuario.click(screen.getByRole('button', { name: /exportar todo/i }));

    expect(await screen.findByText(/fallo al generar el pdf/i)).toBeInTheDocument();
    expect(descargarBlobMock).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /exportar todo/i })).toBeEnabled();
  });
});
