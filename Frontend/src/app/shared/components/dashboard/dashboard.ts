import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


import { HeaderComponent } from '../header/header';


import { AuthService, User } from '../../../core/services/auth.service';
import { DashboardService, DashboardStats, UserAverageTime } from '../../../core/services/dashboard.service';

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

  currentUser = signal<User | null>(null);
  isLoading = signal(true);



  systemStats = signal<DashboardStats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    readyOrders: 0,
    readyToday: 0,
    totalDesigns: 0,
    newDesignsThisWeek: 0,
    averageSetupTime: 0,
    totalSetupChanges: 0
  });


  userAverageTimes = signal<UserAverageTime[]>([]);

  constructor(
    private router: Router,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {

    this.loadSystemStats();

    this.loadUserAverageTimes();
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


  private loadUserAverageTimes(): void {
    console.log('⏱️ Cargando tiempos promedio por usuario...');

    this.dashboardService.getAverageTimeByUser().subscribe({
      next: (times) => {
        console.log('✅ Tiempos promedio cargados:', times);
        this.userAverageTimes.set(times);
      },
      error: (error) => {
        console.error('❌ Error cargando tiempos promedio:', error);
      }
    });
  }


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

  navigateToConsultaPedidos(): void {
    this.router.navigate(['/consulta-pedidos']);
  }


  canManageSettings(): boolean {

    return true;
  }


  getFormattedSetupTime(): string {
    const minutes = this.systemStats().averageSetupTime;

    if (minutes >= 60) {
      const hours = (minutes / 60).toFixed(1);
      return `${hours} h`;
    }

    return `${minutes} min`;
  }
}