# Feature Specification: Rediseño visual y página de inicio (index) de PresupuestosPro

**Feature Branch**: `002-rediseno-visual-index`

**Created**: 2026-10-09

**Status**: publicada

**Input**: User description: "Mejorar la presentación de PresupuestosPro (aplicación ya implementada en la spec 001) con dos cambios, sin alterar ninguna funcionalidad ni dato existente. Primero: añadir una página de inicio (index) que sea el punto de entrada de la aplicación al acceder a la raíz del servidor, con navegación clara hacia las cuatro secciones existentes (Presupuestos, Clientes, Catálogo y Perfil) y un pequeño resumen de actividad (por ejemplo, número de presupuestos por estado). Además, todas las páginas deben compartir una navegación común visible para moverse entre secciones sin usar el botón atrás. Segundo: rediseñar la apariencia visual de toda la aplicación para que resulte profesional y sobria: tipografía consistente, paleta de colores limitada definida en un único lugar, espaciado uniforme, jerarquía visual clara entre títulos, tablas, formularios y totales, y estados visuales distinguibles para los presupuestos (Borrador, Enviado, Aceptado, Rechazado, Caducado). El rediseño debe aplicarse también a la plantilla del PDF para que el documento que recibe el cliente transmita la misma imagen profesional. Debe mantenerse el enfoque mobile-first ya existente y todos los textos en español de España. La lógica de negocio, los cálculos, la API y el esquema de datos no deben cambiar en absoluto. @frontend-design"

## Clarifications

### Session 2026-10-09

- Q: El modelo de datos actual solo tiene dos estados de presupuesto (borrador, emitido) y no se puede cambiar el esquema, pero se piden cinco estados visuales (Borrador, Enviado, Aceptado, Rechazado, Caducado). ¿Cómo debe tratarlo el rediseño? → A: **Añadir los estados al modelo**: se amplía el modelo de datos y la lógica del presupuesto para soportar los cinco estados. Esta decisión **prevalece sobre la restricción original** "el esquema de datos no debe cambiar".
- Q: La descripción pide "español de España", pero la constitución del proyecto y los datos existentes son español de México (es-MX, MXN). ¿Qué variante deben usar la interfaz y el PDF rediseñados? → A: **Mantener es-MX** (México, MXN), conforme al Principio II de la constitución.
- Q: ¿Cómo debe tratarse el estado Caducado de un presupuesto? → A: **Caducado se calcula** desde la fecha de validez y **solo aplica a presupuestos emitidos** (Enviado); no se almacena y los borradores no caducan.
- Q: Una vez emitido un presupuesto (Enviado), ¿qué cambios de estado deben permitirse? → A: **Flujo flexible**: desde Enviado se marca Aceptado o Rechazado, se puede corregir entre ellos o volver a Enviado; nunca se vuelve a Borrador.
- Q: ¿Cómo debe organizarse el acceso a los borradores dentro de la navegación común de cuatro secciones? → A: **"Presupuestos" con sub-navegación interna** que separa Emitidos y Borradores.

## User Scenarios & Testing *(mandatory)*

**Objetivo de negocio**: PresupuestosPro ya funciona (spec 001) y su entregable central es el PDF (Principio VII). Esta mejora combina dos cosas: (1) una **página de inicio** y una **navegación común** que orienten al freelancer, y (2) un **rediseño visual sobrio y coherente** de la aplicación y del PDF. Como excepción documentada a la restricción original, el modelo del presupuesto se amplía para soportar cinco estados (Borrador, Enviado, Aceptado, Rechazado y Caducado). Los **cálculos, la numeración, la API (mock de backend) y el resto del esquema de datos no cambian**.

### User Story 1 - Página de inicio como punto de entrada (Priority: P1)

Como freelancer, quiero que al abrir la aplicación aterrice en una página de inicio que me presente las cuatro secciones y un resumen de mi actividad, para orientarme en un vistazo y entrar donde necesito en un solo clic.

