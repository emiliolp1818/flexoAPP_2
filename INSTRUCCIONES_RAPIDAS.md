# 🚀 Instrucciones Rápidas - Configurar Estados Vacíos

## ✅ Paso 1: Ejecutar Script SQL

### **Opción A: Desde MySQL Workbench (RECOMENDADO)**

1. **Abre MySQL Workbench**
2. **Conéctate a la base de datos** `flexoapp_bd`
3. **Abre el archivo:** `backend/Database/EJECUTAR_AHORA_ESTADOS.sql`
4. **Haz clic en el rayo ⚡** (Execute) o presiona `Ctrl+Shift+Enter`
5. **Verifica el resultado** - Deberías ver:
   ```
   ✅ Script ejecutado correctamente. Ahora reinicia el backend.
   ```

### **Opción B: Desde la Terminal (Alternativa)**

```bash
# Reemplaza 'root' y 'tu_password' con tus credenciales
mysql -u root -p flexoapp_bd < backend/Database/EJECUTAR_AHORA_ESTADOS.sql
```

---

## ✅ Paso 2: Reiniciar el Backend

### **En la terminal donde está corriendo el backend:**

1. **Detén el backend:** Presiona `Ctrl+C`
2. **Reinicia el backend:**
   ```bash
   cd backend
   dotnet run
   ```
3. **Espera a ver:**
   ```
   Now listening on: http://localhost:7003
   Application started.
   ```

---

## ✅ Paso 3: Verificar que Funciona

### **Ejecuta este comando en PowerShell:**

```powershell
.\test-estado-sin-asignar.ps1
```

**Resultado esperado:**
```
✅ Total de programas: 10

📊 Programas por estado:
   SIN_ASIGNAR (NULL) : 10
```

---

## ✅ Paso 4: Cargar Programación Nueva

1. **Abre el navegador** → `http://localhost:4200`
2. **Ve al módulo de Máquinas**
3. **Haz clic en "Agregar Programación"**
4. **Selecciona un archivo Excel**
5. **Los programas deberían aparecer en GRIS CLARO** (SIN_ASIGNAR)

---

## 🎯 Resultado Final

### **Antes:**
```
┌─────────────────────────────────┐
│ 🟡 PREPARANDO                   │
│ F204567 | Cliente ABC           │
└─────────────────────────────────┘
```

### **Después:**
```
┌─────────────────────────────────┐
│ 🔘 SIN_ASIGNAR                  │
│ F204567 | Cliente ABC           │
│ [⏰] [✓] [⏸] [▶] [🖨]          │
└─────────────────────────────────┘
```

---

## ⚠️ Notas Importantes

1. **Los programas existentes** con estado "PREPARANDO" NO cambiarán automáticamente
2. **Solo los programas nuevos** que cargues después de estos cambios se cargarán sin estado
3. **Si quieres limpiar todos los estados existentes**, descomenta estas líneas en el script SQL:
   ```sql
   UPDATE maquinas SET estado = NULL;
   UPDATE maquinas SET observaciones = 'Pendiente de asignación de estado por operario' WHERE estado IS NULL;
   ```

---

## 🆘 Si Algo Sale Mal

### **Error: "Table 'maquinas' doesn't exist"**
- Verifica que estás conectado a la base de datos `flexoapp_bd`
- Ejecuta: `USE flexoapp_bd;` antes del script

### **Error: "Access denied"**
- Verifica tus credenciales de MySQL
- Asegúrate de tener permisos para modificar la tabla

### **Los programas siguen en "PREPARANDO"**
- Verifica que el backend se reinició correctamente
- Ejecuta el script de test: `.\test-estado-sin-asignar.ps1`
- Verifica en MySQL: `SELECT estado FROM maquinas LIMIT 5;`

---

## 📞 Necesitas Más Ayuda?

Si después de seguir estos pasos los programas siguen mostrándose en "PREPARANDO":

1. **Ejecuta:** `.\test-estado-sin-asignar.ps1`
2. **Copia el resultado** completo
3. **Ejecuta en MySQL:**
   ```sql
   DESCRIBE maquinas;
   SELECT estado, COUNT(*) FROM maquinas GROUP BY estado;
   ```
4. **Comparte los resultados** para que pueda ayudarte más

---

## ✅ Checklist Final

- [ ] Script SQL ejecutado en MySQL Workbench
- [ ] Backend reiniciado (Ctrl+C y `dotnet run`)
- [ ] Test de PowerShell ejecutado exitosamente
- [ ] Archivo Excel cargado
- [ ] Programas aparecen en gris claro (SIN_ASIGNAR)
- [ ] Botones de acción funcionan correctamente
