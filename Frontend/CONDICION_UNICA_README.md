# Condición Única - Instrucciones de Uso

## ✅ Funcionalidades Implementadas

### 1. **Nuevo Registro**
- Botón "Nuevo Registro" completamente funcional
- Abre un diálogo modal con formulario reactivo
- Validaciones en todos los campos requeridos
- Guarda el registro en la base de datos
- Recarga automáticamente la tabla después de crear

### 2. **Exportar a Excel (CSV)**
- Botón "Exportar" completamente funcional
- Genera archivo CSV compatible con Excel
- Incluye todos los registros filtrados
- Formato UTF-8 con BOM para caracteres especiales
- Nombre de archivo con timestamp automático

### 3. **Editar Registro**
- Botón de editar en cada fila
- Abre diálogo con datos pre-cargados
- Actualiza el registro en la base de datos
- Recarga automáticamente la tabla

### 4. **Eliminar Registro**
- Botón de eliminar en cada fila
- Solicita confirmación antes de eliminar
- Elimina el registro de la base de datos
- Recarga automáticamente la tabla

### 5. **Búsqueda en Tiempo Real**
- Campo de búsqueda por F Artículo
- Filtra la tabla mientras escribes
- Muestra contador de resultados
- Botón para limpiar búsqueda

## 📋 Requisitos Previos

### Base de Datos
Ejecutar el script SQL para crear la tabla:
```bash
psql -U tu_usuario -d tu_base_de_datos -f backend/Database/Scripts/create_condicionunica_table.sql
```

### Backend
El backend debe estar ejecutándose con los endpoints de Condición Única disponibles.

## 🚀 Uso

1. **Acceder al módulo:**
   - Desde el Dashboard, hacer clic en la tarjeta "Condición Única"
   - O navegar directamente a `/condicion-unica`

2. **Crear nuevo registro:**
   - Hacer clic en "Nuevo Registro"
   - Llenar todos los campos del formulario
   - Hacer clic en "Crear"

3. **Buscar registros:**
   - Escribir en el campo de búsqueda
   - Los resultados se filtran automáticamente

4. **Exportar datos:**
   - Hacer clic en "Exportar"
   - El archivo CSV se descarga automáticamente
   - Abrir con Excel, LibreOffice o Google Sheets

5. **Editar registro:**
   - Hacer clic en el botón de editar (lápiz) en la fila
   - Modificar los campos necesarios
   - Hacer clic en "Guardar"

6. **Eliminar registro:**
   - Hacer clic en el botón de eliminar (papelera) en la fila
   - Confirmar la eliminación

## 📊 Formato de Exportación

El archivo exportado incluye las siguientes columnas:
- F Artículo
- Referencia
- Estante
- Número de Carpeta
- Fecha de Creación
- Última Modificación

## 🔧 Mejora Opcional: Exportar a Excel Real (.xlsx)

Si deseas exportar a formato Excel real (.xlsx) en lugar de CSV:

### Instalar librería XLSX:
```bash
cd Frontend
npm install xlsx
npm install --save-dev @types/xlsx
```

### Modificar el código:
Descomentar el import de XLSX en `condicion-unica.ts` y reemplazar la función `exportToExcel()` con la versión que usa XLSX (comentada en el código).

## 🎨 Características de Diseño

- ✅ Tabla estilo Excel con cuadrícula
- ✅ Diseño consistente con el resto de la aplicación
- ✅ Responsive para móviles y tablets
- ✅ Efectos hover en filas y botones
- ✅ Iconos Material Design
- ✅ Colores del tema de la aplicación
- ✅ Comentarios detallados en cada línea de código

## 📝 Notas Técnicas

- **Formularios Reactivos:** Utiliza Angular Reactive Forms con validaciones
- **Signals:** Manejo de estado reactivo con Angular Signals
- **Material Dialog:** Diálogos modales con Angular Material
- **Standalone Components:** Componentes independientes sin módulos
- **TypeScript:** Tipado fuerte en todos los componentes
- **Comentarios:** Cada línea de código está comentada en español

## 🐛 Solución de Problemas

### Error: "No hay datos para exportar"
- Asegúrate de que haya registros en la tabla
- Verifica que el filtro de búsqueda no esté ocultando todos los registros

### Error al crear/editar registro
- Verifica que el backend esté ejecutándose
- Revisa la consola del navegador para errores
- Asegura que todos los campos estén llenos

### La tabla no carga
- Verifica la conexión con el backend
- Revisa que la tabla `condicionunica` exista en la base de datos
- Verifica los logs del backend

## 📞 Soporte

Para más información o reportar problemas, contacta al equipo de desarrollo.
