import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

// Angular Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { AuthService, LoginRequest } from '../../core/services/auth.service';
import { NetworkDiagnosticService, NetworkInfo, DiagnosticResults } from '../../core/services/network-diagnostic.service';
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
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');
  showNetworkDiagnostic = signal(false);
  isDiagnosing = signal(false);
  diagnosticResults = signal<DiagnosticResults | null>(null);
  networkInfo = signal<NetworkInfo | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private networkDiagnosticService: NetworkDiagnosticService
  ) {
    this.loginForm = this.fb.group({
      userCode: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Cargar información de red
    this.networkInfo.set(this.networkDiagnosticService.getNetworkInfo());
    
    // Si ya está logueado, redirigir
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
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
          finalize(() => this.isLoading.set(false))
        )
        .subscribe({
          next: (response) => {
            console.log('📥 Respuesta del servidor:', response);
            // Si tenemos token y user, el login fue exitoso
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
            
            if (error.status === 401) {
              errorMsg = 'Usuario o contraseña incorrectos';
            } else if (error.status === 0) {
              errorMsg = 'No se puede conectar al servidor';
            } else if (error.status === 404) {
              errorMsg = 'Endpoint de login no encontrado';
            } else if (error.error?.message) {
              errorMsg = error.error.message;
            }
            
            this.errorMessage.set(errorMsg);
          }
        });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  fillTestCredentials(): void {
    this.loginForm.patchValue({
      userCode: 'admin',
      password: 'admin123'
    });
    this.errorMessage.set('');
  }

  toggleNetworkDiagnostic(): void {
    this.showNetworkDiagnostic.set(!this.showNetworkDiagnostic());
    
    // Auto-ejecutar diagnóstico al abrir
    if (this.showNetworkDiagnostic() && !this.diagnosticResults()) {
      this.runNetworkDiagnostic();
    }
  }

  runNetworkDiagnostic(): void {
    this.isDiagnosing.set(true);
    
    this.networkDiagnosticService.runDiagnostic()
      .pipe(
        finalize(() => this.isDiagnosing.set(false))
      )
      .subscribe({
        next: (results) => {
          this.diagnosticResults.set(results);
          console.log('🔍 Diagnóstico completado:', results);
        },
        error: (error) => {
          console.error('❌ Error en diagnóstico:', error);
          this.diagnosticResults.set({
            connectivityResults: [],
            networkInfo: this.networkInfo()!
          });
        }
      });
  }

  testLoginWithUrl(url: string): void {
    if (!this.loginForm.valid) {
      this.errorMessage.set('Por favor completa los campos de usuario y contraseña');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    
    const credentials = {
      userCode: this.loginForm.value.userCode,
      password: this.loginForm.value.password
    };

    this.networkDiagnosticService.testLoginWithUrl(url, credentials)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Login exitoso con URL:', url, response);
          // Actualizar el environment temporalmente
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('❌ Error en login con URL:', url, error);
          this.errorMessage.set(`Error probando con ${url}: ${error.message || 'Conexión fallida'}`);
        }
      });
  }

  hasWorkingServer(): boolean {
    const results = this.diagnosticResults();
    return results?.connectivityResults?.some(r => r.status === 'success') || false;
  }

  hasRespondingServers(): boolean {
    const results = this.diagnosticResults();
    return results?.connectivityResults?.some(r => r.error === '404' || r.error === '404') || false;
  }
}