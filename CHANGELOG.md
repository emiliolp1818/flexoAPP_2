# Changelog

Todos los cambios notables en el proyecto FlexoAPP serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.2.0] - 2025-12-21

### 🧹 Limpieza y Reorganización Completa del Backend

#### Added (Agregado)
- **Documentación completa del proyecto**
  - `ANALISIS_PROYECTO_FLEXOAPP.txt` - Análisis técnico completo del sistema
  - `Database/README.md` - Documentación principal de scripts de base de datos
  - `Database/Setup/README.md` - Guía de configuración inicial
  - `Database/Migrations/README.md` - Guía de migraciones
  - `Database/Archive/README.md` - Información de scripts históricos
  - `Data/Scripts/README.md` - Documentación de scripts de datos
  - `PLAN_LIMPIEZA_BACKEND.md` - Plan detallado de limpieza
  - `RESUMEN_LIMPIEZA_COMPLETADA.md` - Resumen de acciones ejecutadas
  - `ESTRUCTURA_FINAL_BACKEND.md` - Estructura completa del backend
  - `REPORTE_LIMPIEZA_BACKEND.md` - Reporte visual de limpieza

- **Nueva estructura de carpetas organizadas**
  - `backend/Database/Setup/` - Scripts de configuración inicial de BD
  - `backend/Database/Migrations/` - Scripts de migración de BD
  - `backend/Database/Archive/` - Scripts históricos (solo referencia)

- **Nuevos servicios y componentes**
  - `backend/Services/ActivityLoggerService.cs` - Logger automático de actividades
  - `backend/Attributes/RequirePermissionAttribute.cs` - Atributo de autorización
  - `backend/Controllers/PermissionsController.cs` - Gestión de permisos
  - `backend/Controllers/SystemConfigController.cs` - Configuración del sistema
  - `backend/Models/Permissions/Permission.cs` - Modelo de permisos
  - `backend/Models/SystemConfig.cs` - Modelo de configuración

- **Servicios de Frontend**
  - `Frontend/src/app/core/services/language.service.ts` - Servicio de idiomas
  - `Frontend/src/app/core/services/notification.service.ts` - Servicio de notificaciones
  - `Frontend/src/app/core/services/session-timeout.service.ts` - Control de timeout
  - `Frontend/src/app/core/services/theme.service.ts` - Servicio de temas
  - `Frontend/src/app/core/services/time-format.service.ts` - Formato de hora

#### Changed (Modificado)
- **Reorganización de scripts SQL**
  - Movidos 4 scripts a `Database/Setup/` (configuración inicial)
  - Movidos 3 scripts a `Database/Migrations/` (migraciones)
  - Movidos 3 scripts a `Database/Archive/` (históricos)

- **Mejoras en controladores**
  - `backend/Controllers/ActivitiesController.cs` - Optimización de consultas
  - `backend/Controllers/AuthController.cs` - Mejoras en autenticación
  - `backend/Controllers/DesignsController.cs` - Optimización de diseños
  - `backend/Controllers/MaquinasController.cs` - Mejoras en gestión de máquinas
  - `backend/Controllers/PedidosController.cs` - Optimización de pedidos
  - `backend/Controllers/ReportsController.cs` - Mejoras en reportes
  - `backend/Controllers/UsersController.cs` - Optimización de usuarios

- **Actualizaciones en modelos**
  - `backend/Models/Entities/Maquina.cs` - Mejoras en modelo de máquina
  - `backend/Models/Entities/User.cs` - Mejoras en modelo de usuario
  - `backend/Data/Context/FlexoAPPDbContext.cs` - Optimización de contexto

- **Mejoras en servicios**
  - `backend/Services/IReportsService.cs` - Interfaz actualizada
  - `backend/Services/ReportsService.cs` - Servicio de reportes mejorado

- **Actualizaciones en Frontend**
  - `Frontend/src/app/app.config.ts` - Configuración actualizada
  - `Frontend/src/app/app.ts` - Componente principal mejorado
  - `Frontend/src/app/auth/login/login.ts` - Login optimizado
  - `Frontend/src/app/auth/profile/profile.ts` - Perfil mejorado
  - `Frontend/src/app/auth/settings/settings.ts` - Configuración actualizada
  - `Frontend/src/app/core/services/auth.service.ts` - Servicio de auth mejorado
  - `Frontend/src/app/shared/components/header/header.ts` - Header actualizado
  - `Frontend/src/app/shared/components/reports/reports.ts` - Reportes mejorados
  - `Frontend/src/styles.scss` - Estilos globales actualizados

#### Removed (Eliminado)
- **Archivos de prueba (6 archivos)**
  - `backend/Database/INSERT_ACTIVITIES_TEST_DATA.sql`
  - `backend/Database/INSERT_USER_ACTIVITIES_TEST_DATA.sql`
  - `backend/Database/INSERT_USER_ACTIVITIES_TEST_DATA_MYSQL.sql`
  - `backend/Database/test-insert.sql`
  - `backend/Database/test_designs_table.sql`
  - `backend/Database/02_insertar_datos_prueba.sql`

- **Servicios obsoletos (2 archivos)**
  - `backend/Services/RealTimeSyncService.cs` (archivo vacío)
  - `backend/Services/MachineBackupService.cs.disabled` (servicio deshabilitado)

