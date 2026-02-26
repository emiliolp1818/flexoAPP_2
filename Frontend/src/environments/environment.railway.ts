
export const environment = {
  production: true,
  // IMPORTANTE: Reemplaza XXXX con tu dominio real de Railway backend
  // Ejemplo: https://flexoapp-backend-production-a1b2.up.railway.app
  apiUrl: 'https://TU-DOMINIO-BACKEND-RAILWAY.up.railway.app/api',
  socketUrl: 'https://TU-DOMINIO-BACKEND-RAILWAY.up.railway.app',
  fallbackUrls: [
    'https://TU-DOMINIO-BACKEND-RAILWAY.up.railway.app/api',
    'https://flexoapp-backend.onrender.com/api'  // Fallback a Render
  ],
  enableLogging: true,  // Activado para debugging en Railway
  enableDebugMode: false,
  cacheTimeout: 10 * 60 * 1000,
  retryAttempts: 3,
  networkMode: false,
  disableNetworkStability: true,
  allowCrossOrigin: true,
  networkInterface: 'TU-DOMINIO-BACKEND-RAILWAY.up.railway.app',
  imageBaseUrl: 'https://TU-DOMINIO-BACKEND-RAILWAY.up.railway.app',
  alternativeUrls: []
};
