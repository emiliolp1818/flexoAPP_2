-- =====================================================
-- ESQUEMA COMPLETO PARA MÓDULO DE REPORTES
-- FlexoAPP - Sistema de Gestión Flexográfica
-- =====================================================

-- Usar la base de datos existente
USE flexoapp_db;

-- =====================================================
-- TABLA: report_configurations
-- Configuraciones de reportes personalizados
-- =====================================================
CREATE TABLE IF NOT EXISTS report_configurations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    report_type ENUM('PRODUCTION', 'EFFICIENCY', 'CLIENTS', 'DAILY', 'CUSTOM') NOT NULL,
    filters JSON,
    columns JSON,
    created_by INT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_report_type (report_type),
    INDEX idx_created_by (created_by),
    INDEX idx_is_public (is_public),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLA: report_exports
-- Historial de exportaciones de reportes
-- =====================================================
CREATE TABLE IF NOT EXISTS report_exports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_type VARCHAR(50) NOT NULL,
    export_format ENUM('EXCEL', 'PDF', 'CSV') NOT NULL,
    filters JSON,
    file_name VARCHAR(500),
    file_size INT,
    exported_by INT,
    export_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INT DEFAULT 0,
    
    INDEX idx_report_type (report_type),
    INDEX idx_export_format (export_format),
    INDEX idx_exported_by (exported_by),
    INDEX idx_export_timestamp (export_timestamp),
    
    FOREIGN KEY (exported_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLA: machine_efficiency_metrics
-- Métricas detalladas de eficiencia por máquina
-- =====================================================
CREATE TABLE IF NOT EXISTS machine_efficiency_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    machine_number INT NOT NULL,
    date DATE NOT NULL,
    total_programs INT DEFAULT 0,
    completed_programs INT DEFAULT 0,
    running_programs INT DEFAULT 0,
    suspended_programs INT DEFAULT 0,
    total_kilos DECIMAL(10,2) DEFAULT 0,
    total_runtime_hours DECIMAL(8,2) DEFAULT 0,
    downtime_hours DECIMAL(8,2) DEFAULT 0,
    efficiency_percentage DECIMAL(5,2) DEFAULT 0,
    utilization_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Métricas adicionales
    average_setup_time DECIMAL(8,2) DEFAULT 0,
    average_cycle_time DECIMAL(8,2) DEFAULT 0,
    quality_rate DECIMAL(5,2) DEFAULT 100,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_machine_date (machine_number, date),
    INDEX idx_machine_number (machine_number),
    INDEX idx_date (date),
    INDEX idx_efficiency (efficiency_percentage),
    INDEX idx_utilization (utilization_rate)
);

-- =====================================================
-- TABLA: client_performance_metrics
-- Métricas de rendimiento por cliente
-- =====================================================
CREATE TABLE IF NOT EXISTS client_performance_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    total_programs INT DEFAULT 0,
    completed_programs INT DEFAULT 0,
    total_kilos DECIMAL(10,2) DEFAULT 0,
    average_completion_time DECIMAL(8,2) DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 100,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_client_date (cliente, date),
    INDEX idx_cliente (cliente),
    INDEX idx_date (date),
    INDEX idx_completion_time (average_completion_time),
    INDEX idx_delivery_rate (on_time_delivery_rate)
);

-- =====================================================
-- TABLA: daily_production_summary
-- Resumen diario de producción
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_production_summary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL UNIQUE,
    total_programs INT DEFAULT 0,
    completed_programs INT DEFAULT 0,
    running_programs INT DEFAULT 0,
    suspended_programs INT DEFAULT 0,
    ready_programs INT DEFAULT 0,
    total_kilos DECIMAL(10,2) DEFAULT 0,
    active_machines INT DEFAULT 0,
    total_machines INT DEFAULT 11,
    overall_efficiency DECIMAL(5,2) DEFAULT 0,
    
    -- Turnos
    morning_shift_programs INT DEFAULT 0,
    afternoon_shift_programs INT DEFAULT 0,
    night_shift_programs INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date (date),
    INDEX idx_efficiency (overall_efficiency),
    INDEX idx_total_programs (total_programs)
);

-- =====================================================
-- VISTAS PARA REPORTES
-- =====================================================

