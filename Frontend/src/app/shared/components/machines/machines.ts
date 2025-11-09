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
  estado: 'LISTO' | 'CORRIENDO' | 'SUSPENDIDO' | 'TERMINADO'; // Estado actual del programa
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
    FormsModule // Formularios de Angular
  ],
  templateUrl: './machines.html', // Archivo de plantilla HTML
  styleUrls: ['./machines.scss'] // Archivo de estilos SCSS
})
export class MachinesComponent implements OnInit {
  // Inyección de dependencias usando la nueva sintaxis inject()
  private http = inject(HttpClient); // Cliente HTTP para llamadas al API
  private authService = inject(AuthService); // Servicio de autenticación
  
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
  
  // Programas de la máquina seleccionada - Filtra programas por número de máquina
  selectedMachinePrograms = computed(() => {
    const selected = this.selectedMachineNumber(); // Obtiene el número de máquina seleccionada
    if (!selected) return []; // Si no hay máquina seleccionada, retorna array vacío
    // Filtra todos los programas para obtener solo los de la máquina seleccionada
    return this.programs().filter(p => p.machineNumber === selected);
  });

  // Estadísticas calculadas de la máquina seleccionada
  selectedMachineStats = computed((): MachineStats => {
    const programs = this.selectedMachinePrograms(); // Obtiene programas de la máquina seleccionada
    return {
      totalPrograms: programs.length, // Cuenta total de programas
      // Cuenta programas por estado usando filter
      readyPrograms: programs.filter(p => p.estado === 'LISTO').length,
      runningPrograms: programs.filter(p => p.estado === 'CORRIENDO').length,
      suspendedPrograms: programs.filter(p => p.estado === 'SUSPENDIDO').length,
      completedPrograms: programs.filter(p => p.estado === 'TERMINADO').length
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

  // Método asíncrono para cargar datos de máquinas desde la tabla 'maquinas'
  async loadPrograms() {
    this.loading.set(true); // Activar indicador de carga
    try {
      // Verificar si el usuario está autenticado antes de hacer la petición
      if (!this.authService.isLoggedIn()) {
        // Redirigir a login si no está autenticado
        window.location.href = '/login';
        return; // Salir del método
      }

      console.log('🔄 Cargando datos de máquinas desde tabla "maquinas":', `${environment.apiUrl}/maquinas`);
      
      // Realizar petición HTTP GET al endpoint de la tabla maquinas
      // Ordenar por fecha de tinta en máquina de manera descendente (más reciente primero)
      const response = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/maquinas?orderBy=fechaTintaEnMaquina&order=desc`));
      
      console.log('📡 Respuesta del servidor (tabla maquinas):', response); // Log de la respuesta completa
      
      // Verificar que la respuesta tenga la estructura esperada
      if (response && response.success && response.data) {
        // Mapear los datos del API al formato que usa el frontend
        const programs: MachineProgram[] = response.data.map((program: any) => {
          // Parsear colores - pueden venir como string JSON o array
          let colores: string[] = [];
          if (program.colores) {
            try {
              // Si es string, parsearlo como JSON; si es array, usarlo directamente
              colores = typeof program.colores === 'string' 
                ? JSON.parse(program.colores) 
                : program.colores;
            } catch (e) {
              // Si hay error al parsear, usar array vacío y mostrar warning
              console.warn('Error parseando colores para programa:', program.id, e);
              colores = [];
            }
          }

          // Retornar objeto MachineProgram con valores por defecto para campos opcionales
          return {
            id: program.id, // ID del programa
            numeroMaquina: program.numeroMaquina || program.machineNumber || 11, // Número de máquina (11-21)
            articulo: program.articulo || '', // Código del artículo (vacío si no existe)
            otSap: program.otSap || '', // Orden de trabajo SAP (vacío si no existe)
            cliente: program.cliente || '', // Nombre del cliente (vacío si no existe)
            referencia: program.referencia || '', // Referencia del producto (vacío si no existe)
            td: program.td || '', // Código TD (vacío si no existe)
            numeroColores: program.numeroColores || colores.length, // Número de colores
            colores: colores, // Array de colores parseado
            kilos: program.kilos || 0, // Cantidad en kilos (0 si no existe)
            fechaTintaEnMaquina: program.fechaTintaEnMaquina ? new Date(program.fechaTintaEnMaquina) : new Date(), // Fecha de tinta en máquina
            sustrato: program.sustrato || '', // Tipo de sustrato (vacío si no existe)
            estado: program.estado || 'LISTO', // Estado del programa (LISTO por defecto)
            observaciones: program.observaciones || '', // Observaciones (vacío si no existe)
            // Campos adicionales para compatibilidad
            machineNumber: program.numeroMaquina || program.machineNumber || 11, // Alias para compatibilidad
            // Construir nombre del usuario que hizo la última acción
            lastActionBy: program.updatedByUser?.firstName && program.updatedByUser?.lastName 
              ? `${program.updatedByUser.firstName} ${program.updatedByUser.lastName}`.trim()
              : program.lastActionBy || 'Sistema',
            // Convertir fechas de string a objeto Date
            lastActionAt: program.updatedAt ? new Date(program.updatedAt) : 
                         program.lastActionAt ? new Date(program.lastActionAt) : new Date()
          };
        });
        
        console.log(`✅ ${programs.length} programas cargados exitosamente`); // Log de éxito
        this.programs.set(programs); // Actualizar la señal reactiva con los programas
        
        // Calcular y mostrar estadísticas en consola para debugging
        const stats = {
          total: programs.length, // Total de programas
          // Contar programas por máquina usando reduce
          porMaquina: programs.reduce((acc, p) => {
            acc[p.machineNumber] = (acc[p.machineNumber] || 0) + 1;
            return acc;
          }, {} as Record<number, number>),
          // Contar programas por estado usando reduce
          porEstado: programs.reduce((acc, p) => {
            acc[p.estado] = (acc[p.estado] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
        console.log('📊 Estadísticas de programas:', stats); // Log de estadísticas
        
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
        urlAPI: `${environment.apiUrl}/machine-programs`
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

  // Determina la clase CSS para el estado visual de una máquina basado en programas listos
  // Implementa la lógica del indicador LED según especificaciones del usuario
  getMachineStatusClass(machineNumber: number): string {
    // Filtrar programas de la máquina específica
    const machinePrograms = this.programs().filter(p => p.machineNumber === machineNumber);
    // Contar programas en estado LISTO
    const readyCount = machinePrograms.filter(p => p.estado === 'LISTO').length;
    
    // Determinar clase CSS basada en la cantidad de programas listos según especificaciones:
    // ROJO: 0 a 3 pedidos listos (estado crítico - LED rojo con parpadeo rápido)
    // NARANJA: 4 a 8 pedidos listos (estado de advertencia - LED naranja con parpadeo medio)
    // VERDE: 8 o más pedidos listos (estado óptimo - LED verde con parpadeo lento)
    
    if (readyCount >= 8) {
      return 'machine-status-good';     // Verde: 8+ programas listos
    } else if (readyCount >= 4 && readyCount <= 8) {
      return 'machine-status-warning';  // Naranja: exactamente 4-8 programas listos
    } else {
      return 'machine-status-critical'; // Rojo: 0-3 programas listos
    }
  }  

  // Genera el texto del tooltip para mostrar información de estado de la máquina
  getMachineStatusTooltip(machineNumber: number): string {
    // Filtrar programas de la máquina específica
    const machinePrograms = this.programs().filter(p => p.machineNumber === machineNumber);
    // Contar programas en estado LISTO
    const readyCount = machinePrograms.filter(p => p.estado === 'LISTO').length;
    // Retornar texto descriptivo para el tooltip
    return `Máquina ${machineNumber}: ${readyCount} programas listos`;
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

  // Cierra específicamente el dropdown de colores de un programa
  closeColors(programId: string) {
    const expanded = new Set(this.expandedColors()); // Crear copia del Set actual
    expanded.delete(programId); // Remover el ID del Set (cerrar dropdown)
    this.expandedColors.set(expanded); // Actualizar la señal reactiva
  }

  // Método asíncrono para cambiar el estado de un programa
  async changeStatus(program: MachineProgram, newStatus: MachineProgram['estado']) {
    try {
      this.loading.set(true); // Activar indicador de carga
      
      console.log(`🔄 Cambiando estado de programa ${program.id} a ${newStatus}`); // Log de inicio
      
      // Preparar objeto DTO (Data Transfer Object) para enviar al servidor
      const changeStatusDto = {
        estado: newStatus, // Nuevo estado del programa
        // Solo incluir observaciones si el nuevo estado es SUSPENDIDO
        observaciones: newStatus === 'SUSPENDIDO' ? program.observaciones : null
      };
      
      // Realizar petición HTTP PATCH para actualizar el estado en el servidor usando el endpoint de maquinas
      const response = await firstValueFrom(this.http.patch<any>(
        `${environment.apiUrl}/maquinas/${program.id}/status`, // URL con ID del programa
        changeStatusDto // Datos a enviar
      ));
      
      // Verificar que la respuesta del servidor sea exitosa
      if (response && response.success) {
        console.log(`✅ Estado cambiado exitosamente a ${newStatus}`); // Log de éxito
        
        // Actualizar el estado localmente para reflejar los cambios inmediatamente
        const programs = this.programs(); // Obtener array actual de programas
        const programIndex = programs.findIndex(p => p.id === program.id); // Encontrar índice del programa
        if (programIndex !== -1) {
          // Actualizar el programa en el array con los nuevos datos
          programs[programIndex] = {
            ...programs[programIndex], // Mantener datos existentes
            estado: newStatus, // Actualizar estado
            // Actualizar información de la última acción
            lastActionBy: response.data?.lastActionBy || 'Usuario Actual',
            lastActionAt: response.data?.lastActionAt ? new Date(response.data.lastActionAt) : new Date(),
            observaciones: response.data?.observaciones || programs[programIndex].observaciones
          };
          this.programs.set([...programs]); // Actualizar la señal reactiva con nuevo array
        }
        
        // Definir mensajes de éxito específicos para cada estado
        const statusMessages = {
          'LISTO': 'Programa marcado como LISTO',
          'CORRIENDO': 'Programa iniciado - CORRIENDO',
          'SUSPENDIDO': 'Programa SUSPENDIDO',
          'TERMINADO': 'Programa TERMINADO exitosamente'
        };
        
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
      
      // Determinar mensaje de error específico basado en el código de estado HTTP
      let errorMessage = 'Error al cambiar el estado del programa'; // Mensaje por defecto
      if (error.status === 404) {
        errorMessage = 'Programa no encontrado en la base de datos'; // Programa no existe
      } else if (error.status === 400) {
        errorMessage = 'Estado inválido o datos incorrectos'; // Datos mal formateados
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al actualizar el estado'; // Error del servidor
      }
      
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
          // Actualizar el programa con el nuevo estado y observaciones
          programs[index] = {
            ...programs[index], // Mantener datos existentes
            estado: 'SUSPENDIDO', // Nuevo estado
            observaciones: this.suspendReason, // Motivo de suspensión
            // Actualizar información de la última acción
            lastActionBy: response.data?.lastActionBy || 'Usuario Actual',
            lastActionAt: response.data?.lastActionAt ? new Date(response.data.lastActionAt) : new Date()
          };
          this.programs.set([...programs]); // Actualizar la señal reactiva
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

  // Método asíncrono para manejar la selección y procesamiento de archivos Excel/CSV
  async onFileSelected(event: any) {
    const file = event.target.files[0]; // Obtener el primer archivo seleccionado
    if (!file) return; // Salir si no hay archivo

    // Definir tipos MIME permitidos para validación
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    // Definir extensiones permitidas como respaldo
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    // Extraer la extensión del archivo
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // Validar que el archivo sea del tipo correcto
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      console.warn('Tipo de archivo no válido:', file.type, fileExtension);
      return; // Salir si el tipo no es válido
    }

    // Validar tamaño del archivo (máximo 10MB para evitar problemas de memoria)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      console.warn('Archivo demasiado grande:', file.size, 'bytes. Máximo:', maxSize, 'bytes');
      return; // Salir si el archivo es muy grande
    }

    this.loading.set(true); // Activar indicador de carga
    try {
      // Crear FormData para enviar el archivo al servidor
      const formData = new FormData();
      formData.append('file', file); // Agregar el archivo
      formData.append('moduleType', 'machines'); // Especificar que es para el módulo de máquinas
      formData.append('timestamp', new Date().toISOString()); // Agregar timestamp para tracking

      // Realizar petición HTTP POST para subir y procesar el archivo
      const response = await firstValueFrom(this.http.post<any>(`${environment.apiUrl}/machine-programs/upload-programming`, formData));
      
      // Verificar que la respuesta del servidor sea exitosa
      if (response && response.success) {
        // Obtener los nuevos programas del servidor
        const newPrograms = response.data || [];
        this.programs.set(newPrograms); // Actualizar la señal reactiva con los nuevos datos
        
        // Log de éxito detallado con estadísticas
        console.log('✅ Archivo procesado exitosamente', {
          programasCargados: newPrograms.length,
          programasListos: newPrograms.filter((p: MachineProgram) => p.estado === 'LISTO').length,
          maquinasProgramadas: new Set(newPrograms.map((p: MachineProgram) => p.machineNumber)).size,
          archivo: file.name
        });
        
        // Limpiar el input file para permitir seleccionar el mismo archivo nuevamente
        event.target.value = '';
        
        // Si hay programas cargados, seleccionar automáticamente la primera máquina con programas
        if (newPrograms.length > 0) {
          const firstMachineWithPrograms = newPrograms[0].machineNumber; // Obtener número de la primera máquina
          this.selectMachine(firstMachineWithPrograms); // Seleccionar esa máquina
        }
        
      } else {
        // Si la respuesta no es exitosa, lanzar error con mensaje del servidor o genérico
        throw new Error(response?.message || 'Error al procesar el archivo');
      }
      
    } catch (error: any) {
      // Determinar mensaje de error específico basado en el código de estado HTTP
      let errorMessage = 'Error al procesar el archivo'; // Mensaje por defecto
      if (error.status === 400) {
        errorMessage = 'Formato de archivo inválido. Verifica que el archivo tenga las columnas correctas.';
      } else if (error.status === 413) {
        errorMessage = 'El archivo es demasiado grande.'; // Payload too large
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.'; // Network error
      } else if (error.message) {
        errorMessage = error.message; // Usar mensaje específico del error
      }
      
      // Log de error con consejos
      console.error(`❌ ${errorMessage}`, {
        consejos: [
          'Usa la plantilla descargable',
          'Verifica que todas las columnas requeridas estén presentes',
          'El archivo no debe exceder 10MB'
        ]
      });
    } finally {
      // Siempre desactivar el indicador de carga, sin importar el resultado
      this.loading.set(false);
    }
  }

  // Métodos utilitarios para la interfaz de usuario
  
  /**
   * Obtiene el color hexadecimal asociado a cada estado de programa
   * Usado para aplicar estilos visuales consistentes en la UI
   */
  getStatusColor(estado: string): string {
    const colors = { // Mapeo de estados a colores hexadecimales
      'LISTO': '#16a34a',      // Verde - Programa listo para ejecutar
      'CORRIENDO': '#2563eb',   // Azul - Programa en ejecución
      'SUSPENDIDO': '#dc2626',  // Rojo - Programa pausado/suspendido
      'TERMINADO': '#059669'    // Verde oscuro - Programa completado
    };
    // Retorna el color correspondiente o gris por defecto si no se encuentra el estado
    return colors[estado as keyof typeof colors] || '#64748b';
  }

  /**
   * Obtiene el nombre del icono Material correspondiente a cada estado
   * Usado para mostrar iconos consistentes en botones y estados
   */
  getStatusIcon(estado: string): string {
    const icons = { // Mapeo de estados a nombres de iconos Material
      'LISTO': 'check_circle',    // Círculo con check - Listo
      'CORRIENDO': 'play_circle', // Círculo con play - En ejecución
      'SUSPENDIDO': 'pause_circle', // Círculo con pausa - Suspendido
      'TERMINADO': 'task_alt'     // Icono de tarea completada - Terminado
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
   * Genera un resumen textual del estado de una máquina
   * Muestra cantidad de programas corriendo y listos de forma legible
   */
  getMachineSummary(machineNumber: number): string {
    // Filtrar programas de la máquina específica
    const programs = this.programs().filter(p => p.machineNumber === machineNumber);
    // Contar programas por estado
    const running = programs.filter(p => p.estado === 'CORRIENDO').length; // Programas corriendo
    const ready = programs.filter(p => p.estado === 'LISTO').length; // Programas listos
    
    // Si hay programas corriendo, mostrar ambos conteos
    if (running > 0) {
      return running + ' corriendo, ' + ready + ' listos';
    }
    // Si no hay programas corriendo, solo mostrar los listos
    return ready + ' programas listos';
  }

  /**
   * Exportar datos de programación a Excel
   * Genera un archivo Excel con todos los programas de máquinas
   */
  async exportToExcel() {
    try {
      this.loading.set(true);
      console.log('📊 Exportando programación a Excel...');
      
      // Realizar petición para obtener el archivo Excel
      const response = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/machines/programs/export`, {
          responseType: 'blob' // Importante para archivos binarios
        })
      );
      
      // Crear URL del blob y descargar
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `programacion-maquinas-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Archivo Excel exportado exitosamente');
      
    } catch (error: any) {
      console.error('❌ Error exportando a Excel:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Actualizar/refrescar datos de máquinas
   * Recarga todos los programas desde el servidor
   */
  async refreshData() {
    console.log('🔄 Actualizando datos de máquinas...');
    await this.loadPrograms();
  }

  /**
   * Alternar colores con manejo de eventos
   * Versión mejorada que maneja el evento del click
   */
  toggleColors(programId: string, event?: Event) {
    if (event) {
      event.stopPropagation(); // Evitar propagación del evento
    }
    
    const expanded = new Set(this.expandedColors());
    if (expanded.has(programId)) {
      expanded.delete(programId);
    } else {
      // Cerrar otros dropdowns abiertos para mejor UX
      expanded.clear();
      expanded.add(programId);
    }
    this.expandedColors.set(expanded);
  }

  /**
   * Método privado para mostrar mensajes de error al usuario
   * Centraliza el manejo de errores para consistencia en la UI
   */
  private showError(message: string) {
    console.error('❌ Error:', message); // Log del error en consola para debugging
  }
}