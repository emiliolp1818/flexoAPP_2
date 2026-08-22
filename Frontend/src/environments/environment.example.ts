// Archivo de ejemplo para configuración de entorno
// Copia este archivo y renómbralo según tu entorno:
// - environment.ts (desarrollo local)
// - environment.prod.ts (producción)
// - environment.railway.ts (Railway)

export const environment = {
  production: false,
  
  // URL del backend API
  apiUrl: 'http://localhost:8080/api',
  socketUrl: 'http://localhost:8080',
  signalRHubUrl: 'http://localhost:8080/hubs/maquinas',
  enableSignalR: true,

  // URLs de fallback (opcional)
  fallbackUrls: [
    'http://localhost:8080/api'
  ],
  
  // Configuración de la aplicación
  app: {
    name: 'FlexoAPP',
    version: '2.0.0',
    defaultLanguage: 'es',
    itemsPerPage: 10
  },
  
  // Configuración de caché
  cache: {
    enabled: true,
    ttl: 300000 // 5 minutos en milisegundos
  },
  
  // Configuración de logs
  logging: {
    enabled: true,
    level: 'debug' // 'debug' | 'info' | 'warn' | 'error'
  }
};
