# Conexión a Base de Datos flexoBD

## ✅ Configuración Actualizada

La aplicación ahora está configurada para conectarse a tu base de datos MySQL existente.

## 🔧 Configuración Actual

```
Servidor: localhost
Puerto: 3306
Base de datos: flexoBD
Usuario: root
Contraseña: 12345
```

## 🚀 Pasos para Configurar

### 1. Crear Tabla CondicionUnica

**Opción A: MySQL Workbench**
1. Abre MySQL Workbench
2. Conecta a localhost con usuario `root` y contraseña `12345`
3. Abre el archivo: `backend/Database/Scripts/create_condicionunica_flexoBD.sql`
4. Ejecuta el script (Ctrl+Shift+Enter)

**Opción B: Línea de comandos**
```bash
mysql -u root -p12345 flexoBD < backend/Database/Scripts/create_condicionunica_flexoBD.sql
```

### 2. Verificar Conexión

```sql
USE flexoBD;
SHOW TABLES;
-- Debe aparecer: condicionunica

SELECT * FROM condicionunica;
-- Debe mostrar 5 registros de prueba
```

### 3. Aplicar Migraciones de Entity Framework

```bash
cd backend

# Si tienes migraciones antiguas, elimínalas
Remove-Item -Recurse -Force Migrations -ErrorAction SilentlyContinue

# Crear nueva migración
dotnet ef migrations add InitialFlexoBD

# Aplicar migración (esto creará las demás tablas)
dotnet ef database update
```

### 4. Iniciar Aplicación

```powershell
.\iniciar-app.ps1
```

O manualmente:

**Terminal 1 - Backend:**
```bash
cd backend
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
ng serve
```

## 📋 Tablas que se Crearán

Entity Framework creará automáticamente estas tablas en `flexoBD`:

1. `Users` - Usuarios del sistema
2. `designs` - Diseños
3. `maquinas` - Máquinas
4. `pedidos` - Pedidos
5. `machine_programs` - Programas de máquina
6. `Activities` - Registro de actividades
7. `condicionunica` - Condición única (creada manualmente)

## ✅ Verificación

### 1. Backend se conecta
```bash
cd backend
dotnet run
```

Debes ver en los logs:
```
🔌 Using LOCAL MySQL connection
🔌 Connection: Server=localhost;Port=3306;Database=flexoBD;User=root;Password=***
✅ MySQL Local Database configured
```

### 2. Swagger funciona
Abre: http://localhost:7003/swagger

### 3. Frontend se conecta
```bash
cd Frontend
ng serve
```

Abre: http://localhost:4200

### 4. Probar endpoint de CondicionUnica
```
GET http://localhost:7003/api/condicion-unica/test
```

Debe retornar:
```json
{
  "message": "Condicion Unica Controller is working",
  "timestamp": "2025-11-10T...",
  "status": "OK"
}
```

## 🆘 Troubleshooting

### Error: "Access denied for user 'root'"
Verifica que la contraseña sea correcta:
```bash
mysql -u root -p12345
```

### Error: "Unknown database 'flexoBD'"
Verifica que la base de datos existe:
```sql
SHOW DATABASES;
```

Si no existe, créala:
```sql
CREATE DATABASE flexoBD CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Table 'flexoBD.condicionunica' doesn't exist"
Ejecuta el script:
```bash
mysql -u root -p12345 flexoBD < backend/Database/Scripts/create_condicionunica_flexoBD.sql
```

### Error: "Unable to connect to MySQL server"
Verifica que MySQL esté corriendo:
```bash
net start MySQL80
```

## 📊 Estructura de la Base de Datos

```
flexoBD/
├── Users                 (Entity Framework)
├── designs              (Entity Framework)
├── maquinas             (Entity Framework)
├── pedidos              (Entity Framework)
├── machine_programs     (Entity Framework)
├── Activities           (Entity Framework)
└── condicionunica       (Manual)
```

## 🎯 URLs de la Aplicación

- **Backend:** http://localhost:7003
- **Frontend:** http://localhost:4200
- **Swagger:** http://localhost:7003/swagger
- **API:** http://localhost:7003/api

## 📝 Credenciales por Defecto

Después de aplicar las migraciones, puedes crear un usuario admin:

```sql
USE flexoBD;

-- El usuario se creará automáticamente al iniciar la aplicación
-- Usuario: admin
-- Contraseña: admin123
```

## ✅ Checklist

- [ ] MySQL corriendo en localhost:3306
- [ ] Base de datos `flexoBD` existe
- [ ] Tabla `condicionunica` creada
- [ ] Migraciones de EF aplicadas
- [ ] Backend compila sin errores
- [ ] Backend se conecta a MySQL
- [ ] Swagger carga correctamente
- [ ] Frontend se conecta al backend
- [ ] Login funciona
- [ ] Módulo CondicionUnica funciona

---

**¡Listo!** La aplicación está configurada para usar tu base de datos `flexoBD`.

Para iniciar: `.\iniciar-app.ps1`