-- Vista de resumen de producción por máquina
CREATE OR REPLACE VIEW v_machine_production_summary AS
SELECT 
    mp.machine_number,
    COUNT(*) as total_programs,
    SUM(CASE WHEN mp.estado = 'TERMINADO' THEN 1 ELSE 0 END) as completed_programs,
    SUM(CASE WHEN mp.estado = 'CORRIENDO' THEN 1 ELSE 0 END) as running_programs,
    SUM(CASE WHEN mp.estado = 'SUSPENDIDO' THEN 1 ELSE 0 END) as suspended_programs,
    SUM(CASE WHEN mp.estado = 'LISTO' THEN 1 ELSE 0 END) as ready_programs,
    SUM(mp.kilos) as total_kilos,
    AVG(CASE WHEN mp.progreso > 0 THEN mp.progreso ELSE NULL END) as avg_progress,
    COUNT(DISTINCT mp.cliente) as unique_clients,
    COUNT(DISTINCT mp.articulo) as unique_articles,
    MAX(mp.last_action_at) as last_activity
FROM machine_programs mp
WHERE mp.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY mp.machine_number;

-- Vista de rendimiento por cliente
CREATE OR REPLACE VIEW v_client_performance AS
SELECT 
    mp.cliente,
    COUNT(*) as total_programs,
    SUM(CASE WHEN mp.estado = 'TERMINADO' THEN 1 ELSE 0 END) as completed_programs,
    SUM(mp.kilos) as total_kilos,
    AVG(CASE 
        WHEN mp.estado = 'TERMINADO' AND mp.fecha_fin IS NOT NULL 
        THEN TIMESTAMPDIFF(HOUR, mp.fecha_inicio, mp.fecha_fin)
        ELSE NULL 
    END) as avg_completion_hours,
    COUNT(DISTINCT mp.machine_number) as machines_used,
    COUNT(DISTINCT mp.articulo) as unique_articles,
    MIN(mp.fecha_inicio) as first_program_date,
    MAX(mp.fecha_inicio) as last_program_date
FROM machine_programs mp
WHERE mp.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY mp.cliente;

-- Vista de producción diaria
CREATE OR REPLACE VIEW v_daily_production AS
SELECT 
    DATE(mp.fecha_inicio) as production_date,
    COUNT(*) as total_programs,
    SUM(CASE WHEN mp.estado = 'TERMINADO' THEN 1 ELSE 0 END) as completed_programs,
    SUM(CASE WHEN mp.estado = 'CORRIENDO' THEN 1 ELSE 0 END) as running_programs,
    SUM(mp.kilos) as total_kilos,
    COUNT(DISTINCT mp.machine_number) as active_machines,
    AVG(CASE WHEN mp.progreso > 0 THEN mp.progreso ELSE NULL END) as avg_efficiency,
    COUNT(DISTINCT mp.cliente) as unique_clients
FROM machine_programs mp
WHERE mp.fecha_inicio >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
GROUP BY DATE(mp.fecha_inicio)
ORDER BY production_date DESC;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS PARA REPORTES
-- =====================================================

-- Procedimiento para calcular métricas diarias
DELIMITER //
CREATE PROCEDURE sp_calculate_daily_metrics(IN target_date DATE)
BEGIN
    -- Insertar o actualizar resumen diario
    INSERT INTO daily_production_summary (
        date, total_programs, completed_programs, running_programs, 
        suspended_programs, ready_programs, total_kilos, active_machines, overall_efficiency
    )
    SELECT 
        target_date,
        COUNT(*),
        SUM(CASE WHEN estado = 'TERMINADO' THEN 1 ELSE 0 END),
        SUM(CASE WHEN estado = 'CORRIENDO' THEN 1 ELSE 0 END),
        SUM(CASE WHEN estado = 'SUSPENDIDO' THEN 1 ELSE 0 END),
        SUM(CASE WHEN estado = 'LISTO' THEN 1 ELSE 0 END),
        SUM(kilos),
        COUNT(DISTINCT machine_number),
        AVG(CASE WHEN progreso > 0 THEN progreso ELSE NULL END)
    FROM machine_programs 
    WHERE DATE(fecha_inicio) = target_date
    ON DUPLICATE KEY UPDATE
        total_programs = VALUES(total_programs),
        completed_programs = VALUES(completed_programs),
        running_programs = VALUES(running_programs),
        suspended_programs = VALUES(suspended_programs),
        ready_programs = VALUES(ready_programs),
        total_kilos = VALUES(total_kilos),
        active_machines = VALUES(active_machines),
        overall_efficiency = VALUES(overall_efficiency),
        updated_at = CURRENT_TIMESTAMP;
        
    -- Calcular métricas por máquina
    INSERT INTO machine_efficiency_metrics (
        machine_number, date, total_programs, completed_programs, 
        running_programs, suspended_programs, total_kilos, efficiency_percentage
    )
    SELECT 
        machine_number,
        target_date,
        COUNT(*),
        SUM(CASE WHEN estado = 'TERMINADO' THEN 1 ELSE 0 END),
        SUM(CASE WHEN estado = 'CORRIENDO' THEN 1 ELSE 0 END),
        SUM(CASE WHEN estado = 'SUSPENDIDO' THEN 1 ELSE 0 END),
        SUM(kilos),
        AVG(CASE WHEN progreso > 0 THEN progreso ELSE NULL END)
    FROM machine_programs 
    WHERE DATE(fecha_inicio) = target_date
    GROUP BY machine_number
    ON DUPLICATE KEY UPDATE
        total_programs = VALUES(total_programs),
        completed_programs = VALUES(completed_programs),
        running_programs = VALUES(running_programs),
        suspended_programs = VALUES(suspended_programs),
        total_kilos = VALUES(total_kilos),
        efficiency_percentage = VALUES(efficiency_percentage),
        updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Procedimiento para limpiar datos antiguos
