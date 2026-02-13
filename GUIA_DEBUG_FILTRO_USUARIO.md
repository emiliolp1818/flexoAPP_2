# 🔍 GUÍA DE DEBUG - Filtro de Usuario en Reportes

## Fecha: 2026-02-07

---

## 🎯 Problema Reportado

El filtro de búsqueda por usuario no está funcionando correctamente:
- No está filtrando por el usuario solicitado
- Está mostrando todos los usuarios
- No respeta las fechas seleccionadas

---

## ✅ Mejoras Implementadas

### 1. **Logs de Debug Mejorados**

Se agregaron logs detallados en dos métodos clave:

#### `onUserSearch()` (líneas 374-428)
- Log del término de búsqueda
- Log cuando se encuentra usuario por código exacto
- Log cuando se encuentra usuario único
- Log del `userId` después de configurarlo
- Log cuando hay múltiples resultados o ninguno

#### `loadActivities()` (líneas 201-240)
- Log de inicio de carga
- Log de filtros del formulario
- Log del `userId` y su tipo
- Log del `userSearchText` actual
- Log detallado cuando se aplica filtro de usuario
- Log de información del usuario seleccionado
- Log cuando NO se aplica filtro de usuario
- Log de parámetros enviados al backend

---

## 🧪 PASOS PARA PROBAR Y DEBUG

### Paso 1: Abrir la Consola del Navegador

1. Abre la aplicación en el navegador
2. Presiona **F12** para abrir las DevTools
3. Ve a la pestaña **Console**
4. Limpia la consola (botón 🚫 o Ctrl+L)

### Paso 2: Ir al Módulo de Reportes

1. Navega al módulo de **Reportes/Auditoría**
2. Observa los logs iniciales de carga

### Paso 3: Buscar un Usuario

1. En el campo **"Código Usuario"**, escribe un código de usuario (ej: `123`)
2. **OBSERVA LA CONSOLA** - Deberías ver:
   ```
   🔍 onUserSearch - Término de búsqueda: 123
   ✅ Usuario encontrado por código exacto: {id: X, userCode: "123", ...}
   ✅ Configurando userId en formulario: X
   ✅ userId después de patchValue: X
   ```

### Paso 4: Aplicar Filtro

1. Haz clic en el botón **"Buscar"** (o presiona Enter)
2. **OBSERVA LA CONSOLA** - Deberías ver:
   ```
   🔍 ===== INICIO CARGA DE ACTIVIDADES =====
   🔍 Filtros del formulario: {userId: X, startDate: ..., endDate: ...}
   🔍 userId del formulario: X
   🔍 Tipo de userId: number
   🔍 userSearchText actual: 123
   ✅ FILTRO DE USUARIO APLICADO - userId: X
   ✅ Usuario seleccionado: {id: X, code: "123", name: "..."}
   📤 Parámetros enviados al backend: {page: 1, pageSize: 1000, userId: X, ...}
   ```

### Paso 5: Verificar Respuesta del Backend

1. Después de los logs anteriores, deberías ver:
   ```
   📊 Respuesta completa del backend: {...}
   📊 Total de actividades recibidas: N
   ```

2. **IMPORTANTE**: Verifica que el número de actividades sea el esperado para ese usuario

---

## 🔍 ESCENARIOS DE DEBUG

### Escenario 1: Usuario NO se selecciona automáticamente

**Síntomas:**
- Escribes el código del usuario
- No ves el log `✅ Usuario encontrado por código exacto`

**Posibles causas:**
1. El código de usuario no existe en la lista
2. El código tiene espacios o caracteres extra
3. La lista de usuarios no se cargó correctamente

**Solución:**
- Verifica en la consola el log `🔍 onUserSearch - Término de búsqueda: XXX`
- Compara con los códigos de usuario disponibles

### Escenario 2: Usuario se selecciona pero NO se aplica el filtro

