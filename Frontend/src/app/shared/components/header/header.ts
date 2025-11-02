import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

// Angular Material imports
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { AuthService } from '../../../core/services/auth.service';

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
  currentUser = signal(this.authService.getCurrentUser());
  currentTime = signal(new Date());
  private timeSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Actualizar el tiempo cada minuto
    this.timeSubscription = interval(60000).subscribe(() => {
      this.currentTime.set(new Date());
    });

    // Actualizar usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
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
}