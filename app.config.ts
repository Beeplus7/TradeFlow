import 'dotenv/config';
import type { ExpoConfig, ConfigContext } from 'expo/config';

const has = (key: string) => Boolean(process.env[key]?.trim());

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'TradFlow',
  slug: 'TradFlow',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'tradflow',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.tradflow.app',
  },
  android: {
    package: 'com.tradflow.app',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    // SPA export — static SSG HTML was omitting client <script> tags,
    // leaving production stuck on the font-loading spinner.
    output: 'single',
  },
  plugins: ['expo-router', 'expo-secure-store', 'expo-web-browser'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
    googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
    githubOwner: process.env.GITHUB_OWNER ?? '',
    githubRepo: process.env.GITHUB_REPO ?? '',
    // Presence flags only — never expose tokens/secrets to the client bundle
    credentials: {
      supabase: has('EXPO_PUBLIC_SUPABASE_URL') && has('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
      googleAuth: has('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
      github: has('GITHUB_OWNER') && has('GITHUB_REPO'),
      vps: has('VPS_HOST') && has('VPS_USER') && has('EXPO_PUBLIC_API_BASE_URL'),
    },
  },
});
