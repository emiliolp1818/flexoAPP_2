# Cambio de PostgreSQL a MySQL

## ⚠️ IMPORTANTE
La aplicación actualmente está configurada para PostgreSQL. Si quieres usar MySQL, sigue estos pasos:

## 1. Instalar MySQL
- Descarga MySQL Community Server
- Instala MySQL Workbench (opcional)
- Configura usuario root con contraseña

## 2. Modificar Backend

### Cambiar en flexoAPP.csproj
```xml
<!-- Eliminar -->
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.0" />

<!-- Agregar -->
<PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0.0" />
```

### Cambiar en appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=flexoapp;User=root;Password=admin;"
  }
}
```

### Cambiar en Program.cs
```csharp
// Eliminar
options.UseNpgsql(connectionString, npgsqlOptions => { ... });

// Agregar
options.UseMySql(connectionString, 
    ServerVersion.AutoDetect(connectionString),
    mySqlOptions => {
        mySqlOptions.CommandTimeout(30);
        mySqlOptions.EnableRetryOnFailure(3);
    });
```

## 3. Crear Base de Datos MySQL
```sql
CREATE DATABASE flexoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flexoapp;
```

## 4. Recrear Migraciones
```bash
cd backend
dotnet ef migrations remove
dotnet ef migrations add InitialMySql
dotnet ef database update
```

## 5. Crear Tabla CondicionUnica
```sql
USE flexoapp;

CREATE TABLE condicionunica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farticulo VARCHAR(50) NOT NULL,
    referencia VARCHAR(200) NOT NULL,
    estante VARCHAR(50) NOT NULL,
    numerocarpeta VARCHAR(50) NOT NULL,
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastmodified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_farticulo (farticulo),
    INDEX idx_estante (estante),
    INDEX idx_lastmodified (lastmodified DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de prueba
INSERT INTO condicionunica (farticulo, referencia, estante, numerocarpeta) VALUES
('F204567', 'REF-BOLSA-001', 'E-01', 'C-001'),
('F204568', 'REF-ETIQUETA-002', 'E-01', 'C-002'),
('F204569', 'REF-EMPAQUE-003', 'E-02', 'C-003'),
('F204570', 'REF-BOLSA-004', 'E-02', 'C-004'),
('F204571', 'REF-ETIQUETA-005', 'E-03', 'C-005');
```

## ⚠️ Consideraciones

### Diferencias PostgreSQL vs MySQL
- PostgreSQL usa `SERIAL`, MySQL usa `AUTO_INCREMENT`
- PostgreSQL usa `TIMESTAMP`, MySQL usa `DATETIME` o `TIMESTAMP`
- PostgreSQL usa `jsonb`, MySQL usa `JSON`
- Sintaxis de funciones diferentes

### Recomendación
**Mantén PostgreSQL** porque:
- ✅ Ya está todo configurado
- ✅ Mejor para aplicaciones empresariales
- ✅ Más características avanzadas
- ✅ Mejor manejo de JSON
- ✅ Más estable para concurrencia

## ¿Necesitas ayuda?
Si decides cambiar a MySQL, avísame y te ayudo con todos los cambios necesarios.
