// Configuración de entorno PRODUCCIÓN - FlexoApp Frontend
// Para desarrollo local, usar environment.ts o environment.local.ts
export const environment = {
  production: true,
  apiUrl: 'http://localhost:7003/api',
  socketUrl: 'http://localhost:7003',
  fallbackUrls: [
    'http://localhost:7003/api'
  ],
  enableLogging: false,
  enableDebugMode: false,
  cacheTimeout: 10 * 60 * 1000,
  retryAttempts: 3,
  networkMode: false,
  disableNetworkStability: true,
  allowCrossOrigin: true,
  networkInterface: 'localhost',
  imageBaseUrl: 'http://localhost:7003',
  alternativeUrls: []
};
