
import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';


import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';


import { environment } from '../../../../environments/environment';



interface AppInfo {
  name: string;
  version: string;
  description: string;
  author: string;
}


interface NetworkInfo {
  localIP: string;
  localhost: string;
  port: string;
  fullURL: string;
  isOnline: boolean;
}


interface BackendInfo {
  url: string;
  port: string;
  isConnected: boolean;
  apiVersion: string;
}


interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  language: string;
}


@Component({
  selector: 'app-informacion',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './informacion.html',
  styleUrls: ['./informacion.scss']
})
export class InformacionComponent implements OnInit, OnDestroy {


  private networkCheckInterval: any;
  private backendCheckInterval: any;
  private onlineHandler = () => {
    console.log('✅ Evento: Conexión a internet restaurada');
    this.verifyRealConnection();
  };
  private offlineHandler = () => {
    console.warn('⚠️ Evento: Conexión a internet perdida');
    this.verifyRealConnection();
  };



  isLoading = signal<boolean>(true);


  appInfo = signal<AppInfo>({
    name: 'FlexoAPP',
    version: '1.0.0',
    description: 'Sistema de gestión flexográfica',
    author: 'FlexoAPP Team'
  });


  networkInfo = signal<NetworkInfo>({
    localIP: 'Detectando...',
    localhost: 'localhost',
    port: '4200',
    fullURL: 'http://localhost:4200',
    isOnline: true
  });


  backendInfo = signal<BackendInfo>({
    url: 'http://localhost:7003',
    port: '7003',
    isConnected: false,
    apiVersion: 'v1.0'
  });


  browserInfo = signal<BrowserInfo>({
    name: 'Desconocido',
    version: 'Desconocido',
    os: 'Desconocido',
    language: navigator.language || 'es-ES'
  });


  licenseText = signal<string>('Cargando licencia...');


  constructor(private http: HttpClient) {}



  ngOnInit(): void {
    this.loadAllInfo();
    this.startAutoRefresh();
  }


  ngOnDestroy(): void {
    this.stopAutoRefresh();
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }



  private startAutoRefresh(): void {

    this.networkCheckInterval = setInterval(() => {
      this.detectNetworkInfo();
      this.verifyRealConnection();
    }, 5000);


    this.backendCheckInterval = setInterval(() => {
      this.checkBackendConnection();
    }, 10000);

    console.log('🔄 Actualización automática iniciada');
  }



  private stopAutoRefresh(): void {
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
    }
    if (this.backendCheckInterval) {
      clearInterval(this.backendCheckInterval);
    }
    console.log('⏹️ Actualización automática detenida');
  }



  private loadAllInfo(): void {
    this.isLoading.set(true);


    this.loadAppInfo();


    this.detectNetworkInfo();


    this.detectBrowserInfo();


    this.loadLicense();


    this.checkBackendConnection();


    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }



  private loadAppInfo(): void {

    this.http.get('/package.json').subscribe({
      next: (packageData: any) => {

        this.appInfo.set({
          name: packageData.name || 'FlexoAPP Frontend',
          version: packageData.version || '1.0.0',
          description: packageData.description || 'Sistema de gestión flexográfica con Angular + TypeScript',
          author: packageData.author || 'FlexoAPP Team'
        });
        console.log('✅ Información de la aplicación cargada desde package.json');
      },
      error: (error) => {

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



  private detectNetworkInfo(): void {

    const hostname = window.location.hostname;
    const port = window.location.port || '4200';
    const protocol = window.location.protocol;


    const fullURL = `${protocol}//${hostname}:${port}`;


    const currentInfo = this.networkInfo();
    this.networkInfo.set({
      localIP: hostname,
      localhost: 'localhost',
      port: port,
      fullURL: fullURL,
      isOnline: currentInfo.isOnline
    });

    console.log('🌐 Información de red detectada:', {
      hostname,
      port,
      fullURL
    });


    this.setupNetworkListeners();
  }



  private setupNetworkListeners(): void {

    window.addEventListener('online', this.onlineHandler);


    window.addEventListener('offline', this.offlineHandler);


    this.verifyRealConnection();
  }



  private verifyRealConnection(): void {


    const currentInfo = this.networkInfo();
    this.networkInfo.set({
      ...currentInfo,
      isOnline: true
    });

    console.log('✅ Frontend en línea (aplicación funcionando)');
  }



  private detectBrowserInfo(): void {
    const userAgent = navigator.userAgent;
    let browserName = 'Desconocido';
    let browserVersion = 'Desconocido';
    let os = 'Desconocido';


    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
      browserName = 'Google Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      browserVersion = match ? match[1] : 'Desconocido';
    } else if (userAgent.indexOf('Edg') > -1) {
      browserName = 'Microsoft Edge';
      const match = userAgent.match(/Edg\/(\d+)/);
      browserVersion = match ? match[1] : 'Desconocido';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Mozilla Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      browserVersion = match ? match[1] : 'Desconocido';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      browserName = 'Apple Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      browserVersion = match ? match[1] : 'Desconocido';
    }


    if (userAgent.indexOf('Win') > -1) {
      os = 'Windows';
    } else if (userAgent.indexOf('Mac') > -1) {
      os = 'macOS';
    } else if (userAgent.indexOf('Linux') > -1) {
      os = 'Linux';
    } else if (userAgent.indexOf('Android') > -1) {
      os = 'Android';
    } else if (userAgent.indexOf('iOS') > -1) {
      os = 'iOS';
    }


    this.browserInfo.set({
      name: browserName,
      version: browserVersion,
      os: os,
      language: navigator.language || 'es-ES'
    });
  }



  private loadLicense(): void {

    const possiblePaths = ['/LICENSE.txt', 'LICENSE.txt', './LICENSE.txt', 'assets/LICENSE.txt'];


    const tryLoadFromPath = (path: string, index: number = 0): void => {
      this.http.get(path, { responseType: 'text' }).subscribe({
        next: (licenseContent) => {

          this.licenseText.set(licenseContent);
          console.log(`✅ Licencia cargada correctamente desde: ${path}`);
        },
        error: (error) => {
          console.warn(`⚠️ No se pudo cargar desde: ${path}`, error);

          if (index + 1 < possiblePaths.length) {
            tryLoadFromPath(possiblePaths[index + 1], index + 1);
          } else {

            console.error('❌ Error al cargar la licencia desde todas las rutas');
            this.licenseText.set('Error al cargar la licencia. Por favor, verifica que el archivo LICENSE.txt existe en la carpeta public del proyecto.');
          }
        }
      });
    };


    tryLoadFromPath(possiblePaths[0], 0);
  }



  private checkBackendConnection(): void {

    const backendBaseUrl = environment.apiUrl.replace('/api', '');
    const backendPort = new URL(environment.apiUrl).port;
    const healthCheckUrl = `${backendBaseUrl}/health`;

    console.log('🔍 Verificando conexión con backend:', healthCheckUrl);


    this.http.get(healthCheckUrl).subscribe({
      next: (response: any) => {

        this.backendInfo.set({
          url: backendBaseUrl,
          port: backendPort,
          isConnected: true,
          apiVersion: response.version || 'v1.0'
        });
        console.log('✅ Backend conectado:', response);
      },
      error: (error) => {

        console.warn('⚠️ Backend no disponible:', error);
        this.backendInfo.set({
          url: backendBaseUrl,
          port: backendPort,
          isConnected: false,
          apiVersion: 'N/A'
        });
      }
    });
  }



  public refreshInfo(): void {
    console.log('🔄 Refrescando información del sistema...');
    this.loadAllInfo();
  }
}
