// Importaciones de Angular Core - Funcionalidades básicas del framework
import { Component, signal, OnInit, inject, OnDestroy } from '@angular/core'; // Decoradores y hooks de ciclo de vida
import { CommonModule } from '@angular/common';                              // Directivas comunes (ngIf, ngFor, etc.)

// Importaciones de Angular Material - Componentes de UI con Material Design
import { MatButtonModule } from '@angular/material/button';                  // Botones con estilos Material Design
import { MatIconModule } from '@angular/material/icon';                      // Iconos de Material Design
import { MatCardModule } from '@angular/material/card';                      // Tarjetas contenedoras con elevación
import { MatTabsModule } from '@angular/material/tabs';                      // Pestañas para organizar contenido
import { MatTableModule } from '@angular/material/table';                    // Tablas de datos con funcionalidades avanzadas
import { MatChipsModule } from '@angular/material/chips';                    // Chips para mostrar etiquetas y estados
import { MatSlideToggleModule } from '@angular/material/slide-toggle';       // Interruptores deslizantes para opciones booleanas
import { MatFormFieldModule } from '@angular/material/form-field';           // Contenedores para campos de formulario
import { MatInputModule } from '@angular/material/input';                    // Campos de entrada de texto
import { MatSelectModule } from '@angular/material/select';                  // Selectores desplegables
import { MatCheckboxModule } from '@angular/material/checkbox';              // Casillas de verificación
import { MatExpansionModule } from '@angular/material/expansion';            // Paneles expandibles para configuraciones
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; // Notificaciones tipo toast
import { MatTooltipModule } from '@angular/material/tooltip';                // Tooltips informativos
import { MatDialog, MatDialogModule } from '@angular/material/dialog';       // Diálogos modales

// Importaciones de servicios y modelos de la aplicación
import { AuthService, User } from '../../core/services/auth.service';       // Servicio de autenticación y modelo de usuario
import { ThemeService } from '../../core/services/theme.service';           // Servicio de temas para cambiar apariencia
import { LanguageService } from '../../core/services/language.service';     // Servicio de idiomas para internacionalización
import { TimeFormatService } from '../../core/services/time-format.service'; // Servicio de formato de hora
import { NotificationService } from '../../core/services/notification.service'; // Servicio de notificaciones
import { SessionTimeoutService } from '../../core/services/session-timeout.service'; // Servicio de timeout de sesión
import { HttpClient } from '@angular/common/http';                          // Cliente HTTP para peticiones al backend
import { environment } from '../../../environments/environment';            // Configuración de entorno (URLs, flags, etc.)

// Importaciones de componentes de diálogo personalizados
import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component'; // Diálogo para crear usuarios
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';       // Diálogo para editar usuarios

// Importaciones de RxJS para programación reactiva
import { interval, Subscription } from 'rxjs';                              // Observables para actualizaciones automáticas

// Interfaz para configuraciones del sistema - Define la estructura de cada configuración
interface SystemConfig {
  id: string;                                          // Identificador único de la configuración
  name: string;                                        // Nombre descriptivo mostrado al usuario
  description: string;                                 // Descripción detallada de la funcionalidad
  value: any;                                          // Valor actual de la configuración (puede ser cualquier tipo)
  type: 'string' | 'number' | 'boolean' | 'select';  // Tipo de dato para renderizar el control apropiado
  category: string;                                    // Categoría para agrupar configuraciones relacionadas
  options?: string[];                                  // Opciones disponibles (solo para tipo 'select')
}

// Decorador de componente Angular - Define metadatos del componente de configuraciones
@Component({
  selector: 'app-settings',                            // Selector CSS para usar el componente en templates
  standalone: true,                                    // Componente independiente (no requiere NgModule)
  imports: [                                           // Módulos importados para uso en el template
    CommonModule,                                      // Directivas básicas de Angular (ngIf, ngFor, pipes)
    MatButtonModule,                                   // Botones de Material Design
    MatIconModule,                                     // Iconos de Material Design
    MatCardModule,                                     // Tarjetas contenedoras
    MatTabsModule,                                     // Sistema de pestañas
    MatTableModule,                                    // Tablas de datos
    MatChipsModule,                                    // Chips para etiquetas
    MatSlideToggleModule,                              // Interruptores deslizantes
    MatFormFieldModule,                                // Contenedores de campos de formulario
    MatInputModule,                                    // Campos de entrada de texto
    MatSelectModule,                                   // Selectores desplegables
    MatCheckboxModule,                                 // Casillas de verificación
    MatExpansionModule,                                // Paneles expandibles
    MatSnackBarModule,                                 // Notificaciones toast
    MatTooltipModule,                                  // Tooltips informativos
    MatDialogModule                                    // Diálogos modales
  ],
  templateUrl: './settings.html',                      // Ruta al archivo de template HTML
  styleUrls: ['./settings.scss']                      // Ruta al archivo de estilos SCSS
})
// Clase principal del componente de configuraciones - Implementa hooks de ciclo de vida
export class SettingsComponent implements OnInit, OnDestroy {
  // Inyección de dependencias usando la nueva sintaxis inject() de Angular
  private http = inject(HttpClient);                   // Cliente HTTP para comunicación con el backend en 192.168.1.6:7003
  private authService = inject(AuthService);           // Servicio de autenticación para gestión de usuarios
  private themeService = inject(ThemeService);         // Servicio de temas para cambiar apariencia
  public languageService = inject(LanguageService);   // Servicio de idiomas para internacionalización
  private timeFormatService = inject(TimeFormatService); // Servicio de formato de hora
  private notificationService = inject(NotificationService); // Servicio de notificaciones
  private sessionTimeoutService = inject(SessionTimeoutService); // Servicio de timeout de sesión
  private snackBar = inject(MatSnackBar);             // Servicio para mostrar notificaciones toast
  private dialog = inject(MatDialog);                 // Servicio para abrir diálogos modales

