<!--
Sync Impact Report
==================
Version change: N/A (plantilla sin ratificar) → 1.0.0
Tipo de bump: MAJOR — ratificación inicial. Se adopta el documento completo y se
  establecen 9 principios no negociables que antes no existían.

Principios definidos (todos nuevos):
  - I. Simplicidad ante todo
  - II. Idioma y mercado (es-MX, MXN)
  - III. Cero alcance fantasma
  - IV. Verificabilidad (dado/cuando/entonces y MCP Chrome)
  - V. Datos del usuario con respeto
  - VI. Stack
  - VII. El PDF es el producto
  - VIII. No-objetivos de v1
  - IX. Mock de backend, no backend real

Secciones añadidas:
  - Alcance de v1 y No-Objetivos
  - Flujo de Desarrollo y Puertas de Calidad

Secciones eliminadas: ninguna (se sustituyen los marcadores de plantilla).

Plantillas pendientes:
  - Ninguna. Todos los marcadores de plantilla fueron reemplazados.

Seguimiento (TODOs): ninguno. La fecha de ratificación se fijó en la fecha de adopción
  de esta primera versión (2026-10-07).
-->

# PresupuestosPro Constitution

## Core Principles

### I. Simplicidad ante todo

Toda decisión de diseño, código o alcance MUST favorecer la solución más simple que
cumpla el objetivo. Sin abstracciones prematuras, sin capas especulativas, sin
configurabilidad que nadie pidió. La regla operativa es: si no es necesario para que un
freelancer genere un presupuesto en PDF, no se construye.

Rationale: el valor del producto está en producir un PDF correcto rápido, no en la
infraestructura que lo rodea. La complejidad accidental es el mayor riesgo de v1.

### II. Idioma y mercado (es-MX, MXN)

El producto es para el mercado mexicano. Toda interfaz, copia, mensaje de error, formato
de fecha y formato de número MUST estar en español de México (es-MX). Toda cantidad
monetaria MUST expresarse en pesos mexicanos (MXN) y formatearse conforme a es-MX
(separador de miles, dos decimales, símbolo `$`). No se soportan otros idiomas ni
divisas en v1.

Rationale: el presupuesto es un documento comercial; un formato o idioma incorrectos lo
inhabilitan para el cliente final.

### III. Cero alcance fantasma

Ninguna funcionalidad MUST implementarse sin una especificación aprobada que la exija.
Los documentos de especificación son la única fuente de alcance. Queda prohibido añadir
"por si acaso", atajos, pantallas, campos, endpoints o dependencias no especificados.

Rationale: el alcance no solicitado consume tiempo, introduce defectos y contradice el
Principio I.

### IV. Verificabilidad (dado/cuando/entonces y MCP Chrome)

Toda funcionalidad MUST ser verificable mediante escenarios en formato
**dado / cuando / entonces** (Given/When/Then) descritos en la especificación. Cada
escenario de interfaz MUST poder ejecutarse y comprobarse en el navegador a través del
MCP de Chrome. Un requisito que no puede expresarse como un escenario verificable no se
considera listo para implementación.

Rationale: la verificación observable en el navegador convierte los requisitos en
criterios de aceptación objetivos y reproduce la experiencia real del usuario.

### V. Datos del usuario con respeto

El sistema MUST solicitar únicamente los datos necesarios para generar el presupuesto. No
se recolectan datos personales con fines no declarados, no se comparten con terceros y no
se envían a servicios externos. En v1 los datos residen únicamente en el navegador del
usuario y su persistencia es simulada (ver Principio IX).

Rationale: el respeto a los datos del usuario es un requisito ético y de confianza, y
además elimina superficie de riesgo legal y técnico.

### VI. Stack

El frontend MUST construirse con TypeScript en modo estricto, React 18 o superior y
Vite. El estado MUST ser el mínimo indispensable; se prefiere estado local y derivado
sobre gestores de estado globales. En v1 los datos provienen de un mock de backend (ver
Principio IX). v1 NO incluye auth, usuarios ni sesiones.

