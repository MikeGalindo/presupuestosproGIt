// Tipos de dominio de PresupuestosPro.
// Los montos se almacenan como enteros de centavos (Centavos) y las fechas como ISO `YYYY-MM-DD`.

export type Centavos = number;

// ---------------------------------------------------------------------------
// Perfil del emisor (único registro) — FR-001
// ---------------------------------------------------------------------------

export interface PerfilEmisor {
  id: string;
  nombre: string;
  razonSocial: string;
  rfc: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  /** Logo como data URL (opcional, ≤ ~1 MB). */
  logo?: string;
  actualizadoEn: string;
}

export type PerfilEmisorInput = Omit<PerfilEmisor, 'id' | 'actualizadoEn'>;

// ---------------------------------------------------------------------------
// Cliente — FR-002
// ---------------------------------------------------------------------------

export interface Cliente {
  id: string;
  nombre: string;
  rfc?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  creadoEn: string;
  actualizadoEn: string;
}

export type ClienteInput = Omit<Cliente, 'id' | 'creadoEn' | 'actualizadoEn'>;

// ---------------------------------------------------------------------------
// Servicio del catálogo — FR-003
// ---------------------------------------------------------------------------

export interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  precioUnitario: Centavos;
  unidad: string;
  creadoEn: string;
  actualizadoEn: string;
}

export type ServicioInput = Omit<Servicio, 'id' | 'creadoEn' | 'actualizadoEn'>;

// ---------------------------------------------------------------------------
// Línea de presupuesto — FR-005
// ---------------------------------------------------------------------------

export type OrigenLinea = 'catalogo' | 'manual';

export interface LineaPresupuesto {
  id: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: Centavos;
  origen: OrigenLinea;
  /** Referencia informativa al servicio de origen (solo si `origen === 'catalogo'`). */
  servicioId: string | null;
}

export interface LineaInput {
  id?: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: Centavos;
  origen?: OrigenLinea;
  servicioId?: string | null;
}

// ---------------------------------------------------------------------------
// Presupuesto — FR-004…FR-018
// ---------------------------------------------------------------------------

// Estados persistidos del presupuesto (FR-011). "emitido" pasa a "enviado".
export type EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'rechazado';

/** Estados a los que se puede cambiar un presupuesto ya emitido (FR-012). */
export type EstadoCambiable = 'enviado' | 'aceptado' | 'rechazado';

/** Estado de presentación: incluye el estado calculado "caducado" (FR-013). */
export type EstadoMostrado = EstadoPresupuesto | 'caducado';

export interface EmisorSnapshot {
  nombre: string;
  razonSocial: string;
  rfc: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  logo?: string;
}

export interface ClienteSnapshot {
  nombre: string;
  rfc?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
}

export interface Presupuesto {
  id: string;
  estado: EstadoPresupuesto;
  numero: string | null;
  clienteId: string;
  clienteSnapshot: ClienteSnapshot | null;
  emisorSnapshot: EmisorSnapshot | null;
  lineas: LineaPresupuesto[];
  retencionISR: boolean;
  fechaEmision: string | null;
  fechaValidez: string;
  baseCentavos: Centavos;
  ivaCentavos: Centavos;
  retencionCentavos: Centavos;
  totalCentavos: Centavos;
  creadoEn: string;
  actualizadoEn: string;
}

export interface BorradorInput {
  clienteId: string;
  lineas: LineaInput[];
  retencionISR: boolean;
  fechaValidez: string;
}

// ---------------------------------------------------------------------------
// Agregado persistente
// ---------------------------------------------------------------------------

export interface Agregado {
  version: number;
  perfil: PerfilEmisor | null;
  clientes: Cliente[];
  servicios: Servicio[];
  presupuestos: Presupuesto[];
  /** Último consecutivo usado por año (`Record<año, NN>`); evita reutilizar números eliminados. */
  correlativos: Record<string, number>;
}
