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
  systemStats = signal<DashboardStats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeOrders: 0,
    ordersToday: 0,
    totalDesigns: 0,
    newDesignsThisWeek: 0
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

  private loadSystemStats(): void {
    console.log('📊 Cargando estadísticas del dashboard...');
    this.isLoading.set(true);

    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        console.log('✅ Estadísticas cargadas:', stats);
        this.systemStats.set(stats);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando estadísticas:', error);
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

  // Permission check - ACCESO COMPLETO PARA TODOS LOS USUARIOS
  canManageSettings(): boolean {
    // TODOS los usuarios pueden acceder a configuraciones
    return true;
  }
}