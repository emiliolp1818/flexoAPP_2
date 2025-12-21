import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';
import { fromEvent, merge, Subject, timer } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

/**
 * Servicio de Timeout de Sesión
 * Monitorea la actividad del usuario y cierra la sesión automáticamente
 * después de un período de inactividad configurable
 */
@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  private timeoutMinutes = 30; // Valor por defecto
  private warningMinutes = 5; // Advertencia 5 minutos antes
  private timeoutTimer: any;
  private warningTimer: any;
  private destroy$ = new Subject<void>();
  private isActive = false;

  constructor() {
    this.loadTimeoutConfig();
  }

  /**
   * Cargar configuración de timeout desde el backend
   */
  private async loadTimeoutConfig() {
    try {
      const configs = await this.http.get<any[]>(`${environment.apiUrl}/system/configs`).toPromise();
      
      if (configs) {
        const timeoutConfig = configs.find(c => c.id === 'session_timeout');
        if (timeoutConfig && timeoutConfig.value) {
          this.timeoutMinutes = parseInt(timeoutConfig.value, 10);
          console.log(`⏱️ Timeout de sesión configurado: ${this.timeoutMinutes} minutos`);
        }
      }
    } catch (error) {
      console.warn('No se pudo cargar la configuración de timeout, usando valor por defecto:', this.timeoutMinutes);
    }
  }

  /**
   * Iniciar monitoreo de inactividad
   */
  startMonitoring() {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    console.log('🔍 Iniciando monitoreo de inactividad de sesión');

    // Eventos de actividad del usuario
    const userActivity$ = merge(
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'touchstart'),
      fromEvent(document, 'scroll'),
      fromEvent(document, 'mousemove')
    ).pipe(
      debounceTime(1000), // Evitar demasiados eventos
      takeUntil(this.destroy$)
    );

    // Reiniciar timer cuando hay actividad
    userActivity$.subscribe(() => {
      this.resetTimers();
    });

    // Iniciar timers
    this.resetTimers();
  }

  /**
   * Detener monitoreo de inactividad
   */
  stopMonitoring() {
    this.isActive = false;
    this.clearTimers();
    this.destroy$.next();
    console.log('⏹️ Monitoreo de inactividad detenido');
  }

  /**
   * Reiniciar timers de inactividad
   */
  private resetTimers() {
    this.clearTimers();

    // Timer de advertencia (5 minutos antes del timeout)
    const warningTime = (this.timeoutMinutes - this.warningMinutes) * 60 * 1000;
    if (warningTime > 0) {
      this.warningTimer = setTimeout(() => {
        this.showWarning();
      }, warningTime);
    }

    // Timer de timeout
    const timeoutTime = this.timeoutMinutes * 60 * 1000;
    this.timeoutTimer = setTimeout(() => {
      this.handleTimeout();
    }, timeoutTime);
  }

  /**
   * Limpiar timers
   */
  private clearTimers() {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  /**
   * Mostrar advertencia de inactividad
   */
  private showWarning() {
    this.notificationService.showWarning(
      `Tu sesión expirará en ${this.warningMinutes} minutos por inactividad`,
      'Entendido'
    );
    console.log(`⚠️ Advertencia: Sesión expirará en ${this.warningMinutes} minutos`);
  }

  /**
   * Manejar timeout de sesión
   */
  private handleTimeout() {
    console.log('⏰ Sesión expirada por inactividad');
    
    this.notificationService.showInfo(
      'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.',
      'Cerrar'
    );

    // Cerrar sesión
    this.stopMonitoring();
    this.authService.logout();
  }

  /**
   * Actualizar tiempo de timeout
   */
  updateTimeout(minutes: number) {
    this.timeoutMinutes = minutes;
    console.log(`⏱️ Timeout de sesión actualizado: ${this.timeoutMinutes} minutos`);
    
    // Reiniciar timers con el nuevo valor
    if (this.isActive) {
      this.resetTimers();
    }
  }

  /**
   * Obtener tiempo de timeout actual
   */
  getTimeoutMinutes(): number {
    return this.timeoutMinutes;
  }
}
