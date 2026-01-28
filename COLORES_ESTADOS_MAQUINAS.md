# 🎨 COLORES POR ESTADO EN MÓDULO DE MÁQUINAS

## 📋 Resumen

Se han agregado colores de fondo distintivos para cada estado de las filas en el módulo de máquinas, facilitando la identificación visual rápida del estado de cada pedido.

## ✅ Cambios Realizados

### Archivo Modificado
**Ubicación**: `Frontend/src/app/shared/components/machines/machines.scss`

### Colores Implementados

#### 1. 🔵 CORRIENDO - Azul Cielo
```scss
.status-row-corriendo {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-left: 4px solid #0ea5e9;
}
```
- **Color de fondo**: Azul cielo claro (#e0f2fe → #bae6fd)
- **Borde izquierdo**: Azul cielo intenso (#0ea5e9)
- **Hover**: Azul cielo más intenso (#bae6fd → #7dd3fc)

#### 2. 🟢 LISTO - Verde
```scss
.status-row-listo {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-left: 4px solid #10b981;
}
```
- **Color de fondo**: Verde claro (#d1fae5 → #a7f3d0)
- **Borde izquierdo**: Verde (#10b981)
- **Hover**: Verde más intenso (#a7f3d0 → #6ee7b7)

#### 3. 🟡 PREPARANDO - Amarillo/Ámbar
```scss
.status-row-preparando {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left: 4px solid #f59e0b;
}
```
- **Color de fondo**: Amarillo claro (#fef3c7 → #fde68a)
- **Borde izquierdo**: Amarillo/Ámbar (#f59e0b)
- **Hover**: Amarillo más intenso (#fde68a → #fcd34d)

#### 4. 🔴 SUSPENDIDO - Rojo
```scss
.status-row-suspendido {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-left: 4px solid #ef4444;
}
```
- **Color de fondo**: Rojo claro (#fee2e2 → #fecaca)
- **Borde izquierdo**: Rojo (#ef4444)
- **Hover**: Rojo más intenso (#fecaca → #fca5a5)

#### 5. ⚫ TERMINADO - Gris
```scss
.status-row-terminado {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-left: 4px solid #64748b;
  opacity: 0.7;
}
```
- **Color de fondo**: Gris claro (#f1f5f9 → #e2e8f0)
- **Borde izquierdo**: Gris (#64748b)
- **Opacidad**: 0.7 (para indicar inactivo)
- **Texto**: Gris (#64748b)
- **Hover**: Opacidad 0.85

#### 6. ⚪ SIN_ASIGNAR - Blanco
```scss
.status-row-sin_asignar {
  background: white;
  border-left: 4px solid #cbd5e1;
}
```
- **Color de fondo**: Blanco
- **Borde izquierdo**: Gris claro (#cbd5e1)
- **Hover**: Gris muy claro (#f8fafc → #f1f5f9)

## 🎨 Características de los Estilos

### Gradientes
Todos los estados (excepto SIN_ASIGNAR) usan gradientes suaves para un aspecto moderno:
- Gradiente de 135 grados (diagonal)
- Transición suave entre dos tonos del mismo color

### Borde Izquierdo
- **Grosor**: 4px
- **Color**: Versión más intensa del color de fondo
- **Propósito**: Identificación rápida del estado

### Efectos Hover
- **Transform**: `translateY(-1px)` - Eleva la fila 1px
- **Box-shadow**: Sombra del color del estado con opacidad 0.3
- **Background**: Gradiente más intenso del mismo color

### Transparencia de Celdas
```scss
.excel-cell {
  background: transparent !important;
}
```
- Las celdas tienen fondo transparente para que se vea el gradiente de la fila completa

## 🔍 Cómo Funciona

### Aplicación Dinámica de Clases

En el HTML (`machines.html`):
```html
<tr mat-row *matRowDef="let row; columns: simpleColumns;" 
  class="excel-row"
  [ngClass]="'status-row-' + row.estado.toLowerCase()"
  [attr.data-ot-sap]="row.otSap">
</tr>
```

La clase se aplica dinámicamente según el estado:
- Estado: `CORRIENDO` → Clase: `status-row-corriendo`
- Estado: `LISTO` → Clase: `status-row-listo`
- Estado: `PREPARANDO` → Clase: `status-row-preparando`
- etc.

## 📊 Tabla de Referencia Rápida

| Estado | Color Principal | Código Hex | Borde | Uso |
|--------|----------------|------------|-------|-----|
| **CORRIENDO** | 🔵 Azul Cielo | #e0f2fe | #0ea5e9 | Pedido en producción activa |
| **LISTO** | 🟢 Verde | #d1fae5 | #10b981 | Pedido completado y listo |
| **PREPARANDO** | 🟡 Amarillo | #fef3c7 | #f59e0b | Pedido en preparación |
| **SUSPENDIDO** | 🔴 Rojo | #fee2e2 | #ef4444 | Pedido suspendido/detenido |
| **TERMINADO** | ⚫ Gris | #f1f5f9 | #64748b | Pedido finalizado (opaco) |
| **SIN_ASIGNAR** | ⚪ Blanco | #ffffff | #cbd5e1 | Sin estado asignado |

## 🧪 Verificación

### Visual
1. Abrir el módulo de máquinas
2. Verificar que las filas tengan colores según su estado:
   - **CORRIENDO**: Fondo azul cielo claro
   - **LISTO**: Fondo verde claro
   - **PREPARANDO**: Fondo amarillo claro
   - **SUSPENDIDO**: Fondo rojo claro
   - **TERMINADO**: Fondo gris (opaco)
   - **SIN_ASIGNAR**: Fondo blanco

### Hover
1. Pasar el mouse sobre cada fila
2. Verificar que:
   - La fila se eleva ligeramente
   - El color se intensifica
   - Aparece una sombra del color del estado

### Responsive
Los estilos funcionan en todos los tamaños de pantalla:
- Desktop: Colores completos con gradientes
- Tablet: Colores completos con gradientes
- Móvil: Colores completos con gradientes

## 💡 Beneficios

### Identificación Rápida
- Los operadores pueden identificar el estado de un pedido de un vistazo
- No necesitan leer el texto del estado

### Jerarquía Visual
- Estados críticos (SUSPENDIDO) destacan con rojo
- Estados activos (CORRIENDO) destacan con azul
- Estados completados (LISTO) destacan con verde

### Consistencia
- Colores consistentes en toda la aplicación
- Gradientes suaves para un aspecto profesional

### Accesibilidad
- Contraste suficiente para lectura fácil
- Borde izquierdo adicional para identificación

## 📝 Notas Importantes

### Prioridad de Estilos
Se usa `!important` para asegurar que los estilos de estado sobrescriban otros estilos:
```scss
background: linear-gradient(...) !important;
border-left: 4px solid #color !important;
```

### Compatibilidad
- ✅ Chrome/Edge: Totalmente compatible
- ✅ Firefox: Totalmente compatible
- ✅ Safari: Totalmente compatible
- ✅ Móviles: Totalmente compatible

### Rendimiento
- Los gradientes CSS son eficientes
- No hay imágenes adicionales que cargar
- Transiciones suaves sin impacto en rendimiento

## 🚀 Próximas Mejoras Sugeridas

1. **Animaciones**:
   - Animación sutil al cambiar de estado
   - Pulso para estados críticos

2. **Indicadores Adicionales**:
   - Icono en la fila según el estado
   - Tooltip con información del estado

3. **Personalización**:
   - Permitir al usuario personalizar colores
   - Modo oscuro con colores ajustados

4. **Estadísticas**:
   - Contador de filas por estado
   - Gráfico de distribución de estados

## ✅ Resumen

**Implementación Completa**:
- ✅ 6 estados con colores distintivos
- ✅ Gradientes suaves y modernos
- ✅ Bordes izquierdos para identificación rápida
- ✅ Efectos hover interactivos
- ✅ Responsive y accesible

**Archivo Modificado**: 1
- `Frontend/src/app/shared/components/machines/machines.scss`

**Líneas Agregadas**: ~130 líneas de estilos SCSS

---

**¡Colores implementados y listos para usar!** 🎨
