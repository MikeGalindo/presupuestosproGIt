import { beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { limpiarAlmacenamiento } from '../../src/data/localStorage';
import { renderApp, sembrarEmitido } from './utils';

describe('US1 — página de inicio', () => {
  beforeEach(() => {
    limpiarAlmacenamiento();
  });

  it('muestra la página de inicio con accesos a las cuatro secciones y estado vacío', async () => {
    renderApp('/');

    await screen.findByRole('heading', { name: 'Inicio' });
    const accesos = screen.getByTestId('accesos');
    expect(within(accesos).getByRole('link', { name: /^presupuestos/i })).toBeInTheDocument();
    expect(within(accesos).getByRole('link', { name: /^clientes/i })).toBeInTheDocument();
    expect(within(accesos).getByRole('link', { name: /^catálogo/i })).toBeInTheDocument();
    expect(within(accesos).getByRole('link', { name: /^perfil/i })).toBeInTheDocument();

    expect(await screen.findByText(/aún no tienes datos/i)).toBeInTheDocument();
    expect(screen.getByTestId('resumen-borrador')).toHaveTextContent('0');
  });

  it('resume la actividad por estado con datos existentes', async () => {
    await sembrarEmitido('Cliente Uno');
    renderApp('/');

    await screen.findByRole('heading', { name: 'Inicio' });
    expect(await screen.findByTestId('resumen-enviado')).toHaveTextContent('1');
    expect(screen.getByTestId('resumen-borrador')).toHaveTextContent('0');
    expect(screen.queryByText(/aún no tienes datos/i)).not.toBeInTheDocument();
  });
});
