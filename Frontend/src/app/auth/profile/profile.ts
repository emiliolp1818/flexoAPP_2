/* ===== IMPORTS DEL FRAMEWORK ANGULAR ===== */
// Funcionalidades básicas del framework Angular para componentes
import { Component, signal, OnInit } from '@angular/core';   // Component: decorador para definir componentes
                                                             // signal: sistema reactivo de Angular para estado
                                                             // OnInit: interfaz para hook de inicialización
import { CommonModule } from '@angular/common';              // Directivas comunes (ngIf, ngFor, ngClass, pipes básicos)

/* ===== IMPORTS DE ANGULAR MATERIAL ===== */
// Componentes de interfaz de usuario con Material Design
import { MatButtonModule } from '@angular/material/button';  // Botones con estilos Material Design (mat-button, mat-raised-button)
import { MatIconModule } from '@angular/material/icon';      // Iconos de Material Design (mat-icon)
import { MatCardModule } from '@angular/material/card';      // Tarjetas contenedoras con elevación (mat-card)
import { MatFormFieldModule } from '@angular/material/form-field'; // Contenedores para campos de formulario (mat-form-field)
import { MatInputModule } from '@angular/material/input';    // Campos de entrada de texto (matInput)
import { MatSelectModule } from '@angular/material/select';  // Selectores desplegables (mat-select)
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; // Notificaciones tipo toast (MatSnackBar service)
import { MatTabsModule } from '@angular/material/tabs';      // Sistema de pestañas para organizar contenido (mat-tab-group)
import { MatChipsModule } from '@angular/material/chips';    // Chips para mostrar etiquetas y estados (mat-chip)
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Spinners de carga (mat-spinner)
import { MatTooltipModule } from '@angular/material/tooltip'; // Tooltips informativos (matTooltip directive)

/* ===== IMPORTS DE FORMULARIOS REACTIVOS ===== */
// Sistema de formularios reactivos de Angular para validación y manejo de datos
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// FormBuilder: servicio para construir formularios reactivos
// FormGroup: clase para agrupar controles de formulario
// Validators: validadores predefinidos (required, email, minLength, etc.)
// ReactiveFormsModule: módulo para formularios reactivos
// FormsModule: módulo para formularios basados en templates

/* ===== IMPORTS DE SERVICIOS DE LA APLICACIÓN ===== */
// Servicios personalizados para lógica de negocio
import { AuthService, User } from '../../core/services/auth.service'; // AuthService: servicio de autenticación
                                                                       // User: interfaz/modelo de usuario

/* ===== IMPORTS DE CONFIGURACIÓN DE ENTORNO ===== */
// Configuración de entorno para URLs, flags de debug y variables globales
import { environment } from '../../../environments/environment'; // Variables de entorno (apiUrl, enableDebugMode, etc.)

/* ===== INTERFAZ PARA ACTIVIDADES DEL USUARIO ===== */
// Define la estructura de datos para cada actividad registrada en el sistema
interface UserAction {
  id: string;                                        // Identificador único de la acción (UUID o timestamp)
  userId: string;                                    // ID del usuario que realizó la acción (FK a tabla users)
  userCode: string;                                  // Código del usuario para referencia rápida (ej: "admin", "user001")
  action: string;                                    // Nombre descriptivo de la acción realizada (ej: "Inicio de sesión")
  description: string;                               // Descripción detallada de la acción para auditoría
  module: string;                                    // Módulo del sistema donde se realizó la acción (AUTH, PROFILE, MACHINES, etc.)
  component: string;                                 // Componente específico que registró la acción (ej: "LoginComponent")
  timestamp: Date;                                   // Fecha y hora exacta cuando se realizó la acción
  expiryDate: Date;                                  // Fecha de expiración del registro (para limpieza automática de logs)
  daysRemaining: number;                             // Días restantes antes de que expire el registro (calculado)
  isExpiringSoon: boolean;                           // Flag para indicar si el registro expira pronto (< 7 días)
  metadata?: any;                                    // Datos adicionales específicos de la acción (IP, browser, etc.) - opcional
}

