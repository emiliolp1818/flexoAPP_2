# 🐛 Debugging de Acciones - Paso a Paso

## ❌ Problema Actual
El frontend está enviando correctamente la petición PATCH, pero el backend está devolviendo un error 500 (Internal Server Error).

---

## 🔍 Paso 1: Verificar los Logs del Backend

### **Abrir la terminal donde está corriendo el backend**

Busca líneas que contengan:
- `🎯 PATCH /api/maquinas/` - Indica que la petición llegó al controlador
- `❌ Error actualizando estado` - Indica el error específico
- `Stack Trace` - Muestra dónde ocurrió el error

### **Ejemplo de logs esperados:**

```
🎯 PATCH /api/maquinas/F204576/status - Estado: LISTO, Observaciones: null
🔄 Actualizando estado de máquina F204576 a LISTO por usuario 1 (Sistema)
🔍 Buscando máquina con artículo: F204576
📊 Estado anterior: PREPARANDO, Estado nuevo: LISTO
✅ Filas afectadas: 1
✅ Estado de máquina F204576 actualizado exitosamente de PREPARANDO a LISTO
```

### **Si ves un error, copia TODO el mensaje de error y el stack trace**

---

## 🧪 Paso 2: Probar el Endpoint de Test

### **Opción A: Usar el navegador**

1. Abre una nueva pestaña en el navegador
2. Navega a: `http://localhost:7003/api/maquinas/test-update/F204576`
3. Deberías ver una respuesta JSON como:

```json
{
  "success": true,
  "message": "Test exitoso. 1 filas actualizadas",
  "articulo": "F204576",
  "rowsAffected": 1,
  "timestamp": "2025-11-15T03:00:00.000Z"
}
```

### **Opción B: Usar PowerShell**

```powershell
Invoke-RestMethod -Uri "http://localhost:7003/api/maquinas/test-update/F204576" -Method Get
```

### **Si el test funciona:**
- ✅ La conexión a la base de datos está bien
- ✅ El UPDATE funciona correctamente
- ❌ El problema está en el endpoint PATCH principal

### **Si el test falla:**
- ❌ Hay un problema con la conexión a la base de datos
- Revisa los logs del backend para ver el error específico

---

## 🔍 Paso 3: Verificar la Estructura de la Tabla

### **Ejecutar en MySQL Workbench:**

```sql
-- Ver la estructura de la tabla
DESCRIBE maquinas;

-- Verificar que el artículo existe
SELECT articulo, estado, observaciones, last_action_by, last_action_at 
FROM maquinas 
WHERE articulo = 'F204576';

-- Ver todos los artículos disponibles
SELECT articulo, numero_maquina, estado 
FROM maquinas 
ORDER BY numero_maquina, articulo;
```

### **Verificar que existan estas columnas:**
- ✅ `articulo` (VARCHAR, PRIMARY KEY)
- ✅ `estado` (VARCHAR)
- ✅ `observaciones` (TEXT o VARCHAR)
- ✅ `updated_by` (INT)
- ✅ `updated_at` (DATETIME)
- ✅ `last_action_by` (VARCHAR)
- ✅ `last_action_at` (DATETIME)

---

## 🔍 Paso 4: Verificar el Request del Frontend

### **Abrir la consola del navegador (F12) → Pestaña Network**

1. Hacer clic en un botón de acción (LISTO, CORRIENDO, etc.)
2. Buscar la petición `status` en la lista
3. Hacer clic en la petición
4. Ver la pestaña **Headers**:

```
Request URL: http://localhost:7003/api/maquinas/F204576/status
Request Method: PATCH
Status Code: 500 Internal Server Error
```

5. Ver la pestaña **Payload** (Request Body):

```json
{
  "estado": "LISTO",
  "observaciones": null
}
```

6. Ver la pestaña **Response**:

```json
{
  "success": false,
  "message": "Error interno del servidor al actualizar estado",
  "error": "...",
  "stackTrace": "..."
}
```

### **Copiar el contenido completo de la pestaña Response**

---

## 🔍 Paso 5: Verificar que el Backend Esté Corriendo

### **Verificar el puerto:**

```powershell
# Ver procesos escuchando en el puerto 7003
netstat -ano | findstr :7003
```

### **Verificar que el backend responda:**

```powershell
# Probar el endpoint de salud (si existe)
Invoke-RestMethod -Uri "http://localhost:7003/api/maquinas" -Method Get
```

---

## 🔧 Paso 6: Soluciones Comunes

### **Error: "Column 'estado' cannot be null"**

**Causa:** El campo `estado` en la tabla no permite valores NULL

**Solución:**
```sql
ALTER TABLE maquinas MODIFY estado VARCHAR(20) NOT NULL DEFAULT 'PREPARANDO';
```

### **Error: "Unknown column 'last_action_by'"**

**Causa:** La columna no existe en la tabla

**Solución:**
```sql
ALTER TABLE maquinas ADD COLUMN last_action_by VARCHAR(100) NULL;
ALTER TABLE maquinas ADD COLUMN last_action_at DATETIME NULL;
```

### **Error: "Incorrect string value"**

**Causa:** Problema de codificación de caracteres

**Solución:**
```sql
ALTER TABLE maquinas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### **Error: "Deadlock found when trying to get lock"**

**Causa:** Otra transacción está bloqueando la tabla

**Solución:**
```sql
-- Ver transacciones activas
SHOW PROCESSLIST;

-- Matar transacciones bloqueadas (reemplazar ID)
KILL <process_id>;
```

### **Error: "Connection refused" o "Cannot connect to MySQL"**

**Causa:** El backend no puede conectarse a MySQL

**Solución:**
1. Verificar que MySQL esté corriendo
2. Verificar las credenciales en `appsettings.json`
3. Verificar el puerto de MySQL (3306 por defecto)

---

## 📋 Checklist de Verificación

- [ ] Backend corriendo en `http://localhost:7003`
- [ ] MySQL corriendo y accesible
- [ ] Tabla `maquinas` existe y tiene todas las columnas necesarias
- [ ] Hay datos de prueba en la tabla `maquinas`
- [ ] El artículo `F204576` existe en la tabla
- [ ] El endpoint de test funciona: `/api/maquinas/test-update/F204576`
- [ ] Los logs del backend muestran la petición entrante
- [ ] La consola del navegador muestra el request correcto
- [ ] No hay errores de CORS en la consola del navegador

---

## 🆘 Información Necesaria para Soporte

Si después de seguir todos estos pasos el problema persiste, proporciona:

1. **Logs completos del backend** (desde que se inicia hasta el error)
2. **Respuesta completa del error** (de la pestaña Network → Response)
3. **Resultado de la consulta SQL:**
   ```sql
   DESCRIBE maquinas;
   SELECT * FROM maquinas WHERE articulo = 'F204576';
   ```
4. **Versión de .NET:** `dotnet --version`
5. **Versión de MySQL:** `SELECT VERSION();`
6. **Connection String** (sin contraseña): Del archivo `appsettings.json`

---

## 🎯 Próximos Pasos

Una vez que identifiques el error específico en los logs del backend:

1. **Busca el error en Google** con el mensaje exacto
2. **Verifica que la tabla tenga la estructura correcta**
3. **Prueba el endpoint de test** para aislar el problema
4. **Revisa el código del controlador** en la línea que indica el stack trace

---

## 📝 Notas Importantes

- El error 500 siempre viene del backend, no del frontend
- El frontend está funcionando correctamente (está enviando la petición)
- El problema está en el procesamiento de la petición en el servidor
- Los logs del backend son la clave para identificar el problema
