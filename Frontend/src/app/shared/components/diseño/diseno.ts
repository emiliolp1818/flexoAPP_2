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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PantoneLiveService, PantoneColor } from '../../services/pantone-live.service';

interface FlexographicDesign {
  id?: number;
  articleF: string;
  client: string;
  description: string;
  substrate: string;
  type: 'LAMINA' | 'TUBULAR' | 'SEMITUBULAR';
  printType: 'CARA' | 'DORSO' | 'CARA_DORSO';
  colorCount: number;
  // Estructura de colores individual para Excel (hasta 10 colores)
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  color5?: string;
  color6?: string;
  color7?: string;
  color8?: string;
  color9?: string;
  color10?: string;
  // Array de colores para uso interno (se construye desde color1-color10)
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
    MatAutocompleteModule,
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
  private pantoneService = inject(PantoneLiveService);
  
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
  
  // Señales para optimización de carga
  currentPage = signal<number>(1);
  pageSize = signal<number>(100);
  totalRecords = signal<number>(0);
  hasMoreData = signal<boolean>(true);
  loadingMore = signal<boolean>(false);
  virtualScrollEnabled = signal<boolean>(true);
  cacheEnabled = signal<boolean>(true);
  
  // Formulario para crear diseño
  createDesignForm: FormGroup;
  
  // Colores Pantone
  availablePantoneColors = signal<PantoneColor[]>([]);
  selectedColors = signal<PantoneColor[]>([]);
  colorSearchTerm = signal<string>('');

  // Configuración de tabla
  displayedColumns: string[] = [
    'id', 'articleF', 'client', 'description', 'substrate', 'type', 
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
    this.loadPantoneColors();
    this.initializeOptimizations();
    // Usar método directo para cargar datos
    this.loadDataDirectly();
  }

  /**
   * Inicializar optimizaciones de rendimiento
   */
  private initializeOptimizations() {
    console.log('⚡ Inicializando optimizaciones de rendimiento...');
    
    // Configurar tamaño de página basado en memoria disponible
    const memory = this.getMemoryUsage();
    if (memory) {
      if (memory.limit < 1000) { // Menos de 1GB
        this.pageSize.set(25);
        console.log('📄 Memoria limitada detectada - Página reducida a 25');
      } else if (memory.limit < 2000) { // Menos de 2GB
        this.pageSize.set(50);
        console.log('📄 Memoria media detectada - Página establecida en 50');
      } else {
        this.pageSize.set(100);
        console.log('📄 Memoria suficiente - Página establecida en 100');
      }
    }
    
    // Configurar virtual scrolling basado en el dispositivo
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this.pageSize.set(Math.min(this.pageSize(), 25));
      console.log('📱 Dispositivo móvil detectado - Optimizaciones aplicadas');
    }
    
