import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Components
import { HeaderComponent } from '../header/header';

// Services
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    HeaderComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  // Signal reactivo que almacena las estadísticas del sistema
  // Se actualiza cuando se cargan los datos desde el servicio
  systemStats = signal<DashboardStats>({
    totalUsers: 0,              // Número total de usuarios registrados en el sistema
    newUsersThisMonth: 0,       // Usuarios nuevos registrados este mes
    readyOrders: 0,             // Órdenes en estado "Listo" del módulo de máquinas
    readyToday: 0,              // Órdenes que pasaron a "Listo" hoy
    totalDesigns: 0,            // Diseños totales registrados en el sistema
    newDesignsThisWeek: 0,      // Diseños creados en la última semana
    averageSetupTime: 0,        // Tiempo promedio de cambio de "Preparando" a "Listo" (minutos)
    totalSetupChanges: 0        // Total de cambios de preparación realizados
  });

  isLoading = signal(true);

  constructor(
    private router: Router,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    // Cargar estadísticas del sistema
    this.loadSystemStats();
  }

  /**
   * Cargar estadísticas del sistema desde el servicio
   * Se ejecuta al inicializar el componente
   */
  private loadSystemStats(): void {
    // Log para debugging - indica que se están cargando las estadísticas
    console.log('📊 Cargando estadísticas del dashboard...');
    
    // Activar el indicador de carga para mostrar spinner en la UI
    this.isLoading.set(true);

    // Suscribirse al Observable que devuelve las estadísticas del dashboard
    this.dashboardService.getDashboardStats().subscribe({
      // Callback ejecutado cuando la petición es exitosa
      next: (stats) => {
        // Log para debugging - muestra las estadísticas recibidas
        console.log('✅ Estadísticas cargadas:', stats);
        
        // Actualizar el signal con las estadísticas recibidas del backend
        this.systemStats.set(stats);
        
        // Desactivar el indicador de carga
        this.isLoading.set(false);
      },
      // Callback ejecutado cuando ocurre un error en la petición
      error: (error) => {
        // Log de error para debugging
        console.error('❌ Error cargando estadísticas:', error);
        
        // Desactivar el indicador de carga incluso si hay error
        this.isLoading.set(false);
      }
    });
  }

  // Navigation methods
  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  navigateToReports(): void {
    this.router.navigate(['/reports']);
  }

  navigateToMachines(): void {
    this.router.navigate(['/machines']);
  }

  navigateToDesign(): void {
    this.router.navigate(['/design']);
  }

  navigateToDocumento(): void {
    this.router.navigate(['/documents']);
  }

  navigateToInformacion(): void {
    this.router.navigate(['/information']);
  }

  navigateToCondicionUnica(): void {
    this.router.navigate(['/condicion-unica']);
  }

  // Permission check - ACCESO COMPLETO PARA TODOS LOS USUARIOS
  canManageSettings(): boolean {
    // TODOS los usuarios pueden acceder a configuraciones
    return true;
  }
}