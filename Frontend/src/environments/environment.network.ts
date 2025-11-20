// Configuración de entorno para RED LOCAL - FlexoApp Frontend
// Usar esta configuración cuando se acceda desde otros dispositivos en la red
export const environment = {
  production: false,
  // IP ESTÁTICA DE TU PC - Cambiar si la IP cambia
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
