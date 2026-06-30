import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor wraps the built Vite app (dist/) into native Android + iOS shells.
 * The web app is the single source of truth; native is a thin container.
 */
const config: CapacitorConfig = {
  appId: 'art.vaayu.app',
  appName: 'Vaayu',
  webDir: 'dist',
  backgroundColor: '#3E1324', // Varnam burgundy — matches the hero/splash
  android: {
    backgroundColor: '#3E1324',
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#3E1324',
      showSpinner: false,
      launchAutoHide: true,
      launchShowDuration: 800,
    },
  },
};

export default config;
