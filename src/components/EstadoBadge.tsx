// Insignia de estado del presupuesto: color + etiqueta + forma (no solo color) — FR-011, SC-006.

import { ETIQUETAS_ESTADO } from '../domain/estados';
import type { EstadoMostrado } from '../domain/types';

const FORMA: Record<EstadoMostrado, string> = {
  borrador: '○',
  enviado: '↗',
  aceptado: '✓',
  rechazado: '✕',
  caducado: '⏱',
};

export function EstadoBadge({ estado }: { estado: EstadoMostrado }) {
  return (
    <span className={`insignia insignia--${estado}`}>
      <span className="insignia__forma" aria-hidden="true">
        {FORMA[estado]}
      </span>
      {ETIQUETAS_ESTADO[estado]}
    </span>
  );
}
