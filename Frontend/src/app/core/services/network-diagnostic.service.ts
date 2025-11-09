import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

export interface NetworkDiagnostic {
  url: string;
  status: 'success' | 'error' | 'timeout';
  responseTime: number;
  error?: string;
}

export interface NetworkInfo {
  currentUrl: string;
  fallbackUrls: string[];
  networkMode: boolean;
  lastCheck?: Date;
}

export interface DiagnosticResults {
  connectivityResults: NetworkDiagnostic[];
  networkInfo: NetworkInfo;
  timestamp?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkDiagnosticService {

  constructor(private http: HttpClient) {}

  /**
   * Obtener información de red actual
   */
  getNetworkInfo(): NetworkInfo {
    return {
      currentUrl: 'http://192.168.1.6:7003',
      fallbackUrls: [
        'http://localhost:7003',
        'http://127.0.0.1:7003',
        'http://192.168.1.6:7003'
      ],
      networkMode: true,
      lastCheck: new Date()
    };
  }

  /**
   * Ejecutar diagnóstico completo
   */
  runDiagnostic(): Observable<DiagnosticResults> {
    return this.diagnoseConnections().pipe(
      map(connectivityResults => ({
        connectivityResults,
        networkInfo: this.getNetworkInfo(),
        timestamp: new Date()
      }))
    );
  }

  /**
   * Diagnosticar conexiones de red
   */
  diagnoseConnections(): Observable<NetworkDiagnostic[]> {
    const urls = [
      'http://localhost:7003',
      'http://127.0.0.1:7003',
      'http://192.168.1.6:7003'
    ];

    const diagnostics = urls.map(url => this.testConnection(url));
    
    return forkJoin(diagnostics);
  }

  /**
   * Probar conexión individual
   */
  private testConnection(url: string): Observable<NetworkDiagnostic> {
    const startTime = Date.now();
    
    return this.http.get(`${url}/health`, { 
      responseType: 'json',
      observe: 'response'
    }).pipe(
      timeout(5000), // 5 seconds timeout
      map(response => ({
        url,
        status: 'success' as const,
        responseTime: Date.now() - startTime
      })),
      catchError(error => {
        const responseTime = Date.now() - startTime;
        let status: 'error' | 'timeout' = 'error';
        
        if (error.name === 'TimeoutError') {
          status = 'timeout';
        }
        
        return of({
          url,
          status,
          responseTime,
          error: error.message || 'Connection failed'
        });
      })
    );
  }

  /**
   * Probar login con URL específica
   */
  testLoginWithUrl(url: string, credentials: any): Observable<any> {
    return this.http.post(`${url}/api/auth/login`, credentials).pipe(
      timeout(10000),
      catchError(error => {
        console.error(`Error testing login with ${url}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtener la mejor URL disponible
   */
  getBestAvailableUrl(): Observable<string | null> {
    return this.diagnoseConnections().pipe(
      map(diagnostics => {
        // Filtrar solo las conexiones exitosas
        const successful = diagnostics
          .filter(d => d.status === 'success')
          .sort((a, b) => a.responseTime - b.responseTime);
        
        return successful.length > 0 ? successful[0].url : null;
      })
    );
  }
}