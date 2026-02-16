# 🔐 Sistema de Gestión de Permisos con Toggles Visuales

## 📋 Especificación de Requisitos

### **Permisos a Implementar:**

#### **1. Gestión de Usuarios**
- ✅ Ver usuarios
- ✅ Crear usuarios
- ✅ Editar usuarios
- ✅ Eliminar usuarios

#### **2. Configuración del Sistema**
- ✅ Configurar sistema
- ✅ Gestión de permisos
- ✅ Cambiar ajustes

#### **3. Acceso a Módulos**
- ✅ Acceso a módulo de configuraciones
- ✅ Acceso a módulo de reportes
- ✅ Acceso a módulo de máquinas
- ✅ Acceso a módulo de diseño
- ✅ Acceso a módulo de documentos
- ✅ Acceso a módulo de información
- ✅ Acceso a módulo de condición única
- ✅ Acceso a módulo de consulta de pedido

#### **4. Acciones Específicas**
- ✅ Acceso al botón de exportar
- ✅ Acceso al botón de importar
- ✅ Acceso al botón de agregar programación
- ✅ Acceso al botón de crear
- ✅ Ver reportes

### **Diseño Visual:**

**Toggle Switch (Botón de Encendido/Apagado):**
- 🔴 **Rojo** = Desactivado (permiso denegado)
- 🟢 **Verde** = Activado (permiso concedido)
- **Estilo:** Pequeño, didáctico, estilo Material Design

### **Comportamiento:**

1. **Visibilidad:** Todos los roles pueden VER los permisos
2. **Edición:** Solo el ADMIN puede activar/desactivar permisos
3. **Persistencia:** Los cambios se guardan en la base de datos
4. **Aplicación:** Los permisos se aplican inmediatamente en toda la aplicación

## 🗄️ Estructura de Datos

### **Backend (C#)**

#### **1. Modelo de Permisos**

```csharp
// backend/Models/Entities/Permission.cs
public class Permission
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;  // Código único del permiso
    public string Name { get; set; } = string.Empty;  // Nombre descriptivo
    public string Category { get; set; } = string.Empty;  // Categoría (Usuarios, Módulos, Acciones)
    public string Description { get; set; } = string.Empty;  // Descripción detallada
    public bool IsActive { get; set; } = true;  // Si el permiso está activo en el sistema
}
```

#### **2. Modelo de Permisos de Usuario**

```csharp
// backend/Models/Entities/UserPermission.cs
public class UserPermission
{
    public int Id { get; set; }
    public int UserId { get; set; }  // FK a Users
    public string PermissionCode { get; set; } = string.Empty;  // Código del permiso
    public bool IsGranted { get; set; } = false;  // Si el permiso está concedido
    public DateTime GrantedAt { get; set; }  // Cuándo se concedió
    public int? GrantedBy { get; set; }  // Quién lo concedió (FK a Users)
    
    // Navegación
    public virtual User User { get; set; }
    public virtual User? GrantedByUser { get; set; }
}
```

#### **3. Actualizar Modelo de Usuario**

```csharp
// Agregar a backend/Models/Entities/User.cs
public class User
{
    // ... propiedades existentes ...
    
    // Nueva propiedad para permisos
    public virtual ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
}
```

### **Frontend (TypeScript)**

#### **1. Interfaz de Permisos**

```typescript
// Frontend/src/app/shared/models/permission.model.ts
export interface Permission {
  code: string;           // Código único (ej: 'users.view', 'modules.machines')
  name: string;           // Nombre descriptivo
  category: string;       // Categoría para agrupar
  description: string;    // Descripción detallada
  isGranted: boolean;     // Si el usuario tiene este permiso
}

export interface PermissionCategory {
  name: string;           // Nombre de la categoría
  icon: string;           // Icono Material
  permissions: Permission[];  // Permisos de esta categoría
}
```

## 📊 Lista Completa de Permisos

### **Códigos de Permisos:**

