---
description: "Task list for rediseño visual y página de inicio (index) de PresupuestosPro"
---

# Tasks: Rediseño visual y página de inicio (index) de PresupuestosPro

**Input**: Design documents from `/specs/002-rediseno-visual-index/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluidos porque `plan.md` y `research.md` comprometen pruebas con Vitest/RTL y la constitución exige escenarios verificables (Principio IV). No se modifican los cálculos ni la numeración (SC-004).

**Organization**: Tareas agrupadas por historia de usuario (US1–US5) para permitir implementación y prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario (US1…US5)
- Se incluyen rutas de archivo exactas en cada tarea

## Path Conventions

- Proyecto único de frontend: `src/`, `tests/` en la raíz del repositorio (según plan.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Base de la identidad visual compartida por todas las historias.

- [X] T001 Crear la fuente única de identidad en `src/styles/tokens.ts` con `PALETA`, `ESTADOS`, `ESPACIADO` y `TIPOGRAFIA`, conforme a `contracts/design-tokens.md`
- [X] T002 [P] Añadir `aplicarTokens()` en `src/styles/tokens.ts` e invocarlo en `src/main.tsx` para escribir las variables CSS en `:root`
- [X] T003 [P] Refactorizar `src/styles/global.css` para consumir solo `var(--…)` (colores, espaciado y tipografía) y eliminar los literales hex de marca

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo de estados, migración y costura de datos que bloquean US1 (resumen) y US4 (estados).

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta completar esta fase.

- [X] T004 [P] Actualizar `src/domain/types.ts`: `EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'rechazado'`, añadir `EstadoCambiable` (`'enviado' | 'aceptado' | 'rechazado'`) y `EstadoMostrado` (`EstadoPresupuesto | 'caducado'`)
- [X] T005 [P] Crear `src/domain/estados.ts` con `ETIQUETAS_ESTADO`, `estadoMostrado(presupuesto, hoy)` (Caducado = `estado === 'enviado'` y `fechaValidez < hoy`) y `transicionValida(actual, siguiente)` (nunca a `borrador`), según `data-model.md` §1
- [X] T006 Actualizar `src/data/localStorage.ts`: subir `VERSION_AGREGADO` a `2` y migrar al leer `estado === 'emitido'` → `'enviado'` conservando la clave `presupuestospro:v1` (sin pérdida de datos) (depende de T004)
- [X] T007 Actualizar `src/data/backend.ts`: `emitir` asigna `estado: 'enviado'`; `listarEmitidos` devuelve todo presupuesto **no borrador** ordenado por `numero` desc; añadir `presupuestos.cambiarEstado(id, estado)` con errores `NO_ENCONTRADO`/`VALIDACION` (solo `enviado | aceptado | rechazado`; nunca `borrador`), según `contracts/backend-contract.md` (depende de T004, T005, T006)
- [X] T008 Actualizar `src/data/store.tsx`: añadir `cambiarEstadoPresupuesto(id, estado)` y derivar `emitidos` como **no borrador**; exponer ambos en el contexto (depende de T007)
- [X] T009 Actualizar las pruebas existentes que usan el literal `estado: 'emitido'` a `'enviado'`: `tests/unit/history.test.ts`, `tests/unit/numbering.test.ts` (depende de T004)

**Checkpoint**: Modelo de estados, migración y mock listos; US1 y US4 pueden empezar.

---

## Phase 3: User Story 1 - Página de inicio como punto de entrada (Priority: P1) 🎯 MVP

**Goal**: `/` muestra una página de inicio con accesos a las cuatro secciones y un resumen de actividad por estado, con estado vacío útil.

**Independent Test**: Abrir la raíz y ver la página de inicio (no el historial) con cuatro accesos y el resumen por estado; probar con datos y sin datos.

### Tests for User Story 1

- [X] T010 [P] [US1] Test unitario del resumen derivado en `tests/unit/home-resumen.test.ts` (conteo por estado mostrado, incluido Caducado)
- [X] T011 [P] [US1] Test de integración de la página de inicio en `tests/integration/home.test.tsx` (cuatro accesos, resumen y estado vacío)

### Implementation for User Story 1

- [X] T012 [P] [US1] Crear la función pura `resumenActividad(presupuestos, hoy)` en `src/features/home/resumen.ts` (cuenta por estado mostrado)
- [X] T013 [P] [US1] Crear `src/features/home/HomePage.tsx` con cuatro accesos (Presupuestos, Clientes, Catálogo, Perfil), resumen de actividad y estado vacío con invitación a empezar
- [X] T014 [US1] Actualizar `src/router.tsx`: la ruta `/` renderiza `HomePage` en lugar de redirigir a `/presupuestos` (depende de T013)

**Checkpoint**: La página de inicio funciona de forma independiente (MVP parcial).

---

## Phase 4: User Story 2 - Navegación común en todas las páginas (Priority: P1)

**Goal**: Navegación común con las cuatro secciones y sub-navegación interna de Presupuestos (Emitidos | Borradores).

**Independent Test**: Desde cualquier pantalla, llegar a las cuatro secciones en una interacción y alternar Emitidos/Borradores sin el botón atrás.

### Tests for User Story 2

- [X] T015 [P] [US2] Test de integración de navegación y sub-navegación en `tests/integration/navegacion.test.tsx`

### Implementation for User Story 2

- [X] T016 [US2] Actualizar `src/AppLayout.tsx`: cuatro enlaces (Presupuestos, Clientes, Catálogo, Perfil) con estado activo y comportamiento mobile-first (sin scroll horizontal)
- [X] T017 [P] [US2] Crear `src/features/budgets/PresupuestosSubnav.tsx` (pestañas Emitidos | Borradores con `NavLink`)
- [X] T018 [US2] Renderizar `PresupuestosSubnav` en `src/features/budgets/HistoryPage.tsx` y `src/features/budgets/DraftsList.tsx` (depende de T017)

**Checkpoint**: Navegación completa e independiente.

---

## Phase 5: User Story 3 - Identidad visual sobria y coherente (Priority: P2)

**Goal**: Tipografía, espaciado y jerarquía consistentes en todas las pantallas, con la paleta en un único lugar.

**Independent Test**: Comparar pantallas y comprobar misma tipografía/paleta/espaciado y jerarquía clara; cero hex de marca fuera de `tokens.ts`.

### Implementation for User Story 3

- [X] T019 [P] [US3] Aplicar escala tipográfica, espaciado y jerarquía a los componentes compartidos y estilos base (`src/components/FormField.tsx`, `src/components/DataTable.tsx`, `src/components/ConfirmDialog.tsx`, `src/components/States.tsx`, `src/styles/global.css`)
- [X] T020 [P] [US3] Aplicar tokens y jerarquía a las pantallas de catálogo y perfil (`src/features/profile/ProfilePage.tsx`, `src/features/clients/ClientsPage.tsx`, `src/features/services/ServicesPage.tsx`)
- [X] T021 [P] [US3] Aplicar tokens y jerarquía al editor y sus totales (`src/features/budgets/BudgetEditor.tsx`, `src/features/budgets/BudgetTotals.tsx`, `src/features/budgets/LineEditor.tsx`)
- [X] T022 [P] [US3] Pase de accesibilidad: foco visible, contraste AA y `prefers-reduced-motion` en `src/styles/global.css`
- [X] T023 [US3] Verificar SC-005: buscar literales hex de marca fuera de `src/styles/tokens.ts` y corregir cualquiera que aparezca (depende de T019, T020, T021)

**Checkpoint**: Identidad visual coherente y verificada.

---

## Phase 6: User Story 4 - Estados del presupuesto útiles y reconocibles (Priority: P2)

**Goal**: Cinco estados distinguibles (color + etiqueta + forma) y cambio de estado con flujo flexible; Caducado calculado.

**Independent Test**: Crear → emitir → aceptar/rechazar/volver a enviado; comprobar Caducado por validez vencida; comprobar insignias en listado y detalle.

### Tests for User Story 4

- [X] T024 [P] [US4] Test unitario de `estadoMostrado` y `transicionValida` en `tests/unit/estados.test.ts` (incluye borrador que no caduca y aceptado que no caduca)

### Implementation for User Story 4

- [X] T025 [P] [US4] Crear `src/components/EstadoBadge.tsx` (color + etiqueta + forma) y exportarlo en `src/components/index.ts`
- [X] T026 [US4] Mostrar la insignia de estado y el estado mostrado (Caducado incluido) en el listado de `src/features/budgets/HistoryPage.tsx` (nueva columna Estado)
- [X] T027 [US4] Mostrar insignia en `src/features/budgets/BudgetDetail.tsx` y añadir acciones de estado (Marcar aceptado, Marcar rechazado, Volver a enviado) mediante `cambiarEstadoPresupuesto`

**Checkpoint**: Estados completos y verificables de forma independiente.

---

## Phase 7: User Story 5 - PDF con la misma imagen profesional (Priority: P2)

**Goal**: La plantilla del PDF usa la identidad compartida conservando datos y cálculos.

**Independent Test**: Generar el PDF y comprobar que refleja tipografía/paleta/jerarquía y que conserva exactamente los datos y cifras.

### Implementation for User Story 5

- [X] T028 [US5] Rediseñar `src/features/pdf/BudgetDocument.tsx` importando `PALETA`/`ESTADOS` de `src/styles/tokens.ts`, manteniendo datos, secciones y cálculos idénticos

**Checkpoint**: PDF con la nueva identidad y datos intactos.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verificación transversal y no regresión.

- [X] T029 [P] Ejecutar `npm test` y `npm run build` y corregir cualquier regresión (incluidas las pruebas de la spec 001)
- [X] T030 [P] Ejecutar la validación de `quickstart.md` (V1–V7) con el MCP de Chrome y registrar resultados
- [X] T031 [P] Verificación transversal: SC-004 (cálculos/numeración sin cambios), SC-005 (cero hex de marca fuera de `tokens.ts`), SC-009 (textos es-MX), SC-010 (datos antiguos `emitido` legibles como Enviado) y FR-020 (no se añaden campos de datos nuevos)

---

## Phase 9: Correcciones posteriores (post-implementación)

**Purpose**: Fallos detectados en la validación manual.

- [X] T032 Corregir la visualización del logo en el PDF: normalizar cualquier imagen a PNG en `src/lib/logo.ts` (`prepararLogo`/`logoCompatibleConPdf`), usarla en `src/features/profile/ProfilePage.tsx`, proteger el render en `src/features/pdf/BudgetDocument.tsx` y añadir `tests/unit/logo.test.ts` (FR-010 de la spec 001)
- [X] T033 Validación manual: subir un logo en el perfil y comprobar que aparece en el PDF de un presupuesto nuevo (resultado: **exitoso**)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; **bloquea** todas las historias.
- **User Stories (Phases 3–7)**: dependen de Foundational.
- **Polish (Phase 8)**: depende de las historias que se quieran entregar.

### User Story Dependencies

- **US1 (P1)**: tras Foundational; sin dependencias de otras historias.
- **US2 (P1)**: tras Foundational; sin dependencias de otras historias.
- **US3 (P2)**: tras Foundational; usa los tokens del Setup; sin dependencias de otras historias.
- **US4 (P2)**: tras Foundational (T004–T008); sin dependencias de otras historias.
- **US5 (P2)**: tras Foundational y Setup (tokens); sin dependencias de otras historias.

### Within Each User Story

- Pruebas antes que implementación (deben fallar primero).
- Funciones puras y componentes antes de la integración en pantallas/rutas.
- Historia completa antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- Setup: T002 y T003 en paralelo tras T001.
- Foundational: T004 y T005 en paralelo.
- US1: T010, T011, T012 y T013 en paralelo; T014 depende de T013.
- US2: T016 y T017 en paralelo; T018 depende de T017.
- US3: T019, T020, T021 y T022 en paralelo; T023 depende de T019–T021.
- US4: T024 y T025 en paralelo; T026 y T027 dependen de T025.
- US5: T028 puede hacerse en paralelo con US3/US4 una vez existan los tokens.

---

## Parallel Example: User Story 1

```bash
# Lanzar en paralelo las pruebas y la base de la historia:
Task: "Test unitario del resumen derivado en tests/unit/home-resumen.test.ts"
Task: "Test de integración de la página de inicio en tests/integration/home.test.tsx"
Task: "Crear resumenActividad(presupuestos, hoy) en src/features/home/resumen.ts"
Task: "Crear src/features/home/HomePage.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2, ambas P1)

1. Completar Fase 1 (Setup) y Fase 2 (Foundational).
2. Completar US1 (página de inicio) y US2 (navegación común).
3. **PARAR y VALIDAR**: abrir la raíz, recorrer las cuatro secciones y el resumen.
4. Demo/entrega del MVP (primer cambio completo).

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 + US2 → MVP (página de inicio + navegación).
3. US3 → identidad visual coherente.
4. US4 → estados del presupuesto.
5. US5 → PDF rediseñado.
6. Polish → validación y no regresión.

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes.
- [Story] mapea la tarea a la historia de usuario para trazabilidad.
- No cambiar la **lógica** de `src/domain/calculations.ts`, `src/domain/money.ts` ni `src/domain/numbering.ts` (SC-004). En `numbering.ts` solo se ajusta el literal de estado (`'emitido'` → `'borrador'`) por el renombrado, sin alterar el comportamiento.
- Cada historia debe poder completarse y probarse de forma independiente.
- Ejecutar las pruebas antes de implementar y confirmar que fallan.
- Parar en cada checkpoint para validar la historia de forma independiente.
