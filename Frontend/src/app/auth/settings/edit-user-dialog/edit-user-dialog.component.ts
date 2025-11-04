// ===== IMPORTACIONES PRINCIPALES =====
// Importaciones de Angular Core para funcionalidad básica del componente
import { Component, inject, signal, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones para formularios reactivos y validaciones
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Importaciones de Angular Material para UI del diálogo
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Importaciones para comunicación HTTP y configuración
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/services/auth.service';

// ===== INTERFACES Y TIPOS =====
/**
 * Interface para definir las opciones de roles disponibles en el sistema
 * Cada rol tiene un valor, etiqueta y icono asociado para la UI
 */
interface RoleOption {
  value: string;  // Valor interno del rol (ej: 'Administrador')
  label: string;  // Etiqueta mostrada al usuario (ej: 'Administrador')
  icon: string;   // Icono de Material Design para el rol (ej: 'admin_panel_settings')
}

// ===== CONFIGURACIÓN DEL COMPONENTE =====
/**
 * Componente de diálogo para editar usuarios existentes del sistema FlexoApp
 * 
 * Funcionalidades principales:
 * - Edición de información básica del usuario (nombre, apellido, código, rol)
 * - Gestión de información de contacto (email, teléfono)
 * - Subida y gestión de imagen de perfil
 * - Activación/desactivación de usuarios
 * - Restablecimiento de contraseñas
 * - Validaciones de formulario en tiempo real
 * - Integración con API backend para persistencia de datos
 */
@Component({
  selector: 'app-edit-user-dialog',
  standalone: true, // Componente standalone para mejor modularidad
  imports: [
    CommonModule,           // Funcionalidades básicas de Angular (ngIf, ngFor, etc.)
    ReactiveFormsModule,    // Formularios reactivos con validaciones
    MatDialogModule,        // Componentes de diálogo de Material Design
    MatButtonModule,        // Botones de Material Design
    MatIconModule,          // Iconos de Material Design
    MatFormFieldModule,     // Campos de formulario de Material Design
    MatInputModule,         // Inputs de Material Design
    MatSelectModule,        // Selectores dropdown de Material Design
    MatSlideToggleModule,   // Interruptores toggle de Material Design
    MatSnackBarModule       // Notificaciones toast de Material Design
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {
  // ===== INYECCIÓN DE DEPENDENCIAS =====
  // Servicios inyectados usando el nuevo patrón inject() de Angular 16+
  private fb = inject(FormBuilder);                                    // Constructor de formularios reactivos
  private dialogRef = inject(MatDialogRef<EditUserDialogComponent>);   // Referencia al diálogo actual
  private snackBar = inject(MatSnackBar);                             // Servicio para mostrar notificaciones
  private http = inject(HttpClient);                                  // Cliente HTTP para comunicación con API

  // ===== SEÑALES REACTIVAS =====
  // Usando Angular Signals para manejo de estado reactivo
  loading = signal<boolean>(false);                    // Estado de carga para operaciones asíncronas
  profileImagePreview = signal<string | null>(null);   // URL de vista previa de imagen de perfil
  selectedFile = signal<File | null>(null);            // Archivo de imagen seleccionado para subir
  originalFormData = signal<any>(null);                // Datos originales para detectar cambios

  // ===== FORMULARIO REACTIVO =====
  // FormGroup para manejo de validaciones y estado del formulario
  userForm!: FormGroup;

  // ===== CONFIGURACIÓN DE ROLES =====
  // Array de opciones de roles disponibles en el sistema FlexoApp
  // Cada rol tiene un valor, etiqueta descriptiva e icono de Material Design
  availableRoles: RoleOption[] = [
    { value: 'Administrador', label: 'Administrador', icon: 'admin_panel_settings' },  // Acceso completo al sistema
    { value: 'Supervisor', label: 'Supervisor', icon: 'supervisor_account' },          // Supervisión de operaciones
    { value: 'Pre-alistador', label: 'Pre-alistador', icon: 'list_alt' },            // Preparación de pedidos
    { value: 'Matizador', label: 'Matizador', icon: 'palette' },                     // Gestión de colores y tintas
    { value: 'Operador', label: 'Operador', icon: 'person' }                         // Operación básica de máquinas
  ];

  // ===== CONSTRUCTOR =====
  // Recibe los datos del usuario a editar mediante inyección de datos del diálogo
  constructor(@Inject(MAT_DIALOG_DATA) public userData: User) {}

  // ===== CICLO DE VIDA DEL COMPONENTE =====
  /**
   * Método de inicialización del componente
   * Se ejecuta después de que Angular inicializa las propiedades del componente
   */
  ngOnInit() {
    this.initializeForm();  // Configurar el formulario reactivo con validaciones
    this.loadUserData();    // Cargar los datos del usuario en el formulario
  }

  // ===== CONFIGURACIÓN DEL FORMULARIO =====
  /**
   * Inicializar formulario reactivo con validaciones completas
   * Define todos los campos necesarios para la edición de usuarios
   * Incluye validaciones tanto síncronas como patrones regex
   */
  private initializeForm() {
    this.userForm = this.fb.group({
      // Campo código de usuario - Identificador único alfanumérico
      userCode: ['', [
        Validators.required,                           // Campo obligatorio
        Validators.minLength(3),                       // Mínimo 3 caracteres
        Validators.maxLength(50),                      // Máximo 50 caracteres
        Validators.pattern(/^[A-Za-z0-9\-_]+$/)       // Solo letras, números, guiones y guiones bajos
      ]],
      
      // Campo nombre - Nombre del usuario
      firstName: ['', [
        Validators.required,                           // Campo obligatorio
        Validators.minLength(2),                       // Mínimo 2 caracteres
        Validators.maxLength(50)                       // Máximo 50 caracteres
      ]],
      
      // Campo apellido - Apellido del usuario
      lastName: ['', [
        Validators.required,                           // Campo obligatorio
        Validators.minLength(2),                       // Mínimo 2 caracteres
        Validators.maxLength(50)                       // Máximo 50 caracteres
      ]],
      
      // Campo rol - Rol del usuario en el sistema
      role: ['', Validators.required],                 // Campo obligatorio, debe ser uno de los roles disponibles
      
      // Campo email - Correo electrónico (opcional)
      email: ['', [
        Validators.email,                              // Validación de formato de email
        Validators.maxLength(100)                      // Máximo 100 caracteres
      ]],
      
      // Campo teléfono - Número de teléfono (opcional)
      phone: ['', [
        Validators.pattern(/^[\+]?[0-9\s\-\(\)]{7,20}$/) // Patrón para números de teléfono internacionales
      ]],
      
      // Campo estado activo - Determina si el usuario puede acceder al sistema
      isActive: [true]                                 // Por defecto activo
    });
  }

  // ===== CARGA DE DATOS =====
  /**
   * Cargar datos del usuario existente en el formulario
   * Mapea los datos del usuario recibido a los campos del formulario
   * Guarda una copia de los datos originales para detectar cambios
   */
  private loadUserData() {
    if (this.userData) {
      // Mapear datos del usuario a estructura del formulario
      const formData = {
        userCode: this.userData.userCode || '',                                    // Código único del usuario
        firstName: this.userData.firstName || '',                                  // Nombre del usuario
        lastName: this.userData.lastName || '',                                    // Apellido del usuario
        role: this.userData.role || '',                                           // Rol asignado en el sistema
        email: this.userData.email || '',                                         // Correo electrónico (opcional)
        phone: (this.userData as any).phone || '',                               // Teléfono (opcional, cast por compatibilidad)
        isActive: this.userData.isActive !== undefined ? this.userData.isActive : true  // Estado activo (por defecto true)
      };

      // Aplicar los datos al formulario reactivo
      this.userForm.patchValue(formData);
      
      // Guardar copia de datos originales para detectar cambios posteriores
      this.originalFormData.set({ ...formData });

      // Cargar imagen de perfil si el usuario tiene una configurada
      if ((this.userData as any).profileImageUrl) {
        this.profileImagePreview.set(this.getProfileImageUrl((this.userData as any).profileImageUrl));
      }
    }
  }

  // ===== DETECCIÓN DE CAMBIOS =====
  /**
   * Verificar si hay cambios en el formulario comparado con los datos originales
   * Compara tanto los datos del formulario como la selección de nueva imagen
   * @returns true si hay cambios pendientes, false si no hay cambios
   */
  hasChanges(): boolean {
    const currentData = this.userForm.value;      // Datos actuales del formulario
    const originalData = this.originalFormData(); // Datos originales guardados
    
    // Si no hay datos originales, no hay cambios
    if (!originalData) return false;

    // Comparar datos del formulario (serialización JSON) o si hay archivo seleccionado
    return JSON.stringify(currentData) !== JSON.stringify(originalData) || this.selectedFile() !== null;
  }

  // ===== MANEJO DE ARCHIVOS DE IMAGEN =====
  /**
   * Manejar la selección de archivo de imagen de perfil
   * Incluye validaciones de tipo de archivo y tamaño
   * Genera vista previa automática del archivo seleccionado
   * @param event Evento del input file con el archivo seleccionado
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];  // Obtener el primer archivo seleccionado
    
    if (file) {
      // ===== VALIDACIÓN DE TIPO DE ARCHIVO =====
      // Solo permitir archivos de imagen (image/*)
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Solo se permiten archivos de imagen', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // ===== VALIDACIÓN DE TAMAÑO DE ARCHIVO =====
      // Límite máximo de 5MB para evitar problemas de rendimiento
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('La imagen no debe superar los 5MB', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Guardar archivo seleccionado en signal reactivo
      this.selectedFile.set(file);

      // ===== GENERACIÓN DE VISTA PREVIA =====
      // Usar FileReader para convertir archivo a Data URL para vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        // Actualizar vista previa con la imagen cargada
        this.profileImagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);  // Leer archivo como Data URL
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
    const firstName = this.userForm.get('firstName')?.value || this.userData.firstName || '';
    const lastName = this.userForm.get('lastName')?.value || this.userData.lastName || '';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return firstInitial + lastInitial || 'NU';
  }

  /**
   * Obtener color de avatar para vista previa
   */
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

  /**
   * Obtener URL completa de la imagen de perfil
   */
  getProfileImageUrl(profileImageUrl: string): string {
    if (!profileImageUrl) return '';
    
    // Si ya es una URL completa, devolverla tal como está
    if (profileImageUrl.startsWith('http')) {
      return profileImageUrl;
    }
    
    // Si es una ruta relativa, agregar la URL base del API
    return `${environment.apiUrl}${profileImageUrl}`;
  }

  /**
   * Formatear fecha completa
   */
  formatFullDate(date: any): string {
    if (!date) return 'No disponible';
    
    const targetDate = new Date(date);
    
    // Verificar si la fecha es válida
    if (isNaN(targetDate.getTime())) return 'No disponible';
    
    return targetDate.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Restablecer contraseña del usuario
   */
  async resetPassword() {
    if (!confirm(`¿Restablecer la contraseña de ${this.userData.firstName} ${this.userData.lastName}?\n\nSe enviará una nueva contraseña temporal al correo: ${this.userData.email}`)) {
      return;
    }

    this.loading.set(true);
    try {
      console.log(`🔐 Restableciendo contraseña para usuario: ${this.userData.userCode}`);
      
      const response = await this.http.post(`${environment.apiUrl}/users/${this.userData.id}/reset-password`, {}).toPromise();
      
      if (response) {
        console.log(`✅ Contraseña restablecida para: ${this.userData.userCode}`);
        
        this.snackBar.open(`Contraseña restablecida. Nueva contraseña enviada a ${this.userData.email}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error) {
      console.error('❌ Error restableciendo contraseña:', error);
      
      // Simulación para demo
      this.snackBar.open(`Contraseña restablecida para ${this.userData.firstName} (simulación)`, 'Cerrar', {
        duration: 4000,
        panelClass: ['info-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cancelar y cerrar diálogo
   */
  onCancel() {
    if (this.hasChanges()) {
      if (confirm('¿Descartar los cambios realizados?')) {
        this.dialogRef.close();
      }
    } else {
      this.dialogRef.close();
    }
  }

  /**
   * Guardar cambios del usuario
   */
  async onSave() {
    if (!this.userForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    if (!this.hasChanges()) {
      this.snackBar.open('No hay cambios para guardar', 'Cerrar', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
      return;
    }

    this.loading.set(true);
    
    try {
      const formData = this.userForm.value;
      
      // Preparar datos del usuario
      const updateUserDto = {
        userCode: formData.userCode.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        isActive: formData.isActive
      };

      console.log('🔄 Actualizando usuario:', updateUserDto);

      // Actualizar usuario en la base de datos
      const response = await this.http.put<any>(`${environment.apiUrl}/users/${this.userData.id}`, updateUserDto).toPromise();

      if (response) {
        console.log('✅ Usuario actualizado exitosamente:', response);

        // Si hay imagen seleccionada, subirla
        if (this.selectedFile()) {
          await this.uploadProfileImage(this.userData.id);
        }

        this.snackBar.open(`Usuario ${formData.firstName} ${formData.lastName} actualizado exitosamente`, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });

        // Cerrar diálogo y retornar el usuario actualizado
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

      await this.http.post(`${environment.apiUrl}/users/${userId}/profile-image`, formData).toPromise();
      console.log('✅ Imagen de perfil actualizada exitosamente');
    } catch (error) {
      console.error('❌ Error actualizando imagen de perfil:', error);
      this.snackBar.open('Usuario actualizado, pero hubo un error al actualizar la imagen', 'Cerrar', {
        duration: 4000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  /**
   * Obtener fecha de creación del usuario
   */
  getUserCreatedDate(): any {
    return (this.userData as any)?.createdDate;
  }

  /**
   * Obtener departamento del usuario
   */
  getUserDepartment(): string | null {
    return (this.userData as any)?.department || null;
  }

  /**
   * Verificar si el usuario tiene departamento
   */
  hasUserDepartment(): boolean {
    return !!(this.userData as any)?.department;
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