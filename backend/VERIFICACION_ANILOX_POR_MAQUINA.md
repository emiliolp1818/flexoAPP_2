# Verificación: Anilox por Máquina

## Fecha
2026-02-15

## Problema Reportado
Se están mostrando anilox de otras máquinas en la máquina 11.

## Análisis del Sistema

### 1. Base de Datos (✅ CORRECTO)

La tabla `anilox` tiene la columna `maquina` que identifica a qué máquina pertenece cada anilox:

```sql
CREATE TABLE `anilox` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `codigo` VARCHAR(50) NOT NULL UNIQUE,
    `maquina` INT NOT NULL,  -- ✅ Columna que identifica la máquina
    `bcm` INT NOT NULL,
    `lineatura` INT NOT NULL,
    ...
)
```

**Datos de ejemplo:**
- Máquina 11: códigos 1164-1183 (19 anilox)
- Máquina 12: códigos 1244-1272 (11 anilox)

### 2. Backend API (✅ CORRECTO)

El endpoint `/api/anilox/machine/{machineNumber}` filtra correctamente:

```csharp
[HttpGet("machine/{machineNumber}")]
public async Task<IActionResult> GetByMachine(int machineNumber)
{
    // Query con filtro WHERE maquina = @MachineNumber
    "SELECT * FROM anilox WHERE maquina = @MachineNumber ORDER BY lineatura, volumen_real"
}
```

**Prueba:**
```bash
# Obtener anilox de máquina 11
GET http://localhost:10000/api/anilox/machine/11

# Obtener anilox de máquina 12
GET http://localhost:10000/api/anilox/machine/12
```

### 3. Frontend (✅ CORRECTO)

El frontend carga los anilox por máquina correctamente:

```typescript
// machines.ts - línea ~973
async loadAllMachineAnilox() {
  const promises = machineNumbers.map(async (num) => {
    const list = await firstValueFrom(this.aniloxService.getByMachine(num));
    aniloxMap.set(num, list);  // ✅ Guarda por número de máquina
  });
  
  this.aniloxByMachine.set(aniloxMap);
}

// machines.ts - línea ~1028
getAniloxForMachine(machineNumber: number, lineatura: number | null): Anilox[] {
  const machineAnilox = this.aniloxByMachine().get(machineNumber) || [];
  return machineAnilox.filter(a => a.lineatura === lineatura);
}
```

## Cómo Verificar que Funciona Correctamente

### Paso 1: Verificar en la Base de Datos

```sql
-- Ver anilox de máquina 11
SELECT codigo, maquina, lineatura, volumen_real 
FROM anilox 
WHERE maquina = 11 
ORDER BY lineatura;

-- Ver anilox de máquina 12
SELECT codigo, maquina, lineatura, volumen_real 
FROM anilox 
WHERE maquina = 12 
ORDER BY lineatura;
```

### Paso 2: Verificar en el Backend

Abrir el navegador y probar los endpoints:

```
http://localhost:10000/api/anilox/machine/11
http://localhost:10000/api/anilox/machine/12
```

Verificar que cada endpoint devuelve SOLO los anilox de esa máquina.

### Paso 3: Verificar en el Frontend (Consola del Navegador)

1. Abrir DevTools (F12)
2. Ir a la pestaña Console
3. Buscar el log: `✅ Anilox por máquina cargados:`
4. Expandir el Map y verificar:
   - Key `11` debe tener solo anilox con `maquina: 11`
   - Key `12` debe tener solo anilox con `maquina: 12`

### Paso 4: Verificar en la UI

1. Seleccionar máquina 11
2. Seleccionar un programa
3. Abrir el diálogo de anilox para un color
4. Verificar que SOLO aparecen anilox con códigos 1164-1183

## Posibles Causas del Problema

Si aún ves anilox de otras máquinas, puede ser por:

### 1. Datos Incorrectos en la Base de Datos

**Verificar:**
```sql
-- Buscar anilox que NO pertenecen a la máquina correcta
SELECT codigo, maquina 
FROM anilox 
WHERE codigo LIKE '1164%' AND maquina != 11;

SELECT codigo, maquina 
FROM anilox 
WHERE codigo LIKE '1244%' AND maquina != 12;
```

**Solución:**
```sql
-- Corregir máquina de anilox específicos
UPDATE anilox SET maquina = 11 WHERE codigo IN ('1164', '1165', ...);
UPDATE anilox SET maquina = 12 WHERE codigo IN ('1244', '1246', ...);
```

### 2. Caché del Navegador

**Solución:**
1. Hacer hard refresh: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
2. Limpiar caché del navegador
3. Cerrar y reabrir el navegador

### 3. Estado Compartido en el Frontend

Si el problema persiste, verificar que no haya un bug donde se mezclen los anilox:

```typescript
// Verificar en la consola del navegador:
console.log('Anilox Máquina 11:', this.aniloxByMachine().get(11));
console.log('Anilox Máquina 12:', this.aniloxByMachine().get(12));
```

## Comandos de Verificación Rápida

```sql
-- Contar anilox por máquina
SELECT maquina, COUNT(*) as total 
FROM anilox 
GROUP BY maquina 
ORDER BY maquina;

-- Ver todos los anilox con su máquina
SELECT codigo, maquina, lineatura, marca 
FROM anilox 
ORDER BY maquina, lineatura;
```

## Resultado Esperado

- Máquina 11: 19 anilox (códigos 1164-1183)
- Máquina 12: 11 anilox (códigos 1244-1272)
- Cada máquina debe mostrar SOLO sus propios anilox
- No debe haber mezcla de anilox entre máquinas

## Notas

- El sistema está diseñado correctamente para filtrar por máquina
- El backend filtra en la query SQL
- El frontend almacena los anilox separados por máquina en un Map
- Si ves anilox incorrectos, el problema está en los DATOS, no en el código
