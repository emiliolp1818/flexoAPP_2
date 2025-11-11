# CONFIGURACIÓN LOCAL - FlexoAPP

## Base de Datos PostgreSQL Local

### Configuración Actual
- **Host:** localhost
- **Puerto:** 5432
- **Base de datos:** flexoapp
- **Usuario:** postgres
- **Contraseña:** admin

### Requisitos
1. PostgreSQL instalado localmente
2. pgAdmin (opcional, para gestión visual)

### Crear Base de Datos

```sql
-- En psql o pgAdmin
CREATE DATABASE flexoapp;
```

### Crear Tabla CondicionUnica

Ejecutar el script:
```bash
psql -U postgres -d flexoapp -f backend/Database/Scripts/create_condicionunica_local.sql
```

O abrir en pgAdmin y ejecutar:
- `backend/Database/Scripts/create_condicionunica_local.sql`

### Verificar Conexión

1. Iniciar backend:
```bash
cd backend
dotnet run
```

2. Probar endpoint:
```
http://localhost:7003/api/condicion-unica/test
```

### URLs de la Aplicación

- **Backend:** http://localhost:7003
- **Frontend:** http://localhost:4200
- **Swagger:** http://localhost:7003/swagger

### Cambiar Contraseña de PostgreSQL

Si tu contraseña es diferente, edita:
- `backend/appsettings.json`
- Cambia `Password=admin` por tu contraseña

### Estructura de Tablas

La aplicación usa estas tablas principales:
- `users` - Usuarios del sistema
- `designs` - Diseños
- `maquinas` - Máquinas
- `pedidos` - Pedidos
- `machine_programs` - Programas de máquina
- `activities` - Registro de actividades
- `condicionunica` - Condición única (nueva)

### Troubleshooting

**Error: "password authentication failed"**
- Verifica la contraseña en appsettings.json
- Verifica que PostgreSQL esté corriendo

**Error: "database flexoapp does not exist"**
- Crea la base de datos: `CREATE DATABASE flexoapp;`

**Error: "could not connect to server"**
- Verifica que PostgreSQL esté corriendo
- Verifica el puerto (por defecto 5432)
