import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Web3Provider } from "../src/Components/Web3Provider.tsx";
import './index.css';
import App from './app/App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </StrictMode>
);
