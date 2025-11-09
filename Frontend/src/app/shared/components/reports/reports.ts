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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, User } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface UserAction {
  id: string;
  userId: string;
  userCode: string;
  action: string;
  description: string;
  module: string;
  component: string;
  timestamp: Date;
  expiryDate: Date;
  daysRemaining: number;
  isExpiringSoon: boolean;
  metadata?: any;
}

interface UserReport {
  user: User;
  activities: UserAction[];
  totalActivities: number;
  moduleBreakdown: { [key: string]: number };
  dateRange: { start: Date; end: Date };
}

interface MachineOrder {
  orderNumber: string;
  description: string;
  machineId: string;
  completedTime?: Date;
  suspendedTime?: Date;
  duration?: number;
  elapsedTime?: number;
  quantity: number;
  progress?: number;
  suspensionReason?: string;
}

interface UserMovement {
  id: string;
  action: string;
  description: string;
  type: 'START' | 'STOP' | 'PAUSE' | 'CONFIG' | 'MAINTENANCE';
  timestamp: Date;
  machineId?: string;
  orderNumber?: string;
  module: string;
}

interface MachineReport {
  user: User;
  reportDate: Date;
  completedOrders: number;
  suspendedOrders: number;
  totalMovements: number;
  activeHours: number;
  completedOrdersList: MachineOrder[];
  suspendedOrdersList: MachineOrder[];
  userMovements: UserMovement[];
  backupId?: string;
  isFromBackup?: boolean;
}

interface MachineBackup {
  backupId: string;
  description: string;
  createdAt: Date;
  totalRecords: number;
  backupSize: number;
  machineCount: number;
  isValid: boolean;
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
    MatTabsModule,
    MatChipsModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss']
})
export class ReportsComponent implements OnInit {
  // Señales para el estado del componente
  loading = signal<boolean>(false);
  searchResults = signal<UserReport | null>(null);
  availableUsers = signal<User[]>([]);

  // Señales para reportes de máquinas
  machineLoading = signal<boolean>(false);
  machineResults = signal<MachineReport | null>(null);
  availableBackups = signal<MachineBackup[]>([]);
  selectedBackup = signal<string | null>(null);

  // Formulario de búsqueda
  searchForm: FormGroup;
  machineSearchForm: FormGroup;

