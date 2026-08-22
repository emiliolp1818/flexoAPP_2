



import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionsService, PERMISSIONS } from '../../services/permissions.service';
import { ConfirmDeleteActivityDialogComponent } from './confirm-delete-activity-dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { trigger, state, style, transition, animate } from '@angular/animations';





interface AuditActivity {
  id: number;
  action: string;
  description: string;
  timestamp: Date;
  module: string;
  details: string;
  userId: number;
  userCode: string;
  ipAddress?: string;
  entityType?: string;
  entityId?: number;
  entityName?: string;
  duration?: number;
  oldValues?: string;
  newValues?: string;
  expanded?: boolean;
  user?: {
    id: number;
    userCode: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

interface AuditFilters {
  userId?: number;
  module?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', opacity: 0 })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class ReportsComponent implements OnInit {

  loading = signal(false);
  activities = signal<AuditActivity[]>([]);
  filteredActivities = signal<AuditActivity[]>([]);
  users = signal<any[]>([]);
  filteredUsers = signal<any[]>([]);

  // Paginación del servidor
  currentPage = signal(1);
  totalCount = signal(0);
  hasMoreData = signal(false);
  loadingMore = signal(false);

  userSearchText: string = '';
  showUserSuggestions: boolean = false;


  filterForm: FormGroup;


  selectedModule = signal<string | null>(null);

  // Paginación progresiva de pedidos MACHINES - 50 por página
  readonly ORDERS_PAGE_SIZE = 50;
  visibleOrdersCount = signal<number>(this.ORDERS_PAGE_SIZE);

  // Paginación progresiva de tabla de actividades (por módulo) - 20 por página
  readonly ACTIVITIES_PAGE_SIZE = 20;
  private visibleActivitiesCountMap: Map<string, number> = new Map();

  private machineStatsCache: any = null;
  private machineStatsActivitiesCount: number = 0;


  private activitiesByModuleCache: Map<string, AuditActivity[]> = new Map();
  private activitiesCacheVersion: number = 0;


  private pantoneColorsCache: Map<string, number> = new Map();
  private descripcionCache: Map<string, string> = new Map();







  modules = [
    { value: 'AUTH', label: 'Autenticación', icon: 'lock' },
    { value: 'MACHINES', label: 'Máquinas', icon: 'precision_manufacturing' },
    { value: 'DESIGNS', label: 'Diseños', icon: 'palette' },
    { value: 'DOCUMENTS', label: 'Documentos', icon: 'description' },
    { value: 'REPORTS', label: 'Reportes', icon: 'assessment' },
    { value: 'CONFIG', label: 'Configuración', icon: 'settings' },
    { value: 'SETTINGS', label: 'Ajustes', icon: 'tune' },
    { value: 'PROFILE', label: 'Perfil', icon: 'person' }
  ];


  displayedColumns = ['timestamp', 'user', 'module', 'action', 'description', 'details'];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      userId: [null],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit() {
    // console.log('🚀 Componente de reportes inicializado');
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const response: any = await this.http.get(`${environment.apiUrl}/users`).toPromise();

      let usersData: any[] = [];


      if (Array.isArray(response)) {
        usersData = response;
      } else if (response && response.success && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response && Array.isArray(response.users)) {
        usersData = response.users;
      }

      this.users.set(usersData);
      this.filteredUsers.set(usersData);
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      this.users.set([]);
      this.filteredUsers.set([]);
    }
  }

  async loadActivities() {
    this.loading.set(true);

    this.machineStatsCache = null;
    this.machineStatsActivitiesCount = 0;
    this.activitiesByModuleCache.clear();
    this.activitiesCacheVersion++;

    try {
      const filters = this.filterForm.value;

      const params: any = {
        page: 1,
        pageSize: 100,
        sortBy: 'Timestamp',
        sortDescending: true
      };

      if (filters.userId && filters.userId > 0) {
        params.userId = filters.userId;
      }

      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
      }

      const response: any = await this.http.get(`${environment.apiUrl}/reports/audit/activities/paged`, { params }).toPromise();

      if (response && response.items) {
        const activities: AuditActivity[] = response.items.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
          expanded: false,
          user: a.user ? {
            id: a.user.id,
            userCode: a.user.userCode,
            firstName: a.user.firstName,
            lastName: a.user.lastName,
            fullName: a.user.fullName || `${a.user.firstName} ${a.user.lastName}`.trim()
          } : undefined
        }));

        // Enriquecer en paralelo (no bloquea la carga)
        this.enrichActivitiesWithPantoneColors(activities);

        this.activities.set(activities);
        this.filteredActivities.set(activities);
        
        this.currentPage.set(response.page || 1);
        this.totalCount.set(response.totalCount || 0);
        this.hasMoreData.set(response.hasNextPage || false);

