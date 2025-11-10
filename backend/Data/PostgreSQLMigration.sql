-- ============================================
-- MIGRACIÓN COMPLETA A POSTGRESQL
-- FlexoAPP Database Schema
-- ============================================

-- Eliminar tablas existentes si existen (solo para desarrollo)
DROP TABLE IF EXISTS "Activities" CASCADE;
DROP TABLE IF EXISTS "machine_programs" CASCADE;
DROP TABLE IF EXISTS "maquinas" CASCADE;
DROP TABLE IF EXISTS "pedidos" CASCADE;
DROP TABLE IF EXISTS "designs" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- ============================================
-- TABLA: Users (Usuarios del Sistema)
-- ============================================
CREATE TABLE "Users" (
    "Id" SERIAL PRIMARY KEY,
    "UserCode" VARCHAR(50) NOT NULL UNIQUE,
    "Password" VARCHAR(255) NOT NULL,
    "FirstName" VARCHAR(50),
    "LastName" VARCHAR(50),
    "Role" VARCHAR(50) NOT NULL,
    "Permissions" JSONB,
    "ProfileImage" TEXT,
    "ProfileImageUrl" VARCHAR(500),
    "Phone" VARCHAR(20),
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para Users
CREATE INDEX "IX_Users_Role" ON "Users"("Role");
CREATE INDEX "IX_Users_IsActive" ON "Users"("IsActive");
CREATE INDEX "IX_Users_UserCode" ON "Users"("UserCode");

-- ============================================
-- TABLA: designs (Diseños Flexográficos)
-- ============================================
CREATE TABLE "designs" (
    "Id" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(255),
    "cliente" VARCHAR(255),
    "referencia" VARCHAR(255),
    "td" VARCHAR(10),
    "color 1" VARCHAR(100),
    "color 2" VARCHAR(100),
    "color 3" VARCHAR(100),
    "color 4" VARCHAR(100),
    "color 5" VARCHAR(100),
    "color 6" VARCHAR(100),
    "color 7" VARCHAR(100),
    "color 8" VARCHAR(100),
    "color 9" VARCHAR(100),
    "color 10" VARCHAR(100),
    "sustrato" VARCHAR(100),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: pedidos (Pedidos de Clientes)
-- ============================================
CREATE TABLE "pedidos" (
    "Id" SERIAL PRIMARY KEY,
    "MachineNumber" INTEGER NOT NULL,
    "NumeroPedido" VARCHAR(50) NOT NULL UNIQUE,
    "Articulo" VARCHAR(50) NOT NULL,
    "Cliente" VARCHAR(200) NOT NULL,
    "Descripcion" VARCHAR(500),
    "Cantidad" DECIMAL(10,2) NOT NULL,
    "Unidad" VARCHAR(50) DEFAULT 'kg',
    "Estado" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    "FechaPedido" TIMESTAMP NOT NULL,
    "FechaEntrega" TIMESTAMP,
    "Prioridad" VARCHAR(20) DEFAULT 'NORMAL',
    "Observaciones" VARCHAR(1000),
    "AsignadoA" VARCHAR(100),
    "FechaAsignacion" TIMESTAMP,
    "CreatedBy" INTEGER,
    "UpdatedBy" INTEGER,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_pedidos_users_CreatedBy" FOREIGN KEY ("CreatedBy") REFERENCES "Users"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_pedidos_users_UpdatedBy" FOREIGN KEY ("UpdatedBy") REFERENCES "Users"("Id") ON DELETE SET NULL
);

-- Índices para pedidos
CREATE INDEX "IX_pedidos_MachineNumber" ON "pedidos"("MachineNumber");
CREATE INDEX "IX_pedidos_Estado" ON "pedidos"("Estado");
CREATE INDEX "IX_pedidos_FechaPedido" ON "pedidos"("FechaPedido");
CREATE INDEX "IX_pedidos_Prioridad" ON "pedidos"("Prioridad");
CREATE INDEX "IX_pedidos_MachineNumber_Estado" ON "pedidos"("MachineNumber", "Estado");
CREATE INDEX "IX_pedidos_Cliente_Estado" ON "pedidos"("Cliente", "Estado");
CREATE INDEX "IX_pedidos_NumeroPedido" ON "pedidos"("NumeroPedido");

-- ============================================
-- TABLA: machine_programs (Programas de Máquinas)
-- ============================================
CREATE TABLE "machine_programs" (
    "Id" SERIAL PRIMARY KEY,
    "MachineNumber" INTEGER NOT NULL,
    "Name" VARCHAR(200) NOT NULL,
    "Articulo" VARCHAR(50) NOT NULL,
    "OtSap" VARCHAR(50) NOT NULL UNIQUE,
    "Cliente" VARCHAR(200) NOT NULL,
    "Referencia" VARCHAR(500) DEFAULT '',
    "Td" VARCHAR(3) DEFAULT '',
    "Colores" JSONB NOT NULL,
    "Sustrato" VARCHAR(200) DEFAULT '',
    "Kilos" DECIMAL(10,2) NOT NULL,
    "Estado" VARCHAR(20) NOT NULL DEFAULT 'LISTO',
    "FechaInicio" TIMESTAMP NOT NULL,
    "FechaFin" TIMESTAMP,
    "Progreso" INTEGER NOT NULL DEFAULT 0,
    "Observaciones" VARCHAR(1000),
    "LastActionBy" VARCHAR(100),
    "LastActionAt" TIMESTAMP,
    "LastAction" VARCHAR(200),
    "OperatorName" VARCHAR(100),
    "CreatedBy" INTEGER,
    "UpdatedBy" INTEGER,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_machine_programs_users_CreatedBy" FOREIGN KEY ("CreatedBy") REFERENCES "Users"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_machine_programs_users_UpdatedBy" FOREIGN KEY ("UpdatedBy") REFERENCES "Users"("Id") ON DELETE SET NULL
);

-- Índices para machine_programs
CREATE INDEX "IX_machine_programs_MachineNumber" ON "machine_programs"("MachineNumber");
CREATE INDEX "IX_machine_programs_Estado" ON "machine_programs"("Estado");
CREATE INDEX "IX_machine_programs_FechaInicio" ON "machine_programs"("FechaInicio");
CREATE INDEX "IX_machine_programs_MachineNumber_Estado" ON "machine_programs"("MachineNumber", "Estado");
CREATE INDEX "IX_machine_programs_OtSap" ON "machine_programs"("OtSap");

-- ============================================
-- TABLA: maquinas (Máquinas Flexográficas)
-- ============================================
CREATE TABLE "maquinas" (
    "Id" SERIAL PRIMARY KEY,
    "NumeroMaquina" INTEGER NOT NULL,
    "Articulo" VARCHAR(50) NOT NULL,
    "OtSap" VARCHAR(50) NOT NULL,
    "Cliente" VARCHAR(200) NOT NULL,
    "Referencia" VARCHAR(100),
    "Td" VARCHAR(10),
    "NumeroColores" INTEGER NOT NULL,
    "Colores" JSONB NOT NULL,
    "Kilos" DECIMAL(10,2) NOT NULL,
    "FechaTintaEnMaquina" TIMESTAMP NOT NULL,
    "Sustrato" VARCHAR(100) NOT NULL,
    "Estado" VARCHAR(20) NOT NULL DEFAULT 'LISTO',
    "Observaciones" VARCHAR(1000),
    "LastActionBy" VARCHAR(100),
    "LastActionAt" TIMESTAMP,
    "CreatedBy" INTEGER,
    "UpdatedBy" INTEGER,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_maquinas_users_CreatedBy" FOREIGN KEY ("CreatedBy") REFERENCES "Users"("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_maquinas_users_UpdatedBy" FOREIGN KEY ("UpdatedBy") REFERENCES "Users"("Id") ON DELETE SET NULL
);

-- Índices para maquinas
CREATE INDEX "IX_maquinas_NumeroMaquina" ON "maquinas"("NumeroMaquina");
CREATE INDEX "IX_maquinas_Estado" ON "maquinas"("Estado");
CREATE INDEX "IX_maquinas_FechaTintaEnMaquina" ON "maquinas"("FechaTintaEnMaquina");
CREATE INDEX "IX_maquinas_NumeroMaquina_Estado" ON "maquinas"("NumeroMaquina", "Estado");
CREATE INDEX "IX_maquinas_OtSap" ON "maquinas"("OtSap");
CREATE INDEX "IX_maquinas_Cliente" ON "maquinas"("Cliente");

-- ============================================
-- TABLA: Activities (Auditoría del Sistema)
-- ============================================
CREATE TABLE "Activities" (
    "Id" SERIAL PRIMARY KEY,
    "Action" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(500) NOT NULL,
    "Module" VARCHAR(100) NOT NULL,
    "Details" VARCHAR(1000),
    "UserCode" VARCHAR(50),
    "IpAddress" VARCHAR(45),
    "UserId" INTEGER,
    "Timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_Activities_users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

-- Índices para Activities
CREATE INDEX "IX_Activities_UserId" ON "Activities"("UserId");
CREATE INDEX "IX_Activities_Module" ON "Activities"("Module");
CREATE INDEX "IX_Activities_Timestamp" ON "Activities"("Timestamp");
CREATE INDEX "IX_Activities_UserId_Timestamp" ON "Activities"("UserId", "Timestamp");

-- ============================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ============================================

-- Función para actualizar UpdatedAt automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabla
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON "designs"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON "pedidos"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machine_programs_updated_at BEFORE UPDATE ON "machine_programs"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maquinas_updated_at BEFORE UPDATE ON "maquinas"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar usuario administrador por defecto
INSERT INTO "Users" ("UserCode", "Password", "FirstName", "LastName", "Role", "Permissions", "IsActive")
VALUES (
    'admin',
    '$2a$11$YourHashedPasswordHere',  -- Será reemplazado por SeedData.cs
    'Administrador',
    'del Sistema',
    'Admin',
    '["read","write","delete","admin"]'::jsonb,
    TRUE
) ON CONFLICT ("UserCode") DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Database schema created successfully!' AS status;
