# ✅ Checklist de Despliegue - FlexoAPP

Usa este checklist para asegurarte de que todo está configurado correctamente.

## 📋 Pre-Despliegue

### Código y Repositorio
- [ ] Todo el código está commiteado
- [ ] Push a GitHub completado
- [ ] Rama `main` actualizada
- [ ] No hay errores de compilación local
- [ ] `.gitignore` configurado correctamente

### Archivos de Configuración
- [ ] `render.yaml` existe
- [ ] `Dockerfile.backend` existe
- [ ] `environment.prod.ts` configurado
- [ ] `appsettings.Production.json` configurado
- [ ] `.dockerignore` existe

### Verificación Local
- [ ] Backend compila: `cd backend && dotnet build`
- [ ] Frontend compila: `cd Frontend && npm run build:prod`
- [ ] Tests pasan (si existen)
- [ ] No hay warnings críticos

## 🗄️ Base de Datos

### Railway (Recomendado)
- [ ] Cuenta creada en Railway.app
- [ ] Servicio MySQL provisionado
- [ ] Credenciales copiadas
- [ ] Cadena de conexión construida
- [ ] Conexión probada localmente

### Alternativas
- [ ] PlanetScale configurado (si aplica)
- [ ] AWS RDS configurado (si aplica)
- [ ] Otro servicio MySQL configurado

## 🚀 Render - Backend

### Configuración Inicial
- [ ] Cuenta creada en Render.com
- [ ] Repositorio conectado
- [ ] Blueprint aplicado o servicio creado manualmente
- [ ] Tipo de servicio: Web Service
- [ ] Runtime: Docker

### Variables de Entorno
- [ ] `ASPNETCORE_ENVIRONMENT` = Production
- [ ] `ASPNETCORE_URLS` = http://0.0.0.0:7003
- [ ] `DATABASE_URL` = [tu cadena de conexión]
- [ ] `JWT_SECRET_KEY` = [tu clave secreta]
- [ ] `CORS_ORIGINS` = [URL del frontend]

### Verificación
- [ ] Build completado sin errores
- [ ] Servicio en estado "Live"
- [ ] Health check responde: `/health`
- [ ] Swagger accesible (si está habilitado)
- [ ] Logs no muestran errores críticos

## 🎨 Render - Frontend

### Configuración Inicial
- [ ] Servicio creado (Static Site)
- [ ] Repositorio conectado
- [ ] Branch: main
- [ ] Build Command configurado
- [ ] Publish Directory configurado

### Build Command
```bash
cd Frontend && npm install && npm run build:prod
```

### Publish Directory
```
Frontend/dist/flexoapp/browser
```

### Redirects/Rewrites
- [ ] Redirect configurado: `/*` → `/index.html`

### Verificación
- [ ] Build completado sin errores
- [ ] Sitio accesible
- [ ] Assets cargan correctamente (CSS, JS, imágenes)
- [ ] No hay errores 404 en la consola

## 🔗 Integración Frontend-Backend

### URLs Actualizadas
- [ ] `environment.prod.ts` tiene URL correcta del backend
- [ ] URL del backend no tiene "/" al final
- [ ] CORS configurado en backend con URL del frontend
- [ ] Frontend redesplegado después de actualizar URLs

### Pruebas de Conexión
- [ ] Frontend puede hacer peticiones al backend
- [ ] No hay errores CORS en consola
- [ ] Login funciona correctamente
- [ ] Datos se cargan desde el backend

## 🧪 Pruebas Funcionales

### Autenticación
- [ ] Login con admin/admin123 funciona
- [ ] Token se guarda correctamente
- [ ] Refresh token funciona
- [ ] Logout funciona
- [ ] Sesión persiste al recargar

### Funcionalidades Principales
- [ ] Listar diseños funciona
- [ ] Crear diseño funciona
- [ ] Editar diseño funciona
- [ ] Eliminar diseño funciona
- [ ] Listar programas de máquinas funciona
- [ ] Crear programa funciona
- [ ] Listar pedidos funciona
- [ ] Crear pedido funciona

