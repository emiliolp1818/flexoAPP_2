# Diagnóstico: Los Volúmenes de Anilox No Se Cargan - RESUELTO

## Problema Identificado
Los selectores de volumen (anilox) no se estaban poblando debido a DOS problemas:

### 1. Error en la Cadena de Conexión (RESUELTO)
El parámetro `ConnectionIdleTimeout=180` en la cadena de conexión no es compatible con la versión de MySql.Data.

**Error:**
```
System.ArgumentException: Option not supported (Parameter 'connectionidletimeout')
```

**Solución Aplicada:**
- Eliminado `ConnectionIdleTimeout=180` de `backend/appsettings.json`
- Backend reiniciado correctamente

### 2. Confusión entre BCM y Lineatura (RESUELTO)
En la base de datos:
- La columna `bcm` contiene valores: 80, 140, 200, 275, 360, 400
- La columna `lineatura` contiene valores: 4, 6, 8, 10, 14, 16

El frontend estaba buscando por `lineatura` cuando debería buscar por `bcm`.

**Solución Aplicada:**
- Creado nuevo endpoint: `GET /api/anilox/bcm/{bcm}`
- Creado nuevo método en servicio: `getByBCM(bcm: number)`
- Actualizado componente para usar BCM en lugar de lineatura
- Actualizado HTML para mostrar "BCM" en lugar de "LPI"

## Cambios Realizados

### Backend
1. `backend/appsettings.json` - Eliminado `ConnectionIdleTimeout`
2. `backend/Controllers/AniloxController.cs` - Agregado endpoint `GetByBCM()`

### Frontend
1. `Frontend/src/app/shared/services/anilox.service.ts` - Agregado método `getByBCM()`
2. `Frontend/src/app/shared/components/machines/machines.ts` - Actualizado para usar BCM
3. `Frontend/src/app/shared/components/machines/machines.html` - Cambiado "LPI" a "BCM"

## Cómo Probar

1. **Reinicia el navegador** para limpiar la caché
2. **Inicia sesión** en la aplicación
3. **Ve al módulo de Máquinas**
4. **Expande una fila de colores** (click en el botón de paleta)
5. **Selecciona un BCM** (80, 140, 200, 275, 360, 400)
6. **Verifica que el selector de volumen se llene** con opciones como "1165 - 8.30 cm³/m²"

## Logs Esperados

```
🔵 onLineaturaChange llamado - BCM: 140, Color: 1, OT SAP: OT123456
🔵 Key generada: OT123456-0
✅ BCM actualizado en selectedAniloxData
📊 Cargando anilox para BCM 140...
🔵 Anilox NO cargados, llamando a loadAniloxByLineatura...
🔵 loadAniloxByLineatura - Iniciando carga para BCM: 140
🔵 Llamando a aniloxService.getByBCM(140)...
🔵 AniloxService.getByBCM - URL: http://localhost:10000/api/anilox/bcm/140
✅ Respuesta recibida del servicio: [...]
✅ Cantidad de anilox recibidos: 3
📊 Anilox cargados para BCM 140: [...]
✅ BCM 140 seleccionado para color 1
```

## Estado Actual
✅ Backend corriendo en http://localhost:10000
✅ Endpoint `/api/anilox/bcm/{bcm}` funcionando
✅ Cadena de conexión corregida
✅ Frontend actualizado para usar BCM

## Próximos Pasos
Prueba la funcionalidad en el navegador y verifica que los volúmenes se carguen correctamente.