**Why this priority**: Es la puerta de entrada. Hoy la raíz salta directamente al listado de presupuestos, sin contexto ni orientación. Sin esta página la aplicación no tiene un punto de entrada claro, y es el primero de los dos cambios pedidos.

**Independent Test**: Acceder a la raíz del servidor y comprobar que se muestra la página de inicio —no el listado de presupuestos— con accesos a Presupuestos, Clientes, Catálogo (de servicios) y Perfil, y un resumen de actividad; se verifica sin tocar el resto de la aplicación.

**Acceptance Scenarios**:

1. **Dado** que accedo a la raíz del servidor, **Cuando** se carga la aplicación, **Entonces** veo una página de inicio con accesos claros a las cuatro secciones (Presupuestos, Clientes, Catálogo y Perfil).
2. **Dado** que tengo presupuestos en distintos estados, **Cuando** se carga la página de inicio, **Entonces** veo un resumen de actividad con el número de presupuestos por estado, con cifras y formato es-MX/MXN cuando corresponda.
3. **Dado** que es la primera vez que uso la aplicación y no hay datos, **Cuando** se carga la página de inicio, **Entonces** el resumen aparece en cero y se me invita a empezar (por ejemplo, configurar mi perfil o crear un presupuesto).

---

### User Story 2 - Navegación común en todas las páginas (Priority: P1)

Como freelancer, quiero una navegación común y siempre visible en todas las páginas para moverme entre secciones sin depender del botón atrás del navegador.

**Why this priority**: Es el segundo componente del primer cambio y lo que hace útil la página de inicio. La aplicación ya dispone de una cabecera con enlaces, pero debe reorganizarse y presentarse de forma clara y consistente en todas las pantallas.

**Independent Test**: Desde cualquier pantalla, usar la navegación común para ir a cada una de las cuatro secciones y comprobar que el elemento de la sección actual queda resaltado.

**Acceptance Scenarios**:

1. **Dado** que estoy en cualquier página, **Cuando** observo la cabecera, **Entonces** veo la navegación común con las cuatro secciones y la sección actual marcada como activa.
2. **Dado** que estoy en una sección, **Cuando** pulso otra sección en la navegación, **Entonces** llego a ella sin usar el botón atrás.
3. **Dado** un dispositivo móvil estrecho, **Cuando** se muestra la navegación, **Entonces** sigue siendo utilizable y todos sus accesos quedan a la vista sin provocar desplazamiento horizontal de la página.
4. **Dado** que estoy en la sección Presupuestos, **Cuando** uso su sub-navegación interna, **Entonces** puedo alternar entre Emitidos y Borradores sin salir de la sección.

---

### User Story 3 - Identidad visual sobria y coherente (Priority: P2)

Como freelancer, quiero que toda la aplicación comparta una tipografía, una paleta de colores limitada y un espaciado uniforme, con una jerarquía clara entre títulos, tablas, formularios y totales, para que la herramienta se perciba profesional y no improvisada.

**Why this priority**: La credibilidad ante el cliente es el motivo del rediseño. Una presentación incoherente transmite lo contrario de "imagen profesional".

**Independent Test**: Recorrer las cuatro secciones y comprobar que tipografía, colores, espaciados y jerarquía visual son consistentes entre pantallas.

**Acceptance Scenarios**:

1. **Dado** cualquier par de pantallas, **Cuando** las comparo, **Entonces** usan la misma tipografía, la misma paleta y la misma escala de espaciado.
2. **Dado** una pantalla con títulos, tablas, formularios y totales, **Cuando** la observo, **Entonces** distingo con claridad cada nivel de jerarquía (un total no se confunde con un dato secundario).
3. **Dado** que quiero ajustar la imagen de la marca, **Cuando** cambio la paleta, **Entonces** esta se define en un único lugar y el cambio se refleja de forma coherente en toda la aplicación.

---

