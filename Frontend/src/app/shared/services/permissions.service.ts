import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Permission, PermissionCategory, UserPermissionsResponse, PERMISSIONS } from '../models/permission.model';

/**
 * Servicio de Permisos
 * Gestiona los permisos de usuarios y verifica accesos
 */
@Injectable({
    providedIn: 'root'
})
export class PermissionsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/permissions`;

    // Estado reactivo de permisos del usuario actual
    private currentUserPermissions$ = new BehaviorSubject<string[]>([]);

    /**
     * Observable de permisos del usuario actual
     */
    get userPermissions$(): Observable<string[]> {
        return this.currentUserPermissions$.asObservable();
    }

    /**
     * Obtener todos los permisos del sistema
     */
    getAllPermissions(): Observable<Permission[]> {
        return this.http.get<Permission[]>(this.apiUrl);
    }

    /**
     * Obtener permisos por categoría
     */
    getPermissionsByCategory(category: string): Observable<Permission[]> {
        return this.http.get<Permission[]>(`${this.apiUrl}/category/${category}`);
    }

    /**
     * Obtener permisos de un usuario específico
     */
    getUserPermissions(userId: number): Observable<UserPermissionsResponse> {
        return this.http.get<UserPermissionsResponse>(`${this.apiUrl}/user/${userId}`);
    }

    /**
     * Cargar permisos del usuario actual
     */
    loadCurrentUserPermissions(userId: number): Observable<UserPermissionsResponse> {
        return this.getUserPermissions(userId).pipe(
            tap(response => {
                this.currentUserPermissions$.next(response.permissions);
                console.log(`🔐 Permisos del usuario cargados: ${response.grantedCount}/${response.totalCount}`);
            })
        );
    }

    /**
     * Actualizar permiso de un usuario
     */
    updateUserPermission(userId: number, permissionCode: string, isGranted: boolean, grantedBy?: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/user/${userId}`, {
            permissionCode,
            isGranted,
            grantedBy
        });
    }

    /**
     * Verificar si un usuario tiene un permiso específico
     */
    checkUserPermission(userId: number, permissionCode: string): Observable<{ hasPermission: boolean }> {
        return this.http.get<{ hasPermission: boolean }>(`${this.apiUrl}/user/${userId}/check/${permissionCode}`);
    }

    /**
     * Conceder todos los permisos a un usuario
     */
    grantAllPermissions(userId: number, grantedBy?: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/user/${userId}/grant-all`, { grantedBy });
    }

    /**
     * Revocar todos los permisos de un usuario
     */
    revokeAllPermissions(userId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/user/${userId}/revoke-all`, {});
    }

    /**
     * Verificar si el usuario actual tiene un permiso (desde cache local)
     */
    hasPermission(permissionCode: string): boolean {
        const permissions = this.currentUserPermissions$.value;
        return permissions.includes(permissionCode);
    }

    /**
     * Verificar si el usuario actual tiene alguno de los permisos especificados
     */
    hasAnyPermission(permissionCodes: string[]): boolean {
        const permissions = this.currentUserPermissions$.value;
        return permissionCodes.some(code => permissions.includes(code));
    }

    /**
     * Verificar si el usuario actual tiene todos los permisos especificados
     */
    hasAllPermissions(permissionCodes: string[]): boolean {
        const permissions = this.currentUserPermissions$.value;
        return permissionCodes.every(code => permissions.includes(code));
    }

    /**
     * Inicializar categorías de permisos con estructura predefinida
     */
    initializePermissionCategories(): PermissionCategory[] {
        return [
            {
                name: 'Gestión de Usuarios',
                icon: 'people',
                permissions: [
                    { code: PERMISSIONS.USERS_VIEW, name: 'Ver usuarios', category: 'users', description: 'Permite ver la lista de usuarios del sistema', isGranted: false },
                    { code: PERMISSIONS.USERS_CREATE, name: 'Crear usuarios', category: 'users', description: 'Permite crear nuevos usuarios', isGranted: false },
                    { code: PERMISSIONS.USERS_EDIT, name: 'Editar usuarios', category: 'users', description: 'Permite modificar información de usuarios existentes', isGranted: false },
                    { code: PERMISSIONS.USERS_DELETE, name: 'Eliminar usuarios', category: 'users', description: 'Permite eliminar usuarios del sistema', isGranted: false }
                ]
            },
            {
                name: 'Configuración del Sistema',
                icon: 'settings',
                permissions: [
                    { code: PERMISSIONS.SYSTEM_CONFIGURE, name: 'Configurar sistema', category: 'system', description: 'Permite modificar configuraciones generales del sistema', isGranted: false },
                    { code: PERMISSIONS.PERMISSIONS_MANAGE, name: 'Gestión de permisos', category: 'system', description: 'Permite administrar permisos de usuarios', isGranted: false },
                    { code: PERMISSIONS.SETTINGS_CHANGE, name: 'Cambiar ajustes', category: 'system', description: 'Permite modificar ajustes de la aplicación', isGranted: false }
                ]
            },
            {
                name: 'Acceso a Módulos',
                icon: 'apps',
                permissions: [
                    { code: PERMISSIONS.MODULE_SETTINGS, name: 'Módulo de configuraciones', category: 'modules', description: 'Acceso al módulo de configuraciones', isGranted: false },
                    { code: PERMISSIONS.MODULE_REPORTS, name: 'Módulo de reportes', category: 'modules', description: 'Acceso al módulo de reportes', isGranted: false },
                    { code: PERMISSIONS.MODULE_MACHINES, name: 'Módulo de máquinas', category: 'modules', description: 'Acceso al módulo de máquinas', isGranted: false },
                    { code: PERMISSIONS.MODULE_DESIGN, name: 'Módulo de diseño', category: 'modules', description: 'Acceso al módulo de diseño', isGranted: false },
                    { code: PERMISSIONS.MODULE_DOCUMENTS, name: 'Módulo de documentos', category: 'modules', description: 'Acceso al módulo de documentos', isGranted: false },
                    { code: PERMISSIONS.MODULE_INFORMATION, name: 'Módulo de información', category: 'modules', description: 'Acceso al módulo de información', isGranted: false },
                    { code: PERMISSIONS.MODULE_UNIQUE_CONDITION, name: 'Módulo de condición única', category: 'modules', description: 'Acceso al módulo de condición única', isGranted: false },
                    { code: PERMISSIONS.MODULE_ORDER_QUERY, name: 'Módulo de consulta de pedido', category: 'modules', description: 'Acceso al módulo de consulta de pedido', isGranted: false }
                ]
            },
            {
                name: 'Acciones Específicas',
                icon: 'touch_app',
                permissions: [
                    { code: PERMISSIONS.ACTION_EXPORT, name: 'Botón de exportar', category: 'actions', description: 'Permite usar la función de exportar datos', isGranted: false },
                    { code: PERMISSIONS.ACTION_IMPORT, name: 'Botón de importar', category: 'actions', description: 'Permite usar la función de importar datos', isGranted: false },
                    { code: PERMISSIONS.ACTION_ADD_PROGRAMMING, name: 'Botón de agregar programación', category: 'actions', description: 'Permite agregar nuevas programaciones', isGranted: false },
                    { code: PERMISSIONS.ACTION_CREATE, name: 'Botón de crear', category: 'actions', description: 'Permite usar botones de creación', isGranted: false },
                    { code: PERMISSIONS.REPORTS_VIEW, name: 'Ver reportes', category: 'actions', description: 'Permite visualizar reportes del sistema', isGranted: false }
                ]
            },
            {
                name: 'Acciones del Módulo de Máquinas',
                icon: 'precision_manufacturing',
                permissions: [
                    { code: PERMISSIONS.MACHINES_STATUS_PREALISTANDO, name: 'Cambiar a Prealistando', category: 'machines_actions', description: 'Permite cambiar el estado de una orden a Prealistando', isGranted: false },
                    { code: PERMISSIONS.MACHINES_STATUS_LISTO, name: 'Cambiar a Listo', category: 'machines_actions', description: 'Permite cambiar el estado de una orden a Listo', isGranted: false },
                    { code: PERMISSIONS.MACHINES_STATUS_CORRIENDO, name: 'Cambiar a Corriendo', category: 'machines_actions', description: 'Permite cambiar el estado de una orden a Corriendo', isGranted: false },
                    { code: PERMISSIONS.MACHINES_STATUS_TERMINADO, name: 'Cambiar a Terminado', category: 'machines_actions', description: 'Permite cambiar el estado de una orden a Terminado', isGranted: false },
                    { code: PERMISSIONS.MACHINES_STATUS_SUSPENDIDO, name: 'Cambiar a Suspendido', category: 'machines_actions', description: 'Permite cambiar el estado de una orden a Suspendido', isGranted: false },
                    { code: PERMISSIONS.MACHINES_SEND_MESSAGE, name: 'Enviar mensaje', category: 'machines_actions', description: 'Permite enviar mensajes en el módulo de máquinas', isGranted: false },
                    { code: PERMISSIONS.MACHINES_PRINT, name: 'Imprimir', category: 'machines_actions', description: 'Permite imprimir órdenes de trabajo', isGranted: false }
                ]
            }
        ];
    }

    /**
     * Limpiar permisos del usuario actual (al cerrar sesión)
     */
    clearPermissions(): void {
        this.currentUserPermissions$.next([]);
        console.log('🔐 Permisos del usuario limpiados');
    }
}
