# Implementation Plan: Exportar todos mis presupuestos en un .zip

**Branch**: `003-exportar-todo-zip` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-exportar-todo-zip/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Añadir a la sección de presupuestos una única acción **de solo lectura** «Exportar todo (.zip)» que, **en el cliente**, construye **un único `.zip` plano** con: (1) **un PDF por cada presupuesto emitido** —reutilizando *tal cual* la generación de PDF existente, de modo que sea idéntico al que descarga la app— y (2) **un único archivo de datos** con el agregado completo (perfil con logo, clientes, servicios, presupuestos y numeración). Muestra progreso «x de N», se bloquea durante la operación y **aborta con aviso** si falla la generación de algún PDF. No modifica ningún dato (Principio IX: nueva operación asíncrona de solo lectura sobre el mock).

Enfoque técnico: **TypeScript estricto + React 18 + Vite** (stack existente, **sin dependencias nuevas**). El `.zip` se produce con un **escritor propio** en `src/lib/zip.ts` (método *store* + **CRC-32**, nombres en UTF-8). Se extrae `generarPdfBlob()` del módulo de descarga para reutilizar el PDF sin duplicar el render; la limpieza de nombres vive en `src/lib/archivos.ts`; la orquestación de la exportación en `src/features/budgets/exportarZip.ts`.

## Technical Context

**Language/Version**: TypeScript 5.6 en modo estricto; React 18.3; Vite 5.4; Node.js 20+ solo como herramienta de desarrollo.

**Primary Dependencies**: `react`, `react-dom`, `react-router-dom`, `@react-pdf/renderer` (ya presentes). **Sin dependencias nuevas**: el `.zip` se genera con un escritor propio (`src/lib/zip.ts`, método *store* + CRC-32). *(Nota: `fflate` aparece en `node_modules` únicamente como dependencia transitiva de `pdfkit`/`@react-pdf/renderer`; **no** es dependencia directa y **no** se importa.)*

**Storage**: `localStorage` a través del mock asíncrono (sin cambios). Se **añade una operación de solo lectura** al mock: `exportacion.obtenerCopia()` devuelve el agregado completo. La exportación **no escribe nada**.

**Testing**: Vitest + React Testing Library para el escritor de `.zip`, la limpieza de nombres y el JSON de la copia; prueba de integración del botón (progreso, estado vacío, aborto). Verificación manual de escenarios en el navegador vía **MCP de Chrome** (Principio IV).

**Target Platform**: navegador de escritorio moderno (Chrome), SPA offline-capable.

**Project Type**: aplicación web de cliente único (solo frontend).

**Performance Goals**: generar y descargar el `.zip` con hasta ~200 presupuestos sin bloquear la interfaz; PDF por presupuesto < ~2 s; progreso «x de N» perceptible; interacción < 100 ms.

**Constraints**: sin backend real; `.zip` generado en el cliente; interfaz y nombres en **es-MX** con montos **MXN**; **abortar** ante fallo de un PDF; estructura **plana** del `.zip`; operación **de solo lectura**; mobile-first y accesibilidad AA.

