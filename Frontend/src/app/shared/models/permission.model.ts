
export interface Permission {
    id?: number;
    code: string;
    name: string;
    category: string;
    description: string;
    isGranted: boolean;
    isActive?: boolean;
}


export interface PermissionCategory {
    name: string;
    icon: string;
    permissions: Permission[];
}


export interface UserPermissionsResponse {
    userId: number;
    userCode: string;
    userName: string;
    role: string;
    permissions: string[];
    allPermissions: Permission[];
    grantedCount: number;
    totalCount: number;
}


export const PERMISSIONS = {

    USERS_VIEW: 'users.view',
    USERS_CREATE: 'users.create',
    USERS_EDIT: 'users.edit',
    USERS_DELETE: 'users.delete',


    SYSTEM_CONFIGURE: 'system.configure',
    PERMISSIONS_MANAGE: 'permissions.manage',
    SETTINGS_CHANGE: 'settings.change',


    MODULE_SETTINGS: 'module.settings',
    MODULE_REPORTS: 'module.reports',
    MODULE_MACHINES: 'module.machines',
    MODULE_DESIGN: 'module.design',
    MODULE_DOCUMENTS: 'module.documents',
    MODULE_INFORMATION: 'module.information',
    MODULE_UNIQUE_CONDITION: 'module.unique_condition',
    MODULE_ORDER_QUERY: 'module.order_query',


    ACTION_EXPORT: 'action.export',
    ACTION_IMPORT: 'action.import',
    ACTION_ADD_PROGRAMMING: 'action.add_programming',
    ACTION_CREATE: 'action.create',
    REPORTS_VIEW: 'reports.view',


    MACHINES_STATUS_PREALISTANDO: 'machines.status.prealistando',
    MACHINES_STATUS_LISTO: 'machines.status.listo',
    MACHINES_STATUS_CORRIENDO: 'machines.status.corriendo',
    MACHINES_STATUS_TERMINADO: 'machines.status.terminado',
    MACHINES_STATUS_SUSPENDIDO: 'machines.status.suspendido',
    MACHINES_SEND_MESSAGE: 'machines.send_message',
    MACHINES_PRINT: 'machines.print',

    // Diseño
    DESIGN_CREATE: 'design.create',
    DESIGN_EDIT: 'design.edit',
    DESIGN_DELETE: 'design.delete',
    DESIGN_IMPORT: 'design.import',
    DESIGN_EXPORT: 'design.export',

    // Reportes
    REPORTS_DELETE: 'reports.delete'
} as const;


export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];
