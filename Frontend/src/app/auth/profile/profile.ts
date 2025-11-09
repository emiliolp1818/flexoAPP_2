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
      email: ['', [Validators.email]]                // Email (opcional pero con validación de formato)
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
   */
  onUpdateProfile() {
    if (this.profileForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading.set(true);

    // Simular actualización
    setTimeout(() => {
      const formValue = this.profileForm.value;
      const updatedUser: User = {
        ...this.currentUser()!,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        phone: formValue.phone,
        email: formValue.email
      };

      this.currentUser.set(updatedUser);
      
      // Registrar actividad
      const changedFields = [];
      if (formValue.firstName !== this.currentUser()?.firstName) changedFields.push('nombre');
      if (formValue.lastName !== this.currentUser()?.lastName) changedFields.push('apellidos');
      if (formValue.phone !== this.currentUser()?.phone) changedFields.push('teléfono');
      if (formValue.email !== this.currentUser()?.email) changedFields.push('email');
      
      this.registerActivity(
        'Actualización de perfil',
        `Información personal actualizada - Campos: ${changedFields.join(', ')}`,
        'PROFILE',
        'ProfileComponent',
        { changedFields, timestamp: new Date() }
      );
      
      this.loading.set(false);

      this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 1000);
  }

  /**
   * Cambiar contraseña
   */
  onChangePassword() {
    if (this.passwordForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.passwordForm.value;
    
    // Validar contraseña actual (simulado)
    if (formValue.currentPassword !== 'admin123') {
      this.snackBar.open('La contraseña actual es incorrecta', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading.set(true);

    // Simular llamada al backend para cambiar contraseña
    setTimeout(() => {
      // Registrar actividad de cambio de contraseña
      this.registerActivity('Cambio de contraseña', 'Contraseña actualizada exitosamente', 'SECURITY');
      
      this.passwordForm.reset();
      this.loading.set(false);

      this.snackBar.open('Contraseña cambiada correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 2000);
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
   */
  uploadPhoto() {
    if (!this.selectedFile) return;

    this.uploadingPhoto.set(true);

    // Simular subida
    setTimeout(() => {
      const fileSize = this.selectedFile ? this.selectedFile.size : 0;
      
      const updatedUser: User = {
        ...this.currentUser()!,
        profileImage: this.profileImagePreview()
      };

      this.currentUser.set(updatedUser);
      
      // Registrar actividad antes de limpiar selectedFile
      this.registerActivity(
        'Actualización de foto de perfil',
        'Imagen de perfil actualizada exitosamente',
        'PROFILE',
        'ProfileComponent',
        { action: 'upload', fileSize }
      );
      
      this.selectedFile = null;
      this.profileImagePreview.set('');
      this.uploadingPhoto.set(false);

      this.snackBar.open('Foto de perfil actualizada', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 2000);
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
   */
  removePhoto() {
    this.uploadingPhoto.set(true);

    setTimeout(() => {
      const updatedUser: User = {
        ...this.currentUser()!,
        profileImage: undefined
      };

      this.currentUser.set(updatedUser);
      this.uploadingPhoto.set(false);

      // Registrar actividad
      this.registerActivity(
        'Eliminación de foto de perfil',
        'Imagen de perfil eliminada por el usuario',
        'PROFILE',
        'ProfileComponent',
        { action: 'delete' }
      );

      this.snackBar.open('Foto de perfil eliminada', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 1000);
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
  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    
    return timestamp.toLocaleDateString();
  }

  /**
   * Obtener texto de días restantes
   */
  getDaysRemainingText(days: number): string {
    if (days === 0) return 'Expirado';
    if (days === 1) return '1 día restante';
    return `${days} días restantes`;
  }

  /**
   * Cerrar sesión
   */
  logout() {
    this.authService.logout();
  }
}