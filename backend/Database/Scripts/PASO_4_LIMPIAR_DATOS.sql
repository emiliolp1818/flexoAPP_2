-- PASO 4: Limpiar valores incorrectos
-- Desactivar safe mode temporalmente
SET SQL_SAFE_UPDATES = 0;

UPDATE maquinas 
SET Kilos = 0.001
WHERE Kilos > 9999999.999 OR Kilos <= 0;

UPDATE maquinas 
SET metros = NULL 
WHERE metros IS NOT NULL AND (metros > 99999999 OR metros < 0);

-- Reactivar safe mode
SET SQL_SAFE_UPDATES = 1;
