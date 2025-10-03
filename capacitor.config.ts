import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.776f414c0d834c29b418ead88250fb3b',
  appName: 'taskly-ai-workflows-84',
  webDir: 'dist',
  server: {
    url: 'https://776f414c-0d83-4c29-b418-ead88250fb3b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;