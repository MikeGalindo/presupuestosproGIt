import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderApp } from './utils';

describe('US3 — configurar la marca y el catálogo de servicios', () => {
  it('crea un servicio y lo ofrece como línea en el editor', async () => {
    const usuario = userEvent.setup();
    renderApp('/servicios');
    await screen.findByRole('heading', { name: 'Servicios' });

    await usuario.click(screen.getByRole('button', { name: /nuevo servicio/i }));
    await usuario.type(screen.getByLabelText(/nombre/i), 'Diseño de logotipo');
    await usuario.type(screen.getByLabelText(/precio unitario/i), '1500');
    await usuario.click(screen.getByRole('button', { name: /crear servicio/i }));
    await screen.findByText(/servicio creado/i);
    expect(screen.getByRole('cell', { name: 'Diseño de logotipo' })).toBeInTheDocument();

    // Ir al editor y añadir una línea desde el catálogo.
    await usuario.click(screen.getByRole('link', { name: 'Presupuestos' }));
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });
    await usuario.click(screen.getByRole('link', { name: /nuevo presupuesto/i }));
    await screen.findByRole('heading', { name: /nuevo presupuesto/i });

    const selector = screen.getByLabelText('Añadir desde catálogo');
    await usuario.selectOptions(selector, screen.getByRole('option', { name: /Diseño de logotipo/ }));

    const descripcion = await screen.findByLabelText(/descripción 1/i);
    expect(descripcion).toHaveValue('Diseño de logotipo');
    expect(screen.getByLabelText(/precio unitario/i)).toHaveValue(1500);
  });

  it('guarda el perfil del emisor con sus datos de marca', async () => {
    const usuario = userEvent.setup();
    renderApp('/perfil');
    await usuario.type(await screen.findByLabelText(/^nombre/i), 'Ana');
    await usuario.type(screen.getByLabelText(/^razón social/i), 'Ana Dev');
    await usuario.type(screen.getByLabelText(/^rfc/i), 'AADD800101XXX');
    await usuario.click(screen.getByRole('button', { name: /guardar perfil/i }));
    await screen.findByText(/perfil guardado/i);
  });
});
