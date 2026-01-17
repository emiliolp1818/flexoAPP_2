  // IP ESTÁTICA: 192.168.1.14 - Accesible desde cualquier dispositivo en la red
export const environment = {
  production: false,
  // Usar localhost para desarrollo local estable
  apiUrl: 'http://localhost:10000/api',
  socketUrl: 'http://localhost:10000',
  fallbackUrls: [
    'http://localhost:10000/api',
    'http://127.0.0.1:10000/api',
    'http://192.168.1.14:10000/api'
  ],
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 5 * 60 * 1000,
  retryAttempts: 3,
  networkMode: true, // Modo red activado
  disableNetworkStability: false,
  allowCrossOrigin: true,
  networkInterface: 'localhost', // Usar localhost
  imageBaseUrl: 'http://localhost:10000',
  alternativeUrls: [
    'http://localhost:10000/api',
    'http://192.168.1.14:10000/api'
  ]
};
