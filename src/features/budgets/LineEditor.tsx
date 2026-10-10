// Editor de líneas del presupuesto: manuales y desde el catálogo de servicios.
// FR-004, FR-005, FR-016; US3 integra el selector de catálogo.

import { importeLineaCentavos } from '../../domain/calculations';
import { formatearMXN } from '../../domain/money';
import type { LineaPresupuesto, Servicio } from '../../domain/types';
import { nuevoId } from '../../lib/ids';

const UNIDADES_SUGERIDAS = ['hora', 'pieza', 'proyecto', 'servicio', 'mes'];

export interface LineEditorProps {
  lineas: LineaPresupuesto[];
  servicios: ReadonlyArray<Servicio>;
  onCambiar: (lineas: LineaPresupuesto[]) => void;
}

/** Crea una línea vacía para captura manual. */
export function lineaManualVacia(): LineaPresupuesto {
  return {
    id: nuevoId(),
    descripcion: '',
    cantidad: 1,
    unidad: 'servicio',
    precioUnitario: 0,
    origen: 'manual',
    servicioId: null,
  };
}

/** Crea una línea a partir de un servicio del catálogo (precarga sus datos). */
export function lineaDesdeServicio(servicio: Servicio): LineaPresupuesto {
  return {
    id: nuevoId(),
    descripcion: servicio.descripcion?.trim() ? servicio.descripcion : servicio.nombre,
    cantidad: 1,
    unidad: servicio.unidad,
    precioUnitario: servicio.precioUnitario,
    origen: 'catalogo',
    servicioId: servicio.id,
  };
}

export function LineEditor({ lineas, servicios, onCambiar }: LineEditorProps) {
  const actualizarLinea = (id: string, cambios: Partial<LineaPresupuesto>) => {
    onCambiar(lineas.map((linea) => (linea.id === id ? { ...linea, ...cambios } : linea)));
  };

  const quitarLinea = (id: string) => {
    onCambiar(lineas.filter((linea) => linea.id !== id));
  };

  const agregarManual = () => {
    onCambiar([...lineas, lineaManualVacia()]);
  };

  const agregarDesdeCatalogo = (servicioId: string) => {
    const servicio = servicios.find((s) => s.id === servicioId);
    if (!servicio) return;
    onCambiar([...lineas, lineaDesdeServicio(servicio)]);
  };

  return (
    <div className="tarjeta">
      <h2>Líneas del presupuesto</h2>

      <div className="botonera" style={{ marginBottom: '0.75rem' }}>
        <button type="button" className="boton--secundario" onClick={agregarManual}>
          Añadir línea manual
        </button>
        {servicios.length > 0 ? (
          <label className="campo" style={{ margin: 0 }}>
            <span className="sr-only">Añadir desde catálogo</span>
            <select
              aria-label="Añadir desde catálogo"
              value=""
              onChange={(evento) => {
                agregarDesdeCatalogo(evento.target.value);
                evento.target.value = '';
              }}
            >
              <option value="">Añadir desde catálogo…</option>
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre} · {formatearMXN(servicio.precioUnitario)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {lineas.length === 0 ? (
        <p className="estado-vacio">Aún no hay líneas. Añade una línea manual o desde tu catálogo.</p>
      ) : (
        <div className="lineas-editor">
          {lineas.map((linea, indice) => {
            const errorCantidad = linea.cantidad <= 0;
            return (
              <div className="linea-editor" key={linea.id}>
                <div className="grid">
                  <div className="campo campo--descripcion">
                    <label htmlFor={`linea-desc-${linea.id}`}>Descripción {indice + 1}</label>
                    <input
                      id={`linea-desc-${linea.id}`}
                      value={linea.descripcion}
                      onChange={(evento) => actualizarLinea(linea.id, { descripcion: evento.target.value })}
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor={`linea-cant-${linea.id}`}>Cantidad</label>
                    <input
                      id={`linea-cant-${linea.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={Number.isFinite(linea.cantidad) ? linea.cantidad : ''}
                      onChange={(evento) => actualizarLinea(linea.id, { cantidad: Number(evento.target.value) })}
                      aria-invalid={errorCantidad || undefined}
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor={`linea-unidad-${linea.id}`}>Unidad</label>
                    <input
                      id={`linea-unidad-${linea.id}`}
                      list="unidades-linea"
                      value={linea.unidad}
                      onChange={(evento) => actualizarLinea(linea.id, { unidad: evento.target.value })}
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor={`linea-precio-${linea.id}`}>Precio unitario (MXN)</label>
                    <input
                      id={`linea-precio-${linea.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={(linea.precioUnitario / 100).toString()}
                      onChange={(evento) =>
                        actualizarLinea(linea.id, { precioUnitario: Math.round(Number(evento.target.value) * 100) })
                      }
                    />
                  </div>
                  <div className="campo campo--importe">
                    <span className="campo__ayuda">Importe</span>
                    <strong>{formatearMXN(importeLineaCentavos(linea))}</strong>
                  </div>
                </div>
                <div className="botonera">
                  {errorCantidad ? (
                    <span className="campo__error" role="alert">
                      La cantidad debe ser mayor que 0.
                    </span>
                  ) : null}
                  <button type="button" className="boton--peligro" onClick={() => quitarLinea(linea.id)}>
                    Quitar línea
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <datalist id="unidades-linea">
        {UNIDADES_SUGERIDAS.map((unidad) => (
          <option key={unidad} value={unidad} />
        ))}
      </datalist>
    </div>
  );
}
