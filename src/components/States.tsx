// Estados observables de pantalla: carga, vacío y error (contrato de UI).

import type { ReactNode } from 'react';

export function Cargando({ mensaje = 'Cargando…' }: { mensaje?: string }) {
  return (
    <p className="estado-carga" role="status" aria-live="polite">
      {mensaje}
    </p>
  );
}

export function EstadoVacio({ mensaje, children }: { mensaje: string; children?: ReactNode }) {
  return (
    <div className="estado-vacio">
      <p>{mensaje}</p>
      {children}
    </div>
  );
}

export function AvisoError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <div className="aviso-error" role="alert">
      <p style={{ margin: 0 }}>{mensaje}</p>
      {onReintentar ? (
        <div className="botonera">
          <button type="button" className="boton--secundario" onClick={onReintentar}>
            Reintentar
          </button>
        </div>
      ) : null}
    </div>
  );
}
