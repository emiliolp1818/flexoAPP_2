import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Señal reactiva para el tema actual
  private currentTheme = signal<Theme>('light');
  
  // Señal para el tema efectivo (resuelve 'auto' a 'light' o 'dark')
  public effectiveTheme = signal<'light' | 'dark'>('light');

  // Key para localStorage
  private readonly THEME_KEY = 'flexoapp_theme';

  constructor(private http: HttpClient) {
    // Cargar tema guardado al iniciar
    this.loadSavedTheme();
    
    // Escuchar cambios en el tema del sistema operativo
    this.setupSystemThemeListener();
    
    // Efecto para aplicar el tema cuando cambie
    effect(() => {
      this.applyTheme(this.effectiveTheme());
    });
  }

  /**
   * Obtener el tema actual
   */
  getTheme(): Theme {
    return this.currentTheme();
  }

  /**
   * Establecer un nuevo tema
   */
  setTheme(theme: Theme): void {
    console.log(`🎨 Cambiando tema a: ${theme}`);
    this.currentTheme.set(theme);
    
    // Guardar en localStorage
    localStorage.setItem(this.THEME_KEY, theme);
    
    // Actualizar tema efectivo
    this.updateEffectiveTheme();
  }

  /**
   * Cargar tema guardado del localStorage
   */
  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      this.currentTheme.set(savedTheme);
      console.log(`✅ Tema cargado desde localStorage: ${savedTheme}`);
    } else {
      // Por defecto usar 'light'
      this.currentTheme.set('light');
      console.log(`ℹ️ Usando tema por defecto: light`);
    }
    
    this.updateEffectiveTheme();
  }

  /**
   * Actualizar el tema efectivo basado en el tema actual
   */
  private updateEffectiveTheme(): void {
    const theme = this.currentTheme();
    
    if (theme === 'auto') {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.effectiveTheme.set(prefersDark ? 'dark' : 'light');
      console.log(`🔄 Tema automático detectado: ${prefersDark ? 'dark' : 'light'}`);
    } else {
      this.effectiveTheme.set(theme);
    }
  }

  /**
   * Configurar listener para cambios en el tema del sistema
   */
  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Solo actualizar si el tema está en 'auto'
      if (this.currentTheme() === 'auto') {
        this.effectiveTheme.set(e.matches ? 'dark' : 'light');
        console.log(`🔄 Tema del sistema cambió a: ${e.matches ? 'dark' : 'light'}`);
      }
    });
  }

  /**
   * Aplicar el tema al documento
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    const body = document.body;
    
    // Remover clases de tema anteriores
    body.classList.remove('theme-light', 'theme-dark');
    
    // Agregar clase del nuevo tema
    body.classList.add(`theme-${theme}`);
    
    // Actualizar atributo data-theme para CSS
    body.setAttribute('data-theme', theme);
    
    console.log(`✅ Tema aplicado: ${theme}`);
  }

  /**
   * Sincronizar tema con la configuración del sistema
   */
  async syncWithSystemConfig(configTheme: string): Promise<void> {
    const theme = configTheme as Theme;
    if (['light', 'dark', 'auto'].includes(theme)) {
      this.setTheme(theme);
    }
  }

  /**
   * Obtener el tema efectivo actual
   */
  getEffectiveTheme(): 'light' | 'dark' {
    return this.effectiveTheme();
  }

  /**
   * Verificar si el tema actual es oscuro
   */
  isDarkTheme(): boolean {
    return this.effectiveTheme() === 'dark';
  }

  /**
   * Verificar si el tema actual es claro
   */
  isLightTheme(): boolean {
    return this.effectiveTheme() === 'light';
  }
}
