# Dashboard - Guía Completa de Diseño, Tamaños y Estilo

> **IMPORTANTE**: Este documento es la fuente de verdad para el diseño del dashboard.
> Cualquier cambio futuro DEBE respetar los valores aquí definidos para mantener consistencia visual.

---

## Estructura General

El dashboard ocupa toda la pantalla debajo del header (70px fijo).
Las filas se apilan verticalmente en este orden:

1. **KPI Row** — 3 tarjetas métricas con mini-gráficas de tendencia
2. **Production Row** — 4 tarjetas de producción del mes
3. **Charts Row** — 3 gráficas grandes
4. **Ranking Card** — Ranking semanal de mejor tiempo
5. **Actions Row** — Botones de acceso rápido a módulos

---

## Contenedor Principal `.dashboard-container`

```scss
background: linear-gradient(160deg, #e8edf5 0%, #dce6f5 50%, #e4dff5 100%);
padding: 10px 16px;
padding-bottom: 16px;   // OBLIGATORIO — evita que los botones queden cortados
display: flex;
flex-direction: column;
gap: 8px;               // Espacio entre filas
```

**REGLA**: `padding-bottom` nunca debe ser `0` — los botones de acciones quedan cortados.

---

## Fila 1: KPI Cards

### Grid `.kpi-row`
```scss
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 10px;
```

### Tarjeta `.kpi-card` — Estilo Claymorfismo

Las KPI cards usan un mixin `%clay-card` compartido:
```scss
%clay-card {
  border-radius: 24px;
  border: 3px solid rgba(255, 255, 255, 0.85);
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease;
  overflow: hidden;
  &:hover { transform: translateY(-4px) scale(1.01); }
}
```

Propiedades base de `.kpi-card`:
```scss
@extend %clay-card;
padding: 10px 14px;
display: flex;
align-items: center;
gap: 10px;
min-height: 80px;
```

Colores por variante (fondo pastel + sombra inferior sólida como "suelo"):

| Clase | Fondo | Sombra inferior | Ícono fondo | Ícono color |
|-------|-------|-----------------|-------------|-------------|
| `.kpi-time` (Tiempo) | `linear-gradient(145deg, #fff3d0, #ffe9a0)` | `0 6px 0 #d4a000` | `rgba(255,200,30,0.35)` + borde `rgba(255,200,30,0.5)` | `#b45309` |
| `.kpi-orders` (Órdenes) | `linear-gradient(145deg, #d1fae5, #a7f3d0)` | `0 6px 0 #059669` | `rgba(16,185,129,0.25)` + borde `rgba(16,185,129,0.4)` | `#065f46` |
| `.kpi-designs` (Diseños) | `linear-gradient(145deg, #dbeafe, #bfdbfe)` | `0 6px 0 #2563eb` | `rgba(59,130,246,0.25)` + borde `rgba(59,130,246,0.4)` | `#1e40af` |

En hover la sombra inferior se reduce a `0 3px 0` para dar efecto de presión.

### Ícono `.kpi-icon`
```scss
width: 36px; height: 36px; border-radius: 8px;
mat-icon: font-size: 20px; width: 20px; height: 20px;
```

### Cuerpo `.kpi-body`
```scss
flex: 0 0 auto;   // NO crece — cede espacio a las mini-barras
```
- `.kpi-value`: `font-size: 22px`, `font-weight: 800`, color `#1e293b`
- `.kpi-label`: `font-size: 11px`, `font-weight: 500`, color `#64748b`
- `.kpi-sub`: `font-size: 10px`, `font-weight: 600`, color `#10b981`

### Mini-barras `.mini-bars`
```scss
display: flex;
align-items: flex-end;
justify-content: flex-end;   // Alineadas a la derecha de la tarjeta
gap: 10px;                   // Espacio entre columnas
height: 76px;
flex: 1;                     // Ocupa todo el espacio sobrante
padding: 6px 10px 6px 4px;  // Más padding derecho para separar del borde
```

Cada columna `.mini-col`:
```scss
width: 20px; flex-shrink: 0;
justify-content: flex-end;
```

