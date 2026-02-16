# 🔧 Diagnóstico: Anilox y Cálculos de Kilos No Se Muestran

## ✅ Estado del Código

**CONFIRMADO:** Todas las funciones necesarias están implementadas correctamente en `machines.ts`:

- ✅ `onLineaturaChange` (línea 812) - Maneja cambio de lineatura
- ✅ `onAniloxChange` (línea 845) - Maneja cambio de anilox y **CALCULA KILOS AUTOMÁTICAMENTE**
- ✅ `onKilosChange` (línea 935) - Maneja cambio manual de kilos
- ✅ `getAvailableLineaturaForMachine` (línea 1065) - Obtiene lineaturas disponibles
- ✅ `getAniloxForMachine` (línea 1028) - Obtiene anilox filtrados por máquina y lineatura
- ✅ `getSelectedAnilox` (línea 798) - Obtiene el anilox seleccionado
- ✅ `getSelectedKilos` (línea 805) - Obtiene los kilos calculados
- ✅ `loadAllMachineAnilox` (línea 972) - Carga anilox desde el backend

## 🔍 Posibles Causas del Problema

### 1. **No hay datos de Anilox en la Base de Datos**

**Síntoma:** Los selectores de lineatura y volumen aparecen vacíos.

**Solución:**
1. Verifica que hay registros en la tabla `anilox` de la base de datos
2. Ejecuta esta consulta SQL:
   ```sql
   SELECT * FROM anilox WHERE maquina = 11;
   ```
3. Si no hay registros, necesitas importar anilox desde el módulo de diseño

### 2. **El Dropdown de Colores No Se Está Expandiendo**

**Síntoma:** No ves los selectores de anilox aunque hagas clic en el botón de colores.

**Cómo verificar:**
1. Abre la consola del navegador (F12)
2. Haz clic en el botón de número de colores de un programa
3. Busca estos logs:
   ```
   🔵 toggleColorsWithLoad LLAMADO
   📋 Cargando información de diseño desde BD
   ✅ Programa actualizado con información de diseño
   ```

**Si NO ves estos logs:**
- El evento click no se está propagando correctamente
- Revisa que el botón no esté deshabilitado

**Si SÍ ves los logs pero no se expande:**
- Verifica que `element.colores` tenga valores
- Revisa la consola por errores de Angular

### 3. **Falta el Campo `anchoMm` en los Programas**

**Síntoma:** Los cálculos no se ejecutan aunque selecciones anilox.

**Cómo verificar:**
1. Abre la consola del navegador
2. Selecciona un anilox
3. Busca este log:
   ```
   ⚠️ No se pudo realizar el cálculo automático. Faltan datos:
   ```

**Si ves este warning:**
- Verifica que el diseño en la tabla `designs` tenga el campo `ancho_mm` poblado
- El cálculo requiere: `metros`, `anchoMm`, y `volumen_real`

### 4. **El Backend No Está Retornando Anilox**

**Síntoma:** Los selectores están vacíos pero hay datos en la BD.

**Cómo verificar:**
1. Abre la consola del navegador
2. Ve a la pestaña "Network"
3. Busca llamadas a `/api/anilox/machine/11` (o el número de máquina que estés viendo)
4. Verifica que la respuesta tenga datos

**Si la respuesta está vacía:**
- Verifica el endpoint en el backend: `AniloxController.GetByMachine`
- Verifica que la columna `maquina` en la tabla `anilox` tenga valores correctos (11-21)

## 🧪 Pasos para Diagnosticar

### Paso 1: Verificar Datos en la Base de Datos

```sql
-- Verificar que hay anilox para la máquina 11
SELECT COUNT(*) as total_anilox FROM anilox WHERE maquina = 11;

-- Ver todos los anilox de la máquina 11
SELECT * FROM anilox WHERE maquina = 11 ORDER BY lineatura, volumen_real;

-- Verificar que los diseños tienen anchoMm
SELECT ArticleF, ancho_mm FROM designs WHERE ancho_mm IS NOT NULL LIMIT 10;
```

### Paso 2: Verificar Logs del Frontend

1. Abre la aplicación en el navegador
2. Abre la consola (F12 → Console)
3. Busca estos logs al cargar la página:
   ```
   🔵 ========== loadAllMachineAnilox INICIADO ==========
   ✅ Anilox por máquina cargados: Map(11) { ... }
   ```

4. Si ves `Map(11) { 11 => [], 12 => [], ... }` (arrays vacíos):
   - **Problema:** El backend no está retornando anilox
   - **Solución:** Verifica el endpoint del backend

5. Si ves `Map(11) { 11 => [Array(5)], 12 => [Array(3)], ... }`:
   - **Correcto:** Los anilox se están cargando

### Paso 3: Verificar Expansión del Dropdown

1. Haz clic en el botón de número de colores de un programa
2. Busca en la consola:
   ```
   🔵 toggleColorsWithLoad LLAMADO
   🎨 Abriendo dropdown de colores para programa: [OT SAP]
   📋 Cargando información de diseño desde BD para artículo: [ARTICULO]
   ✅ Programa actualizado con información de diseño desde BD
   ```

