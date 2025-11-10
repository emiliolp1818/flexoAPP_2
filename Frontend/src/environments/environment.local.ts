// Configuración de entorno para desarrollo LOCAL - FlexoApp Frontend
// Este archivo se usa cuando trabajas en tu máquina local
export const environment = {
  production: false,
  apiUrl: 'http://localhost:7003/api',              // Backend local
  socketUrl: 'http://localhost:7003',               // WebSocket local
  fallbackUrls: [                                    // URLs de respaldo
    'http://localhost:7003/api',                    // Local primero
    'http://192.168.1.6:7003/api',                  // Red local
    'https://flexoapp-backend.onrender.com/api'     // Render como fallback
  ],
  enableLogging: true,                               // Logs detallados
  enableDebugMode: true,                             // Modo debug
  cacheTimeout: 5 * 60 * 1000,                      // 5 minutos
  retryAttempts: 3,                                  // 3 intentos
  networkMode: true,                                 // Escaneo de red
  disableNetworkStability: false,                    // Estabilidad activa
  allowCrossOrigin: true,                            // CORS permitido
  networkInterface: '0.0.0.0',                      // Todas las interfaces
  imageBaseUrl: 'http://localhost:7003',            // Imágenes locales
  alternativeUrls: [                                 // URLs alternativas
    'http://localhost:7003/api',                    // Localhost
    'http://192.168.1.6:7003/api',                  // Red local
    'https://flexoapp-backend.onrender.com/api'     // Render
  ]
};
