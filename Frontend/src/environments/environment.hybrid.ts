

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  socketUrl: 'http://localhost:8080',
  fallbackUrls: [
    'http://localhost:8080/api',
    'http://127.0.0.1:8080/api'
  ],
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 5 * 60 * 1000,
  retryAttempts: 3,
  networkMode: true,
  disableNetworkStability: false,
  allowCrossOrigin: true,
  networkInterface: 'localhost',
  imageBaseUrl: 'http://localhost:8080',
  alternativeUrls: [
    'http://localhost:8080/api',
    'http://127.0.0.1:8080/api'
  ]
};
