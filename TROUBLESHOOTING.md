# 🔧 Solución de Problemas - FlexoAPP

Guía completa para resolver problemas comunes durante el despliegue y operación.

## 🚨 Problemas Comunes

### 1. Backend no inicia en Render

#### Síntoma
- El servicio muestra estado "Deploy failed"
- Logs muestran errores al iniciar

#### Soluciones

**A. Error de Base de Datos**
```
Error: Unable to connect to any of the specified MySQL hosts
```

✅ **Solución:**
1. Verifica que `DATABASE_URL` está configurada correctamente
2. Prueba la conexión desde tu máquina local:
   ```bash
   cd backend
   test-connection.bat
   ```
3. Verifica que Railway/PlanetScale está activo
4. Asegúrate de que la cadena de conexión no tiene espacios extra

**B. Error de Puerto**
```
Error: Failed to bind to address
```

✅ **Solución:**
1. Verifica que `ASPNETCORE_URLS` está configurada como `http://0.0.0.0:7003`
2. No uses `https` en la URL interna
3. Render maneja HTTPS automáticamente

**C. Error de JWT**
```
Error: JWT SecretKey is required
```

✅ **Solución:**
1. Verifica que `JWT_SECRET_KEY` está configurada en variables de entorno
2. La clave debe tener al menos 32 caracteres
3. No uses caracteres especiales que puedan causar problemas

---

### 2. Frontend no carga

#### Síntoma
- Página en blanco
- Error 404
- Assets no cargan

#### Soluciones

**A. Página en Blanco**

✅ **Solución:**
1. Verifica que el build completó correctamente en Render
2. Revisa los logs de build para errores
3. Verifica que `Publish Directory` es correcto:
   ```
   Frontend/dist/flexoapp/browser
   ```
4. Asegúrate de que el redirect está configurado: `/*` → `/index.html`

**B. Error 404 en Rutas**

✅ **Solución:**
1. Configura redirect/rewrite en Render:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite
2. Verifica que Angular está en modo hash routing (si es necesario)

**C. Assets no cargan (CSS, JS)**

✅ **Solución:**
1. Verifica que el build de producción se ejecutó:
   ```bash
   npm run build:prod
   ```
2. Revisa la consola del navegador (F12) para errores específicos
3. Verifica que no hay errores de CORS

---

### 3. Error CORS

#### Síntoma
```
Access to XMLHttpRequest has been blocked by CORS policy
```

#### Soluciones

✅ **Solución:**
1. Verifica `CORS_ORIGINS` en el backend:
   ```env
   CORS_ORIGINS=https://tu-frontend.onrender.com
   ```
2. **NO** incluyas "/" al final de la URL
3. Usa la URL exacta del frontend (copia desde Render)
4. Si tienes múltiples orígenes, sepáralos con comas:
   ```env
   CORS_ORIGINS=https://frontend1.onrender.com,https://frontend2.onrender.com
   ```
5. Guarda y espera a que Render redespliegue (~2 minutos)

---

### 4. Frontend no se conecta al Backend

#### Síntoma
- Login no funciona
- Datos no cargan
- Error de red en consola

#### Soluciones

**A. URL Incorrecta**

✅ **Solución:**
1. Verifica `Frontend/src/environments/environment.prod.ts`:
   ```typescript
   apiUrl: 'https://tu-backend.onrender.com/api',
   socketUrl: 'https://tu-backend.onrender.com',
   ```
2. **NO** incluyas "/" al final de `/api`
3. Usa HTTPS (no HTTP)
4. Haz commit y push para redesplegar

**B. Backend Dormido (Plan Free)**

✅ **Solución:**
1. El plan free de Render duerme los servicios después de 15 min
2. Primera petición tarda 30-60 segundos en despertar
3. Espera y reintenta
4. Considera plan de pago ($7/mes) para producción

**C. Timeout de Conexión**

✅ **Solución:**
1. Aumenta el timeout en el frontend:
   ```typescript
   // En auth.service.ts o similar
   timeout: 60000 // 60 segundos
   ```
2. Verifica que el backend responde en `/health`

---

### 5. SignalR / WebSocket no conecta

#### Síntoma
```
WebSocket connection failed
SignalR: Connection disconnected
```

#### Soluciones

✅ **Solución:**
1. Verifica que la URL de WebSocket es correcta:
   ```typescript
   socketUrl: 'https://tu-backend.onrender.com'
   ```
2. Render soporta WebSockets automáticamente
3. Verifica que no hay firewall bloqueando
4. Intenta con fallback a long polling:
   ```typescript
   transport: ['WebSockets', 'ServerSentEvents', 'LongPolling']
   ```

---

### 6. Base de Datos no conecta

#### Síntoma
```
Error: Connection timeout
Error: Access denied for user
```

#### Soluciones

**A. Credenciales Incorrectas**

✅ **Solución:**
1. Copia las credenciales directamente desde Railway/PlanetScale
2. No escribas manualmente
3. Verifica que no hay espacios extra
4. Prueba la conexión localmente primero

**B. Firewall / IP Bloqueada**

✅ **Solución:**
1. Railway permite todas las IPs por defecto
2. Si usas otro servicio, añade las IPs de Render:
   - Render usa IPs dinámicas
   - Permite todas las IPs (0.0.0.0/0) o usa servicio que lo permita

