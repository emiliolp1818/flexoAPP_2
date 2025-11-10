# 🚀 Iniciar FlexoAPP Localmente

## Opción 1: Script Automático (Recomendado)

### Windows PowerShell
Ejecuta el script `start-local.ps1`:
```powershell
.\start-local.ps1
```

## Opción 2: Manual

### 1. Iniciar Backend (Terminal 1)
```powershell
cd backend
dotnet run
```

El backend estará disponible en:
- http://localhost:7003
- http://192.168.1.6:7003

### 2. Iniciar Frontend (Terminal 2)
```powershell
cd Frontend
npm start
```

El frontend estará disponible en:
- http://localhost:4200
- http://192.168.1.6:4200

## 🔧 Configuración

### Backend Local
- **Base de datos:** Railway PostgreSQL (remota)
- **Puerto:** 7003
- **URL:** http://localhost:7003

### Frontend Local
- **Puerto:** 4200
- **API URL:** http://192.168.1.6:7003/api
- **Acceso red:** http://192.168.1.6:4200

## 📝 Credenciales

- **Usuario:** admin
- **Contraseña:** admin123

## ⚠️ Requisitos

- .NET 8.0 SDK
- Node.js 18+
- npm

## 🆘 Problemas Comunes

### Backend no inicia
```powershell
# Matar procesos anteriores
Get-Process | Where-Object {$_.ProcessName -like "*FlexoAPP*"} | Stop-Process -Force

# Limpiar y reiniciar
cd backend
dotnet clean
dotnet run
```

### Frontend no inicia
```powershell
# Limpiar node_modules
cd Frontend
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

### Puerto ocupado
```powershell
# Ver qué está usando el puerto 7003
netstat -ano | findstr :7003

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F
```
