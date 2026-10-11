// Estado compartido mínimo: React Context + useReducer, con cálculos derivados puros.
// Los consumidores hablan con el mock de backend (Principio IX), nunca con localStorage.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { backend, BackendError } from './backend';
import type {
  Agregado,
  BorradorInput,
  Cliente,
  ClienteInput,
  EstadoCambiable,
  PerfilEmisor,
  PerfilEmisorInput,
  Presupuesto,
  Servicio,
  ServicioInput,
} from '../domain/types';

interface Estado {
  cargando: boolean;
  error: string | null;
  perfil: PerfilEmisor | null;
  clientes: Cliente[];
  servicios: Servicio[];
  presupuestos: Presupuesto[];
}

interface DatosCargados {
  perfil: PerfilEmisor | null;
  clientes: Cliente[];
  servicios: Servicio[];
  presupuestos: Presupuesto[];
}

type Accion =
  | { tipo: 'cargando' }
  | { tipo: 'cargado'; datos: DatosCargados }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'perfil'; perfil: PerfilEmisor }
  | { tipo: 'clientes'; clientes: Cliente[] }
  | { tipo: 'servicios'; servicios: Servicio[] }
  | { tipo: 'upsertPresupuesto'; presupuesto: Presupuesto }
  | { tipo: 'eliminarPresupuesto'; id: string };

const estadoInicial: Estado = {
  cargando: true,
  error: null,
  perfil: null,
  clientes: [],
  servicios: [],
  presupuestos: [],
};

function reducer(estado: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case 'cargando':
      return { ...estado, cargando: true, error: null };
    case 'cargado':
      return { ...estado, cargando: false, error: null, ...accion.datos };
    case 'error':
      return { ...estado, cargando: false, error: accion.mensaje };
    case 'perfil':
      return { ...estado, perfil: accion.perfil, error: null };
    case 'clientes':
      return { ...estado, clientes: accion.clientes, error: null };
    case 'servicios':
      return { ...estado, servicios: accion.servicios, error: null };
    case 'upsertPresupuesto': {
      const existe = estado.presupuestos.some((p) => p.id === accion.presupuesto.id);
      const presupuestos = existe
        ? estado.presupuestos.map((p) => (p.id === accion.presupuesto.id ? accion.presupuesto : p))
        : [...estado.presupuestos, accion.presupuesto];
      return { ...estado, presupuestos, error: null };
    }
    case 'eliminarPresupuesto':
      return { ...estado, presupuestos: estado.presupuestos.filter((p) => p.id !== accion.id) };
    default:
      return estado;
  }
}

