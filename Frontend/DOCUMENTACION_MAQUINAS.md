# 📚 Documentación del Módulo de Máquinas

## ✅ Estado del Proyecto

**Compilación:** ✅ Exitosa (sin errores)  
**Fecha:** 15 de noviembre de 2025  
**Archivos documentados:** 2 archivos principales

---

## 📁 Estructura de Archivos

### 1. **machines.ts** (TypeScript - Lógica del Componente)
- **Ubicación:** `Frontend/src/app/shared/components/machines/machines.ts`
- **Líneas:** ~1480 líneas
- **Estado:** ✅ Completamente comentado

### 2. **machines.html** (HTML - Vista del Componente)
- **Ubicación:** `Frontend/src/app/shared/components/machines/machines.html`
- **Líneas:** ~706 líneas
- **Estado:** ✅ Completamente comentado

---

## 🔧 Correcciones Realizadas

### Errores Eliminados:
1. ❌ **TS2393: Duplicate function implementation** (6 instancias)
   - `changeStatus()` - Tenía 3 implementaciones duplicadas → Reducido a 1
   - `suspendProgram()` - Tenía 2 implementaciones duplicadas → Reducido a 1

2. ❌ **TS2345: Type assignment errors** (2 instancias)
   - Errores de asignación de tipos en arrays de programas → Corregidos

### Resultado:
✅ **0 errores de compilación**  
⚠️ **4 advertencias de presupuesto CSS** (no críticas)

---

## 📖 Estructura del Código Comentado

### **machines.ts** - Componente TypeScript

#### 1. **Importaciones** (Líneas 1-28)
```typescript
// Cada importación tiene comentario explicando su propósito
import { Component, OnInit, signal, computed, inject } from '@angular/core';
// Módulo común de Angular - Directivas básicas como *ngFor, *ngIf
import { CommonModule } from '@angular/common';
// ... más importaciones comentadas
```

#### 2. **Interfaces** (Líneas 30-68)
- `MachineProgram` - Estructura de datos de un programa de máquina
- `UserPermissions` - Permisos del usuario en el módulo
- `MachineStats` - Estadísticas de una máquina

#### 3. **Decorador del Componente** (Líneas 70-92)
```typescript
@Component({
  selector: 'app-machines', // Selector HTML para usar el componente
  standalone: true, // Componente independiente (no requiere módulo)
  imports: [ /* ... módulos importados comentados ... */ ],
  templateUrl: './machines.html',
  styleUrls: ['./machines.scss']
})
```

#### 4. **Propiedades del Componente** (Líneas 94-130)
- Señales reactivas (`signal`)
- Propiedades computadas (`computed`)
- Variables de estado del diálogo

#### 5. **Métodos Principales**

##### **loadPrograms()** (Líneas 170-380)
```typescript
// ===== MÉTODO PARA CARGAR DATOS DE MÁQUINAS DESDE LA BASE DE DATOS =====
// Método asíncrono que se conecta con el endpoint GET api/maquinas del backend
async loadPrograms() {
  // ===== VERIFICACIÓN DE AUTENTICACIÓN =====
  // ===== PETICIÓN HTTP GET AL BACKEND =====
  // ===== MAPEO DE DATOS DEL BACKEND AL FRONTEND =====
  // ===== MANEJO DE ERRORES =====
}
```

##### **changeStatus()** (Líneas 550-650)
```typescript
// ===== MÉTODO PARA CAMBIAR EL ESTADO DE UN PROGRAMA =====
// Actualiza el estado de un programa en la base de datos
async changeStatus(program: MachineProgram, newStatus: MachineProgram['estado']) {
  // ===== VALIDACIÓN DE ID =====
  // ===== PREPARACIÓN DEL DTO PARA EL BACKEND =====
  // ===== PETICIÓN HTTP PATCH AL BACKEND =====
  // ===== ACTUALIZACIÓN LOCAL DEL ESTADO =====
}
```

##### **suspendProgram()** (Líneas 682-750)
```typescript
// Inicia el proceso de suspensión de un programa - Abre el diálogo modal
suspendProgram(program: MachineProgram) {
  // Guardar referencia del programa a suspender
  // Limpiar motivo anterior
  // Mostrar el diálogo de suspensión
}
```

