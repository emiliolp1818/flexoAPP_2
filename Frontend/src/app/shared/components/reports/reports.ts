// ============================================================================
// IMPORTS - Módulos y servicios necesarios para el componente de reportes
// ============================================================================

// Importaciones de Angular Core - Funcionalidades básicas del framework
import { Component, signal, OnInit } from '@angular/core';        // Component: Decorador para definir componentes | signal: Sistema de reactividad | OnInit: Hook de inicialización
import { CommonModule } from '@angular/common';                   // Directivas comunes de Angular (ngIf, ngFor, pipes, etc.)

// Importaciones de Angular Material - Componentes de UI
import { MatButtonModule } from '@angular/material/button';       // Botones con estilos Material Design
import { MatIconModule } from '@angular/material/icon';           // Iconos de Material Design
import { MatCardModule } from '@angular/material/card';           // Tarjetas contenedoras con elevación
import { MatFormFieldModule } from '@angular/material/form-field'; // Campos de formulario con labels flotantes
import { MatInputModule } from '@angular/material/input';         // Inputs de texto con validación
import { MatSelectModule } from '@angular/material/select';       // Selectores dropdown
import { MatDatepickerModule } from '@angular/material/datepicker'; // Selector de fechas con calendario
import { MatNativeDateModule } from '@angular/material/core';     // Adaptador de fechas nativo
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; // Notificaciones toast
import { MatAutocompleteModule } from '@angular/material/autocomplete'; // Autocompletado de inputs
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Indicador de carga circular
import { MatTabsModule } from '@angular/material/tabs';           // Pestañas de navegación
import { MatChipsModule } from '@angular/material/chips';         // Chips/badges informativos

// Importaciones de Formularios Reactivos - Manejo de formularios con validación
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // FormBuilder: Constructor de formularios | FormGroup: Grupo de controles | Validators: Validadores | ReactiveFormsModule: Módulo de formularios reactivos

// Importaciones de Servicios - Lógica de negocio y comunicación con backend
import { AuthService, User } from '../../../core/services/auth.service'; // AuthService: Servicio de autenticación | User: Interfaz de usuario
import { HttpClient } from '@angular/common/http';                // Cliente HTTP para llamadas a la API REST
import { environment } from '../../../../environments/environment'; // Configuración de entorno (URLs, API keys, etc.)

// ============================================================================
// INTERFACES - Definición de tipos de datos para el componente
// ============================================================================

/**
 * UserAction - Representa una acción realizada por un usuario en el sistema
 * Utilizada para rastrear y auditar actividades de usuarios
 */
interface UserAction {
  id: string;                    // Identificador único de la acción
  userId: string;                // ID del usuario que realizó la acción
  userCode: string;              // Código de usuario (ej: admin, operator01)
  action: string;                // Tipo de acción realizada (ej: LOGIN, CREATE, UPDATE, DELETE)
  description: string;           // Descripción detallada de la acción
  module: string;                // Módulo donde se realizó la acción (AUTH, MACHINES, DESIGN, etc.)
  component: string;             // Componente específico donde ocurrió la acción
  timestamp: Date;               // Fecha y hora exacta de la acción
  expiryDate: Date;              // Fecha de expiración del registro (para limpieza automática)
  daysRemaining: number;         // Días restantes antes de que expire el registro
  isExpiringSoon: boolean;       // Flag que indica si el registro está próximo a expirar
  metadata?: any;                // Datos adicionales opcionales (IP, navegador, dispositivo, etc.)
}

/**
 * UserReport - Reporte completo de actividades de un usuario
 * Agrupa todas las actividades y estadísticas de un usuario en un período específico
 */
interface UserReport {
  user: User;                                      // Información completa del usuario (nombre, código, rol, etc.)
  activities: UserAction[];                        // Array con todas las actividades del usuario en el período
  totalActivities: number;                         // Contador total de actividades realizadas
  moduleBreakdown: { [key: string]: number };      // Desglose de actividades por módulo (ej: {AUTH: 5, MACHINES: 10})
  dateRange: { start: Date; end: Date };           // Rango de fechas del reporte (fecha inicio y fecha fin)
}

/**
 * MachineOrder - Representa una orden de trabajo en una máquina
 * Contiene información sobre pedidos completados o suspendidos
 */
interface MachineOrder {
  orderNumber: string;           // Número único de la orden (ej: ORD-2024-001)
  description: string;           // Descripción del trabajo a realizar
  machineId: string;             // ID de la máquina asignada
  completedTime?: Date;          // Fecha/hora de completado (opcional, solo si está completada)
  suspendedTime?: Date;          // Fecha/hora de suspensión (opcional, solo si está suspendida)
  duration?: number;             // Duración total en minutos (opcional)
  elapsedTime?: number;          // Tiempo transcurrido en minutos (opcional)
  quantity: number;              // Cantidad de unidades a producir
  progress?: number;             // Porcentaje de progreso 0-100 (opcional)
  suspensionReason?: string;     // Motivo de suspensión si aplica (opcional)
}

/**
 * UserMovement - Movimiento o acción del usuario en máquinas
 * Registra cada interacción del usuario con las máquinas del sistema
 */
interface UserMovement {
  id: string;                                                      // Identificador único del movimiento
  action: string;                                                  // Descripción de la acción realizada
  description: string;                                             // Detalle adicional de la acción
  type: 'START' | 'STOP' | 'PAUSE' | 'CONFIG' | 'MAINTENANCE';    // Tipo de movimiento (inicio, parada, pausa, configuración, mantenimiento)
  timestamp: Date;                                                 // Fecha y hora exacta del movimiento
  machineId?: string;                                              // ID de la máquina involucrada (opcional)
  orderNumber?: string;                                            // Número de orden relacionada (opcional)
  module: string;                                                  // Módulo donde se registró el movimiento
}

/**
 * MachineReport - Reporte completo de actividades de máquinas
 * Consolida toda la información de trabajo en máquinas para un usuario en una fecha específica
 */
