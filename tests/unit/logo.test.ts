import { describe, expect, it } from 'vitest';
import {
  logoCompatibleConPdf,
  prepararLogo,
  tipoLogoDesdeDataUrl,
} from '../../src/lib/logo';

const PNG_1x1 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const JPEG_1x1 =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAAv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==';
const SVG = 'data:image/svg+xml;base64,PHN2Zy8+';

describe('utilidades del logo (FR-010)', () => {
  it('detecta el tipo MIME de una data URL', () => {
    expect(tipoLogoDesdeDataUrl(PNG_1x1)).toBe('image/png');
    expect(tipoLogoDesdeDataUrl(JPEG_1x1)).toBe('image/jpeg');
    expect(tipoLogoDesdeDataUrl(SVG)).toBe('image/svg+xml');
    expect(tipoLogoDesdeDataUrl(undefined)).toBeNull();
  });

  it('considera compatibles solo PNG y JPEG', () => {
    expect(logoCompatibleConPdf(PNG_1x1)).toBe(true);
    expect(logoCompatibleConPdf(JPEG_1x1)).toBe(true);
    expect(logoCompatibleConPdf(SVG)).toBe(false);
    expect(logoCompatibleConPdf(null)).toBe(false);
  });

  it('conserva sin cambios un logo ya compatible (PNG)', async () => {
    const bytes = Uint8Array.from(atob(PNG_1x1.split(',')[1] ?? ''), (c) => c.charCodeAt(0));
    const archivo = new File([bytes], 'logo.png', { type: 'image/png' });
    const resultado = await prepararLogo(archivo);
    expect(logoCompatibleConPdf(resultado)).toBe(true);
    expect(tipoLogoDesdeDataUrl(resultado)).toBe('image/png');
  });
});
