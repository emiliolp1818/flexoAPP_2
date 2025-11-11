# 📘 DOCUMENTACIÓN COMPLETA - CONEXIÓN MÓDULO DE MÁQUINAS CON BASE DE DATOS

## 🎯 Resumen Ejecutivo

Este documento explica en detalle cómo el módulo de máquinas del frontend Angular se conecta con la base de datos MySQL `flexoapp_bd` a través del backend ASP.NET Core.

---

## 🗄️ ARQUITECTURA DE LA BASE DE DATOS

### Base de Datos: `flexoapp_bd` (MySQL)

**Servidor:** localhost  
**Puerto:** 3306 (por defecto)  
**Usuario:** root  
**Contraseña:** 12345

### Tabla Principal: `machine_programs`

La tabla `machine_programs` almacena todos los programas de las máquinas flexográficas (máquinas 11-21).

#### Estructura de la Tabla

```sql
CREATE TABLE machine_programs (
    -- ===== CLAVE PRIMARIA =====
    Id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- ===== CAMPOS PRINCIPALES =====
    MachineNumber INT NOT NULL,                    -- Número de máquina (11-21)
    Name VARCHAR(200) NOT NULL,                    -- Nombre del programa
    Articulo VARCHAR(50) NOT NULL,                 -- Código del artículo (ej: F204567)
    OtSap VARCHAR(50) NOT NULL UNIQUE,             -- Orden de trabajo SAP (único)
    Cliente VARCHAR(200) NOT NULL,                 -- Nombre del cliente
    Referencia VARCHAR(500),                       -- Referencia del producto
    Td VARCHAR(3),                                 -- Código TD (Tipo de Diseño)
    NumeroColores INT,                             -- Número total de colores
    Colores JSON NOT NULL,                         -- Array de colores en formato JSON
    Sustrato VARCHAR(200),                         -- Tipo de material base
    Kilos DECIMAL(10,2) NOT NULL,                  -- Cantidad en kilogramos
    Estado VARCHAR(20) NOT NULL DEFAULT 'LISTO',   -- Estado: LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
    FechaInicio DATETIME NOT NULL,                 -- Fecha de inicio del programa
    FechaTintaEnMaquina DATETIME,                  -- Fecha cuando se aplicó la tinta
    FechaFin DATETIME,                             -- Fecha de finalización
    Progreso INT DEFAULT 0,                        -- Progreso del programa (0-100)
    Observaciones VARCHAR(1000),                   -- Observaciones adicionales
    
    -- ===== CAMPOS DE AUDITORÍA =====
    LastActionBy VARCHAR(100),                     -- Usuario que realizó la última acción
    LastAction VARCHAR(200),                       -- Descripción de la última acción
    LastActionAt DATETIME,                         -- Fecha de la última acción
    OperatorName VARCHAR(100),                     -- Nombre del operador asignado
    CreatedBy INT,                                 -- ID del usuario que creó el registro
    UpdatedBy INT,                                 -- ID del usuario que actualizó el registro
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Fecha de actualización
    
    -- ===== ÍNDICES PARA OPTIMIZACIÓN =====
    INDEX idx_machine_number (MachineNumber),
    INDEX idx_estado (Estado),
    INDEX idx_fecha_inicio (FechaInicio),
    INDEX idx_machine_estado (MachineNumber, Estado),
    INDEX idx_ot_sap (OtSap),
    
    -- ===== RELACIONES CON TABLA USERS =====
    FOREIGN KEY (CreatedBy) REFERENCES users(Id) ON DELETE SET NULL,
    FOREIGN KEY (UpdatedBy) REFERENCES users(Id) ON DELETE SET NULL
);
```

#### Ejemplo de Datos

```json
{
  "Id": 1,
  "MachineNumber": 11,
  "Name": "Programa F204567",
  "Articulo": "F204567",
  "OtSap": "OT123456",
  "Cliente": "ABSORBENTES DE COLOMBIA S.A",
  "Referencia": "REF-ABS-001",
  "Td": "TD1",
  "NumeroColores": 4,
  "Colores": "[\"CYAN\",\"MAGENTA\",\"AMARILLO\",\"NEGRO\"]",
  "Sustrato": "BOPP",
  "Kilos": 1500.00,
  "Estado": "LISTO",
  "FechaInicio": "2025-01-10 10:00:00",
  "FechaTintaEnMaquina": "2025-01-10 10:30:00",
  "Progreso": 0,
  "Observaciones": "Programa listo para producción",
  "LastActionBy": "Juan Pérez",
  "LastAction": "Programa creado",
  "CreatedAt": "2025-01-10 09:00:00",
  "UpdatedAt": "2025-01-10 09:00:00"
}
```

