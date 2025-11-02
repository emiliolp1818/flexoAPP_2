export const environment = {
  production: true,
  apiUrl: 'http://192.168.1.28:7003/api',
  socketUrl: 'http://192.168.1.28:7003',
  fallbackUrls: [
    'http://192.168.1.28:7003/api',
    'http://localhost:7003/api'
  ],
  networkMode: true,
  enableLogging: false,
  enableDebugMode: false,
  cacheTimeout: 10 * 60 * 1000, // 10 minutos
  retryAttempts: 5
};