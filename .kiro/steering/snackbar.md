# Snackbar - Guía de Diseño y Especificaciones

> **IMPORTANTE**: Este documento es la fuente de verdad para los snackbars/notificaciones emergentes.

---

## Estructura General

Los snackbars son notificaciones emergentes que aparecen al realizar acciones (cambio de estado, importación, errores, etc.). Usan `MatSnackBar` de Angular Material con estilos personalizados via `panelClass`.

---

## Archivos del Módulo

```
Frontend/src/styles.scss              # Estilos globales de snackbars (clases panelClass)
Frontend/src/app/shared/components/machines/machines.ts  # Método showStatusMessage()
Frontend/src/app/core/services/notification.service.ts   # Servicio de sonidos
```

---

## Cómo se Usan (TypeScript)

### Snackbar simple (sin estilo especial)

```typescript
this.snackBar.open('Mensaje aquí', 'Cerrar', { duration: 3000 });
```

### Snackbar con estilo de estado (animado)

```typescript
showStatusMessage(estado: string, message: string): void {
  const iconosPorEstado: Record<string, string> = {
    'PREPARANDO': '⏱',
    'LISTO': '✓',
    'CORRIENDO': '▶',
    'SUSPENDIDO': '⏸',
    'TERMINADO': '🏁',
    'SIN_ASIGNAR': '📋'
  };

  const statusConfig: Record<string, { panelClass: string }> = {
    'PREPARANDO': { panelClass: 'status-preparando-snackbar' },
    'LISTO': { panelClass: 'status-listo-snackbar' },
    'CORRIENDO': { panelClass: 'status-corriendo-snackbar' },
    'SUSPENDIDO': { panelClass: 'status-suspendido-snackbar' },
    'TERMINADO': { panelClass: 'status-terminado-snackbar' },
    'SIN_ASIGNAR': { panelClass: 'status-sin-asignar-snackbar' }
  };

  const config = statusConfig[estado] || { panelClass: 'status-default-snackbar' };
  const icono = iconosPorEstado[estado] || '✓';
  const mensajeConIcono = `<span class="status-icon">${icono}</span>${mensajeFinal}`;

  // Reproducir sonido
  this.notificationService.playSoundIfEnabled(soundType);

  // Abrir snackbar vacío con clases de estilo
  const snackBarRef = this.snackBar.open('', '', {
    duration: 4000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    panelClass: [config.panelClass, 'animated-snackbar']
  });

  // Inyectar HTML con icono (workaround para HTML en snackbar)
  setTimeout(() => {
    const label = document.querySelector(`.${config.panelClass} .mat-mdc-snack-bar-label`);
    if (label) {
      label.innerHTML = mensajeConIcono;
    }
  }, 0);
}
```

### Snackbar directo con panelClass (sin showStatusMessage)

```typescript
// Error
this.snackBar.open('', 'Cerrar', {
  duration: 5000,
  panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
  horizontalPosition: 'center',
  verticalPosition: 'bottom'
});
setTimeout(() => {
  const label = document.querySelector('.status-terminado-snackbar .mat-mdc-snack-bar-label');
  if (label) label.innerHTML = `<span class="status-icon">✕</span>Mensaje de error`;
}, 0);

// Éxito
this.snackBar.open('', 'Cerrar', {
  duration: 3000,
  panelClass: ['status-listo-snackbar', 'animated-snackbar'],
  horizontalPosition: 'center',
  verticalPosition: 'bottom'
});
setTimeout(() => {
  const label = document.querySelector('.status-listo-snackbar .mat-mdc-snack-bar-label');
  if (label) label.innerHTML = `<span class="status-icon">✓</span>Mensaje de éxito`;
}, 0);
```

---

## Estructura HTML Renderizada (DOM)

```html
<!-- Angular Material genera esta estructura -->
<div class="mdc-snackbar mat-mdc-snack-bar-container status-listo-snackbar animated-snackbar">
  <div class="mdc-snackbar__surface">
    <div class="mat-mdc-snack-bar-label mdc-snackbar__label">
      <!-- Inyectado via innerHTML -->
      <span class="status-icon">✓</span>Programa listo para producción
    </div>
    <div class="mat-mdc-snack-bar-actions mdc-snackbar__actions">
      <button class="mat-mdc-button mdc-button">Cerrar</button>
    </div>
  </div>
</div>
```

---

## Estilos CSS (styles.scss)

### Clases base genéricas

| Clase | Gradiente | Animación | Uso |
|-------|-----------|-----------|-----|
| `.success-snackbar` | `#10b981 → #059669 → #1f2937` | `pulse 1.8s × 2` | Operación exitosa genérica |
| `.error-snackbar` | `#ef4444 → #dc2626 → #1f2937` | `blink 1.5s × 3` | Error genérico |
| `.info-snackbar` | `#3b82f6 → #2563eb → #1f2937` | `shimmer 2s infinite` | Información |
| `.warning-snackbar` | `#f59e0b → #d97706 → #1f2937` | `glow 2.5s infinite` | Advertencia |
| *(sin clase)* | `#334155 → #1e293b → #0f172a` | solo `slideInUp` | Snackbar genérico por defecto |

### Clases de estado con degradado (para cambios de estado de máquinas)

