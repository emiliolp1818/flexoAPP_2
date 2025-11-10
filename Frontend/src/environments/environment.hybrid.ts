// Configuración HÍBRIDA - FlexoApp Frontend
// Intenta localhost primero, luego Render como fallback automático
export const environment = {
  production: false,
  apiUrl: 'http://localhost:7003/api',              // Intenta local primero
  socketUrl: 'http://localhost:7003',
  fallbackUrls: [                                    // Fallback automático a Render
    'http://localhost:7003/api',                    // 1. Local
    'http://192.168.1.6:7003/api',                  // 2. Red local
    'https://flexoapp-backend.onrender.com/api'     // 3. Render (fallback)
  ],
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 5 * 60 * 1000,
  retryAttempts: 3,
  networkMode: true,
  disableNetworkStability: false,
  allowCrossOrigin: true,
  networkInterface: '0.0.0.0',
  imageBaseUrl: 'http://localhost:7003',
  alternativeUrls: [
    'http://localhost:7003/api',
    'http://192.168.1.6:7003/api',
    'https://flexoapp-backend.onrender.com/api'
  ]
};
