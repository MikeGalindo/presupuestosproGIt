# Data Model — Rediseño visual y página de inicio (index)

**Feature**: `002-rediseno-visual-index` | **Date**: 2026-10-09 | **Spec**: [spec.md](./spec.md)

Este documento solo describe lo que **cambia** respecto a la spec 001. Todo lo demás (`PerfilEmisor`, `Cliente`, `Servicio`, `LineaPresupuesto`, cálculos, numeración) permanece idéntico. Referencia base: `specs/001-presupuestos-pdf/data-model.md` y `src/domain/types.ts`.

---

## 1. Estado del presupuesto

### 1.1 Estados persistidos

```ts
// Antes (spec 001):  type EstadoPresupuesto = 'borrador' | 'emitido';
// Ahora:
type EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'rechazado';
```

| Valor | Significado | Número | En historial |
|-------|-------------|--------|--------------|
| `borrador` | En edición, sin emitir | `null` | No |
| `enviado` | Emitido (PDF generado) y entregado al cliente | `AÑO-NN` | Sí |
| `aceptado` | El cliente lo aceptó | `AÑO-NN` | Sí |
| `rechazado` | El cliente lo rechazó | `AÑO-NN` | Sí |

### 1.2 Estado mostrado (calculado)

```ts
type EstadoMostrado = EstadoPresupuesto | 'caducado';
```

`caducado` **no se persiste**: se calcula con `estadoMostrado(presupuesto, hoy)`.

| Regla | Condición | Resultado |
|-------|-----------|-----------|
| Caducado | `estado === 'enviado'` **y** `fechaValidez < hoy` | `'caducado'` |
| Resto | cualquier otro caso | el propio `estado` |

- Los **borradores no caducan** (no se han emitido).
- `aceptado` y `rechazado` no caducan (ya están resueltos).

### 1.3 Transiciones admitidas

```text
crear ─────────────► borrador
borrador ──emitir──► enviado
enviado ───────────► aceptado | rechazado
aceptado ──────────► enviado | rechazado
rechazado ─────────► enviado | aceptado
(cualquiera) ──✗──► borrador      // prohibido
```

- La emisión (`presupuestos.emitir`) es la única vía a `enviado` desde `borrador`.
- El cambio de estado posterior usa `presupuestos.cambiarEstado(id, estado)` y solo admite `enviado | aceptado | rechazado`.
- Intentar volver a `borrador` o cambiar un borrador por esta vía devuelve `VALIDACION`.

### 1.4 Atributos del Presupuesto (sin cambios salvo `estado`)

| Atributo | Tipo | Cambio |
|----------|------|--------|
| `estado` | `EstadoPresupuesto` | **Modificado** (4 valores persistidos) |
| `numero` | `string \| null` | Igual |
| `clienteId` | `string` | Igual |
| `clienteSnapshot` / `emisorSnapshot` | snapshots | Igual (se fijan al emitir) |
| `lineas` | `LineaPresupuesto[]` | Igual |
| `retencionISR` | `boolean` | Igual |
| `fechaEmision` | `string \| null` | Igual |
| `fechaValidez` | `string` | Igual (alimenta el cálculo de Caducado) |
| `baseCentavos` / `ivaCentavos` / `retencionCentavos` / `totalCentavos` | `Centavos` | Igual (cálculos intactos) |
| `creadoEn` / `actualizadoEn` | `string` | Igual |

---

## 2. Migración y compatibilidad

- **Clave de almacenamiento**: sin cambios (`presupuestospro:v1`).
- **Versión del agregado**: `1` → `2`.
- **Regla de migración** en `data/localStorage.ts` (normalización al leer): cualquier `presupuesto.estado === 'emitido'` se convierte en `'enviado'`; el resto de estados válidos se conserva. Datos ausentes o inválidos caen a valores seguros.
- **Resultado**: los presupuestos ya emitidos siguen accesibles y descargables, mostrándose como **Enviado** (FR-021, SC-010). No se pierde ningún registro.

---

## 3. Vistas derivadas

- **Resumen de actividad (inicio)**: agrega `presupuestos` por `estadoMostrado` → `{ borrador, enviado, aceptado, rechazado, caducado }`, más `clientes.length` y `servicios.length`. No se persiste.
- **Listado de Emitidos** (`listarEmitidos` / `emitidos`): pasa a incluir todo presupuesto **no borrador** (`enviado | aceptado | rechazado`, y su presentación `caducado`), ordenado por número descendente.
- **Listado de Borradores**: sin cambios (`estado === 'borrador'`).

---

## 4. Validación (reglas nuevas)

| Regla | Comportamiento | Origen |
|-------|----------------|--------|
| Cambio de estado permitido | Solo `enviado \| aceptado \| rechazado` sobre presupuestos no borradores | FR-012 |
| Prohibido volver a borrador | `VALIDACION` con mensaje es-MX | FR-012 |
| Presupuesto inexistente | `NO_ENCONTRADO` | Patrón spec 001 |
| Caducado | No se guarda; se calcula al mostrar | FR-013 |
| Datos y cálculos | `calculations.ts`, `money.ts`, `numbering.ts` intactos | FR-018, SC-004 |