```typescript
export const PERMISSIONS = {
  // Gestión de Usuarios
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  
  // Configuración del Sistema
  SYSTEM_CONFIGURE: 'system.configure',
  PERMISSIONS_MANAGE: 'permissions.manage',
  SETTINGS_CHANGE: 'settings.change',
  
  // Acceso a Módulos
  MODULE_SETTINGS: 'module.settings',
  MODULE_REPORTS: 'module.reports',
  MODULE_MACHINES: 'module.machines',
  MODULE_DESIGN: 'module.design',
  MODULE_DOCUMENTS: 'module.documents',
  MODULE_INFORMATION: 'module.information',
  MODULE_UNIQUE_CONDITION: 'module.unique_condition',
  MODULE_ORDER_QUERY: 'module.order_query',
  
  // Acciones Específicas
  ACTION_EXPORT: 'action.export',
  ACTION_IMPORT: 'action.import',
  ACTION_ADD_PROGRAMMING: 'action.add_programming',
  ACTION_CREATE: 'action.create',
  REPORTS_VIEW: 'reports.view'
};
```

## 🎨 Implementación del UI

### **1. HTML del Toggle de Permisos**

```html
<!-- settings.html - Nueva pestaña de Permisos -->
<mat-tab label="Permisos">
  <div class="permissions-container">
    <div class="permissions-header">
      <h2>
        <mat-icon>security</mat-icon>
        Gestión de Permisos
      </h2>
      <p class="description">
        Configure los permisos de acceso para cada rol de usuario.
        <span class="admin-note" *ngIf="!isAdmin()">
          ⚠️ Solo los administradores pueden modificar permisos
        </span>
      </p>
    </div>

    <!-- Selector de Usuario -->
    <mat-form-field appearance="outline" class="user-selector">
      <mat-label>Seleccionar Usuario</mat-label>
      <mat-select [(value)]="selectedUserForPermissions" (selectionChange)="loadUserPermissions()">
        <mat-option *ngFor="let user of users()" [value]="user.id">
          {{ user.firstName }} {{ user.lastName }} ({{ user.userCode }})
        </mat-option>
      </mat-select>
    </mat-form-field>

    <!-- Categorías de Permisos -->
    <div class="permissions-categories" *ngIf="selectedUserForPermissions">
      <mat-expansion-panel *ngFor="let category of permissionCategories" class="permission-category">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>{{ category.icon }}</mat-icon>
            {{ category.name }}
          </mat-panel-title>
          <mat-panel-description>
            {{ getGrantedCount(category) }} / {{ category.permissions.length }} activos
          </mat-panel-description>
        </mat-expansion-panel-header>

        <!-- Lista de Permisos -->
        <div class="permissions-list">
          <div *ngFor="let permission of category.permissions" class="permission-item">
            <div class="permission-info">
              <div class="permission-name">{{ permission.name }}</div>
              <div class="permission-description">{{ permission.description }}</div>
            </div>
            
            <!-- Toggle Switch -->
            <mat-slide-toggle
              [checked]="permission.isGranted"
              [disabled]="!isAdmin()"
              (change)="togglePermission(permission, $event.checked)"
              [color]="permission.isGranted ? 'primary' : 'warn'"
              class="permission-toggle">
              <span class="toggle-label" [class.granted]="permission.isGranted">
                {{ permission.isGranted ? 'Activo' : 'Inactivo' }}
              </span>
            </mat-slide-toggle>
          </div>
        </div>
      </mat-expansion-panel>
    </div>

    <!-- Mensaje si no hay usuario seleccionado -->
    <div class="no-user-selected" *ngIf="!selectedUserForPermissions">
      <mat-icon>person_search</mat-icon>
      <p>Selecciona un usuario para gestionar sus permisos</p>
    </div>
  </div>
</mat-tab>
```

### **2. SCSS para Toggles Visuales**

