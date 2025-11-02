-- =====================================================
-- SCRIPT DE MIGRACIÓN - EJECUTAR ESTE ARCHIVO
-- =====================================================

-- Ejecutar la migración de colores
SOURCE 02_MigrateDesignsToSeparateColors.sql;

-- Verificar que la migración fue exitosa
SELECT 'Verificando estructura de tabla después de migración:' as Info;
DESCRIBE Designs;

SELECT 'Verificando datos migrados:' as Info;
SELECT Id, ArticleF, ColorCount, Color1, Color2, Color3, Color4, Color5 
FROM Designs 
WHERE Color1 IS NOT NULL
LIMIT 3;

SELECT '¡Migración completada exitosamente!' as Resultado;