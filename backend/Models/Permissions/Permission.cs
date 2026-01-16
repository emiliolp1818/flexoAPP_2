namespace FlexoAPP.API.Models.Permissions
{
    /// <summary>
    /// Permisos disponibles en el sistema FlexoAPP
    /// </summary>
    public static class Permission
    {
        // ===== USUARIOS =====
        public const string ViewUsers = "users.view";
        public const string CreateUsers = "users.create";
        public const string EditUsers = "users.edit";
        public const string DeleteUsers = "users.delete";
        public const string ManagePermissions = "users.manage_permissions";

        // ===== DISEÑOS =====
        public const string ViewDesigns = "designs.view";
        public const string CreateDesigns = "designs.create";
        public const string EditDesigns = "designs.edit";
        public const string DeleteDesigns = "designs.delete";
        public const string ExportDesigns = "designs.export";

        // ===== MÁQUINAS =====
        public const string ViewMachines = "machines.view";
        public const string CreateMachines = "machines.create";
        public const string EditMachines = "machines.edit";
        public const string DeleteMachines = "machines.delete";
        public const string ManageMachinePrograms = "machines.manage_programs";

        // ===== REPORTES =====
        public const string ViewReports = "reports.view";
        public const string ExportReports = "reports.export";
        public const string ViewAdvancedReports = "reports.advanced";

        // ===== CONFIGURACIONES =====
        public const string ViewSettings = "settings.view";
        public const string EditSettings = "settings.edit";
        public const string ViewSystemConfigs = "settings.system_configs";
        public const string EditSystemConfigs = "settings.edit_system_configs";

        // ===== ACTIVIDADES =====
        public const string ViewActivities = "activities.view";
        public const string ViewAllActivities = "activities.view_all";
        public const string DeleteActivities = "activities.delete";

        // ===== DOCUMENTOS =====
        public const string ViewDocuments = "documents.view";
        public const string UploadDocuments = "documents.upload";
        public const string DeleteDocuments = "documents.delete";

        // ===== IMPORTACIÓN =====
        public const string ImportMachinePrograms = "import.machine_programs";
        public const string ImportDesigns = "import.designs";
        public const string ImportDocuments = "import.documents";
        public const string ImportData = "import.data";

        /// <summary>
        /// Obtener todos los permisos disponibles
        /// </summary>
        public static List<string> GetAllPermissions()
        {
            return new List<string>
            {
                // Usuarios
                ViewUsers, CreateUsers, EditUsers, DeleteUsers, ManagePermissions,
                
                // Diseños
                ViewDesigns, CreateDesigns, EditDesigns, DeleteDesigns, ExportDesigns,
                
                // Máquinas
                ViewMachines, CreateMachines, EditMachines, DeleteMachines, ManageMachinePrograms,
                
                // Reportes
                ViewReports, ExportReports, ViewAdvancedReports,
                
                // Configuraciones
                ViewSettings, EditSettings, ViewSystemConfigs, EditSystemConfigs,
                
                // Actividades
                ViewActivities, ViewAllActivities, DeleteActivities,
                
                // Documentos
                ViewDocuments, UploadDocuments, DeleteDocuments,
                
                // Importación
                ImportMachinePrograms, ImportDesigns, ImportDocuments, ImportData
            };
        }

        /// <summary>
        /// Obtener permisos por defecto según el rol
        /// </summary>
        public static List<string> GetDefaultPermissionsByRole(string role)
        {
            return role.ToLower() switch
            {
                "admin" or "administrador" => GetAllPermissions(),
                
                "supervisor" => new List<string>
                {
                    ViewUsers, ViewDesigns, CreateDesigns, EditDesigns, ExportDesigns,
                    ViewMachines, CreateMachines, EditMachines, ManageMachinePrograms,
                    ViewReports, ExportReports, ViewAdvancedReports,
                    ViewSettings, ViewActivities, ViewAllActivities,
                    ViewDocuments, UploadDocuments,
                    ImportMachinePrograms, ImportDesigns, ImportDocuments, ImportData
                },
                
                "prealistador" or "pre-alistador" => new List<string>
                {
                    ViewDesigns, ViewMachines,
                    ViewReports, ViewActivities, ViewDocuments, UploadDocuments,
                    ImportMachinePrograms
                },
                
                "matizadores" or "matizador" => new List<string>
                {
                    ViewDesigns, CreateDesigns, EditDesigns,
                    ViewMachines,
                    ViewReports, ViewActivities, ViewDocuments,
                    ImportDesigns
                },
                
                "operario" => new List<string>
                {
                    ViewDesigns, ViewMachines,
                    ViewReports, ViewActivities, ViewDocuments
                },
                
                "retornos" => new List<string>
                {
                    ViewDesigns, ViewMachines,
                    ViewReports, ViewActivities, ViewDocuments
                },
                
                _ => new List<string> { ViewDesigns, ViewMachines, ViewReports }
            };
        }

        /// <summary>
        /// Obtener descripción del permiso
        /// </summary>
        public static string GetPermissionDescription(string permission)
        {
            return permission switch
            {
                // Usuarios
                ViewUsers => "Ver usuarios",
                CreateUsers => "Crear usuarios",
                EditUsers => "Editar usuarios",
                DeleteUsers => "Eliminar usuarios",
                ManagePermissions => "Gestionar permisos",
                
                // Diseños
                ViewDesigns => "Ver diseños",
                CreateDesigns => "Crear diseños",
                EditDesigns => "Editar diseños",
                DeleteDesigns => "Eliminar diseños",
                ExportDesigns => "Exportar diseños",
                
                // Máquinas
                ViewMachines => "Ver máquinas",
                CreateMachines => "Crear máquinas",
                EditMachines => "Editar máquinas",
                DeleteMachines => "Eliminar máquinas",
                ManageMachinePrograms => "Gestionar programas de máquinas",
                
                // Reportes
                ViewReports => "Ver reportes",
                ExportReports => "Exportar reportes",
                ViewAdvancedReports => "Ver reportes avanzados",
                
                // Configuraciones
                ViewSettings => "Ver configuraciones",
                EditSettings => "Editar configuraciones",
                ViewSystemConfigs => "Ver configuraciones del sistema",
                EditSystemConfigs => "Editar configuraciones del sistema",
                
                // Actividades
                ViewActivities => "Ver actividades propias",
                ViewAllActivities => "Ver todas las actividades",
                DeleteActivities => "Eliminar actividades",
                
                // Documentos
                ViewDocuments => "Ver documentos",
                UploadDocuments => "Subir documentos",
                DeleteDocuments => "Eliminar documentos",
                
                // Importación
                ImportMachinePrograms => "Importar programaciones de máquinas",
                ImportDesigns => "Importar diseños",
                ImportDocuments => "Importar documentos",
                ImportData => "Importar datos generales",
                
                _ => permission
            };
        }

        /// <summary>
        /// Obtener categoría del permiso
        /// </summary>
        public static string GetPermissionCategory(string permission)
        {
            if (permission.StartsWith("users.")) return "Usuarios";
            if (permission.StartsWith("designs.")) return "Diseños";
            if (permission.StartsWith("machines.")) return "Máquinas";
            if (permission.StartsWith("reports.")) return "Reportes";
            if (permission.StartsWith("settings.")) return "Configuraciones";
            if (permission.StartsWith("activities.")) return "Actividades";
            if (permission.StartsWith("documents.")) return "Documentos";
            if (permission.StartsWith("import.")) return "Importación";
            
            return "General";
        }
    }
}
