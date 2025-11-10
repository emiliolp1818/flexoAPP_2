# 🔧 Configuraciones de Desarrollo - FlexoAPP

## 📋 Modos Disponibles

FlexoAPP ahora soporta múltiples configuraciones para diferentes escenarios de desarrollo:

### 1. 🌐 Modo Híbrido (Recomendado)
**Usa localhost primero, Render como fallback automático**

```powershell
# Frontend
npm start
# o
npm run start:hybrid

# Backend
cd backend
dotnet run
```

**Características:**
- ✅ Intenta conectar a localhost:7003 primero
- ✅ Si falla, automáticamente usa Render
- ✅ Accesible desde localhost y red local
- ✅ Ideal para desarrollo con backend local opcional

**URLs:**
- Frontend: http://localhost:4200 o http://192.168.1.6:4200
- Backend: http://localhost:7003 (local) o https://flexoapp-backend.onrender.com (fallback)

---

### 2. 💻 Modo Local Puro
**Solo localhost, sin fallback**

```powershell
# Frontend
npm run start:local

# Backend (REQUERIDO)
cd backend
dotnet run
```

**Características:**
- ✅ Solo usa localhost
- ✅ Más rápido (sin intentos de fallback)
- ⚠️ Requiere backend local corriendo
- ✅ Ideal para desarrollo offline

**URLs:**
- Frontend: http://localhost:4200
- Backend: http://localhost:7003 (REQUERIDO)

---

### 3. 🌍 Modo Red Local
**Accesible desde otros dispositivos en la red**

```powershell
# Frontend
npm run start:network

# Backend
cd backend
dotnet run
```

**Características:**
- ✅ Accesible desde cualquier dispositivo en la red
- ✅ Usa IP 192.168.1.6
- ✅ Ideal para probar en móviles/tablets
- ✅ Backend local o Render

**URLs:**
- Frontend: http://192.168.1.6:4200
- Backend: http://192.168.1.6:7003 o Render

---

### 4. 🚀 Modo Producción (Solo Render)
**Solo usa Render, sin localhost**

```powershell
npm run start:prod
```

**Características:**
- ✅ Solo usa Render
- ✅ Simula producción localmente
- ✅ No requiere backend local
- ✅ Ideal para probar integración con Render

**URLs:**
- Frontend: http://192.168.1.6:4200
- Backend: https://flexoapp-backend.onrender.com (SOLO Render)

---

## 🎯 ¿Cuál Usar?

| Escenario | Configuración Recomendada |
|-----------|---------------------------|
| Desarrollo normal | 🌐 Híbrido (`npm start`) |
| Desarrollo offline | 💻 Local (`npm run start:local`) |
| Probar en móvil | 🌍 Red (`npm run start:network`) |
| Probar con Render | 🚀 Producción (`npm run start:prod`) |
| Backend no disponible | 🌐 Híbrido (usa Render automáticamente) |

---

## 🚀 Scripts Rápidos

### Inicio Automático (Recomendado)
```powershell
# Inicia backend + frontend en modo híbrido
.\start-local.ps1
```

### Frontend Solo
```powershell
cd Frontend

# Híbrido (localhost + fallback Render)
npm start

# Local puro (solo localhost)
npm run start:local

# Red local (accesible desde otros dispositivos)
npm run start:network

# Producción (solo Render)
npm run start:prod
```

### Backend Solo
```powershell
cd backend
dotnet run
```

---

## 📊 Comparación de Configuraciones

| Característica | Híbrido | Local | Red | Producción |
|----------------|---------|-------|-----|------------|
| Backend local | Opcional | Requerido | Opcional | No |
| Fallback Render | ✅ | ❌ | ✅ | ✅ |
| Acceso red local | ✅ | ❌ | ✅ | ✅ |
| Desarrollo offline | ⚠️ | ✅ | ⚠️ | ❌ |
| Hot reload | ✅ | ✅ | ✅ | ✅ |
| Debug | ✅ | ✅ | ✅ | ⚠️ |

---

## 🔄 Cambiar Entre Configuraciones

### Durante Desarrollo
Simplemente detén el servidor (Ctrl+C) y ejecuta el nuevo comando:

```powershell
# Detener
Ctrl+C

# Cambiar a otra configuración
npm run start:local   # o start:network, start:hybrid, etc.
```

### En VS Code
1. Presiona `F5`
2. Selecciona la configuración deseada del dropdown

---

## 🛠️ Configuración Personalizada

### Cambiar Puerto del Frontend
Edita `Frontend/angular.json`:
```json
"port": 4200  // Cambia a tu puerto preferido
```

### Cambiar Puerto del Backend
Edita `backend/appsettings.json`:
```json
"Urls": "http://0.0.0.0:7003"  // Cambia 7003 a tu puerto
```

### Cambiar IP de Red
Edita `Frontend/angular.json`:
```json
"host": "192.168.1.6"  // Cambia a tu IP local
```

---

## 🔍 Verificar Configuración Activa

### Frontend
Abre la consola del navegador (F12) y busca:
```
🚀 FlexoAPP iniciado correctamente
API URL: http://localhost:7003/api
```

### Backend
Busca en los logs:
```
Now listening on: http://0.0.0.0:7003
```

---

## 🆘 Troubleshooting

### Frontend no conecta al backend local
1. Verifica que el backend esté corriendo: http://localhost:7003/health
2. Usa modo híbrido: `npm start` (fallback automático a Render)
3. Revisa la consola del navegador para ver qué URL está usando

### Backend local no inicia
```powershell
# Limpiar procesos
.\stop-local.ps1

# Reiniciar
cd backend
dotnet clean
dotnet run
```

### Quiero usar solo Render (sin backend local)
```powershell
npm run start:prod
```

### Quiero forzar uso de localhost
```powershell
npm run start:local
# Asegúrate de tener el backend corriendo
```

---

## 📝 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `environment.ts` | Desarrollo por defecto (red local) |
| `environment.local.ts` | Solo localhost |
| `environment.hybrid.ts` | Localhost + fallback Render |
| `environment.network.ts` | Red local |
| `environment.prod.ts` | Solo Render (producción) |

---

## 🎉 Resumen

**Para desarrollo normal:**
```powershell
.\start-local.ps1
```

**Para desarrollo sin backend local:**
```powershell
npm run start:prod
```

**Para desarrollo offline:**
```powershell
npm run start:local
cd backend
dotnet run
```

---

¡Ahora tienes flexibilidad total para trabajar como prefieras! 🚀
