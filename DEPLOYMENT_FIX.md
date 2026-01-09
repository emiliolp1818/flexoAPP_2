# SOLUCIÓN DE PROBLEMAS DE DEPLOYMENT - FLEXOAPP

## Problemas Identificados

### 1. Backend (503 Error)
- ✅ **Configuración de puerto corregida**: 8080 en Dockerfile y render.yaml
- ✅ **Variables de entorno actualizadas**
- ✅ **Conexión MySQL Railway configurada**

### 2. Frontend (404 Error)  
- ✅ **Nombre del servicio actualizado**: `flexoapp-frontend`
- ✅ **Build command corregido**: usa configuración `render`
- ✅ **PublishDir verificado**: `dist/flexoapp`

## Cambios Realizados

### render.yaml
```yaml
services:
  # Backend Service - FlexoAPP API
  - type: web
    name: flexoapp-backend
    env: docker
    dockerfilePath: Dockerfile
    envVars:
      - key: ASPNETCORE_ENVIRONMENT
        value: Production
      - key: ConnectionStrings__DefaultConnection
        value: Server=yamanote.proxy.rlwy.net;Port=38215;Database=railway;User=root;Password=YCNwMkKGvOuIqrUChmdgmnxSwrUpwYPf;AllowUserVariables=True;UseAffectedRows=False;SslMode=Required;ConnectionTimeout=30;
      - key: JWT_SECRET_KEY
        value: FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable
      - key: JwtSettings__SecretKey
        value: FlexoAPP-Super-Secret-Key-2024-Production-Ready-Ultra-Stable
      - key: JwtSettings__Issuer
        value: FlexoAPP
      - key: JwtSettings__Audience
        value: FlexoAPP-Users
      - key: JwtSettings__ExpirationMinutes
        value: 1440
      - key: PORT
        value: 8080
      - key: ASPNETCORE_URLS
        value: http://+:8080
    healthCheckPath: /health
    
  # Frontend Service - Angular App
  - type: static
    name: flexoapp-frontend
    buildCommand: npm ci --include=dev && npx ng build --configuration=render
    publishDir: dist/flexoapp
    rootDir: Frontend
    envVars:
      - key: NODE_ENV
        value: production
      - key: ANGULAR_ENV
        value: render
      - key: API_URL
        value: https://flexoapp-backend.onrender.com/api
```

## Próximos Pasos

### 1. Commit y Push de Cambios
```bash
git add .
git commit -m "fix: Correct port configuration and service names for Render deployment"
git push origin render
```

### 2. Recrear Servicios en Render (Recomendado)
Dado que hay problemas con los servicios actuales, es mejor recrearlos:

#### Backend:
- Eliminar servicio actual: `flexoapp-backend`
- Crear nuevo servicio con configuración corregida
- Usar nombre: `flexoapp-backend`

#### Frontend:
- Eliminar servicio actual: `frontend-f54v`  
- Crear nuevo servicio con configuración corregida
- Usar nombre: `flexoapp-frontend`

### 3. URLs Finales Esperadas
- **Backend**: https://flexoapp-backend.onrender.com
- **Frontend**: https://flexoapp-frontend.onrender.com

### 4. Verificación Post-Deployment
1. **Backend Health Check**: https://flexoapp-backend.onrender.com/health
2. **Backend Root**: https://flexoapp-backend.onrender.com
3. **Frontend**: https://flexoapp-frontend.onrender.com
4. **API Test**: https://flexoapp-backend.onrender.com/api/auth/login

## Troubleshooting

### Si el Backend sigue fallando:
1. Verificar logs en Render Dashboard
2. Comprobar conexión a MySQL Railway
3. Verificar que el puerto 8080 esté configurado correctamente

### Si el Frontend sigue fallando:
1. Verificar que `dist/flexoapp` se genera correctamente
2. Comprobar que Angular build no tenga errores
3. Verificar configuración de `angular.json`

## Comandos de Testing Local

### Backend:
```bash
cd backend
dotnet run
# Debería correr en http://localhost:5000
```

### Frontend:
```bash
cd Frontend
npm run build:render
# Verificar que se genera dist/flexoapp/
```

### Docker (Backend):
```bash
docker build -t flexoapp-test .
docker run -p 8080:8080 flexoapp-test
# Debería correr en http://localhost:8080
```