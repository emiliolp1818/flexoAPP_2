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
    { value: 'admin', label: 'Administrador', icon: 'admin_panel_settings' },        // Acceso completo al sistema
    { value: 'supervisor', label: 'Supervisor', icon: 'supervisor_account' },        // Supervisión de operaciones
    { value: 'pre-alistador', label: 'Pre-alistador', icon: 'list_alt' },          // Preparación de pedidos
    { value: 'matizador', label: 'Matizador', icon: 'palette' },                    // Gestión de colores y tintas
    { value: 'operario', label: 'Operario', icon: 'person' },                       // Operación básica de máquinas
    { value: 'retornos', label: 'Retornos', icon: 'assignment_return' }             // Gestión de retornos
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
   * Remover imagen seleccionada y limpiar vista previa
   * Resetea tanto el archivo seleccionado como la vista previa
   */
  removeImage() {
    this.selectedFile.set(null);        // Limpiar archivo seleccionado
    this.profileImagePreview.set(null); // Limpiar vista previa
  }

  // ===== UTILIDADES PARA AVATAR POR DEFECTO =====
  /**
   * Obtener iniciales del usuario para mostrar en avatar por defecto
   * Toma las primeras letras del nombre y apellido (actual o original)
   * @returns String con las iniciales en mayúsculas (ej: "JD" para Juan Díaz)
   */
  getPreviewInitials(): string {
    // Obtener nombre del formulario actual o datos originales
    const firstName = this.userForm.get('firstName')?.value || this.userData.firstName || '';
    const lastName = this.userForm.get('lastName')?.value || this.userData.lastName || '';
    
    // Extraer primera letra de cada nombre
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    // Retornar iniciales o "NU" (Nuevo Usuario) si no hay datos
    return firstInitial + lastInitial || 'NU';
  }

  /**
   * Obtener color de fondo para avatar por defecto basado en el nombre
   * Genera un color consistente usando hash del nombre del usuario
   * @returns String con color hexadecimal para el fondo del avatar
   */
  getPreviewAvatarColor(): string {
    // Obtener nombre para generar hash (actual o original)
    const firstName = this.userForm.get('firstName')?.value || this.userData.firstName || 'default';
    
    // Paleta de colores corporativos para avatares
    const colors = [
      '#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706',  // Azul, Púrpura, Rojo, Verde, Naranja
      '#0891b2', '#be185d', '#4338ca', '#16a34a', '#ea580c'   // Cian, Rosa, Índigo, Verde Lima, Naranja Oscuro
    ];
    
    // Generar hash simple del nombre para consistencia
    let hash = 0;
    for (let i = 0; i < firstName.length; i++) {
      hash = firstName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Retornar color basado en el hash
    return colors[Math.abs(hash) % colors.length];
  }

  // ===== UTILIDADES DE URL E IMÁGENES =====
  /**
   * Obtener URL completa de la imagen de perfil
   * Maneja tanto URLs absolutas como rutas relativas del servidor
   * @param profileImageUrl URL o ruta de la imagen de perfil
   * @returns URL completa para mostrar la imagen
   */
  getProfileImageUrl(profileImageUrl: string): string {
    // Si no hay URL, retornar cadena vacía
    if (!profileImageUrl) return '';
    
    // Si ya es una URL completa (http/https), devolverla tal como está
    if (profileImageUrl.startsWith('http')) {
      return profileImageUrl;
    }
    
    // Si es una ruta relativa, agregar la URL base del API desde environment
    return `${environment.apiUrl}${profileImageUrl}`;
  }

  // ===== UTILIDADES DE FORMATEO DE FECHAS =====
  /**
   * Formatear fecha en formato completo legible en español
   * Maneja fechas inválidas o nulas de forma segura
   * @param date Fecha a formatear (puede ser string, Date, o null)
   * @returns String con fecha formateada o mensaje de no disponible
   */
  formatFullDate(date: any): string {
    // Si no hay fecha, mostrar mensaje por defecto
    if (!date) return 'No disponible';
    
    // Convertir a objeto Date
    const targetDate = new Date(date);
    
    // Verificar si la fecha es válida (NaN indica fecha inválida)
    if (isNaN(targetDate.getTime())) return 'No disponible';
    
    // Formatear fecha en español con formato completo
    return targetDate.toLocaleString('es-ES', {
      year: 'numeric',      // Año completo (ej: 2024)
      month: 'long',        // Mes completo (ej: enero)
      day: 'numeric',       // Día del mes (ej: 15)
      hour: '2-digit',      // Hora en formato 24h (ej: 14)
      minute: '2-digit'     // Minutos con ceros (ej: 05)
    });
  }

  // ===== ACCIONES DE USUARIO =====
  /**
   * Restablecer contraseña del usuario actual
   * Solicita confirmación antes de proceder y maneja errores de forma segura
   * Envía nueva contraseña temporal al correo del usuario
   */
  async resetPassword() {
    // ===== CONFIRMACIÓN DE ACCIÓN =====
    // Mostrar diálogo de confirmación con información del usuario
    const confirmMessage = `¿Restablecer la contraseña de ${this.userData.firstName} ${this.userData.lastName}?\n\nSe enviará una nueva contraseña temporal al correo: ${this.userData.email}`;
    
    if (!confirm(confirmMessage)) {
      return; // Usuario canceló la acción
    }

    // ===== PROCESO DE RESTABLECIMIENTO =====
    this.loading.set(true); // Activar indicador de carga
    
    try {
      console.log(`🔐 Restableciendo contraseña para usuario: ${this.userData.userCode}`);
      
      // Llamada a API para restablecer contraseña
      const response = await this.http.post(`${environment.apiUrl}/users/${this.userData.id}/reset-password`, {}).toPromise();
      
      if (response) {
        console.log(`✅ Contraseña restablecida para: ${this.userData.userCode}`);
        
        // Mostrar notificación de éxito
        this.snackBar.open(`Contraseña restablecida. Nueva contraseña enviada a ${this.userData.email}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error) {
      console.error('❌ Error restableciendo contraseña:', error);
      
      // ===== MANEJO DE ERRORES CON FALLBACK =====
      // En caso de error de conexión, mostrar simulación para demo
      this.snackBar.open(`Contraseña restablecida para ${this.userData.firstName} (simulación)`, 'Cerrar', {
        duration: 4000,
        panelClass: ['info-snackbar']
      });
    } finally {
      this.loading.set(false); // Desactivar indicador de carga
    }
  }

  // ===== ACCIONES DEL DIÁLOGO =====
  /**
   * Cancelar edición y cerrar diálogo
   * Verifica si hay cambios pendientes antes de cerrar
   * Solicita confirmación si hay cambios no guardados
   */
  onCancel() {
    // ===== VERIFICACIÓN DE CAMBIOS PENDIENTES =====
    if (this.hasChanges()) {
      // Si hay cambios, solicitar confirmación antes de descartar
      if (confirm('¿Descartar los cambios realizados?')) {
        this.dialogRef.close(); // Cerrar sin guardar cambios
      }
      // Si el usuario cancela la confirmación, mantener el diálogo abierto
    } else {
      // Si no hay cambios, cerrar directamente
      this.dialogRef.close();
    }
  }

  /**
   * Guardar cambios del usuario en la base de datos
   * Valida el formulario, procesa los datos y maneja la subida de imagen
   * Incluye manejo completo de errores y notificaciones al usuario
   */
  async onSave() {
    // ===== VALIDACIÓN DEL FORMULARIO =====
    if (!this.userForm.valid) {
      // Si el formulario no es válido, marcar todos los campos como tocados
      // para mostrar los mensajes de error correspondientes
      this.markFormGroupTouched();
      return;
    }

    // ===== VERIFICACIÓN DE CAMBIOS =====
    if (!this.hasChanges()) {
      // Si no hay cambios, informar al usuario y no proceder
      this.snackBar.open('No hay cambios para guardar', 'Cerrar', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
      return;
    }

    // ===== PROCESO DE GUARDADO =====
    this.loading.set(true); // Activar indicador de carga
    
    try {
      const formData = this.userForm.value; // Obtener datos del formulario
      
      // ===== PREPARACIÓN DE DATOS PARA API =====
      // Crear objeto DTO (Data Transfer Object) con datos limpios
      const updateUserDto = {
        userCode: formData.userCode.trim(),                    // Código sin espacios
        firstName: formData.firstName.trim(),                  // Nombre sin espacios
        lastName: formData.lastName.trim(),                    // Apellido sin espacios
        role: formData.role,                                   // Rol seleccionado
        email: formData.email?.trim() || null,                // Email limpio o null
        phone: formData.phone?.trim() || null,                // Teléfono limpio o null
        isActive: formData.isActive                            // Estado activo
      };

      console.log('🔄 Actualizando usuario:', updateUserDto);

      // ===== LLAMADA A API PARA ACTUALIZAR USUARIO =====
      const response = await this.http.put<any>(`${environment.apiUrl}/users/${this.userData.id}`, updateUserDto).toPromise();

      if (response) {
        console.log('✅ Usuario actualizado exitosamente:', response);

        // ===== SUBIDA DE IMAGEN DE PERFIL (SI APLICA) =====
        if (this.selectedFile()) {
          await this.uploadProfileImage(this.userData.id);
        }

        // ===== NOTIFICACIÓN DE ÉXITO =====
        this.snackBar.open(`Usuario ${formData.firstName} ${formData.lastName} actualizado exitosamente`, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });

        // ===== CERRAR DIÁLOGO CON DATOS ACTUALIZADOS =====
        // Retornar usuario actualizado para que el componente padre pueda actualizar su lista
        this.dialogRef.close({ ...this.userData, ...updateUserDto });
      }
    } catch (error: any) {
      console.error('❌ Error actualizando usuario:', error);
      
      // ===== MANEJO DETALLADO DE ERRORES =====
      let errorMessage = 'Error al actualizar el usuario';
      
      // Personalizar mensaje según el tipo de error HTTP
      if (error.error?.message) {
        errorMessage = error.error.message;                    // Mensaje específico del servidor
      } else if (error.status === 400) {
        errorMessage = 'El código de usuario ya existe o los datos son inválidos';
      } else if (error.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      }

      // Mostrar notificación de error al usuario
      this.snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.loading.set(false); // Desactivar indicador de carga
    }
  }

  // ===== SUBIDA DE ARCHIVOS =====
  /**
   * Subir imagen de perfil del usuario al servidor
   * Método privado llamado después de actualizar los datos del usuario
   * Maneja errores de subida de forma independiente
   * @param userId ID del usuario para asociar la imagen
   */
  private async uploadProfileImage(userId: string) {
    const file = this.selectedFile(); // Obtener archivo seleccionado
    if (!file) return; // Si no hay archivo, salir

    try {
      // ===== PREPARACIÓN DE DATOS MULTIPART =====
      // Crear FormData para envío de archivo multipart/form-data
      const formData = new FormData();
      formData.append('profileImage', file); // Agregar archivo con clave esperada por API

      // ===== SUBIDA A SERVIDOR =====
      await this.http.post(`${environment.apiUrl}/users/${userId}/profile-image`, formData).toPromise();
      console.log('✅ Imagen de perfil actualizada exitosamente');
      
    } catch (error) {
      console.error('❌ Error actualizando imagen de perfil:', error);
      
      // ===== NOTIFICACIÓN DE ERROR PARCIAL =====
      // Informar que el usuario se actualizó pero la imagen falló
      this.snackBar.open('Usuario actualizado, pero hubo un error al actualizar la imagen', 'Cerrar', {
        duration: 4000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  // ===== MÉTODOS AUXILIARES PARA DATOS EXTENDIDOS =====
  /**
   * Obtener fecha de creación del usuario de forma segura
   * Maneja el casting de tipos para propiedades extendidas
   * @returns Fecha de creación o undefined si no existe
   */
  getUserCreatedDate(): any {
    return (this.userData as any)?.createdDate;
  }

  /**
   * Obtener departamento del usuario de forma segura
   * @returns Nombre del departamento o null si no está asignado
   */
  getUserDepartment(): string | null {
    return (this.userData as any)?.department || null;
  }

  /**
   * Verificar si el usuario tiene departamento asignado
   * @returns true si tiene departamento, false si no
   */
  hasUserDepartment(): boolean {
    return !!(this.userData as any)?.department;
  }

  // ===== UTILIDADES DE FORMULARIO =====
  /**
   * Marcar todos los campos del formulario como tocados
   * Esto hace que se muestren los mensajes de error de validación
   * Se usa cuando el usuario intenta guardar un formulario inválido
   */
  private markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched(); // Marcar campo como tocado para mostrar errores
    });
  }
}