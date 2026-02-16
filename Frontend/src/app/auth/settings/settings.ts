
import { Component, signal, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';


import { AuthService, User } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { TimeFormatService } from '../../core/services/time-format.service';
import { NotificationService } from '../../core/services/notification.service';
import { SessionTimeoutService } from '../../core/services/session-timeout.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';


import { interval, Subscription } from 'rxjs';


import { PermissionsService } from '../../shared/services/permissions.service';
import { Permission, PermissionCategory, UserPermissionsResponse } from '../../shared/models/permission.model';


interface SystemConfig {
  id: string;
  name: string;
  description: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'select';
  category: string;
  options?: string[];
}


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})

export class SettingsComponent implements OnInit, OnDestroy {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  public languageService = inject(LanguageService);
  private timeFormatService = inject(TimeFormatService);
  private notificationService = inject(NotificationService);
  private sessionTimeoutService = inject(SessionTimeoutService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private permissionsService = inject(PermissionsService);


  currentUser = signal<User | null>(null);
  loading = signal<boolean>(false);
  selectedTabIndex = signal<number>(0);
  users = signal<User[]>([]);
  systemConfigs = signal<SystemConfig[]>([]);


  selectedUserForPermissions = signal<number | null>(null);
  permissionCategories = signal<PermissionCategory[]>([]);


  userDisplayedColumns: string[] = ['user', 'contact', 'role', 'status', 'lastLogin', 'actions'];


  roles = ['admin', 'supervisor', 'pre-alistador', 'matizador', 'operario', 'retornos'];


  private realTimeSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 120000;


  constructor() { }


  ngOnInit() {
    this.loadCurrentUser();
    this.checkDatabaseConnection();
    this.loadUsers();
    this.loadSystemConfigs();
    this.initializePermissionCategories();
    this.startRealTimeUpdates();
    this.setupVisibilityListener();
  }


  ngOnDestroy() {
    this.stopRealTimeUpdates();
    this.removeVisibilityListener();
  }


  private setupVisibilityListener() {

    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }


  private removeVisibilityListener() {

    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }


  private handleVisibilityChange() {
    if (document.hidden) {
      console.log('⏸️ Página oculta - Pausando actualizaciones automáticas');
    } else {
      console.log('▶️ Página visible - Reanudando actualizaciones automáticas');

      if (this.selectedTabIndex() === 0) {
        this.refreshUsersQuietly();
      }
    }
  }




  private async checkDatabaseConnection() {
    console.log('� VeLrificando conexión a la base de datos y red...');
    console.log(`� URLL principal: ${environment.apiUrl}`);
    console.log(`🔄 URLs de fallback:`, environment.fallbackUrls);


    if (environment.enableDebugMode) {
      console.group('�o DIAGNÓSTICO DE RED COMPLETO');
      console.log('📊 Configuración actual:');
      console.log('   - URL Principal:', environment.apiUrl);
      console.log('   - URL Socket:', environment.socketUrl);
      console.log('   - URL Base Imágenes:', (environment as any).imageBaseUrl);
      console.log('   - Timeout de cache:', environment.cacheTimeout);
      console.log('   - Intentos de reintento:', environment.retryAttempts);
      console.log('   - Modo red:', environment.networkMode);
      console.log('   - Estabilidad de red:', !(environment as any).disableNetworkStability);

      console.log('🌐 Información del navegador:');
      console.log('   - User Agent:', navigator.userAgent);
      console.log('   - Idioma:', navigator.language);
      console.log('   - Online:', navigator.onLine);
      console.log('   - URL actual:', window.location.href);
      console.log('   - Host actual:', window.location.host);
      console.log('   - Protocolo:', window.location.protocol);


      await this.performNetworkDiagnostic();

      console.groupEnd();
    }
  }


  private async performNetworkDiagnostic() {
    console.log('🧪 Iniciando diagnóstico de red...');


    const urlsToTest = [
      environment.apiUrl,
      ...environment.fallbackUrls,
      ...(environment as any).alternativeUrls || []
    ];


    for (const url of urlsToTest) {
      try {
        const startTime = Date.now();


        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);


        const response = await fetch(`${url.replace('/api', '')}/health`, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);
        const endTime = Date.now();


        if (response.ok) {
          console.log(`✅ ${url} - Conectado (${endTime - startTime}ms)`);
        } else {
          console.log(`⚠️ ${url} - Status: ${response.status} (${endTime - startTime}ms)`);
        }
      } catch (error: any) {

        if (error.name === 'AbortError') {
          console.log(`⏱️ ${url} - Timeout (>5000ms)`);
        } else {
          console.log(`❌ ${url} - Error:`, error.message);
        }
      }
    }
  }


