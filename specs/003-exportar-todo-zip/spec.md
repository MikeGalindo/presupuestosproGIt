# Feature Specification: Exportar todos mis presupuestos en un .zip

**Feature Branch**: `003-exportar-todo-zip`

**Created**: 2026-10-10

**Status**: implementada

**Input**: User description: "Exportar todos mis presupuestos en un .zip. Que el freelancer pueda llevarse TODOS sus presupuestos de una sola vez, en un único archivo comprimido .zip, como copia de seguridad y para archivarlos donde quiera. Alcance: un botón «Exportar todo (.zip)» en un lugar visible de la lista de presupuestos; al pulsarlo se descarga UN único .zip que contiene un PDF por cada presupuesto existente (exactamente el mismo PDF que ya genera la app) y un único archivo de datos con toda la información (presupuestos, catálogo de servicios y perfil del freelancer, logo incluido), pensado para poder restaurar la aplicación en el futuro; funciona con 1 o 200 presupuestos. Reglas: el .zip se llama presupuestospro-copia-AAAA-MM-DD.zip; cada PDF se llama «número + cliente» (p. ej. «2026-001 - Estudio García.pdf»); la exportación es solo lectura; los PDF cuadran al céntimo con los de la app. Fuera de alcance: importar/restaurar (otra spec), exportar a Excel/CSV, copias automáticas y enviar el zip por email o a la nube. Reutilizar la funcionalidad existente para PDF."

## Clarifications

### Session 2026-10-10

- Q: El alcance dice «un PDF por cada presupuesto existente», pero los borradores no tienen número ni PDF. ¿Qué presupuestos entran en el .zip? → A: **Solo los emitidos** (estados Enviado, Aceptado, Rechazado y Caducado). Los borradores quedan fuera.
- Q: ¿Qué debe contener el archivo de datos para permitir una futura restauración? → A: **Todos los datos de la aplicación**: perfil (con logo), **clientes**, servicios, presupuestos y la **numeración** (correlativos). No solo lo enumerado en el alcance.
- Q: El nombre pedido dentro del .zip («2026-001 - Estudio García.pdf») difiere del de la descarga individual actual («Presupuesto-2026-001-Estudio-García.pdf»). ¿Se alinean? → A: **Dentro del .zip** se usa el formato pedido «número - cliente»; la **descarga individual mantiene su nombre actual** sin cambios.
- Q: Con muchos presupuestos hay que ver que la app trabaja. ¿Qué feedback? → A: **Progreso cuantificado «x de N»** (PDF generados sobre el total) con el **botón bloqueado** hasta terminar.
- Q: Si durante la exportación falla la generación de uno de los PDF, ¿qué debe hacer la app? → A: **Abortar** toda la exportación, avisar del error y **no descargar ningún `.zip`** (nunca una copia incompleta).
- Q: ¿Cómo se organiza el contenido dentro del `.zip`? → A: **Plano**: todos los PDF y el único archivo de datos en la **raíz** del `.zip`, sin carpetas.

## User Scenarios & Testing *(mandatory)*

**Objetivo de negocio**: dar al freelancer una forma sencilla y fiable de **llevarse todo su trabajo de una sola vez**: un único archivo `.zip` con el PDF de cada presupuesto emitido (exactamente el mismo documento que la app ya genera) y un archivo de datos con toda su información. Sirve como **copia de seguridad** y para **archivar** fuera de la aplicación. La operación es de **solo lectura**: no altera ningún dato y reutiliza la generación de PDF ya existente.

### User Story 1 - Descargar toda mi actividad en un único .zip (Priority: P1)

Como freelancer, quiero un botón que me descargue de una sola vez todos mis presupuestos en PDF dentro de un único archivo `.zip`, para guardarlos como copia de seguridad o archivarlos donde quiera sin ir uno por uno.

**Why this priority**: es la esencia de la función. Hoy el freelancer solo puede descargar un PDF cada vez; llevarse todo su historial exige repetir el proceso presupuesto a presupuesto. Sin este flujo, no hay funcionalidad.

**Independent Test**: con 3 presupuestos emitidos, pulsar «Exportar todo (.zip)» y comprobar que se descarga **un único** `.zip` con 3 PDF (nombrados «número - cliente») y un archivo de datos.

**Acceptance Scenarios**:

