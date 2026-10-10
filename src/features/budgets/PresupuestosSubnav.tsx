// Sub-navegación interna de la sección Presupuestos (Emitidos | Borradores) — FR-005.

import { NavLink } from 'react-router-dom';

const pestanas = [
  { a: '/presupuestos', texto: 'Emitidos' },
  { a: '/borradores', texto: 'Borradores' },
];

export function PresupuestosSubnav() {
  return (
    <nav className="subnav" aria-label="Secciones de presupuestos">
      {pestanas.map((pestana) => (
        <NavLink
          key={pestana.a}
          to={pestana.a}
          end
          className={({ isActive }) => (isActive ? 'activo' : undefined)}
        >
          {pestana.texto}
        </NavLink>
      ))}
    </nav>
  );
}