---

## 🔌 BACKEND - ASP.NET CORE

### 1. Configuración de la Conexión a la Base de Datos

**Archivo:** `backend/appsettings.Development.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=flexoapp_bd;Uid=root;Pwd=12345;AllowUserVariables=true;UseAffectedRows=false;CharSet=utf8mb4;ConnectionTimeout=30;DefaultCommandTimeout=120;Pooling=true;MinimumPoolSize=2;MaximumPoolSize=50;ConnectionLifeTime=300;"
  }
}
```

**Archivo:** `backend/Program.cs`

```csharp
// Configuración del DbContext con MySQL
builder.Services.AddDbContext<FlexoAPPDbContext>(options =>
{
    var serverVersion = ServerVersion.AutoDetect(connectionString);
    options.UseMySql(connectionString, serverVersion, mySqlOptions =>
    {
        mySqlOptions.CommandTimeout(30);
        mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
    });
});
```

### 2. Modelo de Entidad

**Archivo:** `backend/Models/Entities/MachineProgram.cs`

```csharp
[Table("machine_programs")]
public class MachineProgram
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int MachineNumber { get; set; }  // Número de máquina (11-21)
    
    [Required]
    [MaxLength(50)]
    public string Articulo { get; set; }    // Código del artículo
    
    [Required]
    [MaxLength(50)]
    public string OtSap { get; set; }       // Orden de trabajo SAP
    
    [Required]
    [MaxLength(200)]
    public string Cliente { get; set; }     // Nombre del cliente
    
    [Column(TypeName = "JSON")]
    public string Colores { get; set; }     // Array de colores en JSON
    
    [Required]
    public DateTime FechaTintaEnMaquina { get; set; }  // Fecha de tinta en máquina
    
    [Required]
    [MaxLength(20)]
    public string Estado { get; set; }      // LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
    
    // ... más campos
}
```

### 3. Controlador de API

**Archivo:** `backend/Controllers/MaquinasController.cs`

#### Endpoint GET: Obtener todos los programas

```csharp
/// <summary>
/// GET: api/maquinas
/// Obtiene todos los registros de máquinas ordenados por fecha de tinta más reciente
/// </summary>
[HttpGet]
public async Task<ActionResult<object>> GetMaquinas(
    [FromQuery] string? orderBy = "fechaTintaEnMaquina", 
    [FromQuery] string? order = "desc")
{
    // Consulta a la base de datos con Entity Framework
    var query = _context.MachinePrograms
        .Include(p => p.CreatedByUser)      // Incluir relación con usuario creador
        .Include(p => p.UpdatedByUser)      // Incluir relación con usuario actualizador
        .AsQueryable();

    // Aplicar ordenamiento
    if (orderBy?.ToLower() == "fechatintaenmaquina")
    {
        query = order?.ToLower() == "asc" 
            ? query.OrderBy(p => p.FechaTintaEnMaquina)
            : query.OrderByDescending(p => p.FechaTintaEnMaquina);
    }

    // Ejecutar consulta y obtener resultados
    var programs = await query.ToListAsync();

    // Mapear datos al formato del frontend
    var result = programs.Select(p => new
    {
        id = p.Id,
        numeroMaquina = p.MachineNumber,
        articulo = p.Articulo,
        otSap = p.OtSap,
        cliente = p.Cliente,
        colores = ParseColores(p.Colores),  // Parsear JSON a array
        fechaTintaEnMaquina = p.FechaTintaEnMaquina,
        estado = p.Estado,
        // ... más campos
    }).ToList();

    return Ok(new
    {
        success = true,
        message = $"{programs.Count} registros obtenidos",
        data = result
    });
}
```

#### Endpoint PATCH: Cambiar estado de un programa