**C. Base de Datos Dormida**

✅ **Solución:**
1. Verifica que el servicio de BD está activo en Railway
2. Algunos servicios free se duermen
3. Despierta el servicio manualmente

---

### 7. Build Falla en Render

#### Síntoma
- "Build failed" en Render
- Errores de compilación

#### Soluciones

**A. Backend Build Falla**

✅ **Solución:**
1. Verifica que compila localmente:
   ```bash
   cd backend
   dotnet build
   ```
2. Revisa los logs de Render para el error específico
3. Verifica que todas las dependencias están en el .csproj
4. Asegúrate de que usas .NET 8.0

**B. Frontend Build Falla**

✅ **Solución:**
1. Verifica que compila localmente:
   ```bash
   cd Frontend
   npm run build:prod
   ```
2. Revisa errores de TypeScript
3. Verifica que todas las dependencias están en package.json
4. Limpia node_modules y reinstala:
   ```bash
   rm -rf node_modules
   npm install
   ```

**C. Out of Memory**

✅ **Solución:**
1. El plan free de Render tiene memoria limitada
2. Reduce el tamaño del build:
   - Elimina dependencias no usadas
   - Optimiza imports
3. Considera plan de pago con más memoria

---

### 8. Aplicación Lenta

#### Síntoma
- Carga inicial muy lenta
- Peticiones tardan mucho

#### Soluciones

**A. Plan Free Dormido**

✅ **Solución:**
1. Primera carga después de dormir: 30-60 segundos
2. Considera plan de pago ($7/mes) para mantener activo
3. Usa servicio de "ping" para mantener despierto (no recomendado)

**B. Base de Datos Lenta**

✅ **Solución:**
1. Verifica que Railway está en la misma región que Render
2. Optimiza queries lentas
3. Añade índices a la base de datos
4. Considera plan de pago con mejor performance

**C. Bundle muy Grande**

✅ **Solución:**
1. Analiza el tamaño del bundle:
   ```bash
   cd Frontend
   npm run analyze
   ```
2. Implementa lazy loading en Angular
3. Optimiza imágenes
4. Elimina dependencias no usadas

---

### 9. Sesión se Pierde

#### Síntoma
- Usuario debe hacer login constantemente
- Token expira muy rápido

#### Soluciones

✅ **Solución:**
1. Verifica configuración de JWT en `appsettings.Production.json`:
   ```json
   "ExpirationMinutes": 1440
   ```
2. Implementa refresh token automático
3. Verifica que el token se guarda en localStorage
4. Asegúrate de que el dominio de cookies es correcto

---

### 10. Errores 500 en API

#### Síntoma
```
500 Internal Server Error
```

#### Soluciones

✅ **Solución:**
1. Revisa los logs del backend en Render
2. Verifica que la base de datos está conectada
3. Revisa errores específicos en los logs
4. Verifica que todas las migraciones se ejecutaron
5. Asegúrate de que los datos de prueba se crearon

---

## 🔍 Herramientas de Debug

### Ver Logs en Render

1. Ve a tu servicio en Render Dashboard
2. Click en "Logs"
3. Filtra por tipo de log (Info, Warning, Error)
4. Busca el error específico

### Consola del Navegador

1. Abre DevTools (F12)
2. Ve a "Console" para errores de JavaScript
3. Ve a "Network" para ver peticiones HTTP
4. Ve a "Application" para ver localStorage/cookies

### Health Check

Verifica el estado del backend:
```
https://tu-backend.onrender.com/health
```

Debería responder:
```json
{
  "status": "ok",
  "database": "MySQL Connected",
  "timestamp": "..."
}
```

---

## 📞 Obtener Ayuda

### Documentación Oficial
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Angular Docs](https://angular.io/docs)
- [.NET Docs](https://docs.microsoft.com/dotnet)

### Logs y Debugging
1. Siempre revisa los logs primero
2. Busca el error específico en Google
3. Verifica que todas las variables de entorno están configuradas
4. Prueba localmente primero

### Comunidad
- [Render Community](https://community.render.com)
- [Railway Discord](https://discord.gg/railway)
- [Stack Overflow](https://stackoverflow.com)

---

## ✅ Checklist de Verificación

Cuando tengas un problema, verifica:

- [ ] Logs del backend en Render
- [ ] Logs del frontend en Render
- [ ] Consola del navegador (F12)
- [ ] Variables de entorno configuradas
- [ ] URLs correctas en environment.prod.ts
- [ ] CORS configurado correctamente
- [ ] Base de datos conectada
- [ ] Health check responde
- [ ] Compila localmente sin errores

---

## 🆘 Último Recurso

Si nada funciona:

1. **Redesplegar desde cero:**
   - Elimina los servicios en Render
   - Vuelve a crear usando Blueprint
   - Configura variables de entorno cuidadosamente

2. **Rollback:**
   - En Render, puedes volver a un deploy anterior
   - Click en "Deployments" → Selecciona uno anterior → "Redeploy"

3. **Verificar localmente:**
   - Asegúrate de que funciona en local
   - Usa `test-build.bat` para verificar builds
   - Prueba con las mismas variables de entorno

---

**Última actualización**: Noviembre 2024  
**Versión**: 2.0.0