### User Story 4 - Estados del presupuesto útiles y reconocibles (Priority: P2)

Como freelancer, quiero que cada presupuesto tenga un estado claro (Borrador, Enviado, Aceptado, Rechazado o Caducado) que pueda actualizar según la respuesta de mi cliente, y que se distinga de un vistazo, para saber en qué punto está sin abrirlo.

**Why this priority**: Saber el estado de un presupuesto de un vistazo ahorra tiempo y evita confusiones al gestionar varios a la vez. El modelo de datos se amplía con estos cinco estados (decisión de la sesión de clarificación).

**Independent Test**: Crear un presupuesto (borrador), emitirlo (pasa a Enviado), marcarlo como Aceptado y como Rechazado, y comprobar que el estado se guarda y se muestra de forma distinguible en el listado y el detalle; comprobar también que un presupuesto con la validez vencida se muestra como Caducado.

**Acceptance Scenarios**:

1. **Dado** un presupuesto en Borrador, **Cuando** lo emito (genero su PDF), **Entonces** su estado pasa a Enviado y queda en el historial.
2. **Dado** un presupuesto emitido, **Cuando** lo marco como Aceptado o Rechazado (o corrijo posteriormente entre esos estados), **Entonces** el nuevo estado se conserva y se muestra de forma consistente en el listado y el detalle.
3. **Dado** un presupuesto cuya fecha de validez ya pasó y no fue aceptado, **Cuando** lo consulto, **Entonces** se muestra como Caducado sin eliminar ni alterar el presupuesto.
4. **Dado** cualquier listado o detalle, **Cuando** observo el estado, **Entonces** se distingue de los demás sin depender solo del color (incluye etiqueta textual).

---

### User Story 5 - PDF del presupuesto con la misma imagen profesional (Priority: P2)

Como freelancer, quiero que el PDF que recibe mi cliente comparta la misma identidad visual sobria que la aplicación, para que el documento transmita profesionalidad y sea coherente con la herramienta.

**Why this priority**: El PDF es el entregable central del producto (Principio VII); de nada sirve mejorar la aplicación si el documento que ve el cliente queda desactualizado.

**Independent Test**: Generar el PDF de un presupuesto y comprobar que refleja la tipografía, los colores y la jerarquía del nuevo diseño, manteniendo intactos todos sus datos y cálculos.

**Acceptance Scenarios**:

1. **Dado** un presupuesto con líneas, **Cuando** genero su PDF, **Entonces** el documento usa la misma identidad visual (tipografía, paleta y jerarquía) que la aplicación.
2. **Dado** un presupuesto ya emitido, **Cuando** lo descargo tras el rediseño, **Entonces** el PDF conserva exactamente los mismos datos, cifras y secciones que antes.
3. **Dado** el PDF impreso o abierto en un lector estándar, **Cuando** lo reviso, **Entonces** se ve profesional, legible y sin elementos desbordados.

---

### Edge Cases