interface MachineReport {
  user: User;                              // Usuario que realizó las actividades
  reportDate: Date;                        // Fecha del reporte
  completedOrders: number;                 // Cantidad total de órdenes completadas
  suspendedOrders: number;                 // Cantidad total de órdenes suspendidas
  totalMovements: number;                  // Total de movimientos/acciones realizadas
  activeHours: number;                     // Horas activas de trabajo
  completedOrdersList: MachineOrder[];     // Lista detallada de todas las órdenes completadas
  suspendedOrdersList: MachineOrder[];     // Lista detallada de todas las órdenes suspendidas
  userMovements: UserMovement[];           // Lista de todos los movimientos del usuario
  backupId?: string;                       // ID del backup si los datos provienen de un backup (opcional)
  isFromBackup?: boolean;                  // Flag que indica si los datos son de un backup (opcional)
}

/**
 * MachineBackup - Información de un backup de datos de máquinas
 * Representa un respaldo completo de datos de programación de máquinas
 */
interface MachineBackup {
  backupId: string;                // Identificador único del backup (ej: backup_20241110_153045_manual)
  description: string;             // Descripción legible del backup
  createdAt: Date;                 // Fecha y hora de creación del backup
  totalRecords: number;            // Cantidad total de registros almacenados en el backup
  backupSize: number;              // Tamaño del archivo de backup en bytes
  machineCount: number;            // Cantidad de máquinas incluidas en el backup
  isValid: boolean;                // Flag que indica si el backup es válido y puede ser restaurado
}

// ============================================================================
// COMPONENTE PRINCIPAL - ReportsComponent
// ============================================================================

/**
 * ReportsComponent - Componente de reportes y análisis de actividades
 * 
 * Funcionalidades principales:
 * - Consulta de actividades de usuarios por código y rango de fechas
 * - Generación de reportes de actividades en máquinas
 * - Exportación de reportes a PDF
 * - Consulta de datos históricos desde backups
 * - Visualización de estadísticas y métricas
 * 
 * El componente está dividido en dos pestañas principales:
 * 1. Actividades de Usuario: Muestra todas las acciones realizadas por un usuario
 * 2. Reportes de Máquinas: Muestra actividades específicas de trabajo en máquinas
 */
@Component({
  selector: 'app-reports',                    // Selector HTML para usar el componente: <app-reports></app-reports>
  standalone: true,                           // Componente standalone (no requiere módulo padre)
  imports: [                                  // Módulos importados que el componente necesita
    CommonModule,                             // Directivas básicas de Angular (ngIf, ngFor, pipes)
    MatButtonModule,                          // Botones de Material Design
    MatIconModule,                            // Iconos de Material Design
    MatCardModule,                            // Tarjetas contenedoras
    MatFormFieldModule,                       // Campos de formulario
    MatInputModule,                           // Inputs de texto
    MatSelectModule,                          // Selectores dropdown
    MatDatepickerModule,                      // Selector de fechas
    MatNativeDateModule,                      // Adaptador de fechas
    MatSnackBarModule,                        // Notificaciones toast
    MatProgressSpinnerModule,                 // Indicadores de carga
    MatTabsModule,                            // Pestañas de navegación
    MatChipsModule,                           // Chips/badges
    MatAutocompleteModule,                    // Autocompletado
    ReactiveFormsModule                       // Formularios reactivos
  ],
  templateUrl: './reports.html',              // Ruta al archivo HTML del template
  styleUrls: ['./reports.scss']               // Ruta al archivo SCSS de estilos
})
export class ReportsComponent implements OnInit {  // Implementa OnInit para ejecutar lógica al inicializar
  // ============================================================================
  // PROPIEDADES DEL COMPONENTE - Estado y configuración
  // ============================================================================

  // --- Señales para Reportes de Actividades de Usuario ---
  // Las señales (signals) son el nuevo sistema de reactividad de Angular que reemplaza a los Observables en muchos casos
  loading = signal<boolean>(false);                      // Indica si hay una búsqueda de actividades en progreso
  searchResults = signal<UserReport | null>(null);       // Almacena los resultados de la búsqueda de actividades de usuario
  availableUsers = signal<User[]>([]);                   // Lista de usuarios disponibles para búsqueda (para autocompletado)

  // --- Señales para Reportes de Máquinas ---
  machineLoading = signal<boolean>(false);               // Indica si hay una búsqueda de reportes de máquinas en progreso
  machineResults = signal<MachineReport | null>(null);   // Almacena los resultados del reporte de máquinas
  availableBackups = signal<MachineBackup[]>([]);        // Lista de backups disponibles para consulta
  selectedBackup = signal<string | null>(null);          // ID del backup actualmente seleccionado
  
  // --- Señal para control de pestañas - Copiado del módulo de configuración ---
  selectedTabIndex = signal<number>(0);                  // Índice de la pestaña actualmente seleccionada (0 = Actividades, 1 = Máquinas)

  // --- Formularios Reactivos ---
  // FormGroup permite agrupar controles de formulario con validación
  searchForm: FormGroup;                                 // Formulario para búsqueda de actividades de usuario
  machineSearchForm: FormGroup;                          // Formulario para búsqueda de reportes de máquinas

  // --- Opciones de Configuración ---
  // Array de opciones para el filtro de módulos en la búsqueda
  moduleOptions = [
    { value: 'ALL', label: 'Todos los módulos' },        // Opción para mostrar actividades de todos los módulos
    { value: 'AUTH', label: 'Autenticación' },           // Filtrar solo actividades de autenticación (login, logout)
    { value: 'PROFILE', label: 'Perfil' },               // Filtrar solo actividades de perfil de usuario
    { value: 'MACHINES', label: 'Máquinas' },            // Filtrar solo actividades relacionadas con máquinas
    { value: 'DESIGN', label: 'Diseño' },                // Filtrar solo actividades de diseño
    { value: 'REPORTS', label: 'Reportes' },             // Filtrar solo actividades de generación de reportes
    { value: 'SETTINGS', label: 'Configuraciones' }      // Filtrar solo actividades de configuración del sistema
  ];

