// ============================================================================
// IMPORTS - Módulos y servicios necesarios
// ============================================================================

// Angular Core
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

// Formularios Reactivos
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Servicios
import { User } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TimeFormatService } from '../../../core/services/time-format.service';

// jsPDF para generación de PDFs
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    ReactiveFormsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss', './reports-fix.scss']
})
export class ReportsComponent implements OnInit {
  // ============================================================================
  // PROPIEDADES - Estado del componente
  // ============================================================================

  loading = signal<boolean>(false);                    // Indicador de carga
  searchResults = signal<UserReport | null>(null);     // Resultados de búsqueda
  searchForm: FormGroup;                               // Formulario de búsqueda

  // Opciones de módulos para el filtro
  moduleOptions = [
    { value: 'ALL', label: 'Todos los módulos' },
    { value: 'AUTH', label: 'Autenticación' },
    { value: 'PROFILE', label: 'Perfil' },
    { value: 'MACHINES', label: 'Máquinas' },
    { value: 'DESIGN', label: 'Diseño' },
    { value: 'REPORTS', label: 'Reportes' },
    { value: 'SETTINGS', label: 'Configuraciones' }
  ];

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    public timeFormatService: TimeFormatService
  ) {
    // Inicializar formulario de búsqueda
    this.searchForm = this.fb.group({
      userCode: ['', [Validators.required]],  // Código de usuario (requerido)
      startDate: [''],                        // Fecha inicio (opcional)
      endDate: [''],                          // Fecha fin (opcional)
      module: ['ALL']                         // Módulo (por defecto: todos)
    });
  }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnInit() {
    // No se requiere inicialización adicional
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
   * exportToPDF - Exportar reporte de actividades a archivo PDF optimizado y compacto
   * 
   * Genera un archivo PDF profesional con el reporte completo de actividades del usuario
   * usando la librería jsPDF y jspdf-autotable para tablas formateadas.
   * 
   * Optimizaciones aplicadas:
   * - Diseño compacto con márgenes reducidos
   * - Información del usuario y estadísticas en dos columnas
   * - Tabla de actividades con más filas por página
   * - Fuentes más pequeñas pero legibles
   * - Distribución uniforme del espacio
   */
  exportToPDF() {
    const report = this.searchResults();
    if (!report) return;

    this.loading.set(true);

    try {
      // Crear nuevo documento PDF en formato A4
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15; // Margen reducido de 15mm
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // ===== ENCABEZADO COMPACTO =====
      doc.setFontSize(16); // Tamaño reducido
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE ACTIVIDADES DE USUARIO', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 6; // Espacio reducido
      
      // Línea decorativa más delgada
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      
      yPosition += 8; // Espacio reducido

      // ===== INFORMACIÓN EN DOS COLUMNAS (Usuario + Período) =====
      const col1X = margin;
      const col2X = pageWidth / 2 + 5;
      const startY = yPosition;

      // COLUMNA 1: Información del Usuario
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Información del Usuario', col1X, yPosition);
      
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Nombre: ${report.user.firstName} ${report.user.lastName}`, col1X, yPosition);
      yPosition += 4;
      doc.text(`Código: ${report.user.userCode}`, col1X, yPosition);
      yPosition += 4;
      doc.text(`Email: ${report.user.email}`, col1X, yPosition);
      yPosition += 4;
      
      // Agregar teléfono si existe
      if (report.user.phone) {
        doc.text(`Teléfono: ${report.user.phone}`, col1X, yPosition);
        yPosition += 4;
      }
      
      doc.text(`Rol: ${this.getRoleDisplayName(report.user.role || '')}`, col1X, yPosition);

      // COLUMNA 2: Período y Estadísticas (resetear yPosition)
      yPosition = startY;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Período del Reporte', col2X, yPosition);
      
      yPosition += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Desde: ${this.timeFormatService.formatDate(report.dateRange.start)}`, col2X, yPosition);
      yPosition += 4;
      doc.text(`Hasta: ${this.timeFormatService.formatDate(report.dateRange.end)}`, col2X, yPosition);
      yPosition += 4;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${report.totalActivities} actividades`, col2X, yPosition);
      
      // Ajustar yPosition al máximo de ambas columnas (considerando si hay teléfono o no)
      yPosition = startY + (report.user.phone ? 25 : 21);

      // ===== DESGLOSE POR MÓDULO EN LÍNEA HORIZONTAL =====
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Distribución por Módulo:', margin, yPosition);
      
      yPosition += 4;
      
      // Crear texto compacto con todos los módulos en una línea
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const moduleText = Object.entries(report.moduleBreakdown)
        .map(([module, count]) => `${this.getModuleLabel(module)}: ${count}`)
        .join('  •  ');
      
      // Dividir en múltiples líneas si es muy largo
      const splitText = doc.splitTextToSize(moduleText, contentWidth);
      doc.text(splitText, margin, yPosition);
      yPosition += (splitText.length * 3) + 3;

      // ===== TABLA DE ACTIVIDADES OPTIMIZADA =====
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Detalle de Actividades', margin, yPosition);
      
      yPosition += 4;

      // Preparar datos para la tabla con descripciones más largas
      const tableData = report.activities.map((activity, index) => [
        (index + 1).toString(),
        this.timeFormatService.formatDate(new Date(activity.timestamp)) + '\n' + 
        this.timeFormatService.formatTime(new Date(activity.timestamp)),
        this.getModuleLabel(activity.module),
        activity.action,
        activity.description.length > 60 ? activity.description.substring(0, 57) + '...' : activity.description
      ]);

      // Generar tabla compacta con autoTable
      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Fecha/Hora', 'Módulo', 'Acción', 'Descripción']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 2
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 28, fontSize: 6.5 },
          2: { cellWidth: 22, fontSize: 7 },
          3: { cellWidth: 30, fontSize: 7 },
          4: { cellWidth: 82, fontSize: 7 }
        },
        margin: { left: margin, right: margin },
        rowPageBreak: 'avoid',
        didDrawPage: (data: any) => {
          // Encabezado en cada página (excepto la primera)
          if (data.pageNumber > 1) {
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'italic');
            doc.text(
              `Reporte de ${report.user.userCode} - Continuación`,
              margin,
              10
            );
          }

          // Pie de página en cada página
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(7);
          doc.setTextColor(128, 128, 128);
          doc.setFont('helvetica', 'normal');
          
          // Número de página
          doc.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' }
          );
          
          // Fecha de generación (solo en la primera página)
          if (data.pageNumber === 1) {
            doc.setFontSize(6);
            doc.text(
              `Generado: ${this.timeFormatService.formatDate(new Date())} ${this.timeFormatService.formatTime(new Date())}`,
              pageWidth - margin,
              pageHeight - 8,
              { align: 'right' }
            );
          }
        }
      });

      // ===== PIE DE PÁGINA FINAL (solo en última página) =====
      const finalY = (doc as any).lastAutoTable.finalY + 5;
      if (finalY < pageHeight - 20) {
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text('Sistema FlexoAPP - Gestión Flexográfica', pageWidth / 2, finalY, { align: 'center' });
      }

      // ===== GUARDAR PDF =====
      const fileName = `reporte_${report.user.userCode}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      this.loading.set(false);
      this.snackBar.open(`✅ PDF generado: ${fileName}`, 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      this.loading.set(false);
      this.snackBar.open('❌ Error al generar el PDF', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  /**
   * clearResults - Limpiar resultados y resetear formulario
   */
  clearResults() {
    this.searchResults.set(null);
    this.searchForm.reset();
    this.searchForm.patchValue({ module: 'ALL' });
  }

  /**
   * getModuleLabel - Obtener etiqueta legible del módulo
   */
  getModuleLabel(moduleValue: string): string {
    const module = this.moduleOptions.find(m => m.value === moduleValue);
    return module ? module.label : moduleValue;
  }

  /**
   * getModuleIcon - Obtener icono de Material Design para el módulo
   */
  getModuleIcon(module: string): string {
    const icons: { [key: string]: string } = {
      'ALL': 'apps',
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
   * getDefaultStartDate - Fecha de inicio por defecto (30 días atrás)
   */
  getDefaultStartDate(): Date {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  /**
   * getDefaultEndDate - Fecha de fin por defecto (hoy)
   */
  getDefaultEndDate(): Date {
    return new Date();
  }

  /**
   * onDateChange - Manejar cambio de fecha en el datepicker
   */
  onDateChange(type: 'start' | 'end', event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      console.log(`Fecha ${type} seleccionada:`, event.value);
    }
  }

  /**
   * getRoleDisplayName - Obtener nombre legible del rol
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
   * getUserProfileImage - Obtener URL completa de la imagen de perfil
   */
  getUserProfileImage(profileImage?: string): string | null {
    if (!profileImage || profileImage === 'large_image_available') {
      return null;
    }

    if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
      return profileImage;
    }

    if (profileImage.startsWith('data:image/')) {
      return profileImage;
    }

    const cleanPath = profileImage.startsWith('/api/') ? profileImage.substring(4) : profileImage;
    const separator = cleanPath.startsWith('/') ? '' : '/';

    return `${environment.apiUrl}${separator}${cleanPath}`;
  }

  /**
   * handleImageError - Manejar error al cargar imagen de perfil
   */
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    console.warn('Error al cargar imagen de perfil, mostrando icono por defecto');
  }
}