1. **Dado** que tengo al menos un presupuesto emitido, **Cuando** pulso «Exportar todo (.zip)», **Entonces** se descarga **un único** archivo comprimido llamado `presupuestospro-copia-AAAA-MM-DD.zip`, con la fecha del día de la exportación.
2. **Dado** el `.zip` descargado, **Cuando** lo descomprimo, **Entonces** veo **un PDF por cada presupuesto emitido**, nombrado «número - cliente» (por ejemplo, `2026-001 - Estudio García.pdf`), y **un único** archivo de datos.
3. **Dado** un presupuesto cualquiera del `.zip`, **Cuando** comparo su PDF con el que descargo desde la app para ese mismo presupuesto, **Entonces** son **idénticos** (mismos datos, mismo formato y mismo total al céntimo).
4. **Dado** que he exportado, **Cuando** vuelvo a la aplicación, **Entonces** todo sigue exactamente igual: la exportación no crea, modifica ni elimina ningún dato.

---

### User Story 2 - Una copia de mis datos para poder restaurar (Priority: P2)

Como freelancer, quiero que el `.zip` incluya **toda** mi información (no solo los PDF), para poder recuperar mi trabajo en el futuro aunque no entienda nada de archivos técnicos.

**Why this priority**: los PDF sirven para el cliente, pero por sí solos no bastan para recuperar la aplicación. El valor de "copia de seguridad" exige que viaje también la información completa de la app.

**Independent Test**: generar el `.zip` y comprobar que contiene **un único archivo de datos** con el perfil (logo incluido), los clientes, los servicios, los presupuestos y la numeración.

**Acceptance Scenarios**:

1. **Dado** el `.zip` descargado, **Cuando** abro el archivo de datos, **Entonces** contiene el **perfil del freelancer con su logo**, el **catálogo de clientes**, el **catálogo de servicios**, todos los **presupuestos** y la **numeración** usada.
2. **Dado** que tengo menos datos de algún tipo (por ejemplo, sin clientes o sin servicios), **Cuando** exporto, **Entonces** el archivo de datos incluye lo que existe y sigue siendo coherente, sin errores.
3. **Dado** el archivo de datos, **Cuando** pienso en el futuro, **Entonces** está pensado para poder **restaurar** la aplicación (la importación se hará en otra spec; aquí solo se genera la copia).

---

### User Story 3 - Exportación clara y bajo control (Priority: P3)

Como freelancer no técnico, quiero que la exportación me avise cuando no haya nada que exportar, me muestre que está trabajando cuando hay muchos presupuestos y no me permita lanzarla dos veces a la vez, para no dudar ni romper nada.

**Why this priority**: evita las dos confusiones típicas: creer que el botón no hizo nada (sin datos) y pensar que la app se colgó (con muchos presupuestos). Es robustez, no el núcleo.

**Independent Test**: con 0 presupuestos emitidos, comprobar que avisa y no descarga nada; con muchos presupuestos, comprobar que muestra el progreso «x de N» y bloquea el botón hasta terminar.

**Acceptance Scenarios**:

1. **Dado** que no tengo ningún presupuesto emitido, **Cuando** pulso «Exportar todo (.zip)», **Entonces** la app me avisa claramente de que no hay nada que exportar y **no** descarga ningún `.zip` vacío.
2. **Dado** que tengo muchos presupuestos (por ejemplo, 50 o más), **Cuando** pulso «Exportar todo (.zip)», **Entonces** veo el progreso «x de N» mientras se generan los PDF y el botón permanece bloqueado hasta terminar.
3. **Dado** que ya hay una exportación en curso, **Cuando** vuelvo a pulsar el botón, **Entonces** no se lanza una segunda exportación simultánea.

---

### Edge Cases

