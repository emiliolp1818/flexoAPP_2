# 🚂 Configurar Base de Datos MySQL en Railway

Railway ofrece MySQL gratis y es perfecto para complementar Render.

## 📋 Pasos para Configurar

### 1. Crear Cuenta en Railway

1. Ve a [Railway.app](https://railway.app)
2. Regístrate con GitHub (gratis)
3. Obtienes $5 de crédito gratis al mes (suficiente para MySQL)

### 2. Crear Proyecto y Base de Datos

1. Click en "New Project"
2. Selecciona "Provision MySQL"
3. Railway creará automáticamente una base de datos MySQL

### 3. Obtener Cadena de Conexión

1. Click en tu servicio MySQL
2. Ve a la pestaña "Variables"
3. Copia las siguientes variables:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

O usa la variable completa:
   - `DATABASE_URL` (formato MySQL)

### 4. Construir Cadena de Conexión

Formato para .NET:
```
Server=MYSQL_HOST;Port=MYSQL_PORT;Database=MYSQL_DATABASE;Uid=MYSQL_USER;Pwd=MYSQL_PASSWORD;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;ConnectionTimeout=60;DefaultCommandTimeout=300;Pooling=true;MinimumPoolSize=5;MaximumPoolSize=100;ConnectionLifeTime=300;
```

Ejemplo:
```
Server=containers-us-west-123.railway.app;Port=6789;Database=railway;Uid=root;Pwd=abc123xyz;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;ConnectionTimeout=60;DefaultCommandTimeout=300;Pooling=true;MinimumPoolSize=5;MaximumPoolSize=100;ConnectionLifeTime=300;
```

### 5. Configurar en Render

1. Ve a tu servicio backend en Render
2. Ve a "Environment"
3. Edita la variable `DATABASE_URL`
4. Pega tu cadena de conexión de Railway
5. Guarda (Render redesplegará automáticamente)

## 🔒 Seguridad

### Permitir Conexiones Externas

Railway permite conexiones desde cualquier IP por defecto, pero puedes:

1. En Railway, ve a tu servicio MySQL
2. Click en "Settings"
3. En "Networking", verifica que "Public Networking" está habilitado

### Variables de Entorno

**NUNCA** pongas credenciales directamente en el código. Usa variables de entorno:

En Render:
```
DATABASE_URL=Server=...;Uid=...;Pwd=...;
```

## 📊 Monitoreo

### Ver Logs de Conexión

En Railway:
1. Click en tu servicio MySQL
2. Ve a "Deployments"
3. Click en el deployment activo
4. Ve a "Logs"

### Conectar con Cliente MySQL

Puedes conectarte con herramientas como:
- MySQL Workbench
- DBeaver
- TablePlus
- phpMyAdmin

Usa las credenciales de Railway.

## 💰 Costos

### Plan Gratuito
- $5 de crédito gratis al mes
- MySQL consume ~$0.50-1.00 al mes
- Suficiente para desarrollo y pruebas

### Plan de Pago
- $5/mes por $5 de crédito
- $10/mes por $10 de crédito
- Solo pagas lo que usas

## 🔄 Migración de Datos

### Desde MySQL Local a Railway

1. **Exportar datos locales:**
   ```bash
   mysqldump -u root -p flexoapp_bd > backup.sql
   ```

2. **Importar a Railway:**
   ```bash
   mysql -h RAILWAY_HOST -P RAILWAY_PORT -u RAILWAY_USER -p RAILWAY_DATABASE < backup.sql
   ```

### Usando phpMyAdmin

1. Exporta desde tu MySQL local (Export → SQL)
2. Conéctate a Railway con phpMyAdmin
3. Importa el archivo SQL

## 🆘 Solución de Problemas

### Error: "Unable to connect to any of the specified MySQL hosts"

**Solución:**
- Verifica que el host y puerto son correctos
- Asegúrate de que Railway está activo
- Verifica que "Public Networking" está habilitado

### Error: "Access denied for user"

**Solución:**
- Verifica usuario y contraseña
- Copia las credenciales directamente desde Railway
- No uses espacios al inicio o final

### Error: "Unknown database"

**Solución:**
- Verifica el nombre de la base de datos
- En Railway, el nombre por defecto es "railway"
- Puedes cambiarlo en las variables de entorno

### Conexión muy lenta

**Solución:**
- Railway puede estar en una región diferente
- Considera usar una región más cercana
- Aumenta el timeout en la cadena de conexión

## 📝 Checklist de Configuración

- [ ] Cuenta creada en Railway
- [ ] Servicio MySQL provisionado
- [ ] Credenciales copiadas
- [ ] Cadena de conexión construida
- [ ] Variable `DATABASE_URL` configurada en Render
- [ ] Backend redesplegado en Render
- [ ] Conexión verificada en `/health`
- [ ] Login funciona correctamente

## 🎯 Alternativas a Railway

Si prefieres otras opciones:

### PlanetScale (MySQL Serverless)
- Gratis hasta 5GB
- Muy rápido
- [planetscale.com](https://planetscale.com)

### Aiven (MySQL Managed)
- $10/mes
- Muy confiable
- [aiven.io](https://aiven.io)

### AWS RDS (MySQL)
- Desde $15/mes
- Muy escalable
- [aws.amazon.com/rds](https://aws.amazon.com/rds)

## ✅ Verificación Final

Una vez configurado, verifica:

1. **Health Check del Backend:**
   ```
   https://tu-backend.onrender.com/health
   ```
   Debería mostrar: `"database": "MySQL Connected"`

2. **Login en el Frontend:**
   - Usuario: admin
   - Contraseña: admin123

3. **Crear un diseño o pedido:**
   - Verifica que se guarda correctamente
   - Verifica que aparece en la lista

Si todo funciona, ¡tu aplicación está completamente desplegada! 🎉
