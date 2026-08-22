
export const environment = {
  production: false,

  apiUrl: `http://${window.location.hostname}:8080/api`,
  socketUrl: `http://${window.location.hostname}:8080`,
  signalRHubUrl: `http://${window.location.hostname}:8080/hubs/maquinas`,
  enableSignalR: true,
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
  imageBaseUrl: `http://${window.location.hostname}:8080`,
  alternativeUrls: [
    'http://localhost:8080/api',
    'http://127.0.0.1:8080/api'
  ]
};
