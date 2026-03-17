# Optimización del Módulo de Máquinas

## Fecha: 2026-03-06
## Objetivo: Mejorar velocidad de cambio entre máquinas, despliegue de historial y paleta de colores

---

## Problemas Identificados

1. **Cambio lento entre máquinas (11 → 12)**
   - Recálculo innecesario de estados
   - Falta de debouncing en cambios
   - Animaciones CSS pesadas

2. **Historial de estado lento**
   - Timeout innecesario
   - Animaciones complejas
   - Falta de virtualización

3. **Paleta de colores lenta**
   - Carga de datos Pantone en cada apertura
   - Animaciones pesadas
   - Falta de lazy loading

---

## Optimizaciones Implementadas

### 1. TypeScript (machines.ts)

#### A. Optimizar selectMachine()
```typescript
// ANTES: Recalcula todo
selectMachine(machineNumber: number) {
  this.selectedMachineNumber.set(machineNumber);
  console.log(`🎯 Máquina seleccionada: ${machineNumber}`);
}

// DESPUÉS: Usa caché y evita recálculos
selectMachine(machineNumber: number) {
  if (this.selectedMachineNumber() === machineNumber) return;
  this.selectedMachineNumber.set(machineNumber);
  // Cerrar expansiones abiertas para mejor rendimiento
  this.expandedColors.set(new Set());
  this.expandedStatusHistory.set(new Set());
}
```

#### B. Optimizar toggleStatusHistory()
```typescript
// ANTES: Con timeout innecesario
toggleStatusHistory(otSap: string, event: Event) {
  event.stopPropagation();
  const expanded = new Set(this.expandedStatusHistory());
  if (expanded.has(otSap)) {
    expanded.delete(otSap);
  } else {
    expanded.add(otSap);
  }
  this.expandedStatusHistory.set(expanded);
  
  // Timeout innecesario
  if (this.statusHistoryTimeout) {
    clearTimeout(this.statusHistoryTimeout);
  }
  this.statusHistoryTimeout = setTimeout(() => {
    this.expandedStatusHistory.set(new Set());
  }, 30000);
}

// DESPUÉS: Sin timeout, más rápido
toggleStatusHistory(otSap: string, event: Event) {
  event.stopPropagation();
  const expanded = new Set(this.expandedStatusHistory());
  if (expanded.has(otSap)) {
    expanded.delete(otSap);
  } else {
    // Cerrar otros historiales abiertos
    expanded.clear();
    expanded.add(otSap);
  }
  this.expandedStatusHistory.set(expanded);
}
```

#### C. Optimizar toggleColorsWithLoad()
```typescript
// DESPUÉS: Lazy loading y caché
toggleColorsWithLoad(program: MachineProgram, event: Event) {
  event.stopPropagation();
  const otSapKey = (program.otSap || '').toString();
  const expanded = new Set(this.expandedColors());
  
  if (expanded.has(otSapKey)) {
    expanded.delete(otSapKey);
  } else {
    // Cerrar otras paletas abiertas
    expanded.clear();
    expanded.add(otSapKey);
    
    // Solo cargar si no está en caché
    if (!this.selectedAniloxData().has(`${otSapKey}-0`)) {
      this.loadAniloxForProgram(program);
    }
  }
  this.expandedColors.set(expanded);
}
```

#### D. Eliminar console.log innecesarios en producción
- Reducir logs en métodos que se ejecutan frecuentemente
- Usar console.log solo para errores críticos

---

### 2. HTML (machines.html)

#### A. Agregar trackBy en *ngFor
```html
<!-- ANTES -->
<div *ngFor="let color of element.colores; let i = index">

<!-- DESPUÉS -->
<div *ngFor="let color of element.colores; let i = index; trackBy: trackByColorIndex">
```

#### B. Usar OnPush Change Detection
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

#### C. Lazy loading de componentes pesados
```html
<!-- Usar *ngIf para cargar solo cuando sea necesario -->
<div class="expanded-detail-container" *ngIf="isColorsExpanded(...)">
```

---

### 3. CSS (machines.scss)

#### A. Reducir animaciones complejas
```scss
// ANTES: Animación pesada
@keyframes detailExpand {
  from {
    height: 0;
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    height: var(--expanded-height);
    opacity: 1;
    transform: translateY(0);
  }
}

// DESPUÉS: Animación simple
@keyframes detailExpand {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### B. Usar will-change para animaciones
```scss
.expanded-detail-container {
  will-change: opacity;
  transition: opacity 0.2s ease;
}
```

#### C. Eliminar sombras complejas innecesarias
```scss
// ANTES
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
            0 2px 4px -1px rgba(0, 0, 0, 0.06);

// DESPUÉS
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
```

---

### 4. Código Obsoleto a Eliminar

#### A. Animaciones no usadas
- `borderBlinkCritical`
- `borderBlinkWarning`
- `borderBlinkGood`

#### B. Métodos deprecados
- Buscar métodos con comentarios "// TODO: Eliminar"
- Buscar métodos que no se usan en el HTML

#### C. Imports no utilizados
- Revisar imports en machines.ts
- Eliminar servicios no inyectados

---

## Métricas de Rendimiento Esperadas

### Antes:
- Cambio de máquina: ~500-800ms
- Apertura historial: ~300-500ms
- Apertura paleta colores: ~400-600ms

### Después:
- Cambio de máquina: ~100-200ms (75% más rápido)
- Apertura historial: ~50-100ms (80% más rápido)
- Apertura paleta colores: ~100-200ms (70% más rápido)

---

## Checklist de Implementación

- [ ] Optimizar selectMachine()
- [ ] Optimizar toggleStatusHistory()
- [ ] Optimizar toggleColorsWithLoad()
- [ ] Agregar trackBy en todos los *ngFor
- [ ] Implementar OnPush Change Detection
- [ ] Simplificar animaciones CSS
- [ ] Eliminar console.log innecesarios
- [ ] Eliminar código obsoleto
- [ ] Eliminar animaciones no usadas
- [ ] Probar rendimiento en producción

---

## Notas Adicionales

- Considerar implementar virtual scrolling para tablas grandes
- Implementar paginación si hay más de 50 programas
- Usar Web Workers para cálculos pesados
- Implementar Service Worker para caché offline
