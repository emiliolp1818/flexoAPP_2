# Configuración de Códigos de Tinta para Formato FF459

## Problema
Al imprimir el formato FF459, los códigos de tinta no aparecen en la fila "CODIGO TINTA".

## Causa
Los códigos de tinta se obtienen de la tabla `cod_tintas` en la base de datos. Si no hay datos para el artículo que estás imprimiendo, los campos quedarán vacíos.

## Solución

### 1. Verificar si hay datos para tu artículo

```sql
USE flexoapp_bd;

-- Ver todos los artículos con códigos de tinta
SELECT articulo, descripcion, JSON_LENGTH(colores_data) as cantidad_colores
FROM cod_tintas
ORDER BY articulo;

-- Buscar un artículo específico
SELECT * FROM cod_tintas WHERE articulo = 'TU_ARTICULO';
```

### 2. Agregar códigos de tinta para un artículo

Usa el script `backend/Database/Scripts/ADD_COD_TINTAS_EXAMPLE.sql` como plantilla:

```sql
USE flexoapp_bd;

INSERT INTO cod_tintas (articulo, descripcion, colores_data, created_by) VALUES
(
    'F12345',  -- Código del artículo
    'Bolsa impresa 3 colores',  -- Descripción
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'Cyan', 'codTinta', 'T-CY-001', 'cobertura', 85.50, 'codAnilox', 'A-350'),
        JSON_OBJECT('nombre', 'Magenta', 'codTinta', 'T-MG-002', 'cobertura', 80.25, 'codAnilox', 'A-450'),
        JSON_OBJECT('nombre', 'Amarillo', 'codTinta', 'T-YL-003', 'cobertura', 90.75, 'codAnilox', 'A-550')
    ),
    'Admin'
);
```

### 3. Puntos importantes

- El campo `nombre` en el JSON debe coincidir **EXACTAMENTE** con el nombre del color en el programa de máquina
- Los nombres de colores son case-sensitive (mayúsculas/minúsculas importan)
- Puedes tener hasta 10 colores por artículo
- Si un color no tiene código de tinta en la base de datos, aparecerá vacío en el formato

### 4. Verificar en el navegador

Cuando imprimas el formato FF459, abre la consola del navegador (F12) y busca estos mensajes:

```
🔍 Buscando código de tinta para artículo: F12345, color: Cyan
📦 Respuesta de getColorData: {nombre: "Cyan", codTinta: "T-CY-001", ...}
✅ Código de tinta asignado para Cyan: T-CY-001
```

Si ves:
```
⚠️ No se encontró código de tinta para artículo F12345, color Cyan
```

Significa que necesitas agregar datos en la tabla `cod_tintas` para ese artículo.

### 5. Actualizar códigos existentes

```sql
UPDATE cod_tintas
SET 
    colores_data = JSON_ARRAY(
        JSON_OBJECT('nombre', 'Cyan', 'codTinta', 'T-CY-NUEVO', 'cobertura', 85.50, 'codAnilox', 'A-350'),
        JSON_OBJECT('nombre', 'Magenta', 'codTinta', 'T-MG-NUEVO', 'cobertura', 80.25, 'codAnilox', 'A-450')
    ),
    updated_by = 'Admin',
    updated_at = CURRENT_TIMESTAMP
WHERE articulo = 'F12345';
```

## Estructura de la tabla cod_tintas

```sql
CREATE TABLE cod_tintas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    articulo VARCHAR(50) NOT NULL,           -- Código del artículo
    descripcion VARCHAR(200) NULL,           -- Descripción del diseño
    colores_data JSON NOT NULL,              -- Array de colores con sus datos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL
);
```

## Formato del JSON colores_data

```json
[
  {
    "nombre": "Cyan",           // Nombre del color (debe coincidir con el programa)
    "codTinta": "T-CY-001",     // Código de la tinta
    "cobertura": 85.50,         // Porcentaje de cobertura
    "codAnilox": "A-350"        // Código del anilox
  },
  {
    "nombre": "Magenta",
    "codTinta": "T-MG-002",
    "cobertura": 80.25,
    "codAnilox": "A-450"
  }
]
```

## Scripts disponibles

1. `13_CREATE_COD_TINTAS_TABLE.sql` - Crear la tabla
2. `INSERT_COD_TINTAS_TEST_DATA.sql` - Datos de prueba
3. `ADD_COD_TINTAS_EXAMPLE.sql` - Plantilla para agregar nuevos artículos
4. `QUICK_ADD_COD_TINTAS.sql` - Crear tabla rápidamente

## Flujo de datos

1. Usuario hace clic en "Imprimir FF459" para un programa
2. Frontend llama a `prepareColorsForFF459()` con los colores del programa
3. Para cada color, se busca en la tabla `cod_tintas` por `articulo` y `nombre` del color
4. Si se encuentra, se asigna el `codTinta` al objeto del color
5. Los códigos se reemplazan en el template HTML (`${codigoTinta1}`, `${codigoTinta2}`, etc.)
6. Se abre la ventana de impresión con los datos completos
