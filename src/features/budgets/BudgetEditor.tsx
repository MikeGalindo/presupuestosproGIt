// Editor de presupuesto (nuevo y borrador) — FR-004…FR-011, FR-016…FR-018.
// Permite elegir/capturar cliente, añadir líneas, retención, validez, guardar borrador y emitir.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AvisoError, Cargando, EstadoVacio, FormField, SelectField, TextAreaField } from '../../components';
import { useStore } from '../../data/store';
import { validarCliente, validarEmisor, validarLineas } from '../../domain/validation';
import type { BorradorInput, ClienteInput, LineaPresupuesto } from '../../domain/types';
import { fechaValidezPorDefecto } from '../../lib/dates';
import { descargarPdf } from '../pdf/download';
import { BudgetTotals } from './BudgetTotals';
import { LineEditor } from './LineEditor';

const clienteVacio: ClienteInput = { nombre: '', rfc: '', correo: '', telefono: '', direccion: '' };

export function BudgetEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    perfil,
    clientes,
    servicios,
    presupuestos,
    cargando,
    error,
    recargar,
    crearBorrador,
    guardarBorrador,
    emitirPresupuesto,
    crearCliente,
  } = useStore();

  const borradorExistente = id ? presupuestos.find((p) => p.id === id && p.estado === 'borrador') : undefined;

  const [borradorId, setBorradorId] = useState<string | null>(id ?? null);
  const [clienteId, setClienteId] = useState('');
  const [lineas, setLineas] = useState<LineaPresupuesto[]>([]);
  const [retencionISR, setRetencionISR] = useState(false);
  const [fechaValidez, setFechaValidez] = useState(fechaValidezPorDefecto());
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [emitiendo, setEmitiendo] = useState(false);

  const [capturandoCliente, setCapturandoCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState<ClienteInput>(clienteVacio);
  const [erroresCliente, setErroresCliente] = useState<Record<string, string>>({});

  const inicializadoRef = useRef<string | null>(null);

  useEffect(() => {
    if (cargando) return;
    if (id) {
      if (borradorExistente && inicializadoRef.current !== borradorExistente.id) {
        setBorradorId(borradorExistente.id);
        setClienteId(borradorExistente.clienteId);
        setLineas(borradorExistente.lineas);
        setRetencionISR(borradorExistente.retencionISR);
        setFechaValidez(borradorExistente.fechaValidez);
        inicializadoRef.current = borradorExistente.id;
      }
    } else if (inicializadoRef.current === null) {
      inicializadoRef.current = '__nuevo__';
    }
  }, [cargando, id, borradorExistente]);

  if (cargando) return <Cargando mensaje="Cargando presupuesto…" />;
  if (error) return <AvisoError mensaje={error} onReintentar={() => void recargar()} />;
  if (id && !borradorExistente) {
    return (
      <EstadoVacio mensaje="No se encontró el borrador solicitado.">
        <button type="button" onClick={() => navigate('/borradores')}>
          Volver a borradores
        </button>
      </EstadoVacio>
    );
  }

  const perfilValido = perfil ? validarEmisor(perfil).valido : false;
  const lineasValidas = lineas.length === 0 ? true : validarLineas(lineas).valido;

  const avisos: string[] = [];
  if (!perfilValido) avisos.push('Completa tu perfil (nombre, razón social y RFC) antes de emitir.');
  if (!clienteId) avisos.push('Selecciona un cliente.');
  if (lineas.length === 0) avisos.push('Añade al menos una línea para poder emitir.');
  if (lineas.length > 0 && !lineasValidas) avisos.push('Revisa las líneas: descripción obligatoria y cantidad mayor que 0.');
  const puedeEmitir = avisos.length === 0;

  const datosBorrador = (): BorradorInput => ({ clienteId, lineas, retencionISR, fechaValidez });

  const guardar = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      if (borradorId) {
        await guardarBorrador(borradorId, datosBorrador());
        setMensaje('Borrador guardado.');
      } else {
        const creado = await crearBorrador(datosBorrador());
        setBorradorId(creado.id);
        inicializadoRef.current = creado.id;
        navigate(`/borradores/${creado.id}`);
        setMensaje('Borrador guardado.');
      }
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo guardar el borrador.');
    } finally {
      setGuardando(false);
    }
  };

  const emitir = async () => {
    if (!puedeEmitir) {
      setMensaje('Revisa los avisos antes de emitir.');
      return;
    }
    setEmitiendo(true);
    setMensaje(null);
    try {
      let idPresupuesto = borradorId;
      if (idPresupuesto) {
        await guardarBorrador(idPresupuesto, datosBorrador());
      } else {
        const creado = await crearBorrador(datosBorrador());
        idPresupuesto = creado.id;
        setBorradorId(creado.id);
      }
      const emitido = await emitirPresupuesto(idPresupuesto);
      await descargarPdf(emitido);
      navigate('/presupuestos');
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo emitir el presupuesto.');
    } finally {
      setEmitiendo(false);
    }
  };

  const guardarClienteInline = async () => {
    const validacion = validarCliente(nuevoCliente);
    setErroresCliente(validacion.errores);
    if (!validacion.valido) return;
    try {
      const creado = await crearCliente(nuevoCliente);
      setClienteId(creado.id);
      setCapturandoCliente(false);
      setNuevoCliente(clienteVacio);
      setMensaje('Cliente creado y seleccionado.');
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo crear el cliente.');
    }
  };

  return (
    <section>
      <h1>{borradorId ? 'Editar borrador' : 'Nuevo presupuesto'}</h1>

      <div className="tarjeta">
        <SelectField
          id="cliente"
          label="Cliente"
          valor={clienteId}
          onChange={setClienteId}
          obligatorio
          placeholderOpcion="Selecciona un cliente…"
          ayuda="Si el cliente no existe, captúralo al vuelo."
        >
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </SelectField>

        <div className="botonera">
          <button type="button" className="boton--secundario" onClick={() => setCapturandoCliente((v) => !v)}>
            {capturandoCliente ? 'Cancelar captura' : 'Capturar cliente nuevo'}
          </button>
        </div>

        {capturandoCliente ? (
          <div className="tarjeta tarjeta--suave">
            <h2>Cliente nuevo</h2>
            <div className="grid">
              <FormField id="nc-nombre" label="Nombre / Razón social" valor={nuevoCliente.nombre} onChange={(v) => setNuevoCliente((p) => ({ ...p, nombre: v }))} obligatorio error={erroresCliente.nombre} />
              <FormField id="nc-rfc" label="RFC" valor={nuevoCliente.rfc ?? ''} onChange={(v) => setNuevoCliente((p) => ({ ...p, rfc: v }))} />
              <FormField id="nc-correo" label="Correo" tipo="email" valor={nuevoCliente.correo ?? ''} onChange={(v) => setNuevoCliente((p) => ({ ...p, correo: v }))} error={erroresCliente.correo} />
              <FormField id="nc-telefono" label="Teléfono" tipo="tel" valor={nuevoCliente.telefono ?? ''} onChange={(v) => setNuevoCliente((p) => ({ ...p, telefono: v }))} />
            </div>
            <TextAreaField id="nc-direccion" label="Dirección" valor={nuevoCliente.direccion ?? ''} onChange={(v) => setNuevoCliente((p) => ({ ...p, direccion: v }))} />
            <div className="botonera">
              <button type="button" onClick={() => void guardarClienteInline()}>
                Guardar y seleccionar
              </button>
            </div>
          </div>
        ) : null}

        <FormField
          id="fechaValidez"
          label="Válido hasta"
          tipo="date"
          valor={fechaValidez}
          onChange={setFechaValidez}
          ayuda="Por defecto, 30 días desde la emisión."
        />
      </div>

      <LineEditor lineas={lineas} servicios={servicios} onCambiar={setLineas} />

      <BudgetTotals lineas={lineas} retencionISR={retencionISR} onCambiarRetencion={setRetencionISR} />

      {avisos.length > 0 ? (
        <ul className="avisos" aria-label="Avisos para emitir">
          {avisos.map((aviso) => (
            <li key={aviso}>{aviso}</li>
          ))}
        </ul>
      ) : null}

      <div className="botonera">
        <button type="button" className="boton--secundario" onClick={() => void guardar()} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar borrador'}
        </button>
        <button type="button" onClick={() => void emitir()} disabled={!puedeEmitir || emitiendo}>
          {emitiendo ? 'Emitiendo…' : 'Emitir y descargar PDF'}
        </button>
      </div>

      {mensaje ? (
        <p role="status" className="campo__ayuda">
          {mensaje}
        </p>
      ) : null}
    </section>
  );
}
