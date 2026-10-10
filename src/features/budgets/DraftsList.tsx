// Lista de borradores — FR-017. Retomar o eliminar (sin número asignado).

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AvisoError, Cargando, ConfirmDialog, DataTable, EstadoVacio, type Columna } from '../../components';
import { useStore } from '../../data/store';
import { formatearMXN } from '../../domain/money';
import { formatearFecha } from '../../lib/dates';
import type { Presupuesto } from '../../domain/types';
import { PresupuestosSubnav } from './PresupuestosSubnav';

export function DraftsList() {
  const { borradores, clientes, cargando, error, recargar, eliminarPresupuesto } = useStore();
  const navigate = useNavigate();
  const [aEliminar, setAEliminar] = useState<Presupuesto | null>(null);

  const nombreCliente = (presupuesto: Presupuesto) => {
    const cliente = clientes.find((c) => c.id === presupuesto.clienteId);
    return cliente?.nombre ?? 'Sin cliente';
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    try {
      await eliminarPresupuesto(aEliminar.id);
    } finally {
      setAEliminar(null);
    }
  };

  const columnas: Columna<Presupuesto>[] = [
    { clave: 'cliente', encabezado: 'Cliente', render: (p) => nombreCliente(p) },
    { clave: 'lineas', encabezado: 'Líneas', numerica: true, render: (p) => p.lineas.length },
    { clave: 'total', encabezado: 'Total', numerica: true, render: (p) => formatearMXN(p.totalCentavos) },
    { clave: 'actualizado', encabezado: 'Última edición', render: (p) => formatearFecha(p.actualizadoEn) },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      render: (p) => (
        <div className="botonera">
          <button type="button" onClick={() => navigate(`/borradores/${p.id}`)}>
            Retomar
          </button>
          <button type="button" className="boton--peligro" onClick={() => setAEliminar(p)}>
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  if (cargando) return <Cargando mensaje="Cargando borradores…" />;
  if (error) return <AvisoError mensaje={error} onReintentar={() => void recargar()} />;

  return (
    <section>
      <h1>Borradores</h1>
      <PresupuestosSubnav />
      <p className="campo__ayuda">Los borradores no tienen número ni aparecen en el historial hasta que se emiten.</p>

      <div className="tarjeta">
        {borradores.length === 0 ? (
          <EstadoVacio mensaje="No tienes borradores guardados.">
            <Link className="boton" to="/presupuestos/nuevo">
              Crear un presupuesto
            </Link>
          </EstadoVacio>
        ) : (
          <DataTable columnas={columnas} filas={borradores} obtenerClave={(p) => p.id} descripcion="Lista de borradores" />
        )}
      </div>

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Eliminar borrador"
        mensaje="¿Seguro que deseas eliminar este borrador? No consume ningún número."
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={() => setAEliminar(null)}
      />
    </section>
  );
}