  // ============================================================================
  // CONSTRUCTOR - Inicialización de dependencias y formularios
  // ============================================================================
  
  /**
   * Constructor del componente
   * Angular inyecta automáticamente las dependencias declaradas en los parámetros
   * 
   * @param fb - FormBuilder: Servicio para construir formularios reactivos de forma simplificada
   * @param authService - AuthService: Servicio de autenticación para obtener información del usuario actual
   * @param snackBar - MatSnackBar: Servicio para mostrar notificaciones toast al usuario
   * @param http - HttpClient: Cliente HTTP para realizar peticiones a la API REST del backend
   */
  constructor(
    private fb: FormBuilder,           // Inyección del constructor de formularios
    private authService: AuthService,  // Inyección del servicio de autenticación
    private snackBar: MatSnackBar,     // Inyección del servicio de notificaciones
    private http: HttpClient           // Inyección del cliente HTTP
  ) {
    // Inicialización del formulario de búsqueda de actividades de usuario
    // fb.group() crea un FormGroup con los controles especificados
    this.searchForm = this.fb.group({
      userCode: ['', [Validators.required]],  // Control 'userCode': valor inicial vacío, validación requerida
      startDate: [''],                        // Control 'startDate': valor inicial vacío, sin validación (opcional)
      endDate: [''],                          // Control 'endDate': valor inicial vacío, sin validación (opcional)
      module: ['ALL']                         // Control 'module': valor inicial 'ALL' (todos los módulos)
    });

    // Inicialización del formulario de búsqueda de reportes de máquinas
    this.machineSearchForm = this.fb.group({
      userCode: ['', [Validators.required]],           // Control 'userCode': valor inicial vacío, validación requerida
      reportDate: [new Date(), [Validators.required]]  // Control 'reportDate': valor inicial fecha actual, validación requerida
    });
  }

  // ============================================================================
  // LIFECYCLE HOOKS - Métodos del ciclo de vida del componente
  // ============================================================================
  
  /**
   * ngOnInit - Hook de inicialización del componente
   * Se ejecuta una vez después de que Angular inicializa las propiedades del componente
   * Es el lugar ideal para cargar datos iniciales y configurar el estado del componente
   */
  ngOnInit() {
    this.loadAvailableUsers();    // Cargar lista de usuarios disponibles para el autocompletado
    this.loadAvailableBackups();  // Cargar lista de backups disponibles para consulta histórica
  }

  // ============================================================================
  // MÉTODOS DE CARGA DE DATOS - Obtención de información desde el backend
  // ============================================================================
  
  /**
   * loadAvailableUsers - Cargar lista de usuarios disponibles para búsqueda
   * 
   * Obtiene todos los usuarios del sistema para poblar el autocompletado
   * del campo de búsqueda. Esto permite al usuario seleccionar fácilmente
   * el código de usuario sin tener que recordarlo exactamente.
   * 
   * TODO: Implementar llamada real a la API del backend
   * Actualmente solo carga el usuario actual como ejemplo
   */
  loadAvailableUsers() {
    this.loading.set(true);  // Activar indicador de carga
    
    // Simular delay de red con setTimeout (500ms)
    setTimeout(() => {
      const currentUser = this.authService.getCurrentUser();  // Obtener usuario autenticado actual
      
      // TODO: Implementar llamada real a la API para obtener todos los usuarios
      // Ejemplo de implementación futura:
      // this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe({
      //   next: (users) => this.availableUsers.set(users),
      //   error: (error) => console.error('Error cargando usuarios:', error)
      // });
      
      // Por ahora, solo incluir el usuario actual hasta implementar la API
      const availableUsers = currentUser ? [currentUser] : [];  // Array con usuario actual o vacío

      this.availableUsers.set(availableUsers);  // Actualizar señal con usuarios disponibles
      this.loading.set(false);                  // Desactivar indicador de carga
    }, 500);  // Delay de 500ms para simular latencia de red
  }

  // ============================================================================
  // MÉTODOS DE BÚSQUEDA - Consulta de actividades y reportes
  // ============================================================================
  
