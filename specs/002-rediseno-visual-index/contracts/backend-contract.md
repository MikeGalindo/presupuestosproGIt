# Contrato — Mock de backend (seam de datos)

**Feature**: `002-rediseno-visual-index` | **Date**: 2026-10-09

Extiende el contrato de la spec 001 (`specs/001-presupuestos-pdf/contracts/backend-contract.md`). Se mantienen todas las operaciones existentes y se añade una. El mock sigue exponiendo promesas con errores tipados (Principio IX); ningún consumidor conoce `localStorage`.

Implementación de referencia: `src/data/backend.ts`. Persistencia: `src/data/localStorage.ts`.

---

## Cambios

### Tipos

```ts
type EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'rechazado';
type EstadoCambiable   = 'enviado' | 'aceptado' | 'rechazado'; // lo que acepta cambiarEstado
// 'emitido' queda obsoleto; se migra a 'enviado' al leer.
```

### Presupuestos

| Operación | Firma | Errores |
|-----------|-------|---------|
| `presupuestos.listarBorradores()` | `() => Resultado<Presupuesto[]>` | `ALMACENAMIENTO` |
| `presupuestos.listarEmitidos()` | `() => Resultado<Presupuesto[]>` | `ALMACENAMIENTO` |
| `presupuestos.obtener(id)` | `(id: string) => Resultado<Presupuesto>` | `NO_ENCONTRADO`, `ALMACENAMIENTO` |
| `presupuestos.crearBorrador(datos)` | `(datos: BorradorInput) => Resultado<Presupuesto>` | `VALIDACION`, `ALMACENAMIENTO` |
| `presupuestos.guardarBorrador(id, datos)` | `(id: string, datos: BorradorInput) => Resultado<Presupuesto>` | `NO_ENCONTRADO`, `VALIDACION`, `ALMACENAMIENTO` |
| `presupuestos.eliminar(id)` | `(id: string) => Resultado<void>` | `NO_ENCONTRADO`, `ALMACENAMIENTO` |
| `presupuestos.emitir(id)` | `(id: string) => Resultado<Presupuesto>` | `NO_ENCONTRADO`, `EMISION`, `ALMACENAMIENTO` |
| **`presupuestos.cambiarEstado(id, estado)`** | **`(id: string, estado: EstadoCambiable) => Resultado<Presupuesto>`** | **`NO_ENCONTRADO`, `VALIDACION`, `ALMACENAMIENTO`** |

### Reglas de comportamiento (nuevas/afectadas)

- **`listarEmitidos()`** devuelve todo presupuesto **no borrador** (`enviado | aceptado | rechazado`), ordenado por `numero` descendente. Los borradores siguen en `listarBorradores()`.
- **`emitir(id)`** cambia `estado` a **`enviado`** (antes `emitido`); el resto (número, `fechaEmision`, snapshots, totales) no cambia.
- **`cambiarEstado(id, estado)`**:
  - Solo admite `enviado | aceptado | rechazado`; cualquier otro valor → `VALIDACION` ("Estado no válido.").
  - Sobre un presupuesto `borrador` → `VALIDACION` ("Un borrador no puede cambiar de estado por esta vía.").
  - Actualiza `estado` y `actualizadoEn`; **no** toca `numero`, snapshots ni totales.
  - Es atómico: si algo falla, no deja el presupuesto a medias.
- **Migración**: al leer, `estado === 'emitido'` se normaliza a `'enviado'` (ver `data-model.md` §2).
- **Sin `fetch`**, sin base de datos, sin variables de entorno con endpoints (Principio IX).

---

## Ejemplo de uso (consumidor)

```ts
// La UI nunca ve localStorage; solo el mock asíncrono.
const actualizado = await backend.presupuestos.cambiarEstado(id, 'aceptado');
// El store despacha `upsertPresupuesto` y la insignia se actualiza.
```
