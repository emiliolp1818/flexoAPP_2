# 🔍 DIAGNÓSTICO: Módulo de Condición Única

## ✅ Código Revisado

He revisado todo el código del módulo de Condición Única y está **correctamente implementado** con comentarios detallados en cada línea.

### Archivos Revisados:
1. ✅ **Frontend/src/app/shared/components/condicion-unica/condicion-unica.ts** - Componente principal con lógica CRUD
2. ✅ **Frontend/src/app/shared/components/condicion-unica/condicion-unica.html** - Template HTML con tabla tipo Excel
3. ✅ **Frontend/src/app/shared/services/condicion-unica.service.ts** - Servicio HTTP para API
4. ✅ **Frontend/src/app/shared/models/condicion-unica.model.ts** - Modelo de datos TypeScript
5. ✅ **backend/Controllers/CondicionUnicaController.cs** - Controlador API REST
6. ✅ **backend/Repositories/CondicionUnicaRepository.cs** - Repositorio de acceso a datos
7. ✅ **backend/Models/Entities/CondicionUnica.cs** - Entidad de base de datos

## 🚨 Posibles Causas del Problema

### 1. Backend No Está Corriendo
**Síntoma:** No se pueden agregar registros, error de conexión
**Solución:** Iniciar el backend

```bash
# Desde la raíz del proyecto
cd backend
dotnet run
```

El backend debe estar corriendo en: `http://localhost:7003`

### 2. Base de Datos No Configurada
**Síntoma:** Error 500 al intentar crear registros
**Solución:** Verificar que la tabla `condicionunica` existe en MySQL

```sql
-- Conectar a MySQL
mysql -u root -p

-- Usar la base de datos
USE flexoapp_bd;

-- Verificar que la tabla existe
SHOW TABLES LIKE 'condicionunica';

-- Ver estructura de la tabla
DESCRIBE condicionunica;

-- Ver registros existentes
SELECT * FROM condicionunica;
```

### 3. Error de Validación en el Formulario
**Síntoma:** El botón "Crear" está deshabilitado
**Solución:** Verificar que todos los campos requeridos estén llenos:
- ✅ F Artículo (requerido)
- ✅ Referencia (requerido)
- ✅ Estante (requerido)
- ✅ Número de Carpeta (requerido)

### 4. Error de CORS
**Síntoma:** Error en consola del navegador: "CORS policy blocked"
**Solución:** El backend ya tiene CORS configurado correctamente para `http://localhost:4200`

### 5. Frontend No Está Corriendo
**Síntoma:** No se puede acceder a la aplicación
**Solución:** Iniciar el frontend

```bash
# Desde la raíz del proyecto
cd Frontend
npm start
```

El frontend debe estar corriendo en: `http://localhost:4200`

## 🔧 Pasos para Diagnosticar

### Paso 1: Verificar Backend
```bash
# Abrir navegador y visitar:
http://localhost:7003/health

# Debe retornar JSON con status: "healthy"
```

### Paso 2: Verificar Endpoint de Condición Única
```bash
# Abrir navegador y visitar:
http://localhost:7003/api/condicion-unica/test

# Debe retornar:
{
  "message": "Condicion Unica Controller is working",
  "timestamp": "2024-11-11T...",
  "status": "OK"
}
```

### Paso 3: Verificar Tabla en Base de Datos
```bash
# Ejecutar script de verificación
.\verificar-conexion-mysql.ps1
```

### Paso 4: Abrir Consola del Navegador
1. Abrir la aplicación en `http://localhost:4200`
2. Navegar al módulo de Condición Única
3. Presionar F12 para abrir DevTools
4. Ir a la pestaña "Console"
5. Intentar crear un nuevo registro
6. Ver si hay errores en la consola