  /**
   * searchUserActivities - Buscar actividades por código de usuario
   * 
   * Realiza una búsqueda de todas las actividades realizadas por un usuario específico
   * en un rango de fechas y opcionalmente filtradas por módulo.
   * 
   * Flujo de ejecución:
   * 1. Valida que el formulario sea válido (código de usuario requerido)
   * 2. Realiza petición HTTP GET al backend con los parámetros de búsqueda
   * 3. Procesa la respuesta y construye el objeto UserReport
   * 4. Actualiza la señal searchResults con los datos obtenidos
   * 5. Muestra notificación de éxito o error al usuario
   * 
   * En caso de error del backend, genera datos simulados para demostración
   */
  searchUserActivities() {
    // Validación del formulario - Verificar que todos los campos requeridos estén completos
    if (this.searchForm.invalid) {
      // Mostrar notificación de error si el formulario es inválido
      this.snackBar.open('Por favor ingresa un código de usuario válido', 'Cerrar', {
        duration: 3000,                    // Duración de 3 segundos
        panelClass: ['error-snackbar']     // Clase CSS para estilo de error (rojo)
      });
      return;  // Salir de la función sin realizar la búsqueda
    }

    this.loading.set(true);                          // Activar indicador de carga
    const formValue = this.searchForm.value;         // Obtener valores del formulario
    const searchUserCode = formValue.userCode.trim(); // Limpiar espacios en blanco del código de usuario

    // Llamada HTTP GET al backend para buscar actividades de usuario
    // Endpoint: GET /api/reports/user-activities/{userCode}
    this.http.get<any>(`${environment.apiUrl}/reports/user-activities/${searchUserCode}`, {
      params: {  // Parámetros de consulta (query params)
        startDate: formValue.startDate ? formValue.startDate.toISOString() : '',  // Fecha inicio en formato ISO o vacío
        endDate: formValue.endDate ? formValue.endDate.toISOString() : '',        // Fecha fin en formato ISO o vacío
        module: formValue.module !== 'ALL' ? formValue.module : ''                // Módulo específico o vacío para todos
      }
    }).subscribe({  // Suscribirse al Observable para manejar respuesta y errores
      next: (response) => {  // Callback ejecutado cuando la petición es exitosa
        if (response.success) {  // Verificar que el backend indique éxito
          // Construir objeto UserReport con los datos recibidos
          const report: UserReport = {
            user: {  // Información del usuario (actualmente simulada, debería venir del backend)
              id: searchUserCode,                              // ID del usuario
              userCode: searchUserCode,                        // Código de usuario buscado
              firstName: 'Usuario',                            // Nombre (TODO: obtener del backend)
              lastName: 'Sistema',                             // Apellido (TODO: obtener del backend)
              email: `${searchUserCode}@flexoapp.com`,         // Email generado
              role: 'user',                                    // Rol (TODO: obtener del backend)
              isActive: true                                   // Estado activo
            },
            activities: response.data || [],                   // Array de actividades del backend o vacío
            totalActivities: response.data?.length || 0,       // Contar total de actividades
            moduleBreakdown: this.calculateModuleBreakdown(response.data || []),  // Calcular estadísticas por módulo
            dateRange: {  // Rango de fechas del reporte
              start: formValue.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),  // Fecha inicio o 30 días atrás
              end: formValue.endDate || new Date()             // Fecha fin o hoy
            }
          };

          this.searchResults.set(report);  // Actualizar señal con resultados
          
          // Mostrar notificación de éxito con cantidad de actividades encontradas
          this.snackBar.open(`Se encontraron ${response.data?.length || 0} actividades para ${searchUserCode}`, 'Cerrar', {
            duration: 3000,                    // Duración de 3 segundos
            panelClass: ['success-snackbar']   // Clase CSS para estilo de éxito (verde)
          });
        } else {
          // Si el backend responde pero indica fallo, lanzar error
          throw new Error(response.message || 'Error en la respuesta del servidor');
        }
        this.loading.set(false);  // Desactivar indicador de carga
      },
      error: (error) => {  // Callback ejecutado cuando hay error en la petición HTTP
        console.error('Error buscando actividades:', error);  // Registrar error en consola para debugging
        this.loading.set(false);  // Desactivar indicador de carga
        
        // Mostrar notificación de advertencia informando que se usarán datos simulados
        this.snackBar.open(`No se encontraron datos en el servidor para ${searchUserCode}. Usando datos simulados.`, 'Cerrar', {
          duration: 4000,                    // Duración de 4 segundos (más tiempo para leer)
          panelClass: ['warning-snackbar']   // Clase CSS para estilo de advertencia (amarillo/naranja)
        });
        
        // Delay de 1.5 segundos antes de generar datos simulados (mejor UX)
        setTimeout(() => {
          // Intentar encontrar el usuario en la lista de usuarios disponibles
          // Búsqueda exacta por código de usuario (case-insensitive)
          let user = this.availableUsers().find(u => 
            u.userCode.toLowerCase() === searchUserCode.toLowerCase()
          );

          // Si no se encuentra con búsqueda exacta, intentar búsqueda parcial
          if (!user) {
            user = this.availableUsers().find(u => 
              u.userCode.toLowerCase().includes(searchUserCode.toLowerCase()) ||      // Buscar en código
              u.firstName.toLowerCase().includes(searchUserCode.toLowerCase()) ||     // Buscar en nombre
              u.lastName.toLowerCase().includes(searchUserCode.toLowerCase())         // Buscar en apellido
            );
          }

          // Si aún no se encuentra, crear un usuario simulado
          if (!user) {
            user = {
              id: Date.now().toString(),                      // ID único usando timestamp
              userCode: searchUserCode,                       // Código ingresado por el usuario
              firstName: 'Usuario',                           // Nombre genérico
              lastName: 'Simulado',                           // Apellido indicando que es simulado
              email: `${searchUserCode}@flexoapp.com`,        // Email generado
              role: 'user',                                   // Rol genérico
              isActive: true                                  // Usuario activo
            };
            
            // Agregar el usuario simulado a la lista de usuarios disponibles
            const currentUsers = this.availableUsers();       // Obtener lista actual
            this.availableUsers.set([...currentUsers, user]); // Agregar nuevo usuario
          }

          // TODO: Implementar llamada real a la API de actividades
          // Ejemplo de implementación futura:
          // const activities = await this.activityService.getUserActivities(user.id, formValue);
          
          // Por ahora, crear array vacío de actividades (datos simulados)
          const activities: UserAction[] = [];  // Array vacío hasta implementar API
          
          // Construir objeto UserReport con datos simulados
          const report: UserReport = {
            user,                                              // Usuario encontrado o creado
            activities,                                        // Array de actividades (vacío por ahora)
            totalActivities: activities.length,                // Total de actividades (0 por ahora)
            moduleBreakdown: this.calculateModuleBreakdown(activities),  // Desglose por módulo (vacío)
            dateRange: {  // Rango de fechas del reporte
              start: formValue.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),  // Fecha inicio o 30 días atrás
              end: formValue.endDate || new Date()            // Fecha fin o hoy
            }
          };

          this.searchResults.set(report);  // Actualizar señal con reporte simulado
          this.loading.set(false);         // Desactivar indicador de carga

          // Mostrar notificación de éxito con datos simulados
          this.snackBar.open(`Se encontraron ${activities.length} actividades para ${user.userCode}`, 'Cerrar', {
            duration: 3000,                    // Duración de 3 segundos
            panelClass: ['success-snackbar']   // Clase CSS para estilo de éxito (verde)
          });
        }, 1500);  // Delay de 1.5 segundos para simular procesamiento
      }  // Fin del callback de error
    });  // Fin del subscribe
  }  // Fin del método searchUserActivities



  // ============================================================================
  // MÉTODOS DE PROCESAMIENTO DE DATOS - Cálculos y transformaciones
  // ============================================================================
  
  /**
   * calculateModuleBreakdown - Calcular desglose de actividades por módulo
   * 
   * Analiza un array de actividades y cuenta cuántas actividades se realizaron
   * en cada módulo del sistema. Útil para generar estadísticas y gráficos.
   * 
   * @param activities - Array de actividades de usuario a analizar
   * @returns Objeto con el conteo de actividades por módulo
   *          Ejemplo: { AUTH: 5, MACHINES: 10, DESIGN: 3 }
   * 
   * @private - Método privado, solo usado internamente en el componente
   */
  private calculateModuleBreakdown(activities: UserAction[]): { [key: string]: number } {
    const breakdown: { [key: string]: number } = {};  // Objeto para almacenar el conteo por módulo
    
    // Iterar sobre cada actividad y contar por módulo
    activities.forEach(activity => {
      // Si el módulo ya existe en breakdown, incrementar su contador
      // Si no existe, inicializarlo en 0 y luego incrementar a 1
      breakdown[activity.module] = (breakdown[activity.module] || 0) + 1;
    });

    return breakdown;  // Retornar objeto con el desglose completo
  }

  // ============================================================================
  // MÉTODOS DE EXPORTACIÓN - Generación de archivos descargables
  // ============================================================================
  
  /**
   * exportToPDF - Exportar reporte de actividades a archivo PDF
   * 
   * Genera un archivo PDF con el reporte completo de actividades del usuario
   * y lo descarga automáticamente en el navegador del usuario.
   * 
   * Flujo de ejecución:
   * 1. Verifica que existan resultados de búsqueda
   * 2. Genera el contenido del PDF en formato texto
   * 3. Crea un Blob (objeto binario) con el contenido
   * 4. Genera un nombre de archivo único con fecha
   * 5. Descarga el archivo usando técnicas compatibles con todos los navegadores
   * 6. Limpia recursos y muestra notificación de éxito
   * 
   * Compatibilidad:
   * - Internet Explorer/Edge: Usa msSaveOrOpenBlob
   * - Otros navegadores: Usa createObjectURL y elemento <a> temporal
   */
  exportToPDF() {
    const report = this.searchResults();  // Obtener resultados actuales de la búsqueda
    if (!report) return;                  // Si no hay resultados, salir de la función

    this.loading.set(true);  // Activar indicador de carga

    // Simular delay de generación de PDF (1.5 segundos)
    setTimeout(() => {
      try {
        // Generar contenido del PDF en formato texto
        const pdfContent = this.generatePDFContent(report);
        
        // Crear Blob (Binary Large Object) con el contenido del PDF
        const blob = new Blob([pdfContent], { 
          type: 'application/pdf;charset=utf-8'  // Tipo MIME para PDF con codificación UTF-8
        });
        
        // Generar nombre de archivo único: reporte_actividades_admin_2024-11-10.pdf
        const fileName = `reporte_actividades_${report.user.userCode}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Compatibilidad con Internet Explorer y Edge legacy
        if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
          (window.navigator as any).msSaveOrOpenBlob(blob, fileName);  // Método específico de IE/Edge
        } else {
          // Método estándar para navegadores modernos (Chrome, Firefox, Safari, Edge Chromium)
          const link = document.createElement('a');  // Crear elemento <a> temporal
          const url = URL.createObjectURL(blob);     // Crear URL temporal del blob
          
          link.href = url;                    // Asignar URL al href del link
          link.download = fileName;           // Asignar nombre de archivo para descarga
          link.style.display = 'none';        // Ocultar el link (no visible en la página)
          
          document.body.appendChild(link);    // Agregar link al DOM
          link.click();                       // Simular click para iniciar descarga
          
          // Limpiar recursos después de 100ms
          setTimeout(() => {
            document.body.removeChild(link);  // Remover link del DOM
            URL.revokeObjectURL(url);         // Liberar memoria del objeto URL
          }, 100);
        }

        this.loading.set(false);  // Desactivar indicador de carga
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
   * generatePDFContent - Generar contenido del PDF en formato texto
   * 
   * Crea el contenido del reporte en formato texto plano que será convertido a PDF.
   * Incluye toda la información del usuario, estadísticas y detalle de actividades.
   * 
   * Estructura del reporte:
   * 1. Encabezado con título
   * 2. Información del usuario (nombre, código, email, rol)
   * 3. Período del reporte y total de actividades
   * 4. Desglose estadístico por módulo
   * 5. Listado detallado de todas las actividades
   * 6. Pie de página con fecha de generación
   * 
   * @param report - Objeto UserReport con todos los datos del reporte
   * @returns String con el contenido formateado del PDF
   * 
   * @private - Método privado, solo usado internamente
   * 
   * TODO: Implementar generación real de PDF usando librerías como jsPDF o pdfmake
   * para obtener un PDF con formato profesional, tablas, gráficos y estilos
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

  // ============================================================================
  // MÉTODOS DE UTILIDAD - Funciones auxiliares y helpers
  // ============================================================================
  
  /**
   * clearResults - Limpiar resultados de búsqueda y resetear formulario
   * 
   * Limpia todos los resultados de la búsqueda actual y resetea el formulario
   * a su estado inicial. Útil cuando el usuario quiere hacer una nueva búsqueda
   * desde cero.
   * 
   * Acciones realizadas:
   * 1. Limpia los resultados de búsqueda (searchResults = null)
   * 2. Resetea todos los campos del formulario a sus valores iniciales
   * 3. Restaura el valor del módulo a 'ALL' (todos los módulos)
   */
  clearResults() {
    this.searchResults.set(null);                      // Limpiar resultados actuales
    this.searchForm.reset();                           // Resetear formulario a valores iniciales
    this.searchForm.patchValue({ module: 'ALL' });     // Restaurar módulo a 'ALL'
  }

  /**
   * getModuleLabel - Obtener etiqueta legible del módulo
   * 
   * Convierte el valor técnico del módulo (ej: 'AUTH') en una etiqueta
   * legible para el usuario (ej: 'Autenticación').
   * 
   * @param moduleValue - Valor técnico del módulo (AUTH, MACHINES, etc.)
   * @returns Etiqueta legible del módulo o el valor original si no se encuentra
   * 
   * Ejemplo:
   * getModuleLabel('AUTH') => 'Autenticación'
   * getModuleLabel('MACHINES') => 'Máquinas'
   */
  getModuleLabel(moduleValue: string): string {
    const module = this.moduleOptions.find(m => m.value === moduleValue);  // Buscar módulo en opciones
    return module ? module.label : moduleValue;  // Retornar label o valor original
  }

  /**
   * getModuleIcon - Obtener icono de Material Design para el módulo
   * 
   * Mapea cada módulo del sistema a un icono específico de Material Design
   * para mejorar la visualización y reconocimiento rápido en la interfaz.
   * 
   * @param module - Nombre del módulo (AUTH, MACHINES, DESIGN, etc.)
   * @returns Nombre del icono de Material Design
   * 
   * Iconos por módulo:
   * - AUTH: login (icono de inicio de sesión)
   * - PROFILE: person (icono de persona)
   * - MACHINES: precision_manufacturing (icono de máquina industrial)
   * - DESIGN: design_services (icono de diseño)
   * - REPORTS: assessment (icono de gráficos/reportes)
   * - SETTINGS: settings (icono de configuración)
   * - Otros: info (icono de información por defecto)
   */
  getModuleIcon(module: string): string {
    const icons: { [key: string]: string } = {
      'AUTH': 'login',                        // Icono para autenticación
      'PROFILE': 'person',                    // Icono para perfil de usuario
      'MACHINES': 'precision_manufacturing',  // Icono para máquinas
      'DESIGN': 'design_services',            // Icono para diseño
      'REPORTS': 'assessment',                // Icono para reportes
      'SETTINGS': 'settings'                  // Icono para configuraciones
    };
    return icons[module] || 'info';  // Retornar icono específico o 'info' por defecto
  }

  /**
   * displayUserCode - Función de visualización para el autocomplete
   * 
   * Angular Material Autocomplete requiere una función que determine
   * cómo mostrar el valor seleccionado en el input.
   * 
   * @param userCode - Código de usuario seleccionado
   * @returns El mismo código de usuario para mostrar en el input
   * 
   * Nota: Esta función es simple porque solo mostramos el código.
   * En casos más complejos, podría formatear o transformar el valor.
   */
  displayUserCode(userCode: string): string {
    return userCode;  // Retornar el código tal cual para mostrarlo en el input
  }

  /**
   * selectUser - Seleccionar usuario desde chips de sugerencias
   * 
   * Permite al usuario hacer clic en un chip de sugerencia para
   * autocompletar el campo de código de usuario rápidamente.
   * 
   * @param userCode - Código del usuario a seleccionar
   * 
   * Uso típico: Chips con usuarios frecuentes o recientes
   */
  selectUser(userCode: string) {
    this.searchForm.patchValue({ userCode });  // Actualizar valor del campo userCode en el formulario
  }

  /**
   * getDefaultStartDate - Obtener fecha de inicio por defecto
   * 
   * Calcula la fecha de 30 días atrás desde hoy para usar como
   * fecha de inicio predeterminada en el selector de fechas.
   * 
   * @returns Fecha de hace 30 días
   * 
   * Cálculo:
   * - Date.now(): Timestamp actual en milisegundos
   * - 30 * 24 * 60 * 60 * 1000: 30 días en milisegundos
   * - Resta para obtener fecha pasada
   */
  getDefaultStartDate(): Date {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);  // Fecha de hace 30 días
  }

  /**
   * getDefaultEndDate - Obtener fecha de fin por defecto
   * 
   * Retorna la fecha actual para usar como fecha de fin
   * predeterminada en el selector de fechas.
   * 
   * @returns Fecha actual (hoy)
   */
  getDefaultEndDate(): Date {
    return new Date();  // Fecha actual
  }

  /**
   * getRoleDisplayName - Obtener nombre legible del rol de usuario
   * 
   * Convierte el valor técnico del rol (ej: 'admin') en un nombre
   * legible en español (ej: 'Administrador') para mostrar en la UI.
   * 
   * @param role - Valor técnico del rol (admin, manager, designer, etc.)
   * @returns Nombre legible del rol en español
   * 
   * Mapeo de roles:
   * - admin => Administrador (acceso total al sistema)
   * - manager => Gerente (gestión de operaciones)
   * - designer => Diseñador (creación de diseños)
   * - operator => Operario (operación de máquinas)
   * - viewer => Visualizador (solo lectura)
   * - user => Usuario (rol genérico)
   * 
   * Si el rol no está en el mapeo, retorna el valor original
   */
  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrador',      // Rol con máximos privilegios
      'manager': 'Gerente',          // Rol de gestión
      'designer': 'Diseñador',       // Rol de diseño
      'operator': 'Operario',        // Rol de operación
      'viewer': 'Visualizador',      // Rol de solo lectura
      'user': 'Usuario'              // Rol genérico
    };
    return roleMap[role] || role || 'Sin rol';  // Retornar nombre legible o valor original
  }

  // ============================================================================
  // MÉTODOS DE NAVEGACIÓN - Manejo de pestañas y navegación
  // ============================================================================
  
  /**
   * onTabChange - Manejar cambio de pestaña en el componente
   * Copiado del módulo de configuración para mantener consistencia
   * 
   * Se ejecuta cuando el usuario cambia entre las pestañas del componente.
   * Actualiza el índice de la pestaña seleccionada y limpia los resultados
   * de la pestaña anterior para evitar confusión y mejorar el rendimiento.
   * 
   * @param index - Índice de la pestaña seleccionada
   *                0 = Actividades de Usuario
   *                1 = Reportes de Máquinas
   * 
   * Comportamiento:
   * - Actualiza selectedTabIndex con el nuevo índice
   * - Al cambiar a pestaña 0 (Actividades): Limpia resultados de máquinas
   * - Al cambiar a pestaña 1 (Máquinas): Limpia resultados de actividades
   * 
   * Esto asegura que cada pestaña tenga su propio estado independiente
   */
  onTabChange(index: number) {
    this.selectedTabIndex.set(index);  // Actualizar señal reactiva con el nuevo índice de pestaña
    
    if (index === 0) {
      // Usuario cambió a pestaña de Actividades de Usuario
      this.machineResults.set(null);  // Limpiar resultados de máquinas
    } else if (index === 1) {
      // Usuario cambió a pestaña de Reportes de Máquinas
      this.searchResults.set(null);   // Limpiar resultados de actividades
    }
  }

  // ============================================================================
  // MÉTODOS DE REPORTES DE MÁQUINAS - Consulta de actividades en máquinas
  // ============================================================================
  
  /**
   * searchMachineActivities - Buscar actividades de máquinas por usuario y fecha
   * 
   * Genera un reporte completo de todas las actividades realizadas por un usuario
   * en las máquinas del sistema en una fecha específica. Incluye:
   * - Órdenes completadas y suspendidas
   * - Movimientos del usuario (inicio, parada, pausa, etc.)
   * - Estadísticas de tiempo activo
   * - Detalles de cada orden procesada
   * 
   * Similar a searchUserActivities pero enfocado en operaciones de máquinas
   */
  searchMachineActivities() {
    // Validación del formulario - Verificar código de usuario y fecha
    if (this.machineSearchForm.invalid) {
      // Mostrar notificación de error si faltan datos requeridos
      this.snackBar.open('Por favor ingresa un código de usuario válido y selecciona una fecha', 'Cerrar', {
        duration: 3000,                    // Duración de 3 segundos
        panelClass: ['error-snackbar']     // Clase CSS para estilo de error (rojo)
      });
      return;  // Salir sin realizar la búsqueda
    }

    this.machineLoading.set(true);                   // Activar indicador de carga para máquinas
    const formValue = this.machineSearchForm.value;  // Obtener valores del formulario
    const searchUserCode = formValue.userCode.trim(); // Limpiar espacios del código de usuario
    const reportDate = formValue.reportDate;         // Obtener fecha seleccionada

    // Llamada HTTP GET al backend para obtener reporte de máquinas
    // Endpoint: GET /api/reports/machine-activities/{userCode}
    this.http.get<any>(`${environment.apiUrl}/reports/machine-activities/${searchUserCode}`, {
      params: {  // Parámetros de consulta
        // Convertir fecha a formato ISO y extraer solo la parte de fecha (YYYY-MM-DD)
        reportDate: reportDate ? reportDate.toISOString().split('T')[0] : ''
      }
    }).subscribe({  // Suscribirse al Observable
      next: (response) => {  // Callback de éxito
        if (response.success) {  // Verificar respuesta exitosa del backend
          this.machineResults.set(response.data);  // Actualizar señal con datos del reporte
          
          // Mostrar notificación de éxito
          this.snackBar.open(`Reporte de máquinas generado para ${searchUserCode}`, 'Cerrar', {
            duration: 3000,                    // Duración de 3 segundos
            panelClass: ['success-snackbar']   // Clase CSS para estilo de éxito (verde)
          });
        } else {
          // Si el backend responde pero indica fallo, lanzar error
          throw new Error(response.message || 'Error en la respuesta del servidor');
        }
        this.machineLoading.set(false);  // Desactivar indicador de carga
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
   * clearMachineResults - Limpiar resultados de búsqueda de máquinas
   * 
   * Limpia todos los resultados del reporte de máquinas y resetea el formulario
   * a su estado inicial. Similar a clearResults pero para la pestaña de máquinas.
   * 
   * Acciones realizadas:
   * 1. Limpia los resultados del reporte de máquinas (machineResults = null)
   * 2. Resetea todos los campos del formulario
   * 3. Restaura la fecha a hoy (fecha actual)
   */
  clearMachineResults() {
    this.machineResults.set(null);                         // Limpiar resultados actuales
    this.machineSearchForm.reset();                        // Resetear formulario
    this.machineSearchForm.patchValue({ reportDate: new Date() }); // Restaurar fecha a hoy
  }

  /**
   * getMovementIcon - Obtener icono de Material Design para tipo de movimiento
   * 
   * Mapea cada tipo de movimiento en máquinas a un icono específico
   * de Material Design para mejorar la visualización en la interfaz.
   * 
   * @param type - Tipo de movimiento (START, STOP, PAUSE, CONFIG, MAINTENANCE)
   * @returns Nombre del icono de Material Design
   * 
   * Iconos por tipo de movimiento:
   * - START: play_arrow (flecha de reproducir - inicio)
   * - STOP: stop (cuadrado de parada)
   * - PAUSE: pause (barras de pausa)
   * - CONFIG: settings (engranaje de configuración)
   * - MAINTENANCE: build (martillo de mantenimiento)
   * - Otros: swap_horiz (flechas horizontales por defecto)
   */
  getMovementIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'START': 'play_arrow',      // Icono de inicio/reproducir
      'STOP': 'stop',             // Icono de parada
      'PAUSE': 'pause',           // Icono de pausa
      'CONFIG': 'settings',       // Icono de configuración
      'MAINTENANCE': 'build'      // Icono de mantenimiento/herramientas
    };
    return icons[type] || 'swap_horiz';  // Retornar icono específico o swap_horiz por defecto
  }

  /**
   * getMovementTypeLabel - Obtener etiqueta legible para tipo de movimiento
   * 
   * Convierte el tipo técnico de movimiento en una etiqueta legible
   * en español para mostrar en la interfaz de usuario.
   * 
   * @param type - Tipo técnico del movimiento (START, STOP, PAUSE, etc.)
   * @returns Etiqueta legible en español
   * 
   * Tipos de movimiento:
   * - START: Inicio de operación en máquina
   * - STOP: Parada completa de máquina
   * - PAUSE: Pausa temporal de operación
   * - CONFIG: Cambio de configuración
   * - MAINTENANCE: Mantenimiento preventivo o correctivo
   */
  getMovementTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'START': 'Inicio',              // Inicio de operación
      'STOP': 'Parada',               // Parada de máquina
      'PAUSE': 'Pausa',               // Pausa temporal
      'CONFIG': 'Configuración',      // Cambio de configuración
      'MAINTENANCE': 'Mantenimiento'  // Mantenimiento
    };
    return labels[type] || type;  // Retornar etiqueta o tipo original
  }

  // ============================================================================
  // MÉTODOS DE BACKUPS - Gestión de respaldos de datos
  // ============================================================================
  
  /**
   * loadAvailableBackups - Cargar lista de backups disponibles
   * 
   * Obtiene del backend la lista de todos los backups de datos de máquinas
   * disponibles para consulta. Los backups permiten acceder a datos históricos
   * que ya no están en la base de datos principal.
   * 
   * TODO: Implementar llamada real a la API de backups
   * 
   * Implementación futura:
   * - GET /api/backups/machines
   * - Filtrar por fecha, validez, tamaño
   * - Ordenar por fecha de creación (más recientes primero)
   * - Mostrar información de integridad y validación
   * 
   * Actualmente inicializa con array vacío hasta implementar el backend
   */
  loadAvailableBackups() {
    // TODO: Implementar llamada real al backend
    // Ejemplo de implementación futura:
    // this.http.get<MachineBackup[]>(`${environment.apiUrl}/backups/machines`).subscribe({
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
      this.availableBackups.set([]);  // Array vacío hasta implementar API
    }, 500);  // Delay de 500ms para simular latencia
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
   * formatFileSize - Formatear tamaño de archivo en formato legible
   * 
   * Convierte un tamaño en bytes a una representación legible con
   * la unidad apropiada (Bytes, KB, MB, GB).
   * 
   * @param bytes - Tamaño del archivo en bytes
   * @returns String formateado con tamaño y unidad
   * 
   * Ejemplos:
   * - formatFileSize(0) => "0 Bytes"
   * - formatFileSize(1024) => "1 KB"
   * - formatFileSize(1048576) => "1 MB"
   * - formatFileSize(1536) => "1.5 KB"
   * - formatFileSize(5242880) => "5 MB"
   * 
   * Algoritmo:
   * 1. Si es 0, retornar "0 Bytes"
   * 2. Calcular el índice de la unidad usando logaritmo base 1024
   * 3. Dividir bytes por 1024^índice
   * 4. Redondear a 2 decimales
   * 5. Concatenar con la unidad correspondiente
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';  // Caso especial para 0 bytes
    
    const k = 1024;                                    // Base de conversión (1 KB = 1024 bytes)
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];         // Array de unidades disponibles
    const i = Math.floor(Math.log(bytes) / Math.log(k)); // Calcular índice de unidad apropiada
    
    // Calcular valor dividiendo por 1024^i, redondear a 2 decimales y concatenar unidad
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * createManualBackup - Crear backup manual de datos de máquinas
   * 
   * Permite al usuario crear un backup manual de todos los datos de programación
   * de máquinas en el momento actual. Útil para:
   * - Respaldos antes de cambios importantes
   * - Auditorías y cumplimiento normativo
   * - Análisis histórico de datos
   * - Recuperación ante desastres
   * 
   * Flujo de ejecución:
   * 1. Activa indicador de carga
   * 2. Genera un ID único para el backup con timestamp
   * 3. Crea objeto MachineBackup con datos simulados
   * 4. Agrega el nuevo backup al inicio de la lista
   * 5. Actualiza la señal de backups disponibles
   * 6. Muestra notificación de éxito
   * 
   * TODO: Implementar llamada real al backend
   * POST /api/backups/machines/create
   * 
   * Actualmente genera datos simulados para demostración
   */
  createManualBackup() {
    this.machineLoading.set(true);  // Activar indicador de carga
    
    // Simular delay de creación de backup (2 segundos)
    setTimeout(() => {
      // Crear objeto de backup con datos simulados
      const newBackup: MachineBackup = {
        // Generar ID único: backup_20241110153045_manual
        // - Usa timestamp ISO sin caracteres especiales
        // - Sufijo "_manual" para identificar backups manuales
        backupId: `backup_${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}_manual`,
        
        // Descripción legible con fecha y hora
        description: `Backup manual - ${new Date().toLocaleString()}`,
        
        // Fecha de creación (ahora)
        createdAt: new Date(),
        
        // Cantidad de registros (simulado: entre 100 y 300)
        totalRecords: Math.floor(Math.random() * 200) + 100,
        
        // Tamaño del backup en bytes (simulado: entre 1MB y 6MB)
        backupSize: Math.floor(Math.random() * 5000000) + 1000000,
        
        // Cantidad de máquinas incluidas (fijo: 12 máquinas)
        machineCount: 12,
        
        // Backup válido y listo para usar
        isValid: true
      };

      // Agregar nuevo backup al inicio de la lista (más reciente primero)
      const currentBackups = this.availableBackups();           // Obtener lista actual
      this.availableBackups.set([newBackup, ...currentBackups]); // Agregar al inicio
      
      this.machineLoading.set(false);  // Desactivar indicador de carga

      // Mostrar notificación de éxito
      this.snackBar.open('Backup manual creado exitosamente', 'Cerrar', {
        duration: 3000,                    // Duración de 3 segundos
        panelClass: ['success-snackbar']   // Clase CSS para estilo de éxito (verde)
      });
    }, 2000);  // Delay de 2 segundos para simular proceso de backup
  }
}  // Fin de la clase ReportsComponent