##### **onFileSelected()** (Líneas 800-1100)
```typescript
// ===== MÉTODO PARA CARGAR PROGRAMACIÓN DESDE ARCHIVO EXCEL =====
async onFileSelected(event: any): Promise<void> {
  // ===== OBTENER ARCHIVO SELECCIONADO =====
  // ===== VERIFICAR AUTENTICACIÓN =====
  // ===== VALIDACIÓN DE TIPO DE ARCHIVO =====
  // ===== VALIDACIÓN DE TAMAÑO DE ARCHIVO =====
  // ===== PETICIÓN HTTP POST AL BACKEND =====
  // ===== COMBINAR PROGRAMAS =====
}
```

##### **Métodos Utilitarios**
- `getMachineStatusClass()` - Determina clase CSS del LED indicador
- `toggleColors()` - Alterna dropdown de colores
- `exportToExcel()` - Exporta programación a Excel
- `printFF459()` - Imprime formato FF-459
- `refreshData()` - Recarga datos desde el servidor

---

### **machines.html** - Vista HTML

#### 1. **Estructura Principal**
```html
<!-- ===== CONTENEDOR PRINCIPAL DE MÁQUINAS ===== -->
<div class="machines-container">
  <!-- ===== HEADER FIJO ===== -->
  <!-- ===== ÁREA DE CONTENIDO PRINCIPAL ===== -->
  <!-- ===== LAYOUT PRINCIPAL DE DOS COLUMNAS ===== -->
</div>
```

#### 2. **Header** (Líneas 1-80)
- Título con icono
- Botones de acción:
  - ✅ Agregar Programación (carga Excel)
  - ✅ Exportar (descarga Excel)
  - 🔄 Actualizar (refresca datos)

#### 3. **Columna Izquierda: Máquinas** (Líneas 82-200)
```html
<!-- ===== TARJETA DE MÁQUINAS ===== -->
<mat-card class="machines-card">
  <!-- ===== GRID DE MÁQUINAS COMPACTO ===== -->
  <!-- Lista vertical de todas las máquinas disponibles -->
  <div class="machines-grid">
    <!-- Botón para cada máquina con indicador LED de estado -->
  </div>
</mat-card>
```

#### 4. **Columna Derecha: Programación** (Líneas 202-600)
```html
<!-- ===== TARJETA DE PROGRAMACIÓN ESTILO EXCEL ===== -->
<mat-card class="programming-card">
  <!-- ===== TABLA PRINCIPAL ESTILO EXCEL ===== -->
  <table mat-table [dataSource]="selectedMachinePrograms()">
    <!-- Columnas: Artículo, OT SAP, Cliente, Referencia, TD, 
         # Colores, Paleta, Kilos, Fecha Tinta, Sustrato, Estado, Acciones -->
  </table>
</mat-card>
```

#### 5. **Columnas de la Tabla**
Cada columna tiene comentarios detallados:
- **Artículo** - Código único del programa
- **OT SAP** - Orden de trabajo SAP
- **Cliente** - Nombre de la empresa
- **Referencia** - Referencia del producto
- **TD** - Código TD (Tipo de Diseño)
- **# Colores** - Cantidad de colores
- **Paleta** - Dropdown con lista de colores
- **Kilos** - Cantidad en kilogramos
- **Fecha Tinta** - Fecha y hora de aplicación
- **Sustrato** - Tipo de material base
- **Estado** - Estado actual con operario
- **Acciones** - Botones de cambio de estado

#### 6. **Botones de Acción** (Líneas 450-550)
```html
<!-- ===== COLUMNA ACCIONES - NUEVOS BOTONES ===== -->
<div class="action-buttons">
  <!-- Botón Preparando (AMARILLO) -->
  <!-- Botón Listo (VERDE) -->
  <!-- Botón Suspendido (NARANJA) -->
  <!-- Botón Corriendo (ROJO) -->
  <!-- Botón Imprimir FF459 -->
</div>
```

#### 7. **Diálogo de Suspensión** (Líneas 600-706)
```html
<!-- Diálogo modal de suspensión -->
<div *ngIf="showSuspendDialog" class="suspend-dialog-overlay">
  <!-- Información del programa -->
  <!-- Motivos predefinidos como chips -->
  <!-- Campo de texto para motivo detallado -->
  <!-- Botones Cancelar y Suspender -->
</div>
```

