import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { NetworkStabilityService } from './network-stability.service';

export interface User {
  id: string;
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  profileImage?: string;
  phone?: string;
  permissions?: string[];
  createdAt?: string;
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
    private router: Router,
    private networkService: NetworkStabilityService
  ) {
    this.loadStoredUser();
  }

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const apiUrl = this.networkService.getCurrentApiUrl();
    return this.http.post<LoginResponse>(`${apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Si tenemos token y user, guardar la sesión
          if (response.token && response.user) {
            this.setSession(response.token, response.user);
          }
        }),
        catchError(error => {
          console.error('❌ Error en login:', error);
          // Intentar reconectar en caso de error de red
          if (error.status === 0 || error.status >= 500) {
            return this.networkService.forceReconnect().pipe(
              switchMap(() => {
                const newApiUrl = this.networkService.getCurrentApiUrl();
                return this.http.post<LoginResponse>(`${newApiUrl}/auth/login`, credentials);
              }),
              tap(response => {
                if (response.token && response.user) {
                  this.setSession(response.token, response.user);
                }
              }),
              catchError(retryError => {
                console.error('❌ Error en reintento de login:', retryError);
                return throwError(() => retryError);
              })
            );
          }
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
}