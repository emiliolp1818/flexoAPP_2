# 🧪 Guía de Pruebas - Módulo de Reportes Mejorado

## Fecha: 2026-02-06

---

## 📋 Pre-requisitos

Antes de comenzar las pruebas, asegúrate de que:

- ✅ El backend está corriendo (puerto 5000 o el configurado)
- ✅ El frontend está corriendo (puerto 4200)
- ✅ Tienes acceso a la aplicación con credenciales válidas
- ✅ Hay datos de actividades en la base de datos

---

## 🚀 Pasos para Acceder al Módulo

1. **Abrir navegador**: `http://localhost:4200`
2. **Iniciar sesión** con tus credenciales
3. **Navegar** al módulo de "Reportes" o "Auditoría" (en el menú lateral)

---

## ✅ Checklist de Pruebas

### 1️⃣ Filtro de Búsqueda por Código de Usuario

**Objetivo**: Verificar que se puede buscar por código numérico

**Pasos**:
1. En el campo "Usuario (Opcional)", escribir un código numérico (ej: `54190`)
2. Verificar que aparece en el dropdown de autocompletado
3. Probar búsqueda parcial (ej: `541`)
4. Verificar que muestra todos los usuarios cuyo código contiene "541"

**Resultado Esperado**:
```
✅ Búsqueda por código completo funciona
✅ Búsqueda parcial funciona
✅ Autocompletado muestra: "54190 - Nombre Apellido"
```

**Captura de pantalla**: `test_1_filtro_usuario.png`

---

### 2️⃣ Cargar Actividades

**Objetivo**: Verificar que se cargan las actividades correctamente

**Pasos**:
1. Hacer clic en el botón de búsqueda (🔍)
2. Esperar a que carguen las actividades
3. Verificar que aparecen los módulos con actividades

**Resultado Esperado**:
```
✅ Spinner de carga aparece
✅ Se muestran módulos con actividades
✅ Contador de actividades por módulo es correcto
```

**Captura de pantalla**: `test_2_actividades_cargadas.png`

---

### 3️⃣ Expandir Módulo de Máquinas

**Objetivo**: Verificar que el módulo de máquinas muestra estadísticas correctas

**Pasos**:
1. Hacer clic en el módulo "Máquinas" para expandirlo
2. Verificar que aparecen las estadísticas principales

**Resultado Esperado**:
```
✅ Pedidos Completados: [número] (solo pedidos con estado LISTO)
✅ Tiempo Total: [h:m:s] (suma de tiempos en LISTO)
✅ Tiempo Promedio: [h:m:s] (tiempo total ÷ pedidos)
✅ Promedio de Colores: [número] (total colores ÷ pedidos)
```

**Ejemplo**:
```
📊 Pedidos Completados: 25
⏱️ Tiempo Total: 12h 30m 45s
📈 Tiempo Promedio: 30m 3s
🎨 Promedio de Colores: 4.0
```

**Captura de pantalla**: `test_3_estadisticas_maquinas.png`

---

### 4️⃣ Verificar Tarjetas de Pedido

**Objetivo**: Verificar que las tarjetas muestran información correcta

**Pasos**:
1. Revisar la sección "Detalle de Pedidos Completados"
2. Verificar cada tarjeta de pedido

**Resultado Esperado - Campos Visibles**:
```
✅ Artículo: [código del artículo]
✅ OT SAP: [número de orden]
✅ Descripción: [descripción del pedido]
✅ Número de Máquina: [número]
✅ Tiempo en LISTO: [h:m:s] (NO "Duración Total")
✅ Número de Colores: [número] (solo Pantone)
```

**Captura de pantalla**: `test_4_tarjeta_pedido.png`

---

### 5️⃣ Verificar Historial de Estados

**Objetivo**: Verificar que el historial muestra información del usuario

**Pasos**:
1. En una tarjeta de pedido, revisar la sección "Historial de Estados"
2. Verificar cada estado en el historial

**Resultado Esperado - Para cada estado**:
```
✅ Fecha y hora: DD/MM/YYYY HH:mm
✅ Estado: PREPARANDO / LISTO / CORRIENDO / SUSPENDIDO / TERMINADO
✅ Color del estado:
   - PREPARANDO: Naranja (#f97316)
   - LISTO: Verde (#16a34a)
   - CORRIENDO: Azul (#2196f3)
   - SUSPENDIDO: Rojo (#dc2626)
   - TERMINADO: Gris (#64748b)
✅ Duración: SOLO visible para estado LISTO (en verde)
✅ Información de usuario: "Usuario: [código] - [nombre]"
```

