
import { Component, OnInit, OnDestroy, signal, computed, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { trigger, state, style, transition, animate } from '@angular/animations';

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

import { HttpClient, HttpBackend } from '@angular/common/http';

import { firstValueFrom, Subscription } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { AuthService } from '../../../core/services/auth.service';

import { MatDialog } from '@angular/material/dialog';

import { MatSnackBar } from '@angular/material/snack-bar';

import { PantoneLiveService } from '../../services/pantone-live.service';

import { AniloxService, Anilox } from '../../services/anilox.service';

import { PermissionsService } from '../../services/permissions.service';
import { PERMISSIONS } from '../../models/permission.model';

import { ExcelService } from '../../services/excel.service';
import { SignalRService } from '../../services/signalr.service';


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
    FormsModule
  ],
  templateUrl: './machines.html',
  styleUrls: ['./machines.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', opacity: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: '1' })),
      transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class MachinesComponent implements OnInit, OnDestroy {

  private signalRService = inject(SignalRService);
  private signalRSubscriptions: Subscription[] = [];
  private readonly DEFAULT_MACHINE_CONFIGS: Record<number, number> = {
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0
  };


  private http = inject(HttpClient);
  private httpBackend = inject(HttpBackend);
  private templateHttp = new HttpClient(this.httpBackend);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private pantoneService = inject(PantoneLiveService);
  private aniloxService = inject(AniloxService);
  private permissionsService = inject(PermissionsService);
  private excelService = inject(ExcelService);


  console = console;


  loading = signal(false);
  selectedMachineNumber = signal<number | null>(null);
  programs = signal<MachineProgram[]>([]);
  expandedColors = signal<Set<string>>(new Set());


  lineaturas = signal<number[]>([]);
  aniloxByLineatura = signal<Map<number, Anilox[]>>(new Map());
  aniloxByMachine = signal<Map<number, Anilox[]>>(new Map());
  selectedAniloxData = signal<Map<string, { lineatura: number | null, anilox: Anilox | null, kilos: number | null }>>(new Map());
  machineConfigs = signal<Map<number, { cargaMuerta: number }>>(new Map());


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
    'numeroColores',
    'kilos',
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
    'numeroColores',
    'kilos',
    'fechaTintaEnMaquina',
    'sustrato',
    'estado',
    'acciones'
  ];


  userPermissions = computed((): UserPermissions => {

    const perms = this.permissionsService.permissions();


    if (perms.length === 0) {
      console.warn('⚠️ No se han cargado los permisos del usuario o no tiene permisos asignados');
    } else {
      console.log(`🔐 Permisos reactivos actualizados: ${perms.length} códigos disponibles`);
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




  selectedMachinePrograms = computed(() => {
    const selected = this.selectedMachineNumber();
    if (!selected) return [];

    const filtered = this.programs().filter(p => p.machineNumber === selected);


    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.fechaTintaEnMaquina).getTime();
      const dateB = new Date(b.fechaTintaEnMaquina).getTime();
      return dateA - dateB;
    });


    console.log('📊 selectedMachinePrograms recalculado:', sorted.map(p => ({
      otSap: p.otSap,
      articulo: p.articulo,
      estado: p.estado
    })));

    return sorted;
  });


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
    console.log('🚀 Inicializando módulo de máquinas...');
    console.log('🏭 Máquinas disponibles:', this.machineNumbers);


    console.log('📱 Cargando mensajes desde localStorage...');
    this.loadMessagesFromStorage();


    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id && this.permissionsService.permissions().length === 0) {
      console.log('🔐 Solicitando carga manual de permisos en ngOnInit...');
      this.permissionsService.loadCurrentUserPermissions(Number(currentUser.id)).subscribe({
        next: () => console.log('✅ Permisos cargados manualmente en ngOnInit'),
        error: (err) => console.error('❌ Error cargando permisos manualmente en ngOnInit:', err)
      });
    }


    setTimeout(() => {
      const loadedMessages = this.programMessages();
      console.log('🔍 Mensajes después de cargar:', loadedMessages.size, 'mensajes');
      if (loadedMessages.size > 0) {
        console.log('📋 Mensajes cargados:', Array.from(loadedMessages.entries()));
      }
    }, 100);


    this.loadUniqueBCM();


    await this.loadAllMachineAnilox();


    await this.loadAllMachineConfigs();


    this.loadPrograms();


    if (this.machineNumbers.length > 0) {
      console.log('🎯 Seleccionando máquina por defecto:', this.machineNumbers[0]);
      this.selectMachine(this.machineNumbers[0]);
    }

    // Configurar listeners de SignalR
    this.setupSignalRListeners();
  }

  /**
   * Configurar listeners de SignalR para notificaciones en tiempo real
   */
  private setupSignalRListeners(): void {
    console.log('📡 Configurando listeners de SignalR...');

    // Máquina actualizada
    this.signalRSubscriptions.push(
      this.signalRService.machineUpdated$.subscribe(notification => {
        console.log('📢 [SignalR] Máquina actualizada:', notification);
        this.snackBar.open(`Máquina ${notification.machineNumber} actualizada por ${notification.userName}`, 'Cerrar', { duration: 3000 });
        this.loadPrograms();
      })
    );

    // Estado cambiado
    this.signalRSubscriptions.push(
      this.signalRService.machineStateChanged$.subscribe(notification => {
        console.log('📢 [SignalR] Estado cambiado:', notification);
        this.snackBar.open(
          `Máquina ${notification.machineNumber}: ${notification.oldState} → ${notification.newState}`,
          'Cerrar',
          { duration: 4000 }
        );
        this.loadPrograms();
      })
    );

    // Excel importado
    this.signalRSubscriptions.push(
      this.signalRService.excelImported$.subscribe(notification => {
        console.log('📢 [SignalR] Excel importado:', notification);
        this.snackBar.open(
          `Excel importado en Máquina ${notification.machineNumber}: ${notification.created} creados, ${notification.updated} actualizados`,
          'Cerrar',
          { duration: 5000 }
        );
        this.loadPrograms();
      })
    );

    // Máquina eliminada
    this.signalRSubscriptions.push(
      this.signalRService.machineDeleted$.subscribe(notification => {
        console.log('📢 [SignalR] Máquina eliminada:', notification);
        this.snackBar.open(`Programa ${notification.otSap} eliminado`, 'Cerrar', { duration: 3000 });
        this.loadPrograms();
      })
    );

    // Refresh global
    this.signalRSubscriptions.push(
      this.signalRService.refreshAll$.subscribe(notification => {
        console.log('📢 [SignalR] Refresh global:', notification);
        this.snackBar.open(`Actualizando datos: ${notification.reason}`, 'Cerrar', { duration: 3000 });
        this.loadPrograms();
      })
    );

    console.log('✅ Listeners de SignalR configurados');
  }

  /**
   * Limpiar suscripciones al destruir el componente
   */
  ngOnDestroy(): void {
    console.log('🧹 Limpiando suscripciones de SignalR...');
    this.signalRSubscriptions.forEach(sub => sub.unsubscribe());
  }





  async loadPrograms() {
    this.loading.set(true);
    try {


      if (!this.authService.isLoggedIn()) {

        window.location.href = '/login';
        return;
      }



      console.log('🔄 Cargando datos de máquinas desde tabla "machine_programs" (alias: maquinas):', `${environment.apiUrl}/maquinas`);






      const response = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/maquinas?orderBy=fechaTintaEnMaquina&order=desc`));



      console.log('📡 Respuesta del servidor (tabla machine_programs):', response);
      console.log('📡 Primer programa del servidor:', response?.data?.[0]);



      if (response && response.success && response.data && response.data.length > 0) {



        const programs: MachineProgram[] = response.data.map((program: any) => {



          let colores: string[] = [];
          if (program.colores) {
            try {

              colores = typeof program.colores === 'string'
                ? JSON.parse(program.colores)
                : program.colores;
            } catch (e) {

              console.warn('⚠️ Error parseando colores para programa:', program.otSap, e);
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
            fechaTintaEnMaquina: program.fechaTintaEnMaquina ? new Date(program.fechaTintaEnMaquina) : new Date(),
            sustrato: program.sustrato || '',
            estado: program.estado || 'SIN_ASIGNAR',
            observaciones: program.observaciones || '',


            machineNumber: program.numeroMaquina || program.machineNumber || 11,




            lastActionBy: program.updatedByUser?.firstName && program.updatedByUser?.lastName
              ? `${program.updatedByUser.firstName} ${program.updatedByUser.lastName}`.trim()
              : program.lastActionBy || 'Sistema',


            lastActionAt: program.updatedAt ? new Date(program.updatedAt) :
              program.lastActionAt ? new Date(program.lastActionAt) : new Date(),


            preparandoStartedAt: program.preparandoStartedAt ? new Date(program.preparandoStartedAt) : undefined
          };
        });


        console.log(`✅ ${programs.length} programas cargados exitosamente desde la base de datos`);


        const machineNumbers = [...new Set(programs.map(p => p.machineNumber))].sort((a, b) => a - b);
        console.log(`🔢 Máquinas con programas: ${machineNumbers.join(', ')}`);
        const programsByMachine = programs.reduce((acc, p) => {
          acc[p.machineNumber] = (acc[p.machineNumber] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        console.log('📊 Programas por máquina:', programsByMachine);


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
          console.warn(`⚠️ ${programsWithoutId.length} programas sin OT SAP detectados:`, programsWithoutId);
          console.warn('⚠️ Datos originales del primer programa sin OT SAP:', response.data.find((p: any) => !p.otSap));
        }



        this.programs.set(programs);



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
        console.log('📊 Estadísticas de programas cargados:', stats);

      } else {

        console.warn('⚠️ No hay datos en el backend');
        this.programs.set([]);
      }
    } catch (error: any) {
      console.error('❌ Error cargando programas:', error);


      if (error.status === 401) {
        console.log('Sesión expirada. Redirigiendo al login...');
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

    this.selectedMachineNumber.set(machineNumber);


    console.log(`🎯 Máquina seleccionada: ${machineNumber}`);
  }









  trackByMachineNumber(_: number, machineNumber: number): number {
    return machineNumber;
  }








  trackByProgramOtSap(_: number, program: MachineProgram): string {


    return program.otSap;
  }




  getMachineStatusClass(machineNumber: number): string {

    const machinePrograms = this.programs().filter(p => p.machineNumber === machineNumber);


    const readyCount = machinePrograms.filter(p => p.estado === 'LISTO' || p.estado === 'PREPARANDO').length;








    let statusClass: string;

    if (readyCount >= 6) {

      statusClass = 'machine-status-good';
    } else if (readyCount >= 3) {

      statusClass = 'machine-status-warning';
    } else {

      statusClass = 'machine-status-critical';
    }


    return statusClass;
  }






  getMachineStatusTooltip(machineNumber: number): string {

    const machinePrograms = this.programs().filter(p => p.machineNumber === machineNumber);



    const readyCount = machinePrograms.filter(p =>
      p.estado === 'LISTO' ||
      p.estado === 'PREPARANDO'
    ).length;


    return `Máquina ${machineNumber}: ${readyCount} programas listos/preparando`;
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
      console.log(`🎨 Cerrando dropdown de colores para programa: ${otSap}`);
    } else {



      expanded.clear();
      expanded.add(otSap);
      console.log(`🎨 Abriendo dropdown de colores para programa: ${otSap}`);
    }



    this.expandedColors.set(expanded);
  }



  closeColors(otSap: string) {

    const expanded = new Set(this.expandedColors());


    expanded.delete(otSap);


    this.expandedColors.set(expanded);


    console.log(`🎨 Dropdown de colores cerrado para programa: ${otSap}`);
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


    const newData = new Map(this.selectedAniloxData());
    newData.set(key, { ...currentData, lineatura: lineatura, anilox: null });
    this.selectedAniloxData.set(newData);
    console.log(`✅ Lineatura actualizada en selectedAniloxData`);


    const availableAnilox = this.getAniloxForMachine(program.machineNumber, lineatura);
    console.log(`📊 Anilox disponibles para Máquina ${program.machineNumber} y Lineatura ${lineatura} LPI:`, availableAnilox.length);


    this.cdr.detectChanges();
    console.log(`✅ Detección de cambios forzada`);

    console.log(`✅ Lineatura ${lineatura} LPI seleccionada para color ${colorIndex + 1}`);
    console.log(`🔵 ========== onLineaturaChange FINALIZADO ==========`);
  }


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


    const machineAnilox = this.aniloxByMachine().get(program.machineNumber) || [];
    const selectedAnilox = machineAnilox.find(a => a.id === aniloxId);

    if (selectedAnilox) {
      console.log('✅ Anilox encontrado:', selectedAnilox);
      const newData = new Map(this.selectedAniloxData());



      let calculatedKilos = currentData.kilos;

      if (program.metros && program.anchoMm && selectedAnilox.volumen_real) {
        const metros = Number(program.metros);
        const anchoMm = Number(program.anchoMm);

        // ✅ NUEVA FÓRMULA: ((Metros * Ancho * Volumen * Eficiencia) / 1000) * Densidad + Carga Muerta
        const anchoMetros = anchoMm / 1000;

        const eficiencia = selectedAnilox.factor_eficiencia || 35.00;
        const densidad = selectedAnilox.densidad || 0.885;
        const factorEficiencia = eficiencia / 100;

        // Paso 1: (Metros * Ancho * Volumen * Eficiencia) / 1000
        const kilosSinDensidad = (metros * anchoMetros * Number(selectedAnilox.volumen_real) * factorEficiencia) / 1000;
        
        // Paso 2: Multiplicar por Densidad
        const kilosBase = kilosSinDensidad * densidad;

        // Paso 3: Sumar Carga Muerta
        const machineConfig = this.machineConfigs().get(program.machineNumber);
        const cargaMuerta = machineConfig?.cargaMuerta || 0;

        calculatedKilos = Number((kilosBase + cargaMuerta).toFixed(3));

        console.log(`⚖️ DETALLES DEL CÁLCULO:`, {
          metros,
          anchoMm: anchoMm + ' mm',
          anchoMetros: anchoMetros.toFixed(3) + ' m',
          volumen: selectedAnilox.volumen_real + ' cm³/m²',
          eficiencia: eficiencia + '%',
          factorEficiencia: factorEficiencia,
          paso1_sin_densidad: kilosSinDensidad.toFixed(3) + ' kg',
          densidad: densidad + ' g/cm³',
          paso2_kilosBase: kilosBase.toFixed(3) + ' kg',
          cargaMuerta: cargaMuerta + ' kg',
          RESULTADO_FINAL: calculatedKilos + ' kg',
          formula: '((Metros × Ancho × Volumen × Eficiencia) / 1000) × Densidad + Carga Muerta'
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


      this.cdr.detectChanges();

      console.log(`✅ selectedAniloxData actualizado para ${key}: ${calculatedKilos} kg`);
    } else {
      console.error('❌ No se encontró el anilox con ID:', aniloxId, 'en la máquina', program.machineNumber);
    }
    console.log('🔵 ========== onAniloxChange FINALIZADO ==========');
  }


  onKilosChange(program: MachineProgram, colorIndex: number, kilos: number) {
    const normalizedOtSap = String(program.otSap || '').trim();
    const key = `${normalizedOtSap}-${colorIndex}`;
    const currentData = this.selectedAniloxData().get(key) || { lineatura: null, anilox: null, kilos: null };

    const newData = new Map(this.selectedAniloxData());
    newData.set(key, { ...currentData, kilos });
    this.selectedAniloxData.set(newData);
    console.log(`✅ ${kilos} kg seleccionados para color ${colorIndex + 1}`);
  }


  getAniloxForLineatura(bcm: number | null): Anilox[] {
    const result = bcm ? (this.aniloxByLineatura().get(bcm) || []) : [];
    if (bcm) {
      console.log(`🟡 getAniloxForLineatura - BCM: ${bcm}, Cantidad: ${result.length}`);
    }
    return result;
  }




  async loadUniqueBCM() {
    try {
      console.log('🔵 Cargando BCM únicos desde la base de datos...');
      const bcmList = await firstValueFrom(this.aniloxService.getUniqueLineaturas());
      this.lineaturas.set(bcmList);
      console.log(`✅ ${bcmList.length} BCM únicos cargados:`, bcmList);
    } catch (error: any) {
      console.error('❌ Error al cargar BCM únicos:', error);

      this.lineaturas.set([80, 140, 200, 275, 360, 400]);
    }
  }


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


  async loadAllMachineConfigs() {
    try {
      console.log('⚙️ Cargando configuraciones de todas las máquinas...');
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
            console.log(`✅ Máquina ${num}: carga muestra = ${cargaMuestra} kg`);
          } else {
            configsMap.set(num, { cargaMuerta: 0 });
          }
        } catch (err) {
          console.warn(`⚠️ No se pudo cargar config para máquina ${num}:`, err);
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


    console.log(`🔍 getAniloxForMachine - Máquina: ${machineNumber}, Lineatura: ${lineatura}`);
    console.log(`📦 Total anilox en máquina ${machineNumber}:`, machineAnilox.length);
    console.log(`🎯 Anilox filtrados por lineatura ${lineatura}:`, filtered.length);
    console.log(`📋 Códigos filtrados:`, filtered.map(a => `${a.codigo} (Máq: ${a.maquina})`));


    const wrongMachine = filtered.filter(a => a.maquina !== machineNumber);
    if (wrongMachine.length > 0) {
      console.error(`❌ ERROR: Se encontraron ${wrongMachine.length} anilox de otras máquinas:`, wrongMachine);
    }


    if (filtered.length === 0) {
      console.warn(`⚠️ No se encontraron anilox para Máquina ${machineNumber} con Lineatura ${lineatura} LPI`);
      console.log(`📊 Lineaturas disponibles en esta máquina:`, [...new Set(machineAnilox.map(a => a.lineatura))]);
    }

    return filtered;
  }


  getAvailableLineaturaForMachine(machineNumber: number): number[] {
    const machineAnilox = this.aniloxByMachine().get(machineNumber) || [];

    if (machineAnilox.length === 0) {
      console.warn(`⚠️ No hay anilox cargados para la máquina ${machineNumber}`);
      return [];
    }


    const uniqueLineaturas = [...new Set(machineAnilox.map(a => a.lineatura))].sort((a, b) => a - b);

    return uniqueLineaturas;
  }



  async loadDesignInfo(articulo: string): Promise<any> {
    try {
      console.log(`📋 Cargando información de diseño para artículo: ${articulo}`);


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




  async loadColorsFromDesign(articulo: string): Promise<string[]> {
    const designInfo = await this.loadDesignInfo(articulo);
    return designInfo?.colores || [];
  }



  async toggleColorsWithLoad(program: MachineProgram, event?: Event) {
    console.log('🔵 toggleColorsWithLoad LLAMADO', { program, event });


    if (event) {
      event.stopPropagation();
    }


    const programId = String(program.otSap || '').trim();

    if (!programId) {
      console.error('❌ toggleColorsWithLoad: programId es vacío o inválido', program);
      return;
    }

    console.log('🔵 Program ID (OT SAP) normalizado:', programId);

    const expanded = new Set(this.expandedColors());
    console.log('🔵 Estado actual expandedColors:', Array.from(expanded));


    if (expanded.has(programId)) {
      expanded.delete(programId);
      console.log(`🎨 Cerrando dropdown de colores para programa: ${programId}`);
    } else {

      expanded.clear();
      expanded.add(programId);
      console.log(`🎨 Abriendo dropdown de colores para programa: ${programId}`);


      console.log('📋 Cargando información de diseño desde BD para artículo:', program.articulo);
      const designInfo = await this.loadDesignInfo(program.articulo);
      console.log('📋 Información de diseño obtenida:', designInfo);


      if (designInfo) {
        const programs = this.programs();
        const updatedPrograms = programs.map(p => {

          if (String(p.otSap).trim() === String(program.otSap).trim()) {

            const updatedColores = designInfo.colores || p.colores;
            return {
              ...p,

              cliente: designInfo.cliente || p.cliente,
              referencia: designInfo.referencia || p.referencia,
              sustrato: designInfo.sustrato || p.sustrato,
              anchoMm: Number(designInfo.anchoMm || p.anchoMm || 0),
              colores: updatedColores,

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


    console.log('🔵 Actualizando expandedColors a:', Array.from(expanded));
    this.expandedColors.set(expanded);
    console.log('🔵 Estado final expandedColors:', Array.from(this.expandedColors()));


    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('🔵 Detección de cambios forzada');
    }, 0);
  }





  async changeStatus(program: MachineProgram, newStatus: MachineProgram['estado']) {

    console.log('🎯 ===== INICIO changeStatus =====');
    console.log('📋 PROGRAMA RECIBIDO DESDE EL HTML:');
    console.log('   - OT SAP:', program.otSap);
    console.log('   - Artículo:', program.articulo);
    console.log('   - Cliente:', program.cliente);
    console.log('   - Máquina:', program.machineNumber);
    console.log('   - Estado actual:', program.estado);
    console.log('   - Nuevo estado solicitado:', newStatus);
    console.log('📋 Objeto completo:', JSON.stringify(program, null, 2));



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



    if (!program.otSap || program.otSap.trim() === '') {
      console.error('❌ Error: El programa no tiene un OT SAP válido', program);
      this.snackBar.open('Error: No se puede cambiar el estado del programa: Falta OT SAP', 'Cerrar', { duration: 5000 });
      return;
    }


    const normalizedOtSap = String(program.otSap).trim();
    console.log('📋 OT SAP normalizado para búsqueda:', normalizedOtSap);


    console.log('📊 Programas actuales en memoria:', this.programs().map(p => ({
      otSap: p.otSap,
      articulo: p.articulo,
      maquina: p.machineNumber,
      estado: p.estado
    })));

    try {
      this.loading.set(true);
      console.log('⏳ Loading activado');


      console.log(`🔄 Cambiando estado de programa OT SAP: ${normalizedOtSap}, Artículo: ${program.articulo}, Máquina: ${program.machineNumber} a ${newStatus} en la base de datos`);




      const changeStatusDto = {
        estado: newStatus,

        observaciones: program.observaciones || null
      };


      const url = `${environment.apiUrl}/maquinas/${encodeURIComponent(normalizedOtSap)}/status`;
      console.log('📤 DTO preparado:', changeStatusDto);
      console.log('🌐 URL completa:', url);
      console.log('📤 Enviando petición PATCH...');





      const response = await firstValueFrom(this.http.patch<any>(
        url,
        changeStatusDto
      ));


      console.log('📥 Respuesta recibida del servidor:', response);
      console.log('📥 Respuesta completa:', JSON.stringify(response, null, 2));



      if (response && response.success) {
        console.log(`✅ Respuesta exitosa del servidor - Estado cambiado a ${newStatus}`);




        const programs = this.programs();
        console.log('📊 Total de programas antes de actualizar:', programs.length);




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




          const updatedPrograms = programs.map((p, index) => {
            if (index === programIndex) {

              console.log(`🔄 Actualizando programa en índice ${index}`);
              const updatedProgram = {
                ...p,
                estado: newStatus,
                lastActionBy: response.data?.lastActionBy || 'Usuario Actual',
                lastActionAt: response.data?.lastActionAt ? new Date(response.data.lastActionAt) : new Date(),
                preparandoStartedAt: response.data?.preparandoStartedAt ? new Date(response.data.preparandoStartedAt) : p.preparandoStartedAt,
                observaciones: response.data?.observaciones || p.observaciones
              };


              console.log('🔍 Verificación de OT SAP después de actualizar:');
              console.log('   - OT SAP original:', p.otSap);
              console.log('   - OT SAP actualizado:', updatedProgram.otSap);
              console.log('   - Son iguales:', p.otSap === updatedProgram.otSap);

              return updatedProgram;
            }

            return p;
          });

          console.log('📋 Programa DESPUÉS de actualizar:', JSON.stringify(updatedPrograms[programIndex], null, 2));


          const changedCount = updatedPrograms.filter((p, i) =>
            i === programIndex && p.estado === newStatus
          ).length;
          console.log(`✅ Programas actualizados: ${changedCount} (debe ser 1)`);


          console.log('🔍 Verificación de OT SAPs en array actualizado:');
          const otSapsBeforeUpdate = programs.map(p => p.otSap);
          const otSapsAfterUpdate = updatedPrograms.map(p => p.otSap);
          console.log('   - OT SAPs antes:', otSapsBeforeUpdate);
          console.log('   - OT SAPs después:', otSapsAfterUpdate);
          console.log('   - Mismo número de programas:', otSapsBeforeUpdate.length === otSapsAfterUpdate.length);

          console.log('📊 Actualizando signal con nuevos programas...');

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


          console.log('🔄 Recargando todos los programas desde el servidor...');
          await this.loadPrograms();
        }


        const statusMessages = {
          'SIN_ASIGNAR': 'Estado asignado - Programa activado',
          'PREPARANDO': 'Programa en PREPARACIÓN',
          'LISTO': 'Programa marcado como PREPARADO',
          'CORRIENDO': 'Programa iniciado - CORRIENDO',
          'SUSPENDIDO': 'Programa SUSPENDIDO',
          'TERMINADO': 'Programa TERMINADO exitosamente'
        };


        let successMessage = (newStatus ? (statusMessages as any)[newStatus] : 'Estado actualizado') || 'Estado actualizado';


        if (program.estado === 'PREPARANDO' && newStatus === 'LISTO') {
          console.log('⏱️ Detectado cambio de PREPARANDO a LISTO');



          const preparandoStartedAtFromServer = response.data?.preparandoStartedAt;

          console.log('📋 Datos del servidor:', {
            otSap: response.data?.otSap,
            estado: response.data?.estado,
            preparandoStartedAt: preparandoStartedAtFromServer,
            tienePreparandoStartedAt: !!preparandoStartedAtFromServer
          });

          if (preparandoStartedAtFromServer) {



            const fechaUTC = preparandoStartedAtFromServer.endsWith('Z')
              ? preparandoStartedAtFromServer
              : preparandoStartedAtFromServer + 'Z';

            const tiempoInicio = new Date(fechaUTC);
            const tiempoFin = new Date();


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


            const totalSegundos = Math.floor(Math.abs(diferenciaMs) / 1000);
            const horas = Math.floor(totalSegundos / 3600);
            const minutos = Math.floor((totalSegundos % 3600) / 60);
            const segundos = totalSegundos % 60;


            if (horas > 0) {

              successMessage = `✅ Programa PREPARADO en ${horas} hora${horas !== 1 ? 's' : ''} y ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
            } else if (minutos > 0) {

              successMessage = `✅ Programa PREPARADO en ${minutos} minuto${minutos !== 1 ? 's' : ''} y ${segundos} segundo${segundos !== 1 ? 's' : ''}`;
            } else {

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


        this.snackBar.open(successMessage, 'Cerrar', { duration: 5000 });
        console.log('✅ Notificación mostrada al usuario');


        console.log(`✅ ${successMessage}`, {
          programa: program.articulo,
          otSap: normalizedOtSap,
          maquina: program.machineNumber,
          fecha: new Date().toLocaleString()
        });

      } else {

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


      let errorMessage = 'Error al cambiar el estado del programa';
      if (error.status === 404) {
        errorMessage = 'Programa no encontrado en la base de datos';
      } else if (error.status === 400) {
        errorMessage = 'Estado inválido o datos incorrectos';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al actualizar el estado';
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor';
      }


      this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });


      console.error(`❌ ${errorMessage}`, {
        programa: program.articulo,
        otSap: normalizedOtSap,
        maquina: program.machineNumber,
        estadoDeseado: newStatus,
        error: error.message || 'Error desconocido'
      });
    } finally {

      this.loading.set(false);
      console.log('⏳ Loading desactivado');
      console.log('🎯 ===== FIN changeStatus =====');
    }
  }



  async handleAction(element: MachineProgram, newStatus: MachineProgram['estado']) {
    console.log('🎯 ===== handleAction LLAMADO =====');


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


    await this.changeStatus(element, newStatus);
  }




  suspendProgram(program: MachineProgram) {
    this.currentProgramToSuspend = program;
    this.suspendReason = '';
    this.showSuspendDialog = true;
  }


  setCurrentProgramForMenu(program: MachineProgram) {
    this.currentProgramForMenu = program;
    console.log('🎯 Programa seleccionado para menú - OT:', program.otSap, 'Art:', program.articulo);
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
      this.snackBar.open('No tienes permiso para suspender programas', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log('🎯 ===== INICIO confirmSuspend =====');
    console.log('📋 Programa a suspender:', this.currentProgramToSuspend);
    console.log('📋 Motivo:', this.suspendReason);

    try {
      this.loading.set(true);
      console.log('⏳ Loading activado');

      console.log(`⏸️ Suspendiendo programa ${this.currentProgramToSuspend.otSap} con motivo: ${this.suspendReason}`);


      const changeStatusDto = {
        estado: 'SUSPENDIDO',
        observaciones: this.suspendReason.trim()
      };

      const url = `${environment.apiUrl}/maquinas/${this.currentProgramToSuspend.otSap}/status`;
      console.log('📤 DTO preparado:', changeStatusDto);
      console.log('🌐 URL:', url);
      console.log('📤 Enviando petición PATCH...');


      const response = await firstValueFrom(this.http.patch<any>(url, changeStatusDto));

      console.log('📥 Respuesta recibida del servidor:', response);
      console.log('📥 Respuesta completa:', JSON.stringify(response, null, 2));


      if (response && response.success) {
        console.log('✅ Respuesta exitosa del servidor - Programa suspendido');


        const programs = this.programs();
        console.log('📊 Total de programas antes de actualizar:', programs.length);


        const index = programs.findIndex(p => String(p.otSap).trim() === String(this.currentProgramToSuspend!.otSap).trim());
        console.log('🔍 Índice del programa encontrado:', index, 'OT SAP buscado:', this.currentProgramToSuspend.otSap);

        if (index !== -1) {
          console.log('📋 Programa ANTES de actualizar:', programs[index]);



          const updatedPrograms = [...programs];


          updatedPrograms[index] = {
            ...programs[index],
            estado: 'SUSPENDIDO' as MachineProgram['estado'],
            observaciones: this.suspendReason,
            lastActionBy: response.data?.lastActionBy || 'Usuario Actual',
            lastActionAt: response.data?.lastActionAt ? new Date(response.data.lastActionAt) : new Date()
          };

          console.log('📋 Programa DESPUÉS de actualizar:', updatedPrograms[index]);

          console.log('📊 Actualizando signal con nuevos programas...');
          this.programs.set(updatedPrograms);
          console.log('📊 Signal actualizado');
          console.log('📊 Programas filtrados (selectedMachinePrograms):', this.selectedMachinePrograms());

          console.log('🔄 Forzando detección de cambios...');

          this.cdr.detectChanges();
          console.log('🔄 Detección de cambios completada');


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


        console.log('⏸️ Programa suspendido exitosamente', {
          programa: this.currentProgramToSuspend.articulo,
          maquina: this.currentProgramToSuspend.machineNumber,
          motivo: this.suspendReason,
          fecha: new Date().toLocaleString()
        });

        this.snackBar.open('Programa SUSPENDIDO', 'Cerrar', { duration: 3000 });
        console.log('✅ Notificación mostrada al usuario');

        this.closeSuspendDialog();

      } else {

        console.error('❌ Respuesta del servidor NO exitosa:', response);
        throw new Error('Respuesta del servidor inválida');
      }

    } catch (error: any) {
      console.error('❌ ===== ERROR EN confirmSuspend =====');
      console.error('❌ Error completo:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ StatusText:', error.statusText);
      console.error('❌ Message:', error.message);
      console.error('❌ Error del servidor:', error.error);


      let errorMessage = 'Error al suspender el programa';
      if (error.status === 404) {
        errorMessage = 'Programa no encontrado en la base de datos';
      } else if (error.status === 400) {
        errorMessage = 'Datos de suspensión inválidos';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al suspender';
      }

      this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });


      console.error(`❌ ${errorMessage}`, {
        programa: this.currentProgramToSuspend?.articulo,
        motivo: this.suspendReason,
        error: error.message || 'Error desconocido'
      });
    } finally {

      this.loading.set(false);
      console.log('⏳ Loading desactivado');
      console.log('🎯 ===== FIN confirmSuspend =====');
    }
  }



















  async onFileSelected(event: any): Promise<void> {
    console.log('🎯 onFileSelected ejecutado - Evento recibido');


    if (!this.userPermissions().canLoadExcel) {
      this.snackBar.open('No tienes permiso para cargar programación', 'Cerrar', { duration: 3000 });

      if (event?.target) event.target.value = '';
      return;
    }

    console.log('📂 Event:', event);
    console.log('📂 Event.target:', event?.target);
    console.log('📂 Event.target.files:', event?.target?.files);


    const file = event.target.files[0];

    console.log('📄 Archivo seleccionado:', file);

    if (!file) {
      console.warn('⚠️ No se seleccionó ningún archivo');
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
      'application/vnd.ms-excel'
    ];


    const allowedExtensions = ['.xlsx', '.xls'];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));


    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      console.warn('⚠️ Tipo de archivo no válido:', file.type, fileExtension);
      this.snackBar.open('Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls)', 'Cerrar', { duration: 5000 });
      return;
    }



    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      console.warn('⚠️ Archivo demasiado grande:', file.size, 'bytes. Máximo:', maxSize, 'bytes');
      this.snackBar.open('El archivo es demasiado grande. Máximo: 500MB', 'Cerrar', { duration: 5000 });
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




      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/maquinas/import/excel-multisheet`, formData)
      );




      if (response && response.message === 'Importación completada') {
        console.log('📡 Respuesta del servidor:', response);
        console.log('� Estadísticas de importación:', {
          hojasProcesadas: response.sheetsProcessed,
          registrosCreados: response.totalCreated,
          errores: response.totalErrors,
          resultadosPorMaquina: response.results
        });




        console.log('🔄 Recargando datos desde la base de datos...');


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



        const mensajeExito = response.totalErrors > 0
          ? `✅ Importación completada: ${response.totalCreated} programas creados, ${response.totalErrors} errores en ${response.sheetsProcessed} hojas`
          : `✅ Importación exitosa: ${response.totalCreated} programas creados desde ${response.sheetsProcessed} hojas`;

        this.snackBar.open(mensajeExito, 'Cerrar', { duration: 6000 });



        event.target.value = '';



        const programasFinales = this.programs();
        if (programasFinales.length > 0) {
          const firstMachineWithPrograms = programasFinales[0].machineNumber;
          this.selectMachine(firstMachineWithPrograms);
          console.log('🎯 Máquina seleccionada automáticamente:', firstMachineWithPrograms);
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
        console.error('🔑 Token actual:', this.authService.getToken() ? 'existe' : 'no existe');
        console.error('👤 Usuario actual:', this.authService.getCurrentUser());

        this.snackBar.open(
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          'Ir a Login',
          { duration: 10000 }
        ).onAction().subscribe(() => {

          window.location.href = '/login';
        });

        event.target.value = '';
        return;
      }



      let errorMessage = 'Error al procesar el archivo';
      let technicalDetails = '';

      if (error.status === 400) {

        errorMessage = 'Formato de archivo inválido';


        if (error.error && error.error.message) {
          technicalDetails = error.error.message;
        } else {
          technicalDetails = 'Verifica que el archivo tenga las columnas correctas y el formato esperado.';
        }
      } else if (error.status === 413) {

        errorMessage = 'El archivo es demasiado grande';
        technicalDetails = 'El tamaño máximo permitido es 500MB.';
      } else if (error.status === 0) {

        errorMessage = 'Error de conexión';
        technicalDetails = 'Verifica tu conexión a internet y que el servidor esté disponible.';
      } else if (error.status === 500) {

        errorMessage = 'Error interno del servidor';
        technicalDetails = 'Problema al procesar el archivo en el servidor.';
      } else if (error.message) {

        errorMessage = error.message;
        technicalDetails = 'Revisa el formato del archivo y vuelve a intentar.';
      }



      console.error(`❌ ${errorMessage}`, {
        detalles: technicalDetails,
        consejos: [
          'Usa la plantilla descargable si está disponible',
          'Verifica que todas las columnas requeridas estén presentes',
          'El archivo no debe exceder 10MB',
          'Asegúrate de que el formato sea Excel (.xlsx, .xls) o CSV (.csv)'
        ]
      });



      this.snackBar.open(`${errorMessage}. ${technicalDetails}`, 'Cerrar', { duration: 7000 });

    } finally {


      this.loading.set(false);
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
      this.snackBar.open('No tienes permiso para exportar a Excel', 'Cerrar', { duration: 3000 });
      return;
    }

    try {

      this.loading.set(true);
      console.log('📊 Exportando programación a Excel (ExcelJS)...');


      const dataToExport = this.programs();


      if (dataToExport.length === 0) {
        console.warn('⚠️ No hay datos para exportar');
        this.snackBar.open('No hay programas para exportar', 'Cerrar', { duration: 3000 });
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


      console.log(`✅ Archivo Excel exportado exitosamente: ${fileName}.xlsx`);
      console.log(`📊 Total de programas exportados: ${dataToExport.length}`);


      this.snackBar.open(
        `Exportación exitosa: ${dataToExport.length} programas exportados a ${fileName}.xlsx`,
        'Cerrar',
        { duration: 5000 }
      );

      this.loading.set(false);
    } catch (error) {
      console.error('❌ Error exportando a Excel:', error);
      this.snackBar.open('Error al exportar archivo', 'Cerrar', { duration: 3000 });
      this.loading.set(false);
    }
  }


  async refreshData() {
    try {

      console.log('🔄 Refrescando datos de máquinas desde la base de datos...');



      this.snackBar.open('Actualizando datos...', '', { duration: 2000 });



      const selectedMachine = this.selectedMachineNumber();
      console.log('📌 Máquina seleccionada antes de recargar:', selectedMachine);




      await this.loadPrograms();



      if (selectedMachine) {
        console.log('📌 Restaurando máquina seleccionada:', selectedMachine);
        this.selectedMachineNumber.set(selectedMachine);
      }



      console.log('🔄 Forzando detección de cambios...');
      this.cdr.detectChanges();


      setTimeout(() => {
        console.log('🔄 Forzando segunda detección de cambios (tick)...');
        this.cdr.detectChanges();
        console.log('📊 Programas después de refrescar:', this.programs().length);
        console.log('📊 Programas de máquina seleccionada:', this.selectedMachinePrograms().length);
      }, 0);



      this.snackBar.open('✅ Datos actualizados correctamente', 'Cerrar', { duration: 3000 });


      console.log('✅ Datos de máquinas refrescados exitosamente');
      console.log('📊 Total de programas cargados:', this.programs().length);

    } catch (error) {
      console.error('❌ Error al refrescar datos:', error);
      this.snackBar.open('❌ Error al actualizar datos', 'Cerrar', { duration: 5000 });
    }
  }





  async printFF459(program: MachineProgram) {

    console.log('🖨️ Preparando impresión de formato FF-459 para programa:', program.articulo);



    if (!program || !program.articulo) {
      console.error('❌ Error: Programa inválido para impresión', program);
      this.snackBar.open('Error: No se puede imprimir el formato para este programa', 'Cerrar', { duration: 5000 });
      return;
    }

    // ===== VALIDACIÓN: NO SE PUEDE IMPRIMIR SIN ACCIÓN =====
    // Verificar que el programa NO esté en estado SIN_ASIGNAR
    if (!program.estado || program.estado === 'SIN_ASIGNAR') {
      console.warn('⚠️ No se puede imprimir FF-459: El programa está en estado SIN_ASIGNAR');
      this.snackBar.open(
        '⚠️ No se puede imprimir El programa debe tener un estado (Preparando.)',
        'Cerrar',
        { duration: 6000, panelClass: ['warning-snackbar'] }
      );
      return;
    }

    // Verificar que el programa tenga al menos una acción registrada
    if (!program.lastActionBy || !program.lastActionAt) {
      console.warn('⚠️ No se puede imprimir FF-459: El programa no tiene acciones registradas');
      this.snackBar.open(
        '⚠️ No se puede imprimir el formato FF-459. Primero debe registrarse una acción en el sistema.',
        'Cerrar',
        { duration: 6000, panelClass: ['warning-snackbar'] }
      );
      return;
    }

    console.log('✅ Validación de acción pasada:', {
      lastActionBy: program.lastActionBy,
      lastActionAt: program.lastActionAt,
      estado: program.estado
    });



    const currentUser = this.authService.getCurrentUser();
    const nombreCompleto = currentUser
      ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
      : 'Usuario';


    const today = new Date();
    const dia = String(today.getDate()).padStart(2, '0');
    const mes = String(today.getMonth() + 1).padStart(2, '0');
    const anio = today.getFullYear();
    const fechaActual = `${dia}/${mes}/${anio}`;




    const coloresArray = this.prepareColorsForFF459(program.colores, program);


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

      console.log('📄 Cargando plantilla HTML desde templates/print-ff459.html (Bypass Interceptors)');
      const response = await firstValueFrom(
        this.templateHttp.get('/templates/print-ff459.html', { responseType: 'text' })
      );

      let htmlContent = response;




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


    await this.handleAction(program, newStatus);
  }

}