    // Monitorear memoria cada 30 segundos
    setInterval(() => {
      if (this.needsOptimization()) {
        console.log('⚠️ Optimización necesaria detectada');
        this.optimizePerformance();
      }
    }, 30000);
  }

  /**
   * Cargar colores Pantone disponibles
   */
  loadPantoneColors() {
    const colors = this.pantoneService.getAllColors();
    this.availablePantoneColors.set(colors);
    console.log('🎨 Colores Pantone cargados:', colors.length);
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
      
      // Configurar permisos basados en los roles (soporta tanto mayúsculas como minúsculas)
      const userRole = user.role.toLowerCase(); // Normalizar a minúsculas
      const permissions: UserPermissions = {
        // Admin tiene todos los permisos, supervisor y pre-alistador pueden crear/editar
        canCreateDesign: ['admin', 'supervisor', 'pre-alistador', 'matizador'].includes(userRole),
        canBulkUpload: ['admin', 'supervisor'].includes(userRole),
        canClearDatabase: ['admin'].includes(userRole),
        canEditDesign: ['admin', 'supervisor', 'pre-alistador', 'matizador'].includes(userRole),
        canDeleteDesign: ['admin', 'supervisor'].includes(userRole),
        create_design: ['admin', 'supervisor', 'pre-alistador', 'matizador'].includes(userRole),
        bulk_upload: ['admin', 'supervisor'].includes(userRole),
        admin_clear_db: ['admin'].includes(userRole)
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
   * Verificar si el usuario es administrador (soporta mayúsculas y minúsculas)
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    const userRole = user?.role?.toLowerCase() || '';
    const isAdmin = userRole === 'admin';
    console.log('👑 ¿Es administrador?:', isAdmin, '- Rol original:', user?.role, '- Rol normalizado:', userRole);
    return isAdmin;
  }

  /**
   * Cargar diseños desde la base de datos (ULTRA OPTIMIZADO)
   */
  async loadDesigns() {
    this.loading.set(true);
    try {
      console.log('🚀 Cargando TODOS los diseños (sin límite de 100)...');
      
      // Usar directamente el endpoint /all para cargar todos los diseños
      await this.loadAllDesignsAfterImport();
      
    } catch (error: any) {
      console.error('❌ Error cargando todos los diseños:', error);
      
      // Fallback a carga paginada solo si falla completamente
      console.log('🔄 Fallback a carga paginada...');
      await this.loadDesignsPaginatedOptimized();
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cargar TODOS los diseños después de importación masiva (sin límites)
   */
  async loadAllDesignsAfterImport() {
    this.loading.set(true);
    try {
      console.log('🚀 Cargando TODOS los diseños después de importación masiva...');
      console.log('🌐 URL del endpoint:', `${environment.apiUrl}/designs/all`);
      
      // Intentar cargar con diferentes endpoints hasta que uno funcione
      let response = null;
      
      // Intentar endpoint normal primero
      try {
        console.log('🔄 Intentando endpoint normal /designs...');
        response = await this.http.get<any>(`${environment.apiUrl}/designs`).toPromise();
        console.log('✅ Endpoint normal funciona');
      } catch (error: any) {
        console.log('❌ Endpoint normal falló, intentando paginado...');
        
        // Fallback a endpoint paginado con tamaño grande
        try {
          response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, {
            params: {
              page: '1',
              pageSize: '10000' // Cargar hasta 10,000 registros
            }
          }).toPromise();
          
          // Si es respuesta paginada, extraer los items
          if (response && response.items) {
            response = response.items;
          }
          console.log('✅ Endpoint paginado funciona');
        } catch (error2: any) {
          console.error('❌ Todos los endpoints fallaron');
          throw error2;
        }
      }
      
      if (response) {
        let designs: FlexographicDesign[] = [];
        
        // Manejar diferentes formatos de respuesta
        if (Array.isArray(response)) {
          designs = response;
          console.log(`✅ ${designs.length} diseños cargados (formato array)`);
        } else if (response.designs && Array.isArray(response.designs)) {
          designs = response.designs;
          console.log(`✅ ${designs.length} diseños cargados (formato objeto con designs)`);
          console.log('📝 Mensaje del servidor:', response.message);
        } else {
          console.warn('⚠️ Formato de respuesta inesperado:', response);
          designs = [];
        }
        
        console.log('📊 Primeros 3 diseños:', designs.slice(0, 3));
        
        this.allDesigns.set(designs);
        this.filteredDesigns.set(designs);
        this.totalRecords.set(designs.length);
        
        if (designs.length > 0) {
          this.snackBar.open(`${designs.length} diseños cargados completamente`, 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open('No hay diseños en la base de datos', 'Cerrar', {
            duration: 4000,
            panelClass: ['info-snackbar']
          });
        }
      } else {
        console.warn('⚠️ Respuesta vacía del servidor');
        this.allDesigns.set([]);
        this.filteredDesigns.set([]);
        this.totalRecords.set(0);
      }
    } catch (error: any) {
      console.error('❌ Error cargando todos los diseños:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Error completo:', error.error);
      
      // Si es error 400, mostrar mensaje específico con detalles de validación
      if (error.status === 400) {
        let errorMessage = 'Error 400: Bad Request';
        
        if (error.error?.errors) {
          console.error('❌ Errores de validación:', error.error.errors);
          const validationErrors = Object.keys(error.error.errors).map(key => 
            `${key}: ${error.error.errors[key].join(', ')}`
          ).join('; ');
          errorMessage = `Error de validación: ${validationErrors}`;
        } else if (error.error?.message) {
          errorMessage = `Error 400: ${error.error.message}`;
        } else if (error.error?.title) {
          errorMessage = `Error 400: ${error.error.title}`;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 10000,
          panelClass: ['error-snackbar']
        });
      } else {
        // Fallback a carga normal solo para otros errores
        console.log('🔄 Fallback a carga normal...');
        await this.loadDesignsNormal();
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cargar diseños con Virtual Scrolling (usando endpoint existente)
   */
  async loadDesignsWithVirtualScroll() {
    try {
      console.log('📊 Iniciando carga optimizada...');
      
      // Usar endpoint paginado existente con parámetros optimizados
      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, {
        params: {
          page: '1',
          pageSize: this.pageSize().toString()
        }
      }).toPromise();
      
      if (response) {
        // Adaptar respuesta al formato esperado
        const adaptedResponse = {
          items: response.items || response,
          total: response.total || response.length,
          hasMore: response.hasMore || false,
          loadTime: response.loadTime || 0
        };
        
        console.log(`⚡ Primera página cargada: ${adaptedResponse.items.length} diseños`);
        
        this.allDesigns.set(adaptedResponse.items);
        this.filteredDesigns.set(adaptedResponse.items);
        this.totalRecords.set(adaptedResponse.total);
        this.hasMoreData.set(adaptedResponse.hasMore);
        this.currentPage.set(1);
        
        this.snackBar.open(`${adaptedResponse.items.length} diseños cargados - Modo optimizado`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error en carga optimizada:', error);
      throw error;
    }
  }

  /**
   * Cargar más datos para virtual scrolling
   */
  async loadMoreDesigns() {
    if (!this.hasMoreData() || this.loadingMore()) return;
    
    this.loadingMore.set(true);
    try {
      const nextPage = this.currentPage() + 1;
      console.log(`📄 Cargando página ${nextPage}...`);
      
      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, {
        params: {
          page: nextPage.toString(),
          pageSize: this.pageSize().toString()
        }
      }).toPromise();
      
      if (response) {
        const adaptedResponse = {
          items: response.items || response,
          hasMore: response.hasMore || false
        };
        
        if (adaptedResponse.items.length > 0) {
          // Agregar nuevos elementos a la lista existente
          const currentDesigns = this.allDesigns();
          const newDesigns = [...currentDesigns, ...adaptedResponse.items];
          
          this.allDesigns.set(newDesigns);
          this.filteredDesigns.set(newDesigns);
          this.currentPage.set(nextPage);
          this.hasMoreData.set(adaptedResponse.hasMore);
          
          console.log(`✅ Página ${nextPage} cargada: +${adaptedResponse.items.length} diseños (Total: ${newDesigns.length})`);
        } else {
          this.hasMoreData.set(false);
          console.log('📄 No hay más datos para cargar');
        }
      }
    } catch (error: any) {
      console.error('❌ Error cargando más diseños:', error);
      // Si falla la paginación, marcar como sin más datos
      this.hasMoreData.set(false);
    } finally {
      this.loadingMore.set(false);
    }
  }

  /**
   * Cargar diseños paginados optimizado (FALLBACK)
   */
  async loadDesignsPaginatedOptimized() {
    try {
      console.log('📊 Carga paginada como fallback...');
      
      // Usar endpoint paginado existente con parámetros optimizados
      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, {
        params: {
          page: '1',
          pageSize: '50' // Página más pequeña para carga rápida inicial
        }
      }).toPromise();
      
      if (response) {
        const adaptedResponse = {
          items: response.items || response,
          total: response.total || response.length,
          loadTime: response.loadTime || 0
        };
        
        console.log(`⚡ ${adaptedResponse.items.length} diseños cargados (fallback)`);
        
        this.allDesigns.set(adaptedResponse.items);
        this.filteredDesigns.set(adaptedResponse.items);
        this.totalRecords.set(adaptedResponse.total);
        
        this.snackBar.open(`${adaptedResponse.items.length} diseños cargados`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error en carga paginada:', error);
      // Último fallback a carga normal
      await this.loadDesignsNormal();
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
    // Mostrar información sobre la estructura esperada
    const structureInfo = `📋 ESTRUCTURA REQUERIDA DEL EXCEL:

Las columnas deben estar en este orden exacto:
1. ID (autoincremental - se genera automáticamente)
2. Artículo F
3. Cliente  
4. Descripción
5. Sustrato
6. Tipo
7. Tipo de Impresión
8. # de Colores
9. Color1
10. Color2
11. Color3
12. Color4
13. Color5
14. Color6
15. Color7
16. Color8
17. Color9
18. Color10
19. Estado

NOTA: El ID se genera automáticamente (1, 2, 3, etc.)
¿Deseas continuar con la importación?`;

    if (!confirm(structureInfo)) {
      return;
    }

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
    
    // Administrador siempre tiene acceso completo
    if (this.isAdmin()) {
      console.log('👑 Usuario administrador - Acceso completo garantizado');
      this.showCreateForm.set(true);
      this.resetCreateForm();
      return;
    }
    
    // Verificar permisos para otros roles
    if (!this.hasPermission('canCreateDesign')) {
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
      colors: ['P Black'],
      status: 'ACTIVO'
    });
    
    // Inicializar con color negro por defecto
    const defaultColor = this.pantoneService.getColorByCode('Black');
    if (defaultColor) {
      this.selectedColors.set([defaultColor]);
    }
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
    const currentSelectedColors = this.selectedColors();
    
    // Ajustar la lista de colores seleccionados
    const newSelectedColors = [...currentSelectedColors];
    
    // Si necesitamos más colores, agregar colores por defecto
    while (newSelectedColors.length < colorCount) {
      const defaultColor = this.pantoneService.getColorByCode('Black');
      if (defaultColor) {
        newSelectedColors.push(defaultColor);
      }
    }
    
    // Si hay demasiados colores, remover los últimos
    while (newSelectedColors.length > colorCount) {
      newSelectedColors.pop();
    }
    
    this.selectedColors.set(newSelectedColors);
    
    // Actualizar el formulario con los códigos de los colores
    const colorCodes = newSelectedColors.map(color => color.displayName);
    this.createDesignForm.patchValue({ colors: colorCodes });
  }

  /**
   * Buscar colores Pantone
   */
  searchPantoneColors(searchTerm: string) {
    this.colorSearchTerm.set(searchTerm);
    if (searchTerm.trim()) {
      const filteredColors = this.pantoneService.searchByCode(searchTerm);
      this.availablePantoneColors.set(filteredColors);
    } else {
      this.availablePantoneColors.set(this.pantoneService.getAllColors());
    }
  }

  /**
   * Seleccionar color Pantone para una posición específica
   */
  selectPantoneColor(colorIndex: number, color: PantoneColor) {
    const currentColors = [...this.selectedColors()];
    currentColors[colorIndex] = color;
    this.selectedColors.set(currentColors);
    
    // Actualizar formulario
    const colorCodes = currentColors.map(c => c.displayName);
    this.createDesignForm.patchValue({ colors: colorCodes });
    
    console.log(`🎨 Color ${colorIndex + 1} seleccionado:`, color.displayName, color.hex);
  }

  /**
   * Obtener colores más utilizados
   */
  getMostUsedColors(): PantoneColor[] {
    return this.pantoneService.getMostUsedColors();
  }

  /**
   * TrackBy function para optimizar el ngFor de colores
   */
  trackByIndex(index: number, item: any): number {
    return index;
  }

  /**
   * Método simple para cargar datos directamente
   */
  async loadDataDirectly() {
    console.log('🔍 Cargando datos directamente...');
    this.loading.set(true);
    
    try {
      // Primero verificar si hay datos en la BD
      console.log('1️⃣ Verificando conteo de datos...');
      const countResponse = await this.http.get<any>(`${environment.apiUrl}/designs/count`).toPromise();
      console.log('📊 Conteo de diseños:', countResponse);
      
      if (countResponse.count === 0) {
        console.warn('⚠️ La base de datos está vacía');
        this.snackBar.open('Base de datos vacía - Importa un archivo Excel o crea datos de prueba', 'Cerrar', {
          duration: 8000,
          panelClass: ['warning-snackbar']
        });
        this.allDesigns.set([]);
        this.filteredDesigns.set([]);
        this.totalRecords.set(0);
        return;
      }
      
      // Si hay datos, intentar cargarlos
      console.log(`2️⃣ Hay ${countResponse.count} diseños, cargando...`);
      const response = await this.http.get<any>(`${environment.apiUrl}/designs`).toPromise();
      console.log('✅ Respuesta recibida:', response);
      
      if (response && Array.isArray(response)) {
        console.log(`📊 ${response.length} diseños cargados exitosamente`);
        this.allDesigns.set(response);
        this.filteredDesigns.set(response);
        this.totalRecords.set(response.length);
        
        this.snackBar.open(`${response.length} diseños cargados correctamente`, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
      } else {
        console.warn('⚠️ Respuesta no es un array:', response);
        this.snackBar.open('Error: Formato de respuesta inesperado', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error cargando datos directamente:', error);
      console.error('❌ Detalles del error:', error.error);
      
      let errorMessage = `Error ${error.status}: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 8000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Método de prueba para verificar endpoint /all
   */
  async testAllEndpoint() {
    console.log('🧪 Probando endpoint /all...');
    
    // Probar controlador de prueba independiente
    try {
      console.log('🔍 Probando controlador de prueba independiente...');
      const testResponse = await this.http.get<any>(`${environment.apiUrl}/test/ping`).toPromise();
      console.log('✅ Controlador de prueba funciona:', testResponse);
    } catch (error: any) {
      console.error('❌ Error en controlador de prueba:', error);
      if (error.status === 404) {
        console.log('ℹ️ Error 404 = Servidor funciona pero controlador no registrado');
        this.snackBar.open('Servidor funciona - Problema de registro de controladores', 'Cerrar', {
          duration: 5000,
          panelClass: ['warning-snackbar']
        });
      } else {
        this.snackBar.open(`Error en servidor: ${error.status} - ${error.message}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }
    }

    // Probar endpoint sin dependencias
    try {
      console.log('🔍 Probando endpoint sin dependencias /status...');
      const statusResponse = await this.http.get<any>(`${environment.apiUrl}/designs/status`).toPromise();
      console.log('✅ Endpoint status funciona:', statusResponse);
      
      this.snackBar.open('✅ Controlador DesignsController funciona correctamente', 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
    } catch (error: any) {
      console.error('❌ Error en endpoint status:', error);
      
      if (error.status === 400) {
        console.log('🚨 Error 400 = Problema en el controlador DesignsController');
        this.snackBar.open('Error 400: Problema en DesignsController - Revisar inyección de dependencias', 'Cerrar', {
          duration: 8000,
          panelClass: ['error-snackbar']
        });
      }
    }

    // Probar inyección de dependencias
    try {
      console.log('🔍 Probando inyección de dependencias...');
      const depResponse = await this.http.get<any>(`${environment.apiUrl}/designs/check-dependencies`).toPromise();
      console.log('✅ Dependencias:', depResponse);
      
      if (depResponse.designService === 'NULL' || depResponse.logger === 'NULL') {
        console.error('❌ PROBLEMA: Servicios no están inyectados correctamente');
        this.snackBar.open('Error: Servicios no configurados en el backend', 'Cerrar', {
          duration: 8000,
          panelClass: ['error-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error verificando dependencias:', error);
    }

    // Probar endpoint ultra simple del controlador designs
    try {
      console.log('🔍 Probando endpoint ultra simple /ping...');
      const pingResponse = await this.http.get<any>(`${environment.apiUrl}/designs/ping`).toPromise();
      console.log('✅ Endpoint ping funciona:', pingResponse);
    } catch (error: any) {
      console.error('❌ Error en endpoint ping:', error);
      console.log('⚠️ El controlador DesignsController tiene problemas con endpoints que usan servicios');
    }

    // Probar endpoint de prueba de BD
    try {
      console.log('🔍 Probando endpoint de prueba de BD...');
      const dbTestResponse = await this.http.get<any>(`${environment.apiUrl}/designs/db-test`).toPromise();
      console.log('✅ Endpoint db-test funciona:', dbTestResponse);
      
      if (dbTestResponse.isEmpty) {
        console.warn('⚠️ LA BASE DE DATOS ESTÁ VACÍA - No hay diseños');
        this.snackBar.open('⚠️ Base de datos vacía - Importa un archivo Excel primero', 'Cerrar', {
          duration: 8000,
          panelClass: ['warning-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error en endpoint db-test:', error);
    }

    // Probar endpoint de prueba simple
    try {
      console.log('🔍 Probando endpoint de prueba simple...');
      const testResponse = await this.http.get<any>(`${environment.apiUrl}/designs/all-test`).toPromise();
      console.log('✅ Endpoint de prueba funciona:', testResponse);
    } catch (error: any) {
      console.error('❌ Error en endpoint de prueba:', error);
      this.snackBar.open(`Error en endpoint de prueba: ${error.status} - ${error.message}`, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Probar endpoint raw primero
    try {
      console.log('🔍 Probando endpoint /all-raw...');
      const rawResponse = await this.http.get<any>(`${environment.apiUrl}/designs/all-raw`).toPromise();
      console.log('✅ Endpoint raw funciona:', rawResponse);
    } catch (error: any) {
      console.error('❌ Error en endpoint raw:', error);
    }

    // Probar endpoint de conteo
    try {
      console.log('🔍 Probando endpoint /count...');
      const countResponse = await this.http.get<any>(`${environment.apiUrl}/designs/count`).toPromise();
      console.log('✅ Endpoint count funciona:', countResponse);
      
      if (countResponse.count > 0) {
        console.log(`📊 TOTAL DE DISEÑOS EN BD: ${countResponse.count}`);
        this.snackBar.open(`Total en BD: ${countResponse.count} diseños`, 'Cerrar', {
          duration: 5000,
          panelClass: ['info-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error en endpoint count:', error);
    }

    // Probar endpoint safe
    try {
      console.log('🔍 Probando endpoint /all-safe...');
      const safeResponse = await this.http.get<any>(`${environment.apiUrl}/designs/all-safe`).toPromise();
      console.log('✅ Endpoint safe funciona:', safeResponse);
      
      if (Array.isArray(safeResponse) && safeResponse.length > 0) {
        console.log(`📊 ENDPOINT SAFE CARGA: ${safeResponse.length} diseños`);
        this.snackBar.open(`Endpoint safe carga: ${safeResponse.length} diseños`, 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error en endpoint safe:', error);
    }

    // Ahora probar el endpoint /all real
    try {
      console.log('🔍 Probando endpoint /all real...');
      const response = await this.http.get<any>(`${environment.apiUrl}/designs/all`).toPromise();
      console.log('✅ Respuesta del endpoint /all:', response);
      
      if (Array.isArray(response)) {
        console.log('📊 Cantidad de diseños:', response.length);
        this.snackBar.open(`Endpoint /all funciona: ${response.length} diseños`, 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      } else if (response && response.designs) {
        console.log('📊 Cantidad de diseños:', response.designs.length);
        this.snackBar.open(`Endpoint /all funciona: ${response.designs.length} diseños (${response.message})`, 'Cerrar', {
          duration: 5000,
          panelClass: ['info-snackbar']
        });
      } else {
        console.log('📊 Respuesta no es array:', response);
        this.snackBar.open(`Endpoint /all responde pero formato inesperado`, 'Cerrar', {
          duration: 5000,
          panelClass: ['warning-snackbar']
        });
      }
    } catch (error: any) {
      console.error('❌ Error en endpoint /all:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Error completo:', error);
      
      this.snackBar.open(`Error en endpoint /all: ${error.status} - ${error.error?.message || error.message}`, 'Cerrar', {
        duration: 8000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Crear datos de prueba si la BD está vacía
   */
  async createSampleData() {
    console.log('🧪 Creando datos de prueba...');
    
    try {
      const response = await this.http.post<any>(`${environment.apiUrl}/designs/create-sample-data`, {}).toPromise();
      console.log('✅ Datos de prueba creados:', response);
      
      this.snackBar.open(`${response.createdCount} diseños de prueba creados`, 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
      
      // Recargar datos
      await this.loadAllDesignsAfterImport();
      
    } catch (error: any) {
      console.error('❌ Error creando datos de prueba:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Error completo:', error.error);
      
      let errorMessage = 'Error creando datos de prueba';
      if (error.status === 400 && error.error?.message) {
        errorMessage = error.error.message;
        if (error.error.details) {
          errorMessage += ` - ${error.error.details}`;
        }
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      }
      
      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 8000,
        panelClass: ['error-snackbar']
      });
    }
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
   * Manejar selección de archivo Excel para importar diseños (OPTIMIZADO PARA 300MB)
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

    // Validar tamaño del archivo (máximo 300MB)
    const maxSize = 300 * 1024 * 1024; // 300MB
    if (file.size > maxSize) {
      this.snackBar.open('El archivo es demasiado grande. Máximo 300MB permitido.', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Mostrar advertencia para archivos grandes
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 100) {
      const confirmLargeFile = confirm(
        `⚠️ ARCHIVO GRANDE DETECTADO\n\n` +
        `Tamaño: ${fileSizeMB.toFixed(2)} MB\n\n` +
        `Archivos grandes pueden tomar varios minutos en procesarse.\n` +
        `¿Deseas continuar con la importación?`
      );
      
      if (!confirmLargeFile) {
        event.target.value = '';
        return;
      }
    }

    this.uploading.set(true);
    this.uploadProgress.set(0);

    try {
      console.log(`📁 Procesando archivo GRANDE: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      
      // Configurar opciones para procesamiento masivo
      formData.append('processAll', 'true');        // Procesar TODOS los registros
      formData.append('noLimit', 'true');           // Sin límite de registros
      formData.append('batchSize', '5000');         // Procesar en lotes de 5,000 filas
      formData.append('enableStreaming', 'true');   // Habilitar streaming
      formData.append('optimizeMemory', 'true');    // Optimizar memoria
      formData.append('validateStructure', 'true'); // Validar estructura de Excel
      
      // Especificar estructura CORRECTA esperada del Excel
      formData.append('expectedColumns', JSON.stringify([
        'articulo_f', 'cliente', 'descripcion', 'sustrato', 'tipo', 'tipo_de_impresion', 
        'numero_de_colores', 'color1', 'color2', 'color3', 'color4', 'color5', 
        'color6', 'color7', 'color8', 'color9', 'color10', 'estado'
      ]));
      
      // Progreso más realista para archivos grandes
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        if (progressValue < 85) {
          // Progreso más lento para archivos grandes
          const increment = fileSizeMB > 200 ? 2 : fileSizeMB > 100 ? 5 : 10;
          progressValue += increment;
          this.uploadProgress.set(progressValue);
        }
      }, fileSizeMB > 200 ? 2000 : fileSizeMB > 100 ? 1000 : 500);

      // Mostrar mensaje de procesamiento para archivos grandes
      if (fileSizeMB > 50) {
        this.snackBar.open(
          `Procesando archivo de ${fileSizeMB.toFixed(2)} MB... Esto puede tomar varios minutos.`,
          'Entendido',
          {
            duration: 8000,
            panelClass: ['info-snackbar']
          }
        );
      }

      // Enviar archivo al backend (usar endpoint existente con configuraciones para archivos grandes)
      const response = await this.http.post<any>(
        `${environment.apiUrl}/designs/import/excel`,
        formData,
        {
          // Headers para archivos grandes
          headers: {
            'X-Large-File': 'true',
            'X-File-Size': file.size.toString(),
            'X-Chunk-Size': '10000',
            'X-Enable-Streaming': 'true',
            'X-Optimize-Memory': 'true'
          }
        }
      ).toPromise();
      
      clearInterval(progressInterval);
      this.uploadProgress.set(100);

      if (response) {
        console.log(`✅ Importación MASIVA completada: ${response.successCount} exitosos, ${response.errorCount} errores`);
        console.log(`⏱️ Tiempo de procesamiento: ${response.processingTime}ms`);
        
        let message = `🎉 Archivo GRANDE procesado exitosamente!\n`;
        message += `✅ ${response.successCount} diseños importados`;
        if (response.errorCount > 0) {
          message += `\n⚠️ ${response.errorCount} errores encontrados`;
        }
        message += `\n⏱️ Tiempo: ${Math.round(response.processingTime / 1000)}s`;
        
        this.snackBar.open(message, 'Cerrar', {
          duration: 8000,
          panelClass: ['success-snackbar']
        });

        // Mostrar estadísticas detalladas para archivos grandes
        if (response.stats) {
          console.log('📊 Estadísticas de importación:', response.stats);
          setTimeout(() => {
            this.snackBar.open(
              `📊 Estadísticas: ${response.stats.rowsProcessed} filas, ${response.stats.chunksProcessed} chunks`,
              'Ver detalles',
              {
                duration: 5000,
                panelClass: ['info-snackbar']
              }
            );
          }, 2000);
        }

        // Recargar TODOS los diseños después de importación masiva
        console.log('🔄 Iniciando recarga completa después de importación...');
        await this.loadAllDesignsAfterImport();
      }
    } catch (error: any) {
      console.error('❌ Error procesando archivo GRANDE:', error);
      
      let errorMessage = 'Error al procesar el archivo Excel grande';
      if (error.status === 400) {
        errorMessage = 'Formato de archivo inválido o datos incorrectos';
      } else if (error.status === 413) {
        errorMessage = 'El archivo excede el límite del servidor (300MB)';
      } else if (error.status === 408 || error.name === 'TimeoutError') {
        errorMessage = 'Timeout: El archivo es muy grande y tardó demasiado en procesarse';
      } else if (error.status === 507) {
        errorMessage = 'Espacio insuficiente en el servidor para procesar el archivo';
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión con el servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 8000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.uploading.set(false);
      this.uploadProgress.set(0);
      
      // Limpiar el input file de forma segura
      if (event && event.target) {
        event.target.value = '';
      }
    }
  }

  /**
   * Buscar diseños (OPTIMIZADO para bases de datos grandes)
   */
  onSearch() {
    const term = this.searchTerm().toLowerCase().trim();
    
    if (!term) {
      this.filteredDesigns.set(this.allDesigns());
      return;
    }

    // Para bases de datos grandes, usar búsqueda en servidor
    if (this.totalRecords() > 1000) {
      this.searchOnServer(term);
    } else {
      // Búsqueda local para datasets pequeños
      this.searchLocally(term);
    }
  }

  /**
   * Búsqueda local optimizada
   */
  private searchLocally(term: string) {
    const startTime = performance.now();
    
    const filtered = this.allDesigns().filter(design =>
      design.articleF.toLowerCase().includes(term) ||
      design.client.toLowerCase().includes(term) ||
      design.description.toLowerCase().includes(term) ||
      design.substrate.toLowerCase().includes(term)
    );

    this.filteredDesigns.set(filtered);
    
    const endTime = performance.now();
    console.log(`🔍 Búsqueda local completada en ${(endTime - startTime).toFixed(2)}ms - ${filtered.length} resultados`);
  }

  /**
   * Búsqueda en servidor para bases de datos grandes (usando endpoint existente)
   */
  private async searchOnServer(term: string) {
    this.loading.set(true);
    try {
      console.log(`🔍 Búsqueda optimizada para: "${term}"`);
      
      // Usar endpoint existente con parámetros de búsqueda
      const response = await this.http.get<any>(`${environment.apiUrl}/designs`, {
        params: {
          search: term,
          page: '1',
          pageSize: this.pageSize().toString()
        }
      }).toPromise();
      
      if (response) {
        const results = Array.isArray(response) ? response : (response.items || []);
        console.log(`✅ Búsqueda completada: ${results.length} resultados`);
        
        this.filteredDesigns.set(results);
        
        this.snackBar.open(
          `${results.length} resultados encontrados`,
          'Cerrar',
          {
            duration: 3000,
            panelClass: ['info-snackbar']
          }
        );
      }
    } catch (error: any) {
      console.error('❌ Error en búsqueda del servidor:', error);
      // Fallback a búsqueda local
      this.searchLocally(term);
    } finally {
      this.loading.set(false);
    }
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
   * Limpiar caché y optimizar memoria
   */
  async clearCache() {
    try {
      console.log('🧹 Limpiando caché y optimizando memoria...');
      
      const response = await this.http.post<any>(`${environment.apiUrl}/designs/cache/clear`, {
        optimizeMemory: true,
        clearAll: true
      }).toPromise();
      
      if (response) {
        console.log('✅ Caché limpiado y memoria optimizada');
        
        // Limpiar también caché local
        this.clearLocalCache();
        
        this.snackBar.open(
          `Caché limpiado - ${response.freedMemory} MB liberados`,
          'Cerrar',
          {
            duration: 4000,
            panelClass: ['success-snackbar']
          }
        );
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
   * Limpiar caché local del navegador
   */
  private clearLocalCache() {
    try {
      // Limpiar localStorage relacionado con diseños
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('designs_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Forzar garbage collection si está disponible
      if ('gc' in window) {
        (window as any).gc();
      }
      
      console.log(`🧹 Caché local limpiado: ${keysToRemove.length} elementos removidos`);
    } catch (error) {
      console.warn('⚠️ No se pudo limpiar completamente el caché local:', error);
    }
  }

  /**
   * Optimizar rendimiento de la aplicación
   */
  async optimizePerformance() {
    try {
      console.log('⚡ Optimizando rendimiento...');
      
      // Limpiar caché local
      this.clearLocalCache();
      
      // Reducir tamaño de página si hay muchos datos
      if (this.totalRecords() > 5000) {
        this.pageSize.set(50);
        console.log('📄 Tamaño de página reducido a 50 para mejor rendimiento');
      }
      
      // Habilitar virtual scrolling para datasets grandes
      if (this.totalRecords() > 1000) {
        this.virtualScrollEnabled.set(true);
        console.log('📜 Virtual scrolling habilitado');
      }
      
      // Optimización local (sin depender de endpoint específico)
      console.log('✅ Optimización local completada');
      
      const optimizations = [];
      if (this.totalRecords() > 5000) optimizations.push('Paginación reducida');
      if (this.totalRecords() > 1000) optimizations.push('Virtual scrolling');
      optimizations.push('Cache limpiado');
      
      this.snackBar.open(
        `Rendimiento optimizado - ${optimizations.join(', ')}`,
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['success-snackbar']
        }
      );
      
    } catch (error: any) {
      console.error('❌ Error optimizando rendimiento:', error);
    }
  }

  /**
   * Monitorear uso de memoria
   */
  getMemoryUsage(): any {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  /**
   * Verificar si necesita optimización
   */
  needsOptimization(): boolean {
    const memory = this.getMemoryUsage();
    if (memory) {
      const usagePercent = (memory.used / memory.limit) * 100;
      return usagePercent > 80 || this.totalRecords() > 10000;
    }
    return this.totalRecords() > 10000;
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