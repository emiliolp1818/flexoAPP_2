# 🚀 Instrucciones para Desplegar FlexoAPP en Railway

## 📋 Requisitos Previos

1. Cuenta en Railway (https://railway.app)
2. Repositorio de GitHub con el código de FlexoAPP
3. Archivos de configuración creados:
   - `backend/Dockerfile`
   - `railway.json`
   - `backend/appsettings.Production.json`

---

## 🔧 Paso 1: Crear Proyecto en Railway

1. Inicia sesión en Railway: https://railway.app
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway para acceder a tu GitHub
5. Selecciona el repositorio `flexoAPP_2`

---

## 🗄️ Paso 2: Crear Base de Datos MySQL

1. En tu proyecto de Railway, click en "+ New"
2. Selecciona "Database"
3. Elige "MySQL"
4. Railway creará automáticamente una base de datos MySQL
5. Espera a que termine de inicializarse (1-2 minutos)

---

## 🔗 Paso 3: Obtener Cadena de Conexión

1. Click en el servicio MySQL que acabas de crear
2. Ve a la pestaña "Variables"
3. Copia el valor de `DATABASE_URL`
4. Debería verse así:
   ```
   mysql://root:password@mysql.railway.internal:3306/railway
   ```

---

## ⚙️ Paso 4: Configurar Variables de Entorno del Backend

1. Click en el servicio de tu aplicación (backend)
2. Ve a la pestaña "Variables"
3. Agrega las siguientes variables:

### Variable 1: DATABASE_URL
```
Nombre: DATABASE_URL
Valor: [pega la cadena de conexión de MySQL del Paso 3]
```

### Variable 2: JWT_SECRET_KEY
```
Nombre: JWT_SECRET_KEY
Valor: FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable
```
**Nota**: Puedes generar una clave más segura con este comando en PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### Variable 3: ASPNETCORE_ENVIRONMENT
```
Nombre: ASPNETCORE_ENVIRONMENT
Valor: Production
```

### Variable 4: PORT (Opcional - Railway lo configura automáticamente)
```
Nombre: PORT
Valor: 8080
```

4. Click en "Add" para cada variable

---

## 🏗️ Paso 5: Configurar Build del Backend

1. En el servicio del backend, ve a "Settings"
2. En "Build & Deploy", verifica:
   - **Builder**: Dockerfile
   - **Dockerfile Path**: backend/Dockerfile
   - **Root Directory**: (dejar vacío o poner `/`)

3. En "Deploy", verifica:
   - **Start Command**: `dotnet FlexoAPP.API.dll`
   - **Restart Policy**: On Failure
   - **Health Check Path**: `/health`

---

## 📦 Paso 6: Desplegar la Aplicación

1. Railway detectará automáticamente los cambios
2. Iniciará el build del Dockerfile
3. Espera a que termine el despliegue (5-10 minutos)
4. Verás logs en tiempo real en la pestaña "Deployments"

### Logs esperados:
```
🚀 Iniciando FlexoAPP Backend - MySQL Local (flexoapp_bd)
🔌 Using LOCAL MySQL connection to flexoapp_bd database
✅ MySQL Local Database configured successfully
✅ Health checks configured
✅ All services configured successfully
=========================================
🚀 FLEXOAPP ENHANCED API - MYSQL LOCAL READY
=========================================
```

---

## 🔍 Paso 7: Verificar el Despliegue

1. Railway asignará una URL pública a tu aplicación
2. Copia la URL (ejemplo: `https://flexoapp-production.up.railway.app`)
3. Abre la URL en el navegador
4. Deberías ver un JSON con información de la API:

```json
{
  "message": "FlexoAPP Enhanced API - MySQL Local Edition",
  "status": "running",
  "version": "v2.2.0",
  "features": {
    "database": "MySQL Local (flexoapp_bd) with Connection Pooling",
    "authentication": "JWT Bearer Token"
  },
  "login": "admin / admin123"
}
```

---

## 🏥 Paso 8: Verificar Health Check

1. Accede a: `https://tu-url.railway.app/health`
2. Deberías ver:

```json
{
  "status": "healthy",
  "database": "MySQL Connected",
  "timestamp": "2024-11-18T..."
}
```

---

## 🗃️ Paso 9: Inicializar Base de Datos

La aplicación creará automáticamente las tablas al iniciar, pero necesitas ejecutar las migraciones:

### Opción A: Desde Railway CLI

1. Instala Railway CLI:
```bash
npm i -g @railway/cli
```

2. Inicia sesión:
```bash
railway login
```

3. Conecta al proyecto:
```bash
railway link
```

4. Ejecuta las migraciones:
```bash
railway run dotnet ef database update
```

### Opción B: Desde MySQL Workbench

1. Conecta a la base de datos MySQL de Railway usando los datos de conexión
2. Ejecuta los scripts SQL manualmente:
   - `backend/Database/01_create_designs_table.sql`
   - `backend/Database/02_fix_primary_key_designs.sql`

---

## 🌐 Paso 10: Configurar Frontend

1. En tu proyecto Angular, actualiza el archivo de entorno:

**Frontend/src/environments/environment.prod.ts**:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-url.railway.app/api'
};
```

2. Compila el frontend para producción:
```bash
cd Frontend
ng build --configuration production
```

3. Despliega el frontend en un servicio de hosting estático:
   - **Vercel** (recomendado para Angular)
   - **Netlify**
   - **Firebase Hosting**
   - **Railway** (como servicio separado)

---

## 🔐 Paso 11: Configurar CORS en Backend

Si el frontend está en un dominio diferente, actualiza Program.cs:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "https://tu-frontend.vercel.app",  // URL de tu frontend
            "https://tu-url.railway.app"       // URL de tu backend
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

---

## 📊 Paso 12: Monitoreo y Logs

### Ver logs en tiempo real:
1. En Railway, ve a tu servicio
2. Click en "Deployments"
3. Selecciona el deployment activo
4. Verás logs en tiempo real

### Métricas:
1. Ve a la pestaña "Metrics"
2. Verás:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

---

## 🐛 Solución de Problemas Comunes

### Error: "Connection refused" o "Cannot connect to MySQL"

**Solución**:
1. Verifica que la variable `DATABASE_URL` esté configurada correctamente
2. Asegúrate de que el servicio MySQL esté en el mismo proyecto
3. Verifica que la cadena de conexión use `mysql.railway.internal` como host

### Error: "JWT SecretKey is required"

**Solución**:
1. Verifica que la variable `JWT_SECRET_KEY` esté configurada
2. Debe tener al menos 32 caracteres

### Error: "Port already in use"

**Solución**:
1. Railway asigna el puerto automáticamente
2. Asegúrate de que tu aplicación escuche en `0.0.0.0:8080`
3. No uses `localhost` en producción

### Error: "Health check failed"

**Solución**:
1. Verifica que el endpoint `/health` esté funcionando
2. Revisa los logs para ver errores específicos
3. Asegúrate de que la base de datos esté conectada

---

## 🔄 Paso 13: Actualizar la Aplicación

Cada vez que hagas cambios:

1. Haz commit y push a GitHub:
```bash
git add .
git commit -m "feat: nuevas funcionalidades"
git push
```

2. Railway detectará automáticamente los cambios
3. Iniciará un nuevo despliegue
4. El despliegue anterior seguirá activo hasta que el nuevo esté listo
5. Railway hará el cambio sin downtime (zero-downtime deployment)

---

## 💰 Costos Estimados en Railway

Railway ofrece:
- **Plan Hobby**: $5/mes + uso
- **Plan Pro**: $20/mes + uso

Costos aproximados para FlexoAPP:
- Backend (.NET): ~$3-5/mes
- MySQL Database: ~$2-3/mes
- **Total**: ~$5-8/mes

**Nota**: Railway ofrece $5 de crédito gratis mensualmente en el plan Hobby.

---

## 📚 Recursos Adicionales

- Documentación de Railway: https://docs.railway.app
- Railway CLI: https://docs.railway.app/develop/cli
- Railway Templates: https://railway.app/templates
- Soporte de Railway: https://help.railway.app

---

## ✅ Checklist Final

- [ ] Proyecto creado en Railway
- [ ] Base de datos MySQL creada
- [ ] Variables de entorno configuradas
- [ ] Dockerfile configurado correctamente
- [ ] Aplicación desplegada exitosamente
- [ ] Health check funcionando
- [ ] Base de datos inicializada
- [ ] Frontend configurado con URL del backend
- [ ] CORS configurado correctamente
- [ ] Login funcionando (admin / admin123)
- [ ] Endpoints de API respondiendo correctamente

---

## 🎉 ¡Listo!

Tu aplicación FlexoAPP ahora está desplegada en Railway y lista para usar en producción.

**URL de tu API**: https://tu-url.railway.app
**Health Check**: https://tu-url.railway.app/health
**Swagger** (si está habilitado): https://tu-url.railway.app/swagger
