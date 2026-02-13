# Instrucciones para Probar los Selectores de Anilox

## Estado Actual
✅ Backend corriendo correctamente
✅ Endpoint `/api/anilox/bcm/{bcm}` funcionando
✅ Frontend actualizado para usar BCM

## Pasos para Probar

### 1. Abrir la Consola del Navegador
- Presiona **F12**
- Ve a la pestaña **Console**
- Limpia la consola (botón 🚫 o Ctrl+L)

### 2. Ir al Módulo de Máquinas
- Navega al módulo de **Máquinas**
- Selecciona cualquier máquina (11-21)

### 3. Expandir una Fila de Colores
- Busca un programa que tenga colores
- Haz click en el botón de **paleta** (icono de paleta con número)
- La fila se expandirá mostrando los colores

### 4. Seleccionar un BCM
- En el primer color, verás tres selectores:
  1. **Lineatura** (en realidad BCM)
  2. **Volumen** (deshabilitado hasta que selecciones BCM)
  3. **Kilos** (input de texto)

- Haz click en el selector de **Lineatura**
- Deberías ver opciones: **80 BCM, 140 BCM, 200 BCM, 275 BCM, 360 BCM, 400 BCM**
- Selecciona **140 BCM**

### 5. Verificar los Logs

Después de seleccionar 140 BCM, deberías ver estos logs en la consola:

```
🔵 onLineaturaChange llamado - BCM: 140, Color: 1, OT SAP: [número de OT]
🔵 Key generada: [OT]-0
🔵 Datos actuales para esta key: {lineatura: null, anilox: null, kilos: null}
✅ BCM actualizado en selectedAniloxData
📊 Cargando anilox para BCM 140...
📊 ¿Anilox ya cargados para este BCM? false
🔵 Anilox NO cargados, llamando a loadAniloxByLineatura...
🔵 loadAniloxByLineatura - Iniciando carga para BCM: 140
🔵 Llamando a aniloxService.getByBCM(140)...
🔵 AniloxService.getByBCM - URL: http://localhost:10000/api/anilox/bcm/140
✅ Respuesta recibida del servicio: [array de anilox]
✅ Cantidad de anilox recibidos: 3
📊 Anilox cargados para BCM 140: [...]
✅ BCM 140 seleccionado para color 1
```

### 6. Verificar el Selector de Volumen

Después de seleccionar el BCM:
- El selector de **Volumen** debería habilitarse
- Haz click en el selector de **Volumen**
- Deberías ver opciones como:
  - **1165 - 8.30 cm³/m²**
  - **1166 - 7.90 cm³/m²**
  - **1178 - 12.50 cm³/m²**

### 7. Seleccionar un Volumen

- Selecciona cualquier volumen
- Deberías ver este log:
```
✅ Anilox [código] seleccionado para color 1
```

### 8. Ingresar Kilos

- En el campo de **Kilos**, ingresa un número (por ejemplo, 50)
- Presiona Enter o haz click fuera del campo
- Deberías ver este log:
```
✅ 50 kg seleccionados para color 1
```

## Problemas Comunes

### El selector de BCM no muestra opciones
**Causa**: El array de lineaturas no se cargó
**Solución**: Verifica en la consola que `lineaturas()` retorne [80, 140, 200, 275, 360, 400]

### El selector de Volumen no se habilita
**Causa**: El BCM no se guardó correctamente
**Solución**: Verifica los logs de `onLineaturaChange` para ver si se ejecutó

### El selector de Volumen está vacío
**Causa**: No hay anilox para ese BCM en la base de datos
**Solución**: 
1. Verifica que la tabla `anilox` tenga datos ejecutando:
   ```sql
   SELECT * FROM anilox WHERE bcm = 140;
   ```
2. Si no hay datos, ejecuta el script `backend/Database/Scripts/09_CREATE_ANILOX_TABLE.sql`

### Error 401 en la petición HTTP
**Causa**: No estás autenticado
**Solución**: Cierra sesión y vuelve a iniciar sesión

### Error 500 en la petición HTTP
**Causa**: Error en el backend
**Solución**: Verifica los logs del backend en `backend/logs/flexoapp-20260212.log`

## Datos de Ejemplo en la Base de Datos

Para BCM 140, deberías tener estos anilox:
- Código 1165, Volumen 8.30 cm³/m²
- Código 1166, Volumen 7.90 cm³/m²
- Código 1178, Volumen 12.50 cm³/m²
- Código 1246, Volumen 9.40 cm³/m²
- Código 1261, Volumen 9.70 cm³/m²

Para BCM 200, deberías tener estos anilox:
- Código 1175, Volumen 6.60 cm³/m²
- Código 1176, Volumen 6.50 cm³/m²
- Código 1179, Volumen 7.20 cm³/m²
- Código 1182, Volumen 9.20 cm³/m²
- Código 1262, Volumen 6.80 cm³/m²
- Código 1263, Volumen 5.70 cm³/m²

## Siguiente Paso

Una vez que hayas probado y funcione correctamente, avísame para:
1. Guardar los datos seleccionados en la base de datos
2. Cargar los datos guardados cuando se abra la fila de colores
3. Implementar la funcionalidad completa de gestión de anilox por color
