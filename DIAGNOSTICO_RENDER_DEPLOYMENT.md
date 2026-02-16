# Diagnóstico y Solución - Despliegue en Render

## Cambios Realizados

### 1. Corrección de Puerto en appsettings.Production.json
**Problema**: El puerto configurado (8080) no coincidía con el puerto de Render (10000)

**Solución**:
```json
// ANTES
"Urls": "http://0.0.0.0:8080",

// DESPUÉS
"Urls": "http://0.0.0.0:10000",
```

### 2. Verificación de Configuración

✅ **Dockerfile** - Correcto (puerto 10000)
✅ **render.yaml** - Correcto (puerto 10000)
✅ **Program.cs** - Correcto (lee variable PORT)
✅ **CORS** - Configurado para Render
✅ **Límites de archivo** - 500MB configurados

## Pasos para Verificar el Despliegue

### 1. Verificar que Render detecte los cambios
```bash
# En el dashboard de Render:
1. Ir a tu servicio "flexoapp-backend"
2. Verificar que aparezca un nuevo deploy automático
3. Esperar a que termine el build (5-10 minutos)
```

### 2. Verificar los Logs
```bash
# En Render Dashboard > Logs, deberías ver:
✅ "Now listening on: http://[::]:10000"
✅ "Application started. Press Ctrl+C to shut down."
✅ "Hosting environment: Production"
```

### 3. Probar el Health Check
```bash
# Abrir en el navegador:
https://flexoapp-backend.onrender.com/health

# Deberías ver:
{
  "status": "healthy",
  "timestamp": "2024-...",
  "message": "FlexoAPP Enhanced API Health Check - Railway Edition",
  "database": "MySQL Connected (Railway)",
  ...
}
```

### 4. Probar la Importación de Excel

#### Opción A: Archivo Pequeño (Prueba)
1. Crear un Excel con 2-3 hojas
2. Cada hoja con 10-20 filas
3. Intentar importar desde el frontend

#### Opción B: Archivo Grande (Producción)
1. Si el archivo tiene más de 100 filas por hoja
2. Considerar dividirlo en archivos más pequeños
3. O esperar a implementar procesamiento por lotes

## Problemas Conocidos y Soluciones

### Problema 1: Error 500 en Importación
**Causa**: Timeout o memoria insuficiente en plan Free de Render

**Soluciones**:
1. **Inmediata**: Dividir el Excel en archivos más pequeños
2. **Corto plazo**: Upgrade a plan Starter ($7/mes)
3. **Largo plazo**: Implementar procesamiento asíncrono

### Problema 2: Base de Datos Desconectada
**Síntoma**: Error "MySQL Disconnected" en /health

**Solución**:
```bash
# Verificar en Railway:
1. Ir a tu proyecto en Railway
2. Verificar que la base de datos esté activa
3. Verificar que la IP de Render esté permitida
4. Revisar la cadena de conexión en Render
```

### Problema 3: CORS Errors
**Síntoma**: Error "Access-Control-Allow-Origin" en el navegador

**Solución**: Ya está configurado en Program.cs para permitir:
- *.onrender.com
- localhost (desarrollo)
- IPs de red local

## Monitoreo Post-Despliegue

### Verificar cada 5 minutos durante la primera hora:

1. **Health Check**
   ```bash
   curl https://flexoapp-backend.onrender.com/health
   ```

2. **Logs de Render**
   - Buscar errores o warnings
   - Verificar que no haya reinicios automáticos

3. **Pruebas Funcionales**
   - Login
   - Cargar máquinas
   - Importar Excel pequeño

## Configuración Recomendada para Producción

### Plan Render Starter ($7/mes)
- 512MB RAM garantizados
- Sin timeout de 30 segundos
- Mejor rendimiento
- Soporte prioritario

### Variables de Entorno Críticas
```bash
ASPNETCORE_ENVIRONMENT=Production
PORT=10000
ASPNETCORE_URLS=http://+:10000
ConnectionStrings__DefaultConnection=<tu-cadena-mysql>
JWT_SECRET_KEY=<tu-secret-key>
```

## Troubleshooting Rápido

### Si el backend no inicia:
```bash
# 1. Ver logs de Render
# 2. Buscar línea "Now listening on:"
# 3. Si no aparece, revisar:
#    - Dockerfile
#    - appsettings.Production.json
#    - Variables de entorno
```

### Si la importación falla:
```bash
# 1. Ver logs en el momento del error
# 2. Buscar stack trace completo
# 3. Verificar:
#    - Tamaño del archivo
#    - Número de hojas
#    - Formato de las columnas
```

### Si hay errores de base de datos:
```bash
# 1. Verificar conexión desde Railway
# 2. Probar query manual en Railway
# 3. Verificar timeout de conexión
# 4. Revisar pool de conexiones
```

## Próximos Pasos

1. ✅ Cambios subidos a Git (rama render)
2. ⏳ Esperar despliegue automático en Render
3. ⏳ Verificar health check
4. ⏳ Probar importación con archivo pequeño
5. ⏳ Monitorear logs por 1 hora
6. ⏳ Probar todas las funcionalidades

## Contacto y Soporte

- **Render Status**: https://status.render.com/
- **Render Docs**: https://render.com/docs
- **Railway Status**: https://railway.app/status

## Notas Importantes

⚠️ **Plan Free de Render**:
- Se duerme después de 15 minutos de inactividad
- Primer request tarda 30-60 segundos en despertar
- Timeout de 30 segundos para requests
- 512MB RAM compartidos

💡 **Recomendación**: Para producción real, considerar plan Starter

🔍 **Monitoreo**: Configurar alertas en Render para:
- Errores 500
- Uso de memoria > 80%
- Tiempo de respuesta > 5 segundos
- Reinicios automáticos
