# 🧹 PLAN DE LIMPIEZA Y REORGANIZACIÓN DEL BACKEND

**Fecha:** 21 de Diciembre de 2025  
**Proyecto:** FlexoAPP Backend  
**Objetivo:** Eliminar archivos obsoletos y reorganizar estructura

---

## 📋 ARCHIVOS A ELIMINAR

### 1. Archivos de Prueba (Test Files)
```
❌ Database/INSERT_ACTIVITIES_TEST_DATA.sql
❌ Database/INSERT_USER_ACTIVITIES_TEST_DATA.sql
❌ Database/INSERT_USER_ACTIVITIES_TEST_DATA_MYSQL.sql
❌ Database/test-insert.sql
❌ Database/test_designs_table.sql
❌ Database/02_insertar_datos_prueba.sql
```

### 2. Servicios Deshabilitados/Obsoletos
```
❌ Services/MachineBackupService.cs.disabled (ya está deshabilitado)
❌ Services/RealTimeSyncService.cs (archivo vacío)
```

### 3. Scripts SQL Obsoletos/Duplicados
```
❌ Database/02_fix_primary_key_designs.sql (ya ejecutado)
❌ Database/02_fix_primary_key_maquinas.sql (ya ejecutado)
❌ Database/03_add_id_primary_key.sql (ya ejecutado)
❌ Database/03_verificar_datos.sql (temporal)
❌ Database/04_permitir_estado_vacio.sql (ya ejecutado)
❌ Database/04_remove_unique_key.sql (ya ejecutado)
❌ Database/05_allow_null_estado.sql (ya ejecutado)
❌ Database/05_verificar_y_limpiar_estados.sql (temporal)
❌ Database/BACKUP_AND_FIX_MAQUINAS.sql (temporal)
❌ Database/CHECK_MAQUINAS_COLUMNS.sql (diagnóstico temporal)
❌ Database/EJECUTAR_AHORA_ESTADOS.sql (temporal)
❌ Database/EJECUTAR_ESTO_PRIMERO.sql (temporal)
❌ Database/FIX_MAQUINAS_TABLE.sql (ya ejecutado)
❌ Database/FIX_USER_ROLE_ADMIN.sql (ya ejecutado)
❌ Database/LIMPIAR_TODOS_ESTADOS.sql (temporal)
❌ Database/SOLUCION_COMPLETA_MAQUINAS.sql (temporal)
❌ Database/UPDATE_USERS_TABLE.sql (ya ejecutado)
❌ Database/UPDATE_USER_PERMISSIONS.sql (ya ejecutado)
❌ Database/VERIFICAR_TABLA_CONFIGS.sql (diagnóstico temporal)
❌ Database/VERIFY_ACTIVITIES_SETUP.sql (diagnóstico temporal)
❌ Database/check_recent_data.sql (diagnóstico temporal)
❌ Database/diagnostico.sql (diagnóstico temporal)
```

### 4. Archivos Markdown Obsoletos
```
❌ Database/EJECUTAR_FIX_PRIMARY_KEY.md (instrucciones ya ejecutadas)
❌ Database/EJECUTAR_FIX_PRIMARY_KEY_DESIGNS.md (instrucciones ya ejecutadas)
❌ Database/README_MIGRACION_DESIGNS.md (migración completada)
```

### 5. Scripts PowerShell Temporales
```
❌ Database/EJECUTAR_MIGRACION.ps1 (ya ejecutado)
```

---

## 📁 ARCHIVOS A MOVER A ARCHIVO (Archive)

### Scripts de Migración Históricos (para referencia)
```
📦 Database/01_create_designs_table.sql → Database/Archive/
📦 Database/01_create_maquinas_table.sql → Database/Archive/
📦 Database/create_or_update_maquinas_table.sql → Database/Archive/
```

---

## 📂 NUEVA ESTRUCTURA ORGANIZADA

