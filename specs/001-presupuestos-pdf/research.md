# Phase 0 — Research: PresupuestosPro

**Feature**: `001-presupuestos-pdf` | **Date**: 2026-10-08 | **Plan**: [plan.md](./plan.md)

Este documento resuelve las decisiones técnicas del plan. No quedan `NEEDS CLARIFICATION`.

---

## 1. Generación del PDF en el cliente

- **Decision**: Usar **`@react-pdf/renderer`** para construir y descargar el PDF íntegramente en el navegador.
- **Rationale**: Permite describir el documento con el mismo modelo mental de React (`View`/`Text`/`Image`), da control de maquetación con flexbox y tipografía para un resultado profesional e imprimible, e inserta el logo desde una data URL. Cumple el Principio VII (el PDF es el producto) y mantiene la generación en el cliente.
- **Alternatives considered**:
  - `jsPDF` + `jspdf-autotable`: más ligero, pero la maquetación de la cabecera/marca y los totales es más manual.
  - `pdf-lib`: control de bajo nivel, mucho más código para una maquetación atractiva.
  - `window.print()` + hoja de estilos: sin dependencias, pero el resultado depende del diálogo del navegador y es menos determinista y verificable.
- **Impact**: nueva dependencia `@react-pdf/renderer`.

## 2. Persistencia local detrás de un mock de backend

- **Decision**: Persistir en **`localStorage`** bajo una clave versionada, accedida **solo** a través de un mock de backend asíncrono (`data/backend.ts`) que devuelve promesas y falla con errores tipados.
- **Rationale**: Satisface FR-015 (los datos sobreviven al cierre) y el Principio IX (costura sustituible por un backend real sin cambiar consumidores). Sin servidor ni nube.
- **Alternatives considered**:
  - `IndexedDB`: más capacidad y asincronía nativa, pero mayor complejidad para v1.
  - Estado en memoria: no cumple FR-015.
  - File System Access API: permisos y complejidad innecesarios.
- **Nota**: el logo se guarda como data URL; se validará un tamaño máximo razonable (~1 MB) para no agotar la cuota.

## 3. Gestión de estado

- **Decision**: **React Context + `useReducer`** para el estado de datos compartido, más **cálculos derivados puros** en `domain/`. Sin gestor de estado externo.
- **Rationale**: El Principio VI prefiere estado local/derivado y el mínimo indispensable. La aplicación es mono-usuario y de baja complejidad de estado.
- **Alternatives considered**: Zustand/Redux (rechazados por Principio I/VI); estado local por pantalla (insuficiente para compartir catálogos entre vistas).

## 4. Navegación

- **Decision**: **`react-router-dom`** (v6) con rutas por sección.
- **Rationale**: ~8 pantallas con navegación clara y URLs enlazables, lo que facilita la verificación de escenarios con el MCP de Chrome (Principio IV).
- **Alternatives considered**: cambio de vista con estado local (peor testabilidad); TanStack Router (más pesado para v1).

## 5. Cálculo de impuestos y redondeo

- **Decision**: Aritmética en **centavos enteros**; `base = Σ importeLínea` (con `importeLínea = round(cantidad × precioUnitario)`); `IVA = round(base × 0.16)`; `ISR = round(base × 0.10)` solo si la retención está activa; `total = base + IVA − ISR`. Redondeo half-up a 2 decimales.
- **Rationale**: Evita errores de coma flotante y garantiza SC-002 (los números cuadran). El IVA se aplica sobre la base total conforme a FR-006.
- **Alternatives considered**: números en punto flotante (riesgo de diferencias de céntimos); `decimal.js` (dependencia innecesaria).

## 6. Formato de moneda y fecha (es-MX/MXN)

- **Decision**: `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })` y `Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })`.
- **Rationale**: Nativo, sin dependencias y cumple el Principio II (separador de miles, dos decimales, símbolo `$`).

## 7. Numeración automática `AÑO-NN`

- **Decision**: Al **emitir**, calcular el siguiente consecutivo del año: filtrar presupuestos **emitidos** por año de emisión, tomar el máximo `NN`, sumar 1 y formatear con `padStart(2, '0')` → `YYYY-NN`. No se reutilizan números al eliminar.
- **Rationale**: Cumple FR-008 y SC-003 sin un contador separado que pueda desincronizarse. Si un año supera 99, el número crece de dígitos de forma natural (`2026-100`).
- **Alternatives considered**: contador persistido aparte (riesgo de desincronización); UUID (no legible para el cliente).

## 8. Validación de formularios

- **Decision**: Funciones puras en `domain/validation.ts` (emisor: nombre/RS + RFC; cliente: nombre/RS; líneas: cantidad > 0) invocadas antes de guardar/emitir.
- **Rationale**: Principio I; reglas verificables y testeables sin librerías.
- **Alternatives considered**: `zod` o `react-hook-form` (dependencias no necesarias para el alcance).

## 9. Pruebas

- **Decision**: **Vitest + React Testing Library + jsdom** para lógica y componentes; verificación end-to-end de escenarios con el **MCP de Chrome**.
- **Rationale**: Vitest se integra con Vite sin configuración extra; el MCP de Chrome es el mecanismo exigido por el Principio IV.
- **Alternatives considered**: Jest (configuración adicional); Playwright (se reserva la verificación de navegador al MCP de Chrome).

## 10. Identificadores y logo

- **Decision**: IDs con `crypto.randomUUID()`; el logo se lee con `FileReader` y se almacena como data URL en el perfil.
- **Rationale**: Nativo, único y persistible, sin dependencias ni subida a servidores (Principio V).

---

## Resumen de dependencias nuevas y su justificación

| Dependencia | Para qué | Requisito |
|-------------|----------|-----------|
| `react-router-dom` | Navegación entre pantallas | Flujos de usuario / verificación en navegador |
| `@react-pdf/renderer` | Generar el PDF con marca en el cliente | FR-010, Principio VII |
| `vitest` + `@testing-library/react` + `jsdom` | Pruebas de lógica y UI | Principio IV, SC-002/SC-007 |

Sin otras dependencias de runtime. Todo lo demás (estado, validación, formato, IDs, persistencia) se resuelve con la plataforma.
