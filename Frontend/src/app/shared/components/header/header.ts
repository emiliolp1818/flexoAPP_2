
import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';


import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';


import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { TimeFormatService } from '../../../core/services/time-format.service';
import { LanguageService } from '../../../core/services/language.service';


import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})

export class HeaderComponent implements OnInit, OnDestroy {

  currentUser = signal<any>(null);
  currentTime = signal(new Date());
  isLoading = signal(false);


  private timeSubscription?: Subscription;
  private loadingSubscription?: Subscription;


  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    private timeFormatService: TimeFormatService,
    public languageService: LanguageService
  ) {

    this.currentUser.set(this.authService.getCurrentUser());
  }

  ngOnInit(): void {

    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentTime.set(new Date());
    });


    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);


      if (environment.enableDebugMode && user) {
        console.group('🔍 HEADER - Usuario actualizado');
        console.log('👤 Usuario:', user.userCode);
        console.log('📸 profileImage:', (user as any).profileImage ?
          ((user as any).profileImage.substring(0, 50) + '...') : 'No definido');
        console.log('✅ hasProfileImage:', this.hasProfileImage(user));
        if (this.hasProfileImage(user)) {
          console.log('🖼️ URL procesada:', this.getProfileImageUrl((user as any).profileImage || ''));
        }
        console.groupEnd();
      }
    });


    this.loadingService.loading$.subscribe(loading => {
      this.isLoading.set(loading);
    });
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
    this.loadingSubscription?.unsubscribe();
  }


  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  onProfile(): void {
    this.router.navigate(['/profile']);
  }

  onLogout(): void {
    this.authService.logout();
  }


  userDisplayName(): string {
    const user = this.currentUser();
    if (!user) return 'Usuario';
    return `${user.firstName} ${user.lastName}`.trim() || user.userCode;
  }


  userFirstName(): string {
    const user = this.currentUser();
    if (!user) return 'Usuario';
    return user.firstName || user.userCode || 'Usuario';
  }

  getRoleDisplayName(role: string): string {
    const isSpanish = this.languageService.getLanguage() === 'es';
    const roleMap: { [key: string]: string } = {
      'Admin': isSpanish ? 'Administrador' : 'Administrator',
      'Supervisor': isSpanish ? 'Supervisor' : 'Supervisor',
      'Operator': isSpanish ? 'Operador' : 'Operator',
      'User': isSpanish ? 'Usuario' : 'User'
    };
    return roleMap[role] || role;
  }


  getCurrentTime(): string {
    const now = this.currentTime();
    return this.timeFormatService.formatTime(now);
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
    const isSpanish = this.languageService.getLanguage() === 'es';

    if (hour >= 6 && hour < 12) return isSpanish ? 'Buenos días' : 'Good morning';
    if (hour >= 12 && hour < 18) return isSpanish ? 'Buenas tardes' : 'Good afternoon';
    return isSpanish ? 'Buenas noches' : 'Good evening';
  }

  getTimeBasedMessage(): string {
    const hour = this.currentTime().getHours();
    const isSpanish = this.languageService.getLanguage() === 'es';

    if (hour >= 6 && hour < 9) return isSpanish ? 'Que tengas un excelente inicio de día' : 'Have a great start to your day';
    if (hour >= 9 && hour < 12) return isSpanish ? 'Esperamos que tengas una mañana productiva' : 'We hope you have a productive morning';
    if (hour >= 12 && hour < 14) return isSpanish ? 'Es hora de almorzar, ¡disfruta tu descanso!' : 'It\'s lunchtime, enjoy your break!';
    if (hour >= 14 && hour < 18) return isSpanish ? 'Que tengas una tarde exitosa' : 'Have a successful afternoon';
    if (hour >= 18 && hour < 22) return isSpanish ? 'Que disfrutes tu tarde' : 'Enjoy your evening';
    return isSpanish ? 'Que tengas una buena noche' : 'Have a good night';
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
      console.log(`🖼️ Header - Imagen procesada: "${profileImageUrl}" → "${fullUrl}"`);
    }

    return fullUrl;
  }


  hasProfileImage(user: any): boolean {
    return !!(user?.profileImage &&
      user.profileImage.trim() !== '' &&
      user.profileImage !== 'null' &&
      user.profileImage !== 'undefined');
  }


  onImageError(event: any): void {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');
    const userCode = imgElement.getAttribute('data-user-code');


    if (avatarContainer) {
      avatarContainer.classList.add('error');
      avatarContainer.classList.remove('loading', 'loaded');
    }


    imgElement.style.display = 'none';


    if (environment.enableDebugMode) {
      console.group('❌ ERROR DE IMAGEN DE PERFIL EN HEADER');
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


  onImageLoad(event: any): void {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');


    if (avatarContainer) {
      avatarContainer.classList.add('loaded');
      avatarContainer.classList.remove('loading', 'error');
    }


    if (environment.enableDebugMode) {
      console.log('✅ Header - Imagen cargada exitosamente:', imgElement.src);
    }
  }


  onImageLoadStart(event: any): void {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');


    if (avatarContainer) {
      avatarContainer.classList.add('loading');
      avatarContainer.classList.remove('loaded', 'error');
    }


    if (environment.enableDebugMode) {
      console.log('⏳ Header - Iniciando carga de imagen:', imgElement.getAttribute('data-original-src'));
    }
  }


  setLoadingState(loading: boolean): void {
    this.isLoading.set(loading);
  }


  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }


  getAvatarColor(name: string): string {

    const colors = [
      '#2563eb',
      '#7c3aed',
      '#dc2626',
      '#059669',
      '#d97706',
      '#0891b2',
      '#be185d',
      '#4338ca',
      '#16a34a',
      '#ea580c'
    ];


    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }


    return colors[Math.abs(hash) % colors.length];
  }
}