// Detalle de un presupuesto emitido — FR-010, FR-012. Ver, descargar, cambiar estado y eliminar.

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AvisoError, Cargando, ConfirmDialog, EstadoBadge, EstadoVacio } from '../../components';
import { useStore } from '../../data/store';
import { estadoMostrado, ETIQUETAS_ESTADO } from '../../domain/estados';
import { formatearMXN } from '../../domain/money';
import { formatearFecha, hoyISO } from '../../lib/dates';
import type { EstadoCambiable } from '../../domain/types';
import { descargarPdf } from '../pdf/download';

export function BudgetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    presupuestos,
    cargando,
    error,
    recargar,
    eliminarPresupuesto,
    cambiarEstadoPresupuesto,
  } = useStore();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const presupuesto = id
    ? presupuestos.find((p) => p.id === id && p.estado !== 'borrador')
    : undefined;

  if (cargando) return <Cargando mensaje="Cargando presupuesto…" />;
  if (error) return <AvisoError mensaje={error} onReintentar={() => void recargar()} />;
  if (!presupuesto) {
    return (
      <EstadoVacio mensaje="No se encontró el presupuesto emitido solicitado.">
        <button type="button" onClick={() => navigate('/presupuestos')}>
          Volver al historial
        </button>
      </EstadoVacio>
    );
  }

  const descargar = async () => {
    try {
      await descargarPdf(presupuesto);
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo descargar el PDF.');
    }
  };

  const cambiarEstado = async (nuevo: EstadoCambiable) => {
    try {
      await cambiarEstadoPresupuesto(presupuesto.id, nuevo);
      setMensaje(`Estado actualizado a ${ETIQUETAS_ESTADO[nuevo]}.`);
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo cambiar el estado.');
    }
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarPresupuesto(presupuesto.id);
      navigate('/presupuestos');
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo eliminar el presupuesto.');
    } finally {
      setConfirmando(false);
    }
  };

  const actual = presupuesto.estado;

  return (
    <section>
      <h1>Presupuesto {presupuesto.numero}</h1>
      <p style={{ marginTop: 0 }}>
        <EstadoBadge estado={estadoMostrado(presupuesto, hoyISO())} />
      </p>
      <p className="campo__ayuda">Un presupuesto emitido no se edita: puedes verlo, descargarlo, cambiar su estado o eliminarlo.</p>

      <div className="tarjeta">
        <div className="grid">
          <div>
            <h2>Emisor</h2>
            <p style={{ margin: 0 }}>
              <strong>{presupuesto.emisorSnapshot?.razonSocial}</strong>
            </p>
            <p className="campo__ayuda" style={{ margin: 0 }}>
              {presupuesto.emisorSnapshot?.nombre} · RFC {presupuesto.emisorSnapshot?.rfc}
            </p>
          </div>
          <div>
            <h2>Cliente</h2>
            <p style={{ margin: 0 }}>
              <strong>{presupuesto.clienteSnapshot?.nombre}</strong>
            </p>
            {presupuesto.clienteSnapshot?.rfc ? (
              <p className="campo__ayuda" style={{ margin: 0 }}>
                RFC {presupuesto.clienteSnapshot.rfc}
              </p>
            ) : null}
          </div>
          <div>
            <h2>Fechas</h2>
            <p style={{ margin: 0 }}>Emisión: {formatearFecha(presupuesto.fechaEmision)}</p>
            <p className="campo__ayuda" style={{ margin: 0 }}>
              Válido hasta: {formatearFecha(presupuesto.fechaValidez)}
            </p>
          </div>
        </div>
      </div>

      <div className="tarjeta">
        <h2>Líneas</h2>
        <table className="tabla">
          <thead>
            <tr>
              <th scope="col">Descripción</th>
              <th scope="col" className="num">
                Cantidad
              </th>
              <th scope="col">Unidad</th>
              <th scope="col" className="num">
                Precio
              </th>
              <th scope="col" className="num">
                Importe
              </th>
            </tr>
          </thead>
          <tbody>
            {presupuesto.lineas.map((linea) => (
              <tr key={linea.id}>
                <td>{linea.descripcion}</td>
                <td className="num">{linea.cantidad}</td>
                <td>{linea.unidad}</td>
                <td className="num">{formatearMXN(linea.precioUnitario)}</td>
                <td className="num">{formatearMXN(Math.round(linea.cantidad * linea.precioUnitario))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="totales" aria-label="Totales del presupuesto">
          <li>
            <span>Base imponible</span>
            <span>{formatearMXN(presupuesto.baseCentavos)}</span>
          </li>
          <li>
            <span>IVA (16 %)</span>
            <span>{formatearMXN(presupuesto.ivaCentavos)}</span>
          </li>
          <li>
            <span>Retención ISR (10 %)</span>
            <span>{formatearMXN(presupuesto.retencionCentavos)}</span>
          </li>
          <li className="total">
            <span>Total</span>
            <span>{formatearMXN(presupuesto.totalCentavos)}</span>
          </li>
        </ul>
      </div>

      <div className="tarjeta">
        <h2>Estado</h2>
        <div className="botonera">
          {actual !== 'aceptado' ? (
            <button type="button" onClick={() => void cambiarEstado('aceptado')}>
              Marcar aceptado
            </button>
          ) : null}
          {actual !== 'rechazado' ? (
            <button type="button" className="boton--secundario" onClick={() => void cambiarEstado('rechazado')}>
              Marcar rechazado
            </button>
          ) : null}
          {actual !== 'enviado' ? (
            <button type="button" className="boton--secundario" onClick={() => void cambiarEstado('enviado')}>
              Volver a enviado
            </button>
          ) : null}
        </div>
      </div>

      <div className="botonera">
        <button type="button" onClick={() => void descargar()}>
          Descargar PDF
        </button>
        <button type="button" className="boton--peligro" onClick={() => setConfirmando(true)}>
          Eliminar
        </button>
        <button type="button" className="boton--secundario" onClick={() => navigate('/presupuestos')}>
          Volver al historial
        </button>
      </div>

      {mensaje ? (
        <p role="status" className="campo__ayuda">
          {mensaje}
        </p>
      ) : null}

      <ConfirmDialog
        abierto={confirmando}
        titulo="Eliminar presupuesto"
        mensaje="¿Seguro que deseas eliminar este presupuesto? Su número no se reutilizará."
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={() => setConfirmando(false)}
      />
    </section>
  );
}
