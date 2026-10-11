# specs — Estado del producto y especificaciones

Índice de las especificaciones de PresupuestosPro y estado actual del producto.
Cada feature vive en su propia carpeta `specs/NNN-nombre-feature/` y se desarrolla con
**Spec-Driven Development** (spec → plan → tareas → implementación), siguiendo la
constitución del proyecto.

> **Constitución**: `.specify/memory/constitution.md` — **v1.0.0** (ratificada 2026-10-07),
> 9 principios no negociables. Toda feature debe cumplirlos.

## Estado del producto

- **Producto**: SPA solo cliente para crear presupuestos profesionales, calcular impuestos
  (IVA 16 %, retención ISR 10 % opcional) y **descargar el PDF** es-MX/MXN. Sin backend real:
  los datos viven en `localStorage` tras un mock de backend asíncrono.
- **Versión**: `1.0.0` (`package.json`).
- **Calidad**: 70 pruebas en 20 archivos (`npm test`) y `npm run build` (typecheck + build)
  en verde.
- **Rutas**: `/`, `/perfil`, `/clientes`, `/servicios`, `/borradores`,
  `/presupuestos/nuevo`, `/borradores/:id`, `/presupuestos`, `/presupuestos/:id`.

## Especificaciones

| # | Feature | Rama | Estado | Tareas | Artefactos |
|---|---------|------|--------|--------|------------|
| 001 | Presupuestos profesionales en PDF (producto base) | `001-presupuestos-pdf` | publicada | 50/50 ✅ | [spec](001-presupuestos-pdf/spec.md) · [plan](001-presupuestos-pdf/plan.md) · [tasks](001-presupuestos-pdf/tasks.md) |
| 002 | Rediseño visual y página de inicio | `002-rediseno-visual-index` | publicada | 33/33 ✅ | [spec](002-rediseno-visual-index/spec.md) · [plan](002-rediseno-visual-index/plan.md) · [tasks](002-rediseno-visual-index/tasks.md) |
| 003 | Exportar todos mis presupuestos en un `.zip` | `003-exportar-todo-zip` | implementada | 26/26 ✅ | [spec](003-exportar-todo-zip/spec.md) · [plan](003-exportar-todo-zip/plan.md) · [tasks](003-exportar-todo-zip/tasks.md) |

### Detalle

- **001 — Producto base.** Perfil del emisor con marca y logo; catálogos de clientes y
  servicios; editor de presupuestos con líneas manuales o de catálogo y cálculo de base,
  IVA y retención; numeración correlativa `AÑO-NN` con reinicio anual; borradores e
  historial de emitidos; **PDF generado en el cliente** con `@react-pdf/renderer`.
- **002 — Rediseño visual e inicio.** Página de inicio como punto de entrada (accesos a las
  cuatro secciones + resumen de actividad) y navegación común; identidad visual centralizada
  en `src/styles/tokens.ts` (app y PDF); ampliación del modelo para los cinco estados
  (Borrador, Enviado, Aceptado, Rechazado y **Caducado** calculado) y flujo flexible de
  cambios de estado. Mantiene es-MX/MXN (Principio II).
- **003 — Exportar todo (.zip).** Acción de **solo lectura** que construye en el cliente
  **un único `.zip` plano** con un PDF por presupuesto emitido (`«número - cliente».pdf`) y
  un archivo de datos completo (`presupuestospro-datos.json`, con perfil + logo, catálogos,
  presupuestos y correlativos). Progreso «x de N», botón bloqueado y **aborto con aviso**
  si falla un PDF. Requiere Node 20+.

## Convenciones

- **Cero alcance fantasma**: nada sin especificación aprobada (Principio III).
- Todo requisito se expresa como escenario **dado / cuando / entonces** verificable; los
  escenarios de interfaz se validan en el navegador vía **MCP de Chrome** (Principio IV).
- **Dominio puro** en `src/domain` (sin React ni almacenamiento); `src/data` es el mock;
  `src/features` se organiza por área funcional.
- **Sin dependencias nuevas** (UI/CSS/iconos/fuentes de red) sin justificar (Principio I).
- Aritmética de dinero en **centavos enteros**; se formatea a MXN solo en presentación.
- Responde y documenta siempre en **español** (es-MX).

## Artefactos de una feature

```text
specs/<NNN-nombre-feature>/
├── spec.md          # Qué y por qué (escenarios dado/cuando/entonces)
├── plan.md          # Cómo (decisiones técnicas) + mantenimiento de CLAUDE.md
├── tasks.md         # Desglose de trabajo por historia de usuario
├── research.md      # Decisiones e investigación (Fase 0)
├── data-model.md    # Modelo de datos (Fase 1)
├── quickstart.md    # Escenarios de validación manual (S1…Sn)
└── contracts/       # Contratos de backend y de formato/exportación
```

## Mantenimiento

- Al cerrar una feature, actualiza su **Estado** y el conteo de **Tareas** en la tabla.
- Las decisiones transversales se registran en `CLAUDE.md` (créalo en la primera ocasión; una
  línea por decisión, con referencia a la spec, p. ej. `[003] …`), según la convención del proyecto.