- **Sin datos**: la página de inicio debe funcionar con cero clientes, cero servicios y cero presupuestos, mostrando el resumen a cero y una invitación a empezar.
- **Resumen con un solo estado**: si solo hay presupuestos en un estado, el resumen debe seguir siendo claro (mostrar ceros donde corresponda).
- **Transición de estado inválida (FR-012)**: no se debe poder volver a Borrador un presupuesto ya emitido; el resto de cambios entre Enviado, Aceptado y Rechazado sí están permitidos y son reversibles.
- **Caducado calculado**: mostrar como Caducado un presupuesto emitido por validez vencida no debe eliminarlo, alterar sus datos ni impedir su descarga; los borradores con la validez vencida no se muestran como Caducado.
- **Presupuesto ya numerado reabierto**: un presupuesto numerado conserva su número y su instantánea (snapshot); cambiar de estado no lo renumera.
- **Logo ausente**: el rediseño del PDF debe verse correcto cuando el emisor no tiene logo.
- **Textos largos**: nombres de cliente, descripciones de línea o unidades muy largos no deben romper el diseño de tablas ni en móvil.
- **Pantalla estrecha (mobile-first)**: en anchos pequeños, tablas y formularios deben seguir siendo usables sin desplazamiento horizontal de la página.
- **Muchos elementos**: listas con muchos presupuestos, clientes o servicios deben seguir siendo legibles y navegables.
- **Datos existentes**: los presupuestos guardados antes de la mejora (estado "emitido") deben seguir siendo válidos, mostrándose como Enviado.
- **Accesibilidad**: los estados y avisos no deben depender solo del color; el foco de teclado debe ser visible; debe respetarse la preferencia de movimiento reducido.
- **Impresión**: el PDF generado debe seguir siendo apto para impresión tras el rediseño.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar una página de inicio (index) como punto de entrada al acceder a la raíz del servidor, en lugar de redirigir directamente al listado de presupuestos.
- **FR-002**: La página de inicio MUST ofrecer accesos claros y directos a las cuatro secciones: Presupuestos, Clientes, Catálogo (servicios) y Perfil.
- **FR-003**: La página de inicio MUST mostrar un resumen de actividad basado en los datos existentes, incluyendo el número de presupuestos por **estado mostrado** (Borrador, Enviado, Aceptado, Rechazado y Caducado), con cifras y formato es-MX/MXN cuando corresponda. El resumen NO debe introducir datos de negocio nuevos fuera de los ya existentes.
- **FR-004**: La página de inicio MUST presentar un estado vacío útil cuando no haya datos (por ejemplo, invitando a configurar el perfil o a crear un presupuesto).
- **FR-005**: Todas las páginas de la aplicación MUST compartir una navegación común visible que permita moverse entre las cuatro secciones (Presupuestos, Clientes, Catálogo y Perfil) sin usar el botón atrás del navegador. La sección **Presupuestos** MUST incluir una **sub-navegación interna** que separe **Emitidos** y **Borradores**.
- **FR-006**: La navegación común MUST señalar de forma visible la sección actual y MUST ser utilizable en dispositivos móviles, sin provocar desplazamiento horizontal de la página.
- **FR-007**: El sistema MUST definir la paleta de colores en un único lugar como fuente de verdad, limitada a un conjunto reducido y sobrio de colores de marca, texto, superficies, bordes y estados. No debe haber colores de marca dispersos por la aplicación.
- **FR-008**: El sistema MUST usar una tipografía consistente en toda la aplicación, con una escala tipográfica definida para títulos, subtítulos, cuerpo y datos.
- **FR-009**: El sistema MUST usar una escala de espaciado uniforme y coherente entre secciones, tarjetas, formularios y tablas.
- **FR-010**: El sistema MUST establecer una jerarquía visual clara que distinga, al menos, títulos de página, títulos de sección, etiquetas de formulario, datos de tablas y totales, de modo que un total sea inequívocamente destacable.
- **FR-011**: El sistema MUST ampliar el modelo del presupuesto para soportar los estados persistidos **Borrador, Enviado, Aceptado y Rechazado**, y MUST tratar **Caducado** como un estado calculado (FR-013). MUST representar los cinco estados de forma visualmente distinguible y consistente en listas y detalle, sin depender exclusivamente del color (debe incluir una etiqueta textual). *(Decisión de clarificación: esta ampliación prevalece sobre la restricción original de no cambiar el esquema.)*
- **FR-012**: El sistema MUST permitir cambiar el estado de un presupuesto desde la interfaz con un flujo flexible: un presupuesto se crea en **Borrador**; al emitir su PDF pasa a **Enviado**; desde Enviado puede marcarse como **Aceptado** o **Rechazado**, corregirse entre Enviado, Aceptado y Rechazado, y volver a Enviado. Un presupuesto **nunca** puede volver a Borrador.
- **FR-013**: El sistema MUST mostrar como **Caducado** un presupuesto cuyo estado persistido sea **Enviado** y cuya fecha de validez ya haya pasado. Caducado MUST **calcularse** desde la fecha de validez (no se almacena como estado persistido) y NO aplica a los borradores (aún no emitidos) ni a los presupuestos Aceptados o Rechazados (ya resueltos). Mostrar un presupuesto como Caducado no MUST eliminar ni alterar sus datos.
- **FR-014**: El rediseño visual MUST aplicarse a todas las pantallas existentes (perfil, clientes, servicios, borradores, editor de presupuesto, historial y detalle de presupuesto), manteniendo su comportamiento y su contenido.
- **FR-015**: La plantilla del PDF del presupuesto MUST rediseñarse con la misma identidad visual (tipografía, paleta y jerarquía) que la aplicación, conservando exactamente los mismos datos, secciones y cálculos que el PDF actual.
- **FR-016**: El diseño MUST conservarse mobile-first: todas las pantallas y la navegación deben ser utilizables en anchos de pantalla pequeños sin desplazamiento horizontal de la página.
- **FR-017**: Todos los textos de la interfaz y del PDF MUST estar en **español de México (es-MX)** y las cantidades en **MXN** (decisión de clarificación), conforme al Principio II de la constitución.
- **FR-018**: La funcionalidad existente NO MUST alterarse salvo la ampliación del modelo de estados de FR-011 a FR-013: los **cálculos** (base imponible, IVA, ISR, total), la **numeración** (`AÑO-NN`), las **validaciones** y el **resto del esquema de datos** permanecen idénticos. En la **API (mock de backend)** NO se elimina ni modifica ninguna operación existente; únicamente se **añade** `presupuestos.cambiarEstado(id, estado)`.
- **FR-019**: El rediseño MUST mejorar la accesibilidad respecto al estado actual: foco de teclado visible, contraste suficiente para texto y estados, y respeto por la preferencia de movimiento reducido.
- **FR-020**: La mejora NO MUST solicitar ni almacenar datos personales nuevos del usuario; la información que se muestra es la ya existente más el estado del presupuesto.
- **FR-021**: El sistema MUST conservar la compatibilidad con los datos guardados antes de la mejora: los presupuestos ya emitidos deben seguir siendo accesibles y descargables, mostrándose como Enviado.

