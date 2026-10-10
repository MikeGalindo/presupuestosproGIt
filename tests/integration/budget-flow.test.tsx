import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderApp } from './utils';

vi.mock('../../src/features/pdf/download', () => ({
  descargarPdf: vi.fn().mockResolvedValue(undefined),
  nombreArchivoPdf: vi.fn(() => 'presupuesto.pdf'),
}));

// Importado después del mock para obtener la función simulada.
import { descargarPdf } from '../../src/features/pdf/download';

describe('US1 — emitir un presupuesto y descargarlo en PDF', () => {
  it('calcula impuestos, guarda borrador y emite descargando el PDF', async () => {
    const usuario = userEvent.setup();
    renderApp('/perfil');

    // 1. Perfil del emisor.
    await usuario.type(await screen.findByLabelText(/^nombre/i), 'Ana');
    await usuario.type(screen.getByLabelText(/^razón social/i), 'Ana Dev');
    await usuario.type(screen.getByLabelText(/^rfc/i), 'AADD800101XXX');
    await usuario.click(screen.getByRole('button', { name: /guardar perfil/i }));
    await screen.findByText(/perfil guardado/i);

    // 2. Cliente.
    await usuario.click(screen.getByRole('link', { name: 'Clientes' }));
    await screen.findByRole('heading', { name: 'Clientes' });
    await usuario.click(screen.getByRole('button', { name: /nuevo cliente/i }));
    await usuario.type(screen.getByLabelText(/nombre/i), 'Cliente Demo');
    await usuario.click(screen.getByRole('button', { name: /crear cliente/i }));
    await screen.findByText(/cliente creado/i);

    // 3. Editor de presupuesto.
    await usuario.click(screen.getByRole('link', { name: 'Presupuestos' }));
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });
    await usuario.click(screen.getByRole('link', { name: /nuevo presupuesto/i }));
    await screen.findByRole('heading', { name: /nuevo presupuesto/i });

    await usuario.selectOptions(
      screen.getByLabelText(/^cliente/i),
      screen.getByRole('option', { name: 'Cliente Demo' }),
    );

    // 4. Línea manual 2 × $1,000.00.
    await usuario.click(screen.getByRole('button', { name: /añadir línea manual/i }));
    await usuario.type(screen.getByLabelText(/descripción 1/i), 'Diseño de logo');
    const cantidad = screen.getByLabelText(/cantidad/i);
    await usuario.clear(cantidad);
    await usuario.type(cantidad, '2');
    const precio = screen.getByLabelText(/precio unitario/i);
    await usuario.clear(precio);
    await usuario.type(precio, '1000');

    // 5. Totales: base 2000, IVA 320, total 2320.
    expect(screen.getByTestId('total-base')).toHaveTextContent('$2,000.00');
    expect(screen.getByTestId('total-iva')).toHaveTextContent('$320.00');
    expect(screen.getByTestId('total-total')).toHaveTextContent('$2,320.00');

    // 6. Retención de ISR: 200 y total 2120.
    await usuario.click(screen.getByLabelText(/retención de isr/i));
    expect(screen.getByTestId('total-retencion')).toHaveTextContent('$200.00');
    expect(screen.getByTestId('total-total')).toHaveTextContent('$2,120.00');

    // 7. Guardar borrador.
    await usuario.click(screen.getByRole('button', { name: /guardar borrador/i }));
    await screen.findByText(/borrador guardado/i);

    // 8. Emitir y descargar PDF.
    await usuario.click(screen.getByRole('button', { name: /emitir y descargar pdf/i }));
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });
    const anio = new Date().getFullYear();
    expect(await screen.findByText(`${anio}-01`)).toBeInTheDocument();
    expect(descargarPdf).toHaveBeenCalledTimes(1);
  });

  it('impide emitir un presupuesto sin líneas y muestra un aviso', async () => {
    const usuario = userEvent.setup();
    renderApp('/presupuestos/nuevo');
    await screen.findByRole('heading', { name: /nuevo presupuesto/i });

    expect(screen.getByRole('button', { name: /emitir y descargar pdf/i })).toBeDisabled();
    expect(screen.getByText(/añade al menos una línea/i)).toBeInTheDocument();
  });
});