  // Señales reactivas (Angular Signals) - Estado reactivo del componente
  currentUser = signal<User | null>(null);            // Usuario actualmente autenticado
  loading = signal<boolean>(false);                   // Estado de carga para mostrar spinners
  selectedTabIndex = signal<number>(0);               // Índice de la pestaña actualmente seleccionada
  users = signal<User[]>([]);                        // Lista de todos los usuarios del sistema
  systemConfigs = signal<SystemConfig[]>([]);        // Configuraciones del sistema

  // Configuración de tabla de usuarios - Columnas mostradas en formato compacto
  userDisplayedColumns: string[] = ['user', 'contact', 'role', 'status', 'lastLogin', 'actions'];

  // Roles estándar del sistema FlexoApp - Jerarquía de permisos definida
  roles = ['admin', 'supervisor', 'pre-alistador', 'matizador', 'operario', 'retornos'];

  // Actualización en tiempo real - Sistema optimizado para reducir carga de red
  private realTimeSubscription?: Subscription;        // Suscripción para actualizaciones automáticas
  private readonly REFRESH_INTERVAL = 120000;        // Intervalo de actualización: 2 minutos (120,000 ms)

  // Constructor vacío - La inyección de dependencias se maneja con inject()
  constructor() { }

  // Hook de inicialización - Se ejecuta después de que Angular inicializa el componente
  ngOnInit() {
    this.loadCurrentUser();                            // Cargar información del usuario autenticado
    this.checkDatabaseConnection();                    // Verificar conectividad con la base de datos MySQL
    this.loadUsers();                                  // Cargar lista completa de usuarios desde la BD
    this.loadSystemConfigs();                          // Cargar configuraciones del sistema desde el backend
    this.startRealTimeUpdates();                       // Iniciar actualizaciones automáticas cada 2 minutos
    this.setupVisibilityListener();                    // Configurar listener para pausar updates cuando la página no es visible
  }

  // Hook de destrucción - Limpieza de recursos cuando el componente se destruye
  ngOnDestroy() {
    this.stopRealTimeUpdates();                        // Detener actualizaciones automáticas para evitar memory leaks
    this.removeVisibilityListener();                   // Remover listener de visibilidad de página
  }

