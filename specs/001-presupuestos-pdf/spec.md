# Feature Specification: PresupuestosPro — Presupuestos profesionales en PDF

**Feature Branch**: `001-presupuestos-pdf`

**Created**: 2026-10-08

**Status**: publicada

**Input**: User description: "PresupuestosPro es una herramienta para que un freelancer cree presupuestos profesionales con su marca y los descargue en PDF para enviárselos a sus clientes, sin pelearse con Excel ni con plantillas. El freelancer administra los catálogos de usuario, servicios y clientes, y es quien genera los presupuestos. Escenarios: (HU1) administro mis datos (nombre, razón social, RFC, contacto, logo) y una lista de servicios con su precio habitual; (HU2) al hacer un presupuesto elijo cliente, añado líneas (de mi lista o escritas a mano, con cantidad y precio) y la herramienta calcula sola base imponible, IVA y, cuando toca, retención de IRPF, y el total; (HU3) descargo el presupuesto en PDF con mi marca y se lo mando yo por email. Requisitos: almacenar datos del usuario; CRUD de clientes; lista de servicios (nombre, precio); generar presupuesto con selección de cliente, líneas y cálculo de impuestos; lista de presupuestos generados; opción de generar PDF. Reglas: los números no se inventan (IVA/ISR calculados); total = base + IVA − retención; numeración automática tipo 2026-01 reiniciando cada año; solo MXN. Casos límite: presupuesto sin líneas no genera PDF y avisa; línea escrita a mano permitida. Fuera de alcance: no es factura ni facturación electrónica; sin cuentas ni contraseñas; nada en la nube (vive en el ordenador); el envío por correo es externo, el sistema no lo hace."

## Clarifications

### Session 2026-10-08

- Q: ¿En qué momento exacto un presupuesto se guarda en el historial y recibe su número correlativo? → A: Con borrador explícito: se puede guardar un borrador sin número y, al emitir el PDF, se numera y pasa al historial.
- Q: ¿Qué datos deben ser obligatorios para poder emitir un presupuesto (del emisor y del cliente)? → A: Emisor: nombre/razón social y RFC obligatorios; cliente: solo nombre/razón social obligatorio; correo, teléfono, dirección y logo opcionales.
- Q: ¿La unidad de un servicio o de una línea debe elegirse de una lista fija o escribirse libremente? → A: Texto libre con sugerencias (hora, pieza, proyecto, servicio, mes).
- Q: ¿Dónde viven los borradores y cuántos puede haber a la vez? → A: Varios borradores a la vez, en una sección "Borradores" separada del historial de presupuestos emitidos.
- Q: ¿La fecha de validez del presupuesto debe traer un valor por defecto y poder editarse? → A: Por defecto 30 días desde la emisión, editable por presupuesto.

## User Scenarios & Testing *(mandatory)*

El objetivo de negocio es que un freelancer emita un presupuesto **correcto y con buena imagen en menos de 5 minutos**, sustituyendo la hoja de cálculo y la calculadora del móvil. El entregable central es el PDF del presupuesto (Principio VII de la constitución). El producto es de mercado mexicano: interfaz, PDF y mensajes en español de México (es-MX) y cifras en pesos mexicanos (MXN).

### User Story 1 - Emitir un presupuesto y descargarlo en PDF (Priority: P1)

Como freelancer, quiero crear un presupuesto eligiendo a un cliente y añadiendo líneas (de mi catálogo o escritas a mano) para que la herramienta calcule sola la base imponible, el IVA, la retención (cuando toca) y el total, y descargarlo en PDF con mi marca para enviárselo yo a mi cliente.

**Why this priority**: Es el núcleo del producto y el objetivo de negocio medible (presupuesto correcto en menos de 5 minutos). Sin esta historia no existe valor: el PDF del presupuesto es el entregable que el usuario "contrata".

**Independent Test**: Con un perfil de emisor y al menos un cliente disponibles (pueden capturarse al vuelo en el propio editor), crear un presupuesto con dos líneas escritas a mano, verificar que base, IVA, retención y total aparecen calculados y correctos, y descargar el PDF. Se prueba por completo sin necesidad de las historias de administración; la selección desde el catálogo de servicios se añade en la historia P3.

