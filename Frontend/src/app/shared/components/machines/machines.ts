// Importaciones de Angular Core - Funcionalidades básicas del framework
import { Component, OnInit, signal, computed, inject } from '@angular/core';
// Módulo común de Angular - Directivas básicas como *ngFor, *ngIf
import { CommonModule } from '@angular/common';
// Módulos de Angular Material - Componentes de UI
import { MatButtonModule } from '@angular/material/button'; // Botones Material
import { MatIconModule } from '@angular/material/icon'; // Iconos Material
import { MatTableModule } from '@angular/material/table'; // Tablas Material
import { MatFormFieldModule } from '@angular/material/form-field'; // Campos de formulario
import { MatInputModule } from '@angular/material/input'; // Inputs de texto
import { MatTooltipModule } from '@angular/material/tooltip'; // Tooltips informativos
import { MatCardModule } from '@angular/material/card'; // Tarjetas Material
import { MatTabsModule } from '@angular/material/tabs'; // Pestañas Material
import { MatChipsModule } from '@angular/material/chips'; // Chips Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Spinner de carga
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Notificaciones toast
// Módulo de formularios reactivos de Angular
import { FormsModule } from '@angular/forms';
// Cliente HTTP para comunicación con el backend
import { HttpClient } from '@angular/common/http';
// Utilidad para convertir Observables a Promises
import { firstValueFrom } from 'rxjs';
// Configuración del entorno (URLs del API, etc.)
import { environment } from '../../../../environments/environment';
// Servicio de autenticación personalizado
import { AuthService } from '../../../core/services/auth.service';
// Importar MatDialog para abrir diálogos modales
import { MatDialog } from '@angular/material/dialog';
// Importar MatSnackBar para notificaciones toast
import { MatSnackBar } from '@angular/material/snack-bar';

// Interfaz que define la estructura de un registro de máquina desde la tabla 'maquinas'
interface MachineProgram {
  id?: number; // ID único del registro (opcional, asignado por la base de datos)
  numeroMaquina: number; // Número de la máquina (11-21) - Campo principal para identificar máquina
  articulo: string; // Código del artículo a producir (ej: F204567)
  otSap: string; // Número de orden de trabajo SAP (ej: OT123456)
  cliente: string; // Nombre del cliente (ej: ABSORBENTES DE COLOMBIA S.A)
  referencia: string; // Referencia del producto (ej: REF-001)
  td: string; // Código TD (Tipo de Diseño) (ej: TD-ABC)
  numeroColores: number; // Número total de colores utilizados en la impresión
  colores: string[]; // Array de colores para la impresión (ej: ['CYAN', 'MAGENTA', 'AMARILLO'])
  kilos: number; // Cantidad en kilogramos a producir
  fechaTintaEnMaquina: Date; // Fecha y hora cuando se aplicó la tinta en la máquina (formato dd/mm/aaaa: hora)
  sustrato: string; // Tipo de material base (ej: BOPP, PE, PET)
  estado: 'SIN_ASIGNAR' | 'PREPARANDO' | 'LISTO' | 'SUSPENDIDO' | 'CORRIENDO' | 'TERMINADO'; // Estado actual del programa - SIN_ASIGNAR = Programa nuevo sin acción del operario
  observaciones?: string; // Observaciones adicionales (opcional)
  lastActionBy?: string; // Usuario que realizó la última acción (opcional)
  lastActionAt?: Date; // Fecha de la última acción (opcional)
  // Campos adicionales para compatibilidad con el sistema existente
  machineNumber: number; // Alias para numeroMaquina para compatibilidad
}

// Interfaz que define los permisos del usuario en el módulo
interface UserPermissions {
  canLoadExcel: boolean; // Permiso para cargar archivos Excel
  canDownloadTemplate: boolean; // Permiso para descargar plantillas
  canViewFF459: boolean; // Permiso para ver formato FF459
  canClearPrograms: boolean; // Permiso para limpiar programación
}

// Interfaz que define las estadísticas de una máquina
interface MachineStats {
  totalPrograms: number; // Total de programas asignados
  readyPrograms: number; // Programas en estado LISTO
  runningPrograms: number; // Programas en estado CORRIENDO
  suspendedPrograms: number; // Programas en estado SUSPENDIDO
  completedPrograms: number; // Programas en estado TERMINADO
}

// Decorador de componente Angular - Define metadatos del componente
@Component({
  selector: 'app-machines', // Selector HTML para usar el componente
  standalone: true, // Componente independiente (no requiere módulo)
  imports: [ // Módulos importados que el componente necesita
    CommonModule, // Directivas básicas de Angular
    MatButtonModule, // Botones de Material Design
    MatIconModule, // Iconos de Material Design
    MatTableModule, // Tablas de Material Design
    MatFormFieldModule, // Campos de formulario de Material
    MatInputModule, // Inputs de Material Design
    MatTooltipModule, // Tooltips de Material Design
    MatCardModule, // Tarjetas de Material Design
    MatTabsModule, // Pestañas de Material Design
    MatChipsModule, // Chips de Material Design
    MatProgressSpinnerModule, // Spinner de carga de Material
    MatSnackBarModule, // Notificaciones toast de Material
    FormsModule // Formularios de Angular
  ],
  templateUrl: './machines.html', // Archivo de plantilla HTML
  styleUrls: ['./machines.scss'] // Archivo de estilos SCSS
})
export class MachinesComponent implements OnInit {
  // Inyección de dependencias usando la nueva sintaxis inject()
  private http = inject(HttpClient); // Cliente HTTP para llamadas al API
  private authService = inject(AuthService); // Servicio de autenticación
  private snackBar = inject(MatSnackBar); // Servicio de notificaciones toast
  
  // Señales reactivas de Angular - Estado reactivo del componente
  loading = signal(false); // Estado de carga (true/false)
  selectedMachineNumber = signal<number | null>(null); // Número de máquina seleccionada
  programs = signal<MachineProgram[]>([]); // Array de programas cargados
  expandedColors = signal<Set<string>>(new Set()); // Set de IDs de dropdowns de colores expandidos
  
  // Estado del diálogo de suspensión - Variables para el modal de suspender programa
  showSuspendDialog = false; // Controla la visibilidad del diálogo
  currentProgramToSuspend: MachineProgram | null = null; // Programa que se va a suspender
  suspendReason = ''; // Motivo de la suspensión ingresado por el usuario
  
  // Configuración estática del componente
  machineNumbers = Array.from({ length: 11 }, (_, i) => i + 11); // Genera array [11, 12, 13, ..., 21]
  programDisplayedColumns = [ // Columnas que se muestran en la tabla de programación según especificaciones
    'articulo',               // Código del artículo (ej: F204567)
    'otSap',                 // Orden de trabajo SAP
    'cliente',               // Nombre del cliente
    'referencia',            // Referencia del producto
    'td',                    // Código TD (Tipo de Diseño)
    'numeroColores',         // Número de colores
    'colores',               // Botón desplegable con paleta de colores
    'kilos',                 // Cantidad en kilogramos
    'fechaTintaEnMaquina',   // Fecha de tinta en máquina (dd/mm/aaaa: hora)
    'sustrato',              // Tipo de sustrato/material
    'estado',                // Estado actual del programa
    'acciones'               // Botones de acción para cambiar estado
  ];

  // Permisos del usuario calculados reactivamente
  userPermissions = computed((): UserPermissions => ({
    canLoadExcel: true, // Permitir carga de Excel
    canDownloadTemplate: false, // No permitir descarga de plantilla
    canViewFF459: false, // No permitir ver formato FF459
    canClearPrograms: false // No permitir limpiar programación
  }));
  
  // Propiedades computadas - Se recalculan automáticamente cuando cambian las dependencias
  
