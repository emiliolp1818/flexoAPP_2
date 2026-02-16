import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Servicio de Notificaciones
 * Gestiona las notificaciones del sistema con configuración persistente
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  // Estado de las notificaciones
  private notificationsEnabled = signal<boolean>(true);
  private soundEnabled = signal<boolean>(true);
  private notificationDuration = signal<number>(5);

  constructor() {
    this.loadNotificationSettings();
  }

  /**
   * Cargar configuración de notificaciones desde el backend
   */
  private async loadNotificationSettings() {
    try {
      const configs = await this.http.get<any[]>(`${environment.apiUrl}/system/configs`).toPromise() || [];

      if (configs) {
        const enabledConfig = configs.find(c => c.id === 'enable_notifications');
        const soundConfig = configs.find(c => c.id === 'notification_sound');
        const durationConfig = configs.find(c => c.id === 'notification_duration');

        if (enabledConfig) this.notificationsEnabled.set(enabledConfig.value);
        if (soundConfig) this.soundEnabled.set(soundConfig.value);
        if (durationConfig) this.notificationDuration.set(durationConfig.value);
      }
    } catch (error) {
      console.warn('No se pudieron cargar las configuraciones de notificaciones, usando valores por defecto');
    }
  }

  /**
   * Verificar si las notificaciones están habilitadas
   */
  areNotificationsEnabled(): boolean {
    return this.notificationsEnabled();
  }

  /**
   * Habilitar o deshabilitar notificaciones
   */
  setNotificationsEnabled(enabled: boolean) {
    this.notificationsEnabled.set(enabled);
  }

  /**
   * Sincronizar con configuración del sistema
   */
  syncWithSystemConfig(enabled: boolean) {
    this.notificationsEnabled.set(enabled);
  }

  /**
   * Sincronizar sonido con configuración del sistema
   */
  syncSoundWithSystemConfig(enabled: boolean) {
    this.soundEnabled.set(enabled);
  }

  /**
   * Sincronizar duración con configuración del sistema
   */
  syncDurationWithSystemConfig(duration: number) {
    this.notificationDuration.set(duration);
  }

  /**
   * Mostrar notificación de éxito
   */
  showSuccess(message: string, action: string = 'Cerrar') {
    if (!this.notificationsEnabled()) return;

    if (this.soundEnabled()) {
      this.playNotificationSound('success');
    }

    this.snackBar.open(message, action, {
      duration: this.notificationDuration() * 1000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Mostrar notificación de error
   */
  showError(message: string, action: string = 'Cerrar') {
    if (!this.notificationsEnabled()) return;

    if (this.soundEnabled()) {
      this.playNotificationSound('error');
    }

    this.snackBar.open(message, action, {
      duration: this.notificationDuration() * 1000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Mostrar notificación de información
   */
  showInfo(message: string, action: string = 'Cerrar') {
    if (!this.notificationsEnabled()) return;

    if (this.soundEnabled()) {
      this.playNotificationSound('info');
    }

    this.snackBar.open(message, action, {
      duration: this.notificationDuration() * 1000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Mostrar notificación de advertencia
   */
  showWarning(message: string, action: string = 'Cerrar') {
    if (!this.notificationsEnabled()) return;

    if (this.soundEnabled()) {
      this.playNotificationSound('warning');
    }

    this.snackBar.open(message, action, {
      duration: this.notificationDuration() * 1000,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Reproducir sonido de notificación
   */
  private playNotificationSound(type: 'success' | 'error' | 'info' | 'warning') {
    try {
      const audio = new Audio();

      // Usar diferentes tonos según el tipo de notificación
      switch (type) {
        case 'success':
          // Tono agradable para éxito (Do mayor)
          this.playTone(523.25, 0.1, 0.3);
          break;
        case 'error':
          // Tono grave para error (Do grave)
          this.playTone(261.63, 0.2, 0.5);
          break;
        case 'info':
          // Tono neutral para información (Sol)
          this.playTone(392.00, 0.1, 0.3);
          break;
        case 'warning':
          // Tono de advertencia (Fa)
          this.playTone(349.23, 0.15, 0.4);
          break;
      }
    } catch (error) {
      console.warn('No se pudo reproducir el sonido de notificación');
    }
  }

  /**
   * Reproducir un tono usando Web Audio API
   */
  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Web Audio API no disponible');
    }
  }
}
