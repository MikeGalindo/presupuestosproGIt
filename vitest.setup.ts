import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpia el DOM y el almacenamiento entre pruebas para aislar cada escenario.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
