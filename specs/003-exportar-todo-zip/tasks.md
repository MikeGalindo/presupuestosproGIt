# Tasks: Exportar todos mis presupuestos en un .zip

**Input**: Design documents from `/specs/003-exportar-todo-zip/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Incluidos (el plan declara los archivos de prueba y el proyecto verifica con Vitest + RTL, Principio IV).

**Organization**: Tareas agrupadas por historia de usuario para poder implementar y probar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1, US2, US3 (las del `spec.md`)
- Rutas de archivo exactas en cada tarea

## Path Conventions

- SPA de proyecto único: `src/` y `tests/` en la raíz del repositorio.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar el punto de partida; el proyecto ya existe (specs 001/002).

- [X] T001 Verificar el estado base: `npm install`, `npm test` (todo en verde) y `npm run build` (typecheck) pasan; confirmar Node 20+; **no** se añade ninguna dependencia (`package.json`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utilidades puras compartidas y la operación de solo lectura del mock, necesarias para TODAS las historias.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta completar esta fase.

- [X] T002 [P] Implementar CRC-32 (tabla precalculada, polinomio `0xEDB88320`) y la función `crc32(datos: Uint8Array): number` en `src/lib/zip.ts`.
- [X] T003 Implementar `crearZip(entradas: EntradaZip[]): Blob` en `src/lib/zip.ts` (método *store*, bit 11 UTF-8, cabeceras locales + directorio central + EOCD). Depende de T002.
- [X] T004 [P] Prueba unitaria del escritor en `tests/unit/zip.test.ts`: round-trip (extraer entradas y comparar contenido), CRC por entrada y estructura (firmas `0x04034b50`, `0x02014b50`, `0x06054b50`). Depende de T003.
- [X] T005 [P] Implementar `limpiarNombreArchivo(nombre: string): string` y `nombrePdfCopia(presupuesto: Presupuesto): string` en `src/lib/archivos.ts` (sustituir `\ / : * ? " < > |` y de control por `-`, colapsar espacios, recortar; conservar acentos/ñ; formato `«número» - «cliente».pdf`).
- [X] T006 [P] Prueba unitaria en `tests/unit/archivos.test.ts`: `Diseño/Web S.L.` → `... - Diseño-Web S.L..pdf`; conserva acentos y espacios; caso sin cliente.
- [X] T007 Refactorizar `src/features/pdf/download.ts`: extraer `generarPdfBlob(presupuesto): Promise<Blob>`, reutilizarla en `descargarPdf` y **exportar** `descargarBlob`. (FR-004)
- [X] T008 Añadir `exportacion: { obtenerCopia: () => Promise<Agregado> }` a `src/data/backend.ts`: solo lectura, con `esperar()` + `enAlmacenamiento(...)`; devuelve una copia del agregado. (Principio IX)
- [X] T009 Exponer `obtenerCopia()` en `src/data/store.tsx` (`StoreContextValue` + `useCallback` + dependencias del `useMemo`).
- [X] T010 [P] Prueba unitaria `tests/unit/backend-export.test.ts`: `obtenerCopia()` devuelve el agregado y **no** modifica `localStorage` (solo lectura).
- [X] T011 Verificar que las pruebas existentes siguen verdes tras el refactor (`tests/integration/history.test.tsx` continúa mockeando `descargarPdf`).

**Checkpoint**: utilidades y costura listas; pueden empezar las historias.

---

## Phase 3: User Story 1 - Descargar toda mi actividad en un único .zip (Priority: P1) 🎯 MVP

**Goal**: Con ≥1 presupuesto emitido, un botón descarga **un único** `.zip` con un PDF por emitido + un archivo de datos, sin modificar nada.

**Independent Test**: con 3 emitidos, pulsar «Exportar todo (.zip)» y obtener `presupuestospro-copia-AAAA-MM-DD.zip` con 3 PDF `«número - cliente»` y `presupuestospro-datos.json`; el PDF es idéntico al de la app (S1, S3, S6 del quickstart).

### Implementation for User Story 1

- [X] T012 [US1] Crear `crearCopia(agregado: Agregado, exportadoEn: string): CopiaExportada` y el tipo `CopiaExportada` en `src/domain/copia.ts` (campos: `version`, `exportadoEn`, `perfil`, `clientes`, `servicios`, `presupuestos`, `correlativos`). (FR-006, data-model.md)
- [X] T013 [US1] Implementar en `src/features/budgets/exportarZip.ts`: `construirZipCopia(presupuestos, copia): Promise<Blob>` (un PDF por emitido con `generarPdfBlob` + `nombrePdfCopia`; entrada `presupuestospro-datos.json` con `crearCopia`; ensambla con `crearZip`) y `nombreZipCopia(): string` (`presupuestospro-copia-${hoyISO()}.zip`). (FR-002…FR-006, FR-017)
- [X] T014 [US1] Añadir el botón «Exportar todo (.zip)» en la botonera de `src/features/budgets/HistoryPage.tsx`: `store.obtenerCopia()` → `construirZipCopia(...)` → `descargarBlob(blob, nombreZipCopia())`. (FR-001)
- [X] T015 [P] [US1] Prueba de integración `tests/integration/exportar-zip.test.tsx`: descarga **un único** `.zip`, con N PDF `«número - cliente»` (sin borradores) y el archivo de datos; identidad del PDF (mockear `generarPdfBlob`); no altera datos (re-render idéntico).

**Checkpoint**: US1 funcional y verificable de forma independiente (MVP).

---

## Phase 4: User Story 2 - Una copia de mis datos para poder restaurar (Priority: P2)

