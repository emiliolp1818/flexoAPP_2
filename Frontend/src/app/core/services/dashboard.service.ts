import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  activeOrders: number;
  ordersToday: number;
  totalDesigns: number;
  newDesignsThisWeek: number;
}

export interface UserStats {
  total: number;
  active: number;
  newThisMonth: number;
  byRole: { [key: string]: number };
}

export interface OrderStats {
  active: number;
  completed: number;
  pending: number;
  today: number;
}

export interface DesignStats {
  total: number;
  active: number;
  newThisWeek: number;
  byCategory: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dashboardStats = signal<DashboardStats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeOrders: 0,
    ordersToday: 0,
    totalDesigns: 0,
    newDesignsThisWeek: 0
  });

  constructor(private http: HttpClient) {}

  /**
   * Obtener estadísticas generales del dashboard
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`)
      .pipe(
        catchError(() => {
          // Datos de ejemplo si falla la API
          const mockStats: DashboardStats = {
            totalUsers: 25,
            newUsersThisMonth: 3,
            activeOrders: 12,
            ordersToday: 2,
            totalDesigns: 45,
            newDesignsThisWeek: 7
          };
          return of(mockStats);
        })
      );
  }

  /**
   * Obtener estadísticas detalladas de usuarios
   */
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${environment.apiUrl}/users/stats`)
      .pipe(
        catchError(() => {
          // Datos de ejemplo si falla la API
          const mockUserStats: UserStats = {
            total: 25,
            active: 23,
            newThisMonth: 3,
            byRole: {
              'Admin': 2,
              'Supervisor': 5,
              'Operator': 12,
              'User': 6
            }
          };
          return of(mockUserStats);
        })
      );
  }

  /**
   * Obtener estadísticas de órdenes
   */
  getOrderStats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${environment.apiUrl}/orders/stats`)
      .pipe(
        catchError(() => {
          // Datos de ejemplo si falla la API
          const mockOrderStats: OrderStats = {
            active: 12,
            completed: 156,
            pending: 8,
            today: 2
          };
          return of(mockOrderStats);
        })
      );
  }

  /**
   * Obtener estadísticas de diseños
   */
  getDesignStats(): Observable<DesignStats> {
    return this.http.get<DesignStats>(`${environment.apiUrl}/designs/stats`)
      .pipe(
        catchError(() => {
          // Datos de ejemplo si falla la API
          const mockDesignStats: DesignStats = {
            total: 45,
            active: 12,
            newThisWeek: 7,
            byCategory: {
              'Etiquetas': 18,
              'Empaques': 15,
              'Bolsas': 12
            }
          };
          return of(mockDesignStats);
        })
      );
  }

  /**
   * Obtener todas las estadísticas de una vez
   */
  getAllStats(): Observable<{
    dashboard: DashboardStats;
    users: UserStats;
    orders: OrderStats;
    designs: DesignStats;
  }> {
    // En una implementación real, esto podría ser una sola llamada a la API
    return this.http.get<any>(`${environment.apiUrl}/dashboard/all-stats`)
      .pipe(
        catchError(() => {
          // Datos de ejemplo combinados
          return of({
            dashboard: {
              totalUsers: 25,
              newUsersThisMonth: 3,
              activeOrders: 12,
              ordersToday: 2,
              totalDesigns: 45,
              newDesignsThisWeek: 7
            },
            users: {
              total: 25,
              active: 23,
              newThisMonth: 3,
              byRole: {
                'Admin': 2,
                'Supervisor': 5,
                'Operator': 12,
                'User': 6
              }
            },
            orders: {
              active: 12,
              completed: 156,
              pending: 8,
              today: 2
            },
            designs: {
              total: 45,
              active: 12,
              newThisWeek: 7,
              byCategory: {
                'Etiquetas': 18,
                'Empaques': 15,
                'Bolsas': 12
              }
            }
          });
        })
      );
  }

  /**
   * Signal para acceder a las estadísticas actuales
   */
  getCurrentStats() {
    return this.dashboardStats();
  }

  /**
   * Actualizar las estadísticas en el signal
   */
  updateStats(stats: DashboardStats): void {
    this.dashboardStats.set(stats);
  }
}