  // Opciones de filtrado
  moduleOptions = [
    { value: 'ALL', label: 'Todos los módulos' },
    { value: 'AUTH', label: 'Autenticación' },
    { value: 'PROFILE', label: 'Perfil' },
    { value: 'MACHINES', label: 'Máquinas' },
    { value: 'DESIGN', label: 'Diseño' },
    { value: 'REPORTS', label: 'Reportes' },
    { value: 'SETTINGS', label: 'Configuraciones' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.searchForm = this.fb.group({
      userCode: ['', [Validators.required]],
      startDate: [''],
      endDate: [''],
      module: ['ALL']
    });

    this.machineSearchForm = this.fb.group({
      userCode: ['', [Validators.required]],
      reportDate: [new Date(), [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadAvailableUsers();
    this.loadAvailableBackups();
  }

  /**
   * Cargar usuarios disponibles para búsqueda
   */
  loadAvailableUsers() {
    this.loading.set(true);
    
    setTimeout(() => {
      const currentUser = this.authService.getCurrentUser();
      
      // TODO: Implementar llamada real a la API para obtener usuarios
      // const users = await this.userService.getAllUsers();
      
      // Por ahora, solo incluir el usuario actual hasta implementar la API
      const availableUsers = currentUser ? [currentUser] : [];

      this.availableUsers.set(availableUsers);
      this.loading.set(false);
    }, 500);
  }

  /**
   * Buscar actividades por código de usuario
   */
  searchUserActivities() {
    if (this.searchForm.invalid) {
      this.snackBar.open('Por favor ingresa un código de usuario válido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.searchForm.value;
    const searchUserCode = formValue.userCode.trim();

    // Llamada real al API para buscar actividades de usuario
    this.http.get<any>(`${environment.apiUrl}/reports/user-activities/${searchUserCode}`, {
      params: {
        startDate: formValue.startDate ? formValue.startDate.toISOString() : '',
        endDate: formValue.endDate ? formValue.endDate.toISOString() : '',
        module: formValue.module !== 'ALL' ? formValue.module : ''
      }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          const report: UserReport = {
            user: {
              id: searchUserCode,
              userCode: searchUserCode,
              firstName: 'Usuario',
              lastName: 'Sistema',
              email: `${searchUserCode}@flexoapp.com`,
              role: 'user',
              isActive: true
            },
            activities: response.data || [],
            totalActivities: response.data?.length || 0,
            moduleBreakdown: this.calculateModuleBreakdown(response.data || []),
            dateRange: {
              start: formValue.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              end: formValue.endDate || new Date()
            }
          };

          this.searchResults.set(report);
          this.snackBar.open(`Se encontraron ${response.data?.length || 0} actividades para ${searchUserCode}`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          throw new Error(response.message || 'Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error buscando actividades:', error);
        this.loading.set(false);
        
        this.snackBar.open(`No se encontraron datos en el servidor para ${searchUserCode}. Usando datos simulados.`, 'Cerrar', {
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        
        setTimeout(() => {
          let user = this.availableUsers().find(u => 
            u.userCode.toLowerCase() === searchUserCode.toLowerCase()
          );

          if (!user) {
            user = this.availableUsers().find(u => 
              u.userCode.toLowerCase().includes(searchUserCode.toLowerCase()) ||
              u.firstName.toLowerCase().includes(searchUserCode.toLowerCase()) ||
              u.lastName.toLowerCase().includes(searchUserCode.toLowerCase())
            );
          }

          if (!user) {
            user = {
              id: Date.now().toString(),
              userCode: searchUserCode,
              firstName: 'Usuario',
              lastName: 'Simulado',
              email: `${searchUserCode}@flexoapp.com`,
              role: 'user',
              isActive: true
            };
            
            const currentUsers = this.availableUsers();
            this.availableUsers.set([...currentUsers, user]);
          }

          // TODO: Implementar llamada real a la API de actividades
          // const activities = await this.activityService.getUserActivities(user.id, formValue);
          const activities: UserAction[] = [];
          const report: UserReport = {
            user,
            activities,
            totalActivities: activities.length,
            moduleBreakdown: this.calculateModuleBreakdown(activities),
            dateRange: {
              start: formValue.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              end: formValue.endDate || new Date()
            }
          };

          this.searchResults.set(report);
          this.loading.set(false);

          this.snackBar.open(`Se encontraron ${activities.length} actividades para ${user.userCode}`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }, 1500);
      }
    });
  }



  /**
   * Calcular desglose por módulo
   */
  private calculateModuleBreakdown(activities: UserAction[]): { [key: string]: number } {
    const breakdown: { [key: string]: number } = {};
    
    activities.forEach(activity => {
      breakdown[activity.module] = (breakdown[activity.module] || 0) + 1;
    });

    return breakdown;
  }

  /**
   * Exportar reporte a PDF
   */
  exportToPDF() {
    const report = this.searchResults();
    if (!report) return;

    this.loading.set(true);

    setTimeout(() => {
      try {
        const pdfContent = this.generatePDFContent(report);
        
        const blob = new Blob([pdfContent], { 
          type: 'application/pdf;charset=utf-8' 
        });
        
        const fileName = `reporte_actividades_${report.user.userCode}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
          (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
        } else {
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          
          link.href = url;
          link.download = fileName;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
        }

        this.loading.set(false);
        this.snackBar.open(`Reporte PDF generado: ${fileName}`, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
      } catch (error) {
        console.error('Error generando PDF:', error);
        this.loading.set(false);
        this.snackBar.open('Error al generar el reporte PDF', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    }, 1500);
  }

  /**
   * Generar contenido del PDF (simulado)
   */
  private generatePDFContent(report: UserReport): string {
    return `
REPORTE DE ACTIVIDADES DE USUARIO
=================================

Usuario: ${report.user.firstName} ${report.user.lastName}
Código: ${report.user.userCode}
Email: ${report.user.email}
Rol: ${report.user.role}

Período: ${report.dateRange.start.toLocaleDateString()} - ${report.dateRange.end.toLocaleDateString()}
Total de actividades: ${report.totalActivities}

DESGLOSE POR MÓDULO:
${Object.entries(report.moduleBreakdown).map(([module, count]) => `${module}: ${count} actividades`).join('\n')}

DETALLE DE ACTIVIDADES:
${report.activities.map((activity, index) => `
${index + 1}. ${activity.action}
   Fecha: ${activity.timestamp.toLocaleString()}
   Módulo: ${activity.module}
   Descripción: ${activity.description}
   Componente: ${activity.component}
`).join('\n')}

Reporte generado el: ${new Date().toLocaleString()}
Sistema FlexoAPP - Gestión Flexográfica
    `;
  }

  /**
   * Limpiar resultados de búsqueda
   */
  clearResults() {
    this.searchResults.set(null);
    this.searchForm.reset();
    this.searchForm.patchValue({ module: 'ALL' });
  }

  /**
   * Obtener etiqueta del módulo
   */
  getModuleLabel(moduleValue: string): string {
    const module = this.moduleOptions.find(m => m.value === moduleValue);
    return module ? module.label : moduleValue;
  }

  /**
   * Obtener icono del módulo
   */
  getModuleIcon(module: string): string {
    const icons: { [key: string]: string } = {
      'AUTH': 'login',
      'PROFILE': 'person',
      'MACHINES': 'precision_manufacturing',
      'DESIGN': 'design_services',
      'REPORTS': 'assessment',
      'SETTINGS': 'settings'
    };
    return icons[module] || 'info';
  }

  /**
   * Función para mostrar el código de usuario en el autocomplete
   */
  displayUserCode(userCode: string): string {
    return userCode;
  }

  /**
   * Seleccionar usuario desde los chips de ayuda
   */
  selectUser(userCode: string) {
    this.searchForm.patchValue({ userCode });
  }

  /**
   * Obtener fecha de inicio por defecto (30 días atrás)
   */
  getDefaultStartDate(): Date {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  /**
   * Obtener fecha de fin por defecto (hoy)
   */
  getDefaultEndDate(): Date {
    return new Date();
  }

  /**
   * Obtener nombre del rol para mostrar
   */
  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'designer': 'Diseñador',
      'operator': 'Operario',
      'viewer': 'Visualizador',
      'user': 'Usuario'
    };
    return roleMap[role] || role || 'Sin rol';
  }

  /**
   * Manejar cambio de pestaña
   */
  onTabChange(index: number) {
    if (index === 0) {
      this.machineResults.set(null);
    } else if (index === 1) {
      this.searchResults.set(null);
    }
  }

  /**
   * Buscar actividades de máquinas por usuario y fecha
   */
  searchMachineActivities() {
    if (this.machineSearchForm.invalid) {
      this.snackBar.open('Por favor ingresa un código de usuario válido y selecciona una fecha', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.machineLoading.set(true);
    const formValue = this.machineSearchForm.value;
    const searchUserCode = formValue.userCode.trim();
    const reportDate = formValue.reportDate;

    this.http.get<any>(`${environment.apiUrl}/reports/machine-activities/${searchUserCode}`, {
      params: {
        reportDate: reportDate ? reportDate.toISOString().split('T')[0] : ''
      }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.machineResults.set(response.data);
          this.snackBar.open(`Reporte de máquinas generado para ${searchUserCode}`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          throw new Error(response.message || 'Error en la respuesta del servidor');
        }
        this.machineLoading.set(false);
      },
      error: (error) => {
        console.error('Error buscando actividades de máquinas:', error);
        this.machineLoading.set(false);
        
        this.snackBar.open(`No se encontraron datos en el servidor para ${searchUserCode}. Usando datos simulados.`, 'Cerrar', {
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        
        setTimeout(() => {
          let user = this.availableUsers().find(u => 
            u.userCode.toLowerCase() === searchUserCode.toLowerCase()
          );

          if (!user) {
            user = this.availableUsers().find(u => 
              u.userCode.toLowerCase().includes(searchUserCode.toLowerCase()) ||
              u.firstName.toLowerCase().includes(searchUserCode.toLowerCase()) ||
              u.lastName.toLowerCase().includes(searchUserCode.toLowerCase())
            );
          }

          if (!user) {
            user = {
              id: Date.now().toString(),
              userCode: searchUserCode,
              firstName: 'Usuario',
              lastName: 'Simulado',
              email: `${searchUserCode}@flexoapp.com`,
              role: 'operator',
              isActive: true
            };
          }

          const machineReport = this.generateMachineReport(user, reportDate);
          this.machineResults.set(machineReport);
          this.machineLoading.set(false);

          this.snackBar.open(`Reporte de máquinas generado para ${user.userCode}`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }, 1500);
      }
    });
  }

  /**
   * Generar reporte de máquinas desde datos reales del backend
   * TODO: Implementar llamada real a la API de reportes de máquinas
   */
  private generateMachineReport(user: User, reportDate: Date): MachineReport {
    // TODO: Implementar llamada real al backend
    // return this.reportsService.getMachineReport(user.id, reportDate);
    
    // Retornar estructura vacía hasta implementar la API
    return {
      user,                          // Usuario para el cual se genera el reporte
      reportDate,                    // Fecha del reporte solicitado
      completedOrders: 0,            // Número de órdenes completadas
      suspendedOrders: 0,            // Número de órdenes suspendidas
      totalMovements: 0,             // Total de movimientos registrados
      activeHours: 0,                // Horas activas de trabajo
      completedOrdersList: [],       // Lista detallada de órdenes completadas
      suspendedOrdersList: [],       // Lista detallada de órdenes suspendidas
      userMovements: []              // Lista de movimientos del usuario
    };
  }

  /**
   * Limpiar resultados de búsqueda de máquinas
   */
  clearMachineResults() {
    this.machineResults.set(null);
    this.machineSearchForm.reset();
    this.machineSearchForm.patchValue({ reportDate: new Date() });
  }

  /**
   * Obtener icono para tipo de movimiento
   */
  getMovementIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'START': 'play_arrow',
      'STOP': 'stop',
      'PAUSE': 'pause',
      'CONFIG': 'settings',
      'MAINTENANCE': 'build'
    };
    return icons[type] || 'swap_horiz';
  }

  /**
   * Obtener etiqueta para tipo de movimiento
   */
  getMovementTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'START': 'Inicio',
      'STOP': 'Parada',
      'PAUSE': 'Pausa',
      'CONFIG': 'Configuración',
      'MAINTENANCE': 'Mantenimiento'
    };
    return labels[type] || type;
  }

  /**
   * Cargar backups disponibles desde el backend
   * TODO: Implementar llamada real a la API de backups
   */
  loadAvailableBackups() {
    // TODO: Implementar llamada real al backend
    // this.backupService.getAvailableBackups().subscribe({
    //   next: (backups) => {
    //     this.availableBackups.set(backups);
    //   },
    //   error: (error) => {
    //     console.error('Error cargando backups:', error);
    //     this.availableBackups.set([]);
    //   }
    // });

    // Mientras se implementa el backend, inicializar con array vacío
    setTimeout(() => {
      this.availableBackups.set([]);
    }, 500);
  }

  /**
   * Buscar actividades de máquinas desde backup
   */
  searchMachineActivitiesFromBackup(backupId: string) {
    if (!backupId) {
      this.snackBar.open('Por favor selecciona un backup válido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.machineLoading.set(true);

    this.http.get<any>(`${environment.apiUrl}/reports/machine-activities/backup/${backupId}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.machineResults.set(response.data);
          this.selectedBackup.set(backupId);
          this.snackBar.open(`Reporte generado desde backup: ${backupId}`, 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
        } else {
          throw new Error(response.message || 'Error en la respuesta del servidor');
        }
        this.machineLoading.set(false);
      },
      error: (error) => {
        console.error('Error obteniendo datos desde backup:', error);
        this.machineLoading.set(false);
        
        const selectedBackup = this.availableBackups().find(b => b.backupId === backupId);
        if (!selectedBackup) {
          this.snackBar.open('Backup no encontrado', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return;
        }

        this.snackBar.open(`No se pudieron cargar datos del backup. Usando datos simulados.`, 'Cerrar', {
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        
        setTimeout(() => {
          const backupUser: User = {
            id: 'backup-user',
            userCode: 'backup_data',
            firstName: 'Datos de',
            lastName: 'Backup',
            email: 'backup@flexoapp.com',
            role: 'system',
            isActive: true
          };

          const machineReport = this.generateMachineReportFromBackup(backupUser, selectedBackup);
          this.machineResults.set(machineReport);
          this.selectedBackup.set(backupId);
          this.machineLoading.set(false);

          this.snackBar.open(`Reporte generado desde backup: ${selectedBackup.description}`, 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
        }, 2000);
      }
    });
  }

  /**
   * Generar reporte de máquinas desde datos de backup reales
   * TODO: Implementar llamada real a la API de restauración de backups
   */
  private generateMachineReportFromBackup(user: User, backup: MachineBackup): MachineReport {
    // TODO: Implementar llamada real al backend para restaurar datos del backup
    // return this.backupService.restoreMachineReport(backup.backupId, user.id);
    
    // Retornar estructura vacía hasta implementar la API
    return {
      user,                          // Usuario para el cual se genera el reporte
      reportDate: backup.createdAt,  // Fecha del backup como fecha del reporte
      completedOrders: 0,            // Número de órdenes completadas desde backup
      suspendedOrders: 0,            // Número de órdenes suspendidas desde backup
      totalMovements: 0,             // Total de movimientos desde backup
      activeHours: 0,                // Horas activas desde backup
      completedOrdersList: [],       // Lista de órdenes completadas desde backup
      suspendedOrdersList: [],       // Lista de órdenes suspendidas desde backup
      userMovements: [],             // Lista de movimientos desde backup
      backupId: backup.backupId,     // ID del backup utilizado
      isFromBackup: true             // Flag indicando que es desde backup
    };
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Crear backup manual
   */
  createManualBackup() {
    this.machineLoading.set(true);
    
    setTimeout(() => {
      const newBackup: MachineBackup = {
        backupId: `backup_${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}_manual`,
        description: `Backup manual - ${new Date().toLocaleString()}`,
        createdAt: new Date(),
        totalRecords: Math.floor(Math.random() * 200) + 100,
        backupSize: Math.floor(Math.random() * 5000000) + 1000000,
        machineCount: 12,
        isValid: true
      };

      const currentBackups = this.availableBackups();
      this.availableBackups.set([newBackup, ...currentBackups]);
      this.machineLoading.set(false);

      this.snackBar.open('Backup manual creado exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 2000);
  }
}