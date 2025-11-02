import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService, User } from '../../core/services/auth.service';

interface UserAction {
  id: string;
  userId: string;
  userCode: string;
  action: string;
  description: string;
  module: string;
  component: string;
  timestamp: Date;
  expiryDate: Date;
  daysRemaining: number;
  isExpiringSoon: boolean;
  metadata?: any;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {
  // Señales para el estado del componente
  currentUser = signal<User | null>(null);
  loading = signal<boolean>(false);
  uploadingPhoto = signal<boolean>(false);
  profileImagePreview = signal<string>('');
  userActions = signal<UserAction[]>([]);


  // Señales para visibilidad de contraseñas
  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  // Formularios reactivos
  profileForm: FormGroup;
  passwordForm: FormGroup;

  // Archivo seleccionado para foto de perfil
  selectedFile: File | null = null;

  // Roles disponibles
  availableRoles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'designer', label: 'Diseñador' },
    { value: 'operator', label: 'Operario' },
    { value: 'viewer', label: 'Visualizador' }
  ];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    // Inicializar formularios
    this.profileForm = this.fb.group({
      userCode: [{value: '', disabled: true}],
      role: [{value: '', disabled: true}],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]], // Ahora requerido
      email: ['', [Validators.email]] // Opcional pero con validación de formato
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserActivity();
    
    // Limpiar actividades expiradas cada hora
    setInterval(() => {
      this.cleanExpiredActivities();
    }, 60 * 60 * 1000); // 1 hora
    
    // Registrar actividad de acceso al perfil
    this.registerActivity(
      'Acceso al perfil',
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
   * Cargar actividad del usuario
   */
  loadUserActivity() {
    this.loading.set(true);
    
    // Simular carga de actividades desde la base de datos
    setTimeout(() => {
      const currentUser = this.currentUser();
      if (!currentUser) return;

      const mockActions: UserAction[] = [
        {
          id: '1',
          userId: currentUser.id,
          userCode: currentUser.userCode,
          action: 'Inicio de sesión',
          description: 'Acceso exitoso al sistema FlexoAPP',
          module: 'AUTH',
          component: 'LoginComponent',
          timestamp: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          daysRemaining: 30,
          isExpiringSoon: false,
          metadata: { ip: '192.168.1.6', browser: 'Chrome' }
        },
        {
          id: '2',
          userId: currentUser.id,
          userCode: currentUser.userCode,
          action: 'Actualización de perfil',
          description: 'Modificación de información personal - Teléfono actualizado',
          module: 'PROFILE',
          component: 'ProfileComponent',
          timestamp: new Date(Date.now() - 86400000), // Ayer
          expiryDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000), // 29 días
          daysRemaining: 29,
          isExpiringSoon: false,
          metadata: { fields: ['phone', 'email'] }
        },
        {
          id: '3',
          userId: currentUser.id,
          userCode: currentUser.userCode,
          action: 'Gestión de máquinas',
          description: 'Acceso al módulo de máquinas flexográficas - Máquina 1 programada',
          module: 'MACHINES',
          component: 'MachinesComponent',
          timestamp: new Date(Date.now() - 172800000), // Hace 2 días
          expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 días
          daysRemaining: 28,
          isExpiringSoon: false,
          metadata: { machineNumber: 1, programs: 5 }
        },
        {
          id: '4',
          userId: currentUser.id,
          userCode: currentUser.userCode,
          action: 'Creación de diseño',
          description: 'Nuevo diseño flexográfico creado - F204567',
          module: 'DESIGN',
          component: 'DesignComponent',
          timestamp: new Date(Date.now() - 259200000), // Hace 3 días
          expiryDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000), // 27 días
          daysRemaining: 27,
          isExpiringSoon: false,
          metadata: { articleF: 'F204567', client: 'ABSORBENTES DE COLOMBIA' }
        },
        {
          id: '5',
          userId: currentUser.id,
          userCode: currentUser.userCode,
          action: 'Consulta de reportes',
          description: 'Generación de reporte de producción mensual',
          module: 'REPORTS',
          component: 'ReportsComponent',
          timestamp: new Date(Date.now() - 432000000), // Hace 5 días
          expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 días
          daysRemaining: 25,
          isExpiringSoon: false,
          metadata: { reportType: 'production', period: 'monthly' }
        }
      ];
      
      this.userActions.set(mockActions);
      this.loading.set(false);
    }, 1000);
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
   * Verificar si tiene imagen de perfil
   */
  hasProfileImage(): boolean {
    const user = this.currentUser();
    return !!(user?.profileImage);
  }

  /**
   * Obtener imagen de perfil del usuario
   */
  getUserProfileImage(): string {
    const user = this.currentUser();
    return user?.profileImage || '';
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