**Acceptance Scenarios**:

1. **Dado** un perfil de emisor con datos de marca y un cliente registrado, **Cuando** creo un presupuesto, selecciono al cliente y añado una línea con cantidad 2 y precio unitario 1,000.00 MXN, **Entonces** el sistema muestra el importe de la línea 2,000.00, una base imponible de 2,000.00, un IVA de 320.00 y un total de 2,320.00.
2. **Dado** un presupuesto con base imponible de 2,000.00 y la retención de ISR activada, **Cuando** el sistema calcula los totales, **Entonces** muestra la retención 200.00 y el total 2,120.00 (base + IVA − retención), con dos decimales y formato es-MX.
3. **Dado** un presupuesto con líneas, **Cuando** pulso "Descargar PDF", **Entonces** obtengo un archivo PDF con mi logo, mis datos fiscales, los del cliente, el número y fechas del presupuesto, las líneas y los totales.
4. **Dado** un presupuesto con líneas escritas a mano que no están en mi catálogo de servicios, **Cuando** genero el PDF, **Entonces** esas líneas aparecen en el documento igual que las del catálogo.
5. **Dado** un presupuesto a medio llenar, **Cuando** lo guardo como borrador y cierro la aplicación, **Entonces** puedo retomarlo desde la sección "Borradores" y seguir editándolo antes de emitirlo.

---

### User Story 2 - Administrar el catálogo de clientes (Priority: P2)

Como freelancer, quiero crear, editar y eliminar clientes con sus datos fiscales y de contacto, para no volver a teclear sus datos en cada presupuesto.

**Why this priority**: Acelera la emisión (el usuario solo elige un cliente existente) y evita errores de transcripción. Es prerequisito habitual de la historia P1, pero P1 puede probarse capturando un cliente puntual.

**Independent Test**: Crear un cliente, editarlo, verlo en la lista y eliminarlo; comprobar que desaparece de la lista y que ya no está disponible al crear un presupuesto.

**Acceptance Scenarios**:

1. **Dado** el catálogo de clientes, **Cuando** doy de alta un cliente con nombre/razón social, RFC, correo, teléfono y dirección, **Entonces** el cliente aparece en la lista y queda disponible para seleccionarlo en un presupuesto.
2. **Dado** un cliente existente, **Cuando** edito sus datos y guardo, **Entonces** la lista refleja los datos actualizados.
3. **Dado** un cliente existente, **Cuando** lo elimino y confirmo, **Entonces** deja de aparecer en la lista y no puede seleccionarse en un presupuesto nuevo.

---

### User Story 3 - Configurar mi marca y mi catálogo de servicios (Priority: P3)

Como freelancer, quiero registrar mis datos (nombre, razón social, RFC, contacto y logo) y mi lista de servicios con su precio habitual, para que mis presupuestos salgan con mi marca y las líneas recurrentes se añadan en un clic.

**Why this priority**: Da identidad y velocidad al presupuesto; sin mi marca el PDF existe pero no cumple el objetivo de "buena imagen". Puede añadirse después de P1 porque P1 permite escribir líneas a mano.

**Independent Test**: Rellenar el perfil del emisor (incluyendo un logo), crear al menos un servicio y comprobar que ambos se conservan y que el servicio aparece como opción al añadir líneas en un presupuesto.

**Acceptance Scenarios**:

1. **Dado** que no hay perfil configurado, **Cuando** guardo mis datos de emisor (nombre, razón social, RFC, correo, teléfono, dirección y logo), **Entonces** el sistema los conserva y los muestra en el PDF de los presupuestos siguientes.
2. **Dado** mi catálogo de servicios, **Cuando** doy de alta un servicio con nombre, descripción, precio y unidad, **Entonces** aparece en la lista y puede elegirse como línea al crear un presupuesto, precargando descripción, precio y unidad.
3. **Dado** un servicio usado en un presupuesto ya emitido, **Cuando** lo elimino del catálogo, **Entonces** el presupuesto ya emitido conserva la línea tal como se emitió.

