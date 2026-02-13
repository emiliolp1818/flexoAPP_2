// ============================================================================
// REPORTE DE AUDITORÍA COMPLETO DEL SISTEMA
// ============================================================================

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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { trigger, state, style, transition, animate } from '@angular/animations';

// ============================================================================
// INTERFACES
// ============================================================================

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
  expanded?: boolean; // Para controlar el estado de expansión
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
  // Señales reactivas
  loading = signal(false);
  activities = signal<AuditActivity[]>([]);
  filteredActivities = signal<AuditActivity[]>([]);
  users = signal<any[]>([]);
  filteredUsers = signal<any[]>([]); // Para el filtro de búsqueda de usuarios

  // Variables para búsqueda de usuario
  userSearchText: string = '';

  // Formulario de filtros
  filterForm: FormGroup;

  // Módulo seleccionado para visualización
  selectedModule = signal<string | null>(null);

  // Cache para estadísticas de máquinas (evita recalcular en cada render)
  private machineStatsCache: any = null;
  private machineStatsActivitiesCount: number = 0;

  // Cache para actividades por módulo (evita recalcular en cada render)
  private activitiesByModuleCache: Map<string, AuditActivity[]> = new Map();
  private activitiesCacheVersion: number = 0;

  // Cache para colores Pantone por artículo
  private pantoneColorsCache: Map<string, number> = new Map();

  // Función para mostrar el valor en el autocomplete (YA NO SE USA)
  // displayUserFn(user: any): string {
  //   return user ? user.userCode : '';
  // }

  // Módulos disponibles
  modules = [
    { value: 'AUTH', label: 'Autenticación', icon: 'lock' },
    { value: 'MACHINES', label: 'Máquinas', icon: 'precision_manufacturing' },
    { value: 'DESIGNS', label: 'Diseños', icon: 'palette' },
    { value: 'DOCUMENTS', label: 'Documentos', icon: 'description' },
    { value: 'REPORTS', label: 'Reportes', icon: 'assessment' },
    { value: 'CONFIG', label: 'Configuración', icon: 'settings' },
    { value: 'SETTINGS', label: 'Ajustes', icon: 'tune' },
    { value: 'PROFILE', label: 'Perfil', icon: 'person' },
    { value: 'CONDICION_UNICA', label: 'Condición Única', icon: 'label' }
  ];

  // Columnas de la tabla
  displayedColumns = ['timestamp', 'user', 'module', 'action', 'description', 'details'];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      userId: [null],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit() {
    console.log('🚀 Componente de reportes inicializado');
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const response: any = await this.http.get(`${environment.apiUrl}/users`).toPromise();

      let usersData: any[] = [];

      // El backend puede devolver directamente un array o un objeto con { success, data }
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

    // Limpiar cache de estadísticas y actividades por módulo
    this.machineStatsCache = null;
    this.machineStatsActivitiesCount = 0;
    this.activitiesByModuleCache.clear();
    this.activitiesCacheVersion++;

    try {
      const filters = this.filterForm.value;

      console.log('🔍 ===== INICIO CARGA DE ACTIVIDADES =====');
      console.log('🔍 Filtros del formulario:', filters);
      console.log('🔍 userId del formulario:', filters.userId);
      console.log('🔍 Tipo de userId:', typeof filters.userId);
      console.log('🔍 userSearchText actual:', this.userSearchText);

      const params: any = {
        page: 1,
        pageSize: 1000
      };

      // Agregar userId si está seleccionado (OPCIONAL)
      if (filters.userId && filters.userId > 0) {
        params.userId = filters.userId;
        console.log('✅ FILTRO DE USUARIO APLICADO - userId:', filters.userId);

        // Buscar el usuario en la lista para mostrar su información
        const selectedUser = this.users().find(u => u.id === filters.userId);
        if (selectedUser) {
          console.log('✅ Usuario seleccionado:', {
            id: selectedUser.id,
            code: selectedUser.userCode,
            name: `${selectedUser.firstName} ${selectedUser.lastName}`
          });
        }
      } else {
        console.log('⚠️ SIN FILTRO DE USUARIO - mostrando TODAS las actividades');
        console.log('⚠️ Razón: userId =', filters.userId, '(debe ser > 0)');
      }

      // NO aplicar filtro de fechas por defecto - mostrar TODAS las actividades
      // Solo filtrar si el usuario selecciona fechas específicas
      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
        console.log('✅ FILTRO DE FECHA INICIO:', filters.startDate);
      }

      if (filters.endDate) {
        // Ajustar endDate para incluir todo el día
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
        console.log('✅ FILTRO DE FECHA FIN:', filters.endDate);
      }

      if (!filters.startDate && !filters.endDate) {
        console.log('📅 Sin filtro de fechas - mostrando TODAS las actividades');
      }

      console.log('📤 Parámetros enviados al backend:', params);

      const response: any = await this.http.get(`${environment.apiUrl}/audit/activities`, { params }).toPromise();

      console.log('📊 Respuesta completa del backend:', response);
      console.log('📊 Total de actividades recibidas:', response?.activities?.length || 0);

      if (response && response.activities) {
        const activities = response.activities.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
          expanded: false
        }));

        console.log('📊 Total de actividades a mostrar:', activities.length);

        // Enriquecer actividades de máquinas con colores Pantone
        await this.enrichActivitiesWithPantoneColors(activities);

        this.activities.set(activities);
        this.filteredActivities.set(activities);

        if (activities.length === 0) {
          this.snackBar.open('No se encontraron actividades con los filtros seleccionados', 'Cerrar', { duration: 3000 });
        }
      } else {
        console.warn('⚠️ No se recibieron actividades del backend');
        this.activities.set([]);
        this.filteredActivities.set([]);
        this.snackBar.open('No se encontraron actividades', 'Cerrar', { duration: 3000 });
      }
    } catch (error) {
      console.error('❌ Error cargando actividades:', error);
      this.snackBar.open('Error al cargar actividades', 'Cerrar', { duration: 3000 });
      this.activities.set([]);
      this.filteredActivities.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  // Enriquecer actividades de máquinas con colores Pantone desde la base de datos
  private async enrichActivitiesWithPantoneColors(activities: AuditActivity[]) {
    console.log('🎨 ===== INICIO ENRIQUECIMIENTO DE COLORES PANTONE =====');

    // Filtrar solo actividades de máquinas
    const machineActivities = activities.filter(a => a.module === 'MACHINES');
    console.log(`🎨 Total actividades de máquinas: ${machineActivities.length}`);

    // Extraer artículos únicos con más detalle
    const uniqueArticles = new Set<string>();
    const articulosDebug: any[] = [];

    machineActivities.forEach((a, index) => {
      const machineInfo = this.getMachineInfo(a);
      const articulo = machineInfo?.articulo;

      articulosDebug.push({
        activityId: a.id,
        articulo: articulo,
        otSap: machineInfo?.otSap,
        details: a.details ? 'Sí' : 'No',
        newValues: a.newValues ? 'Sí' : 'No'
      });

      if (articulo && articulo !== '-') {
        uniqueArticles.add(articulo);
      }
    });

    console.log(`🎨 Artículos únicos encontrados: ${uniqueArticles.size}`);
    console.log(`🎨 Lista de artículos:`, Array.from(uniqueArticles));
    console.log(`🎨 Debug de extracción de artículos:`, articulosDebug);

    if (uniqueArticles.size === 0) {
      console.warn('⚠️ NO SE ENCONTRARON ARTÍCULOS - No se consultarán colores Pantone');
      return;
    }

    // Consultar colores Pantone para cada artículo único
    for (const articulo of uniqueArticles) {
      if (this.pantoneColorsCache.has(articulo)) {
        console.log(`✅ Colores Pantone para ${articulo} ya en cache:`, this.pantoneColorsCache.get(articulo));
        continue;
      }

      try {
        const url = `${environment.apiUrl}/designs/pantone-colors/${articulo}`;
        console.log(`🔍 Consultando: ${url}`);

        const pantoneResponse: any = await this.http.get(url).toPromise();
        const pantoneCount = pantoneResponse?.pantoneCount || 0;
        const pantoneColors = pantoneResponse?.pantoneColors || [];

        this.pantoneColorsCache.set(articulo, pantoneCount);
        console.log(`🎨 ✅ Colores Pantone para ${articulo}:`, pantoneCount, pantoneColors);
      } catch (error: any) {
        console.error(`❌ Error al obtener colores Pantone para ${articulo}:`, {
          status: error?.status,
          message: error?.message,
          url: error?.url
        });
        this.pantoneColorsCache.set(articulo, 0);
      }
    }

    console.log('🎨 ===== CACHE DE COLORES PANTONE =====');
    console.log('🎨 Contenido del cache:', Array.from(this.pantoneColorsCache.entries()));
    console.log('✅ Enriquecimiento de colores Pantone completado');
  }

  applyFilters() {
    this.loadActivities();
  }

  clearFilters() {
    console.log('🧹 Limpiando todos los filtros');
    this.filterForm.reset();
    this.userSearchText = '';
    this.filteredUsers.set(this.users());

    // Limpiar las actividades mostradas
    this.activities.set([]);
    this.filteredActivities.set([]);

    // Limpiar cache de estadísticas y actividades por módulo
    this.machineStatsCache = null;
    this.machineStatsActivitiesCount = 0;
    this.activitiesByModuleCache.clear();
    this.activitiesCacheVersion++;

    // Cargar actividades sin filtros automáticamente
    this.loadActivities();
  }

  // Búsqueda de usuario - Mejorada para buscar por código numérico y autoseleccionar
  onUserSearch() {
    const searchTerm = this.userSearchText.toLowerCase().trim();

    console.log('🔍 onUserSearch - Término de búsqueda:', searchTerm);

    if (!searchTerm) {
      this.filteredUsers.set(this.users());
      this.filterForm.patchValue({ userId: null });
      console.log('🔍 Búsqueda vacía - userId limpiado');
      return;
    }

    // Buscar por código exacto primero
    const exactCodeMatch = this.users().find(user =>
      user.userCode.toLowerCase() === searchTerm
    );

    // Si hay coincidencia exacta por código, seleccionar automáticamente
    if (exactCodeMatch) {
      console.log('✅ Usuario encontrado por código exacto:', exactCodeMatch);
      console.log('✅ Configurando userId en formulario:', exactCodeMatch.id);
      this.userSearchText = exactCodeMatch.userCode;
      this.filterForm.patchValue({ userId: exactCodeMatch.id });
      this.filteredUsers.set([exactCodeMatch]);

      // Verificar que el valor se guardó correctamente
      const currentUserId = this.filterForm.get('userId')?.value;
      console.log('✅ userId después de patchValue:', currentUserId);

      return;
    }

    // Si no hay coincidencia exacta, filtrar por código, nombre o apellido
    const filtered = this.users().filter(user =>
      // Buscar por código de usuario (exacto o parcial)
      user.userCode.toLowerCase().includes(searchTerm) ||
      // Buscar por nombre
      user.firstName.toLowerCase().includes(searchTerm) ||
      // Buscar por apellido
      user.lastName.toLowerCase().includes(searchTerm) ||
      // Buscar por nombre completo
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)
    );

    console.log('🔍 Usuarios filtrados:', filtered.length);
    this.filteredUsers.set(filtered);

    // Si solo hay un resultado, seleccionarlo automáticamente
    if (filtered.length === 1) {
      console.log('✅ Usuario único encontrado:', filtered[0]);
      console.log('✅ Configurando userId en formulario:', filtered[0].id);
      this.userSearchText = filtered[0].userCode;
      this.filterForm.patchValue({ userId: filtered[0].id });

      // Verificar que el valor se guardó correctamente
      const currentUserId = this.filterForm.get('userId')?.value;
      console.log('✅ userId después de patchValue:', currentUserId);
    } else {
      // Si hay múltiples resultados o ninguno, limpiar la selección
      console.log('⚠️ Múltiples resultados o ninguno - limpiando userId');
      this.filterForm.patchValue({ userId: null });
    }
  }

  // Cuando se selecciona un usuario del autocomplete (YA NO SE USA)
  // onUserSelected(event: MatAutocompleteSelectedEvent) {
  //   const user = event.option.value;
  //   this.userSearchText = user.userCode;
  //   this.filterForm.patchValue({ userId: user.id });
  //   console.log('✅ Usuario seleccionado:', user);
  // }

  // Limpiar búsqueda de usuario
  clearUserSearch() {
    this.userSearchText = '';
    this.filteredUsers.set(this.users());
    this.filterForm.patchValue({ userId: null });
  }

  getModuleLabel(module: string): string {
    const found = this.modules.find(m => m.value === module);
    return found ? found.label : module;
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
      'PROFILE': 'accent',
      'CONDICION_UNICA': 'warn'
    };
    return colors[module] || 'primary';
  }

  formatDuration(seconds: number | undefined): string {
    // Si es undefined o null, retornar guion
    if (seconds === undefined || seconds === null) return '-';

    // Si es NaN, retornar guion
    if (isNaN(seconds)) return '-';

    // Si es 0, retornar "0s" en lugar de guion
    if (seconds === 0) return '0s';

    // Calcular horas, minutos y segundos
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Formato: HH:MM:SS o MM:SS dependiendo si hay horas
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }

  // Extraer duración de la actividad (desde duration o desde la descripción)
  getDuration(activity: AuditActivity): string {
    // 1. Si existe duration y es válido, usarlo
    if (activity.duration && !isNaN(activity.duration) && activity.duration > 0) {
      return this.formatDuration(activity.duration);
    }

    // 2. Intentar extraer de la descripción (formato: "Duración: X,XX min" o "Duración: X.XX min")
    if (activity.description) {
      const durationMatch = activity.description.match(/Duración:\s*(\d+)[,.](\d+)\s*min/i);
      if (durationMatch) {
        const minutes = parseInt(durationMatch[1]);
        const decimals = parseInt(durationMatch[2]);
        const totalSeconds = (minutes * 60) + Math.round((decimals / 100) * 60);
        return this.formatDuration(totalSeconds);
      }

      // Formato alternativo: "X min Y s"
      const altMatch = activity.description.match(/(\d+)\s*min\s*(\d+)\s*s/i);
      if (altMatch) {
        const minutes = parseInt(altMatch[1]);
        const seconds = parseInt(altMatch[2]);
        const totalSeconds = (minutes * 60) + seconds;
        return this.formatDuration(totalSeconds);
      }
    }

    // 3. Intentar extraer de details
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
        // Ignorar error
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

  // Método para hacer toggle del estado expandido
  toggleExpanded(activity: AuditActivity, event: Event) {
    event.stopPropagation();
    activity.expanded = !activity.expanded;
    console.log('🔄 Toggle expandido:', {
      id: activity.id,
      expanded: activity.expanded,
      hasDetails: !!activity.details,
      hasOldValues: !!activity.oldValues,
      hasNewValues: !!activity.newValues
    });

    // Forzar actualización de la tabla
    const currentActivities = this.filteredActivities();
    this.filteredActivities.set([...currentActivities]);
  }

  /**
   * Parsea un string en formato TimeSpan de C# a segundos totales
   * Formato esperado: "HH:mm:ss.fffffff" o "d.HH:mm:ss.fffffff"
   * Ejemplos: "00:28:31.7063456", "1.05:30:15.123"
   */
  parseTimeSpanToSeconds(timeSpanString: string): number {
    if (!timeSpanString || typeof timeSpanString !== 'string') {
      return 0;
    }

    try {
      // Remover espacios en blanco
      const trimmed = timeSpanString.trim();

      // Formato: [días.]horas:minutos:segundos[.fracciones]
      const parts = trimmed.split('.');
      let days = 0;
      let timePart = '';
      let fractionPart = 0;

      if (parts.length === 1) {
        // Solo tiempo: "HH:mm:ss"
        timePart = parts[0];
      } else if (parts.length === 2) {
        // Puede ser "HH:mm:ss.fff" o "d.HH:mm:ss"
        if (parts[0].includes(':')) {
          // Es "HH:mm:ss.fff"
          timePart = parts[0];
          fractionPart = parseFloat('0.' + parts[1]);
        } else {
          // Es "d.HH:mm:ss"
          days = parseInt(parts[0]);
          timePart = parts[1];
        }
      } else if (parts.length === 3) {
        // Es "d.HH:mm:ss.fff"
        days = parseInt(parts[0]);
        timePart = parts[1];
        fractionPart = parseFloat('0.' + parts[2]);
      }

      // Parsear la parte de tiempo HH:mm:ss
      const timeComponents = timePart.split(':');
      if (timeComponents.length !== 3) {
        console.warn('⚠️ Formato de TimeSpan inválido:', timeSpanString);
        return 0;
      }

      const hours = parseInt(timeComponents[0]) || 0;
      const minutes = parseInt(timeComponents[1]) || 0;
      const seconds = parseInt(timeComponents[2]) || 0;

      // Calcular total en segundos
      const totalSeconds = (days * 24 * 60 * 60) +
        (hours * 60 * 60) +
        (minutes * 60) +
        seconds +
        fractionPart;

      console.log(`✅ TimeSpan parseado: "${timeSpanString}" → ${totalSeconds} seg (${days}d ${hours}h ${minutes}m ${seconds}s + ${fractionPart}s)`);
      return totalSeconds;
    } catch (error) {
      console.error('❌ Error al parsear TimeSpan:', timeSpanString, error);
      return 0;
    }
  }

  // Extraer solo el número de máquina
  getNumeroMaquina(activity: AuditActivity): string | null {
    try {
      let numeroMaquina: string | null = null;

      // 1. Intentar extraer de details primero (más específico)
      if (activity.details) {
        try {
          const details = JSON.parse(activity.details);
          // PRIORIDAD: buscar 'maquina' primero (es el campo que viene del backend)
          numeroMaquina = details.maquina || details.Maquina ||
            details.numeroMaquina || details.NumeroMaquina ||
            details.machineNumber || details.MachineNumber ||
            details.numero_maquina || details.maquinaId ||
            details.MaquinaId || details.machineId ||
            details.MachineId || details.machine || details.Machine;
          if (numeroMaquina) {
            console.log('🔢 Número de máquina desde details:', numeroMaquina);
            return numeroMaquina.toString();
          }
        } catch (e) {
          // Ignorar error
        }
      }

      // 2. Intentar extraer de newValues
      if (activity.newValues) {
        try {
          const newVals = JSON.parse(activity.newValues);
          // PRIORIDAD: buscar 'maquina' primero
          numeroMaquina = newVals.maquina || newVals.Maquina ||
            newVals.numeroMaquina || newVals.NumeroMaquina ||
            newVals.machineNumber || newVals.MachineNumber ||
            newVals.numero_maquina || newVals.maquinaId ||
            newVals.MaquinaId || newVals.machineId ||
            newVals.MachineId || newVals.machine || newVals.Machine;
          if (numeroMaquina) {
            console.log('🔢 Número de máquina desde newValues:', numeroMaquina);
            return numeroMaquina.toString();
          }
        } catch (e) {
          // Ignorar error
        }
      }

      // 3. Intentar extraer de oldValues
      if (activity.oldValues) {
        try {
          const oldVals = JSON.parse(activity.oldValues);
          // PRIORIDAD: buscar 'maquina' primero
          numeroMaquina = oldVals.maquina || oldVals.Maquina ||
            oldVals.numeroMaquina || oldVals.NumeroMaquina ||
            oldVals.machineNumber || oldVals.MachineNumber ||
            oldVals.numero_maquina || oldVals.maquinaId ||
            oldVals.MaquinaId || oldVals.machineId ||
            oldVals.MachineId || oldVals.machine || oldVals.Machine;
          if (numeroMaquina) {
            console.log('🔢 Número de máquina desde oldValues:', numeroMaquina);
            return numeroMaquina.toString();
          }
        } catch (e) {
          // Ignorar error
        }
      }

      // 4. Si el módulo es MACHINES y entityType es Maquina, usar entityId
      if (activity.module === 'MACHINES' && activity.entityType &&
        (activity.entityType.toLowerCase().includes('machine') || activity.entityType.toLowerCase().includes('maquina'))) {
        if (activity.entityId) {
          console.log('🔢 Número de máquina desde entityId (módulo MACHINES):', activity.entityId);
          return activity.entityId.toString();
        }
      }

      console.log('❌ No se encontró número de máquina para actividad:', activity.id, {
        module: activity.module,
        entityType: activity.entityType,
        entityId: activity.entityId,
        entityName: activity.entityName
      });
      return null;
    } catch (error) {
      console.error('Error en getNumeroMaquina:', error);
      return null;
    }
  }

  // Extraer información de máquinas de los detalles
  getMachineInfo(activity: AuditActivity): any {
    try {
      let machineInfo: any = {
        articulo: null,
        otSap: null,
        descripcion: null,
        numeroMaquina: null
      };

      let hasData = false;

      // Si el entityType es Machine o Maquina, usar entityName como número de máquina
      if (activity.entityType && (activity.entityType.toLowerCase().includes('machine') || activity.entityType.toLowerCase().includes('maquina'))) {
        if (activity.entityName) {
          machineInfo.numeroMaquina = activity.entityName;
          hasData = true;
        }
      }

      // Intentar parsear los detalles si existen
      if (activity.details) {
        try {
          const details = JSON.parse(activity.details);
          console.log('📦 Details parseados:', details);

          machineInfo.articulo = details.articulo || details.Articulo || details.article || details.Article || machineInfo.articulo;
          machineInfo.otSap = details.otSap || details.OtSap || details.ot_sap || details.OT_SAP || details.orderNumber || details.OrderNumber || machineInfo.otSap;
          machineInfo.descripcion = details.descripcion || details.Descripcion || details.referencia || details.Referencia || details.description || details.Description || machineInfo.descripcion;
          // PRIORIDAD: buscar 'maquina' primero
          machineInfo.numeroMaquina = machineInfo.numeroMaquina || details.maquina || details.Maquina ||
            details.numeroMaquina || details.NumeroMaquina ||
            details.machineNumber || details.MachineNumber ||
            details.numero_maquina || details.maquinaId ||
            details.MaquinaId || details.machineId || details.MachineId;

          if (machineInfo.articulo || machineInfo.otSap || machineInfo.descripcion || machineInfo.numeroMaquina) {
            hasData = true;
          }
        } catch (e) {
          console.warn('Error parseando details:', e);
        }
      }

      // Si no hay detalles, intentar extraer de newValues
      if (activity.newValues) {
        try {
          const newVals = JSON.parse(activity.newValues);
          console.log('📦 NewValues parseados:', newVals);

          machineInfo.articulo = machineInfo.articulo || newVals.articulo || newVals.Articulo || newVals.article || newVals.Article;
          machineInfo.otSap = machineInfo.otSap || newVals.otSap || newVals.OtSap || newVals.ot_sap || newVals.OT_SAP || newVals.orderNumber || newVals.OrderNumber;
          machineInfo.descripcion = machineInfo.descripcion || newVals.descripcion || newVals.Descripcion || newVals.referencia || newVals.Referencia || newVals.description || newVals.Description;
          // PRIORIDAD: buscar 'maquina' primero
          machineInfo.numeroMaquina = machineInfo.numeroMaquina || newVals.maquina || newVals.Maquina ||
            newVals.numeroMaquina || newVals.NumeroMaquina ||
            newVals.machineNumber || newVals.MachineNumber ||
            newVals.numero_maquina || newVals.maquinaId ||
            newVals.MaquinaId || newVals.machineId || newVals.MachineId;

          if (machineInfo.articulo || machineInfo.otSap || machineInfo.descripcion || machineInfo.numeroMaquina) {
            hasData = true;
          }
        } catch (e) {
          console.warn('Error parseando newValues:', e);
        }
      }

      // Si no hay detalles ni newValues, intentar oldValues
      if (activity.oldValues) {
        try {
          const oldVals = JSON.parse(activity.oldValues);
          console.log('📦 OldValues parseados:', oldVals);

          machineInfo.articulo = machineInfo.articulo || oldVals.articulo || oldVals.Articulo || oldVals.article || oldVals.Article;
          machineInfo.otSap = machineInfo.otSap || oldVals.otSap || oldVals.OtSap || oldVals.ot_sap || oldVals.OT_SAP || oldVals.orderNumber || oldVals.OrderNumber;
          machineInfo.descripcion = machineInfo.descripcion || oldVals.descripcion || oldVals.Descripcion || oldVals.referencia || oldVals.Referencia || oldVals.description || oldVals.Description;
          // PRIORIDAD: buscar 'maquina' primero
          machineInfo.numeroMaquina = machineInfo.numeroMaquina || oldVals.maquina || oldVals.Maquina ||
            oldVals.numeroMaquina || oldVals.NumeroMaquina ||
            oldVals.machineNumber || oldVals.MachineNumber ||
            oldVals.numero_maquina || oldVals.maquinaId ||
            oldVals.MaquinaId || oldVals.machineId || oldVals.MachineId;

          if (machineInfo.articulo || machineInfo.otSap || machineInfo.descripcion || machineInfo.numeroMaquina) {
            hasData = true;
          }
        } catch (e) {
          console.warn('Error parseando oldValues:', e);
        }
      }

      console.log('🔍 Machine info extraída:', machineInfo, 'hasData:', hasData);

      return hasData ? machineInfo : null;
    } catch (error) {
      console.error('Error en getMachineInfo:', error);
      return null;
    }
  }

  // Predicate function to determine which rows should show the expanded detail
  isExpandedRow = (index: number, row: AuditActivity) => row.expanded === true;

  // Agrupar actividades por módulo (CON CACHE)
  getActivitiesByModule(module: string): AuditActivity[] {
    // Verificar si existe en cache
    if (this.activitiesByModuleCache.has(module)) {
      return this.activitiesByModuleCache.get(module)!;
    }

    // Calcular y guardar en cache
    const activities = this.filteredActivities().filter(a => a.module === module);
    this.activitiesByModuleCache.set(module, activities);

    return activities;
  }

  // Obtener conteo de actividades por módulo (CON CACHE)
  getModuleCount(module: string): number {
    return this.getActivitiesByModule(module).length;
  }

  // Seleccionar módulo para ver detalles
  selectModule(module: string | null) {
    this.selectedModule.set(module);
  }

  // Calcular estadísticas para módulo de máquinas (CON CACHE)
  getMachineStats(activities: AuditActivity[]): any {
    // Si el cache es válido, retornarlo
    if (this.machineStatsCache && this.machineStatsActivitiesCount === activities.length) {
      console.log('✅ Usando cache de estadísticas de máquinas');
      return this.machineStatsCache;
    }

    console.log('🔧 ===== INICIO getMachineStats (RECALCULANDO) =====');
    console.log('🔧 Total actividades recibidas:', activities.length);

    // DEBUG: Mostrar TODAS las actividades de MACHINES para ver qué hay
    const allMachineActivities = activities.filter(a => a.module === 'MACHINES');
    console.log('🔧 Total actividades de MACHINES:', allMachineActivities.length);

    if (allMachineActivities.length > 0) {
      console.log('🔧 Primeras 5 actividades de MACHINES:', allMachineActivities.slice(0, 5).map(a => ({
        id: a.id,
        action: a.action,
        description: a.description,
        duration: a.duration,
        details: a.details
      })));
    }

    // Contar por action para ver qué tipos hay
    const actionCounts: Record<string, number> = {};
    allMachineActivities.forEach(a => {
      actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
    });
    console.log('🔧 Conteo por action:', actionCounts);

    // Filtrar actividades de máquinas que cambiaron de estado
    // INCLUIR: PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
    const machineActivities = activities.filter(a => {
      if (a.module !== 'MACHINES') return false;

      // Verificar en description (case-insensitive)
      const descriptionMatch = a.description &&
        (a.description.toUpperCase().includes('TERMINADO') ||
          a.description.toUpperCase().includes('LISTO') ||
          a.description.toUpperCase().includes('PREPARANDO') ||
          a.description.toUpperCase().includes('SUSPENDIDO') ||
          a.description.toUpperCase().includes('CORRIENDO'));

      // Verificar en newValues
      let newValuesMatch = false;
      if (a.newValues) {
        try {
          const newVals = typeof a.newValues === 'string' ? JSON.parse(a.newValues) : a.newValues;
          const estadoUpper = (newVals.estado || newVals.Estado || '').toUpperCase();
          newValuesMatch = estadoUpper === 'TERMINADO' || estadoUpper === 'LISTO' ||
            estadoUpper === 'PREPARANDO' || estadoUpper === 'SUSPENDIDO' ||
            estadoUpper === 'CORRIENDO';
        } catch (e) {
          // Ignorar error de parseo
        }
      }

      // Verificar en action (por si el action incluye algún estado)
      const actionMatch = a.action &&
        (a.action.toUpperCase().includes('TERMINADO') ||
          a.action.toUpperCase().includes('LISTO') ||
          a.action.toUpperCase().includes('PREPARANDO') ||
          a.action.toUpperCase().includes('SUSPENDIDO') ||
          a.action.toUpperCase().includes('CORRIENDO'));

      return descriptionMatch || newValuesMatch || actionMatch;
    });

    console.log('🔧 Actividades filtradas (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO):', machineActivities.length);
    console.log('🔧 Diferencia:', allMachineActivities.length - machineActivities.length, 'actividades descartadas');

    // DEBUG: Mostrar las actividades filtradas
    if (machineActivities.length > 0) {
      console.log('🔧 Primera actividad con cambio de estado:', machineActivities[0]);
    } else {
      console.warn('⚠️ NO SE ENCONTRARON ACTIVIDADES CON CAMBIOS DE ESTADO');
      console.warn('⚠️ Verifica que las actividades tengan:');
      console.warn('   - module: "MACHINES"');
      console.warn('   - action: "MACHINE_STATUS_CHANGED"');
      console.warn('   - description con algún estado válido, o newValues.estado con estado válido');
    }

    // Agrupar actividades por pedido (artículo + OT SAP)
    const pedidosMap = new Map<string, {
      articulo: string;
      otSap: string;
      descripcion: string;
      numeroMaquina: string;
      numeroColores: number;
      totalDuration: number;
      totalDurationListo: number; // Solo tiempo en estado LISTO
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

      // Extraer número de colores Pantone desde el cache
      let numeroColores = 0;

      if (articulo && articulo !== '-' && this.pantoneColorsCache.has(articulo)) {
        numeroColores = this.pantoneColorsCache.get(articulo) || 0;
      } else if (articulo && articulo !== '-') {
        console.log(`⚠️ Artículo ${articulo} no encontrado en cache de colores Pantone`);
        // Fallback: intentar extraer de details o newValues
        if (a.details) {
          try {
            const details = JSON.parse(a.details);
            numeroColores = details.numeroColores || details.NumeroColores ||
              details.numero_colores || details.colorCount || 0;
          } catch (e) {
            // Ignorar error
          }
        }

        if (numeroColores === 0 && a.newValues) {
          try {
            const newVals = JSON.parse(a.newValues);
            numeroColores = newVals.numeroColores || newVals.NumeroColores ||
              newVals.numero_colores || newVals.colorCount || 0;
          } catch (e) {
            // Ignorar error
          }
        }
      }

      // Extraer estado y observaciones
      let estadoPedido = '-';
      let observaciones = '';
      if (a.newValues) {
        try {
          const newVals = typeof a.newValues === 'string' ? JSON.parse(a.newValues) : a.newValues;
          estadoPedido = newVals.estado || newVals.Estado || '-';

          // Extraer observaciones según el estado
          let rawObservaciones = newVals.observaciones || newVals.Observaciones || '';

          // DEBUG: Log para ver qué observaciones vienen del backend
          console.log(`🔍 [${otSap}] Estado: ${estadoPedido}, Observaciones raw:`, rawObservaciones);

          // Filtrar el mensaje automático del sistema
          const mensajesFiltrar = [
            'Programa nuevo - Información de tabla de diseño - Pendiente de asignación de estado por operario',
            'Programa nuevo',
            'Información de tabla de diseño',
            'Pendiente de asignación de estado por operario'
          ];

          // Si las observaciones contienen alguno de los mensajes a filtrar, limpiarlas
          let observacionesLimpias = rawObservaciones;
          for (const mensaje of mensajesFiltrar) {
            observacionesLimpias = observacionesLimpias.replace(mensaje, '').trim();
          }

          // Limpiar guiones y espacios extras
          observacionesLimpias = observacionesLimpias.replace(/^[\s\-]+|[\s\-]+$/g, '').trim();

          observaciones = observacionesLimpias;

          // DEBUG: Log para ver las observaciones después del filtrado
          console.log(`🔍 [${otSap}] Observaciones después de filtrar:`, observaciones);
        } catch (e) {
          // Ignorar error
        }
      }

      if (estadoPedido === '-' && a.description) {
        const match = a.description.match(/→\s*(\w+)/);
        if (match) {
          estadoPedido = match[1];
        }
      }

      // Extraer información del usuario
      const userCode = a.user?.userCode || a.userCode || '-';
      const userName = a.user?.fullName || `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.trim() || '-';

      // Si el pedido ya existe, agregar al historial
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
        // Sumar duración solo si el estado es LISTO
        if (estadoPedido.toUpperCase() === 'LISTO') {
          pedido.totalDurationListo += duration;
        }
        // Actualizar número de colores si es mayor
        if (numeroColores > pedido.numeroColores) {
          pedido.numeroColores = numeroColores;
        }
      } else {
        // Crear nuevo pedido
        const durationListo = estadoPedido.toUpperCase() === 'LISTO' ? duration : 0;
        pedidosMap.set(key, {
          articulo: articulo,
          otSap: otSap,
          descripcion: machineInfo?.descripcion || '-',
          numeroMaquina: this.getNumeroMaquina(a) || '-',
          numeroColores: numeroColores,
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

    // Convertir el mapa a array y ordenar historial de estados por fecha
    // SOLO INCLUIR pedidos que tengan al menos un estado LISTO
    const orderDetails = Array.from(pedidosMap.values())
      .filter(pedido => pedido.historialEstados.some(h => h.estado.toUpperCase() === 'LISTO'))
      .map(pedido => {
        // Ordenar historial por timestamp (más antiguo primero)
        pedido.historialEstados.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        return {
          articulo: pedido.articulo,
          otSap: pedido.otSap,
          descripcion: pedido.descripcion,
          numeroMaquina: pedido.numeroMaquina,
          numeroColores: pedido.numeroColores,
          duration: pedido.totalDurationListo, // Solo tiempo en estado LISTO
          historialEstados: pedido.historialEstados,
          // Para compatibilidad, usar el último estado y timestamp
          estado: pedido.historialEstados[pedido.historialEstados.length - 1]?.estado || '-',
          timestamp: pedido.historialEstados[pedido.historialEstados.length - 1]?.timestamp || ''
        };
      });

    console.log('🔧 ===== PEDIDOS AGRUPADOS (SOLO CON ESTADO LISTO) =====');
    console.log(`🔧 Total de pedidos únicos con estado LISTO: ${orderDetails.length}`);
    orderDetails.forEach((order, index) => {
      console.log(`🔧 Pedido #${index + 1}:`, {
        articulo: order.articulo,
        otSap: order.otSap,
        numeroColores: order.numeroColores,
        durationListo: order.duration,
        cantidadEstados: order.historialEstados.length,
        historial: order.historialEstados
      });
    });

    // Calcular totales correctos basados en pedidos únicos
    const totalOrders = orderDetails.length;
    const totalDuration = orderDetails.reduce((sum, order) => sum + order.duration, 0);
    const avgDuration = totalOrders > 0 ? totalDuration / totalOrders : 0;

    console.log('🔧 ===== RESUMEN FINAL =====');
    console.log('🔧 Total de pedidos únicos:', totalOrders);
    console.log('🔧 Total Duration (segundos):', totalDuration);
    console.log('🔧 Avg Duration (segundos):', avgDuration);
    console.log('🔧 Total Duration (formateado):', this.formatDuration(totalDuration));
    console.log('🔧 Avg Duration (formateado):', this.formatDuration(avgDuration));

    // Calcular estadísticas de colores
    const coloresStats = orderDetails.reduce((acc, order) => {
      if (order.numeroColores > 0) {
        acc.totalColores += order.numeroColores;
        acc.pedidosConColores++;
      }
      return acc;
    }, { totalColores: 0, pedidosConColores: 0 });

    // Promedio de colores = Total de colores / Número de pedidos
    const avgColores = totalOrders > 0
      ? coloresStats.totalColores / totalOrders
      : 0;

    console.log('🔧 ===== ESTADÍSTICAS DE COLORES =====');
    console.log('🔧 Total de colores Pantone:', coloresStats.totalColores);
    console.log('🔧 Pedidos con colores:', coloresStats.pedidosConColores);
    console.log('🔧 Total de pedidos:', totalOrders);
    console.log('🔧 Promedio de colores (total colores / total pedidos):', avgColores);

    // Guardar en cache
    this.machineStatsCache = {
      totalOrders,
      totalDuration,
      avgDuration,
      orderDetails,
      totalColores: coloresStats.totalColores,
      avgColores: avgColores
    };
    this.machineStatsActivitiesCount = activities.length;

    console.log('🔧 Cache actualizado con:', this.machineStatsCache);

    return this.machineStatsCache;
  }

  exportToPDF() {
    // Preguntar qué módulo exportar
    const moduleToExport = prompt('¿Qué módulo deseas exportar?\n\nOpciones:\n- AUTH (Autenticación)\n- MACHINES (Máquinas)\n- DESIGNS (Diseños)\n- DOCUMENTS (Documentos)\n- REPORTS (Reportes)\n- CONFIG (Configuración)\n- SETTINGS (Ajustes)\n- PROFILE (Perfil)\n- CONDICION_UNICA (Condición Única)\n- ALL (Todos)\n\nEscribe el nombre del módulo:');

    if (!moduleToExport) {
      this.snackBar.open('Exportación cancelada', 'Cerrar', { duration: 2000 });
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
      this.snackBar.open('No hay actividades para exportar en este módulo', 'Cerrar', { duration: 3000 });
      return;
    }

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text(`Reporte de Auditoría - ${moduleToExport.toUpperCase()}`, 14, 20);

    // Fecha del reporte
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total de registros: ${activities.length}`, 14, 34);

    // Tabla
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
    this.snackBar.open('PDF generado exitosamente', 'Cerrar', { duration: 3000 });
  }

  exportToExcel() {
    // Preguntar qué módulo exportar
    const moduleToExport = prompt('¿Qué módulo deseas exportar?\n\nOpciones:\n- AUTH (Autenticación)\n- MACHINES (Máquinas)\n- DESIGNS (Diseños)\n- DOCUMENTS (Documentos)\n- REPORTS (Reportes)\n- CONFIG (Configuración)\n- SETTINGS (Ajustes)\n- PROFILE (Perfil)\n- CONDICION_UNICA (Condición Única)\n- ALL (Todos)\n\nEscribe el nombre del módulo:');

    if (!moduleToExport) {
      this.snackBar.open('Exportación cancelada', 'Cerrar', { duration: 2000 });
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
      this.snackBar.open('No hay actividades para exportar en este módulo', 'Cerrar', { duration: 3000 });
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

    // Convertir a CSV
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${(row as any)[h]}"`).join(','))
    ].join('\n');

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${moduleToExport}_${new Date().getTime()}.csv`;
    link.click();

    this.snackBar.open('Excel generado exitosamente', 'Cerrar', { duration: 3000 });
  }

  // ===== NUEVOS MÉTODOS DE EXPORTACIÓN POR MÓDULO =====

  /**
   * Exportar módulo específico a PDF con diseño compacto y organizado
   */
  exportModuleToPDF(moduleValue: string, event: Event) {
    event.stopPropagation(); // Evitar que se expanda/colapse el módulo

    const activities = this.getActivitiesByModule(moduleValue);

    if (activities.length === 0) {
      this.snackBar.open('No hay actividades para exportar', 'Cerrar', { duration: 2000 });
      return;
    }

    const doc = new jsPDF();
    const moduleLabel = this.getModuleLabel(moduleValue);

    // ===== ENCABEZADO COMPACTO =====
    doc.setFillColor(37, 99, 235); // Azul primario
    doc.rect(0, 0, 210, 20, 'F'); // Reducido de 35 a 20

    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14); // Reducido de 20 a 14
    doc.setFont('helvetica', 'bold');
    doc.text(`Auditoría - ${moduleLabel}`, 14, 10);

    // Fecha de generación (misma línea, a la derecha)
    doc.setFontSize(8); // Reducido de 14 a 8
    doc.setFont('helvetica', 'normal');
    const fechaGeneracion = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(fechaGeneracion, 196, 10, { align: 'right' });

    // Total de registros (segunda línea)
    doc.text(`Total: ${activities.length} registros`, 14, 16);

    // ===== INFORMACIÓN DE FILTROS (COMPACTA) =====
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7); // Reducido de 9 a 7
    doc.setFont('helvetica', 'normal');

    const filters = this.filterForm.value;
    const selectedUser = filters.userId ? this.users().find(u => u.id === filters.userId) : null;

    let yPos = 24; // Reducido de 42 a 24

    // Mostrar filtros en una sola línea si es posible
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

    // ===== TABLA DE DATOS =====
    if (moduleValue === 'MACHINES') {
      // Exportación especial para MÁQUINAS con estadísticas
      const stats = this.getMachineStats(activities);

      // Estadísticas generales en formato compacto (2 columnas)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Resumen', 14, yPos);
      yPos += 5;

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      // Primera columna
      doc.text(`Pedidos: ${stats.totalOrders}`, 14, yPos);
      doc.text(`Tiempo total: ${this.formatDuration(stats.totalDuration)}`, 14, yPos + 4);

      // Segunda columna
      doc.text(`Tiempo promedio: ${this.formatDuration(stats.avgDuration)}`, 105, yPos);
      doc.text(`Promedio colores: ${stats.avgColores ? stats.avgColores.toFixed(1) : '-'}`, 105, yPos + 4);

      yPos += 10;

      // Tabla de pedidos compacta
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
          fontSize: 6, // Reducido de 7 a 6
          cellPadding: 1.5, // Reducido de 2 a 1.5
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

      // Agregar detalle de historial de estados en nueva página si hay espacio
      const finalY = (doc as any).lastAutoTable.finalY;
      if (finalY > 250) {
        doc.addPage();
        yPos = 15;
      } else {
        yPos = finalY + 8;
      }

      // Título de historial
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Historial de Estados', 14, yPos);
      yPos += 5;

      // Tabla de historial
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
      // Exportación estándar para otros módulos
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

    // ===== PIE DE PÁGINA COMPACTO =====
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

    // Guardar PDF
    const timestamp = new Date().getTime();
    const fileName = `auditoria_${moduleValue.toLowerCase()}_${timestamp}.pdf`;
    doc.save(fileName);

    this.snackBar.open('PDF generado exitosamente', 'Cerrar', { duration: 2000 });
  }

  /**
   * Exportar módulo específico a Excel con diseño organizado igual que el PDF
   */
  exportModuleToExcel(moduleValue: string, event: Event) {
    event.stopPropagation(); // Evitar que se expanda/colapse el módulo

    const activities = this.getActivitiesByModule(moduleValue);

    if (activities.length === 0) {
      this.snackBar.open('No hay actividades para exportar', 'Cerrar', { duration: 2000 });
      return;
    }

    const moduleLabel = this.getModuleLabel(moduleValue);
    const filters = this.filterForm.value;
    const selectedUser = filters.userId ? this.users().find(u => u.id === filters.userId) : null;

    let csvContent = '';

    // ===== ENCABEZADO =====
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

    // Filtros aplicados
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

    csvContent += ';;;;\n'; // Línea en blanco separadora

    // ===== DATOS ORGANIZADOS POR MÓDULO =====
    if (moduleValue === 'MACHINES') {
      // ========================================
      // MÓDULO MÁQUINAS - ESTRUCTURA ORGANIZADA
      // ========================================
      const stats = this.getMachineStats(activities);

      // === SECCIÓN 1: RESUMEN DE ESTADÍSTICAS ===
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

      // === SECCIÓN 2: TABLA DE PEDIDOS COMPLETADOS ===
      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += 'PEDIDOS COMPLETADOS;;;;\n';
      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += ';;;;\n';

      csvContent += '#;Artículo;OT SAP;Descripción;Máquina;Colores Pantone;Tiempo en LISTO;Cantidad de Estados\n';
      stats.orderDetails.forEach((order: any, index: number) => {
        const descripcion = order.descripcion.replace(/;/g, ','); // Reemplazar punto y coma por coma
        csvContent += `${index + 1};${order.articulo};${order.otSap};${descripcion};${order.numeroMaquina};${order.numeroColores || '-'};${this.formatDuration(order.duration)};${order.historialEstados.length}\n`;
      });
      csvContent += ';;;;\n';
      csvContent += ';;;;\n';

      // === SECCIÓN 3: HISTORIAL DETALLADO DE ESTADOS ===
      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += 'HISTORIAL DETALLADO DE ESTADOS;;;;\n';
      csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
      csvContent += ';;;;\n';

      csvContent += 'Pedido;Artículo;OT SAP;Estado;Fecha;Hora;Duración;Código Usuario;Nombre Usuario;Observaciones\n';
      stats.orderDetails.forEach((order: any, index: number) => {
        order.historialEstados.forEach((estado: any, estadoIndex: number) => {
          const fecha = new Date(estado.timestamp).toLocaleDateString('es-ES');
          const hora = new Date(estado.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          const observaciones = (estado.observaciones || '-').replace(/;/g, ','); // Reemplazar punto y coma por coma

          csvContent += `#${index + 1};${order.articulo};${order.otSap};${estado.estado};${fecha};${hora};${this.formatDuration(estado.duration)};${estado.userCode};${estado.userName};${observaciones}\n`;
        });

        // Línea en blanco entre pedidos para mejor separación visual
        if (index < stats.orderDetails.length - 1) {
          csvContent += ';;;;\n';
        }
      });

    } else {
      // ========================================
      // OTROS MÓDULOS - ESTRUCTURA ESTÁNDAR
      // ========================================

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
        const description = a.description.replace(/;/g, ','); // Reemplazar punto y coma por coma
        const duration = this.getDuration(a);
        const ip = a.ipAddress || '-';
        const entity = a.entityName || '-';

        csvContent += `${index + 1};${fecha};${hora};${userCode};${userName};${action};${description};${duration};${ip};${entity}\n`;
      });
    }

    // ===== PIE DE PÁGINA =====
    csvContent += ';;;;\n';
    csvContent += ';;;;\n';
    csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';
    csvContent += 'FIN DEL REPORTE;;;;\n';
    csvContent += `Generado el ${fechaGeneracion};;;;\n`;
    csvContent += '════════════════════════════════════════════════════════════════════════════════;;;;\n';

    // ===== DESCARGAR ARCHIVO =====
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // \ufeff es BOM para UTF-8
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().getTime();
    link.download = `auditoria_${moduleValue.toLowerCase()}_${timestamp}.csv`;
    link.click();

    this.snackBar.open('Excel generado exitosamente', 'Cerrar', { duration: 2000 });
  }
}
