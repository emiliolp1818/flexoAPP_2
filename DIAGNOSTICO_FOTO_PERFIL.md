# Diagnóstico: Foto de Perfil no se Muestra en el Header

## Problema
La foto de perfil del usuario no se está mostrando en el header principal después de guardarla en la base de datos.

## Análisis del Código

### ✅ Backend (C#) - CORRECTO
El backend está funcionando correctamente:
- **UsersController.cs**: Tiene el endpoint `POST /api/users/{id}/profile-image` que guarda la imagen
- **AuthService.cs**: El método `MapToUserDto` devuelve correctamente `ProfileImageUrl`
- Las imágenes se guardan en: `backend/wwwroot/uploads/profiles/`
- La URL devuelta es: `/uploads/profiles/user_{id}_{guid}.{ext}`

### ✅ Frontend - AuthService - CORRECTO
El servicio de autenticación está actualizado correctamente:
- `updateUserProfileImage()`: Actualiza el usuario en localStorage y en el BehaviorSubject
- `currentUser$`: Observable que emite cambios del usuario

### ✅ Frontend - ProfileComponent - CORRECTO
El componente de perfil funciona correctamente:
- `uploadPhoto()`: Llama a `authService.updateUserProfileImage()`
- Actualiza el usuario local con `this.currentUser.set(updatedUser)`

### ⚠️ Frontend - HeaderComponent - REVISAR
El header se suscribe a los cambios del usuario:
```typescript
ngOnInit(): void {
  // Suscribirse a cambios del usuario
  this.authService.currentUser$.subscribe(user => {
    this.currentUser.set(user);
  });
}
```

## Posibles Causas del Problema

### 1. **La imagen no se está guardando en la base de datos**
**Verificar:**
- Abrir las herramientas de desarrollador (F12)
- Ir a la pestaña "Network"
- Subir una foto de perfil
- Buscar la petición POST a `/api/users/{id}/profile-image`
- Verificar que la respuesta incluya `profileImageUrl`

**Solución si falla:**
- Verificar que el backend esté corriendo
- Verificar permisos de escritura en `backend/wwwroot/uploads/profiles/`

### 2. **La URL de la imagen no es accesible**
**Verificar:**
- Abrir: `http://192.168.1.20:7003/uploads/profiles/`
- Verificar que las imágenes sean accesibles

**Solución si falla:**
- Verificar configuración de archivos estáticos en `Program.cs`:
```csharp
app.UseStaticFiles(); // Debe estar antes de UseRouting
```

### 3. **El header no se está actualizando después de cambiar la foto**
**Verificar:**
- Abrir consola del navegador (F12)
- Activar `enableDebugMode: true` en `environment.ts`
- Subir una foto
- Buscar logs que digan: `🖼️ Header - Imagen procesada:`

**Solución:**
El header ya tiene la suscripción correcta a `currentUser$`, pero puedes forzar una actualización manual.

### 4. **Error de CORS o permisos**
**Verificar:**
- Buscar errores en la consola del navegador
- Buscar errores 403 o 404 en la pestaña Network

## Pasos para Diagnosticar

### Paso 1: Verificar que la imagen se guarda
```typescript
// En profile.ts, después de uploadPhoto() exitoso:
console.log('✅ Usuario actualizado:', updatedUser);
console.log('📸 URL de imagen:', updatedUser.profileImageUrl);
```

### Paso 2: Verificar que el header recibe la actualización
```typescript
// En header.ts, en ngOnInit():
this.authService.currentUser$.subscribe(user => {
  console.log('🔄 Header - Usuario actualizado:', user);
  console.log('📸 Header - URL de imagen:', user?.profileImageUrl);
  this.currentUser.set(user);
});
```

### Paso 3: Verificar la URL completa
```typescript
// En header.ts, en getProfileImageUrl():
console.log('🖼️ URL procesada:', fullUrl);
```

### Paso 4: Verificar localStorage
```javascript
// En la consola del navegador:
JSON.parse(localStorage.getItem('flexoapp_user'))
// Debe mostrar el usuario con profileImageUrl
```

## Solución Rápida

Si después de subir la foto no se muestra en el header, intenta:

### Opción 1: Recargar la página
```typescript
// En profile.ts, después de uploadPhoto() exitoso:
window.location.reload();
```

### Opción 2: Forzar actualización del header
```typescript
// En profile.ts, después de uploadPhoto() exitoso:
this.authService.currentUser$.next(updatedUser);
```

### Opción 3: Verificar que el backend devuelve la URL correcta
El backend debe devolver:
```json
{
  "message": "Imagen de perfil actualizada exitosamente",
  "profileImageUrl": "/uploads/profiles/user_1_abc123.jpg",
  "user": {
    "id": "1",
    "userCode": "admin",
    "profileImageUrl": "/uploads/profiles/user_1_abc123.jpg",
    ...
  }
}
```

## Configuración Correcta

### environment.ts
```typescript
imageBaseUrl: 'http://192.168.1.20:7003',
```

### Program.cs (Backend)
```csharp
// Configurar archivos estáticos ANTES de UseRouting
app.UseStaticFiles();
app.UseRouting();
```

### UsersController.cs
```csharp
// La URL debe ser relativa:
var imageUrl = $"/uploads/profiles/{fileName}";
```

## Prueba Final

1. Subir una foto de perfil
2. Verificar en Network que la respuesta incluye `profileImageUrl`
3. Copiar la URL completa: `http://192.168.1.20:7003/uploads/profiles/user_X_XXX.jpg`
4. Pegarla en el navegador - debe mostrar la imagen
5. Si la imagen se ve en el navegador pero no en el header, el problema es de actualización del componente
6. Si la imagen NO se ve en el navegador, el problema es del backend o permisos de archivos

## Contacto
Si el problema persiste después de seguir estos pasos, proporciona:
- Captura de pantalla de la consola del navegador
- Captura de pantalla de la pestaña Network mostrando la respuesta del POST
- Logs del backend (backend/logs/flexoapp-YYYYMMDD.log)
