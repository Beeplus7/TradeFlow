import Constants from 'expo-constants';

/**
 * TradFlow environment config.
 * Public values come from Expo extra / EXPO_PUBLIC_*.
 * Server-only secrets never enter the client; only readiness flags do.
 */

export type CredentialGroup = 'supabase' | 'googleAuth' | 'github' | 'vps';

export type CredentialStatus = {
  group: CredentialGroup;
  label: string;
  ready: boolean;
  missing: string[];
};

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  googleWebClientId?: string;
  googleIosClientId?: string;
  googleAndroidClientId?: string;
  apiBaseUrl?: string;
  githubOwner?: string;
  githubRepo?: string;
  credentials?: {
    supabase?: boolean;
    googleAuth?: boolean;
    github?: boolean;
    vps?: boolean;
  };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const readPublic = (key: string, fromExtra: string | undefined): string => {
  const fromProcess = process.env[key];
  if (typeof fromProcess === 'string' && fromProcess.trim()) {
    return fromProcess.trim();
  }
  return (fromExtra ?? '').trim();
};

export const env = {
  supabaseUrl: readPublic('EXPO_PUBLIC_SUPABASE_URL', extra.supabaseUrl),
  supabaseAnonKey: readPublic(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    extra.supabaseAnonKey,
  ),
  googleWebClientId: readPublic(
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    extra.googleWebClientId,
  ),
  googleIosClientId: readPublic(
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
    extra.googleIosClientId,
  ),
  googleAndroidClientId: readPublic(
    'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
    extra.googleAndroidClientId,
  ),
  apiBaseUrl: readPublic('EXPO_PUBLIC_API_BASE_URL', extra.apiBaseUrl),
  githubOwner: extra.githubOwner ?? '',
  githubRepo: extra.githubRepo ?? '',
} as const;

const flags = extra.credentials ?? {};

export function getCredentialStatuses(): CredentialStatus[] {
  const supabaseReady =
    flags.supabase ?? Boolean(env.supabaseUrl && env.supabaseAnonKey);
  const googleReady = flags.googleAuth ?? Boolean(env.googleWebClientId);
  const githubReady = flags.github ?? false;
  const vpsReady = flags.vps ?? false;

  return [
    {
      group: 'supabase',
      label: 'Supabase',
      ready: supabaseReady,
      missing: supabaseReady
        ? []
        : ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'],
    },
    {
      group: 'googleAuth',
      label: 'Google Auth',
      ready: googleReady,
      missing: googleReady ? [] : ['EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'],
    },
    {
      group: 'github',
      label: 'GitHub',
      ready: githubReady,
      missing: githubReady ? [] : ['GITHUB_OWNER', 'GITHUB_REPO'],
    },
    {
      group: 'vps',
      label: 'VPS / API',
      ready: vpsReady,
      missing: vpsReady
        ? []
        : ['VPS_HOST', 'VPS_USER', 'EXPO_PUBLIC_API_BASE_URL'],
    },
  ];
}

export function isFoundationReady(): boolean {
  return getCredentialStatuses().every((s) => s.ready);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(env.googleWebClientId);
}
