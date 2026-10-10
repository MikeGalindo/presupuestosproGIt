---
description: "Task list for PresupuestosPro — Presupuestos profesionales en PDF"
---

# Tasks: PresupuestosPro — Presupuestos profesionales en PDF

**Input**: Design documents from `/specs/001-presupuestos-pdf/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Se incluyen tareas de prueba porque el plan define Vitest + React Testing Library y la constitución (Principio IV) exige verificación de escenarios dado/cuando/entonces en el navegador vía MCP de Chrome. No es TDD estricto: las pruebas se escriben junto a cada historia.

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1, US2, US3, US4)
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

- **Single project**: `src/` y `tests/` en la raíz del repositorio (ver plan.md → Project Structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto y estructura base.

- [X] T001 Scaffold the Vite + React + TypeScript app at repo root: create `package.json`, `index.html`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `src/main.tsx` per plan.md.
- [X] T002 [P] Enable TypeScript strict mode in `tsconfig.json` (`"strict": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitOverride": true`).
- [X] T003 [P] Declare runtime dependencies in `package.json`: `react`, `react-dom`, `react-router-dom`, `@react-pdf/renderer`.
- [X] T004 [P] Declare dev/test dependencies and Vitest config: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`; add the `test` block to `vite.config.ts`.
- [X] T005 [P] Create global styles in `src/styles/global.css`.
- [X] T006 [P] Add npm scripts (`dev`, `build`, `preview`, `test`) to `package.json`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Núcleo compartido que DEBE existir antes de cualquier historia.

**⚠️ CRITICAL**: Ninguna historia de usuario puede empezar hasta terminar esta fase.

- [X] T007 Create domain types in `src/domain/types.ts`: `PerfilEmisor`, `Cliente`, `Servicio`, `Presupuesto`, `LineaPresupuesto`, `EmisorSnapshot`, `ClienteSnapshot`, `Centavos`, `EstadoPresupuesto = "borrador" | "emitido"`, exactamente con los campos y reglas de `data-model.md`.
- [X] T008 [P] Implement centavos arithmetic and es-MX/MXN formatting in `src/domain/money.ts` (`Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'})`, redondeo half-up a 2 decimales).
- [X] T009 [P] Implement tax calculations in `src/domain/calculations.ts`: `base = Σ importe`, `IVA = round(base × 16 / 100)`, `ISR = retencionISR ? round(base × 10 / 100) : 0`, `total = base + IVA − ISR`.
- [X] T010 [P] Implement validation rules in `src/domain/validation.ts`: emisor `nombre`/`razonSocial`/`rfc` no vacíos; cliente `nombre` no vacío; servicio `nombre` no vacío y `precioUnitario ≥ 0`; línea `descripcion` no vacía, `cantidad > 0`, `precioUnitario ≥ 0`; emisión = emisor válido + cliente válido + ≥ 1 línea.
- [X] T011 [P] Implement numbering in `src/domain/numbering.ts`: siguiente `YYYY-NN` tomando `max(NN)` de los presupuestos emitidos del mismo año + 1, `padStart(2,'0')`, reinicio anual, sin reutilizar números.
- [X] T012 Implement the mock backend interface with typed errors in `src/data/backend.ts` per `contracts/backend-contract.md` (`perfil`, `clientes`, `servicios`, `presupuestos` con operaciones asíncronas y códigos `VALIDACION|NO_ENCONTRADO|ALMACENAMIENTO|EMISION`).
- [X] T013 Implement the versioned localStorage adapter in `src/data/localStorage.ts` (clave `presupuestospro:v1`, agregado `{ perfil, clientes, servicios, presupuestos, version }`).
- [X] T014 Implement the data store/provider (React Context + `useReducer`) in `src/data/store.tsx` wiring the backend to the UI, con cálculos derivados.
- [X] T015 [P] Create shared UI components in `src/components/`: campo de formulario, tabla de datos, avisos/estados vacío-carga-error, diálogo de confirmación.
- [X] T016 [P] Create lib helpers in `src/lib/`: `ids.ts` (`crypto.randomUUID()`) y `dates.ts` (`Intl.DateTimeFormat('es-MX')`, validez por defecto +30 días).
- [X] T017 Create the app shell, router and provider wiring in `src/App.tsx` and `src/router.tsx` con las rutas de `contracts/app-routes.md`.

