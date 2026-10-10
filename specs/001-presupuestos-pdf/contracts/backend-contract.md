# Contrato — Mock de backend (seam de datos)

**Feature**: `001-presupuestos-pdf` | **Date**: 2026-10-08

El mock de backend expone la **misma interfaz que un backend real**: operaciones asíncronas que devuelven promesas y que pueden fallar con errores tipados (Principio IX). Ningún consumidor conoce `localStorage`. Sustituir este módulo por un backend real no debe requerir cambios en los consumidores.

Implementación de referencia: `src/data/backend.ts`. Persistencia: `src/data/localStorage.ts`.

---

## Tipos

```ts
type Centavos = number; // entero

type Resultado<T> = Promise<T>; // rechaza con BackendError

interface BackendError extends Error {
  code: 'VALIDACION' | 'NO_ENCONTRADO' | 'ALMACENAMIENTO' | 'EMISION';
  detalle?: Record<string, string>;
}
```

---

## Operaciones

### Perfil del emisor

| Operación | Firma | Errores |
|-----------|-------|---------|
| `perfil.obtener()` | `() => Resultado<PerfilEmisor \| null>` | `ALMACENAMIENTO` |
| `perfil.guardar(datos)` | `(datos: PerfilEmisorInput) => Resultado<PerfilEmisor>` | `VALIDACION` (nombre/RS/RFC), `ALMACENAMIENTO` |

### Clientes

| Operación | Firma | Errores |
|-----------|-------|---------|
| `clientes.listar()` | `() => Resultado<Cliente[]>` | `ALMACENAMIENTO` |
| `clientes.crear(datos)` | `(datos: ClienteInput) => Resultado<Cliente>` | `VALIDACION` (nombre), `ALMACENAMIENTO` |
| `clientes.actualizar(id, datos)` | `(id: string, datos: ClienteInput) => Resultado<Cliente>` | `NO_ENCONTRADO`, `VALIDACION`, `ALMACENAMIENTO` |
| `clientes.eliminar(id)` | `(id: string) => Resultado<void>` | `NO_ENCONTRADO`, `ALMACENAMIENTO` |

### Servicios

| Operación | Firma | Errores |
|-----------|-------|---------|
| `servicios.listar()` | `() => Resultado<Servicio[]>` | `ALMACENAMIENTO` |
| `servicios.crear(datos)` | `(datos: ServicioInput) => Resultado<Servicio>` | `VALIDACION` (nombre, precio ≥ 0), `ALMACENAMIENTO` |
| `servicios.actualizar(id, datos)` | `(id: string, datos: ServicioInput) => Resultado<Servicio>` | `NO_ENCONTRADO`, `VALIDACION`, `ALMACENAMIENTO` |
| `servicios.eliminar(id)` | `(id: string) => Resultado<void>` | `NO_ENCONTRADO`, `ALMACENAMIENTO` |

### Presupuestos

| Operación | Firma | Errores |
|-----------|-------|---------|
| `presupuestos.listarBorradores()` | `() => Resultado<Presupuesto[]>` | `ALMACENAMIENTO` |
| `presupuestos.listarEmitidos()` | `() => Resultado<Presupuesto[]>` | `ALMACENAMIENTO` |
| `presupuestos.obtener(id)` | `(id: string) => Resultado<Presupuesto>` | `NO_ENCONTRADO`, `ALMACENAMIENTO` |
| `presupuestos.crearBorrador(datos)` | `(datos: BorradorInput) => Resultado<Presupuesto>` | `VALIDACION` (cliente, líneas), `ALMACENAMIENTO` |
| `presupuestos.guardarBorrador(id, datos)` | `(id: string, datos: BorradorInput) => Resultado<Presupuesto>` | `NO_ENCONTRADO`, `VALIDACION`, `ALMACENAMIENTO` |
| `presupuestos.eliminar(id)` | `(id: string) => Resultado<void>` | `NO_ENCONTRADO`, `ALMACENAMIENTO` |
| `presupuestos.emitir(id)` | `(id: string) => Resultado<Presupuesto>` | `NO_ENCONTRADO`, `EMISION` (sin líneas / emisor o cliente incompletos), `ALMACENAMIENTO` |

---

## Reglas de comportamiento

- **Todo asíncrono**: cada operación devuelve una promesa; la UI muestra estados de carga y de error.
- **Validación en el backend**: las reglas de `domain/validation.ts` se aplican también aquí; un `VALIDACION` incluye `detalle` por campo.
- **`emitir(id)`** es atómico: valida (FR-011, FR-018), asigna `numero` (FR-008), `fechaEmision` y los snapshots (FR-013), calcula los totales (FR-006) y cambia `estado` a `emitido`. Si algo falla, no deja el presupuesto a medias.
- **`eliminar(id)`** no reutiliza números de presupuestos emitidos (FR-008).
- **Sin `fetch`**: prohibido llamar a URLs reales, usar base de datos o leer variables de entorno con endpoints (Principio IX).
- **Latencia simulada**: opcional y pequeña, para ejercitar los estados de carga sin entorpecer el objetivo de < 5 minutos.
