# Phase 0 — Research: Exportar todos mis presupuestos en un .zip

Todas las incógnitas del *Technical Context* quedan resueltas aquí. No se marca ningún
`NEEDS CLARIFICATION`.

## Decisión 1 — Cómo generar el `.zip` (sin dependencias)

- **Decisión**: implementar un **escritor ZIP propio** en `src/lib/zip.ts`, con método
  **store** (sin compresión) y **CRC-32** (polinomio `0xEDB88320`, tabla precalculada),
  marcando el bit 11 (UTF-8) de las *general purpose flags* para los nombres.
- **Rationale**: respeta la convención del proyecto de **evitar dependencias nuevas**
  (Principio I) y es una implementación pequeña, pura y determinista, fácil de probar.
  El método *store* es suficiente: los PDF ya son binarios comprimidos internamente y el
  JSON de datos es de tamaño moderado; no se gana nada tangible comprimiendo aquí.
- **Alternativas consideradas**:
  - `fflate` — presente en `node_modules` **solo como dependencia transitiva** de
    `pdfkit`/`@react-pdf/renderer`; **no** es dependencia directa, importarla sería una
    dependencia nueva (rechazada por Principio I).
  - `jszip` — dependencia nueva y con mayor peso (rechazada).
  - `CompressionStream('deflate-raw')` — obligaría a comprimir cada entrada de forma
    asíncrona y a manejar compatibilidad; más complejidad sin beneficio claro (rechazada v1).

## Decisión 2 — Reutilización del PDF existente

- **Decisión**: extraer `generarPdfBlob(presupuesto): Promise<Blob>` en
  `src/features/pdf/download.ts`; `descargarPdf()` la reutiliza y la exportación la llama
  **una vez por presupuesto emitido**.
- **Rationale**: garantiza que el PDF del `.zip` sea **idéntico** al que descarga la app
  (FR-004, SC-003) sin duplicar el render ni la lógica.
- **Alternativas consideradas**: duplicar el render (riesgo de divergencia); reutilizar
  `descargarPdf` directamente (descargaría N archivos sueltos, incorrecto).

## Decisión 3 — Archivo de datos

- **Decisión**: un único `presupuestospro-datos.json` (UTF-8) en la **raíz** del `.zip`,
  con el contenido `{ version, exportadoEn, perfil, clientes, servicios, presupuestos,
  correlativos }` —esto es, el `Agregado` persistente más metadatos de exportación—.
- **Rationale**: formato abierto y legible, apto para una **futura importación/restauración**
  (FR-006, US2); incluye todos los datos necesarios. La `version` ya existe en el `Agregado`.
- **Alternativas consideradas**: CSV (no representa logo ni jerarquía de presupuestos),
  formato binario propietario (opaco para el usuario y para futuras versiones).

## Decisión 4 — Nombres de archivo dentro del `.zip`

- **Decisión**: `nombrePdfCopia(p) = `${p.numero} - ${clienteSnapshot.nombre}.pdf`` en
  `src/lib/archivos.ts`, limpiando caracteres prohibidos (`\ / : * ? " < > |` y de control)
  a `-`, colapsando espacios repetidos y recortando extremos; se **conservan acentos y espacios**.
  La descarga individual (`nombreArchivoPdf`) **no cambia**.
- **Rationale**: cumple FR-005/FR-010 y el caso límite «Diseño/Web S.L.»; separa el nombre de
  la copia del nombre de la descarga suelta (decisión de clarificación).
- **Alternativas consideradas**: reutilizar `nombreArchivoPdf` (formato distinto al pedido).

## Decisión 5 — Descarga, progreso y aborto

- **Decisión**: reutilizar el helper `descargarBlob` (que se exporta) con el nombre
  `presupuestospro-copia-${hoyISO()}.zip`. En `HistoryPage`, estado local
  `exportando` + `progreso { hechos, total }`; el botón se **deshabilita** durante la
  operación y se muestra «Generando x de N…» en un `role="status" aria-live="polite"`.
  Ante cualquier fallo al generar un PDF se **aborta**, se muestra el mensaje y **no se
  descarga** nada (FR-009, FR-016).
- **Rationale**: cumple FR-002/FR-009/FR-016 y US3; accesible y mobile-first.
- **Alternativas consideradas**: exportación sin contador (no cumple P3); descarga parcial
  (rechazada por clarificación).

## Decisión 6 — Operación de solo lectura en el mock

- **Decisión**: añadir `backend.exportacion.obtenerCopia(): Promise<Agregado>` (con
  `esperar()` y `enAlmacenamiento`) que **solo lee**; se expone como `obtenerCopia()` en
  `useStore()`.
- **Rationale**: mantiene la costura del mock (Principio IX) y el estilo existente; los
  componentes nunca tocan `localStorage`.
- **Alternativas consideradas**: leer `localStorage` desde el componente (viola Principio IX).

## Verificación de identidad del PDF (SC-003)

El PDF del `.zip` se produce con el **mismo** `generarPdfBlob` → mismo `BudgetDocument`,
mismos cálculos y mismo `@react-pdf/renderer`. La identidad es **por construcción**; la
prueba de integración comparará los bytes/estructura del blob generado para un presupuesto
con el que produce la misma función.
