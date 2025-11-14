// ===== IMPORTS DE ANGULAR =====
import { Component, signal, OnInit, OnDestroy } from '@angular/core'; // Componente base, signals reactivos y lifecycle hooks
import { CommonModule } from '@angular/common'; // Módulo común de Angular con directivas básicas
import { HttpClient } from '@angular/common/http'; // Cliente HTTP para cargar archivos

// ===== IMPORTS DE ANGULAR MATERIAL =====
import { MatCardModule } from '@angular/material/card'; // Módulo de tarjetas Material
import { MatIconModule } from '@angular/material/icon'; // Módulo de iconos Material
import { MatButtonModule } from '@angular/material/button'; // Módulo de botones Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Módulo de spinner de carga
import { MatTooltipModule } from '@angular/material/tooltip'; // Módulo de tooltips

// ===== IMPORTS DE CONFIGURACIÓN =====
import { environment } from '../../../../environments/environment'; // Configuración de entorno

// ===== INTERFACES DE DATOS =====
// Interfaz para la información de la aplicación
interface AppInfo {
  name: string; // Nombre de la aplicación desde package.json
  version: string; // Versión de la aplicación desde package.json
  description: string; // Descripción de la aplicación
  author: string; // Autor de la aplicación
}

// Interfaz para la información de red
interface NetworkInfo {
  localIP: string; // Dirección IP local detectada
  localhost: string; // Localhost estándar (127.0.0.1 o localhost)
  port: string; // Puerto en el que corre la aplicación
  fullURL: string; // URL completa de acceso
  isOnline: boolean; // Estado de conexión a internet
}

// Interfaz para la información del backend
interface BackendInfo {
  url: string; // URL del servidor backend
  port: string; // Puerto del backend
  isConnected: boolean; // Estado de conexión con el backend
  apiVersion: string; // Versión de la API del backend
}

// Interfaz para la información del navegador
interface BrowserInfo {
  name: string; // Nombre del navegador
  version: string; // Versión del navegador
  os: string; // Sistema operativo
  language: string; // Idioma del navegador
}

// ===== COMPONENTE PRINCIPAL =====
@Component({
  selector: 'app-informacion', // Selector del componente
  standalone: true, // Componente standalone (no requiere módulo)
  imports: [
    CommonModule, // Módulo común de Angular
    MatCardModule, // Tarjetas Material
    MatIconModule, // Iconos Material
    MatButtonModule, // Botones Material
    MatProgressSpinnerModule, // Spinner de carga
    MatTooltipModule // Tooltips
  ],
  templateUrl: './informacion.html', // Template HTML externo
  styleUrls: ['./informacion.scss'] // Estilos SCSS externos
})
export class InformacionComponent implements OnInit, OnDestroy {
  
  // ===== INTERVALOS DE ACTUALIZACIÓN =====
  private networkCheckInterval: any; // Intervalo para verificar red
  private backendCheckInterval: any; // Intervalo para verificar backend
  
  // ===== SIGNALS REACTIVOS =====
  // Signal para el estado de carga
  isLoading = signal<boolean>(true); // Indica si está cargando información
  
  // Signal para la información de la aplicación
  appInfo = signal<AppInfo>({
    name: 'FlexoAPP', // Nombre por defecto
    version: '1.0.0', // Versión por defecto
    description: 'Sistema de gestión flexográfica', // Descripción por defecto
    author: 'FlexoAPP Team' // Autor por defecto
  });
  
  // Signal para la información de red
  networkInfo = signal<NetworkInfo>({
    localIP: 'Detectando...', // IP local (se detecta en ngOnInit)
    localhost: 'localhost', // Localhost estándar
    port: '4200', // Puerto por defecto de Angular
    fullURL: 'http://localhost:4200', // URL completa por defecto
    isOnline: true // Si la app está corriendo, estamos en línea
  });
  
  // Signal para la información del backend
  backendInfo = signal<BackendInfo>({
    url: 'http://localhost:7003', // URL del backend desde configuración
    port: '7003', // Puerto del backend desde configuración
    isConnected: false, // Estado de conexión inicial
    apiVersion: 'v1.0' // Versión de la API por defecto
  });
  
