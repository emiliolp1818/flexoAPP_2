import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token de autenticación
    const token = this.authService.getToken();
    
    // Si hay token y la petición es a la API, agregar el header de autorización
    if (token && req.url.includes('/api/')) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si el token ha expirado (401), cerrar sesión
          if (error.status === 401) {
            console.warn('🔐 Token expirado, cerrando sesión...');
            this.authService.logout();
          }
          return throwError(() => error);
        })
      );
    }
    
    // Si no hay token o no es una petición a la API, continuar sin modificar
    return next.handle(req);
  }
}