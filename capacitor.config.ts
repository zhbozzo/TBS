import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.tbs',
  appName: 'Tiny Battle Simulator',
  webDir: 'dist',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'never',
  },
  server: {
    iosScheme: 'capacitor',
  }
};

export default config;


