import { Component, inject, signal, OnInit } from '@angular/core';
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

interface RoleOption {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-create-user-dialog',
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
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss']
})
export class CreateUserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateUserDialogComponent>);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);

  // Señales reactivas
  loading = signal<boolean>(false);
  hidePassword = signal<boolean>(true);
  profileImagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  // Formulario reactivo
  userForm!: FormGroup;

  // Opciones de roles disponibles - ACTUALIZADAS PARA MYSQL
  availableRoles: RoleOption[] = [
    { value: 'Admin', label: 'Administrador', icon: 'admin_panel_settings' },
    { value: 'Supervisor', label: 'Supervisor', icon: 'supervisor_account' },
    { value: 'Prealistador', label: 'Pre-alistador', icon: 'list_alt' },
    { value: 'Matizadores', label: 'Matizador', icon: 'palette' },
    { value: 'Operario', label: 'Operario', icon: 'person' },
    { value: 'Retornos', label: 'Retornos', icon: 'assignment_return' }
  ];

  constructor() {}

  ngOnInit() {
    this.initializeForm();
  }

  /**
   * Inicializar formulario reactivo
   */
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
      email: ['', [Validators.email, Validators.maxLength(100)]],
      phone: ['', [
        Validators.pattern(/^[\+]?[0-9\s\-\(\)]{7,20}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50)
      ]],
      isActive: [true]
    });
  }

  /**
   * Alternar visibilidad de contraseña
   */
  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }

  /**
   * Manejar selección de archivo de imagen
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Solo se permiten archivos de imagen', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // SIN LÍMITE DE TAMAÑO - Validación eliminada para permitir cualquier tamaño de imagen

      this.selectedFile.set(file);

      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Remover imagen seleccionada
   */
  removeImage() {
    this.selectedFile.set(null);
    this.profileImagePreview.set(null);
  }

  /**
   * Obtener iniciales para vista previa del avatar
   */
  getPreviewInitials(): string {
    const firstName = this.userForm.get('firstName')?.value || '';
    const lastName = this.userForm.get('lastName')?.value || '';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return firstInitial + lastInitial || 'NU';
  }

  /**
   * Obtener color de avatar para vista previa
   */
  getPreviewAvatarColor(): string {
    const firstName = this.userForm.get('firstName')?.value || 'default';
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

  /**
   * Cancelar y cerrar diálogo
   */
  onCancel() {
    this.dialogRef.close();
  }

  /**
   * Guardar nuevo usuario
   */
  async onSave() {
    if (!this.userForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    
    try {
      const formData = this.userForm.value;
      
      // Preparar datos del usuario - CORREGIDO PARA MYSQL CON IMAGEN BASE64
      const createUserDto = {
        userCode: formData.userCode.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        email: formData.email && formData.email.trim() ? formData.email.trim() : null,
        phone: formData.phone && formData.phone.trim() ? formData.phone.trim() : null,
        password: formData.password,
        isActive: formData.isActive,
        profileImage: this.profileImagePreview() || null, // Imagen base64 directamente
        profileImageUrl: null
      };

      console.log('📧 Email a enviar:', createUserDto.email);
      console.log('📱 Teléfono a enviar:', createUserDto.phone);

      console.log('🔄 Creando usuario:', createUserDto);

      // Crear usuario en la base de datos MySQL
      console.log('🔄 Enviando datos a:', `${environment.apiUrl}/auth/users`);
      const response = await this.http.post<any>(`${environment.apiUrl}/auth/users`, createUserDto).toPromise();

      if (response) {
        console.log('✅ Usuario creado exitosamente:', response);

        // La imagen ya se envió como base64 en el createUserDto
        if (this.profileImagePreview()) {
          console.log('✅ Imagen de perfil incluida como base64 en la creación del usuario');
        }

        this.snackBar.open(`Usuario ${formData.firstName} ${formData.lastName} creado exitosamente`, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });

        // Cerrar diálogo y retornar el usuario creado
        this.dialogRef.close(response);
      }
    } catch (error: any) {
      console.error('❌ Error creando usuario:', error);
      
      let errorMessage = 'Error al crear el usuario';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 400) {
        errorMessage = 'El código de usuario ya existe o los datos son inválidos';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      }

      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Subir imagen de perfil
   */
  private async uploadProfileImage(userId: string) {
    const file = this.selectedFile();
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      console.log('📤 Subiendo imagen de perfil para usuario ID:', userId);
      const response = await this.http.post(`${environment.apiUrl}/users/${userId}/profile-image`, formData).toPromise();
      console.log('✅ Respuesta de subida de imagen:', response);
      console.log('✅ Imagen de perfil subida exitosamente');
    } catch (error) {
      console.error('❌ Error subiendo imagen de perfil:', error);
      this.snackBar.open('Usuario creado, pero hubo un error al subir la imagen', 'Cerrar', {
        duration: 4000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  /**
   * Marcar todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }
}