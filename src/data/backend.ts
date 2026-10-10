// Mock de backend asíncrono (seam de datos) — Principio IX, contracts/backend-contract.md.
// Expone la misma interfaz que un backend real: promesas + errores tipados.
// Ningún consumidor conoce localStorage.

import type {
  BorradorInput,
  Cliente,
  ClienteInput,
  EstadoCambiable,
  LineaPresupuesto,
  PerfilEmisor,
  PerfilEmisorInput,
  Presupuesto,
  Servicio,
  ServicioInput,
} from '../domain/types';
import { calcularTotales } from '../domain/calculations';
import { esEstadoCambiable, transicionValida } from '../domain/estados';
import { nuevoId } from '../lib/ids';
import { hoyISO } from '../lib/dates';
import {
  validarCliente,
  validarEmisor,
  validarServicio,
  validarEmision,
} from '../domain/validation';
import { anioDeFecha, siguienteNumero } from '../domain/numbering';
import { leerAgregado, escribirAgregado } from './localStorage';

export type CodigoError = 'VALIDACION' | 'NO_ENCONTRADO' | 'ALMACENAMIENTO' | 'EMISION';

export class BackendError extends Error {
  readonly code: CodigoError;
  readonly detalle?: Record<string, string>;

  constructor(code: CodigoError, mensaje: string, detalle?: Record<string, string>) {
    super(mensaje);
    this.name = 'BackendError';
    this.code = code;
    this.detalle = detalle;
  }
}

/** Latencia simulada para ejercitar los estados de carga sin entorpecer el flujo. */
const LATENCIA_MS = 40;

function esperar(): Promise<void> {
  if (LATENCIA_MS <= 0) return Promise.resolve();
  return new Promise((resolver) => setTimeout(resolver, LATENCIA_MS));
}

function ahoraISO(): string {
  return new Date().toISOString();
}

/** Ejecuta una operación de almacenamiento traduciendo fallos a `BackendError`. */
function enAlmacenamiento<T>(operacion: () => T): T {
  try {
    return operacion();
  } catch (error) {
    throw new BackendError('ALMACENAMIENTO', 'No se pudieron guardar o leer los datos locales.', {
      causa: error instanceof Error ? error.message : String(error),
    });
  }
}

function normalizarLineas(lineas: ReadonlyArray<LineaPresupuesto>): LineaPresupuesto[] {
  return lineas.map((linea) => ({
    id: linea.id || nuevoId(),
    descripcion: linea.descripcion ?? '',
    cantidad: Number(linea.cantidad) || 0,
    unidad: linea.unidad ?? 'servicio',
    precioUnitario: Number(linea.precioUnitario) || 0,
    origen: linea.origen === 'catalogo' ? 'catalogo' : 'manual',
    servicioId: linea.servicioId ?? null,
  }));
}

export interface Backend {
  perfil: {
    obtener: () => Promise<PerfilEmisor | null>;
    guardar: (datos: PerfilEmisorInput) => Promise<PerfilEmisor>;
  };
  clientes: {
    listar: () => Promise<Cliente[]>;
    crear: (datos: ClienteInput) => Promise<Cliente>;
    actualizar: (id: string, datos: ClienteInput) => Promise<Cliente>;
    eliminar: (id: string) => Promise<void>;
  };
  servicios: {
    listar: () => Promise<Servicio[]>;
    crear: (datos: ServicioInput) => Promise<Servicio>;
    actualizar: (id: string, datos: ServicioInput) => Promise<Servicio>;
    eliminar: (id: string) => Promise<void>;
  };
  presupuestos: {
    listarBorradores: () => Promise<Presupuesto[]>;
    listarEmitidos: () => Promise<Presupuesto[]>;
    obtener: (id: string) => Promise<Presupuesto>;
    crearBorrador: (datos: BorradorInput) => Promise<Presupuesto>;
    guardarBorrador: (id: string, datos: BorradorInput) => Promise<Presupuesto>;
    eliminar: (id: string) => Promise<void>;
    emitir: (id: string) => Promise<Presupuesto>;
    cambiarEstado: (id: string, estado: EstadoCambiable) => Promise<Presupuesto>;
  };
}