**Scale/Scope**: un usuario; decenas de clientes/servicios; hasta ~200 presupuestos exportables; **sin rutas nuevas** (~9 pantallas).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Puerta de cumplimiento | Estado | Evidencia |
|-----------|------------------------|--------|-----------|
| I. Simplicidad ante todo | Sin abstracciones ni dependencias especulativas | ✅ PASS | Sin dependencias nuevas; escritor ZIP mínimo (store) y utilidades puras y acotadas. |
| II. Idioma y mercado (es-MX, MXN) | Interfaz, nombres y montos en es-MX/MXN | ✅ PASS | Nombres y mensajes en es-MX; los PDF reutilizados conservan el formato es-MX/MXN existente. |
| III. Cero alcance fantasma | Nada fuera de la especificación aprobada | ✅ PASS | Solo FR-001…FR-017 y SC-001…SC-012; no se añade ningún otro alcance. |
| IV. Verificabilidad (dado/cuando/entonces + MCP Chrome) | Escenarios verificables en el navegador | ✅ PASS | `quickstart.md` define la verificación por escenario vía MCP de Chrome; pruebas Vitest para lo puro. |
| V. Datos del usuario con respeto | Solo los datos necesarios, sin terceros | ✅ PASS | La copia incluye datos ya existentes; la descarga es local; sin `fetch` externo ni nube. |
| VI. Stack | TS estricto + React 18+ + Vite, estado mínimo, mock, sin auth | ✅ PASS | Stack exacto; estado local en `HistoryPage`; sin gestor global; sin auth. |
| VII. El PDF es el producto | PDF en el cliente, es-MX, profesional | ✅ PASS | Se reutiliza el mismo `BudgetDocument`; el PDF del `.zip` es idéntico al de la app. |
| VIII. No-objetivos de v1 | Sin auth, DB remota, multiusuario, correo ni SAT | ✅ PASS | Nada de eso se introduce; el `.zip` es local y no se envía a ningún servicio. |
| IX. Mock de backend, no backend real | Interfaz asíncrona sustituible, sin `fetch`/DB/env | ✅ PASS | Se añade `exportacion.obtenerCopia()` (solo lectura) al mock; sin `fetch`/DB/env. |

**Resultado del gate**: sin violaciones. No aplica `Complexity Tracking`.

**Re-evaluación post-diseño (Fase 1)**: `research.md`, `data-model.md`, `contracts/` y `quickstart.md` no introducen violaciones. El escritor ZIP sin dependencias, la operación de solo lectura sobre el mock, la reutilización del PDF y el alcance acotado siguen alineados con los Principios I–IX. Gate ✅ PASS (post-diseño).

## Project Structure

### Documentation (this feature)

```text
specs/003-exportar-todo-zip/
├── plan.md              # Este archivo (/speckit.plan)
├── research.md          # Fase 0 (/speckit.plan)
├── data-model.md        # Fase 1 (/speckit.plan)
├── quickstart.md        # Fase 1 (/speckit.plan)
├── contracts/           # Fase 1 (/speckit.plan)
│   ├── backend-contract.md
│   └── export-format.md
├── checklists/
│   └── requirements.md
├── spec.md
└── tasks.md             # Fase 2 (/speckit.tasks — NO lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── zip.ts                    # NUEVO: escritor ZIP (store) + CRC-32 (puro, sin dependencias)
│   └── archivos.ts               # NUEVO: limpieza/normalización de nombres de archivo
├── features/
│   ├── pdf/
│   │   └── download.ts           # MODIFICAR: + generarPdfBlob(); exportar descargarBlob()
│   └── budgets/
│       ├── exportarZip.ts        # NUEVO: orquesta PDFs + archivo de datos → .zip → descarga
│       └── HistoryPage.tsx       # MODIFICAR: botón «Exportar todo (.zip)» + progreso/aviso
├── data/
│   ├── backend.ts                # MODIFICAR: + exportacion.obtenerCopia() (solo lectura)
│   └── store.tsx                 # MODIFICAR: exponer obtenerCopia() en el contexto
tests/
├── unit/
│   ├── zip.test.ts               # NUEVO: estructura ZIP + CRC-32 + round-trip con descompresor
│   └── archivos.test.ts          # NUEVO: limpieza de nombres («Diseño/Web S.L.»)
└── integration/
    └── exportar-zip.test.tsx     # NUEVO: botón, progreso, vacío y aborto
```

**Structure Decision**: se mantiene la estructura de las specs 001/002 (Option 1 adaptada a SPA React). La lógica pura nueva (ZIP y nombres) vive en `src/lib/` (testeable sin UI). La orquestación de la exportación vive en `features/budgets/` (donde está el botón). El PDF se reutiliza desde `features/pdf/download.ts`. La lectura de datos para la copia pasa por una nueva operación de solo lectura del mock (`data/`), expuesta en el store (Principio IX). No se crean rutas, capas de backend ni de autenticación.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones constitucionales. No aplica.
