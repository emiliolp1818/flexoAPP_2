# 🎨 Configuración del Frontend para Railway

## 📋 Resumen

El frontend de FlexoAPP ahora puede conectarse al backend desplegado en Railway usando el archivo de configuración `environment.railway.ts`.

---

## 🔧 Configuración Actual

**Backend en Railway:**
```
https://flexoapp2-production.up.railway.app
```

**Archivo de configuración:**
```
Frontend/src/environments/environment.railway.ts
```

---

## 🚀 Opción 1: Ejecutar Frontend Localmente Conectado a Railway

### Paso 1: Modificar angular.json

Abre `Frontend/angular.json` y busca la sección `configurations` dentro de `build`. Agrega una nueva configuración llamada `railway`:

```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ],
    ...
  },
  "railway": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.railway.ts"
      }
    ],
    "optimization": true,
    "outputHashing": "all",
    "sourceMap": false,
    "namedChunks": false,
    "extractLicenses": true,
    "vendorChunk": false,
    "buildOptimizer": true
  }
}
```

También agrega la configuración en la sección `serve`:

```json
"serve": {
  "configurations": {
    "production": {
      "buildTarget": "Frontend:build:production"
    },
    "railway": {
      "buildTarget": "Frontend:build:railway"
    }
  }
}
```

### Paso 2: Ejecutar el Frontend

```bash
cd Frontend
ng serve --configuration=railway
```

El frontend se ejecutará en `http://localhost:4200` pero se conectará al backend en Railway.

---

## 🌐 Opción 2: Desplegar Frontend en Vercel/Netlify

### Desplegar en Vercel (Recomendado)

1. **Instala Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Compila el frontend para Railway:**
   ```bash
   cd Frontend
   ng build --configuration=railway
   ```

3. **Despliega en Vercel:**
   ```bash
   vercel --prod
   ```

4. **Configura el proyecto:**
   - Build Command: `ng build --configuration=railway`
   - Output Directory: `dist/Frontend`
   - Framework Preset: Angular

### Desplegar en Netlify

1. **Instala Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Compila el frontend:**
   ```bash
   cd Frontend
   ng build --configuration=railway
   ```

3. **Despliega en Netlify:**
   ```bash
   netlify deploy --prod --dir=dist/Frontend
   ```

---

## 🔐 Actualizar CORS en Backend

El backend ya está configurado para aceptar peticiones desde:

✅ `http://localhost:4200` (desarrollo local)
✅ `https://flexoapp2-production.up.railway.app` (Railway)
✅ Dominios de Vercel (`*.vercel.app`)
✅ Dominios de Netlify (`*.netlify.app`)

Si despliegas en otro dominio, actualiza el archivo `backend/Program.cs` en la sección CORS.

---

## 🧪 Probar la Conexión

### 1. Verifica que el backend esté funcionando:

```bash
curl https://flexoapp2-production.up.railway.app/health
```

Deberías ver:
```json
{"status":"healthy"}
```

### 2. Verifica la API:

```bash
curl https://flexoapp2-production.up.railway.app/
```

Deberías ver información de la API.

### 3. Prueba el login desde el frontend:

1. Abre el frontend (local o desplegado)
2. Ve a la página de login
3. Usa las credenciales:
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## 📝 Archivos de Configuración

### environment.ts (Desarrollo Local)
```typescript
apiUrl: 'http://192.168.1.20:7003/api'
```
Conecta al backend local en tu red.

### environment.prod.ts (Producción Local)
```typescript
apiUrl: 'http://localhost:7003/api'
```
Conecta al backend local en localhost.

### environment.railway.ts (Railway)
```typescript
apiUrl: 'https://flexoapp2-production.up.railway.app/api'
```
Conecta al backend desplegado en Railway.

---

## 🐛 Solución de Problemas

### Error: CORS blocked

**Causa:** El dominio del frontend no está permitido en el backend.

**Solución:**
1. Abre `backend/Program.cs`
2. Busca la sección CORS
3. Agrega tu dominio a la lista de orígenes permitidos
4. Haz commit y push a la rama `railway`

### Error: Cannot connect to backend

**Causa:** La URL del backend es incorrecta o el backend no está funcionando.

**Solución:**
1. Verifica que el backend esté activo: `https://flexoapp2-production.up.railway.app/health`
2. Verifica que la URL en `environment.railway.ts` sea correcta
3. Revisa los logs del backend en Railway

### Error: 401 Unauthorized

**Causa:** El token JWT expiró o es inválido.

**Solución:**
1. Cierra sesión y vuelve a iniciar sesión
2. Verifica que las credenciales sean correctas (admin / admin123)

---

## 📊 Comandos Útiles

### Desarrollo local con backend en Railway:
```bash
cd Frontend
ng serve --configuration=railway
```

### Compilar para producción con Railway:
```bash
cd Frontend
ng build --configuration=railway --prod
```

### Ver logs del backend en Railway:
```bash
railway logs
```

### Ejecutar frontend en modo producción local:
```bash
cd Frontend
ng serve --configuration=railway --prod
```

---

## ✅ Checklist de Configuración

- [x] Archivo `environment.railway.ts` creado
- [x] URL del backend configurada: `https://flexoapp2-production.up.railway.app`
- [x] CORS actualizado en el backend
- [x] Backend desplegado y funcionando en Railway
- [ ] Configuración `railway` agregada en `angular.json`
- [ ] Frontend probado localmente con backend en Railway
- [ ] Frontend desplegado en Vercel/Netlify (opcional)

---

## 🎯 Próximos Pasos

1. **Agregar configuración en angular.json** (ver Opción 1)
2. **Probar el frontend localmente** conectado a Railway
3. **Desplegar el frontend** en Vercel o Netlify (opcional)
4. **Configurar dominio personalizado** en Railway (opcional)

---

## 📚 Recursos

- [Documentación de Angular Environments](https://angular.io/guide/build#configuring-application-environments)
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com/)
- [Railway Docs](https://docs.railway.app/)
