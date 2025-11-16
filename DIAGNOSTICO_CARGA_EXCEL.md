# 🔍 Diagnóstico: No se está cargando la programación del Excel

## 📋 Pasos para Diagnosticar el Problema

### **Paso 1: Verificar que la migración se ejecutó correctamente**

Ejecutar el script de diagnóstico:

```sql
-- Desde MySQL Workbench o phpMyAdmin
USE flexoapp_bd;
SHOW KEYS FROM maquinas WHERE Key_name = 'PRIMARY';
```

**Resultado esperado:**
```
Key_name: PRIMARY
Column_name: articulo
Seq_in_index: 1

Key_name: PRIMARY
Column_name: numero_maquina
Seq_in_index: 2
```

Si ves esto, la migración fue exitosa. ✅

---

### **Paso 2: Verificar logs del backend**

1. Abrir la consola donde está corriendo el backend
2. Intentar cargar el archivo Excel
3. Buscar mensajes de error en la consola

**Mensajes a buscar:**
- `❌ Error procesando archivo`
- `⚠️ Error procesando línea`
- `Exception`
- `Failed`

---

### **Paso 3: Verificar logs del navegador (Frontend)**

1. Abrir DevTools del navegador (F12)
2. Ir a la pestaña "Console"
3. Intentar cargar el archivo Excel
4. Buscar mensajes de error

**Mensajes a buscar:**
- `❌ Error procesando archivo`
- `❌ Error cargando programas`
- `⚠️ No se seleccionó ningún archivo`
- Errores HTTP (401, 500, etc.)

---

### **Paso 4: Verificar que el archivo Excel tiene el formato correcto**

El archivo debe tener **10 columnas** en este orden:

1. MQ IMP - Número de máquina (11-21)
2. ARTICULO F - Código del artículo
3. OT SAP - Orden de trabajo
4. CLIENTE - Nombre del cliente
5. REFERENCIA - Referencia del producto
6. TD - Tipo de diseño
7. NUMERO DE COLORES - Cantidad (número)
8. KILOS - Cantidad en kg (número)
9. COLORES EN MAQUINA - **FECHA** de preparación (ej: "10-nov-25 05 PM")
10. SUSTRATOS - Tipo de material

**Verificar:**
- ✅ La primera fila tiene los encabezados
- ✅ Las filas de datos empiezan en la fila 2
- ✅ No hay filas completamente vacías entre los datos
- ✅ Los números de máquina son válidos (11-21)
- ✅ Los campos obligatorios no están vacíos

---

### **Paso 5: Ejecutar script de diagnóstico de base de datos**

```bash
# Desde PowerShell en la carpeta backend/Database
Get-Content diagnostico.sql | mysql -u root -p flexoapp_bd
```

O desde MySQL Workbench:
1. Abrir `backend/Database/diagnostico.sql`
2. Ejecutar todo el script
3. Revisar los resultados

**Verificar:**
- ✅ Total de registros en la tabla
- ✅ Registros por máquina
- ✅ Artículos en múltiples máquinas
- ✅ Últimos registros insertados

---

### **Paso 6: Probar inserción manual**

```bash
# Desde PowerShell en la carpeta backend/Database
Get-Content test-insert.sql | mysql -u root -p flexoapp_bd
```

**Resultado esperado:**
```
✅ PRUEBA EXITOSA: Se insertaron 3 registros con el mismo artículo en diferentes máquinas
```

Si ves este mensaje, la base de datos está funcionando correctamente. ✅

---

## 🐛 Problemas Comunes y Soluciones

### **Problema 1: "No se seleccionó ningún archivo"**

**Causa:** El input file no está funcionando correctamente.

**Solución:**
1. Verificar que el botón de carga esté visible
2. Hacer clic directamente en el botón
3. Seleccionar un archivo Excel válido

---

### **Problema 2: "Tipo de archivo no válido"**

**Causa:** El archivo no es .xlsx o .xls

**Solución:**
1. Verificar la extensión del archivo
2. Asegurarse de que sea un archivo Excel real
3. No usar archivos CSV renombrados a .xlsx

---

### **Problema 3: "Error 401 - No autorizado"**

**Causa:** La sesión expiró

**Solución:**
1. Cerrar sesión
2. Volver a iniciar sesión
3. Intentar cargar el archivo nuevamente

---

### **Problema 4: "Error 500 - Error interno del servidor"**

**Causa:** Error en el backend al procesar el archivo

**Solución:**
1. Revisar logs del backend
2. Verificar que el backend esté corriendo
3. Verificar formato del archivo Excel
4. Verificar que la base de datos esté accesible

---

### **Problema 5: Se carga pero no se ven los datos**

**Causa:** Los datos se guardaron pero no se muestran en el frontend

**Solución:**
1. Hacer clic en el botón de "Refrescar" (🔄)
2. Seleccionar una máquina diferente y volver a la original
3. Recargar la página (F5)
4. Verificar en la base de datos que los datos existen:
   ```sql
   SELECT COUNT(*) FROM maquinas;
   ```

---

## 📞 Información para Reportar el Problema

Si el problema persiste, proporciona la siguiente información:

1. **Logs del backend** (últimas 50 líneas)
2. **Logs del navegador** (pestaña Console)
3. **Resultado del script de diagnóstico** (`diagnostico.sql`)
4. **Resultado de la prueba de inserción** (`test-insert.sql`)
5. **Captura de pantalla** del error (si hay alguno visible)
6. **Archivo Excel** que estás intentando cargar (primeras 5 filas)

---

## ✅ Checklist de Verificación

- [ ] La migración de PRIMARY KEY se ejecutó correctamente
- [ ] El backend está corriendo sin errores
- [ ] El archivo Excel tiene el formato correcto (10 columnas)
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs del backend
- [ ] La prueba de inserción manual funciona
- [ ] El script de diagnóstico muestra datos en la tabla
- [ ] El usuario está autenticado (no hay error 401)

---

**Última actualización:** 2024-11-16
