# 🚀 Instrucciones para Ejecutar el Script SQL de Permisos

## 📋 **Script a Ejecutar**
**Archivo:** `backend/Database/Scripts/CREATE_PERMISSIONS_TABLES.sql`

Este script creará:
- ✅ Tabla `permissions` (28 permisos)
- ✅ Tabla `user_permissions` (relación usuario-permiso)
- ✅ 28 permisos iniciales en 5 categorías
- ✅ Asignación automática de todos los permisos al primer usuario Admin

## 🔧 **Opción 1: Usando phpMyAdmin (RECOMENDADO)**

### **Pasos:**

1. **Abrir phpMyAdmin**
   - URL: `http://localhost/phpmyadmin`
   - O desde XAMPP Control Panel → MySQL → Admin

2. **Seleccionar la base de datos**
   - Click en `flexoapp_bd` en el panel izquierdo

3. **Ir a la pestaña SQL**
   - Click en la pestaña "SQL" en la parte superior

4. **Copiar y pegar el script**
   - Abrir el archivo: `backend/Database/Scripts/CREATE_PERMISSIONS_TABLES.sql`
   - Copiar TODO el contenido
   - Pegarlo en el área de texto de phpMyAdmin

5. **Ejecutar**
   - Click en el botón "Continuar" o "Go"
   - Esperar a que termine (debería tomar 1-2 segundos)

6. **Verificar resultados**
   - Deberías ver mensajes de éxito
   - Verificar que se crearon las tablas:
     - `permissions` (28 filas)
     - `user_permissions` (28 filas para el admin)

## 🔧 **Opción 2: Usando MySQL Workbench**

### **Pasos:**

1. **Abrir MySQL Workbench**
   - Conectar a tu servidor local

2. **Seleccionar la base de datos**
   ```sql
   USE flexoapp_bd;
   ```

3. **Abrir el script**
   - File → Open SQL Script
   - Seleccionar: `backend/Database/Scripts/CREATE_PERMISSIONS_TABLES.sql`

4. **Ejecutar**
   - Click en el icono del rayo ⚡ (Execute)
   - O presionar `Ctrl + Shift + Enter`

5. **Verificar resultados**
   - Revisar el panel de salida
   - Verificar las tablas creadas

## 🔧 **Opción 3: Línea de Comandos (Si MySQL está en PATH)**

### **Windows PowerShell:**
```powershell
# Navegar a la carpeta del proyecto
cd "c:\Users\emili\Desktop\proyecto flexospring\flexoAPP_localhost"

# Ejecutar el script (reemplaza 'root' con tu usuario si es diferente)
mysql -u root -p flexoapp_bd < backend/Database/Scripts/CREATE_PERMISSIONS_TABLES.sql
```

### **Si MySQL está en XAMPP:**
```powershell
# Ruta completa a mysql.exe
& "C:\xampp\mysql\bin\mysql.exe" -u root -p flexoapp_bd < backend/Database/Scripts/CREATE_PERMISSIONS_TABLES.sql
```

### **Cuando te pida la contraseña:**
- Si no tienes contraseña, presiona Enter
- Si tienes contraseña, ingrésala

## ✅ **Verificación Post-Ejecución**

### **1. Verificar tablas creadas:**
```sql
SHOW TABLES LIKE '%permission%';
```
**Resultado esperado:**
```
permissions
user_permissions
```

### **2. Verificar cantidad de permisos:**
```sql
SELECT COUNT(*) as total_permisos FROM permissions;
```
**Resultado esperado:** `28`

### **3. Verificar permisos por categoría:**
```sql
SELECT category, COUNT(*) as cantidad 
FROM permissions 
GROUP BY category 
ORDER BY category;
```
**Resultado esperado:**
```
actions             | 5
machines_actions    | 7
modules             | 8
system              | 3
users               | 4
```

