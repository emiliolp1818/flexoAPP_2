import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private currentTheme = signal<Theme>('light');


  public effectiveTheme = signal<'light' | 'dark'>('light');


  private readonly THEME_KEY = 'flexoapp_theme';

  constructor(private http: HttpClient) {

    this.loadSavedTheme();


    this.setupSystemThemeListener();


    effect(() => {
      this.applyTheme(this.effectiveTheme());
    });
  }


  getTheme(): Theme {
    return this.currentTheme();
  }


  setTheme(theme: Theme): void {
    console.log(`🎨 Cambiando tema a: ${theme}`);
    this.currentTheme.set(theme);


    localStorage.setItem(this.THEME_KEY, theme);


    this.updateEffectiveTheme();
  }


  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      this.currentTheme.set(savedTheme);
      console.log(`✅ Tema cargado desde localStorage: ${savedTheme}`);
    } else {

      this.currentTheme.set('light');
      console.log(`ℹ️ Usando tema por defecto: light`);
    }

    this.updateEffectiveTheme();
  }


  private updateEffectiveTheme(): void {
    const theme = this.currentTheme();

    if (theme === 'auto') {

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.effectiveTheme.set(prefersDark ? 'dark' : 'light');
      console.log(`🔄 Tema automático detectado: ${prefersDark ? 'dark' : 'light'}`);
    } else {
      this.effectiveTheme.set(theme);
    }
  }


  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (e) => {

      if (this.currentTheme() === 'auto') {
        this.effectiveTheme.set(e.matches ? 'dark' : 'light');
        console.log(`🔄 Tema del sistema cambió a: ${e.matches ? 'dark' : 'light'}`);
      }
    });
  }


  private applyTheme(theme: 'light' | 'dark'): void {
    const body = document.body;


    body.classList.remove('theme-light', 'theme-dark');


    body.classList.add(`theme-${theme}`);


    body.setAttribute('data-theme', theme);

    console.log(`✅ Tema aplicado: ${theme}`);
  }


  async syncWithSystemConfig(configTheme: string): Promise<void> {
    const theme = configTheme as Theme;
    if (['light', 'dark', 'auto'].includes(theme)) {
      this.setTheme(theme);
    }
  }


  getEffectiveTheme(): 'light' | 'dark' {
    return this.effectiveTheme();
  }


  isDarkTheme(): boolean {
    return this.effectiveTheme() === 'dark';
  }


  isLightTheme(): boolean {
    return this.effectiveTheme() === 'light';
  }
}
