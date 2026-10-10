# Contrato — Rutas y pantallas (UI)

**Feature**: `002-rediseno-visual-index` | **Date**: 2026-10-09

Extiende el contrato de la spec 001 (`specs/001-presupuestos-pdf/contracts/app-routes.md`). Cada ruta corresponde a una capacidad y a escenarios verificables con el MCP de Chrome (Principio IV).

---

## Rutas

| Ruta | Pantalla | Requisitos | Cambio respecto a la 001 |
|------|----------|------------|--------------------------|
| `/` | **Inicio** | FR-001…FR-004 | **Nuevo**: deja de redirigir a `/presupuestos` y muestra la página de inicio |
| `/perfil` | Perfil del emisor | FR-001 (001) | Rediseño visual |
| `/clientes` | Catálogo de clientes | FR-002 (001) | Rediseño visual |
| `/servicios` | Catálogo de servicios | FR-003 (001) | Rediseño visual (se muestra como "Catálogo") |
| `/presupuestos` | Emitidos | FR-012, FR-005, FR-011 | Rediseño + insignia de estado + subnav |
| `/presupuestos/nuevo` | Editor (nuevo) | FR-004…FR-007 (001) | Rediseño visual |
| `/presupuestos/:id` | Detalle | FR-010, FR-012, FR-011 | Insignia + acciones de cambio de estado |
| `/borradores` | Borradores | FR-017, FR-005 | Rediseño + subnav |
| `/borradores/:id` | Editor (borrador) | FR-004…FR-018 (001) | Rediseño visual |

---

## Navegación común

`AppLayout` (visible en todas las páginas) muestra la marca y **cuatro enlaces**:

```text
Presupuestos · Clientes · Catálogo · Perfil
```

- El enlace de la sección activa se resalta (`NavLink`).
- La sección **Presupuestos** incluye la **sub-navegación** `PresupuestosSubnav`:

```text
Emitidos | Borradores
```

visible tanto en `/presupuestos` como en `/borradores`; la pestaña activa se resalta.

- En móvil, la navegación se envuelve/desplaza sin provocar scroll horizontal de la página.

---

## Contrato de cada pantalla

Se mantienen los cuatro estados observables de la 001 (**carga / vacío / error / con datos**).

### Inicio (`/`)

| Elemento | Contenido |
|----------|-----------|
| Accesos | Cuatro tarjetas/enlaces: Presupuestos, Clientes, Catálogo, Perfil |
| Resumen | Nº de presupuestos por estado mostrado (Borrador, Enviado, Aceptado, Rechazado, Caducado); totales de clientes y servicios |
| Vacío | Ceros + invitación ("Configura tu perfil", "Crea tu primer presupuesto") |
| Carga/Error | `Cargando` / `AvisoError` reutilizados |

### Emitidos (`/presupuestos`)

- Columnas: Número · Cliente · Fecha · **Estado (insignia)** · Total · Acciones.
- Acciones: Ver detalle · Descargar PDF.

### Detalle (`/presupuestos/:id`)

- Insignia de estado junto al número.
- Acciones de estado (flujo flexible): **Marcar aceptado**, **Marcar rechazado**, **Volver a enviado** (según el estado actual); un borrador no ofrece estas acciones.
- Acciones existentes: Descargar PDF · Eliminar · Volver.

---

## Reglas de UI

- Todo el texto, fechas y montos en **es-MX/MXN** (Principio II).
- El estado se muestra siempre con **color + etiqueta + forma** (`EstadoBadge`), nunca solo color (FR-011, SC-006).
- Un presupuesto **no borrador** no ofrece edición; solo ver, descargar, cambiar estado o eliminar (FR-012).
- La navegación común y la sub-navegación permiten llegar a cualquier sección **sin el botón atrás** (FR-005, SC-003).
- La descarga del PDF no requiere diálogos adicionales (Principio VII).
- Mobile-first: usable desde 320 px sin scroll horizontal (FR-016, SC-008).

---

## Verificación (MCP de Chrome)

Los escenarios dado/cuando/entonces de `spec.md` se ejecutan navegando estas rutas; la guía está en [../quickstart.md](../quickstart.md).
