# Contrato — Rutas y pantallas (UI)

**Feature**: `001-presupuestos-pdf` | **Date**: 2026-10-08

Contrato de la interfaz de usuario para la aplicación SPA. Cada ruta corresponde a una capacidad de la especificación y a escenarios verificables con el MCP de Chrome (Principio IV).

---

## Rutas

| Ruta | Pantalla | Requisitos | Descripción |
|------|----------|------------|-------------|
| `/` | Inicio | — | Redirige a `/presupuestos` |
| `/perfil` | Perfil del emisor | FR-001 | Alta/edición del único perfil (nombre, razón social, RFC, correo, teléfono, dirección, logo) |
| `/clientes` | Catálogo de clientes | FR-002 | Lista + crear/editar/eliminar clientes |
| `/servicios` | Catálogo de servicios | FR-003 | Lista + crear/editar/eliminar servicios (nombre, descripción, precio, unidad) |
| `/borradores` | Borradores | FR-017 | Lista de borradores guardados (sin número), retomar o eliminar |
| `/presupuestos/nuevo` | Editor de presupuesto (nuevo) | FR-004…FR-007, FR-009, FR-016, FR-018 | Seleccionar cliente, añadir/editar líneas, activar retención, ver totales, guardar borrador o emitir |
| `/borradores/:id` | Editor de presupuesto (borrador) | FR-004…FR-007, FR-009, FR-016…FR-018 | Igual que el editor, sobre un borrador existente |
| `/presupuestos` | Historial de emitidos | FR-012 | Lista de presupuestos emitidos (número, cliente, fecha, total) |
| `/presupuestos/:id` | Detalle de emitido | FR-010, FR-012 | Ver detalle, descargar PDF, eliminar |

---

## Contrato de cada pantalla

Cada pantalla define cuatro estados observables:

- **Carga**: mientras el mock de backend resuelve.
- **Vacío**: sin datos (p. ej. "Aún no tienes clientes"), con llamada a la acción.
- **Error**: mensaje en es-MX con opción de reintentar.
- **Con datos**: contenido principal.

### Acciones por pantalla

| Pantalla | Acciones principales |
|----------|----------------------|
| Perfil | Guardar; subir/cambiar/quitar logo; avisos de campos obligatorios (nombre/RS, RFC) |
| Clientes | Crear; editar; eliminar con confirmación |
| Servicios | Crear; editar; eliminar con confirmación |
| Borradores | Abrir borrador; eliminar borrador |
| Editor | Elegir cliente; añadir línea desde catálogo; añadir línea manual; editar cantidad/precio/unidad/descripción; quitar línea; activar/desactivar retención; editar fecha de validez; **Guardar borrador**; **Emitir y descargar PDF** |
| Historial | Abrir detalle; descargar PDF |
| Detalle | Descargar PDF; eliminar con confirmación |

---

## Reglas de UI

- Todo el texto, fechas y montos en **es-MX/MXN** (Principio II).
- El botón de emisión/descarga está **deshabilitado** si faltan líneas o datos obligatorios, con un aviso claro (FR-011, FR-018).
- Avisar cuando una línea tenga cantidad ≤ 0 (FR-016).
- El editor muestra en vivo: base imponible, IVA, retención (si aplica) y total (FR-006).
- Un presupuesto emitido no ofrece edición; solo ver, descargar y eliminar (FR-012).
- La descarga del PDF no debe requerir ningún diálogo adicional del navegador (archivo generado en el cliente, Principio VII).

---

## Verificación (MCP de Chrome)

Los escenarios dado/cuando/entonces de `spec.md` se ejecutan navegando estas rutas. La guía de validación está en [../quickstart.md](../quickstart.md).
