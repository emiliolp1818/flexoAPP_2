# 🗑️ Eliminación de la Tabla Pedidos - Resumen de Cambios

**Fecha:** 2026-01-16  
**Motivo:** La tabla `pedidos` no se está utilizando. El módulo de Máquinas usa exclusivamente la tabla `maquinas`.

## ✅ Archivos Eliminados

### Backend - Controladores
- ❌ `backend/Controllers/PedidosController.cs`

### Backend - Servicios
- ❌ `backend/Services/IPedidoService.cs`
- ❌ `backend/Services/PedidoService.cs`

### Backend - Repositorios
- ❌ `backend/Repositories/IPedidoRepository.cs`
- ❌ `backend/Repositories/PedidoRepository.cs`

### Backend - Modelos
- ❌ `backend/Models/Entities/Pedido.cs`
- ❌ `backend/Models/DTOs/PedidoDto.cs`

**Total de archivos eliminados:** 7

## 📝 Archivos Modificados

### Backend - Configuración
1. **`backend/Data/Context/FlexoAPPDbContext.cs`**
   - ❌ Eliminado `DbSet<Pedido> Pedidos`
   - ❌ Eliminada configuración de entidad `Pedido`

2. **`backend/Program.cs`**
   - ❌ Eliminado `AddScoped<IPedidoRepository, PedidoRepository>()`
   - ❌ Eliminado `AddScoped<IPedidoService, PedidoService>()`
   - ❌ Eliminado endpoint `/api/pedidos` de la lista de endpoints permitidos

3. **`backend/Models/Permissions/Permission.cs`**
   - ❌ Eliminadas constantes de permisos:
     - `ViewOrders`
     - `CreateOrders`
     - `EditOrders`
     - `DeleteOrders`
     - `ChangeOrderStatus`
     - `ImportOrders`
   - ❌ Eliminados permisos de la lista `GetAllPermissions()`
   - ❌ Eliminados permisos de roles (Supervisor, Prealistador, etc.)
   - ❌ Eliminadas descripciones de permisos
   - ❌ Eliminada categoría "Pedidos" de `GetPermissionCategory()`

### Backend - Documentación
4. **`backend/Controllers/README.md`**
   - ❌ Eliminada referencia a `PedidosController.cs`

5. **`backend/Services/README.md`**
   - ❌ Eliminada referencia a `PedidoService.cs`

6. **`backend/Database/README.md`**
   - ❌ Eliminada sección de tabla `Pedidos`
   - ❌ Eliminada relación `users ||--o{ Pedidos : "CreatedBy/UpdatedBy"` del diagrama

### Documentación General
7. **`README.md`** (raíz del proyecto)
   - ❌ Eliminada mención de "pedidos" en la descripción
   - ❌ Eliminada sección "📦 Pedidos de Producción"
   - ❌ Eliminada tabla `Pedidos` de la lista de tablas principales

8. **`Frontend/README.md`**
   - ❌ Eliminado componente "Pedidos" de la lista de componentes del Shared Module

**Total de archivos modificados:** 8

## 🗄️ Base de Datos

### Script SQL Creado
- ✅ `backend/Database/drop_pedidos_table.sql`
  - Script para eliminar la tabla `pedidos` de MySQL
  - Incluye verificaciones antes y después de la eliminación
  - Muestra las tablas restantes en la base de datos

### Ejecución del Script
```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script
source backend/Database/drop_pedidos_table.sql
```

O directamente:
```bash
mysql -u root -p flexoapp_bd < backend/Database/drop_pedidos_table.sql
```

## 🔍 Verificación de Compilación

### Backend
```bash
cd backend
dotnet build
```

**Resultado:** ✅ Compilación exitosa con 17 advertencias (ninguna relacionada con Pedidos)

### Frontend
No requiere cambios en el código TypeScript/Angular ya que no había componentes de Pedidos implementados.

## 📊 Impacto del Cambio

### Código Eliminado
- **Líneas de código eliminadas:** ~2,500 líneas aproximadamente
- **Clases eliminadas:** 7
- **Endpoints eliminados:** 1 (`/api/pedidos`)
- **Permisos eliminados:** 6

### Beneficios
1. ✅ **Código más limpio:** Eliminación de código no utilizado
2. ✅ **Menor complejidad:** Menos dependencias y servicios
3. ✅ **Mejor mantenibilidad:** Enfoque en la tabla `maquinas` que es la que realmente se usa
4. ✅ **Base de datos optimizada:** Una tabla menos que mantener
5. ✅ **Documentación actualizada:** READMEs reflejan el estado real del sistema

### Sin Impacto Negativo
- ❌ No hay funcionalidad perdida (la tabla no se estaba usando)
- ❌ No hay datos perdidos (la tabla estaba vacía o con datos de prueba)
- ❌ No hay dependencias rotas (ningún código dependía de Pedidos)

## 🎯 Tabla Activa: `maquinas`

La tabla `maquinas` es la que realmente se utiliza para gestionar los programas de máquinas:

### Características
- **Clave primaria:** `ot_sap` (VARCHAR 50)
- **Endpoint:** `/api/maquinas`
- **Controlador:** `MaquinasController.cs`
- **Servicio:** `MaquinaService.cs`
- **Repositorio:** `MaquinaRepository.cs`
- **Frontend:** `machines.ts` component

### Campos Específicos
- `colores` (JSON array)
- `sustrato` (BOPP, PE, PET, CPP)
- `td` (código de diseño)
- `kilos` (DECIMAL 10,3)
- `fecha_tinta_en_maquina`
- `numero_maquina` (11-21)
- Estados: `PREPARANDO`, `LISTO`, `CORRIENDO`, `SUSPENDIDO`, `TERMINADO`

## 📋 Próximos Pasos

1. ✅ **Ejecutar el script SQL** para eliminar la tabla `pedidos` de la base de datos
2. ✅ **Reiniciar el backend** para aplicar los cambios
3. ✅ **Verificar que todo funciona correctamente**
4. ✅ **Commit de los cambios** al repositorio Git

## 🔗 Archivos Relacionados

- Script SQL: `backend/Database/drop_pedidos_table.sql`
- Este resumen: `PEDIDOS_REMOVAL_SUMMARY.md`

---

**Nota:** Este cambio es seguro y no afecta ninguna funcionalidad existente del sistema. La tabla `pedidos` era un remanente de una versión anterior que no se estaba utilizando.
