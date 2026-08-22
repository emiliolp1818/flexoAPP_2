-- =============================================
-- Script: UPDATE BACKUP COLORS FROM DESIGNS
-- Descripción: Actualiza el campo Colores de maquinas_backup
--              con los colores reales de la tabla designs.
-- =============================================

-- Verificar qué hay actualmente
SELECT b.ot_sap, b.Articulo, b.Colores, b.Estado, d.`color 1`, d.`color 2`, d.`color 3`
FROM maquinas_backup b
LEFT JOIN designs d ON d.ArticleF = b.Articulo
LIMIT 10;

-- Actualizar cada registro con un JSON construido desde los colores del diseño
-- Usamos JSON_REMOVE para eliminar nulls después
UPDATE maquinas_backup b
INNER JOIN designs d ON d.ArticleF = b.Articulo
SET b.Colores = (
    SELECT CONCAT('[', 
        GROUP_CONCAT(
            CONCAT('"', REPLACE(color_val, '"', '\\"'), '"')
            ORDER BY idx
            SEPARATOR ','
        ),
    ']')
    FROM (
        SELECT 1 AS idx, d.`color 1` AS color_val WHERE d.`color 1` IS NOT NULL AND TRIM(d.`color 1`) != ''
        UNION ALL SELECT 2, d.`color 2` WHERE d.`color 2` IS NOT NULL AND TRIM(d.`color 2`) != ''
        UNION ALL SELECT 3, d.`color 3` WHERE d.`color 3` IS NOT NULL AND TRIM(d.`color 3`) != ''
        UNION ALL SELECT 4, d.`color 4` WHERE d.`color 4` IS NOT NULL AND TRIM(d.`color 4`) != ''
        UNION ALL SELECT 5, d.`color 5` WHERE d.`color 5` IS NOT NULL AND TRIM(d.`color 5`) != ''
        UNION ALL SELECT 6, d.`color 6` WHERE d.`color 6` IS NOT NULL AND TRIM(d.`color 6`) != ''
        UNION ALL SELECT 7, d.`color 7` WHERE d.`color 7` IS NOT NULL AND TRIM(d.`color 7`) != ''
        UNION ALL SELECT 8, d.`color 8` WHERE d.`color 8` IS NOT NULL AND TRIM(d.`color 8`) != ''
        UNION ALL SELECT 9, d.`color 9` WHERE d.`color 9` IS NOT NULL AND TRIM(d.`color 9`) != ''
        UNION ALL SELECT 10, d.`color 10` WHERE d.`color 10` IS NOT NULL AND TRIM(d.`color 10`) != ''
    ) AS all_colors
);

SELECT '✓ Colores actualizados' AS resultado;
SELECT ot_sap, Articulo, Colores, Estado FROM maquinas_backup LIMIT 10;
