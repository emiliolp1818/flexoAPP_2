-- =====================================================
-- SCRIPT: Verificar datos en la tabla maquinas
-- =====================================================

USE flexoapp_bd;

-- Ver todos los registros
SELECT * FROM maquinas ORDER BY numero_maquina;

-- Contar registros
SELECT COUNT(*) as total_registros FROM maquinas;

-- Ver por estado
SELECT estado, COUNT(*) as cantidad 
FROM maquinas 
GROUP BY estado;

-- Ver estructura de la tabla
DESCRIBE maquinas;
