import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { interval, Subscription } from 'rxjs';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PantoneLiveService, PantoneColor } from '../../services/pantone-live.service';
import { AniloxService, Anilox, CreateAniloxDto, UpdateAniloxDto } from '../../services/anilox.service';
import { MachineConfigService } from '../../services/machine-config.service';
import { ExcelService } from '../../services/excel.service';
import { PermissionsService, PERMISSIONS } from '../../services/permissions.service';
import { ConfirmDeleteDialogComponent } from './confirm_delete/confirm-delete-dialog';
import { DuplicateDesignDialogComponent } from './duplicate_design/duplicate-design-dialog';
import { CreateAniloxDialogComponent } from './create_anilox/create-anilox-dialog';
import { EditAniloxDialogComponent } from './edit_anilox/edit-anilox-dialog';
import { CreatePantoneDialogComponent } from './create_pantone/create-pantone-dialog';

interface FlexographicDesign {
  id?: number;
  articleF: string;
  client: string;
  description: string;
  substrate: string;
  type: 'LAMINA' | 'TUBULAR' | 'SEMITUBULAR';
  anchoMm?: number;
  printType: 'CARA' | 'DORSO' | 'CARA_DORSO';
  colorCount: number;

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

// ===== INTERFACES PARA COD TINTAS =====
interface ColorTinta {
  nombre: string;
  codTinta: string;
  cobertura: number | null;
  codAnilox: string;
}

interface CodTintaRecord {
  id?: number;
  articulo: string;
  descripcion: string;
  carpeta?: string;
  estante?: string;
  lineaTinta?: string;
  colores: ColorTinta[];
  createdAt?: Date;
  updatedAt?: Date;
  expanded?: boolean;
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
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './diseno.html',
  styleUrls: ['./diseno.scss']

})
export class DesignComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private machineConfigService = inject(MachineConfigService);
  private pantoneService = inject(PantoneLiveService);
  private aniloxService = inject(AniloxService);
  private excelService = inject(ExcelService);
  private permissionsService = inject(PermissionsService);


  Math = Math;


  private updateSubscription: Subscription = new Subscription();


  currentUser = signal<User | null>(null);
  loading = signal<boolean>(false);
  uploading = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  searchTerm = signal<string>('');
  allDesigns = signal<FlexographicDesign[]>([]);
  filteredDesigns = signal<FlexographicDesign[]>([]);
  expandedColors = signal<Set<string>>(new Set());
  showCreateForm = signal<boolean>(false);
  showEditForm = signal<boolean>(false);
  editingDesign = signal<FlexographicDesign | null>(null);


  currentPage = signal<number>(1);
  pageSize = signal<number>(50);
  totalRecords = signal<number>(0);
  hasMoreData = signal<boolean>(true);
  loadingMore = signal<boolean>(false);
  virtualScrollEnabled = signal<boolean>(true);
  cacheEnabled = signal<boolean>(true);


  createDesignForm: FormGroup;


  editDesignForm: FormGroup;


  availablePantoneColors = signal<PantoneColor[]>([]);
  selectedColors = signal<PantoneColor[]>([]);
  colorSearchTerm = signal<string>('');


  displayedColumns: string[] = [
    'articleF', 'client', 'description', 'substrate', 'type', 'anchoMm',
    'printType', 'colors', 'status', 'actions'
  ];


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


  aniloxData: any[] = [];
  filteredAniloxData: any[] = [];
  selectedMachine: string = 'all';
  aniloxSearchTerm: string = '';
  availableMachines: number[] = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  aniloxDisplayedColumns: string[] = ['codigo', 'maquina', 'bcm', 'lineatura', 'marca', 'volumenReal', 'factorEficiencia', 'densidad', 'actions'];
  machinesCargaMuestra: { [key: number]: number | null } = {};

  // ===== PROPIEDADES PARA COD TINTAS =====
  codTintasData = signal<CodTintaRecord[]>([]);
  filteredCodTintasData = signal<CodTintaRecord[]>([]);
  codTintasSearchTerm = signal<string>('');
  codTintasColumns: string[] = ['expand', 'articulo', 'descripcion', 'estante', 'carpeta', 'colores', 'lineaTinta', 'codTintas', 'cobertura', 'codAnilox', 'acciones'];
  loadingCodTintas = signal<boolean>(false);
  
  // Paginación para Cod Tintas
  codTintasCurrentPage = signal<number>(1);
  codTintasPageSize = signal<number>(50);
  codTintasTotalRecords = signal<number>(0);
  codTintasHasMoreData = signal<boolean>(true);

  // Debounce para actualizaciones de Cod Tintas
  private codTintasUpdateTimers = new Map<number, any>();
  private codTintasUpdatePending = new Map<number, boolean>();

  constructor() {

    this.createDesignForm = this.fb.group({
      articleF: ['', [Validators.required, Validators.maxLength(50)]],
      client: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      substrate: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['LAMINA', Validators.required],
      anchoMm: [null, [Validators.min(1)]],
      printType: ['CARA', Validators.required],
      colorCount: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      colors: [['Negro'], Validators.required],
      status: ['ACTIVO', Validators.required]
    });


    this.editDesignForm = this.fb.group({
      articleF: ['', [Validators.required, Validators.maxLength(50)]],
      client: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      substrate: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['LAMINA', Validators.required],
      anchoMm: [null, [Validators.min(1)]],
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
    this.initializeAniloxData();
    this.loadMachineConfigs();
    this.loadDesigns();
    this.loadCodTintas(); // Cargar datos de Cod Tintas
  }

  ngOnDestroy() {
    this.stopAutoUpdate();
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
  }


  private optimizationInterval: any = null;

  private initializeOptimizations() {
    const memory = this.getMemoryUsage();
    if (memory) {
      if (memory.limit < 1000) this.pageSize.set(25);
      else if (memory.limit < 2000) this.pageSize.set(50);
      else this.pageSize.set(100);
    }


    this.optimizationInterval = setInterval(() => {
      if (this.needsOptimization()) {
        this.optimizePerformance();
      }
    }, 30000);
  }


  loadPantoneColors() {
    const colors = this.pantoneService.getAllColors();
    this.availablePantoneColors.set(colors);
  }


  loadCurrentUser() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);

    if (user) {
      // Cargar permisos dinámicos del usuario
      if (this.permissionsService.permissions().length === 0) {
        this.permissionsService.loadCurrentUserPermissions(Number(user.id)).subscribe({
          next: () => this.applyDesignPermissions(),
          error: () => this.applyDesignPermissions()
        });
      } else {
        this.applyDesignPermissions();
      }
    }
  }

  private applyDesignPermissions() {
    const permissions: UserPermissions = {
      canCreateDesign: this.permissionsService.hasPermission(PERMISSIONS.DESIGN_CREATE),
      canBulkUpload: this.permissionsService.hasPermission(PERMISSIONS.DESIGN_IMPORT),
      canClearDatabase: this.permissionsService.hasPermission(PERMISSIONS.DESIGN_DELETE),
      canEditDesign: this.permissionsService.hasPermission(PERMISSIONS.DESIGN_EDIT),
      canDeleteDesign: this.permissionsService.hasPermission(PERMISSIONS.DESIGN_DELETE),
      create_design: this.permissionsService.hasPermission(PERMISSIONS.DESIGN_CREATE),
      bulk_upload: this.permissionsService.hasPermission(PERMISSIONS.DESIGN_IMPORT),
      admin_clear_db: this.permissionsService.hasPermission(PERMISSIONS.DESIGN_DELETE)
    };
    this.userPermissions.set(permissions);
  }

  hasExportPermission(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.DESIGN_EXPORT);
  }


  hasPermission(permission: keyof UserPermissions): boolean {
    const hasPermission = this.userPermissions()[permission];
    console.log(`🔍 Verificando permiso '${permission}':`, hasPermission);
    return hasPermission;
  }


  isAdmin(): boolean {
    const user = this.currentUser();
    const userRole = user?.role?.toLowerCase() || '';
    const isAdmin = userRole === 'admin';
    console.log('👑 ¿Es administrador?:', isAdmin, '- Rol original:', user?.role, '- Rol normalizado:', userRole);
    return isAdmin;
  }


  startAutoUpdate() {
    this.stopAutoUpdate();


    this.updateSubscription = interval(1000).subscribe(() => {
      this.refreshDesignsSilent();
    });
    console.log('⏱️ Actualización automática iniciada (1s)');
  }


  stopAutoUpdate() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
      this.updateSubscription = new Subscription();
    }
  }


  async refreshDesignsSilent() {


    if (this.loading() || this.loadingMore() || this.searchTerm() || this.currentPage() !== 1) {
      return;
    }

    try {
      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, {
        params: {
          page: '1',
          pageSize: this.pageSize().toString()
        }
      }).toPromise();

      if (response) {
        const items = response.items || response;

        if (items && items.length > 0) {
          this.allDesigns.set(items);
          this.filteredDesigns.set(items);
        }
      }
    } catch (error) {

      console.error('Error en actualización silenciosa:', error);
    }
  }


  async loadDesigns() {
    await this.loadDesignsPaginated(this.currentPage(), this.pageSize(), this.searchTerm());
  }


  async loadAllDesignsAfterImport() {
    this.loading.set(true);
    try {
      console.log('🚀 Recargando diseños después de importación...');


      this.currentPage.set(1);

      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, {
        params: {
          page: '1',
          pageSize: this.pageSize().toString()
        }
      }).toPromise();

      if (response && response.items) {
        console.log(`✅ Cargados ${response.items.length} diseños de ${response.totalCount} totales`);


        const items = response.items as any[];
        const processedDesigns: FlexographicDesign[] = items.map((design: FlexographicDesign) => ({
          ...design,
          colors: this.extractColorsFromDesign(design)
        }));

        this.allDesigns.set(processedDesigns);
        this.filteredDesigns.set(processedDesigns);
        this.totalRecords.set(response.totalCount);
        this.hasMoreData.set(response.page < response.totalPages);

        // Snackbar de éxito con icono animado
        const mensajeConIcono = `<span class="status-icon">✓</span>Importación completada: ${response.totalCount} diseños en total`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 4000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);
      } else {
        console.warn('⚠️ Respuesta vacía del servidor');
        this.allDesigns.set([]);
        this.filteredDesigns.set([]);
        this.totalRecords.set(0);
      }
    } catch (error: any) {
      console.error('❌ Error recargando diseños:', error);
      
      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al recargar diseños. Por favor, recarga la página`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 5000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    } finally {
      this.loading.set(false);
    }
  }


  async loadDesignsWithVirtualScroll() {
    try {
      console.log('📊 Iniciando carga optimizada...');


      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, {
        params: {
          page: '1',
          pageSize: this.pageSize().toString()
        }
      }).toPromise();

      if (response) {

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

        // Snackbar de éxito con icono animado
        const mensajeConIcono = `<span class="status-icon">✓</span>${adaptedResponse.items.length} diseños cargados - Modo optimizado`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 3000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);
      }
    } catch (error: any) {
      console.error('❌ Error en carga optimizada:', error);
      throw error;
    }
  }


  async loadMoreDesigns() {
    if (!this.hasMoreData() || this.loadingMore()) return;

    this.loadingMore.set(true);
    try {
      const nextPage = this.currentPage() + 1;
      const term = this.searchTerm().toLowerCase().trim();

      console.log(`📄 Cargando página ${nextPage} (Búsqueda: "${term}")...`);

      let params: any = {
        page: nextPage.toString(),
        pageSize: this.pageSize().toString()
      };

      if (term) {
        params.search = term;
      }

      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, { params }).toPromise();

      if (response) {
        const adaptedResponse = {
          items: response.items || response,
          hasMore: response.hasMore || false
        };

        if (adaptedResponse.items.length > 0) {

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

      this.hasMoreData.set(false);
    } finally {
      this.loadingMore.set(false);
    }
  }


  async loadDesignsPaginatedOptimized() {
    try {
      console.log('📊 Carga paginada como fallback...');


      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, {
        params: {
          page: '1',
          pageSize: '50'
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

      await this.loadDesignsNormal();
    }
  }


  async loadDesignsPaginated(page: number = 1, pageSize: number = 50, search?: string) {
    this.loading.set(true);
    try {
      console.log(`🚀 Cargando diseños paginados - Página: ${page}, Tamaño: ${pageSize}`);

      this.currentPage.set(page);

      let params: any = {
        page: page.toString(),
        pageSize: pageSize.toString()
      };

      if (search) {
        params.search = search;
      }

      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, { params }).toPromise();

      if (response && response.items) {
        console.log(`✅ ${response.items.length} diseños cargados`);


        const items = response.items as any[];
        const processedDesigns: FlexographicDesign[] = items.map((design: FlexographicDesign) => ({
          ...design,
          colors: this.extractColorsFromDesign(design)
        }));

        this.allDesigns.set(processedDesigns);
        this.filteredDesigns.set(processedDesigns);
        this.totalRecords.set(response.totalCount);
        this.hasMoreData.set(page < response.totalPages);

        // Snackbar de éxito con icono animado
        const mensajeConIcono = `<span class="status-icon">✓</span>Página ${page} cargada`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 2000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);
      }
    } catch (error: any) {
      console.error('❌ Error cargando diseños paginados:', error);
      this.handleLoadError(error);
    } finally {
      this.loading.set(false);
    }
  }


  async nextPage() {
    if (this.hasMoreData() && !this.loading()) {
      await this.loadDesignsPaginated(this.currentPage() + 1, this.pageSize(), this.searchTerm());
    }
  }


  async previousPage() {
    if (this.currentPage() > 1 && !this.loading()) {
      await this.loadDesignsPaginated(this.currentPage() - 1, this.pageSize(), this.searchTerm());
    }
  }


  async onPageSizeChange(newSize: number) {
    this.pageSize.set(newSize);
    await this.loadDesignsPaginated(1, newSize, this.searchTerm());
  }


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


  async loadDesignsNormal() {
    try {
      console.log('🎨 Cargando diseños con paginación...');


      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, {
        params: {
          page: '1',
          pageSize: this.pageSize().toString()
        }
      }).toPromise();

      if (response && response.items) {
        console.log(`✅ ${response.items.length} diseños cargados de ${response.totalCount} totales`);

        const items = response.items as any[];
        const processedDesigns: FlexographicDesign[] = items.map((design: FlexographicDesign) => ({
          ...design,
          colors: this.extractColorsFromDesign(design)
        }));

        this.allDesigns.set(processedDesigns);
        this.filteredDesigns.set(processedDesigns);
        this.totalRecords.set(response.totalCount);
        this.hasMoreData.set(response.page < response.totalPages);

        this.snackBar.open(
          `${processedDesigns.length} diseños cargados`,
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      } else {
        this.allDesigns.set([]);
        this.filteredDesigns.set([]);
      }
    } catch (error: any) {
      this.handleLoadError(error);
    }
  }


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




  triggerFileUpload() {
    if (!this.userPermissions().canBulkUpload) {
      this.snackBar.open('No tienes permiso para importar diseños', 'Cerrar', { duration: 3000 });
      return;
    }

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


  async clearAllDesigns() {
    const confirmMessage = `⚠️ ADVERTENCIA: Eliminar todos los diseños

Esta acción eliminará PERMANENTEMENTE todos los diseños de la base de datos MySQL.

¿Estás COMPLETAMENTE SEGURO de continuar?`;

    if (!confirm(confirmMessage)) {
      return;
    }


    const doubleConfirm = confirm('🚨 CONFIRMACIÓN FINAL\n\nEsta operación es IRREVERSIBLE.\n\n¿Continuar con la eliminación?');
    if (!doubleConfirm) return;

    this.loading.set(true);
    try {
      console.log('🗑️ Eliminando todos los diseños de la base de datos...');

      const response = await this.http.post<any>(`${environment.apiUrl}/designs/clear-all`, {}).toPromise();

      if (response) {
        console.log(`✅ ${response.deletedCount} diseños eliminados de MySQL`);


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


  async createNewDesign() {
    const user = this.currentUser();
    console.log('🎨 Intentando crear nuevo diseño...');
    console.log('👤 Usuario:', user?.firstName, user?.lastName);
    console.log('🔑 Rol:', user?.role);
    console.log('🔐 Permisos actuales:', this.userPermissions());


    if (this.isAdmin()) {
      console.log('👑 Usuario administrador - Acceso completo garantizado');
      this.showCreateForm.set(true);
      this.resetCreateForm();
      return;
    }


    if (!this.hasPermission('canCreateDesign')) {
      console.log('❌ Sin permisos para crear diseño');
      this.snackBar.open(`Sin permisos para crear diseños. Rol actual: ${user?.role}`, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    console.log('✅ Permisos verificados - Mostrando formulario de creación');


    this.showCreateForm.set(true);
    this.resetCreateForm();
  }


  resetCreateForm() {
    this.createDesignForm.reset({
      articleF: '',
      client: '',
      description: '',
      substrate: '',
      type: 'LAMINA',
      anchoMm: null,
      printType: 'CARA',
      colorCount: 1,
      colors: [''],
      status: 'ACTIVO'
    });

    this.selectedColors.set([{ code: '', name: '', displayName: '', hex: '#cccccc', rgb: { r: 204, g: 204, b: 204 }, cmyk: { c: 0, m: 0, y: 0, k: 0 }, category: '', colorType: 'pantone' as const }]);
  }


  cancelCreateDesign() {
    this.showCreateForm.set(false);
    this.resetCreateForm();
  }


  async saveNewDesign() {
    if (!this.createDesignForm.valid) {
      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>Por favor completa todos los campos requeridos`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
      
      return;
    }

    this.loading.set(true);
    try {
      const formData = this.createDesignForm.value;
      console.log('💾 Guardando nuevo diseño:', formData);

      const response = await this.http.post<FlexographicDesign>(`${environment.apiUrl}/designs`, formData).toPromise();

      if (response) {
        console.log('✅ Diseño creado exitosamente:', response);


        await this.loadDesigns();

        // Snackbar de éxito con icono animado
        const mensajeConIcono = `<span class="status-icon">✓</span>Diseño "${formData.articleF}" creado exitosamente`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 4000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);


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

      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>${errorMessage}`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 5000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    } finally {
      this.loading.set(false);
    }
  }



  updateColors() {
    const isEditing = this.showEditForm();
    const form = isEditing ? this.editDesignForm : this.createDesignForm;
    const colorCount = form.get('colorCount')?.value || 1;
    const currentSelectedColors = this.selectedColors();
    const newSelectedColors = [...currentSelectedColors];

    while (newSelectedColors.length < colorCount) {
      newSelectedColors.push({ code: '', name: '', displayName: '', hex: '#cccccc', rgb: { r: 204, g: 204, b: 204 }, cmyk: { c: 0, m: 0, y: 0, k: 0 }, category: '', colorType: 'pantone' as const });
    }

    while (newSelectedColors.length > colorCount) {
      newSelectedColors.pop();
    }

    this.selectedColors.set(newSelectedColors);
    const colorCodes = newSelectedColors.map(color => color.displayName);
    form.get('colors')?.setValue(colorCodes, { emitEvent: false });
  }


  private _selectingColor = false;

  updateColorManual(index: number, value: string) {
    // Si se acaba de seleccionar via autocomplete, ignorar el blur
    if (this._selectingColor) return;

    // Si el campo está vacío, no sobreescribir el color actual
    if (!value || !value.trim()) return;

    const currentColors = [...this.selectedColors()];
    const pantoneColor = this.pantoneService.getOrCreateColor(value.trim());

    currentColors[index] = pantoneColor;
    this.selectedColors.set(currentColors);

    const colorCodes = currentColors.map(c => c.displayName);
    const form = this.showEditForm() ? this.editDesignForm : this.createDesignForm;
    form.get('colors')?.setValue(colorCodes, { emitEvent: false });
  }


  selectPantoneColor(colorIndex: number, color: PantoneColor) {
    // Marcar que se está seleccionando via autocomplete para bloquear el blur
    this._selectingColor = true;
    setTimeout(() => { this._selectingColor = false; }, 300);

    const currentColors = [...this.selectedColors()];
    currentColors[colorIndex] = color;
    this.selectedColors.set(currentColors);

    const colorCodes = currentColors.map(c => c.displayName);
    const form = this.showEditForm() ? this.editDesignForm : this.createDesignForm;
    form.get('colors')?.setValue(colorCodes);
  }

  displayPantoneColor(color: PantoneColor | string): string {
    if (!color) return '';
    if (typeof color === 'string') return color;
    return color.displayName || color.code || '';
  }



  searchPantoneColors(searchTerm: string) {
    this.colorSearchTerm.set(searchTerm);
    const term = searchTerm.trim().toUpperCase();

    let results = searchTerm.trim()
      ? this.pantoneService.searchByCode(searchTerm)
      : this.pantoneService.getAllColors();

    this.availablePantoneColors.set(results.slice(0, 50));
  }

  /**
   * Abrir diálogo para crear un nuevo color Pantone
   */
  openCreatePantoneDialog(colorIndex: number) {
    const dialogRef = this.dialog.open(CreatePantoneDialogComponent, {
      width: '460px',
      panelClass: 'rounded-dialog',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe((newColor: PantoneColor | undefined) => {
      if (newColor) {
        const currentColors = [...this.selectedColors()];
        currentColors[colorIndex] = newColor;
        this.selectedColors.set(currentColors);

        const colorCodes = currentColors.map(c => c.displayName);
        const form = this.showEditForm() ? this.editDesignForm : this.createDesignForm;
        form.get('colors')?.setValue(colorCodes);

        this.loadPantoneColors();
      }
    });
  }

  /**
   * Editar un color Pantone existente
   */
  editPantoneColor(colorIndex: number) {
    const color = this.selectedColors()[colorIndex];
    if (!color?.code && !color?.displayName) {
      this.snackBar.open('Selecciona un color primero', 'OK', { duration: 3000 });
      return;
    }

    // Si no tiene id, intentar buscarlo en la BD por código o displayName
    let colorWithId = color;
    if (!color.id) {
      const found = this.pantoneService.getColorByCode(color.code || color.displayName);
      if (found?.id) {
        colorWithId = found;
      } else {
        // Intentar recarga desde API y buscar de nuevo
        this.pantoneService.loadFromApi().then(() => {
          const retryFound = this.pantoneService.getColorByCode(color.code || color.displayName);
          if (retryFound?.id) {
            this.openEditPantoneDialog(colorIndex, retryFound);
          } else {
            this.snackBar.open('Este color no está guardado en la base de datos', 'OK', { duration: 3000 });
          }
        });
        return;
      }
    }

    this.openEditPantoneDialog(colorIndex, colorWithId);
  }

  /**
   * Abrir diálogo de edición de Pantone (extraído para reutilizar)
   */
  private openEditPantoneDialog(colorIndex: number, colorWithId: PantoneColor) {
    const dialogRef = this.dialog.open(CreatePantoneDialogComponent, {
      width: '460px',
      panelClass: 'rounded-dialog',
      data: { mode: 'edit', color: colorWithId }
    });

    dialogRef.afterClosed().subscribe((updatedColor: PantoneColor | undefined) => {
      if (updatedColor) {
        const currentColors = [...this.selectedColors()];
        currentColors[colorIndex] = updatedColor;
        this.selectedColors.set(currentColors);

        const colorCodes = currentColors.map(c => c.displayName);
        const form = this.showEditForm() ? this.editDesignForm : this.createDesignForm;
        form.get('colors')?.setValue(colorCodes);

        this.loadPantoneColors();
      }
    });
  }

  /**
   * Eliminar un color Pantone de la base de datos
   */
  deletePantoneColor(colorIndex: number) {
    const color = this.selectedColors()[colorIndex];
    if (!color?.id) {
      this.snackBar.open('Este color no está guardado en la base de datos', 'OK', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      panelClass: 'rounded-dialog',
      data: {
        title: 'Eliminar Color Pantone',
        message: `¿Estás seguro de eliminar el color "${color.displayName}" de la base de datos?`,
        subtitle: `HEX: ${color.hex}`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      try {
        await this.pantoneService.deleteColor(color.id!);
        this.snackBar.open(`Color "${color.displayName}" eliminado`, 'OK', {
          duration: 3000, panelClass: ['success-snackbar']
        });

        const currentColors = [...this.selectedColors()];
        currentColors[colorIndex] = { code: '', name: '', displayName: '', hex: '#cccccc', rgb: { r: 204, g: 204, b: 204 }, cmyk: { c: 0, m: 0, y: 0, k: 0 }, category: '', colorType: 'pantone' as const };
        this.selectedColors.set(currentColors);

        const colorCodes = currentColors.map(c => c.displayName);
        const form = this.showEditForm() ? this.editDesignForm : this.createDesignForm;
        form.get('colors')?.setValue(colorCodes);

        this.loadPantoneColors();
      } catch (err: any) {
        const msg = err?.error?.message || 'Error al eliminar el color';
        this.snackBar.open(msg, 'Cerrar', { duration: 4000, panelClass: ['error-snackbar'] });
      }
    });
  }

  getMostUsedColors(): PantoneColor[] {
    return this.pantoneService.getMostUsedColors();
  }


  trackByIndex(index: number, item: any): number {
    return index;
  }


  async loadDataDirectly() {
    console.log('🔍 Cargando datos directamente...');
    this.loading.set(true);

    try {

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


      console.log(`2️⃣ Hay ${countResponse.count} diseños, cargando...`);
      const response = await this.http.get<any>(`${environment.apiUrl}/designs`).toPromise();
      console.log('✅ Respuesta recibida:', response);

      if (response && Array.isArray(response)) {
        console.log(`📊 ${response.length} diseños cargados exitosamente`);


        const processedDesigns = response.map((design: FlexographicDesign) => ({
          ...design,
          colors: this.extractColorsFromDesign(design)
        }));

        this.allDesigns.set(processedDesigns);
        this.filteredDesigns.set(processedDesigns);
        this.totalRecords.set(processedDesigns.length);

        this.snackBar.open(`${processedDesigns.length} diseños cargados correctamente`, 'Cerrar', {
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


  async refreshDesigns() {
    console.log('🔄 Refrescando lista de diseños...');


    // Snackbar con icono animado
    const mensajeConIcono = `<span class="status-icon">🔄</span>Actualizando lista de diseños...`;
    const snackBarRef = this.snackBar.open('', '', {
      duration: 1500,
      panelClass: ['status-corriendo-snackbar', 'animated-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    setTimeout(() => {
      const label = document.querySelector('.status-corriendo-snackbar .mat-mdc-snack-bar-label');
      if (label) {
        label.innerHTML = mensajeConIcono;
      }
    }, 0);


    await this.loadDataDirectly();

    console.log('✅ Lista de diseños actualizada');
  }


  async testAllEndpoint() {
    console.log('🧪 Probando endpoint /all...');


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


    try {
      console.log('🔍 Probando endpoint ultra simple /ping...');
      const pingResponse = await this.http.get<any>(`${environment.apiUrl}/designs/ping`).toPromise();
      console.log('✅ Endpoint ping funciona:', pingResponse);
    } catch (error: any) {
      console.error('❌ Error en endpoint ping:', error);
      console.log('⚠️ El controlador DesignsController tiene problemas con endpoints que usan servicios');
    }


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


    try {
      console.log('🔍 Probando endpoint /all-raw...');
      const rawResponse = await this.http.get<any>(`${environment.apiUrl}/designs/all-raw`).toPromise();
      console.log('✅ Endpoint raw funciona:', rawResponse);
    } catch (error: any) {
      console.error('❌ Error en endpoint raw:', error);
    }


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




  async exportToExcel() {
    if (!this.hasExportPermission()) {
      this.snackBar.open('No tienes permiso para exportar diseños', 'Cerrar', { duration: 3000 });
      return;
    }
    this.loading.set(true);
    try {
      console.log('📊 Exportando diseños a Excel...');

      const response = await this.http.get(`${environment.apiUrl}/designs/export/excel`, {
        responseType: 'blob'
      }).toPromise();

      if (response) {

        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Diseños_FlexoAPP_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        // Snackbar de éxito con icono animado
        const mensajeConIcono = `<span class="status-icon">✓</span>Archivo Excel descargado exitosamente`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 3000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);
      }
    } catch (error: any) {
      console.error('❌ Error exportando a Excel:', error);
      
      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al exportar a Excel`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    } finally {
      this.loading.set(false);
    }
  }


  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;


    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.snackBar.open('Solo se permiten archivos Excel (.xlsx, .xls)', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }


    const maxSize = 300 * 1024 * 1024;
    if (file.size > maxSize) {
      this.snackBar.open('El archivo es demasiado grande. Máximo 300MB permitido.', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }


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


      const formData = new FormData();
      formData.append('file', file);


      formData.append('processAll', 'true');
      formData.append('noLimit', 'true');
      formData.append('batchSize', '5000');
      formData.append('enableStreaming', 'true');
      formData.append('optimizeMemory', 'true');
      formData.append('validateStructure', 'true');


      formData.append('expectedColumns', JSON.stringify([
        'id', 'articulo_f', 'cliente', 'descripcion', 'sustrato', 'numero_de_colores',
        'tipo_de_impresion', 'tipo', 'ancho_mm', 'color1', 'color2', 'color3', 'color4', 'color5',
        'color6', 'color7', 'color8', 'color9', 'color10', 'estado'
      ]));


      let progressValue = 0;
      const progressInterval = setInterval(() => {
        if (progressValue < 85) {

          const increment = fileSizeMB > 200 ? 2 : fileSizeMB > 100 ? 5 : 10;
          progressValue += increment;
          this.uploadProgress.set(progressValue);
        }
      }, fileSizeMB > 200 ? 2000 : fileSizeMB > 100 ? 1000 : 500);


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


      const response = await this.http.post<any>(
        `${environment.apiUrl}/designs/import/excel`,
        formData,
        {

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


        console.log('🔄 Iniciando recarga paginada después de importación...');
        await this.loadDesignsWithVirtualScroll();
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


      if (event && event.target) {
        event.target.value = '';
      }
    }
  }


  private searchTimeout: any;
  onSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      const term = this.searchTerm().toLowerCase().trim();
      this.currentPage.set(1);

      if (!term) {
        this.loadDesigns();
        return;
      }

      this.searchOnServer(term);
    }, 500);
  }


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


  private async searchOnServer(term: string) {
    this.loading.set(true);
    try {
      console.log(`🔍 Búsqueda optimizada para: "${term}"`);


      const response = await this.http.get<any>(`${environment.apiUrl}/designs/paginated`, {
        params: {
          search: term,
          page: '1',
          pageSize: this.pageSize().toString()
        }
      }).toPromise();

      if (response) {

        const items = response.items || [];
        const total = response.total || items.length;

        console.log(`✅ Búsqueda completada: ${items.length} resultados (Total: ${total})`);


        const processedItems = items.map((design: FlexographicDesign) => ({
          ...design,
          colors: this.extractColorsFromDesign(design)
        }));

        this.allDesigns.set(processedItems);
        this.filteredDesigns.set(processedItems);
        this.totalRecords.set(total);
        this.hasMoreData.set(response.hasMore || false);

        // Snackbar de éxito con icono animado
        const mensajeConIcono = `<span class="status-icon">✓</span>${total} resultados encontrados`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 3000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);
      }
    } catch (error: any) {
      console.error('❌ Error en búsqueda del servidor:', error);

      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al buscar en el servidor`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    } finally {
      this.loading.set(false);
    }
  }


  clearSearch() {
    this.searchTerm.set('');
    this.filteredDesigns.set(this.allDesigns());
  }


  isColorsExpanded(id: string): boolean {
    return this.expandedColors().has(id);
  }


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


  closeColors(id: string) {
    const expanded = new Set(this.expandedColors());
    expanded.delete(id);
    this.expandedColors.set(expanded);
  }


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


  async clearCache() {
    try {
      console.log('🧹 Limpiando caché y optimizando memoria...');

      const response = await this.http.post<any>(`${environment.apiUrl}/designs/cache/clear`, {
        optimizeMemory: true,
        clearAll: true
      }).toPromise();

      if (response) {
        console.log('✅ Caché limpiado y memoria optimizada');


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


  private clearLocalCache() {
    try {

      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('designs_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));


      if ('gc' in window) {
        (window as any).gc();
      }

      console.log(`🧹 Caché local limpiado: ${keysToRemove.length} elementos removidos`);
    } catch (error) {
      console.warn('⚠️ No se pudo limpiar completamente el caché local:', error);
    }
  }


  async optimizePerformance() {
    try {
      console.log('⚡ Optimizando rendimiento...');


      this.clearLocalCache();


      if (this.totalRecords() > 5000) {
        this.pageSize.set(50);
        console.log('📄 Tamaño de página reducido a 50 para mejor rendimiento');
      }


      if (this.totalRecords() > 1000) {
        this.virtualScrollEnabled.set(true);
        console.log('📜 Virtual scrolling habilitado');
      }


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


  needsOptimization(): boolean {
    const memory = this.getMemoryUsage();
    if (memory) {
      const usagePercent = (memory.used / memory.limit) * 100;
      return usagePercent > 80 || this.totalRecords() > 10000;
    }
    return this.totalRecords() > 10000;
  }


  formatColorName(color: string): string {
    if (!color) return '';
    const term = color.toUpperCase().trim();


    if (term.startsWith('P ') || term.startsWith('P_')) {
      return term.replace('P_', 'P ');
    }


    if (term.startsWith('PANTONE ')) {
      return `P ${term.substring(8)}`;
    }


    return `P ${term}`;
  }


  getPantoneColor(colorName: string): PantoneColor {
    if (!colorName) {

      return {
        code: 'BLACK',
        name: 'Black',
        displayName: 'P BLACK',
        hex: '#000000',
        rgb: { r: 0, g: 0, b: 0 },
        cmyk: { c: 0, m: 0, y: 0, k: 100 },
        category: 'Basic',
        colorType: 'heptacromia'
      };
    }

    try {
      const color = this.pantoneService.getOrCreateColor(colorName);
      return color;
    } catch (error) {
      console.warn('⚠️ Error getting Pantone color for:', colorName, error);

      return {
        code: colorName.toUpperCase(),
        name: colorName,
        displayName: `P ${colorName.toUpperCase()}`,
        hex: '#808080',
        rgb: { r: 128, g: 128, b: 128 },
        cmyk: { c: 0, m: 0, y: 0, k: 50 },
        category: 'Custom',
        colorType: 'pantone'
      };
    }
  }


  getStatusClass(design: FlexographicDesign): string {
    if (!design || !design.status) {
      return 'status-text-display status-unknown';
    }
    const status = design.status.toLowerCase().trim();
    return `status-text-display status-${status}`;
  }


  getDesignStatus(design: FlexographicDesign): string {
    if (!design || !design.status) return 'Desconocido';
    const status = design.status.toUpperCase();
    return (status === 'ACTIVO' || status === 'ACTIVE') ? 'Activo' : 'Inactivo';
  }


  editDesign(design: FlexographicDesign) {
    if (!this.userPermissions().canEditDesign) {
      this.snackBar.open('No tienes permiso para editar diseños', 'Cerrar', { duration: 3000 });
      return;
    }
    console.log('✏️ Editando diseño:', design.articleF);


    this.editingDesign.set(design);


    this.editDesignForm.patchValue({
      articleF: design.articleF,
      client: design.client,
      description: design.description,
      substrate: design.substrate,
      type: design.type,
      anchoMm: design.anchoMm ?? null,
      printType: design.printType,
      colorCount: design.colorCount,
      colors: design.colors,
      status: design.status
    });


    const pantoneColors: PantoneColor[] = design.colors.map(colorName => {
      const found = this.pantoneService.getOrCreateColor(colorName);
      // Si no tiene id, intentar búsqueda directa por código
      if (!found.id) {
        const byCode = this.pantoneService.getColorByCode(colorName);
        if (byCode?.id) return byCode;
      }
      return found;
    });
    this.selectedColors.set(pantoneColors);

    // Si algún color no tiene id, recargar desde API y reintentar
    if (pantoneColors.some(c => !c.id && c.code)) {
      this.pantoneService.loadFromApi().then(() => {
        const refreshed: PantoneColor[] = design.colors.map(colorName => {
          const found = this.pantoneService.getOrCreateColor(colorName);
          if (!found.id) {
            const byCode = this.pantoneService.getColorByCode(colorName);
            if (byCode?.id) return byCode;
          }
          return found;
        });
        this.selectedColors.set(refreshed);
      });
    }


    this.showEditForm.set(true);
  }


  cancelEditDesign() {
    this.showEditForm.set(false);
    this.editingDesign.set(null);
    this.editDesignForm.reset();
  }


  async saveEditedDesign() {

    if (!this.editDesignForm.valid) {
      console.log('❌ Formulario inválido:', this.editDesignForm.errors);
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const editingDesign = this.editingDesign();
    if (!editingDesign) {
      console.log('❌ No hay diseño en edición');
      return;
    }

    this.loading.set(true);
    try {
      const formData = this.editDesignForm.value;
      console.log('💾 Guardando cambios del diseño:');
      console.log('   ID del diseño:', editingDesign.id);
      console.log('   ArticleF original:', editingDesign.articleF);
      console.log('   Datos del formulario:', formData);
      console.log('   URL:', `${environment.apiUrl}/designs/${editingDesign.id}`);


      const updateData = {
        articleF: formData.articleF,
        client: formData.client,
        description: formData.description,
        substrate: formData.substrate,
        type: formData.type,
        anchoMm: formData.anchoMm ?? null,
        printType: formData.printType,
        colorCount: formData.colorCount,
        colors: formData.colors,
        status: formData.status
      };

      console.log('   Datos a enviar:', updateData);


      const response = await this.http.put<FlexographicDesign>(
        `${environment.apiUrl}/designs/${editingDesign.id}`,
        updateData
      ).toPromise();

      if (response) {
        console.log('✅ Diseño actualizado exitosamente:', response);

        this.snackBar.open(`Diseño "${formData.articleF}" actualizado exitosamente`, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });


        this.showEditForm.set(false);
        this.editingDesign.set(null);
        this.editDesignForm.reset();


        await this.loadDesigns();
      }
    } catch (error: any) {
      console.error('❌ Error actualizando diseño:', error);
      console.error('   Status:', error.status);
      console.error('   Error completo:', error.error);
      console.error('   Mensaje:', error.message);

      let errorMessage = 'Error al actualizar el diseño';

      if (error.status === 400) {
        if (error.error?.errors) {
          console.error('   Errores de validación:', error.error.errors);
          const validationErrors = Object.keys(error.error.errors).map(key =>
            `${key}: ${error.error.errors[key].join(', ')}`
          ).join('; ');
          errorMessage = `Error de validación: ${validationErrors}`;
        } else if (error.error?.message) {
          errorMessage = `Error 400: ${error.error.message}`;
        } else {
          errorMessage = 'Datos inválidos';
        }
      } else if (error.status === 404) {
        errorMessage = `Diseño no encontrado con ID: ${this.editingDesign()?.id}`;
      } else if (error.status === 405) {
        errorMessage = 'Método no permitido - El endpoint PUT no está disponible';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión con el servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 7000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }


  updateEditColors() {
    const colorCount = this.editDesignForm.get('colorCount')?.value || 1;
    const currentSelectedColors = this.selectedColors();


    const newSelectedColors = [...currentSelectedColors];


    while (newSelectedColors.length < colorCount) {
      const defaultColor = this.pantoneService.getColorByCode('Black');
      if (defaultColor) {
        newSelectedColors.push(defaultColor);
      }
    }


    while (newSelectedColors.length > colorCount) {
      newSelectedColors.pop();
    }

    this.selectedColors.set(newSelectedColors);


    const colorCodes = newSelectedColors.map(color => color.displayName);
    this.editDesignForm.patchValue({ colors: colorCodes });
  }


  async duplicateDesign(design: FlexographicDesign) {
    if (!this.userPermissions().canCreateDesign) {
      this.snackBar.open('No tienes permiso para duplicar diseños', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!design.articleF) {
      this.snackBar.open('Error: El diseño no tiene un código válido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }


    const dialogRef = this.dialog.open(DuplicateDesignDialogComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        originalArticleF: design.articleF,
        suggestedArticleF: `${design.articleF}-COPIA`
      },
      disableClose: false,
      autoFocus: true
    });


    const newArticleF = await dialogRef.afterClosed().toPromise();


    if (!newArticleF || newArticleF.trim() === '') {
      console.log('❌ Duplicación cancelada por el usuario');
      return;
    }


    if (newArticleF.trim() === design.articleF) {
      this.snackBar.open('El nuevo código debe ser diferente al original', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading.set(true);
    try {
      console.log(`🔄 Duplicando diseño: ${design.articleF} → ${newArticleF}`);


      const duplicatedDesign = {
        articleF: newArticleF.trim(),
        client: design.client,
        description: design.description,
        substrate: design.substrate,
        type: design.type,
        printType: design.printType,
        colorCount: design.colorCount,
        colors: design.colors,
        status: 'ACTIVO'
      };


      const response = await this.http.post<FlexographicDesign>(
        `${environment.apiUrl}/designs`,
        duplicatedDesign
      ).toPromise();

      if (response) {
        console.log(`✅ Diseño duplicado exitosamente: ${response.articleF}`);

        this.snackBar.open(
          `Diseño duplicado exitosamente: ${design.articleF} → ${response.articleF}`,
          'Cerrar',
          {
            duration: 4000,
            panelClass: ['success-snackbar']
          }
        );


        await this.loadDesigns();
      }
    } catch (error: any) {
      console.error('❌ Error duplicando diseño:', error);

      let errorMessage = 'Error al duplicar el diseño';

      if (error.status === 400) {
        if (error.error?.message?.includes('already exists') ||
          error.error?.message?.includes('ya existe')) {
          errorMessage = `El código "${newArticleF}" ya existe. Por favor, use un código diferente.`;
        } else {
          errorMessage = 'Datos inválidos o código ya existe';
        }
      } else if (error.status === 404) {
        errorMessage = 'Diseño original no encontrado';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
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


  async deleteDesign(design: FlexographicDesign) {
    if (!this.userPermissions().canDeleteDesign) {
      this.snackBar.open('No tienes permiso para eliminar diseños', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!design.articleF) {
      this.snackBar.open('Error: El diseño no tiene un código válido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }


    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Diseño',
        message: '¿Estás seguro de eliminar este diseño?',
        articleF: design.articleF,
        client: design.client,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      },
      panelClass: 'rounded-dialog'
    });


    const confirmed = await dialogRef.afterClosed().toPromise();


    if (!confirmed) {
      console.log('❌ Eliminación cancelada por el usuario');
      return;
    }


    this.loading.set(true);
    try {

      const deleteUrl = `${environment.apiUrl}/designs/${design.id}`;

      console.log(`🗑️ Eliminando diseño:`);
      console.log(`   ID: ${design.id}`);
      console.log(`   ArticleF: ${design.articleF}`);
      console.log(`   URL: ${deleteUrl}`);


      await this.http.delete(deleteUrl).toPromise();

      console.log(`✅ Diseño eliminado exitosamente: ${design.articleF}`);

      this.snackBar.open(`Diseño "${design.articleF}" eliminado exitosamente`, 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });


      await this.loadDesigns();
    } catch (error: any) {
      console.error('❌ Error eliminando diseño:', error);
      console.error('   Status:', error.status);
      console.error('   Error completo:', error.error);
      console.error('   Mensaje:', error.message);

      let errorMessage = 'Error al eliminar el diseño';

      if (error.status === 400) {

        console.error('⚠️ Error 400: El backend no acepta la petición DELETE');
        console.error('   Posibles causas:');
        console.error('   1. El endpoint DELETE no está implementado');
        console.error('   2. El backend espera un formato diferente');
        console.error('   3. Problema con la validación del ArticleF');

        if (error.error?.message) {
          errorMessage = `Error 400: ${error.error.message}`;
        } else if (error.error?.errors) {
          const validationErrors = Object.keys(error.error.errors).map(key =>
            `${key}: ${error.error.errors[key].join(', ')}`
          ).join('; ');
          errorMessage = `Error de validación: ${validationErrors}`;
        } else {
          errorMessage = `Error 400: El servidor no acepta la petición de eliminación. El endpoint DELETE puede no estar implementado en el backend.`;
        }
      } else if (error.status === 404) {
        errorMessage = `Diseño "${design.articleF}" no encontrado en la base de datos`;
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para eliminar este diseño';
      } else if (error.status === 405) {
        errorMessage = 'Método no permitido: El endpoint DELETE no está disponible en el backend';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
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
      this.loading.set(false);
    }
  }


  private extractColorsFromDesign(design: FlexographicDesign): string[] {
    const colors: string[] = [];


    if (design.color1) colors.push(design.color1);
    if (design.color2) colors.push(design.color2);
    if (design.color3) colors.push(design.color3);
    if (design.color4) colors.push(design.color4);
    if (design.color5) colors.push(design.color5);
    if (design.color6) colors.push(design.color6);
    if (design.color7) colors.push(design.color7);
    if (design.color8) colors.push(design.color8);
    if (design.color9) colors.push(design.color9);
    if (design.color10) colors.push(design.color10);


    if (colors.length === 0 && design.colors && Array.isArray(design.colors)) {
      return design.colors.filter(color => color && color.trim() !== '');
    }


    return colors.filter(color => color && color.trim() !== '');
  }


  getColorsTooltip(design: FlexographicDesign): string {
    if (!design.colors || design.colors.length === 0) {
      return 'Sin colores';
    }
    return `${design.colors.length} colores: ${design.colors.join(', ')}`;
  }




  async initializeAniloxData() {
    const previousSelectedMachine = this.selectedMachine;
    const previousSearchTerm = this.aniloxSearchTerm;

    try {
      const aniloxList = await this.aniloxService.getAll().toPromise();

      if (aniloxList && aniloxList.length > 0) {
        this.aniloxData = aniloxList;


        const machinesSet = new Set(aniloxList.map(a => a.maquina));
        const machinesFromData = Array.from(machinesSet).sort((a, b) => a - b);


        const allMachines = new Set([...this.availableMachines, ...machinesFromData]);
        this.availableMachines = Array.from(allMachines).sort((a, b) => a - b);

        console.log(`✅ ${aniloxList.length} anilox cargados desde el backend`);
        console.log(`📋 Máquinas disponibles:`, this.availableMachines);
      } else {
        console.log('⚠️ No hay datos de anilox en el backend');
        this.aniloxData = [];
        this.filteredAniloxData = [];
      }
    } catch (error) {
      console.error('❌ Error cargando anilox:', error);
      
      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al cargar el inventario de anilox`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 5000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);


      this.aniloxData = [];
      this.filteredAniloxData = [];
    } finally {
      this.selectedMachine = previousSelectedMachine || 'all';
      this.aniloxSearchTerm = previousSearchTerm || '';
      this.filterAnilox();
    }
  }


  async createAnilox() {
    if (!this.userPermissions().canCreateDesign) {
      this.snackBar.open('No tienes permiso para crear anilox', 'Cerrar', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(CreateAniloxDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const newAnilox = await this.aniloxService.create(result).toPromise();

          if (newAnilox) {
            // Snackbar de éxito con icono animado
            const mensajeConIcono = `<span class="status-icon">✓</span>Anilox ${newAnilox.codigo} creado exitosamente`;
            const snackBarRef = this.snackBar.open('', 'Cerrar', {
              duration: 3000,
              panelClass: ['status-listo-snackbar', 'animated-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });

            setTimeout(() => {
              const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
              if (label) {
                label.innerHTML = mensajeConIcono;
              }
            }, 0);


            await this.initializeAniloxData();
          }
        } catch (error: any) {
          console.error('❌ Error creando anilox:', error);

          let errorMessage = 'Error al crear el anilox';
          if (error.status === 400) {
            errorMessage = error.error?.message || 'Datos inválidos';
          } else if (error.status === 401) {
            errorMessage = 'No tienes permisos para crear anilox';
          }

          // Snackbar de error con icono animado
          const mensajeConIcono = `<span class="status-icon">✕</span>${errorMessage}`;
          const snackBarRef = this.snackBar.open('', 'Cerrar', {
            duration: 5000,
            panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });

          setTimeout(() => {
            const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
            if (label) {
              label.innerHTML = mensajeConIcono;
            }
          }, 0);
        }
      }
    });
  }


  async editAnilox(anilox: any) {
    if (!this.userPermissions().canEditDesign) {
      this.snackBar.open('No tienes permiso para editar anilox', 'Cerrar', { duration: 3000 });
      return;
    }
    const dialogRef = this.dialog.open(EditAniloxDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: anilox
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const updatedAnilox = await this.aniloxService.update(anilox.id, result).toPromise();

          if (updatedAnilox) {

            // Snackbar de éxito con icono animado
            const mensajeConIcono = `<span class="status-icon">✓</span>${updatedAnilox.codigo} guardado`;
            const snackBarRef = this.snackBar.open('', '', {
              duration: 2500,
              panelClass: ['status-listo-snackbar', 'animated-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });

            setTimeout(() => {
              const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
              if (label) {
                label.innerHTML = mensajeConIcono;
              }
            }, 0);


            await this.initializeAniloxData();
          }
        } catch (error: any) {
          console.error('❌ Error actualizando anilox:', error);

          let errorMessage = 'Error al actualizar el anilox';
          if (error.status === 400) {
            errorMessage = error.error?.message || 'Datos inválidos';
          } else if (error.status === 404) {
            errorMessage = 'Anilox no encontrado';
          } else if (error.status === 401) {
            errorMessage = 'No tienes permisos para editar anilox';
          }

          // Snackbar de error con icono animado
          const mensajeConIcono = `<span class="status-icon">✕</span>${errorMessage}`;
          const snackBarRef = this.snackBar.open('', 'Cerrar', {
            duration: 5000,
            panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });

          setTimeout(() => {
            const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
            if (label) {
              label.innerHTML = mensajeConIcono;
            }
          }, 0);
        }
      }
    });
  }


  async deleteAnilox(anilox: any) {
    if (!this.userPermissions().canDeleteDesign) {
      this.snackBar.open('No tienes permiso para eliminar anilox', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '380px',
      panelClass: 'compact-delete-dialog',
      data: {
        title: 'Eliminar Anilox',
        message: `¿Eliminar el anilox ${anilox.codigo}?`,
        subtitle: `Máquina ${anilox.maquina} • ${anilox.lineatura} LPI`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'anilox'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.aniloxService.delete(anilox.id).toPromise();


          // Snackbar de éxito con icono animado
          const mensajeConIcono = `<span class="status-icon">🗑️</span>${anilox.codigo} eliminado`;
          const snackBarRef = this.snackBar.open('', '', {
            duration: 2500,
            panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });

          setTimeout(() => {
            const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
            if (label) {
              label.innerHTML = mensajeConIcono;
            }
          }, 0);


          await this.initializeAniloxData();
        } catch (error: any) {
          console.error('❌ Error eliminando anilox:', error);

          let errorMessage = 'Error al eliminar el anilox';
          if (error.status === 404) {
            errorMessage = 'Anilox no encontrado';
          } else if (error.status === 401) {
            errorMessage = 'No tienes permisos para eliminar anilox';
          }

          // Snackbar de error con icono animado
          const mensajeConIcono = `<span class="status-icon">✕</span>${errorMessage}`;
          const snackBarRef = this.snackBar.open('', 'Cerrar', {
            duration: 5000,
            panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });

          setTimeout(() => {
            const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
            if (label) {
              label.innerHTML = mensajeConIcono;
            }
          }, 0);
        }
      }
    });
  }


  async loadMachineConfigs() {
    try {
      console.log('🔄 Cargando configuraciones de máquinas...');
      const configs = await this.machineConfigService.getAll().toPromise();

      console.log('📦 Respuesta del servidor:', configs);

      if (configs && configs.length > 0) {

        configs.forEach(config => {
          this.machinesCargaMuestra[config.numero_maquina] = config.carga_muestra || null;
        });

        console.log('✅ Configuraciones de máquinas cargadas:', this.machinesCargaMuestra);
      } else {
        console.warn('⚠️ No se encontraron configuraciones de máquinas');
      }
    } catch (error: any) {
      console.error('❌ Error cargando configuraciones de máquinas:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Message:', error.message);
      console.error('❌ Error completo:', error);
    }
  }


  async updateMachineCargaMuestra(machine: number, event: any) {
    console.log('🔵 ===== INICIO updateMachineCargaMuestra =====');
    console.log('📝 Máquina:', machine);
    console.log('📝 Event target value:', event.target.value);

    const newValue = event.target.value;
    const cargaMuestra = newValue && newValue.trim() !== '' ? parseFloat(newValue) : null;
    const currentValue = this.machinesCargaMuestra[machine];

    console.log('📝 Nuevo valor parseado:', cargaMuestra);
    console.log('📝 Valor actual en memoria:', currentValue);


    if (cargaMuestra === currentValue) {
      console.log('⚠️ El valor no cambió, no se hace nada');
      return;
    }

    try {
      console.log(`📤 Enviando petición PUT para MQ ${machine} con valor: ${cargaMuestra}`);

      const response = await this.machineConfigService.updateCargaMuestra(machine, cargaMuestra).toPromise();

      console.log('✅ Respuesta del servidor:', response);

      if (response) {

        this.machinesCargaMuestra[machine] = cargaMuestra;
        console.log('✅ Valor actualizado en memoria:', this.machinesCargaMuestra[machine]);


        const snackBarRef = this.snackBar.open('', '', {
          duration: 2000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-listo-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = `<span class="status-icon">✓</span> Carga muestra MQ ${machine} actualizada`;
          }
        }, 0);
      }
    } catch (error: any) {
      console.error('❌ Error actualizando carga muestra:', error);

      let errorMessage = 'Error al actualizar carga muestra';
      if (error.status === 404) {
        errorMessage = 'Configuración de máquina no encontrada';
      } else if (error.status === 401) {
        errorMessage = 'No tienes permisos para actualizar configuraciones';
      }

      const snackBarRef = this.snackBar.open('', '', {
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const container = document.querySelector('.status-terminado-snackbar .mdc-snackbar__label');
        if (container) {
          container.innerHTML = `<span class="status-icon">✕</span> ${errorMessage}`;
        }
      }, 0);


      event.target.value = currentValue !== null && currentValue !== undefined ? currentValue : '';
    }

    console.log('🔵 ===== FIN updateMachineCargaMuestra =====');
  }


  triggerExcelUpload() {
    if (!this.userPermissions().canBulkUpload) {
      this.snackBar.open('No tienes permiso para importar anilox', 'Cerrar', { duration: 3000 });
      return;
    }
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    fileInput.onchange = (event) => this.onAniloxExcelSelected(event);
    fileInput.click();
  }


  async onAniloxExcelSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadProgress.set(0);

    try {
      console.log('📂 Leyendo archivo Excel de anilox:', file.name);

      const jsonData = await this.excelService.readExcel(file);

      console.log('📊 Datos leídos del Excel:', jsonData.length, 'filas');
      console.log('📊 Primera fila (encabezados):', jsonData[0]);
      console.log('📊 Segunda fila (primer dato):', jsonData[1]);
      console.log('📊 Tercera fila (segundo dato):', jsonData[2]);

      const aniloxList: any[] = [];

      // Empezar desde la fila 2 (índice 1) ya que la fila 1 (índice 0) es encabezado
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];

        // Log de la fila completa para debugging
        if (i <= 5) {
          console.log(`🔍 Fila ${i + 1} COMPLETA (todos los índices):`, row);
          console.log(`   [0]=${row[0]}, [1]=${row[1]}, [2]=${row[2]}, [3]=${row[3]}, [4]=${row[4]}, [5]=${row[5]}, [6]=${row[6]}, [7]=${row[7]}, [8]=${row[8]}, [9]=${row[9]}, [10]=${row[10]}`);
        }

        // Mapeo de columnas según especificación del usuario:
        // C (índice 2) = código
        // D (índice 3) = máquina
        // E (índice 4) = lineatura (LPI)
        // F (índice 5) = BCM
        // G (índice 6) = proveedor
        // H (índice 7) = volumen real
        // I (índice 8) = factor de eficiencia
        // J (índice 9) = densidad

        const codigo = row[2]?.toString().trim();
        const maquinaRaw = row[3];
        const lineaturaRaw = row[4];
        const bcmRaw = row[5];
        const proveedorRaw = row[6];
        const volumenRealRaw = row[7];
        const factorEficienciaRaw = row[8];
        const densidadRaw = row[9];

        // Parsear valores numéricos de forma más robusta
        const maquina = typeof maquinaRaw === 'number' ? maquinaRaw : parseInt(String(maquinaRaw || ''));
        const lineatura = typeof lineaturaRaw === 'number' ? lineaturaRaw : parseInt(String(lineaturaRaw || ''));
        const proveedor = proveedorRaw?.toString().trim() || 'APEX';
        const bcm = typeof bcmRaw === 'number' ? bcmRaw : parseFloat(String(bcmRaw || ''));
        const volumenReal = typeof volumenRealRaw === 'number' ? volumenRealRaw : parseFloat(String(volumenRealRaw || ''));
        const factorEficiencia = factorEficienciaRaw ? (typeof factorEficienciaRaw === 'number' ? factorEficienciaRaw : parseFloat(String(factorEficienciaRaw))) : 35.00;
        const densidad = densidadRaw ? (typeof densidadRaw === 'number' ? densidadRaw : parseFloat(String(densidadRaw))) : 0.885;

        if (i <= 5) {
          console.log(`📝 Fila ${i + 1} parseada:`, {
            codigo,
            maquina,
            lineatura,
            bcm,
            proveedor,
            volumenReal,
            factorEficiencia,
            densidad
          });
          console.log(`   Valores RAW: maq=${maquinaRaw}, lin=${lineaturaRaw}, bcm=${bcmRaw}, vol=${volumenRealRaw}`);
        }

        // Validar datos requeridos
        if (!codigo || isNaN(maquina) || isNaN(lineatura) || isNaN(bcm) || isNaN(volumenReal)) {
          console.warn(`⚠️ Fila ${i + 1} ignorada: datos incompletos o inválidos`, {
            codigo: codigo || 'FALTA',
            maquina: isNaN(maquina) ? 'INVÁLIDO' : maquina,
            lineatura: isNaN(lineatura) ? 'INVÁLIDO' : lineatura,
            bcm: isNaN(bcm) ? 'INVÁLIDO' : bcm,
            volumenReal: isNaN(volumenReal) ? 'INVÁLIDO' : volumenReal
          });
          continue;
        }

        // Validar que la máquina esté en el rango válido (11-21)
        if (maquina < 11 || maquina > 21) {
          console.warn(`⚠️ Fila ${i + 1} ignorada: máquina ${maquina} fuera de rango (11-21)`);
          continue;
        }

        aniloxList.push({
          codigo: codigo,
          maquina: maquina,
          lineatura: lineatura,
          aporteTeorico: bcm,
          proveedor: proveedor,
          aporte: volumenReal,
          factorEficiencia: factorEficiencia,
          densidad: densidad
        });

        this.uploadProgress.set(Math.round((i / jsonData.length) * 50));
      }

      console.log(`✅ ${aniloxList.length} anilox procesados del Excel`);

      if (aniloxList.length === 0) {
        this.snackBar.open('No se encontraron datos válidos en el Excel. Verifica que las columnas sean: C=Código, D=Máquina, E=Lineatura, F=BCM, G=Proveedor, H=Volumen Real, I=Factor Eficiencia, J=Densidad', 'Cerrar', {
          duration: 8000,
          panelClass: ['error-snackbar']
        });
        this.uploading.set(false);
        return;
      }

      this.uploadProgress.set(60);
      const response = await this.aniloxService.importFromExcel(aniloxList).toPromise();

      if (response) {
        console.log('✅ Respuesta del servidor:', response);

        this.uploadProgress.set(100);

        let successMessage = `Importación completada: ${response.created} nuevos creados, ${response.updated} existentes sobrescritos`;
        
        if (response.message) {
          successMessage = response.message;
        }

        this.snackBar.open(
          successMessage,
          'Cerrar',
          { duration: 6000, panelClass: ['success-snackbar'] }
        );

        await this.initializeAniloxData();
      }
    } catch (error: any) {
      console.error('❌ Error importando anilox desde Excel:', error);

      let errorMessage = 'Error al importar el archivo Excel';
      if (error.status === 400) {
        errorMessage = error.error?.message || 'Datos inválidos en el Excel';
      } else if (error.status === 401) {
        errorMessage = 'No tienes permisos para importar anilox';
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
    }
  }

  filterAniloxByMachine() {
    if (this.selectedMachine === 'all') {
      this.filteredAniloxData = [...this.aniloxData];
    } else {
      this.filteredAniloxData = this.aniloxData.filter((a: any) => a.maquina === parseInt(this.selectedMachine));
    }
    this.filterAnilox();
  }


  selectMachine(machine: number | string) {
    this.selectedMachine = machine.toString();
    this.filterAniloxByMachine();
  }

  filterAnilox() {
    const searchLower = this.aniloxSearchTerm.toLowerCase().trim();

    if (!searchLower) {

      if (this.selectedMachine === 'all') {
        this.filteredAniloxData = [...this.aniloxData];
      } else {
        this.filteredAniloxData = this.aniloxData.filter((a: any) => a.maquina === parseInt(this.selectedMachine));
      }
      return;
    }


    let filtered = this.aniloxData;

    if (this.selectedMachine !== 'all') {
      filtered = filtered.filter((a: any) => a.maquina === parseInt(this.selectedMachine));
    }

    filtered = filtered.filter((a: any) =>
      a.codigo.toString().includes(searchLower) ||
      a.bcm.toString().includes(searchLower) ||
      a.lineatura.toString().includes(searchLower) ||
      a.marca.toLowerCase().includes(searchLower) ||
      a.volumenReal.toString().includes(searchLower)
    );

    this.filteredAniloxData = filtered;
  }

  // ===== MÉTODOS PARA COD TINTAS =====

  /**
   * Abrir diálogo para crear nuevo registro de Cod Tintas
   */
  openCreateCodTintaDialog() {
    if (!this.userPermissions().canCreateDesign) {
      this.snackBar.open('No tienes permiso para crear registros de cod tintas', 'Cerrar', { duration: 3000 });
      return;
    }
    import('./create-cod-tinta-dialog/create-cod-tinta-dialog').then(m => {
      const dialogRef = this.dialog.open(m.CreateCodTintaDialogComponent, {
        width: '800px',
        maxHeight: '90vh',
        disableClose: false
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.createCodTintaRecordComplete(result);
        }
      });
    });
  }

  /**
   * Cargar todos los registros de Cod Tintas desde el backend con paginación
   */
  async loadCodTintas() {
    console.trace('🔍 loadCodTintas() llamado desde:');
    await this.loadCodTintasPaginated(this.codTintasCurrentPage(), this.codTintasPageSize(), this.codTintasSearchTerm());
  }

  /**
   * Cargar Cod Tintas con paginación
   */
  async loadCodTintasPaginated(page: number = 1, pageSize: number = 50, search?: string) {
    this.loadingCodTintas.set(true);
    try {
      console.log(`🚀 Cargando Cod Tintas paginados - Página: ${page}, Tamaño: ${pageSize}`);

      this.codTintasCurrentPage.set(page);

      let params: any = {
        page: page.toString(),
        pageSize: pageSize.toString()
      };

      if (search) {
        params.search = search;
      }

      const response = await this.http.get<any>(`${environment.apiUrl}/cod-tintas/paginated`, { params }).toPromise();

      if (response && response.items) {
        console.log(`✅ ${response.items.length} registros de Cod Tintas cargados`);

        this.codTintasData.set(response.items);
        this.filteredCodTintasData.set(response.items);
        this.codTintasTotalRecords.set(response.totalCount);
        this.codTintasHasMoreData.set(page < response.totalPages);

        // ✅ Snackbar estandarizado con icono animado
        const mensajeConIcono = `<span class="status-icon">✓</span>Página ${page} cargada`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 2000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);
      }
    } catch (error) {
      console.error('❌ Error cargando Cod Tintas paginados:', error);
      
      // ✅ Snackbar de error estandarizado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al cargar códigos de tintas`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);

      this.codTintasData.set([]);
      this.filteredCodTintasData.set([]);
    } finally {
      this.loadingCodTintas.set(false);
    }
  }

  /**
   * Página siguiente de Cod Tintas
   */
  async codTintasNextPage() {
    if (this.codTintasHasMoreData() && !this.loadingCodTintas()) {
      await this.loadCodTintasPaginated(this.codTintasCurrentPage() + 1, this.codTintasPageSize(), this.codTintasSearchTerm());
    }
  }

  /**
   * Página anterior de Cod Tintas
   */
  async codTintasPreviousPage() {
    if (this.codTintasCurrentPage() > 1 && !this.loadingCodTintas()) {
      await this.loadCodTintasPaginated(this.codTintasCurrentPage() - 1, this.codTintasPageSize(), this.codTintasSearchTerm());
    }
  }

  /**
   * Cambiar tamaño de página de Cod Tintas
   */
  async codTintasOnPageSizeChange(newSize: number) {
    this.codTintasPageSize.set(newSize);
    await this.loadCodTintasPaginated(1, newSize, this.codTintasSearchTerm());
  }

  /**
   * Buscar registro de Cod Tintas por artículo
   */
  async searchCodTintasByArticulo(articulo: string) {
    this.codTintasSearchTerm.set(articulo);
    await this.loadCodTintasPaginated(1, this.codTintasPageSize(), articulo);
  }

  /**
   * Crear nuevo registro de Cod Tintas con datos completos del formulario
   */
  async createCodTintaRecordComplete(formData: any) {
    try {
      console.log('🆕 Creando registro completo de Cod Tintas:', formData);

      const newRecord: any = {
        articulo: formData.articulo,
        descripcion: formData.descripcion,
        carpeta: formData.carpeta,
        estante: formData.estante,
        lineaTinta: formData.lineaTinta,
        colores: formData.colores
      };

      console.log('📝 Registro a crear:', newRecord);

      // Enviar al backend
      const response = await fetch(`${environment.apiUrl}/cod-tintas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authService.getToken()}`
        },
        body: JSON.stringify(newRecord)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Registro de Cod Tintas creado:', data);

      // Recargar datos
      await this.loadCodTintas();

      // ✅ Snackbar de éxito estandarizado
      const mensajeConIcono = `<span class="status-icon">✓</span>Registro creado exitosamente`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 3000,
        panelClass: ['status-listo-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    } catch (error: any) {
      console.error('❌ Error creando registro de Cod Tintas:', error);
      
      // ✅ Snackbar de error estandarizado
      const mensajeConIcono = `<span class="status-icon">✕</span>${error.message || 'Error al crear registro'}`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    }
  }

  /**
   * Crear nuevo registro de Cod Tintas
   * Al ingresar el artículo, se carga automáticamente la descripción y colores desde diseño
   */
  async createCodTintaRecord(articulo: string) {
    try {
      console.log('🆕 Creando registro de Cod Tintas para artículo:', articulo);
      console.log('📊 Total de diseños disponibles en memoria:', this.allDesigns().length);

      // Primero buscar en los diseños cargados en memoria
      let design = this.allDesigns().find(d => d.articleF.toUpperCase() === articulo.toUpperCase());

      // Si no se encuentra en memoria, buscar en el backend usando el método existente
      if (!design) {
        console.log('🔍 Artículo no encontrado en memoria, buscando en backend...');
        
        // Guardar el término de búsqueda actual
        const previousSearchTerm = this.searchTerm();
        
        // Realizar búsqueda
        this.searchTerm.set(articulo);
        await this.searchOnServer(articulo);
        
        // Buscar en los resultados filtrados
        design = this.filteredDesigns().find(d => d.articleF.toUpperCase() === articulo.toUpperCase());
        
        // Restaurar el término de búsqueda anterior
        this.searchTerm.set(previousSearchTerm);
        
        if (design) {
          console.log('✅ Diseño encontrado en backend:', design);
        }
      } else {
        console.log('✅ Diseño encontrado en memoria:', design);
      }

      if (!design) {
        console.error('❌ Artículo no encontrado en diseños');
        console.log('🔍 Artículos disponibles en memoria:', this.allDesigns().map(d => d.articleF).join(', '));
        
        // ✅ Snackbar de advertencia estandarizado
        const mensajeConIcono = `<span class="status-icon">⚠</span>Artículo no encontrado en diseños`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 3000,
          panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-preparando-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);
        return;
      }

      console.log('🎨 Colores del diseño:', design.colors);

      // Verificar que el diseño tenga colores
      if (!design.colors || design.colors.length === 0) {
        // ✅ Snackbar de advertencia estandarizado
        const mensajeConIcono = `<span class="status-icon">⚠</span>El diseño no tiene colores definidos`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 3000,
          panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-preparando-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);
        return;
      }

      // Crear colores con estructura para Cod Tintas
      const colores: ColorTinta[] = design.colors.map(colorName => ({
        nombre: colorName,
        codTinta: '',
        cobertura: null,
        codAnilox: ''
      }));

      const newRecord: CodTintaRecord = {
        articulo: design.articleF,
        descripcion: design.description,
        carpeta: '',
        estante: '',
        colores: colores
      };

      console.log('📝 Registro a crear:', newRecord);

      // Enviar al backend
      const response = await fetch(`${environment.apiUrl}/cod-tintas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authService.getToken()}`
        },
        body: JSON.stringify(newRecord)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Registro de Cod Tintas creado:', data);

      // Recargar datos
      await this.loadCodTintas();

      // ✅ Snackbar de éxito estandarizado
      const mensajeConIcono = `<span class="status-icon">✓</span>Registro creado exitosamente`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 3000,
        panelClass: ['status-listo-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    } catch (error) {
      console.error('❌ Error creando registro de Cod Tintas:', error);
      
      // ✅ Snackbar de error estandarizado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al crear registro`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    }
  }

  /**
   * Actualizar un registro de Cod Tintas con debounce
   */
  async updateCodTintaRecord(record: CodTintaRecord) {
    // Validar que el registro tenga ID
    if (!record.id) {
      console.error('❌ No se puede actualizar registro sin ID');
      return;
    }

    const recordId = record.id;

    // Si ya hay una actualización pendiente para este registro, cancelarla
    if (this.codTintasUpdateTimers.has(recordId)) {
      clearTimeout(this.codTintasUpdateTimers.get(recordId));
    }

    // Si ya hay una actualización en progreso, esperar
    if (this.codTintasUpdatePending.get(recordId)) {
      console.log('⏳ Actualización en progreso para registro', recordId, '- esperando...');
      return;
    }

    // Programar la actualización con debounce de 500ms
    const timer = setTimeout(async () => {
      try {
        this.codTintasUpdatePending.set(recordId, true);
        console.log('💾 Actualizando registro de Cod Tintas:', record);

        // Preparar el DTO correcto para el backend (solo descripcion y colores)
        const updateDto = {
          descripcion: record.descripcion,
          carpeta: record.carpeta,
          estante: record.estante,
          lineaTinta: record.lineaTinta || '',
          colores: record.colores
        };

        console.log('📤 Enviando DTO:', updateDto);

        const response = await fetch(`${environment.apiUrl}/cod-tintas/${recordId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authService.getToken()}`
          },
          body: JSON.stringify(updateDto)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Error del servidor:', errorData);
          throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Registro actualizado en backend:', data);

        // Actualizar el registro en el array local sin recargar toda la lista
        const currentData = this.codTintasData();
        const index = currentData.findIndex(r => r.id === recordId);
        
        if (index !== -1) {
          // Actualizar el registro manteniendo el estado de expansión
          const updatedRecord = {
            ...record,
            updatedAt: data.data.updatedAt,
            updatedBy: data.data.updatedBy
          };
          
          currentData[index] = updatedRecord;
          this.codTintasData.set([...currentData]);
          this.filteredCodTintasData.set([...currentData]);
          
          console.log('✅ Registro actualizado en la lista local');
        }

        // ✅ Snackbar de éxito estandarizado
        const mensajeConIcono = `<span class="status-icon">✓</span>Cambios guardados`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 2000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);
      } catch (error: any) {
        console.error('❌ Error actualizando registro:', error);
        
        // ✅ Snackbar de error estandarizado
        const mensajeConIcono = `<span class="status-icon">✕</span>${error.message || 'Error al actualizar registro'}`;
        const snackBarRef = this.snackBar.open('', 'Cerrar', {
          duration: 3000,
          panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);
      } finally {
        this.codTintasUpdatePending.set(recordId, false);
        this.codTintasUpdateTimers.delete(recordId);
      }
    }, 500);

    this.codTintasUpdateTimers.set(recordId, timer);
  }

  /**
   * Eliminar un registro de Cod Tintas
   */
  async deleteCodTintaRecord(id: number) {
    if (!this.userPermissions().canDeleteDesign) {
      this.snackBar.open('No tienes permiso para eliminar registros de cod tintas', 'Cerrar', { duration: 3000 });
      return;
    }
    // Confirmar eliminación
    const confirmed = confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.');
    
    if (!confirmed) {
      return;
    }

    try {
      console.log('🗑️ Eliminando registro de Cod Tintas:', id);

      const response = await fetch(`${environment.apiUrl}/cod-tintas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      console.log('✅ Registro eliminado');

      // Recargar datos
      await this.loadCodTintas();

      // ✅ Snackbar de éxito estandarizado
      const mensajeConIcono = `<span class="status-icon">✓</span>Registro eliminado exitosamente`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 3000,
        panelClass: ['status-listo-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    } catch (error) {
      console.error('❌ Error eliminando registro:', error);
      
      // ✅ Snackbar de error estandarizado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al eliminar registro`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', {
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    }
  }

  /**
   * Duplicar un registro de Cod Tintas
   */
  async duplicateCodTintaRecord(record: CodTintaRecord) {
    if (!this.userPermissions().canCreateDesign) {
      this.snackBar.open('No tienes permiso para duplicar registros', 'Cerrar', { duration: 3000 });
      return;
    }

    // Abrir diálogo personalizado (mismo que diseños)
    const dialogRef = this.dialog.open(DuplicateDesignDialogComponent, {
      width: '360px',
      maxWidth: '95vw',
      data: {
        originalArticleF: record.articulo,
        suggestedArticleF: `${record.articulo}-COPIA`
      },
      disableClose: false,
      autoFocus: true
    });

    const newArticulo = await dialogRef.afterClosed().toPromise();

    if (!newArticulo || newArticulo.trim() === '') {
      return;
    }

    if (newArticulo.trim() === record.articulo) {
      this.snackBar.open('El nuevo código debe ser diferente al original', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      const body = {
        articulo: newArticulo.trim(),
        descripcion: record.descripcion || '',
        carpeta: record.carpeta || '',
        estante: record.estante || '',
        lineaTinta: record.lineaTinta || '',
        colores: record.colores || []
      };

      const response = await fetch(`${environment.apiUrl}/cod-tintas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authService.getToken()}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || `Error HTTP: ${response.status}`);
      }

      // Recargar datos silenciosamente (sin snackbar)
      await this.reloadCodTintasSilent();

      // Mostrar snackbar personalizado de duplicado
      this.snackBar.open(
        `📋 Duplicado: ${record.articulo} → ${newArticulo.trim()} · ${record.colores?.length || 0} colores copiados`,
        'OK',
        {
          duration: 4000,
          panelClass: ['status-duplicado-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
    } catch (error: any) {
      this.snackBar.open(
        `✕ Error al duplicar: ${error.message || 'No se pudo duplicar'}`,
        'Cerrar',
        {
          duration: 4000,
          panelClass: ['status-terminado-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
    }
  }

  /**
   * Recargar Cod Tintas sin mostrar snackbar
   */
  private async reloadCodTintasSilent() {
    try {
      const params: any = {
        page: this.codTintasCurrentPage().toString(),
        pageSize: this.codTintasPageSize().toString()
      };
      const search = this.codTintasSearchTerm();
      if (search) params.search = search;

      const response = await this.http.get<any>(`${environment.apiUrl}/cod-tintas/paginated`, { params }).toPromise();
      if (response && response.items) {
        this.codTintasData.set(response.items);
        this.filteredCodTintasData.set(response.items);
        this.codTintasTotalRecords.set(response.totalCount);
        this.codTintasHasMoreData.set(this.codTintasCurrentPage() < response.totalPages);
      }
    } catch (e) {
      console.error('Error recargando cod tintas:', e);
    }
  }

  /**
   * Editar un registro de Cod Tintas
   */
  editCodTintaRecord(record: CodTintaRecord) {
    if (!this.userPermissions().canEditDesign) {
      this.snackBar.open('No tienes permiso para editar registros de cod tintas', 'Cerrar', { duration: 3000 });
      return;
    }
    import('./create-cod-tinta-dialog/create-cod-tinta-dialog').then(m => {
      const dialogRef = this.dialog.open(m.CreateCodTintaDialogComponent, {
        width: '800px',
        maxHeight: '90vh',
        disableClose: false,
        data: {
          mode: 'edit',
          record: { ...record }
        }
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          // Actualizar el registro con los nuevos datos
          const updatedRecord = {
            ...record,
            articulo: result.articulo,
            descripcion: result.descripcion,
            estante: result.estante,
            carpeta: result.carpeta,
            lineaTinta: result.lineaTinta,
            colores: result.colores
          };
          await this.updateCodTintaRecord(updatedRecord);
        }
      });
    });
  }

  /**
   * Actualizar código de tinta para un color específico
   */
  async updateCodTinta(record: CodTintaRecord, colorIndex: number, codTinta: string) {
    if (record.colores[colorIndex]) {
      record.colores[colorIndex].codTinta = codTinta;
      
      // Guardar cambios en el backend automáticamente
      await this.updateCodTintaRecord(record);
    }
  }

  /**
   * Toggle expansión de fila de Cod Tintas
   */
  toggleCodTintaRow(record: CodTintaRecord) {
    record.expanded = !record.expanded;
  }

  /**
   * Actualizar cobertura para un color específico
   */
  async updateCobertura(record: CodTintaRecord, colorIndex: number, cobertura: number) {
    if (record.colores[colorIndex]) {
      record.colores[colorIndex].cobertura = cobertura;
      
      // Guardar cambios en el backend automáticamente
      await this.updateCodTintaRecord(record);
    }
  }

  /**
   * Actualizar código de anilox para un color específico
   */
  async updateCodAnilox(record: CodTintaRecord, colorIndex: number, codAnilox: string) {
    if (record.colores[colorIndex]) {
      record.colores[colorIndex].codAnilox = codAnilox;
      
      // Guardar cambios en el backend automáticamente
      await this.updateCodTintaRecord(record);
    }
  }

  /**
   * Exportar datos de Cod Tintas a Excel
   */
  async exportCodTintasToExcel() {
    if (!this.hasExportPermission()) {
      this.snackBar.open('No tienes permiso para exportar cod tintas', 'Cerrar', { duration: 3000 });
      return;
    }
    try {
      console.log('📊 Exportando Cod Tintas a Excel...');

      const dataToExport = this.filteredCodTintasData().map(record => {
        const baseData: any = {
          'Artículo': record.articulo,
          'Descripción': record.descripcion
        };

        // Agregar columnas para cada color
        record.colores.forEach((color, index) => {
          const colorNum = index + 1;
          baseData[`Color ${colorNum}`] = color.nombre;
          baseData[`Cód. Tinta ${colorNum}`] = color.codTinta || '';
          baseData[`% Cobertura ${colorNum}`] = color.cobertura !== null ? color.cobertura : '';
          baseData[`Cód. Anilox ${colorNum}`] = color.codAnilox || '';
        });

        return baseData;
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `cod-tintas-${timestamp}`;

      await this.excelService.exportToExcel(dataToExport, fileName, 'Cod Tintas');

      this.snackBar.open(`Exportación exitosa: ${fileName}.xlsx`, 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('❌ Error exportando a Excel:', error);
      this.snackBar.open('Error al exportar a Excel', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Descargar plantilla de Excel para Cod Tintas
   */
  async downloadCodTintasTemplate() {
    try {
      const templateData = [
        {
          'A': 'Artículo',
          'B': 'Descripción',
          'C': '',
          'D': 'Cód. Tinta',
          'E': '',
          'F': 'Color',
          'G': '% Cobertura',
          'H': 'Cód. Anilox'
        },
        {
          'A': 'F12345',
          'B': 'Bolsa de polietileno',
          'C': '',
          'D': 'T001',
          'E': '',
          'F': 'PANTONE 185 C',
          'G': '85',
          'H': 'A450'
        },
        {
          'A': 'F12345',
          'B': 'Bolsa de polietileno',
          'C': '',
          'D': 'T002',
          'E': '',
          'F': 'PANTONE 286 C',
          'G': '90',
          'H': 'A500'
        },
        {
          'A': 'F12345',
          'B': 'Bolsa de polietileno',
          'C': '',
          'D': 'T003',
          'E': '',
          'F': 'PANTONE Black C',
          'G': '95',
          'H': 'A550'
        }
      ];

      await this.excelService.exportToExcel(templateData, 'plantilla-cod-tintas', 'Plantilla');
      this.snackBar.open('Plantilla descargada exitosamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('❌ Error descargando plantilla:', error);
      this.snackBar.open('Error al descargar plantilla', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Importar datos de Cod Tintas desde Excel
   */
  async importCodTintasFromExcel(event: any) {
    if (!this.userPermissions().canBulkUpload) {
      this.snackBar.open('No tienes permiso para importar cod tintas', 'Cerrar', { duration: 3000 });
      return;
    }
    const file = event.target.files[0];
    if (!file) return;

    try {
      console.log('📥 Importando Cod Tintas desde Excel:', file.name);
      this.loadingCodTintas.set(true);

      // Leer el archivo Excel
      const rawData = await this.excelService.readExcel(file);
      console.log('📊 Datos leídos del Excel:', rawData.length, 'filas');

      if (rawData.length === 0) {
        this.snackBar.open('El archivo Excel está vacío', 'Cerrar', { duration: 3000 });
        return;
      }

      // Convertir array de arrays a objetos con claves A, B, C, etc.
      const jsonData = rawData.map(row => {
        const obj: any = {};
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
        row.forEach((cell, index) => {
          if (index < letters.length) {
            obj[letters[index]] = cell;
          }
        });
        return obj;
      });

      // Filtrar la primera fila (encabezados) y filas vacías
      const dataToImport = jsonData.slice(1).filter((row: any) => {
        // Verificar que al menos tenga artículo (columna A) y que sea un string válido
        const articulo = row['A'];
        
        // Saltar si no hay artículo
        if (!articulo) return false;
        
        // Saltar si el artículo es un objeto (error de lectura)
        if (typeof articulo === 'object') {
          console.warn('⚠️ Fila con artículo inválido (objeto):', row);
          return false;
        }
        
        const articuloStr = articulo.toString().trim();
        
        // Saltar filas vacías
        if (articuloStr === '') return false;
        
        // Saltar filas que parecen encabezados o fórmulas
        const invalidPatterns = [
          /metros/i,
          /ancho/i,
          /volumen/i,
          /eficiencia/i,
          /densidad/i,
          /carga/i,
          /área/i,
          /consumo/i,
          /tinta.*kg/i,
          /^\(/,  // Empieza con paréntesis
          /=/     // Contiene signo igual (fórmula)
        ];
        
        const isInvalid = invalidPatterns.some(pattern => pattern.test(articuloStr));
        if (isInvalid) {
          console.warn('⚠️ Fila saltada (parece encabezado/fórmula):', articuloStr);
          return false;
        }
        
        return true;
      });

      console.log('📦 Filas válidas para importar:', dataToImport.length);
      
      // Log de muestra de datos para debug
      if (dataToImport.length > 0) {
        console.log('🔍 Muestra de datos (primera fila):', dataToImport[0]);
        console.log('🔍 Columnas disponibles:', Object.keys(dataToImport[0]));
        console.log('🔍 Valores de columnas importantes:');
        console.log('   - A (Artículo):', dataToImport[0]['A']);
        console.log('   - B (Descripción):', dataToImport[0]['B']);
        console.log('   - D (Cod Tinta):', dataToImport[0]['D']);
        console.log('   - F (Color):', dataToImport[0]['F']);
        console.log('   - G (Cobertura):', dataToImport[0]['G'], typeof dataToImport[0]['G']);
        console.log('   - H (Cod Anilox):', dataToImport[0]['H']);
      }

      if (dataToImport.length === 0) {
        this.snackBar.open('No se encontraron datos válidos para importar. Verifica que la columna A contenga artículos.', 'Cerrar', { duration: 5000 });
        return;
      }

      // Enviar al backend
      const response = await fetch(`${environment.apiUrl}/cod-tintas/import/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authService.getToken()}`
        },
        body: JSON.stringify(dataToImport)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Importación completada:', result);
      
      // Log detallado de errores
      if (result.errors > 0 && result.errorDetails) {
        console.error('❌ ERRORES DETALLADOS DE IMPORTACIÓN:');
        result.errorDetails.forEach((error: string, index: number) => {
          console.error(`  ${index + 1}. ${error}`);
        });
      }

      // Recargar datos
      await this.loadCodTintas();

      // Mostrar resultado
      let message = `Importación exitosa: ${result.imported} creados, ${result.updated} actualizados`;
      if (result.errors > 0) {
        message += `, ${result.errors} errores`;
        console.warn('⚠️ Errores durante la importación:', result.errorDetails);
      }

      this.snackBar.open(message, 'Cerrar', { duration: 5000 });
    } catch (error: any) {
      console.error('❌ Error importando desde Excel:', error);
      this.snackBar.open(error.message || 'Error al importar desde Excel', 'Cerrar', { duration: 5000 });
    } finally {
      this.loadingCodTintas.set(false);
      event.target.value = ''; // Limpiar input
    }
  }
}