---

### User Story 4 - Consultar y gestionar el historial de presupuestos (Priority: P4)

Como freelancer, quiero ver la lista de presupuestos que he generado y, desde ahí, ver el detalle, volver a descargar el PDF o eliminarlo, para tener el control de lo que he emitido.

**Why this priority**: Aporta control y reutilización, pero el valor principal ya se entrega con P1. Es la extensión natural de RF5.

**Independent Test**: Con presupuestos ya creados, verlos listados con número, cliente, fecha y total; abrir el detalle, descargar un PDF y eliminar uno.

**Acceptance Scenarios**:

1. **Dado** que existen varios presupuestos, **Cuando** abro el historial, **Entonces** veo cada presupuesto con su número, cliente, fecha y total, en MXN.
2. **Dado** un presupuesto del historial, **Cuando** pido descargar su PDF, **Entonces** obtengo el documento con los datos con los que se emitió.
3. **Dado** un presupuesto del historial, **Cuando** lo elimino y confirmo, **Entonces** desaparece del historial y su número no se reutiliza.

---

### Edge Cases

- **Presupuesto sin líneas (CL1)**: si no hay ninguna línea, no se genera el PDF y se avisa al freelancer con un mensaje claro en es-MX.
- **Borrador guardado**: un borrador puede guardarse incompleto (incluso sin líneas); no recibe número y no aparece en el historial hasta que se emite.
- **Varios borradores**: se pueden conservar y listar varios borradores a la vez en su propia sección; ninguno tiene número hasta su emisión.
- **Borrador eliminado**: eliminar un borrador no consume ni libera números, porque todavía no tiene ninguno asignado.
- **Línea escrita a mano fuera del catálogo (CL2)**: se permite; no es obligatorio que todo concepto esté catalogado.
- **Cantidad cero o negativa**: no se admite; se impide generar o calcular con ese valor y se avisa.
- **Precio unitario de 0**: se permite (por ejemplo, un concepto cortesía) y se refleja en el total sin romper el cálculo.
- **Cliente eliminado con presupuestos asociados**: los presupuestos ya emitidos conservan los datos del cliente con los que se emitieron (snapshot) y siguen siendo descargables.
- **Logo ausente**: si no se ha cargado logo, el PDF se genera sin logo y con el resto de la información.
- **Retención desactivada**: cuando el presupuesto no lleva retención de ISR, el total es base + IVA (la retención se muestra en cero); el IVA del 16 % se aplica siempre en v1.
- **Reinicio anual de numeración**: el primer presupuesto de un año nuevo toma el número correlativo `AÑO-01`, aunque el año anterior tuviera presupuestos.
- **Redondeo de céntimos**: los importes con fracciones se redondean a dos decimales de forma consistente entre líneas, base, impuestos y total.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir registrar y editar un único perfil del emisor (freelancer) con nombre, razón social, RFC, correo electrónico, teléfono, dirección y logo, y conservarlo entre sesiones. El nombre/razón social y el RFC son obligatorios; el correo, el teléfono, la dirección y el logo son opcionales. `(HU1, RF1)`
- **FR-002**: El sistema MUST permitir crear, editar y eliminar clientes asociados al usuario, con nombre/razón social, RFC, correo electrónico, teléfono y dirección. El nombre/razón social es obligatorio; el RFC, el correo, el teléfono y la dirección son opcionales. `(HU1, RF2)`
- **FR-003**: El sistema MUST permitir crear, editar y eliminar servicios del catálogo, cada uno con nombre, descripción, precio unitario y unidad, en MXN. La unidad es de **texto libre con sugerencias** (hora, pieza, proyecto, servicio, mes). `(HU1, RF3)`
- **FR-004**: El sistema MUST permitir generar un presupuesto seleccionando un cliente y añadiendo líneas tomadas del catálogo de servicios o escritas a mano. `(HU2, RF4, CL2)`
- **FR-005**: Cada línea del presupuesto MUST tener descripción, cantidad, unidad (texto libre con sugerencias) y precio unitario; su importe MUST calcularse como cantidad × precio unitario, sin descuentos en v1.
- **FR-006**: El sistema MUST calcular automáticamente la base imponible como la suma de los importes de las líneas, el IVA como base × 16 %, la retención de ISR como base × 10 % cuando esté activada para ese presupuesto, y el total como base + IVA − retención. `(HU2, RF4)`
- **FR-007**: La retención de ISR MUST ser opcional por presupuesto y estar desactivada por defecto; el IVA del 16 % MUST aplicarse siempre en v1. `(HU2)`
- **FR-008**: El sistema MUST asignar el número de forma automática **al emitir el presupuesto**, con el formato `AÑO-NN` (por ejemplo, `2026-01`), de forma consecutiva y sin reutilizar números, reiniciando la cuenta en cada año natural. `(RF4)`
- **FR-009**: El sistema MUST registrar en cada presupuesto la fecha de emisión automática y una fecha de validez que por defecto es de 30 días desde la emisión y es editable por presupuesto; ambas MUST ser visibles en el PDF.
- **FR-010**: El sistema MUST permitir generar y descargar un PDF por presupuesto que incluya el logo y los datos fiscales del emisor, los datos del cliente, el número y las fechas del presupuesto, las líneas con cantidad, precio e importe, la base imponible, el IVA, la retención (si aplica) y el total. `(HU3, RF6)`
- **FR-011**: Si un presupuesto no tiene ninguna línea, el sistema MUST impedir la generación del PDF y avisar al freelancer con un mensaje claro en es-MX. `(CL1)`
- **FR-012**: El sistema MUST mostrar la lista de presupuestos **emitidos** con su número, cliente, fecha y total, y permitir ver el detalle, descargar de nuevo el PDF y eliminar el presupuesto. `(RF5)`
- **FR-013**: Al emitirse, el presupuesto MUST conservar una copia (snapshot) de los datos del emisor y del cliente con los que se emitió, de modo que el documento no cambie aunque luego se editen o eliminen esos registros.
- **FR-014**: El sistema MUST expresar todas las cantidades monetarias en MXN y con formato es-MX (separador de miles, dos decimales, símbolo `$`), y toda la interfaz, el PDF y los mensajes de error MUST estar en español de México (es-MX).
- **FR-015**: El sistema MUST conservar el perfil, los clientes, los servicios y los presupuestos en el equipo del usuario, de forma que sigan disponibles después de cerrar y volver a abrir la aplicación (sin servicios en la nube).
- **FR-016**: El sistema MUST impedir valores de cantidad iguales o inferiores a cero en las líneas del presupuesto y avisar al freelancer.
- **FR-017**: El sistema MUST permitir guardar **varios borradores** a la vez en una sección "Borradores" separada del historial de emitidos, sin número asignado; al **emitir** un borrador (generar su PDF) MUST recibir su número correlativo y pasar al historial como documento inmutable.
- **FR-018**: Para emitir un presupuesto, el sistema MUST exigir que el perfil del emisor tenga nombre/razón social y RFC, y que el cliente seleccionado tenga nombre/razón social. Si falta alguno de estos datos obligatorios, MUST impedir la emisión y avisar al freelancer con un mensaje claro en es-MX.