```csharp
/// <summary>
/// PATCH: api/maquinas/{id}/status
/// Actualiza el estado de un programa de máquina
/// </summary>
[HttpPatch("{id}/status")]
public async Task<ActionResult<object>> UpdateMachineStatus(
    int id, 
    [FromBody] UpdateStatusRequest request)
{
    // Buscar el programa en la base de datos
    var program = await _context.MachinePrograms.FindAsync(id);
    
    if (program == null)
    {
        return NotFound(new { success = false, message = "Programa no encontrado" });
    }

    // Actualizar estado y metadatos
    program.Estado = request.Estado;
    program.Observaciones = request.Observaciones ?? program.Observaciones;
    program.UpdatedAt = DateTime.UtcNow;
    program.LastActionBy = GetCurrentUserName();
    program.LastActionAt = DateTime.UtcNow;
    program.LastAction = $"Estado cambiado a {request.Estado}";

    // Guardar cambios en la base de datos
    await _context.SaveChangesAsync();

    return Ok(new
    {
        success = true,
        message = $"Estado actualizado a {request.Estado}",
        data = new
        {
            id = program.Id,
            estado = program.Estado,
            lastActionBy = program.LastActionBy
        }
    });
}
```

---

## 🎨 FRONTEND - ANGULAR

### 1. Servicio HTTP

**Archivo:** `Frontend/src/app/shared/components/machines/machines.ts`

#### Método para cargar programas desde la base de datos

```typescript
// ===== MÉTODO PARA CARGAR DATOS DE MÁQUINAS DESDE LA BASE DE DATOS =====
// Este método se conecta con el endpoint GET api/maquinas del backend
// El backend consulta la tabla machine_programs de la base de datos flexoapp_bd
async loadPrograms() {
  this.loading.set(true); // Activar indicador de carga
  
  try {
    // ===== VERIFICACIÓN DE AUTENTICACIÓN =====
    if (!this.authService.isLoggedIn()) {
      window.location.href = '/login';
      return;
    }

    // ===== PETICIÓN HTTP GET AL BACKEND =====
    // URL: http://localhost:7003/api/maquinas?orderBy=fechaTintaEnMaquina&order=desc
    // El backend ejecuta: SELECT * FROM machine_programs ORDER BY FechaTintaEnMaquina DESC
    const response = await firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/maquinas?orderBy=fechaTintaEnMaquina&order=desc`)
    );
    
    // ===== VALIDACIÓN DE LA RESPUESTA =====
    if (response && response.success && response.data) {
      // ===== MAPEO DE DATOS DEL BACKEND AL FRONTEND =====
      const programs: MachineProgram[] = response.data.map((program: any) => {
        // Parsear colores desde JSON
        let colores: string[] = [];
        if (program.colores) {
          try {
            colores = typeof program.colores === 'string' 
              ? JSON.parse(program.colores) 
              : program.colores;
          } catch (e) {
            console.warn('⚠️ Error parseando colores:', program.id, e);
            colores = [];
          }
        }

        // Retornar objeto MachineProgram con todos los campos
        return {
          id: program.id,                    // ID de la tabla machine_programs
          numeroMaquina: program.numeroMaquina,  // Columna MachineNumber
          articulo: program.articulo,        // Columna Articulo
          otSap: program.otSap,              // Columna OtSap
          cliente: program.cliente,          // Columna Cliente
          colores: colores,                  // Columna Colores (JSON parseado)
          fechaTintaEnMaquina: new Date(program.fechaTintaEnMaquina),  // Columna FechaTintaEnMaquina
          estado: program.estado,            // Columna Estado
          // ... más campos
        };
      });
      
      // Actualizar la señal reactiva con los programas cargados
      this.programs.set(programs);
    }
  } catch (error: any) {
    console.error('❌ Error cargando programas:', error);
  } finally {
    this.loading.set(false);
  }
}
```

#### Método para cambiar el estado de un programa

```typescript
// ===== MÉTODO PARA CAMBIAR EL ESTADO DE UN PROGRAMA =====
// Se conecta con el endpoint PATCH api/maquinas/{id}/status
// El backend ejecuta: UPDATE machine_programs SET Estado = ?, UpdatedAt = ? WHERE Id = ?
async changeStatus(program: MachineProgram, newStatus: string) {
  try {
    this.loading.set(true);
    
    // ===== PREPARACIÓN DEL DTO PARA EL BACKEND =====
    const changeStatusDto = {
      estado: newStatus,  // Nuevo estado (LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)
      observaciones: newStatus === 'SUSPENDIDO' ? program.observaciones : null
    };
    
    // ===== PETICIÓN HTTP PATCH AL BACKEND =====
    // URL: http://localhost:7003/api/maquinas/{id}/status
    // El backend actualiza la columna Estado en la tabla machine_programs
    const response = await firstValueFrom(
      this.http.patch<any>(
        `${environment.apiUrl}/maquinas/${program.id}/status`,
        changeStatusDto
      )
    );
    
    // ===== ACTUALIZACIÓN LOCAL DEL ESTADO =====
    if (response && response.success) {
      // Actualizar el programa localmente sin recargar todos los datos
      const programs = this.programs();
      const programIndex = programs.findIndex(p => p.id === program.id);
      if (programIndex !== -1) {
        programs[programIndex] = {
          ...programs[programIndex],
          estado: newStatus,  // Actualizar estado local
          lastActionBy: response.data?.lastActionBy,
          lastActionAt: new Date(response.data?.lastActionAt)
        };
        this.programs.set([...programs]);
      }
    }
  } catch (error: any) {
    console.error('❌ Error cambiando estado:', error);
  } finally {
    this.loading.set(false);
  }
}
```

### 2. Plantilla HTML

**Archivo:** `Frontend/src/app/shared/components/machines/machines.html`

```html
<!-- ===== LISTA DE MÁQUINAS ===== -->
<!-- Cada botón representa una máquina (11-21) -->
<!-- Los datos vienen de la tabla machine_programs filtrados por MachineNumber -->
<button *ngFor="let machineNum of machineNumbers" 
        mat-raised-button
        [class]="'machine-card' + (selectedMachineNumber() === machineNum ? ' selected' : '')"
        (click)="selectMachine(machineNum)">
  <div class="machine-card-content">
    <mat-icon>precision_manufacturing</mat-icon>
    <div class="machine-info">
      <!-- Número de máquina -->
      <span class="machine-number">Máquina {{ machineNum }}</span>
      <!-- Resumen calculado desde los datos de la base de datos -->
      <span class="machine-status">{{ getMachineSummary(machineNum) }}</span>
    </div>
  </div>
