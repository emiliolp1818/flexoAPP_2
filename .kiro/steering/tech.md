# FlexoAPP - Stack Tecnológico

## Backend (.NET 8 Web API)

- **Framework**: ASP.NET Core 8.0 (Web API)
- **Lenguaje**: C# con nullable reference types habilitado
- **ORM**: Entity Framework Core 8.0 con proveedor Pomelo para MySQL
- **Base de datos**: MySQL 8.0 (alojada en Railway)
- **Autenticación**: JWT Bearer tokens + refresh tokens (contraseñas con BCrypt)
- **Tiempo real**: SignalR para comunicación WebSocket
- **Logging**: Serilog (sinks de consola y archivo)
- **Mapeo**: AutoMapper para conversión DTO ↔ Entidad
- **Generación de PDF**: QuestPDF (gratuito, sin marca de agua)
- **Excel**: EPPlus, ClosedXML
- **Caché**: Caché en memoria (Microsoft.Extensions.Caching.Memory)
- **Profiling**: MiniProfiler (solo en desarrollo)
- **Health Checks**: EF Core + endpoints de salud personalizados
- **Documentación API**: Swagger/Swashbuckle

## Frontend (Angular 20 SPA)

- **Framework**: Angular 20 (componentes standalone, sin NgModules)
- **Lenguaje**: TypeScript 5.9
- **Librería UI**: Angular Material + Angular CDK
- **Estilos**: SCSS
- **Estado/Reactividad**: RxJS
- **Tiempo real**: cliente @microsoft/signalr
- **Notificaciones**: ngx-toastr
- **Exportar PDF**: jsPDF + jspdf-autotable
- **Exportar Excel**: ExcelJS
- **Testing**: Karma + Jasmine
- **Build**: Angular CLI (basado en Vite via @angular/build)

## Despliegue

- **Plataforma**: Railway (frontend y backend)
- **Contenedores**: Docker (Dockerfiles separados para frontend y backend)
- **Servidor frontend**: Nginx (en contenedor de producción)
- **Config de build**: nixpacks.toml para builds en Railway

## Comandos Frecuentes

### Frontend (ejecutar desde el directorio `Frontend/`)

```bash
npm start              # Servidor de desarrollo en 0.0.0.0:4200 (config hybrid)
npm run build          # Build de producción
npm run build:railway  # Build específico para Railway
npm test               # Ejecutar tests (Chrome headless, una sola vez)
npm run test:watch     # Ejecutar tests en modo watch
npm run lint           # Lintear el proyecto
```

### Backend (ejecutar desde el directorio `backend/`)

```bash
dotnet build                              # Compilar el proyecto
dotnet run                                # Ejecutar la API (usa variable PORT, por defecto 8080)
dotnet watch run                          # Ejecutar con hot reload (desarrollo)
dotnet ef migrations add <Nombre>         # Crear una nueva migración de EF
dotnet ef database update                 # Aplicar migraciones pendientes
```
