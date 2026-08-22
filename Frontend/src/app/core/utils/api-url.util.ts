import { environment } from '../../../environments/environment';

type EnvWithSignalR = typeof environment & {
  socketUrl?: string;
  signalRHubUrl?: string;
  enableSignalR?: boolean;
};

/** Raíz del backend sin sufijo /api (para SignalR, imágenes, etc.). */
export function getApiRootUrl(): string {
  const env = environment as EnvWithSignalR;
  const raw = (env.socketUrl || env.apiUrl || '').trim();
  if (!raw) return '';
  return raw.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
}

/** URL completa del hub Maquinas (sin /api en la ruta del hub). */
export function getSignalRHubUrl(): string {
  const env = environment as EnvWithSignalR;
  if (env.signalRHubUrl?.trim()) {
    return env.signalRHubUrl.trim().replace(/\/+$/, '');
  }
  const root = getApiRootUrl();
  return root ? `${root}/hubs/maquinas` : '/hubs/maquinas';
}

export function isSignalREnabled(): boolean {
  const env = environment as EnvWithSignalR;
  return env.enableSignalR !== false;
}

/** URL absoluta de imagen de perfil (ruta relativa, solo nombre de archivo o URL completa). */
export function resolveProfileImageUrl(profileImage: string | undefined | null): string {
  if (!profileImage || profileImage === 'null' || profileImage === 'undefined') return '';
  const value = profileImage.trim();
  if (!value) return '';

  // Data URLs y URLs absolutas se usan directamente
  if (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const env = environment as EnvWithSignalR & { imageBaseUrl?: string };
  const baseUrl = (env.imageBaseUrl || getApiRootUrl()).replace(/\/+$/, '');

  // Rutas que ya incluyen /api/ (ej: /api/users/1/profile-image)
  if (value.startsWith('/api/')) {
    return `${baseUrl}${value}`;
  }

  // Rutas legacy /uploads/profiles/...
  let path = value;
  if (!path.startsWith('/')) {
    path = path.includes('/') ? `/${path}` : `/uploads/profiles/${path}`;
  }
  if (!path.startsWith('/uploads/')) {
    path = `/uploads/profiles/${path.replace(/^\//, '')}`;
  }

  return `${baseUrl}${path}`;
}
