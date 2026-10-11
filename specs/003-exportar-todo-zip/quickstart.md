# Quickstart — Validación de «Exportar todos mis presupuestos en un .zip»

Guía para demostrar que la feature funciona de extremo a extremo. La verificación de
escenarios de interfaz se hace en el navegador vía **MCP de Chrome** (Principio IV).

## Prerrequisitos

- Node.js 20+ y npm.
- Dependencias instaladas.

## Puesta en marcha

```bash
npm install
npm run dev            # SPA en http://localhost:5173
```

## Pruebas automatizadas

```bash
npm test               # Vitest + React Testing Library
```

- `tests/unit/zip.test.ts` — escritor ZIP: cabeceras, CRC-32 y **round-trip** con un
  descompresor (`DecompressionStream`/lector propio) para verificar que el `.zip` es válido.
- `tests/unit/archivos.test.ts` — limpieza de nombres (`Diseño/Web S.L.`).
- `tests/integration/exportar-zip.test.tsx` — botón, progreso «x de N», estado vacío y aborto.

## Preparar datos de prueba

1. Configura el **perfil** en `/perfil` (nombre, razón social y RFC obligatorios).
2. Da de alta al menos **un cliente** (prueba uno con nombre conflictivo, p. ej.
   `Diseño/Web S.L.`) y un **servicio**.
3. Crea y **emite** 2–3 presupuestos (crea en `/presupuestos/nuevo` → «Emitir y descargar»).
4. Opcional: crea **un borrador** que NO debe aparecer en la copia.

## Escenarios de validación (dado / cuando / entonces)

### S1 — Exportar todo con datos (US1, FR-001…FR-005, SC-001…SC-003)

- **Dado** que tengo al menos un presupuesto emitido,
- **Cuando** pulso «Exportar todo (.zip)»,
- **Entonces** se descarga **un único** `presupuestospro-copia-AAAA-MM-DD.zip` con la fecha de hoy.

Comprueba al descomprimir:

- Hay **un PDF por cada presupuesto emitido**, nombrado `«número - cliente».pdf`
  (el borrador **no** aparece).
- Hay **exactamente un** `presupuestospro-datos.json`.
- Abre un PDF del `.zip` y compáralo con el que descargas desde `/presupuestos` para ese
  mismo presupuesto: deben ser **idénticos** (mismos datos y total al céntimo).

### S2 — Archivo de datos completo (US2, FR-006, SC-008)

- **Dado** el `.zip` descargado, **Cuando** abro `presupuestospro-datos.json`,
- **Entonces** contiene perfil (con logo), clientes, servicios, presupuestos y `correlativos`.

### S3 — Nombre conflictivo (FR-010, SC-004)

- **Dado** un presupuesto emitido de un cliente llamado `Diseño/Web S.L.`,
- **Cuando** exporto, **Entonces** su PDF se llama `... - Diseño-Web S.L..pdf` y el `.zip`
  abre sin errores.

### S4 — Sin presupuestos (US3, FR-007, SC-005)

- **Dado** que no tengo ningún presupuesto emitido,
- **Cuando** pulso «Exportar todo (.zip)», **Entonces** veo un aviso claro y **no** se descarga
  ningún `.zip`.

### S5 — Muchos presupuestos (US3, FR-009, SC-007)

- **Dado** que tengo muchos presupuestos emitidos (50+),
- **Cuando** pulso el botón, **Entonces** veo el progreso «x de N», el botón queda bloqueado
  y, al terminar, el `.zip` es correcto.

### S6 — Solo lectura (FR-008, SC-006)

- **Dado** que exporto, **Cuando** vuelvo a la app, **Entonces** nada ha cambiado (mismos
  presupuestos, estados y numeración).

## Resultado esperado

El `.zip` es un archivo válido (comprobable con `unzip -t` o el descompresor del sistema),
plano, con N PDF + 1 archivo de datos, y el PDF es idéntico al de la app.
