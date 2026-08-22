# Lógica de Importación de Excel

## Resumen

Al importar un archivo Excel con programas de máquinas, el sistema sigue una lógica específica para mantener la integridad de los datos y preservar el trabajo en curso.

## Flujo de Importación

### 1. Limpieza Previa (Antes de Importar)

El sistema elimina automáticamente los programas con estados inactivos:

- **TERMINADO**: Programas que ya completaron su producción
- **SIN_ASIGNAR** (null o vacío): Programas que nunca fueron asignados a producción

**Razón**: Estos programas ya no son relevantes y deben ser reemplazados por los nuevos datos del Excel.

```
🗑️ Eliminando programas TERMINADOS...
🗑️ Eliminando programas SIN ASIGNAR...
```

### 2. Preservación de Estados Activos

Los programas con estados activos **NO se eliminan** y se actualizan preservando su información:

#### Estados Protegidos:
- **PREPARANDO**: Programa en preparación
- **LISTO**: Programa listo para producción
- **CORRIENDO**: Programa en producción activa
- **SUSPENDIDO**: Programa suspendido temporalmente

#### Datos Preservados:
- Estado actual
- Observaciones (mensajes y motivos de suspensión)
- Última acción (usuario y fecha)
- Fecha de inicio de preparación

#### Datos Actualizados:
- Cliente
- Referencia
- TD
- Tipo de impresión
- Número de colores
- Colores (array JSON)
- Kilos
- Metros
- Fecha de tinta en máquina
- Sustrato
- Posición en el Excel (orden)

### 3. Lógica de Actualización

```
SI el artículo existe en la base de datos:
  SI tiene estado protegido (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO):
    ✅ Mantener estado y observaciones
    ✅ Actualizar datos del programa (cliente, kilos, etc.)
    ✅ Actualizar posición según el nuevo Excel
  SINO:
    ⚠️ El programa fue eliminado en la limpieza previa
    🆕 Se creará como nuevo programa SIN_ASIGNAR
SINO:
  🆕 Crear nuevo programa con estado SIN_ASIGNAR
```

## Ejemplos

### Ejemplo 1: Programa en Producción

**Antes de importar:**
```
OT: OT123456
Artículo: F12345
Estado: CORRIENDO
Observaciones: "Producción normal"
Kilos: 1000
```

**Después de importar (Excel tiene el mismo artículo con 1500 kilos):**
```
OT: OT123456
Artículo: F12345
Estado: CORRIENDO ✅ (preservado)
Observaciones: "Producción normal" ✅ (preservado)
Kilos: 1500 ✅ (actualizado)
```

### Ejemplo 2: Programa Terminado

**Antes de importar:**
```
OT: OT123457
Artículo: F12346
Estado: TERMINADO
```

**Después de importar:**
```
🗑️ Programa eliminado (estado TERMINADO)
```

Si el Excel contiene el mismo artículo:
```
OT: OT123457
Artículo: F12346
Estado: SIN_ASIGNAR 🆕 (nuevo programa)
```

### Ejemplo 3: Programa Suspendido

**Antes de importar:**
```
OT: OT123458
Artículo: F12347
Estado: SUSPENDIDO
Observaciones: "Falta material"
```

**Después de importar:**
```
OT: OT123458
Artículo: F12347
Estado: SUSPENDIDO ✅ (preservado)
Observaciones: "Falta material" ✅ (preservado)
Datos actualizados según Excel ✅
```

## Ventajas de esta Lógica

1. **No se pierde trabajo en curso**: Los programas activos mantienen su estado
2. **Mensajes preservados**: Las observaciones y motivos de suspensión no se borran
3. **Actualización automática**: Los datos del programa se actualizan con la información más reciente
4. **Limpieza automática**: Los programas terminados se eliminan automáticamente
5. **Orden actualizado**: La posición de los programas se actualiza según el nuevo Excel

## Logs del Sistema

Durante la importación, el sistema genera logs detallados:

```
🧹 Iniciando limpieza de programas TERMINADOS y SIN ASIGNAR...
🗑️ 5 programas TERMINADOS eliminados
🗑️ 3 programas SIN ASIGNAR eliminados
✅ Limpieza completada. Total eliminados: 8
📝 Los programas con estados PREPARANDO, LISTO, CORRIENDO y SUSPENDIDO se mantendrán y actualizarán

📊 Procesando hoja PROGRAMA CC...
🛡️ OT OT123456: Estado protegido 'CORRIENDO' preservado. Observaciones: 'Producción normal'
🆕 OT OT123459: Nuevo programa cargado como 'Sin asignar'
✅ Importación completada: 15 registros creados, 0 errores
```

## Consideraciones Importantes

1. **Backup recomendado**: Aunque la lógica es segura, se recomienda hacer backup antes de importar
2. **Verificar Excel**: Asegúrate de que el Excel tenga la hoja "PROGRAMA CC"
3. **Orden importa**: El orden de los programas en el Excel determina su posición en el sistema
4. **Estados protegidos**: Solo PREPARANDO, LISTO, CORRIENDO y SUSPENDIDO se preservan
5. **Mensajes importantes**: Los mensajes en observaciones se mantienen para estados protegidos

## Código Relacionado

- `MaquinasController.cs` - Método `ImportFromExcelMultiSheet()`
- `MaquinasController.cs` - Método `ProcessProgramaCCWorksheet()`
- Estados protegidos definidos en línea 1778
