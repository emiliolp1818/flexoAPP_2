# 🔧 Corrección de Primary Key en Tabla Maquinas

## 🐛 Problema Identificado

La tabla `maquinas` tiene `articulo` como PRIMARY KEY única, lo que **NO permite** tener el mismo artículo en diferentes máquinas.

**Ejemplo del problema:**
```
❌ Artículo F204567 en Máquina 11 → Se guarda
❌ Artículo F204567 en Máquina 12 → Se ACTUALIZA el registro anterior (no se crea nuevo)
❌ Artículo F204567 en Máquina 13 → Se ACTUALIZA el registro anterior (no se crea nuevo)
```

**Resultado:** Solo se guarda el último registro por artículo.

---

## ✅ Solución

Cambiar la PRIMARY KEY de `articulo` a una **clave compuesta** `(articulo, numero_maquina)`.

**Después de la corrección:**
```
✅ Artículo F204567 en Máquina 11 → Se guarda
✅ Artículo F204567 en Máquina 12 → Se guarda (registro independiente)
✅ Artículo F204567 en Máquina 13 → Se guarda (registro independiente)
```

---

## 📝 Pasos para Ejecutar la Corrección

### Opción 1: Desde MySQL Workbench o phpMyAdmin

1. Abrir MySQL Workbench o phpMyAdmin
2. Conectarse a la base de datos `flexoapp_bd`
3. Abrir el archivo `02_fix_primary_key_maquinas.sql`
4. Ejecutar todo el script
5. Verificar los mensajes de confirmación

### Opción 2: Desde línea de comandos

```bash
# Navegar a la carpeta del proyecto
cd backend/Database

# Ejecutar el script SQL
mysql -u root -p flexoapp_bd < 02_fix_primary_key_maquinas.sql
```

### Opción 3: Desde PowerShell (Windows)

```powershell
# Navegar a la carpeta del proyecto
cd backend\Database

# Ejecutar el script SQL
Get-Content .\02_fix_primary_key_maquinas.sql | mysql -u root -p flexoapp_bd
```

---

## 🔍 Verificación

Después de ejecutar el script, verificar que:

1. **La tabla tiene la nueva PRIMARY KEY:**
   ```sql
   SHOW CREATE TABLE maquinas;
   ```
   Debe mostrar: `PRIMARY KEY (articulo, numero_maquina)`

2. **Los datos se mantuvieron:**
   ```sql
   SELECT COUNT(*) FROM maquinas;
   ```

3. **Se puede insertar el mismo artículo en diferentes máquinas:**
   ```sql
   -- Esto ahora debería funcionar sin errores
   INSERT INTO maquinas (articulo, numero_maquina, ot_sap, cliente, ...) 
   VALUES ('TEST001', 11, 'OT001', 'Cliente Test', ...);
   
   INSERT INTO maquinas (articulo, numero_maquina, ot_sap, cliente, ...) 
   VALUES ('TEST001', 12, 'OT001', 'Cliente Test', ...);
   ```

---

## ⚠️ Notas Importantes

1. **Respaldo Automático:** El script crea una tabla `maquinas_backup` con los datos actuales
2. **Sin Pérdida de Datos:** Los datos existentes se preservan
3. **Reversible:** Si algo sale mal, puedes restaurar desde `maquinas_backup`
4. **Tiempo de Ejecución:** Menos de 1 segundo (depende de la cantidad de datos)

---

## 🗑️ Limpieza (Después de Verificar)

Una vez que verifiques que todo funciona correctamente, puedes eliminar la tabla de respaldo:

```sql
DROP TABLE IF EXISTS maquinas_backup;
```

---

## 📞 Soporte

Si encuentras algún error durante la ejecución:

1. **Verificar conexión a la base de datos**
2. **Verificar permisos del usuario MySQL**
3. **Revisar los logs de error de MySQL**
4. **Contactar al equipo de desarrollo**

---

**Última actualización:** 2024-11-16  
**Versión del script:** 2.0.0
