# 🔧 SOLUCIÓN: Error al Agregar Información en Condición Única

## 🚨 Problema Identificado

**Error:** `HttpErrorResponse {status: 500, statusText: 'Internal Server Error'}`

**Causa:** La tabla `condicionunica` **NO EXISTE** en la base de datos MySQL `flexoapp_bd`

## ✅ Solución Paso a Paso

### Opción 1: Usar Script PowerShell (RECOMENDADO)

```powershell
# Ejecutar desde la raíz del proyecto
.\crear-tabla-condicionunica.ps1
```

Este script:
1. ✅ Verifica que MySQL esté instalado
2. ✅ Solicita credenciales de MySQL
3. ✅ Ejecuta el script SQL automáticamente
4. ✅ Crea la tabla con 5 registros de prueba
5. ✅ Muestra confirmación de éxito

### Opción 2: Ejecutar SQL Manualmente

```bash
# 1. Conectar a MySQL
mysql -u root -p

# 2. Usar la base de datos
USE flexoapp_bd;

# 3. Ejecutar el script SQL
source crear-tabla-condicionunica.sql

# O copiar y pegar el contenido del archivo SQL
```

### Opción 3: Usar MySQL Workbench

1. Abrir MySQL Workbench
2. Conectar a la base de datos `flexoapp_bd`
3. Abrir el archivo `crear-tabla-condicionunica.sql`
4. Ejecutar el script (⚡ botón Execute)

## 📋 Estructura de la Tabla

```sql
CREATE TABLE condicionunica (
    id INT AUTO_INCREMENT PRIMARY KEY,           -- ID único autoincremental
    farticulo VARCHAR(50) NOT NULL,              -- Código del artículo F
    referencia VARCHAR(200) NOT NULL,            -- Referencia del producto
    estante VARCHAR(50) NOT NULL,                -- Ubicación física (estante)
    numerocarpeta VARCHAR(50) NOT NULL,          -- Número de carpeta documental
    createddate DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Fecha de creación
    lastmodified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Última modificación
    INDEX idx_farticulo (farticulo),             -- Índice para búsquedas
    INDEX idx_estante (estante),                 -- Índice para filtros
    INDEX idx_lastmodified (lastmodified)        -- Índice para ordenar
);
```

## 🔍 Verificar que la Tabla Existe

```sql
-- Mostrar todas las tablas
SHOW TABLES;

-- Verificar estructura de la tabla
DESCRIBE condicionunica;

-- Ver registros
SELECT * FROM condicionunica;

-- Contar registros
SELECT COUNT(*) FROM condicionunica;
```

## 🚀 Reiniciar la Aplicación

Después de crear la tabla:

```bash
# 1. Detener el backend (Ctrl+C)

# 2. Reiniciar el backend
cd backend
dotnet run

# 3. Verificar que el backend está corriendo
# Abrir navegador: http://localhost:7003/health

# 4. Probar el endpoint de Condición Única
# Abrir navegador: http://localhost:7003/api/condicion-unica/test
```

## 🎯 Probar el Módulo

1. **Abrir el frontend:** http://localhost:4200
2. **Navegar a Condición Única** (menú lateral)
3. **Hacer clic en "Nuevo Registro"**
4. **Llenar el formulario:**
   - F Artículo: `F204572`
   - Referencia: `REF-TEST-001`
   - Estante: `E-01`
   - Número de Carpeta: `C-001`
5. **Hacer clic en "Crear"**
6. **Verificar que aparece el mensaje:** "Registro creado exitosamente"

## 📝 Explicación del Código (Comentarios Detallados)

### Frontend: condicion-unica.ts

