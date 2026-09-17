# Implementación del Módulo Cod Tintas

## Fecha: 2026-03-06

## Resumen
Se ha implementado completamente el módulo de Códigos de Tintas en el sistema FlexoAPP, permitiendo gestionar los códigos de tinta, porcentajes de cobertura y códigos de anilox para cada color de un diseño flexográfico.

## Componentes Creados

### Backend

#### 1. Entidad (Models/Entities/CodTinta.cs)
- Tabla: `cod_tintas`
- Campos:
  - `id`: ID único
  - `articulo`: Código del artículo (Artículo F)
  - `descripcion`: Descripción del diseño
  - `colores_data`: JSON con array de colores y sus datos
  - `created_at`, `updated_at`: Auditoría
  - `created_by`, `updated_by`: Usuario de auditoría

#### 2. DTOs (Models/DTOs/CodTintaDto.cs)
- `ColorTintaDto`: Estructura de un color con sus datos
  - nombre: Nombre del color
  - codTinta: Código de tinta
  - cobertura: Porcentaje de cobertura
  - codAnilox: Código de anilox
- `CreateCodTintaDto`: Para crear registros
- `UpdateCodTintaDto`: Para actualizar registros
- `CodTintaResponseDto`: Respuesta del API

#### 3. Controlador (Controllers/CodTintasController.cs)
Endpoints implementados:
- `GET /api/cod-tintas` - Obtener todos los registros
- `GET /api/cod-tintas/{id}` - Obtener por ID
- `POST /api/cod-tintas` - Crear nuevo registro
- `PUT /api/cod-tintas/{id}` - Actualizar registro
- `DELETE /api/cod-tintas/{id}` - Eliminar registro
- `GET /api/cod-tintas/search/{articulo}` - Buscar por artículo

> **Caché en memoria de `GET /api/cod-tintas`**: la lista completa se cachea con
> `IMemoryCache` bajo la clave `cod_tintas_all` con un TTL de **5 minutos**. Es la
> consulta más cara del arranque del módulo de diseño (trae toda la tabla y
> deserializa el JSON de colores por fila), por lo que se sirve desde caché usando
> `AsNoTracking`. La caché se **invalida** (`_cache.Remove("cod_tintas_all")`) tras
> cualquier mutación: crear, actualizar, eliminar e importar. Requiere `IMemoryCache`
> inyectado en el constructor del controlador.

> **Orden de resultados de `search/{articulo}`**: los registros se devuelven priorizando
> (1) coincidencia **exacta** del artículo sobre coincidencias parciales (`Contains`),
> (2) registros que **contienen datos de tinta** (`codTinta` / `codAnilox` / `cobertura`)
> sobre registros vacíos auto-creados, y (3) los más recientes como desempate.
> Esto asegura que el consumidor (el módulo de máquinas usa `records[0]`) reciba el
> registro con datos reales y evita que un registro vacío recién creado lo "tape".

#### 4. Base de Datos
- Script: `backend/Database/Scripts/13_CREATE_COD_TINTAS_TABLE.sql`
- Tabla agregada al script maestro: `00_MASTER_CREATE_ALL_TABLES.sql`
- Estructura JSON para colores:
```json
[
  {
    "nombre": "Cyan",
    "codTinta": "T-CY-001",
    "cobertura": 85,
    "codAnilox": "A-350"
  }
]
```

#### 5. DbContext Actualizado
- Agregado `DbSet<CodTinta> CodTintas`
- Configuración de entidad en `OnModelCreating`

### Frontend

#### 1. Componente Principal (diseno.ts)
Interfaces:
- `ColorTinta`: Estructura de un color
- `CodTintaRecord`: Registro completo

Propiedades:
- `codTintasData`: Signal con todos los registros
- `filteredCodTintasData`: Signal con registros filtrados
- `codTintasSearchTerm`: Término de búsqueda
- `codTintasColumns`: Columnas de la tabla
- `loadingCodTintas`: Estado de carga

Métodos implementados:
- `loadCodTintas()`: Cargar datos desde API
- `searchCodTintasByArticulo()`: Buscar por artículo
- `createCodTintaRecord()`: Crear nuevo registro
- `updateCodTintaRecord()`: Actualizar registro
- `deleteCodTintaRecord()`: Eliminar registro
- `updateCodTinta()`: Actualizar código de tinta
- `updateCobertura()`: Actualizar cobertura
- `updateCodAnilox()`: Actualizar código de anilox
- `exportCodTintasToExcel()`: Exportar a Excel
- `importCodTintasFromExcel()`: Importar desde Excel
- `openCreateCodTintaDialog()`: Abrir diálogo de creación

#### 2. HTML (diseno.html)
- Pestaña ubicada entre Diseños y Anilox
- Header con:
  - Título y contador de registros
  - Campo de búsqueda centrado
  - Botones: Crear, Importar, Exportar, Refresh
