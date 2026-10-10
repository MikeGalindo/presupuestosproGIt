# Implementation Plan: PresupuestosPro — Presupuestos profesionales en PDF

**Branch**: `001-presupuestos-pdf` | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-presupuestos-pdf/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

PresupuestosPro es una aplicación web **solo cliente** donde un freelancer registra su marca y catálogos (clientes y servicios), crea presupuestos con líneas del catálogo o escritas a mano, obtiene el cálculo automático de base imponible, IVA (16 %), retención de ISR opcional (10 %) y total, y descarga un **PDF profesional con su marca** para enviarlo él mismo. El entregable central es el PDF (Principio VII).

Enfoque técnico: SPA con **TypeScript estricto + React 18 + Vite**, sin gestor de estado global (Context + `useReducer` y cálculos derivados puros), persistencia en el equipo mediante **localStorage tras un mock de backend asíncrono con errores tipados** (Principio IX), y generación de PDF en el cliente con **@react-pdf/renderer**. Todo en **es-MX/MXN** con `Intl`. La aritmética monetaria se hace en **centavos enteros** para garantizar que los números cuadren. Sin auth, sin backend real, sin correo y sin facturación (no-objetivos v1).

## Technical Context

**Language/Version**: TypeScript 5.x en modo estricto; React 18.3; Vite 5.x; Node.js 20+ únicamente como herramienta de desarrollo.

**Primary Dependencies**: `react`, `react-dom`, `react-router-dom` (navegación), `@react-pdf/renderer` (PDF en el cliente). Formateo de fechas y moneda con `Intl` nativo. **Sin gestor de estado global.** Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.

**Storage**: `localStorage` del navegador, accedido **exclusivamente** a través de un mock de backend asíncrono (promesas + errores tipados). Sin base de datos, sin servicios remotos, sin variables de entorno con endpoints.

**Testing**: Vitest + React Testing Library para lógica y componentes; verificación de los escenarios dado/cuando/entonces en el navegador a través del **MCP de Chrome** (Principio IV).

**Target Platform**: navegador de escritorio moderno (Chrome), SPA que funciona sin conexión.

**Project Type**: aplicación web de cliente único (solo frontend).

**Performance Goals**: emitir un presupuesto y descargar su PDF en **menos de 5 minutos**; generar el PDF por debajo de ~2 s para un presupuesto típico (≤ 50 líneas); interacción de UI percibida como instantánea (< 100 ms).

**Constraints**: sin backend ni nube; los datos viven solo en el equipo del usuario; interfaz, PDF y mensajes en **es-MX** con montos en **MXN**; PDF generado en el cliente y apto para impresión; offline-capable; sin cuentas ni contraseñas.

**Scale/Scope**: un solo usuario; decenas de clientes y servicios; hasta unos pocos miles de presupuestos; ~8 pantallas (perfil, clientes, servicios, borradores, editor de presupuesto, historial, detalle de presupuesto, emisión).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Puerta de cumplimiento | Estado | Evidencia |
|-----------|------------------------|--------|-----------|
| I. Simplicidad ante todo | Sin abstracciones ni dependencias especulativas | ✅ PASS | Estado con Context + `useReducer`; validación con funciones puras; sin Redux/Zustand/zod. Cada dependencia mapea a un requisito. |
| II. Idioma y mercado (es-MX, MXN) | Interfaz, PDF, fechas y números en es-MX/MXN | ✅ PASS | `Intl.NumberFormat('es-MX',{currency:'MXN'})` y `Intl.DateTimeFormat('es-MX')`; copia y mensajes en es-MX. |
| III. Cero alcance fantasma | Nada fuera de la especificación | ✅ PASS | El plan solo cubre FR-001…FR-018 y SC-001…SC-007. |
| IV. Verificabilidad (dado/cuando/entonces + MCP Chrome) | Escenarios verificables en el navegador | ✅ PASS | `quickstart.md` define la verificación por escenario vía MCP de Chrome; pruebas Vitest/RTL para la lógica. |
| V. Datos del usuario con respeto | Solo datos necesarios, sin terceros | ✅ PASS | Únicamente los campos de la especificación; todo local; sin `fetch` externo. |
| VI. Stack | TS estricto + React 18+ + Vite, estado mínimo, mock de backend, sin auth | ✅ PASS | Stack exacto; sin auth ni sesiones; estado mínimo y derivado. |
| VII. El PDF es el producto | PDF generado en el cliente, es-MX, profesional al imprimir | ✅ PASS | `@react-pdf/renderer` produce el archivo en el navegador con marca y totales. |
| VIII. No-objetivos de v1 | Sin auth, DB remota, multiusuario, correo ni SAT | ✅ PASS | Explícitamente excluidos; el envío del PDF es externo. |
| IX. Mock de backend, no backend real | Interfaz asíncrona sustituible, sin `fetch`/DB/env | ✅ PASS | `data/backend.ts` expone promesas con errores tipados sobre localStorage; los consumidores no saben de localStorage. |

