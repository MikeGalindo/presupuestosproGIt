// Utilidades de fecha en es-MX — FR-009, FR-014, Principio II.

const formateadorFecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' });

/** Fecha de hoy en ISO `YYYY-MM-DD` (hora local). */
export function hoyISO(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Suma días a una fecha ISO `YYYY-MM-DD` y devuelve otra fecha ISO. */
export function sumarDias(fechaISO: string, dias: number): string {
  const base = new Date(`${fechaISO}T00:00:00`);
  if (Number.isNaN(base.getTime())) return fechaISO;
  base.setDate(base.getDate() + dias);
  const anio = base.getFullYear();
  const mes = String(base.getMonth() + 1).padStart(2, '0');
  const dia = String(base.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Fecha de validez por defecto: emisión + 30 días. */
export function fechaValidezPorDefecto(fechaEmision: string = hoyISO()): string {
  return sumarDias(fechaEmision, 30);
}

/** Formatea una fecha ISO (`YYYY-MM-DD` o marca de tiempo completa) como texto es-MX. */
export function formatearFecha(fechaISO: string | null | undefined): string {
  if (!fechaISO) return '—';
  // Para marcas de tiempo completas se respeta la zona horaria local; para fechas
  // sin hora se interpreta como fecha local (evita desfases de un día por UTC).
  const fecha = fechaISO.includes('T') ? new Date(fechaISO) : new Date(`${fechaISO}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return '—';
  return formateadorFecha.format(fecha);
}
