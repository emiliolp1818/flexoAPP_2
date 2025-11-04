import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService, User } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';

interface SystemConfig {
  id: string;
  name: string;
  description: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'select';
  category: string;
  options?: string[];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Señales reactivas
  currentUser = signal<User | null>(null);
  loading = signal<boolean>(false);
  selectedTabIndex = signal<number>(0);
  users = signal<User[]>([]);
  systemConfigs = signal<SystemConfig[]>([]);

  // Configuración de tabla de usuarios - Compacta
  userDisplayedColumns: string[] = ['user', 'contact', 'role', 'status', 'lastLogin', 'actions'];

  // Roles del sistema
  roles = ['Administrador', 'Supervisor', 'Pre-alistador', 'Matizador', 'Operador'];

  constructor() {}

  ngOnInit() {
    this.loadCurrentUser();
    this.checkDatabaseConnection();
    this.loadUsers();
    this.loadSystemConfigs();
  }

  /**
   * Verificar conexión a la base de datos y mostrar estado
   */
  private async checkDatabaseConnection() {
    console.log('🔍 Verificando conexión a la base de datos...');
    console.log(`📡 URL principal: ${environment.apiUrl}`);
    console.log(`🔄 URLs de fallback:`, environment.fallbackUrls);
    
    // Mostrar información de red en consola para debug
    if (environment.enableDebugMode) {
      console.log('🐛 Modo debug activado - Información de conexión:');
      console.log('   - Timeout de cache:', environment.cacheTimeout);
      console.log('   - Intentos de reintento:', environment.retryAttempts);
      console.log('   - Modo red:', environment.networkMode);
    }
  }

