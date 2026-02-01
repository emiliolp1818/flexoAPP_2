# Guía de Conexión Móvil - FlexoAPP

## Problema Actual
El dispositivo móvil en `192.168.1.20:4200` no puede conectarse al backend en `192.168.1.14:10000`.

## Error Observado
```
Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
http://192.168.1.14:10000/api/auth/login
```

## Soluciones

### 1. Verificar que el Backend esté Corriendo
```bash
cd backend
dotnet run
```

El backend debe mostrar:
```
🌐 Backend URL: http://localhost:10000
🔌 Listening on: http://0.0.0.0:10000
```

### 2. Verificar Configuración de Kestrel
El backend ya está configurado para escuchar en todas las interfaces (`0.0.0.0`), pero verifica en `backend/Program.cs`:

```csharp
options.ListenAnyIP(int.Parse(port));
```

### 3. Verificar Firewall de Windows
El firewall puede estar bloqueando las conexiones entrantes en el puerto 10000.

**Abrir puerto en Firewall:**
```powershell
# Ejecutar como Administrador
New-NetFirewallRule -DisplayName "FlexoAPP Backend" -Direction Inbound -LocalPort 10000 -Protocol TCP -Action Allow
```

**O manualmente:**
1. Abrir "Windows Defender Firewall"
2. Click en "Configuración avanzada"
3. Click en "Reglas de entrada"
4. Click en "Nueva regla..."
5. Seleccionar "Puerto" → Siguiente
6. TCP, puerto específico: 10000 → Siguiente
7. Permitir la conexión → Siguiente
8. Aplicar a todos los perfiles → Siguiente
9. Nombre: "FlexoAPP Backend" → Finalizar

### 4. Verificar CORS en Backend
El backend ya tiene configuración CORS para IPs locales en `backend/Program.cs`:

```csharp
policy.SetIsOriginAllowed(origin =>
{
    // Permitir IPs de red local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (System.Text.RegularExpressions.Regex.IsMatch(origin, 
        @"https?://(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)\d{1,3}\.\d{1,3}(:\d+)?"))
        return true;
    
    return false;
})
```

**IMPORTANTE:** Después de modificar CORS, debes **reiniciar el backend**.

### 5. Probar Conexión desde Móvil

**Desde el navegador móvil, visita:**
```
http://192.168.1.14:10000/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T..."
}
```

Si esto funciona, el backend está accesible. Si no, el problema es de red/firewall.

### 6. Verificar IP del PC
La IP puede haber cambiado. Verifica la IP actual:

```powershell
ipconfig
```

Busca "Dirección IPv4" en tu adaptador de red activo (WiFi o Ethernet).

Si la IP cambió, actualiza `Frontend/src/environments/environment.ts`:

```typescript
fallbackUrls: [
    'http://localhost:10000/api',
    'http://127.0.0.1:10000/api',
    'http://TU_IP_ACTUAL:10000/api'  // Actualizar aquí
]
```

### 7. Acceder al Frontend desde Móvil

**Opción A: Usar la IP del PC**
```
http://192.168.1.14:4200
```

**Opción B: Usar ng serve con host**
```bash
cd Frontend
ng serve --host 0.0.0.0 --port 4200
```

Luego accede desde el móvil:
```
http://192.168.1.14:4200
```

### 8. Debugging con Eruda
El frontend ya tiene Eruda configurado para debugging móvil. Se carga automáticamente cuando:
- Hostname es `localhost` o `127.0.0.1`
- Hostname empieza con `192.168.`
- URL contiene `?debug=true`

Para ver la consola en móvil:
1. Abre la app en el móvil
2. Toca el ícono de Eruda (esquina inferior derecha)
3. Ve a la pestaña "Console" para ver errores
4. Ve a "Network" para ver las peticiones HTTP

## Checklist de Verificación

- [ ] Backend corriendo en `http://0.0.0.0:10000`
- [ ] Firewall permite conexiones en puerto 10000
- [ ] IP del PC es correcta (`ipconfig`)
- [ ] CORS configurado para IPs locales
- [ ] Backend reiniciado después de cambios CORS
- [ ] `/health` endpoint responde desde móvil
- [ ] Frontend accesible desde móvil
- [ ] Eruda muestra errores detallados

## Comandos Rápidos

**Iniciar Backend:**
```bash
cd backend
dotnet run
```

**Iniciar Frontend (accesible en red):**
```bash
cd Frontend
ng serve --host 0.0.0.0
```

**Verificar IP:**
```powershell
ipconfig | findstr IPv4
```

**Probar conexión desde móvil:**
```
http://192.168.1.14:10000/health
http://192.168.1.14:4200
```

## Notas Adicionales

- El backend debe estar corriendo ANTES de intentar conectar desde el móvil
- Si cambias la configuración CORS, DEBES reiniciar el backend
- Si la IP del PC cambia (DHCP), debes actualizar las URLs en environment.ts
- Eruda solo se carga en desarrollo, no en producción
