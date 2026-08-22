import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 60000; // 1 minuto de caché

  constructor(private http: HttpClient) {}

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && (Date.now() - entry.timestamp) < this.cacheTTL) {
      return entry.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

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

  /** Invalida el caché para forzar recarga */
  invalidateCache(): void {
    this.cache.clear();
  }
}