**Checkpoint**: Base lista — las historias pueden empezar en paralelo.

---

## Phase 3: User Story 1 - Emitir un presupuesto y descargarlo en PDF (Priority: P1) 🎯 MVP

**Goal**: Crear un presupuesto (cliente + líneas de catálogo o manuales), calcular base/IVA/ISR/total y descargar el PDF con marca; guardar/retomar borradores.

**Independent Test**: Con perfil y cliente mínimos, crear un presupuesto con una línea `2 × $1,000.00`, comprobar base `$2,000.00`, IVA `$320.00` y total `$2,320.00` (con ISR activo: retención `$200.00`, total `$2,120.00`) y descargar el PDF.

### Tests for User Story 1 ⚠️

- [X] T018 [P] [US1] Unit tests for tax calculations in `tests/unit/calculations.test.ts` (`2 × 1000` → base 2000, IVA 320, ISR 200, total 2120; ISR off → total 2320; precio 0 permitido).
- [X] T019 [P] [US1] Unit tests for numbering in `tests/unit/numbering.test.ts` (primero `2026-01`, consecutivos, reinicio anual `2027-01`, no reutiliza tras eliminar).

### Implementation for User Story 1

- [X] T020 [P] [US1] Build `LineEditor` in `src/features/budgets/LineEditor.tsx` para **líneas escritas a mano** (editar descripción/cantidad/unidad/precio, quitar; bloquear cantidad ≤ 0). La selección desde el catálogo de servicios se integra en T037 (US3).
- [X] T021 [P] [US1] Build `BudgetTotals` in `src/features/budgets/BudgetTotals.tsx` (base, IVA, retención, total en es-MX; conmutador de retención ISR).
- [X] T022 [P] [US1] Build the PDF document in `src/features/pdf/BudgetDocument.tsx` con `@react-pdf/renderer` (logo, snapshots de emisor/cliente, número, fechas, líneas y totales).
- [X] T023 [US1] Implement PDF download in `src/features/pdf/download.ts` (render a blob y descarga directa del archivo, sin diálogos).
- [X] T024 [US1] Build the budget editor screen in `src/features/budgets/BudgetEditor.tsx` (seleccionar un cliente existente o capturarlo al vuelo —la captura en línea se implementa en T031—, líneas manuales, retención, fecha de validez editable, totales en vivo, guardar borrador, emitir).
- [X] T025 [US1] Implement draft persistence and emission via the backend in `src/features/budgets/BudgetEditor.tsx` (crear/guardar borrador, `emitir`), deshabilitando y avisando según FR-011 (sin líneas) y FR-018 (datos obligatorios).
- [X] T026 [US1] Build the drafts list screen in `src/features/budgets/DraftsList.tsx` (retomar y eliminar borradores) y registrar su ruta `/borradores`.
- [X] T027 [US1] Integration test for the create→calculate→save draft→emit→PDF flow in `tests/integration/budget-flow.test.tsx`.
- [X] T028 [US1] Verify US1 scenarios in the browser via Chrome MCP per `quickstart.md` V1–V3. _(Verificado con el MCP chrome-devtools: V1 base $2,000.00 / IVA $320.00 / total $2,320.00 e ISR $200.00 / total $2,120.00; V2 emisión + PDF `application/pdf`; V3 borrador persistente.)_

**Checkpoint**: User Story 1 funcional y verificable de forma independiente (MVP).

---

## Phase 4: User Story 2 - Administrar el catálogo de clientes (Priority: P2)

**Goal**: Crear, editar y eliminar clientes con sus datos fiscales y de contacto.

**Independent Test**: Dar de alta un cliente, editarlo, verlo en la lista y eliminarlo; comprobar que desaparece y que ya no se puede seleccionar en un presupuesto nuevo.

### Tests for User Story 2 ⚠️

- [X] T029 [P] [US2] Unit tests for client validation in `tests/unit/validation.clients.test.ts` (nombre obligatorio; RFC/correo/teléfono/dirección opcionales; correo con formato válido si existe).

