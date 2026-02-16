# 🧪 Guía de Pruebas del Sistema de Permisos

## 📋 **Checklist de Pruebas**

### **PASO 1: Verificar que el Script SQL fue Ejecutado** ✅

1. **Abrir phpMyAdmin:** `http://localhost/phpmyadmin`
2. **Seleccionar base de datos:** `flexoapp_bd`
3. **Ir a pestaña "SQL"**
4. **Copiar y pegar** el contenido de: `backend/Database/Scripts/VERIFICAR_PERMISOS.sql`
5. **Ejecutar** y verificar resultados

**Resultados Esperados:**
- ✅ Tabla `permissions` existe con 28 filas
- ✅ Tabla `user_permissions` existe con 28 filas (admin)
- ✅ 5 categorías de permisos
- ✅ Admin tiene 100% de permisos (28/28)

---

### **PASO 2: Verificar Backend (API)** ✅

#### **2.1 Verificar que el backend está corriendo**
- El backend debería estar corriendo en: `http://localhost:5000` o `http://localhost:5001`
- Verificar en la consola que no hay errores

#### **2.2 Probar endpoints de permisos**

**Opción A: Usando el navegador**

1. **Obtener todos los permisos:**
   ```
   http://localhost:5000/api/permissions
   ```
   **Resultado esperado:** JSON con 28 permisos

2. **Obtener permisos de un usuario (reemplaza {userId} con el ID del admin):**
   ```
   http://localhost:5000/api/permissions/user/1
   ```
   **Resultado esperado:** JSON con permisos del usuario

**Opción B: Usando PowerShell**

```powershell
# Obtener todos los permisos
Invoke-RestMethod -Uri "http://localhost:5000/api/permissions" -Method Get

# Obtener permisos del usuario 1 (admin)
Invoke-RestMethod -Uri "http://localhost:5000/api/permissions/user/1" -Method Get
```

**Opción C: Usando curl (si está instalado)**

```bash
# Obtener todos los permisos
curl http://localhost:5000/api/permissions

# Obtener permisos del usuario 1
curl http://localhost:5000/api/permissions/user/1
```

---

### **PASO 3: Verificar Frontend (Interfaz de Permisos)** ✅

#### **3.1 Abrir la aplicación**
1. Ir a: `http://localhost:4200`
2. Iniciar sesión con el usuario **Admin**

#### **3.2 Navegar a Settings → Permisos**
1. Click en el menú lateral → **Settings** (⚙️)
2. Click en la pestaña **"Permisos"** (🔒)

#### **3.3 Verificar la interfaz**

**Deberías ver:**
- ✅ Header con título "Permisos de Usuario"
- ✅ Selector de usuario (dropdown)
- ✅ 5 categorías de permisos:
  1. **Gestión de Usuarios** (4 permisos)
  2. **Configuración del Sistema** (3 permisos)
  3. **Acceso a Módulos** (8 permisos)
  4. **Acciones Específicas** (5 permisos)
  5. **Acciones del Módulo de Máquinas** (7 permisos) ⭐ **NUEVO**

#### **3.4 Seleccionar el usuario Admin**
1. Click en el selector de usuario
2. Seleccionar el usuario Admin
3. **Verificar:** Todos los permisos deberían estar en **VERDE (ON)**
4. **Verificar:** Contador debería mostrar "28/28" o "7/7" en cada categoría

#### **3.5 Probar cambiar permisos**
1. Click en un botón **ON** (verde)
2. **Resultado esperado:** Debería cambiar a **OFF** (rojo)
3. **Verificar:** Debería aparecer una notificación de éxito
4. Click nuevamente para volver a **ON**
5. **Verificar:** Debería volver a verde

---

### **PASO 4: Verificar Integración en Módulo de Máquinas** ✅

#### **4.1 Preparación**
1. Crear un usuario de prueba (si no existe):
   - Ir a **Settings → Usuarios**
   - Crear un usuario con rol **"Operario"**
   - Anotar el código de usuario

#### **4.2 Asignar permisos limitados**
1. Ir a **Settings → Permisos**
2. Seleccionar el usuario **Operario** del dropdown
3. **Desactivar** los siguientes permisos (dejar en rojo):
   - ❌ Cambiar a Prealistando
   - ❌ Cambiar a Listo
4. **Activar** los siguientes permisos (dejar en verde):
   - ✅ Cambiar a Corriendo
   - ✅ Cambiar a Terminado
   - ✅ Cambiar a Suspendido
   - ✅ Enviar mensaje
   - ✅ Imprimir

#### **4.3 Cerrar sesión y entrar como Operario**
1. Click en el menú de usuario → **Cerrar sesión**
2. Iniciar sesión con el usuario **Operario**

#### **4.4 Ir al módulo de Máquinas**
1. Click en **Máquinas** en el menú lateral
2. Seleccionar una máquina (ej: Máquina 11)

#### **4.5 Verificar botones deshabilitados**

**En la columna de Acciones, deberías ver:**

✅ **Botones HABILITADOS (activos):**
- ✅ **Corriendo** - Botón funcional
- ✅ **Terminado** - Botón funcional
- ✅ **Suspendido** - Botón funcional
- ✅ **Enviar Mensaje** - Botón funcional
- ✅ **Imprimir** - Botón funcional

