# 🐛 DEBUG: FOTOS DE PERFIL NO SE MUESTRAN

## 🔍 PASOS PARA DEBUGGEAR

### 1. Verificar Datos en el Frontend
1. **Abrir la aplicación** en `http://localhost:4200/settings`
2. **Hacer clic en el botón rojo de debug** (🐛) en el header
3. **Abrir DevTools** (F12) y ir a la pestaña Console
4. **Revisar los logs** que aparecen con el formato:
   ```
   🐛 DEBUG: Datos de usuarios actuales:
   👤 Usuario 1: {
     userCode: "ADMIN001",
     firstName: "Carlos",
     lastName: "Rodriguez", 
     email: "carlos@ejemplo.com",
     phone: "+57 300 123 4567",
     profileImageUrl: "data:image/jpeg;base64,/9j/4AAQ...",
     profileImageLength: 15234,
     hasImage: true
   }
   ```

### 2. Verificar Datos en el Backend
```sql
-- Conectar a MySQL y verificar
USE flexoapp_bd;

-- Ver usuarios con imágenes
SELECT 
    UserCode,
    FirstName,
    LastName,
    Email,
    CASE 
        WHEN ProfileImage IS NOT NULL THEN CONCAT('Base64: ', CHAR_LENGTH(ProfileImage), ' chars')
        WHEN ProfileImageUrl IS NOT NULL THEN CONCAT('URL: ', ProfileImageUrl)
        ELSE 'Sin imagen'
    END as ImageInfo
FROM users;
```

### 3. Verificar Logs del Mapeo
En la consola del navegador, buscar logs como:
```
👤 Mapeando usuario: ADMIN001 {
  email: "carlos@ejemplo.com",
  phone: "+57 300 123 4567", 
  profileImageUrl: "/uploads/profile1.jpg",
  profileImage: "Tiene imagen base64"
}
```

### 4. Verificar Función getProfileImageUrl
Buscar logs como:
```
🖼️ ProfileImageUrl recibido: "data:image/jpeg;base64,/9j/4AAQ..." (longitud: 15234)
📷 Imagen base64 detectada (15KB)
```

## 🔧 POSIBLES PROBLEMAS Y SOLUCIONES

### ❌ Problema 1: ProfileImage es null en el backend
**Síntomas**: 
- `profileImage: "Sin imagen base64"` en los logs
- `profileImageUrl: ""` o `null`

**Solución**: Verificar que el backend esté guardando correctamente:
```csharp
// En AuthService.cs - CreateUserAsync
ProfileImage = createUserDto.ProfileImage,  // ✅ Debe estar presente
```

### ❌ Problema 2: Frontend no recibe ProfileImage
**Síntomas**:
- Backend tiene datos pero frontend no los ve
- `(user as any).profileImage` es undefined

**Solución**: Verificar que el UserDto incluya ProfileImage:
```csharp
// En AuthService.cs - MapToUserDto
ProfileImage = user.ProfileImage,  // ✅ Debe estar presente
```

### ❌ Problema 3: HTML no muestra la imagen
**Síntomas**:
- `hasImage: true` en logs pero no se ve la imagen
- Avatar por defecto se muestra siempre

**Solución**: Verificar la función `hasProfileImage()`:
```typescript
hasProfileImage(user: User): boolean {
  const hasImage = !!(user.profileImageUrl && user.profileImageUrl.trim() !== '');
  console.log(`👤 Usuario ${user.userCode} tiene imagen:`, hasImage);
  return hasImage;
}
```

### ❌ Problema 4: Imagen base64 malformada
**Síntomas**:
- `hasImage: true` pero imagen no carga
- Error en consola del navegador

**Solución**: Verificar formato base64:
```typescript
// Debe empezar con: data:image/jpeg;base64, o data:image/png;base64,
if (profileImageUrl.startsWith('data:image/')) {
  console.log(`📷 Imagen base64 detectada`);
  return profileImageUrl;
}
```

## 🧪 TESTS MANUALES

### Test 1: Crear Usuario con Imagen
1. Hacer clic en "Agregar Usuario"
2. Llenar datos y subir una imagen
3. Guardar usuario
4. Verificar que aparece en la tabla con foto

### Test 2: Verificar Datos en MySQL
```sql
-- Verificar que se guardó la imagen
SELECT UserCode, 
       CHAR_LENGTH(ProfileImage) as ImageSize,
       LEFT(ProfileImage, 50) as ImageStart
FROM users 
WHERE UserCode = 'NUEVO_USUARIO';
```

### Test 3: Verificar Logs del Frontend
1. Hacer clic en botón debug (🐛)
2. Verificar en consola:
   - `profileImageLength: > 0`
   - `hasImage: true`
   - Logs de `getProfileImageUrl()`

## 📊 CHECKLIST DE VERIFICACIÓN

### Backend ✅
- [ ] `CreateUserDto` incluye `Email` y `ProfileImage`
- [ ] `UpdateUserDto` incluye `Email` y `ProfileImage`  
- [ ] `CreateUserAsync` asigna `Email` y `ProfileImage`
- [ ] `UpdateUserProfileAsync` actualiza `Email` y `ProfileImage`
- [ ] `MapToUserDto` incluye `ProfileImage` y `ProfileImageUrl`

### Frontend ✅
- [ ] Mapeo de usuarios prioriza `ProfileImage` sobre `ProfileImageUrl`
- [ ] Función `hasProfileImage()` funciona correctamente
- [ ] Función `getProfileImageUrl()` maneja base64
- [ ] HTML usa `hasProfileImage()` para mostrar/ocultar imagen
- [ ] Logs de debug muestran datos correctos

### Base de Datos ✅
- [ ] Tabla `users` tiene columna `ProfileImage` (LONGTEXT)
- [ ] Tabla `users` tiene columna `ProfileImageUrl` (VARCHAR)
- [ ] Usuarios tienen datos en `ProfileImage` o `ProfileImageUrl`

## 🚀 COMANDOS ÚTILES

### Reiniciar Backend
```bash
cd backend
dotnet run
```

### Verificar MySQL
```bash
mysql -u root -p12345 -h localhost -P 3306 flexoapp_bd
```

### Ver Logs del Frontend
1. F12 → Console
2. Filtrar por: `🖼️`, `👤`, `📷`, `🐛`

---

## 🎯 RESULTADO ESPERADO

Después del debug, deberías ver:
- ✅ Usuarios con `hasImage: true` en los logs
- ✅ Imágenes base64 detectadas correctamente  
- ✅ Fotos de perfil visibles en la tabla
- ✅ Avatares por defecto solo para usuarios sin foto

**¡Usa el botón de debug (🐛) para verificar qué está pasando!** 🔍