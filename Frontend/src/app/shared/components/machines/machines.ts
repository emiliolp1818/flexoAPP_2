
import { Component, OnInit, OnDestroy, signal, computed, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

import { FormsModule } from '@angular/forms';

import { HttpClient, HttpBackend, HttpEventType, HttpRequest } from '@angular/common/http';

import { firstValueFrom, Subscription, timeout } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { AuthService } from '../../../core/services/auth.service';

import { MatDialog } from '@angular/material/dialog';

import { MatSnackBar } from '@angular/material/snack-bar';

import { PantoneLiveService } from '../../services/pantone-live.service';

import { AniloxService, Anilox } from '../../services/anilox.service';

import { PermissionsService } from '../../services/permissions.service';
import { PERMISSIONS } from '../../models/permission.model';

import { ExcelService } from '../../services/excel.service';
import { CodTintasService } from '../../services/cod-tintas.service';
import { SignalRService } from '../../services/signalr.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LocalDatePipe, LocalTime12hPipe, FormatKilosPipe, FormatMetrosPipe } from '../../pipes/date-format.pipe';


interface MachineProgram {
  numeroMaquina: number;
  articulo: string;
  otSap: string;
  cliente: string;
  referencia: string;
  td: string;
  tipoImpresion?: string;
  numeroColores: number;
  colores: string[];
  kilos: number;
  metros?: number;
  anchoMm?: number;
  fechaTintaEnMaquina: Date;
  sustrato: string;
  estado: 'SIN_ASIGNAR' | 'PREPARANDO' | 'LISTO' | 'SUSPENDIDO' | 'CORRIENDO' | 'TERMINADO' | null;
  observaciones?: string;
  lastActionBy?: string;
  lastActionAt?: Date;
  preparandoStartedAt?: Date;

  machineNumber: number;

  adminMessage?: string;
  messageTimestamp?: Date;
  messageSender?: string;
  messageRead?: boolean;
  messageReadBy?: string;
  
  // Historial de acciones
  actionHistory?: Array<{
    user: string;
    action: string;
    description: string;
    timestamp: Date;
  }>;
}

interface UserPermissions {
  canLoadExcel: boolean;
  canDownloadTemplate: boolean;
  canViewFF459: boolean;
  canSendMessages: boolean;

  canStatusPrealistando: boolean;
  canStatusListo: boolean;
  canStatusCorriendo: boolean;
  canStatusTerminado: boolean;
  canStatusSuspendido: boolean;
}

/**
 * Parsea una fecha del backend asegurando que se interprete como UTC.
 * El backend usa DateTime.UtcNow pero la serialización JSON puede omitir la "Z".
 */
function parseUtcDate(value: string | Date | null | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  // Si no termina en Z ni tiene offset, agregar Z para que JS lo interprete como UTC
  const str = String(value);
  if (!str.endsWith('Z') && !str.includes('+') && !/\d{2}:\d{2}$/.test(str.slice(-6))) {
    return new Date(str + 'Z');
  }
  return new Date(str);
}


interface MachineStats {
  totalPrograms: number;
  readyPrograms: number;
  runningPrograms: number;
  suspendedPrograms: number;
  completedPrograms: number;
}


@Component({
  selector: 'app-machines',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatSelectModule,
    FormsModule,
    LocalDatePipe,
    LocalTime12hPipe,
    FormatKilosPipe,
    FormatMetrosPipe
  ],
  templateUrl: './machines.html',
  styleUrls: ['./machines.scss']
})
export class MachinesComponent implements OnInit, OnDestroy {

  private signalRService = inject(SignalRService);
  private signalRSubscriptions: Subscription[] = [];
  private ignoringSignalR = false;
  private ignoringSignalRTimeout: any = null;
  private pollingInterval: any = null;
  private readonly DEFAULT_MACHINE_CONFIGS: Record<number, number> = {
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0
  };

  // Cachés para optimización de rendimiento con límites
  private readonly MAX_CACHE_SIZE = 50; // Límite máximo de entradas en caché
  private machineStatusCache = new Map<number, string>();
  private machineTooltipCache = new Map<number, string>();
  private cacheVersion = 0;

  private http = inject(HttpClient);
  private httpBackend = inject(HttpBackend);
  private templateHttp = new HttpClient(this.httpBackend);
  private ff459TemplateCache: string | null = null;
  private codTintasCache = new Map<string, any>();
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private pantoneService = inject(PantoneLiveService);
  private aniloxService = inject(AniloxService);
  private permissionsService = inject(PermissionsService);
  private excelService = inject(ExcelService);
  private codTintasService = inject(CodTintasService);
  private notificationService = inject(NotificationService);


  console = console;


  loading = signal(false);
  uploadProgress = signal<number | null>(null); // null = no uploading, 0-100 = progreso
  lastUploadDate = signal<string>('');
  selectedMachineNumber = signal<number | null>(null);
  programs = signal<MachineProgram[]>([]);
  expandedColors = signal<Set<string>>(new Set());
  expandedStatusHistory = signal<Set<string>>(new Set());
  statusHistoryTimeout: any = null; // Timeout para cerrar el historial automáticamente
  colorsTimeout: any = null; // Timeout para cerrar la paleta de colores automáticamente


  lineaturas = signal<number[]>([]);
  aniloxByLineatura = signal<Map<number, Anilox[]>>(new Map());
  aniloxByMachine = signal<Map<number, Anilox[]>>(new Map());
  selectedAniloxData = signal<Map<string, { lineatura: number | null, anilox: Anilox | null, kilos: number | null }>>(new Map());
  machineConfigs = signal<Map<number, { cargaMuerta: number }>>(new Map());

  // Datos de carpeta/estante desde Cod Tintas
  codTintasCarpetaData = signal<Map<string, { estante: string, carpeta: string }>>(new Map());

  // Datos de printType desde Diseños (artículo → tipo de impresión)
  designPrintTypeData = signal<Map<string, string>>(new Map());

  // Configuración de alertas de color (cargada desde system configs)
  alertRedMax = signal<number>(3);
  alertOrangeMax = signal<number>(5);
  alertGreenMin = signal<number>(6);

  showSuspendDialog = false;
  currentProgramToSuspend: MachineProgram | null = null;
  suspendReason = '';


  currentProgramForMenu: MachineProgram | null = null;


  showMessageDialog = false;
  currentMessage = '';
  messageProgram: MachineProgram | null = null;
  programMessages = signal<Map<string, { message: string, timestamp: Date, sender: string, read: boolean }>>(new Map());
  messageTimeout: any = null;
  isEditingMessage = false;
  private readonly MESSAGES_STORAGE_KEY = 'flexoapp_program_messages';


  machineNumbers = Array.from({ length: 11 }, (_, i) => i + 11);


  simpleColumns = [
    'articulo',
    'otSap',
    'cliente',
    'referencia',
    'td',
    'tipoImpresion',
    'numeroColores',
    'rodillo',
    'carpeta',
    'kilos',
    'acumuladoSaldo',
    'fechaTintaEnMaquina',
    'sustrato',
    'estado',
    'acciones'
  ];

  programDisplayedColumns = [
    'articulo',
    'otSap',
    'cliente',
    'referencia',
    'td',
    'tipoImpresion',
    'numeroColores',
    'rodillo',
    'carpeta',
    'kilos',
    'acumuladoSaldo',
    'fechaTintaEnMaquina',
    'sustrato',
    'estado',
    'acciones'
  ];


