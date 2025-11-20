// Importaciones necesarias de Angular y RxJS
import { Injectable, signal } from '@angular/core';  // Injectable: decorador para servicios, signal: sistema reactivo
import { HttpClient } from '@angular/common/http';   // HttpClient: para realizar peticiones HTTP
import { Observable, of } from 'rxjs';                // Observable: para programación reactiva, of: crear Observable desde valor
import { map, catchError } from 'rxjs/operators';    // Operadores RxJS para transformar y manejar errores

// Importar configuración de entorno (URLs, configuraciones)
import { environment } from '../../../environments/environment';

// Interfaz que define la estructura de las estadísticas del dashboard
export interface DashboardStats {
  totalUsers: number;              // Número total de usuarios registrados en el sistema
  newUsersThisMonth: number;       // Cantidad de usuarios nuevos registrados este mes
  readyOrders: number;             // Número de órdenes en estado "Listo" del módulo de máquinas
  readyToday: number;              // Cantidad de órdenes que pasaron a "Listo" hoy
  totalDesigns: number;            // Número total de diseños registrados en el sistema
  newDesignsThisWeek: number;      // Cantidad de diseños nuevos esta semana
  averageSetupTime: number;        // Tiempo promedio de cambio de "Preparando" a "Listo" (en minutos)
  totalSetupChanges: number;       // Número total de cambios de preparación realizados
}

// Interfaz para estadísticas detalladas de usuarios
export interface UserStats {
  total: number;                   // Total de usuarios en el sistema
  active: number;                  // Usuarios activos (con sesión reciente)
  newThisMonth: number;            // Usuarios nuevos este mes
  byRole: { [key: string]: number }; // Distribución de usuarios por rol (admin, operator, etc.)
}

// Interfaz para estadísticas de órdenes de trabajo
export interface OrderStats {
  active: number;                  // Órdenes actualmente en proceso
  completed: number;               // Órdenes completadas
  pending: number;                 // Órdenes pendientes de iniciar
  today: number;                   // Órdenes creadas hoy
}

// Interfaz para estadísticas de diseños
export interface DesignStats {
  total: number;                   // Total de diseños en el sistema
  active: number;                  // Diseños activos/en uso
  newThisWeek: number;             // Diseños creados esta semana
  byCategory: { [key: string]: number }; // Distribución por categoría (etiquetas, empaques, etc.)
}

