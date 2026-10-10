// Historial de presupuestos emitidos — FR-012, FR-011.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AvisoError,
  Cargando,
  DataTable,
  EstadoBadge,
  EstadoVacio,
  type Columna,
} from '../../components';
import { useStore } from '../../data/store';
import { estadoMostrado } from '../../domain/estados';
import { formatearMXN } from '../../domain/money';
import { formatearFecha, hoyISO } from '../../lib/dates';
import type { Presupuesto } from '../../domain/types';
import { descargarPdf } from '../pdf/download';
import { PresupuestosSubnav } from './PresupuestosSubnav';

export function HistoryPage() {
  const { emitidos, cargando, error, recargar } = useStore();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const hoy = hoyISO();

  const descargar = async (presupuesto: Presupuesto) => {
    try {
      await descargarPdf(presupuesto);
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo descargar el PDF.');
    }
  };

  const columnas: Columna<Presupuesto>[] = [
    { clave: 'numero', encabezado: 'Número', render: (p) => <strong>{p.numero}</strong> },
    { clave: 'cliente', encabezado: 'Cliente', render: (p) => p.clienteSnapshot?.nombre ?? '—' },
    {
      clave: 'estado',
      encabezado: 'Estado',
      render: (p) => <EstadoBadge estado={estadoMostrado(p, hoy)} />,
    },
    { clave: 'fecha', encabezado: 'Fecha', render: (p) => formatearFecha(p.fechaEmision) },
    { clave: 'total', encabezado: 'Total', numerica: true, render: (p) => formatearMXN(p.totalCentavos) },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      render: (p) => (
        <div className="botonera">
          <button type="button" className="boton--secundario" onClick={() => navigate(`/presupuestos/${p.id}`)}>
            Ver detalle
          </button>
          <button type="button" onClick={() => void descargar(p)}>
            Descargar PDF
          </button>
        </div>
      ),
    },
  ];

  if (cargando) return <Cargando mensaje="Cargando historial…" />;
  if (error) return <AvisoError mensaje={error} onReintentar={() => void recargar()} />;

  return (
    <section>
      <h1>Presupuestos emitidos</h1>
      <PresupuestosSubnav />

      <div className="botonera">
        <Link className="boton" to="/presupuestos/nuevo">
          Nuevo presupuesto
        </Link>
      </div>

      {mensaje ? (
        <p role="status" className="campo__ayuda">
          {mensaje}
        </p>
      ) : null}

      <div className="tarjeta">
        {emitidos.length === 0 ? (
          <EstadoVacio mensaje="Aún no has emitido presupuestos.">
            <Link className="boton" to="/presupuestos/nuevo">
              Crear el primero
            </Link>
          </EstadoVacio>
        ) : (
          <DataTable columnas={columnas} filas={emitidos} obtenerClave={(p) => p.id} descripcion="Historial de presupuestos emitidos" />
        )}
      </div>
    </section>
  );
}
