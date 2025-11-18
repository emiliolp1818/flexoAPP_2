# Explicación del archivo appsettings.Production.json

Este archivo contiene la configuración de la aplicación FlexoAPP para el entorno de producción en Railway.

## Estructura completa con explicaciones:

### 1. ConnectionStrings (Cadenas de Conexión)

```json
"ConnectionStrings": {
  "DefaultConnection": "${DATABASE_URL}"
}
```

**"ConnectionStrings"**: Sección que define las cadenas de conexión a bases de datos

**"DefaultConnection"**: Nombre de la conexión principal que usa la aplicación
- **"${DATABASE_URL}"**: Variable de entorno que Railway proporciona automáticamente
- Railway reemplaza esto con la cadena de conexión real de MySQL
- Formato esperado: `Server=host;Port=3306;Database=nombre;User=usuario;Password=contraseña;`

---

### 2. JwtSettings (Configuración de JWT)

```json
"JwtSettings": {
  "SecretKey": "${JWT_SECRET_KEY}",
  "Issuer": "FlexoAPP",
  "Audience": "FlexoAPP-Users",
  "ExpirationMinutes": 1440,
  "RefreshTokenExpirationDays": 90,
  "AutoRefreshMinutes": 60,
  "RememberMeExpirationDays": 365
}
```

**"JwtSettings"**: Configuración para autenticación con JSON Web Tokens

**"SecretKey": "${JWT_SECRET_KEY}"**: 
- Clave secreta para firmar y validar tokens JWT
- Se obtiene de variable de entorno por seguridad
- Debe ser una cadena larga y aleatoria (mínimo 32 caracteres)

**"Issuer": "FlexoAPP"**: 
- Emisor del token (quién lo creó)
- Se valida al recibir un token para verificar que fue emitido por esta aplicación

**"Audience": "FlexoAPP-Users"**: 
- Audiencia del token (para quién es)
- Se valida para asegurar que el token es para usuarios de FlexoAPP

**"ExpirationMinutes": 1440**: 
- Tiempo de expiración del token de acceso en minutos
- 1440 minutos = 24 horas
- Después de este tiempo, el usuario debe volver a autenticarse

**"RefreshTokenExpirationDays": 90**: 
- Tiempo de expiración del refresh token en días
- 90 días = 3 meses
- Permite renovar el token de acceso sin volver a hacer login

**"AutoRefreshMinutes": 60**: 
- Tiempo antes de expiración para refrescar automáticamente el token
- 60 minutos = 1 hora
- Si el token expira en menos de 1 hora, se renueva automáticamente

**"RememberMeExpirationDays": 365**: 
- Tiempo de expiración cuando el usuario marca "Recordarme"
- 365 días = 1 año
- Permite sesiones más largas para usuarios que confían en el dispositivo

---

### 3. Logging (Configuración de Logs)

```json
"Logging": {
  "LogLevel": {
    "Default": "Information",
    "Microsoft.AspNetCore": "Warning",
    "Microsoft.EntityFrameworkCore": "Information",
    "FlexoAPP": "Information"
  }
}
```

**"Logging"**: Configuración del sistema de logging (Serilog)

**"LogLevel"**: Niveles de detalle de los logs por categoría

**"Default": "Information"**: 
- Nivel de log por defecto para toda la aplicación
- "Information": registra eventos informativos, advertencias y errores
- Niveles disponibles: Trace, Debug, Information, Warning, Error, Critical

**"Microsoft.AspNetCore": "Warning"**: 
- Nivel de log para el framework ASP.NET Core
- "Warning": solo registra advertencias y errores (reduce ruido en logs)

**"Microsoft.EntityFrameworkCore": "Information"**: 
- Nivel de log para Entity Framework (acceso a base de datos)
- "Information": registra consultas SQL y operaciones de BD

**"FlexoAPP": "Information"**: 
- Nivel de log para código personalizado de FlexoAPP
- "Information": registra eventos importantes de la aplicación

---

### 4. AllowedHosts (Hosts Permitidos)

```json
"AllowedHosts": "*"
```

**"AllowedHosts": "*"**: 
- Lista de hosts permitidos para acceder a la aplicación
- "*": permite cualquier host (necesario para Railway que asigna URLs dinámicas)
- En producción estricta, se especificarían dominios concretos

---

### 5. Urls (URLs de Escucha)

```json
"Urls": "http://0.0.0.0:8080"
```

**"Urls": "http://0.0.0.0:8080"**: 
- URL y puerto donde la aplicación escucha peticiones
- "0.0.0.0": escucha en todas las interfaces de red (necesario para Docker)
- "8080": puerto estándar para Railway
- Railway redirige el tráfico externo a este puerto interno

---

### 6. FlexoAPP (Configuración de la Aplicación)

```json
"FlexoAPP": {
  "ApplicationName": "FlexoAPP - Sistema de Gestión Flexográfica",
  "Version": "2.0.0",
  "Environment": "Production"
}
```

**"ApplicationName"**: Nombre descriptivo de la aplicación

**"Version": "2.0.0"**: Versión actual de la aplicación

**"Environment": "Production"**: Entorno de ejecución (Production, Development, Staging)

---

### 7. Features (Características Habilitadas)

