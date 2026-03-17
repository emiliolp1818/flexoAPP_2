

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




import { environment } from '../../../environments/environment';



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



  currentUser = signal<User | null>(null);
  loading = signal<boolean>(false);
  uploadingPhoto = signal<boolean>(false);
  profileImagePreview = signal<string>('');
  userActions = signal<UserAction[]>([]);



  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);



  profileForm: FormGroup;
  passwordForm: FormGroup;



  selectedFile: File | null = null;



  availableRoles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'operator', label: 'Operario' },
    { value: 'viewer', label: 'Visualizador' }
  ];



  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {


    this.profileForm = this.fb.group({
      userCode: [{value: '', disabled: true}],
      role: [{value: '', disabled: true}],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['']
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



    setInterval(() => {
      this.cleanExpiredActivities();
    }, 60 * 60 * 1000);



  }


  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }


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




  loadUserActivity() {
    this.loading.set(true);


    this.authService.getUserActivities().subscribe({
      next: (activities: any[]) => {

        const mappedActivities: UserAction[] = activities.map(activity => ({
          id: activity.id.toString(),
          userId: activity.userId.toString(),
          userCode: activity.userCode || '',
          action: activity.action,
          description: activity.description,
          module: activity.module,
          component: 'Backend',
          timestamp: new Date(activity.timestamp),
          expiryDate: new Date(activity.expirationDate),
          daysRemaining: activity.daysRemaining,
          isExpiringSoon: activity.isExpiringSoon,
          metadata: activity.details ? JSON.parse(activity.details) : null
        }));

        this.userActions.set(mappedActivities);
        this.loading.set(false);

        console.log(`✅ ${mappedActivities.length} actividades cargadas desde el servidor`);


      },
      error: (error) => {
        console.error('❌ Error cargando actividades:', error);
        this.userActions.set([]);
        this.loading.set(false);


        this.snackBar.open('Error al cargar el historial de actividades', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }


  refreshActivities() {
    this.loadUserActivity();
  }


  private registerActivity(action: string, description: string, module: string, component: string = 'ProfileComponent', metadata?: any) {



  }


  private cleanExpiredActivities() {
    const currentActions = this.userActions();
    const validActions = currentActions.filter(action => {
      const now = new Date();
      return action.expiryDate > now;
    });

    this.userActions.set(validActions);
  }


  onUpdateProfile() {

    if (this.profileForm.invalid) {
      this.showSnackbar('Por favor completa todos los campos requeridos', 'warning');
      return;
    }


    const currentUser = this.currentUser();
    if (!currentUser) {
      this.showSnackbar('Error: No se encontró el usuario actual', 'error');
      return;
    }


    this.loading.set(true);


    const formValue = this.profileForm.value;


    const changedFields: string[] = [];
    if (formValue.firstName !== currentUser.firstName) changedFields.push('nombre');
    if (formValue.lastName !== currentUser.lastName) changedFields.push('apellidos');
    if (formValue.phone !== currentUser.phone) changedFields.push('teléfono');
    if (formValue.email !== currentUser.email) changedFields.push('email');


    const updateData: Partial<User> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone,
      email: formValue.email
    };


    this.authService.updateUserProfile(currentUser.id, updateData).subscribe({
      next: (updatedUser) => {

        this.currentUser.set(updatedUser);





        this.loading.set(false);

        this.showSnackbar('Perfil actualizado correctamente en la base de datos', 'success');
      },
      error: (error) => {

        this.loading.set(false);


        const errorMessage = error.error?.message || error.message || 'Error al actualizar el perfil';
        this.showSnackbar(`Error: ${errorMessage}`, 'error', 5000);

        console.error('Error actualizando perfil:', error);
      }
    });
  }


  onChangePassword() {

    if (this.passwordForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }


    const currentUser = this.currentUser();
    if (!currentUser) {
      this.snackBar.open('Error: No se encontró el usuario actual', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }


    const formValue = this.passwordForm.value;


    if (formValue.newPassword !== formValue.confirmPassword) {
      this.snackBar.open('Las contraseñas nuevas no coinciden', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }


    this.loading.set(true);


    this.authService.changePassword(
      currentUser.id,
      formValue.currentPassword,
      formValue.newPassword
    ).subscribe({
      next: (response) => {




        this.passwordForm.reset();


        this.showCurrentPassword.set(false);
        this.showNewPassword.set(false);
        this.showConfirmPassword.set(false);


        this.loading.set(false);


        this.snackBar.open('Contraseña cambiada correctamente en la base de datos', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {

        this.loading.set(false);


        let errorMessage = 'Error al cambiar la contraseña';

        if (error.status === 401 || error.status === 403) {
          errorMessage = 'La contraseña actual es incorrecta';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }


        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });

        console.error('Error cambiando contraseña:', error);
      }
    });
  }


  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';

    const firstName = user.firstName || '';
    const lastName = user.lastName || '';

    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }


  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword.set(!this.showCurrentPassword());
  }


  toggleNewPasswordVisibility() {
    this.showNewPassword.set(!this.showNewPassword());
  }


  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }


  getProfileImageUrl(profileImageUrl: string | undefined): string {

    if (!profileImageUrl || profileImageUrl.trim() === '' || profileImageUrl === 'null' || profileImageUrl === 'undefined') {
      return '';
    }


    if (profileImageUrl.startsWith('http')) {
      return profileImageUrl;
    }


    if (profileImageUrl.startsWith('data:image/')) {
      return profileImageUrl;
    }


    const baseUrl = (environment as any).imageBaseUrl || environment.apiUrl.replace('/api', '');
    const imagePath = profileImageUrl.startsWith('/') ? profileImageUrl : `/${profileImageUrl}`;

    const fullUrl = `${baseUrl}${imagePath}`;


    if (environment.enableDebugMode) {
      console.log(`🖼️ Perfil - Imagen procesada: "${profileImageUrl}" → "${fullUrl}"`);
    }

    return fullUrl;
  }


  hasProfileImage(): boolean {
    const user = this.currentUser();
    return !!(user?.profileImage &&
             user.profileImage.trim() !== '' &&
             user.profileImage !== 'null' &&
             user.profileImage !== 'undefined');
  }


  getUserProfileImage(): string {
    const user = this.currentUser();
    if (!user) return '';


    const imageUrl = user.profileImage || '';
    return this.getProfileImageUrl(imageUrl);
  }


  onImageError(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    const avatarContainer = imgElement.closest('.user-avatar, .user-avatar-large, .menu-avatar-container');


    if (avatarContainer) {
      avatarContainer.classList.add('error');
      avatarContainer.classList.remove('loading', 'loaded');
    }


    imgElement.style.display = 'none';


    if (environment.enableDebugMode) {
      console.group('❌ ERROR DE IMAGEN DE PERFIL');
      console.log('🖼️ URL que falló:', imgElement.src);
      console.log('🔗 URL original:', imgElement.getAttribute('data-original-src') || 'No disponible');
      console.log('📊 Dimensiones esperadas:', `${imgElement.width}x${imgElement.height}`);
      console.log('🌐 Estado de red:', navigator.onLine ? 'Online' : 'Offline');


      this.diagnoseImageError(imgElement.src);

      console.groupEnd();
    }
  }


  private async diagnoseImageError(imageUrl: string) {
    try {

      const response = await fetch(imageUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });

      console.log('   - Status:', response.status);
      console.log('   - Type:', response.type);
      console.log('   - Headers disponibles:', response.headers ? 'Sí' : 'No');

    } catch (error: any) {
      console.log('🔍 Diagnóstico de error:', error.name);
      console.log('   - Mensaje:', error.message);


      if (error.name.includes('TypeError')) {
        console.log('💡 Sugerencia: Verificar conectividad');
      } else if (error.message.includes('CORS')) {
        console.log('💡 Sugerencia: Problema de CORS - verificar configuración del servidor');
      } else {
        console.log('💡 Sugerencia: Verificar permisos de archivos');
      }
    }
  }


  onImageLoad(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    const avatarContainer = imgElement.closest('.user-avatar, .user-avatar-large, .menu-avatar-container');


    if (avatarContainer) {
      avatarContainer.classList.add('loaded');
      avatarContainer.classList.remove('loading', 'error');
    }
  }


  onImageLoadStart(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    const avatarContainer = imgElement.closest('.user-avatar, .user-avatar-large, .menu-avatar-container');


    if (avatarContainer) {
      avatarContainer.classList.add('loading');
      avatarContainer.classList.remove('loaded', 'error');
    }
  }


  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];


      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Solo se permiten archivos de imagen', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }


      if (file.size > 2 * 1024 * 1024) {
        this.snackBar.open('La imagen no debe superar los 2MB', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.selectedFile = file;


      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }


  uploadPhoto() {

    if (!this.selectedFile) return;


    const currentUser = this.currentUser();
    if (!currentUser) {
      this.snackBar.open('Error: No se encontró el usuario actual', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }


    this.uploadingPhoto.set(true);


    const fileSize = this.selectedFile.size;


    this.authService.updateUserProfileImage(currentUser.id, this.selectedFile).subscribe({
      next: (updatedUser) => {

        this.currentUser.set(updatedUser);





        this.selectedFile = null;
        this.profileImagePreview.set('');


        this.uploadingPhoto.set(false);


        this.snackBar.open('Foto de perfil actualizada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {

        this.uploadingPhoto.set(false);


        const errorMessage = error.error?.message || error.message || 'Error al subir la foto de perfil';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });

        console.error('Error subiendo foto de perfil:', error);
      }
    });
  }


  cancelPhotoUpload() {
    this.selectedFile = null;
    this.profileImagePreview.set('');
  }


  removePhoto() {

    const currentUser = this.currentUser();
    if (!currentUser) {
      this.snackBar.open('Error: No se encontró el usuario actual', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }


    this.uploadingPhoto.set(true);


    this.authService.deleteUserProfileImage(currentUser.id).subscribe({
      next: (updatedUser) => {

        this.currentUser.set(updatedUser);


        this.uploadingPhoto.set(false);





        this.snackBar.open('Foto de perfil eliminada correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {

        this.uploadingPhoto.set(false);


        const errorMessage = error.error?.message || error.message || 'Error al eliminar la foto de perfil';
        this.snackBar.open(`Error: ${errorMessage}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });

        console.error('Error eliminando foto de perfil:', error);
      }
    });
  }


  getFullName(): string {
    const user = this.currentUser();
    if (!user) return 'Usuario';

    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userCode || 'Usuario';
  }


  getRoleDisplayName(role: string): string {
    const roleObj = this.availableRoles.find(r => r.value === role);
    return roleObj ? roleObj.label : role || 'Sin rol';
  }


  onTabChange(index: number) {
    if (index === 2) {
      this.loadUserActivity();
    }
  }


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



  formatTimestamp(timestamp: Date): string {

    const now = new Date();


    const diff = now.getTime() - timestamp.getTime();



    const days = Math.floor(diff / (1000 * 60 * 60 * 24));


    if (days === 0) return 'Hoy';


    if (days === 1) return 'Ayer';


    if (days < 7) return `Hace ${days} días`;



    return timestamp.toLocaleDateString();
  }


  getDaysRemainingText(days: number): string {

    if (days === 0) return 'Expirado';


    if (days === 1) return '1 día restante';



    return `${days} días restantes`;
  }


  logout() {





    this.authService.logout();
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000): void {
    const panelClassMap = {
      'success': 'status-listo-snackbar',
      'error': 'status-terminado-snackbar',
      'warning': 'status-preparando-snackbar',
      'info': 'status-corriendo-snackbar'
    };

    const iconMap = {
      'success': '✓',
      'error': '✕',
      'warning': '⚠',
      'info': 'ℹ'
    };

    const panelClass = panelClassMap[type];
    const icon = iconMap[type];

    const snackBarRef = this.snackBar.open('', '', {
      duration,
      panelClass: [panelClass, 'animated-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    setTimeout(() => {
      const container = document.querySelector(`.${panelClass} .mdc-snackbar__label`);
      if (container) {
        container.innerHTML = `<span class="status-icon">${icon}</span> ${message}`;
      }
    }, 0);
  }
}
