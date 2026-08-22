
export const environment = {
  production: false,
  apiUrl: 'http://localhost:10000/api',
  socketUrl: 'http://localhost:10000',
  signalRHubUrl: 'http://localhost:10000/hubs/maquinas',
  enableSignalR: true,
  fallbackUrls: [
    'http://localhost:10000/api'
  ],
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 5 * 60 * 1000,
  retryAttempts: 3,
  networkMode: false,
  disableNetworkStability: true,
  allowCrossOrigin: true,
  networkInterface: 'localhost',
  imageBaseUrl: 'http://localhost:10000',
  alternativeUrls: [
    'http://localhost:10000/api'
  ]
};
