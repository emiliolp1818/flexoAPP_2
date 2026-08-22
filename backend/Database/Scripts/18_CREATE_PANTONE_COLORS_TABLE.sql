-- =====================================================
-- Script 18: Crear tabla pantone_colors
-- Compatible con MySQL 8.0+ (Local y Railway)
-- =====================================================

CREATE TABLE IF NOT EXISTS pantone_colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    hex VARCHAR(10) NOT NULL DEFAULT '#000000',
    rgb_r INT NOT NULL DEFAULT 0,
    rgb_g INT NOT NULL DEFAULT 0,
    rgb_b INT NOT NULL DEFAULT 0,
    cmyk_c INT NOT NULL DEFAULT 0,
    cmyk_m INT NOT NULL DEFAULT 0,
    cmyk_y INT NOT NULL DEFAULT 0,
    cmyk_k INT NOT NULL DEFAULT 0,
    lab_l DOUBLE NULL,
    lab_a DOUBLE NULL,
    lab_b DOUBLE NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Manual',
    color_type VARCHAR(20) NOT NULL DEFAULT 'pantone',
    is_custom TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_pantone_code (code),
    INDEX idx_pantone_type (color_type),
    INDEX idx_pantone_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Insertar colores base - Heptacromía (8 colores base)
-- INSERT IGNORE evita duplicados por el UNIQUE en code
-- =====================================================

INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('Black', ' Black', 'Negro', '#000000', 0, 0, 0, 0, 0, 0, 100, 'Black', 'heptacromia', 0),
('White', ' White', 'Blanco', '#FFFFFF', 255, 255, 255, 0, 0, 0, 0, 'White', 'heptacromia', 0),
('Cyan', ' Cyan', 'Cyan', '#00AEEF', 0, 174, 239, 100, 0, 0, 0, 'Cyan', 'heptacromia', 0),
('Magenta', ' Magenta', 'Magenta', '#EC008C', 236, 0, 140, 0, 100, 0, 0, 'Pink', 'heptacromia', 0),
('Yellow', ' Yellow', 'Amarillo', '#FFF200', 255, 242, 0, 0, 0, 100, 0, 'Yellow', 'heptacromia', 0),
('Green', ' Green', 'Verde', '#00A651', 0, 166, 81, 100, 0, 51, 35, 'Green', 'heptacromia', 0),
('Orange', ' Orange', 'Naranja', '#FF6900', 255, 105, 0, 0, 59, 100, 0, 'Orange', 'heptacromia', 0),
('Violet', ' Violet', 'Violeta', '#8B3F8F', 139, 63, 143, 3, 56, 0, 44, 'Purple', 'heptacromia', 0);

-- =====================================================
-- Pantones Rojos
-- =====================================================
INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('185', 'Pantone 185 C', 'P 185', '#E4002B', 228, 0, 43, 0, 100, 81, 11, 'Red', 'pantone', 0),
('186', 'Pantone 186 C', 'P 186', '#CE1126', 206, 17, 38, 0, 92, 82, 19, 'Red', 'pantone', 0),
('187', 'Pantone 187 C', 'P 187', '#A6192E', 166, 25, 46, 0, 85, 72, 35, 'Red', 'pantone', 0),
('193', 'Pantone 193 C', 'P 193', '#BF0D3E', 191, 13, 62, 0, 93, 68, 25, 'Red', 'pantone', 0),
('200', 'Pantone 200 C', 'P 200', '#C4004A', 196, 0, 74, 0, 100, 62, 23, 'Red', 'pantone', 0),
('485', 'Pantone 485 C', 'P 485', '#DA020E', 218, 2, 14, 0, 99, 94, 15, 'Red', 'pantone', 0),
('1788', 'Pantone 1788 C', 'P 1788', '#EE2C2C', 238, 44, 44, 0, 84, 77, 0, 'Red', 'pantone', 0),
('1797', 'Pantone 1797 C', 'P 1797', '#C8102E', 200, 16, 46, 0, 92, 77, 22, 'Red', 'pantone', 0);

