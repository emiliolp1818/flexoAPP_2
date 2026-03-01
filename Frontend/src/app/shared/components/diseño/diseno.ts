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
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';
import { DuplicateDesignDialogComponent } from './duplicate-design-dialog.component';
import { CreateAniloxDialogComponent } from './create-anilox-dialog.component';
import { EditAniloxDialogComponent } from './edit-anilox-dialog.component';

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
  databaseColors = signal<string[]>([]);
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
    this.loadDatabaseColors();
    this.initializeOptimizations();
    this.initializeAniloxData();
    this.loadMachineConfigs();
    this.loadDesigns();
  }

  ngOnDestroy() {
    this.stopAutoUpdate();
  }


  private initializeOptimizations() {
    const memory = this.getMemoryUsage();
    if (memory) {
      if (memory.limit < 1000) this.pageSize.set(25);
      else if (memory.limit < 2000) this.pageSize.set(50);
      else this.pageSize.set(100);
    }


    setInterval(() => {
      if (this.needsOptimization()) {
        this.optimizePerformance();
      }
    }, 30000);
  }


  async loadDatabaseColors() {
    try {
      const colors = await this.http.get<string[]>(`${environment.apiUrl}/designs/unique-colors`).toPromise();
      if (colors) {
        this.databaseColors.set(colors);
        console.log('📊 Colores únicos de BDD cargados:', colors.length);
      }
    } catch (error) {
      console.error('❌ Error cargando colores de BDD:', error);
    }
  }


  loadPantoneColors() {
    const colors = this.pantoneService.getAllColors();
    this.availablePantoneColors.set(colors);
  }


  loadCurrentUser() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);

    if (user) {
      console.log('👤 Usuario actual:', user);
      console.log('🔑 Rol del usuario:', user.role);


      const userRole = user.role.toLowerCase();
      const permissions: UserPermissions = {

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

        this.snackBar.open(
          `Importación completada: ${response.totalCount} diseños en total`,
          'Cerrar',
          { duration: 4000, panelClass: ['success-snackbar'] }
        );
      } else {
        console.warn('⚠️ Respuesta vacía del servidor');
        this.allDesigns.set([]);
        this.filteredDesigns.set([]);
        this.totalRecords.set(0);
      }
    } catch (error: any) {
      console.error('❌ Error recargando diseños:', error);
      this.snackBar.open(
        'Error al recargar diseños. Por favor, recarga la página.',
        'Cerrar',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
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

        this.snackBar.open(`Página ${page} cargada`, 'Cerrar', {
          duration: 2000,
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
      colors: ['P Black'],
      status: 'ACTIVO'
    });


    const defaultColor = this.pantoneService.getColorByCode('Black');
    if (defaultColor) {
      this.selectedColors.set([defaultColor]);
    }
  }


  cancelCreateDesign() {
    this.showCreateForm.set(false);
    this.resetCreateForm();
  }


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


        await this.loadDesigns();

        this.snackBar.open(`Diseño "${formData.articleF}" creado exitosamente`, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });


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



  updateColors() {
    const isEditing = this.showEditForm();
    const form = isEditing ? this.editDesignForm : this.createDesignForm;
    const colorCount = form.get('colorCount')?.value || 1;
    const currentSelectedColors = this.selectedColors();
    const newSelectedColors = [...currentSelectedColors];

    while (newSelectedColors.length < colorCount) {
      newSelectedColors.push(this.pantoneService.getOrCreateColor('BLACK'));
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



  searchPantoneColors(searchTerm: string) {
    this.colorSearchTerm.set(searchTerm);
    const term = searchTerm.trim().toUpperCase();


    let results = searchTerm.trim()
      ? this.pantoneService.searchByCode(searchTerm)
      : this.pantoneService.getAllColors();


    if (term) {
      const dbMatches = this.databaseColors().filter(c => c.toUpperCase().includes(term));

      dbMatches.forEach(dbColor => {

        const alreadyInResults = results.some(r => r.displayName.toUpperCase() === dbColor.toUpperCase());
        if (!alreadyInResults) {
          results.push(this.pantoneService.getOrCreateColor(dbColor));
        }
      });
    }

    this.availablePantoneColors.set(results.slice(0, 50));
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


    this.snackBar.open('Actualizando lista de diseños...', '', {
      duration: 1500,
      panelClass: ['info-snackbar']
    });


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

        this.snackBar.open(
          `${total} resultados encontrados`,
          'Cerrar',
          {
            duration: 3000,
            panelClass: ['info-snackbar']
          }
        );
      }
    } catch (error: any) {
      console.error('❌ Error en búsqueda del servidor:', error);

      this.snackBar.open('Error al buscar en el servidor', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
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
        category: 'Basic'
      };
    }

    try {
      const color = this.pantoneService.getOrCreateColor(colorName);
      console.log('🎨 Color obtenido:', colorName, '→', color.hex);
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
        category: 'Custom'
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


    const pantoneColors: PantoneColor[] = design.colors.map(colorName =>
      this.pantoneService.getOrCreateColor(colorName)
    );
    this.selectedColors.set(pantoneColors);


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

    if (!design.articleF) {
      this.snackBar.open('Error: El diseño no tiene un código válido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }


    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '600px',
      data: {
        articleF: design.articleF,
        client: design.client,
        description: design.description
      },
      disableClose: true,
      panelClass: 'confirm-delete-dialog-container'
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
      this.snackBar.open('Error al cargar el inventario de anilox', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });


      this.aniloxData = [];
      this.filteredAniloxData = [];
    } finally {
      this.selectedMachine = previousSelectedMachine || 'all';
      this.aniloxSearchTerm = previousSearchTerm || '';
      this.filterAnilox();
    }
  }


  async createAnilox() {
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
            this.snackBar.open(`Anilox ${newAnilox.codigo} creado exitosamente`, 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });


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

          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }


  async editAnilox(anilox: any) {
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

            this.snackBar.open(`✓ ${updatedAnilox.codigo} guardado`, '', {
              duration: 2500,
              panelClass: ['success-snackbar-compact'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });


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

          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }


  async deleteAnilox(anilox: any) {

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


          this.snackBar.open(`🗑️ ${anilox.codigo} eliminado`, '', {
            duration: 2500,
            panelClass: ['delete-snackbar-compact'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });


          await this.initializeAniloxData();
        } catch (error: any) {
          console.error('❌ Error eliminando anilox:', error);

          let errorMessage = 'Error al eliminar el anilox';
          if (error.status === 404) {
            errorMessage = 'Anilox no encontrado';
          } else if (error.status === 401) {
            errorMessage = 'No tienes permisos para eliminar anilox';
          }

          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
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


        this.snackBar.open(`✓ Carga muestra MQ ${machine} actualizada`, '', {
          duration: 2000,
          panelClass: ['success-snackbar-compact'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    } catch (error: any) {
      console.error('❌ Error actualizando carga muestra:', error);

      let errorMessage = 'Error al actualizar carga muestra';
      if (error.status === 404) {
        errorMessage = 'Configuración de máquina no encontrada';
      } else if (error.status === 401) {
        errorMessage = 'No tienes permisos para actualizar configuraciones';
      }

      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });


      event.target.value = currentValue !== null && currentValue !== undefined ? currentValue : '';
    }

    console.log('🔵 ===== FIN updateMachineCargaMuestra =====');
  }


  triggerExcelUpload() {
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

      const aniloxList: any[] = [];

      // Empezar desde la fila 2 (índice 1) ya que la fila 1 (índice 0) es encabezado
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];

        // Mapeo de columnas según especificación:
        // C (índice 2) = código
        // D (índice 3) = máquina
        // E (índice 4) = lineatura (LPI)
        // F (índice 5) = BCM
        // G (índice 6) = proveedor
        // H (índice 7) = volumen real
        // I (índice 8) = factor de eficiencia
        // J (índice 9) = densidad

        const codigo = row[2]?.toString().trim();
        const maquina = parseInt(row[3]);
        const lineatura = parseInt(row[4]);
        const bcm = parseInt(row[5]);
        const proveedor = row[6]?.toString().trim() || 'APEX';
        const volumenReal = parseFloat(row[7]);
        const factorEficiencia = row[8] ? parseFloat(row[8]) : 35.00;
        const densidad = row[9] ? parseFloat(row[9]) : 0.885;

        console.log(`📝 Fila ${i + 1}:`, {
          codigo,
          maquina,
          lineatura,
          bcm,
          proveedor,
          volumenReal,
          factorEficiencia,
          densidad
        });

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
}
