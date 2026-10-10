// Catálogo de clientes — FR-002. Listar, crear, editar y eliminar con confirmación.

import { useState } from 'react';
import {
  AvisoError,
  Cargando,
  ConfirmDialog,
  DataTable,
  EstadoVacio,
  FormField,
  TextAreaField,
  type Columna,
} from '../../components';
import { useStore } from '../../data/store';
import { validarCliente } from '../../domain/validation';
import type { Cliente, ClienteInput } from '../../domain/types';

const formularioVacio: ClienteInput = {
  nombre: '',
  rfc: '',
  correo: '',
  telefono: '',
  direccion: '',
};

export function ClientsPage() {
  const { clientes, cargando, error, recargar, crearCliente, actualizarCliente, eliminarCliente } = useStore();
  const [formulario, setFormulario] = useState<ClienteInput>(formularioVacio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Cliente | null>(null);

  const actualizar = (campo: keyof ClienteInput) => (valor: string) => {
    setFormulario((previo) => ({ ...previo, [campo]: valor }));
  };

  const abrirNuevo = () => {
    setFormulario(formularioVacio);
    setEditandoId(null);
    setErrores({});
    setMensaje(null);
    setMostrarFormulario(true);
  };

  const abrirEdicion = (cliente: Cliente) => {
    setFormulario({
      nombre: cliente.nombre,
      rfc: cliente.rfc ?? '',
      correo: cliente.correo ?? '',
      telefono: cliente.telefono ?? '',
      direccion: cliente.direccion ?? '',
    });
    setEditandoId(cliente.id);
    setErrores({});
    setMensaje(null);
    setMostrarFormulario(true);
  };

  const guardar = async () => {
    const validacion = validarCliente(formulario);
    setErrores(validacion.errores);
    if (!validacion.valido) return;
    try {
      if (editandoId) {
        await actualizarCliente(editandoId, formulario);
        setMensaje('Cliente actualizado.');
      } else {
        await crearCliente(formulario);
        setMensaje('Cliente creado.');
      }
      setMostrarFormulario(false);
      setEditandoId(null);
      setFormulario(formularioVacio);
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo guardar el cliente.');
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    try {
      await eliminarCliente(aEliminar.id);
      setMensaje('Cliente eliminado.');
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo eliminar el cliente.');
    } finally {
      setAEliminar(null);
    }
  };

  const columnas: Columna<Cliente>[] = [
    { clave: 'nombre', encabezado: 'Nombre / Razón social', render: (c) => c.nombre },
    { clave: 'rfc', encabezado: 'RFC', render: (c) => c.rfc || '—' },
    { clave: 'correo', encabezado: 'Correo', render: (c) => c.correo || '—' },
    { clave: 'telefono', encabezado: 'Teléfono', render: (c) => c.telefono || '—' },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      render: (c) => (
        <div className="botonera">
          <button type="button" className="boton--secundario" onClick={() => abrirEdicion(c)}>
            Editar
          </button>
          <button type="button" className="boton--peligro" onClick={() => setAEliminar(c)}>
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  if (cargando) return <Cargando mensaje="Cargando clientes…" />;
  if (error) return <AvisoError mensaje={error} onReintentar={() => void recargar()} />;

  return (
    <section>
      <h1>Clientes</h1>
      <div className="botonera">
        <button type="button" onClick={abrirNuevo}>
          Nuevo cliente
        </button>
      </div>

      {mostrarFormulario ? (
        <form
          className="tarjeta"
          onSubmit={(evento) => {
            evento.preventDefault();
            void guardar();
          }}
        >
          <h2>{editandoId ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <div className="grid">
            <FormField id="cli-nombre" label="Nombre / Razón social" valor={formulario.nombre} onChange={actualizar('nombre')} obligatorio error={errores.nombre} />
            <FormField id="cli-rfc" label="RFC" valor={formulario.rfc ?? ''} onChange={actualizar('rfc')} />
            <FormField id="cli-correo" label="Correo" tipo="email" valor={formulario.correo ?? ''} onChange={actualizar('correo')} error={errores.correo} />
            <FormField id="cli-telefono" label="Teléfono" tipo="tel" valor={formulario.telefono ?? ''} onChange={actualizar('telefono')} />
          </div>
          <TextAreaField id="cli-direccion" label="Dirección" valor={formulario.direccion ?? ''} onChange={actualizar('direccion')} />
          <div className="botonera">
            <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear cliente'}</button>
            <button
              type="button"
              className="boton--secundario"
              onClick={() => {
                setMostrarFormulario(false);
                setEditandoId(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {mensaje ? (
        <p role="status" className="campo__ayuda">
          {mensaje}
        </p>
      ) : null}

      <div className="tarjeta">
        {clientes.length === 0 ? (
          <EstadoVacio mensaje="Aún no tienes clientes. Crea el primero para usarlo en tus presupuestos." />
        ) : (
          <DataTable columnas={columnas} filas={clientes} obtenerClave={(c) => c.id} descripcion="Lista de clientes" />
        )}
      </div>

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Eliminar cliente"
        mensaje={`¿Seguro que deseas eliminar a "${aEliminar?.nombre ?? ''}"? Los presupuestos ya emitidos conservan sus datos.`}
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  );
}
