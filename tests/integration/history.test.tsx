import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { renderApp, sembrarEmitido } from './utils';

vi.mock('../../src/features/pdf/download', () => ({
  descargarPdf: vi.fn().mockResolvedValue(undefined),
  nombreArchivoPdf: vi.fn(() => 'presupuesto.pdf'),
}));

import { descargarPdf } from '../../src/features/pdf/download';

describe('US4 — consultar y gestionar el historial', () => {
  it('lista los emitidos, abre el detalle, descarga y elimina', async () => {
    const primero = await sembrarEmitido('Cliente Uno');
    const segundo = await sembrarEmitido('Cliente Dos');

    const usuario = userEvent.setup();
    renderApp('/presupuestos');
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });

    const anio = new Date().getFullYear();
    expect(await screen.findByText(`${anio}-01`)).toBeInTheDocument();
    expect(screen.getByText(`${anio}-02`)).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Cliente Uno' })).toBeInTheDocument();

    // Descargar PDF de la primera fila.
    const filaPrimero = screen.getByRole('row', { name: new RegExp(primero.numero ?? '') });
    await usuario.click(within(filaPrimero).getByRole('button', { name: /descargar pdf/i }));
    expect(descargarPdf).toHaveBeenCalledTimes(1);

    // Ver detalle.
    await usuario.click(within(filaPrimero).getByRole('button', { name: /ver detalle/i }));
    await screen.findByRole('heading', { name: new RegExp(`presupuesto ${primero.numero}`, 'i') });

    // Volver, abrir el detalle del segundo y eliminarlo.
    await usuario.click(screen.getByRole('button', { name: /volver al historial/i }));
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });
    const filaSegundo = screen.getByRole('row', { name: new RegExp(segundo.numero ?? '') });
    await usuario.click(within(filaSegundo).getByRole('button', { name: /ver detalle/i }));
    await screen.findByRole('heading', { name: new RegExp(`presupuesto ${segundo.numero}`, 'i') });
    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));

    await screen.findByRole('heading', { name: /presupuestos emitidos/i });
    expect(await screen.findByText(`${anio}-01`)).toBeInTheDocument();
    expect(screen.queryByText(`${anio}-02`)).not.toBeInTheDocument();
  });
});
