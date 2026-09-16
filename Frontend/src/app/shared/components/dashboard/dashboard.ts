import { Component, signal, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
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
export class DashboardComponent implements OnInit, OnDestroy {

  private dataChangedSub?: Subscription;

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
  weeklyData = signal<{ week: number; label: string; rangeStart: string; rangeEnd: string; total: number; days: any[] }[]>([]);
  // Día resaltado en un donut: { week: número de quincena, index: índice del día }
  hoveredDonut = signal<{ week: number; index: number } | null>(null);
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

    // Carga inicial (sirve desde caché si existe, sin nuevas peticiones).
    this.loadAllData();

    // Recarga SOLO cuando llega un cambio real vía SignalR (el servicio
    // invalida el caché y emite dataChanged$). Sin polling ni peticiones
    // repetidas mientras no haya cambios.
    this.dataChangedSub = this.dashboardService.dataChanged$.subscribe(() => {
      this.loadAllData();
    });
  }

  ngOnDestroy(): void {
    this.dataChangedSub?.unsubscribe();
  }

  private loadAllData(): void {
    this.loadSystemStats();
    this.loadShiftEfficiency();
    this.loadDailyPreparation();
    this.loadWeeklyPreparation();
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

  private loadWeeklyPreparation(): void {
    this.dashboardService.getWeeklyPreparation().subscribe({
      next: (data) => {
        this.weeklyData.set(data?.weeks || []);
      },
      error: () => { this.weeklyData.set([]); }
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
    const colors = ['#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95','#a78bfa','#9333ea','#c4b5fd','#7e22ce','#ddd6fe'];
    return colors[index % colors.length];
  }

  // Acorta nombres de pantone largos para que no deformen las columnas.
  // Deja intactos los cortos (tipo "P 186"); recorta los largos con "…".
  shortPantoneName(name: string): string {
    if (!name) return '';
    const clean = name.trim();
    const maxLen = 7; // p.ej. "P 2975" cabe; nombres más largos se recortan
    if (clean.length <= maxLen) return clean;
    return clean.substring(0, maxLen).trim() + '…';
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

  // ── Línea analítica de tendencia (SVG) para Eficiencia por Turno ──
  // Se basa en el total de programas del día (suma de los 3 turnos).
  private getShiftDayTotal(day: any): number {
    const shifts = day?.shifts || [];
    return shifts.reduce((sum: number, s: any) => sum + (s?.count || 0), 0);
  }

  getShiftTrendPoints(): { x: number; y: number }[] {
    const data = this.shiftData();
    const n = data.length;
    if (n === 0) return [];
    const totals = data.map(d => this.getShiftDayTotal(d));
    const maxTotal = Math.max(...totals, 1);
    return data.map((d, i) => {
      // Centro de cada columna (barras distribuidas con space-between)
      const x = ((i + 0.5) / n) * 100;
      const norm = totals[i] / maxTotal; // 0..1
      const y = 62 - norm * 54; // flota en la mitad superior
      return { x, y };
    });
  }

  getShiftTrendPath(): string {
    const pts = this.getShiftTrendPoints();
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const t = 0.18;
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = p1.y + (p2.y - p0.y) * t;
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = p2.y - (p3.y - p1.y) * t;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  getShiftTrendArea(): string {
    const line = this.getShiftTrendPath();
    if (!line) return '';
    return `${line} L 100 100 L 0 100 Z`;
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

  // ── Donuts de Preparación por Semana ─────────────────────────
  // Paleta de colores por día (7 tonos, se repiten si hace falta)
  private readonly weekDayColors = [
    '#3b82f6', // azul
    '#10b981', // verde
    '#f59e0b', // ámbar
    '#8b5cf6', // púrpura
    '#ec4899', // rosa
    '#06b6d4', // cian
    '#f97316'  // naranja
  ];

  getWeekDayColor(index: number): string {
    return this.weekDayColors[index % this.weekDayColors.length];
  }

  // Genera los segmentos del donut (para stroke-dasharray sobre un círculo r=15.9155)
  // Circunferencia normalizada a 100 para trabajar en porcentajes.
  getDonutSegments(week: { total: number; days: any[] }): {
    color: string; dash: number; offset: number; day: any; index: number;
  }[] {
    const days = week?.days || [];
    const total = days.reduce((s, d) => s + (d.count || 0), 0);
    const segments: { color: string; dash: number; offset: number; day: any; index: number }[] = [];
    if (total === 0) return segments;

    let acc = 0;
    days.forEach((d, i) => {
      const value = d.count || 0;
      if (value <= 0) return;
      const pct = (value / total) * 100;
      segments.push({
        color: this.getWeekDayColor(i),
        dash: pct,
        // offset negativo para empezar arriba y avanzar en sentido horario
        offset: 25 - acc,
        day: d,
        index: i
      });
      acc += pct;
    });
    return segments;
  }

  // Días de la semana que tienen al menos 1 pedido (para la leyenda)
  getWeekLegendDays(week: { days: any[] }): { day: any; index: number; color: string }[] {
    return (week?.days || []).map((day, index) => ({
      day, index, color: this.getWeekDayColor(index)
    }));
  }

  // ── Interacción del donut (hover/selección de un día) ────────
  setHoveredDay(weekNum: number, index: number): void {
    this.hoveredDonut.set({ week: weekNum, index });
  }

  clearHoveredDay(): void {
    this.hoveredDonut.set(null);
  }

  isDayHovered(weekNum: number, index: number): boolean {
    const h = this.hoveredDonut();
    return !!h && h.week === weekNum && h.index === index;
  }

  // ¿Hay algún día resaltado en esta quincena?
  hasHoveredDay(weekNum: number): boolean {
    const h = this.hoveredDonut();
    return !!h && h.week === weekNum;
  }

  // Datos del día resaltado en una quincena (para mostrar en el centro)
  getHoveredDayInfo(week: { week: number; total: number; days: any[] }):
    { color: string; count: number; percent: number; dayText: string } | null {
    const h = this.hoveredDonut();
    if (!h || h.week !== week.week) return null;
    const day = week.days[h.index];
    if (!day) return null;
    const total = week.days.reduce((s, d) => s + (d.count || 0), 0) || 1;
    const percent = Math.round((day.count / total) * 100);
    return {
      color: this.getWeekDayColor(h.index),
      count: day.count || 0,
      percent,
      dayText: `${day.dayName} ${day.date}`
    };
  }

  // Etiquetas del donut:
  //  - dayText: nombre + fecha, ORIENTADO RADIALMENTE (a lo largo del radio,
  //    de adentro hacia afuera) sobre la banda de color.
  //  - count: número de pedidos, colocado POR FUERA del anillo (upright).
  // viewBox 0 0 42 42, centro (21,21), radio del anillo = 15.9155.
  getDonutLabels(week: { total: number; days: any[] }): {
    // etiqueta radial del día
    dx: number; dy: number; drotate: number; anchor: string; dayText: string;
    // conteo por fuera del anillo
    cx2: number; cy2: number; count: number; color: string;
  }[] {
    const days = week?.days || [];
    const total = days.reduce((s, d) => s + (d.count || 0), 0);
    const labels: any[] = [];
    if (total === 0) return labels;

    const cx = 21, cy = 21;
    const rBand = 15.9155;   // radio del centro del anillo (banda de color)
    const rOut = 24.5;       // radio para el conteo por fuera del anillo
    let acc = 0;

    days.forEach((d) => {
      const value = d.count || 0;
      if (value <= 0) return;
      const pct = value / total;
      const midFraction = acc + pct / 2;
      acc += pct;

      const angleDeg = midFraction * 360;            // desde arriba, horario
      const angleRad = (angleDeg - 90) * Math.PI / 180;

      // Posición del texto del día sobre la banda de color
      const dx = cx + rBand * Math.cos(angleRad);
      const dy = cy + rBand * Math.sin(angleRad);

      // Orientación RADIAL: el texto corre a lo largo del radio (adentro→afuera).
      // rotate = angleDeg alinea el eje del texto con el radio.
      // Si cae en la mitad izquierda, lo volteamos 180° para que no quede al revés.
      let drotate = angleDeg;
      let anchor = 'start'; // el texto crece del centro hacia afuera
      if (angleDeg > 90 && angleDeg < 270) {
        drotate = angleDeg + 180;
        anchor = 'end';
      }

      // Posición del conteo por fuera del anillo
      const cx2 = cx + rOut * Math.cos(angleRad);
      const cy2 = cy + rOut * Math.sin(angleRad);

      labels.push({
        dx, dy, drotate, anchor,
        dayText: `${d.dayName} ${d.date}`,
        cx2, cy2, count: value,
        color: this.getWeekDayColor(days.indexOf(d))
      });
    });

    return labels;
  }

  // ── Línea analítica de tendencia (SVG) sobre las barras ──────
  // Coordenadas en un viewBox 0..100 x 0..100 (preserveAspectRatio="none").
  // El eje Y está invertido: 0 = arriba, 100 = abajo.

  // Puntos {x, y} centrados sobre cada barra
  getDailyTrendPoints(): { x: number; y: number }[] {
    const data = this.dailyData();
    const n = data.length;
    if (n === 0) return [];
    const maxCount = Math.max(...data.map(d => d.count), 1);
    return data.map((d, i) => {
      // Centro de cada columna (barras distribuidas con space-between)
      const x = ((i + 0.5) / n) * 100;
      // La línea flota en la mitad superior: y entre 8 (máximo) y 62 (mínimo)
      const norm = d.count / maxCount; // 0..1
      const y = 62 - norm * 54;
      return { x, y };
    });
  }

  // Path suave (curva Catmull-Rom → Bézier) que conecta los puntos
  getDailyTrendPath(): string {
    const pts = this.getDailyTrendPoints();
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const t = 0.18; // suavizado
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = p1.y + (p2.y - p0.y) * t;
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = p2.y - (p3.y - p1.y) * t;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  // Path del área (mismo trazo cerrado hasta la base) para el degradado
  getDailyTrendArea(): string {
    const line = this.getDailyTrendPath();
    if (!line) return '';
    return `${line} L 100 100 L 0 100 Z`;
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