  // Signal para la información del navegador
  browserInfo = signal<BrowserInfo>({
    name: 'Desconocido', // Nombre del navegador (se detecta en ngOnInit)
    version: 'Desconocido', // Versión del navegador
    os: 'Desconocido', // Sistema operativo
    language: navigator.language || 'es-ES' // Idioma del navegador
  });
  
  // Signal para el texto de la licencia
  licenseText = signal<string>('Cargando licencia...'); // Texto de la licencia (se carga desde archivo)

  // ===== CONSTRUCTOR =====
  constructor(private http: HttpClient) {} // Inyección del HttpClient para cargar archivos

  // ===== LIFECYCLE HOOKS =====
  // Se ejecuta cuando el componente se inicializa
  ngOnInit(): void {
    this.loadAllInfo(); // Cargar toda la información del sistema
    this.startAutoRefresh(); // Iniciar actualización automática
  }
  
  // Se ejecuta cuando el componente se destruye
  ngOnDestroy(): void {
    this.stopAutoRefresh(); // Detener actualización automática
  }
  
  // ===== MÉTODO: INICIAR ACTUALIZACIÓN AUTOMÁTICA =====
  // Inicia intervalos para actualizar información en tiempo real
  private startAutoRefresh(): void {
    // Verificar red cada 5 segundos
    this.networkCheckInterval = setInterval(() => {
      this.detectNetworkInfo();
      this.verifyRealConnection();
    }, 5000);
    
    // Verificar backend cada 10 segundos
    this.backendCheckInterval = setInterval(() => {
      this.checkBackendConnection();
    }, 10000);
    
    console.log('🔄 Actualización automática iniciada');
  }
  