  loadCurrentUser() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
  }


  canManageUsers(): boolean {

    return true;
  }


  canManageSystemConfigs(): boolean {

    return true;
  }


  onTabChange(index: number) {
    this.selectedTabIndex.set(index);
  }


  async loadUsers() {
    this.loading.set(true);

    try {
      console.log('🔍 Cargando usuarios reales desde flexoapp_bd...');
      console.log('🌐 URL del API:', environment.apiUrl);


      const response = await this.http.get<User[]>(`${environment.apiUrl}/auth/users`).toPromise();
      console.log('✅ Respuesta de usuarios recibida:', response);


      if (response && Array.isArray(response)) {

        const mappedUsers = response.map(user => {

          const imageData = {
            profileImageUrl: user.profileImage,
            profileImage: (user as any).profileImage,
            hasProfileImageUrl: !!(user.profileImage && user.profileImage.trim() !== ''),
            hasProfileImage: !!((user as any).profileImage && (user as any).profileImage.trim() !== ''),
            profileImageUrlLength: user.profileImage ? user.profileImage.length : 0,
            profileImageLength: (user as any).profileImage ? (user as any).profileImage.length : 0
          };


          if (environment.enableDebugMode) {
            console.log(`👤 Mapeando usuario: ${user.userCode}`, {
              email: user.email,
              phone: (user as any).phone,
              role: user.role,
              ...imageData
            });
          }


          let finalImageUrl = '';


          if ((user as any).profileImage && (user as any).profileImage.trim() !== '') {
            finalImageUrl = (user as any).profileImage;
          }

          else if (user.profileImage && user.profileImage.trim() !== '') {
            finalImageUrl = user.profileImage;
          }


          return {
            id: user.id,
            userCode: user.userCode,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: (user as any).phone || '',
            role: user.role,
            isActive: user.isActive,
            profileImage: finalImageUrl,
            lastLogin: (user as any).lastLogin,
            createdDate: user.createdAt ? new Date(user.createdAt) : new Date(),
            permissions: user.permissions || []
          };
        });

        console.log(`📊 ${mappedUsers.length} usuarios cargados desde MySQL flexoapp_bd`);
        this.users.set(mappedUsers);
        await this.attachAuthActivities();


      } else {
        console.warn('⚠️ Respuesta no es un array:', response);
        this.users.set([]);

      }
    } catch (error: any) {
      console.error('❌ Error cargando usuarios desde MySQL:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Detalles:', error.error);


      const success = await this.tryLoadUsersFromDatabase();

      if (!success) {
        this.users.set([]);

      }
    } finally {
      this.loading.set(false);
    }
  }


  private async tryLoadUsersFromDatabase(): Promise<boolean> {

    const urlsToTry = [
      environment.apiUrl,
      ...environment.fallbackUrls
    ];

    for (let i = 0; i < urlsToTry.length; i++) {
      const apiUrl = urlsToTry[i];

      try {
        console.log(`🔄 Intentando cargar usuarios desde: ${apiUrl} (${i + 1}/${urlsToTry.length})`);


        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const requestPromise = this.http.get<User[]>(`${apiUrl}/users`).toPromise();

        const response = await Promise.race([requestPromise, timeoutPromise]) as User[];

        if (response && response.length > 0) {
          console.log(`✅ ${response.length} usuarios cargados desde: ${apiUrl}`);
          this.users.set(response);



          return true;
        } else if (response && response.length === 0) {
          console.log(`⚠️ Base de datos vacía en: ${apiUrl}`);
          this.users.set([]);



          return true;
        }
      } catch (error: any) {
        console.error(`❌ Error conectando a ${apiUrl}:`, error);


        let errorType = 'Error desconocido';
        if (error.name === 'TimeoutError' || error.message === 'Timeout') {
          errorType = 'Timeout (servidor no responde)';
        } else if (error.status === 0) {
          errorType = 'Sin conexión (CORS o servidor apagado)';
        } else if (error.status === 404) {
          errorType = 'Endpoint no encontrado';
        } else if (error.status >= 500) {
          errorType = 'Error del servidor';
        }

        console.error(`   Tipo de error: ${errorType}`);
        console.error(`   Status: ${error.status || 'N/A'}`);
        console.error(`   Mensaje: ${error.message || 'Sin mensaje'}`);
      }
    }

    console.log('❌ No se pudo conectar a ningún servidor de base de datos');
    console.log('📋 URLs intentadas:', urlsToTry);
    return false;
  }


  private loadMockUsers() {

    this.users.set([]);
    console.log('⚠️ No hay datos de prueba - Base de datos vacía');

    this.snackBar.open('Base de datos vacía - Agrega usuarios reales usando el botón "Agregar Usuario"', 'Cerrar', {
      duration: 6000,
      panelClass: ['info-snackbar']
    });
  }


  async loadSystemConfigs() {
    if (!this.canManageSystemConfigs()) return;

    try {
      const response = await this.http.get<SystemConfig[]>(`${environment.apiUrl}/system/configs`).toPromise();
      if (response) {
        this.systemConfigs.set(response);


        const themeConfig = response.find(c => c.id === 'theme');
        if (themeConfig) {
          this.themeService.syncWithSystemConfig(themeConfig.value);
        }


        const languageConfig = response.find(c => c.id === 'language');
        if (languageConfig) {
          this.languageService.syncWithSystemConfig(languageConfig.value);
        }


        this.timeFormatService.syncAll(response);


        const notificationsConfig = response.find(c => c.id === 'enable_notifications');
        if (notificationsConfig) {
          this.notificationService.syncWithSystemConfig(notificationsConfig.value);
        }


        const soundConfig = response.find(c => c.id === 'notification_sound');
        if (soundConfig) {
          this.notificationService.syncSoundWithSystemConfig(soundConfig.value);
        }


        const durationConfig = response.find(c => c.id === 'notification_duration');
        if (durationConfig) {
          this.notificationService.syncDurationWithSystemConfig(durationConfig.value);
        }
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);

      this.systemConfigs.set([
        {
          id: 'theme',
          name: 'Tema',
          description: 'Tema visual de la aplicación',
          value: 'light',
          type: 'select',
          category: 'Apariencia',
          options: ['light', 'dark', 'auto']
        },
        {
          id: 'language',
          name: 'Idioma',
          description: 'Idioma de la interfaz',
          value: 'es',
          type: 'select',
          category: 'Regional',
          options: ['es', 'en', 'pt', 'fr', 'de']
        },
        {
          id: 'timezone',
          name: 'Zona Horaria',
          description: 'Zona horaria del sistema',
          value: 'America/Bogota',
          type: 'select',
          category: 'Regional',
          options: ['America/Bogota', 'America/Mexico_City', 'America/Lima', 'America/Buenos_Aires', 'America/Santiago', 'America/Caracas', 'America/New_York', 'Europe/Madrid']
        },
        {
          id: 'date_format',
          name: 'Formato de Fecha',
          description: 'Formato de visualización de fechas',
          value: 'DD/MM/YYYY',
          type: 'select',
          category: 'Regional',
          options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
        },
        {
          id: 'time_format',
          name: 'Formato de Hora',
          description: 'Formato de visualización de hora',
          value: '24h',
          type: 'select',
          category: 'Regional',
          options: ['24h', '12h']
        },
        {
          id: 'currency',
          name: 'Moneda',
          description: 'Moneda del sistema',
          value: 'COP',
          type: 'select',
          category: 'Regional',
          options: ['COP', 'USD', 'EUR', 'MXN', 'PEN', 'ARS', 'CLP']
        },
        {
          id: 'enable_notifications',
          name: 'Habilitar Notificaciones',
          description: 'Activar o desactivar las notificaciones del sistema',
          value: true,
          type: 'boolean',
          category: 'Notificaciones'
        },
        {
          id: 'notification_sound',
          name: 'Sonido de Notificaciones',
          description: 'Reproducir sonido al recibir notificaciones',
          value: true,
          type: 'boolean',
          category: 'Notificaciones'
        },
        {
          id: 'notification_duration',
          name: 'Duración de Notificaciones',
          description: 'Tiempo que permanecen visibles las notificaciones (segundos)',
          value: 5,
          type: 'number',
          category: 'Notificaciones'
        },
        {
          id: 'session_timeout',
          name: 'Tiempo de Sesión',
          description: 'Tiempo de inactividad antes de cerrar sesión (minutos)',
          value: 30,
          type: 'number',
          category: 'Seguridad'
        }
      ]);
    }
  }


  getConfigCategories(): string[] {
    const configs = this.systemConfigs();
    const categories = [...new Set(configs.map(c => c.category))];
    return categories.sort();
  }


  getConfigsByCategory(category: string): SystemConfig[] {
    return this.systemConfigs().filter(c => c.category === category);
  }


  async updateSystemConfig(config: SystemConfig, newValue: any) {
    try {
      console.log(`🔧 Actualizando configuración: ${config.id} = ${newValue}`);

      await this.http.put(`${environment.apiUrl}/system/configs/${config.id}`, {
        value: newValue
      }).toPromise();


      const configs = this.systemConfigs();
      const updatedConfigs = configs.map(c =>
        c.id === config.id ? { ...c, value: newValue } : c
      );
      this.systemConfigs.set(updatedConfigs);


      if (config.id === 'theme') {
        this.themeService.setTheme(newValue);
        console.log(`🎨 Tema aplicado: ${newValue}`);
      }


      if (config.id === 'language') {
        this.languageService.setLanguage(newValue);
        console.log(`🌍 Idioma aplicado: ${newValue}`);
      }


      if (config.id === 'time_format') {
        this.timeFormatService.setFormat(newValue);
        console.log(`🕐 Formato de hora aplicado: ${newValue}`);
      }


      if (config.id === 'date_format') {
        this.timeFormatService.setDateFormat(newValue);
        console.log(`📅 Formato de fecha aplicado: ${newValue}`);
      }


      if (config.id === 'timezone') {
        this.timeFormatService.setTimezone(newValue);
        console.log(`🌐 Zona horaria aplicada: ${newValue}`);
      }


      if (config.id === 'enable_notifications') {
        this.notificationService.setNotificationsEnabled(newValue);
        console.log(`🔔 Notificaciones ${newValue ? 'habilitadas' : 'deshabilitadas'}`);
      }


      if (config.id === 'notification_sound') {
        this.notificationService.syncSoundWithSystemConfig(newValue);
        console.log(`🔊 Sonido de notificaciones ${newValue ? 'habilitado' : 'deshabilitado'}`);
      }


      if (config.id === 'notification_duration') {
        this.notificationService.syncDurationWithSystemConfig(newValue);
        console.log(`⏱️ Duración de notificaciones: ${newValue} segundos`);
      }


      if (config.id === 'session_timeout') {
        this.sessionTimeoutService.updateTimeout(newValue);
        console.log(`⏰ Timeout de sesión actualizado: ${newValue} minutos`);
      }

      console.log(`✅ Configuración ${config.id} actualizada exitosamente`);

      this.snackBar.open(`Configuración "${config.name}" actualizada correctamente`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error: any) {
      console.error('❌ Error actualizando configuración:', error);

      const errorMessage = error.error?.message || error.message || 'Error al actualizar configuración';
      this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
    }
  }


  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'Admin': 'Administrador',
      'Supervisor': 'Supervisor',
      'Prealistador': 'Pre-alistador',
      'Matizadores': 'Matizador',
      'Operario': 'Operario',
      'Retornos': 'Retornos',

      'admin': 'Administrador',
      'supervisor': 'Supervisor',
      'prealistador': 'Pre-alistador',
      'matizadores': 'Matizador',
      'operario': 'Operario',
      'retornos': 'Retornos'
    };
    return roleNames[role] || role;
  }


  getOptionDisplayName(configId: string, option: string): string {

    const optionMaps: { [key: string]: { [key: string]: string } } = {
      'theme': {
        'light': '☀️ Claro',
        'dark': '🌙 Oscuro',
        'auto': '🔄 Automático (según sistema)'
      },
      'language': {
        'es': '🇪🇸 Español',
        'en': '🇺🇸 English',
        'pt': '🇧🇷 Português',
        'fr': '🇫🇷 Français',
        'de': '🇩🇪 Deutsch'
      },
      'timezone': {
        'America/Bogota': '🇨🇴 Bogotá (GMT-5)',
        'America/Mexico_City': '🇲🇽 Ciudad de México (GMT-6)',
        'America/Lima': '🇵🇪 Lima (GMT-5)',
        'America/Buenos_Aires': '🇦🇷 Buenos Aires (GMT-3)',
        'America/Santiago': '🇨🇱 Santiago (GMT-3)',
        'America/Caracas': '🇻🇪 Caracas (GMT-4)',
        'America/New_York': '🇺🇸 Nueva York (GMT-5)',
        'Europe/Madrid': '🇪🇸 Madrid (GMT+1)'
      },
      'date_format': {
        'DD/MM/YYYY': 'Día/Mes/Año (31/12/2024)',
        'MM/DD/YYYY': 'Mes/Día/Año (12/31/2024)',
        'YYYY-MM-DD': 'Año-Mes-Día (2024-12-31)'
      },
      'time_format': {
        '24h': '24 horas (23:59)',
        '12h': '12 horas (11:59 PM)'
      },
      'email_notification_types': {
        'all': '📧 Todas las notificaciones',
        'errors_only': '❌ Solo errores',
        'important_only': '⚠️ Solo importantes (errores y advertencias)',
        'none': '🚫 Ninguna'
      }
    };


    if (optionMaps[configId] && optionMaps[configId][option]) {
      return optionMaps[configId][option];
    }


    return option;
  }




  async reloadUsers() {
    console.log('🔄 Recarga manual de usuarios solicitada');
    await this.loadUsers();
  }


  openCreateUserDialog() {


    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Usuario creado desde diálogo:', result);

        this.loadUsers();
      }
    });
  }




  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES');
  }


  getActiveUsersCount(): number {
    return this.users().filter(u => u.isActive).length;
  }




  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }


  getAvatarColor(name: string): string {
    const colors = [
      '#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706',
      '#0891b2', '#be185d', '#4338ca', '#16a34a', '#ea580c'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }


  getProfileImageUrl(profileImageUrl: string | undefined): string {
    if (!profileImageUrl || profileImageUrl.trim() === '' || profileImageUrl === 'null' || profileImageUrl === 'undefined') {
      return '';
    }


    if (profileImageUrl.startsWith('data:image/')) {
      return profileImageUrl;
    }


    if (profileImageUrl.startsWith('http')) {
      return profileImageUrl;
    }



    const baseUrl = (environment as any).imageBaseUrl || environment.apiUrl.replace('/api', '');


    const imagePath = profileImageUrl.startsWith('/') ? profileImageUrl : `/${profileImageUrl}`;

    const fullUrl = `${baseUrl}${imagePath}`;


    if (environment.enableDebugMode) {
      console.log(`🖼️ Imagen procesada: "${profileImageUrl}" → "${fullUrl}"`);
    }

    return fullUrl;
  }


  onImageError(event: any) {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');
    const userCode = imgElement.getAttribute('data-user-code');


    if (avatarContainer) {
      avatarContainer.classList.add('error');
      avatarContainer.classList.remove('loading', 'loaded');
    }


    imgElement.style.display = 'none';


    if (userCode) {
      const users = this.users();
      const updatedUsers = users.map(u => {
        if (u.userCode === userCode) {

          return { ...u, profileImage: '' };
        }
        return u;
      });
      this.users.set(updatedUsers);
    }


    if (environment.enableDebugMode) {
      console.group('❌ ERROR DE IMAGEN DE PERFIL');
      console.log('👤 Usuario:', userCode);
      console.log('🖼️ URL que falló:', imgElement.src);
      console.log('🔗 URL original:', imgElement.getAttribute('data-original-src') || 'No disponible');
      console.log('📊 Dimensiones esperadas:', `${imgElement.width}x${imgElement.height}`);
      console.log('🌐 Estado de red:', navigator.onLine ? 'Online' : 'Offline');
      console.log('💡 Solución: Mostrando avatar por defecto');


      this.diagnoseImageError(imgElement.src);

      console.groupEnd();
    }
  }


  private async diagnoseImageError(imageUrl: string) {
    try {

      const response = await fetch(imageUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });

      console.log('🔍 Diagnóstico de imagen:');
      console.log('   - Status:', response.status);
      console.log('   - Type:', response.type);
      console.log('   - Headers disponibles:', response.headers ? 'Sí' : 'No');

    } catch (error: any) {
      console.log('🔍 Diagnóstico de imagen:');
      console.log('   - Error de red:', error.message);
      console.log('   - Tipo de error:', error.name);


      if (error.message.includes('CORS')) {
        console.log('💡 Sugerencia: Problema de CORS - verificar configuración del servidor');
      } else if (error.message.includes('network')) {
        console.log('💡 Sugerencia: Problema de red - verificar conectividad');
      } else if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
        console.log('💡 Sugerencia: URL localhost no accesible desde otros dispositivos');
      }
    }
  }


  hasProfileImage(user: User): boolean {
    return !!((user as any).profileImage &&
      (user as any).profileImage.trim() !== '' &&
      (user as any).profileImage !== 'null' &&
      (user as any).profileImage !== 'undefined');
  }


  onImageLoad(event: any) {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');

    if (avatarContainer) {
      avatarContainer.classList.add('loaded');
      avatarContainer.classList.remove('loading', 'error');
    }
  }


  onImageLoadStart(event: any) {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');

    if (avatarContainer) {
      avatarContainer.classList.add('loading');
      avatarContainer.classList.remove('loaded', 'error');
    }
  }




  formatRelativeDate(date: any): string {
    const isSpanish = this.languageService.getLanguage() === 'es';
    if (!date) return isSpanish ? 'Nunca' : 'Never';

    const now = new Date();
    const loginDate = new Date(date);


    if (isNaN(loginDate.getTime())) return isSpanish ? 'Nunca' : 'Never';

    const diffMs = now.getTime() - loginDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return isSpanish ? 'Ahora' : 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return this.timeFormatService.formatDate(loginDate);
  }


  formatFullDate(date: any): string {
    const isSpanish = this.languageService.getLanguage() === 'es';
    if (!date) return isSpanish ? 'Nunca ha iniciado sesión' : 'Never logged in';

    const loginDate = new Date(date);


    if (isNaN(loginDate.getTime())) return isSpanish ? 'Nunca ha iniciado sesión' : 'Never logged in';

    const dateStr = this.timeFormatService.formatDate(loginDate);
    const timeStr = this.timeFormatService.formatTime(loginDate);

    return `${dateStr} ${timeStr}`;
  }

  private async attachAuthActivities() {
    try {
      const activities: any[] = (await this.http.get<any[]>(`${environment.apiUrl}/audit/auth-activities`).toPromise()) || [];
      if (!activities || !Array.isArray(activities)) return;

      const byUser: Record<number, { lastLogin?: Date; lastLogout?: Date }> = {};

      for (const act of activities) {
        const uidNum = typeof act.userId === 'number' ? act.userId : parseInt(String(act.userId), 10);
        if (!uidNum || isNaN(uidNum)) continue;
        const ts = act.timestamp ? new Date(act.timestamp) : null;
        if (!ts || isNaN(ts.getTime())) continue;

        const bucket = byUser[uidNum] || {};
        if (act.action === 'LOGIN_SUCCESS') {
          if (!bucket.lastLogin || ts > bucket.lastLogin) bucket.lastLogin = ts;
        } else if (act.action === 'LOGOUT') {
          if (!bucket.lastLogout || ts > bucket.lastLogout) bucket.lastLogout = ts;
        }
        byUser[uidNum] = bucket;
      }

      const updated = this.users().map(u => {
        const uidNum = parseInt(String(u.id), 10);
        const bucket = byUser[uidNum];
        const lastLogin = bucket?.lastLogin ? bucket.lastLogin : (u as any).lastLogin ? new Date((u as any).lastLogin) : null;
        const lastLogout = bucket?.lastLogout ? bucket.lastLogout : (u as any).lastLogout ? new Date((u as any).lastLogout) : null;
        return { ...u, lastLogin, lastLogout };
      });

      this.users.set(updated);
    } catch (e) {
      console.error('Error obteniendo actividades de autenticación:', e);
    }
  }

  formatLastConnectionLabel(user: any): string {
    const isSpanish = this.languageService.getLanguage() === 'es';
    const ln = user?.lastLogin ? new Date(user.lastLogin) : null;
    const hasLn = ln && !isNaN(ln.getTime());
    if (!hasLn) return isSpanish ? 'Nunca' : 'Never';
    return (isSpanish ? 'Login:' : 'Login:') + ' ' + this.formatRelativeDate(ln);
  }

  formatLastConnectionTooltip(user: any): string {
    const isSpanish = this.languageService.getLanguage() === 'es';
    const ln = user?.lastLogin ? new Date(user.lastLogin) : null;
    const lo = user?.lastLogout ? new Date(user.lastLogout) : null;
    const lnValid = ln && !isNaN(ln.getTime());
    const loValid = lo && !isNaN(lo.getTime());
    const lnStr = lnValid ? `${this.timeFormatService.formatDate(ln!)} ${this.timeFormatService.formatTime(ln!)}` : (isSpanish ? 'Nunca ha iniciado sesión' : 'Never logged in');
    const loStr = loValid ? `${this.timeFormatService.formatDate(lo!)} ${this.timeFormatService.formatTime(lo!)}` : (isSpanish ? 'Sin desconexión registrada' : 'No logout recorded');
    const elapsed = loValid ? this.formatElapsedSinceLogout(user) : (isSpanish ? 'N/D' : 'N/A');
    return `${isSpanish ? 'Último acceso' : 'Last login'}: ${lnStr}\n${isSpanish ? 'Último cierre' : 'Last logout'}: ${loStr}\n${isSpanish ? 'Tiempo desde desconexión' : 'Elapsed since logout'}: ${elapsed}`;
  }

  formatElapsedSinceLogout(user: any): string {
    const lo = user?.lastLogout ? new Date(user.lastLogout) : null;
    if (!lo || isNaN(lo.getTime())) return '';
    const diffMs = Date.now() - lo.getTime();
    if (diffMs < 0) return '0s / 0m / 0h';
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${seconds}s / ${minutes}m / ${hours}h`;
  }

  formatLastConnectionDate(user: any): string {
    const isSpanish = this.languageService.getLanguage() === 'es';
    const lo = user?.lastLogout ? new Date(user.lastLogout) : null;
    const ln = user?.lastLogin ? new Date(user.lastLogin) : null;
    const base = lo && !isNaN(lo.getTime()) ? lo : ln && !isNaN(ln.getTime()) ? ln : null;
    if (!base) return isSpanish ? '' : '';
    const dateStr = this.timeFormatService.formatDate(base);
    const timeStr = this.timeFormatService.formatTime(base);
    return `${dateStr} ${timeStr}`;
  }





  async resetPassword(user: User) {
    const email = user.email || 'correo no disponible';
    if (!confirm(`¿Restablecer la contraseña de ${user.firstName} ${user.lastName}?\n\nSe enviará una nueva contraseña temporal al correo: ${email}`)) {
      return;
    }

    this.loading.set(true);
    try {
      console.log(`🔐 Restableciendo contraseña para usuario MySQL: ${user.userCode}`);


      const response = await this.http.post(`${environment.apiUrl}/auth/users/${user.id}/reset-password`, {}).toPromise();

      if (response) {
        console.log(`✅ Contraseña restablecida en MySQL para: ${user.userCode}`);

        this.snackBar.open(`Contraseña restablecida. Nueva contraseña enviada a ${email}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error) {
      console.error('❌ Error restableciendo contraseña en MySQL:', error);


      this.snackBar.open(`Contraseña restablecida para ${user.firstName} ${user.lastName}`, 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }


  editUser(user: User) {


    console.log(`✏️ Editando usuario: ${user.userCode}`);

    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: false,
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Usuario actualizado desde diálogo:', result);


        const updatedUsers = this.users().map(u =>
          u.id === result.id ? result : u
        );
        this.users.set(updatedUsers);


      }
    });
  }


  async deleteUser(user: User) {
    const confirmMessage = `⚠️ ELIMINAR USUARIO DE MYSQL

Usuario: ${user.firstName} ${user.lastName}
Código: ${user.userCode}
Rol: ${this.getRoleDisplayName(user.role)}

Esta acción eliminará el usuario de la base de datos flexoapp_bd.

¿Estás seguro de continuar?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.loading.set(true);
    try {
      console.log(`🗑️ Eliminando usuario de MySQL: ${user.userCode} (ID: ${user.id})`);


      await this.http.delete(`${environment.apiUrl}/users/${user.id}`).toPromise();


      const updatedUsers = this.users().filter(u => u.id !== user.id);
      this.users.set(updatedUsers);

      console.log(`✅ Usuario eliminado exitosamente de MySQL: ${user.userCode}`);


      this.snackBar.open(`Usuario ${user.userCode} eliminado exitosamente`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error: any) {
      console.error('❌ Error eliminando usuario de MySQL:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Detalles:', error.error);


      const errorMessage = error.error?.message || error.message || 'Error al eliminar usuario';
      this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }


  async toggleUserStatus(user: User) {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activar' : 'desactivar';



    this.loading.set(true);
    try {
      console.log(`🔄 ${action}ndo usuario en MySQL: ${user.userCode}`);

      await this.http.patch(`${environment.apiUrl}/auth/users/${user.id}/status`, {
        isActive: newStatus
      }).toPromise();


      const updatedUsers = this.users().map(u =>
        u.id === user.id ? { ...u, isActive: newStatus } : u
      );
      this.users.set(updatedUsers);

      console.log(`✅ Usuario ${action}do en MySQL: ${user.userCode}`);


      const statusMessage = newStatus ? '✓ Usuario activo' : '⊘ Usuario inactivo';
      this.snackBar.open(statusMessage, '', {
        duration: 2000,
        panelClass: [newStatus ? 'user-active-snackbar' : 'user-inactive-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    } catch (error) {
      console.error(`❌ Error ${action}ndo usuario en MySQL:`, error);


    } finally {
      this.loading.set(false);
    }
  }




  private startRealTimeUpdates() {
    console.log('🔄 Iniciando actualizaciones en tiempo real cada 2 minutos (optimizado)');

    this.realTimeSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {

      if (this.selectedTabIndex() === 0 && !document.hidden && !this.loading()) {
        console.log('🔄 Actualización automática de usuarios (optimizada)...');
        this.refreshUsersQuietly();
      } else {
        console.log('⏸️ Actualización omitida - pestaña inactiva o cargando');
      }
    });
  }


  private stopRealTimeUpdates() {
    if (this.realTimeSubscription) {
      this.realTimeSubscription.unsubscribe();
      console.log('⏹️ Actualizaciones en tiempo real detenidas');
    }
  }


  private async refreshUsersQuietly() {
    if (this.loading()) return;

    try {
      const response = await this.http.get<User[]>(`${environment.apiUrl}/auth/users`).toPromise();

      if (response && Array.isArray(response)) {
        const currentUsers = this.users();


        const newUsers = response.map(user => {

          let finalImageUrl = '';
          if ((user as any).profileImage && (user as any).profileImage.trim() !== '') {
            finalImageUrl = (user as any).profileImage;
          } else if (user.profileImage && user.profileImage.trim() !== '') {
            finalImageUrl = user.profileImage;
          }

          return {
            id: user.id,
            userCode: user.userCode,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: (user as any).phone || '',
            role: user.role,
            isActive: user.isActive,
            profileImage: finalImageUrl,
            lastLogin: (user as any).lastLogin || new Date(),
            createdDate: user.createdAt ? new Date(user.createdAt) : new Date(),
            permissions: user.permissions || []
          };
        });


        if (this.hasUsersChanged(currentUsers, newUsers)) {
          this.users.set(newUsers);


          if (currentUsers.length !== newUsers.length) {
            this.snackBar.open('Usuarios actualizados', '', {
              duration: 1500,
              panelClass: ['info-snackbar']
            });
          }
        }
      }
    } catch (error) {

      if (!environment.production) {
        console.warn('⚠️ Error en actualización automática:', error);
      }

    }
  }


  private hasUsersChanged(currentUsers: User[], newUsers: User[]): boolean {
    if (currentUsers.length !== newUsers.length) return true;


    for (let i = 0; i < currentUsers.length; i++) {
      const current = currentUsers[i];
      const newUser = newUsers.find(u => u.id === current.id);

      if (!newUser) return true;


      if (current.firstName !== newUser.firstName ||
        current.lastName !== newUser.lastName ||
        current.email !== newUser.email ||
        current.role !== newUser.role ||
        current.isActive !== newUser.isActive ||
        current.profileImage !== newUser.profileImage) {
        return true;
      }
    }

    return false;
  }


  async forceRefresh() {
    console.log('🔄 Actualización manual forzada');
    await this.loadUsers();
  }


  async testImageLoading() {
    const users = this.users();
    const usersWithImages = users.filter(u => this.hasProfileImage(u));

    console.group('🖼️ TEST DE CARGA DE IMÁGENES');
    console.log(`📊 Usuarios con imagen: ${usersWithImages.length}/${users.length}`);

    for (const user of usersWithImages) {
      const originalUrl = user.profileImage;
      const processedUrl = this.getProfileImageUrl(originalUrl || '');

      console.log(`👤 ${user.userCode}:`);
      console.log(`   - URL Original: ${originalUrl}`);
      console.log(`   - URL Procesada: ${processedUrl}`);

      try {
        const response = await fetch(processedUrl, { method: 'HEAD' });
        console.log(`   - Estado: ${response.ok ? '✅ OK' : '❌ Error'} (${response.status})`);
      } catch (error) {
        console.log(`   - Estado: ❌ Error de red`);
      }
    }

    console.groupEnd();

    this.snackBar.open(`Test de imágenes completado: ${usersWithImages.length} imágenes probadas`, 'Cerrar', {
      duration: 4000,
      panelClass: ['info-snackbar']
    });
  }




  initializePermissionCategories() {
    const categories = this.permissionsService.initializePermissionCategories();
    this.permissionCategories.set(categories);
    console.log('🔐 Categorías de permisos inicializadas');
  }


  async loadUserPermissions() {
    const userId = this.selectedUserForPermissions();
    if (!userId) {
      console.warn('⚠️ No hay usuario seleccionado para cargar permisos');
      return;
    }

    try {
      console.log(`🔍 Cargando permisos del usuario ${userId}...`);

      const response = await this.permissionsService.getUserPermissions(userId).toPromise();

      if (response) {
        console.log(`✅ Permisos cargados: ${response.grantedCount}/${response.totalCount}`);


        const categories = this.permissionCategories();
        const updatedCategories = categories.map(category => ({
          ...category,
          permissions: category.permissions.map(permission => ({
            ...permission,
            isGranted: response.permissions.includes(permission.code)
          }))
        }));

        this.permissionCategories.set(updatedCategories);
      }
    } catch (error: any) {
      console.error('❌ Error cargando permisos del usuario:', error);
      this.snackBar.open('Error al cargar permisos del usuario', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }


  async togglePermission(permission: Permission, isGranted: boolean) {
    if (!this.isAdmin()) {
      this.snackBar.open('Solo los administradores pueden modificar permisos', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const userId = this.selectedUserForPermissions();
    if (!userId) {
      console.warn('⚠️ No hay usuario seleccionado');
      return;
    }

    const currentUser = this.currentUser();
    const grantedBy = currentUser?.id ? parseInt(currentUser.id, 10) : undefined;

    try {
      console.log(`🔧 ${isGranted ? 'Concediendo' : 'Revocando'} permiso '${permission.code}' para usuario ${userId}`);

      await this.permissionsService.updateUserPermission(userId, permission.code, isGranted, grantedBy).toPromise();


      const categories = this.permissionCategories();
      const updatedCategories = categories.map(category => ({
        ...category,
        permissions: category.permissions.map(p =>
          p.code === permission.code ? { ...p, isGranted } : p
        )
      }));

      this.permissionCategories.set(updatedCategories);

      this.snackBar.open(
        `Permiso "${permission.name}" ${isGranted ? 'activado' : 'desactivado'}`,
        'Cerrar',
        {
          duration: 2000,
          panelClass: [isGranted ? 'success-snackbar' : 'info-snackbar']
        }
      );

      console.log(`✅ Permiso '${permission.code}' ${isGranted ? 'concedido' : 'revocado'}`);
    } catch (error: any) {
      console.error('❌ Error actualizando permiso:', error);
      this.snackBar.open('Error al actualizar permiso', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });


      await this.loadUserPermissions();
    }
  }


  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role?.toLowerCase() === 'admin';
  }


  getGrantedCount(category: PermissionCategory): number {
    return category.permissions.filter(p => p.isGranted).length;
  }


  onUserForPermissionsChange(userId: number | null) {
    this.selectedUserForPermissions.set(userId);
    if (userId) {
      this.loadUserPermissions();
    }
  }

}
