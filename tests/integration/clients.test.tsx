import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { renderApp } from './utils';

describe('US2 — administrar el catálogo de clientes', () => {
  it('crea, edita y elimina un cliente con confirmación', async () => {
    const usuario = userEvent.setup();
    renderApp('/clientes');
    await screen.findByRole('heading', { name: 'Clientes' });

    // Crear.
    await usuario.click(screen.getByRole('button', { name: /nuevo cliente/i }));
    await usuario.type(screen.getByLabelText(/nombre/i), 'Cliente Uno');
    await usuario.type(screen.getByLabelText(/rfc/i), 'XAXX010101000');
    await usuario.click(screen.getByRole('button', { name: /crear cliente/i }));
    await screen.findByText(/cliente creado/i);
    expect(screen.getByRole('cell', { name: 'Cliente Uno' })).toBeInTheDocument();

    // Editar.
    await usuario.click(screen.getByRole('button', { name: 'Editar' }));
    const nombre = screen.getByLabelText(/nombre/i);
    await usuario.clear(nombre);
    await usuario.type(nombre, 'Cliente Renombrado');
    await usuario.click(screen.getByRole('button', { name: /guardar cambios/i }));
    await screen.findByText(/cliente actualizado/i);
    expect(screen.getByRole('cell', { name: 'Cliente Renombrado' })).toBeInTheDocument();

    // Eliminar con confirmación.
    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));
    await screen.findByText(/cliente eliminado/i);
    expect(screen.queryByRole('cell', { name: 'Cliente Renombrado' })).not.toBeInTheDocument();
  });
});
