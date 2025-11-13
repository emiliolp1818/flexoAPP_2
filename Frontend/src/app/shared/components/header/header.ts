// Angular Core - Funcionalidades básicas del framework Angular
import { Component, signal, OnInit, OnDestroy } from '@angular/core'; // Decoradores y hooks de ciclo de vida
import { CommonModule } from '@angular/common';                      // Directivas comunes (ngIf, ngFor, pipes)
import { RouterModule, Router } from '@angular/router';              // Sistema de navegación y enrutamiento
import { interval, Subscription } from 'rxjs';                      // Observables para actualizaciones automáticas

// Angular Material imports - Componentes de UI con Material Design
import { MatIconModule } from '@angular/material/icon';              // Iconos de Material Design
import { MatButtonModule } from '@angular/material/button';          // Botones con estilos Material Design
import { MatMenuModule } from '@angular/material/menu';              // Menús desplegables contextuales
import { MatDividerModule } from '@angular/material/divider';        // Líneas divisorias para separar contenido

// Services - Servicios de la aplicación para lógica de negocio
import { AuthService } from '../../../core/services/auth.service';   // Servicio de autenticación y gestión de usuarios
import { LoadingService } from '../../../core/services/loading.service'; // Servicio para manejar estados de carga global

// Environment configuration - Configuración de entorno para URLs y flags de debug
import { environment } from '../../../../environments/environment';     // Variables de entorno (URLs del API, flags de debug, etc.)

// Decorador de componente Angular - Define metadatos del componente header
@Component({
  selector: 'app-header',                            // Selector CSS para usar el componente en templates
  standalone: true,                                  // Componente independiente (no requiere NgModule)
  imports: [                                         // Módulos importados para uso en el template
    CommonModule,                                    // Directivas básicas de Angular (ngIf, ngFor, pipes)
    RouterModule,                                    // Funcionalidades de navegación y enrutamiento
    MatIconModule,                                   // Iconos de Material Design
    MatButtonModule,                                 // Botones de Material Design
    MatMenuModule,                                   // Menús desplegables contextuales
    MatDividerModule                                 // Líneas divisorias para separar contenido
  ],
  templateUrl: './header.html',                      // Ruta al archivo de template HTML
  styleUrls: ['./header.scss']                      // Ruta al archivo de estilos SCSS
})
// Clase principal del componente header - Implementa hooks de ciclo de vida
export class HeaderComponent implements OnInit, OnDestroy {
  // Señales reactivas (Angular Signals) - Estado reactivo del componente
  currentUser = signal<any>(null);                            // Usuario actualmente autenticado
  currentTime = signal(new Date());                           // Tiempo actual para mostrar en el header
  isLoading = signal(false);                                  // Estado de carga para activar LED parpadeante
  
  // Suscripciones para limpieza de memoria
  private timeSubscription?: Subscription;                    // Suscripción para actualización de tiempo cada minuto
  private loadingSubscription?: Subscription;                 // Suscripción para estado de carga global

  // Constructor con inyección de dependencias
  constructor(
    private authService: AuthService,                         // Servicio de autenticación para gestión de usuarios
    private router: Router,                                   // Router de Angular para navegación entre páginas
    private loadingService: LoadingService                    // Servicio para manejar estados de carga global
  ) {
    // Inicializar el usuario actual después de la inyección de dependencias
    this.currentUser.set(this.authService.getCurrentUser());
  }