  /**
   * Cargar usuario actual
   */
  loadCurrentUser() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
  }

  /**
   * Verificar permisos
   */
  canManageUsers(): boolean {
    const user = this.currentUser();
    return user?.role === 'Administrador' || user?.role === 'Supervisor';
  }

  canManageSystemConfigs(): boolean {
    const user = this.currentUser();
    return user?.role === 'Administrador';
  }

  /**
   * Cambio de pestaña
   */
  onTabChange(index: number) {
    this.selectedTabIndex.set(index);
  }

  /**
   * Cargar usuarios desde la base de datos con fallback automático
   */
  async loadUsers() {
    if (!this.canManageUsers()) return;

    this.loading.set(true);
    
    // Intentar cargar desde la base de datos con múltiples URLs
    const success = await this.tryLoadUsersFromDatabase();
    
    if (!success) {
      // Si falla, cargar usuarios de ejemplo
      console.log('🔄 Cargando usuarios de ejemplo como fallback...');
      this.loadMockUsers();
      
      this.snackBar.open('Usando datos de ejemplo - Servidor no disponible', 'Cerrar', {
        duration: 4000,
        panelClass: ['warning-snackbar']
      });
    }
    
    this.loading.set(false);
  }

  /**
   * Intentar cargar usuarios desde diferentes URLs de API
   */
  private async tryLoadUsersFromDatabase(): Promise<boolean> {
    // Lista de URLs para intentar
    const urlsToTry = [
      environment.apiUrl,
      ...environment.fallbackUrls
    ];

    for (let i = 0; i < urlsToTry.length; i++) {
      const apiUrl = urlsToTry[i];
      
      try {
        console.log(`🔄 Intentando cargar usuarios desde: ${apiUrl} (${i + 1}/${urlsToTry.length})`);
        
        // Agregar timeout personalizado para evitar esperas largas
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const requestPromise = this.http.get<User[]>(`${apiUrl}/users`).toPromise();
        
        const response = await Promise.race([requestPromise, timeoutPromise]) as User[];
        
        if (response && response.length > 0) {
          console.log(`✅ ${response.length} usuarios cargados desde: ${apiUrl}`);
          this.users.set(response);
          
          this.snackBar.open(`✅ ${response.length} usuarios cargados desde base de datos`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          return true; // Éxito
        } else if (response && response.length === 0) {
          console.log(`⚠️ Base de datos vacía en: ${apiUrl}`);
          this.users.set([]);
          
          this.snackBar.open('Base de datos conectada pero sin usuarios', 'Cerrar', {
            duration: 3000,
            panelClass: ['info-snackbar']
          });
          
          return true; // Conexión exitosa aunque sin datos
        }
      } catch (error: any) {
        console.error(`❌ Error conectando a ${apiUrl}:`, error);
        
        // Mostrar información detallada del error
        let errorType = 'Error desconocido';
        if (error.name === 'TimeoutError' || error.message === 'Timeout') {
          errorType = 'Timeout (servidor no responde)';
        } else if (error.status === 0) {
          errorType = 'Sin conexión (CORS o servidor apagado)';
        } else if (error.status === 404) {
          errorType = 'Endpoint no encontrado';
        } else if (error.status >= 500) {
          errorType = 'Error del servidor';
        }
        
        console.error(`   Tipo de error: ${errorType}`);
        console.error(`   Status: ${error.status || 'N/A'}`);
        console.error(`   Mensaje: ${error.message || 'Sin mensaje'}`);
      }
    }
    
    console.log('❌ No se pudo conectar a ningún servidor de base de datos');
    console.log('📋 URLs intentadas:', urlsToTry);
    return false; // Falló en todas las URLs
  }

  /**
   * Cargar usuarios de ejemplo (fallback)
   */
  private loadMockUsers() {
    const mockUsers: any[] = [
      {
        id: '1',
        userCode: 'ADMIN001',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@flexoapp.com',
        phone: '+57 300 123 4567',
        role: 'Administrador',
        isActive: true,
        profileImageUrl: undefined,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        createdDate: new Date('2024-01-15'),
        department: 'Administración'
      },
      {
        id: '2',
        userCode: 'SUP001',
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@flexoapp.com',
        phone: '+57 301 987 6543',
        role: 'Supervisor',
        isActive: true,
        profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        createdDate: new Date('2024-02-01'),
        department: 'Producción'
      },
      {
        id: '3',
        userCode: 'PRE001',
        firstName: 'Juan',
        lastName: 'Martínez',
        email: 'juan.martinez@flexoapp.com',
        phone: undefined, // Sin teléfono
        role: 'Pre-alistador',
        isActive: true,
        profileImageUrl: undefined,
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
        createdDate: new Date('2024-02-15'),
        department: 'Pre-alistamiento'
      },
      {
        id: '4',
        userCode: 'MAT001',
        firstName: 'Ana',
        lastName: 'López',
        email: 'ana.lopez@flexoapp.com',
        phone: '+57 302 456 7890',
        role: 'Matizador',
        isActive: true,
        profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
        createdDate: new Date('2024-03-01'),
        department: 'Matizado'
      },
      {
        id: '5',
        userCode: 'OP001',
        firstName: 'Pedro',
        lastName: 'Sánchez',
        email: 'pedro.sanchez@flexoapp.com',
        phone: undefined, // Sin teléfono
        role: 'Operador',
        isActive: false,
        profileImageUrl: undefined,
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
        createdDate: new Date('2024-03-15'),
        department: 'Operación'
      },
      {
        id: '6',
        userCode: 'MAT002',
        firstName: 'Laura',
        lastName: 'Fernández',
        email: 'laura.fernandez@flexoapp.com',
        phone: '+57 303 789 0123',
        role: 'Matizador',
        isActive: true,
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        lastLogin: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
        createdDate: new Date('2024-04-01'),
        department: 'Matizado'
      },
      {
        id: '7',
        userCode: 'PRE002',
        firstName: 'Roberto',
        lastName: 'García',
        email: 'roberto.garcia@flexoapp.com',
        phone: undefined, // Sin teléfono
        role: 'Pre-alistador',
        isActive: true,
        profileImageUrl: undefined,
        lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
        createdDate: new Date('2024-04-15'),
        department: 'Pre-alistamiento'
      },
      {
        id: '8',
        userCode: 'OP002',
        firstName: 'Carmen',
        lastName: 'Ruiz',
        email: 'carmen.ruiz@flexoapp.com',
        phone: '+57 304 234 5678',
        role: 'Operador',
        isActive: true,
        profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        lastLogin: new Date(Date.now() - 45 * 60 * 1000), // 45 minutos atrás
        createdDate: new Date('2024-05-01'),
        department: 'Operación'
      }
    ];

    this.users.set(mockUsers);
    console.log(`✅ ${mockUsers.length} usuarios de ejemplo cargados`);
  }

  /**
   * Cargar configuraciones del sistema
   */
  async loadSystemConfigs() {
    if (!this.canManageSystemConfigs()) return;

    try {
      const response = await this.http.get<SystemConfig[]>(`${environment.apiUrl}/system/configs`).toPromise();
      if (response) {
        this.systemConfigs.set(response);
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
      // Configuraciones por defecto
      this.systemConfigs.set([
        {
          id: 'app_name',
          name: 'Nombre de la Aplicación',
          description: 'Nombre que se muestra en la aplicación',
          value: 'FlexoApp',
          type: 'string',
          category: 'General'
        },
        {
          id: 'max_users',
          name: 'Máximo de Usuarios',
          description: 'Número máximo de usuarios concurrentes',
          value: 50,
          type: 'number',
          category: 'General'
        },
        {
          id: 'enable_notifications',
          name: 'Notificaciones',
          description: 'Habilitar notificaciones del sistema',
          value: true,
          type: 'boolean',
          category: 'Notificaciones'
        },
        {
          id: 'session_timeout',
          name: 'Tiempo de Sesión',
          description: 'Tiempo de inactividad antes de cerrar sesión (minutos)',
          value: 30,
          type: 'number',
          category: 'Seguridad'
        }
      ]);
    }
  }

  /**
   * Obtener categorías de configuración
   */
  getConfigCategories(): string[] {
    const configs = this.systemConfigs();
    const categories = [...new Set(configs.map(c => c.category))];
    return categories.sort();
  }

  /**
   * Obtener configuraciones por categoría
   */
  getConfigsByCategory(category: string): SystemConfig[] {
    return this.systemConfigs().filter(c => c.category === category);
  }

  /**
   * Actualizar configuración del sistema
   */
  async updateSystemConfig(config: SystemConfig, newValue: any) {
    try {
      await this.http.put(`${environment.apiUrl}/system/configs/${config.id}`, {
        value: newValue
      }).toPromise();

      // Actualizar localmente
      const configs = this.systemConfigs();
      const updatedConfigs = configs.map(c => 
        c.id === config.id ? { ...c, value: newValue } : c
      );
      this.systemConfigs.set(updatedConfigs);

      this.snackBar.open('Configuración actualizada', 'Cerrar', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      this.snackBar.open('Error al actualizar configuración', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Obtener nombre de visualización del rol
   */
  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'Administrador': 'Administrador',
      'Supervisor': 'Supervisor',
      'Pre-alistador': 'Pre-alistador',
      'Matizador': 'Matizador',
      'Operador': 'Operador'
    };
    return roleNames[role] || role;
  }

  /**
   * Obtener nombre de visualización de opción
   */
  getOptionDisplayName(configId: string, option: string): string {
    // Personalizar según sea necesario
    return option;
  }

  /**
   * Recargar usuarios manualmente
   */
  async reloadUsers() {
    console.log('🔄 Recarga manual de usuarios solicitada');
    await this.loadUsers();
  }

  /**
   * Abrir diálogo de crear usuario
   */
  openCreateUserDialog() {
    if (!this.canManageUsers()) {
      this.snackBar.open('No tienes permisos para crear usuarios', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Usuario creado desde diálogo:', result);
        // Recargar la lista de usuarios
        this.loadUsers();
      }
    });
  }

  // Funciones eliminadas - se mantienen las versiones mejoradas más abajo

  /**
   * Obtener fecha actual
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES');
  }

  /**
   * Obtener número de usuarios activos
   */
  getActiveUsersCount(): number {
    return this.users().filter(u => u.isActive).length;
  }

  // ===== FUNCIONES PARA AVATARES Y FOTOS DE PERFIL =====

  /**
   * Obtener iniciales del usuario para avatar por defecto
   */
  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  /**
   * Obtener color de avatar basado en el nombre
   */
  getAvatarColor(name: string): string {
    const colors = [
      '#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706',
      '#0891b2', '#be185d', '#4338ca', '#16a34a', '#ea580c'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
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
   * Manejar error de carga de imagen
   */
  onImageError(event: any) {
    event.target.style.display = 'none';
    // La imagen por defecto se mostrará automáticamente
  }

  // ===== FUNCIONES PARA FECHAS =====

  /**
   * Formatear fecha relativa (ej: "hace 2 horas")
   */
  formatRelativeDate(date: any): string {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const loginDate = new Date(date);
    
    // Verificar si la fecha es válida
    if (isNaN(loginDate.getTime())) return 'Nunca';
    
    const diffMs = now.getTime() - loginDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return loginDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }

  /**
   * Formatear fecha completa para tooltip
   */
  formatFullDate(date: any): string {
    if (!date) return 'Nunca ha iniciado sesión';
    
    const loginDate = new Date(date);
    
    // Verificar si la fecha es válida
    if (isNaN(loginDate.getTime())) return 'Nunca ha iniciado sesión';
    
    return loginDate.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ===== NUEVAS ACCIONES FUNCIONALES =====

  /**
   * Restablecer contraseña del usuario
   */
  async resetPassword(user: User) {
    if (!confirm(`¿Restablecer la contraseña de ${user.firstName} ${user.lastName}?\n\nSe enviará una nueva contraseña temporal al correo: ${user.email}`)) {
      return;
    }

    this.loading.set(true);
    try {
      console.log(`🔐 Restableciendo contraseña para usuario: ${user.userCode}`);
      
      const response = await this.http.post(`${environment.apiUrl}/users/${user.id}/reset-password`, {}).toPromise();
      
      if (response) {
        console.log(`✅ Contraseña restablecida para: ${user.userCode}`);
        
        this.snackBar.open(`Contraseña restablecida. Nueva contraseña enviada a ${user.email}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      }
    } catch (error) {
      console.error('❌ Error restableciendo contraseña:', error);
      
      // Simulación para demo
      this.snackBar.open(`Contraseña restablecida para ${user.firstName} (simulación)`, 'Cerrar', {
        duration: 4000,
        panelClass: ['info-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Editar usuario - Abrir modal de edición
   */
  editUser(user: User) {
    if (!this.canManageUsers()) {
      this.snackBar.open('No tienes permisos para editar usuarios', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    console.log(`✏️ Editando usuario: ${user.userCode}`);

    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: false,
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Usuario actualizado desde diálogo:', result);
        
        // Actualizar la lista local de usuarios
        const updatedUsers = this.users().map(u => 
          u.id === result.id ? result : u
        );
        this.users.set(updatedUsers);

        this.snackBar.open(`Usuario ${result.firstName} ${result.lastName} actualizado exitosamente`, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  /**
   * Eliminar usuario con confirmación mejorada
   */
  async deleteUser(user: User) {
    // Prevenir eliminación de administradores
    if (user.role === 'Administrador') {
      this.snackBar.open('No se puede eliminar un usuario Administrador', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const confirmMessage = `⚠️ ELIMINAR USUARIO

Usuario: ${user.firstName} ${user.lastName}
Código: ${user.userCode}
Rol: ${user.role}

Esta acción NO se puede deshacer.

¿Estás seguro de continuar?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.loading.set(true);
    try {
      console.log(`🗑️ Eliminando usuario: ${user.userCode}`);
      
      await this.http.delete(`${environment.apiUrl}/users/${user.id}`).toPromise();
      
      // Actualizar lista local
      const updatedUsers = this.users().filter(u => u.id !== user.id);
      this.users.set(updatedUsers);

      console.log(`✅ Usuario eliminado: ${user.userCode}`);
      
      this.snackBar.open(`Usuario ${user.firstName} ${user.lastName} eliminado exitosamente`, 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      
      // Simulación para demo
      const updatedUsers = this.users().filter(u => u.id !== user.id);
      this.users.set(updatedUsers);
      
      this.snackBar.open(`Usuario ${user.firstName} eliminado (simulación)`, 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cambiar estado del usuario con validaciones
   */
  async toggleUserStatus(user: User) {
    // Prevenir desactivación de administradores
    if (user.role === 'Administrador' && user.isActive) {
      this.snackBar.open('No se puede desactivar un usuario Administrador', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const newStatus = !user.isActive;
    const action = newStatus ? 'activar' : 'desactivar';
    
    if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} al usuario ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    this.loading.set(true);
    try {
      console.log(`🔄 ${action}ndo usuario: ${user.userCode}`);
      
      await this.http.put(`${environment.apiUrl}/users/${user.id}/status`, {
        isActive: newStatus
      }).toPromise();

      // Actualizar localmente
      const updatedUsers = this.users().map(u => 
        u.id === user.id ? { ...u, isActive: newStatus } : u
      );
      this.users.set(updatedUsers);

      console.log(`✅ Usuario ${action}do: ${user.userCode}`);

      this.snackBar.open(`Usuario ${user.firstName} ${newStatus ? 'activado' : 'desactivado'}`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error(`❌ Error ${action}ndo usuario:`, error);
      
      // Simulación para demo
      const updatedUsers = this.users().map(u => 
        u.id === user.id ? { ...u, isActive: newStatus } : u
      );
      this.users.set(updatedUsers);
      
      this.snackBar.open(`Usuario ${action}do (simulación)`, 'Cerrar', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
    } finally {
      this.loading.set(false);
    }
  }
}