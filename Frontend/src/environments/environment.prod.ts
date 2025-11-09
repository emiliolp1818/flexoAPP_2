// Configuración de entorno para producción - FlexoApp Frontend
// Este archivo se usa cuando la aplicación se despliega en Render
export const environment = {
  production: true,
  apiUrl: 'https://flexoapp-backend.onrender.com/api',
  socketUrl: 'https://flexoapp-backend.onrender.com',
  fallbackUrls: [
    'https://flexoapp-backend.onrender.com/api'
  ],
  enableLogging: false,
  enableDebugMode: false,
  cacheTimeout: 10 * 60 * 1000, // 10 minutos
  retryAttempts: 5,
  networkMode: false,
  disableNetworkStability: true,
  allowCrossOrigin: true,
  networkInterface: '0.0.0.0',
  imageBaseUrl: 'https://flexoapp-backend.onrender.com',
  alternativeUrls: []
};