```json
"Features": {
  "EnableSwagger": false,
  "EnableSignalR": true,
  "EnableAudit": true,
  "EnableExcelImport": true,
  "EnableAutoReconnect": true,
  "EnableKeepAlive": true,
  "EnableHealthChecks": true,
  "EnableMachineBackup": true
}
```

**"EnableSwagger": false**: 
- Deshabilita Swagger (documentación de API) en producción por seguridad
- Swagger expone información sobre endpoints y modelos

**"EnableSignalR": true**: 
- Habilita SignalR para comunicación en tiempo real
- Usado para notificaciones y actualizaciones en vivo

**"EnableAudit": true**: 
- Habilita auditoría de acciones de usuarios
- Registra quién hizo qué y cuándo

**"EnableExcelImport": true**: 
- Habilita importación de archivos Excel
- Permite cargar datos masivos desde hojas de cálculo

**"EnableAutoReconnect": true**: 
- Habilita reconexión automática a la base de datos
- Útil si hay interrupciones temporales de red

**"EnableKeepAlive": true**: 
- Habilita keep-alive de conexiones HTTP
- Mantiene conexiones abiertas para mejor rendimiento

**"EnableHealthChecks": true**: 
- Habilita endpoints de health check (/health)
- Railway usa esto para verificar que la app está funcionando

**"EnableMachineBackup": true**: 
- Habilita sistema de backup de máquinas
- Crea copias de seguridad automáticas

---

### 8. Stability (Configuración de Estabilidad)

```json
"Stability": {
  "EnableConnectionPooling": true,
  "EnableRetryPolicy": true,
  "MaxRetryAttempts": 5,
  "RetryDelaySeconds": 2,
  "HealthCheckIntervalSeconds": 30,
  "AutoRestartOnFailure": true
}
```

**"EnableConnectionPooling": true**: 
- Habilita pool de conexiones a la base de datos
- Reutiliza conexiones existentes en lugar de crear nuevas
- Mejora rendimiento y reduce carga en la BD

**"EnableRetryPolicy": true**: 
- Habilita política de reintentos automáticos
- Si una operación falla, se reintenta automáticamente

**"MaxRetryAttempts": 5**: 
- Número máximo de reintentos antes de fallar
- 5 intentos: suficiente para errores transitorios

**"RetryDelaySeconds": 2**: 
- Tiempo de espera entre reintentos en segundos
- 2 segundos: balance entre rapidez y no saturar el sistema

**"HealthCheckIntervalSeconds": 30**: 
- Intervalo de verificación de salud en segundos
- 30 segundos: verifica cada medio minuto que todo funciona

**"AutoRestartOnFailure": true**: 
- Reinicia automáticamente servicios si fallan
- Mejora disponibilidad de la aplicación

---

### 9. BackupSettings (Configuración de Backups)

```json
"BackupSettings": {
  "Path": "./Backups/Machines",
  "AutoBackupEnabled": false,
  "AutoBackupIntervalHours": 24,
  "MaxBackupRetentionDays": 30,
  "CompressBackups": true,
  "VerifyIntegrityOnCreate": true,
  "MaxBackupSizeMB": 100,
  "BackupFormats": ["zip", "json"]
}
```

**"Path": "./Backups/Machines"**: 
- Ruta donde se guardan los backups
- Relativa al directorio de la aplicación

**"AutoBackupEnabled": false**: 
- Deshabilitado en producción para no llenar disco
- Railway tiene almacenamiento limitado

**"AutoBackupIntervalHours": 24**: 
- Frecuencia de backups automáticos en horas
- 24 horas = 1 backup diario

**"MaxBackupRetentionDays": 30**: 
- Días que se mantienen los backups antes de eliminarlos
- 30 días = 1 mes de historial

**"CompressBackups": true**: 
- Comprime backups para ahorrar espacio
- Usa formato ZIP

**"VerifyIntegrityOnCreate": true**: 
- Verifica que el backup se creó correctamente
- Valida integridad de archivos

**"MaxBackupSizeMB": 100**: 
- Tamaño máximo de un backup en megabytes
- 100 MB: límite para evitar backups muy grandes

**"BackupFormats": ["zip", "json"]**: 
- Formatos de backup disponibles
- "zip": archivo comprimido
- "json": datos en formato JSON

---

### 10. NotificationSettings (Configuración de Notificaciones)

```json
"NotificationSettings": {
  "EnableEmailNotifications": false,
  "NotifyOnSuccess": false,
  "NotifyOnFailure": true,
  "EmailRecipients": []
}
```

**"EnableEmailNotifications": false**: 
- Deshabilitado porque no hay servidor SMTP configurado
- Se puede habilitar configurando un servicio de email

**"NotifyOnSuccess": false**: 
- No enviar emails cuando los backups son exitosos
- Reduce spam de notificaciones

**"NotifyOnFailure": true**: 
- Enviar email solo cuando falla un backup
- Importante para detectar problemas

**"EmailRecipients": []**: 
- Lista de emails que reciben notificaciones
- Vacío porque las notificaciones están deshabilitadas

---

## Variables de entorno requeridas en Railway:

1. **DATABASE_URL**: Cadena de conexión MySQL
2. **JWT_SECRET_KEY**: Clave secreta para JWT
3. **ASPNETCORE_ENVIRONMENT**: Debe ser "Production"
