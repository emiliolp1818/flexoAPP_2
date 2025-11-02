# 🏭 Módulo de Gestión de Máquinas Flexográficas

## 📋 Descripción General
Sistema completo de gestión y programación de máquinas flexográficas con interfaz empresarial moderna, indicadores LED de estado, funcionalidades avanzadas de programación y sistema de permisos por usuario.

## 🎯 Funcionalidades Principales

### 1. **Panel de Máquinas (Columna Izquierda)**
- Botones individuales para máquinas 11-21
- LED indicador de estado en forma de medialuna
- Efectos hover y selección con animaciones
- Indicadores visuales de cantidad de pedidos listos

### 2. **Panel de Programación (Columna Derecha)**
- Tabla estilo Excel con programación completa
- Estados de programas: LISTO, CORRIENDO, SUSPENDIDO, TERMINADO
- Dropdown de colores por programa
- Botones de acción inline para cambio de estados
- Información de operarios y timestamps

### 3. **Funcionalidades de Archivo (Con Control de Permisos)**
- **Cargar Programación Excel**: Importación de archivos .xlsx, .xls, .csv
- **Descargar Plantilla**: Descarga de plantilla Excel con formato correcto
- **Ver Formato FF459**: Visualización e impresión de formato FF459
- Validación y procesamiento de datos
- Control de acceso basado en permisos de usuario

### 4. **Sistema de Permisos**
- Control granular de acceso a funcionalidades
- Configuración por usuario en sección de configuración
- Roles predefinidos: Admin, Supervisor, Operador, Visualizador

## 🚨 LED Indicador de Estado

### Estados por Cantidad de Pedidos Listos:
- 🔴 **ROJO (0-3 pedidos)**: Parpadeo rápido cada 1s - Estado crítico
- 🟠 **NARANJA (4-7 pedidos)**: Parpadeo moderado cada 1.5s - Advertencia  
- 🟢 **VERDE (8+ pedidos)**: Parpadeo suave cada 2s - Estado óptimo

### Características Técnicas:
- Forma: Medialuna en lado izquierdo del botón
- Tamaño: 8px x 24px
- Animación: 0% a 100% opacidad
- Z-index: 10 (siempre visible)
- Pseudo-elemento: ::before

## 🎨 Diseño y Estilos

### Arquitectura CSS:
1. **Contenedor Principal** - Layout base
2. **Header Empresarial** - Barra superior fija
3. **Layout Dos Columnas** - División principal
4. **Sección Máquinas** - Panel lateral izquierdo
5. **Sección Programación** - Panel principal derecho
6. **Componentes Especializados** - Dropdowns, diálogos, etc.
7. **Responsive Design** - Adaptación móvil
8. **Animaciones** - Efectos visuales

### Paleta de Colores:
- **Primario**: #2563eb (Azul empresarial)
- **Crítico**: #dc2626 (Rojo alerta)
- **Advertencia**: #f59e0b (Naranja)
- **Éxito**: #10b981 (Verde)
- **Neutro**: #64748b (Gris)

## 📱 Responsive Design
- **Desktop**: Layout dos columnas completo
- **Tablet**: Ajustes de espaciado y tamaños
- **Mobile**: Layout vertical con grid de máquinas

## 🔧 Componentes Técnicos

### Archivos Principales:
- `machines.component.ts` - Lógica principal
- `machines.component.html` - Template
- `machines.component.scss` - Estilos organizados
- `README.md` - Documentación (este archivo)

### Dependencias:
- Angular Material (UI Components)
- XLSX (Procesamiento Excel)
- RxJS (Manejo de estados)
- Servicios personalizados (Máquinas, Programas, etc.)

## � Sistiema de Permisos

### Permisos Disponibles:
- **canLoadExcel**: Permite cargar archivos Excel de programación
- **canDownloadTemplate**: Permite descargar plantilla Excel
- **canViewFF459**: Permite ver y generar formato FF459
- **canChangeStatus**: Permite cambiar estados de programas
- **canSuspendPrograms**: Permite suspender programas
- **canDeletePrograms**: Permite eliminar programas
- **canClearPrograms**: Permite limpiar toda la programación del sistema

### Roles Predefinidos:
- **Admin**: Acceso completo a todas las funcionalidades incluyendo limpieza total
- **Supervisor**: Acceso a carga, descarga, FF459, cambios de estado y suspensión (sin limpieza total)
- **Operador**: Acceso a FF459 y cambios de estado únicamente
- **Visualizador**: Solo visualización, sin permisos de modificación

### Configuración:
Los permisos se configuran en la sección **Configuración > Gestión de Usuarios** donde se puede:
- Asignar roles a usuarios
- Configurar permisos personalizados
- Ver y modificar permisos existentes

## 🚀 Funcionalidades Implementadas
- ✅ Sistema de permisos por usuario
- ✅ Control de acceso a botones de Excel
- ✅ Configuración granular de permisos
- ✅ Roles predefinidos
- ✅ Notificaciones en tiempo real
- ✅ Exportación de reportes FF459
- ✅ Integración con sistema de autenticación