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
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core'; // Adaptador de fechas nativo
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; // Notificaciones toast
import { MatAutocompleteModule } from '@angular/material/autocomplete'; // Autocompletado de inputs
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Indicador de carga circular
import { MatTabsModule } from '@angular/material/tabs';           // Pestañas de navegación
import { MatChipsModule } from '@angular/material/chips';         // Chips/badges informativos
import { MatDatepickerInputEvent } from '@angular/material/datepicker'; // Evento de cambio de fecha

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

// Interfaces de máquinas eliminadas - Solo se mantiene reporte de actividades de usuario

// ============================================================================
// FORMATO DE FECHA PERSONALIZADO - dd/mm/aaaa
// ============================================================================
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// ============================================================================
// COMPONENTE PRINCIPAL - ReportsComponent
// ============================================================================

/**
 * ReportsComponent - Componente de reportes y análisis de actividades
 * 
 * Funcionalidades principales:
 * - Consulta de actividades de usuarios por código y rango de fechas
 * - Exportación de reportes a PDF
 * - Visualización de estadísticas y métricas
 * - Filtrado por módulo y rango de fechas
 * 
 * El componente muestra:
 * - Actividades de Usuario: Todas las acciones realizadas por un usuario en el sistema
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
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
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

  // --- Formularios Reactivos ---
  // FormGroup permite agrupar controles de formulario con validación
  searchForm: FormGroup;                                 // Formulario para búsqueda de actividades de usuario

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
  }

  // ============================================================================
  // MÉTODOS DE CARGA DE DATOS - Obtención de información desde el backend
  // ============================================================================
  
  /**
   * loadAvailableUsers - Método eliminado
   * 
   * Ya no se necesita cargar la lista de usuarios porque ahora el usuario
   * ingresa directamente el código en un campo de texto.
   * 
   * Este método se mantiene vacío para evitar errores si se llama desde ngOnInit,
   * pero no realiza ninguna acción.
   */
  loadAvailableUsers() {
    // Método vacío - Ya no se carga lista de usuarios
    // El usuario ingresa el código directamente en el input
    console.log('ℹ️ Carga de usuarios deshabilitada - Se usa input de texto directo');
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

    // ===== PRIMERO: BUSCAR INFORMACIÓN DEL USUARIO EN LA BD =====
    // Hacer una llamada a la API para obtener la información completa del usuario
    // Esto valida que el usuario existe y obtiene sus datos completos (nombre, foto, email, etc.)
    console.log('🔍 Buscando información del usuario:', searchUserCode);
    
    // Llamada a la API para obtener el usuario por código
    // GET /api/users/code/{userCode} - Endpoint que busca usuario por código
    this.http.get<User>(`${environment.apiUrl}/users/code/${searchUserCode}`).subscribe({
      // next: Se ejecuta cuando la petición es exitosa
      next: (user) => {
        // Usuario encontrado exitosamente en la base de datos
        console.log('✅ Usuario encontrado en la BD:', user);
        
        // Continuar con la búsqueda de actividades usando los datos reales del usuario
        this.fetchUserActivities(user, formValue);
      },
      // error: Se ejecuta cuando hay un error (usuario no existe, error de red, etc.)
      error: (error) => {
        // Desactivar indicador de carga
        this.loading.set(false);
        
        // Determinar el mensaje de error según el código de estado HTTP
        let errorMessage = `Usuario "${searchUserCode}" no encontrado`;
        
        // Si el error es 404, el usuario no existe
        if (error.status === 404) {
          errorMessage = `Usuario "${searchUserCode}" no existe en la base de datos`;
        } 
        // Si el error es 500, hay un problema en el servidor
        else if (error.status === 500) {
          errorMessage = 'Error del servidor al buscar el usuario';
        }
        // Otros errores (401, 403, etc.)
        else if (error.status) {
          errorMessage = `Error ${error.status}: ${error.statusText}`;
        }
        
        // Mostrar notificación de error al usuario
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        
        // Registrar error en consola para debugging
        console.error('❌ Error buscando usuario:', error);
      }
    });
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

  /**
   * fetchUserActivities - Buscar actividades del usuario en la API
   * 
   * Método auxiliar que realiza la búsqueda de actividades una vez que
   * se ha validado que el usuario existe en la base de datos.
   * 
   * @param user - Objeto User con la información completa del usuario
   * @param formValue - Valores del formulario (fechas, módulo, etc.)
   */
  private fetchUserActivities(user: User, formValue: any) {
    // Construir los parámetros de la petición HTTP
    // startDate: Fecha de inicio del rango de búsqueda (formato ISO)
    // endDate: Fecha de fin del rango de búsqueda (formato ISO)
    // module: Módulo específico a filtrar (opcional)
    const params: any = {};
    
    // Si hay fecha de inicio, agregarla a los parámetros
    if (formValue.startDate) {
      params.startDate = formValue.startDate.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
    }
    
    // Si hay fecha de fin, agregarla a los parámetros
    if (formValue.endDate) {
      params.endDate = formValue.endDate.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
    }
    
    // Si hay módulo seleccionado y no es 'ALL', agregarlo a los parámetros
    if (formValue.module && formValue.module !== 'ALL') {
      params.module = formValue.module;
    }
    
    // Registrar en consola los parámetros de búsqueda
    console.log('📊 Parámetros de búsqueda:', params);
    
    // Llamada a la API para obtener las actividades del usuario
    // GET /api/reports/user-activities/{userCode}?startDate=...&endDate=...&module=...
    this.http.get<any>(`${environment.apiUrl}/reports/user-activities/${user.userCode}`, { params }).subscribe({
      // next: Se ejecuta cuando la petición es exitosa
      next: (response) => {
        // Registrar respuesta en consola
        console.log('📦 Actividades recibidas:', response);
        
        // Extraer las actividades de la respuesta
        // La respuesta puede ser un array directo o un objeto con propiedad 'data'
        const activities = Array.isArray(response) ? response : (response.data || []);
        
        // Registrar cantidad de actividades encontradas
        console.log('✅ Total de actividades:', activities.length);
        
        // Construir objeto UserReport con los datos reales
        const report: UserReport = {
          user,                                              // Usuario encontrado en la BD
          activities,                                        // Array de actividades REALES
          totalActivities: activities.length,                // Total de actividades encontradas
          moduleBreakdown: this.calculateModuleBreakdown(activities),  // Desglose por módulo
          dateRange: {  // Rango de fechas del reporte
            start: formValue.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),  // Fecha inicio
            end: formValue.endDate || new Date()            // Fecha fin
          }
        };
        
        // Actualizar señal con el reporte completo
        this.searchResults.set(report);
        
        // Desactivar indicador de carga
        this.loading.set(false);
        
        // Mostrar notificación de éxito
        this.snackBar.open(
          `Se encontraron ${activities.length} actividades para ${user.userCode}`,
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      // error: Se ejecuta cuando hay un error al buscar actividades
      error: (error) => {
        // Desactivar indicador de carga
        this.loading.set(false);
        
        // Mostrar notificación de error
        this.snackBar.open(
          'Error al buscar actividades del usuario',
          'Cerrar',
          { duration: 5000 }
        );
        
        // Registrar error en consola
        console.error('❌ Error buscando actividades:', error);
      }
    });
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
   * - ALL: apps (icono de todos los módulos)
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
      'ALL': 'apps',                          // Icono para todos los módulos
      'AUTH': 'login',                        // Icono para autenticación
      'PROFILE': 'person',                    // Icono para perfil de usuario
      'MACHINES': 'precision_manufacturing',  // Icono para máquinas
      'DESIGN': 'design_services',            // Icono para diseño
      'REPORTS': 'assessment',                // Icono para reportes
      'SETTINGS': 'settings'                  // Icono para configuraciones
    };
    return icons[module] || 'info';  // Retornar icono específico o 'info' por defecto
  }

  // Método displayUserCode eliminado - Ya no se usa autocomplete, ahora es un select con usuarios REALES

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
   * onDateChange - Manejar cambio de fecha
   * 
   * Se ejecuta cuando el usuario selecciona una fecha del datepicker
   * 
   * @param type - Tipo de fecha ('start' o 'end')
   * @param event - Evento del datepicker con la fecha seleccionada
   */
  onDateChange(type: 'start' | 'end', event: MatDatepickerInputEvent<Date>) {
    // El valor ya se actualiza automáticamente en el formulario
    // Este método está disponible para validaciones adicionales si se necesitan
    if (event.value) {
      console.log(`Fecha ${type} seleccionada:`, event.value);
    }
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

  /**
   * getUserProfileImage - Obtener URL completa de la imagen de perfil
   * 
   * Maneja tanto URLs completas (http/https) como rutas relativas del servidor.
   * Si la imagen es una ruta relativa (ej: /uploads/profiles/...), 
   * se le agrega la URL base del API.
   * 
   * @param profileImage - URL o ruta de la imagen de perfil
   * @returns URL completa de la imagen o null si no hay imagen
   */
  getUserProfileImage(profileImage?: string): string | null {
    if (!profileImage) {
      return null;
    }

    // Si es el indicador de imagen grande, no mostrar
    if (profileImage === 'large_image_available') {
      return null;
    }

    // Si ya es una URL completa (http/https), retornarla tal cual
    if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
      return profileImage;
    }

    // Si es base64, retornarla tal cual
    if (profileImage.startsWith('data:image/')) {
      return profileImage;
    }

    // Si es una ruta relativa, agregar la URL base del API
    // Nota: environment.apiUrl ya incluye '/api', así que quitamos '/api' si viene en la ruta
    const cleanPath = profileImage.startsWith('/api/') ? profileImage.substring(4) : profileImage;
    const separator = cleanPath.startsWith('/') ? '' : '/';
    
    return `${environment.apiUrl}${separator}${cleanPath}`;
  }

  /**
   * handleImageError - Manejar error al cargar imagen de perfil
   * 
   * Oculta la imagen y muestra el icono por defecto cuando falla la carga
   * 
   * @param event - Evento de error de la imagen
   */
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    console.warn('Error al cargar imagen de perfil, mostrando icono por defecto');
  }
}