**Resultado del gate**: sin violaciones. No se requiere justificación en Complexity Tracking.

**Re-evaluación post-diseño (Fase 1)**: los artefactos `research.md`, `data-model.md`, `contracts/` y `quickstart.md` no introducen violaciones. La persistencia local tras un mock asíncrono, la generación del PDF en el cliente, el estado mínimo y el alcance acotado siguen alineados con los Principios I–IX. Gate ✅ PASS (post-diseño).

## Project Structure

### Documentation (this feature)

```text
specs/001-presupuestos-pdf/
├── plan.md              # Este archivo (/speckit.plan)
├── research.md          # Fase 0 (/speckit.plan)
├── data-model.md        # Fase 1 (/speckit.plan)
├── quickstart.md        # Fase 1 (/speckit.plan)
├── contracts/           # Fase 1 (/speckit.plan)
│   ├── backend-contract.md
│   └── app-routes.md
├── checklists/
│   └── requirements.md
├── spec.md
└── tasks.md             # Fase 2 (/speckit.tasks — NO lo crea /speckit.plan)
```

### Source Code (repository root)

```text
index.html
package.json
tsconfig.json
tsconfig.node.json
vite.config.ts
src/
├── main.tsx                 # Arranque de React
├── App.tsx                  # Layout + providers + router
├── router.tsx               # Definición de rutas
├── domain/                  # Lógica pura, sin React ni almacenamiento
│   ├── types.ts             # PerfilEmisor, Cliente, Servicio, Presupuesto, LineaPresupuesto
│   ├── money.ts             # Aritmética en centavos y redondeo
│   ├── calculations.ts      # Base, IVA, ISR, total
│   ├── numbering.ts         # Siguiente número AÑO-NN
│   └── validation.ts        # Reglas de validación (FR-001/002/016/018)
├── data/                    # Mock de backend y persistencia
│   ├── backend.ts           # Interfaz asíncrona + errores tipados (seam)
│   ├── localStorage.ts      # Adaptador de persistencia versionado
│   ├── store.tsx            # Provider Context + useReducer (estado + cálculos derivados)
│   └── seed.ts              # Datos iniciales opcionales de desarrollo (opcional, sin tarea)
├── features/
│   ├── profile/             # Perfil del emisor (FR-001)
│   ├── clients/             # Catálogo de clientes (FR-002)
│   ├── services/            # Catálogo de servicios (FR-003)
│   ├── budgets/             # Borradores, editor, historial, detalle (FR-004…FR-018)
│   └── pdf/                 # Documento @react-pdf/renderer + descarga (FR-010)
├── components/              # UI compartida (formularios, tablas, avisos)
├── lib/                     # Formato Intl, ids, utilidades
└── styles/                  # Estilos de la aplicación
tests/
├── unit/                    # domain/* (cálculos, numeración, validación, dinero)
└── integration/             # flujos con RTL sobre el mock de backend
```

**Structure Decision**: proyecto único de frontend (Option 1 adaptada a SPA React). Se separa `domain/` (lógica pura y testeable sin UI), `data/` (mock de backend como costura sustituible, Principio IX), `features/` (una carpeta por área funcional de la especificación) y `features/pdf/` (el entregable central, Principio VII). No se crean capas de backend ni de autenticación porque están fuera de alcance.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones constitucionales. No aplica.
