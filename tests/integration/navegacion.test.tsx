import { beforeEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { limpiarAlmacenamiento } from '../../src/data/localStorage';
import { renderApp } from './utils';

describe('US2 — navegación común', () => {
  beforeEach(() => {
    limpiarAlmacenamiento();
  });

  it('muestra las cuatro secciones y marca la sección activa', async () => {
    renderApp('/clientes');
    await screen.findByRole('heading', { name: 'Clientes' });

    const nav = screen.getByRole('navigation', { name: /navegación principal/i });
    expect(within(nav).getByRole('link', { name: 'Presupuestos' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Clientes' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Catálogo' })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Perfil' })).toBeInTheDocument();
  });

  it('navega entre secciones sin usar el botón atrás', async () => {
    const usuario = userEvent.setup();
    renderApp('/');
    const nav = await screen.findByRole('navigation', { name: /navegación principal/i });

    await usuario.click(within(nav).getByRole('link', { name: 'Clientes' }));
    expect(await screen.findByRole('heading', { name: 'Clientes' })).toBeInTheDocument();

    await usuario.click(within(nav).getByRole('link', { name: 'Catálogo' }));
    expect(await screen.findByRole('heading', { name: 'Servicios' })).toBeInTheDocument();
  });

  it('alterna Emitidos y Borradores con la sub-navegación', async () => {
    const usuario = userEvent.setup();
    renderApp('/presupuestos');
    await screen.findByRole('heading', { name: /presupuestos emitidos/i });

    const subnav = screen.getByRole('navigation', { name: /secciones de presupuestos/i });
    await usuario.click(within(subnav).getByRole('link', { name: 'Borradores' }));

    expect(await screen.findByRole('heading', { name: 'Borradores' })).toBeInTheDocument();
  });
});
