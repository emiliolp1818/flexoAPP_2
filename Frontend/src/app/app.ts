import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { filter } from 'rxjs/operators';
import { NetworkStabilityService } from './core/services/network-stability.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <app-header *ngIf="!isLoginPage"></app-header>
    <router-outlet></router-outlet>
  `,
  })
export class AppComponent implements OnInit {
  title = 'FlexoAPP';
  isLoginPage = false;

  constructor(
    private router: Router,
    private networkService: NetworkStabilityService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isLoginPage = event.url === '/login';
      });

    // Inicializar monitoreo de red
    console.log('🌐 Inicializando servicios de estabilidad de red...');
    this.networkService.networkStatus$.subscribe(status => {
      if (status.isOnline) {
        console.log('✅ Red disponible:', status.apiUrl, `(${status.responseTime}ms)`);
      } else {
        console.warn('❌ Red no disponible. Intentos fallidos:', status.failedAttempts);
      }
    });
  }
}