namespace FlexoAPP.API.Models.Permissions
{



    public static class Permission
    {

        public const string ViewUsers = "users.view";
        public const string CreateUsers = "users.create";
        public const string EditUsers = "users.edit";
        public const string DeleteUsers = "users.delete";
        public const string ManagePermissions = "users.manage_permissions";


        public const string ViewDesigns = "designs.view";
        public const string CreateDesigns = "designs.create";
        public const string EditDesigns = "designs.edit";
        public const string DeleteDesigns = "designs.delete";
        public const string ExportDesigns = "designs.export";


        public const string ViewMachines = "machines.view";
        public const string CreateMachines = "machines.create";
        public const string EditMachines = "machines.edit";
        public const string DeleteMachines = "machines.delete";
        public const string ManageMachinePrograms = "machines.manage_programs";


        public const string ViewReports = "reports.view";
        public const string ExportReports = "reports.export";
        public const string ViewAdvancedReports = "reports.advanced";


        public const string ViewSettings = "settings.view";
        public const string EditSettings = "settings.edit";
        public const string ViewSystemConfigs = "settings.system_configs";
        public const string EditSystemConfigs = "settings.edit_system_configs";


        public const string ViewActivities = "activities.view";
        public const string ViewAllActivities = "activities.view_all";
        public const string DeleteActivities = "activities.delete";


        public const string ViewDocuments = "documents.view";
        public const string UploadDocuments = "documents.upload";
        public const string DeleteDocuments = "documents.delete";


        public const string ImportMachinePrograms = "import.machine_programs";
        public const string ImportDesigns = "import.designs";
        public const string ImportDocuments = "import.documents";
        public const string ImportData = "import.data";




        public static List<string> GetAllPermissions()
        {
            return new List<string>
            {

                ViewUsers, CreateUsers, EditUsers, DeleteUsers, ManagePermissions,


                ViewDesigns, CreateDesigns, EditDesigns, DeleteDesigns, ExportDesigns,


                ViewMachines, CreateMachines, EditMachines, DeleteMachines, ManageMachinePrograms,


                ViewReports, ExportReports, ViewAdvancedReports,


                ViewSettings, EditSettings, ViewSystemConfigs, EditSystemConfigs,


                ViewActivities, ViewAllActivities, DeleteActivities,


                ViewDocuments, UploadDocuments, DeleteDocuments,


                ImportMachinePrograms, ImportDesigns, ImportDocuments, ImportData
            };
        }




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




        public static string GetPermissionDescription(string permission)
        {
            return permission switch
            {

                ViewUsers => "Ver usuarios",
                CreateUsers => "Crear usuarios",
                EditUsers => "Editar usuarios",
                DeleteUsers => "Eliminar usuarios",
                ManagePermissions => "Gestionar permisos",


                ViewDesigns => "Ver diseños",
                CreateDesigns => "Crear diseños",
                EditDesigns => "Editar diseños",
                DeleteDesigns => "Eliminar diseños",
                ExportDesigns => "Exportar diseños",


                ViewMachines => "Ver máquinas",
                CreateMachines => "Crear máquinas",
                EditMachines => "Editar máquinas",
                DeleteMachines => "Eliminar máquinas",
                ManageMachinePrograms => "Gestionar programas de máquinas",


                ViewReports => "Ver reportes",
                ExportReports => "Exportar reportes",
                ViewAdvancedReports => "Ver reportes avanzados",


                ViewSettings => "Ver configuraciones",
                EditSettings => "Editar configuraciones",
                ViewSystemConfigs => "Ver configuraciones del sistema",
                EditSystemConfigs => "Editar configuraciones del sistema",


                ViewActivities => "Ver actividades propias",
                ViewAllActivities => "Ver todas las actividades",
                DeleteActivities => "Eliminar actividades",


                ViewDocuments => "Ver documentos",
                UploadDocuments => "Subir documentos",
                DeleteDocuments => "Eliminar documentos",


                ImportMachinePrograms => "Importar programaciones de máquinas",
                ImportDesigns => "Importar diseños",
                ImportDocuments => "Importar documentos",
                ImportData => "Importar datos generales",

                _ => permission
            };
        }




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
