import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserModule } from '@angular/platform-browser';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

// Interceptor funcional para autenticación
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log('🔐 Interceptor funcional - URL:', req.url);
  console.log('🔐 Interceptor funcional - Tiene token:', !!token);
  
  // Si hay token y la petición es a la API, agregar el header de autorización
  if (token && req.url.includes('/api/')) {
    console.log('✅ Agregando header Authorization a la petición');
    
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('📤 Headers agregados:', authReq.headers.keys());
    
    return next(authReq).pipe(
      catchError((error: any) => {
        console.error('❌ Error en petición autenticada:', error.status, error.statusText);
        
        // Si el token ha expirado (401), cerrar sesión
        if (error.status === 401) {
          console.error('🔒 Token rechazado por el servidor, cerrando sesión...');
          authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
  
  console.log('⚠️ Petición sin autenticación (no tiene token o no es a /api/)');
  return next(req);
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserModule),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
    provideAnimationsAsync()
  ]
};