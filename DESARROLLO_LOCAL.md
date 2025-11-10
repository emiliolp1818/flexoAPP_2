# 💻 Desarrollo Local - FlexoAPP

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Más Fácil)
```powershell
.\start-local.ps1
```

Este script:
- ✅ Limpia procesos anteriores
- ✅ Inicia el backend en puerto 7003
- ✅ Inicia el frontend en puerto 4200
- ✅ Abre el navegador automáticamente
- ✅ Muestra logs en tiempo real

### Opción 2: VS Code (Recomendado para Debug)
1. Abre el proyecto en VS Code
2. Presiona `F5` o ve a Run → Start Debugging
3. Selecciona "🎯 FlexoAPP Completo"

### Opción 3: Manual (Dos Terminales)

**Terminal 1 - Backend:**
```powershell
cd backend
dotnet run
```

**Terminal 2 - Frontend:**
```powershell
cd Frontend
npm start
```

## 🌐 URLs Locales

| Servicio | URL Local | URL Red |
|----------|-----------|---------|
| Frontend | http://localhost:4200 | http://192.168.1.6:4200 |
| Backend API | http://localhost:7003 | http://192.168.1.6:7003 |
| Health Check | http://localhost:7003/health | http://192.168.1.6:7003/health |
| Swagger | http://localhost:7003/swagger | http://192.168.1.6:7003/swagger |

## 👤 Credenciales de Prueba

```
Usuario: admin
Contraseña: admin123
```

## 🔧 Configuración

### Backend
- **Framework:** .NET 8.0
- **Puerto:** 7003
- **Base de Datos:** Railway PostgreSQL (remota)
- **Logs:** Console + archivos en `backend/logs/`

### Frontend
- **Framework:** Angular 20
- **Puerto:** 4200
- **API URL:** http://192.168.1.6:7003/api
- **Hot Reload:** Activado

## 📦 Requisitos

### Software Necesario
- ✅ .NET 8.0 SDK - [Descargar](https://dotnet.microsoft.com/download/dotnet/8.0)
- ✅ Node.js 18+ - [Descargar](https://nodejs.org/)
- ✅ npm (incluido con Node.js)

### Verificar Instalación
```powershell
dotnet --version  # Debe mostrar 8.0.x
node --version    # Debe mostrar v18.x o superior
npm --version     # Debe mostrar 9.x o superior
```

## 🛠️ Comandos Útiles

### Backend
```powershell
# Compilar
cd backend
dotnet build

# Ejecutar
dotnet run

# Limpiar
dotnet clean

# Watch mode (recarga automática)
dotnet watch run

# Restaurar paquetes
dotnet restore
```

### Frontend
```powershell
# Instalar dependencias
cd Frontend
npm install

# Iniciar desarrollo
npm start

# Build producción
npm run build:prod

# Limpiar node_modules
Remove-Item -Recurse -Force node_modules
npm install
```

## 🐛 Debugging

### VS Code
1. Coloca breakpoints en el código
2. Presiona `F5`
3. Selecciona la configuración deseada:
   - 🚀 Backend (.NET) - Solo backend
   - 🎨 Frontend (Angular) - Solo frontend
   - 🎯 FlexoAPP Completo - Ambos

### Chrome DevTools
1. Abre http://localhost:4200
2. Presiona `F12`
3. Ve a Sources → webpack:// → src

## 🔥 Hot Reload

### Backend
```powershell
cd backend
dotnet watch run
```
Los cambios en archivos .cs se recargan automáticamente.

### Frontend
```powershell
cd Frontend
npm start
```
Los cambios en archivos .ts, .html, .scss se recargan automáticamente.

## 🆘 Solución de Problemas

### Puerto 7003 ocupado
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :7003

# Matar el proceso (reemplaza PID)
taskkill /PID <PID> /F

# O usar el script
.\stop-local.ps1
```

### Puerto 4200 ocupado
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :4200

# Matar el proceso
taskkill /PID <PID> /F
```

### Backend no compila
```powershell
cd backend
dotnet clean
dotnet restore
dotnet build
```

### Frontend no inicia
```powershell
cd Frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm start
```

### Error de base de datos
Verifica que la connection string en `backend/appsettings.json` sea correcta:
```json
"DefaultConnection": "Host=tramway.proxy.rlwy.net;Port=53339;Database=railway;Username=postgres;Password=hkmpdAkGtBeKZvztniVQdJjARZzoxZcZ;SSL Mode=Require;Trust Server Certificate=true"
```

### CORS errors
El backend ya está configurado para permitir:
- localhost
- 127.0.0.1
- 192.168.x.x
- *.onrender.com

## 📝 Estructura del Proyecto

```
flexoAPP3/
├── backend/                 # Backend .NET
│   ├── Controllers/        # API Controllers
│   ├── Services/          # Business Logic
│   ├── Repositories/      # Data Access
│   ├── Models/            # Entities & DTOs
│   ├── Data/              # DbContext & Migrations
│   └── appsettings.json   # Configuración
│
├── Frontend/               # Frontend Angular
│   ├── src/
│   │   ├── app/          # Componentes
│   │   ├── environments/ # Configuración
│   │   └── public/       # Assets estáticos
│   └── package.json      # Dependencias
│
├── start-local.ps1        # Script de inicio
├── stop-local.ps1         # Script de parada
└── .vscode/               # Configuración VS Code
```

## 🎯 Flujo de Desarrollo

1. **Iniciar servicios:** `.\start-local.ps1`
2. **Hacer cambios** en el código
3. **Ver cambios** automáticamente (hot reload)
4. **Debuggear** con VS Code (F5)
5. **Detener servicios:** Ctrl+C o `.\stop-local.ps1`

## 🔄 Actualizar Dependencias

### Backend
```powershell
cd backend
dotnet list package --outdated
dotnet add package <PackageName>
```

### Frontend
```powershell
cd Frontend
npm outdated
npm update
```

## 📊 Monitoreo

### Logs del Backend
- Console: En tiempo real en la terminal
- Archivos: `backend/logs/flexoapp-YYYY-MM-DD.log`

### Logs del Frontend
- Console: En tiempo real en la terminal
- Browser: F12 → Console

### Health Check
```powershell
# Backend
Invoke-RestMethod http://localhost:7003/health

# Base de datos
Invoke-RestMethod http://localhost:7003/api/diagnostic/test-db
```

## 🚀 Despliegue

Ver documentación de despliegue:
- `DEPLOY_RENDER.md` - Despliegue en Render
- `RAILWAY_DATABASE.md` - Configuración de base de datos

---

**¿Problemas?** Revisa `TROUBLESHOOTING.md` o abre un issue en GitHub.
