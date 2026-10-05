import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/chat/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'HUDHUD CHAT',
        short_name: 'HUDHUD CHAT',
        description: 'HUDHUD CHAT by AcomZ Inc.',
        theme_color: '#0d0f12',
        background_color: '#0d0f12',
        display: 'standalone',
        scope: '/chat/',
        start_url: '/chat/',
        orientation: 'any',
        icons: [
          { src: 'android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'android/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'android/android-launchericon-144-144.png', sizes: '144x144', type: 'image/png' },
          { src: 'android/android-launchericon-96-96.png', sizes: '96x96', type: 'image/png' },
          { src: 'android/android-launchericon-72-72.png', sizes: '72x72', type: 'image/png' },
          { src: 'android/android-launchericon-48-48.png', sizes: '48x48', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    port: 5174
  }
});