### Implementation for User Story 2

- [X] T030 [US2] Build the client catalog screen in `src/features/clients/ClientsPage.tsx` (listar, crear, editar, eliminar con confirmación; `nombre` obligatorio; RFC/correo/teléfono/dirección opcionales).
- [X] T031 [US2] Implement inline client capture from the budget editor (mini-form que guarda un cliente vía el backend y lo deja seleccionado) in `src/features/budgets/BudgetEditor.tsx`.
- [X] T032 [US2] Integration test for client CRUD in `tests/integration/clients.test.tsx`.
- [X] T033 [US2] Verify US2 scenarios via Chrome MCP per `quickstart.md` V4 (clientes). _(Verificado con el MCP chrome-devtools: alta, edición y eliminación con confirmación; desaparece de la lista.)_

**Checkpoint**: User Stories 1 y 2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Configurar mi marca y mi catálogo de servicios (Priority: P3)

**Goal**: Registrar el perfil del emisor (con logo) y el catálogo de servicios con su precio y unidad.

**Independent Test**: Guardar el perfil con logo, crear un servicio y comprobar que se conservan y que el servicio aparece como opción al añadir líneas.

### Tests for User Story 3 ⚠️

- [X] T034 [P] [US3] Unit tests for profile/service validation in `tests/unit/validation.profile.test.ts` (emisor `nombre`/`razonSocial`/`rfc` obligatorios; servicio `nombre` y `precioUnitario ≥ 0`).

### Implementation for User Story 3

- [X] T035 [P] [US3] Build the profile screen in `src/features/profile/ProfilePage.tsx` (nombre, razón social, RFC obligatorios; correo, teléfono, dirección; logo como data URL ≤ ~1 MB vía `FileReader`).
- [X] T036 [P] [US3] Build the services catalog screen in `src/features/services/ServicesPage.tsx` (CRUD; nombre, descripción, precio ≥ 0, unidad de texto libre con sugerencias hora/pieza/proyecto/servicio/mes).
- [X] T037 [US3] Wire the service catalog into the editor's line picker in `src/features/budgets/LineEditor.tsx` (precargar descripción, precio y unidad; `origen: "catalogo"`).
- [X] T038 [US3] Integration test for profile + services in `tests/integration/catalog.test.tsx`.
- [X] T039 [US3] Verify US3 scenarios via Chrome MCP per `quickstart.md` V4 (perfil y servicios). _(Verificado con el MCP chrome-devtools: perfil con logo (data URL) y servicio `$1,500.00`/`proyecto` visibles y disponibles en el editor.)_

**Checkpoint**: Todas las historias 1–3 funcionan de forma independiente.

---

## Phase 6: User Story 4 - Consultar y gestionar el historial de presupuestos (Priority: P4)

**Goal**: Ver los presupuestos emitidos, abrir el detalle, volver a descargar el PDF y eliminarlos.

**Independent Test**: Con presupuestos emitidos, verlos listados con número/cliente/fecha/total, abrir el detalle, descargar un PDF y eliminar uno comprobando que su número no se reutiliza.

### Tests for User Story 4 ⚠️

- [X] T040 [P] [US4] Unit test for emitted-history filtering and snapshot immutability in `tests/unit/history.test.ts`.

### Implementation for User Story 4

- [X] T041 [US4] Build the history screen in `src/features/budgets/HistoryPage.tsx` (listar emitidos con número, cliente, fecha y total en MXN).
- [X] T042 [US4] Build the budget detail screen in `src/features/budgets/BudgetDetail.tsx` (ver el snapshot, descargar de nuevo el PDF, eliminar con confirmación; sin edición).
- [X] T043 [US4] Integration test for history in `tests/integration/history.test.tsx`.
- [X] T044 [US4] Verify US4 scenarios via Chrome MCP per `quickstart.md` V5. _(Verificado con el MCP chrome-devtools: `2026-01`/`2026-02`, re-descarga del PDF, borrado y `2026-03` tras eliminar el `2026-02` — el número no se reutiliza.)_

**Checkpoint**: Todas las historias de usuario funcionan de forma independiente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan a varias historias.

