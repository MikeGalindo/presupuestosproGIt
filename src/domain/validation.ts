// Reglas de validación puras — FR-001/002/003/005/016/018.

import type {
  ClienteInput,
  LineaPresupuesto,
  PerfilEmisorInput,
  ServicioInput,
} from './types';

export interface ResultadoValidacion {
  valido: boolean;
  /** Mensajes de error por campo. Vacío si es válido. */
  errores: Record<string, string>;
}

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resultado(errores: Record<string, string>): ResultadoValidacion {
  return { valido: Object.keys(errores).length === 0, errores };
}

function esVacio(valor: string | undefined | null): boolean {
  return valor === undefined || valor === null || valor.trim() === '';
}

/** Valida el perfil del emisor: nombre, razón social y RFC obligatorios. */
export function validarEmisor(datos: PerfilEmisorInput): ResultadoValidacion {
  const errores: Record<string, string> = {};
  if (esVacio(datos.nombre)) errores.nombre = 'El nombre es obligatorio.';
  if (esVacio(datos.razonSocial)) errores.razonSocial = 'La razón social es obligatoria.';
  if (esVacio(datos.rfc)) errores.rfc = 'El RFC es obligatorio.';
  if (!esVacio(datos.correo) && !PATRON_CORREO.test((datos.correo ?? '').trim())) {
    errores.correo = 'El correo no tiene un formato válido.';
  }
  return resultado(errores);
}

/** Valida un cliente: solo el nombre/razón social es obligatorio. */
export function validarCliente(datos: ClienteInput): ResultadoValidacion {
  const errores: Record<string, string> = {};
  if (esVacio(datos.nombre)) errores.nombre = 'El nombre es obligatorio.';
  if (!esVacio(datos.correo) && !PATRON_CORREO.test((datos.correo ?? '').trim())) {
    errores.correo = 'El correo no tiene un formato válido.';
  }
  return resultado(errores);
}

/** Valida un servicio: nombre obligatorio y precio ≥ 0. */
export function validarServicio(datos: ServicioInput): ResultadoValidacion {
  const errores: Record<string, string> = {};
  if (esVacio(datos.nombre)) errores.nombre = 'El nombre es obligatorio.';
  if (typeof datos.precioUnitario !== 'number' || Number.isNaN(datos.precioUnitario) || datos.precioUnitario < 0) {
    errores.precioUnitario = 'El precio debe ser mayor o igual a 0.';
  }
  if (esVacio(datos.unidad)) errores.unidad = 'La unidad es obligatoria.';
  return resultado(errores);
}

/** Valida una línea: descripción no vacía, cantidad > 0 y precio ≥ 0. */
export function validarLinea(linea: Pick<LineaPresupuesto, 'descripcion' | 'cantidad' | 'precioUnitario'>): ResultadoValidacion {
  const errores: Record<string, string> = {};
  if (esVacio(linea.descripcion)) errores.descripcion = 'La descripción es obligatoria.';
  if (typeof linea.cantidad !== 'number' || Number.isNaN(linea.cantidad) || linea.cantidad <= 0) {
    errores.cantidad = 'La cantidad debe ser mayor que 0.';
  }
  if (typeof linea.precioUnitario !== 'number' || Number.isNaN(linea.precioUnitario) || linea.precioUnitario < 0) {
    errores.precioUnitario = 'El precio debe ser mayor o igual a 0.';
  }
  return resultado(errores);
}

/** Valida que todas las líneas sean válidas; devuelve errores por índice. */
export function validarLineas(lineas: ReadonlyArray<LineaPresupuesto>): ResultadoValidacion {
  const errores: Record<string, string> = {};
  lineas.forEach((linea, indice) => {
    const r = validarLinea(linea);
    if (!r.valido) {
      Object.entries(r.errores).forEach(([campo, mensaje]) => {
        errores[`lineas.${indice}.${campo}`] = mensaje;
      });
    }
  });
  return resultado(errores);
}

export interface DatosEmision {
  emisor: PerfilEmisorInput | null;
  cliente: ClienteInput | null;
  lineas: ReadonlyArray<LineaPresupuesto>;
}

/** Reglas para poder emitir: emisor válido + cliente válido + ≥ 1 línea — FR-011, FR-018. */
export function validarEmision(datos: DatosEmision): ResultadoValidacion {
  const errores: Record<string, string> = {};
  if (!datos.emisor) {
    errores.emisor = 'Configura tu perfil antes de emitir un presupuesto.';
  } else {
    const rEmisor = validarEmisor(datos.emisor);
    if (!rEmisor.valido) {
      errores.emisor = 'El perfil del emisor está incompleto (nombre, razón social y RFC).';
    }
  }
  if (!datos.cliente) {
    errores.cliente = 'Selecciona un cliente.';
  } else {
    const rCliente = validarCliente(datos.cliente);
    if (!rCliente.valido) {
      errores.cliente = 'El cliente no tiene nombre o razón social.';
    }
  }
  if (datos.lineas.length === 0) {
    errores.lineas = 'Añade al menos una línea para poder emitir.';
  } else {
    const rLineas = validarLineas(datos.lineas);
    if (!rLineas.valido) {
      errores.lineas = 'Hay líneas con datos inválidos (revisa cantidad y precio).';
    }
  }
  return resultado(errores);
}