export function crearBackend(): Backend {
  return {
    perfil: {
      async obtener() {
        await esperar();
        return enAlmacenamiento(() => leerAgregado().perfil);
      },
      async guardar(datos) {
        await esperar();
        const validacion = validarEmisor(datos);
        if (!validacion.valido) {
          throw new BackendError('VALIDACION', 'El perfil tiene datos inválidos.', validacion.errores);
        }
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          const perfil: PerfilEmisor = {
            ...datos,
            id: agregado.perfil?.id ?? nuevoId(),
            actualizadoEn: ahoraISO(),
          };
          escribirAgregado({ ...agregado, perfil });
          return perfil;
        });
      },
    },

    clientes: {
      async listar() {
        await esperar();
        return enAlmacenamiento(() => [...leerAgregado().clientes]);
      },
      async crear(datos) {
        await esperar();
        const validacion = validarCliente(datos);
        if (!validacion.valido) {
          throw new BackendError('VALIDACION', 'El cliente tiene datos inválidos.', validacion.errores);
        }
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          const ahora = ahoraISO();
          const cliente: Cliente = { ...datos, id: nuevoId(), creadoEn: ahora, actualizadoEn: ahora };
          escribirAgregado({ ...agregado, clientes: [...agregado.clientes, cliente] });
          return cliente;
        });
      },
      async actualizar(id, datos) {
        await esperar();
        const validacion = validarCliente(datos);
        if (!validacion.valido) {
          throw new BackendError('VALIDACION', 'El cliente tiene datos inválidos.', validacion.errores);
        }
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          const existente = agregado.clientes.find((c) => c.id === id);
          if (!existente) {
            throw new BackendError('NO_ENCONTRADO', 'El cliente no existe.');
          }
          const actualizado: Cliente = {
            ...datos,
            id,
            creadoEn: existente.creadoEn,
            actualizadoEn: ahoraISO(),
          };
          escribirAgregado({
            ...agregado,
            clientes: agregado.clientes.map((c) => (c.id === id ? actualizado : c)),
          });
          return actualizado;
        });
      },
      async eliminar(id) {
        await esperar();
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          if (!agregado.clientes.some((c) => c.id === id)) {
            throw new BackendError('NO_ENCONTRADO', 'El cliente no existe.');
          }
          escribirAgregado({ ...agregado, clientes: agregado.clientes.filter((c) => c.id !== id) });
        });
      },
    },

    servicios: {
      async listar() {
        await esperar();
        return enAlmacenamiento(() => [...leerAgregado().servicios]);
      },
      async crear(datos) {
        await esperar();
        const validacion = validarServicio(datos);
        if (!validacion.valido) {
          throw new BackendError('VALIDACION', 'El servicio tiene datos inválidos.', validacion.errores);
        }
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          const ahora = ahoraISO();
          const servicio: Servicio = { ...datos, id: nuevoId(), creadoEn: ahora, actualizadoEn: ahora };
          escribirAgregado({ ...agregado, servicios: [...agregado.servicios, servicio] });
          return servicio;
        });
      },
      async actualizar(id, datos) {
        await esperar();
        const validacion = validarServicio(datos);
        if (!validacion.valido) {
          throw new BackendError('VALIDACION', 'El servicio tiene datos inválidos.', validacion.errores);
        }
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          const existente = agregado.servicios.find((s) => s.id === id);
          if (!existente) {
            throw new BackendError('NO_ENCONTRADO', 'El servicio no existe.');
          }
          const actualizado: Servicio = {
            ...datos,
            id,
            creadoEn: existente.creadoEn,
            actualizadoEn: ahoraISO(),
          };
          escribirAgregado({
            ...agregado,
            servicios: agregado.servicios.map((s) => (s.id === id ? actualizado : s)),
          });
          return actualizado;
        });
      },
      async eliminar(id) {
        await esperar();
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          if (!agregado.servicios.some((s) => s.id === id)) {
            throw new BackendError('NO_ENCONTRADO', 'El servicio no existe.');
          }
          escribirAgregado({ ...agregado, servicios: agregado.servicios.filter((s) => s.id !== id) });
        });
      },
    },

    presupuestos: {
      async listarBorradores() {
        await esperar();
        return enAlmacenamiento(() =>
          leerAgregado()
            .presupuestos.filter((p) => p.estado === 'borrador')
            .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn)),
        );
      },
      async listarEmitidos() {
        await esperar();
        return enAlmacenamiento(() =>
          leerAgregado()
            .presupuestos.filter((p) => p.estado !== 'borrador')
            .sort((a, b) => (b.numero ?? '').localeCompare(a.numero ?? '')),
        );
      },
      async obtener(id) {
        await esperar();
        return enAlmacenamiento(() => {
          const presupuesto = leerAgregado().presupuestos.find((p) => p.id === id);
          if (!presupuesto) {
            throw new BackendError('NO_ENCONTRADO', 'El presupuesto no existe.');
          }
          return presupuesto;
        });
      },
      async crearBorrador(datos) {
        await esperar();
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          validarBorrador(agregado.clientes, datos);
          const ahora = ahoraISO();
          const lineas = normalizarLineas(datos.lineas as LineaPresupuesto[]);
          const totales = calcularTotales(lineas, datos.retencionISR);
          const presupuesto: Presupuesto = {
            id: nuevoId(),
            estado: 'borrador',
            numero: null,
            clienteId: datos.clienteId,
            clienteSnapshot: null,
            emisorSnapshot: null,
            lineas,
            retencionISR: datos.retencionISR,
            fechaEmision: null,
            fechaValidez: datos.fechaValidez,
            ...totales,
            creadoEn: ahora,
            actualizadoEn: ahora,
          };
          escribirAgregado({ ...agregado, presupuestos: [...agregado.presupuestos, presupuesto] });
          return presupuesto;
        });
      },
      async guardarBorrador(id, datos) {
        await esperar();
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          const existente = agregado.presupuestos.find((p) => p.id === id);
          if (!existente) {
            throw new BackendError('NO_ENCONTRADO', 'El presupuesto no existe.');
          }
          if (existente.estado !== 'borrador') {
            throw new BackendError('VALIDACION', 'Un presupuesto emitido no se puede editar.');
          }
          validarBorrador(agregado.clientes, datos);
          const lineas = normalizarLineas(datos.lineas as LineaPresupuesto[]);
          const totales = calcularTotales(lineas, datos.retencionISR);
          const actualizado: Presupuesto = {
            ...existente,
            clienteId: datos.clienteId,
            lineas,
            retencionISR: datos.retencionISR,
            fechaValidez: datos.fechaValidez,
            ...totales,
            actualizadoEn: ahoraISO(),
          };
          escribirAgregado({
            ...agregado,
            presupuestos: agregado.presupuestos.map((p) => (p.id === id ? actualizado : p)),
          });
          return actualizado;
        });
      },
      async eliminar(id) {
        await esperar();
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          if (!agregado.presupuestos.some((p) => p.id === id)) {
            throw new BackendError('NO_ENCONTRADO', 'El presupuesto no existe.');
          }
          escribirAgregado({
            ...agregado,
            presupuestos: agregado.presupuestos.filter((p) => p.id !== id),
          });
        });
      },
      async emitir(id) {
        await esperar();
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          const presupuesto = agregado.presupuestos.find((p) => p.id === id);
          if (!presupuesto) {
            throw new BackendError('NO_ENCONTRADO', 'El presupuesto no existe.');
          }
          if (presupuesto.estado !== 'borrador') {
            throw new BackendError('EMISION', 'El presupuesto ya fue emitido.');
          }
          const cliente = agregado.clientes.find((c) => c.id === presupuesto.clienteId) ?? null;
          const emisor = agregado.perfil;
          const validacion = validarEmision({ emisor, cliente, lineas: presupuesto.lineas });
          if (!validacion.valido) {
            throw new BackendError('EMISION', 'No se puede emitir: faltan datos obligatorios o líneas.', validacion.errores);
          }
          // `cliente` y `emisor` son no nulos tras validar.
          const fechaEmision = hoyISO();
          const anio = anioDeFecha(fechaEmision);
          const numero = siguienteNumero(
            agregado.presupuestos,
            anio,
            agregado.correlativos[String(anio)] ?? 0,
          );
          const consecutivo = Number(numero.split('-')[1] ?? 0);
          const totales = calcularTotales(presupuesto.lineas, presupuesto.retencionISR);
          const emitido: Presupuesto = {
            ...presupuesto,
            estado: 'enviado',
            numero,
            fechaEmision,
            emisorSnapshot: {
              nombre: emisor!.nombre,
              razonSocial: emisor!.razonSocial,
              rfc: emisor!.rfc,
              correo: emisor!.correo,
              telefono: emisor!.telefono,
              direccion: emisor!.direccion,
              logo: emisor!.logo,
            },
            clienteSnapshot: {
              nombre: cliente!.nombre,
              rfc: cliente!.rfc,
              correo: cliente!.correo,
              telefono: cliente!.telefono,
              direccion: cliente!.direccion,
            },
            ...totales,
            actualizadoEn: ahoraISO(),
          };
          escribirAgregado({
            ...agregado,
            presupuestos: agregado.presupuestos.map((p) => (p.id === id ? emitido : p)),
            correlativos: {
              ...agregado.correlativos,
              [String(anio)]: Math.max(agregado.correlativos[String(anio)] ?? 0, consecutivo),
            },
          });
          return emitido;
        });
      },
      async cambiarEstado(id, estado) {
        await esperar();
        if (!esEstadoCambiable(estado)) {
          throw new BackendError('VALIDACION', 'Estado no válido.');
        }
        return enAlmacenamiento(() => {
          const agregado = leerAgregado();
          const presupuesto = agregado.presupuestos.find((p) => p.id === id);
          if (!presupuesto) {
            throw new BackendError('NO_ENCONTRADO', 'El presupuesto no existe.');
          }
          if (!transicionValida(presupuesto.estado, estado)) {
            throw new BackendError('VALIDACION', 'Un borrador no puede cambiar de estado por esta vía.');
          }
          const actualizado: Presupuesto = {
            ...presupuesto,
            estado,
            actualizadoEn: ahoraISO(),
          };
          escribirAgregado({
            ...agregado,
            presupuestos: agregado.presupuestos.map((p) => (p.id === id ? actualizado : p)),
          });
          return actualizado;
        });
      },
    },
  };
}