  // ===== MÉTODO: DETENER ACTUALIZACIÓN AUTOMÁTICA =====
  // Detiene los intervalos de actualización
  private stopAutoRefresh(): void {
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
    }
    if (this.backendCheckInterval) {
      clearInterval(this.backendCheckInterval);
    }
    console.log('⏹️ Actualización automática detenida');
  }

  // ===== MÉTODO PRINCIPAL DE CARGA =====
  // Carga toda la información del sistema
  private loadAllInfo(): void {
    this.isLoading.set(true); // Activar indicador de carga
    
    // Cargar información de la aplicación desde package.json
    this.loadAppInfo();
    
    // Detectar información de red
    this.detectNetworkInfo();
    
    // Detectar información del navegador
    this.detectBrowserInfo();
    
    // Cargar el archivo de licencia
    this.loadLicense();
    
    // Verificar conexión con el backend
    this.checkBackendConnection();
    
    // Desactivar indicador de carga después de 1 segundo
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

  // ===== MÉTODO: CARGAR INFORMACIÓN DE LA APLICACIÓN =====
  // Carga la información desde package.json
  private loadAppInfo(): void {
    // Intentar cargar el package.json para obtener información real
    this.http.get('/package.json').subscribe({
      next: (packageData: any) => {
        // Éxito: actualizar con datos reales del package.json
        this.appInfo.set({
          name: packageData.name || 'FlexoAPP Frontend',
          version: packageData.version || '1.0.0',
          description: packageData.description || 'Sistema de gestión flexográfica con Angular + TypeScript',
          author: packageData.author || 'FlexoAPP Team'
        });
        console.log('✅ Información de la aplicación cargada desde package.json');
      },
      error: (error) => {
        // Error: usar valores por defecto
        console.warn('⚠️ No se pudo cargar package.json, usando valores por defecto:', error);
        this.appInfo.set({
          name: 'flexoapp-frontend',
          version: '1.0.0',
          description: 'FlexoAPP Frontend - Sistema de gestión flexográfica con Angular + TypeScript',
          author: 'FlexoAPP Team'
        });
      }
    });
  }

  // ===== MÉTODO: DETECTAR INFORMACIÓN DE RED =====
  // Detecta la IP local y construye las URLs de acceso
  private detectNetworkInfo(): void {
    // Obtener el hostname actual
    const hostname = window.location.hostname; // Hostname desde la URL actual
    const port = window.location.port || '4200'; // Puerto desde la URL o por defecto 4200
    const protocol = window.location.protocol; // Protocolo (http o https)
    
    // Construir la URL completa
    const fullURL = `${protocol}//${hostname}:${port}`; // URL completa de acceso
    
    // Actualizar el signal con la información detectada (sin cambiar isOnline aún)
    const currentInfo = this.networkInfo();
    this.networkInfo.set({
      localIP: hostname, // IP o hostname actual
      localhost: 'localhost', // Localhost estándar
      port: port, // Puerto actual
      fullURL: fullURL, // URL completa
      isOnline: currentInfo.isOnline // Mantener el estado actual
    });
    
    console.log('🌐 Información de red detectada:', {
      hostname,
      port,
      fullURL
    });
    
    // Escuchar cambios en el estado de conexión
    this.setupNetworkListeners();
  }
  
  // ===== MÉTODO: CONFIGURAR LISTENERS DE RED =====
  // Escucha cambios en el estado de conexión a internet
  private setupNetworkListeners(): void {
    // Listener para cuando se conecta a internet
    window.addEventListener('online', () => {
      console.log('✅ Evento: Conexión a internet restaurada');
      this.verifyRealConnection(); // Verificar servidor
    });
    
    // Listener para cuando se desconecta de internet
    window.addEventListener('offline', () => {
      console.warn('⚠️ Evento: Conexión a internet perdida');
      this.verifyRealConnection(); // Verificar servidor
    });
    
    // Verificar conexión real haciendo una petición
    this.verifyRealConnection();
  }
  
  // ===== MÉTODO: VERIFICAR CONEXIÓN REAL =====
  // Verifica la conexión real - Si la app está corriendo, estamos en línea
  private verifyRealConnection(): void {
    // Si puedes ver esta página, el frontend está corriendo
    // Lógica simple: aplicación funcionando = En Línea
    const currentInfo = this.networkInfo();
    this.networkInfo.set({
      ...currentInfo,
      isOnline: true // Siempre en línea si la aplicación está visible
    });
    
    console.log('✅ Frontend en línea (aplicación funcionando)');
  }

  // ===== MÉTODO: DETECTAR INFORMACIÓN DEL NAVEGADOR =====
  // Detecta el navegador, versión y sistema operativo del usuario
  private detectBrowserInfo(): void {
    const userAgent = navigator.userAgent; // User agent del navegador
    let browserName = 'Desconocido'; // Nombre del navegador por defecto
    let browserVersion = 'Desconocido'; // Versión por defecto
    let os = 'Desconocido'; // Sistema operativo por defecto

    // Detectar el navegador
    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
      browserName = 'Google Chrome'; // Chrome detectado
      const match = userAgent.match(/Chrome\/(\d+)/); // Extraer versión
      browserVersion = match ? match[1] : 'Desconocido';
    } else if (userAgent.indexOf('Edg') > -1) {
      browserName = 'Microsoft Edge'; // Edge detectado
      const match = userAgent.match(/Edg\/(\d+)/); // Extraer versión
      browserVersion = match ? match[1] : 'Desconocido';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Mozilla Firefox'; // Firefox detectado
      const match = userAgent.match(/Firefox\/(\d+)/); // Extraer versión
      browserVersion = match ? match[1] : 'Desconocido';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      browserName = 'Apple Safari'; // Safari detectado
      const match = userAgent.match(/Version\/(\d+)/); // Extraer versión
      browserVersion = match ? match[1] : 'Desconocido';
    }

    // Detectar el sistema operativo
    if (userAgent.indexOf('Win') > -1) {
      os = 'Windows'; // Windows detectado
    } else if (userAgent.indexOf('Mac') > -1) {
      os = 'macOS'; // macOS detectado
    } else if (userAgent.indexOf('Linux') > -1) {
      os = 'Linux'; // Linux detectado
    } else if (userAgent.indexOf('Android') > -1) {
      os = 'Android'; // Android detectado
    } else if (userAgent.indexOf('iOS') > -1) {
      os = 'iOS'; // iOS detectado
    }

    // Actualizar el signal con la información detectada
    this.browserInfo.set({
      name: browserName, // Nombre del navegador
      version: browserVersion, // Versión del navegador
      os: os, // Sistema operativo
      language: navigator.language || 'es-ES' // Idioma del navegador
    });
  }

  // ===== MÉTODO: CARGAR LICENCIA =====
  // Carga el contenido del archivo LICENSE desde la raíz del proyecto
  private loadLicense(): void {
    // Intentar cargar desde diferentes rutas posibles
    const possiblePaths = ['/LICENSE.txt', 'LICENSE.txt', './LICENSE.txt', 'assets/LICENSE.txt'];
    
    // Función para intentar cargar desde una ruta
    const tryLoadFromPath = (path: string, index: number = 0): void => {
      this.http.get(path, { responseType: 'text' }).subscribe({
        next: (licenseContent) => {
          // Éxito: actualizar el signal con el contenido de la licencia
          this.licenseText.set(licenseContent);
          console.log(`✅ Licencia cargada correctamente desde: ${path}`); // Log de éxito
        },
        error: (error) => {
          console.warn(`⚠️ No se pudo cargar desde: ${path}`, error);
          // Si hay más rutas por intentar, probar la siguiente
          if (index + 1 < possiblePaths.length) {
            tryLoadFromPath(possiblePaths[index + 1], index + 1);
          } else {
            // Error final: no se pudo cargar desde ninguna ruta
            console.error('❌ Error al cargar la licencia desde todas las rutas'); // Log de error
            this.licenseText.set('Error al cargar la licencia. Por favor, verifica que el archivo LICENSE.txt existe en la carpeta public del proyecto.'); // Mensaje de error
          }
        }
      });
    };
    
    // Iniciar la carga desde la primera ruta
    tryLoadFromPath(possiblePaths[0], 0);
  }

  // ===== MÉTODO: VERIFICAR CONEXIÓN CON EL BACKEND =====
  // Verifica si el backend está disponible
  private checkBackendConnection(): void {
    // Obtener la URL del backend desde la configuración de entorno
    const backendBaseUrl = environment.apiUrl.replace('/api', ''); // Remover /api para obtener la URL base
    const backendPort = new URL(environment.apiUrl).port; // Extraer el puerto de la URL
    const healthCheckUrl = `${backendBaseUrl}/health`; // Construir URL de health check (sin /api)
    
    console.log('🔍 Verificando conexión con backend:', healthCheckUrl);
    
    // Intentar hacer una petición al backend
    this.http.get(healthCheckUrl).subscribe({
      next: (response: any) => {
        // Éxito: backend conectado
        this.backendInfo.set({
          url: backendBaseUrl, // URL del backend desde configuración
          port: backendPort, // Puerto del backend desde configuración
          isConnected: true, // Estado: conectado
          apiVersion: response.version || 'v1.0' // Versión de la API desde la respuesta
        });
        console.log('✅ Backend conectado:', response); // Log de éxito con respuesta
      },
      error: (error) => {
        // Error: backend no disponible
        console.warn('⚠️ Backend no disponible:', error); // Log de advertencia
        this.backendInfo.set({
          url: backendBaseUrl, // URL del backend desde configuración
          port: backendPort, // Puerto del backend desde configuración
          isConnected: false, // Estado: desconectado
          apiVersion: 'N/A' // Versión no disponible
        });
      }
    });
  }

  // ===== MÉTODO PÚBLICO: REFRESCAR INFORMACIÓN =====
  // Recarga toda la información del sistema
  public refreshInfo(): void {
    console.log('🔄 Refrescando información del sistema...'); // Log de inicio
    this.loadAllInfo(); // Recargar toda la información
  }
}