/* ===== DECORADOR DEL COMPONENTE DE PERFIL ===== */
// Define los metadatos del componente Angular para el perfil de usuario
@Component({
  selector: 'app-profile',                           // Selector CSS para usar el componente en templates (<app-profile></app-profile>)
  standalone: true,                                  // Componente independiente (no requiere declaración en NgModule)
  imports: [                                         // Módulos importados que el componente necesita para funcionar
    CommonModule,                                    // Directivas básicas de Angular (ngIf, ngFor, ngClass, pipes básicos)
    MatButtonModule,                                 // Botones de Material Design (mat-button, mat-raised-button, mat-stroked-button)
    MatIconModule,                                   // Iconos de Material Design (mat-icon con iconos de Google Material Icons)
    MatCardModule,                                   // Tarjetas contenedoras con elevación (mat-card, mat-card-content)
    MatFormFieldModule,                              // Contenedores para campos de formulario (mat-form-field, mat-label)
    MatInputModule,                                  // Campos de entrada de texto (matInput directive)
    MatSelectModule,                                 // Selectores desplegables (mat-select, mat-option)
    MatSnackBarModule,                               // Notificaciones tipo toast (MatSnackBar service)
    MatTabsModule,                                   // Sistema de pestañas (mat-tab-group, mat-tab)
    MatChipsModule,                                  // Chips para etiquetas y estados (mat-chip, mat-chip-set)
    MatProgressSpinnerModule,                        // Spinners de carga (mat-spinner, mat-progress-spinner)
    MatTooltipModule,                                // Tooltips informativos (matTooltip directive)
    ReactiveFormsModule,                             // Formularios reactivos de Angular (formGroup, formControlName)
    FormsModule                                      // Formularios basados en templates (ngModel, template-driven forms)
  ],
  templateUrl: './profile.html',                     // Ruta relativa al archivo de template HTML del componente
  styleUrls: ['./profile.scss']                     // Array de rutas a archivos de estilos SCSS específicos del componente
})

/* ===== CLASE PRINCIPAL DEL COMPONENTE DE PERFIL ===== */
// Implementa OnInit para ejecutar lógica de inicialización cuando el componente se carga
export class ProfileComponent implements OnInit {
  
  /* ===== SEÑALES REACTIVAS (ANGULAR SIGNALS) ===== */
  // Sistema reactivo de Angular para manejo de estado que se actualiza automáticamente en el template
  currentUser = signal<User | null>(null);          // Usuario actualmente autenticado obtenido del AuthService
  loading = signal<boolean>(false);                 // Estado de carga global para mostrar spinners durante operaciones
  uploadingPhoto = signal<boolean>(false);          // Estado específico para carga de fotos de perfil
  profileImagePreview = signal<string>('');         // URL de preview de imagen seleccionada antes de guardar
  userActions = signal<UserAction[]>([]);           // Lista de actividades/acciones del usuario para historial

  /* ===== SEÑALES PARA VISIBILIDAD DE CONTRASEÑAS ===== */
  // Control de mostrar/ocultar contraseñas en los campos de input tipo password
  showCurrentPassword = signal<boolean>(false);     // Visibilidad de contraseña actual (toggle show/hide)
  showNewPassword = signal<boolean>(false);         // Visibilidad de nueva contraseña (toggle show/hide)
  showConfirmPassword = signal<boolean>(false);     // Visibilidad de confirmación de contraseña (toggle show/hide)

  /* ===== FORMULARIOS REACTIVOS ===== */
  // FormGroup para manejo de formularios con validaciones y estado reactivo
  profileForm: FormGroup;                           // Formulario para editar información personal del usuario
  passwordForm: FormGroup;                          // Formulario para cambio de contraseña con validaciones

  /* ===== MANEJO DE ARCHIVOS ===== */
  // Variables para gestión de carga de archivos de imagen
  selectedFile: File | null = null;                 // Archivo de imagen seleccionado por el usuario desde el input file

  /* ===== CONFIGURACIÓN DE ROLES DEL SISTEMA ===== */
  // Roles disponibles en el sistema FlexoApp con sus etiquetas descriptivas
  availableRoles = [
    { value: 'admin', label: 'Administrador' },      // Acceso completo: gestión de usuarios, configuración, reportes
    { value: 'operator', label: 'Operario' },        // Operación de máquinas flexográficas y control de producción
    { value: 'viewer', label: 'Visualizador' }       // Solo lectura: consulta de información sin permisos de edición
  ];

