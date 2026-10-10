// Tabla de datos accesible y genérica.

import type { ReactNode } from 'react';

export interface Columna<T> {
  clave: string;
  encabezado: string;
  numerica?: boolean;
  render: (item: T) => ReactNode;
}

interface Props<T> {
  columnas: ReadonlyArray<Columna<T>>;
  filas: ReadonlyArray<T>;
  obtenerClave: (item: T) => string;
  descripcion?: string;
}

export function DataTable<T>({ columnas, filas, obtenerClave, descripcion }: Props<T>) {
  return (
    <table className="tabla">
      {descripcion ? <caption className="sr-only">{descripcion}</caption> : null}
      <thead>
        <tr>
          {columnas.map((columna) => (
            <th key={columna.clave} scope="col" className={columna.numerica ? 'num' : undefined}>
              {columna.encabezado}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={obtenerClave(fila)}>
            {columnas.map((columna) => (
              <td key={columna.clave} className={columna.numerica ? 'num' : undefined}>
                {columna.render(fila)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
