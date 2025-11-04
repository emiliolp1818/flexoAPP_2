import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface FlexographicDesign {
  id?: number;
  articleF: string;
  client: string;
  description: string;
  substrate: string;
  type: 'LAMINA' | 'TUBULAR' | 'SEMITUBULAR';
  printType: 'CARA' | 'DORSO' | 'CARA_DORSO';
  colorCount: number;
  colors: string[];
  status: 'ACTIVO' | 'INACTIVO';
  createdDate?: Date;
  lastModified?: Date;
}

interface UserPermissions {
  canCreateDesign: boolean;
  canBulkUpload: boolean;
  canClearDatabase: boolean;
  canEditDesign: boolean;
  canDeleteDesign: boolean;
  create_design: boolean;
  bulk_upload: boolean;
  admin_clear_db: boolean;
}


@Component({
  selector: 'app-design',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './diseno.html',
  styleUrls: ['./diseno.scss']

})
export class DesignComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  
  // Señales reactivas
  currentUser = signal<User | null>(null);
  loading = signal<boolean>(false);
  uploading = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  searchTerm = signal<string>('');
  allDesigns = signal<FlexographicDesign[]>([]);
  filteredDesigns = signal<FlexographicDesign[]>([]);
  expandedColors = signal<Set<string>>(new Set());
  showCreateForm = signal<boolean>(false);
  
  // Formulario para crear diseño
  createDesignForm: FormGroup;

  // Configuración de tabla
  displayedColumns: string[] = [
    'articleF', 'client', 'description', 'substrate', 'type', 
    'printType', 'colorCount', 'colors', 'status', 'actions'
  ];

  // Permisos del usuario
  userPermissions = signal<UserPermissions>({
    canCreateDesign: true,
    canBulkUpload: true,
    canClearDatabase: false,
    canEditDesign: true,
    canDeleteDesign: false,
    create_design: true,
    bulk_upload: true,
    admin_clear_db: false
  });

  constructor() {
    // Inicializar formulario de creación de diseño
    this.createDesignForm = this.fb.group({
      articleF: ['', [Validators.required, Validators.maxLength(50)]],
      client: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      substrate: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['LAMINA', Validators.required],
      printType: ['CARA', Validators.required],
      colorCount: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      colors: [['Negro'], Validators.required],
      status: ['ACTIVO', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadDesigns();
  }

  /**
   * Cargar usuario actual y configurar permisos
   */
  loadCurrentUser() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
    
    if (user) {
      console.log('👤 Usuario actual:', user);
      console.log('🔑 Rol del usuario:', user.role);
      
      // Configurar permisos basados en los nuevos roles estándar de la plataforma
      const permissions: UserPermissions = {
        // Admin tiene todos los permisos, supervisor y pre-alistador pueden crear/editar
        canCreateDesign: ['admin', 'supervisor', 'pre-alistador', 'matizador'].includes(user.role),
        canBulkUpload: ['admin', 'supervisor'].includes(user.role),
        canClearDatabase: ['admin'].includes(user.role),
        canEditDesign: ['admin', 'supervisor', 'pre-alistador', 'matizador'].includes(user.role),
        canDeleteDesign: ['admin', 'supervisor'].includes(user.role),
        create_design: ['admin', 'supervisor', 'pre-alistador', 'matizador'].includes(user.role),
        bulk_upload: ['admin', 'supervisor'].includes(user.role),
        admin_clear_db: ['admin'].includes(user.role)
      };
      
      console.log('🔐 Permisos configurados:', permissions);
      this.userPermissions.set(permissions);
    } else {
      console.log('❌ No hay usuario logueado');
    }
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: keyof UserPermissions): boolean {
    const hasPermission = this.userPermissions()[permission];
    console.log(`🔍 Verificando permiso '${permission}':`, hasPermission);
    return hasPermission;
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    const isAdmin = user?.role === 'admin';
    console.log('👑 ¿Es administrador?:', isAdmin, '- Rol:', user?.role);
    return isAdmin;
  }

  /**
   * Cargar diseños desde la base de datos (OPTIMIZADO)
   */
  async loadDesigns() {
    this.loading.set(true);
    try {
      console.log('🚀 Cargando diseños optimizados desde la base de datos...');
      
      // Usar endpoint optimizado de resumen para carga rápida
      const response = await this.http.get<any[]>(`${environment.apiUrl}/designs/summary`).toPromise();
      
      if (response) {
        console.log(`⚡ ${response.length} diseños cargados ULTRA RÁPIDO desde MySQL`);
        this.allDesigns.set(response);
        this.filteredDesigns.set(response);
        
        this.snackBar.open(`${response.length} diseños cargados (modo rápido)`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } else {
        console.log('⚠️ No se encontraron diseños en la base de datos');
        this.allDesigns.set([]);
        this.filteredDesigns.set([]);
      }
    } catch (error: any) {
      console.error('❌ Error cargando diseños:', error);
      
      // Fallback a carga normal si falla la optimizada
      console.log('🔄 Intentando carga normal como fallback...');
      await this.loadDesignsNormal();
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cargar diseños con paginación (OPTIMIZADO)
   */
  async loadDesignsPaginated(page: number = 1, pageSize: number = 50, search?: string) {
    this.loading.set(true);
    try {
      console.log(`🚀 Cargando diseños paginados - Página: ${page}, Tamaño: ${pageSize}`);
      
      let url = `${environment.apiUrl}/designs/paginated?page=${page}&pageSize=${pageSize}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await this.http.get<any>(url).toPromise();
      
      if (response) {
        console.log(`✅ ${response.items.length} diseños cargados en ${response.loadTime}ms`);
        this.allDesigns.set(response.items);
        this.filteredDesigns.set(response.items);
        
        this.snackBar.open(`Página ${page}: ${response.items.length} diseños (${response.loadTime}ms)`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error cargando diseños paginados:', error);
      this.handleLoadError(error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cargar diseños con lazy loading (OPTIMIZADO)
   */
  async loadDesignsLazy() {
    this.loading.set(true);
    try {
      console.log('🔄 Cargando diseños con lazy loading...');
      
      const response = await this.http.get<any[]>(`${environment.apiUrl}/designs/lazy`).toPromise();
      
      if (response) {
        console.log(`✅ ${response.length} diseños lazy cargados`);
        this.allDesigns.set(response);
        this.filteredDesigns.set(response);
        
        this.snackBar.open(`${response.length} diseños cargados (lazy loading)`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error cargando diseños lazy:', error);
      this.handleLoadError(error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cargar diseños normal (fallback)
   */
  async loadDesignsNormal() {
    try {
      console.log('🎨 Cargando diseños (modo normal)...');
      
      const response = await this.http.get<FlexographicDesign[]>(`${environment.apiUrl}/designs`).toPromise();
      
      if (response) {
        console.log(`✅ ${response.length} diseños cargados desde MySQL`);
        this.allDesigns.set(response);
        this.filteredDesigns.set(response);
        
        this.snackBar.open(`${response.length} diseños cargados`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } else {
        this.allDesigns.set([]);
        this.filteredDesigns.set([]);
      }
    } catch (error: any) {
      this.handleLoadError(error);
    }
  }

  /**
   * Manejar errores de carga
   */
  private handleLoadError(error: any) {
    let errorMessage = 'Error al cargar los diseños desde la base de datos';
    if (error.status === 401) {
      errorMessage = 'Sesión expirada. Redirigiendo al login...';
      setTimeout(() => window.location.href = '/login', 2000);
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión con el servidor';
    }
    
    this.snackBar.open(errorMessage, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
    
    this.allDesigns.set([]);
    this.filteredDesigns.set([]);
  }



  /**
   * Activar carga de archivo
   */
  triggerFileUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    fileInput.onchange = (event) => this.onFileSelected(event);
    fileInput.click();
  }

  /**
   * Limpiar todos los diseños de la base de datos
   */
  async clearAllDesigns() {
    const confirmMessage = `⚠️ ADVERTENCIA: Eliminar todos los diseños

Esta acción eliminará PERMANENTEMENTE todos los diseños de la base de datos MySQL.

¿Estás COMPLETAMENTE SEGURO de continuar?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // Doble confirmación para operación crítica
    const doubleConfirm = confirm('🚨 CONFIRMACIÓN FINAL\n\nEsta operación es IRREVERSIBLE.\n\n¿Continuar con la eliminación?');
    if (!doubleConfirm) return;

    this.loading.set(true);
    try {
      console.log('🗑️ Eliminando todos los diseños de la base de datos...');
      
      const response = await this.http.post<any>(`${environment.apiUrl}/designs/clear-all`, {}).toPromise();
      
      if (response) {
        console.log(`✅ ${response.deletedCount} diseños eliminados de MySQL`);
        
        // Limpiar datos localmente
        this.allDesigns.set([]);
        this.filteredDesigns.set([]);
        
        this.snackBar.open(`${response.deletedCount} diseños eliminados de la base de datos`, 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error eliminando diseños:', error);
      
      let errorMessage = 'Error al eliminar los diseños';
      if (error.status === 401) {
        errorMessage = 'No tienes permisos para esta operación';
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión con el servidor';
      }
      
      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Crear nuevo diseño
   */
  async createNewDesign() {
    const user = this.currentUser();
    console.log('🎨 Intentando crear nuevo diseño...');
    console.log('👤 Usuario:', user?.firstName, user?.lastName);
    console.log('🔑 Rol:', user?.role);
    console.log('🔐 Permisos actuales:', this.userPermissions());
    
    // Verificar permisos - Administrador siempre puede crear
    if (!this.hasPermission('canCreateDesign') && !this.isAdmin()) {
      console.log('❌ Sin permisos para crear diseño');
      this.snackBar.open(`Sin permisos para crear diseños. Rol actual: ${user?.role}`, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    console.log('✅ Permisos verificados - Mostrando formulario de creación');
    
    // Mostrar formulario de creación
    this.showCreateForm.set(true);
    this.resetCreateForm();
  }

  /**
   * Resetear formulario de creación
   */
  resetCreateForm() {
    this.createDesignForm.reset({
      articleF: '',
      client: '',
      description: '',
      substrate: '',
      type: 'LAMINA',
      printType: 'CARA',
      colorCount: 1,
      colors: ['Negro'],
      status: 'ACTIVO'
    });
  }

  /**
   * Cancelar creación de diseño
   */
  cancelCreateDesign() {
    this.showCreateForm.set(false);
    this.resetCreateForm();
  }

  /**
   * Guardar nuevo diseño
   */
  async saveNewDesign() {
    if (!this.createDesignForm.valid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading.set(true);
    try {
      const formData = this.createDesignForm.value;
      console.log('💾 Guardando nuevo diseño:', formData);

      const response = await this.http.post<FlexographicDesign>(`${environment.apiUrl}/designs`, formData).toPromise();

      if (response) {
        console.log('✅ Diseño creado exitosamente:', response);
        
        // Agregar el nuevo diseño a la lista
        const currentDesigns = this.allDesigns();
        this.allDesigns.set([response, ...currentDesigns]);
        this.filteredDesigns.set([response, ...currentDesigns]);

        this.snackBar.open(`Diseño "${formData.articleF}" creado exitosamente`, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });

        // Ocultar formulario y resetear
        this.showCreateForm.set(false);
        this.resetCreateForm();
      }
    } catch (error: any) {
      console.error('❌ Error creando diseño:', error);
      
      let errorMessage = 'Error al crear el diseño';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 400) {
        errorMessage = 'Datos inválidos o artículo ya existe';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      }

      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Actualizar colores basado en el número de colores
   */
  updateColors() {
    const colorCount = this.createDesignForm.get('colorCount')?.value || 1;
    const currentColors = this.createDesignForm.get('colors')?.value || [];
    
    const newColors = [...currentColors];
    
    // Agregar colores si se necesitan más
    while (newColors.length < colorCount) {
      newColors.push('Color ' + (newColors.length + 1));
    }
    
    // Remover colores si hay demasiados
    while (newColors.length > colorCount) {
      newColors.pop();
    }
    
    this.createDesignForm.patchValue({ colors: newColors });
  }

  /**
   * Exportar diseños a Excel
   */
  async exportToExcel() {
    this.loading.set(true);
    try {
      console.log('📊 Exportando diseños a Excel...');
      
      const response = await this.http.get(`${environment.apiUrl}/designs/export/excel`, {
        responseType: 'blob'
      }).toPromise();
      
      if (response) {
        // Crear enlace de descarga
        const blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Diseños_FlexoAPP_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('Archivo Excel descargado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error exportando a Excel:', error);
      this.snackBar.open('Error al exportar a Excel', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Manejar selección de archivo Excel para importar diseños
   */
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.snackBar.open('Solo se permiten archivos Excel (.xlsx, .xls)', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validar tamaño del archivo (máximo 200MB)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      this.snackBar.open('El archivo es demasiado grande. Máximo 200MB permitido.', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.uploading.set(true);
    this.uploadProgress.set(0);

    try {
      console.log(`📁 Procesando archivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      
      // Simular progreso mientras se sube
      const progressInterval = setInterval(() => {
        const currentProgress = this.uploadProgress();
        if (currentProgress < 90) {
          this.uploadProgress.set(currentProgress + 10);
        }
      }, 500);

      // Enviar archivo al backend
      const response = await this.http.post<any>(`${environment.apiUrl}/designs/import/excel`, formData).toPromise();
      
      clearInterval(progressInterval);
      this.uploadProgress.set(100);

      if (response) {
        console.log(`✅ Importación completada: ${response.successCount} exitosos, ${response.errorCount} errores`);
        
        let message = `Archivo procesado: ${response.successCount} diseños importados`;
        if (response.errorCount > 0) {
          message += `, ${response.errorCount} errores`;
        }
        
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });

        // Recargar diseños desde la base de datos
        await this.loadDesigns();
      }
    } catch (error: any) {
      console.error('❌ Error procesando archivo:', error);
      
      let errorMessage = 'Error al procesar el archivo Excel';
      if (error.status === 400) {
        errorMessage = 'Formato de archivo inválido o datos incorrectos';
      } else if (error.status === 413) {
        errorMessage = 'El archivo es demasiado grande';
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión con el servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.uploading.set(false);
      this.uploadProgress.set(0);
      
      // Limpiar el input file
      event.target.value = '';
    }
  }

  /**
   * Buscar diseños
   */
  onSearch() {
    const term = this.searchTerm().toLowerCase().trim();
    
    if (!term) {
      this.filteredDesigns.set(this.allDesigns());
      return;
    }

    const filtered = this.allDesigns().filter(design =>
      design.articleF.toLowerCase().includes(term) ||
      design.client.toLowerCase().includes(term) ||
      design.description.toLowerCase().includes(term) ||
      design.substrate.toLowerCase().includes(term)
    );

    this.filteredDesigns.set(filtered);
  }

  /**
   * Limpiar búsqueda
   */
  clearSearch() {
    this.searchTerm.set('');
    this.filteredDesigns.set(this.allDesigns());
  }

  /**
   * Verificar si los colores están expandidos
   */
  isColorsExpanded(id: string): boolean {
    return this.expandedColors().has(id);
  }

  /**
   * Toggle expansión de colores
   */
  toggleColors(id: string, event?: any) {
    if (event) {
      event.stopPropagation();
    }
    
    const expanded = new Set(this.expandedColors());
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    this.expandedColors.set(expanded);
  }

  /**
   * Cerrar expansión de colores
   */
  closeColors(id: string) {
    const expanded = new Set(this.expandedColors());
    expanded.delete(id);
    this.expandedColors.set(expanded);
  }

  /**
   * Cargar colores bajo demanda (OPTIMIZADO)
   */
  async loadColorsOnDemand(designId: number): Promise<string[]> {
    try {
      console.log(`🎨 Cargando colores bajo demanda para diseño ${designId}`);
      
      const response = await this.http.get<string[]>(`${environment.apiUrl}/designs/${designId}/colors`).toPromise();
      
      if (response) {
        console.log(`✅ ${response.length} colores cargados para diseño ${designId}`);
        return response;
      }
      
      return [];
    } catch (error: any) {
      console.error(`❌ Error cargando colores para diseño ${designId}:`, error);
      return [];
    }
  }

  /**
   * Cargar detalles completos bajo demanda (OPTIMIZADO)
   */
  async loadDetailsOnDemand(designId: number): Promise<any> {
    try {
      console.log(`📋 Cargando detalles completos para diseño ${designId}`);
      
      const response = await this.http.get<any>(`${environment.apiUrl}/designs/${designId}/details`).toPromise();
      
      if (response) {
        console.log(`✅ Detalles completos cargados para diseño ${designId}`);
        return response;
      }
      
      return null;
    } catch (error: any) {
      console.error(`❌ Error cargando detalles para diseño ${designId}:`, error);
      return null;
    }
  }

  /**
   * Obtener información de caché
   */
  async getCacheInfo() {
    try {
      const response = await this.http.get<any>(`${environment.apiUrl}/designs/cache/info`).toPromise();
      
      if (response) {
        console.log('📊 Información de caché:', response);
        return response;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ Error obteniendo información de caché:', error);
      return null;
    }
  }

  /**
   * Limpiar caché
   */
  async clearCache() {
    try {
      console.log('🧹 Limpiando caché...');
      
      const response = await this.http.post<any>(`${environment.apiUrl}/designs/cache/clear`, {}).toPromise();
      
      if (response) {
        console.log('✅ Caché limpiado exitosamente');
        this.snackBar.open('Caché limpiado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ Error limpiando caché:', error);
      this.snackBar.open('Error al limpiar caché', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }
  }

  /**
   * Formatear nombre de color
   */
  formatColorName(color: string): string {
    return color.toUpperCase();
  }

  /**
   * Obtener clase CSS para el estado
   */
  getStatusClass(design: FlexographicDesign): string {
    return `status-text-display status-${design.status.toLowerCase()}`;
  }

  /**
   * Obtener texto del estado
   */
  getDesignStatus(design: FlexographicDesign): string {
    return design.status === 'ACTIVO' ? 'Activo' : 'Inactivo';
  }

  /**
   * Editar diseño
   */
  editDesign(design: FlexographicDesign) {
    // TODO: Implementar modal de edición
    this.snackBar.open(`Función de edición en desarrollo para: ${design.articleF}`, 'Cerrar', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Duplicar diseño en la base de datos
   */
  async duplicateDesign(design: FlexographicDesign) {
    if (!design.id) return;

    this.loading.set(true);
    try {
      console.log(`🔄 Duplicando diseño: ${design.articleF}`);
      
      const response = await this.http.post<FlexographicDesign>(`${environment.apiUrl}/designs/${design.id}/duplicate`, {}).toPromise();
      
      if (response) {
        console.log(`✅ Diseño duplicado: ${response.articleF}`);
        
        this.snackBar.open(`Diseño duplicado: ${response.articleF}`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Recargar diseños para mostrar el nuevo
        await this.loadDesigns();
      }
    } catch (error: any) {
      console.error('❌ Error duplicando diseño:', error);
      
      let errorMessage = 'Error al duplicar el diseño';
      if (error.status === 404) {
        errorMessage = 'Diseño no encontrado';
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión con el servidor';
      }
      
      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Eliminar diseño de la base de datos
   */
  async deleteDesign(design: FlexographicDesign) {
    if (!design.id) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar el diseño ${design.articleF}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    this.loading.set(true);
    try {
      console.log(`🗑️ Eliminando diseño: ${design.articleF}`);
      
      await this.http.delete(`${environment.apiUrl}/designs/${design.id}`).toPromise();
      
      console.log(`✅ Diseño eliminado: ${design.articleF}`);
      
      this.snackBar.open(`Diseño eliminado: ${design.articleF}`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Recargar diseños para actualizar la lista
      await this.loadDesigns();
    } catch (error: any) {
      console.error('❌ Error eliminando diseño:', error);
      
      let errorMessage = 'Error al eliminar el diseño';
      if (error.status === 404) {
        errorMessage = 'Diseño no encontrado';
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para eliminar este diseño';
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión con el servidor';
      }
      
      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }
}