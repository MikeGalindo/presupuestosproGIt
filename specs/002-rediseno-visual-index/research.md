# Research — Rediseño visual y página de inicio (index)

**Feature**: `002-rediseno-visual-index` | **Date**: 2026-10-09 | **Plan**: [plan.md](./plan.md)

Resuelve las incógnitas del contexto técnico y fija las decisiones de diseño. No quedan `NEEDS CLARIFICATION`.

---

## 1. Fuente única de la identidad visual

**Decision**: Definir la paleta, la escala de espaciado y la escala tipográfica en **`src/styles/tokens.ts`** (objeto TypeScript). Al arrancar, `main.tsx` aplica los colores como variables CSS en `document.documentElement`; `global.css` usa solo `var(--…)`; el PDF importa el mismo módulo.

**Rationale**: La app usa CSS y el PDF usa JS; un módulo TS es lo único que ambos pueden consumir sin duplicar valores. Cumple FR-007 y SC-005 (un solo lugar, cero colores de marca fuera) sin dependencias nuevas.

**Alternatives considered**:
- *Paleta duplicada en `:root` y en el PDF*: rechazada; dos fuentes de verdad (viola SC-005).
- *Preprocesador CSS (Sass/PostCSS)*: rechazado; dependencia nueva e innecesaria (Principio I).
- *Variables CSS leídas por el PDF*: imposible; `@react-pdf/renderer` no lee CSS del DOM.

## 2. Tipografía sin dependencias

**Decision**: Una sola familia para la interfaz usando la **pila del sistema**; en el PDF, `Helvetica`/`Helvetica-Bold` (incorporadas). Jerarquía por tamaño y peso según una escala fija.

**Rationale**: Mantiene la app **offline**, sin dependencias ni peticiones a terceros (Principios I y V) y coherente con `@react-pdf/renderer`. La identidad se construye con escala, peso y color, no con una fuente externa.

**Alternatives considered**:
- *Google Fonts / fuente de red*: rechazada; rompe offline, añade dependencia y fuga peticiones (Principio V).
- *Fuente local embebida (`@font-face` + archivos)*: rechazada; añade activos y complejidad sin pedido explícito.

## 3. Modelo de estados y migración de datos

**Decision**: `EstadoPresupuesto` pasa a `'borrador' | 'enviado' | 'aceptado' | 'rechazado'` (persistidos). Se añade un tipo de presentación `EstadoMostrado = EstadoPresupuesto | 'caducado'`. En `data/localStorage.ts` se migra `estado: 'emitido'` → `'enviado'` y se sube `VERSION_AGREGADO` a `2`, conservando la clave `presupuestospro:v1`.

**Rationale**: La equivalencia `emitido` → `enviado` la fija la clarificación; migrar en el adaptador de persistencia mantiene el cambio contenido en `data/` (Principio IX) y no pierde datos (SC-010, FR-021). La clave no cambia para no dejar datos huérfanos.

**Alternatives considered**:
- *Nueva clave de almacenamiento (`v2`)*: rechazada; perdería los datos de la v1 salvo migración explícita, con más riesgo.
- *Mantener `emitido` y añadir estados*: rechazado; mezcla terminologías y confunde la insignia y el historial.

## 4. Caducado como estado calculado

**Decision**: Función pura `estadoMostrado(presupuesto, hoy)` en `domain/estados.ts`: devuelve `'caducado'` cuando el estado persistido es `'enviado'` y `fechaValidez < hoy`; en el resto de casos devuelve el estado persistido. `hoy` se inyecta como parámetro (por defecto, la fecha actual).

**Rationale**: Evita estados obsoletos en disco, no requiere procesos de fondo y es trivialmente testeable (FR-013). Solo aplica a `enviado` (clarificación): un borrador no caduca y un presupuesto aceptado o rechazado ya está resuelto.

**Alternatives considered**:
- *Persistir `caducado`*: rechazada; exige recalcular/actualizar al vuelo y deja datos obsoletos.
- *Calcular también en borradores*: rechazada por la clarificación.

## 5. Transiciones de estado

**Decision**: `Borrador → Enviado` al emitir. Desde `Enviado` se puede pasar a `Aceptado` o `Rechazado`, corregir entre `Enviado`/`Aceptado`/`Rechazado`, y volver a `Enviado`. Nunca se vuelve a `Borrador`. Las transiciones se validan en `domain/estados.ts` (`transicionValida`) y en el mock (`cambiarEstado`).

**Rationale**: Flujo flexible elegido en la clarificación; evita clics irreversibles con muy poca complejidad.

**Alternatives considered**: flujo estricto de una sola vez y flujo semi-flexible; descartados por la clarificación.

## 6. Navegación común y sub-navegación

**Decision**: `AppLayout` muestra cuatro enlaces: **Presupuestos, Clientes, Catálogo, Perfil**. La sección Presupuestos incorpora un componente `PresupuestosSubnav` con dos pestañas (**Emitidos | Borradores**) visible en `/presupuestos` y `/borradores`, conservando las rutas actuales.

**Rationale**: Cumple las cuatro secciones pedidas (FR-002, FR-005) sin romper URLs ni la separación entre numerados y no numerados (clarificación). Reutiliza `NavLink` (sección activa) ya existente.

**Alternatives considered**:
- *Cinco enlaces en la barra*: rechazada por la clarificación.
- *Listado único con filtros*: rechazada por la clarificación.
- *Reestructurar rutas anidadas nuevas*: rechazada; mayor riesgo de romper enlaces y pruebas existentes.

## 7. Paridad de identidad app ↔ PDF

**Decision**: El PDF importa `tokens.ts` para color y escala; usa Helvetica con la misma jerarquía (título, secciones, tabla, totales). Se conservan exactamente los datos, secciones y cálculos actuales.

**Rationale**: FR-015 y Principio VII; el documento del cliente transmite la misma imagen sin tocar la lógica.

**Alternatives considered**: mantener la plantilla actual con colores sueltos; rechazado (rompe SC-005 y FR-015).

## 8. Accesibilidad

**Decision**: Foco visible con `outline` en todos los interactivos; insignias con **color + etiqueta + forma**; contraste de texto y estados ≥ AA; respeto de `prefers-reduced-motion` (sin animaciones no solicitadas); layout sin scroll horizontal desde 320 px.

**Rationale**: FR-019, SC-006, SC-008 y Principio IV.

**Alternatives considered**: estados solo por color; rechazado (accesibilidad y SC-006).

## 9. Página de inicio y resumen de actividad

**Decision**: `HomePage` en `/` con cuatro accesos y un resumen derivado en memoria: número de presupuestos por estado mostrado (los cinco) y, opcionalmente, totales de clientes y servicios. Estado vacío con invitación a empezar.

**Rationale**: FR-001…FR-004; sin peticiones ni datos nuevos (todo deriva de `useStore`).

**Alternatives considered**: mover el resumen al backend; rechazado (datos ya cargados, Principio I).

## 10. Pruebas y no regresión

**Decision**: Vitest para `domain/estados.ts` (Caducado, transiciones) y para el resumen derivado; RTL para `HomePage`, `EstadoBadge` y la navegación; verificación end-to-end en el navegador vía MCP de Chrome (quickstart). Las pruebas de la spec 001 deben seguir pasando.

**Rationale**: Principio IV y SC-004 (cero regresiones en cálculos y numeración). No se modifican `domain/calculations.ts`, `domain/money.ts` ni `domain/numbering.ts`.

**Alternatives considered**: solo pruebas manuales; rechazado (regresiones silenciosas).