- Tabla con columnas:
  - Artículo
  - Descripción
  - Colores (lista numerada)
  - Cód. Tintas (inputs editables)
  - % Cobertura (inputs numéricos)
  - Cód. Anilox (inputs editables)
  - Acciones (Guardar, Eliminar)
- Mensaje cuando no hay datos

#### 3. Diálogo de Creación (create-cod-tinta-dialog.component.ts)
- Componente standalone
- Input para artículo
- Validación de artículo requerido
- Mensaje informativo sobre carga automática

#### 4. Estilos (diseno.scss)
- Diseño consistente con otras pestañas
- Iconos con animaciones
- Campo de búsqueda centrado (350px)
- Botones con colores diferenciados
- Inputs compactos para datos de colores

## Funcionalidad

### Flujo de Creación
1. Usuario hace clic en botón "Crear"
2. Se abre diálogo para ingresar artículo
3. Al confirmar, se busca el diseño correspondiente
4. Se carga automáticamente:
   - Descripción del diseño
   - Lista de colores
5. Se crea registro con colores vacíos para llenar manualmente

### Flujo de Edición
1. Usuario modifica códigos de tinta, cobertura o anilox
2. Los cambios se reflejan en el modelo
3. Usuario hace clic en botón "Guardar"
4. Se actualiza el registro en la base de datos

### Características
- ✅ Carga automática de descripción desde diseño
- ✅ Carga automática de colores desde diseño
- ✅ Ingreso manual de códigos de tinta
- ✅ Ingreso manual de porcentaje de cobertura
- ✅ Ingreso manual de código de anilox
- ✅ Búsqueda por artículo
- ✅ Exportación a Excel
- ✅ Importación desde Excel
- ✅ Validación de artículo único
- ✅ Auditoría de cambios (created_by, updated_by)

## Próximos Pasos

### Para Ejecutar en Desarrollo
1. Ejecutar script SQL para crear tabla:
```bash
mysql -u root -p flexoapp < backend/Database/Scripts/13_CREATE_COD_TINTAS_TABLE.sql
```

2. Reiniciar backend para cargar nuevos endpoints

3. Probar funcionalidad en frontend

### Para Despliegue en Producción
1. Ejecutar script maestro actualizado o solo el script 13
2. Verificar que la tabla se creó correctamente
3. Desplegar backend con nuevos endpoints
4. Desplegar frontend con nueva pestaña

## Notas Técnicas
- La tabla usa JSON para almacenar el array de colores
- Cada color tiene su propio código de tinta, cobertura y anilox
- El sistema valida que el artículo exista en diseños antes de crear
- Los datos se cargan automáticamente al abrir la pestaña
- La búsqueda filtra en tiempo real

## Archivos Modificados/Creados
- ✅ `backend/Models/Entities/CodTinta.cs` (nuevo)
- ✅ `backend/Models/DTOs/CodTintaDto.cs` (nuevo)
- ✅ `backend/Controllers/CodTintasController.cs` (nuevo)
- ✅ `backend/Data/Context/FlexoAPPDbContext.cs` (modificado)
- ✅ `backend/Database/Scripts/13_CREATE_COD_TINTAS_TABLE.sql` (nuevo)
- ✅ `backend/Database/Scripts/00_MASTER_CREATE_ALL_TABLES.sql` (modificado)
- ✅ `Frontend/src/app/shared/components/diseño/diseno.ts` (modificado)
- ✅ `Frontend/src/app/shared/components/diseño/diseno.html` (modificado)
- ✅ `Frontend/src/app/shared/components/diseño/diseno.scss` (ya existía)
- ✅ `Frontend/src/app/shared/components/diseño/create-cod-tinta-dialog/create-cod-tinta-dialog.component.ts` (nuevo)
- ✅ `docs/COD_TINTAS_IMPLEMENTATION.md` (este archivo)


---

## Actualización: Panel Inline en Tabla de Diseños

**Fecha:** 2026-09-05

### Cambio
Se eliminó la pestaña separada de Cod Tintas y se integró el panel de tintas **directamente dentro de la tabla de diseños**, mediante una experiencia de expansión/colapso por fila.

### Nuevas Columnas en la Tabla de Diseños

#### Columna `expand`
- Botón ícono por fila para expandir/colapsar el panel de tintas.
- Si el diseño tiene registro en `cod_tintas`: muestra ícono `colorize` con clase `.has-tintas`.
- Si no tiene registro: muestra ícono `add_circle_outline`.
- Tooltip dinámico según estado de expansión y existencia de registro.

#### Columna `codTintasSummary`
Tiene dos vistas:

**Vista colapsada** — resumen compacto:
- Badge de carpeta (`folder` + valor).
- Badge de estante (`E: valor`).
- Contador de colores registrados.
- Badge de línea de tinta.
- Si no hay registro: botón "Agregar" para crear uno desde la misma fila (requiere permiso `canCreateDesign`).

