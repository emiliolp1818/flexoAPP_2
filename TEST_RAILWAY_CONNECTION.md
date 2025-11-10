# 🧪 Test de Conexión Railway PostgreSQL

## Opción 1: Test desde tu Computadora (Recomendado)

### Requisitos
- Tener `psql` instalado (PostgreSQL client)

### Windows
```powershell
# Instalar PostgreSQL client
winget install PostgreSQL.PostgreSQL

# O descargar desde: https://www.postgresql.org/download/windows/
```

### Probar Conexión

```bash
# Reemplaza con tus credenciales de Railway
psql "postgresql://PGUSER:PGPASSWORD@tramway.proxy.rlwy.net:53339/railway"
```

**Si conecta exitosamente:**
```
railway=> 
```
✅ Las credenciales son correctas

**Si falla:**
```
psql: error: connection to server failed: password authentication failed
```
❌ Las credenciales están mal

## Opción 2: Test desde Railway Dashboard

1. Ve a Railway.app
2. Abre tu servicio PostgreSQL
3. Click en **Connect**
4. Debería mostrarte un botón para abrir una terminal
5. Si conecta, las credenciales son correctas

## Opción 3: Verificar Variables en Railway

### Paso a Paso con Capturas

1. **Abrir Railway Dashboard**
   - Ve a https://railway.app
   - Login con tu cuenta

2. **Seleccionar Proyecto**
   - Click en tu proyecto
   - Deberías ver un servicio "PostgreSQL"

3. **Abrir Servicio PostgreSQL**
   - Click en el servicio PostgreSQL
   - Se abrirá el panel del servicio

4. **Ver Variables**
   - Click en la tab **"Variables"**
   - Verás una lista de variables

5. **Copiar Credenciales**
   
   Busca estas variables y cópialas EXACTAMENTE:
   
   ```
   PGHOST = ?
   PGPORT = ?
   PGUSER = ?
   PGPASSWORD = ?
   PGDATABASE = ?
   ```

6. **Construir URL**
   
   Usa este formato:
   ```
   postgresql://PGUSER:PGPASSWORD@PGHOST:PGPORT/PGDATABASE
   ```

## Opción 4: Usar Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Ver variables
railway variables

# Conectar a PostgreSQL
railway connect postgres
```

## 🔍 Qué Buscar

### Variables Correctas
```
✅ PGHOST = tramway.proxy.rlwy.net
✅ PGPORT = 53339
✅ PGUSER = postgres (o diferente)
✅ PGPASSWORD = (una password larga)
✅ PGDATABASE = railway
```

### Variables Incorrectas
```
❌ PGHOST = localhost
❌ PGPORT = 5432
❌ PGUSER = (vacío)
❌ PGPASSWORD = (vacío)
```

## 🎯 Ejemplo Completo

### Variables en Railway:
```
PGHOST = tramway.proxy.rlwy.net
PGPORT = 53339
PGUSER = postgres
PGPASSWORD = MySecurePass123!
PGDATABASE = railway
```

### DATABASE_URL Construida:
```
postgresql://postgres:MySecurePass123!@tramway.proxy.rlwy.net:53339/railway
```

### Test de Conexión:
```bash
psql "postgresql://postgres:MySecurePass123!@tramway.proxy.rlwy.net:53339/railway"
```

### Si Conecta:
```
psql (14.5)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

railway=> SELECT version();
                                                 version
---------------------------------------------------------------------------------------------------------
 PostgreSQL 14.5 on x86_64-pc-linux-gnu, compiled by gcc (Debian 10.2.1-6) 10.2.1 20210110, 64-bit
(1 row)

railway=> \dt
         List of relations
 Schema |     Name      | Type  |  Owner
--------+---------------+-------+----------
 public | Users         | table | postgres
 public | designs       | table | postgres
(2 rows)
```

✅ **Conexión exitosa!**

## 📝 Reporte de Diagnóstico

Completa esto y compártelo si necesitas ayuda:

```
=== DIAGNÓSTICO RAILWAY POSTGRESQL ===

1. ¿Puedes ver el servicio PostgreSQL en Railway?
   [ ] Sí  [ ] No

2. ¿Puedes ver la tab "Variables"?
   [ ] Sí  [ ] No

3. ¿Qué variables ves? (marca las que aparecen)
   [ ] PGHOST
   [ ] PGPORT
   [ ] PGUSER
   [ ] PGPASSWORD
   [ ] PGDATABASE
   [ ] DATABASE_URL

4. Valor de PGUSER (sin revelar password):
   PGUSER = _____________

5. ¿El servicio PostgreSQL está activo?
   [ ] Sí (verde)  [ ] No (gris/pausado)

6. ¿Probaste conectar con psql?
   [ ] Sí, conectó
   [ ] Sí, falló
   [ ] No tengo psql

7. Mensaje de error (si aplica):
   _________________________________

=== FIN DIAGNÓSTICO ===
```

## 🚨 Problemas Comunes

### Problema 1: No veo la tab "Variables"
**Solución:** Click en el servicio PostgreSQL primero

### Problema 2: Las variables están vacías
**Solución:** El servicio puede estar pausado. Actívalo en Settings

### Problema 3: PGUSER no es "postgres"
**Solución:** Usa el valor exacto que aparece en PGUSER

### Problema 4: Password tiene caracteres especiales
**Solución:** URL-encode los caracteres especiales:
- `@` → `%40`
- `#` → `%23`
- `/` → `%2F`
- `:` → `%3A`
- `&` → `%26`

### Problema 5: "connection refused"
**Solución:** Verifica que PGHOST y PGPORT sean correctos

### Problema 6: "password authentication failed"
**Solución:** Verifica PGUSER y PGPASSWORD exactos

---

**Siguiente paso:** Una vez que confirmes que puedes conectar con `psql`, usa esas MISMAS credenciales en Render.
