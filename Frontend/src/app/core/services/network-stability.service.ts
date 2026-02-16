import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, of } from 'rxjs';
import { catchError, switchMap, tap, retry, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface NetworkStatus {
  isOnline: boolean;
  apiUrl: string;
  responseTime: number;
  lastCheck: Date;
  failedAttempts: number;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkStabilityService {
  private networkStatusSubject = new BehaviorSubject<NetworkStatus>({
    isOnline: true,
    apiUrl: environment.apiUrl,
    responseTime: 0,
    lastCheck: new Date(),
    failedAttempts: 0
  });

  public networkStatus$ = this.networkStatusSubject.asObservable();
  private currentApiUrl = environment.apiUrl;
  private checkInterval = 30000;
  private maxFailedAttempts = 3;

  constructor(private http: HttpClient) {

    if (!environment.disableNetworkStability) {
      this.startNetworkMonitoring();
      this.setupOnlineOfflineListeners();
    }
  }


  getCurrentApiUrl(): string {
    return this.currentApiUrl;
  }


  checkNetworkConnectivity(): Observable<boolean> {

    if (environment.disableNetworkStability) {
      return of(true);
    }

    const startTime = Date.now();

    return this.http.get(`${this.currentApiUrl.replace('/api', '')}/health-simple`, {
      timeout: 5000
    }).pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        this.updateNetworkStatus(true, responseTime, 0);
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn('❌ Conectividad fallida con:', this.currentApiUrl, error.message);

        if (environment.networkMode) {
          return this.tryFallbackUrls().pipe(
            catchError(() => {
              this.updateNetworkStatus(false, 0, this.networkStatusSubject.value.failedAttempts + 1);
              return of(false);
            })
          );
        } else {
          this.updateNetworkStatus(false, 0, this.networkStatusSubject.value.failedAttempts + 1);
          return of(false);
        }
      }),
      switchMap(() => of(true))
    );
  }


  private tryFallbackUrls(): Observable<boolean> {
    const fallbackUrls = environment.fallbackUrls || [];

    if (fallbackUrls.length === 0) {
      return of(false);
    }

    return this.testUrls(fallbackUrls);
  }


  private testUrls(urls: string[]): Observable<boolean> {
    if (urls.length === 0) {
      return of(false);
    }

    const [firstUrl, ...remainingUrls] = urls;
    const startTime = Date.now();

    return this.http.get(`${firstUrl.replace('/api', '')}/health-simple`, {
      timeout: 3000
    }).pipe(
      tap(() => {
        const responseTime = Date.now() - startTime;
        console.log('✅ Conectividad restaurada con:', firstUrl);
        this.currentApiUrl = firstUrl;
        this.updateNetworkStatus(true, responseTime, 0);
      }),
      switchMap(() => of(true)),
      catchError(() => {
        if (remainingUrls.length > 0) {
          return this.testUrls(remainingUrls);
        }
        return of(false);
      })
    );
  }


  private updateNetworkStatus(isOnline: boolean, responseTime: number, failedAttempts: number): void {
    const status: NetworkStatus = {
      isOnline,
      apiUrl: this.currentApiUrl,
      responseTime,
      lastCheck: new Date(),
      failedAttempts
    };

    this.networkStatusSubject.next(status);
  }


  private startNetworkMonitoring(): void {

    this.checkNetworkConnectivity().subscribe();


    timer(this.checkInterval, this.checkInterval).pipe(
      switchMap(() => this.checkNetworkConnectivity())
    ).subscribe();
  }


  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Conexión a internet restaurada');
      this.checkNetworkConnectivity().subscribe();
    });

    window.addEventListener('offline', () => {
      console.log('❌ Conexión a internet perdida');
      this.updateNetworkStatus(false, 0, this.maxFailedAttempts);
    });


    window.addEventListener('focus', () => {
      this.checkNetworkConnectivity().subscribe();
    });
  }


  forceReconnect(): Observable<boolean> {
    console.log('🔄 Forzando reconexión...');
    return this.checkNetworkConnectivity();
  }


  getNetworkStatus(): NetworkStatus {
    return this.networkStatusSubject.value;
  }


  isNetworkAvailable(): boolean {
    const status = this.networkStatusSubject.value;
    return status.isOnline && status.failedAttempts < this.maxFailedAttempts;
  }
}