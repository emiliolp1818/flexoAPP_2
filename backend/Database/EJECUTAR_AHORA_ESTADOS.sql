-- =====================================================
-- SCRIPT PARA PERMITIR ESTADOS VACÍOS
-- Ejecutar este script en MySQL Workbench
-- =====================================================

USE flexoapp_bd;

-- 1️⃣ MODIFICAR LA COLUMNA PARA PERMITIR NULL
ALTER TABLE maquinas 
MODIFY COLUMN estado VARCHAR(20) NULL DEFAULT NULL
COMMENT 'Estado: PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO. NULL = Sin asignar';

-- 2️⃣ LIMPIAR TODOS LOS ESTADOS EXISTENTES (OPCIONAL - DESCOMENTA SI QUIERES)
-- Esto hará que TODOS los programas queden sin estado
-- UPDATE maquinas SET estado = NULL;
-- UPDATE maquinas SET observaciones = 'Pendiente de asignación de estado por operario' WHERE estado IS NULL;

-- 3️⃣ VERIFICAR EL CAMBIO
SELECT 
    COLUMN_NAME as 'Columna',
    COLUMN_TYPE as 'Tipo',
    IS_NULLABLE as 'Permite NULL',
    COLUMN_DEFAULT as 'Valor por Defecto'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'flexoapp_bd'
  AND TABLE_NAME = 'maquinas'
  AND COLUMN_NAME = 'estado';

-- 4️⃣ VER ESTADÍSTICAS DE ESTADOS
SELECT 
    CASE 
        WHEN estado IS NULL THEN '🔘 SIN_ASIGNAR (NULL)'
        WHEN estado = '' THEN '🔘 SIN_ASIGNAR (VACÍO)'
        ELSE CONCAT('✓ ', estado)
    END AS 'Estado',
    COUNT(*) as 'Cantidad de Programas'
FROM maquinas
GROUP BY estado
ORDER BY COUNT(*) DESC;

-- 5️⃣ MOSTRAR ALGUNOS PROGRAMAS
SELECT 
    articulo as 'Artículo',
    numero_maquina as 'Máquina',
    CASE 
        WHEN estado IS NULL THEN 'SIN_ASIGNAR'
        WHEN estado = '' THEN 'SIN_ASIGNAR'
        ELSE estado
    END as 'Estado',
    kilos as 'Kilos',
    cliente as 'Cliente'
FROM maquinas
ORDER BY numero_maquina, created_at DESC
LIMIT 10;

SELECT '✅ Script ejecutado correctamente. Ahora reinicia el backend.' AS 'RESULTADO';
