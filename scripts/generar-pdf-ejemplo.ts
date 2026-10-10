// Genera un PDF de ejemplo usando el código REAL de la aplicación:
// el componente `BudgetDocument` y los cálculos de dominio `calcularTotales`.
//
// Ejecutar con:  npx vite-node scripts/generar-pdf-ejemplo.ts
//
// No forma parte del bundle de la app; es una utilidad de desarrollo.

import { mkdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { BudgetDocument } from '../src/features/pdf/BudgetDocument';
import { calcularTotales } from '../src/domain/calculations';
import { hoyISO, sumarDias } from '../src/lib/dates';
import type { LineaPresupuesto, Presupuesto } from '../src/domain/types';

const EMISION = hoyISO();
const ANIO = EMISION.slice(0, 4);

// 10 productos/servicios de un estudio freelance (precios en centavos).
const datos: ReadonlyArray<{
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
}> = [
  { descripcion: 'Diseño de identidad visual (logo + manual de marca)', cantidad: 1, unidad: 'proyecto', precioUnitario: 1_800_000 },
  { descripcion: 'Diseño de interfaz de usuario (UI Kit, 12 pantallas)', cantidad: 1, unidad: 'proyecto', precioUnitario: 2_400_000 },
  { descripcion: 'Desarrollo de sitio web corporativo (landing)', cantidad: 1, unidad: 'proyecto', precioUnitario: 3_500_000 },
  { descripcion: 'Maquetación responsiva y accesibilidad WCAG AA', cantidad: 1, unidad: 'proyecto', precioUnitario: 1_250_000 },
  { descripcion: 'Integración de pasarela de pagos (Stripe)', cantidad: 1, unidad: 'servicio', precioUnitario: 980_000 },
  { descripcion: 'Configuración de SEO técnico y analítica web', cantidad: 1, unidad: 'servicio', precioUnitario: 650_000 },
  { descripcion: 'Redacción de contenidos web (copywriting)', cantidad: 8, unidad: 'hora', precioUnitario: 120_000 },
  { descripcion: 'Sesión de fotografía de producto', cantidad: 2, unidad: 'sesión', precioUnitario: 750_000 },
  { descripcion: 'Capacitación al equipo en el panel de administración', cantidad: 6, unidad: 'hora', precioUnitario: 95_000 },
  { descripcion: 'Soporte y mantenimiento mensual', cantidad: 3, unidad: 'mes', precioUnitario: 450_000 },
];

const lineas: LineaPresupuesto[] = datos.map((d, i) => ({
  id: `linea-${i + 1}`,
  descripcion: d.descripcion,
  cantidad: d.cantidad,
  unidad: d.unidad,
  precioUnitario: d.precioUnitario,
  origen: 'manual',
  servicioId: null,
}));

const RETENCION_ISR = true;
const totales = calcularTotales(lineas, RETENCION_ISR);

const presupuesto: Presupuesto = {
  id: 'demo-001',
  estado: 'enviado',
  numero: `${ANIO}-01`,
  clienteId: 'cliente-demo',
  emisorSnapshot: {
    nombre: 'María Fernanda Ríos',
    razonSocial: 'Estudio Pixel',
    rfc: 'RIMF900214A7B',
    correo: 'hola@estudiopixel.mx',
    telefono: '+52 55 1234 5678',
    direccion: 'Av. Álvaro Obregón 120, Roma Norte, CDMX',
  },
  clienteSnapshot: {
    nombre: 'Tecnología Aurora, S.A. de C.V.',
    rfc: 'TAU180523K40',
    correo: 'compras@aurora.mx',
    telefono: '+52 81 9876 5432',
    direccion: 'Blvd. Díaz Ordaz 400, San Pedro Garza García, NL',
  },
  lineas,
  retencionISR: RETENCION_ISR,
  fechaEmision: EMISION,
  fechaValidez: sumarDias(EMISION, 30),
  baseCentavos: totales.baseCentavos,
  ivaCentavos: totales.ivaCentavos,
  retencionCentavos: totales.retencionCentavos,
  totalCentavos: totales.totalCentavos,
  creadoEn: new Date().toISOString(),
  actualizadoEn: new Date().toISOString(),
};

const SALIDA = 'docs/ejemplo-presupuesto.pdf';

async function main(): Promise<void> {
  mkdirSync('docs', { recursive: true });
  await renderToFile(createElement(BudgetDocument, { presupuesto }), SALIDA);
  // eslint-disable-next-line no-console
  console.log(
    `PDF generado: ${SALIDA}\n` +
      `Líneas: ${lineas.length} · Base: ${totales.baseCentavos / 100} · ` +
      `IVA: ${totales.ivaCentavos / 100} · Retención: ${totales.retencionCentavos / 100} · ` +
      `Total: ${totales.totalCentavos / 100} MXN`,
  );
}

void main();
