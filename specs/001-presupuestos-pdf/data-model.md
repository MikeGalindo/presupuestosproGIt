# Phase 1 — Data Model: PresupuestosPro

**Feature**: `001-presupuestos-pdf` | **Date**: 2026-10-08 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Modelo de dominio en TypeScript. Todos los montos se almacenan y calculan como **enteros de centavos** (`Centavos = number`) y solo se formatean a MXN en la capa de presentación. Todas las fechas se almacenan como cadenas ISO `YYYY-MM-DD`.

---

## Entidades

### PerfilEmisor (único registro)

Datos del freelancer que firma el presupuesto. Corresponde a FR-001.

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `id` | `string` | sí | UUID; único |
| `nombre` | `string` | sí | No vacío |
| `razonSocial` | `string` | sí | No vacío |
| `rfc` | `string` | sí | No vacío (no se valida contra el SAT) |
| `correo` | `string` | no | Si existe, formato de correo válido |
| `telefono` | `string` | no | Texto libre |
| `direccion` | `string` | no | Texto libre |
| `logo` | `string` (data URL) | no | Imagen; tamaño ≤ ~1 MB |
| `actualizadoEn` | `string` (ISO) | sí | Se actualiza al guardar |

**Invariante**: existe a lo sumo un `PerfilEmisor`. Requerido para emitir (FR-018).

### Cliente

Destinatario del presupuesto. Corresponde a FR-002.

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `id` | `string` | sí | UUID; único |
| `nombre` | `string` | sí | No vacío (nombre o razón social) |
| `rfc` | `string` | no | Texto libre |
| `correo` | `string` | no | Si existe, formato válido |
| `telefono` | `string` | no | Texto libre |
| `direccion` | `string` | no | Texto libre |
| `creadoEn` / `actualizadoEn` | `string` (ISO) | sí | Auditoría local |

**Relaciones**: un emisor tiene 0..N clientes. Un cliente puede estar referenciado por 0..N presupuestos (vía snapshot).

### Servicio

Concepto habitual del catálogo. Corresponde a FR-003.

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `id` | `string` | sí | UUID; único |
| `nombre` | `string` | sí | No vacío |
| `descripcion` | `string` | no | Texto libre |
| `precioUnitario` | `Centavos` | sí | ≥ 0 |
| `unidad` | `string` | sí | Texto libre con sugerencias (hora, pieza, proyecto, servicio, mes); por defecto `"servicio"` |
| `creadoEn` / `actualizadoEn` | `string` (ISO) | sí | Auditoría local |

**Relaciones**: un emisor tiene 0..N servicios. Eliminar un servicio **no** altera presupuestos ya emitidos (FR-013).

### Presupuesto

Documento comercial con estado. Corresponde a FR-004…FR-018.

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `id` | `string` | sí | UUID; único |
| `estado` | `"borrador" \| "emitido"` | sí | Inicia en `borrador` |
| `numero` | `string \| null` | — | `null` en borrador; `YYYY-NN` al emitir (FR-008) |
| `clienteId` | `string` | sí | Referencia a un cliente existente |
| `clienteSnapshot` | `ClienteSnapshot \| null` | — | Fijado al emitir (FR-013) |
| `emisorSnapshot` | `EmisorSnapshot \| null` | — | Fijado al emitir (FR-013) |
| `lineas` | `LineaPresupuesto[]` | sí | Puede estar vacío en borrador; ≥ 1 para emitir (FR-011) |
| `retencionISR` | `boolean` | sí | Por defecto `false` (FR-007) |
| `fechaEmision` | `string \| null` | — | `null` en borrador; ISO `YYYY-MM-DD` al emitir |
| `fechaValidez` | `string` (ISO) | sí | Por defecto emisión + 30 días; editable (FR-009) |
| `baseCentavos` | `Centavos` | derivado | `Σ importe` (FR-006) |
| `ivaCentavos` | `Centavos` | derivado | `round(base × 0.16)` (FR-006/007) |
| `retencionCentavos` | `Centavos` | derivado | `retencionISR ? round(base × 0.10) : 0` (FR-006/007) |
| `totalCentavos` | `Centavos` | derivado | `base + iva − retencion` (FR-006) |
| `creadoEn` / `actualizadoEn` | `string` (ISO) | sí | Auditoría local |

