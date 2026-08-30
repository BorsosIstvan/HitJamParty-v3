import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // 1. Importáljuk a PWA plugint

export default defineConfig({
  base: '/HitJamParty-v3/',
  plugins: [
    react(),
    // 2. Beállítjuk a PWA-t és a Manifestet
    VitePWA({
      registerType: 'autoUpdate', // Automatikusan frissít a háttérben, ha új kódot deployolsz
      //includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Statikus fájlok
      manifest: {
        name: 'HitJam Party Kvíz',
        short_name: 'HitJamParty',
        description: 'A zseniális zenefelismerő bulijáték a Raspberry Pi-dről!',
        theme_color: '#0b0c10',      /* Az appcontainer sötét alapértelmezett színe */
        background_color: '#0b0c10', /* Betöltési háttérszín mobilon */
        display: 'standalone',       /* EZZEL TŰNIK EL A BÖNGÉSZŐSÁV! */
        orientation: 'portrait',     /* Függőleges mobil nézetre kényszerítés */
        icons: [
          {
            src: 'icon/icon-192.png',  /* Szükséged lesz egy 192x192-es ikonra a public mappában */
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon/icon-512.png',  /* És egy nagy 512x512-es ikonra */
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'  /* Hogy az Android szépen körbe tudja vágni */
          }
        ]
      }
    })
  ]
});
