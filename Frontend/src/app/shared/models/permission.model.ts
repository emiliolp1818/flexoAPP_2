/**
 * Modelo de Permiso del Sistema
 * Representa un permiso que puede ser concedido a usuarios
 */
export interface Permission {
    id?: number;
    code: string;           // Código único (ej: 'users.view', 'modules.machines')
    name: string;           // Nombre descriptivo
    category: string;       // Categoría para agrupar (users, system, modules, actions)
    description: string;    // Descripción detallada
    isGranted: boolean;     // Si el usuario tiene este permiso concedido
    isActive?: boolean;     // Si el permiso está activo en el sistema
}

/**
 * Categoría de Permisos
 * Agrupa permisos relacionados para mejor organización en la UI
 */
export interface PermissionCategory {
    name: string;           // Nombre de la categoría
    icon: string;           // Icono Material para la categoría
    permissions: Permission[];  // Permisos de esta categoría
}

/**
 * Respuesta del API al obtener permisos de un usuario
 */
export interface UserPermissionsResponse {
    userId: number;
    userCode: string;
    userName: string;
    role: string;
    permissions: string[];  // Array de códigos de permisos concedidos
    allPermissions: Permission[];  // Todos los permisos del sistema
    grantedCount: number;
    totalCount: number;
}

/**
 * Códigos de Permisos del Sistema
 * Constantes para referenciar permisos en el código
 */
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
    REPORTS_VIEW: 'reports.view',

    // Acciones del Módulo de Máquinas
    MACHINES_STATUS_PREALISTANDO: 'machines.status.prealistando',
    MACHINES_STATUS_LISTO: 'machines.status.listo',
    MACHINES_STATUS_CORRIENDO: 'machines.status.corriendo',
    MACHINES_STATUS_TERMINADO: 'machines.status.terminado',
    MACHINES_STATUS_SUSPENDIDO: 'machines.status.suspendido',
    MACHINES_SEND_MESSAGE: 'machines.send_message',
    MACHINES_PRINT: 'machines.print'
} as const;

/**
 * Tipo para códigos de permisos (type-safe)
 */
export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];
