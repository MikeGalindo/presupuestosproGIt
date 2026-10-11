// Escritor ZIP mínimo en el cliente (método *store* + CRC-32), sin dependencias —
// Principio I, plan.md (Decisión 1), contracts/export-format.md.
// Nombres codificados en UTF-8 (bit 11 de las *general purpose flags*).

const encoder = new TextEncoder();

/** Tabla precalculada de CRC-32 con el polinomio reflejado 0xEDB88320. */
const TABLA_CRC: Uint32Array = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

/** Calcula el CRC-32 de un bloque de bytes (estándar usado por ZIP). */
export function crc32(datos: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < datos.length; i += 1) {
    crc = (TABLA_CRC[(crc ^ datos[i]!) & 0xff]! ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Una entrada del `.zip`: nombre (ruta plana) y contenido sin comprimir. */
export interface EntradaZip {
  nombre: string;
  datos: Uint8Array;
}

function bytes16(valor: number): Uint8Array {
  const salida = new Uint8Array(2);
  new DataView(salida.buffer).setUint16(0, valor & 0xffff, true);
  return salida;
}

function bytes32(valor: number): Uint8Array {
  const salida = new Uint8Array(4);
  new DataView(salida.buffer).setUint32(0, valor >>> 0, true);
  return salida;
}

function concatenar(partes: Uint8Array[]): Uint8Array {
  const total = partes.reduce((suma, parte) => suma + parte.length, 0);
  const salida = new Uint8Array(total);
  let posicion = 0;
  for (const parte of partes) {
    salida.set(parte, posicion);
    posicion += parte.length;
  }
  return salida;
}

/** Hora en formato MS-DOS (2 bytes) usada por las cabeceras ZIP. */
function horaMSDOS(fecha: Date): number {
  return (fecha.getHours() << 11) | (fecha.getMinutes() << 5) | (fecha.getSeconds() >> 1);
}

/** Fecha en formato MS-DOS (2 bytes) usada por las cabeceras ZIP. */
function fechaMSDOS(fecha: Date): number {
  const anio = Math.max(1980, fecha.getFullYear());
  return ((anio - 1980) << 9) | ((fecha.getMonth() + 1) << 5) | fecha.getDate();
}

/**
 * Empaqueta las entradas en un `.zip` con método *store* (sin compresión).
 * Genera cabeceras locales, directorio central y registro EOCD. Sin carpetas.
 */
export function crearZip(entradas: EntradaZip[]): Blob {
  const ahora = new Date();
  const hora = horaMSDOS(ahora);
  const fecha = fechaMSDOS(ahora);

  const locales: Uint8Array[] = [];
  const centrales: Uint8Array[] = [];
  let offset = 0;

  for (const entrada of entradas) {
    const nombre = encoder.encode(entrada.nombre);
    const crc = crc32(entrada.datos);
    const tamano = entrada.datos.length;

    const cabeceraLocal = concatenar([
      bytes32(0x04034b50), // firma de cabecera local
      bytes16(20), // versión necesaria para extraer
      bytes16(0x0800), // bit 11: nombres en UTF-8
      bytes16(0), // método: store
      bytes16(hora),
      bytes16(fecha),
      bytes32(crc),
      bytes32(tamano), // tamaño comprimido
      bytes32(tamano), // tamaño sin comprimir
      bytes16(nombre.length),
      bytes16(0), // longitud del campo extra
      nombre,
    ]);
    locales.push(cabeceraLocal, entrada.datos);

    const entradaCentral = concatenar([
      bytes32(0x02014b50), // firma del directorio central
      bytes16(20), // versión de creación
      bytes16(20), // versión necesaria
      bytes16(0x0800),
      bytes16(0),
      bytes16(hora),
      bytes16(fecha),
      bytes32(crc),
      bytes32(tamano),
      bytes32(tamano),
      bytes16(nombre.length),
      bytes16(0), // campo extra
      bytes16(0), // comentario
      bytes16(0), // disco de inicio
      bytes16(0), // atributos internos
      bytes32(0), // atributos externos
      bytes32(offset), // offset de la cabecera local
      nombre,
    ]);
    centrales.push(entradaCentral);

    offset += cabeceraLocal.length + tamano;
  }

  const tamanoCentral = centrales.reduce((suma, parte) => suma + parte.length, 0);

  const eocd = concatenar([
    bytes32(0x06054b50), // firma EOCD
    bytes16(0), // número de disco
    bytes16(0), // disco del directorio central
    bytes16(entradas.length), // entradas en este disco
    bytes16(entradas.length), // entradas totales
    bytes32(tamanoCentral),
    bytes32(offset), // offset del directorio central
    bytes16(0), // longitud del comentario
  ]);

  return new Blob([...locales, ...centrales, eocd] as unknown as BlobPart[], {
    type: 'application/zip',
  });
}