### Key Entities *(include if feature involves data)*

- **PerfilEmisor**: datos del freelancer que firma el presupuesto. Atributos: nombre, razón social, RFC, correo electrónico, teléfono, dirección, logo. Es un único registro.
- **Cliente**: destinatario del presupuesto. Atributos: nombre/razón social, RFC, correo electrónico, teléfono, dirección. Un emisor tiene muchos clientes.
- **Servicio**: concepto habitual del catálogo para reutilizar. Atributos: nombre, descripción, precio unitario (MXN), unidad (texto libre con sugerencias). Pertenece al emisor.
- **Presupuesto**: documento comercial. Puede estar en estado **borrador** (sin número, fuera del historial) o **emitido** (numerado e inmutable). Atributos: estado, número (`AÑO-NN`, asignado al emitir), fecha de emisión, fecha de validez, datos del emisor y del cliente (snapshot al emitir), líneas, indicador de retención de ISR, base imponible, IVA, retención, total. Un emisor tiene muchos presupuestos; cada presupuesto pertenece a un cliente.
- **LineaPresupuesto**: renglón del presupuesto. Atributos: descripción, cantidad, unidad, precio unitario, importe, origen (catálogo o escrito a mano). Un presupuesto tiene una o más líneas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un freelancer que ya tiene su perfil y al menos un cliente puede emitir un presupuesto y descargar su PDF en **menos de 5 minutos**, medido desde que empieza a crearlo hasta que obtiene el archivo. `(objetivo de negocio)`
- **SC-002**: En el **100 %** de los presupuestos, la base imponible, el IVA, la retención y el total coinciden con el cálculo manual (base + IVA − retención) sin diferencias de redondeo superiores a un céntimo.
- **SC-003**: La numeración es única y consecutiva dentro de cada año en el **100 %** de los casos, y ningún número se reutiliza tras eliminar un presupuesto; el primer presupuesto de cada año es `AÑO-01`.
- **SC-004**: El **95 %** de los freelancers completa el flujo completo (crear presupuesto, calcular y descargar PDF) en su primer intento sin ayuda ni documentación adicional.
- **SC-005**: El PDF generado se abre correctamente en un lector de PDF estándar y contiene todos los datos esenciales (marca, cliente, número, fechas, líneas y totales) en el **100 %** de las descargas.
- **SC-006**: Tras cerrar y volver a abrir la aplicación, el **100 %** del perfil, los clientes, los servicios y los presupuestos siguen disponibles.
- **SC-007**: Un presupuesto sin líneas nunca produce un PDF y siempre muestra un aviso al usuario (**0 %** de PDFs vacíos generados).

