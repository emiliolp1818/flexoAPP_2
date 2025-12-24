import { Injectable, signal } from '@angular/core';

export type TimeFormat = '12h' | '24h';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

@Injectable({
  providedIn: 'root'
})
export class TimeFormatService {
  // Señales reactivas para las configuraciones regionales
  private currentFormat = signal<TimeFormat>('24h');
  private currentDateFormat = signal<DateFormat>('DD/MM/YYYY');
  private currentTimezone = signal<string>('America/Bogota');

  // Keys para localStorage
  private readonly FORMAT_KEY = 'flexoapp_time_format';
  private readonly DATE_FORMAT_KEY = 'flexoapp_date_format';
  private readonly TIMEZONE_KEY = 'flexoapp_timezone';

  constructor() {
    // Cargar configuraciones guardadas al iniciar
    this.loadSavedConfigs();
  }

  /**
   * Obtener el formato de hora actual
   */
  getFormat(): TimeFormat {
    return this.currentFormat();
  }

  /**
   * Establecer un nuevo formato de hora
   */
  setFormat(format: TimeFormat): void {
    console.log(`🕐 Cambiando formato de hora a: ${format}`);
    this.currentFormat.set(format);
    localStorage.setItem(this.FORMAT_KEY, format);
  }

  /**
   * Obtener el formato de fecha actual
   */
  getDateFormat(): DateFormat {
    return this.currentDateFormat();
  }

  /**
   * Establecer un nuevo formato de fecha
   */
  setDateFormat(format: DateFormat): void {
    console.log(`📅 Cambiando formato de fecha a: ${format}`);
    this.currentDateFormat.set(format);
    localStorage.setItem(this.DATE_FORMAT_KEY, format);
  }

  /**
   * Obtener la zona horaria actual
   */
  getTimezone(): string {
    return this.currentTimezone();
  }

  /**
   * Establecer una nueva zona horaria
   */
  setTimezone(timezone: string): void {
    console.log(`🌐 Cambiando zona horaria a: ${timezone}`);
    this.currentTimezone.set(timezone);
    localStorage.setItem(this.TIMEZONE_KEY, timezone);
  }


  /**
   * Cargar configuraciones guardadas del localStorage
   */
  private loadSavedConfigs(): void {
    const savedFormat = localStorage.getItem(this.FORMAT_KEY) as TimeFormat;
    if (savedFormat && ['12h', '24h'].includes(savedFormat)) {
      this.currentFormat.set(savedFormat);
    }

    const savedDateFormat = localStorage.getItem(this.DATE_FORMAT_KEY) as DateFormat;
    if (savedDateFormat && ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(savedDateFormat)) {
      this.currentDateFormat.set(savedDateFormat);
    }

    const savedTimezone = localStorage.getItem(this.TIMEZONE_KEY);
    if (savedTimezone) {
      this.currentTimezone.set(savedTimezone);
    }
  }

  /**
   * Formatear hora según el formato actual
   */
  formatTime(date: Date = new Date()): string {
    const format = this.currentFormat();

    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: format === '12h',
      timeZone: this.currentTimezone()
    };

    return new Intl.DateTimeFormat('es-ES', options).format(date);
  }

  /**
   * Formatear fecha según el formato actual
   */
  formatDate(date: Date = new Date()): string {
    const format = this.currentDateFormat();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`;
    }
  }


  /**
   * Sincronizar formato con la configuración del sistema
   */
  async syncWithSystemConfig(id: string, value: any): Promise<void> {
    switch (id) {
      case 'time_format':
        this.setFormat(value as TimeFormat);
        break;
      case 'date_format':
        this.setDateFormat(value as DateFormat);
        break;
      case 'timezone':
        this.setTimezone(value as string);
        break;
    }
  }

  /**
   * Sincronizar todas las configuraciones con los datos del sistema
   */
  syncAll(configs: any[]): void {
    configs.forEach(config => {
      this.syncWithSystemConfig(config.id, config.value);
    });
  }
}