**Vista expandida** — panel completo `.cod-tintas-inline-panel`:
- **Fila de metadatos**: inputs inline editables para `carpeta` y `estante` (se guardan en `blur`), texto de `lineaTinta` (solo lectura).
- Botón de acción: eliminar registro (`deleteCodTintaRecord`), sujeto a permiso `canDeleteDesign`. La edición es 100% inline (sin ventana emergente), por lo que no hay botón de "editar registro completo".
- **Grid de colores** (`.tintas-colores-grid`): columnas Color, Cód. Tinta, Cobertura (%), Cód. Anilox. Cada campo es un input editable que dispara actualización en `change`.
- Punto de color (`.color-preview-dot`) con hex obtenido de `getPantoneColor(nombre).hex`.
- Mensaje "Sin colores registrados" cuando `colores` está vacío.
- Si no hay registro al expandir: botón "Crear registro de tintas para {articleF}".

### Métodos Frontend Involucrados

| Método | Descripción |
|--------|-------------|
| `toggleDesignRow(design)` | Alterna `design.expanded` |
| `openCreateCodTintaForDesign(design)` | Abre flujo de creación asociado al diseño |
| `updateCodTintaOnDesign(design)` | Guarda cambios de `carpeta`/`estante` en blur |
| `updateCodTintaOnDesignColor(design, i, value)` | Actualiza `codTinta` de un color |
| `updateCoberturaOnDesignColor(design, i, value)` | Actualiza `cobertura` de un color |
| `updateCodAniloxOnDesignColor(design, i, value)` | Actualiza `codAnilox` de un color |
| `deleteCodTintaRecord(id)` | Elimina el registro con confirmación |
| `getPantoneColor(nombre)` | Resuelve el hex del color pantone para el preview |

### Control de Permisos
- Edición de campos: requiere `userPermissions().canEditDesign`.
- Creación de registro: requiere `userPermissions().canCreateDesign`.
- Eliminación: requiere `userPermissions().canDeleteDesign`.

### Clases SCSS del Panel Inline (`diseno.scss`)

Añadidas al final del archivo bajo el bloque `// ===== ESTILOS: COD TINTAS INLINE EN TABLA DE DISEÑOS =====`.

| Clase / Selector | Descripción |
|---|---|
| `.expand-header` / `.expand-cell` | Columna de 36px para el botón de expansión |
| `.expand-btn-design` | Botón 30×30 px; `.has-tintas` cambia el ícono a azul `#2563eb` |
| `.cod-tintas-summary-cell` | Celda de resumen (min 180px, max 420px) |
| `.tintas-compact-summary` | Contenedor flex-wrap con badges colapsados |
| `.carpeta-badge` | Badge azul (`#eff6ff`) para la carpeta |
| `.colores-count-badge` | Badge verde (`#f0fdf4`) para el contador de colores |
| `.estante-badge` / `.linea-tinta-badge` | Badges neutros (`#f1f5f9`) para estante y línea de tinta |
| `.create-tintas-inline-btn` | Botón "Agregar" compacto (height 26px, texto 11px) |
| `.cod-tintas-inline-panel` | Panel expandido (fondo `#f8fafc`, borde redondeado 8px); modificador `.no-record-panel` para estado vacío (borde punteado) |
| `.tintas-meta-row` | Fila flex con los campos editables de carpeta/estante/línea |
| `.meta-field` | Campo individual con `label` (9px uppercase) e `.inline-edit-input` (height 26px) |
| `.meta-actions` | Contenedor de botones de acción (edit/delete) al extremo derecho |
| `.tintas-colores-grid` | Grid de colores: 4 columnas (`1fr 100px 80px 100px`) |
| `.colores-grid-header` | Encabezado del grid (9px, uppercase, borde inferior) |
| `.color-grid-row` | Fila del grid; hover con borde `#e2e8f0` y fondo `#fafbff` |
| `.color-preview-dot` | Círculo 14×14px con el hex del pantone del color |
| `.styled-input` | Input compacto 24px para código de tinta, cobertura y anilox |
| `.cobertura-input-wrapper` | Wrapper flex para el input de cobertura con sufijo `%` |
| `.no-colores-msg` | Mensaje vacío cuando el registro no tiene colores |

**Patrones de uso:**
- Los inputs `.inline-edit-input` y `.styled-input` tienen variante `[readonly]` con fondo `#f8fafc` cuando los permisos de edición no están activos.
- El botón `.expand-btn-design.has-tintas` se aplica dinámicamente cuando el diseño ya tiene un `CodTintaRecord` asociado.

### Archivos Modificados
- `Frontend/src/app/shared/components/diseño/diseno.html` — nuevas columnas `expand` y `codTintasSummary` en la tabla de diseños.
- `Frontend/src/app/shared/components/diseño/diseno.ts` — métodos de soporte para interacción inline (a implementar/verificar si no existen aún).
- `Frontend/src/app/shared/components/diseño/diseno.scss` — clases del panel inline agregadas (ver tabla anterior).
