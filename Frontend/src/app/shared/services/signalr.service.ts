import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { getSignalRHubUrl, isSignalREnabled } from '../../core/utils/api-url.util';

export interface MachineNotification {
  type: string;
  otSap?: string;
  machineNumber?: number;
  action?: string;
  oldState?: string;
  newState?: string;
  created?: number;
  updated?: number;
  userName?: string;
  reason?: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private connectionState$ = new BehaviorSubject<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );

  // Observables para diferentes tipos de notificaciones
  public machineUpdated$ = new Subject<MachineNotification>();
  public machineStateChanged$ = new Subject<MachineNotification>();
  public excelImported$ = new Subject<MachineNotification>();
  public machineDeleted$ = new Subject<MachineNotification>();
  public refreshAll$ = new Subject<MachineNotification>();

  constructor() {}

  /**
   * Iniciar conexión con el Hub de SignalR
   */
  public startConnection(token: string): Promise<void> {
    if (!isSignalREnabled()) {
      return Promise.resolve();
    }

    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }

    const hubUrl = getSignalRHubUrl();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Estrategia de reconexión: 0s, 2s, 10s, 30s, luego cada 60s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          if (retryContext.previousRetryCount === 3) return 30000;
          return 60000;
        }
      })
      .configureLogging(environment.production ? signalR.LogLevel.Warning : signalR.LogLevel.Information)
      .build();

    // Railway/proxies: el timeout por defecto del cliente (30s) es corto vs keep-alive del servidor (30s)
    this.hubConnection.keepAliveIntervalInMilliseconds = 20_000;
    this.hubConnection.serverTimeoutInMilliseconds = 120_000;

    // Configurar event handlers
    this.setupEventHandlers();

    // Iniciar conexión
    return this.hubConnection
      .start()
      .then(() => {
        if (!environment.production) {
          console.log('✅ SignalR conectado:', hubUrl);
        }
        this.connectionState$.next(signalR.HubConnectionState.Connected);
      })
      .catch((err) => {
        console.warn(
          '⚠️ SignalR no disponible; la app seguirá con actualización periódica.',
          hubUrl,
          err?.message || err
        );
        this.connectionState$.next(signalR.HubConnectionState.Disconnected);
      });
  }

  /**
   * Configurar los event handlers del Hub
   */
  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    // Evento: Máquina actualizada
    this.hubConnection.on('MachineUpdated', (notification: MachineNotification) => {
      console.log('📢 Máquina actualizada:', notification);
      this.machineUpdated$.next(notification);
    });

    // Evento: Estado de máquina cambiado
    this.hubConnection.on('MachineStateChanged', (notification: MachineNotification) => {
      console.log('📢 Estado de máquina cambiado:', notification);
      this.machineStateChanged$.next(notification);
    });

    // Evento: Excel importado
    this.hubConnection.on('ExcelImported', (notification: MachineNotification) => {
      console.log('📢 Excel importado:', notification);
      this.excelImported$.next(notification);
    });

    // Evento: Máquina eliminada
    this.hubConnection.on('MachineDeleted', (notification: MachineNotification) => {
      console.log('📢 Máquina eliminada:', notification);
      this.machineDeleted$.next(notification);
    });

    // Evento: Refresh global
    this.hubConnection.on('RefreshAll', (notification: MachineNotification) => {
      console.log('📢 Refresh global solicitado:', notification);
      this.refreshAll$.next(notification);
    });

    // Eventos de conexión
    this.hubConnection.onreconnecting(() => {
      this.connectionState$.next(signalR.HubConnectionState.Reconnecting);
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState$.next(signalR.HubConnectionState.Connected);
    });

    this.hubConnection.onclose(() => {
      this.connectionState$.next(signalR.HubConnectionState.Disconnected);
    });
  }

  /**
   * Unirse a un grupo de máquina específica
   */
  public async joinMachineGroup(machineNumber: number): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      console.warn('⚠️ No se puede unir al grupo: SignalR no está conectado');
      return;
    }

    try {
      await this.hubConnection.invoke('JoinMachineGroup', machineNumber);
      console.log(`👥 Unido al grupo de máquina ${machineNumber}`);
    } catch (err) {
      console.error(`❌ Error uniéndose al grupo de máquina ${machineNumber}:`, err);
    }
  }

  /**
   * Salir de un grupo de máquina específica
   */
  public async leaveMachineGroup(machineNumber: number): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.hubConnection.invoke('LeaveMachineGroup', machineNumber);
      console.log(`👋 Salió del grupo de máquina ${machineNumber}`);
    } catch (err) {
      console.error(`❌ Error saliendo del grupo de máquina ${machineNumber}:`, err);
    }
  }

  /**
   * Detener la conexión
   */
  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        console.log('👋 SignalR desconectado');
        this.connectionState$.next(signalR.HubConnectionState.Disconnected);
      } catch (err) {
        console.error('❌ Error deteniendo SignalR:', err);
      }
    }
  }

  /**
   * Obtener el estado de la conexión
   */
  public getConnectionState(): signalR.HubConnectionState {
    return this.hubConnection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  /**
   * Observable del estado de conexión
   */
  public get connectionState() {
    return this.connectionState$.asObservable();
  }

  /**
   * Verificar si está conectado
   */
  public get isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
}
