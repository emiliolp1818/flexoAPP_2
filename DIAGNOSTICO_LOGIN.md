# 🔍 Diagnóstico de Problema de Login

## ✅ Estado Actual

- ✅ Backend conectado a PostgreSQL
- ✅ Usuario admin existe en la base de datos
- ❌ Frontend no puede hacer login

## 🎯 Posibles Causas

### 1. Frontend apuntando a URL incorrecta
### 2. Problema de CORS
### 3. Frontend no redesplegado con configuración de producción
### 4. Password del usuario admin incorrecta

## 🔧 Pasos de Diagnóstico

### Paso 1: Verificar URL del Backend

**Abre el frontend en el navegador:**
```
https://flexoapp-frontend.onrender.com
```

**Abre la consola del navegador (F12) y busca:**
- ¿Hay errores de red?
- ¿A qué URL está intentando conectar?
- ¿Hay errores de CORS?

### Paso 2: Verificar que el Backend Responde

**Prueba el endpoint de login directamente:**

```bash
curl -X POST https://flexoapp-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userCode":"admin","password":"admin123"}'
```

**Respuesta esperada (éxito):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userCode": "admin",
    "firstName": "Administrador",
    "role": "Admin"
  }
}
```

**Respuesta de error (credenciales incorrectas):**
```json
{
  "message": "Usuario o contraseña incorrectos"
}
```

### Paso 3: Verificar Configuración del Frontend

**En la consola del navegador (F12), ejecuta:**
```javascript
console.log(window.location.origin);
// Debería mostrar: https://flexoapp-frontend.onrender.com
```

**Verifica que el frontend esté usando la URL correcta:**
```javascript
// Busca en Network tab (F12) las peticiones a /api/auth/login
// La URL debería ser: https://flexoapp-backend.onrender.com/api/auth/login
```

### Paso 4: Verificar CORS

**En los logs del backend, busca:**
```
[ERR] CORS policy: No 'Access-Control-Allow-Origin' header
```

Si ves este error, el backend no está permitiendo peticiones desde el frontend.

## 🚀 Soluciones

### Solución 1: Redeploy del Frontend

El frontend puede estar usando la configuración de desarrollo en lugar de producción.

**En Render Dashboard:**
1. Ve a **flexoAPP-frontend**
2. Click en **Manual Deploy**
3. Selecciona **Clear build cache & deploy**
4. Espera 3-5 minutos

### Solución 2: Verificar CORS en Backend

El backend debe permitir peticiones desde el frontend de Render.

**Verifica en los logs del backend:**
```
🌍 CORS: Enabled for local network
```

**La configuración actual permite:**
- localhost
- 192.168.x.x (red local)
- *.onrender.com (Render)

### Solución 3: Resetear Password del Admin

Si el usuario admin existe pero la password está incorrecta:

**Opción A: Desde Railway (recomendado)**

1. Ve a Railway → PostgreSQL → Connect
2. Ejecuta:
```sql
UPDATE "Users" 
SET "Password" = '$2a$11$YourNewHashedPassword'
WHERE "UserCode" = 'admin';
```

**Opción B: Forzar recreación**

En el backend, el código ya intenta resetear la password si el usuario existe.

### Solución 4: Verificar JWT_SECRET_KEY

**En Render → flexoAPP-backend → Environment:**

Verifica que existe la variable:
```
JWT_SECRET_KEY = (algún valor)
```

Si no existe, agrégala:
```
JWT_SECRET_KEY = FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Secure
```

## 📊 Checklist de Verificación

- [ ] Frontend desplegado en Render
- [ ] Backend desplegado en Render
- [ ] Backend conectado a PostgreSQL
- [ ] Usuario admin existe en base de datos
- [ ] Frontend apunta a URL correcta de backend
- [ ] CORS configurado correctamente
- [ ] JWT_SECRET_KEY configurado
- [ ] Probé login desde consola del navegador
- [ ] Probé endpoint con curl/Postman

## 🧪 Test Manual desde Navegador

**Abre la consola del navegador (F12) en el frontend y ejecuta:**

```javascript
// Test de conexión al backend
fetch('https://flexoapp-backend.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('Backend health:', d))
  .catch(e => console.error('Error:', e));

// Test de login
fetch('https://flexoapp-backend.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userCode: 'admin', password: 'admin123' })
})
  .then(r => r.json())
  .then(d => console.log('Login response:', d))
  .catch(e => console.error('Login error:', e));
```

## 🔍 Errores Comunes

### Error 1: "Failed to fetch"
**Causa:** Frontend no puede conectar al backend
**Solución:** Verifica que el backend esté activo en Render

### Error 2: "CORS policy error"
**Causa:** Backend no permite peticiones desde el frontend
**Solución:** Verifica configuración CORS en backend

### Error 3: "401 Unauthorized"
**Causa:** Credenciales incorrectas
**Solución:** Verifica password del usuario admin

### Error 4: "500 Internal Server Error"
**Causa:** Error en el backend
**Solución:** Revisa logs del backend en Render

### Error 5: "Network request failed"
**Causa:** Backend dormido (free tier de Render)
**Solución:** Espera 30-60 segundos para que despierte

## 📝 Información para Compartir

Si necesitas ayuda, comparte:

1. **URL del frontend:** https://flexoapp-frontend.onrender.com
2. **URL del backend:** https://flexoapp-backend.onrender.com
3. **Error en consola del navegador:** (captura de pantalla)
4. **Logs del backend:** (últimas 20 líneas)
5. **Respuesta del health check:**
```bash
curl https://flexoapp-backend.onrender.com/health
```

---

**Siguiente paso:** Abre el frontend en el navegador, abre la consola (F12), intenta hacer login, y comparte qué error aparece.
