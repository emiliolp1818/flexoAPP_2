# FlexoAPP - Estructura del Proyecto

## Distribución Raíz

```
flexoAPP_2/
├── backend/          # Web API en .NET 8
├── Frontend/         # SPA en Angular 20
├── .kiro/            # Configuración y steering de Kiro
├── .dockerignore
├── .gitignore
└── .railwayignore
```

## Backend (`backend/`)

```
backend/
├── Controllers/          # Endpoints de la API (un controlador por dominio)
├── Services/
│   ├── Interfaces/       # Contratos de servicio (IXxxService.cs)
│   └── Implementations/  # Lógica de negocio (XxxService.cs)
├── Repositories/
│   ├── Interfaces/       # Contratos de repositorio
│   └── Implementations/  # Lógica de acceso a datos
├── Models/
│   ├── Entities/         # Clases de entidad para EF Core
│   ├── DTOs/             # Objetos de transferencia de datos para requests/responses
│   ├── Enums/            # Definiciones de enumeraciones
│   └── Permissions/      # Modelos relacionados con permisos
├── Data/
│   └── Context/          # FlexoAPPDbContext (DbContext de EF Core)
├── Database/
│   └── Scripts/          # Scripts SQL de migración (numerados secuencialmente)
├── Attributes/           # Atributos personalizados (ej. RequirePermissionAttribute)
├── Helpers/              # Clases utilitarias
├── Hubs/                 # Hubs de SignalR (MaquinasHub)
├── Migrations/           # Migraciones autogeneradas por EF Core
├── uploads/              # Almacenamiento de archivos subidos
├── wwwroot/              # Archivos estáticos
├── Program.cs            # Punto de entrada y configuración de DI
├── flexoAPP.csproj       # Archivo de proyecto
└── Dockerfile            # Build del contenedor
```

### Patrones del Backend

- **Patrón Repositorio**: Todo acceso a datos pasa por interfaces de repositorio.
- **Capa de Servicios**: La lógica de negocio vive en los servicios; los controladores son delgados.
- **Registro de DI**: Todos los servicios y repositorios se registran en `Program.cs`.
- **Namespace**: `FlexoAPP.API` (nombre del ensamblado: `FlexoAPP.API`).

## Frontend (`Frontend/`)

```
Frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/          # Guards de rutas (auth, permission)
│   │   │   ├── interceptors/    # Interceptores HTTP
│   │   │   └── services/        # Servicios singleton globales (auth, tema, etc.)
│   │   ├── shared/
│   │   │   ├── components/      # Componentes de funcionalidad (una carpeta por página)
│   │   │   ├── models/          # Interfaces y tipos TypeScript
│   │   │   ├── pipes/           # Pipes personalizados
│   │   │   └── services/        # Servicios de dominio (anilox, tintas, etc.)
│   │   ├── auth/
│   │   │   └── settings/        # Componente de configuración/administración
│   │   ├── app.routes.ts        # Definición de rutas (componentes standalone con lazy load)
│   │   ├── app.config.ts        # Configuración de providers de la app
│   │   └── app.ts               # Componente raíz
│   ├── environments/            # Configuraciones de entorno
│   ├── styles/                  # Estilos SCSS globales
│   └── index.html
├── public/                      # Assets estáticos (imágenes, plantillas)
├── angular.json                 # Configuración del workspace de Angular CLI
├── package.json
├── tsconfig.json
├── Dockerfile
└── nginx.conf                   # Configuración de Nginx para producción
```

### Patrones del Frontend

- **Componentes Standalone**: Sin NgModules. Todos los componentes son standalone con rutas lazy-loaded.
- **Core vs Shared**: `core/` contiene singletons globales (guards, interceptores, auth). `shared/` contiene componentes de funcionalidad y servicios de dominio.
- **Convención de archivos**: Cada carpeta de componente contiene archivos `.ts`, `.html` y `.scss` (sin sufijo `.component` en los nombres).
- **Rutas**: Todas las rutas definidas en `app.routes.ts` usando `loadComponent()` para code splitting.
- **Guards**: `AuthGuard` para autenticación, `permissionGuard` para control de acceso a nivel de módulo.
