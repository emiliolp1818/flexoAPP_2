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
