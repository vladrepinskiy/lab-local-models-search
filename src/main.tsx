import { setup } from 'goober';
import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

setup(createElement);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
