import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, switchMap, tap } from 'rxjs/operators';
import { NetworkStabilityService } from '../services/network-stability.service';

@Injectable()
export class NetworkStabilityInterceptor implements HttpInterceptor {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(private networkService: NetworkStabilityService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const currentApiUrl = this.networkService.getCurrentApiUrl();
    let modifiedReq = req;


    if (req.url.includes('/api/')) {
      const endpoint = req.url.split('/api/')[1];
      modifiedReq = req.clone({
        url: `${currentApiUrl}/${endpoint}`
      });
    }

    return next.handle(modifiedReq).pipe(
      retry({
        count: this.maxRetries,
        delay: (error: HttpErrorResponse, retryCount: number) => {

          if (this.shouldRetry(error)) {
            console.warn(`🔄 Reintentando request (${retryCount}/${this.maxRetries}):`, error.message);


            const delay = this.retryDelay * Math.pow(2, retryCount - 1);
            return timer(delay);
          }


          return throwError(() => error);
        }
      }),
      catchError((error: HttpErrorResponse) => {

        if (this.isNetworkError(error)) {
          console.warn('🌐 Error de red detectado, intentando reconexión...');

          return this.networkService.forceReconnect().pipe(
            switchMap((reconnected) => {
              if (reconnected) {

                const newApiUrl = this.networkService.getCurrentApiUrl();
                let retryReq = req;

                if (req.url.includes('/api/')) {
                  const endpoint = req.url.split('/api/')[1];
                  retryReq = req.clone({
                    url: `${newApiUrl}/${endpoint}`
                  });
                }

                console.log('✅ Reintentando con nueva URL:', newApiUrl);
                return next.handle(retryReq);
              } else {
                console.error('❌ No se pudo reconectar');
                return throwError(() => error);
              }
            }),
            catchError((retryError) => {
              console.error('❌ Error en reintento:', retryError);
              return throwError(() => retryError);
            })
          );
        }


        return throwError(() => error);
      })
    );
  }


  private shouldRetry(error: HttpErrorResponse): boolean {

    return error.status === 0 || (error.status >= 500 && error.status < 600);
  }


  private isNetworkError(error: HttpErrorResponse): boolean {
    return error.status === 0 ||
           error.message.includes('net::') ||
           error.message.includes('NetworkError') ||
           error.message.includes('fetch');
  }
}