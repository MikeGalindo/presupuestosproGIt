// Página de inicio (index): punto de entrada con accesos a las cuatro secciones
// y un resumen de actividad — FR-001…FR-004.

import { Link } from 'react-router-dom';
import { AvisoError, Cargando } from '../../components';
import { useStore } from '../../data/store';
import { ESTADOS_MOSTRADOS, ETIQUETAS_ESTADO } from '../../domain/estados';
import { hoyISO } from '../../lib/dates';
import { resumenActividad } from './resumen';

const ACCESOS = [
  { a: '/presupuestos', titulo: 'Presupuestos', desc: 'Crea, emite y consulta tus presupuestos.' },
  { a: '/clientes', titulo: 'Clientes', desc: 'Administra tu catálogo de clientes.' },
  { a: '/servicios', titulo: 'Catálogo', desc: 'Tus servicios con su precio habitual.' },
  { a: '/perfil', titulo: 'Perfil', desc: 'Tu marca y tus datos fiscales.' },
];

export function HomePage() {
  const { presupuestos, clientes, servicios, cargando, error, recargar } = useStore();

  if (cargando) return <Cargando mensaje="Cargando inicio…" />;
  if (error) return <AvisoError mensaje={error} onReintentar={() => void recargar()} />;

  const resumen = resumenActividad(presupuestos, clientes.length, servicios.length, hoyISO());
  const sinDatos = presupuestos.length === 0 && clientes.length === 0 && servicios.length === 0;

  return (
    <section>
      <h1>Inicio</h1>
      <p className="inicio__intro">
        Tu centro de trabajo. Entra a cualquier sección y revisa de un vistazo cómo van tus
        presupuestos.
      </p>

      <div className="accesos" data-testid="accesos">
        {ACCESOS.map((acceso) => (
          <Link key={acceso.a} to={acceso.a} className="acceso">
            <span className="acceso__titulo">{acceso.titulo}</span>
            <span className="acceso__desc">{acceso.desc}</span>
          </Link>
        ))}
      </div>

      <h2>Resumen de actividad</h2>
      <ul className="resumen__lista" aria-label="Resumen de actividad">
        {ESTADOS_MOSTRADOS.map((estado) => (
          <li key={estado} className="resumen__item">
            <span className={`insignia insignia--${estado}`}>{ETIQUETAS_ESTADO[estado]}</span>
            <span className="resumen__valor" data-testid={`resumen-${estado}`}>
              {resumen.porEstado[estado]}
            </span>
          </li>
        ))}
        <li className="resumen__item">
          <span className="campo__ayuda">Clientes</span>
          <span className="resumen__valor" data-testid="resumen-clientes">
            {resumen.clientes}
          </span>
        </li>
        <li className="resumen__item">
          <span className="campo__ayuda">Servicios</span>
          <span className="resumen__valor" data-testid="resumen-servicios">
            {resumen.servicios}
          </span>
        </li>
      </ul>

      {sinDatos ? (
        <div className="estado-vacio">
          <p>Aún no tienes datos. Empieza configurando tu perfil o creando tu primer presupuesto.</p>
          <div className="botonera" style={{ justifyContent: 'center' }}>
            <Link className="boton" to="/perfil">
              Configurar mi perfil
            </Link>
            <Link className="boton boton--secundario" to="/presupuestos/nuevo">
              Crear un presupuesto
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
