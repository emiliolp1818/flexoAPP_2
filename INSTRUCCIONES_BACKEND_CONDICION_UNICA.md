# Instrucciones para Configurar Backend - Condición Única

## 🔴 Error Actual

```
Failed to load resource: the server responded with a status of 404 (Not Found)
GET http://localhost:7003/api/condicion-unica
```

**Causa:** El backend no reconoce el nuevo controlador de Condición Única.

## ✅ Solución Paso a Paso

### **Paso 1: Crear la Tabla en la Base de Datos**

Ejecutar el script SQL en PostgreSQL:

```bash
# Opción 1: Desde la línea de comandos
psql -U tu_usuario -d tu_base_de_datos -f backend/Database/Scripts/create_condicionunica_table.sql

# Opción 2: Desde pgAdmin o cliente SQL
# Copiar y ejecutar el contenido del archivo create_condicionunica_table.sql
```

**Script SQL:**
```sql
-- Crear tabla condicionunica
CREATE TABLE IF NOT EXISTS condicionunica (
    id SERIAL PRIMARY KEY,
    farticulo VARCHAR(50) NOT NULL,
    referencia VARCHAR(200) NOT NULL,
    estante VARCHAR(50) NOT NULL,
    numerocarpeta VARCHAR(50) NOT NULL,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastmodified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_condicionunica_farticulo ON condicionunica(farticulo);
CREATE INDEX IF NOT EXISTS idx_condicionunica_estante ON condicionunica(estante);
CREATE INDEX IF NOT EXISTS idx_condicionunica_lastmodified ON condicionunica(lastmodified DESC);

-- Verificar que la tabla se creó
SELECT * FROM condicionunica;
```

### **Paso 2: Verificar Archivos del Backend**

Asegurarse de que existen estos archivos:

```
backend/
├── Models/Entities/
│   └── CondicionUnica.cs ✅
├── Repositories/
│   ├── ICondicionUnicaRepository.cs ✅
│   └── CondicionUnicaRepository.cs ✅
├── Controllers/
│   └── CondicionUnicaController.cs ✅
├── Data/Context/
│   └── FlexoAPPDbContext.cs (actualizado) ✅
└── Program.cs (actualizado) ✅
```

### **Paso 3: Compilar el Backend**

```bash
cd backend
dotnet build
```

**Verificar que no haya errores de compilación.**

### **Paso 4: Reiniciar el Backend**

```bash
# Detener el backend actual (Ctrl+C)

# Iniciar el backend nuevamente
dotnet run

# O si usas watch
dotnet watch run
```

### **Paso 5: Verificar que el Controlador Funciona**

Abrir en el navegador o usar curl:

```bash
# Test endpoint (sin autenticación)
curl http://localhost:7003/api/condicion-unica/test

# Debería devolver:
{
  "message": "Condicion Unica Controller is working",
  "timestamp": "2024-11-10T...",
  "status": "OK"
}
```

### **Paso 6: Verificar Endpoint Principal (con autenticación)**

```bash
# Obtener token de autenticación primero
curl -X POST http://localhost:7003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userCode":"admin","password":"tu_password"}'

# Usar el token para acceder al endpoint
curl http://localhost:7003/api/condicion-unica \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Debería devolver un array (puede estar vacío):
[]
```

## 🔍 Diagnóstico de Problemas

### Problema 1: Error de Compilación

**Error:**
```
error CS0246: The type or namespace name 'CondicionUnica' could not be found
```

**Solución:**
Verificar que el archivo `CondicionUnica.cs` esté en `backend/Models/Entities/`

### Problema 2: Error de Base de Datos

**Error:**
```
Npgsql.PostgresException: 42P01: relation "condicionunica" does not exist
```

**Solución:**
Ejecutar el script SQL del Paso 1 para crear la tabla.

### Problema 3: Error de Inyección de Dependencias

**Error:**
```
Unable to resolve service for type 'ICondicionUnicaRepository'
```

**Solución:**
Verificar que en `Program.cs` esté la línea:
```csharp
builder.Services.AddScoped<ICondicionUnicaRepository, CondicionUnicaRepository>();
```

### Problema 4: Error 404 Persiste

**Solución:**
1. Verificar que el backend se reinició correctamente
2. Verificar que no haya errores en los logs del backend
3. Verificar la URL: debe ser `http://localhost:7003/api/condicion-unica`
4. Verificar que el puerto sea el correcto (7003)

## 📋 Checklist de Verificación

Antes de continuar, verificar:

- [ ] La tabla `condicionunica` existe en la base de datos
- [ ] El backend compila sin errores (`dotnet build`)
- [ ] El backend está ejecutándose
- [ ] El endpoint de test funciona: `/api/condicion-unica/test`
- [ ] No hay errores en los logs del backend
- [ ] El repositorio está registrado en `Program.cs`
- [ ] El DbContext incluye `DbSet<CondicionUnica>`

## 🚀 Comandos Rápidos

```bash
# 1. Crear tabla en base de datos
psql -U postgres -d flexoapp -f backend/Database/Scripts/create_condicionunica_table.sql

# 2. Compilar backend
cd backend
dotnet build

# 3. Ejecutar backend
dotnet run

# 4. En otra terminal, probar endpoint
curl http://localhost:7003/api/condicion-unica/test
```

## 📝 Logs del Backend

Revisar los logs del backend para ver errores:

```bash
# Los logs se encuentran en:
backend/logs/flexoapp-YYYYMMDD.log

# Ver logs en tiempo real:
tail -f backend/logs/flexoapp-$(date +%Y%m%d).log
```

## 🔧 Solución Alternativa: Crear Migración

Si prefieres usar migraciones de Entity Framework:

```bash
cd backend

# Crear migración
dotnet ef migrations add AddCondicionUnicaTable

# Aplicar migración
dotnet ef database update
```

## 📞 Verificación Final

Una vez completados todos los pasos:

1. **Backend ejecutándose:** ✅
2. **Tabla creada:** ✅
3. **Endpoint test funciona:** ✅
4. **Frontend puede conectarse:** ✅

**El sistema debería estar funcionando correctamente.**

## 🎯 Próximos Pasos

Una vez que el backend funcione:

1. Recargar la página del frontend
2. Navegar a `/condicion-unica`
3. Probar crear un nuevo registro
4. Verificar que se guarda en la base de datos

## ⚠️ Notas Importantes

- El backend debe estar ejecutándose en el puerto **7003**
- La base de datos debe ser **PostgreSQL**
- El usuario debe estar **autenticado** para usar los endpoints (excepto `/test`)
- Los nombres de las columnas en la base de datos deben ser **minúsculas**

## 🆘 Si el Error Persiste

Proporcionar la siguiente información:

1. **Logs del backend** (últimas 50 líneas)
2. **Resultado de:** `curl http://localhost:7003/api/condicion-unica/test`
3. **Resultado de:** `SELECT * FROM condicionunica LIMIT 1;`
4. **Versión de .NET:** `dotnet --version`
5. **Errores de compilación** (si los hay)