| Clase | Gradiente | Animación | Estado |
|-------|-----------|-----------|--------|
| `.status-preparando-snackbar` | `#fbbf24 → #f59e0b → #1f2937` | `glow 2.5s infinite` | PREPARANDO |
| `.status-listo-snackbar` | `#10b981 → #059669 → #1f2937` | `pulse 1.8s × 2` | LISTO |
| `.status-corriendo-snackbar` | `#3b82f6 → #2563eb → #1f2937` | `shimmer 2s infinite` | CORRIENDO |
| `.status-suspendido-snackbar` | `#f97316 → #ea580c → #1f2937` | `blink 1.5s × 3` | SUSPENDIDO |
| `.status-terminado-snackbar` | `#ef4444 → #dc2626 → #1f2937` | `bounce 0.7s × 2` | TERMINADO |
| `.status-sin-asignar-snackbar` | `#64748b → #475569 → #1f2937` | solo `slideInUp` | SIN ASIGNAR |
| `.status-duplicado-snackbar` | `#f59e0b → #d97706 → #1f2937` | `glow 2s × 2` | DUPLICADO |
| `.status-default-snackbar` | `#6366f1 → #4f46e5 → #1f2937` | solo `slideInUp` | DEFAULT |

### Clase animada base `.animated-snackbar`

```scss
.animated-snackbar:not(.success-snackbar) {
  animation: slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 10px !important;
  padding: 0 !important;
  min-width: 320px !important;
  max-width: 520px !important;
  overflow: visible !important;

  &.mat-mdc-snack-bar-container {
    background-color: transparent !important;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;

    .mdc-snackbar__surface {
      background-color: transparent !important;
      padding: 0 !important;
    }
  }

  .mat-mdc-snack-bar-label {
    font-size: 14px !important;
    font-weight: 500 !important;
    letter-spacing: 0.3px !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 10px 18px !important;
    line-height: 1.4 !important;
    white-space: normal !important;
    word-wrap: break-word !important;
  }
}
```

### Icono circular `.status-icon`

```scss
.status-icon {
  font-size: 16px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  background: rgba(255, 255, 255, 0.25) !important;
  border-radius: 50% !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15),
              0 0 0 2px rgba(255, 255, 255, 0.2) inset !important;
  animation: iconBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s;
  flex-shrink: 0 !important;
}
```

### Patrón de cada clase de estado

```scss
.status-[ESTADO]-snackbar {
  &.mat-mdc-snack-bar-container {
    background: linear-gradient(135deg, [COLOR1] 0%, [COLOR2] 70%, #1f2937 100%) !important;
    animation: slideInUp 0.5s ..., [ANIMACIÓN_SECUNDARIA];

    .mdc-snackbar__surface {
      background: transparent !important;
    }
  }

  .mat-mdc-snack-bar-label {
    color: #ffffff !important;
  }
}
```

---

## Animaciones

```scss
@keyframes slideInUp {
  0% { transform: translateY(100px) scale(0.9); opacity: 0; }
  70% { transform: translateY(-8px) scale(1.03); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes iconBounce {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.3); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 6px 16px rgba(251, 191, 36, 0.3); }
  50% { box-shadow: 0 6px 24px rgba(251, 191, 36, 0.6); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes shimmer {
  0% { box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 6px 24px rgba(59, 130, 246, 0.5); }
  100% { box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3); }
}
```

---

## Configuración por Defecto

| Propiedad | Valor |
|-----------|-------|
| `duration` | 4000ms (estados), 3000ms (éxito), 5000ms (error) |
| `horizontalPosition` | `'center'` |
| `verticalPosition` | `'bottom'` |
| `border-radius` | `10px` (animados), `8px` (genéricos) |
| `min-width` | `320px` |
| `max-width` | `520px` |

---

## Sonidos

Se reproducen via `NotificationService.playSoundIfEnabled(type)`:
- `'success'` → para LISTO, CORRIENDO
- `'warning'` → para SUSPENDIDO, TERMINADO
- `'info'` → para otros estados

---

## Importante: Penetración de Estilos

Los estilos de snackbar deben estar en `styles.scss` (global), **NO** en archivos `.scss` de componentes, porque el snackbar se renderiza fuera del componente (en un overlay CDK). Las clases se aplican via `panelClass` en la configuración del `MatSnackBar.open()`.

### Snackbars genéricos (sin panelClass)

Todos los snackbars, incluso los que no usan `panelClass`, tienen un estilo visible por defecto:
- **Fondo**: `linear-gradient(135deg, #334155 0%, #1e293b 70%, #0f172a 100%)` (gris oscuro)
- **Texto**: `#ffffff`
- **Animación**: `slideInUp 0.5s`
- **border-radius**: `10px`
- **box-shadow**: `0 6px 16px rgba(0, 0, 0, 0.2)`

Los snackbars con `panelClass` sobreescriben ese fondo con su propio degradado de color.

---

## Reglas Irrompibles

1. **Siempre usar `panelClass`** — los estilos se inyectan via clases, nunca inline
2. **`background: transparent`** en `.mdc-snackbar__surface` — el color viene del contenedor padre
3. **Texto siempre `#ffffff`** — todos los snackbars de estado usan texto blanco
4. **Degradado con `#1f2937`** — todos los snackbars de estado terminan en gris oscuro (efecto de profundidad)
5. **`animated-snackbar`** — siempre agregar como segunda clase junto a la clase de estado
6. **HTML inyectado con setTimeout** — Angular Material no soporta HTML en el mensaje, se usa `innerHTML` tras un tick
7. **Posición** — siempre `center` horizontal y `bottom` vertical
8. **Sonido** — siempre llamar `playSoundIfEnabled` antes de mostrar el snackbar
9. **No usar `::ng-deep` en componentes** — estilos van en `styles.scss` global
10. **`slideInUp`** — animación de entrada obligatoria en todos los snackbars animados