  ngOnInit(): void {
    // Actualizar el tiempo cada minuto
    this.timeSubscription = interval(60000).subscribe(() => {
      this.currentTime.set(new Date());
    });

    // Actualizar usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });

    // Suscribirse al estado de carga global
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading.set(loading);
    });
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
    this.loadingSubscription?.unsubscribe();
  }

  // Navigation methods
  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  onProfile(): void {
    this.router.navigate(['/profile']);
  }

  onLogout(): void {
    this.authService.logout();
  }

  // User display methods
  userDisplayName(): string {
    const user = this.currentUser();
    if (!user) return 'Usuario';
    return `${user.firstName} ${user.lastName}`.trim() || user.userCode;
  }

  // Método para mostrar solo el nombre en el saludo
  userFirstName(): string {
    const user = this.currentUser();
    if (!user) return 'Usuario';
    return user.firstName || user.userCode || 'Usuario';
  }

  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'Admin': 'Administrador',
      'Supervisor': 'Supervisor',
      'Operator': 'Operador',
      'User': 'Usuario'
    };
    return roleMap[role] || role;
  }

  // Time-based methods
  getCurrentTime(): string {
    const now = this.currentTime();
    return now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getTimeIcon(): string {
    const hour = this.currentTime().getHours();
    if (hour >= 6 && hour < 12) return 'wb_sunny';
    if (hour >= 12 && hour < 18) return 'wb_sunny';
    if (hour >= 18 && hour < 22) return 'wb_twilight';
    return 'nights_stay';
  }

  getTimeBasedGreeting(): string {
    const hour = this.currentTime().getHours();
    if (hour >= 6 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getTimeBasedMessage(): string {
    const hour = this.currentTime().getHours();
    if (hour >= 6 && hour < 9) return 'Que tengas un excelente inicio de día';
    if (hour >= 9 && hour < 12) return 'Esperamos que tengas una mañana productiva';
    if (hour >= 12 && hour < 14) return 'Es hora de almorzar, ¡disfruta tu descanso!';
    if (hour >= 14 && hour < 18) return 'Que tengas una tarde exitosa';
    if (hour >= 18 && hour < 22) return 'Que disfrutes tu tarde';
    return 'Que tengas una buena noche';
  }

  /**
   * Obtener URL completa de la imagen de perfil
   * Maneja diferentes tipos de URLs: completas (http/https), base64 (data:image/), y rutas relativas
   * @param profileImageUrl - URL de la imagen de perfil (puede ser undefined)
   * @returns URL procesada o cadena vacía si no es válida
   */
  getProfileImageUrl(profileImageUrl: string | undefined): string {
    // Validar que la URL no esté vacía o sea null/undefined
    if (!profileImageUrl || profileImageUrl.trim() === '' || profileImageUrl === 'null' || profileImageUrl === 'undefined') {
      return '';
    }
    
    // Si ya es una URL completa (http/https), devolverla tal como está
    if (profileImageUrl.startsWith('http')) {
      return profileImageUrl;
    }
    
    // Si es una imagen base64, devolverla directamente
    if (profileImageUrl.startsWith('data:image/')) {
      return profileImageUrl;
    }
    
    // Si es una ruta relativa, construir la URL completa usando imageBaseUrl si está disponible
    const baseUrl = (environment as any).imageBaseUrl || environment.apiUrl.replace('/api', '');
    const imagePath = profileImageUrl.startsWith('/') ? profileImageUrl : `/${profileImageUrl}`;
    
    const fullUrl = `${baseUrl}${imagePath}`;
    
    // Log solo en modo debug para diagnosticar problemas
    if ((environment as any).enableDebugMode) {
      console.log(`🖼️ Header - Imagen procesada: "${profileImageUrl}" → "${fullUrl}"`);
    }
    
    return fullUrl;
  }

  /**
   * Verificar si un usuario tiene imagen de perfil - MISMO CÓDIGO QUE CONFIGURACIONES
   * Valida que la URL de imagen sea válida y no esté vacía
   */
  hasProfileImage(user: any): boolean {
    return !!(user?.profileImageUrl && 
             user.profileImageUrl.trim() !== '' && 
             user.profileImageUrl !== 'null' && 
             user.profileImageUrl !== 'undefined') ||
           !!(user?.profileImage && 
             user.profileImage.trim() !== '' && 
             user.profileImage !== 'null' && 
             user.profileImage !== 'undefined');
  }

  /**
   * Manejar error de carga de imagen - MISMO CÓDIGO QUE CONFIGURACIONES CON DIAGNÓSTICO MEJORADO
   * Se ejecuta cuando falla la carga de una imagen de perfil
   */
  onImageError(event: any): void {
    const imgElement = event.target;                    // Elemento img que falló
    const avatarContainer = imgElement.closest('.user-avatar-container'); // Contenedor del avatar
    
    // Marcar el avatar como error para aplicar estilos CSS apropiados
    if (avatarContainer) {
      avatarContainer.classList.add('error');           // Agregar clase de error
      avatarContainer.classList.remove('loading', 'loaded'); // Remover estados de carga
    }
    
    // Ocultar la imagen que falló para mostrar el ícono por defecto
    imgElement.style.display = 'none';
    
    // Diagnóstico detallado del error solo en modo debug
    if (environment.enableDebugMode) {
      console.group('❌ ERROR DE IMAGEN DE PERFIL EN HEADER');
      console.log('🖼️ URL que falló:', imgElement.src);
      console.log('🔗 URL original:', imgElement.getAttribute('data-original-src') || 'No disponible');
      console.log('📊 Dimensiones esperadas:', `${imgElement.width}x${imgElement.height}`);
      console.log('🌐 Estado de red:', navigator.onLine ? 'Online' : 'Offline');
      
      // Intentar diagnosticar el tipo de error
      this.diagnoseImageError(imgElement.src);
      
      console.groupEnd();
    }
  }

  /**
   * Diagnosticar errores específicos de imágenes - MISMO CÓDIGO QUE CONFIGURACIONES
   * Ayuda a identificar problemas de conectividad, CORS, etc.
   */
  private async diagnoseImageError(imageUrl: string) {
    try {
      // Test de conectividad a la URL de la imagen usando HEAD request
      const response = await fetch(imageUrl, { 
        method: 'HEAD',                               // Solo obtener headers, no el contenido
        mode: 'no-cors'                              // Evitar problemas de CORS en el diagnóstico
      });
      
      console.log('🔍 Diagnóstico de imagen en header:');
      console.log('   - Status:', response.status);
      console.log('   - Type:', response.type);
      console.log('   - Headers disponibles:', response.headers ? 'Sí' : 'No');
      
    } catch (error: any) {
      console.log('🔍 Diagnóstico de imagen en header:');
      console.log('   - Error de red:', error.message);
      console.log('   - Tipo de error:', error.name);
      
      // Sugerencias de solución basadas en el tipo de error
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
   * Manejar carga exitosa de imagen - MISMO CÓDIGO QUE CONFIGURACIONES
   * Se ejecuta cuando una imagen se carga correctamente
   */
  onImageLoad(event: any): void {
    const imgElement = event.target;                    // Elemento img que se cargó exitosamente
    const avatarContainer = imgElement.closest('.user-avatar-container'); // Contenedor del avatar
    
    // Marcar el avatar como cargado exitosamente
    if (avatarContainer) {
      avatarContainer.classList.add('loaded');          // Agregar clase de éxito
      avatarContainer.classList.remove('loading', 'error'); // Remover estados de carga y error
    }
  }

  /**
   * Manejar inicio de carga de imagen - MISMO CÓDIGO QUE CONFIGURACIONES
   * Se ejecuta cuando comienza a cargar una imagen
   */
  onImageLoadStart(event: any): void {
    const imgElement = event.target;                    // Elemento img que está cargando
    const avatarContainer = imgElement.closest('.user-avatar-container'); // Contenedor del avatar
    
    // Marcar el avatar como en proceso de carga
    if (avatarContainer) {
      avatarContainer.classList.add('loading');         // Agregar clase de carga
      avatarContainer.classList.remove('loaded', 'error'); // Remover estados previos
    }
  }

  // Método para simular estado de carga (puedes conectarlo con tus servicios)
  setLoadingState(loading: boolean): void {
    this.isLoading.set(loading);                        // Actualizar señal reactiva de estado de carga
  }
}