/** Valida los datos de un borrador (cliente existente si viene, líneas coherentes). */
function validarBorrador(clientes: ReadonlyArray<Cliente>, datos: BorradorInput): void {
  const errores: Record<string, string> = {};
  if (datos.clienteId && !clientes.some((c) => c.id === datos.clienteId)) {
    errores.clienteId = 'El cliente seleccionado no existe.';
  }
  // Un borrador puede guardarse incompleto: solo se exige coherencia numérica en las líneas.
  datos.lineas.forEach((linea, indice) => {
    if (typeof linea.cantidad !== 'number' || Number.isNaN(linea.cantidad) || linea.cantidad <= 0) {
      errores[`lineas.${indice}.cantidad`] = 'La cantidad debe ser mayor que 0.';
    }
    if (
      typeof linea.precioUnitario !== 'number' ||
      Number.isNaN(linea.precioUnitario) ||
      linea.precioUnitario < 0
    ) {
      errores[`lineas.${indice}.precioUnitario`] = 'El precio debe ser mayor o igual a 0.';
    }
  });
  if (Object.keys(errores).length > 0) {
    throw new BackendError('VALIDACION', 'El borrador tiene datos inválidos.', errores);
  }
}

/** Instancia por defecto usada por la aplicación. */
export const backend: Backend = crearBackend();
