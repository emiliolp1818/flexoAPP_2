// Configuración de entorno para RAILWAY (Producción en la nube) - FlexoApp Frontend
// Este archivo se usa cuando el frontend se conecta al backend desplegado en Railway
export const environment = {
  production: true,
  // URL del backend en Railway
  apiUrl: 'https://flexoapp2-production.up.railway.app/api',
  socketUrl: 'https://flexoapp2-production.up.railway.app',
  fallbackUrls: [
    'https://flexoapp2-production.up.railway.app/api'
  ],
  enableLogging: false, // Deshabilitar logs en producción
  enableDebugMode: false, // Deshabilitar debug en producción
  cacheTimeout: 10 * 60 * 1000, // 10 minutos de caché
  retryAttempts: 3, // 3 reintentos en caso de error
  networkMode: false, // Modo red desactivado (no es red local)
  disableNetworkStability: true, // Deshabilitar verificación de estabilidad de red local
  allowCrossOrigin: true, // Permitir CORS
  networkInterface: 'railway', // Identificador de Railway
  imageBaseUrl: 'https://flexoapp2-production.up.railway.app', // URL base para imágenes
  alternativeUrls: [] // Sin URLs alternativas en producción
};
