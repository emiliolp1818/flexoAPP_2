

import { Component, inject, signal, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';


import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { resolveProfileImageUrl } from '../../../core/utils/api-url.util';
import { User } from '../../../core/services/auth.service';



interface RoleOption {
  value: string;
  label: string;
  icon: string;
}



@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {


  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditUserDialogComponent>);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);



  loading = signal<boolean>(false);
  profileImagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  originalFormData = signal<any>(null);



  userForm!: FormGroup;




  availableRoles: RoleOption[] = [
    { value: 'Admin', label: 'Administrador', icon: 'admin_panel_settings' },
    { value: 'Supervisor', label: 'Supervisor', icon: 'supervisor_account' },
    { value: 'Prealistador', label: 'Pre-alistador', icon: 'list_alt' },
    { value: 'Matizadores', label: 'Matizador', icon: 'palette' },
    { value: 'Operario', label: 'Operario', icon: 'person' },
    { value: 'Retornos', label: 'Retornos', icon: 'assignment_return' }
  ];



  constructor(@Inject(MAT_DIALOG_DATA) public userData: User) { }



  ngOnInit() {
    this.initializeForm();
    this.loadUserData();
  }



  private initializeForm() {
    this.userForm = this.fb.group({

      userCode: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9\-_]+$/)
      ]],


      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],


      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],


      role: ['', Validators.required],


      email: ['', [
        Validators.email,
        Validators.maxLength(100)
      ]],


      phone: ['', [
        Validators.pattern(/^[\+]?[0-9\s\-\(\)]{7,20}$/)
      ]],


      isActive: [true]
    });
  }



  private loadUserData() {
    if (this.userData) {

      const formData = {
        userCode: this.userData.userCode || '',
        firstName: this.userData.firstName || '',
        lastName: this.userData.lastName || '',
        role: this.userData.role || '',
        email: this.userData.email || '',
        phone: (this.userData as any).phone || '',
        isActive: this.userData.isActive !== undefined ? this.userData.isActive : true
      };


      this.userForm.patchValue(formData);


      this.originalFormData.set({ ...formData });


      const profileImage = (this.userData as any).profileImage;
      if (profileImage && profileImage.trim() !== '' && profileImage !== 'null') {

        if (profileImage.startsWith('data:image/')) {
          this.profileImagePreview.set(profileImage);
        } else {

          this.profileImagePreview.set(this.getProfileImageUrl(profileImage));
        }
      }
    }
  }



  hasChanges(): boolean {
    const currentData = this.userForm.value;
    const originalData = this.originalFormData();


    if (!originalData) return false;


    return JSON.stringify(currentData) !== JSON.stringify(originalData) || this.selectedFile() !== null;
  }



  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {


      if (!file.type.startsWith('image/')) {
        const snackBarRef = this.snackBar.open('', '', {
          duration: 3000,
          panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-terminado-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = '<span class="status-icon">✕</span> Solo se permiten archivos de imagen';
          }
        }, 0);
        return;
      }




      this.selectedFile.set(file);



      const reader = new FileReader();
      reader.onload = (e) => {

        this.profileImagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }


  removeImage() {
    this.selectedFile.set(null);
    this.profileImagePreview.set(null);
  }



  getPreviewInitials(): string {

    const firstName = this.userForm.get('firstName')?.value || this.userData.firstName || '';
    const lastName = this.userForm.get('lastName')?.value || this.userData.lastName || '';


    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();


    return firstInitial + lastInitial || 'NU';
  }


  getPreviewAvatarColor(): string {

    const firstName = this.userForm.get('firstName')?.value || this.userData.firstName || 'default';


    const colors = [
      '#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706',
      '#0891b2', '#be185d', '#4338ca', '#16a34a', '#ea580c'
    ];


    let hash = 0;
    for (let i = 0; i < firstName.length; i++) {
      hash = firstName.charCodeAt(i) + ((hash << 5) - hash);
    }


    return colors[Math.abs(hash) % colors.length];
  }



  getProfileImageUrl(profileImageUrl: string | undefined): string {
    return resolveProfileImageUrl(profileImageUrl);
  }



  formatFullDate(date: any): string {

    if (!date) return 'No disponible';


    const targetDate = new Date(date);


    if (isNaN(targetDate.getTime())) return 'No disponible';


    return targetDate.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }



  async resetPassword() {

    const snackBarRef = this.snackBar.open('', 'Restablecer', {
      duration: 8000,
      panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    setTimeout(() => {
      const container = document.querySelector('.status-preparando-snackbar .mdc-snackbar__label');
      if (container) {
        container.innerHTML = `<span class="status-icon">⚠</span> ¿Restablecer la contraseña de ${this.userData.firstName} ${this.userData.lastName}? Se enviará al correo: ${this.userData.email}`;
      }
    }, 0);

    const actionSubscription = snackBarRef.onAction().subscribe(async () => {
      this.loading.set(true);

      try {
        console.log(`🔐 Restableciendo contraseña para usuario: ${this.userData.userCode}`);


      const response = await this.http.post(`${environment.apiUrl}/auth/users/${this.userData.id}/reset-password`, {}).toPromise();

      if (response) {
        console.log(`✅ Contraseña restablecida para: ${this.userData.userCode}`);

        const snackBarRef = this.snackBar.open('', '', {
          duration: 5000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-listo-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = `<span class="status-icon">✓</span> Contraseña restablecida. Nueva contraseña enviada a ${this.userData.email}`;
          }
        }, 0);
      }
    } catch (error) {
      console.error('❌ Error restableciendo contraseña:', error);

      const snackBarRef = this.snackBar.open('', '', {
        duration: 4000,
        panelClass: ['status-listo-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const container = document.querySelector('.status-listo-snackbar .mdc-snackbar__label');
        if (container) {
          container.innerHTML = `<span class="status-icon">✓</span> Contraseña restablecida para ${this.userData.firstName} (simulación)`;
        }
      }, 0);
    } finally {
      this.loading.set(false);
    }
    });
  }



  onCancel() {

    if (this.hasChanges()) {

      const snackBarRef = this.snackBar.open('', 'Descartar', {
        duration: 5000,
        panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const container = document.querySelector('.status-preparando-snackbar .mdc-snackbar__label');
        if (container) {
          container.innerHTML = '<span class="status-icon">⚠</span> ¿Descartar los cambios realizados?';
        }
      }, 0);

      snackBarRef.onAction().subscribe(() => {
        this.dialogRef.close();
      });

    } else {

      this.dialogRef.close();
    }
  }


  async onSave() {

    if (!this.userForm.valid) {


      this.markFormGroupTouched();
      return;
    }


    if (!this.hasChanges()) {

      const snackBarRef = this.snackBar.open('', '', {
        duration: 2000,
        panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const container = document.querySelector('.status-preparando-snackbar .mdc-snackbar__label');
        if (container) {
          container.innerHTML = '<span class="status-icon">⚠</span> No hay cambios para guardar';
        }
      }, 0);
      return;
    }


    this.loading.set(true);

    try {
      const formData = this.userForm.value;



      const updateUserDto = {
        userCode: formData.userCode.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        email: formData.email && formData.email.trim() ? formData.email.trim() : null,
        phone: formData.phone?.trim() || null,
        isActive: formData.isActive,
        profileImage: this.profileImagePreview() || undefined
      };

      console.log('🔄 Actualizando usuario:', updateUserDto);
      console.log('📧 Email a actualizar:', updateUserDto.email);
      console.log('📱 Teléfono a actualizar:', updateUserDto.phone);


      const response = await this.http.put<any>(`${environment.apiUrl}/auth/users/${this.userData.id}`, updateUserDto).toPromise() || { success: false };

      if (response) {
        console.log('✅ Usuario actualizado exitosamente:', response);


        if (this.profileImagePreview()) {
          console.log('✅ Imagen de perfil actualizada como base64');
        }

        const snackBarRef = this.snackBar.open('', '', {
          duration: 4000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-listo-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = `<span class="status-icon">✓</span> Usuario ${formData.firstName} ${formData.lastName} actualizado exitosamente`;
          }
        }, 0);

        this.dialogRef.close({ ...this.userData, ...updateUserDto });
      }
    } catch (error: any) {
      console.error('❌ Error actualizando usuario:', error);


      let errorMessage = 'Error al actualizar el usuario';


      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 400) {
        errorMessage = 'El código de usuario ya existe o los datos son inválidos';
      } else if (error.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      }

      const snackBarRef = this.snackBar.open('', '', {
        duration: 5000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const container = document.querySelector('.status-terminado-snackbar .mdc-snackbar__label');
        if (container) {
          container.innerHTML = `<span class="status-icon">✕</span> ${errorMessage}`;
        }
      }, 0);
    } finally {
      this.loading.set(false);
    }
  }



  private async uploadProfileImage(userId: string) {
    const file = this.selectedFile();
    if (!file) return;

    try {


      const formData = new FormData();
      formData.append('profileImage', file);


      console.log('📤 Subiendo imagen de perfil para usuario ID:', userId);
      const response = await this.http.post(`${environment.apiUrl}/users/${userId}/profile-image`, formData).toPromise();
      console.log('✅ Imagen de perfil actualizada exitosamente:', response);

    } catch (error) {
      console.error('❌ Error actualizando imagen de perfil:', error);

      const snackBarRef = this.snackBar.open('', '', {
        duration: 4000,
        panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const container = document.querySelector('.status-preparando-snackbar .mdc-snackbar__label');
        if (container) {
          container.innerHTML = '<span class="status-icon">⚠</span> Usuario actualizado, pero hubo un error al actualizar la imagen';
        }
      }, 0);
    }
  }



  getUserCreatedDate(): any {
    return (this.userData as any)?.createdDate;
  }


  getUserDepartment(): string | null {
    return (this.userData as any)?.department || null;
  }


  hasUserDepartment(): boolean {
    return !!(this.userData as any)?.department;
  }



  private markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }
}