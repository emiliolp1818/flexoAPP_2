# Bugfix Requirements Document

## Introduction

La importación de programación desde "Planta 2" (formato 2) vía `POST /maquinas/import/formato2` elimina programas con estados protegidos (PREPARANDO, LISTO, SUSPENDIDO), no crea backups, no usa transacciones apropiadas, no mantiene control de cantidades/orden, y no ejecuta las mismas protecciones que el flujo normal de importación (`POST /maquinas/import/excel-multisheet`). Esto causa pérdida de datos de producción en curso y elimina pedidos que están siendo trabajados activamente.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a Planta 2 Excel file is imported via `/maquinas/import/formato2` THEN the system deletes ALL programs per machine except those with states CORRIENDO and TERMINADO, including programs with protected states PREPARANDO, LISTO, and SUSPENDIDO

1.2 WHEN a Planta 2 Excel file is imported THEN the system does NOT create a backup of existing programs before performing deletions

1.3 WHEN a Planta 2 Excel file is imported and an existing OT has a protected state (PREPARANDO, LISTO, SUSPENDIDO) THEN the system deletes the program and re-inserts it without preserving its state, observations, last_action_by, last_action_at, or preparando_started_at

1.4 WHEN a Planta 2 Excel file is imported THEN the system does NOT wrap the operations in a proper database transaction with rollback capability, using only EF Core SaveChangesAsync without explicit transaction management

1.5 WHEN a Planta 2 Excel file is imported THEN the system does NOT track the `orden_excel` column for maintaining the order from the Excel file

1.6 WHEN a Planta 2 Excel file is imported successfully THEN the system does NOT notify connected clients via SignalR about the import

1.7 WHEN a Planta 2 Excel file is imported successfully THEN the system does NOT save the last upload timestamp in system_configs

### Expected Behavior (Correct)

2.1 WHEN a Planta 2 Excel file is imported via `/maquinas/import/formato2` THEN the system SHALL only delete programs with states TERMINADO and SIN_ASIGNAR (NULL or empty), preserving programs with protected states PREPARANDO, LISTO, CORRIENDO, and SUSPENDIDO

2.2 WHEN a Planta 2 Excel file is imported THEN the system SHALL create a backup of all existing programs into the `maquinas_backup` table before performing any deletions

2.3 WHEN a Planta 2 Excel file is imported and an existing OT has a protected state (PREPARANDO, LISTO, SUSPENDIDO, CORRIENDO) THEN the system SHALL only update the Excel data fields (articulo, cliente, referencia, td, tipo_impresion, kilos, metros, etc.) while preserving the state, observations, last_action_by, last_action_at, and preparando_started_at

2.4 WHEN a Planta 2 Excel file is imported THEN the system SHALL wrap all database operations in an explicit transaction and rollback all changes if any critical error occurs

2.5 WHEN a Planta 2 Excel file is imported THEN the system SHALL assign and track `orden_excel` values for each imported row to maintain the order from the Excel file

2.6 WHEN a Planta 2 Excel file is imported successfully THEN the system SHALL notify all connected clients via SignalR using the same notification mechanism as the normal import

2.7 WHEN a Planta 2 Excel file is imported successfully THEN the system SHALL save the last upload timestamp in the `system_configs` table with key 'last_excel_upload'

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a Planta 2 Excel file is imported THEN the system SHALL CONTINUE TO filter rows by Planta 2 and only process machines 11-21

3.2 WHEN a Planta 2 Excel file is imported THEN the system SHALL CONTINUE TO parse the Excel columns (Maquina, ArticuloF, Cliente, OT, Cant Producir, Metros, Inicio, etc.) using the existing flexible column detection logic

3.3 WHEN a Planta 2 Excel file is imported with duplicate OT SAP values THEN the system SHALL CONTINUE TO generate unique OT identifiers to avoid conflicts

3.4 WHEN the normal Excel import (`/maquinas/import/excel-multisheet`) is executed THEN the system SHALL CONTINUE TO function identically without any changes to its behavior

3.5 WHEN a Planta 2 Excel file is imported THEN the system SHALL CONTINUE TO return the import result with totalRead, totalCreated, totalErrors, and machinesProcessed counts

3.6 WHEN a Planta 2 Excel file has invalid format or missing required columns THEN the system SHALL CONTINUE TO return appropriate error messages without modifying any data
