import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  profileImage?: string;
  profileImageUrl?: string;
  phone?: string;
  permissions?: string[];
  createdAt?: string;
  lastLogin?: string;
}

export interface LoginRequest {
  userCode: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
  success?: boolean; // Opcional para compatibilidad
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly TOKEN_KEY = 'flexoapp_token';
  private readonly USER_KEY = 'flexoapp_user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.tryLoginWithFallback(credentials, 0);
  }

  /**
   * Intentar login con URLs de respaldo
   */
  private tryLoginWithFallback(credentials: LoginRequest, urlIndex: number): Observable<LoginResponse> {
    const fallbackUrls = environment.fallbackUrls || [];
    const urls = [environment.apiUrl, ...fallbackUrls];
    
    if (urlIndex >= urls.length) {
      return throwError(() => new Error('No se pudo conectar con el servidor. Verifique su conexión de red.'));
    }

    const currentUrl = urls[urlIndex];
    console.log(`🔄 Intentando conexión con: ${currentUrl}`);

    return this.http.post<LoginResponse>(`${currentUrl}/auth/login`, credentials).pipe(
      tap(response => {
        console.log(`✅ Conexión exitosa con: ${currentUrl}`);
        if (response.token && response.user) {
          this.setSession(response.token, response.user);
        }
      }),
      catchError(error => {
        console.warn(`⚠️ Error con ${currentUrl}:`, error.message || error);
        
        // Si es un error de red, intentar con la siguiente URL
        if (error.status === 0 || error.status >= 500 || error.name === 'TimeoutError') {
          return this.tryLoginWithFallback(credentials, urlIndex + 1);
        }
        
        // Si es un error de autenticación (400, 401), no intentar otras URLs
        return throwError(() => error);
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Verificar si el usuario está logueado
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Validar sesión actual
   */
  validateSession(): Observable<boolean> {
    if (!this.isLoggedIn()) {
      this.logout();
      return throwError(() => new Error('Sesión expirada'));
    }

    // Use local token validation instead of calling non-existent endpoint
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      return of(true);
    } else {
      this.logout();
      return throwError(() => new Error('Sesión inválida'));
    }
  }

  /**
   * Refrescar token
   */
  refreshToken(): Observable<LoginResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, { token })
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            this.setSession(response.token, response.user);
          }
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Establecer sesión
   */
  private setSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Limpiar sesión
   */
  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Cargar usuario almacenado
   */
  private loadStoredUser(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr && !this.isTokenExpired(token)) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.clearSession();
      }
    } else {
      this.clearSession();
    }
  }

  /**
   * Verificar si el token está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Actualizar perfil del usuario
   * Envía los datos actualizados al backend y actualiza el usuario en localStorage
   */
  updateUserProfile(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${userId}`, userData).pipe(
      tap(updatedUser => {
        // Actualizar el usuario en localStorage y en el BehaviorSubject
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          const mergedUser = { ...currentUser, ...updatedUser };
          localStorage.setItem(this.USER_KEY, JSON.stringify(mergedUser));
          this.currentUserSubject.next(mergedUser);
        }
      }),
      catchError(error => {
        console.error('Error actualizando perfil:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar foto de perfil del usuario
   * Envía la imagen al backend y actualiza la URL en el usuario
   */
  updateUserProfileImage(userId: string, imageFile: File): Observable<User> {
    const formData = new FormData();
    formData.append('profileImage', imageFile);

    return this.http.post<User>(`${environment.apiUrl}/users/${userId}/profile-image`, formData).pipe(
      tap(updatedUser => {
        // Actualizar el usuario en localStorage y en el BehaviorSubject
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          const mergedUser = { ...currentUser, ...updatedUser };
          localStorage.setItem(this.USER_KEY, JSON.stringify(mergedUser));
          this.currentUserSubject.next(mergedUser);
        }
      }),
      catchError(error => {
        console.error('Error actualizando foto de perfil:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Eliminar foto de perfil del usuario
   */
  deleteUserProfileImage(userId: string): Observable<User> {
    return this.http.delete<User>(`${environment.apiUrl}/users/${userId}/profile-image`).pipe(
      tap(updatedUser => {
        // Actualizar el usuario en localStorage y en el BehaviorSubject
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          const mergedUser = { ...currentUser, profileImage: undefined, profileImageUrl: undefined };
          localStorage.setItem(this.USER_KEY, JSON.stringify(mergedUser));
          this.currentUserSubject.next(mergedUser);
        }
      }),
      catchError(error => {
        console.error('Error eliminando foto de perfil:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cambiar contraseña del usuario
   * Envía la contraseña actual y la nueva al backend para validación y actualización
   */
  changePassword(userId: string, currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    const passwordData = {
      currentPassword,
      newPassword
    };

    return this.http.put<{ success: boolean; message: string }>(
      `${environment.apiUrl}/users/${userId}/change-password`, 
      passwordData
    ).pipe(
      tap(response => {
        console.log('Contraseña cambiada exitosamente:', response.message);
      }),
      catchError(error => {
        console.error('Error cambiando contraseña:', error);
        return throwError(() => error);
      })
    );
  }
}