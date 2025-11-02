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
  templateUrl: './design.html',
  styleUrls: ['./design.scss']

})
export class DesignComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  
  // Señales reactivas
  currentUser = signal<User | null>(null);
  loading = signal<boolean>(false);
  uploading = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  searchTerm = signal<string>('');
  allDesigns = signal<FlexographicDesign[]>([]);
  filteredDesigns = signal<FlexographicDesign[]>([]);
  expandedColors = signal<Set<string>>(new Set());
  showDebugControls = signal<boolean>(false);

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

  constructor() {}

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
      // Configurar permisos basados en el rol del usuario
      const permissions: UserPermissions = {
        canCreateDesign: ['admin', 'manager', 'designer'].includes(user.role),
        canBulkUpload: ['admin', 'manager'].includes(user.role),
        canClearDatabase: user.role === 'admin',
        canEditDesign: ['admin', 'manager', 'designer'].includes(user.role),
        canDeleteDesign: ['admin', 'manager'].includes(user.role),
        create_design: ['admin', 'manager', 'designer'].includes(user.role),
        bulk_upload: ['admin', 'manager'].includes(user.role),
        admin_clear_db: user.role === 'admin'
      };
      this.userPermissions.set(permissions);
    }
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: keyof UserPermissions): boolean {
    return this.userPermissions()[permission];
  }

  /**
   * Cargar diseños desde el backend
   */
  async loadDesigns() {
    this.loading.set(true);
    try {
      // Simular datos de diseños flexográficos
      const mockDesigns: FlexographicDesign[] = [
        {
          id: 1,
          articleF: 'F204567',
          client: 'ABSORBENTES DE COLOMBIA S.A',
          description: 'PROTECTORES DIARIOS TELA SUAVE',
          substrate: 'R PE COEX BCO',
          type: 'LAMINA',
          printType: 'CARA',
          colorCount: 4,
          colors: ['CYAN', 'MAGENTA', 'AMARILLO', 'NEGRO'],
          status: 'ACTIVO',
          createdDate: new Date('2024-01-15'),
          lastModified: new Date('2024-01-20')
        },
        {
          id: 2,
          articleF: 'F205123',
          client: 'PRODUCTOS FAMILIA S.A',
          description: 'TOALLAS HIGIÉNICAS NOCTURNAS',
          substrate: 'BOPP PERLADO',
          type: 'TUBULAR',
          printType: 'CARA_DORSO',
          colorCount: 6,
          colors: ['CYAN', 'MAGENTA', 'AMARILLO', 'NEGRO', 'BLANCO', 'NARANJA'],
          status: 'ACTIVO',
          createdDate: new Date('2024-02-01'),
          lastModified: new Date('2024-02-05')
        },
        {
          id: 3,
          articleF: 'F203890',
          client: 'KIMBERLY CLARK',
          description: 'PAÑALES HUGGIES ACTIVE SEC',
          substrate: 'PE METALIZADO',
          type: 'SEMITUBULAR',
          printType: 'DORSO',
          colorCount: 3,
          colors: ['VERDE', 'VIOLETA', 'BLANCO'],
          status: 'INACTIVO',
          createdDate: new Date('2024-01-10'),
          lastModified: new Date('2024-01-25')
        }
      ];

      this.allDesigns.set(mockDesigns);
      this.filteredDesigns.set(mockDesigns);
    } catch (error) {
      console.error('Error loading designs:', error);
      this.snackBar.open('Error al cargar los diseños', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Crear nuevo diseño
   */
  createNewDesign() {
    this.snackBar.open('Funcionalidad de crear diseño en desarrollo', 'Cerrar', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
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
   * Limpiar todos los diseños
   */
  async clearAllDesigns() {
    if (!confirm('¿Estás seguro de que quieres eliminar TODOS los diseños? Esta acción no se puede deshacer.')) {
      return;
    }

    this.loading.set(true);
    try {
      // Simular limpieza
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.allDesigns.set([]);
      this.filteredDesigns.set([]);
      
      this.snackBar.open('Todos los diseños han sido eliminados', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error clearing designs:', error);
      this.snackBar.open('Error al limpiar los diseños', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Debug de permisos
   */
  debugPermissions() {
    const user = this.currentUser();
    const permissions = this.userPermissions();
    
    console.log('=== DEBUG PERMISOS ===');
    console.log('Usuario actual:', user);
    console.log('Permisos:', permissions);
    
    this.snackBar.open(`Usuario: ${user?.userCode} | Rol: ${user?.role}`, 'Cerrar', {
      duration: 5000,
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Debug de conexión
   */
  debugConnection() {
    this.snackBar.open('Conexión de red: OK | Base de datos: Simulada', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Simular rol de usuario
   */
  simulateUserRole(role: string) {
    const mockUser: User = {
      id: 'sim-' + Date.now(),
      userCode: `sim_${role}`,
      firstName: 'Usuario',
      lastName: 'Simulado',
      email: `${role}@flexoapp.com`,
      role: role,
      isActive: true
    };
    
    this.currentUser.set(mockUser);
    this.loadCurrentUser();
    
    this.snackBar.open(`Simulando rol: ${role}`, 'Cerrar', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Resetear a usuario por defecto
   */
  resetToDefaultUser() {
    this.loadCurrentUser();
    this.snackBar.open('Usuario reseteado', 'Cerrar', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Toggle controles de debug
   */
  toggleDebugControls() {
    this.showDebugControls.set(!this.showDebugControls());
  }

  /**
   * Manejar selección de archivo
   */
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

    this.uploading.set(true);
    this.uploadProgress.set(0);

    try {
      // Simular progreso de carga
      for (let i = 0; i <= 100; i += 10) {
        this.uploadProgress.set(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.snackBar.open(`Archivo ${file.name} procesado exitosamente`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Recargar diseños
      await this.loadDesigns();
    } catch (error) {
      console.error('Error processing file:', error);
      this.snackBar.open('Error al procesar el archivo', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.uploading.set(false);
      this.uploadProgress.set(0);
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
    this.snackBar.open(`Editando diseño: ${design.articleF}`, 'Cerrar', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Duplicar diseño
   */
  duplicateDesign(design: FlexographicDesign) {
    const newDesign: FlexographicDesign = {
      ...design,
      id: Math.max(...this.allDesigns().map(d => d.id || 0)) + 1,
      articleF: design.articleF + '_COPY',
      createdDate: new Date(),
      lastModified: new Date()
    };

    const designs = [...this.allDesigns(), newDesign];
    this.allDesigns.set(designs);
    this.filteredDesigns.set(designs);

    this.snackBar.open(`Diseño duplicado: ${newDesign.articleF}`, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Eliminar diseño
   */
  deleteDesign(design: FlexographicDesign) {
    if (!confirm(`¿Estás seguro de que quieres eliminar el diseño ${design.articleF}?`)) {
      return;
    }

    const designs = this.allDesigns().filter(d => d.id !== design.id);
    this.allDesigns.set(designs);
    this.filteredDesigns.set(designs);

    this.snackBar.open(`Diseño eliminado: ${design.articleF}`, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}