- [X] T045 [P] Centralize empty/loading/error states and es-MX messages across screens in `src/components/`.
- [X] T046 [P] Handle remaining edge cases across `src/features/`: logo ausente, retención desactivada, precio 0, cliente/servicio eliminado con presupuestos (snapshot).
- [X] T047 [P] Add basic accessibility (labels, foco y teclado en formularios y diálogos) across `src/components/`.
- [X] T048 Run the full `quickstart.md` V1–V7 in the browser via Chrome MCP and fix findings. _(Verificado con el MCP chrome-devtools V1–V7; hallazgo corregido: la "última edición" del borrador mostraba un día de más por usar la fecha UTC — `formatearFecha` ahora respeta la zona local (con prueba de regresión). `npm test` 37/37 y `npm run build` en verde. Corregido además el desbordamiento del importe en el editor de líneas: grid fluido con `minmax(0, …)`, entradas `width:100%`, importe alineado a la derecha con cifras tabulares y apilado responsive.)_
- [X] T049 [P] Write run/validation instructions in `README.md`.
- [X] T050 Run `npm run build` (typecheck) and `npm test` until green from the repository root (`package.json`); fix issues.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede empezar de inmediato.
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEA todas las historias.
- **User Stories (Phase 3+)**: Dependen de Foundational.
  - US1 (P1) es el MVP; US2/US3/US4 pueden ir en paralelo o en orden de prioridad.
- **Polish (Phase 7)**: Depende de las historias deseadas completas.

### User Story Dependencies

- **US1 (P1)**: Tras Foundational. Sin dependencias de otras historias (usa líneas manuales y un cliente puntual).
- **US2 (P2)**: Tras Foundational. Mejora la selección de cliente de US1, pero es independiente.
- **US3 (P3)**: Tras Foundational. Alimenta el selector de servicios del editor (US1), pero es independiente.
- **US4 (P4)**: Tras Foundational. Consume presupuestos emitidos por US1; puede probarse con datos sembrados.

### Within Each User Story

- Pruebas antes de la implementación que cubren.
- Componentes de UI antes de las pantallas que los componen.
- Núcleo antes de la integración.
- Historia completa antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- Setup: T002–T006 en paralelo.
- Foundational: T008–T011 y T015–T016 en paralelo.
- US1: T018/T019 (pruebas) y T020/T021/T022 (componentes) en paralelo.
- US2/US3: T029/T030 y T034/T035/T036 en paralelo dentro de cada historia.
- Polish: T045/T046/T047/T049 en paralelo.

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 en paralelo:
Task: "Unit tests for tax calculations in tests/unit/calculations.test.ts"
Task: "Unit tests for numbering in tests/unit/numbering.test.ts"

# Componentes de US1 en paralelo:
Task: "Build LineEditor in src/features/budgets/LineEditor.tsx"
Task: "Build BudgetTotals in src/features/budgets/BudgetTotals.tsx"
Task: "Build the PDF document in src/features/pdf/BudgetDocument.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Fase 1: Setup.
2. Completar Fase 2: Foundational (CRÍTICO).
3. Completar Fase 3: User Story 1.
4. **PARAR y VALIDAR**: probar US1 de forma independiente (quickstart V1–V3).
5. Demostrar el PDF generado.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → probar → entregar (MVP: presupuesto + PDF).
3. US2 → probar → entregar (catálogo de clientes).
4. US3 → probar → entregar (marca y servicios).
5. US4 → probar → entregar (historial).
6. Polish → validación completa V1–V7.

### Parallel Team Strategy

Con varias personas, tras Setup + Foundational:
- Persona A: US1 (MVP).
- Persona B: US2.
- Persona C: US3.
- Persona D: US4 (con datos sembrados).

---

## Notes

- `[P]` = archivos distintos, sin dependencias pendientes.
- `[Story]` mapea cada tarea a su historia para trazabilidad.
- Cada historia es completable y probable de forma independiente.
- Verificar que las pruebas fallen antes de implementar.
- Confirmar cada checkpoint antes de avanzar.
- Evitar tareas vagas y conflictos en el mismo archivo.
