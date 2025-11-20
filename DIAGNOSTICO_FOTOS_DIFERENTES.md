# Diagnóstico: Fotos Diferentes en Header vs Settings

## Problema
Las fotos de perfil que se muestran en el header y en el gestor de usuarios (settings) son diferentes.

## Script de Diagnóstico

Abre la consola del navegador (F12) y ejecuta este código:

```javascript
// 1. Verificar usuario en localStorage
const storedUser = JSON.parse(localStorage.getItem('flexoapp_user'));
console.group('💾 Usuario en localStorage');
console.log('userCode:', storedUser?.userCode);
console.log('profileImageUrl:', storedUser?.profileImageUrl);
console.log('profileImage:', storedUser?.profileImage);
console.groupEnd();

// 2. Verificar usuario en el header (desde el DOM)
const headerImg = document.querySelector('.user-section .user-avatar img');
console.group('🎯 Imagen en el HEADER');
console.log('src:', headerImg?.src);
console.log('data-original-src:', headerImg?.getAttribute('data-original-src'));
console.groupEnd();

// 3. Verificar usuario en settings (desde el DOM)
const settingsImg = document.querySelector('.users-table .user-avatar img');
console.group('📊 Imagen en SETTINGS');
console.log('src:', settingsImg?.src);
console.log('data-original-src:', settingsImg?.getAttribute('data-original-src'));
console.groupEnd();

// 4. Comparar URLs
console.group('🔍 COMPARACIÓN');
console.log('¿Son iguales?', headerImg?.src === settingsImg?.src);
console.log('Diferencia:', {
  header: headerImg?.src,
  settings: settingsImg?.src
});
console.groupEnd();
```

## Posibles Causas

### 1. Usuario en localStorage desactualizado
**Síntoma**: El header muestra una foto antigua porque lee de localStorage
**Solución**: Actualizar localStorage después de cambiar la foto

### 2. Settings carga usuarios desde la API
**Síntoma**: Settings muestra la foto correcta porque la obtiene del servidor
**Solución**: Forzar actualización del usuario en el header después de cambiar foto

### 3. URLs construidas de forma diferente
**Síntoma**: Ambos componentes construyen la URL de manera diferente
**Solución**: Usar exactamente el mismo código (ya lo hicimos)

## Solución Rápida

### Opción 1: Forzar recarga del usuario en el header
Después de subir una foto en el perfil, ejecuta:

```typescript
// En profile.ts, después de uploadPhoto() exitoso:
window.location.reload(); // Recargar página completa
```

### Opción 2: Actualizar manualmente el usuario en el header
```typescript
// En profile.ts, después de uploadPhoto() exitoso:
this.authService.currentUser$.next(updatedUser);
```

### Opción 3: Limpiar localStorage y volver a iniciar sesión
```javascript
// En la consola del navegador:
localStorage.clear();
// Luego volver a iniciar sesión
```

## Verificación Final

Después de aplicar la solución, verifica:

1. ✅ La foto en el header coincide con la de settings
2. ✅ El localStorage tiene la URL correcta
3. ✅ Ambas imágenes apuntan a la misma URL
4. ✅ La URL es accesible en el navegador

## Información Adicional

### Flujo de actualización de foto:
1. Usuario sube foto en perfil → Backend guarda en `/uploads/profiles/`
2. Backend devuelve usuario actualizado con `profileImageUrl`
3. Frontend actualiza localStorage con el nuevo usuario
4. Header se suscribe a `currentUser$` y se actualiza automáticamente
5. Settings carga usuarios desde la API cada vez que se abre

### Si el problema persiste:
- Verifica que el backend esté devolviendo la misma URL en ambos endpoints
- Verifica que no haya caché del navegador
- Verifica que las imágenes existan en `backend/wwwroot/uploads/profiles/`