## Assumptions

- **Mercado e idioma**: el producto es para el mercado mexicano; toda la aplicación y el PDF usan es-MX y MXN, conforme al Principio II de la constitución. (La mención a "freelancer español" y a "IRPF" en la descripción original se interpreta como "hispanohablante"; se usa terminología mexicana: RFC, IVA e ISR.)
- **Impuestos**: IVA fijo del 16 % sobre la base imponible; retención de ISR del 10 % solo cuando se activa en el presupuesto (desactivada por defecto). No hay otros impuestos ni tasa de IVA variable en v1.
- **Persistencia**: los datos viven en el equipo del usuario y sobreviven al cierre de la aplicación; no se usa la nube ni un backend real (Principio IX, mock de backend con interfaz asíncrona).
- **Sin cuentas**: un único perfil de emisor, sin autenticación, usuarios ni sesiones (Principio VIII).
- **Datos del cliente**: el cliente se identifica con un único campo `nombre`, que puede contener el nombre de la persona o la razón social de la empresa; no se duplica en dos campos como en el perfil del emisor.
- **Sin correo**: el sistema no envía correos; el freelancer descarga el PDF y lo envía él mismo por su medio externo.
- **Fuera de facturación**: es un presupuesto, no una factura; no hay facturación electrónica ni validación con el SAT.
- **Ciclo de vida**: un presupuesto se guarda primero como borrador (sin número y fuera del historial) y se numera y fija al emitir su PDF; una vez emitido no se edita (solo ver, descargar y eliminar).
- **Sin descuentos**: las líneas son cantidad × precio unitario; no se contemplan descuentos ni impuestos por línea en v1.
- **Fecha de validez**: se asume una validez por defecto de 30 días desde la emisión (editable por presupuesto).
- **Logo**: es opcional; si no existe, el PDF se genera sin logo.
- **RFC**: se captura como dato de contacto/identificación; no se valida contra el SAT (fuera de alcance).
- **Alcance v1**: aplicación web que se ejecuta en el navegador del usuario, conforme al stack y a los no-objetivos fijados por la constitución.