DELIMITER //
CREATE PROCEDURE sp_cleanup_old_report_data()
BEGIN
    -- Limpiar exportaciones antiguas (más de 30 días)
    DELETE FROM report_exports 
    WHERE export_timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Limpiar métricas muy antiguas (más de 1 año)
    DELETE FROM machine_efficiency_metrics 
    WHERE date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
    
    DELETE FROM client_performance_metrics 
    WHERE date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
    
    DELETE FROM daily_production_summary 
    WHERE date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);
END //
DELIMITER ;

-- =====================================================
-- EVENTOS PROGRAMADOS
-- =====================================================

-- Evento para calcular métricas diarias automáticamente
CREATE EVENT IF NOT EXISTS ev_daily_metrics_calculation
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURDATE() + INTERVAL 1 DAY, '01:00:00')
DO
  CALL sp_calculate_daily_metrics(CURDATE() - INTERVAL 1 DAY);

-- Evento para limpieza semanal
CREATE EVENT IF NOT EXISTS ev_weekly_cleanup
ON SCHEDULE EVERY 1 WEEK
STARTS TIMESTAMP(CURDATE() + INTERVAL 1 DAY, '02:00:00')
DO
  CALL sp_cleanup_old_report_data();

-- =====================================================
-- DATOS INICIALES PARA REPORTES
-- =====================================================

-- Insertar configuraciones de reportes predeterminadas
INSERT INTO report_configurations (name, report_type, filters, columns, is_public) VALUES
('Reporte Producción Estándar', 'PRODUCTION', 
 JSON_OBJECT('period', 30, 'includeCompleted', true), 
 JSON_ARRAY('machine', 'program', 'client', 'status', 'progress'), 
 true),
('Eficiencia Mensual', 'EFFICIENCY', 
 JSON_OBJECT('period', 30, 'minEfficiency', 70), 
 JSON_ARRAY('machine', 'efficiency', 'utilization', 'programs'), 
 true),
('Análisis de Clientes', 'CLIENTS', 
 JSON_OBJECT('period', 90, 'minPrograms', 5), 
 JSON_ARRAY('client', 'programs', 'kilos', 'completion_time'), 
 true)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Calcular métricas para los últimos 30 días
SET @start_date = DATE_SUB(CURDATE(), INTERVAL 30 DAY);
SET @end_date = CURDATE();

-- Loop para calcular métricas diarias
SET @current_date = @start_date;
WHILE @current_date <= @end_date DO
    CALL sp_calculate_daily_metrics(@current_date);
    SET @current_date = DATE_ADD(@current_date, INTERVAL 1 DAY);
END WHILE;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN DE REPORTES
-- =====================================================

-- Índices compuestos para consultas de reportes frecuentes
CREATE INDEX idx_machine_programs_reports ON machine_programs(machine_number, estado, fecha_inicio, kilos);
CREATE INDEX idx_machine_programs_client_reports ON machine_programs(cliente, estado, fecha_inicio);
CREATE INDEX idx_machine_programs_daily_reports ON machine_programs(fecha_inicio, estado, machine_number);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE MÉTRICAS
-- =====================================================

-- Trigger para actualizar métricas cuando se modifica un programa
DELIMITER //
CREATE TRIGGER tr_update_metrics_on_program_change
AFTER UPDATE ON machine_programs
FOR EACH ROW
BEGIN
    -- Solo actualizar si cambió el estado o el progreso
    IF OLD.estado != NEW.estado OR OLD.progreso != NEW.progreso THEN
        -- Actualizar métricas del día actual
        CALL sp_calculate_daily_metrics(CURDATE());
    END IF;
END //
DELIMITER ;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Reports schema created successfully' as status;
SELECT COUNT(*) as report_configs FROM report_configurations;
SELECT COUNT(*) as daily_summaries FROM daily_production_summary;
SELECT COUNT(*) as machine_metrics FROM machine_efficiency_metrics;

-- =====================================================
-- FIN DEL ESQUEMA DE REPORTES
-- =====================================================