import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register';

// Regisztráljuk a Service Workert és beállítjuk az azonnali kényszerítést
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("🔥 Új HitJamParty verzió elérhető! Azonnali frissítés...");
    // Ha a böngésző jelzi, hogy van új kód a GitHub Pages-en, 
    // ezzel a paranccsal azonnal felülírjuk a régit és újratöltjük az appot:
    updateSW(true); 
  },
  onOfflineReady() {
    console.log("📲 Az alkalmazás készen áll az offline játékra!");
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