// Decorador Injectable: marca esta clase como un servicio inyectable
// providedIn: 'root' significa que es un singleton disponible en toda la app
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Signal reactivo que almacena las estadísticas del dashboard
  // Se inicializa con valores en 0 hasta que se carguen los datos reales
  private dashboardStats = signal<DashboardStats>({
    totalUsers: 0,              // Inicializar usuarios totales en 0
    newUsersThisMonth: 0,       // Inicializar usuarios nuevos en 0
    readyOrders: 0,             // Inicializar órdenes listas en 0
    readyToday: 0,              // Inicializar órdenes listas hoy en 0
    totalDesigns: 0,            // Inicializar diseños totales en 0
    newDesignsThisWeek: 0,      // Inicializar diseños nuevos en 0
    averageSetupTime: 0,        // Inicializar tiempo promedio en 0
    totalSetupChanges: 0        // Inicializar cambios totales en 0
  });

  // Constructor: inyecta HttpClient para realizar peticiones HTTP
  constructor(private http: HttpClient) {}

  /**
   * Obtener estadísticas generales del dashboard
   * Realiza una petición HTTP GET al endpoint de estadísticas
   * @returns Observable con las estadísticas del dashboard
   */
  getDashboardStats(): Observable<DashboardStats> {
    // Realizar petición HTTP GET al endpoint de estadísticas del dashboard
    // Este endpoint debe calcular:
    // - totalUsers: COUNT de usuarios en la tabla users
    // - readyOrders: COUNT de órdenes con estado "Listo" en machine_programs
    // - totalDesigns: COUNT de diseños en la tabla designs
    // - averageSetupTime: AVG del tiempo entre "Preparando" y "Listo"
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`)
      .pipe(
        // Capturar errores y devolver datos de ejemplo si falla la API
        catchError(() => {
          // Datos de ejemplo (mock) si falla la conexión con el backend
          const mockStats: DashboardStats = {
            totalUsers: 0,               // Se cargará desde la base de datos
            newUsersThisMonth: 0,        // Se cargará desde la base de datos
            readyOrders: 0,              // Se cargará desde machine_programs con estado "Listo"
            readyToday: 0,               // Se cargará desde machine_programs con estado "Listo" de hoy
            totalDesigns: 0,             // Se cargará desde la tabla designs
            newDesignsThisWeek: 0,       // Se cargará desde designs de esta semana
            averageSetupTime: 0,         // Se calculará el promedio de tiempos de preparación
            totalSetupChanges: 0         // Se contarán los cambios de estado
          };
          // Devolver los datos de ejemplo como Observable
          return of(mockStats);
        })
      );
  }

  /**
   * Obtener estadísticas detalladas de usuarios
   * @returns Observable con estadísticas de usuarios
   */
  getUserStats(): Observable<UserStats> {
    // Realizar petición HTTP GET al endpoint de estadísticas de usuarios
    return this.http.get<UserStats>(`${environment.apiUrl}/users/stats`)
      .pipe(
        // Capturar errores y devolver datos de ejemplo
        catchError(() => {
          // Datos de ejemplo si falla la API
          const mockUserStats: UserStats = {
            total: 25,                   // 25 usuarios totales
            active: 23,                  // 23 usuarios activos
            newThisMonth: 3,             // 3 usuarios nuevos este mes
            byRole: {                    // Distribución por rol
              'Admin': 2,                // 2 administradores
              'Supervisor': 5,           // 5 supervisores
              'Operator': 12,            // 12 operarios
              'User': 6                  // 6 usuarios básicos
            }
          };
          // Devolver datos de ejemplo como Observable
          return of(mockUserStats);
        })
      );
  }

  /**
   * Obtener estadísticas de órdenes
   * @returns Observable con estadísticas de órdenes
   */
  getOrderStats(): Observable<OrderStats> {
    // Realizar petición HTTP GET al endpoint de estadísticas de órdenes
    return this.http.get<OrderStats>(`${environment.apiUrl}/orders/stats`)
      .pipe(
        // Capturar errores y devolver datos de ejemplo
        catchError(() => {
          // Datos de ejemplo si falla la API
          const mockOrderStats: OrderStats = {
            active: 12,                  // 12 órdenes activas
            completed: 156,              // 156 órdenes completadas
            pending: 8,                  // 8 órdenes pendientes
            today: 2                     // 2 órdenes creadas hoy
          };
          // Devolver datos de ejemplo como Observable
          return of(mockOrderStats);
        })
      );
  }

  /**
   * Obtener estadísticas de diseños
   * @returns Observable con estadísticas de diseños
   */
  getDesignStats(): Observable<DesignStats> {
    // Realizar petición HTTP GET al endpoint de estadísticas de diseños
    return this.http.get<DesignStats>(`${environment.apiUrl}/designs/stats`)
      .pipe(
        // Capturar errores y devolver datos de ejemplo
        catchError(() => {
          // Datos de ejemplo si falla la API
          const mockDesignStats: DesignStats = {
            total: 45,                   // 45 diseños totales
            active: 12,                  // 12 diseños activos
            newThisWeek: 7,              // 7 diseños nuevos esta semana
            byCategory: {                // Distribución por categoría
              'Etiquetas': 18,           // 18 diseños de etiquetas
              'Empaques': 15,            // 15 diseños de empaques
              'Bolsas': 12               // 12 diseños de bolsas
            }
          };
          // Devolver datos de ejemplo como Observable
          return of(mockDesignStats);
        })
      );
  }

  /**
   * Obtener todas las estadísticas de una vez
   * @returns Observable con todas las estadísticas combinadas
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
        // Capturar errores y devolver datos de ejemplo combinados
        catchError(() => {
          // Datos de ejemplo combinados
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

  /**
   * Signal para acceder a las estadísticas actuales
   * @returns Estadísticas actuales almacenadas en el signal
   */
  getCurrentStats() {
    return this.dashboardStats();
  }

  /**
   * Actualizar las estadísticas en el signal
   * @param stats - Nuevas estadísticas a almacenar
   */
  updateStats(stats: DashboardStats): void {
    this.dashboardStats.set(stats);
  }
}