Estructura vertical de cada columna (de arriba a abajo):
1. `.mini-val` — valor numérico: `font-size: 8px`, `font-weight: 700`, color `#94a3b8`, `margin-bottom: 3px`
2. `.mini-bar` — barra: `width: 12px`, `border-radius: 3px 3px 0 0`, `min-height: 3px`
3. `.mini-day` — día (Lun, Mar...): `font-size: 8px`, `font-weight: 600`, color `#94a3b8`, `margin-top: 3px`
4. `.mini-date` — fecha (dd/mm): `font-size: 7px`, `font-weight: 500`, color `#cbd5e1`, `margin-top: 2px`

**CRÍTICO**:
- Las barras usan `[style.height.px]="getMiniBarHeight(b.percent)"` — **NUNCA** `height.%`
- `getMiniBarHeight(percent)` → máximo `32px`, mínimo `3px`
- El backend devuelve **7 días** (últimos 7 días)
- **NUNCA** usar `width` fijo en `.mini-bars` — usar `flex: 1`
- **NUNCA** quitar `overflow: hidden` de `.kpi-card`

Colores de barras:
- `.amber`: `#f59e0b` / último día `#d97706`
- `.green`: `#10b981` / último día `#059669`
- `.blue`: `#3b82f6` / último día `#2563eb`

---

## Fila 2: Production Row

### Grid `.production-row`
```scss
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 8px;
```

### Tarjeta `.production-card`
```scss
background: white;
border-radius: 10px;
padding: 10px 12px;
box-shadow: 0 1px 4px rgba(0,0,0,0.05);
border-top: 3px solid;   // Color varía por tarjeta
```

Colores borde superior:
- Kilos: `#f59e0b`, ícono `#f59e0b`
- Metros: `#3b82f6`, ícono `#3b82f6`
- Terminados: `#10b981`, ícono `#10b981`
- Mes: `#8b5cf6`, ícono `#8b5cf6`

Tipografías internas:
- `.production-value`: `font-size: 20px`, `font-weight: 800`, color `#1e293b`
- `.production-unit`: `font-size: 11px`, `font-weight: 600`, color `#64748b`
- `.production-month`: `font-size: 13px`, `font-weight: 700`, color `#1e293b`
- `.production-label`: `font-size: 9px`, `font-weight: 600`, color `#94a3b8`, uppercase

---

## Fila 3: Charts Row (Gráficas Grandes)

### Grid `.charts-row`
```scss
display: grid;
grid-template-columns: 1fr 1fr 1fr;
gap: 10px;
```

### Tarjeta `.chart-card`
```scss
background: white;
border-radius: 10px;
padding: 6px 10px;       // Compacto para reducir alto total
box-shadow: 0 1px 4px rgba(0,0,0,0.05);
display: flex;
flex-direction: column;
height: 260px;           // Altura FIJA — evita deformación durante carga de datos
```

### Título `.chart-title`
```scss
font-size: 12px; font-weight: 700; color: #1e293b;
margin: 0 0 6px;
mat-icon: font-size: 15px; width: 15px; height: 15px; color: #3b82f6;
```

### Alturas mínimas de contenedores de barras
Estos valores son el equilibrio entre visualización y que los botones sean visibles:

| Gráfica | Selector | `min-height` |
|---------|----------|-------------|
| Eficiencia por Turno | `.shift-bars-row` | `60px` |
| Preparación por Día | `.daily-bars` | `60px` |
| Top Pantones del Mes | `.pantone-bars` | `60px` |

**REGLA**: No subir estos valores por encima de `100px` — los botones de acciones quedan cortados.

### Eficiencia por Turno — tipografías internas
- `.day-label`: `font-size: 10px`, `font-weight: 700`, color `#1e293b`
- `.day-date-label`: `font-size: 8px`, color `#94a3b8`
- `.bar-num`: `font-size: 9px`, `font-weight: 800`, color `white`, `text-shadow: 0 1px 2px rgba(0,0,0,0.4)`, `position: absolute`, `bottom: 2px`, `line-height: 1`
- Leyenda `.legend-item`: `font-size: 10px`, `font-weight: 600`, color `#475569`
- Colores turnos: T1 `#fbbf24→#f59e0b`, T2 `#60a5fa→#3b82f6`, T3 `#818cf8→#6366f1`
- Ancho barras `.thin-bar`: `width: 16px`
- Gap entre días `.shift-bars-row`: `gap: 2px`
- Gap entre barras `.triple-bar`: `gap: 3px`
- Multiplicador altura: `count * 12` (no 16 — evita desbordamiento)
- **REGLA**: `.bar-num` siempre con `bottom: 2px` (nunca `top`) para que sea visible sin importar la altura