**Snapshots** (inmutables tras emitir):

- `EmisorSnapshot`: `nombre`, `razonSocial`, `rfc`, `correo`, `telefono`, `direccion`, `logo`.
- `ClienteSnapshot`: `nombre`, `rfc`, `correo`, `telefono`, `direccion`.

### LineaPresupuesto

Renglón del presupuesto. Corresponde a FR-005.

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `id` | `string` | sí | UUID; único dentro del presupuesto |
| `descripcion` | `string` | sí | No vacío |
| `cantidad` | `number` | sí | > 0 (FR-016) |
| `unidad` | `string` | sí | Texto libre con sugerencias |
| `precioUnitario` | `Centavos` | sí | ≥ 0 (0 permitido, p. ej. cortesía) |
| `importeCentavos` | `Centavos` | derivado | `round(cantidad × precioUnitario)` |
| `origen` | `"catalogo" \| "manual"` | sí | `catalogo` si proviene de un `Servicio`; `manual` si se escribió a mano (CL2) |
| `servicioId` | `string \| null` | no | Referencia informativa al servicio de origen |

---

## Transiciones de estado

```text
                 guardar borrador                 emitir (FR-008, FR-011, FR-018)
   (nuevo) ───────────────────────▶ borrador ────────────────────────────────▶ emitido
      │                                │                                          │
      │ eliminar                       │ eliminar                                 │ eliminar
      ▼                                ▼                                          ▼
   (descartado)                  (descartado)                              (histórico; el número NO se reutiliza)
```

- **borrador → emitido**: irreversible. Requiere emisor válido, cliente válido y ≥ 1 línea. Asigna `numero`, `fechaEmision` y los snapshots, y fija los totales.
- **borrador → eliminado**: no consume número (aún no tiene).
- **emitido → eliminado**: el registro desaparece, pero su `numero` no se reutiliza (FR-008, SC-003).
- Un presupuesto **emitido no se edita**; solo ver, descargar PDF y eliminar (FR-012, decisión del usuario).

---

## Reglas de numeración

- Formato: `YYYY-NN` (ej. `2026-01`), `NN` con `padStart(2, '0')`.
- Se calcula al emitir: `max(NN de presupuestos emitidos con el mismo año) + 1`; si no hay ninguno ese año, `01`.
- Reinicia cada año natural (FR-008). Nunca se reutiliza un número eliminado.
- Si el año supera 99, el número crece de dígitos de forma natural (`2026-100`).

---

## Reglas de cálculo (referencia)

Con `b = baseCentavos`:

- `iva = Math.round(b * 16 / 100)`
- `retencion = retencionISR ? Math.round(b * 10 / 100) : 0`
- `total = b + iva − retencion`

Ejemplo verificado (User Story 1): línea `2 × $1,000.00` → base `$2,000.00`, IVA `$320.00`, retención (activa) `$200.00`, total `$2,120.00`.

---

## Reglas de validación (resumen)

| Regla | Origen |
|-------|--------|
| Emisor: `nombre`, `razonSocial`, `rfc` no vacíos | FR-001, FR-018 |
| Cliente: `nombre` no vacío | FR-002, FR-018 |
| Servicio: `nombre` no vacío; `precioUnitario` ≥ 0 | FR-003 |
| Línea: `descripcion` no vacía; `cantidad` > 0; `precioUnitario` ≥ 0 | FR-005, FR-016 |
| Emitir: emisor válido + cliente válido + ≥ 1 línea | FR-011, FR-018 |
| `fechaValidez` ≥ `fechaEmision` | FR-009 |
| Montos siempre en MXN, 2 decimales | FR-014 |

---

## Persistencia

- Una clave `presupuestospro:v1` en `localStorage` con el agregado `{ perfil, clientes, servicios, presupuestos, version }`.
- Acceso exclusivo vía el mock de backend asíncrono ([contracts/backend-contract.md](./contracts/backend-contract.md)).
- Migración futura: cambiar el adaptador de almacenamiento sin tocar los consumidores (Principio IX).
