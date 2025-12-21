import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { SessionTimeoutService } from './core/services/session-timeout.service';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <app-header *ngIf="!isLoginPage"></app-header>
    <router-outlet></router-outlet>
  `,
  })
export class AppComponent implements OnInit, OnDestroy {
  title = 'FlexoAPP';
  isLoginPage = false;

  private router = inject(Router);
  private sessionTimeoutService = inject(SessionTimeoutService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isLoginPage = event.url === '/login';
        
        // Iniciar monitoreo de sesión si el usuario está logueado y no está en login
        if (!this.isLoginPage && this.authService.isLoggedIn()) {
          this.sessionTimeoutService.startMonitoring();
        } else {
          this.sessionTimeoutService.stopMonitoring();
        }
      });

    // Iniciar monitoreo si ya está logueado
    if (this.authService.isLoggedIn() && !this.isLoginPage) {
      this.sessionTimeoutService.startMonitoring();
    }

    console.log('🚀 FlexoAPP iniciado correctamente');
  }

  ngOnDestroy() {
    this.sessionTimeoutService.stopMonitoring();
  }
}