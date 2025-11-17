# 📊 Diagrama de Flujo: Integración con Tabla de Diseño

## Flujo Visual del Procesamiento

```
┌─────────────────────────────────────────────────────────────────┐
│  USUARIO SUBE ARCHIVO EXCEL CON PROGRAMACIÓN DE MÁQUINAS       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  SISTEMA LEE ARCHIVO EXCEL                                      │
│  - Valida formato (10 columnas mínimo)                          │
│  - Extrae datos de cada fila                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PARA CADA FILA DEL EXCEL:                                      │
│  1. Extrae código de artículo (columna 1)                       │
│  2. Valida campos obligatorios                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  🔍 CONSULTA TABLA DE DISEÑO (designs)                          │
│  SELECT * FROM designs WHERE ArticleF = [codigo_articulo]      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                    ┌────┴────┐
                    │ ¿Existe? │
                    └────┬────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼ SÍ                            ▼ NO
┌─────────────────────┐         ┌─────────────────────┐
│ ARTÍCULO ENCONTRADO │         │ ARTÍCULO NO         │
│ EN TABLA DE DISEÑO  │         │ ENCONTRADO          │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│ USAR INFORMACIÓN DE │         │ USAR INFORMACIÓN    │
│ TABLA DE DISEÑO:    │         │ DEL EXCEL:          │
│                     │         │                     │
│ ✅ Cliente          │         │ ✅ Cliente          │
│ ✅ Sustrato         │         │ ✅ Sustrato         │
│ ✅ Referencia       │         │ ✅ Referencia       │
│ ✅ TD               │         │ ✅ TD               │
│ ✅ Colores reales   │         │ ✅ Colores genéricos│
│    (Color1-10)      │         │    (COLOR1, COLOR2) │
│                     │         │                     │
│ USAR DEL EXCEL:     │         │ TODO DEL EXCEL      │
│ ✅ Kilos            │         │                     │
│ ✅ Fecha            │         │                     │
│ ✅ OT SAP           │         │                     │
│ ✅ Número Máquina   │         │                     │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           └───────────────┬───────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  CREAR/ACTUALIZAR REGISTRO EN TABLA maquinas                    │
│  - Inserta nuevo registro con información combinada             │
│  - Agrega observación indicando origen de datos                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  ✅ REGISTRO GUARDADO EXITOSAMENTE                              │
│  - Log indica origen de datos (TABLA DE DISEÑO o EXCEL)        │
│  - Operario puede ver y asignar estado                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Decisiones de Diseño

### ¿Por qué estos campos de la tabla de diseño?

| Campo | Razón |
|-------|-------|
| **Cliente** | El cliente asociado al artículo es información maestra que no cambia |
| **Sustrato** | El tipo de material es parte del diseño del artículo |
| **Referencia** | La descripción del producto es información del diseño |
| **TD (Tipo)** | El tipo de diseño (LAMINA, TUBULAR, etc.) es fijo para el artículo |
| **Colores** | Los colores específicos son parte del diseño del artículo |

### ¿Por qué estos campos del Excel?

| Campo | Razón |
|-------|-------|
| **Kilos** | La cantidad varía por orden de producción |
| **Fecha** | La fecha límite es específica de cada programación |
| **OT SAP** | La orden de trabajo es única para cada producción |
| **Número Máquina** | La asignación de máquina es decisión operativa |

## 📋 Matriz de Decisión

```
┌──────────────┬─────────────────────┬─────────────────────┐
│   CAMPO      │  ARTÍCULO EXISTE    │  ARTÍCULO NO EXISTE │
│              │  EN TABLA DISEÑO    │  EN TABLA DISEÑO    │
├──────────────┼─────────────────────┼─────────────────────┤
│ Cliente      │ 🎨 Tabla Diseño     │ 📄 Excel            │
│ Sustrato     │ 🎨 Tabla Diseño     │ 📄 Excel            │
│ Referencia   │ 🎨 Tabla Diseño     │ 📄 Excel            │
│ TD           │ 🎨 Tabla Diseño     │ 📄 Excel            │
│ Colores      │ 🎨 Tabla Diseño     │ 🔢 Genéricos        │
│ Kilos        │ 📄 Excel            │ 📄 Excel            │
│ Fecha        │ 📄 Excel            │ 📄 Excel            │
│ OT SAP       │ 📄 Excel            │ 📄 Excel            │
│ Máquina      │ 📄 Excel            │ 📄 Excel            │
└──────────────┴─────────────────────┴─────────────────────┘

