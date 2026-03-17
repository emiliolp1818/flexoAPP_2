
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


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


export interface UserAverageTime {
  userId: number;
  userCode: string;
  userName: string;
  averageTime: number;
  totalChanges: number;
  minTime: number;
  maxTime: number;
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
    readyOrders: 0,
    readyToday: 0,
    totalDesigns: 0,
    newDesignsThisWeek: 0,
    averageSetupTime: 0,
    totalSetupChanges: 0
  });


  constructor(private http: HttpClient) {}


  getDashboardStats(): Observable<DashboardStats> {






    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`)
      .pipe(

        catchError(() => {

          const mockStats: DashboardStats = {
            totalUsers: 0,
            newUsersThisMonth: 0,
            readyOrders: 0,
            readyToday: 0,
            totalDesigns: 0,
            newDesignsThisWeek: 0,
            averageSetupTime: 0,
            totalSetupChanges: 0
          };

          return of(mockStats);
        })
      );
  }


  getUserStats(): Observable<UserStats> {

    return this.http.get<UserStats>(`${environment.apiUrl}/users/stats`)
      .pipe(

        catchError(() => {

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


  getOrderStats(): Observable<OrderStats> {

    return this.http.get<OrderStats>(`${environment.apiUrl}/orders/stats`)
      .pipe(

        catchError(() => {

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


  getDesignStats(): Observable<DesignStats> {

    return this.http.get<DesignStats>(`${environment.apiUrl}/designs/stats`)
      .pipe(

        catchError(() => {

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


  getAllStats(): Observable<{
    dashboard: DashboardStats;
    users: UserStats;
    orders: OrderStats;
    designs: DesignStats;
  }> {

    return this.http.get<any>(`${environment.apiUrl}/dashboard/all-stats`)
      .pipe(

        catchError(() => {

          return of({
            dashboard: {
              totalUsers: 25,
              newUsersThisMonth: 3,
              readyOrders: 12,
              readyToday: 2,
              totalDesigns: 45,
              newDesignsThisWeek: 7,
              averageSetupTime: 45,
              totalSetupChanges: 156
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


  getCurrentStats() {
    return this.dashboardStats();
  }


  updateStats(stats: DashboardStats): void {
    this.dashboardStats.set(stats);
  }


  getAverageTimeByUser(): Observable<UserAverageTime[]> {
    return this.http.get<UserAverageTime[]>(`${environment.apiUrl}/dashboard/average-time-by-user`)
      .pipe(
        catchError(() => {

          return of([]);
        })
      );
  }
}