### Key Entities

- **Presupuesto** (modificado): documento comercial. Los estados **persistidos** de su atributo **estado** pasan de dos valores (`borrador`, `emitido`) a cuatro: **Borrador**, **Enviado**, **Aceptado**, **Rechazado**. **Caducado** es un estado **calculado** (derivado de la fecha de validez) que se muestra a partir de un presupuesto emitido, no almacenado. El resto de atributos (número, fechas, instantáneas de emisor y cliente, líneas, indicador de retención, base, IVA, retención y total) **no cambia**. La equivalencia con los datos anteriores es: `emitido` → **Enviado**.
- **PerfilEmisor**, **Cliente**, **Servicio** y **LineaPresupuesto**: sin cambios.
- El resumen de actividad de la página de inicio es una **vista derivada** de los presupuestos existentes; no se persiste como entidad nueva.
- **Terminología**: "**Enviado**" es el nombre del estado persistido; "emitir" se usa solo como verbo de la acción (generar el PDF y numerar). Evitar "emitido" para referirse al estado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Acceder a la raíz del servidor muestra siempre la página de inicio en el **100 %** de los casos, sin pasos intermedios.
- **SC-002**: El **100 %** de las pantallas comparte una navegación común visible con las cuatro secciones.
- **SC-003**: Desde cualquier pantalla, el usuario alcanza cualquiera de las cuatro secciones en **una sola interacción** con la navegación, sin usar el botón atrás.
- **SC-004**: Tras la mejora, el **100 %** de los cálculos, numeraciones y validaciones existentes se comporta exactamente igual que antes (cero regresiones en los importes y en la numeración).
- **SC-005**: Existe **un único lugar** donde se define la paleta y **cero** usos de colores de marca fuera de esa fuente.
- **SC-006**: El **100 %** de los cinco estados de presupuesto se distingue sin depender solo del color, y el texto y los estados cumplen un contraste mínimo aceptable (WCAG AA).
- **SC-007**: El **100 %** de los PDF descargados conserva los mismos datos y cifras que antes del rediseño y refleja la nueva identidad visual.
- **SC-008**: La aplicación es utilizable desde un ancho de pantalla de **320 px** sin desplazamiento horizontal de la página.
- **SC-009**: El **100 %** de los textos de interfaz y PDF está en es-MX y las cantidades en MXN.
- **SC-010**: El **100 %** de los datos guardados antes de la mejora sigue siendo accesible tras ella: ningún presupuesto existente se pierde y los ya emitidos se muestran como Enviado.

