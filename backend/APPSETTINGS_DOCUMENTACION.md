# 📋 Documentación de appsettings.json

Este archivo explica cada configuración del archivo `appsettings.json` de FlexoAPP.

---

## 🗄️ ConnectionStrings

Cadenas de conexión a la base de datos MySQL.

### DefaultConnection
```
Server=localhost;Port=3306;Database=flexoapp_bd;User=root;Password=12345;AllowUserVariables=True;UseAffectedRows=False;
```

**Parámetros:**
- **Server**: `localhost` - Dirección del servidor MySQL (este equipo)
- **Port**: `3306` - Puerto de MySQL (puerto por defecto)
- **Database**: `flexoapp_bd` - Nombre de la base de datos
- **User**: `root` - Usuario de MySQL (administrador)
- **Password**: `12345` - Contraseña del usuario MySQL
- **AllowUserVariables**: `True` - Permite usar variables de usuario en consultas SQL
- **UseAffectedRows**: `False` - Retorna el número de filas encontradas en lugar de filas afectadas

### LocalConnection
Cadena de conexión alternativa (misma configuración que DefaultConnection).
Se mantiene por compatibilidad con código legacy.

---

## 🔐 JwtSettings

Configuración de autenticación JWT (JSON Web Tokens).

- **SecretKey**: `"FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable"`
  - Clave secreta para firmar los tokens JWT
  - ⚠️ IMPORTANTE: Cambiar en producción por una clave más segura

- **Issuer**: `"FlexoAPP"`
  - Emisor del token (quién lo genera)

- **Audience**: `"FlexoAPP-Users"`
  - Audiencia del token (para quién está destinado)

- **ExpirationMinutes**: `1440` (24 horas)
  - Tiempo de expiración del token de acceso en minutos

- **RefreshTokenExpirationDays**: `90` (3 meses)
  - Tiempo de expiración del refresh token en días

- **AutoRefreshMinutes**: `60` (1 hora)
  - Tiempo antes de la expiración para refrescar automáticamente el token

- **RememberMeExpirationDays**: `365` (1 año)
  - Tiempo de expiración cuando el usuario selecciona "Recordarme"

---

## 📝 Logging

Configuración del sistema de logging (registro de eventos).

### LogLevel
Niveles de registro para diferentes componentes:

- **Default**: `"Information"`
  - Nivel por defecto para todos los logs
  - Opciones: Trace, Debug, Information, Warning, Error, Critical

- **Microsoft.AspNetCore**: `"Warning"`
  - Solo registra advertencias y errores de ASP.NET Core
  - Reduce el ruido en los logs

- **Microsoft.EntityFrameworkCore**: `"Warning"`
  - Solo registra advertencias y errores de Entity Framework
  - Evita logs excesivos de consultas SQL

- **FlexoAPP**: `"Information"`
  - Registra información detallada de la aplicación FlexoAPP

---

## 🌐 AllowedHosts

- **AllowedHosts**: `"*"`
  - Permite conexiones desde cualquier host
  - En producción, especificar hosts permitidos: `"example.com;www.example.com"`

---

## 🔌 Urls

- **Urls**: `"http://0.0.0.0:7003"`
  - URL donde el servidor escucha peticiones
  - `0.0.0.0` = Escucha en todas las interfaces de red (permite acceso desde la red local)
  - `7003` = Puerto del servidor
  - ⚠️ Para solo localhost usar: `"http://localhost:7003"`

---

## ⚙️ FlexoAPP

Configuración específica de la aplicación FlexoAPP.

### Información General

- **ApplicationName**: `"FlexoAPP - Sistema de Gestión Flexográfica"`
  - Nombre completo de la aplicación

- **Version**: `"2.0.0"`
  - Versión actual de la aplicación

- **Environment**: `"Production"`
  - Entorno de ejecución (Development, Staging, Production)

### Features (Características)

Habilitar/deshabilitar características de la aplicación:

- **EnableSwagger**: `true`
  - Habilita la documentación interactiva de la API en `/swagger`
  - ⚠️ Deshabilitar en producción por seguridad

- **EnableSignalR**: `true`
  - Habilita comunicación en tiempo real con WebSockets

- **EnableAudit**: `true`
  - Habilita el registro de auditoría de acciones de usuarios

- **EnableExcelImport**: `true`
  - Habilita la importación de datos desde archivos Excel

