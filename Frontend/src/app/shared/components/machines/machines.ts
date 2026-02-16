// Importaciones de Angular Core - Funcionalidades básicas del framework
import { Component, OnInit, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
// Módulo común de Angular - Directivas básicas como *ngFor, *ngIf
import { CommonModule } from '@angular/common';
// Animaciones de Angular
import { trigger, state, style, transition, animate } from '@angular/animations';
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
import { MatMenuModule } from '@angular/material/menu'; // Menús desplegables Material
import { MatSelectModule } from '@angular/material/select'; // Selectores Material
// Módulo de formularios reactivos de Angular
import { FormsModule } from '@angular/forms';
// Cliente HTTP para comunicación con el backend
import { HttpClient, HttpBackend } from '@angular/common/http';
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
// Servicio de colores Pantone
import { PantoneLiveService } from '../../services/pantone-live.service';
// Servicio de Anilox
import { AniloxService, Anilox } from '../../services/anilox.service';
// Servicio de Permisos
import { PermissionsService } from '../../services/permissions.service';
import { PERMISSIONS } from '../../models/permission.model';

// Interfaz que define la estructura de un registro de máquina desde la tabla 'maquinas'
interface MachineProgram {
  numeroMaquina: number; // Número de la máquina (11-21) - Campo principal para identificar máquina
  articulo: string; // Código del artículo a producir (ej: F204567)
  otSap: string; // Número de orden de trabajo SAP (ej: OT123456)
  cliente: string; // Nombre del cliente (ej: ABSORBENTES DE COLOMBIA S.A)
  referencia: string; // Referencia del producto (ej: REF-001)
  td: string; // Código TD (Tipo de Diseño) (ej: TD-ABC)
  tipoImpresion?: string; // Tipo de impresión (ej: 07A) - Opcional
  numeroColores: number; // Número total de colores utilizados en la impresión
  colores: string[]; // Array de colores para la impresión (ej: ['CYAN', 'MAGENTA', 'AMARILLO'])
  kilos: number; // Cantidad en kilogramos a producir
  metros?: number; // Metros a fabricar - Opcional
  anchoMm?: number; // Ancho en mm del diseño - Opcional para cálculos
  fechaTintaEnMaquina: Date; // Fecha y hora cuando se aplicó la tinta en la máquina (formato dd/mm/aaaa: hora)
  sustrato: string; // Tipo de material base (ej: BOPP, PE, PET)
  estado: 'SIN_ASIGNAR' | 'PREPARANDO' | 'LISTO' | 'SUSPENDIDO' | 'CORRIENDO' | 'TERMINADO' | null; // Estado actual del programa - SIN_ASIGNAR = Programa nuevo sin acción del operario
  observaciones?: string; // Observaciones adicionales (opcional)
  lastActionBy?: string; // Usuario que realizó la última acción (opcional)
  lastActionAt?: Date; // Fecha de la última acción (opcional)
  preparandoStartedAt?: Date; // Fecha cuando se marcó como PREPARANDO (opcional)
  // Campos adicionales para compatibilidad con el sistema existente
  machineNumber: number; // Alias para numeroMaquina para compatibilidad
  // Campos para sistema de mensajes persistentes
  adminMessage?: string; // Mensaje del administrador/supervisor
  messageTimestamp?: Date; // Fecha del mensaje
  messageSender?: string; // Quien envió el mensaje
  messageRead?: boolean; // Si el mensaje ha sido leído
  messageReadBy?: string; // Quién leyó el mensaje
}

// Interfaz que define los permisos del usuario en el módulo
interface UserPermissions {
  canLoadExcel: boolean; // Permiso para cargar archivos Excel
  canDownloadTemplate: boolean; // Permiso para descargar plantillas
  canViewFF459: boolean; // Permiso para ver formato FF459
  canClearPrograms: boolean; // Permiso para limpiar programación
  canSendMessages: boolean; // Permiso para enviar mensajes (solo admin y supervisor)
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
    MatMenuModule, // Menús desplegables de Material
    MatSelectModule, // Selectores de Material
    FormsModule // Formularios de Angular
  ],
  templateUrl: './machines.html', // Archivo de plantilla HTML
  styleUrls: ['./machines.scss'], // Archivo de estilos SCSS
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', opacity: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: '1' })),
      transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class MachinesComponent implements OnInit {
  // CONFIGURACIÓN DE MÁQUINAS (Cargas Muertas por defecto si no están en BD)
  // Se cargarán desde el backend, pero mantenemos referencia
  private readonly DEFAULT_MACHINE_CONFIGS: Record<number, number> = {
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0
  };

  // Inyección de dependencias usando la nueva sintaxis inject()
  private http = inject(HttpClient); // Cliente HTTP para llamadas al API
  private httpBackend = inject(HttpBackend); // Backend HTTP para bypass de interceptores
  private templateHttp = new HttpClient(this.httpBackend); // Cliente HTTP específico para plantillas (sin interceptores)
  private authService = inject(AuthService); // Servicio de autenticación
  private snackBar = inject(MatSnackBar); // Servicio de notificaciones toast
  private cdr = inject(ChangeDetectorRef); // Detector de cambios para forzar actualización de vista
  private pantoneService = inject(PantoneLiveService); // Servicio de colores Pantone
  private aniloxService = inject(AniloxService); // Servicio de Anilox
  private permissionsService = inject(PermissionsService); // Servicio de permisos

  // Exponer console.log para usar en el template
  console = console;

  // Señales reactivas de Angular - Estado reactivo del componente
  loading = signal(false); // Estado de carga (true/false)
  selectedMachineNumber = signal<number | null>(null); // Número de máquina seleccionada
  programs = signal<MachineProgram[]>([]); // Array de programas cargados
  expandedColors = signal<Set<string>>(new Set()); // Set de IDs de dropdowns de colores expandidos

  // Datos de Anilox
  lineaturas = signal<number[]>([]); // BCM disponibles cargados desde BD
  aniloxByLineatura = signal<Map<number, Anilox[]>>(new Map()); // Anilox agrupados por BCM
  aniloxByMachine = signal<Map<number, Anilox[]>>(new Map()); // Anilox agrupados por máquina
  selectedAniloxData = signal<Map<string, { lineatura: number | null, anilox: Anilox | null, kilos: number | null }>>(new Map()); // Datos seleccionados por color (key: otSap-colorIndex)
  machineConfigs = signal<Map<number, { cargaMuerta: number }>>(new Map()); // Configuración de máquinas (carga muerta)

  // Estado del diálogo de suspensión - Variables para el modal de suspender programa
  showSuspendDialog = false; // Controla la visibilidad del diálogo
  currentProgramToSuspend: MachineProgram | null = null; // Programa que se va a suspender
  suspendReason = ''; // Motivo de la suspensión ingresado por el usuario

  // Variable para el menú de corriendo/terminado
  currentProgramForMenu: MachineProgram | null = null; // Programa seleccionado para el menú de acciones

  // Variables para el sistema de mensajes de administrador
  showMessageDialog = false; // Controla la visibilidad del diálogo de mensajes
  currentMessage = ''; // Mensaje actual del administrador
  messageProgram: MachineProgram | null = null; // Programa asociado al mensaje
  programMessages = signal<Map<string, { message: string, timestamp: Date, sender: string, read: boolean }>>(new Map()); // Mapa de mensajes por OT SAP
  messageTimeout: any = null; // Timeout para auto-cerrar el mensaje
  isEditingMessage = false; // Si se está editando un mensaje existente
  private readonly MESSAGES_STORAGE_KEY = 'flexoapp_program_messages'; // Clave para localStorage

  // Configuración estática del componente
  machineNumbers = Array.from({ length: 11 }, (_, i) => i + 11); // Genera array [11, 12, 13, ..., 21]

  // Columnas completas para la tabla reconstruida - NUEVO ORDEN
  simpleColumns = [
    'articulo',              // Código del artículo - CAMPO REDUCIDO
    'otSap',                // Orden de trabajo SAP - CAMPO REDUCIDO  
    'cliente',              // Nombre del cliente
    'referencia',           // Referencia del producto - CAMPO AMPLIADO
    'td',                   // Código TD (Tipo de Diseño)
    'numeroColores',        // Número de colores
    'kilos',                // Cantidad en kilogramos - FORMATO ORIGINAL
    'fechaTintaEnMaquina',  // Fecha de tinta en máquina
    'sustrato',             // Tipo de sustrato/material
    'estado',               // Estado actual del programa
    'acciones'              // Botones de acción
  ];

  programDisplayedColumns = [ // Columnas que se muestran en la tabla de programación según especificaciones - NUEVO ORDEN
    'articulo',               // Código del artículo (ej: F204567) - CAMPO REDUCIDO
    'otSap',                 // Orden de trabajo SAP - CAMPO REDUCIDO
    'cliente',               // Nombre del cliente
    'referencia',            // Referencia del producto - CAMPO AMPLIADO con espacio de artículo y otSap
    'td',                    // Código TD (Tipo de Diseño)
    'numeroColores',         // Número de colores con botón desplegable para ver paleta
    'kilos',                 // Cantidad en kilogramos - FORMATO ORIGINAL DEL EXCEL
    'fechaTintaEnMaquina',   // Fecha de tinta en máquina (dd/mm/aaaa: hora)
    'sustrato',              // Tipo de sustrato/material
    'estado',                // Estado actual del programa
    'acciones'               // Botones de acción para cambiar estado
  ];

  // Permisos del usuario calculados reactivamente usando Signals
  userPermissions = computed((): UserPermissions => {
    // Estas señales de permisos provienen del PermissionsService (que es reactivo)
    const perms = this.permissionsService.permissions();

    return {
      canLoadExcel: this.permissionsService.hasPermission(PERMISSIONS.ACTION_IMPORT) ||
        this.permissionsService.hasPermission(PERMISSIONS.ACTION_ADD_PROGRAMMING),
      canDownloadTemplate: this.permissionsService.hasPermission(PERMISSIONS.ACTION_EXPORT),
      canViewFF459: this.permissionsService.hasPermission(PERMISSIONS.MACHINES_PRINT),
      canClearPrograms: this.permissionsService.hasPermission(PERMISSIONS.USERS_DELETE) ||
        this.permissionsService.hasPermission(PERMISSIONS.PERMISSIONS_MANAGE),
      canSendMessages: this.permissionsService.hasPermission(PERMISSIONS.MACHINES_SEND_MESSAGE)
    };
  });

  // Propiedades computadas - Se recalculan automáticamente cuando cambian las dependencias

  // Programas de la máquina seleccionada - Filtra programas por número de máquina y ordena por fecha/hora ascendente
  selectedMachinePrograms = computed(() => {
    const selected = this.selectedMachineNumber(); // Obtiene el número de máquina seleccionada
    if (!selected) return []; // Si no hay máquina seleccionada, retorna array vacío
    // Filtra todos los programas para obtener solo los de la máquina seleccionada
    const filtered = this.programs().filter(p => p.machineNumber === selected);
    // IMPORTANTE: Crear una copia del array antes de ordenar para no mutar el original
    // Ordena por fecha y hora ascendente (más cercana primero)
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.fechaTintaEnMaquina).getTime(); // Convierte fecha A a timestamp
      const dateB = new Date(b.fechaTintaEnMaquina).getTime(); // Convierte fecha B a timestamp
      return dateA - dateB; // Orden ascendente: fecha más cercana primero
    });

    // Log para debugging - verificar que todos los programas tienen OT SAP
    console.log('📊 selectedMachinePrograms recalculado:', sorted.map(p => ({
      otSap: p.otSap,
      articulo: p.articulo,
      estado: p.estado
    })));

    return sorted;
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
  async ngOnInit() {
    console.log('🚀 Inicializando módulo de máquinas...'); // Log de inicio
    console.log('🏭 Máquinas disponibles:', this.machineNumbers); // Log de máquinas disponibles

    // Cargar mensajes persistentes desde localStorage ANTES de cargar programas
    console.log('📱 Cargando mensajes desde localStorage...');
    this.loadMessagesFromStorage();

    // Verificar que los mensajes se cargaron correctamente
    setTimeout(() => {
      const loadedMessages = this.programMessages();
      console.log('🔍 Mensajes después de cargar:', loadedMessages.size, 'mensajes');
      if (loadedMessages.size > 0) {
        console.log('📋 Mensajes cargados:', Array.from(loadedMessages.entries()));
      }
    }, 100);

    // Cargar BCM únicos desde la base de datos
    this.loadUniqueBCM();

    // Cargar anilox por máquina para todas las máquinas
    await this.loadAllMachineAnilox();

    // Cargar configuraciones de máquinas (carga muerta)
    await this.loadAllMachineConfigs();

    // Configurar polling para mantener los datos sincronizados
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
      if (response && response.success && response.data && response.data.length > 0) {
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
              console.warn('⚠️ Error parseando colores para programa:', program.otSap, e);
              colores = [];
            }
          }

          // ===== CONSTRUCCIÓN DEL OBJETO MachineProgram =====
          // Retornar objeto MachineProgram con todos los campos mapeados desde la base de datos
          // Se usan valores por defecto (|| operador) para campos opcionales que puedan ser null

          return {
            // ===== CAMPOS PRINCIPALES DE LA TABLA machine_programs =====
            // id removed - using otSap as primary key
            numeroMaquina: program.numeroMaquina || program.machineNumber || 11, // Número de máquina (11-21) - columna machine_number
            articulo: program.articulo || '', // Código del artículo (columna articulo) - vacío si es null
            otSap: String(program.otSap || ''), // Orden de trabajo SAP (columna ot_sap) - vacío si es null
            cliente: program.cliente || '', // Nombre del cliente (columna cliente) - vacío si es null
            referencia: program.referencia || '', // Referencia del producto (columna referencia) - vacío si es null
            td: program.td || '', // Código TD - Tipo de Diseño (columna td) - vacío si es null
            tipoImpresion: program.tipoImpresion || program.tipo_impresion || undefined, // Tipo de impresión (columna tipo_impresion) - opcional
            numeroColores: program.numeroColores || colores.length || 0, // Priorizar el campo numeroColores de la BD, fallback al length del array de colores
            colores: colores, // Array de colores parseado desde la columna JSON 'colores'
            kilos: Number(program.kilos || 0), // Cantidad en kilogramos (columna kilos) - 0 si es null
            metros: program.metros ? Number(program.metros) : undefined, // Metros a fabricar (columna metros) - opcional
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
              program.lastActionAt ? new Date(program.lastActionAt) : new Date(),
            // Convertir fecha de inicio de preparación de string ISO a objeto Date
            // Se obtiene de la columna preparando_started_at de la tabla machine_programs
            preparandoStartedAt: program.preparandoStartedAt ? new Date(program.preparandoStartedAt) : undefined
          };
        });

        // ===== LOG DE ÉXITO Y ACTUALIZACIÓN DE ESTADO =====
        console.log(`✅ ${programs.length} programas cargados exitosamente desde la base de datos`);

        // ===== LOG DE NÚMEROS DE MÁQUINA =====
        const machineNumbers = [...new Set(programs.map(p => p.machineNumber))].sort((a, b) => a - b);
        console.log(`🔢 Máquinas con programas: ${machineNumbers.join(', ')}`);
        const programsByMachine = programs.reduce((acc, p) => {
          acc[p.machineNumber] = (acc[p.machineNumber] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        console.log('📊 Programas por máquina:', programsByMachine);

        // ===== LOG DE PREPARANDO_STARTED_AT =====
        const programsWithPreparandoStartedAt = programs.filter(p => p.preparandoStartedAt);
        if (programsWithPreparandoStartedAt.length > 0) {
          console.log(`⏱️ ${programsWithPreparandoStartedAt.length} programas con preparandoStartedAt:`,
            programsWithPreparandoStartedAt.map(p => ({
              otSap: p.otSap,
              articulo: p.articulo,
              estado: p.estado,
              preparandoStartedAt: p.preparandoStartedAt
            }))
          );
        }

        // ===== VERIFICACIÓN DE IDs =====
        // Verificar que todos los programas tengan OT SAP válido
        const programsWithoutId = programs.filter(p => !p.otSap);
        if (programsWithoutId.length > 0) {
          console.warn(`⚠️ ${programsWithoutId.length} programas sin OT SAP detectados:`, programsWithoutId);
          console.warn('⚠️ Datos originales del primer programa sin OT SAP:', response.data.find((p: any) => !p.otSap));
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
            const estadoKey = p.estado || 'SIN_ASIGNAR';
            acc[estadoKey] = (acc[estadoKey] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
        console.log('📊 Estadísticas de programas cargados:', stats); // Log de estadísticas detalladas

      } else {
        // Si no hay datos en el backend, mostrar mensaje y establecer array vacío
        console.warn('⚠️ No hay datos en el backend');
        this.programs.set([]);
      }
    } catch (error: any) {
      console.error('❌ Error cargando programas:', error);

      // Manejo específico para error 401 (No autorizado/sesión expirada)
      if (error.status === 401) {
        console.log('Sesión expirada. Redirigiendo al login...');
        window.location.href = '/login';
        return;
      }

      // Si hay error de conexión, establecer array vacío
      console.error('❌ Error de conexión con backend');
      this.programs.set([]);
    } finally {
      // Siempre desactivar el indicador de carga, sin importar si hubo éxito o error
      this.loading.set(false);
    }
  }

  // ===== MÉTODO PARA SELECCIONAR UNA MÁQUINA =====
  // Actualiza la señal reactiva con el número de máquina seleccionada
  // Esto dispara automáticamente la actualización de la UI mostrando los programas de esa máquina
  // Parámetro: machineNumber - Número de la máquina a seleccionar (11-21)
  selectMachine(machineNumber: number) {
    // Establecer el número de máquina seleccionada en la señal reactiva
    this.selectedMachineNumber.set(machineNumber);

    // Log para debugging - muestra qué máquina fue seleccionada
    console.log(`🎯 Máquina seleccionada: ${machineNumber}`);
  }

  // ===== FUNCIÓN DE TRACKING PARA *ngFor =====
  // Mejora el rendimiento de la lista de máquinas en el template
  // Angular usa esta función para identificar qué elementos cambiaron en la lista
  // Esto evita re-renderizar elementos que no han cambiado
  // Parámetros:
  //   - _: índice del elemento (no se usa, por eso el guión bajo)
  //   - machineNumber: número de máquina que sirve como identificador único
  // Retorna: el número de máquina como identificador único
  trackByMachineNumber(_: number, machineNumber: number): number {
    return machineNumber; // Retorna el número de máquina como identificador único
  }

  // ===== FUNCIÓN DE TRACKING PARA FILAS DE LA TABLA DE PROGRAMAS =====
  // CRÍTICO: Esta función es esencial para que Angular identifique correctamente cada fila
  // Usa el OT SAP como identificador único para evitar confusión con artículos duplicados
  // Parámetros:
  //   - _: índice del elemento (no se usa)
  //   - program: objeto MachineProgram con todos los datos del programa
  // Retorna: el OT SAP como identificador único (string)
  trackByProgramOtSap(_: number, program: MachineProgram): string {
    // IMPORTANTE: El OT SAP es único para cada programa, incluso si tienen el mismo artículo
    // Esto asegura que Angular actualice solo la fila correcta cuando cambia el estado
    return program.otSap;
  }

  // ===== MÉTODO PARA DETERMINAR LA CLASE CSS DEL LED INDICADOR DE ESTADO =====
  // Determina la clase CSS para el estado visual de una máquina basado en programas listos y preparando
  // Implementa la lógica del indicador LED según especificaciones del usuario
  getMachineStatusClass(machineNumber: number): string {
    // Filtrar programas de la máquina específica por número de máquina
    const machinePrograms = this.programs().filter(p => p.machineNumber === machineNumber);

    // Contar programas en estado LISTO y PREPARANDO
    const readyCount = machinePrograms.filter(p => p.estado === 'LISTO' || p.estado === 'PREPARANDO').length;

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

    // Retornar la clase CSS determinada
    return statusClass;
  }

  // ===== MÉTODO PARA GENERAR TEXTO DEL TOOLTIP DE ESTADO DE MÁQUINA =====
  // Genera el texto del tooltip que se muestra al pasar el mouse sobre el indicador LED de una máquina
  // Muestra información resumida del estado de la máquina
  // Parámetro: machineNumber - Número de la máquina (11-21)
  // Retorna: String con el texto del tooltip (ej: "Máquina 11: 5 programas listos/preparando")
  getMachineStatusTooltip(machineNumber: number): string {
    // Filtrar todos los programas para obtener solo los de la máquina específica
    const machinePrograms = this.programs().filter(p => p.machineNumber === machineNumber);

    // Contar programas en estados que se consideran "listos" para producción
    // Incluye: LISTO y PREPARANDO
    const readyCount = machinePrograms.filter(p =>
      p.estado === 'LISTO' ||
      p.estado === 'PREPARANDO'
    ).length;

    // Retornar texto descriptivo para el tooltip con formato legible
    return `Máquina ${machineNumber}: ${readyCount} programas listos/preparando`;
  }

  // ===== MÉTODO PARA DETERMINAR SI MOSTRAR LA TABLA DE PROGRAMACIÓN =====
  // Verifica si se debe mostrar la tabla de programación en la UI
  // La tabla solo se muestra cuando hay una máquina seleccionada
  // Retorna: true si hay máquina seleccionada, false si no
  showProgramTable(): boolean {
    // Verificar si selectedMachineNumber no es null
    // Si es null, significa que no hay máquina seleccionada
    return this.selectedMachineNumber() !== null;
  }

  // ===== MÉTODO PARA EXTRAER NÚMEROS DE LA ORDEN DE TRABAJO SAP =====
  // Extrae solo los dígitos numéricos de la orden de trabajo SAP
  // Remueve letras, espacios y caracteres especiales
  // Útil para mostrar solo el número de OT sin prefijos
  // Parámetro: otSap - Orden de trabajo completa (ej: "OT123456")
  // Retorna: Solo los números (ej: "123456")
  getNumericOtSap(otSap: string): string {
    // Usar regex \D para remover todo lo que NO sea dígito (0-9)
    // \D es equivalente a [^0-9]
    return otSap.replace(/\D/g, '');
  }

  // ===== MÉTODO PARA FORMATEAR CÓDIGO TD A MAYÚSCULAS =====
  // Convierte el código TD (Tipo de Diseño) a mayúsculas para consistencia visual
  // Asegura que todos los códigos TD se muestren en el mismo formato
  // Parámetro: td - Código TD en cualquier formato (ej: "td-abc", "TD-ABC", "Td-Abc")
  // Retorna: Código TD en mayúsculas (ej: "TD-ABC")
  formatTdCode(td: string): string {
    // Convertir todo el texto a mayúsculas usando el método toUpperCase()
    return td.toUpperCase();
  }

  // ===== MÉTODOS PARA MANEJO DEL DROPDOWN DE COLORES =====

  // ===== MÉTODO PARA VERIFICAR SI UN DROPDOWN ESTÁ EXPANDIDO =====
  // Verifica si el dropdown de colores está abierto para un programa específico
  // Usado en el template para aplicar clases CSS y mostrar/ocultar el dropdown
  // Parámetro: otSap - OT SAP único del programa
  // Retorna: true si el dropdown está expandido, false si está cerrado
  isColorsExpanded(otSap: string): boolean {
    if (!otSap) {
      return false;
    }
    // Normalizar el otSap a string y verificar
    const normalizedOtSap = String(otSap).trim();
    return this.expandedColors().has(normalizedOtSap);
  }

  // ===== MÉTODO PARA ALTERNAR (TOGGLE) EL DROPDOWN DE COLORES =====
  // Método mejorado que maneja la apertura/cierre del dropdown de colores de un programa
  // Incluye manejo de eventos para evitar propagación y cierre automático al hacer clic fuera
  toggleColors(otSap: string, event?: Event) {
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
    if (expanded.has(otSap)) {
      // El dropdown está abierto, cerrarlo
      expanded.delete(otSap); // Remover el ID del Set
      console.log(`🎨 Cerrando dropdown de colores para programa: ${otSap}`);
    } else {
      // El dropdown está cerrado, abrirlo
      // IMPORTANTE: Cerrar todos los demás dropdowns antes de abrir este
      // Esto asegura que solo un dropdown esté abierto a la vez
      expanded.clear(); // Limpiar todos los dropdowns abiertos
      expanded.add(otSap); // Agregar el nuevo ID al Set
      console.log(`🎨 Abriendo dropdown de colores para programa: ${otSap}`);
    }

    // ===== ACTUALIZAR ESTADO REACTIVO =====
    // Actualizar la señal reactiva con el nuevo Set (esto dispara la detección de cambios)
    this.expandedColors.set(expanded);
  }

  // ===== MÉTODO PARA CERRAR ESPECÍFICAMENTE UN DROPDOWN DE COLORES =====
  // Cierra el dropdown de colores de un programa específico sin afectar otros
  closeColors(otSap: string) {
    // ===== CREAR COPIA DEL SET ACTUAL =====
    const expanded = new Set(this.expandedColors()); // Crear copia del Set actual

    // ===== REMOVER EL ID DEL SET =====
    expanded.delete(otSap); // Remover el ID del Set (cerrar dropdown)

    // ===== ACTUALIZAR ESTADO REACTIVO =====
    this.expandedColors.set(expanded); // Actualizar la señal reactiva

    // ===== LOG DE CONFIRMACIÓN =====
    console.log(`🎨 Dropdown de colores cerrado para programa: ${otSap}`);
  }



  // ===== MÉTODO PARA OBTENER INFORMACIÓN DE COLOR PANTONE =====
  // Obtiene el código Pantone y el color hexadecimal para un color dado
  // Maneja formato P_209 (extrae el número 209 para buscar en la pantonera)
  getPantoneInfo(colorName: string): { code: string; hex: string; displayName: string } {
    // Validar que colorName no sea null o undefined
    if (!colorName) {
      return {
        code: 'N/A',
        hex: '#CCCCCC',
        displayName: 'Sin color'
      };
    }

    // Si el color tiene formato P_XXX, extraer el número
    let searchTerm = colorName;
    if (colorName.toUpperCase().startsWith('P_')) {
      searchTerm = colorName.substring(2); // Quitar "P_" para obtener el número
    }

    // Buscar el color en el servicio de Pantone
    const pantoneColors = this.pantoneService.searchColors(searchTerm);

    if (pantoneColors && pantoneColors.length > 0) {
      const pantoneColor = pantoneColors[0];
      return {
        code: pantoneColor.code,
        hex: pantoneColor.hex,
        displayName: pantoneColor.displayName
      };
    }

    // Si no se encuentra en Pantone, usar colores por defecto
    const defaultHex = this.getDefaultColorHex(colorName);
    return {
      code: colorName,
      hex: defaultHex,
      displayName: colorName
    };
  }

  // ===== MÉTODO PARA OBTENER COLOR HEXADECIMAL POR DEFECTO =====
  // Retorna colores hexadecimales para colores CMYK básicos
  private getDefaultColorHex(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'CYAN': '#00FFFF',
      'MAGENTA': '#FF00FF',
      'AMARILLO': '#FFFF00',
      'YELLOW': '#FFFF00',
      'NEGRO': '#000000',
      'BLACK': '#000000',
      'BLANCO': '#FFFFFF',
      'WHITE': '#FFFFFF'
    };

    return colorMap[colorName.toUpperCase()] || '#CCCCCC';
  }

  // ===== MÉTODO PARA GENERAR TOOLTIP DE COLORES =====
  // Genera el texto del tooltip que muestra los colores del programa
  getColorsTooltip(program: MachineProgram): string {
    if (!program.colores || program.colores.length === 0) {
      return 'Sin colores asignados';
    }

    const colorList = program.colores.map((color, index) =>
      `${index + 1}. ${color}`
    ).join('\n');

    return `Colores del pedido:\n${colorList}`;
  }

  // ===== MÉTODO PARA OBTENER ANILOX DE UN COLOR ESPECÍFICO =====
  // Retorna el código de anilox para un color en una posición específica
  getColorAnilox(program: MachineProgram, colorIndex: number): string {
    // TODO: Implementar lógica para obtener anilox desde la base de datos
    // Por ahora retorna un valor de ejemplo basado en el índice
    const aniloxCodes = ['A-350', 'A-450', 'A-550', 'A-650', 'A-750', 'A-850', 'A-950', 'A-1050'];
    return aniloxCodes[colorIndex % aniloxCodes.length];
  }

  // ===== MÉTODO PARA OBTENER LINEATURA DE UN COLOR ESPECÍFICO =====
  // Retorna la lineatura (LPI) para un color en una posición específica
  getColorLineatura(program: MachineProgram, colorIndex: number): string {
    // TODO: Implementar lógica para obtener lineatura desde la base de datos
    // Por ahora retorna un valor de ejemplo basado en el índice
    const lineaturas = ['120 LPI', '150 LPI', '180 LPI', '200 LPI', '220 LPI', '250 LPI', '280 LPI', '300 LPI'];
    return lineaturas[colorIndex % lineaturas.length];
  }

  // ===== MÉTODO PARA OBTENER KILOS DE UN COLOR ESPECÍFICO =====
  // Retorna los kilos de tinta para un color en una posición específica
  getColorKilos(program: MachineProgram, colorIndex: number): string {
    // Obtener kilos guardados o retornar valor por defecto
    const key = `${program.otSap}-${colorIndex}`;
    const savedData = this.selectedAniloxData().get(key);
    if (savedData?.kilos) {
      return `${savedData.kilos} kg`;
    }
    // Valor por defecto
    const kilos = ['2.5 kg', '3.0 kg', '3.5 kg', '4.0 kg', '4.5 kg', '5.0 kg', '5.5 kg', '6.0 kg'];
    return kilos[colorIndex % kilos.length];
  }

  // ===== MÉTODOS PARA GESTIÓN DE ANILOX =====

  // Cargar anilox por BCM (no lineatura)
  async loadAniloxByLineatura(bcm: number) {
    console.log(`🔵 loadAniloxByLineatura - Iniciando carga para BCM: ${bcm}`);
    try {
      console.log(`🔵 Llamando a aniloxService.getByBCM(${bcm})...`);
      const anilox = await firstValueFrom(this.aniloxService.getByBCM(bcm));
      console.log(`✅ Respuesta recibida del servicio:`, anilox);
      console.log(`✅ Cantidad de anilox recibidos: ${anilox.length}`);

      const currentMap = new Map(this.aniloxByLineatura());
      currentMap.set(bcm, anilox);
      this.aniloxByLineatura.set(currentMap);
      console.log(`📊 Anilox cargados para BCM ${bcm}:`, anilox);
      console.log(`📊 Mapa actualizado de anilox:`, Array.from(currentMap.entries()));
      return anilox;
    } catch (error: any) {
      console.error(`❌ Error al cargar anilox para BCM ${bcm}:`, error);
      console.error(`❌ Detalles del error:`, {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        url: error.url
      });
      return [];
    }
  }

  // Obtener lineatura seleccionada para un color (en realidad BCM)
  getSelectedLineatura(program: MachineProgram, colorIndex: number): number | null {
    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;
    return this.selectedAniloxData().get(key)?.lineatura || null;
  }

  // Obtener anilox seleccionado para un color
  getSelectedAnilox(program: MachineProgram, colorIndex: number): Anilox | null {
    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;
    return this.selectedAniloxData().get(key)?.anilox || null;
  }

  // Obtener kilos seleccionados para un color
  getSelectedKilos(program: MachineProgram, colorIndex: number): number | null {
    const key = `${program.otSap}-${colorIndex}`;
    return this.selectedAniloxData().get(key)?.kilos || null;
  }

  // Manejar cambio de lineatura (LPI)
  async onLineaturaChange(program: MachineProgram, colorIndex: number, lineatura: number) {
    console.log(`🔵 ========== onLineaturaChange INICIADO ==========`);
    console.log(`🔵 Lineatura seleccionada: ${lineatura} LPI`);
    console.log(`🔵 Color index: ${colorIndex + 1}`);
    console.log(`🔵 OT SAP: ${program.otSap}`);
    console.log(`🔵 Máquina: ${program.machineNumber}`);

    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;
    console.log(`🔵 Key generada: ${key}`);

    const currentData = this.selectedAniloxData().get(key) || { lineatura: null, anilox: null, kilos: null };
    console.log(`🔵 Datos actuales para esta key:`, currentData);

    // Actualizar lineatura y resetear anilox
    const newData = new Map(this.selectedAniloxData());
    newData.set(key, { ...currentData, lineatura: lineatura, anilox: null });
    this.selectedAniloxData.set(newData);
    console.log(`✅ Lineatura actualizada en selectedAniloxData`);

    // Verificar anilox disponibles para esta máquina y lineatura
    const availableAnilox = this.getAniloxForMachine(program.machineNumber, lineatura);
    console.log(`📊 Anilox disponibles para Máquina ${program.machineNumber} y Lineatura ${lineatura} LPI:`, availableAnilox.length);

    // Forzar detección de cambios
    this.cdr.detectChanges();
    console.log(`✅ Detección de cambios forzada`);

    console.log(`✅ Lineatura ${lineatura} LPI seleccionada para color ${colorIndex + 1}`);
    console.log(`🔵 ========== onLineaturaChange FINALIZADO ==========`);
  }

  // Manejar cambio de anilox (volumen)
  onAniloxChange(program: MachineProgram, colorIndex: number, aniloxId: number) {
    console.log('🔵 ========== onAniloxChange INICIADO ==========');
    console.log('📊 Datos de entrada:', {
      otSap: program.otSap,
      articulo: program.articulo,
      metros: program.metros,
      anchoMm: program.anchoMm,
      colorIndex,
      aniloxId
    });

    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;
    console.log('🔵 Key generada:', key);

    const currentData = this.selectedAniloxData().get(key) || { lineatura: null, anilox: null, kilos: null };
    console.log('🔵 Datos actuales para esta key:', currentData);

    const lineatura = currentData.lineatura;
    if (!lineatura) {
      console.warn('⚠️ No hay lineatura seleccionada en currentData. Intentando obtenerla del anilox...');
    }

    // Buscar el anilox seleccionado en el mapa por máquina
    const machineAnilox = this.aniloxByMachine().get(program.machineNumber) || [];
    const selectedAnilox = machineAnilox.find(a => a.id === aniloxId);

    if (selectedAnilox) {
      console.log('✅ Anilox encontrado:', selectedAnilox);
      const newData = new Map(this.selectedAniloxData());

      // ✅ CALCULAR KILOS AUTOMÁTICAMENTE
      // Fórmula: Kilos = (m2) * (volumen_real * factor_eficiencia * densidad) / 1000 + CargaMuerta
      let calculatedKilos = currentData.kilos;

      if (program.metros && program.anchoMm && selectedAnilox.volumen_real) {
        const metros = Number(program.metros);
        const anchoMm = Number(program.anchoMm);

        // ✅ CORRECCIÓN: Convertir ancho de mm a metros primero
        const anchoMetros = anchoMm / 1000; // Convertir mm a m
        const areaM2 = metros * anchoMetros; // Área en m²

        const eficiencia = selectedAnilox.factor_eficiencia || 35.00;
        const densidad = selectedAnilox.densidad || 0.885;
        const factorEficiencia = eficiencia / 100;

        const gramos = areaM2 * Number(selectedAnilox.volumen_real) * densidad * factorEficiencia;
        const kilosBase = gramos / 1000;

        // Sumar carga muerta de la máquina
        const machineConfig = this.machineConfigs().get(program.machineNumber);
        const cargaMuerta = machineConfig?.cargaMuerta || 0;

        calculatedKilos = Number((kilosBase + cargaMuerta).toFixed(3));

        console.log(`⚖️ DETALLES DEL CÁLCULO:`, {
          metros,
          anchoMm: anchoMm + ' mm',
          anchoMetros: anchoMetros.toFixed(3) + ' m',
          areaM2: areaM2.toFixed(3) + ' m²',
          volumen: selectedAnilox.volumen_real + ' cm³/m²',
          eficiencia: eficiencia + '%',
          densidad: densidad + ' g/cm³',
          kilosBase: kilosBase.toFixed(3) + ' kg',
          cargaMuerta: cargaMuerta + ' kg',
          RESULTADO: calculatedKilos + ' kg'
        });
      } else {
        console.warn('⚠️ No se pudo realizar el cálculo automático. Faltan datos:', {
          metros: program.metros,
          anchoMm: program.anchoMm,
          volumen: selectedAnilox.volumen_real
        });
      }

      newData.set(key, {
        lineatura: selectedAnilox.lineatura,
        anilox: selectedAnilox,
        kilos: calculatedKilos
      });
      this.selectedAniloxData.set(newData);

      // Forzar actualización de la UI
      this.cdr.detectChanges();

      console.log(`✅ selectedAniloxData actualizado para ${key}: ${calculatedKilos} kg`);
    } else {
      console.error('❌ No se encontró el anilox con ID:', aniloxId, 'en la máquina', program.machineNumber);
    }
    console.log('🔵 ========== onAniloxChange FINALIZADO ==========');
  }

  // Manejar cambio de kilos
  onKilosChange(program: MachineProgram, colorIndex: number, kilos: number) {
    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;
    const currentData = this.selectedAniloxData().get(key) || { lineatura: null, anilox: null, kilos: null };

    const newData = new Map(this.selectedAniloxData());
    newData.set(key, { ...currentData, kilos });
    this.selectedAniloxData.set(newData);
    console.log(`✅ ${kilos} kg seleccionados para color ${colorIndex + 1}`);
  }

  // Obtener anilox disponibles para un BCM (guardado como lineatura para compatibilidad)
  getAniloxForLineatura(bcm: number | null): Anilox[] {
    const result = bcm ? (this.aniloxByLineatura().get(bcm) || []) : [];
    if (bcm) {
      console.log(`🟡 getAniloxForLineatura - BCM: ${bcm}, Cantidad: ${result.length}`);
    }
    return result;
  }

  // ===== NUEVOS MÉTODOS PARA CARGA OPTIMIZADA DE ANILOX =====

  // Cargar BCM únicos desde la base de datos
  async loadUniqueBCM() {
    try {
      console.log('🔵 Cargando BCM únicos desde la base de datos...');
      const bcmList = await firstValueFrom(this.aniloxService.getUniqueLineaturas());
      this.lineaturas.set(bcmList);
      console.log(`✅ ${bcmList.length} BCM únicos cargados:`, bcmList);
    } catch (error: any) {
      console.error('❌ Error al cargar BCM únicos:', error);
      // Valores por defecto en caso de error
      this.lineaturas.set([80, 140, 200, 275, 360, 400]);
    }
  }

  // Cargar anilox para todas las máquinas (11-21)
  async loadAllMachineAnilox() {
    try {
      console.log('🔵 ========== loadAllMachineAnilox INICIADO ==========');
      const machineNumbers = this.machineNumbers;
      const aniloxMap = new Map<number, Anilox[]>();

      const promises = machineNumbers.map(async (num) => {
        try {
          const list = await firstValueFrom(this.aniloxService.getByMachine(num)) as Anilox[];
          aniloxMap.set(num, list);
        } catch (error) {
          console.error(`❌ Error cargando anilox para máquina ${num}:`, error);
          aniloxMap.set(num, []);
        }
      });

      await Promise.all(promises);
      this.aniloxByMachine.set(aniloxMap);
      console.log('✅ Anilox por máquina cargados:', aniloxMap);
    } catch (error) {
      console.error('❌ Error general cargando anilox por máquina:', error);
    }
  }

  // Cargar configuraciones de todas las máquinas (carga muerta)
  async loadAllMachineConfigs() {
    try {
      console.log('⚙️ Cargando configuraciones de todas las máquinas...');
      const configsMap = new Map<number, { cargaMuerta: number }>();

      // Intentar cargar para cada máquina disponible
      const promises = this.machineNumbers.map(async (num) => {
        try {
          const response = await firstValueFrom(
            this.http.get<any>(`${environment.apiUrl}/maquinas/config/${num}`)
          );
          if (response && response.success) {
            configsMap.set(num, { cargaMuerta: response.data.cargaMuerta || 0 });
          } else {
            configsMap.set(num, { cargaMuerta: 0 });
          }
        } catch (err) {
          // Si falla (ej. 404), usar 0 como carga muerta por defecto
          configsMap.set(num, { cargaMuerta: 0 });
        }
      });

      await Promise.all(promises);
      this.machineConfigs.set(configsMap);
      console.log('✅ Configuraciones de máquinas cargadas:', configsMap);
    } catch (error) {
      console.error('❌ Error general cargando configuraciones de máquinas:', error);
    }
  }


  // Obtener anilox disponibles para una máquina específica filtrados por lineatura
  getAniloxForMachine(machineNumber: number, lineatura: number | null): Anilox[] {
    if (!lineatura) {
      return [];
    }

    const machineAnilox = this.aniloxByMachine().get(machineNumber) || [];

    if (machineAnilox.length === 0) {
      console.warn(`⚠️ No hay anilox cargados para la máquina ${machineNumber}`);
      return [];
    }

    const filtered = machineAnilox.filter(a => a.lineatura === lineatura);

    // Log de depuración para verificar filtrado
    console.log(`🔍 getAniloxForMachine - Máquina: ${machineNumber}, Lineatura: ${lineatura}`);
    console.log(`📦 Total anilox en máquina ${machineNumber}:`, machineAnilox.length);
    console.log(`🎯 Anilox filtrados por lineatura ${lineatura}:`, filtered.length);
    console.log(`📋 Códigos filtrados:`, filtered.map(a => `${a.codigo} (Máq: ${a.maquina})`));

    // Verificar si hay anilox de otras máquinas (BUG)
    const wrongMachine = filtered.filter(a => a.maquina !== machineNumber);
    if (wrongMachine.length > 0) {
      console.error(`❌ ERROR: Se encontraron ${wrongMachine.length} anilox de otras máquinas:`, wrongMachine);
    }

    // Solo mostrar log si no hay resultados (para debugging)
    if (filtered.length === 0) {
      console.warn(`⚠️ No se encontraron anilox para Máquina ${machineNumber} con Lineatura ${lineatura} LPI`);
      console.log(`📊 Lineaturas disponibles en esta máquina:`, [...new Set(machineAnilox.map(a => a.lineatura))]);
    }

    return filtered;
  }

  // Obtener lineaturas (LPI) disponibles para una máquina específica
  getAvailableLineaturaForMachine(machineNumber: number): number[] {
    const machineAnilox = this.aniloxByMachine().get(machineNumber) || [];

    if (machineAnilox.length === 0) {
      console.warn(`⚠️ No hay anilox cargados para la máquina ${machineNumber}`);
      return [];
    }

    // Obtener lineaturas únicas de los anilox de esta máquina y ordenarlas
    const uniqueLineaturas = [...new Set(machineAnilox.map(a => a.lineatura))].sort((a, b) => a - b);

    return uniqueLineaturas;
  }

  // ===== MÉTODO PARA CARGAR INFORMACIÓN COMPLETA DEL DISEÑO =====
  // Obtiene cliente, referencia, colores y sustrato desde la tabla designs usando el artículo F
  async loadDesignInfo(articulo: string): Promise<any> {
    try {
      console.log(`📋 Cargando información de diseño para artículo: ${articulo}`);

      // Realizar petición HTTP GET al endpoint de información de diseño
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/maquinas/design-info/${articulo}`)
      );

      if (response && response.success && response.found && response.data) {
        console.log(`✅ Información de diseño cargada para ${articulo}:`, response.data);
        return response.data;
      }

      console.warn(`⚠️ No se encontró diseño para artículo: ${articulo}`);
      return null;
    } catch (error: any) {
      console.error(`❌ Error cargando información de diseño para artículo ${articulo}:`, error);
      return null;
    }
  }


  // ===== MÉTODO PARA CARGAR COLORES DESDE LA BASE DE DATOS DE DISEÑO =====
  // Obtiene los colores del pedido desde la tabla designs usando el artículo F
  async loadColorsFromDesign(articulo: string): Promise<string[]> {
    const designInfo = await this.loadDesignInfo(articulo);
    return designInfo?.colores || [];
  }

  // ===== MÉTODO PARA ALTERNAR DROPDOWN DE COLORES CON CARGA DESDE BD =====
  // Abre/cierra el dropdown y carga información completa del diseño desde la base de datos
  async toggleColorsWithLoad(program: MachineProgram, event?: Event) {
    console.log('🔵 toggleColorsWithLoad LLAMADO', { program, event });

    // Prevenir propagación del evento
    if (event) {
      event.stopPropagation();
    }

    // Normalizar el programId a string
    const programId = String(program.otSap || '').trim();

    if (!programId) {
      console.error('❌ toggleColorsWithLoad: programId es vacío o inválido', program);
      return;
    }

    console.log('🔵 Program ID (OT SAP) normalizado:', programId);

    const expanded = new Set(this.expandedColors());
    console.log('🔵 Estado actual expandedColors:', Array.from(expanded));

    // Si ya está expandido, cerrarlo
    if (expanded.has(programId)) {
      expanded.delete(programId);
      console.log(`🎨 Cerrando dropdown de colores para programa: ${programId}`);
    } else {
      // Si no está expandido, abrirlo y cargar información completa del diseño desde BD
      expanded.clear(); // Cerrar todos los demás
      expanded.add(programId);
      console.log(`🎨 Abriendo dropdown de colores para programa: ${programId}`);

      // Cargar información completa del diseño desde la base de datos
      console.log('📋 Cargando información de diseño desde BD para artículo:', program.articulo);
      const designInfo = await this.loadDesignInfo(program.articulo);
      console.log('📋 Información de diseño obtenida:', designInfo);

      // Si se encontró información del diseño, actualizar el programa
      if (designInfo) {
        const programs = this.programs();
        const updatedPrograms = programs.map(p => {
          // Usar comparación robusta de strings
          if (String(p.otSap).trim() === String(program.otSap).trim()) {
            // Obtener colores actualizados desde designInfo o mantener los actuales
            const updatedColores = designInfo.colores || p.colores;
            return {
              ...p,
              // Actualizar campos desde la base de datos de diseño
              cliente: designInfo.cliente || p.cliente,
              referencia: designInfo.referencia || p.referencia,
              sustrato: designInfo.sustrato || p.sustrato,
              anchoMm: Number(designInfo.anchoMm || p.anchoMm || 0), // ✅ Guardar AnchoMm para cálculos
              colores: updatedColores,
              // SIEMPRE calcular numeroColores desde el array real de colores
              numeroColores: updatedColores?.length || 0
            };
          }
          return p;
        });
        this.programs.set(updatedPrograms);
        console.log('✅ Programa actualizado con información de diseño desde BD');
      } else {
        console.log('⚠️ No se encontró información de diseño en BD, usando datos actuales');
      }
    }

    // Actualizar el estado de expansión
    console.log('🔵 Actualizando expandedColors a:', Array.from(expanded));
    this.expandedColors.set(expanded);
    console.log('🔵 Estado final expandedColors:', Array.from(this.expandedColors()));

    // Forzar detección de cambios en el siguiente ciclo para evitar conflictos con MatTable
    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('🔵 Detección de cambios forzada');
    }, 0);
  }

  // ===== MÉTODO PARA CAMBIAR EL ESTADO DE UN PROGRAMA =====
  // Método asíncrono que actualiza el estado de un programa en la base de datos
  // Se conecta con el endpoint PATCH api/maquinas/{id}/status del backend
  // Este endpoint actualiza la columna 'estado' en la tabla machine_programs
  async changeStatus(program: MachineProgram, newStatus: MachineProgram['estado']) {
    // ===== LOG DE ENTRADA AL MÉTODO =====
    console.log('🎯 ===== INICIO changeStatus =====');
    console.log('📋 PROGRAMA RECIBIDO DESDE EL HTML:');
    console.log('   - OT SAP:', program.otSap);
    console.log('   - Artículo:', program.articulo);
    console.log('   - Cliente:', program.cliente);
    console.log('   - Máquina:', program.machineNumber);
    console.log('   - Estado actual:', program.estado);
    console.log('   - Nuevo estado solicitado:', newStatus);
    console.log('📋 Objeto completo:', JSON.stringify(program, null, 2));

    // ===== VERIFICAR SI EL PROGRAMA ES EL CORRECTO =====
    // Buscar el programa en el array actual para verificar
    const currentPrograms = this.programs();
    const foundInArray = currentPrograms.find(p => p.otSap === program.otSap);
    if (foundInArray) {
      console.log('✅ Programa encontrado en array actual:');
      console.log('   - OT SAP:', foundInArray.otSap);
      console.log('   - Artículo:', foundInArray.articulo);
      console.log('   - Estado en array:', foundInArray.estado);
      console.log('   - ¿Coincide con el recibido?', foundInArray.otSap === program.otSap && foundInArray.articulo === program.articulo);
    } else {
      console.error('❌ ADVERTENCIA: Programa NO encontrado en array actual con OT SAP:', program.otSap);
    }

    // ===== VALIDACIÓN DE OT SAP =====
    // Verificar que el programa tenga un OT SAP válido antes de intentar actualizar
    if (!program.otSap || program.otSap.trim() === '') {
      console.error('❌ Error: El programa no tiene un OT SAP válido', program);
      this.snackBar.open('Error: No se puede cambiar el estado del programa: Falta OT SAP', 'Cerrar', { duration: 5000 });
      return; // Salir del método si no hay OT SAP
    }

    // Normalizar el OT SAP para comparación - CRÍTICO para identificación única
    const normalizedOtSap = String(program.otSap).trim();
    console.log('📋 OT SAP normalizado para búsqueda:', normalizedOtSap);

    // Log de todos los programas actuales para debugging
    console.log('📊 Programas actuales en memoria:', this.programs().map(p => ({
      otSap: p.otSap,
      articulo: p.articulo,
      maquina: p.machineNumber,
      estado: p.estado
    })));

    try {
      this.loading.set(true); // Activar indicador de carga en la UI para mostrar spinner
      console.log('⏳ Loading activado');

      // ===== LOG DE INICIO DE CAMBIO DE ESTADO =====
      console.log(`🔄 Cambiando estado de programa OT SAP: ${normalizedOtSap}, Artículo: ${program.articulo}, Máquina: ${program.machineNumber} a ${newStatus} en la base de datos`);

      // ===== PREPARACIÓN DEL DTO PARA EL BACKEND =====
      // Crear objeto DTO (Data Transfer Object) con los datos a enviar al servidor
      // Este objeto se serializa a JSON y se envía en el body de la petición PATCH
      const changeStatusDto = {
        estado: newStatus, // Nuevo estado del programa (LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)
        // Incluir observaciones para TODOS los estados (no solo SUSPENDIDO)
        observaciones: program.observaciones || null
      };

      // ===== LOG DEL DTO Y URL =====
      const url = `${environment.apiUrl}/maquinas/${encodeURIComponent(normalizedOtSap)}/status`;
      console.log('📤 DTO preparado:', changeStatusDto);
      console.log('🌐 URL completa:', url);
      console.log('📤 Enviando petición PATCH...');

      // ===== PETICIÓN HTTP PATCH AL BACKEND =====
      // Realizar petición HTTP PATCH al endpoint api/maquinas/{otSap}/status
      // Este endpoint actualiza las columnas: estado, observaciones, updated_at, updated_by, last_action_by, last_action_at
      // en la tabla machine_programs de la base de datos flexoapp_bd
      const response = await firstValueFrom(this.http.patch<any>(
        url, // URL del endpoint con el OT SAP del programa
        changeStatusDto // Objeto DTO serializado a JSON en el body de la petición
      ));

      // ===== LOG DE RESPUESTA =====
      console.log('📥 Respuesta recibida del servidor:', response);
      console.log('📥 Respuesta completa:', JSON.stringify(response, null, 2));

      // ===== VALIDACIÓN DE LA RESPUESTA DEL BACKEND =====
      // Verificar que la respuesta del servidor tenga la estructura esperada: { success: true, data: {...} }
      if (response && response.success) {
        console.log(`✅ Respuesta exitosa del servidor - Estado cambiado a ${newStatus}`);

        // ===== ACTUALIZACIÓN LOCAL DEL ESTADO =====
        // Actualizar el estado localmente en el frontend para reflejar los cambios inmediatamente
        // Esto evita tener que recargar todos los datos desde el servidor
        const programs = this.programs(); // Obtener array actual de programas desde la señal reactiva
        console.log('📊 Total de programas antes de actualizar:', programs.length);

        // Usar comparación EXACTA de OT SAP normalizado para encontrar el programa correcto
        // IMPORTANTE: Comparar OT SAP normalizado para evitar problemas con espacios
        // CRÍTICO: Solo debe coincidir UN programa con este OT SAP único
        const programIndex = programs.findIndex(p => {
          const pOtSap = String(p.otSap || '').trim();
          const match = pOtSap === normalizedOtSap;
          if (match) {
            console.log(`✅ MATCH ENCONTRADO: OT SAP="${pOtSap}", Artículo="${p.articulo}", Máquina=${p.machineNumber}`);
          }
          return match;
        });

        console.log('🔍 Índice del programa encontrado:', programIndex);
        console.log('🔍 OT SAP buscado:', normalizedOtSap);
        console.log('🔍 Artículo del programa:', program.articulo);
        console.log('🔍 Máquina del programa:', program.machineNumber);

        if (programIndex !== -1) {
          const foundProgram = programs[programIndex];
          console.log('📋 Programa ENCONTRADO para actualizar:');
          console.log('   - OT SAP:', foundProgram.otSap);
          console.log('   - Artículo:', foundProgram.articulo);
          console.log('   - Máquina:', foundProgram.machineNumber);
          console.log('   - Estado actual:', foundProgram.estado);
          console.log('   - Estado nuevo:', newStatus);

          // ===== CREAR NUEVO ARRAY CON EL PROGRAMA ACTUALIZADO =====
          // Estrategia: Crear un nuevo array completamente nuevo para forzar detección de cambios
          // IMPORTANTE: Solo actualizar el programa con el índice encontrado
          const updatedPrograms = programs.map((p, index) => {
            if (index === programIndex) {
              // Este es el programa que queremos actualizar
              console.log(`🔄 Actualizando programa en índice ${index}`);
              const updatedProgram = {
                ...p, // Copiar todos los datos del programa original
                estado: newStatus, // Actualizar estado
                lastActionBy: response.data?.lastActionBy || 'Usuario Actual',
                lastActionAt: response.data?.lastActionAt ? new Date(response.data.lastActionAt) : new Date(),
                preparandoStartedAt: response.data?.preparandoStartedAt ? new Date(response.data.preparandoStartedAt) : p.preparandoStartedAt,
                observaciones: response.data?.observaciones || p.observaciones
              };

              // VERIFICACIÓN CRÍTICA: Asegurar que el OT SAP se mantiene
              console.log('🔍 Verificación de OT SAP después de actualizar:');
              console.log('   - OT SAP original:', p.otSap);
              console.log('   - OT SAP actualizado:', updatedProgram.otSap);
              console.log('   - Son iguales:', p.otSap === updatedProgram.otSap);

              return updatedProgram;
            }
            // Mantener los demás programas sin cambios
            return p;
          });

          console.log('📋 Programa DESPUÉS de actualizar:', JSON.stringify(updatedPrograms[programIndex], null, 2));

          // Verificar que solo se actualizó un programa
          const changedCount = updatedPrograms.filter((p, i) =>
            i === programIndex && p.estado === newStatus
          ).length;
          console.log(`✅ Programas actualizados: ${changedCount} (debe ser 1)`);

          // VERIFICACIÓN ADICIONAL: Verificar que todos los OT SAP están presentes
          console.log('🔍 Verificación de OT SAPs en array actualizado:');
          const otSapsBeforeUpdate = programs.map(p => p.otSap);
          const otSapsAfterUpdate = updatedPrograms.map(p => p.otSap);
          console.log('   - OT SAPs antes:', otSapsBeforeUpdate);
          console.log('   - OT SAPs después:', otSapsAfterUpdate);
          console.log('   - Mismo número de programas:', otSapsBeforeUpdate.length === otSapsAfterUpdate.length);

          console.log('📊 Actualizando signal con nuevos programas...');
          // Actualizar la señal reactiva con el nuevo array (esto dispara la detección de cambios automáticamente)
          this.programs.set(updatedPrograms);
          console.log('📊 Signal actualizado');
          console.log('📊 Estado del signal después de actualizar:', this.programs().length, 'programas');
          console.log('📊 Programas filtrados (selectedMachinePrograms):', this.selectedMachinePrograms().length, 'programas');

          console.log('✅ Estado actualizado localmente:', {
            programaOtSap: normalizedOtSap,
            programaArticulo: program.articulo,
            programaMaquina: program.machineNumber,
            estadoAnterior: program.estado,
            estadoNuevo: newStatus
          });
        } else {
          console.error('❌ Programa NO encontrado en el array');
          console.error('❌ OT SAP buscado:', normalizedOtSap);
          console.error('❌ Artículo buscado:', program.articulo);
          console.error('❌ Máquina buscada:', program.machineNumber);
          console.error('❌ OT SAPs disponibles:', programs.map(p => ({
            otSap: String(p.otSap || '').trim(),
            articulo: p.articulo,
            maquina: p.machineNumber
          })));

          // Si no se encuentra, recargar todos los datos
          console.log('🔄 Recargando todos los programas desde el servidor...');
          await this.loadPrograms();
        }

        // Definir mensajes de éxito específicos para cada estado
        const statusMessages = {
          'SIN_ASIGNAR': 'Estado asignado - Programa activado',
          'PREPARANDO': 'Programa en PREPARACIÓN',
          'LISTO': 'Programa marcado como PREPARADO',
          'CORRIENDO': 'Programa iniciado - CORRIENDO',
          'SUSPENDIDO': 'Programa SUSPENDIDO',
          'TERMINADO': 'Programa TERMINADO exitosamente'
        };

        // ===== CALCULAR TIEMPO TRANSCURRIDO DE PREPARANDO A LISTO =====
        let successMessage = (newStatus ? (statusMessages as any)[newStatus] : 'Estado actualizado') || 'Estado actualizado';

        // Si el programa pasó de PREPARANDO a LISTO, calcular el tiempo transcurrido
        if (program.estado === 'PREPARANDO' && newStatus === 'LISTO') {
          console.log('⏱️ Detectado cambio de PREPARANDO a LISTO');

          // IMPORTANTE: Usar preparandoStartedAt del RESPONSE del servidor, no del programa anterior
          // El backend preserva este campo cuando cambia de PREPARANDO a LISTO
          const preparandoStartedAtFromServer = response.data?.preparandoStartedAt;

          console.log('📋 Datos del servidor:', {
            otSap: response.data?.otSap,
            estado: response.data?.estado,
            preparandoStartedAt: preparandoStartedAtFromServer,
            tienePreparandoStartedAt: !!preparandoStartedAtFromServer
          });

          if (preparandoStartedAtFromServer) {
            // IMPORTANTE: El backend guarda en UTC pero MySQL no preserva la zona horaria
            // La fecha viene sin 'Z' al final, así que JavaScript la interpreta como hora local
            // Solución: Agregar 'Z' al final para indicar que es UTC
            const fechaUTC = preparandoStartedAtFromServer.endsWith('Z')
              ? preparandoStartedAtFromServer
              : preparandoStartedAtFromServer + 'Z';

            const tiempoInicio = new Date(fechaUTC);
            const tiempoFin = new Date(); // Hora actual del navegador en UTC

            // Calcular diferencia en milisegundos
            const diferenciaMs = tiempoFin.getTime() - tiempoInicio.getTime();

            console.log('⏱️ DEBUG - Cálculo de tiempo:', {
              preparandoStartedAtFromServer: preparandoStartedAtFromServer,
              fechaUTCCorregida: fechaUTC,
              tiempoInicioISO: tiempoInicio.toISOString(),
              tiempoFinISO: tiempoFin.toISOString(),
              tiempoInicioLocal: tiempoInicio.toLocaleString(),
              tiempoFinLocal: tiempoFin.toLocaleString(),
              diferenciaMs: diferenciaMs,
              diferenciaMinutos: diferenciaMs / 1000 / 60
            });

            // Convertir a horas, minutos y segundos
            const totalSegundos = Math.floor(Math.abs(diferenciaMs) / 1000);
            const horas = Math.floor(totalSegundos / 3600);
            const minutos = Math.floor((totalSegundos % 3600) / 60);
            const segundos = totalSegundos % 60;

            // Crear mensaje personalizado según el tiempo transcurrido
            if (horas > 0) {
              // Más de 60 minutos: mostrar en horas y minutos
              successMessage = `✅ Programa PREPARADO en ${horas} hora${horas !== 1 ? 's' : ''} y ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
            } else if (minutos > 0) {
              // Entre 60 segundos y 60 minutos: mostrar minutos y segundos
              successMessage = `✅ Programa PREPARADO en ${minutos} minuto${minutos !== 1 ? 's' : ''} y ${segundos} segundo${segundos !== 1 ? 's' : ''}`;
            } else {
              // Menos de 60 segundos: mostrar solo segundos
              successMessage = `✅ Programa PREPARADO en ${segundos} segundo${segundos !== 1 ? 's' : ''}`;
            }

            console.log('⏱️ Tiempo de preparación calculado:', {
              inicio: tiempoInicio.toLocaleString(),
              fin: tiempoFin.toLocaleString(),
              horas: horas,
              minutos: minutos,
              segundos: segundos,
              totalSegundos: totalSegundos,
              totalMs: diferenciaMs,
              mensaje: successMessage
            });
          } else {
            console.warn('⚠️ No se pudo calcular el tiempo: preparandoStartedAt no está disponible en la respuesta del servidor');
            console.warn('⚠️ Respuesta completa del servidor:', response.data);
            successMessage = '✅ Programa marcado como PREPARADO';
          }
        }

        // Mostrar notificación de éxito al usuario con duración de 5 segundos
        this.snackBar.open(successMessage, 'Cerrar', { duration: 5000 });
        console.log('✅ Notificación mostrada al usuario');

        // Log de confirmación con detalles
        console.log(`✅ ${successMessage}`, {
          programa: program.articulo,
          otSap: normalizedOtSap,
          maquina: program.machineNumber,
          fecha: new Date().toLocaleString()
        });

      } else {
        // Si la respuesta no tiene la estructura esperada, lanzar error
        console.error('❌ Respuesta del servidor NO exitosa:', response);
        throw new Error('Respuesta del servidor inválida');
      }

    } catch (error: any) {
      console.error('❌ ===== ERROR EN changeStatus =====');
      console.error('❌ Error completo:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ StatusText:', error.statusText);
      console.error('❌ Message:', error.message);
      console.error('❌ Error del servidor:', error.error);

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
        otSap: normalizedOtSap,
        maquina: program.machineNumber,
        estadoDeseado: newStatus,
        error: error.message || 'Error desconocido'
      });
    } finally {
      // Siempre desactivar el indicador de carga, sin importar el resultado
      this.loading.set(false);
      console.log('⏳ Loading desactivado');
      console.log('🎯 ===== FIN changeStatus =====');
    }
  }

  // ===== MÉTODO SIMPLE PARA MANEJAR ACCIONES (RECONSTRUIDO) =====
  // Método simplificado que recibe el elemento directamente y el nuevo estado
  async handleAction(element: MachineProgram, newStatus: MachineProgram['estado']) {
    console.log('🎯 ===== handleAction LLAMADO =====');

    // ===== VERIFICAR PERMISOS =====
    if (!this.canChangeToStatus(newStatus)) {
      this.snackBar.open('No tienes permiso para realizar esta acción', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log('📋 Elemento recibido:');
    console.log('   - OT SAP:', element.otSap);
    console.log('   - Artículo:', element.articulo);
    console.log('   - Cliente:', element.cliente);
    console.log('   - Máquina:', element.machineNumber);
    console.log('   - Estado actual:', element.estado);
    console.log('   - Nuevo estado:', newStatus);

    // Llamar al método changeStatus existente
    await this.changeStatus(element, newStatus);
  }

  // Métodos para manejo de suspensión de programas

  // Inicia el proceso de suspensión de un programa - Abre el diálogo modal
  suspendProgram(program: MachineProgram) {
    this.currentProgramToSuspend = program; // Guardar referencia del programa a suspender
    this.suspendReason = ''; // Limpiar motivo anterior
    this.showSuspendDialog = true; // Mostrar el diálogo de suspensión
  }

  // Establece el programa actual para el menú de corriendo/terminado
  setCurrentProgramForMenu(program: MachineProgram) {
    this.currentProgramForMenu = program; // Guardar referencia del programa para el menú
    console.log('🎯 Programa seleccionado para menú - OT:', program.otSap, 'Art:', program.articulo);
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
    if (!this.currentProgramToSuspend || !this.suspendReason.trim()) {
      return;
    }

    // ===== VERIFICAR PERMISOS =====
    if (!this.canChangeToSuspendido()) {
      this.snackBar.open('No tienes permiso para suspender programas', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log('🎯 ===== INICIO confirmSuspend =====');
    console.log('📋 Programa a suspender:', this.currentProgramToSuspend);
    console.log('📋 Motivo:', this.suspendReason);

    try {
      this.loading.set(true); // Activar indicador de carga
      console.log('⏳ Loading activado');

      console.log(`⏸️ Suspendiendo programa ${this.currentProgramToSuspend.otSap} con motivo: ${this.suspendReason}`);

      // Preparar objeto DTO para suspender el programa con observaciones
      const changeStatusDto = {
        estado: 'SUSPENDIDO', // Estado fijo para suspensión
        observaciones: this.suspendReason.trim() // Motivo de suspensión limpio
      };

      const url = `${environment.apiUrl}/maquinas/${this.currentProgramToSuspend.otSap}/status`;
      console.log('📤 DTO preparado:', changeStatusDto);
      console.log('🌐 URL:', url);
      console.log('📤 Enviando petición PATCH...');

      // Realizar petición HTTP PATCH para suspender el programa usando el endpoint de maquinas
      const response = await firstValueFrom(this.http.patch<any>(url, changeStatusDto));

      console.log('📥 Respuesta recibida del servidor:', response);
      console.log('📥 Respuesta completa:', JSON.stringify(response, null, 2));

      // Verificar que la respuesta del servidor sea exitosa
      if (response && response.success) {
        console.log('✅ Respuesta exitosa del servidor - Programa suspendido'); // Log de éxito

        // Actualizar el estado localmente para reflejar los cambios inmediatamente
        const programs = this.programs(); // Obtener array actual de programas
        console.log('📊 Total de programas antes de actualizar:', programs.length);

        // Usar comparación robusta de strings
        const index = programs.findIndex(p => String(p.otSap).trim() === String(this.currentProgramToSuspend!.otSap).trim());
        console.log('🔍 Índice del programa encontrado:', index, 'OT SAP buscado:', this.currentProgramToSuspend.otSap);

        if (index !== -1) {
          console.log('📋 Programa ANTES de actualizar:', programs[index]);

          // ===== CREAR NUEVO ARRAY CON EL PROGRAMA ACTUALIZADO =====
          // Estrategia: Crear un nuevo array completamente nuevo para forzar detección de cambios
          const updatedPrograms = [...programs]; // Crear copia del array

          // Crear nuevo objeto del programa con el estado actualizado
          updatedPrograms[index] = {
            ...programs[index], // Copiar todos los datos del programa original
            estado: 'SUSPENDIDO' as MachineProgram['estado'], // Nuevo estado
            observaciones: this.suspendReason, // Motivo de suspensión
            lastActionBy: response.data?.lastActionBy || 'Usuario Actual',
            lastActionAt: response.data?.lastActionAt ? new Date(response.data.lastActionAt) : new Date()
          };

          console.log('📋 Programa DESPUÉS de actualizar:', updatedPrograms[index]);

          console.log('📊 Actualizando signal con nuevos programas...');
          this.programs.set(updatedPrograms); // Actualizar la señal reactiva con nuevo array
          console.log('📊 Signal actualizado');
          console.log('📊 Programas filtrados (selectedMachinePrograms):', this.selectedMachinePrograms());

          console.log('🔄 Forzando detección de cambios...');
          // Forzar detección de cambios para actualizar la vista inmediatamente
          this.cdr.detectChanges();
          console.log('🔄 Detección de cambios completada');

          // Forzar actualización adicional después de un tick para asegurar que Angular Material Table se actualice
          setTimeout(() => {
            console.log('🔄 Forzando segunda detección de cambios (tick)...');
            this.cdr.detectChanges();
            console.log('🔄 Segunda detección completada');
          }, 0);
        } else {
          console.error('❌ Programa NO encontrado en el array');
          console.error('❌ OT SAP buscado:', this.currentProgramToSuspend.otSap);
          console.error('❌ OT SAPs disponibles:', programs.map(p => p.otSap));
        }

        // Log de confirmación detallado
        console.log('⏸️ Programa suspendido exitosamente', {
          programa: this.currentProgramToSuspend.articulo,
          maquina: this.currentProgramToSuspend.machineNumber,
          motivo: this.suspendReason,
          fecha: new Date().toLocaleString()
        });

        this.snackBar.open('Programa SUSPENDIDO', 'Cerrar', { duration: 3000 });
        console.log('✅ Notificación mostrada al usuario');

        this.closeSuspendDialog(); // Cerrar el diálogo de suspensión

      } else {
        // Si la respuesta no tiene la estructura esperada, lanzar error
        console.error('❌ Respuesta del servidor NO exitosa:', response);
        throw new Error('Respuesta del servidor inválida');
      }

    } catch (error: any) {
      console.error('❌ ===== ERROR EN confirmSuspend =====');
      console.error('❌ Error completo:', error); // Log del error
      console.error('❌ Status:', error.status);
      console.error('❌ StatusText:', error.statusText);
      console.error('❌ Message:', error.message);
      console.error('❌ Error del servidor:', error.error);

      // Determinar mensaje de error específico basado en el código de estado HTTP
      let errorMessage = 'Error al suspender el programa'; // Mensaje por defecto
      if (error.status === 404) {
        errorMessage = 'Programa no encontrado en la base de datos'; // Programa no existe
      } else if (error.status === 400) {
        errorMessage = 'Datos de suspensión inválidos'; // Datos mal formateados
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al suspender'; // Error del servidor
      }

      this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });

      // Log de error detallado
      console.error(`❌ ${errorMessage}`, {
        programa: this.currentProgramToSuspend?.articulo,
        motivo: this.suspendReason,
        error: error.message || 'Error desconocido'
      });
    } finally {
      // Siempre desactivar el indicador de carga, sin importar el resultado
      this.loading.set(false);
      console.log('⏳ Loading desactivado');
      console.log('🎯 ===== FIN confirmSuspend =====');
    }
  }

  // ===== MÉTODO PARA CARGAR PROGRAMACIÓN DESDE ARCHIVO EXCEL =====
  // Método asíncrono que maneja la selección y procesamiento de archivos Excel
  // 
  // FORMATO ESPERADO DEL ARCHIVO (10 columnas en este orden):
  // (A) MQ IMP - Número de máquina impresora (11-21)
  // (B) ARTICULO F - Código del artículo (único, clave primaria)
  // (C) OT SAP - Orden de trabajo SAP
  // (D) CLIENTE - Nombre del cliente
  // (E) REFERENCIA - Referencia del producto
  // (F) TD - Código TD (Tipo de Diseño)
  // (G) NUMERO DE COLORES - Cantidad de colores (1-10)
  // (H) KILOS - Cantidad en kilogramos
  // (I) COLORES EN MAQUINA - Fecha y hora de preparación de colores (ej: "10-nov-25 05 PM")
  //     IMPORTANTE: Esta columna contiene la FECHA de preparación, NO los nombres de colores
  // (J) SUSTRATOS - Tipo de material base (ej: BOPP, PE, PET)
  //
  // IMPORTANTE: Al cargar nueva programación, solo se eliminan los programas en estado CORRIENDO
  // Los programas en PREPARANDO, LISTO y SUSPENDIDO se mantienen para no perder el trabajo del operario
  async onFileSelected(event: any): Promise<void> {
    console.log('🎯 onFileSelected ejecutado - Evento recibido');

    // ===== VERIFICAR PERMISOS =====
    if (!this.userPermissions().canLoadExcel) {
      this.snackBar.open('No tienes permiso para cargar programación', 'Cerrar', { duration: 3000 });
      // Limpiar el input file
      if (event?.target) event.target.value = '';
      return;
    }

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
    // Validar tamaño del archivo (máximo 500MB para importación masiva multisheet)
    const maxSize = 500 * 1024 * 1024; // 500MB en bytes
    if (file.size > maxSize) {
      console.warn('⚠️ Archivo demasiado grande:', file.size, 'bytes. Máximo:', maxSize, 'bytes');
      this.snackBar.open('El archivo es demasiado grande. Máximo: 500MB', 'Cerrar', { duration: 5000 });
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
      // El backend procesará el Excel con múltiples hojas (MAQ 11, MAQ 12, etc.)
      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/maquinas/import/excel-multisheet`, formData)
      );

      // ===== VALIDACIÓN DE LA RESPUESTA DEL SERVIDOR =====
      // Verificar que la respuesta del servidor sea exitosa
      // El backend retorna: { message, sheetsProcessed, totalCreated, totalErrors, results }
      if (response && response.message === 'Importación completada') {
        console.log('📡 Respuesta del servidor:', response);
        console.log('� Estadísticas de importación:', {
          hojasProcesadas: response.sheetsProcessed,
          registrosCreados: response.totalCreated,
          errores: response.totalErrors,
          resultadosPorMaquina: response.results
        });

        // ===== RECARGAR DATOS DESDE LA BASE DE DATOS =====
        // IMPORTANTE: Después de subir el Excel, recargar todos los datos desde la base de datos
        // Esto asegura que se muestren los datos guardados con la información de la tabla de diseño
        console.log('🔄 Recargando datos desde la base de datos...');

        // Limpiar mensajes al cargar nueva programación
        this.clearAllMessages();

        await this.loadPrograms();

        // ===== LOG DE ÉXITO DETALLADO =====
        // Log de éxito con estadísticas detalladas de la carga
        const programasActualizados = this.programs();
        console.log('✅ Archivo procesado exitosamente y datos recargados', {
          programasCreados: response.totalCreated, // Cantidad de programas nuevos creados
          programasEnBD: programasActualizados.length, // Total de programas en la base de datos
          programasPreparando: programasActualizados.filter(p => p.estado === 'PREPARANDO' || p.estado === 'SIN_ASIGNAR').length,
          programasListos: programasActualizados.filter(p => p.estado === 'LISTO').length,
          programasSuspendidos: programasActualizados.filter(p => p.estado === 'SUSPENDIDO').length,
          programasCorriendo: programasActualizados.filter(p => p.estado === 'CORRIENDO').length,
          maquinasProgramadas: new Set(programasActualizados.map(p => p.machineNumber)).size,
          hojasProcesadas: response.sheetsProcessed,
          errores: response.totalErrors,
          archivo: file.name
        });

        // ===== MOSTRAR MENSAJE AL USUARIO =====
        // Mostrar notificación de éxito al usuario con información de la carga
        const mensajeExito = response.totalErrors > 0
          ? `✅ Importación completada: ${response.totalCreated} programas creados, ${response.totalErrors} errores en ${response.sheetsProcessed} hojas`
          : `✅ Importación exitosa: ${response.totalCreated} programas creados desde ${response.sheetsProcessed} hojas`;

        this.snackBar.open(mensajeExito, 'Cerrar', { duration: 6000 });

        // ===== LIMPIAR INPUT FILE =====
        // Limpiar el input file para permitir seleccionar el mismo archivo nuevamente
        event.target.value = '';

        // ===== SELECCIONAR MÁQUINA AUTOMÁTICAMENTE =====
        // Si hay programas cargados, seleccionar automáticamente la primera máquina con programas
        const programasFinales = this.programs();
        if (programasFinales.length > 0) {
          const firstMachineWithPrograms = programasFinales[0].machineNumber; // Obtener número de la primera máquina
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

        // Intentar obtener el mensaje detallado del backend
        if (error.error && error.error.message) {
          technicalDetails = error.error.message;
        } else {
          technicalDetails = 'Verifica que el archivo tenga las columnas correctas y el formato esperado.';
        }
      } else if (error.status === 413) {
        // Error 413: Payload Too Large - Archivo demasiado grande
        errorMessage = 'El archivo es demasiado grande';
        technicalDetails = 'El tamaño máximo permitido es 500MB.';
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
   * Obtiene el texto a mostrar para cada estado de programa
   * Convierte los estados internos a texto legible para el usuario
   */
  getEstadoDisplay(estado: string): string {
    // console.log('🔍 getEstadoDisplay llamado con estado:', estado, 'tipo:', typeof estado);

    // Normalizar el estado: trim y uppercase para manejar cualquier formato
    const estadoNormalizado = (estado || '').toString().trim().toUpperCase();
    // console.log('🔍 Estado normalizado:', estadoNormalizado);

    const displayTexts: Record<string, string> = {
      'SIN_ASIGNAR': 'SIN ASIGNAR',
      'PREPARANDO': 'PREPARANDO',
      'LISTO': 'PREPARADO',        // LISTO se muestra como PREPARADO
      'SUSPENDIDO': 'SUSPENDIDO',
      'CORRIENDO': 'CORRIENDO',
      'TERMINADO': 'TERMINADO'
    };

    const result = displayTexts[estadoNormalizado] || (estado ? estado.replace('_', ' ') : 'SIN ASIGNAR');
    // console.log('🔍 getEstadoDisplay retorna:', result);

    // Retorna el texto correspondiente o el estado original si no se encuentra
    return result;
  }

  // ===== MÉTODO PARA CALCULAR Y FORMATEAR TIEMPO TRANSCURRIDO =====
  // Calcula la diferencia entre dos fechas y la formatea en horas y minutos
  // Útil para mostrar duración de procesos o tiempo desde última acción
  // Parámetros:
  //   - startDate: Fecha de inicio (obligatoria)
  //   - endDate: Fecha de fin (opcional, usa fecha actual si no se proporciona)
  // Retorna: String con formato "Xh Ym" (ej: "2h 30m")
  formatElapsedTime(startDate: Date, endDate?: Date): string {
    // Si no se proporciona fecha final, usar la fecha y hora actual
    const end = endDate || new Date();

    // Calcular diferencia en milisegundos entre las dos fechas
    // getTime() convierte la fecha a timestamp (milisegundos desde 1970)
    const diff = end.getTime() - startDate.getTime();

    // Convertir milisegundos a horas completas
    // 1 hora = 1000ms * 60s * 60min = 3,600,000ms
    // Math.floor redondea hacia abajo para obtener solo horas completas
    const hours = Math.floor(diff / (1000 * 60 * 60));

    // Calcular minutos restantes después de quitar las horas
    // Usar módulo (%) para obtener el resto después de dividir por horas
    // Luego dividir por 1000ms * 60s para convertir a minutos
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Retornar string formateado con horas y minutos
    return hours + 'h ' + minutes + 'm';
  }

  // ===== MÉTODO PARA CONVERTIR PROGRESO A PORCENTAJE CSS =====
  // Convierte un valor numérico de progreso (0-100) a formato de porcentaje CSS
  // Asegura que el valor esté siempre entre 0% y 100% para evitar errores visuales
  // Parámetro: progreso - Valor numérico del progreso (puede ser cualquier número)
  // Retorna: String con formato "X%" (ej: "75%")
  getProgressWidth(progreso: number): string {
    // Limitar el valor entre 0 y 100 usando Math.min y Math.max
    // Math.max(0, progreso): Asegura que no sea menor a 0
    // Math.min(100, ...): Asegura que no sea mayor a 100
    // Luego agregar el símbolo de porcentaje (%)
    return Math.min(100, Math.max(0, progreso)) + '%';
  }

  // ===== MÉTODO PARA VERIFICAR SI UNA MÁQUINA ESTÁ ACTIVA =====
  // Verifica si una máquina tiene al menos un programa en estado CORRIENDO
  // Usado para determinar el estado visual de actividad de la máquina en la UI
  // Parámetro: machineNumber - Número de la máquina (11-21)
  // Retorna: true si hay al menos un programa corriendo, false si no
  isMachineActive(machineNumber: number): boolean {
    // Filtrar todos los programas para obtener solo los de la máquina específica
    const programs = this.programs().filter(p => p.machineNumber === machineNumber);

    // Verificar si ALGÚN programa está en estado CORRIENDO usando some()
    // some() retorna true si al menos un elemento cumple la condición
    return programs.some(p => p.estado === 'CORRIENDO');
  }

  // ===== MÉTODO PARA GENERAR RESUMEN TEXTUAL DEL ESTADO DE UNA MÁQUINA =====
  // Genera un resumen legible del estado de una máquina mostrando cantidad de programas
  // Muestra programas corriendo y listos de forma concisa
  // ACTUALIZADO CON NUEVOS ESTADOS (incluye PREPARANDO)
  // Parámetro: machineNumber - Número de la máquina (11-21)
  // Retorna: String con resumen (ej: "2 corriendo, 5 listos" o "7 programas listos")
  getMachineSummary(machineNumber: number): string {
    // Filtrar todos los programas para obtener solo los de la máquina específica
    const programs = this.programs().filter(p => p.machineNumber === machineNumber);

    // Contar programas en estado CORRIENDO
    const running = programs.filter(p => p.estado === 'CORRIENDO').length;

    // Contar programas en estados LISTO o PREPARANDO (ambos se consideran "listos")
    const ready = programs.filter(p =>
      p.estado === 'LISTO' ||
      p.estado === 'PREPARANDO'
    ).length;

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
    // ===== VERIFICAR PERMISOS =====
    if (!this.userPermissions().canDownloadTemplate) {
      this.snackBar.open('No tienes permiso para exportar a Excel', 'Cerrar', { duration: 3000 });
      return;
    }

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
      });
    } catch (error) {
      console.error('❌ Error exportando a Excel:', error);
      this.loading.set(false);
    }
  }

  /**
   * Limpiar toda la programación de máquinas
   * Requiere confirmación del usuario y permisos adecuados
   */
  async clearAllProgramming() {
    // ===== VERIFICAR PERMISOS =====
    if (!this.userPermissions().canClearPrograms) {
      this.snackBar.open('No tienes permiso para limpiar la programación', 'Cerrar', { duration: 3000 });
      return;
    }

    // ===== CONFIRMACIÓN =====
    if (!confirm('¿Estás seguro de que deseas ELIMINAR TODA la programación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      this.loading.set(true);
      console.log('🗑️ Limpiando toda la programación...');

      const response = await firstValueFrom(
        this.http.delete<any>(`${environment.apiUrl}/maquinas/clear-all`)
      );

      if (response && response.success) {
        this.snackBar.open(response.message || 'Programación limpiada exitosamente', 'Cerrar', { duration: 5000 });

        // Limpiar mensajes locales también
        this.programMessages.set(new Map());
        this.saveMessagesToStorage();

        // Recargar datos (estará vacío)
        await this.loadPrograms();

        console.log('✅ Programación limpiada exitosamente');
      } else {
        throw new Error(response?.message || 'Error al limpiar programación');
      }
    } catch (error: any) {
      console.error('❌ Error limpiando programación:', error);
      this.snackBar.open(error.message || 'Error al conectar con el servidor', 'Cerrar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Método para refrescar los datos de todas las máquinas
   */
  async refreshData() {
    try {
      // ===== LOG DE INICIO DE RECARGA =====
      console.log('🔄 Refrescando datos de máquinas desde la base de datos...');

      // ===== MOSTRAR NOTIFICACIÓN AL USUARIO =====
      // Informar al usuario que se están actualizando los datos
      this.snackBar.open('Actualizando datos...', '', { duration: 2000 });

      // ===== GUARDAR MÁQUINA SELECCIONADA =====
      // Guardar el número de máquina seleccionada para restaurarla después de recargar
      const selectedMachine = this.selectedMachineNumber();
      console.log('📌 Máquina seleccionada antes de recargar:', selectedMachine);

      // ===== LLAMAR AL MÉTODO DE CARGA =====
      // Reutilizar el método loadPrograms() que ya tiene toda la lógica de carga
      // Este método maneja automáticamente el estado de carga y los errores
      await this.loadPrograms();

      // ===== RESTAURAR MÁQUINA SELECCIONADA =====
      // Si había una máquina seleccionada, volver a seleccionarla
      if (selectedMachine) {
        console.log('📌 Restaurando máquina seleccionada:', selectedMachine);
        this.selectedMachineNumber.set(selectedMachine);
      }

      // ===== FORZAR DETECCIÓN DE CAMBIOS =====
      // Forzar Angular a detectar los cambios y actualizar la vista
      console.log('🔄 Forzando detección de cambios...');
      this.cdr.detectChanges();

      // Forzar actualización adicional después de un tick
      setTimeout(() => {
        console.log('🔄 Forzando segunda detección de cambios (tick)...');
        this.cdr.detectChanges();
        console.log('📊 Programas después de refrescar:', this.programs().length);
        console.log('📊 Programas de máquina seleccionada:', this.selectedMachinePrograms().length);
      }, 0);

      // ===== MOSTRAR NOTIFICACIÓN DE ÉXITO =====
      // Informar al usuario que los datos se actualizaron correctamente
      this.snackBar.open('✅ Datos actualizados correctamente', 'Cerrar', { duration: 3000 });

      // ===== LOG DE CONFIRMACIÓN =====
      console.log('✅ Datos de máquinas refrescados exitosamente');
      console.log('📊 Total de programas cargados:', this.programs().length);

    } catch (error) {
      console.error('❌ Error al refrescar datos:', error);
      this.snackBar.open('❌ Error al actualizar datos', 'Cerrar', { duration: 5000 });
    }
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
    const coloresArray = this.prepareColorsForFF459(program.colores, program);

    // ===== LOG DE DATOS DEL PROGRAMA =====
    console.log('📊 Datos del programa para FF-459:', {
      cliente: program.cliente,
      referencia: program.referencia,
      articulo: program.articulo,
      otSap: program.otSap,
      machineNumber: program.machineNumber,
      numeroMaquina: program.numeroMaquina,
      kilos: program.kilos,
      sustrato: program.sustrato,
      td: program.td,
      colores: program.colores
    });

    try {
      // ===== CARGAR PLANTILLA HTML DESDE EL ARCHIVO =====
      console.log('📄 Cargando plantilla HTML desde templates/print-ff459.html (Bypass Interceptors)');
      const response = await firstValueFrom(
        this.templateHttp.get('/templates/print-ff459.html', { responseType: 'text' })
      );

      let htmlContent = response;

      // ===== REEMPLAZAR VARIABLES EN EL HTML =====
      // Reemplazar todas las variables ${...} con los datos del programa
      // Usar replace con regex para manejar diferentes formatos de comillas
      htmlContent = htmlContent
        .replace(/\$\{fechaActual\}/g, fechaActual)
        .replace(/\$\{nombreCompleto\}/g, nombreCompleto)
        .replace(/\$\{program\.cliente\s*\|\|\s*[\s\S]*?['"]{2}\}/g, program.cliente || '')
        .replace(/\$\{program\.referencia\s*\|\|\s*[\s\S]*?['"]{2}\}/g, program.referencia || '')
        .replace(/\$\{program\.td\s*\|\|\s*[\s\S]*?['"]{2}\}/g, program.td || '')
        .replace(/\$\{program\.otSap\s*\|\|\s*[\s\S]*?['"]{2}\}/g, program.otSap || '')
        .replace(/\$\{program\.machineNumber\s*\|\|\s*program\.numeroMaquina\s*\|\|\s*[\s\S]*?['"]{2}\}/g, String(program.machineNumber || program.numeroMaquina || ''))
        .replace(/\$\{program\.kilos\s*\|\|\s*0\}\s*kg/g, this.formatKilosForPrint(program.kilos) + ' kg')
        .replace(/\$\{program\.metros\s*\|\|\s*0\}\s*m/g, (program.metros ? Math.floor(program.metros) : 0) + ' m')
        .replace(/\$\{program\.sustrato\s*\|\|\s*[\s\S]*?['"]{2}\}/g, program.sustrato || '')
        .replace(/\$\{program\.articulo\s*\|\|\s*[\s\S]*?['"]{2}\}/g, program.articulo || '');



      // Reemplazar colores individuales (color1 a color10)
      coloresArray.forEach((colorObj: any, index: number) => {
        const colorNum = index + 1;
        console.log(`🎨 Color ${colorNum}:`, {
          color: colorObj.color,
          lineaturaAnilox: colorObj.lineaturaAnilox,
          codigoAnilox: colorObj.codigoAnilox
        });
        htmlContent = htmlContent.replaceAll(`\${color${colorNum}}`, colorObj.color || '');
        htmlContent = htmlContent.replaceAll(`\${lineatura${colorNum}}`, colorObj.lineaturaAnilox || '');
        htmlContent = htmlContent.replaceAll(`\${codigoAnilox${colorNum}}`, colorObj.codigoAnilox || '');
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
  private prepareColorsForFF459(colores: string[], program: MachineProgram): any[] {
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

        // Obtener datos de anilox seleccionados para este color
        const key = `${program.otSap}-${index}`;
        const aniloxData = this.selectedAniloxData().get(key);

        console.log(`🔍 Color ${index + 1} (${color}):`, {
          key,
          aniloxData: aniloxData ? JSON.parse(JSON.stringify(aniloxData)) : undefined,
          hasAnilox: aniloxData && aniloxData.anilox,
          aniloxDetails: aniloxData?.anilox,
          selectedAniloxDataKeys: Array.from(this.selectedAniloxData().keys())
        });

        if (aniloxData && aniloxData.anilox) {
          // Si hay un anilox seleccionado, obtener su lineatura, volumen y código
          const lineatura = aniloxData.anilox.lineatura || '';
          const volumen = aniloxData.anilox.volumen_real || '';


          // Formato: "120 - 3.5" (sin LPI ni BCM)
          coloresFF459[index].lineaturaAnilox = lineatura && volumen
            ? `${lineatura} - ${volumen}`
            : '';
          coloresFF459[index].codigoAnilox = aniloxData.anilox.codigo || '';
        }
      });
    }

    // ===== LOG DE COLORES PREPARADOS =====
    console.log('🎨 Colores preparados para FF-459:', coloresFF459);

    // ===== RETORNAR ARRAY DE 10 COLORES =====
    return coloresFF459;
  }

  // ===== MÉTODO AUXILIAR PARA FORMATEAR KILOS EN IMPRESIÓN =====
  // Formatea los kilos: hasta 3 decimales para < 1000, y 4 decimales fijos para >= 1000
  private formatKilosForPrint(kilos: number | null | undefined): string {
    if (kilos === null || kilos === undefined) {
      return '0';
    }
    // Retornar parte entera como string puro (quitar decimales)
    return Math.floor(kilos).toString();
  }

  // ===== MÉTODO PARA FORMATEAR KILOS EN TABLA =====
  // Formatea los kilos: con hasta 2 decimales si los tiene
  formatKilosForDisplay(kilos: number | null | undefined): string {
    if (kilos === null || kilos === undefined) {
      return '0';
    }

    // Retornar parte entera como string puro (quitar decimales)
    return Math.floor(kilos).toString();
  }

  // ===== MÉTODO PARA FORMATEAR METROS EN TABLA =====
  // Según solicitud: solo números antes de la coma, sin puntos ni comas
  formatMetrosForDisplay(metros: number | null | undefined): string {
    if (metros === null || metros === undefined) {
      return '0';
    }
    // Retornar parte entera como string puro
    return Math.floor(metros).toString();
  }

  // ===== MÉTODOS PARA PERSISTENCIA DE MENSAJES =====

  /**
   * Cargar mensajes desde localStorage
   */
  private loadMessagesFromStorage() {
    try {
      console.log('🔍 Intentando cargar mensajes desde localStorage...');
      const storedMessages = localStorage.getItem(this.MESSAGES_STORAGE_KEY);
      console.log('📦 Datos en localStorage:', storedMessages);

      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        console.log('📋 Mensajes parseados:', parsedMessages);

        const messagesMap = new Map<string, { message: string, timestamp: Date, sender: string, read: boolean }>();

        // Convertir el objeto almacenado de vuelta a Map con fechas correctas
        Object.entries(parsedMessages).forEach(([otSap, messageData]: [string, any]) => {
          messagesMap.set(otSap, {
            ...messageData,
            timestamp: new Date(messageData.timestamp) // Convertir string de fecha de vuelta a Date
          });
        });

        this.programMessages.set(messagesMap);
        console.log('💾 Mensajes cargados desde localStorage:', messagesMap.size, 'mensajes');
        console.log('📝 Contenido del Map:', Array.from(messagesMap.entries()));
      } else {
        console.log('📭 No hay mensajes almacenados en localStorage');
        this.programMessages.set(new Map());
      }
    } catch (error) {
      console.error('❌ Error cargando mensajes desde localStorage:', error);
      // Si hay error, inicializar con Map vacío
      this.programMessages.set(new Map());
    }
  }

  /**
   * Guardar mensajes en localStorage
   */
  private saveMessagesToStorage() {
    try {
      const messagesMap = this.programMessages();
      console.log('💾 Guardando mensajes en localStorage:', messagesMap.size, 'mensajes');
      console.log('📝 Contenido a guardar:', Array.from(messagesMap.entries()));

      // Convertir Map a objeto para poder serializarlo
      const messagesObject: any = {};
      messagesMap.forEach((messageData, otSap) => {
        messagesObject[otSap] = {
          ...messageData,
          timestamp: messageData.timestamp.toISOString() // Convertir Date a string para serialización
        };
      });

      const jsonString = JSON.stringify(messagesObject);
      console.log('📦 JSON a almacenar:', jsonString);

      localStorage.setItem(this.MESSAGES_STORAGE_KEY, jsonString);
      console.log('✅ Mensajes guardados exitosamente en localStorage');

      // Verificar que se guardó correctamente
      const verification = localStorage.getItem(this.MESSAGES_STORAGE_KEY);
      console.log('🔍 Verificación - datos guardados:', verification);

    } catch (error) {
      console.error('❌ Error guardando mensajes en localStorage:', error);
    }
  }

  // ===== MÉTODOS PARA SISTEMA DE MENSAJES DE ADMINISTRADOR =====

  /**
   * Abrir diálogo para enviar/editar mensaje a un programa específico
   * Solo disponible para administradores y supervisores
   */
  openMessageDialog(program: MachineProgram) {
    console.log('💬 Abriendo diálogo de mensaje para programa:', program.articulo);

    // Verificar permisos
    if (!this.userPermissions().canSendMessages) {
      this.snackBar.open('No tienes permisos para enviar mensajes', 'Cerrar', { duration: 3000 });
      return;
    }

    this.messageProgram = program;

    // Verificar si ya existe un mensaje para este programa
    const existingMessage = this.programMessages().get(program.otSap);
    if (existingMessage) {
      this.currentMessage = existingMessage.message;
      this.isEditingMessage = true;
    } else {
      this.currentMessage = '';
      this.isEditingMessage = false;
    }

    this.showMessageDialog = true;
  }

  /**
   * Cerrar diálogo de mensajes
   */
  closeMessageDialog() {
    this.showMessageDialog = false;
    this.messageProgram = null;
    this.currentMessage = '';
    this.isEditingMessage = false;

    // Limpiar timeout si existe
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
  }

  /**
   * Enviar/actualizar mensaje al programa seleccionado
   */
  async sendMessage() {
    if (!this.messageProgram || !this.currentMessage.trim()) {
      return;
    }

    try {
      this.loading.set(true);

      const currentUser = this.authService.getCurrentUser();
      const messageData = {
        message: this.currentMessage.trim(),
        timestamp: new Date(),
        sender: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Administrador',
        read: false
      };

      console.log('📤 Enviando/actualizando mensaje:', messageData);

      // Actualizar el mapa de mensajes
      const messages = new Map(this.programMessages());
      messages.set(this.messageProgram.otSap, messageData);
      this.programMessages.set(messages);

      // Guardar en localStorage para persistencia
      this.saveMessagesToStorage();

      // ===== NUEVO: Enviar el mensaje al backend para guardarlo en observaciones =====
      try {
        const normalizedOtSap = String(this.messageProgram.otSap).trim();
        const url = `${environment.apiUrl}/maquinas/${encodeURIComponent(normalizedOtSap)}/status`;

        console.log('📤 Enviando mensaje al backend:', url);

        // Enviar PATCH al backend para actualizar las observaciones
        const response = await firstValueFrom(this.http.patch<any>(url, {
          estado: this.messageProgram.estado, // Mantener el estado actual
          observaciones: this.currentMessage.trim() // Guardar el mensaje en observaciones
        }));

        console.log('✅ Mensaje guardado en backend:', response);

        // Actualizar el programa localmente con las nuevas observaciones
        const programs = this.programs();
        const programIndex = programs.findIndex(p => String(p.otSap).trim() === normalizedOtSap);

        if (programIndex !== -1) {
          const updatedPrograms = programs.map((p, index) => {
            if (index === programIndex) {
              return {
                ...p,
                observaciones: this.currentMessage.trim(),
                lastActionBy: response.data?.lastActionBy || currentUser?.firstName + ' ' + currentUser?.lastName,
                lastActionAt: new Date()
              };
            }
            return p;
          });

          this.programs.set(updatedPrograms);
          console.log('✅ Programa actualizado localmente con observaciones');
        }

      } catch (backendError: any) {
        console.error('❌ Error enviando mensaje al backend:', backendError);
        // Continuar aunque falle el backend - el mensaje se guarda en localStorage
      }

      const actionText = this.isEditingMessage ? 'actualizado' : 'enviado';
      this.snackBar.open(`Mensaje ${actionText} exitosamente`, 'Cerrar', { duration: 3000 });
      this.closeMessageDialog();

    } catch (error: any) {
      console.error('❌ Error enviando mensaje:', error);
      this.snackBar.open('Error al enviar mensaje', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Mostrar mensaje para un programa específico
   */
  showMessage(program: MachineProgram) {
    console.log('👁️ Mostrando mensaje para programa:', program.articulo);

    const messageData = this.programMessages().get(program.otSap);
    if (!messageData) {
      this.snackBar.open('No hay mensajes para este programa', 'Cerrar', { duration: 3000 });
      return;
    }

    this.currentMessage = messageData.message;
    this.messageProgram = program;
    this.showMessageDialog = true;

    // Marcar como leído
    const messages = new Map(this.programMessages());
    const updatedMessage = { ...messageData, read: true };
    messages.set(program.otSap, updatedMessage);
    this.programMessages.set(messages);

    // Guardar en localStorage
    this.saveMessagesToStorage();

    // Auto-cerrar después de 20 segundos
    this.messageTimeout = setTimeout(() => {
      this.closeMessageDialog();
    }, 20000);
  }

  /**
   * Eliminar mensaje de un programa (solo cuando está TERMINADO)
   */
  deleteMessage(program: MachineProgram) {
    if (program.estado !== 'TERMINADO') {
      this.snackBar.open('Solo se pueden eliminar mensajes de programas TERMINADOS', 'Cerrar', { duration: 4000 });
      return;
    }

    if (!this.userPermissions().canSendMessages) {
      this.snackBar.open('No tienes permisos para eliminar mensajes', 'Cerrar', { duration: 3000 });
      return;
    }

    const messages = new Map(this.programMessages());
    messages.delete(program.otSap);
    this.programMessages.set(messages);

    // Guardar en localStorage
    this.saveMessagesToStorage();

    this.snackBar.open('Mensaje eliminado exitosamente', 'Cerrar', { duration: 3000 });
    this.closeMessageDialog();
  }

  /**
   * Verificar si un programa tiene mensajes no leídos
   */
  hasUnreadMessages(program: MachineProgram): boolean {
    const messageData = this.programMessages().get(program.otSap);
    return messageData ? !messageData.read : false;
  }

  /**
   * Verificar si un programa tiene mensajes (leídos o no leídos)
   */
  hasMessages(program: MachineProgram): boolean {
    return this.programMessages().has(program.otSap);
  }

  /**
   * Verificar si el usuario puede enviar mensajes
   */
  canSendMessages(): boolean {
    return this.userPermissions().canSendMessages;
  }

  // ===== MÉTODOS DE VERIFICACIÓN DE PERMISOS PARA ACCIONES DE MÁQUINAS =====

  /**
   * Verificar si el usuario puede cambiar el estado a PREPARANDO
   */
  canChangeToPreparando(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_PREALISTANDO);
  }

  /**
   * Verificar si el usuario puede cambiar el estado a LISTO
   */
  canChangeToListo(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_LISTO);
  }

  /**
   * Verificar si el usuario puede cambiar el estado a CORRIENDO
   */
  canChangeToCorriendo(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_CORRIENDO);
  }

  /**
   * Verificar si el usuario puede cambiar el estado a TERMINADO
   */
  canChangeToTerminado(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_TERMINADO);
  }

  /**
   * Verificar si el usuario puede cambiar el estado a SUSPENDIDO
   */
  canChangeToSuspendido(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_SUSPENDIDO);
  }

  /**
   * Verificar si el usuario puede enviar mensajes (usando el nuevo sistema de permisos)
   */
  canSendMessagesNew(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_SEND_MESSAGE);
  }

  /**
   * Verificar si el usuario puede imprimir
   */
  canPrint(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_PRINT);
  }

  /**
   * Verificar si el usuario puede cambiar a un estado específico
   * @param status El estado al que se quiere cambiar
   * @returns true si tiene permiso, false si no
   */
  canChangeToStatus(status: MachineProgram['estado']): boolean {
    switch (status) {
      case 'PREPARANDO':
        return this.canChangeToPreparando();
      case 'LISTO':
        return this.canChangeToListo();
      case 'CORRIENDO':
        return this.canChangeToCorriendo();
      case 'TERMINADO':
        return this.canChangeToTerminado();
      case 'SUSPENDIDO':
        return this.canChangeToSuspendido();
      default:
        return false;
    }
  }

  /**
   * Método de prueba para verificar localStorage (solo para debugging)
   * Puede ser llamado desde la consola del navegador
   */
  testLocalStorage() {
    console.log('🧪 === PRUEBA DE LOCALSTORAGE ===');

    // Verificar si localStorage está disponible
    if (typeof Storage !== "undefined") {
      console.log('✅ localStorage está disponible');
    } else {
      console.log('❌ localStorage NO está disponible');
      return;
    }

    // Crear mensaje de prueba
    const testMessage = {
      message: 'Mensaje de prueba',
      timestamp: new Date(),
      sender: 'Test User',
      read: false
    };

    // Guardar mensaje de prueba
    const testMap = new Map();
    testMap.set('TEST123', testMessage);
    this.programMessages.set(testMap);
    this.saveMessagesToStorage();

    // Limpiar y recargar
    this.programMessages.set(new Map());
    this.loadMessagesFromStorage();

    // Verificar resultado
    const reloadedMessages = this.programMessages();
    if (reloadedMessages.has('TEST123')) {
      console.log('✅ Prueba exitosa: mensaje persistió correctamente');
      console.log('📝 Mensaje recuperado:', reloadedMessages.get('TEST123'));
    } else {
      console.log('❌ Prueba fallida: mensaje no persistió');
    }

    // Limpiar mensaje de prueba
    const cleanMap = new Map(reloadedMessages);
    cleanMap.delete('TEST123');
    this.programMessages.set(cleanMap);
    this.saveMessagesToStorage();

    console.log('🧪 === FIN DE PRUEBA ===');
  }

  /**
   * Limpiar mensajes al cargar nueva programación
   * IMPORTANTE: Solo limpia mensajes de programas que NO están SUSPENDIDOS
   * Los mensajes de programas suspendidos se mantienen para preservar la información
   */
  clearAllMessages() {
    try {
      // Obtener programas actuales
      const currentPrograms = this.programs();

      // Obtener mensajes actuales
      const currentMessages = this.programMessages();

      // Crear nuevo Map solo con mensajes de programas SUSPENDIDOS
      const messagesToKeep = new Map();

      currentMessages.forEach((messageData, otSap) => {
        // Buscar el programa correspondiente
        const program = currentPrograms.find(p => p.otSap === otSap);

        // Si el programa existe y está SUSPENDIDO, mantener el mensaje
        if (program && program.estado === 'SUSPENDIDO') {
          messagesToKeep.set(otSap, messageData);
          console.log(`💾 Manteniendo mensaje de programa suspendido: ${otSap}`);
        } else {
          console.log(`🧹 Eliminando mensaje de programa no suspendido: ${otSap}`);
        }
      });

      // Actualizar el Map de mensajes
      this.programMessages.set(messagesToKeep);

      // Guardar en localStorage
      this.saveMessagesToStorage();

      console.log(`🧹 Mensajes limpiados. Mantenidos: ${messagesToKeep.size}, Eliminados: ${currentMessages.size - messagesToKeep.size}`);
    } catch (error) {
      console.error('❌ Error limpiando mensajes:', error);
    }
  }

  /**
   * Método para cambiar estado con validación de preparando -> listo
   */
  async handleActionWithValidation(program: MachineProgram, newStatus: MachineProgram['estado']) {
    console.log('🎯 handleActionWithValidation:', program.articulo, 'de', program.estado, 'a', newStatus);

    // Validación especial: LISTO solo disponible si está en PREPARANDO
    if (newStatus === 'LISTO' && program.estado !== 'PREPARANDO') {
      this.snackBar.open('El programa debe estar en PREPARANDO antes de marcarlo como LISTO', 'Cerrar', { duration: 4000 });
      return;
    }

    // Llamar al método original
    await this.handleAction(program, newStatus);
  }

}
