// Totales en vivo: base, IVA, retención (ISR) y total — FR-006/FR-007.

import { calcularTotales } from '../../domain/calculations';
import { formatearMXN } from '../../domain/money';
import type { LineaPresupuesto } from '../../domain/types';

interface Props {
  lineas: ReadonlyArray<LineaPresupuesto>;
  retencionISR: boolean;
  onCambiarRetencion: (valor: boolean) => void;
}

export function BudgetTotals({ lineas, retencionISR, onCambiarRetencion }: Props) {
  const { baseCentavos, ivaCentavos, retencionCentavos, totalCentavos } = calcularTotales(lineas, retencionISR);

  return (
    <div className="tarjeta">
      <h2>Totales</h2>
      <label className="conmutador">
        <input
          type="checkbox"
          checked={retencionISR}
          onChange={(evento) => onCambiarRetencion(evento.target.checked)}
        />
        Aplicar retención de ISR (10 %)
      </label>

      <ul className="totales" aria-label="Resumen de totales">
        <li>
          <span>Base imponible</span>
          <span data-testid="total-base">{formatearMXN(baseCentavos)}</span>
        </li>
        <li>
          <span>IVA (16 %)</span>
          <span data-testid="total-iva">{formatearMXN(ivaCentavos)}</span>
        </li>
        <li>
          <span>Retención ISR (10 %)</span>
          <span data-testid="total-retencion">{formatearMXN(retencionCentavos)}</span>
        </li>
        <li className="total">
          <span>Total</span>
          <span data-testid="total-total">{formatearMXN(totalCentavos)}</span>
        </li>
      </ul>
    </div>
  );
}
