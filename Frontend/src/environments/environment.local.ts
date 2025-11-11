// Configuración de entorno para desarrollo LOCAL - FlexoApp Frontend
export const environment = {
  production: false,
  apiUrl: 'http://localhost:7003/api',
  socketUrl: 'http://localhost:7003',
  fallbackUrls: [
    'http://localhost:7003/api'
  ],
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 5 * 60 * 1000,
  retryAttempts: 3,
  networkMode: false,
  disableNetworkStability: true,
  allowCrossOrigin: true,
  networkInterface: 'localhost',
  imageBaseUrl: 'http://localhost:7003',
  alternativeUrls: [
    'http://localhost:7003/api'
  ]
};
