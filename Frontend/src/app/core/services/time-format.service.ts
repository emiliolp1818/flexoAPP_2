import { Injectable, signal } from '@angular/core';

export type TimeFormat = '12h' | '24h';

@Injectable({
  providedIn: 'root'
})
export class TimeFormatService {
  // Señal reactiva para el formato de hora actual
  private currentFormat = signal<TimeFormat>('24h');
  
  // Key para localStorage
  private readonly FORMAT_KEY = 'flexoapp_time_format';

  constructor() {
    // Cargar formato guardado al iniciar
    this.loadSavedFormat();
  }

  /**
   * Obtener el formato actual
   */
  getFormat(): TimeFormat {
    return this.currentFormat();
  }

  /**
   * Establecer un nuevo formato
   */
  setFormat(format: TimeFormat): void {
    console.log(`🕐 Cambiando formato de hora a: ${format}`);
    this.currentFormat.set(format);
    
    // Guardar en localStorage
    localStorage.setItem(this.FORMAT_KEY, format);
    
    console.log(`✅ Formato de hora aplicado: ${format}`);
  }

  /**
   * Cargar formato guardado del localStorage
   */
  private loadSavedFormat(): void {
    const savedFormat = localStorage.getItem(this.FORMAT_KEY) as TimeFormat;
    if (savedFormat && ['12h', '24h'].includes(savedFormat)) {
      this.currentFormat.set(savedFormat);
      console.log(`✅ Formato de hora cargado desde localStorage: ${savedFormat}`);
    } else {
      // Por defecto usar 24h
      this.currentFormat.set('24h');
      console.log(`ℹ️ Usando formato de hora por defecto: 24h`);
    }
  }

  /**
   * Formatear hora según el formato actual
   */
  formatTime(date: Date = new Date()): string {
    const format = this.currentFormat();
    
    if (format === '12h') {
      return this.format12Hour(date);
    } else {
      return this.format24Hour(date);
    }
  }

  /**
   * Formatear en formato 12 horas (AM/PM)
   */
  private format12Hour(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 se convierte en 12
    
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    
    return `${hoursStr}:${minutesStr}:${secondsStr} ${ampm}`;
  }

  /**
   * Formatear en formato 24 horas
   */
  private format24Hour(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Sincronizar formato con la configuración del sistema
   */
  async syncWithSystemConfig(configFormat: string): Promise<void> {
    const format = configFormat as TimeFormat;
    if (['12h', '24h'].includes(format)) {
      this.setFormat(format);
    }
  }

  /**
   * Verificar si está en formato 12 horas
   */
  is12HourFormat(): boolean {
    return this.currentFormat() === '12h';
  }

  /**
   * Verificar si está en formato 24 horas
   */
  is24HourFormat(): boolean {
    return this.currentFormat() === '24h';
  }
}