- **Scripts SQL obsoletos (22 archivos)**
  - `backend/Database/02_fix_primary_key_designs.sql`
  - `backend/Database/02_fix_primary_key_maquinas.sql`
  - `backend/Database/03_add_id_primary_key.sql`
  - `backend/Database/03_verificar_datos.sql`
  - `backend/Database/04_permitir_estado_vacio.sql`
  - `backend/Database/04_remove_unique_key.sql`
  - `backend/Database/05_allow_null_estado.sql`
  - `backend/Database/05_verificar_y_limpiar_estados.sql`
  - `backend/Database/BACKUP_AND_FIX_MAQUINAS.sql`
  - `backend/Database/CHECK_MAQUINAS_COLUMNS.sql`
  - `backend/Database/EJECUTAR_AHORA_ESTADOS.sql`
  - `backend/Database/EJECUTAR_ESTO_PRIMERO.sql`
  - `backend/Database/FIX_MAQUINAS_TABLE.sql`
  - `backend/Database/LIMPIAR_TODOS_ESTADOS.sql`
  - `backend/Database/SOLUCION_COMPLETA_MAQUINAS.sql`
  - `backend/Database/UPDATE_USERS_TABLE.sql`
  - `backend/Database/check_recent_data.sql`
  - `backend/Database/diagnostico.sql`
  - Y otros scripts temporales y de diagnóstico

- **Documentación obsoleta (6 archivos)**
  - `backend/APPSETTINGS_DOCUMENTACION.md`
  - `backend/Database/EJECUTAR_FIX_PRIMARY_KEY.md`
  - `backend/Database/EJECUTAR_FIX_PRIMARY_KEY_DESIGNS.md`
  - `backend/Database/README_MIGRACION_DESIGNS.md`
  - `backend/Database/EJECUTAR_MIGRACION.ps1`
  - Y otros archivos de documentación temporal

- **Archivos de documentación raíz obsoletos (6 archivos)**
  - `COMPILACION_COMPLETA_EXITOSA.md`
  - `COMPILACION_EXITOSA.md`
  - `DIAGNOSTICO_FOTOS_DIFERENTES.md`
  - `DIAGNOSTICO_FOTO_PERFIL.md`
  - `ELIMINACION_PESTANA_MAQUINAS.md`
  - `FIX_ELIMINACION_USUARIOS.md`
  - `MODULO_REPORTES_ESTADO.md`
  - `RESUMEN_COMPILACION_FRONTEND.md`
  - `RESUMEN_GITHUB.md`
  - `SUBIDA_GITHUB_EXITOSA.md`

#### Fixed (Corregido)
- Estructura de carpetas desorganizada en `backend/Database/`
- Archivos de prueba mezclados con código de producción
- Falta de documentación en carpetas críticas
- Scripts SQL sin organización clara
- Servicios deshabilitados sin eliminar

#### Security (Seguridad)
- Eliminados archivos de prueba que podrían contener datos sensibles
- Limpieza de scripts SQL temporales con posibles credenciales

---

## [2.1.0] - 2025-12-20

### Changed
- Limpieza parcial del módulo de reportes - TypeScript completado
- Documentación del estado del módulo de reportes

### Fixed
- Corrección de eliminación física de usuarios en base de datos

---

## [2.0.0] - 2025-12-19

### Added
- Sistema completo de gestión flexográfica
- Backend en ASP.NET Core 8.0 con MySQL
- Frontend en Angular 20.3.x
- Sistema de autenticación JWT
- Gestión de máquinas, diseños y pedidos
- Sistema de reportes y estadísticas
- Gestión de documentos con conversión a PDF
- Sistema de actividades y auditoría

---

## Estadísticas de la Versión 2.2.0

- **Archivos modificados:** 103
- **Líneas agregadas:** 9,814 (+)
- **Líneas eliminadas:** 5,803 (-)
- **Archivos eliminados:** 32
- **Archivos reorganizados:** 10
- **Documentación nueva:** 10 archivos
- **Espacio liberado:** ~450 KB

---

## Notas de Migración

### De 2.1.0 a 2.2.0

#### Backend
1. **Estructura de Database reorganizada**
   - Los scripts de setup ahora están en `Database/Setup/`
   - Los scripts de migración están en `Database/Migrations/`
   - Los scripts históricos están en `Database/Archive/`

2. **Nuevos servicios disponibles**
   - `ActivityLoggerService` para logging automático de actividades
   - `PermissionsController` para gestión de permisos
   - `SystemConfigController` para configuración del sistema

3. **Archivos eliminados**
   - Si tenías referencias a archivos de prueba, actualiza tus scripts
   - Los servicios deshabilitados fueron eliminados permanentemente

#### Frontend
1. **Nuevos servicios core**
   - Servicios de idioma, notificaciones, temas y formato de tiempo disponibles
   - Actualiza imports si usabas servicios antiguos

2. **Estilos actualizados**
   - Revisa `styles.scss` para nuevos estilos globales
   - Sistema de temas implementado

---

## Contribuidores

- **Equipo FlexoAPP** - Desarrollo y mantenimiento

---

## Enlaces

- **Repositorio:** https://github.com/emiliolp1818/flexoAPP_2
- **Documentación:** Ver archivos README en cada carpeta
- **Issues:** https://github.com/emiliolp1818/flexoAPP_2/issues

---

## Licencia

Este proyecto es privado y propiedad de FlexoAPP Team.
