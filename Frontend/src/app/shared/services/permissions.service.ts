import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Permission, PermissionCategory, UserPermissionsResponse, PERMISSIONS } from '../models/permission.model';
export { PERMISSIONS };


@Injectable({
    providedIn: 'root'
})
export class PermissionsService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/permissions`;
    private readonly PERMS_KEY = 'flexoapp_permissions';

    public permissions = signal<string[]>([]);

    constructor() {
        // Restaurar permisos de localStorage al iniciar
        const stored = localStorage.getItem(this.PERMS_KEY);
        if (stored) {
            try {
                this.permissions.set(JSON.parse(stored));
            } catch { }
        }
    }

    private saveToStorage(perms: string[]) {
        this.permissions.set(perms);
        localStorage.setItem(this.PERMS_KEY, JSON.stringify(perms));
    }


    get userPermissions$(): Observable<string[]> {
        return new BehaviorSubject<string[]>(this.permissions()).asObservable();
    }


    getAllPermissions(): Observable<Permission[]> {
        return this.http.get<Permission[]>(this.apiUrl);
    }


    getPermissionsByCategory(category: string): Observable<Permission[]> {
        return this.http.get<Permission[]>(`${this.apiUrl}/category/${category}`);
    }


    getUserPermissions(userId: number): Observable<UserPermissionsResponse> {
        return this.http.get<UserPermissionsResponse>(`${this.apiUrl}/user/${userId}`);
    }


    loadCurrentUserPermissions(userId: number): Observable<UserPermissionsResponse> {
        console.log(`🔐 Iniciando carga de permisos para usuario ID: ${userId}...`);
        return this.getUserPermissions(userId).pipe(
            tap(response => {


                if (userId === 1 || response.role === 'Admin') {
                    const allPossibleCodes = response.allPermissions && response.allPermissions.length > 0
                        ? response.allPermissions.map(p => p.code)
                        : [];

                    if (allPossibleCodes.length > 0) {
                        this.saveToStorage(allPossibleCodes);
                    } else {
                        this.saveToStorage(response.permissions || []);
                    }
                } else {
                    this.saveToStorage(response.permissions || []);
                }
            })
        );
    }


    updateUserPermission(userId: number, permissionCode: string, isGranted: boolean, grantedBy?: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/user/${userId}`, {
            permissionCode,
            isGranted,
            grantedBy
        });
    }


    checkUserPermission(userId: number, permissionCode: string): Observable<{ hasPermission: boolean }> {
        return this.http.get<{ hasPermission: boolean }>(`${this.apiUrl}/user/${userId}/check/${permissionCode}`);
    }


    grantAllPermissions(userId: number, grantedBy?: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/user/${userId}/grant-all`, { grantedBy });
    }


    revokeAllPermissions(userId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/user/${userId}/revoke-all`, {});
    }

    hasPermission(permissionCode: string): boolean {
        const perms = this.permissions();
        return perms.includes(permissionCode);
    }

    hasAnyPermission(permissionCodes: string[]): boolean {
        const perms = this.permissions();
        return permissionCodes.some(code => perms.includes(code));
    }

    hasAllPermissions(permissionCodes: string[]): boolean {
        const perms = this.permissions();
        return permissionCodes.every(code => perms.includes(code));
    }


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
            },
            {
                name: 'Acciones del Módulo de Diseño',
                icon: 'design_services',
                permissions: [
                    { code: PERMISSIONS.DESIGN_CREATE, name: 'Crear diseños', category: 'design_actions', description: 'Permite crear nuevos diseños y registros de cod tintas', isGranted: false },
                    { code: PERMISSIONS.DESIGN_EDIT, name: 'Editar diseños', category: 'design_actions', description: 'Permite editar diseños, anilox y cod tintas existentes', isGranted: false },
                    { code: PERMISSIONS.DESIGN_DELETE, name: 'Eliminar diseños', category: 'design_actions', description: 'Permite eliminar diseños y registros', isGranted: false },
                    { code: PERMISSIONS.DESIGN_IMPORT, name: 'Importar diseños', category: 'design_actions', description: 'Permite importar diseños desde Excel', isGranted: false },
                    { code: PERMISSIONS.DESIGN_EXPORT, name: 'Exportar diseños', category: 'design_actions', description: 'Permite exportar diseños a Excel', isGranted: false }
                ]
            },
            {
                name: 'Acciones del Módulo de Reportes',
                icon: 'assessment',
                permissions: [
                    { code: PERMISSIONS.REPORTS_DELETE, name: 'Eliminar actividades', category: 'reports_actions', description: 'Permite eliminar registros de actividad del sistema', isGranted: false }
                ]
            }
        ];
    }

    clearPermissions(): void {
        this.permissions.set([]);
        localStorage.removeItem(this.PERMS_KEY);
    }
}