  userPermissions = computed((): UserPermissions => {

    const perms = this.permissionsService.permissions();


    if (perms.length === 0) {
    } else {
    }

    return {
      canLoadExcel: this.permissionsService.hasPermission(PERMISSIONS.ACTION_IMPORT) ||
        this.permissionsService.hasPermission(PERMISSIONS.ACTION_ADD_PROGRAMMING),
      canDownloadTemplate: this.permissionsService.hasPermission(PERMISSIONS.ACTION_EXPORT),
      canViewFF459: this.permissionsService.hasPermission(PERMISSIONS.MACHINES_PRINT),
      canSendMessages: this.permissionsService.hasPermission(PERMISSIONS.MACHINES_SEND_MESSAGE),

      canStatusPrealistando: this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_PREALISTANDO),
      canStatusListo: this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_LISTO),
      canStatusCorriendo: this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_CORRIENDO),
      canStatusTerminado: this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_TERMINADO),
      canStatusSuspendido: this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_SUSPENDIDO)
    };
  });




  // Pre-computed: Set de máquinas que tienen al menos un programa PREPARANDO
  machinesWithPreparando = computed(() => {
    const set = new Set<number>();
    for (const p of this.programs()) {
      if (p.estado === 'PREPARANDO') {
        set.add(p.machineNumber);
      }
    }
    return set;
  });

  // Pre-computed: Map de machineNumber → statusClass (recalcula solo cuando programs cambia)
  machineStatusClasses = computed(() => {
    const map = new Map<number, string>();
    const redMax = this.alertRedMax();
    const orangeMax = this.alertOrangeMax();
    const greenMin = this.alertGreenMin();
    const byMachine = this.programsByMachineMap();
    
    for (const machineNum of this.machineNumbers) {
      const machinePrograms = byMachine.get(machineNum) || [];
      if (machinePrograms.length === 0) {
        map.set(machineNum, 'status-sin_asignar');
        continue;
      }
      const pedidosListos = machinePrograms.filter(p => 
        p.estado === 'LISTO' || p.estado === 'PREPARANDO'
      ).length;
      
      let statusClass: string;
      if (pedidosListos >= 1 && pedidosListos <= redMax) {
        statusClass = 'status-suspendido';
      } else if (pedidosListos > redMax && pedidosListos <= orangeMax) {
        statusClass = 'status-preparando';
      } else if (pedidosListos >= greenMin) {
        statusClass = 'status-listo';
      } else {
        statusClass = 'status-sin_asignar';
      }
      map.set(machineNum, statusClass);
    }
    return map;
  });

  // Pre-computed: Map de machineNumber → tooltip
  machineTooltips = computed(() => {
    const map = new Map<number, string>();
    const redMax = this.alertRedMax();
    const orangeMax = this.alertOrangeMax();
    const byMachine = this.programsByMachineMap();
    
    for (const machineNum of this.machineNumbers) {
      const machinePrograms = byMachine.get(machineNum) || [];
      if (machinePrograms.length === 0) {
        map.set(machineNum, `Máquina ${machineNum}: Sin programas asignados`);
        continue;
      }
      const readyCount = machinePrograms.filter(p =>
        p.estado === 'LISTO' || p.estado === 'PREPARANDO'
      ).length;
      
      let tooltip: string;
      if (readyCount >= 0 && readyCount <= redMax) {
        tooltip = `Máquina ${machineNum}: ${readyCount} pedidos (Pocos pedidos)`;
      } else if (readyCount > redMax && readyCount <= orangeMax) {
        tooltip = `Máquina ${machineNum}: ${readyCount} pedidos (Pedidos medios)`;
      } else {
        tooltip = `Máquina ${machineNum}: ${readyCount} pedidos (Muchos pedidos)`;
      }
      map.set(machineNum, tooltip);
    }
    return map;
  });

  // Pre-computed Map: machineNumber → programs[] (se recalcula solo cuando programs() cambia)
  private programsByMachineMap = computed(() => {
    const map = new Map<number, MachineProgram[]>();
    for (const p of this.programs()) {
      const list = map.get(p.machineNumber);
      if (list) {
        list.push(p);
      } else {
        map.set(p.machineNumber, [p]);
      }
    }
    return map;
  });

  // Computed signal optimizado con memoización
  selectedMachinePrograms = computed(() => {
    const selected = this.selectedMachineNumber();
    if (!selected) return [];
    return this.programsByMachineMap().get(selected) || [];
  });

  // Signal para render incremental — evita congelamiento con muchos pedidos
  visiblePrograms = signal<MachineProgram[]>([]);
  private renderChunkId: any = null;
  private readonly INITIAL_RENDER_COUNT = 12; // Filas visibles inmediatamente


  selectedMachineStats = computed((): MachineStats => {
    const programs = this.selectedMachinePrograms();
    return {
      totalPrograms: programs.length,

      readyPrograms: programs.filter(p => p.estado === 'LISTO' || p.estado === 'PREPARANDO' || p.estado === 'SIN_ASIGNAR').length,
      runningPrograms: programs.filter(p => p.estado === 'CORRIENDO').length,
      suspendedPrograms: programs.filter(p => p.estado === 'SUSPENDIDO').length,
      completedPrograms: programs.filter(p => p.estado === 'TERMINADO').length
    };
  });


  async ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id && this.permissionsService.permissions().length === 0) {
      this.permissionsService.loadCurrentUserPermissions(Number(currentUser.id)).subscribe({
        error: (err) => console.error('❌ Error cargando permisos en ngOnInit:', err)
      });
    }

    // Crítico: pintar la lista de máquinas lo antes posible
    await this.loadPrograms(true);

    if (this.machineNumbers.length > 0) {
      this.selectMachine(this.machineNumbers[0]);
    }

    this.setupSignalRListeners();

    // Secundario: no bloquear la UI inicial
    this.scheduleSecondaryLoads();

    // Polling de fallback cada 45s (SignalR cubre tiempo real)
    this.pollingInterval = setInterval(() => {
      if (!this.loading() && !document.hidden) {
        this.loadPrograms(true);
      }
    }, 45000);
  }

  /** Cargas pesadas diferidas tras el primer render (anilox, configs, diseños, etc.). */
  private scheduleSecondaryLoads(): void {
    const run = () => {
      this.loadUniqueBCM();
      void this.loadAllMachineAnilox();
      void this.loadAllMachineConfigs();
      this.loadCodTintasCarpetaData();
      this.loadDesignPrintTypeData();
      this.loadAlertConfigs();
    };

    if (typeof (window as any).requestIdleCallback === 'function') {
      (window as any).requestIdleCallback(() => run(), { timeout: 2500 });
    } else {
      setTimeout(run, 0);
    }
  }

  /**
   * Configurar listeners de SignalR para notificaciones en tiempo real
   */
  private setupSignalRListeners(): void {

    // Máquina actualizada
    this.signalRSubscriptions.push(
      this.signalRService.machineUpdated$.subscribe(notification => {
        if (this.ignoringSignalR || this.isOwnSignalRAction(notification.userName)) {
          return;
        }
        this.showSignalRNotification(notification.machineNumber || 0, notification.userName || '', notification.newState || notification.action || '');
        this.applyRemoteStatusPatch(notification);
      })
    );

    // Estado cambiado
    this.signalRSubscriptions.push(
      this.signalRService.machineStateChanged$.subscribe(notification => {
        if (this.ignoringSignalR || this.isOwnSignalRAction(notification.userName)) {
          return;
        }
        this.showSignalRNotification(notification.machineNumber || 0, notification.userName || '', notification.newState || '');
        this.applyRemoteStatusPatch(notification);
      })
    );

    // Excel importado
    this.signalRSubscriptions.push(
      this.signalRService.excelImported$.subscribe(notification => {
        this.snackBar.open(
          `Excel importado en Máquina ${notification.machineNumber}: ${notification.created} creados, ${notification.updated} actualizados`,
          'Cerrar',
          { duration: 5000 }
        );
        this.loadPrograms(true);
      })
    );

    // Máquina eliminada
    this.signalRSubscriptions.push(
      this.signalRService.machineDeleted$.subscribe(notification => {
        this.snackBar.open(`Programa ${notification.otSap} eliminado`, 'Cerrar', { duration: 3000 });
        this.loadPrograms(true);
      })
    );

    // Refresh global
    this.signalRSubscriptions.push(
      this.signalRService.refreshAll$.subscribe(notification => {
        this.snackBar.open(`Actualizando datos: ${notification.reason}`, 'Cerrar', { 
          duration: 3000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        
        // Forzar estilos con múltiples intentos
        const applyStyles = () => {
          const containers = document.querySelectorAll('.status-listo-snackbar, .animated-snackbar');
          containers.forEach(container => {
            const htmlContainer = container as HTMLElement;
            htmlContainer.style.setProperty('background', 'linear-gradient(135deg, #10b981 0%, #059669 70%, #1f2937 100%)', 'important');
            
            // Aplicar a todos los elementos de texto
            const allElements = htmlContainer.querySelectorAll('*');
            allElements.forEach(el => {
              (el as HTMLElement).style.setProperty('color', '#ffffff', 'important');
            });
            
            // Aplicar específicamente al label
            const labels = htmlContainer.querySelectorAll('.mat-mdc-snack-bar-label, .mdc-snackbar__label');
            labels.forEach(label => {
              (label as HTMLElement).style.setProperty('color', '#ffffff', 'important');
            });
            
            // Aplicar al botón
            const buttons = htmlContainer.querySelectorAll('button, .mat-mdc-button');
            buttons.forEach(btn => {
              (btn as HTMLElement).style.setProperty('color', '#ffffff', 'important');
            });
          });
        };
        
        // Aplicar inmediatamente y después de un delay
        setTimeout(applyStyles, 0);
        setTimeout(applyStyles, 50);
        setTimeout(applyStyles, 100);
        
        this.loadPrograms();
      })
    );

  }

  /**
   * Limpiar suscripciones y memoria al destruir el componente
   */
  ngOnDestroy(): void {
    
    // Limpiar suscripciones de SignalR
    this.signalRSubscriptions.forEach(sub => sub.unsubscribe());
    this.signalRSubscriptions = [];
    if (this.ignoringSignalRTimeout) {
      clearTimeout(this.ignoringSignalRTimeout);
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    if (this.renderChunkId) {
      cancelAnimationFrame(this.renderChunkId);
    }
    
    // Limpiar timeout del historial si existe
    if (this.statusHistoryTimeout) {
      clearTimeout(this.statusHistoryTimeout);
      this.statusHistoryTimeout = null;
    }
    
    // Limpiar timeout de mensajes si existe
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    
    // Limpiar todos los cachés para liberar memoria
    this.machineStatusCache.clear();
    this.machineTooltipCache.clear();
    
    // Limpiar Maps de signals
    this.aniloxByLineatura.set(new Map());
    this.aniloxByMachine.set(new Map());
    this.selectedAniloxData.set(new Map());
    this.machineConfigs.set(new Map());
    this.codTintasCarpetaData.set(new Map());
    this.programMessages.set(new Map());
    
  }





  async loadPrograms(silent: boolean = false) {
    if (!silent) this.loading.set(true);
    try {
      if (!this.authService.isLoggedIn()) {
        window.location.href = '/login';
        return;
      }

      // Parallel: fecha de última carga + lista de máquinas
      const [uploadRes, response] = await Promise.all([
        firstValueFrom(this.http.get<any>(`${environment.apiUrl}/maquinas/last-upload`)).catch(() => null),
        firstValueFrom(this.http.get<any>(`${environment.apiUrl}/maquinas`))
      ]);

      if (uploadRes?.timestamp) {
        this.lastUploadDate.set(this.formatLocalDate(uploadRes.timestamp));
      }

      if (response && response.success && response.data && response.data.length > 0) {



        const programs: MachineProgram[] = response.data.map((program: any) => {



          let colores: string[] = [];
          if (program.colores) {
            try {

              colores = typeof program.colores === 'string'
                ? JSON.parse(program.colores)
                : program.colores;
            } catch (e) {

              colores = [];
            }
          }





          return {


            numeroMaquina: program.numeroMaquina || program.machineNumber || 11,
            articulo: program.articulo || '',
            otSap: String(program.otSap || ''),
            cliente: program.cliente || '',
            referencia: program.referencia || '',
            td: program.td || '',
            tipoImpresion: program.tipoImpresion || program.tipo_impresion || undefined,
            numeroColores: program.numeroColores || colores.length || 0,
            colores: colores,
            kilos: Number(program.kilos || 0),
            metros: program.metros ? Number(program.metros) : undefined,
            anchoMm: program.anchoMm ? Number(program.anchoMm) : undefined,
            fechaTintaEnMaquina: program.fechaTintaEnMaquina ? parseUtcDate(program.fechaTintaEnMaquina) : new Date(),
            sustrato: program.sustrato || '',
            estado: program.estado || 'SIN_ASIGNAR',
            observaciones: program.observaciones || '',


            machineNumber: program.numeroMaquina || program.machineNumber || 11,




            lastActionBy: program.updatedByUser?.firstName && program.updatedByUser?.lastName
              ? `${program.updatedByUser.firstName} ${program.updatedByUser.lastName}`.trim()
              : program.lastActionBy || 'Sistema',


            lastActionAt: program.updatedAt ? parseUtcDate(program.updatedAt) :
              program.lastActionAt ? parseUtcDate(program.lastActionAt) : new Date(),


            preparandoStartedAt: program.preparandoStartedAt ? parseUtcDate(program.preparandoStartedAt) : undefined
          };
        });




        const machineNumbers = [...new Set(programs.map(p => p.machineNumber))].sort((a, b) => a - b);
        const programsByMachine = programs.reduce((acc, p) => {
          acc[p.machineNumber] = (acc[p.machineNumber] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);


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



        const programsWithoutId = programs.filter(p => !p.otSap);
        if (programsWithoutId.length > 0) {
        }



        this.updatePrograms(programs.filter(p => {
          // Filtrar filas informativas vacías sin datos útiles
          const otEsInfo = p.otSap && p.otSap.startsWith('INFO-');
          const articuloVacio = !p.articulo || p.articulo === '0' || p.articulo.trim() === '';
          const clienteInfo = !p.cliente || p.cliente === 'INFORMATIVO' || p.cliente.trim() === '';
          // Solo ocultar si es INFO + sin artículo real + sin cliente real
          if (otEsInfo && articuloVacio && clienteInfo) return false;
          return true;
        }));



        const stats = {
          total: programs.length,

          porMaquina: programs.reduce((acc, p) => {
            acc[p.machineNumber] = (acc[p.machineNumber] || 0) + 1;
            return acc;
          }, {} as Record<number, number>),

          porEstado: programs.reduce((acc, p) => {
            const estadoKey = p.estado || 'SIN_ASIGNAR';
            acc[estadoKey] = (acc[estadoKey] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };

      } else {

        this.programs.set([]);
      }
    } catch (error: any) {
      console.error('❌ Error cargando programas:', error);


      if (error.status === 401) {
        window.location.href = '/login';
        return;
      }


      console.error('❌ Error de conexión con backend');
      this.programs.set([]);
    } finally {

      this.loading.set(false);
    }
  }





  selectMachine(machineNumber: number) {
    
    // Evitar recálculos si ya está seleccionada
    if (this.selectedMachineNumber() === machineNumber) {
      return;
    }
    
    // Cerrar TODAS las expansiones para evitar recálculos pesados
    this.expandedColors.set(new Set());
    this.expandedStatusHistory.set(new Set());
    
    // Limpiar datos de anilox seleccionados para evitar conflictos
    this.selectedAniloxData.set(new Map());
    
    // Cancelar render incremental previo
    if (this.renderChunkId) {
      cancelAnimationFrame(this.renderChunkId);
      this.renderChunkId = null;
    }
    
    // Cambiar la máquina seleccionada
    this.selectedMachineNumber.set(machineNumber);
    
    // Render incremental: primero las filas visibles, luego el resto
    const allPrograms = this.selectedMachinePrograms();
    if (allPrograms.length <= this.INITIAL_RENDER_COUNT) {
      // Pocos programas — renderizar todo de una
      this.visiblePrograms.set(allPrograms);
    } else {
      // Muchos programas — render en 2 fases
      this.visiblePrograms.set(allPrograms.slice(0, this.INITIAL_RENDER_COUNT));
      this.renderChunkId = requestAnimationFrame(() => {
        this.visiblePrograms.set(allPrograms);
        this.renderChunkId = null;
      });
    }
  }

  // TrackBy functions para optimizar el rendimiento de la tabla
  trackByOtSap(index: number, program: MachineProgram): string {
    return program.otSap;
  }









  trackByMachineNumber(_: number, machineNumber: number): number {
    return machineNumber;
  }

  trackByProgramOtSap(_: number, program: MachineProgram): string {
    return program.otSap;
  }

  trackByColorIndex(index: number): number {
    return index;
  }

  trackByLineatura(_: number, lineatura: number): number {
    return lineatura;
  }

  trackByAniloxId(_: number, anilox: Anilox): number {
    return anilox.id;
  }

  trackByActionIndex(index: number): number {
    return index;
  }




  getMachineStatusClass(machineNumber: number): string {
    // Usar caché si está disponible
    const cached = this.machineStatusCache.get(machineNumber);
    if (cached) {
      return cached;
    }

    const machinePrograms = this.getProgramsByMachine(machineNumber);
    
    // Si no hay programas asignados a la máquina, retornar gris
    if (machinePrograms.length === 0) {
      const statusClass = 'status-sin_asignar';
      this.machineStatusCache.set(machineNumber, statusClass);
      return statusClass;
    }

    // Contar programas en estado LISTO (incluye LISTO y PREPARANDO)
    const pedidosListos = machinePrograms.filter(p => 
      p.estado === 'LISTO' || p.estado === 'PREPARANDO'
    ).length;

    // Determinar color según cantidad de pedidos listos (configurable)
    const redMax = this.alertRedMax();
    const orangeMax = this.alertOrangeMax();
    const greenMin = this.alertGreenMin();
    let statusClass: string;
    
    if (pedidosListos >= 1 && pedidosListos <= redMax) {
      statusClass = 'status-suspendido'; // ROJO
    } else if (pedidosListos > redMax && pedidosListos <= orangeMax) {
      statusClass = 'status-preparando'; // NARANJA
    } else if (pedidosListos >= greenMin) {
      statusClass = 'status-listo'; // VERDE
    } else {
      statusClass = 'status-sin_asignar'; // GRIS
    }

    // Guardar en caché
    this.machineStatusCache.set(machineNumber, statusClass);
    this.checkCacheSize(this.machineStatusCache, 'machineStatusCache');
    return statusClass;
  }

  // Método auxiliar para obtener programas por máquina (usa el Map pre-computado)
  private getProgramsByMachine(machineNumber: number): MachineProgram[] {
    return this.programsByMachineMap().get(machineNumber) || [];
  }

  // Método para limpiar cachés cuando los datos cambian
  private clearCaches(): void {
    this.machineStatusCache.clear();
    this.machineTooltipCache.clear();
    this.cacheVersion++;
  }

  // Método para verificar y limpiar caché si excede el límite
  private checkCacheSize(cache: Map<any, any>, cacheName: string): void {
    if (cache.size > this.MAX_CACHE_SIZE) {
      cache.clear();
    }
  }

  // Método helper para actualizar programas y limpiar caché
  private updatePrograms(programs: MachineProgram[]): void {
    this.programs.set(programs);
    this.clearCaches();
    
    // Actualizar visiblePrograms para la máquina seleccionada actual
    const selected = this.selectedMachineNumber();
    if (selected) {
      const machineProgs = programs.filter(p => p.machineNumber === selected);
      this.visiblePrograms.set(machineProgs);
    }
    
    this.cdr.markForCheck();
  }

  private isOwnSignalRAction(userName?: string): boolean {
    if (!userName) return false;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.firstName) return false;
    return userName.toLowerCase().includes(currentUser.firstName.toLowerCase());
  }

  /** Aplica cambio remoto sin recargar toda la lista (más fluido). */
  private applyRemoteStatusPatch(notification: { otSap?: string; newState?: string; userName?: string }): void {
    const ot = String(notification.otSap || '').trim();
    const newState = notification.newState;
    if (!ot || !newState) {
      void this.loadPrograms(true);
      return;
    }

    const programs = this.programs();
    const idx = programs.findIndex(p => String(p.otSap).trim() === ot);
    if (idx === -1) {
      void this.loadPrograms(true);
      return;
    }

    const updated = programs.map((p, i) =>
      i === idx
        ? {
            ...p,
            estado: newState as MachineProgram['estado'],
            lastActionBy: notification.userName || p.lastActionBy,
            lastActionAt: new Date()
          }
        : p
    );
    this.updatePrograms(updated);
  }

  private patchProgramByOtSap(
    otSap: string,
    patch: Partial<MachineProgram>
  ): MachineProgram | null {
    const normalized = String(otSap).trim();
    const programs = this.programs();
    const idx = programs.findIndex(p => String(p.otSap).trim() === normalized);
    if (idx === -1) return null;
    const previous = { ...programs[idx] };
    const updated = programs.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    this.updatePrograms(updated);
    return previous;
  }






  machineHasPreparando(machineNumber: number): boolean {
    return this.programs().some(p => p.machineNumber === machineNumber && p.estado === 'PREPARANDO');
  }


  getMachineStatusTooltip(machineNumber: number): string {
    // Usar caché si está disponible
    const cached = this.machineTooltipCache.get(machineNumber);
    if (cached) {
      return cached;
    }

    const machinePrograms = this.getProgramsByMachine(machineNumber);
    
    // Si no hay programas asignados
    if (machinePrograms.length === 0) {
      const tooltip = `Máquina ${machineNumber}: Sin programas asignados`;
      this.machineTooltipCache.set(machineNumber, tooltip);
      this.checkCacheSize(this.machineTooltipCache, 'machineTooltipCache');
      return tooltip;
    }

    const readyCount = machinePrograms.filter(p =>
      p.estado === 'LISTO' ||
      p.estado === 'PREPARANDO'
    ).length;

    let tooltip: string;
    const redMax = this.alertRedMax();
    const orangeMax = this.alertOrangeMax();
    if (readyCount >= 0 && readyCount <= redMax) {
      tooltip = `Máquina ${machineNumber}: ${readyCount} pedidos (Pocos pedidos)`;
    } else if (readyCount > redMax && readyCount <= orangeMax) {
      tooltip = `Máquina ${machineNumber}: ${readyCount} pedidos (Pedidos medios)`;
    } else {
      tooltip = `Máquina ${machineNumber}: ${readyCount} pedidos (Muchos pedidos)`;
    }

    this.machineTooltipCache.set(machineNumber, tooltip);
    this.checkCacheSize(this.machineTooltipCache, 'machineTooltipCache');
    return tooltip;
  }





  showProgramTable(): boolean {


    return this.selectedMachineNumber() !== null;
  }







  getNumericOtSap(otSap: string): string {


    return otSap.replace(/\D/g, '');
  }






  formatTdCode(td: string): string {

    return td.toUpperCase();
  }








  isColorsExpanded(otSap: string): boolean {
    if (!otSap) {
      return false;
    }

    const normalizedOtSap = String(otSap).trim();
    return this.expandedColors().has(normalizedOtSap);
  }




  toggleColors(otSap: string, event?: Event) {


    if (event) {
      event.stopPropagation();
    }



    const expanded = new Set(this.expandedColors());



    if (expanded.has(otSap)) {

      expanded.delete(otSap);
    } else {



      expanded.clear();
      expanded.add(otSap);
      
      // Auto-cargar anilox desde cod_tintas cuando se expande el panel
      const program = this.programs().find(p => String(p.otSap).trim() === otSap);
      if (program) {
        console.log(`🔄 [TOGGLE-COLORS] Programa encontrado:`, {
          otSap: program.otSap,
          articulo: program.articulo,
          colores: program.colores,
          machineNumber: program.machineNumber
        });
        // Pequeño delay para que el DOM se actualice primero
        setTimeout(() => {
          this.autoLoadAllAniloxForProgram(program);
        }, 100);
      } else {
      }
    }



    this.expandedColors.set(expanded);
  }



  closeColors(otSap: string) {

    const expanded = new Set(this.expandedColors());


    expanded.delete(otSap);


    this.expandedColors.set(expanded);


  }

  // ===== MÉTODOS PARA HISTORIAL DE ESTADO =====
  isStatusHistoryExpanded(otSap: string): boolean {
    if (!otSap) {
      return false;
    }
    const normalizedOtSap = String(otSap).trim();
    return this.expandedStatusHistory().has(normalizedOtSap);
  }

  async toggleStatusHistory(otSap: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const expanded = new Set(this.expandedStatusHistory());

    if (expanded.has(otSap)) {
      // Cerrar historial
      expanded.delete(otSap);
    } else {
      // Cerrar otros historiales abiertos (solo uno a la vez)
      expanded.clear();
      expanded.add(otSap);
      
      // Cargar historial si no está cargado
      const program = this.programs().find(p => p.otSap === otSap);
      
      if (program && (!program.actionHistory || program.actionHistory.length === 0)) {
        await this.loadProgramHistory(otSap);
      }
    }

    this.expandedStatusHistory.set(expanded);
  }

  async loadProgramHistory(otSap: string) {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/maquinas/${otSap}/history`)
      );


      if (response.success && response.data) {
        
        // Actualizar el programa con el historial
        const programs = this.programs();
        const programIndex = programs.findIndex(p => p.otSap === otSap);
        
        if (programIndex !== -1) {
          const updatedPrograms = [...programs];
          const historyData = response.data.map((item: any) => ({
            user: item.user,
            action: item.action,
            description: item.description,
            timestamp: item.timestamp,
            duration: item.duration
          }));
          
          
          updatedPrograms[programIndex] = {
            ...updatedPrograms[programIndex],
            actionHistory: historyData
          };
          this.updatePrograms(updatedPrograms);
          
        } else {
        }
      } else {
      }
    } catch (error) {
      console.error(`❌ Error cargando historial para ${otSap}:`, error);
    }
  }






  getPantoneInfo(colorName: string): { code: string; hex: string; displayName: string } {

    if (!colorName) {
      return {
        code: 'N/A',
        hex: '#CCCCCC',
        displayName: 'Sin color'
      };
    }


    let searchTerm = colorName;
    if (colorName.toUpperCase().startsWith('P_')) {
      searchTerm = colorName.substring(2);
    }


    const pantoneColors = this.pantoneService.searchColors(searchTerm);

    if (pantoneColors && pantoneColors.length > 0) {
      const pantoneColor = pantoneColors[0];
      return {
        code: pantoneColor.code,
        hex: pantoneColor.hex,
        displayName: pantoneColor.displayName
      };
    }


    const defaultHex = this.getDefaultColorHex(colorName);
    return {
      code: colorName,
      hex: defaultHex,
      displayName: colorName
    };
  }



  private getDefaultColorHex(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'CYAN': '#00AEEF',
      'MAGENTA': '#EC008C',
      'AMARILLO': '#FFF200',
      'YELLOW': '#FFF200',
      'NEGRO': '#000000',
      'BLACK': '#000000',
      'BLANCO': '#FFFFFF',
      'WHITE': '#FFFFFF',
      'VERDE': '#00A651',
      'GREEN': '#00A651',
      'NARANJA': '#FF6900',
      'ORANGE': '#FF6900',
      'VIOLETA': '#8B3F8F',
      'VIOLET': '#8B3F8F',
      'ROJO': '#E4002B',
      'RED': '#E4002B',
      'AZUL': '#0033A0',
      'BLUE': '#0033A0'
    };

    return colorMap[colorName.toUpperCase()] || '#CCCCCC';
  }



  /**
   * Formatear fecha del backend a hora local del navegador.
   * Igual que el header: usa new Date() que respeta la zona del usuario.
   */
  formatLocalDate(dateStr: string | Date, mode: 'full' | 'date' | 'time' = 'full'): string {
    if (!dateStr) return '';
    const str = String(dateStr);
    
    const match = str.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (match) {
      const [, yyyy, mm, dd, hh, mi] = match;
      if (mode === 'date') return `${dd}/${mm}/${yyyy}`;
      if (mode === 'time') return `${hh}:${mi}`;
      return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
    }

    const d = new Date(str);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    if (mode === 'date') return `${dd}/${mm}/${d.getFullYear()}`;
    if (mode === 'time') return `${hh}:${mi}`;
    return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}`;
  }

  /**
   * Formatear hora en formato 12h con AM/PM
   */
  formatLocalTime12h(dateStr: string | Date): string {
    if (!dateStr) return '';
    const str = String(dateStr);
    const match = str.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    let h = 0, m = 0;
    if (match) {
      h = parseInt(match[4], 10);
      m = parseInt(match[5], 10);
    } else {
      const d = new Date(str);
      if (isNaN(d.getTime())) return '';
      h = d.getHours();
      m = d.getMinutes();
    }
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }


  getColorsTooltip(program: MachineProgram): string {
    if (!program.colores || program.colores.length === 0) {
      return 'Sin colores asignados';
    }

    const colorList = program.colores.map((color, index) =>
      `${index + 1}. ${color}`
    ).join('\n');

    return `Colores del pedido:\n${colorList}`;
  }



  getColorAnilox(program: MachineProgram, colorIndex: number): string {


    const aniloxCodes = ['A-350', 'A-450', 'A-550', 'A-650', 'A-750', 'A-850', 'A-950', 'A-1050'];
    return aniloxCodes[colorIndex % aniloxCodes.length];
  }



  getColorLineatura(program: MachineProgram, colorIndex: number): string {


    const lineaturas = ['120 LPI', '150 LPI', '180 LPI', '200 LPI', '220 LPI', '250 LPI', '280 LPI', '300 LPI'];
    return lineaturas[colorIndex % lineaturas.length];
  }



  getColorKilos(program: MachineProgram, colorIndex: number): string {

    const key = `${program.otSap}-${colorIndex}`;
    const savedData = this.selectedAniloxData().get(key);
    if (savedData?.kilos) {
      return `${savedData.kilos} kg`;
    }

    const kilos = ['2.5 kg', '3.0 kg', '3.5 kg', '4.0 kg', '4.5 kg', '5.0 kg', '5.5 kg', '6.0 kg'];
    return kilos[colorIndex % kilos.length];
  }




  async loadAniloxByLineatura(bcm: number) {
    try {
      const anilox = await firstValueFrom(this.aniloxService.getByBCM(bcm));

      const currentMap = new Map(this.aniloxByLineatura());
      currentMap.set(bcm, anilox);
      this.aniloxByLineatura.set(currentMap);
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


  getSelectedLineatura(program: MachineProgram, colorIndex: number): number | null {
    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;
    return this.selectedAniloxData().get(key)?.lineatura || null;
  }


  getSelectedAnilox(program: MachineProgram, colorIndex: number): Anilox | null {
    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;
    return this.selectedAniloxData().get(key)?.anilox || null;
  }


  getSelectedKilos(program: MachineProgram, colorIndex: number): number | null {
    const key = `${program.otSap}-${colorIndex}`;
    return this.selectedAniloxData().get(key)?.kilos || null;
  }


  async onLineaturaChange(program: MachineProgram, colorIndex: number, lineatura: number) {

    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;

    const currentData = this.selectedAniloxData().get(key) || { lineatura: null, anilox: null, kilos: null };


    const newData = new Map(this.selectedAniloxData());
    newData.set(key, { ...currentData, lineatura: lineatura, anilox: null });
    this.selectedAniloxData.set(newData);


    const availableAnilox = this.getAniloxForMachine(program.machineNumber, lineatura);


    // Si solo hay UN anilox disponible para esta lineatura, auto-seleccionar y calcular
    if (availableAnilox.length === 1) {
      const autoAnilox = availableAnilox[0];
      console.log('🔄 Auto-seleccionando anilox único:', autoAnilox.codigo);
      this.onAniloxChange(program, colorIndex, autoAnilox.id);
    }


    this.cdr.detectChanges();

  }


  onAniloxChange(program: MachineProgram, colorIndex: number, aniloxId: number) {
    console.log('📊 Datos de entrada:', {
      otSap: program.otSap,
      articulo: program.articulo,
      metros: program.metros,
      anchoMm: program.anchoMm,
      colorIndex,
      aniloxId,
      colores: program.colores
    });

    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;

    const currentData = this.selectedAniloxData().get(key) || { lineatura: null, anilox: null, kilos: null };

    const lineatura = currentData.lineatura;
    if (!lineatura) {
    }

    // Buscar anilox en TODAS las máquinas (compartir anilox entre máquinas)
    const allMachines = this.aniloxByMachine();
    let selectedAnilox: Anilox | undefined;
    
    for (const [, aniloxList] of allMachines.entries()) {
      const found = aniloxList.find(a => a.id === aniloxId);
      if (found) {
        selectedAnilox = found;
        break;
      }
    }

    if (selectedAnilox) {

      console.log('🔍 Verificando condiciones para cálculo:', {
        'program.metros': program.metros,
        'selectedAnilox.volumen_real': selectedAnilox.volumen_real,
        'puede_calcular': !!(program.metros && selectedAnilox.volumen_real)
      });

      if (program.metros && selectedAnilox.volumen_real) {
        const metros = Number(program.metros);
        const colorName = program.colores[colorIndex];
        const articulo = program.articulo;

        console.log('🔍 Iniciando cálculo de kilos con:', {
          metros,
          colorName,
          articulo,
          volumen_real: selectedAnilox.volumen_real
        });

        // Obtener cobertura del color desde cod_tintas Y ancho del diseño
        this.codTintasService.getCoberturaForColor(articulo, colorName).subscribe({
          next: (coberturaFromDB) => {
            
            // Obtener el ancho del diseño desde la base de datos
            this.http.get<any>(`${environment.apiUrl}/designs/search`, {
              params: { search: articulo }
            }).subscribe({
              next: (designResponse) => {
                
                let anchoMm = program.anchoMm; // Por defecto usar el de la máquina
                let anchoOrigen = 'Máquina (program.anchoMm)';

                // Si encontramos el diseño, usar su ancho
                if (designResponse && designResponse.length > 0) {
                  
                  // ⚠️ IMPORTANTE: El backend devuelve camelCase (articleF, anchoMm) no PascalCase
                  const design = designResponse.find((d: any) => 
                    d.articleF?.toUpperCase() === articulo.toUpperCase()
                  );
                  
                  
                  if (design && design.anchoMm) {
                    anchoMm = design.anchoMm;
                    anchoOrigen = 'Diseño (base de datos)';
                  } else if (design) {
                  }
                } else {
                }

                console.log('📏 Ancho final a usar:', {
                  anchoMm,
                  anchoOrigen,
                  'program.anchoMm': program.anchoMm
                });

                if (!anchoMm) {
                  // Guardar sin kilos calculados - leer Map FRESCO para no sobrescribir otros colores
                  const freshData = new Map(this.selectedAniloxData());
                  freshData.set(key, {
                    lineatura: selectedAnilox.lineatura,
                    anilox: selectedAnilox,
                    kilos: null
                  });
                  this.selectedAniloxData.set(freshData);
                  this.cdr.detectChanges();
                  return;
                }

                const anchoMetros = anchoMm / 1000;
                let cobertura = coberturaFromDB || 100; // Por defecto 100% si no se encuentra
                
                const eficiencia = selectedAnilox.factor_eficiencia || 35;
                const densidad = selectedAnilox.densidad || 0.885;
                const factorCobertura = cobertura / 100;
                const factorEficiencia = eficiencia / 100;

                // ✅ FÓRMULA: (Ancho × Metros × Cobertura/100) × VolumenReal × (Eficiencia/100) ÷ 1000 × Densidad
                // Paso a paso:
                // 1. Ancho (m) × Metros × (Cobertura/100)
                const paso1 = anchoMetros * metros * factorCobertura;
                
                // 2. × VolumenReal
                const paso2 = paso1 * Number(selectedAnilox.volumen_real);
                
                // 3. × (Eficiencia/100)
                const paso3 = paso2 * factorEficiencia;
                
                // 4. ÷ 1000
                const paso4 = paso3 / 1000;
                
                // 5. × Densidad
                const kilosBase = paso4 * densidad;

                // Sumar Carga Muerta si existe
                const machineConfig = this.machineConfigs().get(program.machineNumber);
                const cargaMuerta = machineConfig?.cargaMuerta || 0;

                const calculatedKilos = Number((kilosBase + cargaMuerta).toFixed(3));

                console.log(`⚖️ DETALLES DEL CÁLCULO:`, {
                  '===DATOS DE ORIGEN===': '===',
                  articulo,
                  color: colorName,
                  '===VALORES===': '===',
                  '1_metros': metros + ' (de tabla maquinas)',
                  '2_anchoMm': anchoMm + ' mm (' + anchoOrigen + ')',
                  '3_anchoMetros': anchoMetros.toFixed(3) + ' m',
                  '4_cobertura': cobertura + '% (' + (coberturaFromDB ? 'de tabla cod_tintas' : 'por defecto 100%') + ')',
                  '5_factorCobertura': factorCobertura,
                  '6_volumen_real': selectedAnilox.volumen_real + ' cm³/m² (de tabla anilox)',
                  '7_factor_eficiencia': eficiencia + '% (de tabla anilox - se divide entre 100)',
                  '8_densidad': densidad + ' g/cm³ (de tabla anilox)',
                  '===PASOS DEL CÁLCULO===': '===',
                  'paso1_ancho_x_metros_x_cobertura': paso1.toFixed(6) + ' = ' + anchoMetros.toFixed(3) + ' × ' + metros + ' × ' + factorCobertura,
                  'paso2_x_volumen': paso2.toFixed(6) + ' = paso1 × ' + selectedAnilox.volumen_real,
                  'paso3_x_eficiencia': paso3.toFixed(6) + ' = paso2 × ' + factorEficiencia,
                  'paso4_div_1000': paso4.toFixed(6) + ' = paso3 / 1000',
                  'paso5_x_densidad': kilosBase.toFixed(6) + ' = paso4 × ' + densidad,
                  '===RESULTADO===': '===',
                  'kilosBase': kilosBase.toFixed(3) + ' kg',
                  'cargaMuerta': cargaMuerta + ' kg',
                  'RESULTADO_FINAL': calculatedKilos + ' kg',
                  '===FÓRMULA===': '(Ancho × Metros × Cobertura/100) × VolumenReal × (Eficiencia/100) ÷ 1000 × Densidad + CargaMuerta'
                });

                // Actualizar los datos - leer Map FRESCO para no sobrescribir otros colores
                const freshData = new Map(this.selectedAniloxData());
                freshData.set(key, {
                  lineatura: selectedAnilox.lineatura,
                  anilox: selectedAnilox,
                  kilos: calculatedKilos
                });
                this.selectedAniloxData.set(freshData);
                this.cdr.detectChanges();

              },
              error: (error) => {
                console.error('❌ Error obteniendo diseño:', error);
              }
            });
          },
          error: (error) => {
            console.error('❌ Error obteniendo cobertura:', error);
          }
        });
      } else {
        console.warn('⚠️ No se pudo realizar el cálculo automático. Faltan datos:', {
          metros: program.metros,
          volumen: selectedAnilox.volumen_real
        });
        
        // Actualizar sin cálculo (kilos = null, no 0) - leer Map FRESCO
        const freshData = new Map(this.selectedAniloxData());
        freshData.set(key, {
          lineatura: selectedAnilox.lineatura,
          anilox: selectedAnilox,
          kilos: null
        });
        this.selectedAniloxData.set(freshData);
        this.cdr.detectChanges();
      }
    } else {
      console.error('❌ No se encontró el anilox con ID:', aniloxId, 'en la máquina', program.machineNumber);
    }
  }


  onKilosChange(program: MachineProgram, colorIndex: number, kilos: number) {
    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;
    const currentData = this.selectedAniloxData().get(key) || { lineatura: null, anilox: null, kilos: null };

    const newData = new Map(this.selectedAniloxData());
    newData.set(key, { ...currentData, kilos });
    this.selectedAniloxData.set(newData);
  }

  /**
   * Auto-cargar anilox desde cod_tintas si existe el código
   * Se ejecuta cuando se expande el panel de colores
   */
  autoLoadAniloxFromCodTintas(program: MachineProgram, colorIndex: number) {
    const articulo = program.articulo;
    const colorName = program.colores[colorIndex];
    
    if (!articulo || !colorName) {
      return;
    }

    // Verificar si ya hay un anilox seleccionado para este color
    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;
    const currentData = this.selectedAniloxData().get(key);
    
    if (currentData && currentData.anilox) {
      // Si ya tiene anilox PERO no tiene kilos calculados, calcular ahora
      if (currentData.kilos === null || currentData.kilos === undefined) {
        this.onAniloxChange(program, colorIndex, currentData.anilox.id);
      }
      return;
    }


    // Obtener datos completos del color (cobertura y código de anilox)
    this.codTintasService.getColorData(articulo, colorName).subscribe({
      next: (colorData) => {
        if (!colorData || !colorData.codAnilox) {
          return;
        }

        const codAnilox = colorData.codAnilox.trim();

        // Buscar el anilox primero en la máquina del pedido
        const machineAnilox = this.aniloxByMachine().get(program.machineNumber) || [];
        let matchingAnilox = machineAnilox.find(a => 
          a.codigo?.trim().toUpperCase() === codAnilox.toUpperCase()
        );

        // Si no se encuentra en la máquina del pedido, buscar en todas las máquinas
        if (!matchingAnilox) {
          const allMachines = this.aniloxByMachine();
          for (const [machNum, aniloxList] of allMachines.entries()) {
            if (machNum === program.machineNumber) continue;
            const found = aniloxList.find(a => 
              a.codigo?.trim().toUpperCase() === codAnilox.toUpperCase()
            );
            if (found) {
              matchingAnilox = found;
              break;
            }
          }
        }

        if (matchingAnilox) {

          // Auto-seleccionar lineatura y anilox, luego calcular kilos
          const freshData = new Map(this.selectedAniloxData());
          freshData.set(key, { 
            lineatura: matchingAnilox.lineatura, 
            anilox: matchingAnilox, 
            kilos: null 
          });
          this.selectedAniloxData.set(freshData);
          this.cdr.detectChanges();
          
          // Calcular kilos inmediatamente
          this.onAniloxChange(program, colorIndex, matchingAnilox.id);
        } else {
        }
      },
      error: (error) => {
        console.error(`❌ [AUTO-CARGA] Error obteniendo datos de cod_tintas:`, error);
      }
    });
  }

  /**
   * Auto-cargar anilox para todos los colores de un programa
   */
  autoLoadAllAniloxForProgram(program: MachineProgram) {
    if (!program.colores || program.colores.length === 0) {
      return;
    }

    
    // Cargar todos los colores sin delay - las HTTP calls son asíncronas por naturaleza
    program.colores.forEach((color, index) => {
      this.autoLoadAniloxFromCodTintas(program, index);
    });
  }


  getAniloxForLineatura(bcm: number | null): Anilox[] {
    const result = bcm ? (this.aniloxByLineatura().get(bcm) || []) : [];
    if (bcm) {
    }
    return result;
  }




  async loadUniqueBCM() {
    try {
      const bcmList = await firstValueFrom(this.aniloxService.getUniqueLineaturas());
      this.lineaturas.set(bcmList);
    } catch (error: any) {
      console.error('❌ Error al cargar BCM únicos:', error);

      this.lineaturas.set([80, 140, 200, 275, 360, 400]);
    }
  }


  async loadAllMachineAnilox() {
    try {
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
    } catch (error) {
      console.error('❌ Error general cargando anilox por máquina:', error);
    }
  }


  async loadAllMachineConfigs() {
    try {
      const configsMap = new Map<number, { cargaMuerta: number }>();


      const promises = this.machineNumbers.map(async (num) => {
        try {
          // Ruta correcta: api/MachineConfig/{numeroMaquina}
          const response = await firstValueFrom(
            this.http.get<any>(`${environment.apiUrl}/MachineConfig/${num}`)
          );
          if (response) {
            // El backend devuelve 'carga_muestra', no 'cargaMuerta'
            const cargaMuestra = response.carga_muestra || 0;
            configsMap.set(num, { cargaMuerta: cargaMuestra });
          } else {
            configsMap.set(num, { cargaMuerta: 0 });
          }
        } catch (err) {
          configsMap.set(num, { cargaMuerta: 0 });
        }
      });

      await Promise.all(promises);
      this.machineConfigs.set(configsMap);
    } catch (error) {
      console.error('❌ Error general cargando configuraciones de máquinas:', error);
    }
  }



  getAniloxForMachine(machineNumber: number, lineatura: number | null): Anilox[] {
    if (!lineatura) {
      return [];
    }

    // Buscar primero en la máquina correspondiente
    const machineAnilox = this.aniloxByMachine().get(machineNumber) || [];
    let filtered = machineAnilox.filter(a => a.lineatura === lineatura);

    // Si no hay resultados, buscar en todas las máquinas
    if (filtered.length === 0) {
      const allMachines = this.aniloxByMachine();
      for (const [, aniloxList] of allMachines.entries()) {
        const found = aniloxList.filter(a => a.lineatura === lineatura);
        if (found.length > 0) {
          filtered = found;
          break;
        }
      }
    }

    return filtered;
  }


  getAvailableLineaturaForMachine(machineNumber: number): number[] {
    // Primero buscar en la máquina actual
    let machineAnilox = this.aniloxByMachine().get(machineNumber) || [];

    // Si la máquina actual no tiene anilox, buscar en TODAS las máquinas (compartir anilox)
    if (machineAnilox.length === 0) {
      const allMachines = this.aniloxByMachine();
      for (const [, aniloxList] of allMachines.entries()) {
        if (aniloxList.length > 0) {
          machineAnilox = aniloxList;
          break;
        }
      }
    }

    if (machineAnilox.length === 0) {
      return [];
    }

    const uniqueLineaturas = [...new Set(machineAnilox.map(a => a.lineatura))].sort((a, b) => a - b);

    return uniqueLineaturas;
  }



  async loadDesignInfo(articulo: string): Promise<any> {
    try {


      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/maquinas/design-info/${articulo}`)
      );

      if (response && response.success && response.found && response.data) {
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error(`❌ Error cargando información de diseño para artículo ${articulo}:`, error);
      return null;
    }
  }




  async loadColorsFromDesign(articulo: string): Promise<string[]> {
    const designInfo = await this.loadDesignInfo(articulo);
    return designInfo?.colores || [];
  }



  async toggleColorsWithLoad(program: MachineProgram, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const programId = String(program.otSap || '').trim();
    if (!programId) return;

    const expanded = new Set(this.expandedColors());

    if (expanded.has(programId)) {
      // Cerrar paleta
      expanded.delete(programId);
    } else {
      // Cerrar otras paletas abiertas (solo una a la vez)
      expanded.clear();
      expanded.add(programId);

      // Cargar información de diseño si no está cargada
      if (!program.anchoMm || program.anchoMm === 0) {
        const designInfo = await this.loadDesignInfo(program.articulo);
        
        if (designInfo) {
          const programs = this.programs();
          const updatedPrograms = programs.map(p => {
            if (String(p.otSap).trim() === programId) {
              const updatedColores = designInfo.colores || p.colores;
              return {
                ...p,
                cliente: designInfo.cliente || p.cliente,
                referencia: designInfo.referencia || p.referencia,
                sustrato: p.sustrato,
                anchoMm: Number(designInfo.anchoMm || p.anchoMm || 0),
                colores: updatedColores,
                numeroColores: updatedColores?.length || 0
              };
            }
            return p;
          });
          this.updatePrograms(updatedPrograms);
        }
      }

      // Auto-cargar anilox desde cod_tintas cuando se expande el panel
      console.log(`🔄 [TOGGLE-COLORS] Programa encontrado:`, {
        otSap: program.otSap,
        articulo: program.articulo,
        colores: program.colores,
        machineNumber: program.machineNumber
      });
      
      // Pequeño delay para que el DOM se actualice primero
      setTimeout(() => {
        this.autoLoadAllAniloxForProgram(program);
      }, 100);
    }

    this.expandedColors.set(expanded);
  }





  async changeStatus(program: MachineProgram, newStatus: MachineProgram['estado']) {
    if (!program.otSap || program.otSap.trim() === '') {
      this.showNotification('No se puede cambiar el estado: Falta OT SAP', 'error', 5000);
      return;
    }

    const normalizedOtSap = String(program.otSap).trim();
    const previousEstado = program.estado;
    const previousLastActionBy = program.lastActionBy;
    const previousLastActionAt = program.lastActionAt;
    const previousPreparando = program.preparandoStartedAt;
    const currentUser = this.authService.getCurrentUser();
    const optimisticUser =
      currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Usuario' : 'Usuario';

    // UI inmediata (sin spinner global)
    this.suppressOwnSignalR();
    this.patchProgramByOtSap(normalizedOtSap, {
      estado: newStatus,
      lastActionBy: optimisticUser,
      lastActionAt: new Date(),
      preparandoStartedAt: newStatus === 'PREPARANDO' ? new Date() : previousPreparando
    });

    const statusMessages: Record<string, string> = {
      'SIN_ASIGNAR': 'Programa activado y listo para asignar',
      'PREPARANDO': 'Iniciando preparación del programa',
      'LISTO': 'Programa preparado y listo para producción',
      'CORRIENDO': 'Producción en curso',
      'SUSPENDIDO': 'Programa suspendido temporalmente',
      'TERMINADO': 'Producción finalizada exitosamente'
    };
    let successMessage = (newStatus && statusMessages[newStatus]) || 'Estado actualizado correctamente';

    try {
      const response = await firstValueFrom(this.http.patch<any>(
        `${environment.apiUrl}/maquinas/${encodeURIComponent(normalizedOtSap)}/status`,
        {
          estado: newStatus,
          observaciones: program.observaciones || null,
          clientTimestamp: new Date().toISOString(),
          pantoneColors: this.pantoneService.filterPantoneOnly(program.colores || [])
        }
      ));

      if (!response?.success) {
        throw new Error('Respuesta del servidor inválida');
      }

      this.patchProgramByOtSap(normalizedOtSap, {
        estado: newStatus,
        lastActionBy: response.data?.lastActionBy || optimisticUser,
        lastActionAt: response.data?.lastActionAt ? parseUtcDate(response.data.lastActionAt) : new Date(),
        preparandoStartedAt: response.data?.preparandoStartedAt
          ? parseUtcDate(response.data.preparandoStartedAt)
          : (newStatus === 'PREPARANDO' ? new Date() : previousPreparando),
        observaciones: response.data?.observaciones || program.observaciones
      });

      if (previousEstado === 'PREPARANDO' && newStatus === 'LISTO') {
        const preparandoStartedAtFromServer = response.data?.preparandoStartedAt || previousPreparando;
        if (preparandoStartedAtFromServer) {
          const raw = preparandoStartedAtFromServer instanceof Date
            ? preparandoStartedAtFromServer.toISOString()
            : String(preparandoStartedAtFromServer);
          const fechaUTC = raw.endsWith('Z') ? raw : raw + 'Z';
          const tiempoInicio = new Date(fechaUTC);
          const totalSegundos = Math.floor(Math.abs(Date.now() - tiempoInicio.getTime()) / 1000);
          const horas = Math.floor(totalSegundos / 3600);
          const minutos = Math.floor((totalSegundos % 3600) / 60);
          const segundos = totalSegundos % 60;
          if (horas > 0) {
            successMessage = `Programa preparado en ${horas} hora${horas !== 1 ? 's' : ''} y ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
          } else if (minutos > 0) {
            successMessage = `Programa preparado en ${minutos} minuto${minutos !== 1 ? 's' : ''} y ${segundos} segundo${segundos !== 1 ? 's' : ''}`;
          } else {
            successMessage = `Programa preparado en ${segundos} segundo${segundos !== 1 ? 's' : ''}`;
          }
        } else {
          successMessage = 'Programa marcado como preparado';
        }
      }

      this.showStatusMessage(newStatus || 'SIN_ASIGNAR', successMessage);
    } catch (error: any) {
      this.patchProgramByOtSap(normalizedOtSap, {
        estado: previousEstado,
        lastActionBy: previousLastActionBy,
        lastActionAt: previousLastActionAt,
        preparandoStartedAt: previousPreparando
      });

      let errorMessage = 'Error al cambiar el estado del programa';
      if (error.status === 404) errorMessage = 'Programa no encontrado en la base de datos';
      else if (error.status === 400) errorMessage = 'Estado inválido o datos incorrectos';
      else if (error.status === 403) errorMessage = 'No tienes permiso para esta acción';
      else if (error.status === 500) errorMessage = 'Error interno del servidor al actualizar el estado';
      else if (error.status === 0) errorMessage = 'No se puede conectar con el servidor';

      this.showNotification(errorMessage, 'error', 5000);
    }
  }



  async handleAction(element: MachineProgram, newStatus: MachineProgram['estado']) {


    if (!this.canChangeToStatus(newStatus)) {
      this.showNotification('No tienes permiso para realizar esta acción', 'warning', 3000);
      return;
    }



    await this.changeStatus(element, newStatus);
  }




  suspendProgram(program: MachineProgram) {
    this.currentProgramToSuspend = program;
    this.suspendReason = '';
    this.showSuspendDialog = true;
  }


  setCurrentProgramForMenu(program: MachineProgram) {
    this.currentProgramForMenu = program;
  }


  closeSuspendDialog() {
    this.showSuspendDialog = false;
    this.currentProgramToSuspend = null;
    this.suspendReason = '';
  }


  selectPredefinedReason(reason: string) {
    if (this.suspendReason.includes(reason)) {

      this.suspendReason = this.suspendReason.replace(reason, '').trim();
    } else {

      this.suspendReason = this.suspendReason ? `${this.suspendReason}, ${reason}` : reason;
    }
  }


  async confirmSuspend() {
    if (!this.currentProgramToSuspend || !this.suspendReason.trim()) {
      return;
    }

    if (!this.canChangeToSuspendido()) {
      this.showNotification('No tienes permiso para suspender programas', 'warning', 3000);
      return;
    }

    const program = this.currentProgramToSuspend;
    const reason = this.suspendReason.trim();
    const normalizedOtSap = String(program.otSap).trim();
    const previous = {
      estado: program.estado,
      observaciones: program.observaciones,
      lastActionBy: program.lastActionBy,
      lastActionAt: program.lastActionAt
    };
    const currentUser = this.authService.getCurrentUser();
    const optimisticUser =
      currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Usuario' : 'Usuario';

    this.closeSuspendDialog();
    this.suppressOwnSignalR();
    this.patchProgramByOtSap(normalizedOtSap, {
      estado: 'SUSPENDIDO',
      observaciones: reason,
      lastActionBy: optimisticUser,
      lastActionAt: new Date()
    });
    this.showStatusMessage('SUSPENDIDO', 'Programa SUSPENDIDO');

    try {
      const response = await firstValueFrom(this.http.patch<any>(
        `${environment.apiUrl}/maquinas/${encodeURIComponent(normalizedOtSap)}/status`,
        {
          estado: 'SUSPENDIDO',
          observaciones: reason,
          clientTimestamp: new Date().toISOString(),
          pantoneColors: this.pantoneService.filterPantoneOnly(program.colores || [])
        }
      ));

      if (!response?.success) {
        throw new Error('Respuesta del servidor inválida');
      }

      this.patchProgramByOtSap(normalizedOtSap, {
        estado: 'SUSPENDIDO',
        observaciones: reason,
        lastActionBy: response.data?.lastActionBy || optimisticUser,
        lastActionAt: response.data?.lastActionAt ? parseUtcDate(response.data.lastActionAt) : new Date()
      });
    } catch (error: any) {
      this.patchProgramByOtSap(normalizedOtSap, previous);
      let errorMessage = 'Error al suspender el programa';
      if (error.status === 404) errorMessage = 'Programa no encontrado en la base de datos';
      else if (error.status === 403) errorMessage = 'No tienes permiso para suspender programas';
      else if (error.status === 500) errorMessage = 'Error interno del servidor al suspender';
      this.showNotification(errorMessage, 'error', 5000);
    }
  }



















  async onFileSelectedFormat2(event: any): Promise<void> {
    if (!this.userPermissions().canLoadExcel) {
      this.showNotification('No tienes permiso para cargar programación', 'warning', 3000);
      if (event?.target) event.target.value = '';
      return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!['.xlsx', '.xls', '.xlsm'].includes(fileExtension)) {
      this.showNotification('Solo se permiten archivos Excel (.xlsx, .xls, .xlsm)', 'error', 5000);
      event.target.value = '';
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.showNotification('Tu sesión ha expirado. Inicia sesión nuevamente.', 'warning', 5000);
      event.target.value = '';
      return;
    }

    this.loading.set(true);
    this.uploadProgress.set(0);
    // Ignorar SignalR durante la importación para evitar recargas dobles/competidoras
    this.ignoringSignalR = true;
    if (this.ignoringSignalRTimeout) clearTimeout(this.ignoringSignalRTimeout);
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Subiendo programación formato 2:', file.name);

      const req = new HttpRequest('POST', `${environment.apiUrl}/maquinas/import/formato2`, formData, {
        reportProgress: true
      });

      const response = await new Promise<any>((resolve, reject) => {
        this.http.request(req).subscribe({
          next: (event) => {
            if (event.type === HttpEventType.UploadProgress) {
              const percent = event.total ? Math.round(100 * event.loaded / event.total) : 0;
              this.uploadProgress.set(percent);
            } else if (event.type === HttpEventType.Response) {
              this.uploadProgress.set(100);
              console.log('✅ Respuesta formato 2 recibida:', event.body);
              resolve(event.body);
            }
          },
          error: (err) => {
            console.error('❌ Error HTTP formato 2:', err.status, err.statusText, err.error);
            reject(err);
          }
        });
      });

      if (response) {
        const created = response.totalCreated || 0;
        const updated = response.totalUpdated || 0;
        const msg = updated > 0 
          ? `Formato 2 importado: ${created} creados, ${updated} actualizados`
          : `Formato 2 importado: ${created} registros creados`;
        this.showNotification(msg, 'success', 5000);
        
        // Pequeño delay para asegurar que la transacción MySQL se propagó
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.loadPrograms();
      }
    } catch (error: any) {
      console.error('❌ Error importando formato 2:', error);
      const msg = error?.error?.message || 'Error al procesar el archivo';
      this.showNotification(msg, 'error', 5000);
    } finally {
      this.loading.set(false);
      this.uploadProgress.set(null);
      event.target.value = '';
      // Reactivar SignalR después de 5 segundos
      this.ignoringSignalRTimeout = setTimeout(() => { this.ignoringSignalR = false; }, 5000);
    }
  }


  async onFileSelected(event: any): Promise<void> {


    if (!this.userPermissions().canLoadExcel) {
      this.showNotification('No tienes permiso para cargar programación', 'warning', 3000);

      if (event?.target) event.target.value = '';
      return;
    }



    const file = event.target.files[0];


    if (!file) {
      return;
    }

    console.log('✅ Archivo válido:', {
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type
    });


    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();

    console.log('🔐 Estado de autenticación:', {
      tieneToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token?.substring(0, 30) + '...',
      isLoggedIn: isLoggedIn,
      usuario: this.authService.getCurrentUser()
    });


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


      event.target.value = '';
      return;
    }



    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];


    const allowedExtensions = ['.xlsx', '.xls', '.xlsm'];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));


    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      this.showNotification('Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls, .xlsm)', 'error', 5000);
      return;
    }



    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showNotification('El archivo es demasiado grande. Máximo: 500MB', 'error', 5000);
      return;
    }

    this.loading.set(true);
    try {


      const formData = new FormData();
      formData.append('file', file);
      formData.append('moduleType', 'machines');
      formData.append('timestamp', new Date().toISOString());


      console.log('📤 Subiendo archivo de programación:', {
        nombre: file.name,
        tamaño: `${(file.size / 1024).toFixed(2)} KB`,
        tipo: file.type,
        timestamp: new Date().toISOString()
      });

      this.uploadProgress.set(0);

      const req = new HttpRequest('POST', `${environment.apiUrl}/maquinas/import/excel-multisheet`, formData, {
        reportProgress: true
      });

      const response = await new Promise<any>((resolve, reject) => {
        this.http.request(req).subscribe({
          next: (event) => {
            if (event.type === HttpEventType.UploadProgress) {
              const percent = event.total ? Math.round(100 * event.loaded / event.total) : 0;
              this.uploadProgress.set(percent);
            } else if (event.type === HttpEventType.Response) {
              this.uploadProgress.set(100);
              resolve(event.body);
            }
          },
          error: (err) => reject(err)
        });
      });




      if (response && response.message === 'Importación completada') {
        console.log('� Estadísticas de importación:', {
          hojasProcesadas: response.sheetsProcessed,
          registrosCreados: response.totalCreated,
          errores: response.totalErrors,
          resultadosPorMaquina: response.results
        });






        this.clearAllMessages();

        await this.loadPrograms();



        const programasActualizados = this.programs();
        console.log('✅ Archivo procesado exitosamente y datos recargados', {
          programasCreados: response.totalCreated,
          programasEnBD: programasActualizados.length,
          programasPreparando: programasActualizados.filter(p => p.estado === 'PREPARANDO' || p.estado === 'SIN_ASIGNAR').length,
          programasListos: programasActualizados.filter(p => p.estado === 'LISTO').length,
          programasSuspendidos: programasActualizados.filter(p => p.estado === 'SUSPENDIDO').length,
          programasCorriendo: programasActualizados.filter(p => p.estado === 'CORRIENDO').length,
          maquinasProgramadas: new Set(programasActualizados.map(p => p.machineNumber)).size,
          hojasProcesadas: response.sheetsProcessed,
          errores: response.totalErrors,
          archivo: file.name
        });

        // Snackbar con icono animado
        const mensajeBase = response.totalErrors > 0
          ? `${response.totalCreated} programas cargados · ${response.totalErrors} errores`
          : `${response.totalCreated} programas cargados exitosamente`;
        
        const mensajeConIcono = `<span class="status-icon">✓</span>${mensajeBase}`;
        
        const snackBarRef = this.snackBar.open('', 'Cerrar', { 
          duration: 3500,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        // Inyectar HTML con el icono estilizado
        setTimeout(() => {
          const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);



        event.target.value = '';



        const programasFinales = this.programs();
        if (programasFinales.length > 0) {
          const firstMachineWithPrograms = programasFinales[0].machineNumber;
          this.selectMachine(firstMachineWithPrograms);
        }

      } else {


        throw new Error(response?.message || 'Error al procesar el archivo');
      }

    } catch (error: any) {

      console.error('❌ Error procesando archivo:', error);
      console.error('📋 Detalles completos del error:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        error: error.error,
        url: error.url,
        headers: error.headers
      });


      if (error.status === 401) {
        console.error('🔒 Sesión expirada o no autorizado');

        // Snackbar de sesión expirada con icono animado
        const mensajeConIcono = `<span class="status-icon">⚠</span>Sesión expirada`;
        
        const snackBarRef = this.snackBar.open('', 'Iniciar sesión', { 
          duration: 8000,
          panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        // Inyectar HTML con el icono estilizado
        setTimeout(() => {
          const label = document.querySelector('.status-preparando-snackbar .mat-mdc-snack-bar-label');
          if (label) {
            label.innerHTML = mensajeConIcono;
          }
        }, 0);

        snackBarRef.onAction().subscribe(() => {
          window.location.href = '/login';
        });

        event.target.value = '';
        return;
      }

      // Mensajes de error con icono animado
      let errorMessage = 'Error al cargar archivo';

      if (error.status === 400) {
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = 'Formato de archivo inválido';
        }
      } else if (error.status === 413) {
        errorMessage = 'Archivo muy grande';
      } else if (error.status === 0) {
        errorMessage = 'Sin conexión al servidor';
      } else if (error.status === 500) {
        errorMessage = 'Error del servidor';
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error(`❌ ${errorMessage}`, error);

      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>${errorMessage}`;
      
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 4500,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      // Inyectar HTML con el icono estilizado
      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);

    } finally {


      this.loading.set(false);
      this.uploadProgress.set(null);
    }
  }




  getStatusColor(estado: string): string {
    const colors = {
      'SIN_ASIGNAR': '#94a3b8',
      'PREPARANDO': '#eab308',
      'LISTO': '#16a34a',
      'SUSPENDIDO': '#f97316',
      'CORRIENDO': '#dc2626',
      'TERMINADO': '#059669'
    };

    return colors[estado as keyof typeof colors] || '#64748b';
  }


  getStatusIcon(estado: string): string {
    const icons = {
      'SIN_ASIGNAR': 'radio_button_unchecked',
      'PREPARANDO': 'schedule',
      'LISTO': 'check_circle',
      'SUSPENDIDO': 'pause_circle',
      'CORRIENDO': 'play_circle',
      'TERMINADO': 'task_alt'
    };

    return icons[estado as keyof typeof icons] || 'help';
  }


  getEstadoDisplay(estado: string): string {



    const estadoNormalizado = (estado || '').toString().trim().toUpperCase();


    const displayTexts: Record<string, string> = {
      'SIN_ASIGNAR': 'SIN ASIGNAR',
      'PREPARANDO': 'PREPARANDO',
      'LISTO': 'PREPARADO',
      'SUSPENDIDO': 'SUSPENDIDO',
      'CORRIENDO': 'CORRIENDO',
      'TERMINADO': 'TERMINADO'
    };

    const result = displayTexts[estadoNormalizado] || (estado ? estado.replace('_', ' ') : 'SIN ASIGNAR');



    return result;
  }

  /**
   * Suprime temporalmente las notificaciones SignalR propias para evitar mensajes duplicados.
   * Se reactiva automáticamente después de 3 segundos.
   */
  private suppressOwnSignalR(): void {
    this.ignoringSignalR = true;
    if (this.ignoringSignalRTimeout) {
      clearTimeout(this.ignoringSignalRTimeout);
    }
    this.ignoringSignalRTimeout = setTimeout(() => {
      this.ignoringSignalR = false;
      this.ignoringSignalRTimeout = null;
    }, 3000);
  }

  /**
   * Muestra notificación SignalR con el mismo diseño de colores que las acciones
   */
  private showSignalRNotification(machineNumber: number, userName: string, estado: string): void {
    const estadoUpper = (estado || '').toUpperCase();

    const iconosPorEstado: Record<string, string> = {
      'PREPARANDO': '⏱',
      'LISTO': '✓',
      'CORRIENDO': '▶',
      'SUSPENDIDO': '⏸',
      'TERMINADO': '🏁',
      'SIN_ASIGNAR': '📋'
    };

    const statusConfig: Record<string, { panelClass: string }> = {
      'PREPARANDO': { panelClass: 'status-preparando-snackbar' },
      'LISTO': { panelClass: 'status-listo-snackbar' },
      'CORRIENDO': { panelClass: 'status-corriendo-snackbar' },
      'SUSPENDIDO': { panelClass: 'status-suspendido-snackbar' },
      'TERMINADO': { panelClass: 'status-terminado-snackbar' },
      'SIN_ASIGNAR': { panelClass: 'status-sin-asignar-snackbar' }
    };

    const config = statusConfig[estadoUpper] || { panelClass: 'status-default-snackbar' };
    const icono = iconosPorEstado[estadoUpper] || '🔔';
    const mensaje = `M${machineNumber} → ${estadoUpper} por ${userName}`;
    const mensajeConIcono = `<span class="status-icon">${icono}</span>${mensaje}`;

    const snackBarRef = this.snackBar.open('', '', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [config.panelClass, 'animated-snackbar']
    });

    setTimeout(() => {
      const label = document.querySelector(`.${config.panelClass} .mat-mdc-snack-bar-label`);
      if (label) {
        label.innerHTML = mensajeConIcono;
      }
    }, 0);
  }

  /**
   * Muestra un mensaje personalizado y animado según el estado
   */
  showStatusMessage(estado: string, message: string): void {
    // Iconos por estado
    const iconosPorEstado: Record<string, string> = {
      'PREPARANDO': '⏱',
      'LISTO': '✓',
      'CORRIENDO': '▶',
      'SUSPENDIDO': '⏸',
      'TERMINADO': '🏁',
      'SIN_ASIGNAR': '📋'
    };
    
    const icono = iconosPorEstado[estado] || '✓';
    
    // Si el mensaje contiene "preparado en", usarlo directamente (tiempo calculado)
    // De lo contrario, usar mensajes predeterminados
    let mensajeFinal = message;
    
    if (!message.includes('preparado en') && !message.includes('hora') && !message.includes('minuto')) {
      const mensajesPorEstado: Record<string, string> = {
        'PREPARANDO': 'Iniciando preparación del programa',
        'LISTO': 'Programa listo para producción',
        'CORRIENDO': 'Corriendo pedido',
        'SUSPENDIDO': 'Programa suspendido',
        'TERMINADO': 'Producción finalizada',
        'SIN_ASIGNAR': 'Programa activado'
      };
      
      mensajeFinal = mensajesPorEstado[estado] || message;
    }
    
    // Agregar icono con span para estilizarlo
    const mensajeConIcono = `<span class="status-icon">${icono}</span>${mensajeFinal}`;

    const statusConfig: Record<string, { panelClass: string }> = {
      'PREPARANDO': { panelClass: 'status-preparando-snackbar' },
      'LISTO': { panelClass: 'status-listo-snackbar' },
      'CORRIENDO': { panelClass: 'status-corriendo-snackbar' },
      'SUSPENDIDO': { panelClass: 'status-suspendido-snackbar' },
      'TERMINADO': { panelClass: 'status-terminado-snackbar' },
      'SIN_ASIGNAR': { panelClass: 'status-sin-asignar-snackbar' }
    };

    const config = statusConfig[estado] || { panelClass: 'status-default-snackbar' };

    // Reproducir sonido según configuración global
    const soundType = (estado === 'LISTO' || estado === 'CORRIENDO') ? 'success' 
                    : (estado === 'SUSPENDIDO' || estado === 'TERMINADO') ? 'warning' 
                    : 'info';
    this.notificationService.playSoundIfEnabled(soundType);

    const snackBarRef = this.snackBar.open('', '', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [config.panelClass, 'animated-snackbar']
    });
    
    // Inyectar HTML con el icono estilizado
    setTimeout(() => {
      const label = document.querySelector(`.${config.panelClass} .mat-mdc-snack-bar-label`);
      if (label) {
        label.innerHTML = mensajeConIcono;
      }
    }, 0);
  }

  /**
   * Muestra una notificación con el estilo animado del sistema.
   * Tipo: 'success' (verde), 'error' (rojo), 'warning' (amarillo), 'info' (azul)
   */
  showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 4000): void {
    const config: Record<string, { panelClass: string, icon: string }> = {
      'success': { panelClass: 'status-listo-snackbar', icon: '✓' },
      'error': { panelClass: 'status-terminado-snackbar', icon: '✕' },
      'warning': { panelClass: 'status-preparando-snackbar', icon: '⚠' },
      'info': { panelClass: 'status-corriendo-snackbar', icon: 'ℹ' }
    };

    const { panelClass, icon } = config[type];
    const mensajeConIcono = `<span class="status-icon">${icon}</span>${message}`;

    this.snackBar.open('', '', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [panelClass, 'animated-snackbar']
    });

    setTimeout(() => {
      const label = document.querySelector(`.${panelClass} .mat-mdc-snack-bar-label`);
      if (label) label.innerHTML = mensajeConIcono;
    }, 0);
  }

  // Método helper para debugging del historial
  getHistoryCount(program: MachineProgram): number {
    const count = program.actionHistory?.length || 0;
    return count;
  }








  formatElapsedTime(startDate: Date, endDate?: Date): string {

    const end = endDate || new Date();



    const diff = end.getTime() - startDate.getTime();




    const hours = Math.floor(diff / (1000 * 60 * 60));




    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));


    return hours + 'h ' + minutes + 'm';
  }






  getProgressWidth(progreso: number): string {




    return Math.min(100, Math.max(0, progreso)) + '%';
  }






  isMachineActive(machineNumber: number): boolean {

    const programs = this.programs().filter(p => p.machineNumber === machineNumber);



    return programs.some(p => p.estado === 'CORRIENDO');
  }







  getMachineSummary(machineNumber: number): string {

    const programs = this.programs().filter(p => p.machineNumber === machineNumber);


    const running = programs.filter(p => p.estado === 'CORRIENDO').length;


    const ready = programs.filter(p =>
      p.estado === 'LISTO' ||
      p.estado === 'PREPARANDO'
    ).length;


    if (running > 0) {
      return running + ' corriendo, ' + ready + ' listos';
    }


    return ready + ' programas listos';
  }


  async exportToExcel() {

    if (!this.userPermissions().canDownloadTemplate) {
      this.showNotification('No tienes permiso para exportar a Excel', 'warning', 3000);
      return;
    }

    try {

      this.loading.set(true);


      const dataToExport = this.programs();


      if (dataToExport.length === 0) {
        this.showNotification('No hay programas para exportar', 'info', 3000);
        this.loading.set(false);
        return;
      }


      const excelData = dataToExport.map(program => {

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


        const coloresFormatted = program.colores && program.colores.length > 0
          ? program.colores.join(', ')
          : '';


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


      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `programacion-maquinas-${timestamp}`;


      await this.excelService.exportToExcel(excelData, fileName, 'Programación');




      // Snackbar con icono animado
      const mensajeBase = `Exportación exitosa: ${dataToExport.length} programas exportados a ${fileName}.xlsx`;
      const mensajeConIcono = `<span class="status-icon">✓</span>${mensajeBase}`;
      
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 5000,
        panelClass: ['status-listo-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      // Inyectar HTML con el icono estilizado
      setTimeout(() => {
        const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);

      this.loading.set(false);
    } catch (error) {
      console.error('❌ Error exportando a Excel:', error);
      
      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al exportar archivo`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      // Inyectar HTML con el icono estilizado
      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
      
      this.loading.set(false);
    }
  }


  async refreshData() {
    try {




      this.snackBar.open('Actualizando datos...', '', { 
        duration: 2000,
        panelClass: ['status-corriendo-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });



      const selectedMachine = this.selectedMachineNumber();




      await this.loadPrograms();



      if (selectedMachine) {
        this.selectMachine(selectedMachine);
      }



      // Snackbar con icono animado
      const mensajeConIcono = `<span class="status-icon">✓</span>Datos actualizados correctamente`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 3000,
        panelClass: ['status-listo-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      // Inyectar HTML con el icono estilizado
      setTimeout(() => {
        const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);



    } catch (error) {
      console.error('❌ Error al refrescar datos:', error);
      
      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al actualizar datos`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 5000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      // Inyectar HTML con el icono estilizado
      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    }
  }





  async printFF459(program: MachineProgram) {




    if (!program || !program.articulo) {
      console.error('❌ Error: Programa inválido para impresión', program);
      
      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error: No se puede imprimir el formato para este programa`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 5000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
      
      return;
    }

    // ===== VALIDACIÓN: NO SE PUEDE IMPRIMIR SIN ACCIÓN =====
    // Verificar que el programa NO esté en estado SIN_ASIGNAR
    if (!program.estado || program.estado === 'SIN_ASIGNAR') {
      
      // Snackbar de advertencia con icono animado
      const mensajeConIcono = `<span class="status-icon">⚠</span>No se puede imprimir. El programa debe tener un estado (Preparando)`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 6000,
        panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-preparando-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
      
      return;
    }

    // Verificar que el programa tenga al menos una acción registrada
    if (!program.lastActionBy || !program.lastActionAt) {
      
      // Snackbar de advertencia con icono animado
      const mensajeConIcono = `<span class="status-icon">⚠</span>No se puede imprimir el formato FF-459. Primero debe registrarse una acción en el sistema`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 6000,
        panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-preparando-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
      
      return;
    }

    console.log('✅ Validación de acción pasada:', {
      lastActionBy: program.lastActionBy,
      lastActionAt: program.lastActionAt,
      estado: program.estado
    });



    // ===== ABRIR VENTANA INMEDIATAMENTE para que el usuario vea respuesta =====
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
      const mensajeConIcono = `<span class="status-icon">✕</span>Error: No se pudo abrir la ventana de impresión`;
      this.snackBar.open('', 'Cerrar', { duration: 5000, panelClass: ['status-terminado-snackbar', 'animated-snackbar'], horizontalPosition: 'center', verticalPosition: 'bottom' });
      setTimeout(() => { const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label'); if (label) label.innerHTML = mensajeConIcono; }, 0);
      return;
    }
    printWindow.document.write(`<html><head><title>FF-459</title><style>
      @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      @keyframes dots { 0%{content:''} 25%{content:'.'} 50%{content:'..'} 75%{content:'...'} }
      body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%);font-family:'Segoe UI',Arial,sans-serif;}
      .loader{text-align:center;}
      .hourglass{font-size:64px;animation:spin 2s ease-in-out infinite;display:inline-block;margin-bottom:20px;}
      .text{font-size:20px;color:#2c3e50;font-weight:500;letter-spacing:0.5px;}
      .text::after{content:'';animation:dots 1.5s infinite;}
      .sub{font-size:13px;color:#7f8c8d;margin-top:10px;animation:pulse 2s infinite;}
      .bar-container{width:220px;height:4px;background:#dfe6e9;border-radius:4px;margin:18px auto 0;overflow:hidden;}
      .bar{width:40%;height:100%;background:linear-gradient(90deg,#3498db,#2ecc71);border-radius:4px;animation:loading 1.2s ease-in-out infinite;}
      @keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
    </style></head><body>
      <div class="loader">
        <div class="hourglass">⏳</div>
        <div class="text">Preparando formato FF-459</div>
        <div class="bar-container"><div class="bar"></div></div>
        <div class="sub">Obteniendo datos del programa</div>
      </div>
    </body></html>`);

    const today = new Date();
    const dia = String(today.getDate()).padStart(2, '0');
    const mes = String(today.getMonth() + 1).padStart(2, '0');
    const anio = today.getFullYear();
    const fechaActual = `${dia}/${mes}/${anio}`;

    // Nombre del operario: buscar específicamente quién dio LISTO en el historial
    let nombreCompleto = 'Usuario';
    if (program.actionHistory && program.actionHistory.length > 0) {
      const listoAction = program.actionHistory.find(h => 
        h.action?.toUpperCase().includes('LISTO') || 
        h.description?.toUpperCase().includes('LISTO')
      );
      if (listoAction) {
        nombreCompleto = listoAction.user || 'Usuario';
      } else {
        nombreCompleto = program.lastActionBy || 'Usuario';
      }
    } else {
      nombreCompleto = program.lastActionBy || 'Usuario';
    }

    // Si no se cargó el historial, intentar cargarlo
    if (!program.actionHistory || program.actionHistory.length === 0) {
      try {
        await this.loadProgramHistory(program.otSap);
        const updatedProgram = this.programs().find(p => p.otSap === program.otSap);
        if (updatedProgram?.actionHistory) {
          const listoAction = updatedProgram.actionHistory.find(h => 
            h.action?.toUpperCase().includes('LISTO') || 
            h.description?.toUpperCase().includes('LISTO')
          );
          if (listoAction) {
            nombreCompleto = listoAction.user || nombreCompleto;
          }
        }
      } catch {}
    }

    // ===== CARGAR COLORES + TEMPLATE EN PARALELO (sin historial) =====
    const coloresPromise = this.prepareColorsForFF459(program.colores, program);

    const templatePromise = this.ff459TemplateCache
      ? Promise.resolve(this.ff459TemplateCache)
      : firstValueFrom(this.templateHttp.get('/templates/print-ff459.html', { responseType: 'text' }))
          .then(html => { this.ff459TemplateCache = html; return html; });

    const [coloresArray, response] = await Promise.all([coloresPromise, templatePromise]);

    try {
      let htmlContent = response;




      // ===== OBSERVACIONES =====
      const obsText = program.observaciones || '';

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
        .replace(/\$\{program\.articulo\s*\|\|\s*[\s\S]*?['"]{2}\}/g, program.articulo || '')
        .replace(/\$\{program\.observaciones\s*\|\|\s*[\s\S]*?['"]{2}\}/g, obsText)
        .replace(/\{\{OBSERVACIONES_TEXT\}\}/g, obsText);



      // Reemplazar colores individuales (color1 a color10)
      coloresArray.forEach((colorObj: any, index: number) => {
        const colorNum = index + 1;
        htmlContent = htmlContent.replaceAll(`\${color${colorNum}}`, colorObj.color || '');
        htmlContent = htmlContent.replaceAll(`\${lineatura${colorNum}}`, colorObj.lineaturaAnilox || '');
        htmlContent = htmlContent.replaceAll(`\${codigoAnilox${colorNum}}`, colorObj.codigoAnilox || '');
        htmlContent = htmlContent.replaceAll(`\${codigoTinta${colorNum}}`, colorObj.codigoTinta || '');
      });

      // Verificar si hay códigos de tinta faltantes
      const missingCodTintas = coloresArray
        .filter((c: any) => c.color && !c.codigoTinta)
        .map((c: any) => c.color);
      
      if (missingCodTintas.length > 0) {
      }


      // ===== INYECTAR HTML EN LA VENTANA YA ABIERTA =====
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      const mensajeConIcono = `<span class="status-icon">✓</span>Formato FF-459 listo para imprimir`;
      this.snackBar.open('', 'Cerrar', { duration: 3000, panelClass: ['status-listo-snackbar', 'animated-snackbar'], horizontalPosition: 'center', verticalPosition: 'bottom' });
      setTimeout(() => { const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label'); if (label) label.innerHTML = mensajeConIcono; }, 0);

    } catch (error) {
      console.error('❌ Error cargando plantilla HTML:', error);
      if (printWindow && !printWindow.closed) {
        printWindow.document.open();
        printWindow.document.write('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;color:red;">Error cargando el formato. Cierre esta ventana e intente de nuevo.</body></html>');
        printWindow.document.close();
      }
      const mensajeConIcono = `<span class="status-icon">✕</span>Error: No se pudo cargar la plantilla de impresión`;
      this.snackBar.open('', 'Cerrar', { duration: 5000, panelClass: ['status-terminado-snackbar', 'animated-snackbar'], horizontalPosition: 'center', verticalPosition: 'bottom' });
      setTimeout(() => { const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label'); if (label) label.innerHTML = mensajeConIcono; }, 0);
    }
  }

  // ===== MÉTODO AUXILIAR PARA PREPARAR COLORES PARA FF-459 =====
  // Prepara un array de exactamente 10 colores para el formato FF-459
  // Si hay menos de 10 colores, rellena con objetos vacíos
  // Si hay más de 10 colores, toma solo los primeros 10
  private async prepareColorsForFF459(colores: string[], program: MachineProgram): Promise<any[]> {
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
      // Crear promesas para obtener códigos de tinta
      const promises = colores.slice(0, 10).map(async (color, index) => {
        coloresFF459[index].color = color;

        const key = `${program.otSap}-${index}`;
        const aniloxData = this.selectedAniloxData().get(key);

        if (aniloxData && aniloxData.anilox) {
          const lineatura = aniloxData.anilox.lineatura || '';
          const volumen = aniloxData.anilox.volumen_real || '';
          coloresFF459[index].lineaturaAnilox = lineatura && volumen ? `${lineatura} - ${volumen}` : '';
          coloresFF459[index].codigoAnilox = aniloxData.anilox.codigo || '';
        }

        // Obtener código de tinta desde cod_tintas (con cache + timeout 2s)
        try {
          const cacheKey = `${program.articulo}|${color}`;
          let colorData = this.codTintasCache.get(cacheKey);
          if (!colorData) {
            colorData = await firstValueFrom(
              this.codTintasService.getColorData(program.articulo, color).pipe(timeout(2000))
            );
            if (colorData) this.codTintasCache.set(cacheKey, colorData);
          }
          if (colorData && colorData.codTinta) {
            coloresFF459[index].codigoTinta = colorData.codTinta;
          }
        } catch (error) {
          // Timeout o error — código de tinta es opcional, continuar
        }
      });

      await Promise.all(promises);
    }
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
      const storedMessages = localStorage.getItem(this.MESSAGES_STORAGE_KEY);

      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);

        const messagesMap = new Map<string, { message: string, timestamp: Date, sender: string, read: boolean }>();

        // Convertir el objeto almacenado de vuelta a Map con fechas correctas
        Object.entries(parsedMessages).forEach(([otSap, messageData]: [string, any]) => {
          messagesMap.set(otSap, {
            ...messageData,
            timestamp: new Date(messageData.timestamp) // Convertir string de fecha de vuelta a Date
          });
        });

        this.programMessages.set(messagesMap);
      } else {
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

      // Convertir Map a objeto para poder serializarlo
      const messagesObject: any = {};
      messagesMap.forEach((messageData, otSap) => {
        messagesObject[otSap] = {
          ...messageData,
          timestamp: messageData.timestamp.toISOString() // Convertir Date a string para serialización
        };
      });

      const jsonString = JSON.stringify(messagesObject);

      localStorage.setItem(this.MESSAGES_STORAGE_KEY, jsonString);

      // Verificar que se guardó correctamente
      const verification = localStorage.getItem(this.MESSAGES_STORAGE_KEY);

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

    // Verificar permisos
    if (!this.userPermissions().canSendMessages) {
      // Snackbar de advertencia con icono animado
      const mensajeConIcono = `<span class="status-icon">⚠</span>No tienes permisos para enviar mensajes`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 3000,
        panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-preparando-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
      
      return;
    }

    this.messageProgram = program;

    // Verificar si ya existe un mensaje para este programa (en observaciones)
    if (program.observaciones && program.observaciones.trim() !== '') {
      this.currentMessage = program.observaciones;
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
      const normalizedOtSap = String(this.messageProgram.otSap).trim();
      const url = `${environment.apiUrl}/maquinas/${encodeURIComponent(normalizedOtSap)}/status`;


      // Suprimir notificaciones SignalR propias para evitar mensajes duplicados
      this.suppressOwnSignalR();

      // Enviar PATCH al backend para actualizar las observaciones
      const response = await firstValueFrom(this.http.patch<any>(url, {
        estado: this.messageProgram.estado, // Mantener el estado actual
        observaciones: this.currentMessage.trim() // Guardar el mensaje en observaciones
      }));


      // Actualizar el programa localmente con las nuevas observaciones
      const programs = this.programs();
      const programIndex = programs.findIndex(p => String(p.otSap).trim() === normalizedOtSap);

      if (programIndex !== -1) {
        const updatedPrograms = programs.map((p, index) => {
          if (index === programIndex) {
            return {
              ...p,
              observaciones: this.currentMessage.trim()
              // NO cambiar lastActionBy ni lastActionAt — enviar mensaje no es una acción
            };
          }
          return p;
        });

        this.updatePrograms(updatedPrograms);
      }

      const actionText = this.isEditingMessage ? 'actualizado' : 'enviado';
      
      // Snackbar de éxito con icono animado
      const mensajeConIcono = `<span class="status-icon">✓</span>Mensaje ${actionText} exitosamente`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 3000,
        panelClass: ['status-listo-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
      
      this.closeMessageDialog();

    } catch (error: any) {
      console.error('❌ Error enviando mensaje:', error);
      
      // Snackbar de error con icono animado
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al enviar mensaje`;
      const snackBarRef = this.snackBar.open('', 'Cerrar', { 
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Mostrar mensaje para un programa específico
   */
  showMessage(program: MachineProgram) {

    if (!program.observaciones || program.observaciones.trim() === '') {
      this.showNotification('No hay mensajes para este programa', 'info', 3000);
      return;
    }

    this.currentMessage = program.observaciones;
    this.messageProgram = program;
    this.showMessageDialog = true;

    // Auto-cerrar después de 20 segundos
    this.messageTimeout = setTimeout(() => {
      this.closeMessageDialog();
    }, 20000);
  }

  /**
   * Eliminar mensaje de un programa
   */
  async deleteMessage(program: MachineProgram) {
    if (!this.userPermissions().canSendMessages) {
      // Snackbar de advertencia con icono animado
      const mensajeConIcono = `<span class="status-icon">⚠</span>No tienes permisos para eliminar mensajes`;
      this.snackBar.open('', 'Cerrar', { 
        duration: 3000,
        panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-preparando-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
      
      return;
    }

    try {
      const normalizedOtSap = String(program.otSap).trim();
      const url = `${environment.apiUrl}/maquinas/${encodeURIComponent(normalizedOtSap)}/status`;

      // Suprimir notificaciones SignalR propias
      this.suppressOwnSignalR();

      // Enviar PATCH al backend para limpiar las observaciones
      await firstValueFrom(this.http.patch<any>(url, {
        estado: program.estado, // Mantener el estado actual
        observaciones: '' // Limpiar el mensaje
      }));

      // Actualizar el programa localmente limpiando observaciones
      const programs = this.programs();
      const updatedPrograms = programs.map(p => {
        if (String(p.otSap).trim() === normalizedOtSap) {
          return { ...p, observaciones: '' };
        }
        return p;
      });
      this.updatePrograms(updatedPrograms);

      // Limpiar también del Map local y localStorage
      const messages = new Map(this.programMessages());
      messages.delete(program.otSap);
      this.programMessages.set(messages);
      this.saveMessagesToStorage();

      // Snackbar de éxito con icono animado
      const mensajeConIcono = `<span class="status-icon">✓</span>Mensaje eliminado exitosamente`;
      this.snackBar.open('', 'Cerrar', { 
        duration: 3000,
        panelClass: ['status-listo-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
      
      this.closeMessageDialog();

    } catch (error: any) {
      console.error('❌ Error eliminando mensaje:', error);
      
      // Snackbar de error
      const mensajeConIcono = `<span class="status-icon">✕</span>Error al eliminar mensaje`;
      this.snackBar.open('', 'Cerrar', { 
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
        if (label) {
          label.innerHTML = mensajeConIcono;
        }
      }, 0);
    }
  }

  /**
   * Verificar si un programa tiene mensajes no leídos
   */
  hasUnreadMessages(program: MachineProgram): boolean {
    // Los mensajes siempre se consideran "no leídos" si existen en observaciones
    return !!(program.observaciones && program.observaciones.trim() !== '');
  }

  /**
   * Verificar si un programa tiene mensajes (leídos o no leídos)
   */
  hasMessages(program: MachineProgram): boolean {
    return !!(program.observaciones && program.observaciones.trim() !== '');
  }

  /**
   * Obtener el mensaje de un programa
   */
  getMessage(program: MachineProgram): string {
    return program.observaciones || '';
  }

  // --- Nota emergente para visualizar mensaje completo ---
  showMessageNote = false;
  messageNoteText = '';
  messageNoteProgram: MachineProgram | null = null;

  openMessageNote(program: MachineProgram) {
    if (!program.observaciones || program.observaciones.trim() === '') return;
    this.messageNoteProgram = program;
    this.messageNoteText = program.observaciones;
    this.showMessageNote = true;
  }

  closeMessageNote() {
    this.showMessageNote = false;
    this.messageNoteText = '';
    this.messageNoteProgram = null;
  }

  /**
   * Cargar datos de carpeta/estante desde Cod Tintas
   */
  loadCodTintasCarpetaData(): void {
    this.codTintasService.getAll().subscribe({
      next: (data) => {
        const dataMap = new Map<string, { estante: string, carpeta: string }>();
        data.forEach((item: any) => {
          if (item.articulo) {
            dataMap.set(item.articulo.trim().toUpperCase(), {
              estante: item.estante || '',
              carpeta: item.carpeta || ''
            });
          }
        });
        this.codTintasCarpetaData.set(dataMap);
      },
      error: (error) => {
        console.error('❌ Error cargando datos de carpeta desde Cod Tintas:', error);
      }
    });
  }

  /**
   * Cargar datos de printType desde la tabla de Diseños
   */
  loadDesignPrintTypeData(): void {
    this.http.get<any[]>(`${environment.apiUrl}/designs/all`).subscribe({
      next: (designs) => {
        const dataMap = new Map<string, string>();
        designs.forEach((d: any) => {
          if (d.articleF && d.printType) {
            dataMap.set(d.articleF.trim().toUpperCase(), d.printType);
          }
        });
        this.designPrintTypeData.set(dataMap);
        console.log(`📋 PrintType cargado para ${dataMap.size} diseños`);
      },
      error: (error) => {
        console.error('❌ Error cargando printType desde Diseños:', error);
      }
    });
  }

  /**
   * Obtener el printType del diseño asociado a un artículo
   */
  getPrintType(articulo: string): string {
    if (!articulo) return '-';
    const key = articulo.trim().toUpperCase();
    return this.designPrintTypeData().get(key) || '-';
  }

  /**
   * Obtener información de carpeta para un artículo (desde Cod Tintas)
   */
  getCarpetaInfo(articulo: string): string {
    if (!articulo) return '-';
    
    const articuloKey = articulo.trim().toUpperCase();
    const data = this.codTintasCarpetaData().get(articuloKey);
    
    if (data && (data.estante || data.carpeta)) {
      const parts = [data.estante, data.carpeta].filter(p => p);
      return parts.join('/') || '-';
    }
    
    return '-';
  }

  /**
   * Obtener estante y carpeta por separado para un artículo
   */
  getCarpetaEstante(articulo: string): { estante: string, carpeta: string } {
    if (!articulo) return { estante: '-', carpeta: '-' };
    
    const articuloKey = articulo.trim().toUpperCase();
    const data = this.codTintasCarpetaData().get(articuloKey);
    
    if (data) {
      return { estante: data.estante || '-', carpeta: data.carpeta || '-' };
    }
    
    return { estante: '-', carpeta: '-' };
  }

  /**
   * Cargar configuración de alertas de color desde system configs
   */
  loadAlertConfigs(): void {
    this.http.get<any[]>(`${environment.apiUrl}/system/configs`).subscribe({
      next: (configs) => {
        const redMax = configs.find((c: any) => c.id === 'alert_red_max');
        const orangeMax = configs.find((c: any) => c.id === 'alert_orange_max');
        const greenMin = configs.find((c: any) => c.id === 'alert_green_min');
        if (redMax) this.alertRedMax.set(Number(redMax.value) || 3);
        if (orangeMax) this.alertOrangeMax.set(Number(orangeMax.value) || 5);
        if (greenMin) this.alertGreenMin.set(Number(greenMin.value) || 6);
        // Limpiar cachés para que se recalculen los colores con los nuevos rangos
        this.machineStatusCache.clear();
        this.machineTooltipCache.clear();
      },
      error: () => {}
    });
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
    return this.userPermissions().canStatusPrealistando;
  }

  /**
   * Verificar si el usuario puede cambiar el estado a LISTO
   */
  canChangeToListo(): boolean {
    return this.userPermissions().canStatusListo;
  }

  /**
   * Verificar si el usuario puede cambiar el estado a CORRIENDO
   */
  canChangeToCorriendo(): boolean {
    return this.userPermissions().canStatusCorriendo;
  }

  /**
   * Verificar si el usuario puede cambiar el estado a TERMINADO
   */
  canChangeToTerminado(): boolean {
    return this.userPermissions().canStatusTerminado;
  }

  /**
   * Verificar si el usuario puede cambiar el estado a SUSPENDIDO
   */
  canChangeToSuspendido(): boolean {
    return this.userPermissions().canStatusSuspendido;
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
        } else {
        }
      });

      // Actualizar el Map de mensajes
      this.programMessages.set(messagesToKeep);

      // Guardar en localStorage
      this.saveMessagesToStorage();

    } catch (error) {
      console.error('❌ Error limpiando mensajes:', error);
    }
  }

  /**
   * Método para cambiar estado con validación de preparando -> listo
   */
  async handleActionWithValidation(program: MachineProgram, newStatus: MachineProgram['estado']) {

    // Validación especial: LISTO solo disponible si está en PREPARANDO
    if (newStatus === 'LISTO' && program.estado !== 'PREPARANDO') {
      this.showNotification('El programa debe estar en PREPARANDO antes de marcarlo como LISTO', 'warning', 4000);
      return;
    }


    await this.handleAction(program, newStatus);
  }

}
