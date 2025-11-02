-- =====================================================
-- ESQUEMA DE BASE DE DATOS PARA PROGRAMAS DE MÁQUINAS
-- FlexoAPP - Sistema de Gestión Flexográfica
-- =====================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS flexoapp_production 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE flexoapp_production;

-- =====================================================
-- TABLA PRINCIPAL: machine_programs
-- =====================================================
CREATE TABLE IF NOT EXISTS machine_programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    machine_number INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    articulo VARCHAR(50) NOT NULL,
    ot_sap VARCHAR(50) NOT NULL UNIQUE,
    cliente VARCHAR(200) NOT NULL,
    referencia VARCHAR(500),
    td VARCHAR(3),
    colores JSON NOT NULL,
    sustrato VARCHAR(200),
    kilos DECIMAL(10,2) NOT NULL,
    estado ENUM('LISTO', 'SUSPENDIDO', 'CORRIENDO', 'TERMINADO') NOT NULL DEFAULT 'LISTO',
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NULL,
    progreso INT DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    observaciones TEXT,
    
    -- Información del operario
    last_action_by VARCHAR(100),
    last_action_at DATETIME,
    last_action VARCHAR(200),
    operator_name VARCHAR(100),
    
    -- Auditoría
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para optimización
    INDEX idx_machine_number (machine_number),
    INDEX idx_estado (estado),
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_ot_sap (ot_sap),
    INDEX idx_articulo (articulo),
    INDEX idx_cliente (cliente),
    INDEX idx_machine_estado (machine_number, estado),
    INDEX idx_last_action_at (last_action_at),
    
    -- Claves foráneas (si existe tabla de usuarios)
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLA: machine_program_actions
-- Historial de acciones realizadas en cada programa
-- =====================================================
CREATE TABLE IF NOT EXISTS machine_program_actions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    machine_number INT NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    operator_code VARCHAR(20),
    action_type ENUM('STATUS_CHANGE', 'CREATE', 'UPDATE', 'SUSPEND', 'RESUME', 'COMPLETE') NOT NULL,
    previous_state VARCHAR(20),
    new_state VARCHAR(20),
    description TEXT,
    observations TEXT,
    action_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Datos adicionales en JSON para flexibilidad
    additional_data JSON,
    
    -- Índices
    INDEX idx_program_id (program_id),
    INDEX idx_machine_number (machine_number),
    INDEX idx_operator_name (operator_name),
    INDEX idx_action_type (action_type),
    INDEX idx_action_timestamp (action_timestamp),
    INDEX idx_program_timestamp (program_id, action_timestamp),
    
    -- Clave foránea
    FOREIGN KEY (program_id) REFERENCES machine_programs(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: machine_operators
-- Información de operarios por máquina
-- =====================================================
CREATE TABLE IF NOT EXISTS machine_operators (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    area VARCHAR(50) DEFAULT 'Producción',
    shift ENUM('MAÑANA', 'TARDE', 'NOCHE') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    machine_numbers JSON, -- Array de números de máquinas asignadas
    
    -- Información adicional
    phone VARCHAR(20),
    email VARCHAR(100),
    hire_date DATE,
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_code (code),
    INDEX idx_shift (shift),
    INDEX idx_is_active (is_active),
    INDEX idx_name (name)
);

-- =====================================================
-- TABLA: machine_colors_design
-- Colores por artículo desde el módulo de diseño
-- =====================================================
CREATE TABLE IF NOT EXISTS machine_colors_design (
    id INT PRIMARY KEY AUTO_INCREMENT,
    articulo VARCHAR(50) NOT NULL UNIQUE,
    color_1 VARCHAR(100),
    color_2 VARCHAR(100),
    color_3 VARCHAR(100),
    color_4 VARCHAR(100),
    color_5 VARCHAR(100),
    color_6 VARCHAR(100),
    color_7 VARCHAR(100),
    color_8 VARCHAR(100),
    color_9 VARCHAR(100),
    color_10 VARCHAR(100),
    
    -- Metadatos
    design_created_by INT,
    design_updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_articulo (articulo),
    
    -- Clave foránea al módulo de diseño
    FOREIGN KEY (design_created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (design_updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABLA: machine_sync_log
-- Log de sincronización para tiempo real
-- =====================================================
CREATE TABLE IF NOT EXISTS machine_sync_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_type ENUM('PROGRAM_CREATED', 'PROGRAM_UPDATED', 'PROGRAM_DELETED', 'STATUS_CHANGED') NOT NULL,
    program_id INT,
    machine_number INT NOT NULL,
    data JSON NOT NULL,
    operator_name VARCHAR(100),
    sync_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    
    -- Índices para consultas rápidas
    INDEX idx_event_type (event_type),
    INDEX idx_machine_number (machine_number),
    INDEX idx_sync_timestamp (sync_timestamp),
    INDEX idx_processed (processed),
    INDEX idx_program_id (program_id)
);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de programas con información del operario
CREATE OR REPLACE VIEW v_machine_programs_with_operator AS
SELECT 
    mp.*,
    mo.name as operator_full_name,
    mo.code as operator_code,
    mo.shift as operator_shift,
    mo.area as operator_area
FROM machine_programs mp
LEFT JOIN machine_operators mo ON mp.last_action_by = mo.name
WHERE mp.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Vista de estadísticas por máquina
CREATE OR REPLACE VIEW v_machine_statistics AS
SELECT 
    machine_number,
    COUNT(*) as total_programs,
    SUM(CASE WHEN estado = 'LISTO' THEN 1 ELSE 0 END) as programs_ready,
    SUM(CASE WHEN estado = 'CORRIENDO' THEN 1 ELSE 0 END) as programs_running,
    SUM(CASE WHEN estado = 'SUSPENDIDO' THEN 1 ELSE 0 END) as programs_suspended,
    SUM(CASE WHEN estado = 'TERMINADO' THEN 1 ELSE 0 END) as programs_completed,
    AVG(progreso) as avg_progress,
    SUM(kilos) as total_kilos,
    MAX(last_action_at) as last_activity
FROM machine_programs 
GROUP BY machine_number;

-- Vista de acciones recientes
CREATE OR REPLACE VIEW v_recent_actions AS
SELECT 
    mpa.*,
    mp.articulo,
    mp.cliente,
    mp.ot_sap
FROM machine_program_actions mpa
JOIN machine_programs mp ON mpa.program_id = mp.id
WHERE mpa.action_timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY mpa.action_timestamp DESC;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento para cambiar estado de programa
DELIMITER //
CREATE PROCEDURE sp_change_program_status(
    IN p_program_id INT,
    IN p_new_status VARCHAR(20),
    IN p_operator_name VARCHAR(100),
    IN p_observations TEXT
)
BEGIN
    DECLARE v_old_status VARCHAR(20);
    DECLARE v_machine_number INT;
    
    -- Obtener estado actual
    SELECT estado, machine_number INTO v_old_status, v_machine_number
    FROM machine_programs 
    WHERE id = p_program_id;
    
    -- Actualizar programa
    UPDATE machine_programs 
    SET 
        estado = p_new_status,
        last_action_by = p_operator_name,
        last_action_at = NOW(),
        last_action = CONCAT('Cambio de estado: ', v_old_status, ' → ', p_new_status),
        observaciones = CASE WHEN p_new_status = 'SUSPENDIDO' THEN p_observations ELSE observaciones END,
        fecha_fin = CASE WHEN p_new_status = 'TERMINADO' THEN NOW() ELSE fecha_fin END,
        progreso = CASE 
            WHEN p_new_status = 'TERMINADO' THEN 100 
            WHEN p_new_status = 'CORRIENDO' AND progreso = 0 THEN 5 
            ELSE progreso 
        END,
        updated_at = NOW()
    WHERE id = p_program_id;
    
    -- Registrar acción
    INSERT INTO machine_program_actions (
        program_id, machine_number, operator_name, action_type, 
        previous_state, new_state, description, observations
    ) VALUES (
        p_program_id, v_machine_number, p_operator_name, 'STATUS_CHANGE',
        v_old_status, p_new_status, 
        CONCAT('Cambio de estado de ', v_old_status, ' a ', p_new_status),
        p_observations
    );
    
    -- Log de sincronización
    INSERT INTO machine_sync_log (
        event_type, program_id, machine_number, data, operator_name
    ) VALUES (
        'STATUS_CHANGED', p_program_id, v_machine_number,
        JSON_OBJECT('old_status', v_old_status, 'new_status', p_new_status, 'observations', p_observations),
        p_operator_name
    );
END //
DELIMITER ;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar operarios de ejemplo
INSERT INTO machine_operators (name, code, area, shift, machine_numbers) VALUES
('Carlos Rodríguez', 'CR001', 'Producción', 'MAÑANA', JSON_ARRAY(11, 12, 13)),
('María González', 'MG002', 'Producción', 'MAÑANA', JSON_ARRAY(14, 15, 16)),
('José Martínez', 'JM003', 'Producción', 'TARDE', JSON_ARRAY(17, 18, 19)),
('Ana López', 'AL004', 'Producción', 'TARDE', JSON_ARRAY(20, 21)),
('Pedro Sánchez', 'PS005', 'Producción', 'NOCHE', JSON_ARRAY(11, 12, 13, 14, 15)),
('Laura Herrera', 'LH006', 'Producción', 'NOCHE', JSON_ARRAY(16, 17, 18, 19, 20, 21))
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insertar colores de diseño de ejemplo
INSERT INTO machine_colors_design (articulo, color_1, color_2, color_3, color_4, color_5) VALUES
('F36085', 'Blanco', 'P_226 (Azul Corporativo)', 'P_877 (Rosa Suave)', 'P_326 (Verde Menta)', 'Transparente'),
('F36087', 'Blanco', 'Azul Serenity', 'Rosa Premium', 'Plateado', NULL),
('F34216', 'Blanco', 'Negro', 'P_7595 (Dorado Opita)', 'P_534 (Rojo Tradicional)', 'Verde Arroz'),
('F34217', 'Dorado Premium', 'Negro Intenso', 'Rojo Elegante', 'Blanco Puro', NULL),
('F35890', 'Azul Ariel', 'Blanco Detergente', 'Naranja Energía', 'Azul Marino', NULL),
('F36120', 'Café Juan Valdez', 'Dorado Gourmet', 'Blanco Café', 'Marrón Tostado', NULL)
ON DUPLICATE KEY UPDATE color_1 = VALUES(color_1);

-- =====================================================
-- TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- =====================================================

-- Trigger para log automático de cambios
DELIMITER //
CREATE TRIGGER tr_machine_programs_update 
AFTER UPDATE ON machine_programs
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO machine_sync_log (
            event_type, program_id, machine_number, data, operator_name
        ) VALUES (
            'STATUS_CHANGED', NEW.id, NEW.machine_number,
            JSON_OBJECT(
                'old_status', OLD.estado, 
                'new_status', NEW.estado,
                'program_name', NEW.name,
                'articulo', NEW.articulo
            ),
            NEW.last_action_by
        );
    END IF;
END //
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_machine_estado_fecha ON machine_programs(machine_number, estado, fecha_inicio);
CREATE INDEX idx_estado_progreso ON machine_programs(estado, progreso);
CREATE INDEX idx_cliente_articulo ON machine_programs(cliente, articulo);

-- =====================================================
-- CONFIGURACIÓN DE CHARSET Y COLLATION
-- =====================================================
ALTER DATABASE flexoapp_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================
ALTER TABLE machine_programs COMMENT = 'Tabla principal de programas de máquinas flexográficas';
ALTER TABLE machine_program_actions COMMENT = 'Historial de acciones realizadas en programas';
ALTER TABLE machine_operators COMMENT = 'Información de operarios asignados a máquinas';
ALTER TABLE machine_colors_design COMMENT = 'Colores por artículo desde el módulo de diseño';
ALTER TABLE machine_sync_log COMMENT = 'Log de eventos para sincronización en tiempo real';

-- =====================================================
-- VERIFICACIÓN DE INTEGRIDAD
-- =====================================================
SELECT 'Schema created successfully' as status;
SELECT COUNT(*) as operators_count FROM machine_operators;
SELECT COUNT(*) as colors_count FROM machine_colors_design;

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================