-- =====================================================
-- Pantones Rosados
-- =====================================================
INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('210', 'Pantone 210 C', 'P 210', '#F9A7B0', 249, 167, 176, 0, 42, 17, 0, 'Pink', 'pantone', 0),
('212', 'Pantone 212 C', 'P 212', '#F25278', 242, 82, 120, 0, 73, 35, 0, 'Pink', 'pantone', 0);

-- =====================================================
-- Pantones Amarillos
-- =====================================================
INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('012', 'Pantone 012 C', 'P 012', '#FFD100', 255, 209, 0, 0, 18, 100, 0, 'Yellow', 'pantone', 0),
('100', 'Pantone 100 C', 'P 100', '#F6EB61', 246, 235, 97, 0, 0, 57, 0, 'Yellow', 'pantone', 0),
('102', 'Pantone 102 C', 'P 102', '#FCE300', 252, 227, 0, 0, 0, 95, 0, 'Yellow', 'pantone', 0),
('109', 'Pantone 109 C', 'P 109', '#FFD700', 255, 215, 0, 0, 16, 100, 0, 'Yellow', 'pantone', 0),
('116', 'Pantone 116 C', 'P 116', '#FFCD00', 255, 205, 0, 0, 20, 100, 0, 'Yellow', 'pantone', 0),
('123', 'Pantone 123 C', 'P 123', '#FFC82E', 255, 200, 46, 0, 19, 89, 0, 'Yellow', 'pantone', 0),
('7548', 'Pantone 7548 C', 'P 7548', '#FFC72C', 255, 199, 44, 0, 22, 91, 0, 'Yellow', 'pantone', 0);

-- =====================================================
-- Pantones Naranjas
-- =====================================================
INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('1375', 'Pantone 1375 C', 'P 1375', '#FF9E1B', 255, 158, 27, 0, 38, 89, 0, 'Orange', 'pantone', 0),
('1505', 'Pantone 1505 C', 'P 1505', '#FF6900', 255, 105, 0, 0, 56, 90, 0, 'Orange', 'pantone', 0),
('021', 'Pantone 021 C', 'P 021', '#FE5000', 254, 80, 0, 0, 69, 100, 0, 'Orange', 'pantone', 0),
('165', 'Pantone 165 C', 'P 165', '#FF6A39', 255, 106, 57, 0, 58, 78, 0, 'Orange', 'pantone', 0);

-- =====================================================
-- Pantones Verdes
-- =====================================================
INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('347', 'Pantone 347 C', 'P 347', '#009639', 0, 150, 57, 100, 0, 62, 41, 'Green', 'pantone', 0),
('348', 'Pantone 348 C', 'P 348', '#00843D', 0, 132, 61, 100, 0, 54, 48, 'Green', 'pantone', 0),
('355', 'Pantone 355 C', 'P 355', '#00B140', 0, 177, 64, 100, 0, 100, 5, 'Green', 'pantone', 0),
('356', 'Pantone 356 C', 'P 356', '#007A33', 0, 122, 51, 100, 0, 58, 52, 'Green', 'pantone', 0),
('368', 'Pantone 368 C', 'P 368', '#64A70B', 100, 167, 11, 40, 0, 93, 35, 'Green', 'pantone', 0),
('376', 'Pantone 376 C', 'P 376', '#84BD00', 132, 189, 0, 55, 0, 100, 5, 'Green', 'pantone', 0),
('3405', 'Pantone 3405 C', 'P 3405', '#00B140', 0, 177, 64, 100, 0, 64, 31, 'Green', 'pantone', 0),
('7739', 'Pantone 7739 C', 'P 7739', '#319B42', 49, 155, 66, 68, 0, 57, 39, 'Green', 'pantone', 0);