Leyenda:
🎨 = Información de tabla de diseño (maestra)
📄 = Información del Excel (operativa)
🔢 = Generado automáticamente
```

## 🔄 Ejemplo de Transformación de Datos

### Entrada: Fila del Excel
```
┌────┬──────────┬─────────┬──────────────┬───────────┬──────┬─────┬──────┬──────────────┬──────────┐
│ MQ │ ARTICULO │ OT SAP  │   CLIENTE    │REFERENCIA │  TD  │ NUM │KILOS │    FECHA     │ SUSTRATO │
│IMP │    F     │         │              │           │      │COL  │      │              │          │
├────┼──────────┼─────────┼──────────────┼───────────┼──────┼─────┼──────┼──────────────┼──────────┤
│ 11 │ F204567  │ OT12345 │Cliente Excel │Ref Excel  │ TD-1 │  4  │ 1000 │10-nov-25 5PM │BOPP Excel│
└────┴──────────┴─────────┴──────────────┴───────────┴──────┴─────┴──────┴──────────────┴──────────┘
```

### Consulta: Tabla de Diseño
```sql
SELECT * FROM designs WHERE ArticleF = 'F204567'
```

### Resultado: Diseño Encontrado
```
┌──────────┬─────────────────────────────┬──────────────┬────────────────────────────┬────────┐
│ArticleF  │         Client              │  Substrate   │       Description          │  Type  │
├──────────┼─────────────────────────────┼──────────────┼────────────────────────────┼────────┤
│ F204567  │ABSORBENTES DE COLOMBIA S.A  │R PE COEX BCO │IMP BL PROTECTORES MULTI... │ LAMINA │
└──────────┴─────────────────────────────┴──────────────┴────────────────────────────┴────────┘

Colores: CYAN, MAGENTA, YELLOW, BLACK
```

### Salida: Registro en tabla maquinas
```
┌────────────────┬──────────────────────────────────────────────────────────────┐
│     CAMPO      │                          VALOR                               │
├────────────────┼──────────────────────────────────────────────────────────────┤
│ articulo       │ F204567                                                      │
│ numero_maquina │ 11                                    📄 Del Excel           │
│ ot_sap         │ OT12345                               📄 Del Excel           │
│ cliente        │ ABSORBENTES DE COLOMBIA S.A           🎨 De Tabla Diseño    │
│ referencia     │ IMP BL PROTECTORES MULTI...           🎨 De Tabla Diseño    │
│ td             │ LAMINA                                🎨 De Tabla Diseño    │
│ numero_colores │ 4                                                            │
│ colores        │ ["CYAN","MAGENTA","YELLOW","BLACK"]   🎨 De Tabla Diseño    │
│ kilos          │ 1000                                  📄 Del Excel           │
│ fecha_tinta    │ 2025-11-10 17:00:00                   📄 Del Excel           │
│ sustrato       │ R PE COEX BCO                         🎨 De Tabla Diseño    │
│ estado         │ NULL (pendiente asignación)                                  │
│ observaciones  │ Programa nuevo - Información de tabla de diseño...          │
└────────────────┴──────────────────────────────────────────────────────────────┘
```

## 🛡️ Manejo de Errores

```
┌─────────────────────────────────────────────────────────────────┐
│  CONSULTA A TABLA DE DISEÑO                                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                    ┌────────┐
                    │ ¿Error?│
                    └────┬───┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼ SÍ                            ▼ NO
┌─────────────────────┐         ┌─────────────────────┐
│ ERROR EN CONSULTA   │         │ CONSULTA EXITOSA    │
│                     │         │                     │
│ 1. Log warning      │         │ Procesar resultado  │
│ 2. designFromTable  │         │                     │
│    = null           │         │                     │
│ 3. Usar datos Excel │         │                     │
│                     │         │                     │
│ ✅ Sistema continúa │         │                     │
│    funcionando      │         │                     │
└─────────────────────┘         └─────────────────────┘
```

## 📊 Estadísticas de Procesamiento

Durante el procesamiento, el sistema genera logs como:

```
🔍 Buscando artículo 'F204567' en tabla de diseño...
✅ Artículo 'F204567' encontrado en tabla de diseño - Se usará información de diseño
📋 Diseño encontrado: Cliente=ABSORBENTES DE COLOMBIA S.A, Sustrato=R PE COEX BCO, Colores=4
🎨 Usando colores de la tabla de diseño para artículo 'F204567'
✅ Colores de tabla de diseño: CYAN, MAGENTA, YELLOW, BLACK
📋 Usando información de TABLA DE DISEÑO: Cliente=ABSORBENTES DE COLOMBIA S.A, Sustrato=R PE COEX BCO...
✅ DTO creado desde TABLA DE DISEÑO: Máquina=11, Artículo=F204567, OT=OT12345...
```

---

**Este diagrama complementa la documentación técnica en CAMBIOS_TABLA_DISENO.md**
