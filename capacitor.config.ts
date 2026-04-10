import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gameboxd.app',
  appName: 'GameBoxd',
  webDir: 'dist',
  server: {
    // Esta IP (10.0.2.2) es el "túnel" mágico que conecta 
    // el emulador de Android con el localhost de tu PC.
    url: 'http://10.0.2.2:8080',
    cleartext: true
  }
};

export default config;