```scss
// settings.scss - Estilos para permisos
.permissions-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.permissions-header {
  margin-bottom: 32px;
  
  h2 {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 24px;
    font-weight: 500;
    margin: 0 0 8px 0;
    
    mat-icon {
      color: var(--primary-color);
    }
  }
  
  .description {
    color: var(--text-secondary);
    margin: 0;
    
    .admin-note {
      display: block;
      margin-top: 8px;
      color: var(--warning-color);
      font-weight: 500;
    }
  }
}

.user-selector {
  width: 100%;
  max-width: 500px;
  margin-bottom: 24px;
}

.permissions-categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-category {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  
  mat-expansion-panel-header {
    background: var(--surface-color);
    
    mat-panel-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      
      mat-icon {
        color: var(--primary-color);
      }
    }
    
    mat-panel-description {
      color: var(--text-secondary);
    }
  }
}

.permissions-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.permission-info {
  flex: 1;
  
  .permission-name {
    font-weight: 500;
    font-size: 14px;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  .permission-description {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.permission-toggle {
  margin-left: 16px;
  
  // Estilo del toggle cuando está ACTIVO (verde)
  &.mat-slide-toggle-checked {
    ::ng-deep .mat-slide-toggle-bar {
      background-color: #4caf50 !important;  // Verde
    }
    
    ::ng-deep .mat-slide-toggle-thumb {
      background-color: #ffffff !important;
    }
  }
  
  // Estilo del toggle cuando está INACTIVO (rojo)
  &:not(.mat-slide-toggle-checked) {
    ::ng-deep .mat-slide-toggle-bar {
      background-color: #f44336 !important;  // Rojo
    }
    
    ::ng-deep .mat-slide-toggle-thumb {
      background-color: #ffffff !important;
    }
  }
  
  // Estilo cuando está deshabilitado (solo lectura)
  &.mat-slide-toggle-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .toggle-label {
    font-size: 12px;
    font-weight: 500;
    margin-left: 8px;
    color: var(--text-secondary);
    
    &.granted {
      color: #4caf50;  // Verde cuando está activo
    }
  }
}

.no-user-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  color: var(--text-secondary);
  
  mat-icon {
    font-size: 64px;
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 16px;
    margin: 0;
  }
}
```

### **3. TypeScript - Lógica de Permisos**

