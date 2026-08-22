# Módulo de Máquinas - Guía de Diseño y Especificaciones

> **IMPORTANTE**: Este documento es la fuente de verdad para el módulo de máquinas.

---

## Estructura General

El módulo de máquinas tiene dos secciones principales:
1. **Barra de máquinas** — Botones horizontales que representan cada máquina
2. **Tabla de programación** — Tabla tipo Excel con los pedidos/programas de la máquina seleccionada

---

## Paleta de Colores del Módulo

| Variable | Color | Uso |
|----------|-------|-----|
| `$primary-blue` | `#2563eb` | Color principal, headers, acciones |
| `$primary-blue-light` | `#3b82f6` | Hover, acentos |
| `$primary-blue-dark` | `#1d4ed8` | Texto activo |
| `$success-emerald` | `#10b981` | Estado LISTO |
| `$warning-amber` | `#f59e0b` | Estado PREPARANDO |
| `$error-red` | `#ef4444` | Estado SUSPENDIDO/TERMINADO |
| `$gray-50` a `$gray-900` | Escala slate | Fondos, bordes, texto |

---

## Barra de Máquinas (`.excel-machine-card`)

```scss
background: #f8fafc;
border-top: 2px solid #e2e8f0;
border-right: 4px solid var(--border-color); // Color según estado
border-radius: 8px;
padding: 8px 12px;
min-width: 80px;
height: 80px;
```

### Estados de máquina (borde derecho animado)

| Estado | Color borde | Animación | Significado |
|--------|-------------|-----------|-------------|
| `status-suspendido` | `#dc2626` (rojo) | `border-pulse-red 1s` | 0-3 pedidos |
| `status-preparando` | `#f97316` (naranja) | `border-pulse-orange 1.5s` | 4-5 pedidos |
| `status-listo` | `#059669` (verde) | `border-pulse-green 2s` | 7+ pedidos |
| `status-corriendo` | `#2563eb` (azul) | `pulse-corriendo 2s` | En producción |
| `status-terminado` | `#dc2626` (rojo) | `pulse-terminado 2s` | Finalizado |
| `status-sin_asignar` | `#94a3b8` (gris) | ninguna | Sin pedidos |

---

## Tabla de Programación (`.excel-table`)

### Columnas definidas (orden actual)

```typescript
simpleColumns = [
  'articulo',        // Código de artículo
  'otSap',           // Orden de trabajo SAP
  'cliente',         // Nombre del cliente
  'referencia',      // Referencia del pedido
  'td',              // Tipo de diseño (R, T, S)
  'tipoImpresion',   // T IMP - printType del diseño (CARA/DORSO)
  'numeroColores',   // Cantidad de colores (botón expandible)
  'rodillo',         // Rod - formato 00,0 (placeholder, sin datos reales aún)
  'carpeta',         // Carp - Carpeta/Estante desde CodTintas
  'kilos',           // Kl/Mtr - Peso en kg + metros
  'acumuladoSaldo',  // Ac/Sal - Acumulado (negro) + Saldo (azul) (placeholder)
  'fechaTintaEnMaquina', // Fecha de tinta
  'sustrato',        // Material base
  'estado',          // Estado del pedido
  'acciones'         // Botones de acción
];
```

### Font-size global

**Texto interno de celdas**: `font-size: 11px` (aplicado en `.excel-cell`)
**Headers**: `font-size: 9px` (en `.excel-header .header-content span`)

### Estilos de celdas (anchos)

| Celda | Clase | Width | Notas |
|-------|-------|-------|-------|
| Artículo | `.article-cell` | `50px` | Texto azul bold |
| OT SAP | `.otsap-cell` | `60px` | Código azul bold |
| Cliente | `.client-cell` | max `110px` | Texto wrap |
| Referencia | `.referencia-cell` | `140-180px` | Texto wrap |
| TD | `.td-cell` | `30px` | Código (R/T/S) azul |
| T IMP | `.tipo-imp-cell` | `55px` | Badge CARA/DORSO |
| Colores | `.numero-colores-cell` | `50px` | Botón expandible |
| Rodillo | `.rodillo-cell` | `40px` | Formato 00,0 negro |
| Carpeta | `.carpeta-cell` | `50px` | E: valor + C: valor |
| Kilos | `.kilos-cell` | `60px` | kg arriba, m abajo |
| Acum/Saldo | `.acumulado-saldo-cell` | `60px` | Acumulado negro + Saldo azul |
| Fecha | `.fecha-tinta-cell` | `65px` | Fecha + hora |
| Sustrato | `.sustrato-cell` | `70px` | Uppercase, 2 líneas max |
| Estado | `.status-cell` | `130px` | Badge con animación |
| Acciones | `.acciones-cell` | auto | Botones |