</button>

<!-- ===== TABLA DE PROGRAMACIÓN ===== -->
<!-- Muestra los programas de la máquina seleccionada -->
<!-- Los datos vienen directamente de la tabla machine_programs -->
<table mat-table [dataSource]="selectedMachinePrograms()">
  
  <!-- Columna Artículo - Columna 'Articulo' de la tabla -->
  <ng-container matColumnDef="articulo">
    <th mat-header-cell *matHeaderCellDef>Artículo</th>
    <td mat-cell *matCellDef="let program">{{ program.articulo }}</td>
  </ng-container>
  
  <!-- Columna Cliente - Columna 'Cliente' de la tabla -->
  <ng-container matColumnDef="cliente">
    <th mat-header-cell *matHeaderCellDef>Cliente</th>
    <td mat-cell *matCellDef="let program">{{ program.cliente }}</td>
  </ng-container>
  
  <!-- Columna Colores - Columna 'Colores' (JSON) de la tabla -->
  <ng-container matColumnDef="colores">
    <th mat-header-cell *matHeaderCellDef>Paleta</th>
    <td mat-cell *matCellDef="let program">
      <button mat-icon-button (click)="toggleColors(program.id)">
        <mat-icon>color_lens</mat-icon>
        <div class="colors-badge">{{ program.colores.length }}</div>
      </button>
    </td>
  </ng-container>
  
  <!-- Columna Estado - Columna 'Estado' de la tabla -->
  <ng-container matColumnDef="estado">
    <th mat-header-cell *matHeaderCellDef>Estado</th>
    <td mat-cell *matCellDef="let program">
      <span [class]="'status-' + program.estado.toLowerCase()">
        {{ program.estado }}
      </span>
    </td>
  </ng-container>
  
  <!-- Columna Acciones - Botones para cambiar el estado -->
  <ng-container matColumnDef="acciones">
    <th mat-header-cell *matHeaderCellDef>Acciones</th>
    <td mat-cell *matCellDef="let program">
      <!-- Botón LISTO - Actualiza Estado a 'LISTO' en la base de datos -->
      <button mat-icon-button 
              (click)="changeStatus(program, 'LISTO')"
              [disabled]="program.estado === 'LISTO'">
        <mat-icon>check_circle</mat-icon>
      </button>
      
      <!-- Botón CORRIENDO - Actualiza Estado a 'CORRIENDO' en la base de datos -->
      <button mat-icon-button 
              (click)="changeStatus(program, 'CORRIENDO')"
              [disabled]="program.estado === 'CORRIENDO'">
        <mat-icon>play_circle</mat-icon>
      </button>
      
      <!-- Botón SUSPENDER - Actualiza Estado a 'SUSPENDIDO' en la base de datos -->
      <button mat-icon-button 
              (click)="suspendProgram(program)"
              [disabled]="program.estado === 'SUSPENDIDO'">
        <mat-icon>pause_circle</mat-icon>
      </button>
      
      <!-- Botón TERMINADO - Actualiza Estado a 'TERMINADO' en la base de datos -->
      <button mat-icon-button 
              (click)="changeStatus(program, 'TERMINADO')"
              [disabled]="program.estado === 'TERMINADO'">
        <mat-icon>task_alt</mat-icon>
      </button>
    </td>
  </ng-container>
  
  <tr mat-header-row *matHeaderRowDef="programDisplayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: programDisplayedColumns;"></tr>
