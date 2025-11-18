# 🔐 Variables de Entorno para Railway

## Variables Requeridas

Debes agregar estas variables en Railway en la sección **Variables** de tu servicio backend:

---

### 1. DATABASE_URL
**Descripción**: Cadena de conexión a la base de datos MySQL

**Valor**: Railway la proporciona automáticamente cuando creas el servicio MySQL

**Cómo obtenerla**:
1. Ve al servicio MySQL en Railway
2. Click en la pestaña "Variables"
3. Copia el valor de `DATABASE_URL` o `MYSQL_URL`

**Formato esperado**:
```
mysql://root:password@mysql.railway.internal:3306/railway
```

**O en formato tradicional**:
```
Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=xxxxx;AllowUserVariables=True;UseAffectedRows=False;
```

---

### 2. JWT_SECRET_KEY
**Descripción**: Clave secreta para firmar y validar tokens JWT

**Valor recomendado**:
```
FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable
```

**O genera una clave más segura** (64 caracteres aleatorios):

En PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

En Linux/Mac:
```bash
openssl rand -base64 64
```

**Importante**: 
- Debe tener mínimo 32 caracteres
- Usa solo letras, números y guiones
- NO cambies esta clave después de tener usuarios, invalidaría todos los tokens

---

### 3. ASPNETCORE_ENVIRONMENT
**Descripción**: Define el entorno de ejecución de la aplicación

**Valor**:
```
Production
```

**Opciones disponibles**:
- `Production` - Producción (recomendado para Railway)
- `Development` - Desarrollo (solo para local)
- `Staging` - Pruebas (opcional)

**Importante**: 
- Con `Production` se usa `appsettings.Production.json`
- Deshabilita Swagger automáticamente
- Optimiza el rendimiento

---

### 4. PORT (Opcional)
**Descripción**: Puerto donde la aplicación escucha

**Valor**: Railway lo configura automáticamente

**Si necesitas especificarlo**:
```
8080
```

**Nota**: Railway asigna automáticamente esta variable, normalmente NO necesitas agregarla manualmente.

---

## 📋 Resumen de Variables a Agregar

Copia y pega estos valores en Railway:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | *(Railway lo proporciona automáticamente)* |
| `JWT_SECRET_KEY` | `FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

---

## 🔧 Cómo Agregar Variables en Railway

### Paso a Paso:

1. **Abre tu proyecto en Railway**
   - Ve a https://railway.app
   - Selecciona tu proyecto FlexoAPP

2. **Selecciona el servicio backend**
   - Click en el servicio de tu aplicación (no el MySQL)

3. **Ve a la pestaña Variables**
   - Click en "Variables" en el menú lateral

4. **Agrega cada variable**
   - Click en "+ New Variable"
   - Ingresa el nombre de la variable (ejemplo: `JWT_SECRET_KEY`)
   - Ingresa el valor
   - Click en "Add"

5. **Repite para cada variable**
   - Agrega `JWT_SECRET_KEY`
   - Agrega `ASPNETCORE_ENVIRONMENT`
   - `DATABASE_URL` ya debería estar si creaste el servicio MySQL

6. **Guarda los cambios**
   - Railway redesplegará automáticamente la aplicación

---

## 🔍 Verificar Variables

Para verificar que las variables están configuradas correctamente:

1. Ve a la pestaña "Variables" de tu servicio
2. Deberías ver:
   ```
   DATABASE_URL = mysql://...
   JWT_SECRET_KEY = FlexoAPP-Super-Secret-Key...
   ASPNETCORE_ENVIRONMENT = Production
   PORT = 8080 (opcional, Railway lo agrega automáticamente)
   ```

---

## ⚠️ Variables Sensibles

**NUNCA** compartas públicamente:
- `DATABASE_URL` - Contiene credenciales de la base de datos
- `JWT_SECRET_KEY` - Permite crear tokens falsos

**Mantén estas variables seguras**:
- No las subas a GitHub
- No las compartas en capturas de pantalla
- No las incluyas en logs

---

## 🐛 Solución de Problemas

### Error: "JWT SecretKey is required"
**Causa**: Falta la variable `JWT_SECRET_KEY`

**Solución**:
1. Agrega la variable `JWT_SECRET_KEY` en Railway
2. Valor: `FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable`
3. Espera a que Railway redespliegue

### Error: "Connection string not found"
**Causa**: Falta la variable `DATABASE_URL`

**Solución**:
1. Verifica que el servicio MySQL esté creado
2. Ve al servicio MySQL → Variables
3. Copia el valor de `DATABASE_URL` o `MYSQL_URL`
4. Agrégalo manualmente en el servicio backend si no está

### Error: "appsettings.Production.json not found"
**Causa**: Falta la variable `ASPNETCORE_ENVIRONMENT`

**Solución**:
1. Agrega la variable `ASPNETCORE_ENVIRONMENT`
2. Valor: `Production`
3. Espera a que Railway redespliegue

---

## 📝 Notas Adicionales

### Formato de DATABASE_URL

Railway puede proporcionar la URL en diferentes formatos:

**Formato 1 (URL)**:
```
mysql://root:password@mysql.railway.internal:3306/railway
```

**Formato 2 (Cadena de conexión)**:
```
Server=mysql.railway.internal;Port=3306;Database=railway;User=root;Password=xxxxx;
```

Ambos formatos funcionan. Si Railway proporciona el formato URL, la aplicación lo convertirá automáticamente al formato de cadena de conexión.

### Variables Adicionales (Opcionales)

Si necesitas configuraciones adicionales, puedes agregar:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `JWT_EXPIRATION_MINUTES` | Tiempo de expiración del token | `1440` (24 horas) |
| `ENABLE_SWAGGER` | Habilitar Swagger en producción | `false` |
| `LOG_LEVEL` | Nivel de logging | `Information` |

---

## ✅ Checklist

Antes de desplegar, verifica:

- [ ] Variable `DATABASE_URL` configurada
- [ ] Variable `JWT_SECRET_KEY` configurada (mínimo 32 caracteres)
- [ ] Variable `ASPNETCORE_ENVIRONMENT` = `Production`
- [ ] Servicio MySQL creado y funcionando
- [ ] Variables guardadas en Railway
- [ ] Aplicación redesplegada automáticamente

---

## 🎯 Siguiente Paso

Una vez agregadas las variables:

1. Railway redesplegará automáticamente
2. Espera 2-3 minutos
3. Verifica el endpoint: `https://tu-url.railway.app/health`
4. Deberías ver: `{"status": "healthy", "database": "MySQL Connected"}`

Si todo funciona correctamente, ¡tu aplicación está lista! 🎉
