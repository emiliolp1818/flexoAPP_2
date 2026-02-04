// ============================================================================
// REPORTE DE AUDITORÍA COMPLETO DEL SISTEMA
// ============================================================================

import { Component, signal, OnInit, HostListener } from '@angular/core';
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
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
  showUserDropdown: boolean = false;
  
  // Formulario de filtros
  filterForm: FormGroup;
  
  // Función para mostrar el valor en el autocomplete
  displayUserFn(user: any): string {
    return user ? `${user.userCode} - ${user.firstName} ${user.lastName}` : '';
  }
  
  // Módulos disponibles
  modules = [
    { value: 'AUTH', label: 'Autenticación' },
    { value: 'MACHINES', label: 'Máquinas' },
    { value: 'DESIGNS', label: 'Diseños' },
    { value: 'DOCUMENTS', label: 'Documentos' },
    { value: 'REPORTS', label: 'Reportes' },
    { value: 'CONFIG', label: 'Configuración' },
    { value: 'SETTINGS', label: 'Ajustes' },
    { value: 'PROFILE', label: 'Perfil' },
    { value: 'CONDICION_UNICA', label: 'Condición Única' }
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
      module: [null],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit() {
    console.log('🚀 Componente de reportes inicializado');
    this.loadUsers();
    // NO cargar actividades al inicio - esperar a que el usuario haga clic en Buscar
    
    // Escuchar cambios en el formulario
    this.filterForm.valueChanges.subscribe(() => {
      const filters = this.filterForm.value;
      console.log('🔄 Cambio en formulario detectado:', filters);
      // NO aplicar filtros automáticamente - esperar a que el usuario haga clic en Buscar
    });
  }

  async loadUsers() {
    console.log('👥 Cargando usuarios...');
    try {
      const response: any = await this.http.get(`${environment.apiUrl}/users`).toPromise();
      console.log('📦 Respuesta de /users:', response);
      console.log('📦 Tipo de respuesta:', typeof response);
      console.log('📦 Es array?:', Array.isArray(response));
      
      let usersData: any[] = [];
      
      // El backend puede devolver directamente un array o un objeto con { success, data }
      if (Array.isArray(response)) {
        // Respuesta directa como array
        usersData = response;
        console.log('✅ Respuesta es un array directo');
      } else if (response && response.success && Array.isArray(response.data)) {
        // Respuesta con formato { success: true, data: [...] }
        usersData = response.data;
        console.log('✅ Respuesta tiene formato { success, data }');
      } else if (response && Array.isArray(response.users)) {
        // Respuesta con formato { users: [...] }
        usersData = response.users;
        console.log('✅ Respuesta tiene formato { users }');
      } else {
        console.warn('⚠️ Formato de respuesta no reconocido:', response);
      }
      
      console.log('✅ Usuarios cargados exitosamente:', usersData.length);
      console.log('📋 Primer usuario:', usersData[0]);
      
      this.users.set(usersData);
      this.filteredUsers.set(usersData);
      
      console.log('📋 users() signal:', this.users().length);
      console.log('📋 filteredUsers() signal:', this.filteredUsers().length);
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      this.users.set([]);
      this.filteredUsers.set([]);
    }
  }

  async loadActivities() {
    this.loading.set(true);
    try {
      const filters = this.filterForm.value;
      
      console.log('🔍 Filtros del formulario:', filters);
      console.log('🔍 userSearchText:', this.userSearchText);
      
      // CRÍTICO: Si hay texto en userSearchText pero no hay userId, intentar buscar el usuario por código
      if (this.userSearchText && this.userSearchText.trim() !== '' && !filters.userId) {
        console.log('⚠️ Hay texto de búsqueda pero no userId seleccionado');
        console.log('🔍 Intentando buscar usuario por código:', this.userSearchText);
        
        // Buscar usuario por código exacto
        const searchTerm = this.userSearchText.trim();
        const foundUser = this.users().find(user => 
          user.userCode.toLowerCase() === searchTerm.toLowerCase() ||
          user.userCode === searchTerm
        );
        
        if (foundUser) {
          console.log('✅ Usuario encontrado por código:', foundUser);
          // Establecer el userId automáticamente
          filters.userId = foundUser.id;
          this.filterForm.patchValue({ userId: foundUser.id }, { emitEvent: false });
          console.log('✅ userId establecido automáticamente:', foundUser.id);
        } else {
          console.warn('⚠️ No se encontró usuario con código:', searchTerm);
          this.snackBar.open(`No se encontró usuario con código: ${searchTerm}`, 'Cerrar', { duration: 3000 });
          this.loading.set(false);
          return;
        }
      }
      
      const params: any = {
        page: 1,
        pageSize: 1000
      };
      
      // CRÍTICO: Solo agregar parámetros si tienen valor válido
      if (filters.userId && filters.userId > 0) {
        params.userId = filters.userId;
        console.log('🔍 Filtrando por userId:', filters.userId);
      }
      // Módulo es OPCIONAL - solo filtrar si se selecciona un módulo específico (no "Todos")
      if (filters.module && filters.module.trim() !== '') {
        params.module = filters.module;
        console.log('🔍 Filtrando por módulo:', filters.module);
      } else {
        console.log('📋 Sin filtro de módulo - mostrando todos los módulos');
      }
      
      // NUEVO: Si no se ingresaron fechas, usar el día actual
      if (!filters.startDate && !filters.endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        params.startDate = today.toISOString();
        params.endDate = endOfDay.toISOString();
        console.log('📅 Sin fechas ingresadas - usando día actual:', today.toLocaleDateString());
      } else {
        // Si se ingresaron fechas, usarlas
        if (filters.startDate) {
          params.startDate = filters.startDate.toISOString();
          console.log('🔍 Filtrando por fecha inicio:', filters.startDate);
        }
        if (filters.endDate) {
          params.endDate = filters.endDate.toISOString();
          console.log('🔍 Filtrando por fecha fin:', filters.endDate);
        }
      }
      
      // Si no hay ningún parámetro, significa que el usuario quiere ver TODAS las actividades
      if (Object.keys(params).length === 2) {
        console.log('📋 Sin filtros específicos - cargando TODAS las actividades');
      }
      
      console.log('📤 Parámetros enviados al backend:', params);
      
      const response: any = await this.http.get(`${environment.apiUrl}/audit/activities`, { params }).toPromise();
      
      console.log('📊 Respuesta completa del backend:', response);
      console.log('📊 Total de actividades recibidas:', response?.activities?.length || 0);
      
      if (response && response.activities) {
        let activities = response.activities.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
          expanded: false
        }));
        
        console.log('📋 Actividades antes de filtrar en frontend:', activities.length);
        if (activities.length > 0) {
          console.log('📋 Primera actividad:', activities[0]);
          console.log('📋 userCode de primera actividad:', activities[0].userCode);
          console.log('📋 user.userCode de primera actividad:', activities[0].user?.userCode);
        }
        
        // FILTRO OBLIGATORIO: Si hay userId, SIEMPRE filtrar en el frontend
        if (filters.userId && filters.userId > 0) {
          console.log('🔧 Aplicando filtro OBLIGATORIO de userId en frontend:', filters.userId);
          
          const filterUserId = Number(filters.userId);
          const beforeFilter = activities.length;
          
          activities = activities.filter((a: any) => {
            const activityUserId = Number(a.userId);
            return activityUserId === filterUserId;
          });
          
          console.log(`✅ Actividades después del filtro de userId: ${activities.length} (filtradas: ${beforeFilter - activities.length})`);
          
          if (activities.length === 0) {
            console.warn('⚠️ No se encontraron actividades para el usuario:', filters.userId);
            this.snackBar.open('No se encontraron actividades para este usuario', 'Cerrar', { duration: 3000 });
          }
        }
        
        // FILTRO OPCIONAL: Si hay módulo específico, filtrar en el frontend
        if (filters.module && filters.module.trim() !== '') {
          console.log('🔧 Aplicando filtro OPCIONAL de módulo en frontend:', filters.module);
          const beforeFilter = activities.length;
          
          activities = activities.filter((a: any) => a.module === filters.module);
          
          console.log(`✅ Actividades después del filtro de módulo: ${activities.length} (filtradas: ${beforeFilter - activities.length})`);
        } else {
          console.log('📋 Sin filtro de módulo - mostrando actividades de todos los módulos');
        }
        
        console.log('📊 Total final de actividades a mostrar:', activities.length);
        
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

  applyFilters() {
    this.loadActivities();
  }

  clearFilters() {
    console.log('🧹 Limpiando todos los filtros');
    this.filterForm.reset();
    this.userSearchText = '';
    this.showUserDropdown = false;
    this.filteredUsers.set(this.users());
    
    // Limpiar las actividades mostradas
    this.activities.set([]);
    this.filteredActivities.set([]);
    
    // Mostrar mensaje al usuario
    this.snackBar.open('Filtros limpiados. Selecciona un usuario para ver actividades.', 'Cerrar', { duration: 3000 });
  }

  // Búsqueda de usuario
  onUserSearch() {
    const searchTerm = this.userSearchText.toLowerCase().trim();
    
    console.log('🔍 onUserSearch() ejecutado');
    console.log('🔍 Término de búsqueda:', searchTerm);
    console.log('📋 Total de usuarios disponibles:', this.users().length);
    
    if (!searchTerm) {
      this.filteredUsers.set(this.users());
      console.log('✅ Mostrando todos los usuarios:', this.users().length);
      return;
    }
    
    const filtered = this.users().filter(user => 
      user.userCode.toLowerCase().includes(searchTerm) ||
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)
    );
    
    console.log('✅ Usuarios filtrados:', filtered.length);
    console.log('📋 Usuarios encontrados:', filtered.map(u => `${u.userCode} - ${u.firstName} ${u.lastName}`));
    
    this.filteredUsers.set(filtered);
  }

  // Cuando se selecciona un usuario del autocomplete
  onUserSelected(event: MatAutocompleteSelectedEvent) {
    const user = event.option.value;
    console.log('👤 Usuario seleccionado desde autocomplete:', user);
    
    this.userSearchText = `${user.userCode} - ${user.firstName} ${user.lastName}`;
    
    // Establecer el userId en el formulario
    this.filterForm.patchValue({ userId: user.id }, { emitEvent: true });
    
    console.log('📝 userId establecido en el formulario:', user.id);
    console.log('📝 Valor completo del formulario:', this.filterForm.value);
  }

  // Seleccionar usuario del dropdown (método legacy, ya no se usa con autocomplete)
  selectUser(user: any) {
    console.log('👤 Usuario seleccionado:', user);
    this.userSearchText = `${user.userCode} - ${user.firstName} ${user.lastName}`;
    this.showUserDropdown = false;
    
    // Establecer el userId en el formulario - emitEvent: true para disparar valueChanges
    this.filterForm.patchValue({ userId: user.id }, { emitEvent: true });
    
    // Verificar que el userId se estableció correctamente
    setTimeout(() => {
      console.log('📝 Valor del formulario después de seleccionar usuario:', this.filterForm.value);
    }, 100);
  }

  // Limpiar búsqueda de usuario
  clearUserSearch() {
    console.log('🧹 Limpiando búsqueda de usuario');
    this.userSearchText = '';
    this.filteredUsers.set(this.users());
    
    // Limpiar el userId del formulario - esto disparará valueChanges automáticamente
    this.filterForm.patchValue({ userId: null });
  }

  // Cerrar dropdown al hacer clic fuera (ya no necesario con autocomplete, pero lo dejamos por compatibilidad)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Ya no necesitamos esto con mat-autocomplete, pero lo dejamos por si acaso
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
    if (!seconds || isNaN(seconds) || seconds === 0) return '-';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    if (minutes > 0) {
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

  // Extraer solo el número de máquina
  getNumeroMaquina(activity: AuditActivity): string | null {
    try {
      let numeroMaquina: string | null = null;
      
      // 1. Intentar extraer de details primero (más específico)
      if (activity.details) {
        try {
          const details = JSON.parse(activity.details);
          numeroMaquina = details.numeroMaquina || details.NumeroMaquina || details.machineNumber || details.MachineNumber || 
                         details.numero_maquina || details.maquinaId || details.MaquinaId || details.machineId || 
                         details.MachineId || details.maquina || details.Maquina || details.machine || details.Machine;
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
          numeroMaquina = newVals.numeroMaquina || newVals.NumeroMaquina || newVals.machineNumber || newVals.MachineNumber || 
                         newVals.numero_maquina || newVals.maquinaId || newVals.MaquinaId || newVals.machineId || 
                         newVals.MachineId || newVals.maquina || newVals.Maquina || newVals.machine || newVals.Machine;
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
          numeroMaquina = oldVals.numeroMaquina || oldVals.NumeroMaquina || oldVals.machineNumber || oldVals.MachineNumber || 
                         oldVals.numero_maquina || oldVals.maquinaId || oldVals.MaquinaId || oldVals.machineId || 
                         oldVals.MachineId || oldVals.maquina || oldVals.Maquina || oldVals.machine || oldVals.Machine;
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
          machineInfo.numeroMaquina = machineInfo.numeroMaquina || details.numeroMaquina || details.NumeroMaquina || details.machineNumber || details.MachineNumber || details.numero_maquina || details.maquinaId || details.MaquinaId || details.machineId || details.MachineId;
          
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
          machineInfo.numeroMaquina = machineInfo.numeroMaquina || newVals.numeroMaquina || newVals.NumeroMaquina || newVals.machineNumber || newVals.MachineNumber || newVals.numero_maquina || newVals.maquinaId || newVals.MaquinaId || newVals.machineId || newVals.MachineId;
          
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
          machineInfo.numeroMaquina = machineInfo.numeroMaquina || oldVals.numeroMaquina || oldVals.NumeroMaquina || oldVals.machineNumber || oldVals.MachineNumber || oldVals.numero_maquina || oldVals.maquinaId || oldVals.MaquinaId || oldVals.machineId || oldVals.MachineId;
          
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

  exportToPDF() {
    const doc = new jsPDF();
    const activities = this.filteredActivities();
    
    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Auditoría del Sistema', 14, 20);
    
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
    
    doc.save(`auditoria_${new Date().getTime()}.pdf`);
    this.snackBar.open('PDF generado exitosamente', 'Cerrar', { duration: 3000 });
  }

  exportToExcel() {
    const activities = this.filteredActivities();
    const data = activities.map(a => ({
      'Fecha/Hora': new Date(a.timestamp).toLocaleString(),
      'Usuario': a.user?.fullName || a.userCode,
      'Código Usuario': a.userCode,
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
    link.download = `auditoria_${new Date().getTime()}.csv`;
    link.click();
    
    this.snackBar.open('Excel generado exitosamente', 'Cerrar', { duration: 3000 });
  }
}
