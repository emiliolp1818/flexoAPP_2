
export const environment = {
  production: true,
  apiUrl: 'https://flexoapp-backend.up.railway.app/api',
  socketUrl: 'https://flexoapp-backend.up.railway.app',
  fallbackUrls: [
    'https://flexoapp-backend.up.railway.app/api'
  ],
  enableLogging: true,
  enableDebugMode: false,
  cacheTimeout: 10 * 60 * 1000,
  retryAttempts: 3,
  networkMode: false,
  disableNetworkStability: true,
  allowCrossOrigin: true,
  networkInterface: 'flexoapp-backend.up.railway.app',
  imageBaseUrl: 'https://flexoapp-backend.up.railway.app',
  alternativeUrls: []
};
