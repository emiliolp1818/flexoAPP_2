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
      const mockUsers: User[] = [
        ...(currentUser ? [currentUser] : []),
        {
          id: '2',
          userCode: 'OP001',
          firstName: 'Operario',
          lastName: 'Uno',
          email: 'op001@flexoapp.com',
          role: 'operator',
          isActive: true
        },
        {
          id: '3',
          userCode: 'DIS001',
          firstName: 'Diseñador',
          lastName: 'Principal',
          email: 'dis001@flexoapp.com',
          role: 'designer',
          isActive: true
        }
      ];

      const uniqueUsers = mockUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.userCode === user.userCode)
      );

      this.availableUsers.set(uniqueUsers);
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

          const activities = this.generateMockActivities(user, formValue);
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
   * Generar actividades simuladas para un usuario
   */
  private generateMockActivities(user: User, filters: any): UserAction[] {
    const baseActivities: Partial<UserAction>[] = [
      {
        action: 'Inicio de sesión',
        description: 'Acceso exitoso al sistema FlexoAPP',
        module: 'AUTH',
        component: 'LoginComponent'
      },
      {
        action: 'Actualización de perfil',
        description: 'Modificación de información personal',
        module: 'PROFILE',
        component: 'ProfileComponent'
      },
      {
        action: 'Gestión de máquinas',
        description: 'Programación de máquina flexográfica',
        module: 'MACHINES',
        component: 'MachinesComponent'
      },
      {
        action: 'Creación de diseño',
        description: 'Nuevo diseño flexográfico registrado',
        module: 'DESIGN',
        component: 'DesignComponent'
      },
      {
        action: 'Consulta de reportes',
        description: 'Generación de reporte del sistema',
        module: 'REPORTS',
        component: 'ReportsComponent'
      }
    ];

    const activities: UserAction[] = [];
    const startDate = filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters.endDate || new Date();

    for (let i = 0; i < 15; i++) {
      const baseActivity = baseActivities[Math.floor(Math.random() * baseActivities.length)];
      const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      
      if (filters.module !== 'ALL' && baseActivity.module !== filters.module) {
        continue;
      }

      const activity: UserAction = {
        id: `${i + 1}`,
        userId: user.id,
        userCode: user.userCode,
        action: baseActivity.action!,
        description: baseActivity.description!,
        module: baseActivity.module!,
        component: baseActivity.component!,
        timestamp: randomDate,
        expiryDate: new Date(randomDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        daysRemaining: Math.floor((new Date(randomDate.getTime() + 30 * 24 * 60 * 60 * 1000).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
        isExpiringSoon: false,
        metadata: {
          ip: '192.168.1.' + Math.floor(Math.random() * 255),
          browser: ['Chrome', 'Firefox', 'Safari'][Math.floor(Math.random() * 3)]
        }
      };

      activities.push(activity);
    }

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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

          const machineReport = this.generateMockMachineReport(user, reportDate);
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
   * Generar reporte de máquinas simulado
   */
  private generateMockMachineReport(user: User, reportDate: Date): MachineReport {
    const completedOrders = Math.floor(Math.random() * 8) + 2;
    const suspendedOrders = Math.floor(Math.random() * 3);
    const totalMovements = Math.floor(Math.random() * 20) + 10;
    const activeHours = Math.floor(Math.random() * 6) + 6;

    const completedOrdersList: MachineOrder[] = [];
    for (let i = 0; i < completedOrders; i++) {
      const orderTime = new Date(reportDate);
      orderTime.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      
      completedOrdersList.push({
        orderNumber: `ORD-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        description: `Impresión flexográfica - Lote ${i + 1}`,
        machineId: `MAQ-${String(Math.floor(Math.random() * 5) + 1).padStart(2, '0')}`,
        completedTime: orderTime,
        duration: Math.floor(Math.random() * 120) + 30,
        quantity: Math.floor(Math.random() * 5000) + 1000
      });
    }

    const suspendedOrdersList: MachineOrder[] = [];
    const suspensionReasons = [
      'Falta de material',
      'Mantenimiento preventivo',
      'Cambio de especificaciones',
      'Problema técnico',
      'Pausa programada'
    ];

    for (let i = 0; i < suspendedOrders; i++) {
      const suspendTime = new Date(reportDate);
      suspendTime.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      
      suspendedOrdersList.push({
        orderNumber: `ORD-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        description: `Impresión flexográfica - Lote suspendido ${i + 1}`,
        machineId: `MAQ-${String(Math.floor(Math.random() * 5) + 1).padStart(2, '0')}`,
        suspendedTime: suspendTime,
        elapsedTime: Math.floor(Math.random() * 90) + 15,
        quantity: Math.floor(Math.random() * 5000) + 1000,
        progress: Math.floor(Math.random() * 70) + 10,
        suspensionReason: suspensionReasons[Math.floor(Math.random() * suspensionReasons.length)]
      });
    }

    const userMovements: UserMovement[] = [];
    const movementTypes: UserMovement['type'][] = ['START', 'STOP', 'PAUSE', 'CONFIG', 'MAINTENANCE'];
    const movementActions = {
      'START': ['Inicio de producción', 'Arranque de máquina', 'Inicio de turno'],
      'STOP': ['Fin de producción', 'Parada de máquina', 'Fin de turno'],
      'PAUSE': ['Pausa para mantenimiento', 'Pausa programada', 'Pausa por cambio'],
      'CONFIG': ['Configuración de parámetros', 'Ajuste de máquina', 'Cambio de configuración'],
      'MAINTENANCE': ['Mantenimiento preventivo', 'Limpieza de máquina', 'Revisión técnica']
    };

    for (let i = 0; i < totalMovements; i++) {
      const movementTime = new Date(reportDate);
      movementTime.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      
      const type = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      const actions = movementActions[type];
      const action = actions[Math.floor(Math.random() * actions.length)];

      userMovements.push({
        id: `mov-${i + 1}`,
        action,
        description: `${action} realizada por ${user.userCode}`,
        type,
        timestamp: movementTime,
        machineId: `MAQ-${String(Math.floor(Math.random() * 5) + 1).padStart(2, '0')}`,
        orderNumber: Math.random() > 0.3 ? `ORD-${String(Math.floor(Math.random() * 9000) + 1000)}` : undefined,
        module: 'MACHINES'
      });
    }

    userMovements.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      user,
      reportDate,
      completedOrders,
      suspendedOrders,
      totalMovements,
      activeHours,
      completedOrdersList: completedOrdersList.sort((a, b) => a.completedTime!.getTime() - b.completedTime!.getTime()),
      suspendedOrdersList: suspendedOrdersList.sort((a, b) => a.suspendedTime!.getTime() - b.suspendedTime!.getTime()),
      userMovements
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
   * Cargar backups disponibles para reportes
   */
  loadAvailableBackups() {
    setTimeout(() => {
      const mockBackups: MachineBackup[] = [
        {
          backupId: 'backup_20241031_143022_a1b2c3d4',
          description: 'Backup automático diario - 2024-10-31',
          createdAt: new Date('2024-10-31T14:30:22'),
          totalRecords: 156,
          backupSize: 2048576,
          machineCount: 12,
          isValid: true
        },
        {
          backupId: 'backup_20241030_143015_e5f6g7h8',
          description: 'Backup automático diario - 2024-10-30',
          createdAt: new Date('2024-10-30T14:30:15'),
          totalRecords: 142,
          backupSize: 1945600,
          machineCount: 11,
          isValid: true
        }
      ];

      this.availableBackups.set(mockBackups);
    }, 800);
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

          const machineReport = this.generateMockMachineReportFromBackup(backupUser, selectedBackup);
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
   * Generar reporte de máquinas desde datos de backup
   */
  private generateMockMachineReportFromBackup(user: User, backup: MachineBackup): MachineReport {
    const reportDate = backup.createdAt;
    
    const completedOrders = Math.floor(backup.totalRecords * 0.6);
    const suspendedOrders = Math.floor(backup.totalRecords * 0.1);
    const totalMovements = backup.totalRecords * 2;
    const activeHours = Math.floor(backup.machineCount * 8);

    const completedOrdersList: MachineOrder[] = [];
    for (let i = 0; i < completedOrders; i++) {
      const orderTime = new Date(reportDate);
      orderTime.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      
      completedOrdersList.push({
        orderNumber: `BCK-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        description: `Pedido desde backup - ${backup.description}`,
        machineId: `MAQ-${String(Math.floor(Math.random() * backup.machineCount) + 1).padStart(2, '0')}`,
        completedTime: orderTime,
        duration: Math.floor(Math.random() * 120) + 30,
        quantity: Math.floor(Math.random() * 5000) + 1000
      });
    }

    const suspendedOrdersList: MachineOrder[] = [];
    const suspensionReasons = [
      'Datos de backup - Falta de material',
      'Datos de backup - Mantenimiento',
      'Datos de backup - Cambio de especificaciones',
      'Datos de backup - Problema técnico'
    ];

    for (let i = 0; i < suspendedOrders; i++) {
      const suspendTime = new Date(reportDate);
      suspendTime.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      
      suspendedOrdersList.push({
        orderNumber: `BCK-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        description: `Pedido suspendido desde backup - ${backup.description}`,
        machineId: `MAQ-${String(Math.floor(Math.random() * backup.machineCount) + 1).padStart(2, '0')}`,
        suspendedTime: suspendTime,
        elapsedTime: Math.floor(Math.random() * 90) + 15,
        quantity: Math.floor(Math.random() * 5000) + 1000,
        progress: Math.floor(Math.random() * 70) + 10,
        suspensionReason: suspensionReasons[Math.floor(Math.random() * suspensionReasons.length)]
      });
    }

    const userMovements: UserMovement[] = [];
    const movementTypes: UserMovement['type'][] = ['START', 'STOP', 'PAUSE', 'CONFIG', 'MAINTENANCE'];
    const movementActions = {
      'START': ['Inicio desde backup', 'Arranque desde datos históricos'],
      'STOP': ['Parada desde backup', 'Fin desde datos históricos'],
      'PAUSE': ['Pausa desde backup', 'Pausa en datos históricos'],
      'CONFIG': ['Configuración desde backup', 'Ajuste en datos históricos'],
      'MAINTENANCE': ['Mantenimiento desde backup', 'Revisión en datos históricos']
    };

    for (let i = 0; i < totalMovements; i++) {
      const movementTime = new Date(reportDate);
      movementTime.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      
      const type = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      const actions = movementActions[type];
      const action = actions[Math.floor(Math.random() * actions.length)];

      userMovements.push({
        id: `backup-mov-${i + 1}`,
        action,
        description: `${action} - Datos del backup ${backup.backupId}`,
        type,
        timestamp: movementTime,
        machineId: `MAQ-${String(Math.floor(Math.random() * backup.machineCount) + 1).padStart(2, '0')}`,
        orderNumber: Math.random() > 0.3 ? `BCK-${String(Math.floor(Math.random() * 9000) + 1000)}` : undefined,
        module: 'MACHINES'
      });
    }

    userMovements.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      user,
      reportDate,
      completedOrders,
      suspendedOrders,
      totalMovements,
      activeHours,
      completedOrdersList: completedOrdersList.sort((a, b) => a.completedTime!.getTime() - b.completedTime!.getTime()),
      suspendedOrdersList: suspendedOrdersList.sort((a, b) => a.suspendedTime!.getTime() - b.suspendedTime!.getTime()),
      userMovements,
      backupId: backup.backupId,
      isFromBackup: true
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