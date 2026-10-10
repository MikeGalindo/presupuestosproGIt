// Layout de la aplicación: cabecera con navegación común + contenido de la ruta.
// Cuatro secciones (Presupuestos, Clientes, Catálogo, Perfil) — FR-002, FR-005.

import { Link, Outlet, useLocation } from 'react-router-dom';

interface Enlace {
  a: string;
  texto: string;
  /** Prefijos de ruta que activan el enlace (la sección Presupuestos incluye Borradores). */
  prefijos: string[];
}

const enlaces: Enlace[] = [
  { a: '/presupuestos', texto: 'Presupuestos', prefijos: ['/presupuestos', '/borradores'] },
  { a: '/clientes', texto: 'Clientes', prefijos: ['/clientes'] },
  { a: '/servicios', texto: 'Catálogo', prefijos: ['/servicios'] },
  { a: '/perfil', texto: 'Perfil', prefijos: ['/perfil'] },
];

function esActivo(pathname: string, prefijos: string[]): boolean {
  return prefijos.some((prefijo) => pathname === prefijo || pathname.startsWith(`${prefijo}/`));
}

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="app">
      <header className="encabezado">
        <Link to="/" className="encabezado__marca" style={{ color: 'inherit', textDecoration: 'none' }}>
          PresupuestosPro
        </Link>
        <nav className="encabezado__nav" aria-label="Navegación principal">
          {enlaces.map((enlace) => {
            const activo = esActivo(pathname, enlace.prefijos);
            return (
              <Link
                key={enlace.a}
                to={enlace.a}
                className={activo ? 'activo' : undefined}
                aria-current={activo ? 'page' : undefined}
              >
                {enlace.texto}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
      <footer className="pie">Hecho para freelancers en México · Montos en MXN</footer>
    </div>
  );
}
