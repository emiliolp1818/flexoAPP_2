# Configuración de Paginación para Cod Tintas

## Problema Actual
El endpoint `/api/cod-tintas/paginated` está devolviendo error 400 (Bad Request) porque:
1. El backend necesita ser reiniciado para cargar el nuevo endpoint
2. La tabla `cod_tintas` puede estar vacía

## Solución Paso a Paso

### 1. Insertar Datos de Prueba en la Base de Datos

Ejecuta el siguiente script SQL en MySQL:

```sql
USE flexoapp_bd;

-- Insertar datos de prueba
INSERT INTO cod_tintas (articulo, descripcion, colores_data, created_by) VALUES
-- Registro 1: 3 colores
(
    'F12345',
    'Bolsa impresa 3 colores - Cliente ABC',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'Cyan', 'codTinta', 'T-CY-001', 'cobertura', 85, 'codAnilox', 'A-350'),
        JSON_OBJECT('nombre', 'Magenta', 'codTinta', 'T-MG-002', 'cobertura', 80, 'codAnilox', 'A-450'),
        JSON_OBJECT('nombre', 'Amarillo', 'codTinta', 'T-YL-003', 'cobertura', 90, 'codAnilox', 'A-550')
    ),
    'Sistema'
),

-- Registro 2: 4 colores
(
    'F12346',
    'Etiqueta 4 colores - Cliente XYZ',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'P Black', 'codTinta', 'T-BK-001', 'cobertura', 100, 'codAnilox', 'A-250'),
        JSON_OBJECT('nombre', 'P 185 C', 'codTinta', 'T-185-001', 'cobertura', 75, 'codAnilox', 'A-350'),
        JSON_OBJECT('nombre', 'P 286 C', 'codTinta', 'T-286-001', 'cobertura', 80, 'codAnilox', 'A-450'),
        JSON_OBJECT('nombre', 'P White', 'codTinta', 'T-WH-001', 'cobertura', 95, 'codAnilox', 'A-150')
    ),
    'Sistema'
),

-- Registro 3: 2 colores
(
    'F12347',
    'Empaque simple 2 colores',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'P 300 C', 'codTinta', 'T-300-001', 'cobertura', 85, 'codAnilox', 'A-400'),
        JSON_OBJECT('nombre', 'P 485 C', 'codTinta', 'T-485-001', 'cobertura', 90, 'codAnilox', 'A-500')
    ),
    'Sistema'
),

-- Registro 4: 5 colores
(
    'F12348',
    'Diseño complejo 5 colores - Premium',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'P Black', 'codTinta', 'T-BK-002', 'cobertura', 100, 'codAnilox', 'A-250'),
        JSON_OBJECT('nombre', 'Cyan', 'codTinta', 'T-CY-002', 'cobertura', 85, 'codAnilox', 'A-350'),
        JSON_OBJECT('nombre', 'Magenta', 'codTinta', 'T-MG-003', 'cobertura', 80, 'codAnilox', 'A-450'),
        JSON_OBJECT('nombre', 'Amarillo', 'codTinta', 'T-YL-004', 'cobertura', 90, 'codAnilox', 'A-550'),
        JSON_OBJECT('nombre', 'P White', 'codTinta', 'T-WH-002', 'cobertura', 95, 'codAnilox', 'A-150')
    ),
    'Sistema'
),

-- Registro 5: 6 colores
(
    'F12349',
    'Etiqueta premium 6 colores',
    JSON_ARRAY(
        JSON_OBJECT('nombre', 'P Black', 'codTinta', 'T-BK-003', 'cobertura', 100, 'codAnilox', 'A-250'),
        JSON_OBJECT('nombre', 'P 185 C', 'codTinta', 'T-185-002', 'cobertura', 75, 'codAnilox', 'A-350'),
        JSON_OBJECT('nombre', 'P 286 C', 'codTinta', 'T-286-002', 'cobertura', 80, 'codAnilox', 'A-450'),
        JSON_OBJECT('nombre', 'P 300 C', 'codTinta', 'T-300-002', 'cobertura', 85, 'codAnilox', 'A-400'),
        JSON_OBJECT('nombre', 'P 485 C', 'codTinta', 'T-485-002', 'cobertura', 90, 'codAnilox', 'A-500'),
        JSON_OBJECT('nombre', 'P White', 'codTinta', 'T-WH-003', 'cobertura', 95, 'codAnilox', 'A-150')
    ),
    'Sistema'
);

-- Verificar inserción
SELECT 
    id,
    articulo,
    descripcion,
    JSON_LENGTH(colores_data) as cantidad_colores,
    created_at
FROM cod_tintas
ORDER BY id DESC;
```

O ejecuta el archivo completo:
```bash
mysql -u root -p < backend/Database/Scripts/INSERT_COD_TINTAS_TEST_DATA.sql
```

### 2. Reiniciar el Backend

**Opción A: Desde Visual Studio / Rider**
- Detener el servidor (Shift+F5)
- Iniciar nuevamente (F5)

**Opción B: Desde la terminal**
```bash
# Navegar a la carpeta del backend
cd backend

# Detener el proceso actual (Ctrl+C si está corriendo)

# Iniciar el backend
dotnet run
```

### 3. Verificar el Endpoint

Una vez reiniciado el backend, verifica que el endpoint funcione:

```bash
# Prueba el endpoint (reemplaza el token con uno válido)
curl -X GET "http://localhost:8080/api/cod-tintas/paginated?page=1&pageSize=50" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 4. Refrescar el Frontend

En el navegador:
- Presiona `Ctrl + F5` para hacer un hard refresh
- O abre las DevTools (F12) y haz clic derecho en el botón de refrescar → "Vaciar caché y recargar"

## Verificación

Después de seguir estos pasos, deberías ver:

1. **En la consola del backend:**
   ```
   📄 Obteniendo códigos de tintas paginados - Página: 1, Tamaño: 50
   ✅ Códigos de tintas paginados obtenidos: 5 de 5
   ```

2. **En la consola del navegador:**
   ```
   🚀 Cargando Cod Tintas paginados - Página: 1, Tamaño: 50
   ✅ 5 registros de Cod Tintas cargados
   ```

3. **En la interfaz:**
   - La pestaña "Cod Tintas" mostrará los registros
   - Los controles de paginación estarán visibles
   - Podrás navegar entre páginas

## Características de la Paginación

- **Navegación:** Botones Anterior/Siguiente
- **Tamaño de página:** 25, 50 o 100 registros por página
- **Búsqueda:** Integrada con la paginación
- **Contador:** Muestra "Mostrando X-Y de Z registros"
- **Diseño:** Idéntico al módulo de Diseño

## Troubleshooting

### Error 400 persiste
- Verifica que el backend se haya reiniciado correctamente
- Revisa los logs del backend en `backend/logs/flexoapp-YYYYMMDD.log`
- Verifica que la tabla `cod_tintas` exista y tenga datos

### No se ven los controles de paginación
- Verifica que `filteredCodTintasData().length > 0`
- Asegúrate de que el frontend se haya recargado completamente (Ctrl+F5)

### La tabla está vacía
- Ejecuta el script SQL de datos de prueba
- Verifica la conexión a la base de datos

## Archivos Modificados

### Frontend
- `Frontend/src/app/shared/components/diseño/diseno.ts` - Lógica de paginación
- `Frontend/src/app/shared/components/diseño/diseno.html` - Controles UI

### Backend
- `backend/Controllers/CodTintasController.cs` - Endpoint de paginación
- `backend/Database/Scripts/INSERT_COD_TINTAS_TEST_DATA.sql` - Datos de prueba

