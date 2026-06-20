import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// The design system lives at the repo root and is the single styling source.
import '../../design/styles.css';
import './app.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
