# Contrato — Tokens de diseño (fuente única de identidad)

**Feature**: `002-rediseno-visual-index` | **Date**: 2026-10-09

`src/styles/tokens.ts` es la **única fuente de verdad** de la paleta, el espaciado y la tipografía (FR-007, SC-005). La app consume variables CSS derivadas de este módulo; el PDF importa el módulo directamente. **Ningún color de marca debe escribirse fuera de este archivo.**

---

## Forma del módulo

```ts
export const PALETA = {
  marca:       '#1F3A5F',
  marcaOscura: '#14283F',
  marcaSuave:  '#E8EEF5',
  acento:      '#2E6B5E',
  texto:       '#1B1F24',
  textoSuave:  '#5B6470',
  borde:       '#D9DEE4',
  fondo:       '#F4F6F8',
  superficie:  '#FFFFFF',
} as const;

export const ESTADOS = {
  borrador:  { fondo: '#FBF1DC', texto: '#7A5410' },
  enviado:   { fondo: '#E3ECF7', texto: '#1F4E79' },
  aceptado:  { fondo: '#E1F0E6', texto: '#1E6B3A' },
  rechazado: { fondo: '#FBE4E3', texto: '#9A2A22' },
  caducado:  { fondo: '#ECEEF1', texto: '#566070' },
} as const;

export const ESPACIADO = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const TIPOGRAFIA = {
  familiaUI: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  familiaPDF: 'Helvetica',
  escala: [12, 14, 16, 18, 22, 28, 36], // px
} as const;
```

---

## Consumo

### Aplicación (CSS)

`main.tsx` llama a un helper `aplicarTokens()` que escribe cada color como variable CSS en `:root`:

```text
--marca, --marca-oscura, --marca-suave, --acento, --texto, --texto-suave,
--borde, --fondo, --superficie,
--estado-borrador-fondo, --estado-borrador-texto, … (los cinco estados)
```

`global.css` **solo** usa `var(--…)`; no contiene literales hex de marca.

Las **etiquetas** en es-MX de cada estado viven en `src/domain/estados.ts` (`ETIQUETAS_ESTADO`); aquí solo el color.

### PDF

`features/pdf/BudgetDocument.tsx` importa `PALETA` y `ESTADOS` de `tokens.ts` y los usa en su `StyleSheet`. No define hex propios.

---

## Reglas

- Un color nuevo se añade **solo** en `tokens.ts` y se expone como variable si la app lo necesita.
- Los colores de estado se aplican vía `EstadoBadge`, que combina fondo, texto y **forma/etiqueta** (nunca solo color).
- Contraste objetivo: **WCAG AA** para texto y estados (SC-006).
- El espaciado y la escala tipográfica se usan de forma consistente en toda la app y en el PDF (FR-008…FR-010).

---

## Verificación

- Búsqueda de literales hex de marca fuera de `tokens.ts`: debe dar **cero** resultados (SC-005).
- Comprobación de contraste de cada par fondo/texto de estado ≥ AA.
