import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);


  private notificationsEnabled = signal<boolean>(true);
  private soundEnabled = signal<boolean>(true);
  private notificationDuration = signal<number>(5);

  constructor() {
    this.loadNotificationSettings();
  }


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


  areNotificationsEnabled(): boolean {
    return this.notificationsEnabled();
  }


  setNotificationsEnabled(enabled: boolean) {
    this.notificationsEnabled.set(enabled);
  }


  syncWithSystemConfig(enabled: boolean) {
    this.notificationsEnabled.set(enabled);
  }


  syncSoundWithSystemConfig(enabled: boolean) {
    this.soundEnabled.set(enabled);
  }


  syncDurationWithSystemConfig(duration: number) {
    this.notificationDuration.set(duration);
  }


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


  private playNotificationSound(type: 'success' | 'error' | 'info' | 'warning') {
    try {
      const audio = new Audio();


      switch (type) {
        case 'success':

          this.playTone(523.25, 0.1, 0.3);
          break;
        case 'error':

          this.playTone(261.63, 0.2, 0.5);
          break;
        case 'info':

          this.playTone(392.00, 0.1, 0.3);
          break;
        case 'warning':

          this.playTone(349.23, 0.15, 0.4);
          break;
      }
    } catch (error) {
      console.warn('No se pudo reproducir el sonido de notificación');
    }
  }


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
