// Documento PDF del presupuesto con la identidad visual compartida — FR-015, Principio VII.
// Se construye en el cliente con @react-pdf/renderer usando los tokens de `src/styles/tokens.ts`.
// Conserva exactamente los mismos datos, secciones y cálculos que el PDF anterior.

import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Presupuesto } from '../../domain/types';
import { formatearMXN } from '../../domain/money';
import { formatearFecha } from '../../lib/dates';
import { logoCompatibleConPdf } from '../../lib/logo';
import { PALETA, TIPOGRAFIA } from '../../styles/tokens';

const FUENTE = TIPOGRAFIA.familiaPDF;

const estilos = StyleSheet.create({
  pagina: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: FUENTE,
    color: PALETA.texto,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: PALETA.marca,
    paddingBottom: 10,
  },
  emisor: { flexDirection: 'row', gap: 10, maxWidth: '62%' },
  logo: { width: 64, height: 64, objectFit: 'contain' },
  titulo: { fontSize: 20, fontFamily: `${FUENTE}-Bold`, color: PALETA.marca },
  subtitulo: { fontSize: 9, color: PALETA.textoSuave, marginTop: 2 },
  bloqueDerecha: { textAlign: 'right' },
  etiqueta: { color: PALETA.textoSuave, fontSize: 8 },
  valor: { fontFamily: `${FUENTE}-Bold` },
  seccion: { marginBottom: 14 },
  nombreSeccion: { fontSize: 11, fontFamily: `${FUENTE}-Bold`, marginBottom: 4, color: PALETA.marca },
  tabla: { borderTopWidth: 1, borderTopColor: PALETA.borde, marginTop: 6 },
  fila: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: PALETA.borde, paddingVertical: 5 },
  filaEncabezado: { backgroundColor: PALETA.marcaSuave, fontFamily: `${FUENTE}-Bold`, color: PALETA.textoSuave },
  colDesc: { flex: 4 },
  colCant: { flex: 1, textAlign: 'right' },
  colUnidad: { flex: 1.3, textAlign: 'center' },
  colPrecio: { flex: 1.6, textAlign: 'right' },
  colImporte: { flex: 1.6, textAlign: 'right' },
  totales: { marginTop: 14, alignSelf: 'flex-end', width: 240 },
  filaTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  filaTotalGrande: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: PALETA.marca,
    fontFamily: `${FUENTE}-Bold`,
    fontSize: 12,
  },
  pie: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: PALETA.textoSuave,
    fontSize: 8,
  },
});

export interface BudgetDocumentProps {
  presupuesto: Presupuesto;
}

export function BudgetDocument({ presupuesto }: BudgetDocumentProps) {
  const emisor = presupuesto.emisorSnapshot;
  const cliente = presupuesto.clienteSnapshot;

  return (
    <Document title={`Presupuesto ${presupuesto.numero ?? ''}`} author={emisor?.nombre ?? 'PresupuestosPro'}>
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.encabezado}>
          <View style={estilos.emisor}>
            {emisor?.logo && logoCompatibleConPdf(emisor.logo) ? (
              <Image style={estilos.logo} src={emisor.logo} />
            ) : null}
            <View>
              <Text style={estilos.titulo}>{emisor?.razonSocial || emisor?.nombre || 'Emisor'}</Text>
              {emisor?.nombre ? <Text style={estilos.subtitulo}>{emisor.nombre}</Text> : null}
              {emisor?.rfc ? <Text style={estilos.subtitulo}>RFC: {emisor.rfc}</Text> : null}
              {emisor?.correo ? <Text style={estilos.subtitulo}>{emisor.correo}</Text> : null}
              {emisor?.telefono ? <Text style={estilos.subtitulo}>Tel: {emisor.telefono}</Text> : null}
              {emisor?.direccion ? <Text style={estilos.subtitulo}>{emisor.direccion}</Text> : null}
            </View>
          </View>
          <View style={estilos.bloqueDerecha}>
            <Text style={estilos.valor}>Presupuesto</Text>
            <Text style={estilos.subtitulo}>{presupuesto.numero ?? '—'}</Text>
            <Text style={estilos.etiqueta}>Fecha de emisión</Text>
            <Text>{formatearFecha(presupuesto.fechaEmision)}</Text>
            <Text style={estilos.etiqueta}>Válido hasta</Text>
            <Text>{formatearFecha(presupuesto.fechaValidez)}</Text>
          </View>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.nombreSeccion}>Cliente</Text>
          <Text style={estilos.valor}>{cliente?.nombre ?? '—'}</Text>
          {cliente?.rfc ? <Text style={estilos.subtitulo}>RFC: {cliente.rfc}</Text> : null}
          {cliente?.correo ? <Text style={estilos.subtitulo}>{cliente.correo}</Text> : null}
          {cliente?.telefono ? <Text style={estilos.subtitulo}>Tel: {cliente.telefono}</Text> : null}
          {cliente?.direccion ? <Text style={estilos.subtitulo}>{cliente.direccion}</Text> : null}
        </View>

        <View style={estilos.tabla}>
          <View style={[estilos.fila, estilos.filaEncabezado]}>
            <Text style={estilos.colDesc}>Descripción</Text>
            <Text style={estilos.colCant}>Cantidad</Text>
            <Text style={estilos.colUnidad}>Unidad</Text>
            <Text style={estilos.colPrecio}>Precio unitario</Text>
            <Text style={estilos.colImporte}>Importe</Text>
          </View>
          {presupuesto.lineas.map((linea) => (
            <View style={estilos.fila} key={linea.id}>
              <Text style={estilos.colDesc}>{linea.descripcion}</Text>
              <Text style={estilos.colCant}>{linea.cantidad}</Text>
              <Text style={estilos.colUnidad}>{linea.unidad}</Text>
              <Text style={estilos.colPrecio}>{formatearMXN(linea.precioUnitario)}</Text>
              <Text style={estilos.colImporte}>{formatearMXN(Math.round(linea.cantidad * linea.precioUnitario))}</Text>
            </View>
          ))}
        </View>

        <View style={estilos.totales}>
          <View style={estilos.filaTotal}>
            <Text>Base imponible</Text>
            <Text>{formatearMXN(presupuesto.baseCentavos)}</Text>
          </View>
          <View style={estilos.filaTotal}>
            <Text>IVA (16 %)</Text>
            <Text>{formatearMXN(presupuesto.ivaCentavos)}</Text>
          </View>
          <View style={estilos.filaTotal}>
            <Text>Retención ISR (10 %)</Text>
            <Text>{formatearMXN(presupuesto.retencionCentavos)}</Text>
          </View>
          <View style={estilos.filaTotalGrande}>
            <Text>Total</Text>
            <Text>{formatearMXN(presupuesto.totalCentavos)}</Text>
          </View>
        </View>

        <Text style={estilos.pie}>
          {emisor?.razonSocial || emisor?.nombre || 'PresupuestosPro'} · Documento generado con PresupuestosPro · Montos en MXN
        </Text>
      </Page>
    </Document>
  );
}
