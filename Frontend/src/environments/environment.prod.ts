// Configuración de entorno PRODUCCIÓN - FlexoApp Frontend para Render
export const environment = {
  production: true,
  apiUrl: 'https://flexoapp-backend.onrender.com/api',
  socketUrl: 'https://flexoapp-backend.onrender.com',
  fallbackUrls: [
    'https://flexoapp-backend.onrender.com/api'
  ],
  enableLogging: false,
  enableDebugMode: false,
  cacheTimeout: 10 * 60 * 1000,
  retryAttempts: 3,
  networkMode: false,
  disableNetworkStability: true,
  allowCrossOrigin: true,
  networkInterface: 'flexoapp-backend.onrender.com',
  imageBaseUrl: 'https://flexoapp-backend.onrender.com',
  alternativeUrls: []
};
