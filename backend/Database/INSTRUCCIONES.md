# INSTRUCCIONES PARA CONFIGURAR EL MODULO DE MAQUINAS

## LIMPIEZA COMPLETADA

Se han eliminado todos los archivos obsoletos del sistema.

### Archivos Eliminados (Obsoletos):
- MachinesController.cs
- MachineProgramsController.cs
- MachineProgramRepository.cs
- IMachineProgramRepository.cs
- MachineProgramService.cs
- IMachineProgramService.cs
- MachineProgram.cs
- MachineProgramDto.cs
- MachineProgramHub.cs
- create_machine_programs_table.sql

### Archivos Activos (En Uso):
- MaquinasController.cs - Controlador principal
- MaquinaRepository.cs - Repositorio
- IMaquinaRepository.cs - Interfaz del repositorio
- MaquinaService.cs - Servicio de negocio
- IMaquinaService.cs - Interfaz del servicio
- Maquina.cs - Entidad principal
- MaquinaDto.cs - DTOs
- 01_create_maquinas_table.sql - Script SQL limpio

---

## PASO 1: CREAR LA TABLA EN MYSQL

### Opcion A: Usando MySQL Workbench (Recomendado)

1. Abre MySQL Workbench
2. Conectate a tu servidor local (localhost:3306)
3. Selecciona la base de datos flexoapp_bd
4. Abre el archivo backend/Database/01_create_maquinas_table.sql
5. Ejecuta el script completo
6. Verifica que aparezca el mensaje: Tabla maquinas creada exitosamente

### Opcion B: Copiar y pegar en MySQL

1. Abre el archivo backend/Database/01_create_maquinas_table.sql
2. Copia todo el contenido
3. Pegalo en tu cliente MySQL
4. Ejecuta el script

---

## PASO 2: VERIFICAR LA TABLA

Ejecuta esta consulta en MySQL:

```sql
USE flexoapp_bd;
DESCRIBE maquinas;
SELECT COUNT(*) as total_registros FROM maquinas;
```

Deberias ver:
- 18 columnas en la tabla
- articulo como PRIMARY KEY
- 0 registros (tabla vacia)

---

## PASO 3: COMPILAR Y EJECUTAR EL BACKEND

```bash
cd backend
dotnet clean
dotnet build
dotnet run
```

El backend deberia iniciar en:
- HTTP: http://localhost:7003
- Swagger: http://localhost:7003/swagger

---

## PASO 4: PROBAR EL MODULO DE MAQUINAS

### Endpoints Disponibles:

1. Obtener todas las maquinas
GET http://localhost:7003/api/maquinas

2. Crear registro de prueba
POST http://localhost:7003/api/maquinas/test

3. Actualizar estado de una maquina
PATCH http://localhost:7003/api/maquinas/{articulo}/status

4. Obtener programas por maquina
GET http://localhost:7003/api/maquinas/machine/15

---

## PASO 5: CARGAR ARCHIVO EXCEL

El archivo debe tener estas columnas en este orden:

| Columna | Nombre | Ejemplo |
|---------|--------|---------|
| A | MQ | 15 |
| B | ARTICULO F | F204567 |
| C | OT SAP | OT123456 |
| D | CLIENTE | ABSORBENTES DE COLOMBIA S.A |
| E | REFERENCIA | REF-001 |
| F | TD | TD1 |
| G | N COLORES | 4 |
| H | KILOS | 1500.50 |
| I | FECHA TINTAS EN MAQUINA | 14/11/2024 10:30 |
| J | SUSTRATOS | BOPP |

---

## ESTADOS DISPONIBLES

| Estado | Color | Descripcion |
|--------|-------|-------------|
| PREPARANDO | Azul | Programa en preparacion |
| LISTO | Verde | Listo para iniciar |
| CORRIENDO | Amarillo | En ejecucion |
| SUSPENDIDO | Rojo | Suspendido temporalmente |
| TERMINADO | Gris | Trabajo completado |

---

## VERIFICACION FINAL

Checklist:
- Tabla maquinas creada en MySQL
- Backend compila sin errores
- Backend ejecutandose en puerto 7003
- Endpoint /api/maquinas responde correctamente
- Endpoint /api/maquinas/test crea registro de prueba
- Frontend puede conectarse al backend
- Carga de archivo Excel funciona correctamente

---

Fecha: 2025-11-14
Version: 1.0.0
Base de datos: flexoapp_bd (MySQL Local)