```typescript
// ===== MÉTODO PARA CREAR NUEVO REGISTRO =====
createNew(): void {
  // 1. Abrir diálogo modal con formulario vacío
  const dialogRef = this.dialog.open(CondicionUnicaFormDialog, {
    width: '600px',                    // Ancho del diálogo: 600 píxeles
    data: { mode: 'create', item: null }  // Modo: crear, sin datos previos
  });

  // 2. Esperar a que el usuario cierre el diálogo
  dialogRef.afterClosed().subscribe(result => {
    // 3. Si el usuario hizo clic en "Crear" (no en "Cancelar")
    if (result) {
      // 4. Enviar petición POST al backend con los datos del formulario
      this.condicionService.create(result).subscribe({
        // 5. ÉXITO: El backend creó el registro correctamente
        next: (created) => {
          // Mostrar notificación verde de éxito durante 3 segundos
          this.snackBar.open('Registro creado exitosamente', 'Cerrar', { duration: 3000 });
          // Recargar todos los datos para mostrar el nuevo registro en la tabla
          this.loadData();
        },
        // 6. ERROR: El backend retornó un error (500, 400, etc.)
        error: (error) => {
          // Mostrar error en la consola del navegador (F12 > Console)
          console.error('Error creando registro:', error);
          // Mostrar notificación roja de error durante 3 segundos
          this.snackBar.open('Error al crear registro', 'Cerrar', { duration: 3000 });
        }
      });
    }
  });
}
```

### Service: condicion-unica.service.ts

```typescript
// ===== MÉTODO PARA CREAR REGISTRO EN EL BACKEND =====
create(condicion: CondicionUnica): Observable<CondicionUnica> {
  // Enviar petición HTTP POST al backend
  // URL: http://localhost:7003/api/condicion-unica
  // Body: { fArticulo: "F204572", referencia: "REF-001", ... }
  // Headers: Content-Type: application/json
  return this.http.post<CondicionUnica>(this.apiUrl, condicion);
}
```

### Backend: CondicionUnicaController.cs

```csharp
// ===== ENDPOINT POST: CREAR NUEVO REGISTRO =====
[HttpPost]  // Responde a peticiones POST
[AllowAnonymous]  // No requiere autenticación (para pruebas)
public async Task<ActionResult<CondicionUnica>> Create([FromBody] CondicionUnica condicion)
{
    // 1. VALIDAR QUE LOS DATOS NO SEAN NULOS
    if (condicion == null)
    {
        // Retornar error 400 Bad Request
        return BadRequest(new { message = "Los datos del registro son requeridos" });
    }
    
    // 2. VALIDAR CAMPO F ARTÍCULO (REQUERIDO)
    if (string.IsNullOrWhiteSpace(condicion.FArticulo))
    {
        // Retornar error 400 Bad Request
        return BadRequest(new { message = "El campo F Artículo es requerido" });
    }
    
    // 3. VALIDAR CAMPO REFERENCIA (REQUERIDO)
    if (string.IsNullOrWhiteSpace(condicion.Referencia))
    {
        return BadRequest(new { message = "El campo Referencia es requerido" });
    }
    
    // 4. VALIDAR CAMPO ESTANTE (REQUERIDO)
    if (string.IsNullOrWhiteSpace(condicion.Estante))
    {
        return BadRequest(new { message = "El campo Estante es requerido" });
    }
    
    // 5. VALIDAR CAMPO NÚMERO DE CARPETA (REQUERIDO)
    if (string.IsNullOrWhiteSpace(condicion.NumeroCarpeta))
    {
        return BadRequest(new { message = "El campo Número de Carpeta es requerido" });
    }
    
    // 6. REGISTRAR EN EL LOG QUE SE ESTÁ CREANDO UN REGISTRO
    _logger.LogInformation($"POST /api/condicion-unica - Creando registro: {condicion.FArticulo}");
    
    // 7. LLAMAR AL REPOSITORIO PARA INSERTAR EN LA BASE DE DATOS
    var registroCreado = await _repository.CreateAsync(condicion);
    
    // 8. RETORNAR RESPUESTA 201 CREATED CON EL REGISTRO CREADO
    // Location header: /api/condicion-unica/{id}
    return CreatedAtAction(
        nameof(GetById),                    // Nombre del método para obtener por ID
        new { id = registroCreado.Id },     // Parámetros de ruta
        registroCreado                      // Cuerpo de la respuesta (registro creado)
    );
}
```

### Repository: CondicionUnicaRepository.cs

