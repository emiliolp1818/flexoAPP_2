// Configuración de entorno para RED LOCAL - FlexoApp Frontend
// IP ESTÁTICA: 192.168.1.20 - Accesible desde cualquier dispositivo en la red
export const environment = {
  production: false,
  // Usar IP estática para acceso desde la red
  apiUrl: 'http://192.168.1.20:7003/api',
  socketUrl: 'http://192.168.1.20:7003',
  fallbackUrls: [
    'http://192.168.1.20:7003/api',
    'http://localhost:7003/api',
    'http://127.0.0.1:7003/api'
  ],
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 5 * 60 * 1000,
  retryAttempts: 3,
  networkMode: true, // Modo red activado
  disableNetworkStability: false,
  allowCrossOrigin: true,
  networkInterface: '192.168.1.20', // IP estática
  imageBaseUrl: 'http://192.168.1.20:7003',
  alternativeUrls: [
    'http://192.168.1.20:7003/api',
    'http://localhost:7003/api'
  ]
};
