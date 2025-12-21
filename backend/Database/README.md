# 📁 Database - Scripts de Base de Datos

Esta carpeta contiene todos los scripts SQL organizados para la base de datos MySQL de FlexoAPP.

---

## 📂 Estructura de Carpetas

### `/Setup`
Scripts de configuración inicial de la base de datos.
- Creación de tablas principales
- Inserción de datos por defecto
- Configuración inicial del sistema

**Ejecutar solo una vez** al configurar una nueva base de datos.

### `/Migrations`
Scripts de migración y actualizaciones de esquema.
- Cambios en estructura de tablas
- Actualizaciones de datos
- Limpieza de configuraciones

**Ejecutar en orden** cuando se actualiza el sistema.

### `/Archive`
Scripts históricos y obsoletos (solo para referencia).
- Scripts ya ejecutados
- Versiones antiguas de migraciones
- Scripts de diagnóstico históricos

**No ejecutar** - solo para consulta histórica.

---

## 📋 Documentación Activa

- `README_ACTIVITIES.md` - Documentación del sistema de actividades
- `README_USER_ACTIVITIES.md` - Documentación de actividades de usuario

---

## ⚠️ Importante

- **Siempre hacer backup** antes de ejecutar scripts de migración
- **Revisar scripts** antes de ejecutarlos en producción
- **Ejecutar en orden** los scripts numerados
- **No modificar** scripts en Archive (solo referencia)

---

## 🔧 Uso Recomendado

### Nueva Instalación
1. Ejecutar todos los scripts en `/Setup`
2. Verificar que las tablas se crearon correctamente
3. Verificar que el usuario admin existe

### Actualización
1. Revisar scripts en `/Migrations`
2. Ejecutar solo los scripts nuevos
3. Verificar cambios en base de datos

### Consulta Histórica
1. Revisar `/Archive` para ver cambios históricos
2. No ejecutar scripts de Archive