  /* ===== CONSTRUCTOR CON INYECCIÓN DE DEPENDENCIAS ===== */
  // Constructor que recibe servicios necesarios mediante inyección de dependencias de Angular
  constructor(
    private authService: AuthService,                // Servicio de autenticación para gestión de usuarios y sesiones
    private snackBar: MatSnackBar,                   // Servicio de Material Design para mostrar notificaciones toast
    private fb: FormBuilder                          // Constructor de formularios reactivos de Angular
  ) {
    /* ===== INICIALIZACIÓN DEL FORMULARIO DE PERFIL ===== */
    // Crear formulario reactivo para información personal con validaciones
    this.profileForm = this.fb.group({
      userCode: [{value: '', disabled: true}],       // Código de usuario (solo lectura, no editable)
      role: [{value: '', disabled: true}],           // Rol del usuario (solo lectura, no editable)
      firstName: ['', [Validators.required]],        // Nombre (requerido)
      lastName: ['', [Validators.required]],         // Apellidos (requerido)
      phone: ['', [Validators.required]],            // Teléfono (requerido para contacto)
      email: ['']                                    // Email (opcional sin validación estricta)
    });

    /* ===== INICIALIZACIÓN DEL FORMULARIO DE CONTRASEÑA ===== */
    // Crear formulario reactivo para cambio de contraseña con validaciones personalizadas
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],  // Contraseña actual (requerida para verificación)
      newPassword: ['', [Validators.required, Validators.minLength(6)]], // Nueva contraseña (mínimo 6 caracteres)
      confirmPassword: ['', [Validators.required]]   // Confirmación de nueva contraseña (requerida)
    }, { validators: this.passwordMatchValidator }); // Validador personalizado para verificar que las contraseñas coincidan
  }

  /* ===== HOOK DE INICIALIZACIÓN DEL COMPONENTE ===== */
  // Método que se ejecuta automáticamente cuando el componente se inicializa
  ngOnInit() {
    this.loadUserProfile();                         // Cargar información del perfil del usuario actual
    this.loadUserActivity();                        // Cargar historial de actividades del usuario
    
    /* ===== CONFIGURACIÓN DE LIMPIEZA AUTOMÁTICA ===== */
    // Configurar limpieza automática de actividades expiradas cada hora
    setInterval(() => {
      this.cleanExpiredActivities();                // Eliminar actividades que han expirado
    }, 60 * 60 * 1000);                            // Intervalo de 1 hora (60 minutos * 60 segundos * 1000 ms)
    
    /* ===== REGISTRO DE ACTIVIDAD DE ACCESO ===== */
    // Registrar que el usuario accedió a su perfil para auditoría
    this.registerActivity(
      'Acceso al perfil',                          // Nombre de la acción
      'Usuario accedió a la página de perfil personal',
      'PROFILE',
      'ProfileComponent'
    );
  }

  /**
   * Validador personalizado para confirmar contraseña
   */
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  /**
   * Cargar perfil del usuario actual
   */
  loadUserProfile() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser.set(user);
      this.profileForm.patchValue({
        userCode: user.userCode || '',
        role: user.role || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }



  /**
   * Cargar actividad del usuario desde el servidor
   * En producción, esto consultará la API real de actividades
   */
  loadUserActivity() {
    this.loading.set(true);
    
    // TODO: Implementar llamada real a la API de actividades
    // this.activityService.getUserActivities(currentUser.id).subscribe(...)
    
    // Por ahora, inicializar con array vacío hasta implementar la API
    setTimeout(() => {
      this.userActions.set([]);
      this.loading.set(false);
      
      // Registrar que se accedió a la sección de actividades
      this.registerActivity(
        'Consulta de actividades',
        'Usuario consultó su historial de actividades',
        'PROFILE',
        'ProfileComponent'
      );
    }, 500);
  }

  /**
   * Refrescar actividades
   */
  refreshActivities() {
    this.loadUserActivity();
  }

  /**
   * Registrar nueva actividad
   */
  registerActivity(action: string, description: string, module: string, component: string = 'ProfileComponent', metadata?: any) {
    const currentUser = this.currentUser();
    if (!currentUser) return;

    const newActivity: UserAction = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userCode: currentUser.userCode,
      action,
      description,
      module,
      component,
      timestamp: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      daysRemaining: 30,
      isExpiringSoon: false,
      metadata
    };

    // Agregar a la lista actual
    const currentActions = this.userActions();
    const updatedActions = [newActivity, ...currentActions];
    this.userActions.set(updatedActions);
    


    // Simular guardado en base de datos
    this.saveActivityToDatabase(newActivity);
  }

  /**
   * Guardar actividad en base de datos (simulado)
   */
  private saveActivityToDatabase(activity: UserAction) {
    // Simular llamada al backend para guardar en base de datos
    console.log('💾 Guardando actividad en base de datos:', activity);
    
    // En implementación real, sería algo como:
    // this.http.post('/api/activities', activity).subscribe();
  }

  /**
   * Limpiar actividades expiradas (ejecutar automáticamente)
   */
  private cleanExpiredActivities() {
    const currentActions = this.userActions();
    const validActions = currentActions.filter(action => {
      const now = new Date();
      return action.expiryDate > now;
    });
    
    this.userActions.set(validActions);
  }

  /**
   * Actualizar perfil
   * Guarda los cambios del perfil en la base de datos a través del AuthService
   */
  onUpdateProfile() {
    // Validar que el formulario sea válido antes de enviar
    if (this.profileForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Obtener el usuario actual
    const currentUser = this.currentUser();
    if (!currentUser) {
      this.snackBar.open('Error: No se encontró el usuario actual', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Activar indicador de carga
    this.loading.set(true);

    // Obtener los valores del formulario
    const formValue = this.profileForm.value;
    
    // Identificar campos que cambiaron para el registro de actividad
    const changedFields: string[] = [];
    if (formValue.firstName !== currentUser.firstName) changedFields.push('nombre');
    if (formValue.lastName !== currentUser.lastName) changedFields.push('apellidos');
    if (formValue.phone !== currentUser.phone) changedFields.push('teléfono');
    if (formValue.email !== currentUser.email) changedFields.push('email');

    // Preparar datos para actualizar (solo los campos editables)
    const updateData: Partial<User> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone,
      email: formValue.email
    };

    // Llamar al servicio de autenticación para actualizar en la base de datos
    this.authService.updateUserProfile(currentUser.id, updateData).subscribe({
      next: (updatedUser) => {
        // Actualizar el usuario en el componente
        this.currentUser.set(updatedUser);
        
        // Registrar actividad de actualización
        this.registerActivity(
          'Actualización de perfil',
          `Información personal actualizada - Campos: ${changedFields.join(', ')}`,
          'PROFILE',
          'ProfileComponent',
          { changedFields, timestamp: new Date() }
        );
        
        // Desactivar indicador de carga
        this.loading.set(false);

        // Mostrar mensaje de éxito
        this.snackBar.open('Perfil actualizado correctamente en la base de datos', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        // Desactivar indicador de carga
        this.loading.set(false);

        // Mostrar mensaje de error específico
        const errorMessage = error.error?.message || error.message || 'Error al actualizar el perfil';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });

        console.error('Error actualizando perfil:', error);
      }
    });
  }

  /**
   * Cambiar contraseña
   * Valida y envía la solicitud de cambio de contraseña al backend
   */
  onChangePassword() {
    // Validar que el formulario sea válido
    if (this.passwordForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Obtener el usuario actual
    const currentUser = this.currentUser();
    if (!currentUser) {
      this.snackBar.open('Error: No se encontró el usuario actual', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Obtener los valores del formulario
    const formValue = this.passwordForm.value;
    
    // Validar que las contraseñas nuevas coincidan (ya validado por passwordMatchValidator)
    if (formValue.newPassword !== formValue.confirmPassword) {
      this.snackBar.open('Las contraseñas nuevas no coinciden', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Activar indicador de carga
    this.loading.set(true);

    // Llamar al servicio de autenticación para cambiar la contraseña en la base de datos
    this.authService.changePassword(
      currentUser.id, 
      formValue.currentPassword, 
      formValue.newPassword
    ).subscribe({
      next: (response) => {
        // Registrar actividad de cambio de contraseña exitoso
        this.registerActivity(
          'Cambio de contraseña', 
          'Contraseña actualizada exitosamente en la base de datos', 
          'SECURITY',
          'ProfileComponent',
          { timestamp: new Date() }
        );
        
        // Limpiar el formulario
        this.passwordForm.reset();
        
        // Resetear visibilidad de contraseñas
        this.showCurrentPassword.set(false);
        this.showNewPassword.set(false);
        this.showConfirmPassword.set(false);
        
        // Desactivar indicador de carga
        this.loading.set(false);

        // Mostrar mensaje de éxito
        this.snackBar.open('Contraseña cambiada correctamente en la base de datos', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        // Desactivar indicador de carga
        this.loading.set(false);

        // Manejar diferentes tipos de errores
        let errorMessage = 'Error al cambiar la contraseña';
        
        if (error.status === 401 || error.status === 403) {
          errorMessage = 'La contraseña actual es incorrecta';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Mostrar mensaje de error
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });

        console.error('Error cambiando contraseña:', error);
      }
    });
  }

  /**
   * Obtener iniciales del usuario
   */
  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  /**
   * Alternar visibilidad de contraseña actual
   */
  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword.set(!this.showCurrentPassword());
  }

  /**
   * Alternar visibilidad de nueva contraseña
   */
  toggleNewPasswordVisibility() {
    this.showNewPassword.set(!this.showNewPassword());
  }

  /**
   * Alternar visibilidad de confirmar contraseña
   */
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  /**
   * Obtener URL completa de la imagen de perfil - MISMO CÓDIGO QUE CONFIGURACIONES
   * Maneja diferentes tipos de URLs: completas (http/https), base64 (data:image/), y rutas relativas
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
    if (environment.enableDebugMode) {
      console.log(`🖼️ Perfil - Imagen procesada: "${profileImageUrl}" → "${fullUrl}"`);
    }
    
    return fullUrl;
  }

  /**
   * Verificar si un usuario tiene imagen de perfil - MISMO CÓDIGO QUE CONFIGURACIONES
   * Valida que la URL de imagen sea válida y no esté vacía
   */
  hasProfileImage(): boolean {
    const user = this.currentUser();
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
   * Obtener imagen de perfil del usuario
   * Utiliza el método getProfileImageUrl para procesar correctamente la URL
   */
  getUserProfileImage(): string {
    const user = this.currentUser();
    if (!user) return '';
    
    // Priorizar profileImageUrl sobre profileImage para consistencia con configuraciones
    const imageUrl = user.profileImageUrl || user.profileImage || '';
    return this.getProfileImageUrl(imageUrl);
  }

  /**
   * Manejar error de carga de imagen
   * Se ejecuta cuando falla la carga de una imagen de perfil
   */
  onImageError(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    const avatarContainer = imgElement.closest('.user-avatar, .user-avatar-large, .menu-avatar-container');
    
    // Marcar el avatar como error y remover estados de carga
    if (avatarContainer) {
      avatarContainer.classList.add('error');
      avatarContainer.classList.remove('loading', 'loaded');
    }
    
    // Ocultar elemento img que falló
    imgElement.style.display = 'none';
    
    // Diagnóstico detallado del error solo en modo debug
    if (environment.enableDebugMode) {
      console.group('❌ ERROR DE IMAGEN DE PERFIL');
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
   * Diagnosticar errores específicos de imágenes
   * Ayuda a identificar problemas de conectividad, CORS, etc.
   */
  private async diagnoseImageError(imageUrl: string) {
    try {
      // Test de conectividad a la URL de la imagen usando HEAD request
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        mode: 'no-cors' // Evita problemas de CORS, solo obtiene el contenido no headers
      });
      
      console.log('   - Status:', response.status);
      console.log('   - Type:', response.type);
      console.log('   - Headers disponibles:', response.headers ? 'Sí' : 'No');
      
    } catch (error: any) {
      console.log('🔍 Diagnóstico de error:', error.name);
      console.log('   - Mensaje:', error.message);
      
      // Sugerencias de solución basadas en el tipo de error
      if (error.name.includes('TypeError')) {
        console.log('💡 Sugerencia: Verificar conectividad');
      } else if (error.message.includes('CORS')) {
        console.log('💡 Sugerencia: Problema de CORS - verificar configuración del servidor');
      } else {
        console.log('💡 Sugerencia: Verificar permisos de archivos');
      }
    }
  }

  /**
   * Manejar carga exitosa de imagen
   * Se ejecuta cuando una imagen se carga correctamente
   */
  onImageLoad(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    const avatarContainer = imgElement.closest('.user-avatar, .user-avatar-large, .menu-avatar-container');
    
    // Marcar el avatar como cargado exitosamente
    if (avatarContainer) {
      avatarContainer.classList.add('loaded');
      avatarContainer.classList.remove('loading', 'error'); // Remover estados previos
    }
  }

  /**
   * Manejar inicio de carga de imagen
   * Se ejecuta cuando una imagen comienza a cargarse
   */
  onImageLoadStart(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    const avatarContainer = imgElement.closest('.user-avatar, .user-avatar-large, .menu-avatar-container');
    
    // Marcar el avatar como en proceso de carga
    if (avatarContainer) {
      avatarContainer.classList.add('loading');
      avatarContainer.classList.remove('loaded', 'error'); // Remover estados previos
    }
  }

  /**
   * Activar input de archivo
   */
  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  /**
   * Manejar selección de archivo
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Solo se permiten archivos de imagen', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.snackBar.open('La imagen no debe superar los 2MB', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.selectedFile = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Subir foto de perfil
   * Envía la imagen al servidor y actualiza el perfil del usuario
   */
  uploadPhoto() {
    // Validar que haya un archivo seleccionado
    if (!this.selectedFile) return;

    // Obtener el usuario actual
    const currentUser = this.currentUser();
    if (!currentUser) {
      this.snackBar.open('Error: No se encontró el usuario actual', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Activar indicador de carga
    this.uploadingPhoto.set(true);

    // Guardar el tamaño del archivo para el registro de actividad
    const fileSize = this.selectedFile.size;

    // Llamar al servicio de autenticación para subir la imagen
    this.authService.updateUserProfileImage(currentUser.id, this.selectedFile).subscribe({
      next: (updatedUser) => {
        // Actualizar el usuario en el componente
        this.currentUser.set(updatedUser);
        
        // Registrar actividad de actualización de foto
        this.registerActivity(
          'Actualización de foto de perfil',
          'Imagen de perfil actualizada exitosamente en la base de datos',
          'PROFILE',
          'ProfileComponent',
          { action: 'upload', fileSize }
        );
        
        // Limpiar el archivo seleccionado y el preview
        this.selectedFile = null;
        this.profileImagePreview.set('');
        
        // Desactivar indicador de carga
        this.uploadingPhoto.set(false);

        // Mostrar mensaje de éxito
        this.snackBar.open('Foto de perfil actualizada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        // Desactivar indicador de carga
        this.uploadingPhoto.set(false);

        // Mostrar mensaje de error específico
        const errorMessage = error.error?.message || error.message || 'Error al subir la foto de perfil';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });

        console.error('Error subiendo foto de perfil:', error);
      }
    });
  }

  /**
   * Cancelar subida de foto
   */
  cancelPhotoUpload() {
    this.selectedFile = null;
    this.profileImagePreview.set('');
  }

  /**
   * Eliminar foto de perfil
   * Elimina la imagen del servidor y actualiza el perfil del usuario
   */
  removePhoto() {
    // Obtener el usuario actual
    const currentUser = this.currentUser();
    if (!currentUser) {
      this.snackBar.open('Error: No se encontró el usuario actual', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Activar indicador de carga
    this.uploadingPhoto.set(true);

    // Llamar al servicio de autenticación para eliminar la imagen
    this.authService.deleteUserProfileImage(currentUser.id).subscribe({
      next: (updatedUser) => {
        // Actualizar el usuario en el componente
        this.currentUser.set(updatedUser);
        
        // Desactivar indicador de carga
        this.uploadingPhoto.set(false);

        // Registrar actividad de eliminación de foto
        this.registerActivity(
          'Eliminación de foto de perfil',
          'Imagen de perfil eliminada por el usuario de la base de datos',
          'PROFILE',
          'ProfileComponent',
          { action: 'delete' }
        );

        // Mostrar mensaje de éxito
        this.snackBar.open('Foto de perfil eliminada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        // Desactivar indicador de carga
        this.uploadingPhoto.set(false);

        // Mostrar mensaje de error específico
        const errorMessage = error.error?.message || error.message || 'Error al eliminar la foto de perfil';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });

        console.error('Error eliminando foto de perfil:', error);
      }
    });
  }

  /**
   * Obtener nombre completo del usuario
   */
  getFullName(): string {
    const user = this.currentUser();
    if (!user) return 'Usuario';
    
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userCode || 'Usuario';
  }

  /**
   * Obtener nombre de rol para mostrar
   */
  getRoleDisplayName(role: string): string {
    const roleObj = this.availableRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role || 'Sin rol';
  }

  /**
   * Manejar cambio de pestaña
   */
  onTabChange(index: number) {
    if (index === 2) { // Pestaña de actividad
      this.loadUserActivity();
    }
  }

  /**
   * Obtener icono para el tipo de acción
   */
  getActionIcon(module: string): string {
    const icons: { [key: string]: string } = {
      'AUTH': 'login',
      'PROFILE': 'person',
      'MACHINES': 'precision_manufacturing',
      'DESIGN': 'design_services',
      'REPORTS': 'assessment',
      'SETTINGS': 'settings'
    };
    return icons[module] || 'info';
  }

  /**
   * Formatear timestamp
   */
  /**
   * Formatear timestamp a texto legible
   * Convierte una fecha en un texto amigable como "Hoy", "Ayer", "Hace X días" o fecha completa
   * @param timestamp - Fecha a formatear
   * @returns Texto formateado de la fecha
   */
  formatTimestamp(timestamp: Date): string {
    // Obtener la fecha y hora actual para calcular la diferencia
    const now = new Date();
    
    // Calcular la diferencia en milisegundos entre ahora y el timestamp
    const diff = now.getTime() - timestamp.getTime();
    
    // Convertir la diferencia de milisegundos a días completos
    // 1000 ms * 60 seg * 60 min * 24 horas = milisegundos en un día
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Si la diferencia es 0 días, mostrar "Hoy"
    if (days === 0) return 'Hoy';
    
    // Si la diferencia es 1 día, mostrar "Ayer"
    if (days === 1) return 'Ayer';
    
    // Si la diferencia es menos de 7 días, mostrar "Hace X días"
    if (days < 7) return `Hace ${days} días`;
    
    // Para fechas más antiguas, mostrar la fecha completa en formato local
    // Ejemplo: "11/11/2025" según la configuración regional del navegador
    return timestamp.toLocaleDateString();
  }

  /**
   * Obtener texto descriptivo de días restantes
   * Convierte un número de días en un texto descriptivo para mostrar al usuario
   * @param days - Número de días restantes
   * @returns Texto descriptivo de los días restantes
   */
  getDaysRemainingText(days: number): string {
    // Si no quedan días, el registro ha expirado
    if (days === 0) return 'Expirado';
    
    // Si queda exactamente 1 día, usar singular
    if (days === 1) return '1 día restante';
    
    // Para cualquier otro número de días, usar plural
    // Ejemplo: "5 días restantes", "30 días restantes"
    return `${days} días restantes`;
  }

  /**
   * Cerrar sesión del usuario
   * Llama al servicio de autenticación para cerrar la sesión actual
   * Esto limpiará el token, los datos del usuario y redirigirá al login
   */
  logout() {
    // Llamar al método logout del servicio de autenticación
    // Este método se encarga de:
    // 1. Limpiar el token del localStorage
    // 2. Limpiar los datos del usuario en memoria
    // 3. Redirigir a la página de login
    this.authService.logout();
  }
}