```
backend/
├── Database/
│   ├── Setup/                          # Scripts de configuración inicial
│   │   ├── CREATE_USERS_TABLE.sql
│   │   ├── CREATE_USER_ACTIVITIES_TABLE.sql
│   │   ├── CREATE_SYSTEM_CONFIGS_TABLE.sql
│   │   ├── INSERT_DEFAULT_USERS.sql
│   │   └── README.md
│   │
│   ├── Migrations/                     # Scripts de migración activos
│   │   ├── REMOVE_CURRENCY_CONFIG.sql
│   │   ├── REMOVE_EMAIL_NOTIFICATIONS.sql
│   │   ├── REMOVE_GENERAL_CATEGORY.sql
│   │   └── README.md
│   │
│   ├── Archive/                        # Scripts históricos (solo referencia)
│   │   ├── 01_create_designs_table.sql
│   │   ├── 01_create_maquinas_table.sql
│   │   ├── 02_fix_primary_key_designs.sql
│   │   ├── 02_fix_primary_key_maquinas.sql
│   │   └── ... (otros scripts obsoletos)
│   │
│   └── README.md                       # Documentación de la carpeta Database
│
├── Data/
│   ├── Context/
│   │   └── FlexoAPPDbContext.cs
│   ├── Scripts/                        # Scripts de datos iniciales
│   │   ├── 00_SetupDatabase.sql
│   │   ├── SETUP_COMPLETE_DATABASE.sql
│   │   ├── CrearYPoblarTablaMaquinas.sql
│   │   ├── create_condicionunica_flexoBD.sql
│   │   └── README.md
│   └── SeedData.cs
│
├── Controllers/                        # ✅ Ya está organizado
├── Services/                           # ✅ Limpiar archivos obsoletos
├── Repositories/                       # ✅ Ya está organizado
├── Models/                             # ✅ Ya está organizado
└── Attributes/                         # ✅ Ya está organizado
```

---

## ✅ ARCHIVOS A MANTENER (Activos y Funcionales)

### Database/Setup/
- CREATE_USERS_TABLE.sql
- CREATE_USER_ACTIVITIES_TABLE.sql
- CREATE_SYSTEM_CONFIGS_TABLE.sql
- INSERT_DEFAULT_USERS.sql

### Database/Migrations/
- REMOVE_CURRENCY_CONFIG.sql
- REMOVE_EMAIL_NOTIFICATIONS.sql
- REMOVE_GENERAL_CATEGORY.sql

### Data/Scripts/
- 00_SetupDatabase.sql
- SETUP_COMPLETE_DATABASE.sql
- CrearYPoblarTablaMaquinas.sql
- create_condicionunica_flexoBD.sql
- QUICK_FIX_COLORS.sql

### Database/ (Documentación)
- README_ACTIVITIES.md (mantener como documentación)
- README_USER_ACTIVITIES.md (mantener como documentación)

---

## 🔧 ACCIONES A REALIZAR

### Fase 1: Eliminar Archivos Obsoletos
1. ✅ Eliminar archivos de prueba (test)
2. ✅ Eliminar servicios deshabilitados
3. ✅ Eliminar scripts SQL temporales
4. ✅ Eliminar scripts de diagnóstico
5. ✅ Eliminar documentación obsoleta

### Fase 2: Reorganizar Estructura
1. ✅ Mover scripts de setup a Database/Setup/
2. ✅ Mover scripts de migración a Database/Migrations/
3. ✅ Mover scripts históricos a Database/Archive/
4. ✅ Crear archivos README en cada carpeta

### Fase 3: Documentar
1. ✅ Crear README.md en Database/
2. ✅ Crear README.md en Database/Setup/
3. ✅ Crear README.md en Database/Migrations/
4. ✅ Crear README.md en Database/Archive/
5. ✅ Actualizar documentación principal

---

## 📊 RESUMEN DE LIMPIEZA

**Archivos a eliminar:** ~35 archivos
**Archivos a mover:** ~10 archivos
**Archivos a mantener:** ~15 archivos
**Carpetas nuevas:** 3 (Setup, Migrations, Archive)

**Espacio liberado estimado:** ~500 KB
**Mejora en organización:** ⭐⭐⭐⭐⭐

---

## ⚠️ PRECAUCIONES

1. ✅ Hacer backup antes de eliminar
2. ✅ Verificar que los scripts ya fueron ejecutados
3. ✅ No eliminar scripts de Data/Scripts/ (datos iniciales)
4. ✅ Mantener documentación útil (README_ACTIVITIES.md, README_USER_ACTIVITIES.md)
5. ✅ No tocar archivos de Controllers, Services, Repositories, Models

---

## 🎯 RESULTADO ESPERADO

Después de la limpieza:
- ✅ Estructura clara y organizada
- ✅ Solo archivos activos y funcionales
- ✅ Scripts históricos archivados (no eliminados)
- ✅ Documentación actualizada
- ✅ Fácil mantenimiento futuro
- ✅ Sin archivos de prueba o temporales