3. Si NO ves estos logs:
   - El evento click no se está ejecutando
   - Verifica que no haya errores de JavaScript

### Paso 4: Verificar Selección de Anilox

1. Expande el dropdown de colores
2. Selecciona una lineatura
3. Busca en la consola:
   ```
   🔵 ========== onLineaturaChange INICIADO ==========
   🔵 Lineatura seleccionada: [LPI] LPI
   📊 Anilox disponibles para Máquina [NUM] y Lineatura [LPI] LPI: [CANTIDAD]
   ```

4. Selecciona un volumen (anilox)
5. Busca en la consola:
   ```
   🔵 ========== onAniloxChange INICIADO ==========
   ✅ Anilox encontrado: { id: ..., codigo: ..., volumen_real: ... }
   ⚖️ DETALLES DEL CÁLCULO: { metros: ..., anchoMm: ..., ... }
   ✅ selectedAniloxData actualizado para [KEY]: [KILOS] kg
   ```

## 🔧 Soluciones Comunes

### Solución 1: Importar Anilox

Si no hay datos de anilox en la base de datos:

1. Ve al módulo de **Diseño**
2. Ve a la sección de **Anilox**
3. Importa el archivo Excel con los anilox
4. Verifica que se importaron correctamente

### Solución 2: Agregar `anchoMm` a los Diseños

Si los diseños no tienen `ancho_mm`:

1. Ve al módulo de **Diseño**
2. Edita cada diseño y agrega el valor de `Ancho (mm)`
3. O ejecuta un UPDATE masivo en la base de datos:
   ```sql
   UPDATE designs SET ancho_mm = [VALOR] WHERE ArticleF = '[ARTICULO]';
   ```

### Solución 3: Verificar Configuración de Máquinas

Si los cálculos no incluyen la carga muerta:

1. Verifica que la tabla `system_configs` tenga registros para cada máquina
2. Ejecuta:
   ```sql
   SELECT * FROM system_configs WHERE config_key LIKE 'machine_%_dead_load';
   ```

3. Si faltan registros, agrégalos:
   ```sql
   INSERT INTO system_configs (config_key, config_value, description)
   VALUES ('machine_11_dead_load', '2.5', 'Carga muerta de la máquina 11 en kg');
   ```

## 📊 Fórmula de Cálculo de Kilos

La fórmula implementada en `onAniloxChange` (línea 876-896) es:

```typescript
// 1. Calcular área en m²
const areaM2 = (metros * anchoMm) / 1000;

// 2. Obtener parámetros del anilox
const eficiencia = selectedAnilox.factor_eficiencia || 35.00; // %
const densidad = selectedAnilox.densidad || 0.885; // g/cm³
const factorEficiencia = eficiencia / 100;

// 3. Calcular gramos de tinta
const gramos = areaM2 * volumen_real * densidad * factorEficiencia;

// 4. Convertir a kilos
const kilosBase = gramos / 1000;

// 5. Sumar carga muerta de la máquina
const cargaMuerta = machineConfig?.cargaMuerta || 0;
const kilosTotal = kilosBase + cargaMuerta;
```

### Ejemplo de Cálculo

**Datos:**
- Metros: 10,000 m
- Ancho: 350 mm
- Volumen: 3.5 cm³/m²
- Eficiencia: 35%
- Densidad: 0.885 g/cm³
- Carga muerta: 2.5 kg

**Cálculo:**
```
Área = (10,000 * 350) / 1000 = 3,500 m²
Gramos = 3,500 * 3.5 * 0.885 * 0.35 = 3,791.44 g
Kilos base = 3,791.44 / 1000 = 3.791 kg
Kilos total = 3.791 + 2.5 = 6.291 kg
```

## 🎯 Checklist de Verificación

- [ ] Hay registros en la tabla `anilox` para las máquinas 11-21
- [ ] Los diseños tienen el campo `ancho_mm` poblado
- [ ] El backend está corriendo en `https://localhost:7001`
- [ ] El frontend está corriendo en `http://localhost:4200`
- [ ] La consola del navegador muestra logs de carga de anilox
- [ ] El dropdown de colores se expande al hacer clic
- [ ] Los selectores de lineatura muestran opciones
- [ ] Los selectores de volumen se habilitan al seleccionar lineatura
- [ ] Los kilos se calculan automáticamente al seleccionar anilox
- [ ] La tabla `system_configs` tiene las cargas muertas de las máquinas

## 📞 Siguiente Paso

**Por favor, realiza estos pasos:**

1. Abre la aplicación en el navegador
2. Abre la consola del navegador (F12)
3. Selecciona una máquina
4. Haz clic en el botón de número de colores de un programa
5. Copia y pega aquí TODOS los logs que aparezcan en la consola

Con esos logs podré identificar exactamente dónde está el problema.
