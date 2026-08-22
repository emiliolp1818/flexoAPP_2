import { Component, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent } from '../header/header';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule, HeaderComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {

  isLoading = signal(true);
  kpiLoading = signal(true);
  productionLoading = signal(true);
  chartsLoading = signal(true);
  rankingLoading = signal(true);
  showCelebration = signal(false);
  celebrationName = signal('');
  celebrationPlace = signal<number>(0);
  systemStats = signal<DashboardStats>({
    totalUsers: 0, newUsersThisMonth: 0, readyOrders: 0, readyToday: 0,
    totalDesigns: 0, newDesignsThisWeek: 0, averageSetupTime: 0, totalSetupChanges: 0
  });
  shiftData = signal<any[]>([]);
  dailyData = signal<any[]>([]);
  setupTrendBars = signal<{value: number, percent: number, day: string, date: string}[]>(Array(7).fill({value: 0, percent: 6, day: '', date: ''}));
  readyTrendBars = signal<{value: number, percent: number, day: string, date: string}[]>(Array(7).fill({value: 0, percent: 6, day: '', date: ''}));
  designsTrendBars = signal<{value: number, percent: number, day: string, date: string}[]>(Array(7).fill({value: 0, percent: 6, day: '', date: ''}));
  bestTimeRanking = signal<any[]>([]);
  monthlyProduction = signal<{totalKilos: number, totalMetros: number, totalPedidos: number, month: string}>({totalKilos: 0, totalMetros: 0, totalPedidos: 0, month: ''});
  topPantones = signal<{name: string, count: number}[]>([]);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Verificar si fue redirigido por falta de permisos
    this.route.queryParams.subscribe(params => {
      if (params['denied']) {
        const moduleNames: Record<string, string> = {
          'machines': 'Máquinas', 'design': 'Diseño', 'reports': 'Reportes',
          'documents': 'Documentos', 'settings': 'Configuración',
          'information': 'Información', 'consulta-pedidos': 'Consulta Pedidos'
        };
        const name = moduleNames[params['denied']] || params['denied'];
        this.snackBar.open(`No tienes permiso para acceder al módulo de ${name}`, 'Cerrar', { duration: 4000 });
        // Limpiar el query param
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });

    this.loadSystemStats();
    this.loadShiftEfficiency();
    this.loadDailyPreparation();
    this.loadKpiTrends();
    this.loadBestTimeWeek();
    this.loadMonthlyProduction();
    this.loadTopPantones();
  }

  private loadSystemStats(): void {
    this.kpiLoading.set(true);
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => { this.systemStats.set(stats); this.kpiLoading.set(false); this.isLoading.set(false); },
      error: () => { this.kpiLoading.set(false); this.isLoading.set(false); }
    });
  }

  private loadShiftEfficiency(): void {
    this.chartsLoading.set(true);
    this.dashboardService.getShiftEfficiency().subscribe({
      next: (data) => { this.shiftData.set(data); this.chartsLoading.set(false); },
      error: () => { this.chartsLoading.set(false); }
    });
  }

  private loadDailyPreparation(): void {
    console.log('📅 Llamando daily-preparation...');
    this.dashboardService.getDailyPreparation().subscribe({
      next: (data) => {
        console.log('📅 Daily preparation recibido:', data);
        this.dailyData.set(data);
      },
      error: (err) => {
        console.error('📅 Error daily-preparation:', err);
      }
    });
  }

  private loadBestTimeWeek(): void {
    this.rankingLoading.set(true);
    this.dashboardService.getBestTimeWeek().subscribe({
      next: (data) => {
        this.bestTimeRanking.set(data);
        this.rankingLoading.set(false);
        this.checkCelebration(data);
      },
      error: () => { this.rankingLoading.set(false); }
    });
  }

  private loadMonthlyProduction(): void {
    this.productionLoading.set(true);
    this.dashboardService.getMonthlyProduction().subscribe({
      next: (data) => { this.monthlyProduction.set(data); this.productionLoading.set(false); },
      error: () => { this.productionLoading.set(false); }
    });
  }

  private loadTopPantones(): void {
    this.dashboardService.getTopPantones().subscribe({
      next: (data) => this.topPantones.set(data),
      error: () => {}
    });
  }

  getPantoneBarColor(index: number): string {
    const colors = ['#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95','#a78bfa','#c4b5fd','#ddd6fe'];
    return colors[index % colors.length];
  }

  todayDate(): string {
    const d = new Date();
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${d.getDate()} ${meses[d.getMonth()]}`;
  }

  private checkCelebration(ranking: any[]): void {
    if (!ranking.length) return;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const sessionKey = 'celebration_shown_this_session';
    const alreadyShown = sessionStorage.getItem(sessionKey);
    if (alreadyShown) return;

    // Buscar en qué puesto está el usuario (top 3)
    const userPlace = ranking.findIndex(r => String(r.userId) === String(currentUser.id));

    if (userPlace >= 0 && userPlace < 3) {
      const firstName = (currentUser.firstName || '').split(' ')[0];
      this.celebrationName.set(firstName);
      this.celebrationPlace.set(userPlace + 1);
      this.showCelebration.set(true);
      sessionStorage.setItem(sessionKey, 'true');
      setTimeout(() => this.closeCelebration(), 6000);
    }
  }

  closeCelebration(): void {
    this.showCelebration.set(false);
  }

  private loadKpiTrends(): void {
    this.dashboardService.getKpiTrends().subscribe({
      next: (data) => {
        this.setupTrendBars.set(this.toBars(data.setupTrend || []));
        this.readyTrendBars.set(this.toBars(data.readyTrend || []));
        this.designsTrendBars.set(this.toBars(data.designsTrend || []));
      },
      error: () => {}
    });
  }

  private toBars(items: any[]): {value: number, percent: number, day: string, date: string}[] {
    if (!items.length) {
      return ['L','M','M','J','V','S','D'].map(d => ({ value: 0, percent: 6, day: d, date: '' }));
    }
    const values = items.map(i => typeof i === 'number' ? i : (i.value || 0));
    const days = items.map(i => typeof i === 'number' ? '' : (i.day || ''));
    const dates = items.map(i => typeof i === 'number' ? '' : (i.date || ''));
    const max = Math.max(...values, 1);
    return values.map((v, idx) => ({
      value: Math.round(v * 10) / 10,
      percent: Math.max((v / max) * 100, 6),
      day: days[idx],
      date: dates[idx]
    }));
  }

  getShiftBarWidth(avgTime: number): number {
    const maxTime = Math.max(...this.shiftData().map(s => s.averageTime), 1);
    return Math.min((avgTime / maxTime) * 100, 100);
  }

  getShiftEfficiencyPct(avgTime: number): number {
    const times = this.shiftData().map(s => s.averageTime).filter(t => t > 0);
    if (!times.length || avgTime === 0) return 0;
    return Math.round((Math.min(...times) / avgTime) * 100);
  }

  formatShiftTime(minutes: number): string {
    if (minutes === 0) return '0 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  getDailyBarHeight(count: number): number {
    const maxCount = Math.max(...this.dailyData().map(d => d.count), 1);
    return Math.max((count / maxCount) * 100, 4);
  }

  getFormattedSetupTime(): string {
    const minutes = this.systemStats().averageSetupTime;
    if (minutes >= 60) return `${(minutes / 60).toFixed(1)} h`;
    return `${minutes} min`;
  }

  // Convierte el porcentaje (0-100) a px para las mini-barras KPI
  // Espacio disponible para la barra: 72px total - 8px padding - 8px val - 9px day - 8px date - 5px gaps = ~34px max
  getMiniBarHeight(percent: number): number {
    const maxBarPx = 32;
    const minBarPx = 3;
    return Math.max(Math.round((percent / 100) * maxBarPx), minBarPx);
  }

  canManageSettings(): boolean { return true; }

  navigateToSettings(): void { this.router.navigate(['/settings']); }
  navigateToReports(): void { this.router.navigate(['/reports']); }
  navigateToMachines(): void { this.router.navigate(['/machines']); }
  navigateToDesign(): void { this.router.navigate(['/design']); }
  navigateToDocumento(): void { this.router.navigate(['/documents']); }
  navigateToInformacion(): void { this.router.navigate(['/information']); }
  navigateToConsultaPedidos(): void { this.router.navigate(['/consulta-pedidos']); }
}