- **Sin presupuestos emitidos** (cero, o solo borradores): aviso claro y **ninguna** descarga de `.zip` vacío.
- **Cliente con caracteres conflictivos** en el nombre (`Diseño/Web S.L.`): el nombre del archivo se limpia/normaliza para que el `.zip` no se rompa, conservando un nombre legible.
- **Nombres con acentos, espacios o símbolos** (`Estudio García`): se conservan legibles en la medida de lo posible (p. ej., «2026-001 - Estudio García.pdf»).
- **Muchos presupuestos (50+)**: la operación puede tardar; debe verse el progreso y, al terminar, el `.zip` debe ser correcto.
- **Presupuestos en distintos estados** (Enviado, Aceptado, Rechazado y Caducado): **todos** se incluyen.
- **Colisión de nombres**: la numeración es única por presupuesto, por lo que no se esperan dos PDF con el mismo nombre; aun así, dos PDF nunca deben sobrescribirse dentro del `.zip`.
- **Sin perfil o sin algún catálogo**: se exporta lo que exista, sin fallar.
- **Logo grande o muchos datos**: el archivo de datos debe generarse igualmente.
- **Cerrar o interrumpir la exportación a medias**: no debe corromper ni modificar los datos guardados (operación de solo lectura).
- **Borradores**: nunca se exportan como PDF (no tienen número); si en el futuro se quisieran, sería otro alcance.
- **Fallo durante la exportación** (por ejemplo, al generar uno de los PDF): se **aborta** la exportación completa, se avisa del error y **no se descarga ningún `.zip`**; la aplicación no queda alterada.
- **Contenido plano**: el `.zip` no crea carpetas; los PDF y el archivo de datos quedan directamente en su raíz.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST ofrecer un botón «Exportar todo (.zip)» en un lugar visible de la sección de presupuestos.
- **FR-002**: Al pulsarlo, el sistema MUST descargar **un único** archivo comprimido `.zip` nombrado `presupuestospro-copia-AAAA-MM-DD.zip`, usando la **fecha del día de la exportación**.
- **FR-003**: El `.zip` MUST contener **un PDF por cada presupuesto emitido** (estados Enviado, Aceptado, Rechazado y Caducado). Los borradores MUST quedar fuera. *(Decisión de clarificación)*
- **FR-004**: Cada PDF del `.zip` MUST ser **exactamente el mismo** que la app descarga para ese presupuesto: reutiliza la generación de PDF existente, con los **mismos datos y totales al céntimo**.
- **FR-005**: Cada PDF del `.zip` MUST nombrarse «número - cliente» (por ejemplo, `2026-001 - Estudio García.pdf`). *(Decisión de clarificación)*
- **FR-006**: El `.zip` MUST contener **un único archivo de datos** con **toda la información de la aplicación**: perfil (con logo), clientes, servicios, presupuestos y numeración (correlativos), apto para una futura restauración. *(Decisión de clarificación)*
- **FR-007**: Si no hay ningún presupuesto emitido, el sistema MUST avisar claramente y MUST NOT descargar ningún `.zip`.
- **FR-008**: La exportación MUST ser de **solo lectura**: no crea, modifica ni elimina ningún dato; tras exportar, la aplicación queda idéntica.
- **FR-009**: Con muchos presupuestos, el sistema MUST mostrar el progreso «x de N» (PDF generados sobre el total) y MUST bloquear el botón hasta finalizar, evitando exportaciones simultáneas. *(Decisión de clarificación)*
- **FR-010**: El sistema MUST limpiar/normalizar los caracteres conflictivos o no válidos de los nombres de archivo para que el `.zip` no se rompa, conservando un nombre legible.
- **FR-011**: La exportación MUST funcionar con cualquier cantidad de presupuestos emitidos, desde 1 hasta al menos 200.
- **FR-012**: Todos los textos, nombres y mensajes MUST estar en **es-MX**, y los montos de los PDF en **MXN** (Principio II).
- **FR-013**: La exportación MUST NOT solicitar datos personales nuevos, ni enviar nada a servicios externos ni a la nube (Principios V y VIII).
- **FR-014**: La exportación MUST NOT alterar los **cálculos**, la **numeración**, las **validaciones** ni el resto de la funcionalidad existente; se apoya en las operaciones ya existentes (incluida la generación de PDF).
- **FR-015**: El botón de exportación MUST estar visible y ser utilizable en cualquier dispositivo soportado (mobile-first), sin depender de combinar teclas ni de pasos técnicos.
- **FR-016**: Si falla la generación de cualquiera de los PDF durante la exportación, el sistema MUST **abortar toda la exportación**, avisar del error y MUST NOT descargar ningún `.zip`. *(Decisión de clarificación)*
- **FR-017**: El contenido del `.zip` MUST ser **plano**: los PDF y el único archivo de datos MUST quedar directamente en la raíz del `.zip`, sin carpetas. *(Decisión de clarificación)*

### Key Entities