---

### Columna T IMP (`.tipo-imp-cell`)

```scss
.tipo-imp-cell {
  width: 55px;
  min-width: 55px;
  text-align: center;

  .tipo-imp-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background: #f1f5f9;
    color: #64748b;
    white-space: nowrap;

    &.cara { background: #dbeafe; color: #1d4ed8; }
    &.dorso { background: #fef3c7; color: #92400e; }
  }
}
```

**Fuente de datos**: `GET /api/designs/all` → mapa `articleF` → `printType`. Cache en `designPrintTypeData`.

### Columna Rodillo (`.rodillo-cell`)

```scss
.rodillo-cell {
  width: 40px;
  min-width: 40px;
  text-align: center;

  .rodillo-number {
    font-size: 11px;
    font-weight: 700;
    color: #1e293b;
  }
}
```

**Datos**: Placeholder `00,0`. Sin fuente de datos real aún.

### Columna Acumulado/Saldo (`.acumulado-saldo-cell`)

```scss
.acumulado-saldo-cell {
  width: 60px;
  min-width: 60px;

  .acumulado-number { font-size: 11px; font-weight: 700; color: #1e293b; }
  .saldo-number { font-size: 11px; font-weight: 700; color: #2563eb; }
}
```

**Datos**: Placeholder `0`. Sin fuente de datos real aún.

---

## Estados de Fila (colores de fondo)

| Estado | Fondo | Borde izquierdo |
|--------|-------|-----------------|
| `status-row-sin_asignar` | `white` | `#94a3b8` (gris) |
| `status-row-preparando` | `linear-gradient(135deg, #fef3c7, #fde68a)` | `#eab308` (amarillo) |
| `status-row-listo` | `linear-gradient(135deg, #d1fae5, #a7f3d0)` | `#10b981` (verde) |
| `status-row-suspendido` | `linear-gradient(135deg, #fed7aa, #fdba74)` | `#f97316` (naranja) |
| `status-row-corriendo` | `linear-gradient(135deg, #e0f2fe, #bae6fd)` | `#dc2626` (rojo) |
| `status-row-terminado` | `linear-gradient(135deg, #fecaca, #fca5a5)` | `#dc2626` (rojo) |

---

## Columna de Estado (`.status-cell`)

```scss
.status-cell {
  width: 130px;
  min-width: 130px;
  text-align: center;
}

.status-text-display {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}
```

---

## Datos Cargados al Iniciar

1. **Programas de máquina** — desde `GET /api/maquinas/{numero}/programs`
2. **Carpeta/Estante** — desde `CodTintasService.getAll()` → cache en `codTintasCarpetaData`
3. **PrintType de diseños** — desde `GET /api/designs/all` → cache en `designPrintTypeData`
4. **Configuración de alertas** — desde `GET /api/system/configs`

---

## Responsive

### `@media (max-width: 1024px)`
- Botones de máquina: `height: 70px`, `padding: 6px`
- Tabla: `font-size: 0.75rem`

### `@media (max-width: 768px)`
- Botones de máquina: `height: 60px`, `padding: 4px`
- Headers de tabla reducidos

---

## Reglas Irrompibles

1. **Font-size de texto en celdas** — siempre `11px` en `.excel-cell`, nunca reducir
2. **Borde derecho animado** en `.excel-machine-card` — indica cantidad de pedidos, nunca quitar
3. **`border-left: 4px`** en filas de estado — siempre presente para identificación visual
4. **`white-space: nowrap`** en `.tipo-imp-badge` — evita que el texto se corte
5. **Cache de printType** — se carga una vez al iniciar, no en cada render de celda
6. **Columna T IMP** — datos vienen de la tabla `designs` (campo `printType`), NO de la tabla `maquinas`
7. **Columna Carpeta** — datos vienen de la tabla `cod_tintas`, NO de la tabla `maquinas`
8. **Columnas placeholder** (Rodillo, Acumulado/Saldo) — muestran valores fijos por ahora, sin backend
