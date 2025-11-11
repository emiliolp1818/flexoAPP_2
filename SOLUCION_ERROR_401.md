# 🔒 Solución: Error 401 (No Autorizado) al Cargar Programación

## 🔍 Problema

Al intentar cargar un archivo Excel/CSV de programación, aparece el error:
```
Http failure response for http://localhost:7003/api/machine-programs/upload-programming: 401 Unauthorized
```

## 🎯 Causa

El error 401 significa que:
1. **Tu sesión ha expirado** - El token JWT ha caducado
2. **No estás autenticado** - No hay token de autenticación válido
3. **El token es inválido** - El token está corrupto o fue revocado

## ✅ Soluciones

### Solución 1: Volver a Iniciar Sesión (Recomendado)

1. **Cerrar sesión actual**:
   - Haz clic en tu perfil de usuario (esquina superior derecha)
   - Selecciona "Cerrar Sesión"

2. **Iniciar sesión nuevamente**:
   - Ve a la página de login: `http://localhost:4200/login`
   - Ingresa tus credenciales
   - Una vez autenticado, vuelve al módulo de máquinas

3. **Intentar cargar el archivo nuevamente**:
   - Haz clic en "Agregar Programación"
   - Selecciona tu archivo CSV/Excel
   - Ahora debería funcionar correctamente

### Solución 2: Refrescar el Token Automáticamente

Si el problema persiste, el sistema ahora detecta automáticamente el error 401 y:
- Muestra un mensaje: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
- Ofrece un botón "Ir a Login" para redirigirte automáticamente

### Solución 3: Verificar el Backend

Si después de iniciar sesión el problema continúa:

1. **Verificar que el backend esté corriendo**:
   ```bash
   cd backend
   dotnet run
   ```

2. **Verificar los logs del backend**:
   - Revisar `backend/logs/flexoapp-[fecha].log`
   - Buscar errores relacionados con autenticación

3. **Verificar la configuración JWT**:
   - Abrir `backend/appsettings.json`
   - Verificar que la sección `Jwt` esté configurada correctamente:
   ```json
   {
     "Jwt": {
       "Key": "tu-clave-secreta-muy-segura-de-al-menos-32-caracteres",
       "Issuer": "FlexoAPP",
       "Audience": "FlexoAPP",
       "ExpirationMinutes": 60
     }
   }
   ```

### Solución 4: Limpiar el LocalStorage

Si el token está corrupto:

1. **Abrir la consola del navegador** (F12)
2. **Ir a la pestaña "Application" o "Almacenamiento"**
3. **Expandir "Local Storage"**
4. **Seleccionar tu dominio** (localhost:4200)
5. **Eliminar las claves**:
   - `flexoapp_token`
   - `flexoapp_user`
6. **Recargar la página** (F5)
7. **Iniciar sesión nuevamente**

## 🔧 Cambios Realizados en el Código

### Frontend - machines.ts

Agregado manejo específico del error 401:

```typescript
if (error.status === 401) {
  console.error('🔒 Sesión expirada o no autorizado');
  this.snackBar.open(
    'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 
    'Ir a Login', 
    { duration: 10000 }
  ).onAction().subscribe(() => {
    window.location.href = '/login';
  });
  event.target.value = '';
  return;
}
```

### Interceptor de Autenticación

El interceptor `auth.interceptor.ts` ya maneja automáticamente:
- Agregar el token JWT a todas las peticiones a `/api/`
- Cerrar sesión automáticamente cuando recibe un 401

## 📋 Checklist de Verificación

Antes de cargar un archivo, verifica:

- [ ] Estás autenticado (puedes ver tu nombre de usuario en el header)
- [ ] El backend está corriendo en `http://localhost:7003`
- [ ] No hay errores en la consola del navegador (F12)
- [ ] El archivo tiene el formato correcto (11 columnas)
- [ ] El archivo no excede 10MB

## 🎯 Formato Correcto del Archivo

Recuerda que el archivo debe tener exactamente 11 columnas:

```csv
MÁQUINA,ARTÍCULO,OT SAP,CLIENTE,REFERENCIA,TD,N° COLORES,COLORES,KILOS,FECHA TINTA EN MÁQUINA,SUSTRATO
11,F204567,OT123456,CLIENTE DE PRUEBA S.A,REF-TEST-001,TD1,4,"CYAN,MAGENTA,AMARILLO,NEGRO",1000,11/11/2025 01:48,BOPP
```

## 🔍 Debugging

### Ver el Token en la Consola

```javascript
// En la consola del navegador (F12)
console.log('Token:', localStorage.getItem('flexoapp_token'));
console.log('Usuario:', localStorage.getItem('flexoapp_user'));
```

### Ver si el Token ha Expirado

```javascript
// En la consola del navegador (F12)
const token = localStorage.getItem('flexoapp_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expDate = new Date(payload.exp * 1000);
  console.log('Token expira:', expDate);
  console.log('Expirado:', expDate < new Date());
}
```

## 💡 Prevención

Para evitar este problema en el futuro:

1. **Configurar tiempo de expiración más largo** (en `appsettings.json`):
   ```json
   "ExpirationMinutes": 480  // 8 horas
   ```

2. **Implementar refresh token automático** (futuro)

3. **Guardar el trabajo antes de que expire la sesión**

---

**Fecha**: 11 de noviembre de 2025  
**Estado**: ✅ DOCUMENTADO