**Goal**: Garantizar que el archivo de datos contiene **todo** lo necesario para una futura restauración (perfil con logo, clientes, servicios, presupuestos y numeración).

**Independent Test**: el `presupuestospro-datos.json` del `.zip` incluye `version`, `exportadoEn`, `perfil` (con `logo`), `clientes`, `servicios`, `presupuestos` y `correlativos` (S2 del quickstart).

### Implementation for User Story 2

- [X] T016 [US2] Completar `crearCopia` en `src/domain/copia.ts` para incluir explícitamente `version`, `exportadoEn`, `perfil` (con `logo`), `clientes`, `servicios`, `presupuestos` y `correlativos`. (FR-006)
- [X] T017 [P] [US2] Prueba unitaria `tests/unit/copia.test.ts` (completitud): con un agregado de prueba, verifica que la copia conserva logo, clientes, servicios, presupuestos, correlativos, `version` y `exportadoEn`.
- [X] T018 [P] [US2] Aserción de integración en `tests/integration/exportar-zip.test.tsx`: el data file JSON parsea y contiene cada sección.

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Exportación clara y bajo control (Priority: P3)

**Goal**: Avisar si no hay nada que exportar, mostrar progreso «x de N», bloquear el botón durante la operación y **abortar** con aviso si falla un PDF.

**Independent Test**: con 0 emitidos, avisa y no descarga; con 50+, muestra «x de N» y bloquea el botón; ante fallo de un PDF, aborta sin descargar (S4, S5, FR-016, SC-011).

### Implementation for User Story 3

- [X] T019 [US3] Añadir a `src/features/budgets/HistoryPage.tsx` el estado `exportando` + `progreso { hechos, total }`; deshabilitar el botón durante la operación y mostrar «Generando x de N…» con `role="status"` `aria-live="polite"`. Pasa un callback de progreso a `construirZipCopia`. (FR-009, SC-007)
- [X] T020 [US3] Estado vacío en `src/features/budgets/HistoryPage.tsx`: si `emitidos.length === 0`, mostrar aviso claro y **no** descargar ningún `.zip`. (FR-007, SC-005)
- [X] T021 [US3] Manejo de fallo en `src/features/budgets/HistoryPage.tsx`: envolver la exportación en `try/catch`; ante error, mostrar mensaje, **abortar** y no descargar; restaurar el botón. (FR-016, SC-011)
- [X] T022 [P] [US3] Pruebas de integración en `tests/integration/exportar-zip.test.tsx`: (a) sin emitidos → aviso y 0 descargas; (b) el texto de progreso aparece y el botón queda deshabilitado; (c) si `generarPdfBlob` rechaza → mensaje y 0 descargas.

**Checkpoint**: las tres historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cierre y verificación transversal.

- [X] T023 [P] Actualizar la lista de características en `README.md` (mención de «Exportar todo (.zip)»), en es-MX.
- [X] T024 Ejecutar la verificación completa: `npm test` (toda la suite) y `npm run build` (typecheck + build) en verde.
- [X] T025 Validar manualmente `specs/003-exportar-todo-zip/quickstart.md` (S1–S6) en el navegador vía **MCP de Chrome**; comprobar el `.zip` con `unzip -t`.
- [X] T026 Confirmar invariantes: `package.json` **sin** dependencias nuevas y sin importar `fflate`; exportación de solo lectura (SC-006) y estructura plana (SC-012).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; **bloquea** todas las historias.
- **User Stories (Phases 3–5)**: dependen de Foundational. Pueden hacerse en paralelo o en orden P1 → P2 → P3.
- **Polish (Phase 6)**: depende de las historias deseadas.

### User Story Dependencies

- **US1 (P1)**: arranca tras Foundational. Sin dependencias de otras historias.
- **US2 (P2)**: arranca tras Foundational; refina/completa el archivo de datos de US1 pero es verificable por sí sola.
- **US3 (P3)**: arranca tras Foundational; añade estados/aborto sobre el botón de US1.

### Within Each User Story

- Modelos/dominio antes de servicios; servicios antes de la UI; UI antes de la integración.
- Cada historia se completa antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- T002, T005 son [P] (archivos distintos).
- T004, T006 son [P] entre sí (dependen de T003/T005 respectivamente).
- T010 es [P].
- T015, T017, T018, T022 tocan archivos de prueba distintos → paralelizables.
- T023 es [P] con el resto de Polish.

---

## Parallel Example: Foundational

```bash
# En paralelo (archivos distintos):
Task: "T002 Implementar CRC-32 en src/lib/zip.ts"
Task: "T005 Implementar limpieza de nombres en src/lib/archivos.ts"
```

## Parallel Example: Tests de historias

```bash
Task: "T015 [US1] tests/integration/exportar-zip.test.tsx"
Task: "T017 [US2] tests/unit/copia.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup.
2. Phase 2: Foundational (CRÍTICO).
3. Phase 3: US1 → **parar y validar** (S1/S3/S6).
4. Desplegar/demostrar si procede.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → validar → demo (MVP).
3. US2 → validar completitud del archivo de datos.
4. US3 → validar estado vacío, progreso y aborto.
5. Polish → suite completa, build y validación en navegador.

### Parallel Team Strategy

1. El equipo completa Setup + Foundational.
2. Tras Foundational: A→US1, B→US2, C→US3 (los tests marcados [P] corren en paralelo).

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes.
- Sin dependencias nuevas: el `.zip` se genera con el escritor propio (`src/lib/zip.ts`).
- La exportación es **de solo lectura**: no se escribe nada en `localStorage` (FR-008, SC-006).
- Verificar que las pruebas fallan antes de implementar y pasar después.
- Commit tras cada tarea o grupo lógico.