```typescript
// settings.ts - Agregar al componente existente

export class SettingsComponent implements OnInit, OnDestroy {
  // ... propiedades existentes ...
  
  // Nuevas propiedades para permisos
  selectedUserForPermissions = signal<number | null>(null);
  permissionCategories = signal<PermissionCategory[]>([]);
  
  /**
   * Inicializar categorías de permisos
   */
  private initializePermissionCategories() {
    this.permissionCategories.set([
      {
        name: 'Gestión de Usuarios',
        icon: 'people',
        permissions: [
          { code: 'users.view', name: 'Ver usuarios', category: 'users', description: 'Permite ver la lista de usuarios del sistema', isGranted: false },
          { code: 'users.create', name: 'Crear usuarios', category: 'users', description: 'Permite crear nuevos usuarios', isGranted: false },
          { code: 'users.edit', name: 'Editar usuarios', category: 'users', description: 'Permite modificar información de usuarios existentes', isGranted: false },
          { code: 'users.delete', name: 'Eliminar usuarios', category: 'users', description: 'Permite eliminar usuarios del sistema', isGranted: false }
        ]
      },
      {
        name: 'Configuración del Sistema',
        icon: 'settings',
        permissions: [
          { code: 'system.configure', name: 'Configurar sistema', category: 'system', description: 'Permite modificar configuraciones generales del sistema', isGranted: false },
          { code: 'permissions.manage', name: 'Gestión de permisos', category: 'system', description: 'Permite administrar permisos de usuarios', isGranted: false },
          { code: 'settings.change', name: 'Cambiar ajustes', category: 'system', description: 'Permite modificar ajustes de la aplicación', isGranted: false }
        ]
      },
      {
        name: 'Acceso a Módulos',
        icon: 'apps',
        permissions: [
          { code: 'module.settings', name: 'Módulo de configuraciones', category: 'modules', description: 'Acceso al módulo de configuraciones', isGranted: false },
          { code: 'module.reports', name: 'Módulo de reportes', category: 'modules', description: 'Acceso al módulo de reportes', isGranted: false },
          { code: 'module.machines', name: 'Módulo de máquinas', category: 'modules', description: 'Acceso al módulo de máquinas', isGranted: false },
          { code: 'module.design', name: 'Módulo de diseño', category: 'modules', description: 'Acceso al módulo de diseño', isGranted: false },
          { code: 'module.documents', name: 'Módulo de documentos', category: 'modules', description: 'Acceso al módulo de documentos', isGranted: false },
          { code: 'module.information', name: 'Módulo de información', category: 'modules', description: 'Acceso al módulo de información', isGranted: false },
          { code: 'module.unique_condition', name: 'Módulo de condición única', category: 'modules', description: 'Acceso al módulo de condición única', isGranted: false },
          { code: 'module.order_query', name: 'Módulo de consulta de pedido', category: 'modules', description: 'Acceso al módulo de consulta de pedido', isGranted: false }
        ]
      },
      {
        name: 'Acciones Específicas',
        icon: 'touch_app',
        permissions: [
          { code: 'action.export', name: 'Botón de exportar', category: 'actions', description: 'Permite usar la función de exportar datos', isGranted: false },
          { code: 'action.import', name: 'Botón de importar', category: 'actions', description: 'Permite usar la función de importar datos', isGranted: false },
          { code: 'action.add_programming', name: 'Botón de agregar programación', category: 'actions', description: 'Permite agregar nuevas programaciones', isGranted: false },
          { code: 'action.create', name: 'Botón de crear', category: 'actions', description: 'Permite usar botones de creación', isGranted: false },
          { code: 'reports.view', name: 'Ver reportes', category: 'actions', description: 'Permite visualizar reportes del sistema', isGranted: false }
        ]
      }
    ]);
  }
  
  /**
   * Verificar si el usuario actual es admin
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role?.toLowerCase() === 'admin';
  }
  
  /**
   * Cargar permisos del usuario seleccionado
   */
  async loadUserPermissions() {
    const userId = this.selectedUserForPermissions();
    if (!userId) return;
    
    try {
      const response = await this.http.get<any>(`${environment.apiUrl}/auth/users/${userId}/permissions`).toPromise();
      
      if (response && response.permissions) {
        // Actualizar estado de permisos
        const categories = this.permissionCategories();
        const updatedCategories = categories.map(category => ({
          ...category,
          permissions: category.permissions.map(permission => ({
            ...permission,
            isGranted: response.permissions.includes(permission.code)
          }))
        }));
        
        this.permissionCategories.set(updatedCategories);
      }
    } catch (error) {
      console.error('Error cargando permisos del usuario:', error);
      this.snackBar.open('Error al cargar permisos del usuario', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
  
  /**
   * Alternar permiso
   */
  async togglePermission(permission: Permission, isGranted: boolean) {
    if (!this.isAdmin()) {
      this.snackBar.open('Solo los administradores pueden modificar permisos', 'Cerrar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }
    
    const userId = this.selectedUserForPermissions();
    if (!userId) return;
    
    try {
      await this.http.put(`${environment.apiUrl}/auth/users/${userId}/permissions`, {
        permissionCode: permission.code,
        isGranted: isGranted
      }).toPromise();
      
      // Actualizar localmente
      const categories = this.permissionCategories();
      const updatedCategories = categories.map(category => ({
        ...category,
        permissions: category.permissions.map(p =>
          p.code === permission.code ? { ...p, isGranted } : p
        )
      }));
      
      this.permissionCategories.set(updatedCategories);
      
      this.snackBar.open(
        `Permiso "${permission.name}" ${isGranted ? 'activado' : 'desactivado'}`,
        'Cerrar',
        {
          duration: 2000,
          panelClass: [isGranted ? 'success-snackbar' : 'info-snackbar']
        }
      );
    } catch (error) {
      console.error('Error actualizando permiso:', error);
      this.snackBar.open('Error al actualizar permiso', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      
      // Revertir cambio
      await this.loadUserPermissions();
    }
  }
  
  /**
   * Obtener cantidad de permisos concedidos en una categoría
   */
  getGrantedCount(category: PermissionCategory): number {
    return category.permissions.filter(p => p.isGranted).length;
  }
}
```

## 🔧 Limpieza de Mensajes de Ejemplo

### **Login Component**

Eliminar mensajes de ejemplo en:
- `Frontend/src/app/auth/login/login.ts`
- `Frontend/src/app/auth/login/login.html`

### **Profile Component**

Eliminar mensajes de ejemplo en:
- `Frontend/src/app/auth/profile/profile.ts`
- `Frontend/src/app/auth/profile/profile.html`

## 📝 Próximos Pasos

1. ✅ Revisar esta especificación
2. ✅ Confirmar que el diseño cumple con los requisitos
3. ✅ Implementar backend (modelos, endpoints)
4. ✅ Implementar frontend (UI, lógica)
5. ✅ Limpiar mensajes de ejemplo
6. ✅ Probar funcionalidad completa
7. ✅ Guardar en Git y hacer push a render

¿Quieres que proceda con la implementación completa?