-- =====================================================
-- Pantones Azules
-- =====================================================
INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('072', 'Pantone 072 C', 'P 072', '#10069F', 16, 6, 159, 90, 100, 0, 2, 'Blue', 'pantone', 0),
('280', 'Pantone 280 C', 'P 280', '#012169', 1, 33, 105, 99, 69, 0, 59, 'Blue', 'pantone', 0),
('285', 'Pantone 285 C', 'P 285', '#0072CE', 0, 114, 206, 74, 43, 0, 0, 'Blue', 'pantone', 0),
('286', 'Pantone 286 C', 'P 286', '#0033A0', 0, 51, 160, 100, 68, 0, 37, 'Blue', 'pantone', 0),
('293', 'Pantone 293 C', 'P 293', '#00539F', 0, 83, 159, 100, 48, 0, 38, 'Blue', 'pantone', 0),
('299', 'Pantone 299 C', 'P 299', '#00A3E0', 0, 163, 224, 100, 27, 0, 12, 'Blue', 'pantone', 0),
('300', 'Pantone 300 C', 'P 300', '#005EB8', 0, 94, 184, 100, 49, 0, 28, 'Blue', 'pantone', 0),
('2748', 'Pantone 2748 C', 'P 2748', '#001489', 0, 20, 137, 100, 85, 0, 46, 'Blue', 'pantone', 0),
('2925', 'Pantone 2925 C', 'P 2925', '#009CDE', 0, 156, 222, 100, 30, 0, 13, 'Blue', 'pantone', 0),
('2935', 'Pantone 2935 C', 'P 2935', '#0057B8', 0, 87, 184, 100, 53, 0, 28, 'Blue', 'pantone', 0),
('Reflex Blue', 'Pantone Reflex Blue', 'P Reflex Blue', '#001489', 0, 20, 137, 100, 82, 0, 46, 'Blue', 'pantone', 0);

-- =====================================================
-- Pantones Morados
-- =====================================================
INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('258', 'Pantone 258 C', 'P 258', '#8E5294', 142, 82, 148, 4, 45, 0, 42, 'Purple', 'pantone', 0),
('268', 'Pantone 268 C', 'P 268', '#6D2077', 109, 32, 119, 8, 73, 0, 53, 'Purple', 'pantone', 0),
('269', 'Pantone 269 C', 'P 269', '#5C068C', 92, 6, 140, 34, 96, 0, 45, 'Purple', 'pantone', 0);

-- =====================================================
-- Pantones Grises
-- =====================================================
INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('Cool Gray 5', 'Pantone Cool Gray 5 C', 'P CG 5', '#B1B3B3', 177, 179, 179, 0, 0, 0, 30, 'Gray', 'pantone', 0),
('Cool Gray 7', 'Pantone Cool Gray 7 C', 'P CG 7', '#97999B', 151, 153, 155, 0, 0, 0, 39, 'Gray', 'pantone', 0),
('Cool Gray 9', 'Pantone Cool Gray 9 C', 'P CG 9', '#75787B', 117, 120, 123, 0, 0, 0, 52, 'Gray', 'pantone', 0),
('Cool Gray 11', 'Pantone Cool Gray 11 C', 'P CG 11', '#53565A', 83, 86, 90, 0, 0, 0, 65, 'Gray', 'pantone', 0);

-- =====================================================
-- Pantones Metálicos
-- =====================================================
INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('877', 'Pantone 877 C', 'P 877', '#8A8D8F', 138, 141, 143, 3, 1, 0, 44, 'Metallic', 'pantone', 0),
('871', 'Pantone 871 C', 'P 871', '#84754E', 132, 117, 78, 0, 11, 41, 48, 'Metallic', 'pantone', 0);

-- =====================================================
-- Otros Pantones
-- =====================================================
INSERT IGNORE INTO pantone_colors (code, name, display_name, hex, rgb_r, rgb_g, rgb_b, cmyk_c, cmyk_m, cmyk_y, cmyk_k, category, color_type, is_custom) VALUES
('7506', 'Pantone 7506 C', 'P 7506', '#EFDBB2', 239, 219, 178, 0, 8, 26, 6, 'Beige', 'pantone', 0),
('7595', 'Pantone 7595 C', 'P 7595', '#C4622D', 196, 98, 45, 0, 50, 77, 23, 'Brown', 'pantone', 0);