### **4. Verificar permisos del admin:**
```sql
SELECT u.FirstName, u.LastName, u.Role, COUNT(up.Id) as permisos_concedidos
FROM users u
LEFT JOIN user_permissions up ON u.Id = up.user_id AND up.is_granted = TRUE
WHERE u.Role = 'Admin'
GROUP BY u.Id
LIMIT 1;
```
**Resultado esperado:** El admin debería tener 28 permisos concedidos

### **5. Ver todos los permisos creados:**
```sql
SELECT code, name, category, is_active 
FROM permissions 
ORDER BY category, code;
```

## 🎯 **Permisos que se Crearán**

### **1. Gestión de Usuarios (4)**
- `users.view` - Ver usuarios
- `users.create` - Crear usuarios
- `users.edit` - Editar usuarios
- `users.delete` - Eliminar usuarios

### **2. Configuración del Sistema (3)**
- `system.configure` - Configurar sistema
- `permissions.manage` - Gestión de permisos
- `settings.change` - Cambiar ajustes

### **3. Acceso a Módulos (8)**
- `module.settings` - Módulo de configuraciones
- `module.reports` - Módulo de reportes
- `module.machines` - Módulo de máquinas
- `module.design` - Módulo de diseño
- `module.documents` - Módulo de documentos
- `module.information` - Módulo de información
- `module.unique_condition` - Módulo de condición única
- `module.order_query` - Módulo de consulta de pedido

### **4. Acciones Específicas (6)**
- `action.export` - Botón de exportar
- `action.import` - Botón de importar
- `action.add_programming` - Botón de agregar programación
- `action.create` - Botón de crear
- `reports.view` - Ver reportes

### **5. Acciones del Módulo de Máquinas (7)** ⭐ **NUEVO**
- `machines.status.prealistando` - Cambiar a Prealistando
- `machines.status.listo` - Cambiar a Listo
- `machines.status.corriendo` - Cambiar a Corriendo
- `machines.status.terminado` - Cambiar a Terminado
- `machines.status.suspendido` - Cambiar a Suspendido
- `machines.send_message` - Enviar mensaje
- `machines.print` - Imprimir

## 🚨 **Solución de Problemas**

### **Error: "Table 'permissions' already exists"**
**Solución:** Las tablas ya existen. Puedes:
1. Eliminar las tablas existentes:
   ```sql
   DROP TABLE IF EXISTS user_permissions;
   DROP TABLE IF EXISTS permissions;
   ```
2. Volver a ejecutar el script

### **Error: "Unknown database 'flexoapp_bd'"**
**Solución:** La base de datos no existe. Créala primero:
```sql
CREATE DATABASE IF NOT EXISTS flexoapp_bd;
USE flexoapp_bd;
```

### **Error: "Access denied"**
**Solución:** Verifica usuario y contraseña de MySQL

### **Error: "Foreign key constraint fails"**
**Solución:** Asegúrate de que la tabla `users` existe y tiene al menos un usuario Admin

## 📝 **Después de Ejecutar el Script**

1. ✅ **Reiniciar el backend** (si está corriendo)
   - El backend debería detectar las nuevas tablas automáticamente

2. ✅ **Ir a Settings → Permisos** en la aplicación
   - Deberías ver la nueva interfaz de permisos
   - Deberías ver 5 categorías de permisos
   - El usuario Admin debería tener todos los permisos activos (verde)

3. ✅ **Asignar permisos a otros usuarios**
   - Seleccionar un usuario del dropdown
   - Activar/desactivar permisos según su rol
   - Los cambios se guardan automáticamente

4. ✅ **Probar en el módulo de Máquinas**
   - Iniciar sesión con un usuario que NO sea Admin
   - Ir al módulo de Máquinas
   - Verificar que los botones se deshabilitan según los permisos

## 🎉 **¡Listo!**

Una vez ejecutado el script, el sistema de permisos estará completamente funcional.

**¿Necesitas ayuda?** Revisa los mensajes de error y compáralos con la sección de solución de problemas.
