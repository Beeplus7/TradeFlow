import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { env, isGoogleAuthConfigured } from '../../config/env';

WebBrowser.maybeCompleteAuthSession();

export type GoogleAuthConfig = {
  webClientId: string;
  iosClientId?: string;
  androidClientId?: string;
};

export function getGoogleAuthConfig(): GoogleAuthConfig | null {
  if (!isGoogleAuthConfigured()) {
    return null;
  }

  return {
    webClientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId || undefined,
    androidClientId: env.googleAndroidClientId || undefined,
  };
}

/**
 * Google sign-in helpers.
 * Full Supabase signInWithIdToken wiring waits until Google + Supabase credentials exist.
 */
export function useGoogleAuthRequest() {
  const config = getGoogleAuthConfig();
  const enabled = Boolean(config);

  const [request, response, promptAsync] = Google.useAuthRequest(
    enabled && config
      ? {
          webClientId: config.webClientId,
          iosClientId: config.iosClientId,
          androidClientId: config.androidClientId,
        }
      : {
          // Disabled until EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is set
          webClientId: '000000000000-disabled.apps.googleusercontent.com',
        },
  );

  return {
    ready: enabled,
    platform: Platform.OS,
    request: enabled ? request : null,
    response: enabled ? response : null,
    promptAsync: enabled ? promptAsync : async () => null,
  };
}
