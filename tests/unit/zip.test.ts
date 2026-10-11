import { describe, expect, it } from 'vitest';
import { crearZip, crc32, type EntradaZip } from '../../src/lib/zip';

const encoder = new TextEncoder();

function bytes(texto: string): Uint8Array {
  return encoder.encode(texto);
}

/** Lee un Blob como bytes (jsdom no implementa `Blob.arrayBuffer`). */
function blobABytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(new Uint8Array(lector.result as ArrayBuffer));
    lector.onerror = () => rechazar(lector.error);
    lector.readAsArrayBuffer(blob);
  });
}

/**
 * Lector ZIP mínimo para las pruebas: recorre el directorio central y extrae el
 * contenido de cada entrada (método *store*, sin compresión).
 */
function leerZip(contenido: Uint8Array): Map<string, Uint8Array> {
  const vista = new DataView(contenido.buffer, contenido.byteOffset, contenido.byteLength);
  let eocd = -1;
  for (let i = contenido.length - 22; i >= 0; i -= 1) {
    if (vista.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  expect(eocd).toBeGreaterThanOrEqual(0);

  const total = vista.getUint16(eocd + 10, true);
  let puntero = vista.getUint32(eocd + 16, true);
  const entradas = new Map<string, Uint8Array>();

  for (let i = 0; i < total; i += 1) {
    expect(vista.getUint32(puntero, true)).toBe(0x02014b50);
    const nombreLen = vista.getUint16(puntero + 28, true);
    const extraLen = vista.getUint16(puntero + 30, true);
    const comentarioLen = vista.getUint16(puntero + 32, true);
    const offsetLocal = vista.getUint32(puntero + 42, true);
    const nombre = new TextDecoder().decode(
      contenido.subarray(puntero + 46, puntero + 46 + nombreLen),
    );

    expect(vista.getUint32(offsetLocal, true)).toBe(0x04034b50);
    const lNombreLen = vista.getUint16(offsetLocal + 26, true);
    const lExtraLen = vista.getUint16(offsetLocal + 28, true);
    const tamano = vista.getUint32(offsetLocal + 18, true);
    const inicioDatos = offsetLocal + 30 + lNombreLen + lExtraLen;
    entradas.set(nombre, contenido.subarray(inicioDatos, inicioDatos + tamano));

    puntero += 46 + nombreLen + extraLen + comentarioLen;
  }
  return entradas;
}

describe('escritor ZIP (método store + CRC-32)', () => {
  it('calcula el CRC-32 estándar', () => {
    // Vector conocido: CRC-32 de "123456789" = 0xCBF43926.
    expect(crc32(bytes('123456789'))).toBe(0xcbf43926);
  });

  it('produce un .zip válido con round-trip de contenido', async () => {
    const entradas: EntradaZip[] = [
      { nombre: 'Diseño-Web.json', datos: bytes('{"clave":"valor áéíñ"}') },
      { nombre: 'datos.pdf', datos: new Uint8Array([0, 1, 2, 253, 254, 255]) },
    ];

    const blob = crearZip(entradas);
    expect(blob.type).toBe('application/zip');

    const leido = leerZip(await blobABytes(crearZip(entradas)));
    expect(leido.size).toBe(2);
    expect(new TextDecoder().decode(leido.get('Diseño-Web.json'))).toBe('{"clave":"valor áéíñ"}');
    expect(Array.from(leido.get('datos.pdf') ?? [])).toEqual([0, 1, 2, 253, 254, 255]);
  });

  it('escribe las firmas de cabecera local, directorio central y EOCD', async () => {
    const bytesZip = await blobABytes(crearZip([{ nombre: 'a.txt', datos: bytes('hola') }]));
    const vista = new DataView(bytesZip.buffer);
    expect(vista.getUint32(0, true)).toBe(0x04034b50);

    const contiene = (firma: number) => {
      for (let i = 0; i + 4 <= bytesZip.length; i += 1) {
        if (vista.getUint32(i, true) === firma) return true;
      }
      return false;
    };
    expect(contiene(0x02014b50)).toBe(true);
    expect(contiene(0x06054b50)).toBe(true);
  });
});
