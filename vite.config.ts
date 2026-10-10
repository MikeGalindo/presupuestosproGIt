/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Configuración de Vite + Vitest para la SPA de PresupuestosPro.
// `base`: en local es "/", y en GitHub Pages el workflow define VITE_BASE
// con la subruta del repositorio (p. ej. "/presupuestosproGIt/").
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    testTimeout: 15000,
  },
});
