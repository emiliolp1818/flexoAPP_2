import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    console.log('🔐 Interceptor - URL:', req.url);
    console.log('🔐 Interceptor - Tiene token:', !!token);
    console.log('🔐 Interceptor - Token (primeros 20 chars):', token?.substring(0, 20));
    
    // Si hay token y la petición es a la API, agregar el header de autorización
    if (token && req.url.includes('/api/')) {
      console.log('✅ Agregando header Authorization a la petición');
      
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📤 Headers de la petición:', authReq.headers.keys());
      
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Error en petición autenticada:', error.status, error.statusText);
          
          // Si el token ha expirado (401), cerrar sesión
          if (error.status === 401) {
            console.error('🔒 Token rechazado por el servidor, cerrando sesión...');
            this.authService.logout();
          }
          return throwError(() => error);
        })
      );
    }
    
    console.log('⚠️ Petición sin autenticación (no tiene token o no es a /api/)');
    return next.handle(req);
  }
}