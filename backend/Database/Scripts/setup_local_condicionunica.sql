-- Script para crear tabla condicionunica en PostgreSQL LOCAL
-- Base de datos: flexoapp
-- Ejecutar en pgAdmin o psql: psql -U postgres -d flexoapp -f setup_local_condicionunica.sql

-- Eliminar tabla si existe
DROP TABLE IF EXISTS condicionunica CASCADE;

-- ===== PASO 3: CREAR TABLA CONDICIONUNICA =====
CREATE TABLE condicionunica (
    -- ID único del registro (clave primaria, autoincremental)
    id SERIAL PRIMARY KEY,
    
    -- Código del artículo F (ejemplo: F204567)
    -- Campo requerido para identificar el artículo
    farticulo VARCHAR(50) NOT NULL,
    
    -- Referencia del producto o diseño
    -- Información adicional sobre el artículo
    referencia VARCHAR(200) NOT NULL,
    
    -- Número de estante donde se encuentra físicamente
    -- Ubicación en el almacén o área de producción
    estante VARCHAR(50) NOT NULL,
    
    -- Número de carpeta donde está archivado
    -- Organización documental del artículo
    numerocarpeta VARCHAR(50) NOT NULL,
    
    -- Fecha de creación del registro
    -- Se genera automáticamente al crear el registro
    createddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Fecha de última modificación
    -- Se actualiza automáticamente al editar el registro
    lastmodified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== PASO 4: CREAR ÍNDICES PARA OPTIMIZAR BÚSQUEDAS =====

-- Índice en farticulo para búsquedas rápidas por código de artículo
CREATE INDEX idx_condicionunica_farticulo ON condicionunica(farticulo);

-- Índice en estante para búsquedas por ubicación física
CREATE INDEX idx_condicionunica_estante ON condicionunica(estante);

-- Índice en lastmodified para ordenar por fecha de modificación
CREATE INDEX idx_condicionunica_lastmodified ON condicionunica(lastmodified DESC);

-- ===== PASO 5: AGREGAR COMENTARIOS A LA TABLA Y COLUMNAS =====

-- Comentario en la tabla para documentación
COMMENT ON TABLE condicionunica IS 'Tabla de Condición Única - Gestiona artículos con ubicación física y organización documental';

-- Comentarios en cada columna
COMMENT ON COLUMN condicionunica.id IS 'ID único del registro (clave primaria, autoincremental)';
COMMENT ON COLUMN condicionunica.farticulo IS 'Código del artículo F (ejemplo: F204567)';
COMMENT ON COLUMN condicionunica.referencia IS 'Referencia del producto o diseño';
COMMENT ON COLUMN condicionunica.estante IS 'Número de estante donde se encuentra físicamente';
COMMENT ON COLUMN condicionunica.numerocarpeta IS 'Número de carpeta donde está archivado';
COMMENT ON COLUMN condicionunica.createddate IS 'Fecha de creación del registro';
COMMENT ON COLUMN condicionunica.lastmodified IS 'Fecha de última modificación';

-- ===== PASO 6: INSERTAR DATOS DE PRUEBA =====

-- Insertar 10 registros de ejemplo para pruebas
INSERT INTO condicionunica (farticulo, referencia, estante, numerocarpeta) VALUES
('F204567', 'REF-BOLSA-001', 'E-01', 'C-001'),
('F204568', 'REF-ETIQUETA-002', 'E-01', 'C-002'),
('F204569', 'REF-EMPAQUE-003', 'E-02', 'C-003'),
('F204570', 'REF-BOLSA-004', 'E-02', 'C-004'),
('F204571', 'REF-ETIQUETA-005', 'E-03', 'C-005'),
('F204572', 'REF-EMPAQUE-006', 'E-03', 'C-006'),
('F204573', 'REF-BOLSA-007', 'E-04', 'C-007'),
('F204574', 'REF-ETIQUETA-008', 'E-04', 'C-008'),
('F204575', 'REF-EMPAQUE-009', 'E-05', 'C-009'),
('F204576', 'REF-BOLSA-010', 'E-05', 'C-010');

-- ===== PASO 7: VERIFICAR QUE TODO SE CREÓ CORRECTAMENTE =====

-- Verificar estructura de la tabla
\d condicionunica

-- Verificar índices
\di condicionunica*

-- Contar registros insertados
SELECT COUNT(*) AS total_registros FROM condicionunica;

-- Mostrar los primeros 5 registros
SELECT * FROM condicionunica ORDER BY id LIMIT 5;

-- ===== PASO 8: CREAR FUNCIÓN PARA ACTUALIZAR lastmodified AUTOMÁTICAMENTE =====

-- Crear función que actualiza lastmodified al modificar un registro
CREATE OR REPLACE FUNCTION update_lastmodified_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar la columna lastmodified con la fecha y hora actual
    NEW.lastmodified = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que ejecuta la función antes de cada UPDATE
CREATE TRIGGER update_condicionunica_lastmodified
    BEFORE UPDATE ON condicionunica
    FOR EACH ROW
    EXECUTE FUNCTION update_lastmodified_column();

-- ===== PASO 9: VERIFICACIÓN FINAL =====

-- Mensaje de éxito
SELECT '✅ Tabla condicionunica creada exitosamente' AS mensaje;
SELECT '✅ ' || COUNT(*) || ' registros de prueba insertados' AS mensaje FROM condicionunica;
SELECT '✅ Índices creados correctamente' AS mensaje;
SELECT '✅ Trigger de actualización automática creado' AS mensaje;

-- Mostrar resumen de la tabla
SELECT 
    'condicionunica' AS tabla,
    COUNT(*) AS total_registros,
    MIN(createddate) AS primer_registro,
    MAX(createddate) AS ultimo_registro
FROM condicionunica;

-- ===== COMANDOS ÚTILES PARA ADMINISTRACIÓN =====

-- Para ver todos los registros:
-- SELECT * FROM condicionunica ORDER BY lastmodified DESC;

-- Para buscar por F Artículo:
-- SELECT * FROM condicionunica WHERE farticulo LIKE '%F2045%';

-- Para buscar por estante:
-- SELECT * FROM condicionunica WHERE estante = 'E-01';

-- Para eliminar todos los registros (CUIDADO):
-- TRUNCATE TABLE condicionunica RESTART IDENTITY;

-- Para eliminar la tabla completamente:
-- DROP TABLE IF EXISTS condicionunica CASCADE;

-- ===== FIN DEL SCRIPT =====
