# Instrucciones para Probar la Integración con Tabla de Diseño

## 🔍 Diagnóstico del Problema

Si la información de la tabla `designs` no se está usando al cargar el Excel, sigue estos pasos:

### Paso 1: Verificar que la tabla designs tiene datos

Ejecuta el script SQL: `backend/Database/test_designs_table.sql`

```bash
mysql -u root -p flexoapp_bd < backend/Database/test_designs_table.sql
```

Esto te mostrará:
- Si la tabla existe
- Cuántos registros tiene
- Los primeros 10 registros
- Los códigos de artículo disponibles

### Paso 2: Probar el endpoint de búsqueda

Usa el nuevo endpoint de prueba para verificar si un artículo específico se encuentra:

```
GET http://localhost:5000/api/maquinas/test-design/F204567
```

Reemplaza `F204567` con el código de artículo que estás probando.

Este endpoint te dirá:
- ✅ Si el artículo existe en la tabla designs
- 📊 Cuántos diseños hay en total
- 🎨 Los colores del diseño
- 📋 Toda la información del diseño
- 💡 Ejemplos de artículos si no se encuentra

### Paso 3: Revisar los logs del backend

Cuando subas un archivo Excel, revisa los logs del backend. Deberías ver:

```
🔍 Buscando artículo 'F204567' en tabla de diseño...
📊 Total de diseños en tabla: 150
✅ Artículo 'F204567' encontrado en tabla de diseño
📋 Diseño encontrado: ID=1, Cliente=ABSORBENTES, Sustrato=BOPP, Colores=4
🎨 Colores del diseño: C1=CYAN, C2=MAGENTA, C3=YELLOW, C4=BLACK
```

O si NO se encuentra:

```
🔍 Buscando artículo 'F999999' en tabla de diseño...
📊 Total de diseños en tabla: 150
⚠️ Artículo 'F999999' NO encontrado en tabla de diseño
📋 Ejemplos de artículos en tabla designs: F204567, F205123, F206789...
```

