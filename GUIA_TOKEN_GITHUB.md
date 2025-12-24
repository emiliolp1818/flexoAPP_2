# 🔐 GUÍA: Generar Token de GitHub y Hacer Push

**Repositorio:** https://github.com/emiliolp1818/flexoAPP_2.git  
**Usuario:** emiliolp1818  
**Fecha:** 21 de Diciembre de 2025

---

## 📋 PASO 1: Generar Personal Access Token (PAT)

### 1.1 Ir a Configuración de GitHub
1. Ve a: **https://github.com/settings/tokens**
   
   O sigue esta ruta:
   - Haz clic en tu **foto de perfil** (esquina superior derecha)
   - Selecciona **Settings**
   - En el menú izquierdo, baja hasta **Developer settings**
   - Haz clic en **Personal access tokens**
   - Selecciona **Tokens (classic)**

### 1.2 Generar Nuevo Token
1. Haz clic en **"Generate new token"**
2. Selecciona **"Generate new token (classic)"**

### 1.3 Configurar el Token
Completa los siguientes campos:

**Note (Nombre del token):**
```
FlexoAPP Token - Desktop
```

**Expiration (Expiración):**
```
90 days (o el tiempo que prefieras)
```

**Select scopes (Permisos):**
Marca las siguientes casillas:
- ✅ **repo** (Full control of private repositories)
  - ✅ repo:status
  - ✅ repo_deployment
  - ✅ public_repo
  - ✅ repo:invite
  - ✅ security_events

### 1.4 Generar y Copiar Token
1. Baja hasta el final y haz clic en **"Generate token"**
2. **¡IMPORTANTE!** Copia el token inmediatamente
   - Se verá algo como: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Solo se mostrará UNA VEZ**
   - Guárdalo en un lugar seguro (Notepad, etc.)

---

## 📋 PASO 2: Configurar Git con el Token

### Opción A: Usar el Token Directamente (Recomendado)

Abre PowerShell o CMD y ejecuta:

```powershell
# Navega a tu proyecto
cd "c:\Users\emili\Desktop\proyecto flexospring\flexoAPP_localhost"

# Hacer push usando el token
git push https://TU_TOKEN_AQUI@github.com/emiliolp1818/flexoAPP_2.git main
```

**Ejemplo:**
```powershell
git push https://ghp_1234567890abcdefghijklmnopqrstuvwxyz@github.com/emiliolp1818/flexoAPP_2.git main
```

### Opción B: Configurar Credential Manager (Más Permanente)

```powershell
# Configurar credential helper
git config --global credential.helper manager-core

# Hacer push (te pedirá credenciales)
git push origin main
```

Cuando te pida credenciales:
- **Username:** emiliolp1818
- **Password:** [PEGA TU TOKEN AQUÍ]

---

## 📋 PASO 3: Verificar el Push

### 3.1 Verificar en Terminal
Deberías ver algo como:

```
Enumerating objects: 150, done.
Counting objects: 100% (150/150), done.
Delta compression using up to 8 threads
Compressing objects: 100% (100/100), done.
Writing objects: 100% (103/103), 50.00 KiB | 5.00 MiB/s, done.
Total 103 (delta 50), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (50/50), completed with 20 local objects.
To https://github.com/emiliolp1818/flexoAPP_2.git
   abc1234..8c3dcea  main -> main
```

### 3.2 Verificar en GitHub
1. Ve a: **https://github.com/emiliolp1818/flexoAPP_2**
2. Deberías ver el commit más reciente:
   - "🧹 Limpieza y reorganización completa del backend"
   - Fecha: hace unos segundos
   - 103 archivos modificados

---

## 🔒 SEGURIDAD DEL TOKEN

### ✅ Buenas Prácticas
- ✅ Guarda el token en un lugar seguro
- ✅ No lo compartas con nadie
- ✅ No lo subas a repositorios públicos
- ✅ Usa tokens con permisos mínimos necesarios
- ✅ Renueva el token antes de que expire

### ⚠️ Si Pierdes el Token
1. Ve a: https://github.com/settings/tokens
2. Elimina el token antiguo
3. Genera uno nuevo
4. Actualiza tu configuración local

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Authentication failed"
**Solución:** Verifica que copiaste el token correctamente (sin espacios)

### Error: "Permission denied"
**Solución:** Asegúrate de que el token tiene permisos de "repo"

### Error: "Repository not found"
**Solución:** Verifica que el repositorio existe y tienes acceso

### El token no funciona
**Solución:** 
1. Genera un nuevo token
2. Asegúrate de marcar el scope "repo"
3. Copia el token completo (empieza con `ghp_`)

---

## 📝 COMANDO FINAL LISTO PARA USAR

Una vez que tengas tu token, ejecuta este comando (reemplaza TU_TOKEN):

```powershell
cd "c:\Users\emili\Desktop\proyecto flexospring\flexoAPP_localhost"
git push https://TU_TOKEN@github.com/emiliolp1818/flexoAPP_2.git main
```

---

## ✅ CHECKLIST

Antes de hacer push, verifica:

- [ ] Token generado en GitHub
- [ ] Token copiado y guardado
- [ ] Token tiene permisos de "repo"
- [ ] Estás en la carpeta correcta del proyecto
- [ ] El commit ya está hecho localmente
- [ ] Tienes conexión a internet

---

## 🎯 DESPUÉS DEL PUSH EXITOSO

1. ✅ Verifica en GitHub que los cambios están
2. ✅ Revisa el commit en la interfaz web
3. ✅ Comparte el enlace del commit si es necesario
4. ✅ Guarda el token para futuros pushes

---

**¡Listo!** Una vez que generes el token, avísame y te ayudo a hacer el push.