**Ejemplo de Historial**:
```
📅 06/02/2026 08:00
🟠 PREPARANDO
   Usuario: 54190 - Juan Pérez

📅 06/02/2026 09:30
🟢 LISTO  2h 30m 15s
   Usuario: 54190 - Juan Pérez

📅 06/02/2026 12:00
🔵 CORRIENDO
   Usuario: 54190 - Juan Pérez
```

**Captura de pantalla**: `test_5_historial_estados.png`

---

### 6️⃣ Verificar Formato de Tiempo

**Objetivo**: Verificar que el tiempo se muestra en formato h:m:s

**Pasos**:
1. Revisar todos los tiempos mostrados en el módulo
2. Verificar que el formato es correcto

**Resultado Esperado**:
```
✅ Menos de 1 minuto: "45s"
✅ Menos de 1 hora: "15m 30s"
✅ Más de 1 hora: "2h 30m 15s"
✅ Más de 1 día: "25h 15m 30s"
```

**Captura de pantalla**: `test_6_formato_tiempo.png`

---

### 7️⃣ Verificar Solo Tiempo de LISTO

**Objetivo**: Confirmar que NO se muestra tiempo de TERMINADO

**Pasos**:
1. Buscar en el historial estados "TERMINADO"
2. Verificar que NO tienen duración visible
3. Verificar que solo estados "LISTO" tienen duración

**Resultado Esperado**:
```
✅ Estados LISTO: Muestran duración en verde
✅ Estados TERMINADO: NO muestran duración
✅ Estados PREPARANDO: NO muestran duración
✅ Estados CORRIENDO: NO muestran duración
✅ Estados SUSPENDIDO: NO muestran duración (pero sí motivo)
```

**Captura de pantalla**: `test_7_solo_tiempo_listo.png`

---

### 8️⃣ Verificar Número de Colores Pantone

**Objetivo**: Confirmar que solo se cuentan colores Pantone

**Pasos**:
1. Revisar el campo "Número de Colores" en las tarjetas
2. Comparar con los datos reales del diseño
3. Verificar que solo cuenta colores tipo Pantone

**Resultado Esperado**:
```
✅ Solo cuenta colores Pantone
✅ No cuenta otros tipos de colores
✅ El número coincide con la base de datos
```

**Nota**: Para verificar esto, puedes:
- Consultar directamente la base de datos
- Revisar el diseño en el módulo de diseños
- Verificar en la consola del navegador los logs de colores Pantone

**Captura de pantalla**: `test_8_colores_pantone.png`

---

### 9️⃣ Verificar Cálculo de Promedio de Colores

**Objetivo**: Confirmar que el promedio se calcula correctamente

**Pasos**:
1. Anotar el "Total de Colores" sumando todos los colores de las tarjetas
2. Anotar el "Total de Pedidos Completados"
3. Calcular manualmente: Total Colores ÷ Total Pedidos
4. Comparar con el "Promedio de Colores" mostrado

**Ejemplo de Cálculo**:
```
Pedido 1: 4 colores
Pedido 2: 3 colores
Pedido 3: 5 colores
Pedido 4: 4 colores

Total Colores: 4 + 3 + 5 + 4 = 16
Total Pedidos: 4
Promedio: 16 ÷ 4 = 4.0
```

**Resultado Esperado**:
```
✅ El promedio mostrado coincide con el cálculo manual
✅ Fórmula: Total Colores ÷ Total Pedidos
```

**Captura de pantalla**: `test_9_promedio_colores.png`

---

### 🔟 Verificar Pedidos Completados

**Objetivo**: Confirmar que solo se cuentan pedidos con estado LISTO

**Pasos**:
1. Revisar todas las tarjetas de pedido
2. Contar manualmente cuántas tienen al menos un estado LISTO
3. Comparar con el contador "Pedidos Completados"

**Resultado Esperado**:
```
✅ Solo se cuentan pedidos con estado LISTO en su historial
✅ Pedidos sin estado LISTO NO se cuentan
✅ El contador coincide con el conteo manual
```

**Captura de pantalla**: `test_10_pedidos_completados.png`

---

## 🐛 Pruebas de Casos Especiales

### Caso 1: Sin Actividades
**Pasos**:
1. Seleccionar un rango de fechas sin actividades
2. Hacer clic en "Buscar"

