# 🔴 Solución al Error 404 - Condición Única

## Error Actual

```
Failed to load resource: the server responded with a status of 404 (Not Found)
GET http://localhost:7003/api/condicion-unica
```

## ✅ Solución Rápida (3 Pasos)

### **Paso 1: Crear la Tabla en PostgreSQL**

Ejecutar este SQL en tu base de datos:

```sql
CREATE TABLE IF NOT EXISTS condicionunica (
    id SERIAL PRIMARY KEY,
    farticulo VARCHAR(50) NOT NULL,
    referencia VARCHAR(200) NOT NULL,
    estante VARCHAR(50) NOT NULL,
    numerocarpeta VARCHAR(50) NOT NULL,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastmodified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_condicionunica_farticulo ON condicionunica(farticulo);
CREATE INDEX IF NOT EXISTS idx_condicionunica_estante ON condicionunica(estante);
CREATE INDEX IF NOT EXISTS idx_condicionunica_lastmodified ON condicionunica(lastmodified DESC);
```

**Cómo ejecutarlo:**

**Opción A - pgAdmin:**
1. Abrir pgAdmin
2. Conectar a tu base de datos
3. Abrir Query Tool
4. Pegar el SQL de arriba
5. Ejecutar (F5)

**Opción B - Línea de comandos:**
```bash
psql -U tu_usuario -d tu_base_de_datos -f backend/Database/Scripts/create_condicionunica_table.sql
```

### **Paso 2: Reiniciar el Backend**

```bash
# Detener el backend actual (Ctrl+C en la terminal donde está corriendo)

# Navegar a la carpeta backend
cd backend

# Compilar
dotnet build

# Iniciar nuevamente
dotnet run
```

### **Paso 3: Verificar que Funciona**

Abrir en el navegador:
```
http://localhost:7003/api/condicion-unica/test
```

Deberías ver:
```json
{
  "message": "Condicion Unica Controller is working",
  "timestamp": "2024-11-10T...",
  "status": "OK"
}
```

## 🎯 Si Aún No Funciona

### Verificación 1: ¿La tabla existe?

```sql
SELECT * FROM condicionunica;
```

Si da error "relation does not exist", ejecutar el Paso 1 nuevamente.

### Verificación 2: ¿El backend compiló correctamente?

```bash
cd backend
dotnet build
```

No debe haber errores rojos.

### Verificación 3: ¿El backend está corriendo?

En la terminal del backend deberías ver:
```
Now listening on: http://localhost:7003
```

### Verificación 4: ¿El puerto es correcto?

Verificar en `backend/appsettings.json` o `backend/Properties/launchSettings.json` que el puerto sea **7003**.

## 🚀 Script Automático

Ejecutar desde la raíz del proyecto:

```powershell
.\setup-condicion-unica.ps1
```

Este script:
- ✅ Verifica archivos necesarios
- ✅ Compila el backend
- ✅ Muestra instrucciones para crear la tabla
- ✅ Opcionalmente inicia el backend

## 📋 Checklist Completo

Marcar cada paso completado:

- [ ] **Tabla creada** - Ejecutar SQL en PostgreSQL
- [ ] **Backend compilado** - `dotnet build` sin errores
- [ ] **Backend reiniciado** - Detener y volver a iniciar
- [ ] **Endpoint test funciona** - Abrir `/api/condicion-unica/test`
- [ ] **Frontend recargado** - Refrescar navegador (F5)

## 🔍 Logs para Debugging

Si necesitas más información, revisar:

```bash
# Ver logs del backend
tail -f backend/logs/flexoapp-$(date +%Y%m%d).log

# O en Windows PowerShell
Get-Content backend\logs\flexoapp-$(Get-Date -Format "yyyyMMdd").log -Wait
```

## 📞 Información para Soporte

Si el error persiste, proporcionar:

1. **Resultado de:**
   ```bash
   curl http://localhost:7003/api/condicion-unica/test
   ```

2. **Resultado de:**
   ```sql
   SELECT COUNT(*) FROM condicionunica;
   ```

3. **Últimas líneas del log del backend**

4. **Errores en la consola del navegador (F12)**

## ✅ Una Vez Funcionando

Cuando veas el mensaje "Condicion Unica Controller is working":

1. Recargar el frontend (F5)
2. Navegar a: `http://localhost:4200/condicion-unica`
3. Probar crear un nuevo registro
4. ¡Listo! 🎉

## 📚 Documentación Adicional

- `INSTRUCCIONES_BACKEND_CONDICION_UNICA.md` - Guía detallada del backend
- `Frontend/CONDICION_UNICA_README.md` - Guía de uso del frontend
- `Frontend/SOLUCION_ERRORES_CONDICION_UNICA.md` - Solución de errores del frontend

---

**Nota:** El error 404 significa que el backend no reconoce la ruta `/api/condicion-unica`. Esto se soluciona reiniciando el backend después de crear la tabla.