- **Copia de seguridad exportada**: archivo de datos que reúne el estado completo de la aplicación en el momento de la exportación — **perfil del emisor (con logo)**, **clientes**, **servicios**, **presupuestos** y **numeración (correlativos)**. No es una entidad nueva persistida: es una **vista exportable** de los datos ya existentes, pensada para una futura restauración.
- **Documento PDF del presupuesto**: el entregable ya existente (Principio VII). Se **reutiliza tal cual** dentro del `.zip`; no cambia su contenido, formato ni cálculo.
- **Presupuesto**: sin cambios. Solo se **leen** los presupuestos emitidos para generar sus PDF.
- **Archivo .zip**: contenedor único y **plano** (sin carpetas) que agrupa en su raíz los PDF (uno por presupuesto emitido) y el archivo de datos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con 1 o más presupuestos emitidos, el **100 %** de las exportaciones produce **un único `.zip`** que contiene **exactamente N PDF** (uno por presupuesto emitido) **y un archivo de datos**.
- **SC-002**: El **100 %** de los `.zip` sigue el patrón `presupuestospro-copia-AAAA-MM-DD.zip` con la **fecha del día** de la exportación.
- **SC-003**: El **100 %** de los PDF del `.zip` es **idéntico en datos y totales** al que la app descarga para ese mismo presupuesto (cero diferencias al céntimo).
- **SC-004**: El **100 %** de los nombres de PDF sigue el patrón «número - cliente» y **ningún** nombre rompe el `.zip` (0 fallos con caracteres conflictivos como `Diseño/Web S.L.`).
- **SC-005**: Con **0** presupuestos emitidos, el **100 %** de los intentos muestra un aviso y descarga **0** archivos.
- **SC-006**: Tras exportar, el **100 %** de los datos permanece **inalterado** (0 altas, 0 bajas, 0 modificaciones).
- **SC-007**: Con **50 o más** presupuestos, el usuario ve el progreso y la exportación **finaliza correctamente** (sin bloqueos ni errores).
- **SC-008**: El **100 %** de los archivos de datos incluye perfil (con logo), clientes, servicios, presupuestos y numeración existentes.
- **SC-009**: El **100 %** de los textos de interfaz y de los PDF está en **es-MX** y los montos en **MXN**.
- **SC-010**: Un freelancer no técnico completa la exportación **sin más ayuda que el propio botón** (sin pasos manuales adicionales).
- **SC-011**: Ante el fallo de generación de cualquier PDF, el **100 %** de las exportaciones se **aborta con aviso** y descarga **0** archivos.
- **SC-012**: El **100 %** de los `.zip` tiene **estructura plana** (0 carpetas), con N PDF y 1 archivo de datos en la raíz.

## Assumptions

- **Reutilización del PDF existente**: el `.zip` se apoya en la generación de PDF ya presente en la aplicación; por definición, el PDF del `.zip` es el mismo documento que la app descarga para ese presupuesto (FR-004, SC-003).
- **Solo emitidos dentro del `.zip`** (confirmado): los borradores no se incluyen porque no tienen número ni PDF asociado. El resto de estados emitidos (Enviado, Aceptado, Rechazado, Caducado) sí.
- **Archivo de datos completo** (confirmado): incluye **también clientes y numeración**, además de lo enumerado en el alcance original, porque sin ellos no es posible una restauración completa.
- **Nombres de archivo** (confirmado): dentro del `.zip` se usa «número - cliente»; la descarga individual de PDF **no cambia** su nombre actual.
- **Progreso** (confirmado): se muestra un contador «x de N» y se bloquea el botón durante la exportación.
- **Fallo de generación** (confirmado): ante cualquier error al generar un PDF, se **aborta** la exportación completa y se avisa; nunca se entrega una copia parcial.
- **Estructura plana** (confirmado): el `.zip` no contiene carpetas; PDFs y archivo de datos quedan en la raíz.
- **es-MX/MXN**: la aplicación y los PDF siguen en español de México con montos en **MXN** (Principio II). El ejemplo de control del curso ("3.604,00 €") se interpreta como ilustrativo; "cuadrar al céntimo" significa **mismos importes que la app**, en MXN.
- **Ubicación del botón**: en la **sección de presupuestos**, como acción general (no repetida en cada fila ni en cada tarjeta).
- **Formato del archivo de datos**: será un formato abierto y legible que permita una futura importación; la elección concreta es una decisión técnica que se resolverá en el plan, no un requisito de alcance.
- **Contenedor `.zip`**: se genera en el cliente (sin servicios externos). Si hiciera falta un componente para producir el `.zip`, se justificará conforme a las convenciones del proyecto (evitar dependencias nuevas salvo necesidad real).
- **Sin cambios funcionales**: no se modifican cálculos, numeración, validaciones ni el esquema de datos existente; la función es **de solo lectura**.
- **Importar/restaurar fuera de alcance**: esta spec **solo genera** la copia. Restaurarla será otra spec.
- **Fuera de alcance**: exportar a Excel/CSV con formato contable, copias automáticas o programadas, y enviar el `.zip` por correo o subirlo a la nube.