### Tiempo Real (SignalR)
- [ ] Conexión WebSocket establecida
- [ ] Actualizaciones en tiempo real funcionan
- [ ] Reconexión automática funciona

## 🔒 Seguridad

### Credenciales
- [ ] Contraseña de admin cambiada (recomendado)
- [ ] JWT_SECRET_KEY es única y segura
- [ ] Credenciales de BD no están en el código
- [ ] Variables de entorno configuradas correctamente

### CORS
- [ ] Solo orígenes permitidos configurados
- [ ] No se permite `*` en producción
- [ ] HTTPS habilitado (Render lo hace automáticamente)

## 📊 Monitoreo

### Logs
- [ ] Logs del backend revisados
- [ ] Logs del frontend revisados
- [ ] No hay errores críticos
- [ ] Warnings entendidos y documentados

### Performance
- [ ] Tiempo de respuesta aceptable
- [ ] Primera carga < 5 segundos
- [ ] Navegación fluida
- [ ] Sin memory leaks evidentes

### Health Checks
- [ ] `/health` responde correctamente
- [ ] `/health/ready` responde
- [ ] `/health/live` responde
- [ ] Database status es "Connected"

## 📱 Pruebas de Usuario

### Diferentes Navegadores
- [ ] Chrome/Edge funciona
- [ ] Firefox funciona
- [ ] Safari funciona (si aplica)

### Diferentes Dispositivos
- [ ] Desktop funciona
- [ ] Tablet funciona
- [ ] Mobile funciona

### Diferentes Usuarios
- [ ] Admin puede acceder a todo
- [ ] Usuarios normales tienen permisos correctos
- [ ] Usuarios no autenticados son redirigidos

## 📝 Documentación

### URLs de Producción
```
Frontend: https://_____________________.onrender.com
Backend:  https://_____________________.onrender.com
Database: _____________________________________
```

### Credenciales (Guardar en lugar seguro)
```
Admin User: admin
Admin Pass: _______________
DB User:    _______________
DB Pass:    _______________
JWT Secret: _______________
```

## 🎉 Post-Despliegue

### Comunicación
- [ ] Equipo notificado del despliegue
- [ ] URLs compartidas con stakeholders
- [ ] Documentación actualizada
- [ ] Changelog creado

### Backup
- [ ] Backup de base de datos creado
- [ ] Backup de configuración guardado
- [ ] Plan de rollback documentado

### Monitoreo Continuo
- [ ] Configurar alertas (opcional)
- [ ] Revisar logs diariamente
- [ ] Monitorear uso de recursos
- [ ] Planificar actualizaciones

## 🆘 Plan de Contingencia

### Si algo falla:
1. [ ] Revisar logs en Render Dashboard
2. [ ] Verificar variables de entorno
3. [ ] Probar conexión a base de datos
4. [ ] Verificar CORS
5. [ ] Rollback si es necesario

### Contactos de Soporte
- Render: https://render.com/docs
- Railway: https://docs.railway.app
- GitHub: https://github.com/emiliolp1818/flexoAPP_2

## ✅ Despliegue Completado

Fecha: _______________
Desplegado por: _______________
Versión: 2.0.0

**¡Felicidades! Tu aplicación está en producción 🎉**

---

### Próximos Pasos Recomendados:

1. **Monitorear durante 24 horas**
   - Revisar logs regularmente
   - Verificar que no hay errores
   - Confirmar que usuarios pueden acceder

2. **Optimizar Performance**
   - Revisar tiempos de carga
   - Optimizar queries lentas
   - Configurar caching si es necesario

3. **Planificar Mejoras**
   - Recopilar feedback de usuarios
   - Documentar bugs encontrados
   - Planificar próximas features

4. **Considerar Upgrade**
   - Si el tráfico aumenta, considera plan de pago
   - Evaluar necesidad de CDN
   - Considerar base de datos más robusta