### Preparación por Día — tipografías internas
- `.daily-count`: `font-size: 11px`, `font-weight: 700`, color `#1e293b`
- `.daily-label`: `font-size: 11px`, `font-weight: 500`, color `#64748b`
- `.daily-date`: `font-size: 9px`, `font-weight: 600`, color `#94a3b8`
- Barra: `background: linear-gradient(180deg, #3b82f6, #2563eb)`, `max-width: 40px`

### Top Pantones del Mes — tipografías internas
- `.pantone-count`: `font-size: 10px`, `font-weight: 700`, color `#1e293b`
- `.pantone-name-v`: `font-size: 8px`, `font-weight: 600`, color `#64748b`
- Barra: `width: 70%`, `max-width: 36px`, colores por índice (paleta púrpura)

---

## Fila 4: Ranking Card

### Tarjeta `.ranking-card`
```scss
background: white;
border-radius: 10px;
padding: 8px 12px;       // Compacto
box-shadow: 0 1px 4px rgba(0,0,0,0.05);
```

### Header `.ranking-header`
- Ícono: `font-size: 18px`, color `#f59e0b`
- Título `h3`: `font-size: 12px`, `font-weight: 700`, color `#1e293b`
- Subtítulo `.ranking-sub`: `font-size: 9px`, color `#94a3b8`
- `margin-bottom: 6px`

### Lista `.ranking-list`
```scss
display: flex; gap: 6px; flex-wrap: wrap;
min-height: 52px;   // Reserva espacio para skeleton durante carga
```

### Skeleton `.ranking-skeleton`
```scss
flex: 1; min-width: 180px; height: 44px;
border-radius: 8px;
// Animación shimmer con gradiente gris
```

**REGLA**: La card del ranking SIEMPRE está en el DOM (sin `*ngIf`).
Mientras carga muestra 3 skeletons. Cuando llegan datos, muestra los items reales.

### Item `.ranking-item`
```scss
flex: 1; min-width: 180px;
padding: 5px 8px;    // Compacto — no inflar el alto
border-radius: 8px;
```

Tipografías:
- `.rank-name`: `font-size: 12px`, `font-weight: 700`, color `#1e293b`
- `.rank-changes`: `font-size: 10px`, `font-weight: 600`, color `#475569`
- `.rank-avg`: `font-size: 11px`, `font-weight: 800`, color `#1e293b`
- `.rank-best`: `font-size: 9px`, `font-weight: 600`, color `#10b981`

Colores por posición:
- 🥇 Oro: fondo `linear-gradient(135deg, #fefce8, #fef9c3)`, borde `#fde047`
- 🥈 Plata: fondo `linear-gradient(135deg, #f8fafc, #f1f5f9)`, borde `#cbd5e1`
- 🥉 Bronce: fondo `linear-gradient(135deg, #fff7ed, #ffedd5)`, borde `#fdba74`

---

## Fila 5: Actions Row (Botones)

### Grid `.actions-row`
```scss
display: grid;
grid-template-columns: repeat(7, 1fr);
gap: 8px;
```

### Botón `.action-btn` — Estilo Claymorfismo
```scss
border-radius: 20px;
padding: 12px 8px;
display: flex; flex-direction: column; align-items: center; gap: 6px;
border: 3px solid rgba(255, 255, 255, 0.7);
transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease;
```

- Brillo superior con `::after`: franja semitransparente en la mitad superior del botón
- Hover: `transform: translateY(-5px) scale(1.03)` + sombra inferior reducida a `0 2px 0`
- Active: `transform: translateY(2px) scale(0.98)` con transición rápida `0.08s`

Texto: `font-size: 11px`, `font-weight: 800`, color `white`

