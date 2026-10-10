# Quickstart — Validación del rediseño y página de inicio

**Feature**: `002-rediseno-visual-index` | **Date**: 2026-10-09 | **Plan**: [plan.md](./plan.md)

Guía para ejecutar y validar la mejora de extremo a extremo. La verificación de interfaz se hace en el navegador vía **MCP de Chrome** (Principio IV); la lógica pura se cubre con Vitest.

---

## Prerequisites

- Node.js 20+ y npm.
- Navegador Chrome para la verificación por MCP.
- Datos de la spec 001 (opcional pero recomendable) para probar la migración.
- Sin backend, sin variables de entorno, sin conexión a internet.

## Setup y ejecución

```bash
npm install       # instala dependencias (sin nuevas)
npm run dev       # levanta la SPA (Vite) en http://localhost:5173
npm test          # Vitest: unit + integration (las pruebas de la 001 deben seguir en verde)
npm run build     # comprueba TypeScript estricto + build de producción
```

**Esperado**: `npm run dev` sirve la aplicación; `npm test` en verde; `npm run build` sin errores.

---

## Escenarios de validación (end-to-end)

Rutas y acciones en [contracts/app-routes.md](./contracts/app-routes.md); estados en [data-model.md](./data-model.md); tokens en [contracts/design-tokens.md](./contracts/design-tokens.md).

### V1 — Página de inicio y navegación común (FR-001…FR-006, SC-001…SC-003)

1. Abrir la **raíz** `http://localhost:5173/`.
2. **Esperado**: se muestra la **página de inicio** (no el listado de presupuestos) con accesos a Presupuestos, Clientes, Catálogo y Perfil, y un resumen de actividad.
3. Usar solo la navegación común para visitar las cuatro secciones.
4. **Esperado**: se llega a cada una sin el botón atrás; la sección activa se resalta.
5. Entrar en **Presupuestos** y usar su **sub-navegación** para alternar entre **Emitidos** y **Borradores**.
6. **Esperado**: se alterna sin salir de la sección.

### V2 — Resumen de actividad (FR-003, FR-004)

1. Sin datos: abrir la raíz → el resumen aparece en **cero** con invitación a empezar.
2. Crear un borrador, emitir un presupuesto y marcarlo aceptado.
3. Volver a la raíz.
4. **Esperado**: el resumen cuenta los presupuestos por estado (Borrador, Enviado, Aceptado, Rechazado, Caducado) de forma coherente con los datos.

### V3 — Estados del presupuesto y transiciones (FR-011, FR-012, FR-013, SC-006)

1. Crear un presupuesto → estado **Borrador** (sin número).
2. Emitir su PDF → estado **Enviado** (con número) y aparece en Emitidos.
3. En el detalle, **Marcar aceptado** → estado **Aceptado**; probar **Volver a enviado** y **Marcar rechazado**.
4. **Esperado**: los cambios se conservan y se ven igual en listado y detalle; **no** existe la opción de volver a Borrador.
5. Crear un presupuesto enviado con `fechaValidez` en el pasado.
6. **Esperado**: se muestra como **Caducado** sin perder datos ni impedir la descarga; un borrador con validez vencida **no** caduca.
7. **Esperado**: cada estado se distingue por color **y** etiqueta **y** forma (no solo color).

### V4 — Identidad visual coherente y paleta única (FR-007…FR-010, SC-005)

1. Recorrer las cuatro secciones y las pantallas de presupuestos.
2. **Esperado**: misma tipografía, misma paleta y mismo espaciado; jerarquía clara (un total no se confunde con un dato secundario).
3. Buscar literales hex de marca fuera de `src/styles/tokens.ts`.
4. **Esperado**: **cero** resultados (paleta en un único lugar).

### V5 — PDF con la misma identidad (FR-015, SC-007)

1. Emitir y descargar el PDF de un presupuesto con logo, líneas y retención.
2. **Esperado**: el PDF refleja la tipografía, la paleta y la jerarquía de la app.
3. Comparar los datos con los de antes del rediseño.
4. **Esperado**: mismos datos, secciones y cifras; se abre correctamente y se ve profesional al imprimir.

### V6 — Mobile-first y accesibilidad (FR-016, FR-019, SC-006, SC-008)

1. Reducir el ancho de la ventana a **320 px**.
2. **Esperado**: no hay scroll horizontal; tablas, formularios y navegación siguen usables.
3. Navegar con teclado: el foco es visible en enlaces, botones y campos.
4. Activar `prefers-reduced-motion` en el sistema.
5. **Esperado**: no hay animaciones que molesten; el contraste de texto y estados es suficiente (AA).

### V7 — No regresión y migración de datos (FR-018, FR-021, SC-004, SC-010)

1. Con datos de la spec 001 en `localStorage` (clave `presupuestospro:v1`, estados `emitido`), abrir la aplicación.
2. **Esperado**: los presupuestos emitidos siguen accesibles y descargables, mostrándose como **Enviado**; no se pierde ninguno.
3. Repetir V1–V2 de la spec 001 (cálculo `2 × $1,000.00` → base `$2,000.00`, IVA `$320.00`, total `$2,320.00`; con retención, `$2,120.00`).
4. **Esperado**: resultados idénticos; numeración `AÑO-NN` intacta.

---

## Criterios de aceptación de la guía

- Todas las validaciones V1–V7 se completan con el resultado esperado.
- `npm test` en verde (incluidas las pruebas de la 001) y `npm run build` sin errores.
- Ningún texto, fecha ni monto fuera de es-MX/MXN (Principio II).
- Cero colores de marca fuera de `src/styles/tokens.ts` (SC-005).
