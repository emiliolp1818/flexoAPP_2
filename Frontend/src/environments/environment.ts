// Configuración de entorno para desarrollo - FlexoApp Frontend
// Este archivo define todas las URLs y configuraciones de red para el entorno de desarrollo
// IMPORTANTE: La IP 192.168.1.6:4200 debe mantenerse fija para acceso desde otros dispositivos en la red
export const environment = {
  production: false,                                    // Modo de desarrollo activado - habilita logs y debug
  apiUrl: 'http://192.168.1.6:7003/api',              // URL principal del API backend - FIJA para red local
  socketUrl: 'http://192.168.1.6:7003',               // URL para conexiones WebSocket - FIJA para red local
  fallbackUrls: [                                      // URLs de respaldo en caso de fallo de conexión principal
    'http://192.168.1.6:7003/api',                    // URL principal repetida como primer fallback
    'http://localhost:7003/api',                       // Fallback para desarrollo local (solo máquina host)
    'http://127.0.0.1:7003/api',                      // Fallback loopback local (solo máquina host)
    'http://0.0.0.0:7003/api'                         // Fallback para todas las interfaces de red
  ],
  enableLogging: true,                                  // Habilitar logs detallados en consola para debug
  enableDebugMode: true,                               // Habilitar modo debug con información adicional
  cacheTimeout: 5 * 60 * 1000,                        // Timeout de cache: 5 minutos (300,000 ms)
  retryAttempts: 3,                                    // Número de intentos de reconexión automática
  networkMode: true,                                   // Habilitar escaneo de red para detectar otros dispositivos
  disableNetworkStability: false,                      // Mantener servicio de estabilidad de red activo
  // Configuración adicional para acceso desde otros dispositivos en la red local
  allowCrossOrigin: true,                              // Permitir peticiones CORS desde otros orígenes
  networkInterface: '0.0.0.0',                        // Interfaz de red: todas las IPs (permite acceso externo)
  imageBaseUrl: 'http://192.168.1.6:7003',           // URL base para imágenes - FIJA para acceso de red
  // URLs alternativas para diferentes rangos de red privada
  alternativeUrls: [                                   // URLs adicionales para diferentes configuraciones de red
    'http://192.168.1.6:7003/api',                    // Red clase C estándar (192.168.1.x)
    'http://192.168.0.6:7003/api',                    // Red clase C alternativa (192.168.0.x)
    'http://10.0.0.6:7003/api'                        // Red clase A privada (10.x.x.x)
  ]
};