### Paso 5: Ver Network Tab
1. En DevTools, ir a la pestaña "Network"
2. Intentar crear un nuevo registro
3. Ver la petición POST a `/api/condicion-unica`
4. Verificar:
   - ✅ Status Code (debe ser 201 Created)
   - ✅ Request Payload (datos enviados)
   - ✅ Response (datos recibidos)

## 📝 Explicación del Flujo de Creación

### Frontend (condicion-unica.ts)
```typescript
// 1. Usuario hace clic en "Nuevo Registro"
createNew() {
  // 2. Se abre el diálogo modal con el formulario
  const dialogRef = this.dialog.open(CondicionUnicaFormDialog, {
    width: '600px',
    data: { mode: 'create', item: null }
  });

  // 3. Usuario llena el formulario y hace clic en "Crear"
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // 4. Se envía petición POST al backend
      this.condicionService.create(result).subscribe({
        next: (created) => {
          // 5. Éxito: mostrar notificación y recargar datos
          this.snackBar.open('Registro creado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: (error) => {
          // 6. Error: mostrar notificación de error
          console.error('Error creando registro:', error);
          this.snackBar.open('Error al crear registro', 'Cerrar', { duration: 3000 });
        }
      });
    }
  });
}
```

### Service (condicion-unica.service.ts)
```typescript
// Envía petición HTTP POST al backend
create(condicion: CondicionUnica): Observable<CondicionUnica> {
  // URL: http://localhost:7003/api/condicion-unica
  return this.http.post<CondicionUnica>(this.apiUrl, condicion);
}
```

### Backend (CondicionUnicaController.cs)
```csharp
// Recibe petición POST y valida datos
[HttpPost]
public async Task<ActionResult<CondicionUnica>> Create([FromBody] CondicionUnica condicion)
{
    // 1. Validar que los datos no sean nulos
    if (condicion == null) return BadRequest();
    
    // 2. Validar campos requeridos
    if (string.IsNullOrWhiteSpace(condicion.FArticulo)) return BadRequest();
    
    // 3. Crear registro en la base de datos
    var registroCreado = await _repository.CreateAsync(condicion);
    
    // 4. Retornar 201 Created con el registro creado
    return CreatedAtAction(nameof(GetById), new { id = registroCreado.Id }, registroCreado);
}
```

### Repository (CondicionUnicaRepository.cs)
```csharp
// Inserta el registro en la base de datos MySQL
public async Task<CondicionUnica> CreateAsync(CondicionUnica condicion)
{
    // 1. Establecer fechas de creación y modificación
    condicion.CreatedDate = DateTime.UtcNow;
    condicion.LastModified = DateTime.UtcNow;
    
    // 2. Agregar registro al contexto de Entity Framework
    _context.CondicionUnica.Add(condicion);
    
    // 3. Guardar cambios en la base de datos (ejecuta INSERT)
    await _context.SaveChangesAsync();
    
    // 4. Retornar el registro con ID generado
    return condicion;
}
```

## 🎯 Solución Rápida

### Opción 1: Reiniciar Todo
```bash
# 1. Detener backend y frontend (Ctrl+C en ambas terminales)

# 2. Iniciar backend
cd backend
dotnet run

# 3. En otra terminal, iniciar frontend
cd Frontend
npm start

# 4. Abrir navegador en http://localhost:4200
```

### Opción 2: Usar Script de Inicio
```bash
# Desde la raíz del proyecto
.\start-dual.bat
```

## 📞 Información de Contacto

Si el problema persiste, proporciona:
1. ✅ Mensaje de error exacto (captura de pantalla)
2. ✅ Consola del navegador (F12 > Console)
3. ✅ Network tab (F12 > Network > petición POST)
4. ✅ Logs del backend (terminal donde corre `dotnet run`)

## 🔗 Enlaces Útiles

- Backend Health: http://localhost:7003/health
- Backend Swagger: http://localhost:7003/swagger
- Backend Test: http://localhost:7003/api/condicion-unica/test
- Frontend: http://localhost:4200
- Condición Única: http://localhost:4200/condicion-unica
