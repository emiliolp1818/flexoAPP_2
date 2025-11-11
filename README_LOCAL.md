# FlexoAPP - Configuración Local

## Requisitos

- PostgreSQL 12+ instalado y corriendo
- .NET 8.0 SDK
- Node.js 18+ y Angular CLI
- pgAdmin (opcional)

## Configuración Rápida

### 1. Crear Base de Datos

```sql
CREATE DATABASE flexoapp;
```

### 2. Configurar Contraseña

Si tu contraseña de PostgreSQL no es `admin`, edita:
- `backend/appsettings.json`
- Cambia `Password=admin` por tu contraseña

### 3. Crear Tablas

Ejecuta las migraciones:
```bash
cd backend
dotnet ef database update
```

Para crear la tabla CondicionUnica:
```bash
psql -U postgres -d flexoapp -f Database/Scripts/create_condicionunica_local.sql
```

### 4. Iniciar Aplicación

**Opción A: Script automático**
```powershell
.\iniciar-app.ps1
```

**Opción B: Manual**

Terminal 1 - Backend:
```bash
cd backend
dotnet run
```

Terminal 2 - Frontend:
```bash
cd Frontend
ng serve
```

## URLs

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:7003
- **Swagger:** http://localhost:7003/swagger

## Estructura del Proyecto

```
flexoAPP3/
├── backend/                 # API .NET
│   ├── Controllers/        # Controladores REST
│   ├── Models/            # Entidades y DTOs
│   ├── Repositories/      # Acceso a datos
│   ├── Services/          # Lógica de negocio
│   └── Database/Scripts/  # Scripts SQL
├── Frontend/              # Angular App
│   └── src/app/
│       ├── auth/         # Autenticación
│       ├── shared/       # Componentes compartidos
│       └── core/         # Servicios core
└── iniciar-app.ps1       # Script de inicio
```

## Módulos Principales

1. **Autenticación** - Login y gestión de usuarios
2. **Máquinas** - Gestión de máquinas flexográficas
3. **Pedidos** - Gestión de pedidos
4. **Diseños** - Catálogo de diseños
5. **Programas** - Programas de máquina
6. **Condición Única** - Gestión de artículos (nuevo)

## Troubleshooting

### Error: "password authentication failed"
- Verifica la contraseña en `backend/appsettings.json`
- Asegúrate que PostgreSQL esté corriendo

### Error: "database flexoapp does not exist"
- Crea la base de datos: `CREATE DATABASE flexoapp;`

### Error: "could not connect to server"
- Verifica que PostgreSQL esté corriendo
- Verifica el puerto (por defecto 5432)

### Error: "relation does not exist"
- Ejecuta las migraciones: `dotnet ef database update`

## Comandos Útiles

### Backend
```bash
# Compilar
dotnet build

# Ejecutar
dotnet run

# Crear migración
dotnet ef migrations add NombreMigracion

# Aplicar migraciones
dotnet ef database update

# Limpiar
dotnet clean
```

### Frontend
```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
ng serve

# Compilar producción
ng build --configuration production

# Ejecutar tests
ng test
```

### Base de Datos
```bash
# Conectar a PostgreSQL
psql -U postgres

# Conectar a base de datos
psql -U postgres -d flexoapp

# Ejecutar script SQL
psql -U postgres -d flexoapp -f script.sql

# Ver tablas
\dt

# Describir tabla
\d nombre_tabla
```

## Credenciales por Defecto

- **Usuario:** admin
- **Contraseña:** admin123

(Cambiar después del primer login)