### Ícono `.action-icon`
```scss
width: 40px; height: 40px;
border-radius: 14px;
background: rgba(255, 255, 255, 0.3);
border: 2px solid rgba(255, 255, 255, 0.5);
mat-icon: font-size: 22px; width: 22px; height: 22px; color: white;
filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));
```
En hover del botón: el ícono hace `scale(1.12) rotate(-4deg)`.

### Colores por posición (fondo pastel + sombra inferior sólida como "suelo")

| # | Botón | Fondo | Sombra inferior |
|---|-------|-------|-----------------|
| 1 | Máquinas | `linear-gradient(160deg, #fde68a, #fbbf24)` | `0 6px 0 #b45309` |
| 2 | Diseño | `linear-gradient(160deg, #bfdbfe, #60a5fa)` | `0 6px 0 #1d4ed8` |
| 3 | Reportes | `linear-gradient(160deg, #a7f3d0, #34d399)` | `0 6px 0 #065f46` |
| 4 | Documentos | `linear-gradient(160deg, #fbcfe8, #f472b6)` | `0 6px 0 #9d174d` |
| 5 | Consulta | `linear-gradient(160deg, #ddd6fe, #a78bfa)` | `0 6px 0 #5b21b6` |
| 6 | Info | `linear-gradient(160deg, #a5f3fc, #22d3ee)` | `0 6px 0 #0e7490` |
| 7 | Config | `linear-gradient(160deg, #cbd5e1, #94a3b8)` | `0 6px 0 #334155` |

En hover la sombra inferior se reduce a `0 2px 0` para efecto de presión (igual que las KPI cards).

---

## Header (`.modern-header`)

```scss
height: 70px;
overflow: hidden;   // OBLIGATORIO — evita que la foto de perfil se desborde
background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%);
```

### Avatar de perfil `.user-avatar-small`
```scss
width: 56px; height: 56px;
border-radius: 6px;
align-self: center;
max-height: calc(100% - 8px);
overflow: hidden;
```

En `@media (max-width: 768px)`:
```scss
width: 40px; height: 40px;
```

**REGLA**: El avatar NUNCA debe tener `height` mayor al del header. Usar `align-self: center` siempre.

---

## Paleta de Colores del Sistema

| Uso | Color |
|-----|-------|
| Texto principal | `#1e293b` |
| Texto secundario | `#64748b` |
| Texto terciario / labels | `#94a3b8` |
| Texto muy suave | `#cbd5e1` |
| Fondo dashboard | `#f1f5f9` |
| Fondo tarjetas | `white` |
| Borde tarjetas | `#e2e8f0` |
| Ámbar / tiempo | `#f59e0b` |
| Verde / órdenes | `#10b981` |
| Azul / diseños | `#3b82f6` |
| Púrpura / pantones | `#8b5cf6` |
| Sombra tarjetas | `0 1px 4px rgba(0,0,0,0.05)` |
| Sombra hover | `0 2px 8px rgba(0,0,0,0.08)` |

---

## Reglas Generales Irrompibles

1. **`overflow: hidden`** en `.kpi-card` y `.modern-header` — nunca quitar
2. **`padding-bottom: 16px`** en `.dashboard-container` — nunca poner `0`
3. **`min-height` de gráficas** — máximo `100px`, mínimo `40px`
4. **Barras KPI** — siempre `height.px`, nunca `height.%`
5. **Ranking card** — siempre en el DOM, sin `*ngIf` en el contenedor principal
6. **Avatar header** — `align-self: center` y `max-height: calc(100% - 8px)` siempre
7. **Gap entre filas** — `8px` en `.dashboard-container`
8. **Gap entre KPI cards** — `10px` en `.kpi-row`
9. **Gap entre gráficas** — `10px` en `.charts-row`
10. **Contenedores de gráficas** — `.shift-week-chart`, `.daily-chart`, `.pantone-chart` SIEMPRE en el DOM (sin `*ngIf`). Usar `*ngIf` solo dentro del `*ngFor` de las barras. Esto evita que las tarjetas colapsen mientras cargan datos.
11. **`.chart-card` height** — siempre `180px` fijo para evitar deformación durante la carga
