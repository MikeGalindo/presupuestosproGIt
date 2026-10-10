import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { aplicarTokens } from './styles/tokens';
import './styles/global.css';

aplicarTokens();

const raiz = document.getElementById('root');
if (!raiz) {
  throw new Error('No se encontró el elemento raíz #root');
}

ReactDOM.createRoot(raiz).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
