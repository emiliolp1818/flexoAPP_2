// Configuración de entorno RAILWAY - FlexoApp Frontend
// Este archivo debe ser usado para el despliegue en Railway
export const environment = {
  production: true,
  // IMPORTANTE: Actualiza estas URLs con las de tu despliegue en Railway
  apiUrl: 'https://tu-backend.up.railway.app/api',
  socketUrl: 'https://tu-backend.up.railway.app',
  fallbackUrls: [
    'https://tu-backend.up.railway.app/api'
  ],
  enableLogging: false,
  enableDebugMode: false,
  cacheTimeout: 10 * 60 * 1000, // 10 minutos
  retryAttempts: 3,
  networkMode: false,
  disableNetworkStability: false,
  allowCrossOrigin: true,
  networkInterface: 'railway',
  imageBaseUrl: 'https://tu-backend.up.railway.app',
  alternativeUrls: []
};
