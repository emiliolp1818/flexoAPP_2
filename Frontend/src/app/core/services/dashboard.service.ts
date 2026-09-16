import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, tap, debounceTime } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SignalRService } from '../../shared/services/signalr.service';

export interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  readyOrders: number;
  readyToday: number;
  totalDesigns: number;
  newDesignsThisWeek: number;
  averageSetupTime: number;
  totalSetupChanges: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private signalR = inject(SignalRService);

  // Caché en memoria + espejo en localStorage (sobrevive a recargas/navegación).
  private cache = new Map<string, { data: any; timestamp: number }>();

  // TTL de respaldo largo: la fuente de verdad para refrescar son los eventos
  // SignalR. El TTL solo evita servir datos indefinidamente si algo falla.
  private cacheTTL = 30 * 60 * 1000; // 30 minutos
  private readonly STORAGE_PREFIX = 'flexoapp_dash_';

  // Emite cuando llega un cambio real (SignalR) que afecta al dashboard.
  // Los componentes se suscriben para recargar solo entonces.
  public dataChanged$ = new Subject<void>();
  private invalidate$ = new Subject<void>();

  constructor() {
    this.hydrateFromStorage();
    this.listenForRealtimeChanges();
  }

  // ── Caché ──────────────────────────────────────────────────
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && (Date.now() - entry.timestamp) < this.cacheTTL) {
      return entry.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    const entry = { data, timestamp: Date.now() };
    this.cache.set(key, entry);
    try {
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // localStorage lleno o no disponible: seguimos con caché en memoria
    }
  }

  // Al arrancar, recupera lo que haya en localStorage (carga instantánea).
  private hydrateFromStorage(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const fullKey = localStorage.key(i);
        if (!fullKey || !fullKey.startsWith(this.STORAGE_PREFIX)) continue;
        const raw = localStorage.getItem(fullKey);
        if (!raw) continue;
        const entry = JSON.parse(raw);
        if (entry && typeof entry.timestamp === 'number') {
          this.cache.set(fullKey.substring(this.STORAGE_PREFIX.length), entry);
        }
      }
    } catch {
      // Ignorar errores de parseo/almacenamiento
    }
  }

  /** Invalida todo el caché para forzar recarga la próxima vez. */
  invalidateCache(): void {
    this.cache.clear();
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.STORAGE_PREFIX)) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
    } catch {
      // Ignorar
    }
  }

  // ── Invalidación por eventos reales (SignalR) ──────────────
  private listenForRealtimeChanges(): void {
    // Debounce: los cambios de estado escriben en Activities de forma
    // fire-and-forget; esperamos un momento para leer datos ya persistidos
    // y también agrupamos ráfagas de eventos en una sola recarga.
    this.invalidate$.pipe(debounceTime(1200)).subscribe(() => {
      this.invalidateCache();
      this.dataChanged$.next();
    });

    // Cambios de estado de máquina (alimentan casi todas las métricas)
    this.signalR.machineUpdated$.subscribe(() => this.invalidate$.next());
    // Importación de Excel (afecta pedidos/producción)
    this.signalR.excelImported$.subscribe(() => this.invalidate$.next());
    // Refresco global explícito
    this.signalR.refreshAll$.subscribe(() => this.invalidate$.next());
  }

  // ── Endpoints ──────────────────────────────────────────────
  getDashboardStats(): Observable<DashboardStats> {
    const cached = this.getCached<DashboardStats>('stats');
    if (cached) return of(cached);
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`)
      .pipe(
        tap(data => this.setCache('stats', data)),
        catchError(() => of({
          totalUsers: 0, newUsersThisMonth: 0, readyOrders: 0, readyToday: 0,
          totalDesigns: 0, newDesignsThisWeek: 0, averageSetupTime: 0, totalSetupChanges: 0
        }))
      );
  }

  getShiftEfficiency(): Observable<any[]> {
    const cached = this.getCached<any[]>('shift');
    if (cached) return of(cached);
    return this.http.get<any[]>(`${environment.apiUrl}/dashboard/shift-efficiency`)
      .pipe(tap(data => this.setCache('shift', data)), catchError(() => of([])));
  }

  getDailyPreparation(): Observable<any[]> {
    const cached = this.getCached<any[]>('daily');
    if (cached) return of(cached);
    return this.http.get<any[]>(`${environment.apiUrl}/dashboard/daily-preparation`)
      .pipe(
        tap(data => this.setCache('daily', data)),
        catchError((err) => { console.error('❌ Service daily-preparation error:', err); return of([]); })
      );
  }

  getWeeklyPreparation(): Observable<any> {
    const cached = this.getCached<any>('weekly');
    if (cached) return of(cached);
    return this.http.get<any>(`${environment.apiUrl}/dashboard/weekly-preparation`)
      .pipe(
        tap(data => this.setCache('weekly', data)),
        catchError((err) => { console.error('❌ Service weekly-preparation error:', err); return of({ month: '', weeks: [] }); })
      );
  }

  getKpiTrends(): Observable<any> {
    const cached = this.getCached<any>('kpi');
    if (cached) return of(cached);
    return this.http.get<any>(`${environment.apiUrl}/dashboard/kpi-trends`)
      .pipe(
        tap(data => this.setCache('kpi', data)),
        catchError(() => of({ setupTrend: [], readyTrend: [], designsTrend: [] }))
      );
  }

  getBestTimeWeek(): Observable<any[]> {
    const cached = this.getCached<any[]>('ranking');
    if (cached) return of(cached);
    return this.http.get<any[]>(`${environment.apiUrl}/dashboard/best-time-week`)
      .pipe(tap(data => this.setCache('ranking', data)), catchError(() => of([])));
  }

  getMonthlyProduction(): Observable<any> {
    const cached = this.getCached<any>('production');
    if (cached) return of(cached);
    return this.http.get<any>(`${environment.apiUrl}/dashboard/monthly-production`)
      .pipe(
        tap(data => this.setCache('production', data)),
        catchError(() => of({ totalKilos: 0, totalMetros: 0, totalPedidos: 0, month: '' }))
      );
  }

  getTopPantones(): Observable<any[]> {
    const cached = this.getCached<any[]>('pantones');
    if (cached) return of(cached);
    return this.http.get<any[]>(`${environment.apiUrl}/dashboard/top-pantones`)
      .pipe(tap(data => this.setCache('pantones', data)), catchError(() => of([])));
  }
}
