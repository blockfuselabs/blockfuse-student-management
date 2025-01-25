import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Web3Provider } from "./Components/Web3Provider";
import './index.css';
import App from '../src/app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </StrictMode>
);