- **EnableAutoReconnect**: `true`
  - Habilita reconexión automática a la base de datos

- **EnableKeepAlive**: `true`
  - Mantiene la conexión activa con pings periódicos

- **EnableHealthChecks**: `true`
  - Habilita endpoints de verificación de salud (`/health`)

- **EnableMachineBackup**: `true`
  - Habilita el sistema de respaldo de máquinas

### Stability (Estabilidad)

Configuración para mejorar la estabilidad de la aplicación:

- **EnableConnectionPooling**: `true`
  - Habilita pool de conexiones a la base de datos
  - Mejora el rendimiento reutilizando conexiones

- **EnableRetryPolicy**: `true`
  - Habilita política de reintentos automáticos

- **MaxRetryAttempts**: `5`
  - Número máximo de reintentos en caso de error

- **RetryDelaySeconds**: `2`
  - Tiempo de espera entre reintentos (en segundos)

- **HealthCheckIntervalSeconds**: `30`
  - Intervalo de verificación de salud (en segundos)

- **AutoRestartOnFailure**: `true`
  - Reinicia automáticamente servicios en caso de fallo

---

## 💾 BackupSettings

Configuración del sistema de respaldo de datos.

### Configuración General

- **Path**: `"./Backups/Machines"`
  - Ruta donde se guardan los respaldos
  - Relativa al directorio de la aplicación

- **AutoBackupEnabled**: `true`
  - Habilita respaldos automáticos programados

- **AutoBackupIntervalHours**: `24`
  - Intervalo de respaldo automático (cada 24 horas)

- **MaxBackupRetentionDays**: `30`
  - Días de retención de respaldos (elimina respaldos más antiguos)

- **CompressBackups**: `true`
  - Comprime los respaldos para ahorrar espacio

- **VerifyIntegrityOnCreate**: `true`
  - Verifica la integridad del respaldo después de crearlo

- **MaxBackupSizeMB**: `100`
  - Tamaño máximo de un respaldo en megabytes

- **BackupFormats**: `["zip", "json"]`
  - Formatos de respaldo disponibles
  - `zip`: Archivo comprimido
  - `json`: Archivo JSON sin comprimir

### NotificationSettings (Notificaciones)

Configuración de notificaciones de respaldo:

- **EnableEmailNotifications**: `false`
  - Habilita notificaciones por email
  - ⚠️ Requiere configurar servidor SMTP

- **NotifyOnSuccess**: `false`
  - Envía notificación cuando el respaldo es exitoso

- **NotifyOnFailure**: `true`
  - Envía notificación cuando el respaldo falla

- **EmailRecipients**: `[]`
  - Lista de emails que recibirán notificaciones
  - Ejemplo: `["admin@flexoapp.com", "backup@flexoapp.com"]`

---

## 🔧 Modificaciones Comunes

### Cambiar Puerto del Servidor

```json
"Urls": "http://0.0.0.0:8080"
```

### Cambiar Contraseña de MySQL

```json
"DefaultConnection": "Server=localhost;Port=3306;Database=flexoapp_bd;User=root;Password=NUEVA_CONTRASEÑA;..."
```

### Deshabilitar Swagger en Producción

```json
"EnableSwagger": false
```

### Cambiar Tiempo de Expiración del Token

```json
"ExpirationMinutes": 60
```
(1 hora en lugar de 24 horas)

### Habilitar Solo Localhost

```json
"Urls": "http://localhost:7003"
```

---

## ⚠️ Notas Importantes

1. **JSON no permite comentarios**: Los comentarios `//` no son válidos en JSON estándar
2. **Reiniciar después de cambios**: Siempre reinicia el backend después de modificar este archivo
3. **Seguridad**: Nunca subas este archivo a repositorios públicos (contiene contraseñas)
4. **Variables de entorno**: En producción, usa variables de entorno para datos sensibles
5. **Validación**: Usa un validador JSON online para verificar la sintaxis antes de guardar

---

## 📚 Referencias

- [ASP.NET Core Configuration](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
- [JWT Authentication](https://jwt.io/)
- [MySQL Connection Strings](https://www.connectionstrings.com/mysql/)
- [Serilog Logging](https://serilog.net/)

---

**Última actualización**: 2024
**Versión de FlexoAPP**: 2.0.0
