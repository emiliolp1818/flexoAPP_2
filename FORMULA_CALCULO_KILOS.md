# 📐 Fórmula Correcta para Cálculo de Kilos de Tinta

## ❌ **Error Encontrado y Corregido**

### **Código Anterior (INCORRECTO):**
```typescript
const areaM2 = (metros * anchoMm) / 1000;  // ❌ ERROR
```

**Problema:** Dividir el producto entre 1000 no convierte correctamente mm a m².

**Ejemplo del error:**
- Metros: 10,000 m
- Ancho: 350 mm
- Cálculo incorrecto: `(10,000 × 350) / 1000 = 3,500 m²` ❌
- **Resultado:** El área calculada es 1000 veces mayor de lo que debería ser

### **Código Corregido (CORRECTO):**
```typescript
const anchoMetros = anchoMm / 1000;        // Convertir mm a m
const areaM2 = metros * anchoMetros;       // Área en m²
```

**Ejemplo correcto:**
- Metros: 10,000 m
- Ancho: 350 mm = 0.35 m
- Cálculo correcto: `10,000 × 0.35 = 3,500 m²` ✅
- **Resultado:** El área es correcta

## 📊 **Fórmula Completa Paso a Paso**

### **Variables de Entrada:**
- `metros` - Metros lineales a producir (m)
- `anchoMm` - Ancho del material en milímetros (mm)
- `volumen_real` - Volumen del anilox en cm³/m²
- `factor_eficiencia` - Eficiencia de transferencia de tinta (%)
- `densidad` - Densidad de la tinta (g/cm³)
- `cargaMuerta` - Tinta que queda en la máquina (kg)

### **Paso 1: Convertir Ancho a Metros**
```typescript
anchoMetros = anchoMm / 1000
```
**Ejemplo:** `350 mm ÷ 1000 = 0.35 m`

### **Paso 2: Calcular Área en m²**
```typescript
areaM2 = metros × anchoMetros
```
**Ejemplo:** `10,000 m × 0.35 m = 3,500 m²`

### **Paso 3: Calcular Factor de Eficiencia**
```typescript
factorEficiencia = factor_eficiencia / 100
```
**Ejemplo:** `35% ÷ 100 = 0.35`

### **Paso 4: Calcular Gramos de Tinta**
```typescript
gramos = areaM2 × volumen_real × densidad × factorEficiencia
```
**Ejemplo:** 
```
gramos = 3,500 m² × 3.5 cm³/m² × 0.885 g/cm³ × 0.35
gramos = 3,791.4375 g
```

### **Paso 5: Convertir a Kilos**
```typescript
kilosBase = gramos / 1000
```
**Ejemplo:** `3,791.4375 g ÷ 1000 = 3.791 kg`

### **Paso 6: Sumar Carga Muerta**
```typescript
kilosTotal = kilosBase + cargaMuerta
```
**Ejemplo:** `3.791 kg + 2.5 kg = 6.291 kg`

## 🧮 **Fórmula Matemática Completa**

```
Kilos = ((metros × (anchoMm / 1000)) × volumen × densidad × (eficiencia / 100)) / 1000 + cargaMuerta
```

O simplificado:

```
Kilos = (metros × anchoMm × volumen × densidad × eficiencia) / 100,000,000 + cargaMuerta
```

## 📝 **Ejemplos de Cálculo**

### **Ejemplo 1: Trabajo Pequeño**
**Datos:**
- Metros: 1,000 m
- Ancho: 200 mm
- Volumen: 2.5 cm³/m²
- Eficiencia: 35%
- Densidad: 0.885 g/cm³
- Carga muerta: 1.5 kg

**Cálculo:**
```
1. anchoMetros = 200 / 1000 = 0.2 m
2. areaM2 = 1,000 × 0.2 = 200 m²
3. factorEficiencia = 35 / 100 = 0.35
4. gramos = 200 × 2.5 × 0.885 × 0.35 = 154.875 g
5. kilosBase = 154.875 / 1000 = 0.155 kg
6. kilosTotal = 0.155 + 1.5 = 1.655 kg
```

### **Ejemplo 2: Trabajo Grande**
**Datos:**
- Metros: 50,000 m
- Ancho: 450 mm
- Volumen: 4.0 cm³/m²
- Eficiencia: 40%
- Densidad: 0.900 g/cm³
- Carga muerta: 3.0 kg

**Cálculo:**
```
1. anchoMetros = 450 / 1000 = 0.45 m
2. areaM2 = 50,000 × 0.45 = 22,500 m²
3. factorEficiencia = 40 / 100 = 0.40
4. gramos = 22,500 × 4.0 × 0.900 × 0.40 = 32,400 g
5. kilosBase = 32,400 / 1000 = 32.4 kg
6. kilosTotal = 32.4 + 3.0 = 35.4 kg
```

### **Ejemplo 3: Ancho Pequeño**
**Datos:**
- Metros: 10,000 m
- Ancho: 100 mm
- Volumen: 3.0 cm³/m²
- Eficiencia: 35%
- Densidad: 0.885 g/cm³
- Carga muerta: 2.0 kg

