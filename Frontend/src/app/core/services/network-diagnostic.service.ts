import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface NetworkInfo {
  hostname: string;
  port: string;
  isNetworkAccess: boolean;
  apiUrl: string;
}

export interface ConnectivityResult {
  url: string;
  status: 'success' | 'error';
  message: string;
  responseTime?: number;
  error?: string;
}

export interface DiagnosticResults {
  connectivityResults: ConnectivityResult[];
  networkInfo: NetworkInfo;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkDiagnosticService {
  private fallbackUrls = [
    'http://localhost:7003',
    'http://127.0.0.1:7003',
    'http://192.168.1.28:7003',
    'http://192.168.1.1:7003',
    'http://192.168.1.2:7003',
    'http://192.168.1.3:7003',
    'http://192.168.1.4:7003',
    'http://192.168.1.5:7003'
  ];

  constructor(private http: HttpClient) {}

  /**
   * Obtener información de red
   */
  getNetworkInfo(): NetworkInfo {
    const hostname = window.location.hostname;
    const port = window.location.port || '4200';
    const isNetworkAccess = hostname !== 'localhost' && hostname !== '127.0.0.1';
    
    return {
      hostname,
      port,
      isNetworkAccess,
      apiUrl: environment.apiUrl
    };
  }

  /**
   * Ejecutar diagnóstico completo de conectividad
   */
  runDiagnostic(): Observable<DiagnosticResults> {
    const networkInfo = this.getNetworkInfo();
    // Usar las URLs base (sin /api) para el diagnóstico
    const baseUrls = this.fallbackUrls;
    
    // Eliminar duplicados
    const uniqueUrls = [...new Set(baseUrls)];
    
    const connectivityTests = uniqueUrls.map(url => this.testConnectivity(url));
    
    return forkJoin(connectivityTests).pipe(
      map(results => ({
        connectivityResults: results,
        networkInfo
      }))
    );
  }

  /**
   * Probar conectividad a una URL específica
   */
  private testConnectivity(url: string): Observable<ConnectivityResult> {
    const startTime = Date.now();
    
    // Primero intentar con /health, si falla intentar con la raíz de la API
    return this.http.get(`${url}`, { 
      responseType: 'text',
      headers: { 'Cache-Control': 'no-cache' }
    }).pipe(
      timeout(5000), // 5 segundos timeout
      map(() => {
        const responseTime = Date.now() - startTime;
        return {
          url,
          status: 'success' as const,
          message: 'Servidor disponible',
          responseTime
        };
      }),
      catchError(error => {
        let message = 'Conexión fallida';
        let errorCode = 'UNKNOWN';
        
        if (error.name === 'TimeoutError') {
          message = 'Timeout de conexión';
          errorCode = 'TIMEOUT';
        } else if (error.status === 0) {
          message = 'Servidor no disponible';
          errorCode = 'ECONNREFUSED';
        } else if (error.status === 404) {
          message = 'Endpoint no encontrado (servidor detectado)';
          errorCode = '404';
        } else if (error.status >= 500) {
          message = 'Error interno del servidor';
          errorCode = error.status.toString();
        } else if (error.status >= 400) {
          message = 'Error de cliente';
          errorCode = error.status.toString();
        }
        
        return of({
          url,
          status: 'error' as const,
          message,
          error: errorCode
        });
      })
    );
  }

  /**
   * Probar login con una URL específica
   */
  testLoginWithUrl(url: string, credentials: any): Observable<any> {
    // Asegurar que la URL tenga /api para el endpoint de login
    const apiUrl = url.endsWith('/api') ? url : `${url}/api`;
    return this.http.post(`${apiUrl}/auth/login`, credentials).pipe(
      timeout(10000),
      catchError(error => {
        console.error('Error testing login with URL:', url, error);
        return throwError(() => error);
      })
    );
  }
}