**Síntomas:**
- Ves el log `✅ Usuario encontrado por código exacto`
- Ves el log `✅ userId después de patchValue: X`
- Pero al hacer clic en "Buscar", ves `⚠️ SIN FILTRO DE USUARIO`

**Posibles causas:**
1. El `userId` se está perdiendo entre `onUserSearch()` y `loadActivities()`
2. El formulario se está reseteando

**Solución:**
- Verifica el log `🔍 userId del formulario: X` en `loadActivities()`
- Si es `null` o `undefined`, hay un problema con el formulario

### Escenario 3: Filtro se aplica pero el backend devuelve todos los registros

**Síntomas:**
- Ves el log `✅ FILTRO DE USUARIO APLICADO - userId: X`
- Ves el log `📤 Parámetros enviados al backend: {userId: X, ...}`
- Pero recibes muchas actividades (más de las esperadas)

**Posibles causas:**
1. El backend no está respetando el filtro `userId`
2. El parámetro se está enviando incorrectamente

**Solución:**
- Verifica el log `📤 Parámetros enviados al backend`
- Verifica en la pestaña **Network** del navegador la petición HTTP
- Revisa el backend (C#) para ver si está procesando el parámetro `userId`

---

## 🐛 PROBLEMAS CONOCIDOS Y SOLUCIONES

### Problema 1: El campo de búsqueda no dispara `onUserSearch()`

**Solución:**
- Verifica que el HTML tenga `(input)="onUserSearch()"`
- Verifica que no haya errores de JavaScript en la consola

### Problema 2: El botón "Buscar" no hace nada

**Solución:**
- Verifica que el botón tenga `(click)="applyFilters()"`
- Verifica que `applyFilters()` llame a `loadActivities()`

### Problema 3: Las fechas no se están aplicando

**Solución:**
- Verifica los logs `✅ FILTRO DE FECHA INICIO` y `✅ FILTRO DE FECHA FIN`
- Verifica que las fechas estén en formato ISO en los parámetros

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de reportar un problema, verifica:

- [ ] La consola del navegador está abierta
- [ ] No hay errores de JavaScript en la consola
- [ ] Los logs de `onUserSearch()` aparecen al escribir
- [ ] Los logs de `loadActivities()` aparecen al hacer clic en "Buscar"
- [ ] El `userId` se configura correctamente (log `✅ userId después de patchValue`)
- [ ] El `userId` se mantiene al hacer clic en "Buscar" (log `🔍 userId del formulario`)
- [ ] Los parámetros se envían correctamente al backend (log `📤 Parámetros enviados`)
- [ ] La respuesta del backend contiene las actividades esperadas

---

## 📞 INFORMACIÓN PARA REPORTAR

Si el problema persiste, copia y pega los siguientes logs:

1. **Logs de búsqueda de usuario:**
   ```
   [Copiar todos los logs que empiezan con 🔍 o ✅ de onUserSearch]
   ```

2. **Logs de carga de actividades:**
   ```
   [Copiar todos los logs desde "===== INICIO CARGA DE ACTIVIDADES =====" hasta "Total de actividades recibidas"]
   ```

3. **Información del usuario buscado:**
   - Código de usuario: ___________
   - Fecha inicio: ___________
   - Fecha fin: ___________
   - Actividades esperadas: ___________
   - Actividades recibidas: ___________

---

## 🔧 CÓDIGO MODIFICADO

### Archivos modificados:
- `reports.ts` (líneas 201-240, 374-428)

### Cambios realizados:
1. ✅ Agregados logs detallados en `onUserSearch()`
2. ✅ Agregados logs detallados en `loadActivities()`
3. ✅ Verificación del `userId` después de `patchValue()`
4. ✅ Log del tipo de dato del `userId`
5. ✅ Log de información del usuario seleccionado

---

**Última actualización**: 2026-02-07 11:48
**Estado**: Mejoras implementadas - Listo para pruebas
**Acción requerida**: Probar y copiar logs de la consola
