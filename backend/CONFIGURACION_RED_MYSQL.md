# 🌐 Configuración de Red para FlexoAPP

## 🚨 **PROBLEMA IDENTIFICADO**

El backend está funcionando correctamente en red, pero MySQL no permite conexiones desde otros equipos.

**Error:** `Host 'emilio_pc' is not allowed to connect to this MySQL server`

---

## 🔧 **SOLUCIÓN PASO A PASO**

### **1. Configurar MySQL para Conexiones de Red**

#### **Opción A: MySQL Workbench (Recomendado)**
1. Abrir **MySQL Workbench**
2. Conectarse como **root** con contraseña **12345**
3. Ejecutar los siguientes comandos:

```sql
-- Permitir conexiones desde cualquier IP de la red local
CREATE USER 'root'@'192.168.1.%' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'192.168.1.%' WITH GRANT OPTION;

-- Crear usuario específico para FlexoAPP
CREATE USER 'flexoapp'@'%' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON flexoapp_db.* TO 'flexoapp'@'%';

-- Permitir conexiones desde localhost también
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;

-- Refrescar privilegios
FLUSH PRIVILEGES;

-- Verificar usuarios creados
SELECT user, host FROM mysql.user WHERE user IN ('root', 'flexoapp');
```

#### **Opción B: Línea de Comandos**
```bash
mysql -u root -p12345
```
Luego ejecutar los comandos SQL de arriba.

### **2. Configurar Archivo my.ini (Windows)**

#### **Ubicación del archivo:**
- **Windows:** `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
- **XAMPP:** `C:\xampp\mysql\bin\my.ini`

#### **Modificaciones necesarias:**
```ini
[mysqld]
# Permitir conexiones desde cualquier IP
bind-address = 0.0.0.0

# Puerto MySQL
port = 3306

# Configuraciones de red
max_connections = 200
connect_timeout = 60
wait_timeout = 28800
```

#### **Reiniciar MySQL:**
1. Abrir **Servicios** (services.msc)
2. Buscar **MySQL80** o **MySQL**
3. Click derecho → **Reiniciar**

### **3. Configurar Firewall de Windows**

#### **Automático (Ya ejecutado):**
```batch
netsh advfirewall firewall add rule name="MySQL Server" dir=in action=allow protocol=TCP localport=3306
```

#### **Manual:**
1. Abrir **Firewall de Windows Defender**
2. **Reglas de entrada** → **Nueva regla**
3. **Puerto** → **TCP** → **3306**
4. **Permitir conexión**
5. Aplicar a **Dominio, Privado y Público**
6. Nombre: **MySQL Server**

---

## 🧪 **VERIFICACIÓN**

### **1. Probar Conexión Local**
```bash
mysql -h localhost -u root -p12345 -e "SELECT 'MySQL Local OK' as status;"
```

### **2. Probar Conexión por IP**
```bash
mysql -h 192.168.1.6 -u root -p12345 -e "SELECT 'MySQL Red OK' as status;"
```

### **3. Probar desde Otro Equipo**
```bash
# Desde otro equipo en la red
mysql -h 192.168.1.6 -u root -p12345 -e "SELECT 'Conexión Externa OK' as status;"
```

### **4. Verificar Backend**
```bash
curl http://192.168.1.6:7003/health
```

---

## 📋 **CONFIGURACIÓN ACTUAL DEL SISTEMA**

### **Backend (.NET)**
- ✅ **Puerto:** 7003
- ✅ **IP:** 0.0.0.0 (todas las interfaces)
- ✅ **CORS:** Configurado para red local (192.168.1.x)
- ✅ **Firewall:** No necesario (puerto alto)

### **Frontend (Angular)**
- ✅ **Puerto:** 4200
- ✅ **IP:** 0.0.0.0 (todas las interfaces)
- ✅ **API URL:** http://192.168.1.6:7003/api
- ✅ **Fallback URLs:** Múltiples IPs de red

### **MySQL (Pendiente)**
- ⚠️ **Puerto:** 3306
- ❌ **Permisos:** Solo localhost
- ❌ **Bind Address:** localhost (debe ser 0.0.0.0)
- ✅ **Firewall:** Configurado

---

## 🚀 **COMANDOS DE INICIO**

### **Inicio Completo con Red**
```bash
quick-start.bat
```

### **Solo Backend**
```bash
cd flexoAPP-backent
dotnet run --urls http://0.0.0.0:7003
```

### **Solo Frontend**
```bash
cd flexoAPP-Frontend
ng serve --host 0.0.0.0 --allowed-hosts
```

---

## 🌐 **URLs DE ACCESO**

### **Desde el Servidor (192.168.1.6)**
- **Frontend:** http://localhost:4200 o http://192.168.1.6:4200
- **Backend:** http://localhost:7003 o http://192.168.1.6:7003
- **Swagger:** http://192.168.1.6:7003/swagger

### **Desde Otros Equipos de la Red**
- **Frontend:** http://192.168.1.6:4200
- **Backend:** http://192.168.1.6:7003
- **Swagger:** http://192.168.1.6:7003/swagger

---

## 🔐 **CREDENCIALES**

### **FlexoAPP**
- **Usuario:** admin
- **Contraseña:** admin123

### **MySQL**
- **Usuario:** root
- **Contraseña:** 12345
- **Base de Datos:** flexoapp_db

---

## 🛠️ **SCRIPTS DISPONIBLES**

### **configure-mysql-network.bat**
- Guía paso a paso para configurar MySQL
- Configuración automática del firewall
- Comandos SQL listos para copiar

### **test-network-connectivity.bat**
- Prueba conectividad del backend
- Prueba conectividad de MySQL
- Muestra información de red
- URLs para otros equipos

### **quick-start.bat**
- Inicio completo con soporte de red
- Backend en 0.0.0.0:7003
- Frontend en 0.0.0.0:4200

---

## ⚠️ **PASOS PENDIENTES**

### **CRÍTICO - Configurar MySQL:**
1. ✅ Firewall configurado
2. ❌ **Ejecutar comandos SQL** (crear usuarios de red)
3. ❌ **Modificar my.ini** (bind-address = 0.0.0.0)
4. ❌ **Reiniciar servicio MySQL**

### **Verificación:**
1. Ejecutar `configure-mysql-network.bat`
2. Seguir los pasos mostrados
3. Ejecutar `test-network-connectivity.bat`
4. Probar desde otro equipo

---

## 🎯 **RESULTADO ESPERADO**

Una vez configurado MySQL correctamente:

- ✅ **Backend accesible** desde toda la red
- ✅ **Frontend accesible** desde toda la red  
- ✅ **Base de datos accesible** desde toda la red
- ✅ **Sistema completo funcionando** en red local

---

## 📞 **SOPORTE**

Si persisten problemas:

1. **Verificar IP:** `ipconfig`
2. **Probar ping:** `ping 192.168.1.6`
3. **Verificar puertos:** `netstat -an | findstr 7003`
4. **Revisar logs:** Salida de `dotnet run`

---

**🌐 FlexoAPP configurado para acceso en red local**

*Configuración de red actualizada - $(Get-Date)*