        if (activities.length === 0) {
          this.showWarningSnackbar('No se encontraron actividades', 3000);
        } else {
          const message = response.totalCount > activities.length
            ? `Mostrando ${activities.length} de ${response.totalCount} actividades`
            : `${activities.length} actividades encontradas`;
          this.showSuccessSnackbar(message, 2000);
        }
      } else {
        this.activities.set([]);
        this.filteredActivities.set([]);
        this.totalCount.set(0);
        this.hasMoreData.set(false);
        this.showWarningSnackbar('No se encontraron actividades', 3000);
      }
    } catch (error) {
      console.error('Error cargando actividades:', error);
      this.showErrorSnackbar('Error al cargar actividades', 3000);
      this.activities.set([]);
      this.filteredActivities.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  // Cargar más actividades (siguiente página)
  async loadMoreActivitiesFromServer() {
    if (this.loadingMore() || !this.hasMoreData()) {
      return;
    }

    this.loadingMore.set(true);

    try {
      const filters = this.filterForm.value;
      const nextPage = this.currentPage() + 1;

      const params: any = {
        page: nextPage,
        pageSize: 100
      };

      if (filters.userId && filters.userId > 0) {
        params.userId = filters.userId;
      }

      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
      }

      const response: any = await this.http.get(
        `${environment.apiUrl}/reports/audit/activities/paged`, 
        { params }
      ).toPromise();

      if (response && response.items && response.items.length > 0) {
        const newActivities: AuditActivity[] = response.items.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
          expanded: false,
          user: a.user ? {
            id: a.user.id,
            userCode: a.user.userCode,
            firstName: a.user.firstName,
            lastName: a.user.lastName,
            fullName: a.user.fullName || `${a.user.firstName} ${a.user.lastName}`.trim()
          } : undefined
        }));

        await this.enrichActivitiesWithPantoneColors(newActivities);

        // Agregar a las actividades existentes
        const currentActivities = this.activities();
        this.activities.set([...currentActivities, ...newActivities]);
        this.filteredActivities.set([...currentActivities, ...newActivities]);

        // Actualizar paginación
        this.currentPage.set(response.page || nextPage);
        this.hasMoreData.set(response.hasNextPage || false);

        // Limpiar cache para recalcular
        this.activitiesByModuleCache.clear();
        this.machineStatsCache = null;

        this.showSuccessSnackbar(
          `Cargadas ${newActivities.length} actividades más (${this.activities().length} de ${this.totalCount()})`, 
          2000
        );
      }
    } catch (error) {
      console.error('❌ Error cargando más actividades:', error);
      this.showErrorSnackbar('Error al cargar más actividades', 3000);
    } finally {
      this.loadingMore.set(false);
    }
  }


  private async enrichActivitiesWithPantoneColors(activities: AuditActivity[]) {
    const machineActivities = activities.filter(a => a.module === 'MACHINES');
    if (machineActivities.length === 0) return;

    const uniqueArticles = new Set<string>();
    machineActivities.forEach(a => {
      const machineInfo = this.getMachineInfo(a);
      const articulo = machineInfo?.articulo;
      if (articulo && articulo !== '-') {
        uniqueArticles.add(articulo);
      }
    });

    if (uniqueArticles.size === 0) return;

    // Filtrar solo los que no están en cache
    const articlesToFetch = Array.from(uniqueArticles).filter(a => !this.pantoneColorsCache.has(a));

    // Hacer todas las llamadas en paralelo (máximo 5 concurrentes)
    const batchSize = 5;
    for (let i = 0; i < articlesToFetch.length; i += batchSize) {
      const batch = articlesToFetch.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(async (articulo) => {
        try {
          const pantoneResponse: any = await this.http.get(`${environment.apiUrl}/designs/pantone-colors/${articulo}`).toPromise();
          this.pantoneColorsCache.set(articulo, pantoneResponse?.pantoneCount || 0);

          if (!this.descripcionCache.has(articulo)) {
            try {
              const designResponse: any = await this.http.get(`${environment.apiUrl}/maquinas/design-info/${articulo}`).toPromise();
              const desc = designResponse?.data?.descripcion || designResponse?.data?.referencia || '';
              if (desc) this.descripcionCache.set(articulo, desc);
            } catch {}
          }
        } catch {
          this.pantoneColorsCache.set(articulo, 0);
        }
      }));
    }
  }

  applyFilters() {
    this.loadActivities();
  }

  clearFilters() {
    // console.log('🧹 Limpiando todos los filtros');
    this.filterForm.reset();
    this.userSearchText = '';
    this.showUserSuggestions = false;
    this.filteredUsers.set(this.users());


    this.activities.set([]);
    this.filteredActivities.set([]);


    this.machineStatsCache = null;
    this.machineStatsActivitiesCount = 0;
    this.activitiesByModuleCache.clear();
    this.activitiesCacheVersion++;


    this.loadActivities();
  }


  onUserSearch() {
    const searchTerm = this.userSearchText.toLowerCase().trim();
    this.showUserSuggestions = true;

    if (!searchTerm) {
      this.filteredUsers.set(this.users());
      this.filterForm.patchValue({ userId: null });
      this.showUserSuggestions = false;
      return;
    }

    // Buscar coincidencia exacta por código (sin sobrescribir el texto del input)
    const exactCodeMatch = this.users().find(user =>
      user.userCode.toLowerCase() === searchTerm
    );

    if (exactCodeMatch) {
      // Solo actualizamos el ID en el form, NO sobrescribimos userSearchText
      this.filterForm.patchValue({ userId: exactCodeMatch.id });
      this.filteredUsers.set([exactCodeMatch]);
      return;
    }

    // Filtrar usuarios que coincidan con el término
    const filtered = this.users().filter(user =>
      user.userCode.toLowerCase().includes(searchTerm) ||
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)
    );

    this.filteredUsers.set(filtered);

    if (filtered.length === 1) {
      // Único resultado: guardar ID pero NO sobrescribir lo que el usuario escribe
      this.filterForm.patchValue({ userId: filtered[0].id });
    } else {
      this.filterForm.patchValue({ userId: null });
    }
  }

  // Selección explícita de usuario desde un item de la lista sugerida
  selectUser(user: any) {
    this.userSearchText = user.userCode;
    this.showUserSuggestions = false;
    this.filterForm.patchValue({ userId: user.id });
    this.filteredUsers.set([user]);
    
    // Cargar actividades automáticamente al seleccionar
    // console.log('✅ Usuario seleccionado de la lista:', user.userCode);
    setTimeout(() => {
      this.loadActivities();
    }, 100);
  }

  // Manejar Enter en búsqueda de usuario
  onUserSearchEnter() {
    const searchTerm = this.userSearchText.toLowerCase().trim();
    
    if (!searchTerm) {
      return;
    }

    // Si hay un usuario seleccionado en el form, cargar actividades
    const userId = this.filterForm.value.userId;
    if (userId) {
      // console.log('✅ Enter presionado - Cargando actividades para usuario:', userId);
      this.loadActivities();
      return;
    }

    // Si hay exactamente un usuario filtrado, seleccionarlo y cargar
    const filtered = this.filteredUsers();
    if (filtered.length === 1) {
      // console.log('✅ Enter presionado - Seleccionando único usuario:', filtered[0].userCode);
      this.selectUser(filtered[0]);
      // Pequeño delay para que se actualice el form
      setTimeout(() => {
        this.loadActivities();
      }, 100);
      return;
    }

    // Si hay coincidencia exacta por código, seleccionarla y cargar
    const exactMatch = this.users().find(user =>
      user.userCode.toLowerCase() === searchTerm
    );
    
    if (exactMatch) {
      // console.log('✅ Enter presionado - Coincidencia exacta:', exactMatch.userCode);
      this.selectUser(exactMatch);
      setTimeout(() => {
        this.loadActivities();
      }, 100);
      return;
    }

    // Si no hay coincidencia clara, mostrar mensaje
    if (filtered.length === 0) {
      this.showWarningSnackbar('No se encontró ningún usuario con ese criterio', 3000);
    } else if (filtered.length > 1) {
      this.showInfoSnackbar(`Se encontraron ${filtered.length} usuarios. Selecciona uno de la lista.`, 3000);
    }
  }

  clearUserSearch() {
    this.userSearchText = '';
    this.showUserSuggestions = false;
    this.filteredUsers.set(this.users());
    this.filterForm.patchValue({ userId: null });
  }

  getModuleLabel(module: string): string {
    const found = this.modules.find(m => m.value === module);
    return found ? found.label : module;
  }

  getModuleIcon(module: string): string {
    const found = this.modules.find(m => m.value === module);
    return found ? found.icon : 'help';
  }

  getActiveModulesCount(): number {
    return this.modules.filter(m => this.getModuleCount(m.value) > 0).length;
  }

  getModuleGradient(module: string): string {
    const gradients: any = {
      'AUTH': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'MACHINES': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'DESIGNS': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'DOCUMENTS': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'REPORTS': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'CONFIG': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'SETTINGS': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'PROFILE': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    };
    return gradients[module] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  canDeleteActivity(): boolean {
    // Admin siempre puede eliminar, otros necesitan el permiso
    const user = this.authService.getCurrentUser();
    if (user && (user.role === 'Admin' || user.role === 'admin')) return true;
    return this.permissionsService.hasPermission(PERMISSIONS.REPORTS_DELETE);
  }

  async deleteActivity(activity: any) {
    if (!this.canDeleteActivity()) {
      this.snackBar.open('No tienes permiso para eliminar actividades', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteActivityDialogComponent, {
      width: '420px',
      disableClose: false,
      data: {
        title: 'Eliminar Actividad',
        message: '¿Estás seguro de eliminar esta actividad?',
        detail: `${activity.action} — ${activity.description || ''}`,
        confirmText: 'Sí, eliminar'
      }
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (!confirmed) return;

    try {
      await this.http.delete(`${environment.apiUrl}/audit/${activity.id}`).toPromise();
      const current = this.activities();
      this.activities.set(current.filter(a => a.id !== activity.id));
      this.snackBar.open('Actividad eliminada', 'Cerrar', { duration: 2000 });
    } catch {
      this.snackBar.open('Error al eliminar actividad', 'Cerrar', { duration: 3000 });
    }
  }

  async deleteOrderActivities(order: any) {
    if (!this.canDeleteActivity()) {
      this.snackBar.open('No tienes permiso para eliminar actividades', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteActivityDialogComponent, {
      width: '420px',
      disableClose: false,
      data: {
        title: 'Eliminar Pedido del Reporte',
        message: `¿Eliminar todas las actividades del pedido ${order.otSap}?`,
        detail: `Artículo: ${order.articulo} — ${order.descripcion || ''}`,
        confirmText: 'Sí, eliminar todo'
      }
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (!confirmed) return;

    try {
      const current = this.activities();
      const toDelete = current.filter(a => {
        if (!a.details) return false;
        try {
          const det = typeof a.details === 'string' ? JSON.parse(a.details) : a.details;
          return det.otSap === order.otSap;
        } catch { return false; }
      });

      for (const act of toDelete) {
        try {
          await this.http.delete(`${environment.apiUrl}/audit/${act.id}`).toPromise();
        } catch {}
      }

      this.activities.set(current.filter(a => !toDelete.includes(a)));
      this.machineStatsCache = null;
      this.snackBar.open(`Pedido ${order.otSap} eliminado (${toDelete.length} actividades)`, 'Cerrar', { duration: 3000 });
    } catch {
      this.snackBar.open('Error al eliminar pedido', 'Cerrar', { duration: 3000 });
    }
  }

  getModuleColor(module: string): string {
    const colors: any = {
      'AUTH': 'primary',
      'MACHINES': 'accent',
      'DESIGNS': 'warn',
      'DOCUMENTS': 'primary',
      'REPORTS': 'accent',
      'CONFIG': 'warn',
      'SETTINGS': 'primary',
      'PROFILE': 'accent'
    };
    return colors[module] || 'primary';
  }

  formatDuration(seconds: number | undefined): string {

    if (seconds === undefined || seconds === null) return '-';


    if (isNaN(seconds)) return '-';


    if (seconds === 0) return '0s';


    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);


    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }


  getDuration(activity: AuditActivity): string {

    if (activity.duration && !isNaN(activity.duration) && activity.duration > 0) {
      return this.formatDuration(activity.duration);
    }


    if (activity.description) {
      const durationMatch = activity.description.match(/Duración:\s*(\d+)[,.](\d+)\s*min/i);
      if (durationMatch) {
        const minutes = parseInt(durationMatch[1]);
        const decimals = parseInt(durationMatch[2]);
        const totalSeconds = (minutes * 60) + Math.round((decimals / 100) * 60);
        return this.formatDuration(totalSeconds);
      }


      const altMatch = activity.description.match(/(\d+)\s*min\s*(\d+)\s*s/i);
      if (altMatch) {
        const minutes = parseInt(altMatch[1]);
        const seconds = parseInt(altMatch[2]);
        const totalSeconds = (minutes * 60) + seconds;
        return this.formatDuration(totalSeconds);
      }
    }


    if (activity.details) {
      try {
        const details = JSON.parse(activity.details);
        if (details.duration || details.Duration || details.duracion || details.Duracion) {
          const dur = details.duration || details.Duration || details.duracion || details.Duracion;
          if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
            return this.formatDuration(dur);
          }
        }
      } catch (e) {

      }
    }

    return '-';
  }

  parseDetails(details: string): any {
    try {
      return JSON.parse(details);
    } catch {
      return null;
    }
  }

  parseValues(values: string): any {
    try {
      return JSON.parse(values);
    } catch {
      return null;
    }
  }

  formatJSON(jsonString: string): string {
    try {
      const obj = JSON.parse(jsonString);
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonString;
    }
  }

  /** Convierte un JSON de detalles en una lista de label/value legibles para el usuario */
  parseDetailsToItems(jsonString: string): { label: string; value: string }[] {
    try {
      const obj = JSON.parse(jsonString);
      const labelMap: Record<string, string> = {
        articleF: 'Artículo',
        client: 'Cliente',
        substrate: 'Sustrato',
        printType: 'Impresión',
        colorCount: 'Colores',
        type: 'Tipo',
        designId: 'ID Diseño',
        documentoId: 'ID Documento',
        nombre: 'Nombre',
        tamano: 'Tamaño',
        categoria: 'Categoría',
        tipo: 'Tipo',
        extension: 'Extensión',
        machineNumber: 'Máquina',
        otSap: 'OT SAP',
        estado: 'Estado',
        newState: 'Nuevo Estado',
        oldState: 'Estado Anterior',
        reason: 'Razón',
        count: 'Cantidad',
        fileName: 'Archivo',
        userId: 'ID Usuario',
        userCode: 'Código Usuario',
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Email',
        role: 'Rol',
        module: 'Módulo',
        action: 'Acción',
        created: 'Creados',
        updated: 'Actualizados',
        deleted: 'Eliminados',
        description: 'Descripción',
        configId: 'Config',
        category: 'Categoría',
        fieldChanged: 'Campo',
        hasImage: 'Tiene Imagen',
        success: 'Exitoso'
      };

      return Object.entries(obj)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => ({
          label: labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim(),
          value: typeof value === 'object' ? JSON.stringify(value) : String(value)
        }));
    } catch {
      return [{ label: 'Detalles', value: jsonString }];
    }
  }


  toggleExpanded(activity: AuditActivity, event: Event) {
    event.stopPropagation();
    activity.expanded = !activity.expanded;


    const currentActivities = this.filteredActivities();
    this.filteredActivities.set([...currentActivities]);
  }


  parseTimeSpanToSeconds(timeSpanString: string): number {
    if (!timeSpanString || typeof timeSpanString !== 'string') {
      return 0;
    }

    try {

      const trimmed = timeSpanString.trim();


      const parts = trimmed.split('.');
      let days = 0;
      let timePart = '';
      let fractionPart = 0;

      if (parts.length === 1) {

        timePart = parts[0];
      } else if (parts.length === 2) {

        if (parts[0].includes(':')) {

          timePart = parts[0];
          fractionPart = parseFloat('0.' + parts[1]);
        } else {

          days = parseInt(parts[0]);
          timePart = parts[1];
        }
      } else if (parts.length === 3) {

        days = parseInt(parts[0]);
        timePart = parts[1];
        fractionPart = parseFloat('0.' + parts[2]);
      }


      const timeComponents = timePart.split(':');
      if (timeComponents.length !== 3) {
        // console.warn('⚠️ Formato de TimeSpan inválido:', timeSpanString);
        return 0;
      }

      const hours = parseInt(timeComponents[0]) || 0;
      const minutes = parseInt(timeComponents[1]) || 0;
      const seconds = parseInt(timeComponents[2]) || 0;


      const totalSeconds = (days * 24 * 60 * 60) +
        (hours * 60 * 60) +
        (minutes * 60) +
        seconds +
        fractionPart;

      // console.log(`✅ TimeSpan parseado: "${timeSpanString}" → ${totalSeconds} seg (${days}d ${hours}h ${minutes}m ${seconds}s + ${fractionPart}s)`);
      return totalSeconds;
    } catch (error) {
      console.error('❌ Error al parsear TimeSpan:', timeSpanString, error);
      return 0;
    }
  }


  getNumeroMaquina(activity: AuditActivity): string | null {
    try {
      let numeroMaquina: string | null = null;


      if (activity.details) {
        try {
          const details = JSON.parse(activity.details);

          numeroMaquina = details.maquina || details.Maquina ||
            details.numeroMaquina || details.NumeroMaquina ||
            details.machineNumber || details.MachineNumber ||
            details.numero_maquina || details.maquinaId ||
            details.MaquinaId || details.machineId ||
            details.MachineId || details.machine || details.Machine;
          if (numeroMaquina) {
            // console.log('🔢 Número de máquina desde details:', numeroMaquina);
            return numeroMaquina.toString();
          }
        } catch (e) {

        }
      }


      if (activity.newValues) {
        try {
          const newVals = JSON.parse(activity.newValues);

          numeroMaquina = newVals.maquina || newVals.Maquina ||
            newVals.numeroMaquina || newVals.NumeroMaquina ||
            newVals.machineNumber || newVals.MachineNumber ||
            newVals.numero_maquina || newVals.maquinaId ||
            newVals.MaquinaId || newVals.machineId ||
            newVals.MachineId || newVals.machine || newVals.Machine;
          if (numeroMaquina) {
            // console.log('🔢 Número de máquina desde newValues:', numeroMaquina);
            return numeroMaquina.toString();
          }
        } catch (e) {

        }
      }


      if (activity.oldValues) {
        try {
          const oldVals = JSON.parse(activity.oldValues);

          numeroMaquina = oldVals.maquina || oldVals.Maquina ||
            oldVals.numeroMaquina || oldVals.NumeroMaquina ||
            oldVals.machineNumber || oldVals.MachineNumber ||
            oldVals.numero_maquina || oldVals.maquinaId ||
            oldVals.MaquinaId || oldVals.machineId ||
            oldVals.MachineId || oldVals.machine || oldVals.Machine;
          if (numeroMaquina) {
            // console.log('🔢 Número de máquina desde oldValues:', numeroMaquina);
            return numeroMaquina.toString();
          }
        } catch (e) {

        }
      }


      if (activity.module === 'MACHINES' && activity.entityType &&
        (activity.entityType.toLowerCase().includes('machine') || activity.entityType.toLowerCase().includes('maquina'))) {
        if (activity.entityId) {
          // console.log('🔢 Número de máquina desde entityId (módulo MACHINES):', activity.entityId);
          return activity.entityId.toString();
        }
      }

      return null;
    } catch (error) {
      console.error('Error en getNumeroMaquina:', error);
      return null;
    }
  }


  getMachineInfo(activity: AuditActivity): any {
    try {
      let machineInfo: any = {
        articulo: null,
        otSap: null,
        descripcion: null,
        numeroMaquina: null,
        pantoneColors: []
      };

      let hasData = false;


      if (activity.entityType && (activity.entityType.toLowerCase().includes('machine') || activity.entityType.toLowerCase().includes('maquina'))) {
        if (activity.entityName) {
          machineInfo.numeroMaquina = activity.entityName;
          hasData = true;
        }
      }


      if (activity.details) {
        try {
          const details = JSON.parse(activity.details);
          // console.log('📦 Details parseados:', details);

          machineInfo.articulo = details.articulo || details.Articulo || details.article || details.Article || machineInfo.articulo;
          machineInfo.otSap = details.otSap || details.OtSap || details.ot_sap || details.OT_SAP || details.orderNumber || details.OrderNumber || machineInfo.otSap;
          machineInfo.descripcion = details.descripcion || details.Descripcion || details.referencia || details.Referencia || details.description || details.Description || machineInfo.descripcion;

          machineInfo.numeroMaquina = machineInfo.numeroMaquina || details.maquina || details.Maquina ||
            details.numeroMaquina || details.NumeroMaquina ||
            details.machineNumber || details.MachineNumber ||
            details.numero_maquina || details.maquinaId ||
            details.MaquinaId || details.machineId || details.MachineId;

          // Extraer pantone colors del details
          if (details.pantoneColors && Array.isArray(details.pantoneColors) && details.pantoneColors.length > 0) {
            machineInfo.pantoneColors = details.pantoneColors;
          }

          if (machineInfo.articulo || machineInfo.otSap || machineInfo.descripcion || machineInfo.numeroMaquina) {
            hasData = true;
          }
        } catch (e) {
          // console.warn('Error parseando details:', e);
        }
      }


      if (activity.newValues) {
        try {
          const newVals = JSON.parse(activity.newValues);
          // console.log('📦 NewValues parseados:', newVals);

          machineInfo.articulo = machineInfo.articulo || newVals.articulo || newVals.Articulo || newVals.article || newVals.Article;
          machineInfo.otSap = machineInfo.otSap || newVals.otSap || newVals.OtSap || newVals.ot_sap || newVals.OT_SAP || newVals.orderNumber || newVals.OrderNumber;
          machineInfo.descripcion = machineInfo.descripcion || newVals.descripcion || newVals.Descripcion || newVals.referencia || newVals.Referencia || newVals.description || newVals.Description;

          machineInfo.numeroMaquina = machineInfo.numeroMaquina || newVals.maquina || newVals.Maquina ||
            newVals.numeroMaquina || newVals.NumeroMaquina ||
            newVals.machineNumber || newVals.MachineNumber ||
            newVals.numero_maquina || newVals.maquinaId ||
            newVals.MaquinaId || newVals.machineId || newVals.MachineId;

          if (machineInfo.articulo || machineInfo.otSap || machineInfo.descripcion || machineInfo.numeroMaquina) {
            hasData = true;
          }
        } catch (e) {
          // console.warn('Error parseando newValues:', e);
        }
      }


      if (activity.oldValues) {
        try {
          const oldVals = JSON.parse(activity.oldValues);
          // console.log('📦 OldValues parseados:', oldVals);

          machineInfo.articulo = machineInfo.articulo || oldVals.articulo || oldVals.Articulo || oldVals.article || oldVals.Article;
          machineInfo.otSap = machineInfo.otSap || oldVals.otSap || oldVals.OtSap || oldVals.ot_sap || oldVals.OT_SAP || oldVals.orderNumber || oldVals.OrderNumber;
          machineInfo.descripcion = machineInfo.descripcion || oldVals.descripcion || oldVals.Descripcion || oldVals.referencia || oldVals.Referencia || oldVals.description || oldVals.Description;

          machineInfo.numeroMaquina = machineInfo.numeroMaquina || oldVals.maquina || oldVals.Maquina ||
            oldVals.numeroMaquina || oldVals.NumeroMaquina ||
            oldVals.machineNumber || oldVals.MachineNumber ||
            oldVals.numero_maquina || oldVals.maquinaId ||
            oldVals.MaquinaId || oldVals.machineId || oldVals.MachineId;

          if (machineInfo.articulo || machineInfo.otSap || machineInfo.descripcion || machineInfo.numeroMaquina) {
            hasData = true;
          }
        } catch (e) {
          // console.warn('Error parseando oldValues:', e);
        }
      }

      // console.log('🔍 Machine info extraída:', machineInfo, 'hasData:', hasData);

      return hasData ? machineInfo : null;
    } catch (error) {
      console.error('Error en getMachineInfo:', error);
      return null;
    }
  }


  isExpandedRow = (index: number, row: AuditActivity) => row.expanded === true;


  getActivitiesByModule(module: string): AuditActivity[] {

    if (this.activitiesByModuleCache.has(module)) {
      return this.activitiesByModuleCache.get(module)!;
    }


    const activities = this.filteredActivities().filter(a => a.module === module);
    this.activitiesByModuleCache.set(module, activities);

    return activities;
  }


  getModuleCount(module: string): number {
    if (module === 'MACHINES') {
      // Para máquinas, mostrar cantidad de pedidos únicos (no actividades individuales)
      const activities = this.getActivitiesByModule(module);
      if (activities.length === 0) return 0;
      const stats = this.getMachineStats(activities);
      const pedidos = stats?.totalOrders || 0;
      // Si no hay pedidos pero sí actividades (imports, etc.), mostrar actividades
      return pedidos > 0 ? pedidos : activities.length;
    }
    return this.getActivitiesByModule(module).length;
  }


  selectModule(module: string | null) {
    this.selectedModule.set(module);
    // Resetear contadores de paginación al cambiar módulo
    this.visibleOrdersCount.set(this.ORDERS_PAGE_SIZE);
    this.visibleActivitiesCountMap.clear();
  }

  // ──────────────────────────────────────────
  // Paginación progresiva de pedidos (MACHINES)
  // ──────────────────────────────────────────

  /** Retorna solo los pedidos visibles actualmente */
  getVisibleOrders(orderDetails: any[]): any[] {
    // Los más recientes primero (ordenados por el último timestamp del historial)
    const sorted = [...orderDetails].sort((a, b) => {
      const tsA = a.historialEstados?.length
        ? new Date(a.historialEstados[a.historialEstados.length - 1].timestamp).getTime()
        : 0;
      const tsB = b.historialEstados?.length
        ? new Date(b.historialEstados[b.historialEstados.length - 1].timestamp).getTime()
        : 0;
      return tsB - tsA;
    });
    return sorted.slice(0, this.visibleOrdersCount());
  }

  hasMoreOrders(orderDetails: any[]): boolean {
    return this.visibleOrdersCount() < orderDetails.length;
  }

  loadMoreOrders() {
    this.visibleOrdersCount.update(n => n + this.ORDERS_PAGE_SIZE);
  }

  // ──────────────────────────────────────────
  // Paginación progresiva de actividades (tabla)
  // ──────────────────────────────────────────

  getVisibleActivitiesForModule(module: string): AuditActivity[] {
    const all = this.getActivitiesByModule(module);
    const visible = this.visibleActivitiesCountMap.get(module) ?? this.ACTIVITIES_PAGE_SIZE;
    // Ordenar más recientes primero
    const sorted = [...all].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sorted.slice(0, visible);
  }

  hasMoreActivities(module: string): boolean {
    const all = this.getActivitiesByModule(module);
    const visible = this.visibleActivitiesCountMap.get(module) ?? this.ACTIVITIES_PAGE_SIZE;
    return visible < all.length;
  }

  loadMoreActivities(module: string) {
    const current = this.visibleActivitiesCountMap.get(module) ?? this.ACTIVITIES_PAGE_SIZE;
    this.visibleActivitiesCountMap.set(module, current + this.ACTIVITIES_PAGE_SIZE);
    // Forzar detección de cambios actualizando la señal
    this.filteredActivities.set([...this.filteredActivities()]);
  }


  getMachineStats(activities: AuditActivity[]): any {

    if (this.machineStatsCache && this.machineStatsActivitiesCount === activities.length) {
      // console.log('✅ Usando cache de estadísticas de máquinas');
      return this.machineStatsCache;
    }

    // console.log('🔧 ===== INICIO getMachineStats (RECALCULANDO) =====');
    // console.log('🔧 Total actividades recibidas:', activities.length);


    const allMachineActivities = activities.filter(a => a.module === 'MACHINES');
    // console.log('🔧 Total actividades de MACHINES:', allMachineActivities.length);

    if (allMachineActivities.length > 0) {
    }


    const actionCounts: Record<string, number> = {};
    allMachineActivities.forEach(a => {
      actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
    });



    const machineActivities = activities.filter(a => {
      if (a.module !== 'MACHINES') return false;


      const descriptionMatch = a.description &&
        (a.description.toUpperCase().includes('TERMINADO') ||
          a.description.toUpperCase().includes('LISTO') ||
          a.description.toUpperCase().includes('PREPARANDO') ||
          a.description.toUpperCase().includes('SUSPENDIDO') ||
          a.description.toUpperCase().includes('CORRIENDO'));


      let newValuesMatch = false;
      if (a.newValues) {
        try {
          const newVals = typeof a.newValues === 'string' ? JSON.parse(a.newValues) : a.newValues;
          const estadoUpper = (newVals.estado || newVals.Estado || '').toUpperCase();
          newValuesMatch = estadoUpper === 'TERMINADO' || estadoUpper === 'LISTO' ||
            estadoUpper === 'PREPARANDO' || estadoUpper === 'SUSPENDIDO' ||
            estadoUpper === 'CORRIENDO';
        } catch (e) {

        }
      }


      const actionMatch = a.action &&
        (a.action.toUpperCase().includes('TERMINADO') ||
          a.action.toUpperCase().includes('LISTO') ||
          a.action.toUpperCase().includes('PREPARANDO') ||
          a.action.toUpperCase().includes('SUSPENDIDO') ||
          a.action.toUpperCase().includes('CORRIENDO'));

      return descriptionMatch || newValuesMatch || actionMatch;
    });

    // console.log('🔧 Actividades filtradas (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO):', machineActivities.length);
    // console.log('🔧 Diferencia:', allMachineActivities.length - machineActivities.length, 'actividades descartadas');


    if (machineActivities.length > 0) {
      // console.log('🔧 Primera actividad con cambio de estado:', machineActivities[0]);
    } else {
      // console.warn('⚠️ NO SE ENCONTRARON ACTIVIDADES CON CAMBIOS DE ESTADO');
      // console.warn('⚠️ Verifica que las actividades tengan:');
      // console.warn('   - module: "MACHINES"');
      // console.warn('   - action: "MACHINE_STATUS_CHANGED"');
      // console.warn('   - description con algún estado válido, o newValues.estado con estado válido');
    }


    const pedidosMap = new Map<string, {
      articulo: string;
      otSap: string;
      descripcion: string;
      numeroMaquina: string;
      numeroColores: number;
      pantoneColors: string[];
      totalDuration: number;
      totalDurationListo: number;
      historialEstados: Array<{
        estado: string;
        timestamp: string;
        duration: number;
        observaciones?: string;
        userCode?: string;
        userName?: string;
      }>;
    }>();

    machineActivities.forEach((a, index) => {
      const machineInfo = this.getMachineInfo(a);
      const otSap = machineInfo?.otSap || '-';
      const articulo = machineInfo?.articulo || '-';
      const key = `${otSap}_${articulo}`;

      let duration = 0;
      if (a.duration) {
        if (typeof a.duration === 'number') {
          duration = a.duration;
        } else if (typeof a.duration === 'string') {
          duration = this.parseTimeSpanToSeconds(a.duration);
        } else if (typeof a.duration === 'object') {
          const durationObj = a.duration as any;
          duration = durationObj.totalSeconds ||
            durationObj.TotalSeconds ||
            durationObj.total_seconds ||
            (durationObj.ticks ? durationObj.ticks / 10000000 : 0) ||
            0;
        }
      }


      let numeroColores = 0;

      if (articulo && articulo !== '-' && this.pantoneColorsCache.has(articulo)) {
        numeroColores = this.pantoneColorsCache.get(articulo) || 0;
      } else if (articulo && articulo !== '-') {
        // console.log(`⚠️ Artículo ${articulo} no encontrado en cache de colores Pantone`);

        if (a.details) {
          try {
            const details = JSON.parse(a.details);
            numeroColores = details.numeroColores || details.NumeroColores ||
              details.numero_colores || details.colorCount || 0;
          } catch (e) {

          }
        }

        if (numeroColores === 0 && a.newValues) {
          try {
            const newVals = JSON.parse(a.newValues);
            numeroColores = newVals.numeroColores || newVals.NumeroColores ||
              newVals.numero_colores || newVals.colorCount || 0;
          } catch (e) {

          }
        }
      }


      let estadoPedido = '-';
      let observaciones = '';
      if (a.newValues) {
        try {
          const newVals = typeof a.newValues === 'string' ? JSON.parse(a.newValues) : a.newValues;
          estadoPedido = newVals.estado || newVals.Estado || '-';


          let rawObservaciones = newVals.observaciones || newVals.Observaciones || '';


          // console.log(`🔍 [${otSap}] Estado: ${estadoPedido}, Observaciones raw:`, rawObservaciones);


          const mensajesFiltrar = [
            'Programa nuevo - Información de tabla de diseño - Pendiente de asignación de estado por operario',
            'Programa nuevo',
            'Información de tabla de diseño',
            'Pendiente de asignación de estado por operario'
          ];


          let observacionesLimpias = rawObservaciones;
          for (const mensaje of mensajesFiltrar) {
            observacionesLimpias = observacionesLimpias.replace(mensaje, '').trim();
          }


          observacionesLimpias = observacionesLimpias.replace(/^[\s\-]+|[\s\-]+$/g, '').trim();

          observaciones = observacionesLimpias;


          // console.log(`🔍 [${otSap}] Observaciones después de filtrar:`, observaciones);
        } catch (e) {

        }
      }

      if (estadoPedido === '-' && a.description) {
        const match = a.description.match(/→\s*(\w+)/);
        if (match) {
          estadoPedido = match[1];
        }
      }


      const userCode = a.user?.userCode || a.userCode || '-';
      const userName = a.user?.fullName || `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.trim() || '-';

      // Extraer colores Pantone del details o de machineInfo
      let pantoneColors: string[] = [];
      if (a.details) {
        try {
          const det = typeof a.details === 'string' ? JSON.parse(a.details) : a.details;
          if (det.pantoneColors && Array.isArray(det.pantoneColors)) {
            pantoneColors = det.pantoneColors;
          }
        } catch {}
      }
      // Fallback: usar pantoneColors de machineInfo
      if (pantoneColors.length === 0 && machineInfo?.pantoneColors?.length > 0) {
        pantoneColors = machineInfo.pantoneColors;
      }

      if (pedidosMap.has(key)) {
        const pedido = pedidosMap.get(key)!;
        pedido.historialEstados.push({
          estado: estadoPedido,
          timestamp: typeof a.timestamp === 'string' ? a.timestamp : a.timestamp.toISOString(),
          duration: duration,
          observaciones: observaciones,
          userCode: userCode,
          userName: userName
        });
        pedido.totalDuration += duration;

        if (estadoPedido.toUpperCase() === 'LISTO') {
          pedido.totalDurationListo += duration;
        }

        if (numeroColores > pedido.numeroColores) {
          pedido.numeroColores = numeroColores;
        }

        // Actualizar pantone colors si hay nuevos
        if (pantoneColors.length > 0 && (!pedido.pantoneColors || pedido.pantoneColors.length === 0)) {
          pedido.pantoneColors = pantoneColors;
        }
        // Actualizar descripcion si estaba vacía
        if (pedido.descripcion === '-' && (machineInfo?.descripcion || this.descripcionCache.get(articulo))) {
          pedido.descripcion = machineInfo?.descripcion || this.descripcionCache.get(articulo) || '-';
        }
      } else {

        const durationListo = estadoPedido.toUpperCase() === 'LISTO' ? duration : 0;
        pedidosMap.set(key, {
          articulo: articulo,
          otSap: otSap,
          descripcion: machineInfo?.descripcion || machineInfo?.referencia || this.descripcionCache.get(articulo) || '-',
          numeroMaquina: this.getNumeroMaquina(a) || '-',
          numeroColores: numeroColores,
          pantoneColors: pantoneColors,
          totalDuration: duration,
          totalDurationListo: durationListo,
          historialEstados: [{
            estado: estadoPedido,
            timestamp: typeof a.timestamp === 'string' ? a.timestamp : a.timestamp.toISOString(),
            duration: duration,
            observaciones: observaciones,
            userCode: userCode,
            userName: userName
          }]
        });
      }
    });



    const orderDetails = Array.from(pedidosMap.values())
      .filter(pedido => pedido.historialEstados.some(h => h.estado.toUpperCase() === 'LISTO'))
      .map(pedido => {

        pedido.historialEstados.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        return {
          articulo: pedido.articulo,
          otSap: pedido.otSap,
          descripcion: pedido.descripcion,
          numeroMaquina: pedido.numeroMaquina,
          numeroColores: pedido.numeroColores,
          pantoneColors: pedido.pantoneColors || [],
          duration: pedido.totalDurationListo,
          historialEstados: pedido.historialEstados,

          estado: pedido.historialEstados[pedido.historialEstados.length - 1]?.estado || '-',
          timestamp: pedido.historialEstados[pedido.historialEstados.length - 1]?.timestamp || ''
        };
      });

    // Pedidos agrupados
    orderDetails.forEach((order, index) => {
    });


    const totalOrders = orderDetails.length;
    const totalDuration = orderDetails.reduce((sum, order) => sum + order.duration, 0);
    const avgDuration = totalOrders > 0 ? totalDuration / totalOrders : 0;

    // console.log('🔧 ===== RESUMEN FINAL =====');
    // console.log('🔧 Total de pedidos únicos:', totalOrders);
    // console.log('🔧 Total Duration (segundos):', totalDuration);
    // console.log('🔧 Avg Duration (segundos):', avgDuration);
    // console.log('🔧 Total Duration (formateado):', this.formatDuration(totalDuration));
    // console.log('🔧 Avg Duration (formateado):', this.formatDuration(avgDuration));


    const coloresStats = orderDetails.reduce((acc, order) => {
      if (order.numeroColores > 0) {
        acc.totalColores += order.numeroColores;
        acc.pedidosConColores++;
      }
      return acc;
    }, { totalColores: 0, pedidosConColores: 0 });


    const avgColores = totalOrders > 0
      ? coloresStats.totalColores / totalOrders
      : 0;

    // console.log('🔧 ===== ESTADÍSTICAS DE COLORES =====');
    // console.log('🔧 Total de colores Pantone:', coloresStats.totalColores);
    // console.log('🔧 Pedidos con colores:', coloresStats.pedidosConColores);
    // console.log('🔧 Total de pedidos:', totalOrders);
    // console.log('🔧 Promedio de colores (total colores / total pedidos):', avgColores);


    this.machineStatsCache = {
      totalOrders,
      totalDuration,
      avgDuration,
      orderDetails,
      totalColores: coloresStats.totalColores,
      avgColores: avgColores
    };
    this.machineStatsActivitiesCount = activities.length;

    // console.log('🔧 Cache actualizado con:', this.machineStatsCache);

    return this.machineStatsCache;
  }

  exportToPDF() {

    const moduleToExport = prompt('¿Qué módulo deseas exportar?\n\nOpciones:\n- AUTH (Autenticación)\n- MACHINES (Máquinas)\n- DESIGNS (Diseños)\n- DOCUMENTS (Documentos)\n- REPORTS (Reportes)\n- CONFIG (Configuración)\n- SETTINGS (Ajustes)\n- PROFILE (Perfil)\n- ALL (Todos)\n\nEscribe el nombre del módulo:');

    if (!moduleToExport) {
      this.showWarningSnackbar('Exportación cancelada', 2000);
      return;
    }

    let activities: AuditActivity[];
    if (moduleToExport.toUpperCase() === 'ALL') {
      activities = this.filteredActivities();
    } else {
      activities = this.filteredActivities().filter(a =>
        a.module.toUpperCase() === moduleToExport.toUpperCase()
      );
    }

    if (activities.length === 0) {
      this.showWarningSnackbar('No hay actividades para exportar en este módulo', 3000);
      return;
    }

    const doc = new jsPDF();


    doc.setFontSize(18);
    doc.text(`Reporte de Auditoría - ${moduleToExport.toUpperCase()}`, 14, 20);


    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total de registros: ${activities.length}`, 14, 34);


    const tableData = activities.map(a => [
      new Date(a.timestamp).toLocaleString(),
      a.user?.fullName || a.userCode,
      this.getModuleLabel(a.module),
      a.action,
      a.description
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Fecha/Hora', 'Usuario', 'Módulo', 'Acción', 'Descripción']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [63, 81, 181] }
    });

    doc.save(`auditoria_${moduleToExport}_${new Date().getTime()}.pdf`);
    this.showSuccessSnackbar('PDF generado exitosamente', 3000);
  }

  exportToExcel() {

    const moduleToExport = prompt('¿Qué módulo deseas exportar?\n\nOpciones:\n- AUTH (Autenticación)\n- MACHINES (Máquinas)\n- DESIGNS (Diseños)\n- DOCUMENTS (Documentos)\n- REPORTS (Reportes)\n- CONFIG (Configuración)\n- SETTINGS (Ajustes)\n- PROFILE (Perfil)\n- ALL (Todos)\n\nEscribe el nombre del módulo:');

    if (!moduleToExport) {
      this.showWarningSnackbar('Exportación cancelada', 2000);
      return;
    }

    let activities: AuditActivity[];
    if (moduleToExport.toUpperCase() === 'ALL') {
      activities = this.filteredActivities();
    } else {
      activities = this.filteredActivities().filter(a =>
        a.module.toUpperCase() === moduleToExport.toUpperCase()
      );
    }

    if (activities.length === 0) {
      this.showWarningSnackbar('No hay actividades para exportar en este módulo', 3000);
      return;
    }

    const data = activities.map(a => ({
      'Fecha/Hora': new Date(a.timestamp).toLocaleString(),
      'Usuario': a.user?.fullName || a.userCode,
      'Código Usuario': a.user?.userCode || a.userCode || '-',
      'Módulo': this.getModuleLabel(a.module),
      'Acción': a.action,
      'Descripción': a.description,
      'IP': a.ipAddress || '-',
      'Entidad': a.entityName || '-',
      'Duración': this.formatDuration(a.duration)
    }));


    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${(row as any)[h]}"`).join(','))
    ].join('\n');


    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${moduleToExport}_${new Date().getTime()}.csv`;
    link.click();

    this.showSuccessSnackbar('Excel generado exitosamente', 3000);
  }




  exportModuleToPDF(moduleValue: string, event: Event) {
    event.stopPropagation();

    const activities = this.getActivitiesByModule(moduleValue);

    if (activities.length === 0) {
      this.showWarningSnackbar('No hay actividades para exportar', 2000);
      return;
    }

    const doc = new jsPDF();
    const moduleLabel = this.getModuleLabel(moduleValue);


    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 20, 'F');


    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Auditoría - ${moduleLabel}`, 14, 10);


    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const fechaGeneracion = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(fechaGeneracion, 196, 10, { align: 'right' });


    doc.text(`Total: ${activities.length} registros`, 14, 16);


    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    const filters = this.filterForm.value;
    const selectedUser = filters.userId ? this.users().find(u => u.id === filters.userId) : null;

    let yPos = 24;


    let filtrosTexto = '';
    if (selectedUser) {
      filtrosTexto += `Usuario: ${selectedUser.userCode} - ${selectedUser.firstName} ${selectedUser.lastName}`;
    }
    if (filters.startDate) {
      if (filtrosTexto) filtrosTexto += ' | ';
      filtrosTexto += `Desde: ${new Date(filters.startDate).toLocaleDateString('es-ES')}`;
    }
    if (filters.endDate) {
      if (filtrosTexto) filtrosTexto += ' | ';
      filtrosTexto += `Hasta: ${new Date(filters.endDate).toLocaleDateString('es-ES')}`;
    }

    if (filtrosTexto) {
      doc.setFillColor(245, 245, 245);
      doc.rect(10, yPos - 3, 190, 6, 'F');
      doc.setTextColor(100, 100, 100);
      doc.text(`Filtros: ${filtrosTexto}`, 12, yPos);
      yPos += 8;
    } else {
      yPos += 2;
    }


    if (moduleValue === 'MACHINES') {

      const stats = this.getMachineStats(activities);


      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Resumen', 14, yPos);
      yPos += 5;

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);


      doc.text(`Pedidos: ${stats.totalOrders}`, 14, yPos);
      doc.text(`Tiempo total: ${this.formatDuration(stats.totalDuration)}`, 14, yPos + 4);


      doc.text(`Tiempo promedio: ${this.formatDuration(stats.avgDuration)}`, 105, yPos);
      doc.text(`Promedio colores: ${stats.avgColores ? stats.avgColores.toFixed(1) : '-'}`, 105, yPos + 4);

      yPos += 10;


      const tableData = stats.orderDetails.map((order: any, index: number) => [
        `${index + 1}`,
        order.articulo,
        order.otSap,
        order.descripcion.substring(0, 25) + (order.descripcion.length > 25 ? '...' : ''),
        order.numeroMaquina,
        order.numeroColores || '-',
        this.formatDuration(order.duration),
        order.historialEstados.length.toString()
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Artículo', 'OT SAP', 'Descripción', 'Máq', 'Col', 'Tiempo', 'Est']],
        body: tableData,
        styles: {
          fontSize: 6,
          cellPadding: 1.5,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7,
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 28 },
          2: { cellWidth: 25 },
          3: { cellWidth: 50 },
          4: { cellWidth: 12, halign: 'center' },
          5: { cellWidth: 10, halign: 'center' },
          6: { cellWidth: 22, halign: 'right' },
          7: { cellWidth: 10, halign: 'center' }
        },
        margin: { left: 10, right: 10 }
      });


      const finalY = (doc as any).lastAutoTable.finalY;
      if (finalY > 250) {
        doc.addPage();
        yPos = 15;
      } else {
        yPos = finalY + 8;
      }


      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Historial de Estados', 14, yPos);
      yPos += 5;


      const historialData: any[] = [];
      stats.orderDetails.forEach((order: any, index: number) => {
        order.historialEstados.forEach((estado: any) => {
          historialData.push([
            `#${index + 1}`,
            order.articulo,
            estado.estado,
            new Date(estado.timestamp).toLocaleDateString('es-ES') + '\n' +
            new Date(estado.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            this.formatDuration(estado.duration),
            `${estado.userCode}\n${estado.userName}`,
            estado.observaciones || '-'
          ]);
        });
      });

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Artículo', 'Estado', 'Fecha/Hora', 'Duración', 'Usuario', 'Observaciones']],
        body: historialData,
        styles: {
          fontSize: 6,
          cellPadding: 1.5,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7,
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 25 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 35 },
          6: { cellWidth: 55 }
        },
        margin: { left: 10, right: 10 }
      });

    } else {

      const tableData = activities.map(a => [
        new Date(a.timestamp).toLocaleDateString('es-ES') + '\n' +
        new Date(a.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        (a.user?.userCode || a.userCode || '-') + '\n' + (a.user?.fullName || 'Sistema'),
        a.action,
        a.description.substring(0, 60) + (a.description.length > 60 ? '...' : ''),
        this.getDuration(a)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Fecha/Hora', 'Usuario', 'Acción', 'Descripción', 'Duración']],
        body: tableData,
        styles: {
          fontSize: 6,
          cellPadding: 1.5,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7,
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'center' },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 70 },
          4: { cellWidth: 20, halign: 'right' }
        },
        margin: { left: 10, right: 10 }
      });
    }


    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 8,
        { align: 'center' }
      );
    }


    const timestamp = new Date().getTime();
    const fileName = `auditoria_${moduleValue.toLowerCase()}_${timestamp}.pdf`;
    doc.save(fileName);

    this.showSuccessSnackbar('PDF generado exitosamente', 2000);
  }


  exportModuleToExcel(moduleValue: string, event: Event) {
    event.stopPropagation();

    const activities = this.getActivitiesByModule(moduleValue);

    if (activities.length === 0) {
      this.showWarningSnackbar('No hay actividades para exportar', 2000);
      return;
    }

    const moduleLabel = this.getModuleLabel(moduleValue);
    const filters = this.filterForm.value;
    const selectedUser = filters.userId ? this.users().find(u => u.id === filters.userId) : null;

    let csvContent = '';


    const fechaGeneracion = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    csvContent += `AUDITORÍA - ${moduleLabel.toUpperCase()};;;;\n`;
    csvContent += `Fecha de generación:;${fechaGeneracion};;;\n`;
    csvContent += `Total de registros:;${activities.length};;;\n`;


    let filtrosTexto = '';
    if (selectedUser) {
      filtrosTexto = `Usuario: ${selectedUser.userCode} - ${selectedUser.firstName} ${selectedUser.lastName}`;
    }
    if (filters.startDate) {
      if (filtrosTexto) filtrosTexto += ' | ';
      filtrosTexto += `Desde: ${new Date(filters.startDate).toLocaleDateString('es-ES')}`;
    }
    if (filters.endDate) {
      if (filtrosTexto) filtrosTexto += ' | ';
      filtrosTexto += `Hasta: ${new Date(filters.endDate).toLocaleDateString('es-ES')}`;
    }
    if (filtrosTexto) {
      csvContent += `Filtros aplicados:;${filtrosTexto};;;\n`;
    }

    csvContent += ';;;;\n';


    if (moduleValue === 'MACHINES') {



      const stats = this.getMachineStats(activities);


      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += 'RESUMEN DE ESTADÍSTICAS;;;;\n';
      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += ';;;;\n';

      csvContent += 'Métrica;Valor;;;\n';
      csvContent += 'Pedidos completados;' + stats.totalOrders + ';;;\n';
      csvContent += 'Tiempo total;' + this.formatDuration(stats.totalDuration) + ';;;\n';
      csvContent += 'Tiempo promedio por pedido;' + this.formatDuration(stats.avgDuration) + ';;;\n';
      csvContent += 'Promedio de colores Pantone;' + (stats.avgColores ? stats.avgColores.toFixed(1) : '-') + ';;;\n';
      csvContent += ';;;;\n';
      csvContent += ';;;;\n';


      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += 'PEDIDOS COMPLETADOS;;;;\n';
      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += ';;;;\n';

      csvContent += '#;Artículo;OT SAP;Descripción;Máquina;Colores Pantone;Tiempo en LISTO;Cantidad de Estados\n';
      stats.orderDetails.forEach((order: any, index: number) => {
        const descripcion = order.descripcion.replace(/;/g, ',');
        csvContent += `${index + 1};${order.articulo};${order.otSap};${descripcion};${order.numeroMaquina};${order.numeroColores || '-'};${this.formatDuration(order.duration)};${order.historialEstados.length}\n`;
      });
      csvContent += ';;;;\n';
      csvContent += ';;;;\n';


      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += 'HISTORIAL DETALLADO DE ESTADOS;;;;\n';
      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += ';;;;\n';

      csvContent += 'Pedido;Artículo;OT SAP;Estado;Fecha;Hora;Duración;Código Usuario;Nombre Usuario;Observaciones\n';
      stats.orderDetails.forEach((order: any, index: number) => {
        order.historialEstados.forEach((estado: any, estadoIndex: number) => {
          const fecha = new Date(estado.timestamp).toLocaleDateString('es-ES');
          const hora = new Date(estado.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          const observaciones = (estado.observaciones || '-').replace(/;/g, ',');

          csvContent += `#${index + 1};${order.articulo};${order.otSap};${estado.estado};${fecha};${hora};${this.formatDuration(estado.duration)};${estado.userCode};${estado.userName};${observaciones}\n`;
        });


        if (index < stats.orderDetails.length - 1) {
          csvContent += ';;;;\n';
        }
      });

    } else {




      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += 'ACTIVIDADES DEL MÓDULO;;;;\n';
      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += ';;;;\n';

      csvContent += '#;Fecha;Hora;Código Usuario;Nombre Usuario;Acción;Descripción;Duración;Dirección IP;Entidad\n';

      activities.forEach((a, index) => {
        const fecha = new Date(a.timestamp).toLocaleDateString('es-ES');
        const hora = new Date(a.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const userCode = a.user?.userCode || a.userCode || '-';
        const userName = a.user?.fullName || 'Sistema';
        const action = a.action;
        const description = a.description.replace(/;/g, ',');
        const duration = this.getDuration(a);
        const ip = a.ipAddress || '-';
        const entity = a.entityName || '-';

        csvContent += `${index + 1};${fecha};${hora};${userCode};${userName};${action};${description};${duration};${ip};${entity}\n`;
      });
    }


    csvContent += ';;;;\n';
    csvContent += ';;;;\n';
    csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
    csvContent += 'FIN DEL REPORTE;;;;\n';
    csvContent += `Generado el ${fechaGeneracion};;;;\n`;
    csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';


    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().getTime();
    link.download = `auditoria_${moduleValue.toLowerCase()}_${timestamp}.csv`;
    link.click();

    this.showSuccessSnackbar('Excel generado exitosamente', 2000);
  }

  /**
   * Muestra un snackbar de éxito con estilo personalizado e icono (estilo máquinas)
   */
  private showSuccessSnackbar(message: string, duration: number = 3000) {
    const iconoHTML = '<span class="status-icon">✓</span>';
    const mensajeConIcono = `${iconoHTML}${message}`;
    
    const snackBarRef = this.snackBar.open('', 'Cerrar', {
      duration: duration,
      panelClass: ['status-listo-snackbar', 'animated-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    // Inyectar HTML con el icono
    setTimeout(() => {
      const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
      if (label) {
        label.innerHTML = mensajeConIcono;
      }
    }, 0);
  }

  /**
   * Muestra un snackbar de error con estilo personalizado e icono (estilo máquinas)
   */
  private showErrorSnackbar(message: string, duration: number = 3000) {
    const iconoHTML = '<span class="status-icon">✕</span>';
    const mensajeConIcono = `${iconoHTML}${message}`;
    
    const snackBarRef = this.snackBar.open('', 'Cerrar', {
      duration: duration,
      panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    // Inyectar HTML con el icono
    setTimeout(() => {
      const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
      if (label) {
        label.innerHTML = mensajeConIcono;
      }
    }, 0);
  }

  /**
   * Muestra un snackbar de advertencia con estilo personalizado e icono (estilo máquinas)
   */
  private showWarningSnackbar(message: string, duration: number = 3000) {
    const iconoHTML = '<span class="status-icon">⚠</span>';
    const mensajeConIcono = `${iconoHTML}${message}`;
    
    const snackBarRef = this.snackBar.open('', 'Cerrar', {
      duration: duration,
      panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    // Inyectar HTML con el icono
    setTimeout(() => {
      const label = document.querySelector('.status-preparando-snackbar .mat-mdc-snack-bar-label');
      if (label) {
        label.innerHTML = mensajeConIcono;
      }
    }, 0);
  }

  /**
   * Muestra un snackbar informativo con estilo personalizado e icono (estilo máquinas)
   */
  private showInfoSnackbar(message: string, duration: number = 2000) {
    const iconoHTML = '<span class="status-icon">ℹ</span>';
    const mensajeConIcono = `${iconoHTML}${message}`;
    
    const snackBarRef = this.snackBar.open('', 'Cerrar', {
      duration: duration,
      panelClass: ['status-corriendo-snackbar', 'animated-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    // Inyectar HTML con el icono
    setTimeout(() => {
      const label = document.querySelector('.status-corriendo-snackbar .mat-mdc-snack-bar-label');
      if (label) {
        label.innerHTML = mensajeConIcono;
      }
    }, 0);
  }

  /**
   * Calcula el tiempo transcurrido entre dos timestamps
   */
  getElapsedTime(timestamp1: string, timestamp2: string): string {
    try {
      const date1 = new Date(timestamp1);
      const date2 = new Date(timestamp2);
      
      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        return '-';
      }

      const diffMs = Math.abs(date2.getTime() - date1.getTime());
      const diffSeconds = Math.floor(diffMs / 1000);

      if (diffSeconds === 0) {
        return '-';
      }

      return this.formatDuration(diffSeconds);
    } catch (error) {
      console.error('Error calculando tiempo transcurrido:', error);
      return '-';
    }
  }
}
