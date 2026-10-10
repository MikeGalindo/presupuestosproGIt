// Generación de identificadores únicos sin dependencias externas.

/**
 * Genera un UUID v4. Usa `crypto.randomUUID()` cuando está disponible y, en su
 * defecto, un generador basado en `crypto.getRandomValues` o `Math.random`.
 */
export function nuevoId(): string {
  const cripto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cripto && typeof cripto.randomUUID === 'function') {
    return cripto.randomUUID();
  }
  if (cripto && typeof cripto.getRandomValues === 'function') {
    const bytes = cripto.getRandomValues(new Uint8Array(16));
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x03) | 0x08;
    return v.toString(16);
  });
}