</table>
```

---

## 🔄 FLUJO COMPLETO DE DATOS

### 1. Carga Inicial de Datos

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  FRONTEND   │         │   BACKEND   │         │  ENTITY FW   │         │   MYSQL     │
│  (Angular)  │         │  (ASP.NET)  │         │              │         │  flexoapp_bd│
└──────┬──────┘         └──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                       │                        │
       │ GET /api/maquinas     │                       │                        │
       │──────────────────────>│                       │                        │
       │                       │                       │                        │
       │                       │ _context.MachinePrograms │                     │
       │                       │──────────────────────>│                        │
       │                       │                       │                        │
       │                       │                       │ SELECT * FROM          │
       │                       │                       │ machine_programs       │
       │                       │                       │ ORDER BY               │
       │                       │                       │ FechaTintaEnMaquina    │
       │                       │                       │ DESC                   │
       │                       │                       │───────────────────────>│
       │                       │                       │                        │
       │                       │                       │ Resultados (JSON)      │
       │                       │                       │<───────────────────────│
       │                       │                       │                        │
       │                       │ List<MachineProgram>  │                        │
       │                       │<──────────────────────│                        │
       │                       │                       │                        │
       │ Response JSON         │                       │                        │
       │<──────────────────────│                       │                        │
       │ {success: true,       │                       │                        │
       │  data: [...]}         │                       │                        │
       │                       │                       │                        │
       │ Actualizar UI         │                       │                        │
       │ programs.set(data)    │                       │                        │
       │                       │                       │                        │
```

