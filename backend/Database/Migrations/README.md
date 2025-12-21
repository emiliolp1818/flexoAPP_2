# 🔄 Migrations - Scripts de Migración

Scripts de migración y actualizaciones de esquema de base de datos.

---

## 📋 Scripts Disponibles

### 1. `REMOVE_CURRENCY_CONFIG.sql`
Elimina configuraciones de moneda obsoletas del sistema.

**Acción:**
- Elimina registros de SystemConfigs relacionados con moneda

### 2. `REMOVE_EMAIL_NOTIFICATIONS.sql`
Elimina configuraciones de notificaciones por email obsoletas.

**Acción:**
- Elimina registros de SystemConfigs relacionados con email

### 3. `REMOVE_GENERAL_CATEGORY.sql`
Elimina configuraciones de categoría general obsoletas.

**Acción:**
- Elimina registros de SystemConfigs de categoría "General"

---

## 🚀 Orden de Ejecución

Ejecutar en el orden listado arriba.

---

## ⚠️ Importante

- **Hacer backup** antes de ejecutar migraciones
- **Ejecutar en orden** si hay dependencias
- **Verificar cambios** después de cada migración
- **No ejecutar dos veces** el mismo script

---

## ✅ Verificación

Después de ejecutar las migraciones:

```sql
-- Verificar que se eliminaron las configuraciones
SELECT * FROM SystemConfigs WHERE Category = 'General';
SELECT * FROM SystemConfigs WHERE Id LIKE '%currency%';
SELECT * FROM SystemConfigs WHERE Id LIKE '%email%';
```

---

## 📝 Crear Nueva Migración

Al crear una nueva migración:

1. Nombrar con formato descriptivo: `ACCION_DESCRIPCION.sql`
2. Incluir comentarios explicativos
3. Agregar verificaciones de existencia
4. Documentar en este README
