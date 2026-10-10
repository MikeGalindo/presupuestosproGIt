import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './data/store';
import { AppRoutes } from './router';

// En GitHub Pages la app vive en una subruta (p. ej. "/presupuestosproGIt/");
// `BASE_URL` la refleja, de modo que el router debe usar ese prefijo.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter basename={basename}>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}