**Resultado Esperado**:
```
✅ Mensaje: "No se encontraron actividades con los filtros seleccionados"
✅ No se muestran tarjetas vacías
```

---

### Caso 2: Usuario Sin Actividades
**Pasos**:
1. Buscar un usuario que no tenga actividades
2. Hacer clic en "Buscar"

**Resultado Esperado**:
```
✅ Mensaje: "No se encontraron actividades"
✅ No se muestran módulos
```

---

### Caso 3: Pedido Sin Colores Pantone
**Pasos**:
1. Buscar un pedido que no tenga colores Pantone

**Resultado Esperado**:
```
✅ Número de Colores: 0 o "-"
✅ No afecta el promedio de colores
```

---

### Caso 4: Pedido Sin Estado LISTO
**Pasos**:
1. Verificar que pedidos sin estado LISTO no aparecen

**Resultado Esperado**:
```
✅ No aparecen en la lista de pedidos completados
✅ No se cuentan en las estadísticas
```

---

## 📊 Consola del Navegador

Para ver información de depuración:

1. Abrir DevTools (F12)
2. Ir a la pestaña "Console"
3. Buscar logs con estos prefijos:
   - `🎨` - Información de colores Pantone
   - `🔧` - Estadísticas de máquinas
   - `📊` - Actividades cargadas
   - `✅` - Operaciones exitosas
   - `⚠️` - Advertencias

**Logs Importantes**:
```javascript
🎨 Total de colores Pantone: [número]
🔧 Total de pedidos únicos con estado LISTO: [número]
🔧 Tiempo Total (segundos): [número]
🔧 Promedio de colores (total colores / total pedidos): [número]
```

---

## 📸 Capturas de Pantalla Requeridas

Para documentar las pruebas, tomar capturas de:

1. ✅ `test_1_filtro_usuario.png` - Filtro de búsqueda
2. ✅ `test_2_actividades_cargadas.png` - Módulos cargados
3. ✅ `test_3_estadisticas_maquinas.png` - Estadísticas principales
4. ✅ `test_4_tarjeta_pedido.png` - Tarjeta de pedido completa
5. ✅ `test_5_historial_estados.png` - Historial con usuario
6. ✅ `test_6_formato_tiempo.png` - Formato de tiempo
7. ✅ `test_7_solo_tiempo_listo.png` - Solo LISTO con tiempo
8. ✅ `test_8_colores_pantone.png` - Número de colores
9. ✅ `test_9_promedio_colores.png` - Cálculo de promedio
10. ✅ `test_10_pedidos_completados.png` - Contador de pedidos

---

## ✅ Checklist Final

Después de completar todas las pruebas, verificar:

- [ ] Filtro de usuario por código funciona
- [ ] Se muestran estadísticas correctas
- [ ] Tarjetas muestran "Tiempo en LISTO" (no "Duración Total")
- [ ] Formato de tiempo es h:m:s
- [ ] Historial muestra código y nombre de usuario
- [ ] Solo estados LISTO muestran duración
- [ ] Solo se cuentan colores Pantone
- [ ] Promedio de colores usa fórmula correcta
- [ ] Solo se cuentan pedidos con estado LISTO
- [ ] Tiempo total suma solo tiempos de LISTO

---

## 🚨 Problemas Conocidos

Si encuentras alguno de estos problemas, reportar:

1. **No se muestran actividades**: Verificar que hay datos en la base de datos
2. **Colores no se cargan**: Verificar endpoint `/designs/pantone-colors/{articulo}`
3. **Tiempos en 0**: Verificar que las actividades tienen campo `duration`
4. **Usuario no aparece**: Verificar que las actividades tienen campo `user`

---

## 📞 Soporte

Si encuentras algún error o comportamiento inesperado:

1. Tomar captura de pantalla del error
2. Copiar logs de la consola del navegador
3. Anotar los pasos para reproducir el error
4. Reportar con toda la información

---

## 🎯 Resultado Esperado Final

Al completar todas las pruebas, el módulo debe:

✅ Permitir búsqueda por código de usuario
✅ Mostrar estadísticas precisas basadas en estado LISTO
✅ Mostrar información del usuario en cada acción
✅ Usar formato de tiempo h:m:s
✅ Contar solo colores Pantone
✅ Calcular correctamente todos los promedios

---

**Fecha de creación**: 2026-02-06
**Versión**: 1.0
**Módulo**: Reportes de Máquinas
