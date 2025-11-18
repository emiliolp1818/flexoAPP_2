# 🚀 Desplegar FlexoAPP Frontend en Vercel

## 📋 Pasos para Desplegar

### 1. Instalar Vercel CLI

Abre PowerShell y ejecuta:

```powershell
npm install -g vercel
```

### 2. Ir a la carpeta del Frontend

```powershell
cd Frontend
```

### 3. Iniciar sesión en Vercel

```powershell
vercel login
```

Se abrirá tu navegador para que inicies sesión con:
- GitHub
- GitLab
- Bitbucket
- Email

**Recomendación:** Usa GitHub (la misma cuenta donde está tu repositorio)

### 4. Desplegar en Vercel

```powershell
vercel
```

Vercel te hará algunas preguntas. Responde así:

**? Set up and deploy "~\Frontend"?**
```
Y (Yes)
```

**? Which scope do you want to deploy to?**
```
Selecciona tu cuenta (usa las flechas ↑↓ y Enter)
```

**? Link to existing project?**
```
N (No)
```

**? What's your project's name?**
```
flexoapp
```
(o el nombre que prefieras)

**? In which directory is your code located?**
```
./
```
(presiona Enter para usar el directorio actual)

**? Want to modify these settings?**
```
Y (Yes)
```

**? Which settings would you like to overwrite?**
```
Selecciona:
- Build Command
- Output Directory
```
(usa Espacio para seleccionar, Enter para confirmar)

**? What's your Build Command?**
```
npm run build -- --configuration=railway
```

**? What's your Output Directory?**
```
dist/flexoapp/browser
```
(o `dist/flexoapp` si tu versión de Angular es anterior)

**? What's your Development Command?**
```
ng serve
```

### 5. Esperar el Despliegue

Vercel compilará y desplegará tu aplicación. Verás algo como:

```
🔗  Preview: https://flexoapp-xxxxx.vercel.app
✅  Production: https://flexoapp.vercel.app
```

### 6. ¡Listo!

Tu aplicación está en línea en:
```
https://flexoapp-xxxxx.vercel.app
```

---

## 🔄 Actualizar el Despliegue

Cada vez que hagas cambios:

### Opción 1: Despliegue Automático (Recomendado)

1. Haz commit y push a GitHub:
```powershell
git add .
git commit -m "feat: nuevos cambios"
git push
```

2. Vercel detectará automáticamente los cambios y redesplegará

### Opción 2: Despliegue Manual

```powershell
cd Frontend
vercel --prod
```

---

## ⚙️ Configuración Adicional en Vercel

### Agregar Dominio Personalizado

1. Ve a tu proyecto en https://vercel.com
2. Click en "Settings"
3. Click en "Domains"
4. Agrega tu dominio personalizado

### Variables de Entorno (si las necesitas)

1. Ve a tu proyecto en https://vercel.com
2. Click en "Settings"
3. Click en "Environment Variables"
4. Agrega las variables necesarias

---

## 🔐 Actualizar CORS en Backend

Una vez que tengas la URL de Vercel, actualiza el backend para permitir peticiones desde esa URL:

1. Abre `backend/Program.cs`
2. Busca la sección CORS
3. Agrega tu URL de Vercel:

```csharp
policy.WithOrigins(
    "http://localhost:4200",
    "https://flexoapp-xxxxx.vercel.app", // Tu URL de Vercel
    "https://flexoapp2-production.up.railway.app"
)
```

4. Haz commit y push a la rama `railway`:

```powershell
git add .
git commit -m "fix: Agregar URL de Vercel a CORS"
git push
```

Railway redesplegará automáticamente el backend.

---

## 🧪 Probar la Aplicación

1. Abre la URL de Vercel en tu navegador
2. Deberías ver la página de login de FlexoAPP
3. Inicia sesión con:
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## 🐛 Solución de Problemas

### Error: "Command not found: vercel"

**Solución:**
```powershell
npm install -g vercel
```

### Error: "Build failed"

**Causa:** Error en la compilación de Angular

**Solución:**
1. Compila localmente para ver el error:
```powershell
cd Frontend
npm run build -- --configuration=railway
```
2. Corrige los errores
3. Vuelve a desplegar

### Error: "Cannot connect to backend"

**Causa:** CORS no configurado o backend no funcionando

**Solución:**
1. Verifica que el backend esté activo: https://flexoapp2-production.up.railway.app/health
2. Agrega la URL de Vercel al CORS del backend (ver arriba)

### Error: "404 Not Found" al recargar página

**Causa:** Vercel no está redirigiendo correctamente las rutas de Angular

**Solución:**
El archivo `vercel.json` ya está configurado para manejar esto. Si persiste:
1. Ve a Vercel Dashboard
2. Settings → Rewrites
3. Agrega: Source: `/*` → Destination: `/index.html`

---

## 📊 Comandos Útiles

### Ver logs del despliegue:
```powershell
vercel logs
```

### Ver lista de despliegues:
```powershell
vercel ls
```

### Eliminar un despliegue:
```powershell
vercel rm [deployment-url]
```

### Ver información del proyecto:
```powershell
vercel inspect
```

---

## ✅ Checklist

- [ ] Vercel CLI instalado
- [ ] Sesión iniciada en Vercel
- [ ] Proyecto desplegado
- [ ] URL de Vercel obtenida
- [ ] CORS actualizado en backend
- [ ] Aplicación probada y funcionando
- [ ] Login exitoso con admin/admin123

---

## 🎯 Próximos Pasos

1. **Configura un dominio personalizado** (opcional)
2. **Configura despliegue automático** desde GitHub
3. **Agrega analytics** en Vercel Dashboard
4. **Configura notificaciones** de despliegue

---

## 📚 Recursos

- [Vercel Documentation](https://vercel.com/docs)
- [Angular on Vercel](https://vercel.com/guides/deploying-angular-with-vercel)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
