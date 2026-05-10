/// <reference types="vite-plugin-pwa/client" />
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker and handle updates
const updateSW = registerSW({
  onNeedRefresh() {
    // We leave this empty because the user wants manual force reload, 
    // but standard behavior with prompt register type shows a prompt. 
    // We'll use autoUpdate in config so this isn't strictly needed for prompts, 
    // but just initializing it is good.
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
