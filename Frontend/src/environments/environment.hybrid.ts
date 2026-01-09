// Configuración de entorno HÍBRIDO - FlexoApp Frontend
// Solo para desarrollo local
export const environment = {
  production: false,
  apiUrl: 'http://192.168.1.14:7003/api',
  socketUrl: 'http://192.168.1.14:7003',
  fallbackUrls: [
    'http://192.168.1.14:7003/api',
    'http://localhost:7003/api'
  ],
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 5 * 60 * 1000,
  retryAttempts: 3,
  networkMode: true,
  disableNetworkStability: false,
  allowCrossOrigin: true,
  networkInterface: '192.168.1.14',
  imageBaseUrl: 'http://192.168.1.14:7003',
  alternativeUrls: [
    'http://192.168.1.14:7003/api',
    'http://localhost:7003/api'
  ]
};