---

## 🎨 Estados de los Programas

| Estado | Color | Icono | Descripción |
|--------|-------|-------|-------------|
| **PREPARANDO** | 🟡 Amarillo | `schedule` | Programa sin color asignado, esperando acción del operario |
| **LISTO** | 🟢 Verde | `check_circle` | Programa listo para producción |
| **SUSPENDIDO** | 🟠 Naranja | `pause_circle` | Programa pausado temporalmente con motivo |
| **CORRIENDO** | 🔴 Rojo | `play_circle` | Programa en ejecución activa |
| **TERMINADO** | 🟢 Verde Oscuro | `task_alt` | Programa completado exitosamente |

---

## 🚦 Indicadores LED de Máquinas

| Rango de Programas Listos | Color LED | Estado | Parpadeo |
|----------------------------|-----------|--------|----------|
| 0-2 programas | 🔴 Rojo | CRÍTICO | Rápido (1s) |
| 3-5 programas | 🟠 Naranja | ADVERTENCIA | Medio (1.5s) |
| 6+ programas | 🟢 Verde | ÓPTIMO | Lento (2s) |

---

## 📊 Endpoints del Backend

### GET `/api/maquinas`
- **Descripción:** Obtiene todos los programas de máquinas
- **Parámetros:** `orderBy=fechaTintaEnMaquina&order=desc`
- **Respuesta:** `{ success: true, data: MachineProgram[] }`

### PATCH `/api/maquinas/{id}/status`
- **Descripción:** Actualiza el estado de un programa
- **Body:** `{ estado: string, observaciones?: string }`
- **Respuesta:** `{ success: true, data: MachineProgram }`

### POST `/api/maquinas/upload`
- **Descripción:** Carga programación desde archivo Excel
- **Body:** `FormData` con archivo Excel
- **Respuesta:** `{ success: true, data: MachineProgram[] }`

---

## 🔍 Características Principales

### 1. **Gestión de Estados**
- Cambio de estado con un clic
- Registro automático del operario que realiza la acción
- Motivos de suspensión con chips predefinidos

### 2. **Carga de Programación**
- Validación de tipo de archivo (solo Excel)
- Validación de tamaño (máximo 10MB)
- Preservación de programas en PREPARANDO, LISTO y SUSPENDIDO
- Solo elimina programas en CORRIENDO al cargar nueva programación

### 3. **Visualización**
- Tabla estilo Excel con scroll horizontal y vertical
- Headers fijos durante el scroll
- Dropdown de colores con posición fija
- Indicadores LED de estado de máquinas

### 4. **Exportación**
- Exporta toda la programación a Excel
- Incluye todas las columnas con formato
- Nombre de archivo con timestamp

### 5. **Impresión**
- Formato FF-459 oficial de la empresa
- Carga plantilla HTML desde archivo
- Reemplazo dinámico de variables

---

## 🛠️ Tecnologías Utilizadas

- **Angular 18+** - Framework principal
- **Angular Material** - Componentes de UI
- **RxJS** - Programación reactiva
- **TypeScript** - Lenguaje tipado
- **SCSS** - Estilos avanzados
- **XLSX** - Exportación a Excel

---

## 📝 Notas Importantes

1. **Autenticación:** Todos los métodos verifican autenticación antes de ejecutar
2. **Manejo de Errores:** Cada método tiene manejo completo de errores con logs detallados
3. **Señales Reactivas:** Uso de Angular Signals para estado reactivo
4. **Comentarios:** Cada línea crítica tiene comentarios explicativos
5. **Logs:** Logs detallados con emojis para fácil identificación en consola

---

## 🎯 Próximos Pasos Sugeridos

1. ✅ Implementar tests unitarios para métodos críticos
2. ✅ Agregar validación de permisos por rol de usuario
3. ✅ Implementar notificaciones en tiempo real con WebSockets
4. ✅ Agregar filtros y búsqueda en la tabla
5. ✅ Implementar paginación para grandes volúmenes de datos

---

**Documentación generada automáticamente**  
**Fecha:** 15 de noviembre de 2025  
**Versión:** 1.0.0
