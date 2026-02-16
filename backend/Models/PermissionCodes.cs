namespace FlexoAPP.API.Models
{
    /// <summary>
    /// Constantes para los códigos de permisos del sistema
    /// Debe coincidir con los códigos en el frontend y en la base de datos
    /// </summary>
    public static class PermissionCodes
    {
        // Gestión de Usuarios
        public const string USERS_VIEW = "users.view";
        public const string USERS_CREATE = "users.create";
        public const string USERS_EDIT = "users.edit";
        public const string USERS_DELETE = "users.delete";

        // Configuración del Sistema
        public const string SYSTEM_CONFIGURE = "system.configure";
        public const string PERMISSIONS_MANAGE = "permissions.manage";
        public const string SETTINGS_CHANGE = "settings.change";

        // Acceso a Módulos
        public const string MODULE_SETTINGS = "module.settings";
        public const string MODULE_REPORTS = "module.reports";
        public const string MODULE_MACHINES = "module.machines";
        public const string MODULE_DESIGN = "module.design";
        public const string MODULE_DOCUMENTS = "module.documents";
        public const string MODULE_INFORMATION = "module.information";
        public const string MODULE_UNIQUE_CONDITION = "module.unique_condition";
        public const string MODULE_ORDER_QUERY = "module.order_query";

        // Acciones Específicas
        public const string ACTION_EXPORT = "action.export";
        public const string ACTION_IMPORT = "action.import";
        public const string ACTION_ADD_PROGRAMMING = "action.add_programming";
        public const string ACTION_CREATE = "action.create";
        public const string REPORTS_VIEW = "reports.view";

        // Acciones del Módulo de Máquinas
        public const string MACHINES_STATUS_PREALISTANDO = "machines.status.prealistando";
        public const string MACHINES_STATUS_LISTO = "machines.status.listo";
        public const string MACHINES_STATUS_CORRIENDO = "machines.status.corriendo";
        public const string MACHINES_STATUS_TERMINADO = "machines.status.terminado";
        public const string MACHINES_STATUS_SUSPENDIDO = "machines.status.suspendido";
        public const string MACHINES_SEND_MESSAGE = "machines.send_message";
        public const string MACHINES_PRINT = "machines.print";
    }
}
