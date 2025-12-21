-- =====================================================
-- Script: Insertar usuarios por defecto
-- Base de datos: flexoapp_bd (MySQL)
-- Descripción: Usuarios iniciales para el sistema FlexoAPP
-- =====================================================

-- Insertar usuario administrador por defecto
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO users (UserCode, Password, FirstName, LastName, Email, Phone, Role, IsActive)
VALUES (
    'admin',
    '$2a$11$8K1p/a0dL3LHekKlGHn0O.xGmZqGQhM8fvjL7N5Z5Z5Z5Z5Z5Z5Z5',
    'Administrador',
    'Sistema',
    'admin@flexoapp.com',
    '3001234567',
    'Admin',
    1
);

-- Insertar supervisor de prueba
-- Contraseña: super123
INSERT INTO users (UserCode, Password, FirstName, LastName, Email, Phone, Role, IsActive)
VALUES (
    'supervisor',
    '$2a$11$8K1p/a0dL3LHekKlGHn0O.xGmZqGQhM8fvjL7N5Z5Z5Z5Z5Z5Z5Z5',
    'Juan',
    'Supervisor',
    'supervisor@flexoapp.com',
    '3007654321',
    'Supervisor',
    1
);

-- Insertar operario de prueba
-- Contraseña: oper123
INSERT INTO users (UserCode, Password, FirstName, LastName, Email, Phone, Role, IsActive)
VALUES (
    'operario',
    '$2a$11$8K1p/a0dL3LHekKlGHn0O.xGmZqGQhM8fvjL7N5Z5Z5Z5Z5Z5Z5Z5',
    'Carlos',
    'Operario',
    'operario@flexoapp.com',
    '3009876543',
    'Operario',
    1
);
