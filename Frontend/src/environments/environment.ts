
export const environment = {
  production: false,

  apiUrl: 'http://localhost:10000/api',
  socketUrl: 'http://localhost:10000',
  fallbackUrls: [
    'http://localhost:10000/api',
    'http://127.0.0.1:10000/api',
    'http://192.168.1.14:10000/api'
  ],
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 5 * 60 * 1000,
  retryAttempts: 3,
  networkMode: true,
  disableNetworkStability: false,
  allowCrossOrigin: true,
  networkInterface: 'localhost',
  imageBaseUrl: 'http://localhost:10000',
  alternativeUrls: [
    'http://localhost:10000/api',
    'http://192.168.1.14:10000/api'
  ]
};