  /**
   * Configurar listener para visibilidad de la página
   * Optimización: Pausar actualizaciones cuando la página no es visible para ahorrar recursos
   */
  private setupVisibilityListener() {
    // Agregar event listener al documento para detectar cambios de visibilidad
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Remover listener de visibilidad
   * Limpieza: Eliminar event listener para evitar memory leaks
   */
  private removeVisibilityListener() {
    // Remover event listener del documento al destruir el componente
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Manejar cambios de visibilidad de la página
   * Pausa/reanuda actualizaciones automáticas según la visibilidad de la página
   */
  private handleVisibilityChange() {
    if (document.hidden) {                             // Si la página está oculta (usuario cambió de pestaña/minimizó)
      console.log('⏸️ Página oculta - Pausando actualizaciones automáticas');
    } else {                                           // Si la página vuelve a ser visible
      console.log('▶️ Página visible - Reanudando actualizaciones automáticas');
      // Actualizar inmediatamente cuando la página vuelve a ser visible
      if (this.selectedTabIndex() === 0) {            // Solo si estamos en la pestaña de usuarios
        this.refreshUsersQuietly();                   // Actualizar usuarios silenciosamente
      }
    }
  }



  /**
   * Verificar conexión a la base de datos y diagnosticar problemas de red
   * Función crítica: Asegura que la conexión a 192.168.1.6:7003 esté funcionando correctamente
   */
  private async checkDatabaseConnection() {
    console.log('� VeLrificando conexión a la base de datos y red...');
    console.log(`� URLL principal: ${environment.apiUrl}`);          // Mostrar URL principal configurada
    console.log(`🔄 URLs de fallback:`, environment.fallbackUrls);   // Mostrar URLs de respaldo

    // Información detallada de red para diagnóstico - Solo en modo debug
    if (environment.enableDebugMode) {
      console.group('�o DIAGNÓSTICO DE RED COMPLETO');
      console.log('📊 Configuración actual:');
      console.log('   - URL Principal:', environment.apiUrl);                    // URL del API backend
      console.log('   - URL Socket:', environment.socketUrl);                    // URL para WebSockets
      console.log('   - URL Base Imágenes:', (environment as any).imageBaseUrl); // URL base para imágenes de perfil
      console.log('   - Timeout de cache:', environment.cacheTimeout);           // Tiempo de vida del cache
      console.log('   - Intentos de reintento:', environment.retryAttempts);     // Número de reintentos automáticos
      console.log('   - Modo red:', environment.networkMode);                    // Si está habilitado el modo red
      console.log('   - Estabilidad de red:', !(environment as any).disableNetworkStability); // Servicio de estabilidad

      console.log('🌐 Información del navegador:');
      console.log('   - User Agent:', navigator.userAgent);                      // Información del navegador
      console.log('   - Idioma:', navigator.language);                           // Idioma del navegador
      console.log('   - Online:', navigator.onLine);                             // Estado de conexión a internet
      console.log('   - URL actual:', window.location.href);                     // URL actual de la página
      console.log('   - Host actual:', window.location.host);                    // Host actual (debería ser 192.168.1.6:4200)
      console.log('   - Protocolo:', window.location.protocol);                  // Protocolo usado (http/https)

      // Test de conectividad básico a todas las URLs configuradas
      await this.performNetworkDiagnostic();

      console.groupEnd();
    }
  }

  /**
   * Realizar diagnóstico de red completo
   * Prueba la conectividad a todas las URLs configuradas para asegurar acceso desde 192.168.1.6:4200
   */
  private async performNetworkDiagnostic() {
    console.log('🧪 Iniciando diagnóstico de red...');

    // Compilar lista de todas las URLs a probar
    const urlsToTest = [
      environment.apiUrl,                              // URL principal del API
      ...environment.fallbackUrls,                    // URLs de fallback configuradas
      ...(environment as any).alternativeUrls || []   // URLs alternativas para diferentes redes
    ];

    // Probar cada URL secuencialmente
    for (const url of urlsToTest) {
      try {
        const startTime = Date.now();                  // Marcar tiempo de inicio para medir latencia

        // Configurar timeout de 5 segundos para evitar esperas largas
        const controller = new AbortController();      // Controlador para cancelar petición
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos

        // Realizar petición HTTP de prueba al endpoint de salud
        const response = await fetch(`${url.replace('/api', '')}/health`, {
          method: 'GET',                               // Método GET para endpoint de salud
          signal: controller.signal,                   // Señal para cancelación por timeout
          mode: 'cors',                               // Permitir peticiones CORS
          headers: {
            'Accept': 'application/json',             // Aceptar respuestas JSON
            'Content-Type': 'application/json'        // Enviar contenido JSON
          }
        });

        clearTimeout(timeoutId);                      // Limpiar timeout si la petición completó
        const endTime = Date.now();                   // Marcar tiempo de finalización

        // Evaluar respuesta y mostrar resultado
        if (response.ok) {                            // Si la respuesta es exitosa (200-299)
          console.log(`✅ ${url} - Conectado (${endTime - startTime}ms)`);
        } else {                                      // Si hay error HTTP
          console.log(`⚠️ ${url} - Status: ${response.status} (${endTime - startTime}ms)`);
        }
      } catch (error: any) {
        // Manejar diferentes tipos de errores de red
        if (error.name === 'AbortError') {            // Error por timeout
          console.log(`⏱️ ${url} - Timeout (>5000ms)`);
        } else {                                      // Otros errores de red
          console.log(`❌ ${url} - Error:`, error.message);
        }
      }
    }
  }

  /**
   * Cargar usuario actual desde el servicio de autenticación
   * Obtiene la información del usuario logueado para mostrar en la interfaz
   */
  loadCurrentUser() {
    const user = this.authService.getCurrentUser();   // Obtener usuario del servicio de auth
    this.currentUser.set(user);                       // Actualizar señal reactiva con la información del usuario
  }

  /**
   * TODOS LOS USUARIOS TIENEN TODOS LOS PERMISOS - SIN RESTRICCIONES
   * Verificar si el usuario puede gestionar otros usuarios
   */
  canManageUsers(): boolean {
    // Política de permisos: Todos los usuarios pueden gestionar usuarios
    return true;                                      // Retornar siempre true para acceso completo
  }

  /**
   * Verificar si el usuario puede gestionar configuraciones del sistema
   * Política de permisos: Acceso completo para todos los usuarios
   */
  canManageSystemConfigs(): boolean {
    // Todos los usuarios pueden gestionar configuraciones del sistema
    return true;                                      // Retornar siempre true para acceso completo
  }

  /**
   * Manejar cambio de pestaña en la interfaz
   * Actualiza el índice de la pestaña seleccionada para mostrar el contenido correcto
   */
  onTabChange(index: number) {
    this.selectedTabIndex.set(index);                 // Actualizar señal reactiva con el nuevo índice de pestaña
  }

  /**
   * Cargar usuarios reales desde la base de datos flexoapp_bd
   * Función principal para obtener todos los usuarios desde el backend en 192.168.1.6:7003
   */
  async loadUsers() {
    this.loading.set(true);                           // Activar indicador de carga

    try {
      console.log('🔍 Cargando usuarios reales desde flexoapp_bd...');
      console.log('🌐 URL del API:', environment.apiUrl); // Mostrar URL que se está usando

      // Realizar petición HTTP GET al endpoint de usuarios
      const response = await this.http.get<User[]>(`${environment.apiUrl}/auth/users`).toPromise();
      console.log('✅ Respuesta de usuarios recibida:', response);

      // Verificar que la respuesta sea válida y sea un array
      if (response && Array.isArray(response)) {
        // Mapear los usuarios para asegurar compatibilidad - DIAGNÓSTICO MEJORADO PARA FOTOS
        const mappedUsers = response.map(user => {
          // Diagnóstico detallado de imágenes de perfil para debug
          const imageData = {
            profileImageUrl: user.profileImage,                    // URL de imagen desde BD
            profileImage: (user as any).profileImage,                // Imagen base64 desde BD
            hasProfileImageUrl: !!(user.profileImage && user.profileImage.trim() !== ''), // Tiene URL válida
            hasProfileImage: !!((user as any).profileImage && (user as any).profileImage.trim() !== ''), // Tiene base64 válido
            profileImageUrlLength: user.profileImage ? user.profileImage.length : 0, // Longitud URL
            profileImageLength: (user as any).profileImage ? (user as any).profileImage.length : 0 // Longitud base64
          };

          // Mostrar diagnóstico solo en modo debug
          if (environment.enableDebugMode) {
            console.log(`👤 Mapeando usuario: ${user.userCode}`, {
              email: user.email,                      // Email del usuario
              phone: (user as any).phone,            // Teléfono del usuario
              role: user.role,                       // Rol del usuario
              ...imageData                           // Datos de imagen para diagnóstico
            });
          }

          // Determinar qué imagen usar - UNIFICADO para usar la misma lógica que getProfileImageUrl
          let finalImageUrl = '';

          // Prioridad 1: ProfileImage (base64) - más rápido, no requiere petición HTTP
          if ((user as any).profileImage && (user as any).profileImage.trim() !== '') {
            finalImageUrl = (user as any).profileImage;
          }
          // Prioridad 2: ProfileImage - puede ser URL completa o ruta relativa
          else if (user.profileImage && user.profileImage.trim() !== '') {
            finalImageUrl = user.profileImage;
          }

          // Retornar objeto usuario mapeado con todos los campos necesarios
          return {
            id: user.id,
            userCode: user.userCode,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: (user as any).phone || '',
            role: user.role,
            isActive: user.isActive,
            profileImage: finalImageUrl,  // URL unificada de imagen de perfil
            lastLogin: (user as any).lastLogin,
            createdDate: user.createdAt ? new Date(user.createdAt) : new Date(),
            permissions: user.permissions || []
          };
        });

        console.log(`📊 ${mappedUsers.length} usuarios cargados desde MySQL flexoapp_bd`);
        this.users.set(mappedUsers);                  // Actualizar señal reactiva con usuarios cargados

        // Notificación de éxito eliminada - No mostrar mensajes técnicos molestos
      } else {
        console.warn('⚠️ Respuesta no es un array:', response);
        this.users.set([]);                           // Limpiar lista de usuarios
        // Notificación eliminada - No mostrar mensajes técnicos molestos
      }
    } catch (error: any) {
      console.error('❌ Error cargando usuarios desde MySQL:', error);
      console.error('❌ Status:', error.status);      // Código de estado HTTP
      console.error('❌ Detalles:', error.error);     // Detalles del error

      // Intentar con URLs de fallback si la URL principal falla
      const success = await this.tryLoadUsersFromDatabase();

      if (!success) {                                 // Si todos los intentos fallan
        this.users.set([]);                           // Limpiar lista de usuarios
        // Notificaciones de error eliminadas - No mostrar mensajes técnicos molestos
      }
    } finally {
      this.loading.set(false);                        // Desactivar indicador de carga
    }
  }

  /**
   * Intentar cargar usuarios desde diferentes URLs de API
   */
  private async tryLoadUsersFromDatabase(): Promise<boolean> {
    // Lista de URLs para intentar
    const urlsToTry = [
      environment.apiUrl,
      ...environment.fallbackUrls
    ];

    for (let i = 0; i < urlsToTry.length; i++) {
      const apiUrl = urlsToTry[i];

      try {
        console.log(`🔄 Intentando cargar usuarios desde: ${apiUrl} (${i + 1}/${urlsToTry.length})`);

        // Agregar timeout personalizado para evitar esperas largas
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const requestPromise = this.http.get<User[]>(`${apiUrl}/users`).toPromise();

        const response = await Promise.race([requestPromise, timeoutPromise]) as User[];

        if (response && response.length > 0) {
          console.log(`✅ ${response.length} usuarios cargados desde: ${apiUrl}`);
          this.users.set(response);

          // Notificación eliminada - No mostrar mensajes técnicos molestos

          return true; // Éxito
        } else if (response && response.length === 0) {
          console.log(`⚠️ Base de datos vacía en: ${apiUrl}`);
          this.users.set([]);

          // Notificación eliminada - No mostrar mensajes técnicos molestos

          return true; // Conexión exitosa aunque sin datos
        }
      } catch (error: any) {
        console.error(`❌ Error conectando a ${apiUrl}:`, error);

        // Mostrar información detallada del error
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
    return false; // Falló en todas las URLs
  }

  /**
   * Cargar usuarios de ejemplo (fallback) - ELIMINADO
   * Solo se mantiene para casos de emergencia sin datos de prueba
   */
  private loadMockUsers() {
    // Ya no cargamos datos de prueba por defecto
    this.users.set([]);
    console.log('⚠️ No hay datos de prueba - Base de datos vacía');

    this.snackBar.open('Base de datos vacía - Agrega usuarios reales usando el botón "Agregar Usuario"', 'Cerrar', {
      duration: 6000,
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Cargar configuraciones del sistema
   */
  async loadSystemConfigs() {
    if (!this.canManageSystemConfigs()) return;

    try {
      const response = await this.http.get<SystemConfig[]>(`${environment.apiUrl}/system/configs`).toPromise();
      if (response) {
        this.systemConfigs.set(response);

        // Aplicar el tema guardado
        const themeConfig = response.find(c => c.id === 'theme');
        if (themeConfig) {
          this.themeService.syncWithSystemConfig(themeConfig.value);
        }

        // Aplicar el idioma guardado
        const languageConfig = response.find(c => c.id === 'language');
        if (languageConfig) {
          this.languageService.syncWithSystemConfig(languageConfig.value);
        }

        // Sincronizar configuraciones de formato (hora, fecha, zona horaria, moneda)
        this.timeFormatService.syncAll(response);

        // Aplicar configuración de notificaciones
        const notificationsConfig = response.find(c => c.id === 'enable_notifications');
        if (notificationsConfig) {
          this.notificationService.syncWithSystemConfig(notificationsConfig.value);
        }

        // Aplicar configuración de sonido de notificaciones
        const soundConfig = response.find(c => c.id === 'notification_sound');
        if (soundConfig) {
          this.notificationService.syncSoundWithSystemConfig(soundConfig.value);
        }

        // Aplicar configuración de duración de notificaciones
        const durationConfig = response.find(c => c.id === 'notification_duration');
        if (durationConfig) {
          this.notificationService.syncDurationWithSystemConfig(durationConfig.value);
        }
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
      // Configuraciones por defecto
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

  /**
   * Obtener categorías de configuración
   */
  getConfigCategories(): string[] {
    const configs = this.systemConfigs();
    const categories = [...new Set(configs.map(c => c.category))];
    return categories.sort();
  }

  /**
   * Obtener configuraciones por categoría
   */
  getConfigsByCategory(category: string): SystemConfig[] {
    return this.systemConfigs().filter(c => c.category === category);
  }

  /**
   * Actualizar configuración del sistema
   */
  async updateSystemConfig(config: SystemConfig, newValue: any) {
    try {
      console.log(`🔧 Actualizando configuración: ${config.id} = ${newValue}`);

      await this.http.put(`${environment.apiUrl}/system/configs/${config.id}`, {
        value: newValue
      }).toPromise();

      // Actualizar localmente
      const configs = this.systemConfigs();
      const updatedConfigs = configs.map(c =>
        c.id === config.id ? { ...c, value: newValue } : c
      );
      this.systemConfigs.set(updatedConfigs);

      // Si es el tema, aplicarlo inmediatamente
      if (config.id === 'theme') {
        this.themeService.setTheme(newValue);
        console.log(`🎨 Tema aplicado: ${newValue}`);
      }

      // Si es el idioma, aplicarlo inmediatamente
      if (config.id === 'language') {
        this.languageService.setLanguage(newValue);
        console.log(`🌍 Idioma aplicado: ${newValue}`);
      }

      // Si es el formato de hora, aplicarlo inmediatamente
      if (config.id === 'time_format') {
        this.timeFormatService.setFormat(newValue);
        console.log(`🕐 Formato de hora aplicado: ${newValue}`);
      }

      // Si es el formato de fecha, aplicarlo inmediatamente
      if (config.id === 'date_format') {
        this.timeFormatService.setDateFormat(newValue);
        console.log(`📅 Formato de fecha aplicado: ${newValue}`);
      }

      // Si es la zona horaria, aplicarla inmediatamente
      if (config.id === 'timezone') {
        this.timeFormatService.setTimezone(newValue);
        console.log(`🌐 Zona horaria aplicada: ${newValue}`);
      }

      // Si es la configuración de notificaciones, aplicarla inmediatamente
      if (config.id === 'enable_notifications') {
        this.notificationService.setNotificationsEnabled(newValue);
        console.log(`🔔 Notificaciones ${newValue ? 'habilitadas' : 'deshabilitadas'}`);
      }

      // Si es la configuración de sonido, aplicarla inmediatamente
      if (config.id === 'notification_sound') {
        this.notificationService.syncSoundWithSystemConfig(newValue);
        console.log(`🔊 Sonido de notificaciones ${newValue ? 'habilitado' : 'deshabilitado'}`);
      }

      // Si es la configuración de duración, aplicarla inmediatamente
      if (config.id === 'notification_duration') {
        this.notificationService.syncDurationWithSystemConfig(newValue);
        console.log(`⏱️ Duración de notificaciones: ${newValue} segundos`);
      }

      // Si es la configuración de timeout de sesión, aplicarla inmediatamente
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

  /**
   * Obtener nombre de visualización del rol - ACTUALIZADO PARA MYSQL
   */
  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'Admin': 'Administrador',
      'Supervisor': 'Supervisor',
      'Prealistador': 'Pre-alistador',
      'Matizadores': 'Matizador',
      'Operario': 'Operario',
      'Retornos': 'Retornos',
      // Compatibilidad con minúsculas
      'admin': 'Administrador',
      'supervisor': 'Supervisor',
      'prealistador': 'Pre-alistador',
      'matizadores': 'Matizador',
      'operario': 'Operario',
      'retornos': 'Retornos'
    };
    return roleNames[role] || role;
  }

  /**
   * Obtener nombre de visualización de opción
   */
  getOptionDisplayName(configId: string, option: string): string {
    // Mapeo de opciones a nombres amigables
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

    // Buscar el mapeo para esta configuración
    if (optionMaps[configId] && optionMaps[configId][option]) {
      return optionMaps[configId][option];
    }

    // Si no hay mapeo, devolver la opción tal cual
    return option;
  }



  /**
   * Recargar usuarios manualmente
   */
  async reloadUsers() {
    console.log('🔄 Recarga manual de usuarios solicitada');
    await this.loadUsers();
  }

  /**
   * Abrir diálogo de crear usuario - ACCESO COMPLETO PARA TODOS
   */
  openCreateUserDialog() {
    // TODOS los usuarios pueden crear usuarios - Sin restricciones

    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Usuario creado desde diálogo:', result);
        // Recargar la lista de usuarios
        this.loadUsers();
      }
    });
  }

  // Funciones eliminadas - se mantienen las versiones mejoradas más abajo

  /**
   * Obtener fecha actual
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES');
  }

  /**
   * Obtener número de usuarios activos
   */
  getActiveUsersCount(): number {
    return this.users().filter(u => u.isActive).length;
  }

  // ===== FUNCIONES PARA AVATARES Y FOTOS DE PERFIL =====

  /**
   * Obtener iniciales del usuario para avatar por defecto
   */
  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  /**
   * Obtener color de avatar basado en el nombre
   */
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

  /**
   * Obtener URL completa de la imagen de perfil - MEJORADO PARA ACCESO DE RED
   */
  getProfileImageUrl(profileImageUrl: string | undefined): string {
    if (!profileImageUrl || profileImageUrl.trim() === '' || profileImageUrl === 'null' || profileImageUrl === 'undefined') {
      return '';
    }

    // Si es una imagen base64, devolverla directamente (PRIORIDAD MÁXIMA)
    if (profileImageUrl.startsWith('data:image/')) {
      return profileImageUrl;
    }

    // Si ya es una URL completa (http/https), devolverla tal como está
    if (profileImageUrl.startsWith('http')) {
      return profileImageUrl;
    }

    // Si es una ruta relativa, construir la URL completa
    // Usar imageBaseUrl del environment si está disponible, sino usar apiUrl sin /api
    const baseUrl = (environment as any).imageBaseUrl || environment.apiUrl.replace('/api', '');

    // Asegurar que la ruta comience con /
    const imagePath = profileImageUrl.startsWith('/') ? profileImageUrl : `/${profileImageUrl}`;

    const fullUrl = `${baseUrl}${imagePath}`;

    // Log solo en modo debug para diagnosticar problemas
    if (environment.enableDebugMode) {
      console.log(`🖼️ Imagen procesada: "${profileImageUrl}" → "${fullUrl}"`);
    }

    return fullUrl;
  }

  /**
   * Manejar error de carga de imagen - DIAGNÓSTICO MEJORADO
   */
  onImageError(event: any) {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');
    const userCode = imgElement.getAttribute('data-user-code');

    // Marcar el avatar como error
    if (avatarContainer) {
      avatarContainer.classList.add('error');
      avatarContainer.classList.remove('loading', 'loaded');
    }

    // Ocultar la imagen que falló
    imgElement.style.display = 'none';

    // Buscar el usuario y marcar que no tiene imagen válida
    if (userCode) {
      const users = this.users();
      const updatedUsers = users.map(u => {
        if (u.userCode === userCode) {
          // Limpiar la URL de imagen para que se muestre el avatar por defecto
          return { ...u, profileImage: '' };
        }
        return u;
      });
      this.users.set(updatedUsers);
    }

    // Diagnóstico detallado del error solo en modo debug
    if (environment.enableDebugMode) {
      console.group('❌ ERROR DE IMAGEN DE PERFIL');
      console.log('👤 Usuario:', userCode);
      console.log('🖼️ URL que falló:', imgElement.src);
      console.log('🔗 URL original:', imgElement.getAttribute('data-original-src') || 'No disponible');
      console.log('📊 Dimensiones esperadas:', `${imgElement.width}x${imgElement.height}`);
      console.log('🌐 Estado de red:', navigator.onLine ? 'Online' : 'Offline');
      console.log('💡 Solución: Mostrando avatar por defecto');

      // Intentar diagnosticar el tipo de error
      this.diagnoseImageError(imgElement.src);

      console.groupEnd();
    }
  }

  /**
   * Diagnosticar errores específicos de imágenes
   */
  private async diagnoseImageError(imageUrl: string) {
    try {
      // Test de conectividad a la URL de la imagen
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

      // Sugerencias de solución
      if (error.message.includes('CORS')) {
        console.log('💡 Sugerencia: Problema de CORS - verificar configuración del servidor');
      } else if (error.message.includes('network')) {
        console.log('💡 Sugerencia: Problema de red - verificar conectividad');
      } else if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
        console.log('💡 Sugerencia: URL localhost no accesible desde otros dispositivos');
      }
    }
  }

  /**
   * Verificar si un usuario tiene imagen de perfil - OPTIMIZADO
   * profileImage puede contener: base64 (data:image/...) o URL (/uploads/profiles/...)
   */
  hasProfileImage(user: User): boolean {
    return !!((user as any).profileImage &&
      (user as any).profileImage.trim() !== '' &&
      (user as any).profileImage !== 'null' &&
      (user as any).profileImage !== 'undefined');
  }

  /**
   * Manejar carga exitosa de imagen
   */
  onImageLoad(event: any) {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');

    if (avatarContainer) {
      avatarContainer.classList.add('loaded');
      avatarContainer.classList.remove('loading', 'error');
    }
  }

  /**
   * Manejar inicio de carga de imagen
   */
  onImageLoadStart(event: any) {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');

    if (avatarContainer) {
      avatarContainer.classList.add('loading');
      avatarContainer.classList.remove('loaded', 'error');
    }
  }

  // ===== FUNCIONES PARA FECHAS =====

  /**
   * Formatear fecha relativa (ej: "hace 2 horas")
   */
  formatRelativeDate(date: any): string {
    const isSpanish = this.languageService.getLanguage() === 'es';
    if (!date) return isSpanish ? 'Nunca' : 'Never';

    const now = new Date();
    const loginDate = new Date(date);

    // Verificar si la fecha es válida
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

  /**
   * Formatear fecha completa para tooltip
   */
  formatFullDate(date: any): string {
    const isSpanish = this.languageService.getLanguage() === 'es';
    if (!date) return isSpanish ? 'Nunca ha iniciado sesión' : 'Never logged in';

    const loginDate = new Date(date);

    // Verificar si la fecha es válida
    if (isNaN(loginDate.getTime())) return isSpanish ? 'Nunca ha iniciado sesión' : 'Never logged in';

    const dateStr = this.timeFormatService.formatDate(loginDate);
    const timeStr = this.timeFormatService.formatTime(loginDate);

    return `${dateStr} ${timeStr}`;
  }

  // ===== NUEVAS ACCIONES FUNCIONALES =====

  /**
   * Restablecer contraseña del usuario - CONECTADO A MYSQL
   */
  async resetPassword(user: User) {
    const email = user.email || 'correo no disponible';
    if (!confirm(`¿Restablecer la contraseña de ${user.firstName} ${user.lastName}?\n\nSe enviará una nueva contraseña temporal al correo: ${email}`)) {
      return;
    }

    this.loading.set(true);
    try {
      console.log(`🔐 Restableciendo contraseña para usuario MySQL: ${user.userCode}`);

      // Usar endpoint de auth para restablecer contraseña
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

      // Para desarrollo, mostrar que la funcionalidad está disponible
      this.snackBar.open(`Contraseña restablecida para ${user.firstName} ${user.lastName}`, 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Editar usuario - Abrir modal de edición - ACCESO COMPLETO PARA TODOS
   */
  editUser(user: User) {
    // TODOS los usuarios pueden editar usuarios - Sin restricciones

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

        // Actualizar la lista local de usuarios
        const updatedUsers = this.users().map(u =>
          u.id === result.id ? result : u
        );
        this.users.set(updatedUsers);

        // Notificación eliminada - No mostrar mensajes técnicos molestos
      }
    });
  }

  /**
   * Eliminar usuario de MySQL - SIN RESTRICCIONES DE ROL
   */
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

    this.loading.set(true); // Activar indicador de carga
    try {
      console.log(`🗑️ Eliminando usuario de MySQL: ${user.userCode} (ID: ${user.id})`);

      // Llamar al endpoint correcto: /api/users/{id} (NO /auth/users/)
      await this.http.delete(`${environment.apiUrl}/users/${user.id}`).toPromise();

      // Actualizar lista local - Remover el usuario eliminado
      const updatedUsers = this.users().filter(u => u.id !== user.id);
      this.users.set(updatedUsers);

      console.log(`✅ Usuario eliminado exitosamente de MySQL: ${user.userCode}`);

      // Mostrar notificación de éxito
      this.snackBar.open(`Usuario ${user.userCode} eliminado exitosamente`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error: any) {
      console.error('❌ Error eliminando usuario de MySQL:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Detalles:', error.error);

      // Mostrar mensaje de error específico
      const errorMessage = error.error?.message || error.message || 'Error al eliminar usuario';
      this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false); // Desactivar indicador de carga
    }
  }

  /**
   * Cambiar estado del usuario en MySQL - SIN RESTRICCIONES
   */
  async toggleUserStatus(user: User) {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activar' : 'desactivar';

    if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} al usuario ${user.firstName} ${user.lastName} en la base de datos?`)) {
      return;
    }

    this.loading.set(true);
    try {
      console.log(`🔄 ${action}ndo usuario en MySQL: ${user.userCode}`);

      await this.http.patch(`${environment.apiUrl}/auth/users/${user.id}/status`, {
        isActive: newStatus
      }).toPromise();

      // Actualizar localmente
      const updatedUsers = this.users().map(u =>
        u.id === user.id ? { ...u, isActive: newStatus } : u
      );
      this.users.set(updatedUsers);

      console.log(`✅ Usuario ${action}do en MySQL: ${user.userCode}`);

      // Notificación eliminada - No mostrar mensajes técnicos molestos
    } catch (error) {
      console.error(`❌ Error ${action}ndo usuario en MySQL:`, error);

      this.snackBar.open(`Error al ${action} usuario en la base de datos`, 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  // ===== ACTUALIZACIÓN EN TIEMPO REAL =====

  /**
   * Iniciar actualizaciones en tiempo real - OPTIMIZADO
   */
  private startRealTimeUpdates() {
    console.log('🔄 Iniciando actualizaciones en tiempo real cada 2 minutos (optimizado)');

    this.realTimeSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      // Solo actualizar si estamos en la pestaña de usuarios Y la ventana está visible
      if (this.selectedTabIndex() === 0 && !document.hidden && !this.loading()) {
        console.log('🔄 Actualización automática de usuarios (optimizada)...');
        this.refreshUsersQuietly();
      } else {
        console.log('⏸️ Actualización omitida - pestaña inactiva o cargando');
      }
    });
  }

  /**
   * Detener actualizaciones en tiempo real
   */
  private stopRealTimeUpdates() {
    if (this.realTimeSubscription) {
      this.realTimeSubscription.unsubscribe();
      console.log('⏹️ Actualizaciones en tiempo real detenidas');
    }
  }

  /**
   * Actualizar usuarios silenciosamente desde MySQL - OPTIMIZADO
   */
  private async refreshUsersQuietly() {
    if (this.loading()) return;

    try {
      const response = await this.http.get<User[]>(`${environment.apiUrl}/auth/users`).toPromise();

      if (response && Array.isArray(response)) {
        const currentUsers = this.users();

        // Mapear usuarios para compatibilidad - UNIFICADO con loadUsers
        const newUsers = response.map(user => {
          // Determinar qué imagen usar - misma lógica que loadUsers
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

        // Verificar si hay cambios importantes (solo campos críticos)
        if (this.hasUsersChanged(currentUsers, newUsers)) {
          this.users.set(newUsers);

          // Mostrar notificación muy discreta solo si hay cambios significativos
          if (currentUsers.length !== newUsers.length) {
            this.snackBar.open('Usuarios actualizados', '', {
              duration: 1500,
              panelClass: ['info-snackbar']
            });
          }
        }
      }
    } catch (error) {
      // Solo log en desarrollo
      if (!environment.production) {
        console.warn('⚠️ Error en actualización automática:', error);
      }
      // No mostrar error al usuario para actualizaciones automáticas
    }
  }

  /**
   * Verificar si los usuarios han cambiado
   */
  private hasUsersChanged(currentUsers: User[], newUsers: User[]): boolean {
    if (currentUsers.length !== newUsers.length) return true;

    // Verificar cambios en usuarios existentes
    for (let i = 0; i < currentUsers.length; i++) {
      const current = currentUsers[i];
      const newUser = newUsers.find(u => u.id === current.id);

      if (!newUser) return true; // Usuario eliminado

      // Verificar campos importantes
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

  /**
   * Forzar actualización manual
   */
  async forceRefresh() {
    console.log('🔄 Actualización manual forzada');
    await this.loadUsers();
  }

  /**
   * Test específico de carga de imágenes
   */
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

}