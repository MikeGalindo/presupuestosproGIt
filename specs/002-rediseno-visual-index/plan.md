# Implementation Plan: Rediseño visual y página de inicio (index) de PresupuestosPro

**Branch**: `002-rediseno-visual-index` | **Date**: 2026-10-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-rediseno-visual-index/spec.md`

## Summary

Dos cambios de presentación sobre la aplicación ya existente (spec 001): (1) una **página de inicio** en `/` con accesos a las cuatro secciones y un **resumen de actividad** por estado, más una **navegación común** en todas las páginas con **sub-navegación interna** en Presupuestos (Emitidos | Borradores); y (2) un **rediseño visual sobrio y coherente** (paleta única, tipografía y espaciado consistentes, jerarquía clara) aplicado también a la **plantilla del PDF**. Como excepción documentada, se amplía el **modelo de estado** del presupuesto a Borrador, Enviado, Aceptado y Rechazado (persistidos) más **Caducado** (calculado). No cambian los cálculos, la numeración ni el resto del esquema; la API del mock se extiende con una operación para cambiar el estado.

Enfoque técnico: **TypeScript estricto + React 18 + Vite** (stack existente, sin dependencias nuevas). La paleta se define **en un único módulo TS** (`src/styles/tokens.ts`) que alimenta a la vez las variables CSS de la app y los estilos del PDF; la tipografía usa pilas del sistema (sin fuentes de red, offline y privadas); el estado **Caducado** es una función pura derivada de la fecha de validez; y se mantiene el **mock de backend asíncrono** (Principio IX) extendido con `presupuestos.cambiarEstado`.

## Technical Context

**Language/Version**: TypeScript 5.6 en modo estricto; React 18.3; Vite 5.4; Node.js 20+ solo como herramienta de desarrollo.

**Primary Dependencies**: `react`, `react-dom`, `react-router-dom`, `@react-pdf/renderer` (ya presentes). **Sin dependencias nuevas**: no se añaden librerías de UI, CSS-in-JS, iconos ni fuentes de red.

**Storage**: `localStorage` del navegador a través del mock de backend asíncrono (sin base de datos ni servicios remotos). Se añade una migración de datos en `data/localStorage.ts`: `estado: 'emitido'` → `'enviado'` y bump de `VERSION_AGREGADO` a `2`, conservando la misma clave (`presupuestospro:v1`).

**Testing**: Vitest + React Testing Library para funciones puras y componentes; verificación de escenarios dado/cuando/entonces en el navegador vía **MCP de Chrome** (Principio IV). Las pruebas existentes de la spec 001 MUST seguir pasando (SC-004).

**Target Platform**: navegador de escritorio moderno (Chrome), SPA offline-capable.

**Project Type**: aplicación web de cliente único (solo frontend).

**Performance Goals**: interacción percibida como instantánea (< 100 ms); la página de inicio y el resumen se calculan en memoria sobre datos ya cargados (sin peticiones extra); la generación del PDF se mantiene por debajo de ~2 s.

**Constraints**: mobile-first (usable a 320 px sin scroll horizontal); es-MX/MXN; PDF generado en el cliente y apto para impresión; sin backend real; accesibilidad AA (foco visible, contraste, `prefers-reduced-motion`); sin cambios en cálculos ni numeración.

**Scale/Scope**: un usuario; ~9 pantallas (se añade Inicio); decenas de clientes/servicios; hasta unos pocos miles de presupuestos; 5 estados de presupuesto (4 persistidos + 1 calculado).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Puerta de cumplimiento | Estado | Evidencia |
|-----------|------------------------|--------|-----------|
| I. Simplicidad ante todo | Sin abstracciones ni dependencias especulativas | ✅ PASS | Sin dependencias nuevas; tokens en un módulo plano; Caducado es una función pura; estado de UI mínimo. |
| II. Idioma y mercado (es-MX, MXN) | Interfaz, PDF, fechas y números en es-MX/MXN | ✅ PASS | Textos nuevos en es-MX; `Intl` es-MX/MXN ya existente; variante confirmada en clarificación. |
| III. Cero alcance fantasma | Nada fuera de la especificación aprobada | ✅ PASS | El alcance (incluida la ampliación de estados) está en `spec.md`, aprobado; no se añade nada más. |
| IV. Verificabilidad (dado/cuando/entonces + MCP Chrome) | Escenarios verificables en el navegador | ✅ PASS | `quickstart.md` cubre inicio, navegación, estados y PDF vía MCP de Chrome; pruebas Vitest para lo puro. |
| V. Datos del usuario con respeto | Solo datos necesarios, sin terceros | ✅ PASS | No se añaden datos personales; todo local; sin `fetch` externo ni fuentes de red. |
| VI. Stack | TS estricto + React 18+ + Vite, estado mínimo, mock, sin auth | ✅ PASS | Stack exacto; sin gestor de estado global; sin auth ni sesiones. |
| VII. El PDF es el producto | PDF en el cliente, es-MX, profesional al imprimir | ✅ PASS | La plantilla del PDF se rediseña con la identidad compartida y conserva datos y cálculos. |
| VIII. No-objetivos de v1 | Sin auth, DB remota, multiusuario, correo ni SAT | ✅ PASS | No se introducen; el cambio de estado es local. |
| IX. Mock de backend, no backend real | Interfaz asíncrona sustituible, sin `fetch`/DB/env | ✅ PASS | Se extiende `Backend.presupuestos.cambiarEstado(id, estado)` con errores tipados, sobre localStorage. |

**Resultado del gate**: sin violaciones. `Complexity Tracking` no aplica.

**Nota de gobernanza**: la ampliación de estados modifica el modelo de datos respecto a la restricción original de la spec 001; queda registrada como decisión de clarificación en `spec.md`. No colisiona con los no-objetivos de la constitución (VIII) y está exigida por la especificación aprobada (III). Decisión registrada: **sin enmienda constitucional**; el cambio queda cubierto por el Principio III.

**Re-evaluación post-diseño (Fase 1)**: `research.md`, `data-model.md`, `contracts/` y `quickstart.md` no introducen violaciones. La paleta única, la migración compatible, el estado calculado y la extensión del mock siguen alineados con los Principios I–IX. Gate ✅ PASS (post-diseño).

## Design & Identity (tokens)

Fuente única de verdad: **`src/styles/tokens.ts`**. La app consume variables CSS inyectadas en `:root` al arrancar; el PDF importa el mismo módulo. Ningún color de marca vive fuera de este archivo (FR-007, SC-005).

### Paleta (sobria, limitada)

| Token | Hex | Uso |
|-------|-----|-----|
| `marca` | `#1F3A5F` | Marca, encabezado, acciones primarias |
| `marcaOscura` | `#14283F` | Hover/activo de acciones primarias |
| `marcaSuave` | `#E8EEF5` | Fondos suaves, cabeceras de tabla |
| `acento` | `#2E6B5E` | Acento puntual (enlaces de énfasis), uso escaso |
| `texto` | `#1B1F24` | Texto principal |
| `textoSuave` | `#5B6470` | Texto secundario, etiquetas |
| `borde` | `#D9DEE4` | Bordes y separadores |
| `fondo` | `#F4F6F8` | Fondo de la aplicación |
| `superficie` | `#FFFFFF` | Tarjetas y superficies |