Rationale: un stack acotado y un estado mínimo reducen complejidad y hacen el
comportamiento predecible y verificable.

### VII. El PDF es el producto

El entregable central y criterio de éxito del producto es el PDF del presupuesto. El PDF
MUST generarse en el cliente, MUST respetar el idioma y formato es-MX, MUST verse
profesional al imprimirse y MUST contener toda la información esencial del presupuesto.
Cualquier función que no contribuya a un PDF correcto es secundaria.

Rationale: el usuario "contrata" el PDF; todo lo demás es medio para obtenerlo.

### VIII. No-objetivos de v1

Los siguientes elementos están explícitamente fuera de alcance en v1 y NO MUST
implementarse: autenticación, base de datos remota, multiusuario, envío de correo
electrónico y facturación fiscal (SAT). Tampoco existe backend real: el guardado se
simula conforme al Principio IX. Cualquier propuesta que introduzca alguno de estos
elementos requiere una enmienda a esta constitución antes de considerarse.

Rationale: delimitar la v1 evita desviar el esfuerzo del producto central y protege el
Principio I.

### IX. Mock de backend, no backend real

El mock de backend MUST exponer la misma interfaz que un backend real: operaciones
asíncronas que devuelven promesas y que pueden fallar con errores tipados, de modo que
sustituirlo por un backend real no requiera cambiar los consumidores. Queda PROHIBIDO:
realizar `fetch` a URLs reales, usar una base de datos y leer variables de entorno con
endpoints. El mock es andamiaje, no funcionalidad: MUST existir únicamente cuando una
especificación aprobada lo exija (Principio III).

Rationale: una costura de datos realista permite validar el flujo completo hoy y migrar
a un backend real después sin reescrituras, sin incurrir en infraestructura prematura.

## Alcance de v1 y No-Objetivos

v1 es una aplicación web cliente que permite a un freelancer capturar los datos de un
presupuesto y generar un PDF en es-MX/MXN. v1 excluye, de forma explícita: auth, base de
datos remota, multiusuario, correo electrónico, facturación SAT y backend real. La
persistencia se simula mediante el mock descrito en el Principio IX. Cualquier trabajo
fuera de este alcance MUST detenerse y escalarse como enmienda constitucional o como
nueva especificación.

## Flujo de Desarrollo y Puertas de Calidad

- La especificación precede a la implementación. Sin especificación aprobada no se
  escribe código (Principio III).
- Cada funcionalidad MUST incluir escenarios dado/cuando/entonces verificables en el
  navegador vía MCP de Chrome (Principio IV).
- Cada revisión de cambio MUST comprobar el cumplimiento de los nueve principios. La
  complejidad añadida MUST justificarse por escrito contra el Principio I.
- El PDF generado es el criterio de aceptación de extremo a extremo (Principio VII).
- El idioma y formato es-MX/MXN se verifican en interfaz, PDF y mensajes de error
  (Principio II).

## Governance

Esta constitución supersede cualquier otra práctica, convención o preferencia del
proyecto. En caso de conflicto, la constitución prevalece.

**Enmiendas**: toda enmienda MUST documentarse por escrito, indicar el principio o
sección afectada, exponer la justificación y ser aprobada por el responsable del
proyecto antes de aplicarse. Las enmiendas que retiren o redefinan principios existentes
son cambios incompatibles y exigen bump MAJOR.

**Versionado**: el número de versión sigue el versionado semántico.
- MAJOR: eliminación o redefinición incompatible de gobernanza o principios.
- MINOR: adición de un principio o sección, o expansión material de la guía existente.
- PATCH: aclaraciones, correcciones de redacción o refinamientos no semánticos.

**Revisión de cumplimiento**: cada revisión de cambio y cada plan de implementación MUST
verificar el cumplimiento de esta constitución. Las desviaciones MUST documentarse y
justificarse, y no pueden aprobarse sin modificar la constitución cuando correspondan a
principios no negociables.

**Guía de desarrollo en tiempo de ejecución**: usar esta constitución como fuente de
verdad para el alcance, el stack y los criterios de verificación.

**Version**: 1.0.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-10-07
