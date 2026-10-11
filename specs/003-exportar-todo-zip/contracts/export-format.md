# Contrato del archivo exportado (`.zip`) — Exportación

Define **qué** produce la acción «Exportar todo (.zip)» y **cómo** se nombra y estructura.
Cubre FR-002, FR-003, FR-005, FR-006, FR-010, FR-016 y FR-017.

## 1. Archivo contenedor

- **Un único** archivo `.zip`.
- **Nombre**: `presupuestospro-copia-AAAA-MM-DD.zip`, con la fecha **local** del día de la
  exportación (p. ej. `presupuestospro-copia-2026-03-15.zip`).
- **Estructura**: **plana**, sin carpetas. Todas las entradas en la raíz.
- **Codificación de nombres**: UTF-8 (bit 11 de las *general purpose flags*).
- **Método de compresión**: *store* (sin compresión); CRC-32 por entrada.

## 2. Contenido del `.zip`

| Entrada | Tipo MIME | Cardinalidad | Origen |
|---------|-----------|--------------|--------|
| `presupuestospro-datos.json` | `application/json` | exactamente **1** | Copia de exportación (agregado + `exportadoEn`) |
| `<número> - <cliente>.pdf` | `application/pdf` | **1 por presupuesto emitido** | `generarPdfBlob(presupuesto)` (mismo PDF que la app) |

- **Presupuestos incluidos**: `estado !== 'borrador'` (Enviado, Aceptado, Rechazado, Caducado).
- **Presupuestos excluidos**: borradores.
- **Identidad del PDF**: byte a byte el mismo documento que produce la exportación individual
  (mismo `BudgetDocument` y mismos cálculos) — FR-004, SC-003.

## 3. Nombre de cada PDF

- Patrón: `«número» - «cliente».pdf` (p. ej. `2026-001 - Estudio García.pdf`).
- **Limpieza**: los caracteres prohibidos `\ / : * ? " < > |` y los de control se sustituyen
  por `-`; se colapsan espacios repetidos y se recortan los extremos. Se **conservan** acentos,
  letras (incl. ñ) y espacios normales.
  - Ejemplo: cliente `Diseño/Web S.L.` → `2026-001 - Diseño-Web S.L..pdf`.
- La numeración es única por presupuesto, por lo que **no** hay colisión de nombres esperada.

## 4. Archivo de datos

- **Nombre**: `presupuestospro-datos.json` (raíz del `.zip`), UTF-8.
- **Contenido**:

  ```json
  {
    "version": 2,
    "exportadoEn": "2026-10-10T18:30:00.000Z",
    "perfil": { "...": "PerfilEmisor | null (incluye logo como data URL)" },
    "clientes": [],
    "servicios": [],
    "presupuestos": [],
    "correlativos": { "2026": 3 }
  }
  ```

- Pensado para permitir una **futura importación** (fuera de alcance de esta spec).

## 5. Comportamiento

- **Sin presupuestos emitidos**: aviso claro y **ninguna descarga** (FR-007, SC-005).
- **Fallo al generar un PDF**: **abortar** la exportación completa, avisar y **no descargar**
  ningún `.zip` (FR-016, SC-011).
- **Solo lectura**: tras exportar, los datos permanecen inalterados (FR-008, SC-006).
- **Progreso**: contador «x de N» y botón bloqueado durante la operación (FR-009, SC-007).
