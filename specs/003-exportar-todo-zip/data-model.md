# Phase 1 — Data Model: Exportar todos mis presupuestos en un .zip

No se crean entidades **persistidas** nuevas. Se define la **vista exportable** (la copia)
y las **entradas del `.zip`**.

## Copia de exportación (vista, no persistida)

Reutiliza el agregado ya existente (`src/domain/types.ts` → `Agregado`) más metadatos de la
exportación. Se **lee**, nunca se escribe.

| Campo | Tipo | Origen | Notas |
|-------|------|--------|-------|
| `version` | `number` | `Agregado.version` | Versión del esquema persistido (hoy `2`). |
| `exportadoEn` | `string` (ISO timestamp) | nuevo (en el momento de exportar) | Marca temporal de la copia. |
| `perfil` | `PerfilEmisor \| null` | `Agregado.perfil` | Incluye `logo` (data URL). |
| `clientes` | `Cliente[]` | `Agregado.clientes` | Catálogo completo. |
| `servicios` | `Servicio[]` | `Agregado.servicios` | Catálogo completo. |
| `presupuestos` | `Presupuesto[]` | `Agregado.presupuestos` | Todos los estados. |
| `correlativos` | `Record<string, number>` | `Agregado.correlativos` | Numeración por año. |

**Reglas de validación**: ninguna nueva; es una copia fiel de datos ya validados. La
exportación es **de solo lectura** (FR-008, SC-006).

## Entradas del `.zip` (estructura plana)

| Nombre en el `.zip` | Tipo MIME | Origen | Regla |
|---------------------|-----------|--------|-------|
| `presupuestospro-datos.json` | `application/json` | Copia de exportación | Exactamente **una**, en la raíz. |
| `<número> - <cliente>.pdf` | `application/pdf` | `generarPdfBlob(presupuesto)` | **Una por presupuesto emitido**, en la raíz. |

- **Presupuestos incluidos**: estados **Enviado, Aceptado, Rechazado y Caducado**
  (`estado !== 'borrador'`). Los **borradores quedan fuera** (FR-003).
- **Nombre de cada PDF**: `«número - cliente»` (p. ej. `2026-001 - Estudio García.pdf`),
  con limpieza de caracteres conflictivos (FR-005, FR-010).
- **Nombre del `.zip`**: `presupuestospro-copia-AAAA-MM-DD.zip` con la fecha del día (FR-002).
- **Sin carpetas**: todas las entradas en la raíz (decisión de clarificación, FR-017).

## Estados y transiciones

No cambian. La exportación **no** altera el estado de ningún presupuesto ni ningún dato
(FR-008, FR-014).
