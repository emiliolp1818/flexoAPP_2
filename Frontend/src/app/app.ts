import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { SessionTimeoutService } from './core/services/session-timeout.service';
import { AuthService } from './core/services/auth.service';
import { SignalRService } from './shared/services/signalr.service';
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
  private signalRService = inject(SignalRService);

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isLoginPage = event.url === '/login';


        if (!this.isLoginPage && this.authService.isLoggedIn()) {
          this.sessionTimeoutService.startMonitoring();
        } else {
          this.sessionTimeoutService.stopMonitoring();
        }
      });


    if (this.authService.isLoggedIn() && !this.isLoginPage) {
      this.sessionTimeoutService.startMonitoring();
    }

    // Reconectar SignalR al recargar la página con sesión activa (F5).
    // Sin esto, tras un refresh no llegarían los eventos de cambio en
    // tiempo real que invalidan el caché del dashboard.
    const token = this.authService.getToken();
    if (token && this.authService.isLoggedIn()) {
      void this.signalRService.startConnection(token);
    }

    console.log('🚀 FlexoAPP iniciado correctamente');
  }

  ngOnDestroy() {
    this.sessionTimeoutService.stopMonitoring();
  }
}