export interface StoreContextValue {
  cargando: boolean;
  error: string | null;
  perfil: PerfilEmisor | null;
  clientes: Cliente[];
  servicios: Servicio[];
  presupuestos: Presupuesto[];
  borradores: Presupuesto[];
  emitidos: Presupuesto[];
  recargar: () => Promise<void>;
  guardarPerfil: (datos: PerfilEmisorInput) => Promise<PerfilEmisor>;
  crearCliente: (datos: ClienteInput) => Promise<Cliente>;
  actualizarCliente: (id: string, datos: ClienteInput) => Promise<Cliente>;
  eliminarCliente: (id: string) => Promise<void>;
  crearServicio: (datos: ServicioInput) => Promise<Servicio>;
  actualizarServicio: (id: string, datos: ServicioInput) => Promise<Servicio>;
  eliminarServicio: (id: string) => Promise<void>;
  crearBorrador: (datos: BorradorInput) => Promise<Presupuesto>;
  guardarBorrador: (id: string, datos: BorradorInput) => Promise<Presupuesto>;
  emitirPresupuesto: (id: string) => Promise<Presupuesto>;
  cambiarEstadoPresupuesto: (id: string, estado: EstadoCambiable) => Promise<Presupuesto>;
  eliminarPresupuesto: (id: string) => Promise<void>;
  /** Copia fiel de todos los datos persistidos, para la exportación .zip (solo lectura). */
  obtenerCopia: () => Promise<Agregado>;
  clientePorId: (id: string) => Cliente | undefined;
  servicioPorId: (id: string) => Servicio | undefined;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function mensajeDeError(error: unknown): string {
  if (error instanceof BackendError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado.';
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial);

  const recargar = useCallback(async () => {
    dispatch({ tipo: 'cargando' });
    try {
      const [perfil, clientes, servicios, presupuestos] = await Promise.all([
        backend.perfil.obtener(),
        backend.clientes.listar(),
        backend.servicios.listar(),
        Promise.all([backend.presupuestos.listarBorradores(), backend.presupuestos.listarEmitidos()]).then(
          ([borradores, emitidos]) => [...borradores, ...emitidos],
        ),
      ]);
      dispatch({ tipo: 'cargado', datos: { perfil, clientes, servicios, presupuestos } });
    } catch (error) {
      dispatch({ tipo: 'error', mensaje: mensajeDeError(error) });
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const guardarPerfil = useCallback(async (datos: PerfilEmisorInput) => {
    const perfil = await backend.perfil.guardar(datos);
    dispatch({ tipo: 'perfil', perfil });
    return perfil;
  }, []);

  const crearCliente = useCallback(async (datos: ClienteInput) => {
    const cliente = await backend.clientes.crear(datos);
    dispatch({ tipo: 'clientes', clientes: await backend.clientes.listar() });
    return cliente;
  }, []);

  const actualizarCliente = useCallback(async (id: string, datos: ClienteInput) => {
    const cliente = await backend.clientes.actualizar(id, datos);
    dispatch({ tipo: 'clientes', clientes: await backend.clientes.listar() });
    return cliente;
  }, []);

  const eliminarCliente = useCallback(async (id: string) => {
    await backend.clientes.eliminar(id);
    dispatch({ tipo: 'clientes', clientes: await backend.clientes.listar() });
  }, []);

  const crearServicio = useCallback(async (datos: ServicioInput) => {
    const servicio = await backend.servicios.crear(datos);
    dispatch({ tipo: 'servicios', servicios: await backend.servicios.listar() });
    return servicio;
  }, []);

  const actualizarServicio = useCallback(async (id: string, datos: ServicioInput) => {
    const servicio = await backend.servicios.actualizar(id, datos);
    dispatch({ tipo: 'servicios', servicios: await backend.servicios.listar() });
    return servicio;
  }, []);

  const eliminarServicio = useCallback(async (id: string) => {
    await backend.servicios.eliminar(id);
    dispatch({ tipo: 'servicios', servicios: await backend.servicios.listar() });
  }, []);

  const crearBorrador = useCallback(async (datos: BorradorInput) => {
    const presupuesto = await backend.presupuestos.crearBorrador(datos);
    dispatch({ tipo: 'upsertPresupuesto', presupuesto });
    return presupuesto;
  }, []);

  const guardarBorrador = useCallback(async (id: string, datos: BorradorInput) => {
    const presupuesto = await backend.presupuestos.guardarBorrador(id, datos);
    dispatch({ tipo: 'upsertPresupuesto', presupuesto });
    return presupuesto;
  }, []);

  const emitirPresupuesto = useCallback(async (id: string) => {
    const presupuesto = await backend.presupuestos.emitir(id);
    dispatch({ tipo: 'upsertPresupuesto', presupuesto });
    return presupuesto;
  }, []);

  const cambiarEstadoPresupuesto = useCallback(async (id: string, estado: EstadoCambiable) => {
    const presupuesto = await backend.presupuestos.cambiarEstado(id, estado);
    dispatch({ tipo: 'upsertPresupuesto', presupuesto });
    return presupuesto;
  }, []);

  const eliminarPresupuesto = useCallback(async (id: string) => {
    await backend.presupuestos.eliminar(id);
    dispatch({ tipo: 'eliminarPresupuesto', id });
  }, []);

  const obtenerCopia = useCallback(() => backend.exportacion.obtenerCopia(), []);

  const clientePorId = useCallback(
    (id: string) => estado.clientes.find((c) => c.id === id),
    [estado.clientes],
  );
  const servicioPorId = useCallback(
    (id: string) => estado.servicios.find((s) => s.id === id),
    [estado.servicios],
  );

  const valor = useMemo<StoreContextValue>(() => {
    const borradores = estado.presupuestos
      .filter((p) => p.estado === 'borrador')
      .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn));
    const emitidos = estado.presupuestos
      .filter((p) => p.estado !== 'borrador')
      .sort((a, b) => (b.numero ?? '').localeCompare(a.numero ?? ''));
    return {
      cargando: estado.cargando,
      error: estado.error,
      perfil: estado.perfil,
      clientes: estado.clientes,
      servicios: estado.servicios,
      presupuestos: estado.presupuestos,
      borradores,
      emitidos,
      recargar,
      guardarPerfil,
      crearCliente,
      actualizarCliente,
      eliminarCliente,
      crearServicio,
      actualizarServicio,
      eliminarServicio,
      crearBorrador,
      guardarBorrador,
      emitirPresupuesto,
      cambiarEstadoPresupuesto,
      eliminarPresupuesto,
      obtenerCopia,
      clientePorId,
      servicioPorId,
    };
  }, [
    estado,
    recargar,
    guardarPerfil,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    crearBorrador,
    guardarBorrador,
    emitirPresupuesto,
    cambiarEstadoPresupuesto,
    eliminarPresupuesto,
    obtenerCopia,
    clientePorId,
    servicioPorId,
  ]);

  return <StoreContext.Provider value={valor}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const contexto = useContext(StoreContext);
  if (!contexto) {
    throw new Error('useStore debe usarse dentro de <StoreProvider>.');
  }
  return contexto;
}
