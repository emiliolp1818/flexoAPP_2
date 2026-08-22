
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
import { resolveProfileImageUrl } from '../../../core/utils/api-url.util';
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
    const firstName = (user.firstName || '').split(' ')[0];
    const lastName = (user.lastName || '').split(' ')[0];
    return `${firstName} ${lastName}`.trim() || user.userCode;
  }


  userFirstName(): string {
    const user = this.currentUser();
    if (!user) return 'Usuario';
    return user.firstName || user.userCode || 'Usuario';
  }

  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'Admin': 'Administrador',
      'Operario': 'Operario',
      'Matizadores': 'Matizador',
      'Supervisor': 'Supervisor',
      'Prealistador': 'Prealistador',
      'Retornos': 'Retorno'
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
    if (hour >= 18 && hour < 21) return 'wb_twilight';
    if (hour >= 21 || hour < 5) return 'nights_stay';
    return 'wb_twilight'; // 5-6 AM madrugada
  }

  getTimeBasedGreeting(): string {
    const hour = this.currentTime().getHours();
    const isSpanish = this.languageService.getLanguage() === 'es';

    if (hour >= 5 && hour < 12) return isSpanish ? 'Buenos días' : 'Good morning';
    if (hour >= 12 && hour < 18) return isSpanish ? 'Buenas tardes' : 'Good afternoon';
    if (hour >= 18 && hour < 21) return isSpanish ? 'Buenas noches' : 'Good evening';
    if (hour >= 21 || hour < 2) return isSpanish ? 'Buenas noches' : 'Good evening';
    return isSpanish ? 'Buenos días, madrugador' : 'Early bird, good morning';
  }

  getTimeBasedMessage(): string {
    const hour = this.currentTime().getHours();
    const isSpanish = this.languageService.getLanguage() === 'es';

    if (hour >= 2 && hour < 5) return isSpanish ? '¡Vaya madrugada! Eres imparable' : 'What an early start! Unstoppable';
    if (hour >= 5 && hour < 7) return isSpanish ? 'Arrancando temprano, ¡buen ritmo!' : 'Starting early, great pace!';
    if (hour >= 7 && hour < 9) return isSpanish ? 'Que tengas un excelente inicio de día' : 'Have a great start to your day';
    if (hour >= 9 && hour < 12) return isSpanish ? 'Esperamos que tengas una mañana productiva' : 'We hope you have a productive morning';
    if (hour >= 12 && hour < 14) return isSpanish ? 'Es hora de almorzar, ¡disfruta tu descanso!' : 'It\'s lunchtime, enjoy your break!';
    if (hour >= 14 && hour < 18) return isSpanish ? 'Que tengas una tarde exitosa' : 'Have a successful afternoon';
    if (hour >= 18 && hour < 20) return isSpanish ? 'Cerrando la jornada con todo' : 'Finishing the day strong';
    if (hour >= 20 && hour < 22) return isSpanish ? 'Turno nocturno en marcha, ¡dale con todo!' : 'Night shift rolling, keep it up!';
    if (hour >= 22) return isSpanish ? 'La noche es joven, ¡seguimos produciendo!' : 'The night is young, still going strong!';
    return isSpanish ? 'Trabajando duro a esta hora, ¡gran esfuerzo!' : 'Working hard at this hour, great effort!';
  }


  getProfileImageUrl(profileImageUrl: string | undefined): string {
    return resolveProfileImageUrl(profileImageUrl);
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
  }


  onImageLoad(event: any): void {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');
    if (avatarContainer) {
      avatarContainer.classList.add('loaded');
      avatarContainer.classList.remove('loading', 'error');
    }
  }

  onImageLoadStart(event: any): void {
    const imgElement = event.target;
    const avatarContainer = imgElement.closest('.user-avatar');
    if (avatarContainer) {
      avatarContainer.classList.add('loading');
      avatarContainer.classList.remove('loaded', 'error');
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