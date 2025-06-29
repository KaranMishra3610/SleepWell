import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png'], // ensure your icon is in public/icon.png
      manifest: {
        name: 'Sleep Wellness App',
        short_name: 'SleepApp',
        description: 'A calming PWA for better sleep with AI bedtime stories and routines.',
        theme_color: '#1e1e2f',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
