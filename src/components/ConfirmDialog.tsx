// Diálogo de confirmación accesible (sin dependencia del elemento <dialog> nativo).

import { useEffect, useRef } from 'react';

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Eliminar',
  onConfirmar,
  onCancelar,
}: Props) {
  const refConfirmar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (abierto) {
      refConfirmar.current?.focus();
    }
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const alEscribir = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCancelar();
    };
    document.addEventListener('keydown', alEscribir);
    return () => document.removeEventListener('keydown', alEscribir);
  }, [abierto, onCancelar]);

  if (!abierto) return null;

  return (
    <div className="dialogo-fondo">
      <div className="dialogo" role="dialog" aria-modal="true" aria-label={titulo}>
        <h2 style={{ marginTop: 0 }}>{titulo}</h2>
        <p>{mensaje}</p>
        <div className="botonera">
          <button type="button" className="boton--secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button ref={refConfirmar} type="button" className="boton--peligro" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