### Estados del presupuesto (fondo / texto, AA)

| Estado | Fondo | Texto | Señal no cromática |
|--------|-------|-------|--------------------|
| Borrador | `#FBF1DC` | `#7A5410` | Punto con contorno |
| Enviado | `#E3ECF7` | `#1F4E79` | Flecha de salida |
| Aceptado | `#E1F0E6` | `#1E6B3A` | Marca de verificación |
| Rechazado | `#FBE4E3` | `#9A2A22` | Aspa |
| Caducado | `#ECEEF1` | `#566070` | Reloj |

Cada insignia combina **color + etiqueta textual + forma**, de modo que nunca depende solo del color (FR-011, SC-006).

### Tipografía y espaciado

- **Una familia** de interfaz (pila del sistema): `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. En PDF, `Helvetica`/`Helvetica-Bold` (incorporadas). Elección deliberada: sin fuentes de red → offline, sin dependencias y sin fuga de datos (Principios I, V).
- **Escala tipográfica** (rem): 0.75 · 0.875 · 1 · 1.125 · 1.375 · 1.75 · 2.25. Jerarquía por tamaño y peso (título de página > título de sección > cuerpo > dato secundario).
- **Escala de espaciado** (px): 4 · 8 · 12 · 16 · 24 · 32 · 48.

## Project Structure

### Documentation (this feature)

```text
specs/002-rediseno-visual-index/
├── plan.md              # Este archivo (/speckit.plan)
├── research.md          # Fase 0 (/speckit.plan)
├── data-model.md        # Fase 1 (/speckit.plan)
├── quickstart.md        # Fase 1 (/speckit.plan)
├── contracts/           # Fase 1 (/speckit.plan)
│   ├── backend-contract.md
│   ├── app-routes.md
│   └── design-tokens.md
├── checklists/
│   └── requirements.md
├── spec.md
└── tasks.md             # Fase 2 (/speckit.tasks — NO lo crea /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main.tsx                     # Arranque: aplica tokens a :root y monta React (modificar)
├── App.tsx                      # (sin cambios)
├── AppLayout.tsx                # Navegación común de 4 secciones (modificar)
├── router.tsx                   # Ruta / → HomePage; resto igual (modificar)
├── domain/
│   ├── types.ts                 # EstadoPresupuesto persistido + tipos (modificar)
│   └── estados.ts               # NUEVO: etiquetas, transiciones y estadoMostrado (Caducado)
├── data/
│   ├── backend.ts               # + presupuestos.cambiarEstado (modificar)
│   ├── localStorage.ts          # Migración emitido→enviado, versión 2 (modificar)
│   └── store.tsx                # + cambiarEstadoPresupuesto; emitidos = no borradores (modificar)
├── features/
│   ├── home/
│   │   └── HomePage.tsx         # NUEVO: página de inicio + resumen de actividad
│   ├── budgets/
│   │   ├── PresupuestosSubnav.tsx  # NUEVO: sub-navegación Emitidos | Borradores
│   │   ├── HistoryPage.tsx      # Insignia de estado + subnav (modificar)
│   │   ├── DraftsList.tsx       # Subnav (modificar)
│   │   └── BudgetDetail.tsx     # Insignia + acciones de cambio de estado (modificar)
│   └── pdf/
│       └── BudgetDocument.tsx   # Rediseño con tokens compartidos (modificar)
├── components/
│   ├── EstadoBadge.tsx          # NUEVO: insignia de estado (color+etiqueta+forma)
│   └── index.ts                 # Exportar nuevos componentes (modificar)
└── styles/
    ├── tokens.ts                # NUEVO: fuente única de paleta/espaciado/tipografía
    └── global.css               # Consume var(--…) únicamente (modificar)
```

**Structure Decision**: se mantiene la estructura de la spec 001 (Option 1 adaptada a SPA React) y se añade una carpeta `features/home/` (la nueva pantalla) y `styles/tokens.ts` (la fuente única de identidad). El estado de dominio nuevo vive en `domain/estados.ts` (puro y testeable). La navegación común se centraliza en `AppLayout` y la sub-navegación de Presupuestos en un componente compartido. No se crean capas nuevas de backend ni de autenticación.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Sin violaciones constitucionales. No aplica.