❌ **Botones DESHABILITADOS (grises/inactivos):**
- ❌ **Preparando** - Botón deshabilitado
- ❌ **Listo** - Botón deshabilitado

#### **4.6 Intentar usar los botones**
1. **Click en "Corriendo"** → Debería funcionar ✅
2. **Click en "Preparando"** → No debería hacer nada (está deshabilitado) ❌
3. **Click en "Imprimir"** → Debería abrir ventana de impresión ✅

---

### **PASO 5: Pruebas Avanzadas** ✅

#### **5.1 Probar con diferentes roles**

**Pre-alistador:**
- ✅ Puede: Preparando, Listo
- ❌ NO puede: Corriendo, Terminado, Suspendido

**Operario:**
- ✅ Puede: Corriendo, Terminado, Suspendido
- ❌ NO puede: Preparando, Listo

**Supervisor:**
- ✅ Puede: TODO

**Admin:**
- ✅ Puede: TODO
- ✅ Puede gestionar permisos de otros

#### **5.2 Verificar persistencia**
1. Cambiar permisos de un usuario
2. Cerrar sesión
3. Volver a entrar
4. **Verificar:** Los permisos deberían mantenerse

#### **5.3 Verificar en base de datos**
```sql
-- Ver permisos de un usuario específico
SELECT 
    u.UserCode,
    u.FirstName,
    u.LastName,
    p.code,
    p.name,
    up.is_granted,
    up.granted_at
FROM user_permissions up
INNER JOIN users u ON up.user_id = u.Id
INNER JOIN permissions p ON up.permission_code = p.code
WHERE u.UserCode = 'CODIGO_USUARIO'
  AND up.is_granted = 1
ORDER BY p.category, p.code;
```

---

## 🐛 **Solución de Problemas**

### **Problema 1: No veo la pestaña de Permisos**
**Solución:**
- Verificar que el script SQL fue ejecutado
- Verificar que el backend está corriendo sin errores
- Refrescar la página (Ctrl + F5)

### **Problema 2: Los botones no se deshabilitan**
**Solución:**
- Verificar que los permisos están asignados correctamente en la BD
- Verificar que el usuario tiene permisos cargados (consola del navegador)
- Verificar que el servicio de permisos está inyectado correctamente

### **Problema 3: Error al cambiar permisos**
**Solución:**
- Verificar que eres Admin
- Verificar que el backend está respondiendo
- Revisar la consola del navegador (F12) para ver errores

### **Problema 4: Todos los botones están deshabilitados**
**Solución:**
- El usuario no tiene permisos asignados
- Ir a Settings → Permisos y asignar permisos
- Cerrar sesión y volver a entrar

---

## ✅ **Checklist Final**

Marca cada item cuando lo hayas verificado:

### **Base de Datos:**
- [ ] Tabla `permissions` creada con 28 permisos
- [ ] Tabla `user_permissions` creada
- [ ] Admin tiene todos los permisos (28/28)

### **Backend:**
- [ ] Backend corriendo sin errores
- [ ] Endpoint `/api/permissions` funciona
- [ ] Endpoint `/api/permissions/user/{id}` funciona

### **Frontend - Interfaz de Permisos:**
- [ ] Pestaña "Permisos" visible en Settings
- [ ] Selector de usuario funciona
- [ ] Se muestran 5 categorías de permisos
- [ ] Botones ON/OFF funcionan
- [ ] Se guardan los cambios correctamente
- [ ] Notificaciones aparecen al cambiar permisos

### **Frontend - Módulo de Máquinas:**
- [ ] Botones se deshabilitan según permisos
- [ ] Usuario sin permiso no puede usar botón
- [ ] Usuario con permiso puede usar botón
- [ ] Cambios de permisos se reflejan inmediatamente

### **Funcionalidad General:**
- [ ] Permisos persisten después de cerrar sesión
- [ ] Solo Admin puede modificar permisos
- [ ] Otros usuarios pueden ver pero no modificar
- [ ] Sistema funciona con diferentes roles

---

## 🎉 **¡Sistema Funcionando!**

Si todos los items están marcados, ¡el sistema de permisos está funcionando correctamente!

**Próximos pasos:**
1. Asignar permisos a todos los usuarios según sus roles
2. Documentar qué permisos tiene cada rol
3. Capacitar a los usuarios sobre el nuevo sistema

---

## 📝 **Notas Adicionales**

### **Comandos Útiles para Debugging:**

**Ver permisos en consola del navegador (F12):**
```javascript
// Ver permisos del usuario actual
console.log(localStorage.getItem('currentUser'));

// Ver si tiene un permiso específico
// (esto requiere que el servicio esté disponible)
```

**Ver logs del backend:**
- Revisar la consola donde corre `dotnet run`
- Buscar mensajes que empiecen con `🔐` (permisos)

**Refrescar datos:**
- Frontend: Ctrl + F5 (hard refresh)
- Backend: Reiniciar el servidor
- Base de datos: Re-ejecutar queries

---

¿Necesitas ayuda con alguna prueba específica? ¡Avísame!
