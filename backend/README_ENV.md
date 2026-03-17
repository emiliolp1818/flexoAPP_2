# Configuración de Variables de Entorno

## Seguridad de Credenciales

Este proyecto utiliza variables de entorno para proteger información sensible como contraseñas de base de datos y claves secretas.

## Configuración Local

### 1. Crear archivo .env

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

### 2. Configurar tus credenciales

Edita el archivo `.env` con tus credenciales locales:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=flexoapp_bd
MYSQL_USER=root
MYSQL_PASSWORD=tu_password_aqui
```

### 3. Seguridad

- ✅ El archivo `.env` está en `.gitignore` y NO se sube a Git
- ✅ Usa `.env.example` como plantilla (sin credenciales reales)
- ✅ Nunca compartas tu archivo `.env` con nadie
- ✅ Cada desarrollador debe tener su propio `.env` local

## Variables Disponibles

### Base de Datos MySQL
- `MYSQL_HOST`: Servidor de base de datos (default: localhost)
- `MYSQL_PORT`: Puerto MySQL (default: 3306)
- `MYSQL_DATABASE`: Nombre de la base de datos
- `MYSQL_USER`: Usuario de MySQL
- `MYSQL_PASSWORD`: Contraseña de MySQL

### JWT (Opcional)
- `JWT_SECRET_KEY`: Clave secreta para tokens JWT (usa el de appsettings si no se define)

## Prioridad de Configuración

El sistema carga la configuración en este orden (de mayor a menor prioridad):

1. Variables de entorno del sistema
2. Archivo `.env`
3. `appsettings.Development.json` (solo para desarrollo)
4. `appsettings.json`

## Producción (Railway)

En Railway, las variables se configuran en el panel de Railway:
- No uses archivo `.env` en producción
- Configura las variables directamente en Railway Dashboard
- Railway inyecta automáticamente las variables MYSQL_*

## Troubleshooting

### Error: "No se encontró cadena de conexión"
- Verifica que el archivo `.env` existe en la carpeta `backend/`
- Verifica que las variables están correctamente definidas
- Reinicia la aplicación después de modificar `.env`

### Error de conexión a MySQL
- Verifica que MySQL está corriendo: `mysql -u root -p`
- Verifica que la base de datos existe: `SHOW DATABASES;`
- Verifica usuario y contraseña en `.env`
