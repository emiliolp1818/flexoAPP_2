import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  private loadingCount = 0;

  constructor() {}

  /**
   * Mostrar indicador de carga
   */
  show(): void {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  /**
   * Ocultar indicador de carga
   */
  hide(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Obtener estado actual de carga
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Forzar estado de carga
   */
  setLoading(loading: boolean): void {
    this.loadingCount = loading ? 1 : 0;
    this.loadingSubject.next(loading);
  }
}