### 2. Cambio de Estado de un Programa

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  FRONTEND   │         │   BACKEND   │         │  ENTITY FW   │         │   MYSQL     │
│  (Angular)  │         │  (ASP.NET)  │         │              │         │  flexoapp_bd│
└──────┬──────┘         └──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                       │                        │
       │ PATCH /api/maquinas/  │                       │                        │
       │ {id}/status           │                       │                        │
       │ Body: {estado:        │                       │                        │
       │ "CORRIENDO"}          │                       │                        │
       │──────────────────────>│                       │                        │
       │                       │                       │                        │
       │                       │ FindAsync(id)         │                        │
       │                       │──────────────────────>│                        │
       │                       │                       │                        │
       │                       │                       │ SELECT * FROM          │
       │                       │                       │ machine_programs       │
       │                       │                       │ WHERE Id = ?           │
       │                       │                       │───────────────────────>│
       │                       │                       │                        │
       │                       │                       │ Registro encontrado    │
       │                       │                       │<───────────────────────│
       │                       │                       │                        │
       │                       │ MachineProgram        │                        │
       │                       │<──────────────────────│                        │
       │                       │                       │                        │
       │                       │ program.Estado =      │                        │
       │                       │ "CORRIENDO"           │                        │
       │                       │ program.UpdatedAt =   │                        │
       │                       │ DateTime.UtcNow       │                        │
       │                       │                       │                        │
       │                       │ SaveChangesAsync()    │                        │
       │                       │──────────────────────>│                        │
       │                       │                       │                        │
       │                       │                       │ UPDATE                 │
       │                       │                       │ machine_programs       │
       │                       │                       │ SET Estado =           │
       │                       │                       │ 'CORRIENDO',           │
       │                       │                       │ UpdatedAt = NOW()      │
       │                       │                       │ WHERE Id = ?           │
       │                       │                       │───────────────────────>│
       │                       │                       │                        │
       │                       │                       │ Actualización exitosa  │
       │                       │                       │<───────────────────────│
       │                       │                       │                        │
       │                       │ Cambios guardados     │                        │
       │                       │<──────────────────────│                        │
       │                       │                       │                        │
       │ Response JSON         │                       │                        │
       │<──────────────────────│                       │                        │
       │ {success: true,       │                       │                        │
       │  data: {...}}         │                       │                        │
       │                       │                       │                        │
       │ Actualizar UI local   │                       │                        │
       │ program.estado =      │                       │                        │
       │ "CORRIENDO"           │                       │                        │
       │                       │                       │                        │
```

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### Error 500: Internal Server Error

**Causa:** La tabla `machine_programs` no existe o está vacía.

**Solución:**

1. Ejecutar el script SQL de verificación y población:
   ```bash
   mysql -u root -p12345 flexoapp_bd < backend/Scripts/VerificarYPoblarMachinePrograms.sql
   ```

2. Verificar que el backend esté corriendo:
   ```bash
   cd backend
   dotnet run
   ```

3. Verificar la conexión a la base de datos en `appsettings.Development.json`

### Error de Conexión

**Causa:** El backend no puede conectarse a MySQL.

**Solución:**

1. Verificar que MySQL esté corriendo:
   ```bash
   mysql -u root -p12345
   ```

2. Verificar que la base de datos `flexoapp_bd` exista:
   ```sql
   SHOW DATABASES;
   USE flexoapp_bd;
   SHOW TABLES;
   ```

3. Verificar la cadena de conexión en `appsettings.Development.json`

---

## 📊 RESUMEN DE ENDPOINTS

| Método | Endpoint | Descripción | Tabla BD |
|--------|----------|-------------|----------|
| GET | `/api/maquinas` | Obtener todos los programas | `machine_programs` |
| GET | `/api/maquinas/machine/{numeroMaquina}` | Obtener programas de una máquina | `machine_programs` |
| PATCH | `/api/maquinas/{id}/status` | Cambiar estado de un programa | `machine_programs` |
| POST | `/api/machines/programs` | Crear nuevo programa | `machine_programs` |
| PUT | `/api/machines/programs/{id}` | Actualizar programa completo | `machine_programs` |
| DELETE | `/api/machines/programs/{id}` | Eliminar programa | `machine_programs` |

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] MySQL está corriendo en localhost:3306
- [ ] La base de datos `flexoapp_bd` existe
- [ ] La tabla `machine_programs` existe y tiene datos
- [ ] El backend está corriendo en http://localhost:7003
- [ ] El frontend está corriendo en http://localhost:4200
- [ ] La cadena de conexión en `appsettings.Development.json` es correcta
- [ ] El endpoint `/api/maquinas` retorna datos correctamente
- [ ] El frontend puede cargar y mostrar los programas
- [ ] Los botones de cambio de estado funcionan correctamente

---

## 📝 NOTAS FINALES

- Todos los comentarios en el código están en español para facilitar el mantenimiento
- La tabla `machine_programs` usa JSON para almacenar el array de colores
- Los timestamps se actualizan automáticamente con `ON UPDATE CURRENT_TIMESTAMP`
- El sistema usa Entity Framework Core para el acceso a datos
- Angular usa señales reactivas (`signal`) para la gestión de estado

---

**Fecha de creación:** 10 de Enero de 2025  
**Versión:** 1.0  
**Autor:** Sistema FlexoAPP
