import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';




import { AuthService, LoginRequest } from '../../core/services/auth.service';
import { TimeFormatService } from '../../core/services/time-format.service';

import { environment } from '../../../environments/environment';

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



  currentTime = signal('');
  currentDate = signal('');
  private clockInterval: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private timeFormatService: TimeFormatService
  ) {
    this.loginForm = this.fb.group({
      userCode: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }


    this.initializeClock();
  }

  ngOnDestroy(): void {

    if (this.clockInterval) {
      clearInterval(this.clockInterval);
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

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const credentials: LoginRequest = {
        userCode: this.loginForm.value.userCode,
        password: this.loginForm.value.password
      };

      console.log('🔄 Intentando login con:', {
        userCode: credentials.userCode,
        apiUrl: environment.apiUrl
      });

      this.authService.login(credentials)
        .pipe(
          finalize(() => {
            this.isLoading.set(false);
          })
        )
        .subscribe({
          next: (response) => {
            console.log('📥 Respuesta del servidor:', response);

            if (response.token && response.user) {
              console.log('✅ Login exitoso:', response.user);
              this.router.navigate(['/dashboard']);
            } else {
              this.errorMessage.set('Error de autenticación: respuesta inválida del servidor');
            }
          },
          error: (error) => {
            console.error('❌ Error completo en login:', {
              status: error.status,
              statusText: error.statusText,
              error: error.error,
              message: error.message,
              url: error.url
            });

            let errorMsg = 'Error de conexión';
            let errorDetails = '';

            if (error.status === 401) {
              errorMsg = 'Usuario o contraseña incorrectos';
            } else if (error.status === 0) {
              errorMsg = 'No se puede conectar al servidor';
              errorDetails = `El servidor puede estar iniciando. Por favor, intenta nuevamente en unos segundos.`;
            } else if (error.status === 404) {
              errorMsg = 'Endpoint de login no encontrado';
              errorDetails = `URL: ${error.url}`;
            } else if (error.status === 504 || error.status === 503) {
              errorMsg = 'El servidor está iniciando';
              errorDetails = 'Por favor, espera 30 segundos e intenta nuevamente.';
            } else if (error.error?.message) {
              errorMsg = error.error.message;
            } else if (error.message) {
              errorMsg = error.message;
            }


            console.error('🔴 ERROR DE LOGIN:', errorMsg);
            if (errorDetails) {
              console.error('📋 Detalles:', errorDetails);
            }


            this.errorMessage.set(errorMsg + (errorDetails ? '\n\n' + errorDetails : ''));
          }
        });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }


}