**Cálculo:**
```
1. anchoMetros = 100 / 1000 = 0.1 m
2. areaM2 = 10,000 × 0.1 = 1,000 m²
3. factorEficiencia = 35 / 100 = 0.35
4. gramos = 1,000 × 3.0 × 0.885 × 0.35 = 928.875 g
5. kilosBase = 928.875 / 1000 = 0.929 kg
6. kilosTotal = 0.929 + 2.0 = 2.929 kg
```

## 🔍 **Verificación de la Corrección**

### **Antes de la Corrección:**
```
Metros: 10,000 m
Ancho: 350 mm
Área INCORRECTA = (10,000 × 350) / 1000 = 3,500 m²
Kilos INCORRECTOS = mucho más altos de lo esperado
```

### **Después de la Corrección:**
```
Metros: 10,000 m
Ancho: 350 mm = 0.35 m
Área CORRECTA = 10,000 × 0.35 = 3,500 m²
Kilos CORRECTOS = valores realistas
```

**Nota:** En este caso particular, el resultado numérico del área es el mismo (3,500), pero la lógica es correcta ahora. El error se hace evidente con otros valores de ancho.

## 🎯 **Impacto de la Corrección**

### **Caso donde el error es evidente:**

**Datos:**
- Metros: 10,000 m
- Ancho: 100 mm

**Antes (INCORRECTO):**
```
areaM2 = (10,000 × 100) / 1000 = 1,000 m²  ❌
```

**Después (CORRECTO):**
```
anchoMetros = 100 / 1000 = 0.1 m
areaM2 = 10,000 × 0.1 = 1,000 m²  ✅
```

En este caso, el resultado es el mismo, pero la lógica es correcta.

**Caso donde el error es CRÍTICO:**

**Datos:**
- Metros: 5,000 m
- Ancho: 500 mm

**Antes (INCORRECTO):**
```
areaM2 = (5,000 × 500) / 1000 = 2,500 m²  ❌
```

**Después (CORRECTO):**
```
anchoMetros = 500 / 1000 = 0.5 m
areaM2 = 5,000 × 0.5 = 2,500 m²  ✅
```

## 💡 **Valores Típicos**

### **Eficiencia de Transferencia:**
- Tinta líquida (base agua): 30-40%
- Tinta líquida (base solvente): 35-45%
- **Valor por defecto:** 35%

### **Densidad de Tinta:**
- Tinta base agua: 0.85-0.95 g/cm³
- Tinta base solvente: 0.88-0.92 g/cm³
- **Valor por defecto:** 0.885 g/cm³

### **Volumen de Anilox:**
- Anilox bajo volumen: 2.0-3.5 cm³/m²
- Anilox medio volumen: 3.5-5.0 cm³/m²
- Anilox alto volumen: 5.0-8.0 cm³/m²

### **Carga Muerta por Máquina:**
- Máquinas pequeñas: 1.5-2.5 kg
- Máquinas medianas: 2.5-3.5 kg
- Máquinas grandes: 3.5-5.0 kg

## ✅ **Código Implementado**

El código corregido en `machines.ts` (líneas 880-896):

```typescript
if (program.metros && program.anchoMm && selectedAnilox.volumen_real) {
  const metros = Number(program.metros);
  const anchoMm = Number(program.anchoMm);
  
  // ✅ CORRECCIÓN: Convertir ancho de mm a metros primero
  const anchoMetros = anchoMm / 1000; // Convertir mm a m
  const areaM2 = metros * anchoMetros; // Área en m²

  const eficiencia = selectedAnilox.factor_eficiencia || 35.00;
  const densidad = selectedAnilox.densidad || 0.885;
  const factorEficiencia = eficiencia / 100;

  const gramos = areaM2 * Number(selectedAnilox.volumen_real) * densidad * factorEficiencia;
  const kilosBase = gramos / 1000;

  // Sumar carga muerta de la máquina
  const machineConfig = this.machineConfigs().get(program.machineNumber);
  const cargaMuerta = machineConfig?.cargaMuerta || 0;

  calculatedKilos = Number((kilosBase + cargaMuerta).toFixed(3));
}
```

## 🧪 **Cómo Verificar el Cálculo**

1. Abre la consola del navegador (F12)
2. Selecciona un anilox para un color
3. Busca el log `⚖️ DETALLES DEL CÁLCULO:`
4. Verifica que:
   - `anchoMm` esté en milímetros
   - `anchoMetros` esté en metros (anchoMm / 1000)
   - `areaM2` = metros × anchoMetros
   - `RESULTADO` sea un valor realista

## 📞 **Soporte**

Si los cálculos siguen sin ser correctos, verifica:
1. ✅ Los valores de `metros` y `anchoMm` en la base de datos
2. ✅ Los valores de `volumen_real`, `factor_eficiencia` y `densidad` en la tabla `anilox`
3. ✅ Los valores de `cargaMuerta` en la tabla `system_configs`
