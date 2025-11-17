-- Verificar los últimos registros cargados
USE flexoapp_bd;

-- Contar total de registros
SELECT 'Total de registros:' as info, COUNT(*) as cantidad FROM maquinas;

-- Ver últimos 20 registros ordenados por fecha de creación
SELECT 
    articulo,
    numero_maquina,
    cliente,
    estado,
    created_at
FROM maquinas 
ORDER BY created_at DESC 
LIMIT 20;

-- Contar registros por máquina
SELECT 
    numero_maquina,
    COUNT(*) as cantidad_programas
FROM maquinas
GROUP BY numero_maquina
ORDER BY numero_maquina;