```csharp
// ===== MÉTODO PARA INSERTAR REGISTRO EN LA BASE DE DATOS =====
public async Task<CondicionUnica> CreateAsync(CondicionUnica condicion)
{
    // 1. ESTABLECER FECHA DE CREACIÓN (UTC)
    // DateTime.UtcNow: fecha y hora actual en formato UTC (Universal Time Coordinated)
    condicion.CreatedDate = DateTime.UtcNow;
    
    // 2. ESTABLECER FECHA DE ÚLTIMA MODIFICACIÓN (UTC)
    condicion.LastModified = DateTime.UtcNow;
    
    // 3. AGREGAR REGISTRO AL CONTEXTO DE ENTITY FRAMEWORK
    // Esto NO inserta en la base de datos todavía, solo marca el registro como "pendiente de inserción"
    _context.CondicionUnica.Add(condicion);
    
    // 4. GUARDAR CAMBIOS EN LA BASE DE DATOS
    // Esto ejecuta el comando SQL INSERT INTO condicionunica (...)
    // await: espera a que la operación asíncrona termine
    await _context.SaveChangesAsync();
    
    // 5. RETORNAR EL REGISTRO CON EL ID GENERADO
    // Después de SaveChangesAsync(), el campo Id se llena automáticamente con el valor autoincremental
    return condicion;
}
```

## 🔄 Flujo Completo de Creación

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USUARIO HACE CLIC EN "NUEVO REGISTRO"                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. SE ABRE DIÁLOGO MODAL CON FORMULARIO                        │
│    - F Artículo: [input]                                       │
│    - Referencia: [input]                                       │
│    - Estante: [input]                                          │
│    - Número de Carpeta: [input]                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. USUARIO LLENA EL FORMULARIO Y HACE CLIC EN "CREAR"         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. FRONTEND ENVÍA PETICIÓN HTTP POST                           │
│    POST http://localhost:7003/api/condicion-unica              │
│    Body: {                                                      │
│      "fArticulo": "F204572",                                   │
│      "referencia": "REF-001",                                  │
│      "estante": "E-01",                                        │
│      "numeroCarpeta": "C-001"                                  │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. BACKEND RECIBE LA PETICIÓN                                  │
│    - Valida que los datos no sean nulos                       │
│    - Valida que todos los campos requeridos estén llenos      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. REPOSITORIO INSERTA EN LA BASE DE DATOS                     │
│    INSERT INTO condicionunica (farticulo, referencia, ...)     │
│    VALUES ('F204572', 'REF-001', ...)                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. MYSQL GENERA ID AUTOINCREMENTAL                             │
│    id = 6 (por ejemplo)                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. BACKEND RETORNA RESPUESTA 201 CREATED                       │
│    Status: 201 Created                                         │
│    Location: /api/condicion-unica/6                            │
│    Body: {                                                      │
│      "id": 6,                                                  │
│      "fArticulo": "F204572",                                   │
│      "referencia": "REF-001",                                  │
│      "estante": "E-01",                                        │
│      "numeroCarpeta": "C-001",                                 │
│      "createdDate": "2024-11-11T10:30:00Z",                   │
│      "lastModified": "2024-11-11T10:30:00Z"                   │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. FRONTEND RECIBE LA RESPUESTA                                │
│    - Cierra el diálogo modal                                   │
│    - Muestra notificación: "Registro creado exitosamente"     │
│    - Recarga la tabla con todos los registros                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. USUARIO VE EL NUEVO REGISTRO EN LA TABLA                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🐛 Solución de Problemas

### Error: "Backend NO está corriendo"
```bash
cd backend
dotnet run
```

### Error: "Base de datos no existe"
```sql
CREATE DATABASE flexoapp_bd;
```

### Error: "Tabla no existe"
```bash
.\crear-tabla-condicionunica.ps1
```

### Error: "CORS policy blocked"
- El backend ya tiene CORS configurado correctamente
- Verifica que el frontend esté en `http://localhost:4200`

### Error: "Formulario inválido"
- Verifica que todos los campos estén llenos
- Todos los campos son requeridos (F Artículo, Referencia, Estante, Número de Carpeta)

## 📞 Soporte

Si el problema persiste después de crear la tabla, proporciona:
1. ✅ Logs del backend (terminal donde corre `dotnet run`)
2. ✅ Consola del navegador (F12 > Console)
3. ✅ Network tab (F12 > Network > petición POST)
4. ✅ Resultado de: `SELECT * FROM condicionunica;`

## ✅ Resumen

**Problema:** Error 500 al crear registros
**Causa:** Tabla `condicionunica` no existe en MySQL
**Solución:** Ejecutar `.\crear-tabla-condicionunica.ps1`
**Resultado:** Módulo funcionando correctamente ✅
