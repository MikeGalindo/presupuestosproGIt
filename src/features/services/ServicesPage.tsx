// Catálogo de servicios — FR-003. Nombre, descripción, precio (MXN) y unidad.

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
import { formatearMXN, pesosACentavos } from '../../domain/money';
import { validarServicio } from '../../domain/validation';
import type { Servicio } from '../../domain/types';

const UNIDADES_SUGERIDAS = ['hora', 'pieza', 'proyecto', 'servicio', 'mes'];

interface FormularioServicio {
  nombre: string;
  descripcion: string;
  precio: string;
  unidad: string;
}

const formularioVacio: FormularioServicio = { nombre: '', descripcion: '', precio: '', unidad: 'servicio' };

export function ServicesPage() {
  const { servicios, cargando, error, recargar, crearServicio, actualizarServicio, eliminarServicio } = useStore();
  const [formulario, setFormulario] = useState<FormularioServicio>(formularioVacio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Servicio | null>(null);

  const actualizar = (campo: keyof FormularioServicio) => (valor: string) => {
    setFormulario((previo) => ({ ...previo, [campo]: valor }));
  };

  const abrirNuevo = () => {
    setFormulario(formularioVacio);
    setEditandoId(null);
    setErrores({});
    setMensaje(null);
    setMostrarFormulario(true);
  };

  const abrirEdicion = (servicio: Servicio) => {
    setFormulario({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion ?? '',
      precio: (servicio.precioUnitario / 100).toString(),
      unidad: servicio.unidad,
    });
    setEditandoId(servicio.id);
    setErrores({});
    setMensaje(null);
    setMostrarFormulario(true);
  };

  const guardar = async () => {
    const precioPesos = Number.parseFloat(formulario.precio === '' ? '0' : formulario.precio);
    const datos = {
      nombre: formulario.nombre,
      descripcion: formulario.descripcion,
      precioUnitario: Number.isNaN(precioPesos) ? -1 : pesosACentavos(precioPesos),
      unidad: formulario.unidad.trim() || 'servicio',
    };
    const validacion = validarServicio(datos);
    setErrores(validacion.errores);
    if (!validacion.valido) return;
    try {
      if (editandoId) {
        await actualizarServicio(editandoId, datos);
        setMensaje('Servicio actualizado.');
      } else {
        await crearServicio(datos);
        setMensaje('Servicio creado.');
      }
      setMostrarFormulario(false);
      setEditandoId(null);
      setFormulario(formularioVacio);
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo guardar el servicio.');
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    try {
      await eliminarServicio(aEliminar.id);
      setMensaje('Servicio eliminado.');
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo eliminar el servicio.');
    } finally {
      setAEliminar(null);
    }
  };

  const columnas: Columna<Servicio>[] = [
    { clave: 'nombre', encabezado: 'Nombre', render: (s) => s.nombre },
    { clave: 'descripcion', encabezado: 'Descripción', render: (s) => s.descripcion || '—' },
    { clave: 'precio', encabezado: 'Precio', numerica: true, render: (s) => formatearMXN(s.precioUnitario) },
    { clave: 'unidad', encabezado: 'Unidad', render: (s) => s.unidad },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      render: (s) => (
        <div className="botonera">
          <button type="button" className="boton--secundario" onClick={() => abrirEdicion(s)}>
            Editar
          </button>
          <button type="button" className="boton--peligro" onClick={() => setAEliminar(s)}>
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  if (cargando) return <Cargando mensaje="Cargando servicios…" />;
  if (error) return <AvisoError mensaje={error} onReintentar={() => void recargar()} />;

  return (
    <section>
      <h1>Servicios</h1>
      <div className="botonera">
        <button type="button" onClick={abrirNuevo}>
          Nuevo servicio
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
          <h2>{editandoId ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <div className="grid">
            <FormField id="srv-nombre" label="Nombre" valor={formulario.nombre} onChange={actualizar('nombre')} obligatorio error={errores.nombre} />
            <FormField
              id="srv-precio"
              label="Precio unitario (MXN)"
              tipo="number"
              paso="0.01"
              minimo="0"
              valor={formulario.precio}
              onChange={actualizar('precio')}
              obligatorio
              error={errores.precioUnitario}
            />
            <div className="campo">
              <label htmlFor="srv-unidad">Unidad</label>
              <input
                id="srv-unidad"
                name="srv-unidad"
                list="unidades-sugeridas"
                value={formulario.unidad}
                onChange={(evento) => actualizar('unidad')(evento.target.value)}
              />
              <datalist id="unidades-sugeridas">
                {UNIDADES_SUGERIDAS.map((unidad) => (
                  <option key={unidad} value={unidad} />
                ))}
              </datalist>
              {errores.unidad ? (
                <span className="campo__error" role="alert">
                  {errores.unidad}
                </span>
              ) : null}
            </div>
          </div>
          <TextAreaField id="srv-descripcion" label="Descripción" valor={formulario.descripcion} onChange={actualizar('descripcion')} />
          <div className="botonera">
            <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear servicio'}</button>
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
        {servicios.length === 0 ? (
          <EstadoVacio mensaje="Aún no tienes servicios en tu catálogo." />
        ) : (
          <DataTable columnas={columnas} filas={servicios} obtenerClave={(s) => s.id} descripcion="Lista de servicios" />
        )}
      </div>

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Eliminar servicio"
        mensaje={`¿Seguro que deseas eliminar "${aEliminar?.nombre ?? ''}"? Los presupuestos ya emitidos no cambian.`}
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  );
}
