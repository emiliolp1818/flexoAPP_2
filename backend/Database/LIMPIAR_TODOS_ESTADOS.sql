-- =====================================================
-- LIMPIAR TODOS LOS ESTADOS EXISTENTES
-- Esto hará que TODOS los programas queden sin estado
-- =====================================================

USE flexoapp_bd;

-- Poner todos los estados en NULL
UPDATE maquinas SET estado = NULL;

-- Actualizar observaciones
UPDATE maquinas 
SET observaciones = 'Pendiente de asignación de estado por operario' 
WHERE estado IS NULL;

-- Ver resultado
SELECT 
    CASE 
        WHEN estado IS NULL THEN 'SIN_ASIGNAR (NULL)'
        ELSE estado
    END AS 'Estado',
    COUNT(*) as 'Cantidad'
FROM maquinas
GROUP BY estado;

SELECT '✅ Todos los estados limpiados. Recarga la página del navegador.' AS 'RESULTADO';
