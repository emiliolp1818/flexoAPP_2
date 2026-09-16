import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { TimeFormatService } from '../../../core/services/time-format.service';

type ButtonState = 'idle' | 'walking' | 'granted' | 'denied';

const REMEMBER_KEY = 'flexoapp_remember_user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');
  buttonState = signal<ButtonState>('idle');

  // Rate limiting
  isBlocked = signal(false);
  blockCountdown = signal(0);
  private blockTimer: any;

  currentTime = signal('');
  currentDate = signal('');
  private clockInterval: any;

  // Panel "Adquirir licencia" con datos de contacto
  showLicenseInfo = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private timeFormatService: TimeFormatService
  ) {
    this.loginForm = this.fb.group({
      userCode: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    this.loadRememberedUser();
    this.initializeClock();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.blockTimer) clearInterval(this.blockTimer);
  }

  private loadRememberedUser(): void {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.userCode) {
          this.loginForm.patchValue({
            userCode: parsed.userCode,
            rememberMe: true
          });
        }
      }
    } catch (e) {
      console.warn('No se pudo leer la preferencia de Recordarme', e);
    }
  }

  private saveRememberedUser(): void {
    try {
      const remember = !!this.loginForm.value.rememberMe;
      const userCode = this.loginForm.value.userCode || '';
      if (remember && userCode) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ userCode }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch (e) {
      console.warn('No se pudo guardar la preferencia de Recordarme', e);
    }
  }

  private initializeClock(): void {

    this.updateClock();


    this.clockInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }


  private updateClock(): void {
    const now = new Date();


    const timeString = this.timeFormatService.formatTime(now);


    const dateString = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    this.currentTime.set(timeString);
    this.currentDate.set(dateString.charAt(0).toUpperCase() + dateString.slice(1));
  }

  private startBlockCountdown(seconds: number): void {
    if (this.blockTimer) clearInterval(this.blockTimer);
    this.isBlocked.set(true);
    this.blockCountdown.set(seconds);

    this.blockTimer = setInterval(() => {
      const remaining = this.blockCountdown() - 1;
      this.blockCountdown.set(remaining);

      if (remaining <= 0) {
        clearInterval(this.blockTimer);
        this.isBlocked.set(false);
        this.blockCountdown.set(0);
        this.errorMessage.set('Puedes intentar nuevamente.');
      } else {
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        this.errorMessage.set(`Usuario bloqueado. Tiempo restante: ${min}:${sec.toString().padStart(2, '0')}`);
      }
    }, 1000);
  }

  onSubmit(): void {
    // No hacer request si está bloqueado
    if (this.isBlocked()) {
      this.errorMessage.set(`Usuario bloqueado. Esperar ${Math.ceil(this.blockCountdown() / 60)} minuto(s) para reintentar.`);
      return;
    }

    if (this.loginForm.valid && !this.isLoading() && this.buttonState() !== 'granted') {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.buttonState.set('walking');

      const credentials: LoginRequest = {
        userCode: this.loginForm.value.userCode,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials)
        .pipe(
          finalize(() => {
            this.isLoading.set(false);
          })
        )
        .subscribe({
          next: (response) => {
            if (response.token && response.user) {
              this.saveRememberedUser();
              this.buttonState.set('granted');

              // Acceso con contraseña TEMPORAL → la sesión es corta (10 min) y el
              // usuario debe cambiar su contraseña de inmediato. Se le lleva al
              // perfil (donde está el cambio de contraseña) con un aviso.
              if (response.mustChangePassword || response.isTemporaryPassword) {
                setTimeout(() => {
                  this.router.navigate(['/profile'], {
                    queryParams: { mustChangePassword: '1', temp: '1' }
                  });
                }, 1400);
              } else {
                setTimeout(() => {
                  this.router.navigate(['/dashboard']);
                }, 1400);
              }
            } else {
              this.errorMessage.set('Error de autenticación: respuesta inválida del servidor');
              this.triggerDenied();
            }
          },
          error: (error) => {
            let errorMsg = 'Error de conexión';
            let errorDetails = '';

            if (error.status === 401) {
              const remaining = error.error?.attemptsRemaining;
              if (remaining !== undefined && remaining > 0) {
                errorMsg = `Contraseña o usuario incorrecto. Quedan ${remaining} intento(s) restantes.`;
              } else {
                errorMsg = 'Contraseña o usuario incorrecto.';
              }
            } else if (error.status === 429) {
              const seconds = error.error?.lockedUntilSeconds || 300;
              this.startBlockCountdown(seconds);
              errorMsg = `Usuario bloqueado. Esperar ${Math.ceil(seconds / 60)} minuto(s) para reintentar.`;
            } else if (error.status === 0) {
              errorMsg = 'No se puede conectar al servidor';
              errorDetails = `El servidor puede estar iniciando. Por favor, intenta nuevamente en unos segundos.`;
            } else if (error.status === 404) {
              errorMsg = 'Servicio de inicio de sesión no disponible';
            } else if (error.status === 504 || error.status === 503) {
              errorMsg = 'El servidor está iniciando';
              errorDetails = 'Por favor, espera 30 segundos e intenta nuevamente.';
            } else if (error.error?.message) {
              errorMsg = error.error.message;
            } else if (error.message) {
              errorMsg = error.message;
            }

            this.errorMessage.set(errorMsg + (errorDetails ? '\n\n' + errorDetails : ''));
            this.triggerDenied();
          }
        });
    }
  }

  private triggerDenied(): void {
    this.buttonState.set('denied');
    setTimeout(() => {
      this.buttonState.set('idle');
    }, 1300);
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('Funcionalidad de recuperación de contraseña próximamente disponible. Contacte al administrador.');
  }

  onAcquireLicense(event: Event): void {
    event.preventDefault();
    this.showLicenseInfo.set(!this.showLicenseInfo());
  }
}

