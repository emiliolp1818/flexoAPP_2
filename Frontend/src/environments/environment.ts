export const environment = {
  production: false,
  apiUrl: 'http://192.168.1.28:7003/api',
  socketUrl: 'http://192.168.1.28:7003',
  fallbackUrls: [
    'http://192.168.1.28:7003/api',
    'http://localhost:7003/api',
    'http://127.0.0.1:7003/api'
  ],
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  retryAttempts: 3,
  networkMode: false, // Disable network scanning
  disableNetworkStability: true // Completely disable network stability service
};
