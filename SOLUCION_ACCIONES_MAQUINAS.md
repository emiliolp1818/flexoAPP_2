# 🔧 Solución: Acciones no funcionan en el módulo de máquinas

## 📋 Diagnóstico del problema

He revisado el código del módulo de máquinas y encontré que la implementación está correcta tanto en el frontend como en el backend. El problema más probable es uno de los siguientes:

## 🎯 Posibles causas y soluciones

### 1. **Backend no está ejecutándose**
**Verificar:**
```bash
# Ir al directorio del backend
cd backend

# Ejecutar el backend
dotnet run
```

**Debe mostrar:**
```
🚀 FLEXOAPP ENHANCED API - MYSQL LOCAL READY
🌐 Framework: ASP.NET Core 8.0
🗄️ Database: MySQL Local (flexoapp_bd)
```

### 2. **Problema de autenticación**
**Verificar en la consola del navegador:**
- Abrir DevTools (F12)
- Ir a la pestaña Console
- Buscar mensajes como:
  - `🔐 Interceptor funcional - Tiene token: false`
  - `❌ Error en petición autenticada: 401`

**Solución:**
```javascript
// Ejecutar en la consola del navegador
localStorage.clear();
// Luego recargar la página y hacer login nuevamente
```

### 3. **IDs de programa inválidos**
**Verificar en la consola:**
- Buscar mensajes como:
  - `❌ Error: El programa no tiene un ID válido`
  - `⚠️ Advertencia: Intentando actualizar programa con ID temporal`

### 4. **Error de conectividad**
**Probar manualmente:**
1. Abrir el archivo `test-backend.html` que creé
2. Hacer click en "Probar Conexión"
3. Si falla, verificar que el backend esté en `http://localhost:7003`

## 🛠️ Pasos para solucionar

### Paso 1: Verificar el backend
```bash
cd backend
dotnet run
```

### Paso 2: Probar conectividad
1. Abrir `test-backend.html` en el navegador
2. Hacer click en "Probar Conexión"
3. Si funciona, hacer click en "Crear Registro de Prueba"
4. Usar el ID generado para probar "Cambiar Estado"

### Paso 3: Verificar autenticación en el frontend
1. Abrir la aplicación Angular
2. Hacer login con: `admin` / `admin123`
3. Ir al módulo de máquinas
4. Abrir DevTools (F12) y revisar la consola

### Paso 4: Diagnóstico avanzado
1. Copiar el contenido de `debug-actions.js`
2. Pegarlo en la consola del navegador cuando esté en el módulo de máquinas
3. Seguir las instrucciones que aparecen

## 🔍 Verificaciones específicas

### En el navegador (DevTools > Console):
```javascript
// Verificar si hay token
console.log('Token:', localStorage.getItem('flexoapp_token'));

// Verificar usuario actual
console.log('Usuario:', localStorage.getItem('flexoapp_user'));

// Probar petición manual
fetch('http://localhost:7003/api/maquinas', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('flexoapp_token')
  }
})
.then(r => r.json())
.then(d => console.log('Datos:', d))
.catch(e => console.error('Error:', e));
```

### En el backend (verificar logs):
Buscar en la consola del backend mensajes como:
- `🔄 Obteniendo datos de máquinas`
- `🎯 PATCH /api/maquinas/{id}/status`
- `❌ Error actualizando estado`

## 🚨 Solución rápida

Si nada de lo anterior funciona, ejecutar estos comandos:

```bash
# 1. Reiniciar el backend
cd backend
dotnet clean
dotnet build
dotnet run

# 2. En otra terminal, reiniciar el frontend
cd Frontend
npm install
ng serve
```

Luego:
1. Ir a `http://localhost:4200`
2. Hacer login con `admin` / `admin123`
3. Ir al módulo de máquinas
4. Probar las acciones

## 📞 Si el problema persiste

1. Revisar los logs del backend en la consola
2. Revisar los errores del frontend en DevTools > Console
3. Usar el archivo `test-backend.html` para probar la conectividad
4. Ejecutar el script `debug-actions.js` en la consola del navegador

El código está correctamente implementado, por lo que el problema es de configuración o conectividad, no de lógica de programación.