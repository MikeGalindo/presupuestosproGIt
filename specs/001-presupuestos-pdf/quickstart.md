# Quickstart — Validación de PresupuestosPro

**Feature**: `001-presupuestos-pdf` | **Date**: 2026-10-08 | **Plan**: [plan.md](./plan.md)

Guía para ejecutar y validar la funcionalidad de extremo a extremo. La verificación de interfaz se hace en el navegador a través del **MCP de Chrome** (Principio IV); la lógica se cubre con Vitest.

---

## Prerequisites

- Node.js 20+ y npm.
- Navegador Chrome para la verificación por MCP.
- Sin backend, sin variables de entorno, sin conexión a internet.

## Setup y ejecución

```bash
npm install       # instala dependencias
npm run dev       # levanta la SPA en modo desarrollo (Vite)
npm test          # ejecuta Vitest (unit + integration)
npm run build     # verifica la compilación de producción
```

**Esperado**: `npm run dev` sirve la aplicación en `http://localhost:5173`; `npm test` pasa en verde; `npm run build` termina sin errores de TypeScript.

---

## Escenarios de validación (end-to-end)

Cada escenario corresponde a criterios de aceptación de `spec.md`. Rutas y acciones en [contracts/app-routes.md](./contracts/app-routes.md); campos y reglas en [data-model.md](./data-model.md).

### V1 — Cálculo de impuestos (SC-002, User Story 1)

1. En `/perfil`, guardar un perfil con nombre, razón social y RFC.
2. En `/clientes`, crear un cliente con nombre.
3. En `/presupuestos/nuevo`, elegir el cliente y añadir una línea `2 × $1,000.00`.
4. **Esperado**: base `$2,000.00`, IVA `$320.00`, total `$2,320.00`.
5. Activar la retención de ISR.
6. **Esperado**: retención `$200.00`, total `$2,120.00`.

### V2 — Emitir y descargar el PDF (FR-010, Principio VII)

1. Con el presupuesto de V1, pulsar **Emitir y descargar PDF**.
2. **Esperado**: se descarga un PDF con logo (si hay), datos del emisor y del cliente, número `YYYY-NN`, fechas, líneas, base, IVA, retención y total.
3. Abrir el PDF en un lector estándar: se ve profesional y todos los montos están en MXN con formato es-MX (SC-005).

### V3 — Borrador (FR-017)

1. En `/presupuestos/nuevo`, llenar parcialmente y pulsar **Guardar borrador**.
2. Recargar la página.
3. **Esperado**: el borrador aparece en `/borradores` sin número; se puede retomar y editar.
4. Emitirlo desde el editor: recibe número y pasa a `/presupuestos` (historial).

### V4 — Clientes, servicios y perfil (FR-001/002/003)

1. En `/clientes`, crear, editar y eliminar un cliente; comprobar que desaparece de la lista.
2. En `/servicios`, crear un servicio (nombre, descripción, precio, unidad) y verificar que aparece al añadir líneas en el editor.
3. En `/perfil`, subir un logo y comprobar que aparece en el PDF de los siguientes presupuestos.

### V5 — Historial (FR-012, SC-003)

1. Emitir dos presupuestos.
2. **Esperado**: en `/presupuestos` figuran con número, cliente, fecha y total; el primero es `AÑO-01` y el segundo `AÑO-02`.
3. Descargar de nuevo el PDF de uno y eliminar el otro.
4. **Esperado**: el eliminado desaparece; el número no se reutiliza.

### V6 — Casos límite (FR-011, FR-016, FR-018, SC-007)

- **Sin líneas**: intentar emitir un presupuesto vacío → se avisa y **no** se genera PDF.
- **Cantidad inválida**: poner cantidad `0` o negativa → se avisa y no se calcula.
- **Datos obligatorios**: sin RFC en el perfil o sin nombre en el cliente → se impide emitir con un aviso en es-MX.
- **Línea manual (CL2)**: añadir una línea no catalogada → se permite y aparece en el PDF.
- **Reinicio anual (FR-008)**: simular un año nuevo (o un presupuesto con fecha de año distinto) → el primer número del año es `AÑO-01`.

### V7 — Persistencia (SC-006, FR-015)

1. Crear perfil, clientes, servicios y un presupuesto.
2. Cerrar y reabrir la aplicación (o recargar).
3. **Esperado**: todo sigue disponible.

---

## Criterios de aceptación de la guía

- Todas las validaciones V1–V7 se completan con resultado esperado.
- `npm test` en verde y `npm run build` sin errores.
- Ningún texto, fecha ni monto fuera de es-MX/MXN (Principio II).
