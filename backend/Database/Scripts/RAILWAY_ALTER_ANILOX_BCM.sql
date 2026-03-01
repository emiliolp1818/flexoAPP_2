-- =============================================
-- Script: ALTER ANILOX BCM TO DECIMAL FOR RAILWAY
-- Descripción: Cambiar el tipo de dato de BCM de INT a DECIMAL para soportar valores decimales
-- Autor: Sistema FlexoAPP
-- Fecha: 2026-02-28
-- Ejecutar en Railway Database
-- =============================================

-- Cambiar el tipo de dato de bcm de INT a DECIMAL(5,2)
ALTER TABLE `anilox` 
    MODIFY COLUMN `bcm` DECIMAL(5, 2) NOT NULL COMMENT 'BCM (Billion Cubic Microns) - soporta decimales como 8.3';

-- Verificar el cambio
DESCRIBE `anilox`;