  // Programas de la máquina seleccionada - Filtra programas por número de máquina y ordena por fecha/hora ascendente
  selectedMachinePrograms = computed(() => {
    const selected = this.selectedMachineNumber(); // Obtiene el número de máquina seleccionada
    if (!selected) return []; // Si no hay máquina seleccionada, retorna array vacío
    // Filtra todos los programas para obtener solo los de la máquina seleccionada
    const filtered = this.programs().filter(p => p.machineNumber === selected);
    // Ordena por fecha y hora ascendente (más cercana primero)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.fechaTintaEnMaquina).getTime(); // Convierte fecha A a timestamp
      const dateB = new Date(b.fechaTintaEnMaquina).getTime(); // Convierte fecha B a timestamp
      return dateA - dateB; // Orden ascendente: fecha más cercana primero
    });
  });

  // Estadísticas calculadas de la máquina seleccionada - ACTUALIZADO CON NUEVOS ESTADOS
  selectedMachineStats = computed((): MachineStats => {
    const programs = this.selectedMachinePrograms(); // Obtiene programas de la máquina seleccionada
    return {
      totalPrograms: programs.length, // Cuenta total de programas
      // Cuenta programas por estado usando filter - NUEVOS ESTADOS
      readyPrograms: programs.filter(p => p.estado === 'LISTO' || p.estado === 'PREPARANDO' || p.estado === 'SIN_ASIGNAR').length, // Listo + Preparando + Sin Asignar
      runningPrograms: programs.filter(p => p.estado === 'CORRIENDO').length, // Corriendo
      suspendedPrograms: programs.filter(p => p.estado === 'SUSPENDIDO').length, // Suspendido
      completedPrograms: programs.filter(p => p.estado === 'TERMINADO').length // Terminado
    };
  });

  // Método del ciclo de vida de Angular - Se ejecuta después de la inicialización del componente
  ngOnInit() {
    console.log('🚀 Inicializando módulo de máquinas...'); // Log de inicio
    console.log('🏭 Máquinas disponibles:', this.machineNumbers); // Log de máquinas disponibles
    
    // Cargar programas desde la base de datos al inicializar
    this.loadPrograms();
    
    // Seleccionar automáticamente la primera máquina disponible
    if (this.machineNumbers.length > 0) {
      console.log('🎯 Seleccionando máquina por defecto:', this.machineNumbers[0]); // Log de selección
      this.selectMachine(this.machineNumbers[0]); // Selecciona la primera máquina
    }
  }

  // ===== MÉTODO PARA CARGAR DATOS DE MÁQUINAS DESDE LA BASE DE DATOS =====
  // Método asíncrono que se conecta con el endpoint GET api/maquinas del backend
  // Este endpoint consulta la tabla machine_programs de la base de datos flexoapp_bd
  // Retorna todos los programas de máquinas ordenados por fecha de tinta más reciente
  async loadPrograms() {
    this.loading.set(true); // Activar indicador de carga en la UI para mostrar spinner
    try {
      // ===== VERIFICACIÓN DE AUTENTICACIÓN =====
      // Verificar si el usuario está autenticado antes de hacer la petición al backend
      if (!this.authService.isLoggedIn()) {
        // Si no está autenticado, redirigir a la página de login
        window.location.href = '/login';
        return; // Salir del método para evitar peticiones no autorizadas
      }

      // ===== LOG DE INICIO DE CARGA =====
      // Registrar en consola la URL del endpoint que se va a consultar
      console.log('🔄 Cargando datos de máquinas desde tabla "machine_programs" (alias: maquinas):', `${environment.apiUrl}/maquinas`);
      
      // ===== PETICIÓN HTTP GET AL BACKEND =====
      // Realizar petición HTTP GET al endpoint api/maquinas del backend
      // Parámetros de query: orderBy=fechaTintaEnMaquina (ordenar por fecha de tinta)
      //                      order=desc (orden descendente - más reciente primero)
      // El backend consulta la tabla machine_programs y retorna los datos en formato JSON
      const response = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/maquinas?orderBy=fechaTintaEnMaquina&order=desc`));
      
      // ===== LOG DE RESPUESTA DEL SERVIDOR =====
      // Registrar en consola la respuesta completa del backend para debugging
      console.log('📡 Respuesta del servidor (tabla machine_programs):', response);
      console.log('📡 Primer programa del servidor:', response?.data?.[0]);
      
      // ===== VALIDACIÓN DE LA RESPUESTA =====
      // Verificar que la respuesta tenga la estructura esperada: { success: true, data: [...] }
      if (response && response.success && response.data) {
        // ===== MAPEO DE DATOS DEL BACKEND AL FRONTEND =====
        // Transformar los datos del backend al formato que usa el componente frontend
        // Cada registro de la tabla machine_programs se convierte en un objeto MachineProgram
        const programs: MachineProgram[] = response.data.map((program: any) => {
          // ===== PARSEO DE COLORES =====
          // Los colores vienen de la columna JSON 'colores' de la tabla machine_programs
          // Pueden venir como string JSON (ej: '["CYAN","MAGENTA"]') o como array ya parseado
          let colores: string[] = [];
          if (program.colores) {
            try {
              // Si es string JSON, parsearlo a array; si ya es array, usarlo directamente
              colores = typeof program.colores === 'string' 
                ? JSON.parse(program.colores) 
                : program.colores;
            } catch (e) {
              // Si hay error al parsear el JSON, usar array vacío y mostrar warning en consola
              console.warn('⚠️ Error parseando colores para programa:', program.id, e);
              colores = [];
            }
          }

          // ===== CONSTRUCCIÓN DEL OBJETO MachineProgram =====
          // Retornar objeto MachineProgram con todos los campos mapeados desde la base de datos
          // Se usan valores por defecto (|| operador) para campos opcionales que puedan ser null
          
          // ===== GENERACIÓN DE ID =====
          // El backend ahora devuelve el campo 'id' usando 'articulo' como valor
          // Si por alguna razón no viene, usar 'articulo' directamente como fallback
          const programId = program.id || program.articulo || 
            `temp-${program.articulo}-${program.otSap}-${program.numeroMaquina || program.machineNumber || 11}`.replace(/\s+/g, '-');
          
          return {
            // ===== CAMPOS PRINCIPALES DE LA TABLA machine_programs =====
            id: programId, // ID único del registro (articulo es la clave primaria)
            numeroMaquina: program.numeroMaquina || program.machineNumber || 11, // Número de máquina (11-21) - columna machine_number
            articulo: program.articulo || '', // Código del artículo (columna articulo) - vacío si es null
            otSap: program.otSap || '', // Orden de trabajo SAP (columna ot_sap) - vacío si es null
            cliente: program.cliente || '', // Nombre del cliente (columna cliente) - vacío si es null
            referencia: program.referencia || '', // Referencia del producto (columna referencia) - vacío si es null
            td: program.td || '', // Código TD - Tipo de Diseño (columna td) - vacío si es null
            numeroColores: program.numeroColores || colores.length, // Número de colores (columna numero_colores)
            colores: colores, // Array de colores parseado desde la columna JSON 'colores'
            kilos: program.kilos || 0, // Cantidad en kilogramos (columna kilos) - 0 si es null
            fechaTintaEnMaquina: program.fechaTintaEnMaquina ? new Date(program.fechaTintaEnMaquina) : new Date(), // Fecha de tinta (columna fecha_tinta_en_maquina)
            sustrato: program.sustrato || '', // Tipo de material base (columna sustrato) - vacío si es null
            estado: program.estado || 'SIN_ASIGNAR', // Estado del programa - SIN_ASIGNAR si viene vacío (el operario debe asignar)
            observaciones: program.observaciones || '', // Observaciones adicionales (columna observaciones) - vacío si es null
            
            // ===== CAMPOS DE COMPATIBILIDAD =====
            machineNumber: program.numeroMaquina || program.machineNumber || 11, // Alias para numeroMaquina (compatibilidad con código legacy)
            
            // ===== CAMPOS DE AUDITORÍA =====
            // Construir nombre completo del usuario que realizó la última acción
            // Se obtiene de la relación con la tabla users (updated_by_user)
            lastActionBy: program.updatedByUser?.firstName && program.updatedByUser?.lastName 
              ? `${program.updatedByUser.firstName} ${program.updatedByUser.lastName}`.trim()
              : program.lastActionBy || 'Sistema',
            // Convertir fecha de última acción de string ISO a objeto Date
            // Se obtiene de la columna updated_at de la tabla machine_programs
            lastActionAt: program.updatedAt ? new Date(program.updatedAt) : 
                         program.lastActionAt ? new Date(program.lastActionAt) : new Date()
          };
        });
        
        // ===== LOG DE ÉXITO Y ACTUALIZACIÓN DE ESTADO =====
        console.log(`✅ ${programs.length} programas cargados exitosamente desde la base de datos`);
        
        // ===== VERIFICACIÓN DE IDs =====
        // Verificar que todos los programas tengan ID válido
        const programsWithoutId = programs.filter(p => !p.id);
        if (programsWithoutId.length > 0) {
          console.warn(`⚠️ ${programsWithoutId.length} programas sin ID detectados:`, programsWithoutId);
          console.warn('⚠️ Datos originales del primer programa sin ID:', response.data.find((p: any) => !p.id && !p._id && !p.programId));
        }
        
        // Actualizar la señal reactiva 'programs' con los datos cargados
        // Esto dispara automáticamente la actualización de la UI en todos los componentes que usan esta señal
        this.programs.set(programs);
        
        // ===== CÁLCULO DE ESTADÍSTICAS PARA DEBUGGING =====
        // Calcular y mostrar estadísticas en consola para verificar la carga de datos
        const stats = {
          total: programs.length, // Total de programas cargados desde la tabla machine_programs
          // Contar programas por máquina usando reduce - agrupa por machine_number
          porMaquina: programs.reduce((acc, p) => {
            acc[p.machineNumber] = (acc[p.machineNumber] || 0) + 1;
            return acc;
          }, {} as Record<number, number>),
          // Contar programas por estado usando reduce - agrupa por estado (LISTO, CORRIENDO, etc.)
          porEstado: programs.reduce((acc, p) => {
            acc[p.estado] = (acc[p.estado] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
        console.log('📊 Estadísticas de programas cargados:', stats); // Log de estadísticas detalladas
        
      } else {
        // Si la respuesta no tiene la estructura esperada
        console.warn('⚠️ Respuesta del servidor sin datos válidos:', response);
        this.programs.set([]); // Establecer array vacío
      }
    } catch (error: any) {
      console.error('❌ Error cargando programas:', error); // Log del error
      
      // Manejo específico para error 401 (No autorizado/sesión expirada)
      if (error.status === 401) {
        console.log('Sesión expirada. Redirigiendo al login...'); // Notificar al usuario
        window.location.href = '/login'; // Redirigir a login
        return; // Salir del método
      }
      
      // Determinar mensaje de error específico basado en el código de estado HTTP
      let errorMessage = 'Error de conexión con la base de datos'; // Mensaje por defecto
      let technicalDetails = ''; // Detalles técnicos
      
      if (error.status === 0) {
        // Error de red - no se puede conectar al servidor
        errorMessage = 'No se puede conectar al servidor backend';
        technicalDetails = `Verifica que el backend esté ejecutándose en ${environment.apiUrl}`;
      } else if (error.status === 404) {
        // Endpoint no encontrado
        errorMessage = 'Endpoint de API no encontrado';
        technicalDetails = 'El controlador de máquinas no está disponible';
      } else if (error.status === 500) {
        // Error interno del servidor
        errorMessage = 'Error interno del servidor';
        technicalDetails = 'Problema en la base de datos o lógica del servidor';
      } else if (error.name === 'TimeoutError') {
        // Timeout de la petición
        errorMessage = 'Tiempo de espera agotado';
        technicalDetails = 'La consulta a la base de datos tardó demasiado';
      }
      
      // Mostrar detalles completos del error en consola para debugging
      console.error('🔍 Detalles del error:', {
        status: error.status, // Código de estado HTTP
        message: error.message, // Mensaje del error
        url: error.url, // URL que falló
        error: error.error // Objeto de error completo
      });
      
      // Log detallado del error con información técnica
      console.error(`❌ ${errorMessage}`, {
        detallesTecnicos: technicalDetails,
        urlAPI: `${environment.apiUrl}/maquinas`
      });
      
      // Establecer array vacío en caso de error para evitar errores en la UI
      this.programs.set([]);
    } finally {
      // Siempre desactivar el indicador de carga, sin importar si hubo éxito o error
      this.loading.set(false);
    }
  }

  /**
   * Intentar login automático para pruebas
   */
  async tryAutoLogin() {
    try {
      console.log('🔐 Intentando login automático con AuthService...');
      
      // Usar AuthService para login
      const loginData = {
        userCode: 'admin',
        password: 'admin123'
      };
      
      const loginResponse = await firstValueFrom(
        this.authService.login(loginData)
      );
      
      console.log('📡 Respuesta de login:', loginResponse);
      console.log('✅ Login automático exitoso con AuthService');
      console.log('🔑 Usuario autenticado:', this.authService.getCurrentUser());
      
      // Recargar programas ahora que estamos autenticados
      console.log('🔄 Recargando datos de máquinas...');
      await this.loadPrograms();
      
    } catch (loginError: any) {
      console.error('❌ Error en login automático:', loginError);
      
      // Mostrar opciones al usuario
      const userChoice = confirm(`🔐 Autenticación requerida

No se pudo realizar el login automático.

OPCIONES:
✅ ACEPTAR - Ir a la página de login
❌ CANCELAR - Continuar sin conexión

Error: ${loginError.message || 'Error de conexión'}`);
      
      if (userChoice) {
        // Redirigir a login manual
        window.location.href = '/login';
      } else {
        // Log de error sin datos de prueba
        console.error('No se pudo conectar con el servidor. Verifique la conexión.');
      }
    }
  }

  // Método para seleccionar una máquina - Actualiza la señal reactiva
  selectMachine(machineNumber: number) {
    this.selectedMachineNumber.set(machineNumber); // Establece el número de máquina seleccionada
  }

  // Función de tracking para *ngFor - Mejora el rendimiento de la lista de máquinas
  trackByMachineNumber(_: number, machineNumber: number): number {
    return machineNumber; // Retorna el número de máquina como identificador único
  }

  // ===== MÉTODO PARA DETERMINAR LA CLASE CSS DEL LED INDICADOR DE ESTADO =====
  // Determina la clase CSS para el estado visual de una máquina basado en programas listos y preparando
  // Implementa la lógica del indicador LED según especificaciones del usuario
  getMachineStatusClass(machineNumber: number): string {
    // Filtrar programas de la máquina específica por número de máquina
    const machinePrograms = this.programs().filter(p => p.machineNumber === machineNumber);
    
    // Contar programas en estado LISTO, PREPARANDO y SIN_ASIGNAR (todos cuentan como "listos")
    const readyCount = machinePrograms.filter(p => p.estado === 'LISTO' || p.estado === 'PREPARANDO' || p.estado === 'SIN_ASIGNAR').length;
    
    // ===== DETERMINAR CLASE CSS BASADA EN LA CANTIDAD DE PROGRAMAS LISTOS =====
    // Según especificaciones del usuario:
    // 🔴 ROJO (CRÍTICO): 0 a 3 pedidos listos - LED rojo con parpadeo rápido (1s)
    // 🟠 NARANJA (ADVERTENCIA): 3 a 6 pedidos listos - LED naranja con parpadeo medio (1.5s)
    // 🟢 VERDE (ÓPTIMO): 6 o más pedidos listos - LED verde con parpadeo lento (2s)
    
    // Variable para almacenar la clase CSS que se retornará
    let statusClass: string;
    
    if (readyCount >= 6) {
      // 6 o más programas listos: Estado ÓPTIMO
      statusClass = 'machine-status-good';     // Clase para LED verde
    } else if (readyCount >= 3) {
      // 3 a 5 programas listos: Estado de ADVERTENCIA
      statusClass = 'machine-status-warning';  // Clase para LED naranja
    } else {
      // 0 a 2 programas listos: Estado CRÍTICO
      statusClass = 'machine-status-critical'; // Clase para LED rojo
    }
    
    // Log para debugging: muestra el número de máquina, cantidad de programas listos y clase CSS aplicada
    console.log(`🚦 Máquina ${machineNumber}: ${readyCount} programas listos → ${statusClass}`);
    
    // Retornar la clase CSS determinada
    return statusClass;
  }  

  // Genera el texto del tooltip para mostrar información de estado de la máquina
  getMachineStatusTooltip(machineNumber: number): string {
    // Filtrar programas de la máquina específica
    const machinePrograms = this.programs().filter(p => p.machineNumber === machineNumber);
    // Contar programas en estado LISTO, PREPARANDO y SIN_ASIGNAR
    const readyCount = machinePrograms.filter(p => p.estado === 'LISTO' || p.estado === 'PREPARANDO' || p.estado === 'SIN_ASIGNAR').length;
    // Retornar texto descriptivo para el tooltip
    return `Máquina ${machineNumber}: ${readyCount} programas listos/preparando`;
  }

  // Determina si se debe mostrar la tabla de programación
  showProgramTable(): boolean {
    return this.selectedMachineNumber() !== null; // Mostrar solo si hay máquina seleccionada
  }

  // Extrae solo los números de la orden de trabajo SAP (remueve letras y caracteres especiales)
  getNumericOtSap(otSap: string): string {
    return otSap.replace(/\D/g, ''); // Regex que remueve todo lo que no sea dígito
  }

  // Formatea el código TD a mayúsculas para consistencia visual
  formatTdCode(td: string): string {
    return td.toUpperCase(); // Convierte todo el texto a mayúsculas
  }

  // Métodos para manejo del dropdown de colores
  
  // Verifica si el dropdown de colores está expandido para un programa específico
  isColorsExpanded(programId: string): boolean {
    return this.expandedColors().has(programId); // Verifica si el ID está en el Set
  }

  // Función toggleColors eliminada - se usa la versión mejorada más abajo

  // ===== MÉTODO PARA ALTERNAR (TOGGLE) EL DROPDOWN DE COLORES =====
  // Método mejorado que maneja la apertura/cierre del dropdown de colores de un programa
  // Incluye manejo de eventos para evitar propagación y cierre automático al hacer clic fuera
  toggleColors(programId: string, event?: Event) {
    // ===== PREVENIR PROPAGACIÓN DEL EVENTO =====
    // Evitar que el clic se propague a elementos padres que puedan cerrar el dropdown
    if (event) {
      event.stopPropagation(); // Detener la propagación del evento de clic
    }

    // ===== OBTENER ESTADO ACTUAL DEL DROPDOWN =====
    // Crear una copia del Set actual de dropdowns expandidos
    const expanded = new Set(this.expandedColors());
    
    // ===== ALTERNAR ESTADO DEL DROPDOWN =====
    // Si el dropdown está expandido, cerrarlo; si está cerrado, abrirlo
    if (expanded.has(programId)) {
      // El dropdown está abierto, cerrarlo
      expanded.delete(programId); // Remover el ID del Set
      console.log(`🎨 Cerrando dropdown de colores para programa: ${programId}`);
    } else {
      // El dropdown está cerrado, abrirlo
      // IMPORTANTE: Cerrar todos los demás dropdowns antes de abrir este
      // Esto asegura que solo un dropdown esté abierto a la vez
      expanded.clear(); // Limpiar todos los dropdowns abiertos
      expanded.add(programId); // Agregar el nuevo ID al Set
      console.log(`🎨 Abriendo dropdown de colores para programa: ${programId}`);
    }
    
    // ===== ACTUALIZAR ESTADO REACTIVO =====
    // Actualizar la señal reactiva con el nuevo Set (esto dispara la detección de cambios)
    this.expandedColors.set(expanded);
  }

  // ===== MÉTODO PARA CERRAR ESPECÍFICAMENTE UN DROPDOWN DE COLORES =====
  // Cierra el dropdown de colores de un programa específico sin afectar otros
  closeColors(programId: string) {
    // ===== CREAR COPIA DEL SET ACTUAL =====
    const expanded = new Set(this.expandedColors()); // Crear copia del Set actual
    
    // ===== REMOVER EL ID DEL SET =====
    expanded.delete(programId); // Remover el ID del Set (cerrar dropdown)
    
    // ===== ACTUALIZAR ESTADO REACTIVO =====
    this.expandedColors.set(expanded); // Actualizar la señal reactiva
    
    // ===== LOG DE CONFIRMACIÓN =====
    console.log(`🎨 Dropdown de colores cerrado para programa: ${programId}`);
  }

  // ===== MÉTODO PARA CAMBIAR EL ESTADO DE UN PROGRAMA =====
  // Método asíncrono que actualiza el estado de un programa en la base de datos
  // Se conecta con el endpoint PATCH api/maquinas/{id}/status del backend
  // Este endpoint actualiza la columna 'estado' en la tabla machine_programs
  async changeStatus(program: MachineProgram, newStatus: MachineProgram['estado']) {
    // ===== LOG DE ENTRADA AL MÉTODO =====
    console.log('🎯 changeStatus llamado con:', { program, newStatus });
    
    // ===== VALIDACIÓN DE ID =====
    // Verificar que el programa tenga un ID válido antes de intentar actualizar
    if (!program.id) {
      console.error('❌ Error: El programa no tiene un ID válido', program);
      this.snackBar.open('Error: No se puede cambiar el estado del programa', 'Cerrar', { duration: 5000 });
      return; // Salir del método si no hay ID
    }
    
    // ===== VALIDACIÓN DE ID TEMPORAL =====
    // Si el ID es temporal (generado por el frontend), mostrar advertencia
    const programIdStr = String(program.id); // Convertir a string para verificar
    if (programIdStr.startsWith('temp-')) {
      console.warn('⚠️ Advertencia: Intentando actualizar programa con ID temporal', program);
      this.snackBar.open('Advertencia: Este programa tiene un ID temporal', 'Cerrar', { duration: 5000 });
      return; // Salir del método si el ID es temporal
    }
    
    try {
      this.loading.set(true); // Activar indicador de carga en la UI para mostrar spinner
      
      // ===== LOG DE INICIO DE CAMBIO DE ESTADO =====
      console.log(`🔄 Cambiando estado de programa ${program.id} a ${newStatus} en la base de datos`);
      
      // ===== PREPARACIÓN DEL DTO PARA EL BACKEND =====
      // Crear objeto DTO (Data Transfer Object) con los datos a enviar al servidor
      // Este objeto se serializa a JSON y se envía en el body de la petición PATCH
      const changeStatusDto = {
        estado: newStatus, // Nuevo estado del programa (LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)
        // Solo incluir observaciones si el nuevo estado es SUSPENDIDO (para guardar el motivo)
        observaciones: newStatus === 'SUSPENDIDO' ? program.observaciones : null
      };
      
      // ===== LOG DEL DTO Y URL =====
      const url = `${environment.apiUrl}/maquinas/${program.id}/status`;
      console.log('📤 Enviando petición PATCH:', { url, dto: changeStatusDto });
      
      // ===== PETICIÓN HTTP PATCH AL BACKEND =====
      // Realizar petición HTTP PATCH al endpoint api/maquinas/{id}/status
      // Este endpoint actualiza las columnas: estado, observaciones, updated_at, updated_by, last_action_by, last_action_at
      // en la tabla machine_programs de la base de datos flexoapp_bd
      const response = await firstValueFrom(this.http.patch<any>(
        url, // URL del endpoint con el ID del programa
        changeStatusDto // Objeto DTO serializado a JSON en el body de la petición
      ));
      
      // ===== LOG DE RESPUESTA =====
      console.log('📥 Respuesta recibida del servidor:', response);
      
      // ===== VALIDACIÓN DE LA RESPUESTA DEL BACKEND =====
      // Verificar que la respuesta del servidor tenga la estructura esperada: { success: true, data: {...} }
      if (response && response.success) {
        console.log(`✅ Estado cambiado exitosamente a ${newStatus} en la base de datos`);
        
        // ===== ACTUALIZACIÓN LOCAL DEL ESTADO =====
        // Actualizar el estado localmente en el frontend para reflejar los cambios inmediatamente
        // Esto evita tener que recargar todos los datos desde el servidor
        const programs = this.programs(); // Obtener array actual de programas desde la señal reactiva
        const programIndex = programs.findIndex(p => p.id === program.id); // Encontrar índice del programa modificado
        console.log('🔍 Índice del programa en el array:', programIndex);
        
        if (programIndex !== -1) {
          // ===== CREAR NUEVO ARRAY CON EL PROGRAMA ACTUALIZADO =====
          // Crear un nuevo array inmutable para disparar la detección de cambios de Angular
          const updatedPrograms = programs.map((p, index) => {
            if (index === programIndex) {
              // Actualizar el programa encontrado con los nuevos datos
              return {
                ...p, // Mantener todos los datos existentes (spread operator)
                estado: newStatus, // Actualizar columna 'estado' con el nuevo valor
                // Actualizar información de auditoría de la última acción
                // Estos datos vienen de las columnas last_action_by y last_action_at de la tabla
                lastActionBy: response.data?.lastActionBy || 'Usuario Actual',
                lastActionAt: response.data?.lastActionAt ? new Date(response.data.lastActionAt) : new Date(),
                observaciones: response.data?.observaciones || p.observaciones
              };
            }
            return p; // Mantener los demás programas sin cambios
          });
          
          // Actualizar la señal reactiva con el nuevo array (esto dispara la detección de cambios)
          this.programs.set(updatedPrograms);
          
          console.log('🔄 Estado actualizado localmente:', {
            programaId: program.id,
            estadoAnterior: program.estado,
            estadoNuevo: newStatus
          });
        }
        
        // Definir mensajes de éxito específicos para cada estado
        const statusMessages = {
          'SIN_ASIGNAR': 'Estado asignado - Programa activado',
          'PREPARANDO': 'Programa en PREPARACIÓN',
          'LISTO': 'Programa marcado como LISTO',
          'CORRIENDO': 'Programa iniciado - CORRIENDO',
          'SUSPENDIDO': 'Programa SUSPENDIDO',
          'TERMINADO': 'Programa TERMINADO exitosamente'
        };
        
        // Mostrar notificación de éxito al usuario
        this.snackBar.open(statusMessages[newStatus] || 'Estado actualizado', 'Cerrar', { duration: 3000 });
        
        // Log de confirmación con detalles
        console.log(`✅ ${statusMessages[newStatus] || 'Estado actualizado'}`, {
          programa: program.articulo,
          maquina: program.machineNumber,
          fecha: new Date().toLocaleString()
        });
        
      } else {
        // Si la respuesta no tiene la estructura esperada, lanzar error
        throw new Error('Respuesta del servidor inválida');
      }
      
    } catch (error: any) {
      console.error('❌ Error cambiando estado:', error); // Log del error
      console.error('❌ Error completo:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        error: error.error,
        url: error.url
      });
      
      // Determinar mensaje de error específico basado en el código de estado HTTP
      let errorMessage = 'Error al cambiar el estado del programa'; // Mensaje por defecto
      if (error.status === 404) {
        errorMessage = 'Programa no encontrado en la base de datos'; // Programa no existe
      } else if (error.status === 400) {
        errorMessage = 'Estado inválido o datos incorrectos'; // Datos mal formateados
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al actualizar el estado'; // Error del servidor
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor'; // Sin conexión
      }
      
      // Mostrar notificación de error al usuario
      this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      
      // Log de error detallado
      console.error(`❌ ${errorMessage}`, {
        programa: program.articulo,
        estadoDeseado: newStatus,
        error: error.message || 'Error desconocido'
      });
    } finally {
      // Siempre desactivar el indicador de carga, sin importar el resultado
      this.loading.set(false);
    }
  }

  // Métodos para manejo de suspensión de programas
  
  // Inicia el proceso de suspensión de un programa - Abre el diálogo modal
  suspendProgram(program: MachineProgram) {
    this.currentProgramToSuspend = program; // Guardar referencia del programa a suspender
    this.suspendReason = ''; // Limpiar motivo anterior
    this.showSuspendDialog = true; // Mostrar el diálogo de suspensión
  }

  // Cierra el diálogo de suspensión y limpia el estado
  closeSuspendDialog() {
    this.showSuspendDialog = false; // Ocultar el diálogo
    this.currentProgramToSuspend = null; // Limpiar referencia del programa
    this.suspendReason = ''; // Limpiar motivo de suspensión
  }

  // Maneja la selección de motivos predefinidos de suspensión
  selectPredefinedReason(reason: string) {
    if (this.suspendReason.includes(reason)) {
      // Si el motivo ya está seleccionado, removerlo
      this.suspendReason = this.suspendReason.replace(reason, '').trim();
    } else {
      // Si el motivo no está seleccionado, agregarlo
      this.suspendReason = this.suspendReason ? `${this.suspendReason}, ${reason}` : reason;
    }
  }

  // Método asíncrono para confirmar y ejecutar la suspensión de un programa
  async confirmSuspend() {
    // Validar que hay un programa seleccionado y un motivo ingresado
    if (!this.currentProgramToSuspend || !this.suspendReason.trim()) return;

    try {
      this.loading.set(true); // Activar indicador de carga
      
      console.log(`⏸️ Suspendiendo programa ${this.currentProgramToSuspend.id} con motivo: ${this.suspendReason}`);
      
      // Preparar objeto DTO para suspender el programa con observaciones
      const changeStatusDto = {
        estado: 'SUSPENDIDO', // Estado fijo para suspensión
        observaciones: this.suspendReason.trim() // Motivo de suspensión limpio
      };
      
      // Realizar petición HTTP PATCH para suspender el programa usando el endpoint de maquinas
      const response = await firstValueFrom(this.http.patch<any>(
        `${environment.apiUrl}/maquinas/${this.currentProgramToSuspend.id}/status`, 
        changeStatusDto
      ));
      
      // Verificar que la respuesta del servidor sea exitosa
      if (response && response.success) {
        console.log('✅ Programa suspendido exitosamente'); // Log de éxito
        
        // Actualizar el estado localmente para reflejar los cambios inmediatamente
        const programs = this.programs(); // Obtener array actual de programas
        const index = programs.findIndex(p => p.id === this.currentProgramToSuspend!.id); // Encontrar programa
        if (index !== -1) {
          // Crear nuevo array inmutable con el programa actualizado
          const updatedPrograms = programs.map((p, i) => {
            if (i === index) {
              return {
                ...p, // Mantener datos existentes
                estado: 'SUSPENDIDO' as MachineProgram['estado'], // Nuevo estado con tipo explícito
                observaciones: this.suspendReason, // Motivo de suspensión
                // Actualizar información de la última acción
                lastActionBy: response.data?.lastActionBy || 'Usuario Actual',
                lastActionAt: response.data?.lastActionAt ? new Date(response.data.lastActionAt) : new Date()
              };
            }
            return p;
          });
          this.programs.set(updatedPrograms); // Actualizar la señal reactiva con nuevo array
        }
        
        // Log de confirmación detallado
        console.log('⏸️ Programa suspendido exitosamente', {
          programa: this.currentProgramToSuspend.articulo,
          maquina: this.currentProgramToSuspend.machineNumber,
          motivo: this.suspendReason,
          fecha: new Date().toLocaleString()
        });
        
        this.closeSuspendDialog(); // Cerrar el diálogo de suspensión
        
      } else {
        // Si la respuesta no tiene la estructura esperada, lanzar error
        throw new Error('Respuesta del servidor inválida');
      }
      
    } catch (error: any) {
      console.error('❌ Error suspendiendo programa:', error); // Log del error
      
      // Determinar mensaje de error específico basado en el código de estado HTTP
      let errorMessage = 'Error al suspender el programa'; // Mensaje por defecto
      if (error.status === 404) {
        errorMessage = 'Programa no encontrado en la base de datos'; // Programa no existe
      } else if (error.status === 400) {
        errorMessage = 'Datos de suspensión inválidos'; // Datos mal formateados
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al suspender'; // Error del servidor
      }
      
      // Log de error detallado
      console.error(`❌ ${errorMessage}`, {
        programa: this.currentProgramToSuspend?.articulo,
        motivo: this.suspendReason,
        error: error.message || 'Error desconocido'
      });
    } finally {
      // Siempre desactivar el indicador de carga, sin importar el resultado
      this.loading.set(false);
    }
  }

  // ===== MÉTODO PARA CARGAR PROGRAMACIÓN DESDE ARCHIVO EXCEL =====
  // Método asíncrono que maneja la selección y procesamiento de archivos Excel
  // 
  // FORMATO ESPERADO DEL ARCHIVO (11 columnas en este orden):
  // (A) MQ - Número de máquina (11-21)
  // (B) ARTICULO - Código del artículo (único)
  // (C) OT SAP - Orden de trabajo SAP
  // (D) CLIENTE - Nombre del cliente
  // (E) REFERENCIA - Referencia del producto
  // (F) F - Campo adicional (se ignora)
  // (G) TD - Código TD (Tipo de Diseño)
  // (H) N° COLORES - Cantidad de colores (1-10)
  // (I) KILOS - Cantidad en kilogramos
  // (J) FECHA DE TINTAS EN MAQUINA - Fecha y hora
  // (K) SUSTRATOS - Tipo de material base (ej: BOPP, PE, PET)
  //
  // IMPORTANTE: Al cargar nueva programación, solo se eliminan los programas en estado CORRIENDO
  // Los programas en PREPARANDO, LISTO y SUSPENDIDO se mantienen para no perder el trabajo del operario
  async onFileSelected(event: any): Promise<void> {
    console.log('🎯 onFileSelected ejecutado - Evento recibido');
    console.log('📂 Event:', event);
    console.log('📂 Event.target:', event?.target);
    console.log('📂 Event.target.files:', event?.target?.files);
    
    // ===== OBTENER ARCHIVO SELECCIONADO =====
    const file = event.target.files[0]; // Obtener el primer archivo seleccionado del input file
    
    console.log('📄 Archivo seleccionado:', file);
    
    if (!file) {
      console.warn('⚠️ No se seleccionó ningún archivo');
      return; // Salir si no hay archivo seleccionado (usuario canceló)
    }
    
    console.log('✅ Archivo válido:', {
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type
    });

    // ===== VERIFICAR AUTENTICACIÓN =====
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    
    console.log('🔐 Estado de autenticación:', {
      tieneToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token?.substring(0, 30) + '...',
      isLoggedIn: isLoggedIn,
      usuario: this.authService.getCurrentUser()
    });

    // Intentar decodificar el token para ver su contenido
    if (token) {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('📋 Payload del token:', {
            exp: payload.exp,
            expDate: new Date(payload.exp * 1000),
            now: new Date(),
            isExpired: payload.exp < Math.floor(Date.now() / 1000),
            userId: payload.nameid || payload.sub,
            role: payload.role
          });
        }
      } catch (e) {
        console.error('❌ Error decodificando token:', e);
      }
    }

    if (!isLoggedIn) {
      console.error('❌ Usuario no autenticado - Token:', token ? 'existe pero expirado' : 'no existe');
      
      const snackBarRef = this.snackBar.open(
        'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 
        'Ir a Login', 
        { duration: 10000 }
      );
      
      snackBarRef.onAction().subscribe(() => {
        window.location.href = '/login';
      });
      
      // Limpiar el input file
      event.target.value = '';
      return;
    }

    // ===== VALIDACIÓN DE TIPO DE ARCHIVO =====
    // Definir tipos MIME permitidos para validación de seguridad - Solo Excel
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx (Excel moderno)
      'application/vnd.ms-excel' // .xls (Excel antiguo)
    ];
    
    // Definir extensiones permitidas como respaldo de validación - Solo Excel
    const allowedExtensions = ['.xlsx', '.xls'];
    // Extraer la extensión del archivo seleccionado
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // Validar que el archivo sea del tipo correcto (por MIME type o extensión)
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      console.warn('⚠️ Tipo de archivo no válido:', file.type, fileExtension);
      this.snackBar.open('Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls)', 'Cerrar', { duration: 5000 });
      return; // Salir si el tipo no es válido
    }

    // ===== VALIDACIÓN DE TAMAÑO DE ARCHIVO =====
    // Validar tamaño del archivo (máximo 10MB para evitar problemas de memoria y timeout)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      console.warn('⚠️ Archivo demasiado grande:', file.size, 'bytes. Máximo:', maxSize, 'bytes');
      this.snackBar.open('El archivo es demasiado grande. Máximo: 10MB', 'Cerrar', { duration: 5000 });
      return; // Salir si el archivo es muy grande
    }

    this.loading.set(true); // Activar indicador de carga en la UI
    try {
      // ===== PREPARACIÓN DE DATOS PARA ENVÍO =====
      // Crear FormData para enviar el archivo al servidor mediante multipart/form-data
      const formData = new FormData();
      formData.append('file', file); // Agregar el archivo al FormData
      formData.append('moduleType', 'machines'); // Especificar que es para el módulo de máquinas
      formData.append('timestamp', new Date().toISOString()); // Agregar timestamp para tracking y debugging

      // ===== LOG DE INICIO DE CARGA =====
      console.log('📤 Subiendo archivo de programación:', {
        nombre: file.name,
        tamaño: `${(file.size / 1024).toFixed(2)} KB`,
        tipo: file.type,
        timestamp: new Date().toISOString()
      });

      // ===== PETICIÓN HTTP POST AL BACKEND =====
      // Realizar petición HTTP POST para subir y procesar el archivo
      // El backend procesará el Excel/CSV y retornará los programas parseados
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/maquinas/upload`, formData)
      );
      
      // ===== VALIDACIÓN DE LA RESPUESTA DEL SERVIDOR =====
      // Verificar que la respuesta del servidor sea exitosa
      if (response && response.success) {
        console.log('📡 Respuesta del servidor:', response);
        console.log('📦 Datos recibidos:', response.data);
        console.log('📊 Cantidad de programas en response.data:', response.data?.length || 0);
        
        // ===== OBTENER PROGRAMAS ACTUALES =====
        // Obtener los programas actuales antes de actualizar
        const currentPrograms = this.programs();
        console.log('📋 Programas actuales antes de cargar:', currentPrograms.length);
        
        // ===== FILTRAR PROGRAMAS A MANTENER =====
        // Mantener solo los programas que NO están en estado CORRIENDO
        // Esto preserva el trabajo del operario en programas PREPARANDO, LISTO y SUSPENDIDO
        const programsToKeep = currentPrograms.filter(p => 
          p.estado === 'PREPARANDO' || 
          p.estado === 'LISTO' || 
          p.estado === 'SUSPENDIDO'
        );
        console.log('💾 Programas a mantener:', programsToKeep.length);
        
        // ===== OBTENER NUEVOS PROGRAMAS DEL SERVIDOR =====
        // Los nuevos programas vienen del archivo Excel/CSV procesado
        // Estos programas se cargan sin color (estado PREPARANDO por defecto)
        const newPrograms = response.data || [];
        console.log('🆕 Nuevos programas del servidor:', newPrograms.length);
        
        if (newPrograms.length > 0) {
          console.log('📝 Primer programa nuevo:', newPrograms[0]);
        }
        
        // ===== COMBINAR PROGRAMAS =====
        // Combinar los programas a mantener con los nuevos programas
        // Los programas a mantener van primero para preservar su orden
        const combinedPrograms = [...programsToKeep, ...newPrograms];
        console.log('🔗 Total de programas combinados:', combinedPrograms.length);
        
        // ===== ACTUALIZAR ESTADO REACTIVO =====
        // Actualizar la señal reactiva con los programas combinados
        this.programs.set(combinedPrograms);
        
        // ===== LOG DE ÉXITO DETALLADO =====
        // Log de éxito con estadísticas detalladas de la carga
        console.log('✅ Archivo procesado exitosamente', {
          programasNuevos: newPrograms.length, // Cantidad de programas nuevos cargados
          programasMantenidos: programsToKeep.length, // Cantidad de programas mantenidos
          programasTotal: combinedPrograms.length, // Total de programas después de la carga
          programasPreparando: combinedPrograms.filter(p => p.estado === 'PREPARANDO').length,
          programasListos: combinedPrograms.filter(p => p.estado === 'LISTO').length,
          programasSuspendidos: combinedPrograms.filter(p => p.estado === 'SUSPENDIDO').length,
          maquinasProgramadas: new Set(combinedPrograms.map(p => p.machineNumber)).size,
          archivo: file.name
        });
        
        // ===== MOSTRAR MENSAJE AL USUARIO =====
        // Mostrar notificación de éxito al usuario
        this.snackBar.open(
          `Programación cargada: ${newPrograms.length} nuevos, ${programsToKeep.length} mantenidos`, 
          'Cerrar', 
          { duration: 5000 }
        );
        
        // ===== LIMPIAR INPUT FILE =====
        // Limpiar el input file para permitir seleccionar el mismo archivo nuevamente
        event.target.value = '';
        
        // ===== SELECCIONAR MÁQUINA AUTOMÁTICAMENTE =====
        // Si hay programas cargados, seleccionar automáticamente la primera máquina con programas
        if (combinedPrograms.length > 0) {
          const firstMachineWithPrograms = combinedPrograms[0].machineNumber; // Obtener número de la primera máquina
          this.selectMachine(firstMachineWithPrograms); // Seleccionar esa máquina
          console.log('🎯 Máquina seleccionada automáticamente:', firstMachineWithPrograms);
        }
        
      } else {
        // ===== ERROR EN LA RESPUESTA =====
        // Si la respuesta no es exitosa, lanzar error con mensaje del servidor o genérico
        throw new Error(response?.message || 'Error al procesar el archivo');
      }
      
    } catch (error: any) {
      // ===== MANEJO DE ERRORES =====
      console.error('❌ Error procesando archivo:', error);
      console.error('📋 Detalles completos del error:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        error: error.error,
        url: error.url,
        headers: error.headers
      });
      
      // ===== MANEJO ESPECÍFICO DE ERROR 401 (NO AUTORIZADO) =====
      if (error.status === 401) {
        console.error('🔒 Sesión expirada o no autorizado');
        console.error('🔑 Token actual:', this.authService.getToken() ? 'existe' : 'no existe');
        console.error('👤 Usuario actual:', this.authService.getCurrentUser());
        
        this.snackBar.open(
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 
          'Ir a Login', 
          { duration: 10000 }
        ).onAction().subscribe(() => {
          // Redirigir al login cuando el usuario haga clic en el botón
          window.location.href = '/login';
        });
        // Limpiar el input file
        event.target.value = '';
        return; // Salir del método
      }
      
      // ===== DETERMINAR MENSAJE DE ERROR ESPECÍFICO =====
      // Determinar mensaje de error específico basado en el código de estado HTTP
      let errorMessage = 'Error al procesar el archivo'; // Mensaje por defecto
      let technicalDetails = ''; // Detalles técnicos del error
      
      if (error.status === 400) {
        // Error 400: Bad Request - Formato de archivo inválido
        errorMessage = 'Formato de archivo inválido';
        technicalDetails = 'Verifica que el archivo tenga las columnas correctas y el formato esperado.';
      } else if (error.status === 413) {
        // Error 413: Payload Too Large - Archivo demasiado grande
        errorMessage = 'El archivo es demasiado grande';
        technicalDetails = 'El tamaño máximo permitido es 10MB.';
      } else if (error.status === 0) {
        // Error 0: Network Error - Sin conexión al servidor
        errorMessage = 'Error de conexión';
        technicalDetails = 'Verifica tu conexión a internet y que el servidor esté disponible.';
      } else if (error.status === 500) {
        // Error 500: Internal Server Error - Error del servidor
        errorMessage = 'Error interno del servidor';
        technicalDetails = 'Problema al procesar el archivo en el servidor.';
      } else if (error.message) {
        // Usar mensaje específico del error si está disponible
        errorMessage = error.message;
        technicalDetails = 'Revisa el formato del archivo y vuelve a intentar.';
      }
      
      // ===== LOG DE ERROR CON CONSEJOS =====
      // Log de error con consejos para el usuario
      console.error(`❌ ${errorMessage}`, {
        detalles: technicalDetails,
        consejos: [
          'Usa la plantilla descargable si está disponible',
          'Verifica que todas las columnas requeridas estén presentes',
          'El archivo no debe exceder 10MB',
          'Asegúrate de que el formato sea Excel (.xlsx, .xls) o CSV (.csv)'
        ]
      });
      
      // ===== MOSTRAR ERROR AL USUARIO =====
      // Mostrar notificación de error al usuario
      this.snackBar.open(`${errorMessage}. ${technicalDetails}`, 'Cerrar', { duration: 7000 });
      
    } finally {
      // ===== DESACTIVAR INDICADOR DE CARGA =====
      // Siempre desactivar el indicador de carga, sin importar el resultado
      this.loading.set(false);
    }
  }

  // Métodos utilitarios para la interfaz de usuario
  
  /**
   * Obtiene el color hexadecimal asociado a cada estado de programa - ACTUALIZADO CON NUEVOS COLORES
   * Usado para aplicar estilos visuales consistentes en la UI
   * SIN_ASIGNAR: Gris claro - Programa nuevo sin acción del operario (debe asignar estado)
   * PREPARANDO: Amarillo - Programa en preparación
   * LISTO: Verde - Programa listo para producción
   * SUSPENDIDO: Naranja - Programa pausado temporalmente
   * CORRIENDO: Rojo - Programa en ejecución activa
   * TERMINADO: Verde oscuro - Programa completado exitosamente
   */
  getStatusColor(estado: string): string {
    const colors = { // Mapeo de estados a colores hexadecimales - NUEVOS COLORES
      'SIN_ASIGNAR': '#94a3b8', // Gris claro - Programa nuevo sin estado asignado
      'PREPARANDO': '#eab308',  // Amarillo - Programa en preparación
      'LISTO': '#16a34a',       // Verde - Programa listo para ejecutar
      'SUSPENDIDO': '#f97316',  // Naranja - Programa pausado/suspendido
      'CORRIENDO': '#dc2626',   // Rojo - Programa en ejecución
      'TERMINADO': '#059669'    // Verde oscuro - Programa completado
    };
    // Retorna el color correspondiente o gris por defecto si no se encuentra el estado
    return colors[estado as keyof typeof colors] || '#64748b';
  }

  /**
   * Obtiene el nombre del icono Material correspondiente a cada estado - ACTUALIZADO CON NUEVOS ICONOS
   * Usado para mostrar iconos consistentes en botones y estados
   */
  getStatusIcon(estado: string): string {
    const icons = { // Mapeo de estados a nombres de iconos Material - NUEVOS ICONOS
      'SIN_ASIGNAR': 'radio_button_unchecked', // Círculo vacío - Sin asignar
      'PREPARANDO': 'schedule',     // Icono de reloj - Preparando
      'LISTO': 'check_circle',      // Círculo con check - Listo
      'SUSPENDIDO': 'pause_circle', // Círculo con pausa - Suspendido
      'CORRIENDO': 'play_circle',   // Círculo con play - En ejecución
      'TERMINADO': 'task_alt'       // Icono de tarea completada - Terminado
    };
    // Retorna el icono correspondiente o 'help' por defecto si no se encuentra el estado
    return icons[estado as keyof typeof icons] || 'help';
  }

  /**
   * Calcula y formatea el tiempo transcurrido entre dos fechas
   * Útil para mostrar duración de procesos o tiempo desde última acción
   */
  formatElapsedTime(startDate: Date, endDate?: Date): string {
    const end = endDate || new Date(); // Usar fecha actual si no se proporciona fecha final
    const diff = end.getTime() - startDate.getTime(); // Diferencia en milisegundos
    // Convertir milisegundos a horas y minutos
    const hours = Math.floor(diff / (1000 * 60 * 60)); // Calcular horas completas
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); // Calcular minutos restantes
    return hours + 'h ' + minutes + 'm'; // Formato "Xh Ym"
  }

  /**
   * Convierte un valor de progreso numérico a porcentaje CSS
   * Asegura que el valor esté entre 0% y 100%
   */
  getProgressWidth(progreso: number): string {
    // Limitar el valor entre 0 y 100, luego agregar símbolo de porcentaje
    return Math.min(100, Math.max(0, progreso)) + '%';
  }

  /**
   * Verifica si una máquina tiene al menos un programa en estado CORRIENDO
   * Usado para determinar el estado visual de actividad de la máquina
   */
  isMachineActive(machineNumber: number): boolean {
    // Filtrar programas de la máquina específica
    const programs = this.programs().filter(p => p.machineNumber === machineNumber);
    // Verificar si algún programa está en estado CORRIENDO
    return programs.some(p => p.estado === 'CORRIENDO');
  }

  /**
   * Genera un resumen textual del estado de una máquina - ACTUALIZADO CON NUEVOS ESTADOS
   * Muestra cantidad de programas corriendo y listos de forma legible
   */
  getMachineSummary(machineNumber: number): string {
    // Filtrar programas de la máquina específica
    const programs = this.programs().filter(p => p.machineNumber === machineNumber);
    // Contar programas por estado - NUEVOS ESTADOS
    const running = programs.filter(p => p.estado === 'CORRIENDO').length; // Programas corriendo
    const ready = programs.filter(p => p.estado === 'LISTO' || p.estado === 'PREPARANDO').length; // Programas listos + preparando
    
    // Si hay programas corriendo, mostrar ambos conteos
    if (running > 0) {
      return running + ' corriendo, ' + ready + ' listos';
    }
    // Si no hay programas corriendo, solo mostrar los listos
    return ready + ' programas listos';
  }

  /**
   * Exportar datos de programación a Excel (XLSX)
   * Genera un archivo Excel real con formato usando la librería xlsx
   * Exportación del lado del cliente (no requiere backend)
   */
  exportToExcel() {
    try {
      // ===== ACTIVAR INDICADOR DE CARGA =====
      this.loading.set(true);
      console.log('📊 Exportando programación a Excel (XLSX)...');
      
      // ===== OBTENER DATOS A EXPORTAR =====
      const dataToExport = this.programs();
      
      // ===== VALIDAR QUE HAY DATOS =====
      if (dataToExport.length === 0) {
        console.warn('⚠️ No hay datos para exportar');
        this.snackBar.open('No hay programas para exportar', 'Cerrar', { duration: 3000 });
        return;
      }

      // ===== IMPORTAR LIBRERÍA XLSX =====
      import('xlsx').then(XLSX => {
        // ===== PREPARAR DATOS PARA EXCEL =====
        const excelData = dataToExport.map(program => {
          // Formatear fecha de tinta
          let fechaTintaFormatted = '';
          if (program.fechaTintaEnMaquina) {
            const fecha = new Date(program.fechaTintaEnMaquina);
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            const hora = String(fecha.getHours()).padStart(2, '0');
            const minuto = String(fecha.getMinutes()).padStart(2, '0');
            fechaTintaFormatted = `${dia}/${mes}/${anio} ${hora}:${minuto}`;
          }

          // Formatear fecha de última acción
          let lastActionFormatted = '';
          if (program.lastActionAt) {
            const fecha = new Date(program.lastActionAt);
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            const hora = String(fecha.getHours()).padStart(2, '0');
            const minuto = String(fecha.getMinutes()).padStart(2, '0');
            lastActionFormatted = `${dia}/${mes}/${anio} ${hora}:${minuto}`;
          }

          // Formatear colores
          const coloresFormatted = program.colores && program.colores.length > 0 
            ? program.colores.join(', ')
            : '';

          // Retornar objeto con las columnas para Excel
          return {
            'MÁQUINA': program.machineNumber || program.numeroMaquina || '',
            'ARTÍCULO': program.articulo || '',
            'OT SAP': program.otSap || '',
            'CLIENTE': program.cliente || '',
            'REFERENCIA': program.referencia || '',
            'TD': program.td || '',
            'N° COLORES': program.numeroColores || 0,
            'COLORES': coloresFormatted,
            'KILOS': program.kilos || 0,
            'FECHA TINTA EN MÁQUINA': fechaTintaFormatted,
            'SUSTRATO': program.sustrato || '',
            'ESTADO': program.estado || '',
            'OBSERVACIONES': program.observaciones || '',
            'ÚLTIMA ACCIÓN POR': program.lastActionBy || '',
            'ÚLTIMA ACCIÓN FECHA': lastActionFormatted
          };
        });

        // ===== CREAR LIBRO DE EXCEL =====
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Programación');

        // ===== AJUSTAR ANCHO DE COLUMNAS =====
        const columnWidths = [
          { wch: 10 },  // MÁQUINA
          { wch: 15 },  // ARTÍCULO
          { wch: 15 },  // OT SAP
          { wch: 35 },  // CLIENTE
          { wch: 20 },  // REFERENCIA
          { wch: 12 },  // TD
          { wch: 12 },  // N° COLORES
          { wch: 40 },  // COLORES
          { wch: 10 },  // KILOS
          { wch: 20 },  // FECHA TINTA EN MÁQUINA
          { wch: 15 },  // SUSTRATO
          { wch: 12 },  // ESTADO
          { wch: 30 },  // OBSERVACIONES
          { wch: 20 },  // ÚLTIMA ACCIÓN POR
          { wch: 20 }   // ÚLTIMA ACCIÓN FECHA
        ];
        worksheet['!cols'] = columnWidths;

        // ===== GENERAR NOMBRE DE ARCHIVO =====
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `programacion-maquinas-${timestamp}.xlsx`;

        // ===== DESCARGAR ARCHIVO =====
        XLSX.writeFile(workbook, fileName);

        // ===== LOG DE ÉXITO =====
        console.log(`✅ Archivo Excel exportado exitosamente: ${fileName}`);
        console.log(`📊 Total de programas exportados: ${dataToExport.length}`);
        
        // ===== MOSTRAR MENSAJE AL USUARIO =====
        this.snackBar.open(
          `Exportación exitosa: ${dataToExport.length} programas exportados a ${fileName}`, 
          'Cerrar', 
          { duration: 5000 }
        );
      }).catch(error => {
        console.error('❌ Error cargando librería xlsx:', error);
        this.snackBar.open(
          'Error al cargar la librería de Excel', 
          'Cerrar', 
          { duration: 5000 }
        );
      });
      
    } catch (error: any) {
      // ===== MANEJO DE ERRORES =====
      console.error('❌ Error exportando a Excel:', error);
      
      // ===== MOSTRAR ERROR AL USUARIO =====
      this.snackBar.open(
        `Error al exportar: ${error.message || 'Error desconocido'}`, 
        'Cerrar', 
        { duration: 5000 }
      );
      
    } finally {
      // ===== DESACTIVAR INDICADOR DE CARGA =====
      this.loading.set(false);
    }
  }



  // ===== MÉTODO PARA REFRESCAR/RECARGAR DATOS DE MÁQUINAS =====
  // Método asíncrono que recarga todos los programas desde la base de datos
  // Útil para sincronizar datos cuando hay cambios externos o para actualizar la vista
  async refreshData() {
    // ===== LOG DE INICIO DE RECARGA =====
    console.log('🔄 Refrescando datos de máquinas desde la base de datos...');
    
    // ===== MOSTRAR NOTIFICACIÓN AL USUARIO =====
    // Informar al usuario que se están actualizando los datos
    this.snackBar.open('Actualizando datos...', '', { duration: 2000 });
    
    // ===== LLAMAR AL MÉTODO DE CARGA =====
    // Reutilizar el método loadPrograms() que ya tiene toda la lógica de carga
    // Este método maneja automáticamente el estado de carga y los errores
    await this.loadPrograms();
    
    // ===== MOSTRAR NOTIFICACIÓN DE ÉXITO =====
    // Informar al usuario que los datos se actualizaron correctamente
    this.snackBar.open('Datos actualizados correctamente', 'Cerrar', { duration: 3000 });
    
    // ===== LOG DE CONFIRMACIÓN =====
    console.log('✅ Datos de máquinas refrescados exitosamente');
  }

  // ===== MÉTODO PARA IMPRIMIR FORMATO FF-459 =====
  // Método que abre el formato FF-459 oficial de la empresa en una nueva ventana
  // El formato FF-459 es el documento de "PREALISTAMIENTO Y AJUSTES EN IMPRESIÓN"
  // IMPORTANTE: Este método carga el HTML desde el archivo print-ff459.html y reemplaza las variables
  async printFF459(program: MachineProgram) {
    // ===== LOG DE INICIO DE IMPRESIÓN =====
    console.log('🖨️ Preparando impresión de formato FF-459 para programa:', program.articulo);
    
    // ===== VALIDACIÓN DEL PROGRAMA =====
    // Verificar que el programa tenga los datos mínimos necesarios
    if (!program || !program.articulo) {
      console.error('❌ Error: Programa inválido para impresión', program);
      this.snackBar.open('Error: No se puede imprimir el formato para este programa', 'Cerrar', { duration: 5000 });
      return; // Salir del método si el programa no es válido
    }

    // ===== PREPARAR DATOS PARA EL FORMATO FF-459 =====
    // Obtener usuario actual del servicio de autenticación
    const currentUser = this.authService.getCurrentUser();
    const nombreCompleto = currentUser 
      ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() 
      : 'Usuario';
    
    // Formatear fecha actual en formato dd/mm/yyyy
    const today = new Date();
    const dia = String(today.getDate()).padStart(2, '0');
    const mes = String(today.getMonth() + 1).padStart(2, '0');
    const anio = today.getFullYear();
    const fechaActual = `${dia}/${mes}/${anio}`;
    
    // ===== PREPARAR ARRAY DE 10 COLORES =====
    // El formato FF-459 tiene exactamente 10 columnas para colores
    // Si el programa tiene menos de 10 colores, se rellenan con vacíos
    const coloresArray = this.prepareColorsForFF459(program.colores);
    
    try {
      // ===== CARGAR PLANTILLA HTML DESDE EL ARCHIVO =====
      console.log('📄 Cargando plantilla HTML desde templates/print-ff459.html');
      const response = await firstValueFrom(
        this.http.get('/templates/print-ff459.html', { responseType: 'text' })
      );
      
      let htmlContent = response;
      
      // ===== REEMPLAZAR VARIABLES EN EL HTML =====
      // Reemplazar todas las variables ${...} con los datos del programa
      // Usar replaceAll para asegurar que todas las ocurrencias sean reemplazadas
      htmlContent = htmlContent
        .replaceAll('${fechaActual}', fechaActual)
        .replaceAll('${nombreCompleto}', nombreCompleto)
        .replaceAll("${program.cliente || ''}", program.cliente || '')
        .replaceAll("${program.referencia || ''}", program.referencia || '')
        .replaceAll("${program.td || ''}", program.td || '')
        .replaceAll("${program.otSap || ''}", program.otSap || '')
        .replaceAll("${program.machineNumber || program.numeroMaquina || ''}", String(program.machineNumber || program.numeroMaquina || ''))
        .replaceAll("${program.kilos || 0}", String(program.kilos || 0))
        .replaceAll("${program.sustrato || ''}", program.sustrato || '')
        .replaceAll("${program.articulo || ''}", program.articulo || '');
      
      // Reemplazar colores individuales (color1 a color10)
      coloresArray.forEach((colorObj: any, index: number) => {
        const colorNum = index + 1;
        htmlContent = htmlContent.replaceAll(`\${color${colorNum}}`, colorObj.color || '');
      });
      
      console.log('✅ Plantilla HTML cargada y variables reemplazadas');
      
      // ===== ABRIR VENTANA CON EL HTML =====
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        console.log('✅ Formato FF-459 enviado a impresión');
        this.snackBar.open('Formato FF-459 listo para imprimir', 'Cerrar', { duration: 3000 });
      } else {
        console.error('❌ No se pudo abrir la ventana de impresión');
        this.snackBar.open('Error: No se pudo abrir la ventana de impresión', 'Cerrar', { duration: 5000 });
      }
    } catch (error) {
      console.error('❌ Error cargando plantilla HTML:', error);
      this.snackBar.open('Error: No se pudo cargar la plantilla de impresión', 'Cerrar', { duration: 5000 });
    }
  }

  // ===== MÉTODO AUXILIAR PARA PREPARAR COLORES PARA FF-459 =====
  // Prepara un array de exactamente 10 colores para el formato FF-459
  // Si hay menos de 10 colores, rellena con objetos vacíos
  // Si hay más de 10 colores, toma solo los primeros 10
  private prepareColorsForFF459(colores: string[]): any[] {
    // ===== CREAR ARRAY BASE DE 10 ELEMENTOS =====
    // Inicializar array con 10 objetos vacíos
    const coloresFF459 = Array(10).fill(null).map((_, index) => ({
      unidad: index + 1, // Número de unidad (1-10)
      color: '', // Nombre del color (vacío por defecto)
      lineaturaAnilox: '', // Lineatura del anilox (vacío por defecto)
      codigoAnilox: '', // Código del anilox (vacío por defecto)
      celda: '', // Tipo de celda (vacío por defecto)
      deltaE: '', // Valor Delta E (vacío por defecto)
      deltaC: '', // Valor Delta C* (vacío por defecto)
      viscosidad: '', // Viscosidad de la tinta (vacío por defecto)
      codigoTinta: '', // Código de la tinta (vacío por defecto)
      loteProveedor: '', // Lote del proveedor (vacío por defecto)
      cantidadPrealistada: '' // Cantidad prealistada en Kg (vacío por defecto)
    }));

    // ===== RELLENAR CON LOS COLORES DEL PROGRAMA =====
    // Iterar sobre los colores del programa y asignarlos a las unidades correspondientes
    if (colores && colores.length > 0) {
      colores.slice(0, 10).forEach((color, index) => {
        // Asignar el nombre del color a la unidad correspondiente
        coloresFF459[index].color = color;
      });
    }

    // ===== LOG DE COLORES PREPARADOS =====
    console.log('🎨 Colores preparados para FF-459:', coloresFF459);

    // ===== RETORNAR ARRAY DE 10 COLORES =====
    return coloresFF459;
  }



}
