# Rediseño del Módulo de Permisos 🔐

## 📋 Resumen de Cambios

El módulo de permisos fue rediseñado siguiendo el **Apple Design System** para alinearlo visualmente con la pestaña de Configuración: tarjetas glass compactas, azul de sistema como único acento, grilla densa de permisos y toggles tipo pill iOS. Todos los estilos están *scoped* a `.permissions-tab`.

> **Nota de versión:** este diseño reemplaza el esquema morado/verde anterior (v2.2.0). Ya no se usan gradientes morados (#8b5cf6) ni estados verde/rojo; el acento único es el azul de sistema `#0071e3`.

---

## 🎨 Diseño Actual (Apple)

### 1. Cabecera unificada + selector de usuario (`.permissions-unified-header`)
- ✅ Contenedor glass compacto: fondo blanco translúcido, borde hairline, radio `14px`, `padding: 10px 14px`, sin borde azul grueso
- ✅ Título compacto (`15px`, peso 600, `letter-spacing: -0.3px`) con ícono azul de sistema
- ✅ Descripción secundaria a `12px`
- ✅ Selector + nota alineados en fila (`flex-direction: row`, `align-items: center`)

### 2. Selector de usuario (`.user-selector-field-inline`) — minimalista Apple
- ✅ Campo *filled* estilo iOS: fondo blanco translúcido, borde hairline `1px`, radio `12px`, sin glow/shimmer ni desplazamiento en hover
- ✅ Infix compacto (`min-height: 40px`), ícono prefijo `badge` de `18px` en color terciario (sin sombra)
- ✅ Valor y label con tipografía SF Pro a `13px`, peso 500, `letter-spacing` negativo
- ✅ Focus: borde azul de sistema + halo sutil `0 0 0 3px rgba(0,113,227,0.15)`, sin lift
- ✅ Nota "Solo admins" como chip discreto tipo pill (fondo gris translúcido, borde hairline)

### 3. Desplegable de usuarios (`.ap-user-select-panel`) — panel Apple
> Aplicado con `panelClass="ap-user-select-panel"` en el `<mat-select>`; el overlay del CDK se estila de forma global con `::ng-deep`.
- ✅ Panel glass: `blur(30px) saturate(180%)`, radio `14px`, borde hairline, sombra suave; scrollbar fino neutro
- ✅ Opciones compactas (`min-height: 44px`, `padding: 6px 10px`), sin shimmer ni rotaciones
- ✅ Avatar `30px` cuadrado con radio `8px` (antes círculo `42px` animado)
- ✅ Nombre `13px` peso 500; rol como texto secundario simple `11px` (sin badge ni borde)
- ✅ Hover/activo/seleccionado: solo fondo azul translúcido (`rgba(0,113,227,0.08–0.12)`), sin sombras; checkbox por defecto oculto

### 4. Grid de categorías (`.permissions-grid-compact`)
- ✅ Una fila completa por categoría (`grid-template-columns: 1fr`), `gap: 10px`

### 5. Tarjeta de categoría (`.permission-category-compact`)
- ✅ Glass: `backdrop-filter: blur(30px) saturate(180%)`, fondo blanco translúcido en gradiente
- ✅ Radio Apple `14px`, borde hairline
- ✅ Franja de acento azul superior de `2px` via `::before` (gradiente `#0071e3 → #4aa3ff`)
- ✅ Hover: `translateY(-2px)` + sombra más marcada

### 6. Header de categoría (`.category-header-compact`)
- ✅ Ícono en "chip" de `26px` con gradiente azul y sombra azul suave
- ✅ Nombre de categoría `13px`, peso 600, sin uppercase
- ✅ Contador (`.category-count`) como pill azul translúcido

### 7. Items de permiso (`.permissions-grid-items` + `.permission-card-compact`)
- ✅ Grilla densa multi-columna: `repeat(auto-fill, minmax(250px, 1fr))`, `gap: 8px`
- ✅ Cada permiso es una celda auto-contenida: info arriba, control abajo (layout en columna)
- ✅ Nombre `12px` peso 600; descripción `10.5px` color secundario
- ✅ Hover: fondo blanco, borde azul sutil, `translateY(-1px)`
- ✅ Estado `.active`: acento azul sutil (`rgba(0,113,227,0.06)`), **sin verde**

### 8. Toggle ON/OFF (`.permission-toggle-btn`)
- ✅ Pill compacto tipo control segmentado iOS: `min-width: 58px`, `height: 27px`, radio `999px`
- ✅ OFF: gris neutro (`rgba(120,120,128,0.12)`), **sin rojo**
- ✅ ON: azul de sistema en gradiente (`#0071e3 → #4aa3ff`) con sombra azul
- ✅ Disabled: `opacity: 0.45`, sin sombra

### 9. Estado vacío (`.no-user-selected-compact`)
- ✅ Radio Apple `16px`, borde punteado hairline, fondo blanco translúcido
- ✅ Ícono en azul translúcido, texto secundario `13px`

---

## 🎯 Paleta de Colores (Apple)

```scss
$ap-blue:        #0071e3;   // Azul de sistema — único acento
$ap-blue-hover:  #0077ed;   // (hover del acento)
// gradiente de acento usado en chips/toggles/franjas: #0071e3 → #4aa3ff
$ap-text:        // texto principal
$ap-text-2:      // texto secundario
$ap-text-3:      // texto terciario / íconos suaves
$ap-hairline:    // bordes finos (hairline)
$ap-font:        // stack SF Pro
```

Neutros para estados OFF/disabled: `rgba(120, 120, 128, ...)` (gris de sistema iOS).

> El acento es **azul único**. No hay estados de color verde (activado) ni rojo (desactivado): el estado activo se comunica con azul sutil y el toggle ON en azul sólido.

---

## 📱 Responsive

- Grid de categorías: siempre 1 columna (`1fr`).
- Items dentro de cada categoría: `auto-fill` con celdas de mínimo `250px`, se reflujan según ancho disponible.

---

## 📂 Archivos Relevantes

1. **Frontend/src/app/auth/settings/settings.scss**
   - Bloque `.permissions-tab` con todo el diseño Apple (scoped)
   - Overrides de tema oscuro para la sección de Configuración
2. **Frontend/src/app/auth/settings/settings.html**
   - Estructura del tab "Permisos" (clases `permissions-*`, `permission-*`, `category-*`)
3. **Frontend/src/app/auth/settings/settings.ts**
   - Lógica del tab de permisos y navegación

---

## 🆚 Diferencias con Configuraciones

| Aspecto | Configuraciones | Permisos |
|---------|----------------|----------|
| **Color de acento** | Azul de sistema `#0071e3` | Azul de sistema `#0071e3` |
| **Enfoque** | Ajustes del sistema | Gestión de accesos |
| **Controles** | Inputs, toggles, selects | Toggles pill iOS + selector de usuario |
| **Organización** | Por tipo de configuración | Por categoría de permisos |
| **Estado vacío** | N/A | Mensaje "selecciona usuario" |

Ambas pestañas comparten ahora el mismo lenguaje visual (Apple Design), diferenciándose por contenido y no por color.

---

## 🚀 Próximos Pasos Sugeridos

1. Validar accesibilidad con lectores de pantalla
2. Considerar búsqueda/filtrado de permisos
3. Selección múltiple de permisos
4. Historial de cambios de permisos
5. Permisos por grupos/roles
6. Exportación de matriz de permisos

---

**Última actualización:** 16 de Septiembre, 2026
**Versión:** 3.0.0 (Apple Design)
**Diseño previo:** v2.2.0 (esquema morado/verde) — reemplazado
