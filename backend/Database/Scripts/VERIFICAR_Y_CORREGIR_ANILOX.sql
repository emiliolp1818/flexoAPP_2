-- =============================================
-- Script: VERIFICAR Y CORREGIR ANILOX POR MÁQUINA
-- Descripción: Verifica que cada anilox esté asignado a la máquina correcta
-- Fecha: 2026-02-15
-- =============================================

USE flexoapp_bd;

-- ===== PASO 1: VERIFICAR DATOS ACTUALES =====
SELECT '===== VERIFICACIÓN DE ANILOX POR MÁQUINA =====' AS info;

-- Ver todos los anilox agrupados por máquina
SELECT 
    maquina,
    COUNT(*) as total_anilox,
    GROUP_CONCAT(codigo ORDER BY codigo SEPARATOR ', ') as codigos
FROM anilox
GROUP BY maquina
ORDER BY maquina;

-- ===== PASO 2: BUSCAR ANILOX MAL ASIGNADOS =====
SELECT '===== ANILOX POTENCIALMENTE MAL ASIGNADOS =====' AS info;

-- Anilox que empiezan con 116x deberían estar en máquina 11
SELECT codigo, maquina, 'Debería estar en máquina 11' as problema
FROM anilox
WHERE codigo LIKE '116%' AND maquina != 11

UNION ALL

-- Anilox que empiezan con 117x deberían estar en máquina 11
SELECT codigo, maquina, 'Debería estar en máquina 11' as problema
FROM anilox
WHERE codigo LIKE '117%' AND maquina != 11

UNION ALL

-- Anilox que empiezan con 118x deberían estar en máquina 11
SELECT codigo, maquina, 'Debería estar en máquina 11' as problema
FROM anilox
WHERE codigo LIKE '118%' AND maquina != 11

UNION ALL

-- Anilox que empiezan con 124x deberían estar en máquina 12
SELECT codigo, maquina, 'Debería estar en máquina 12' as problema
FROM anilox
WHERE codigo LIKE '124%' AND maquina != 12

UNION ALL

-- Anilox que empiezan con 126x deberían estar en máquina 12
SELECT codigo, maquina, 'Debería estar en máquina 12' as problema
FROM anilox
WHERE codigo LIKE '126%' AND maquina != 12

UNION ALL

-- Anilox que empiezan con 127x deberían estar en máquina 12
SELECT codigo, maquina, 'Debería estar en máquina 12' as problema
FROM anilox
WHERE codigo LIKE '127%' AND maquina != 12;

-- ===== PASO 3: VER TODOS LOS ANILOX CON DETALLES =====
SELECT '===== LISTADO COMPLETO DE ANILOX =====' AS info;

SELECT 
    codigo,
    maquina,
    lineatura,
    volumen_real,
    marca
FROM anilox
ORDER BY maquina, lineatura, codigo;

-- ===== PASO 4: CORRECCIONES (COMENTADAS - DESCOMENTAR SOLO SI ES NECESARIO) =====

-- Si encuentras anilox mal asignados, descomenta y ejecuta las correcciones necesarias:

-- Ejemplo: Corregir anilox de máquina 11
-- UPDATE anilox SET maquina = 11 WHERE codigo IN ('1164', '1165', '1166', '1167', '1169', '1170', '1171', '1172', '1173', '1174', '1175', '1176', '1177', '1178', '1179', '1180', '1181', '1182', '1183');

-- Ejemplo: Corregir anilox de máquina 12
-- UPDATE anilox SET maquina = 12 WHERE codigo IN ('1244', '1246', '1261', '1262', '1263', '1264', '1265', '1266', '1267', '1268', '1269', '1272');

-- ===== PASO 5: VERIFICACIÓN FINAL =====
SELECT '===== VERIFICACIÓN FINAL =====' AS info;

-- Contar anilox por máquina
SELECT 
    maquina,
    COUNT(*) as total,
    MIN(codigo) as primer_codigo,
    MAX(codigo) as ultimo_codigo
FROM anilox
GROUP BY maquina
ORDER BY maquina;

-- Ver anilox de máquina 11
SELECT '===== ANILOX DE MÁQUINA 11 =====' AS info;
SELECT codigo, lineatura, volumen_real, marca
FROM anilox
WHERE maquina = 11
ORDER BY lineatura, codigo;

-- Ver anilox de máquina 12
SELECT '===== ANILOX DE MÁQUINA 12 =====' AS info;
SELECT codigo, lineatura, volumen_real, marca
FROM anilox
WHERE maquina = 12
ORDER BY lineatura, codigo;

SELECT '✅ Verificación completada' AS resultado;