## Assumptions

- **Catálogo = sección de Servicios**: se interpreta "Catálogo" como la sección de catálogo de servicios ya existente.
- **Borradores dentro de Presupuestos (confirmado)**: el acceso a "Borradores" se conserva mediante una sub-navegación interna de la sección Presupuestos (Emitidos | Borradores), sin eliminar esa funcionalidad (decisión de clarificación).
- **Convivencia de estados y numeración**: se asume que "Enviado" corresponde al presupuesto emitido (numerado, en el historial) de la versión anterior, y que "Borrador" corresponde al borrador sin número; por tanto el flujo de numeración no cambia, solo se renombra/añade el estado.
- **Caducado confirmado como estado derivado**: "Caducado" se calcula por la fecha de validez de un presupuesto ya emitido, no requiere acción manual ni se almacena, y no aplica a los borradores (decisión de clarificación).
- **Variante de idioma confirmada**: se usa **es-MX** con montos en **MXN**, conforme al Principio II de la constitución.
- **Ampliación de alcance documentada**: la incorporación de los cinco estados amplía el modelo de datos y añade una pequeña funcionalidad de cambio de estado; esto **supersede** la restricción original "el esquema de datos no debe cambiar" y queda registrado en la sesión de clarificación. Se considera **cubierta por el Principio III** (la especificación aprobada la exige) y **no requiere enmienda constitucional**, ya que no colisiona con los no-objetivos del Principio VIII ni con el stack del Principio VI.
- **La aplicación ya tiene una cabecera y tokens básicos**: la spec 001 ya incluye una cabecera con enlaces y un bloque de estilos raíz; esta mejora los reorganiza y unifica, no parte de cero.
- **Sin nuevas dependencias funcionales**: el rediseño se apoya en las tecnologías y librerías ya presentes; no se incorporan librerías de estilos ni de componentes nuevas.
- **Compatibilidad de datos**: los datos guardados en la aplicación anterior deben seguir siendo válidos y legibles tras la mejora, con la equivalencia `emitido` → **Enviado**.

## Correcciones posteriores

### 2026-10-09 — Logo ausente en el PDF (FR-010 de la spec 001)

- **Síntoma**: al imprimir un presupuesto, el logo del emisor no aparecía en el PDF.
- **Causa**: `@react-pdf/renderer` solo incrusta imágenes PNG y JPEG; el formulario de perfil aceptaba `image/*`, por lo que los logos en SVG/WebP/GIF/BMP se descartaban en silencio (la vista previa del navegador sí los mostraba).
- **Corrección**: se normaliza cualquier logo a **PNG** al subirlo (`src/lib/logo.ts`), se protege el render en `BudgetDocument.tsx` y se avisa de logos heredados incompatibles en `ProfilePage.tsx`.
- **Estado**: corregido y verificado (`tsc`, 51/51 pruebas, build y **validación manual exitosa**). Los presupuestos ya emitidos conservan su snapshot; reemitir con el logo re-subido lo muestra.
- **Tareas**: T032 y T033 de `tasks.md`.
