# Login - Guía de Diseño y Especificaciones

> **IMPORTANTE**: Este documento es la fuente de verdad para el módulo de login.

---

## Estructura General

El login ocupa toda la pantalla (100vw × 100vh) con dos secciones principales:
1. **Sección empresa (izquierda)** — Logo, reloj, misión y visión
2. **Tarjeta de login (derecha)** — Formulario de autenticación

---

## Archivos del Módulo

```
Frontend/src/app/shared/components/login/
├── login.ts       # Componente standalone (Angular 20, sin animaciones canvas)
├── login.html     # Template
└── login.scss     # Estilos con ::ng-deep para Material
```

---

> **Estilo actual**: Apple Design System — tipografía SF Pro, glassmorphism limpio, azul de sistema `#0071e3`.

## Paleta de Colores

| Variable | Color | Uso |
|----------|-------|-----|
| `$apple-blue` | `#0071e3` | Azul de sistema: botón, acentos, focus, íconos, links |
| `$apple-blue-hover` | `#0077ed` | Hover del botón |
| `$apple-blue-active` | `#006edb` | Estado active del botón |
| `$text-primary` | `#1d1d1f` | Texto principal (títulos, reloj) |
| `$text-secondary` | `#6e6e73` | Texto secundario (subtítulos, fecha, labels) |
| `$text-tertiary` | `#86868b` | Texto terciario (placeholders, íconos suffix) |
| `$hairline` | `rgba(0,0,0,0.08)` | Bordes finos (hairline) |
| Rojo error | `#ff3b30` / `#d70015` | Rojo de sistema de Apple para errores |
| Verde éxito | `#34c759` | Verde de sistema para `btn-granted` |

### Tipografía

Stack `$sf-font`: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Inter', system-ui, sans-serif`.
Aplicado en `.login-container` con `-webkit-font-smoothing: antialiased`. Los tamaños usan `letter-spacing` negativo (tracking Apple).

---

## Fondo (`.login-container`)

Gradiente suave y difuso tipo macOS Big Sur, más dos halos de color desenfocados (blobs) via pseudo-elementos.

```scss
font-family: $sf-font;
background: linear-gradient(160deg, #eaf1ff 0%, #dfeaff 22%, #e9e4ff 48%, #f0eaff 68%, #e6f0ff 100%);
background-size: 200% 200%;
animation: appleGradient 24s ease-in-out infinite;
```

- `&::before` — blob azul `#a5c8ff`, 520px, arriba-izquierda, `blur(90px)`, `floatBlob1 20s`
- `&::after` — blob púrpura `#c9b8ff`, 460px, abajo-derecha, `blur(90px)`, `floatBlob2 26s`
- Ambos con `opacity: 0.55`, `pointer-events: none`, `z-index: 0`

---

## Sección Empresa (`.company-info-section`)

`padding: 80px 72px 60px`, texto en color `$text-primary`.

- **Logo** (`.company-logo-main`): `width: 74%`, `border-radius: 22px`, `drop-shadow(0 12px 32px rgba(0,0,0,0.12))`, hover `scale(1.02)`
- **Reloj** (`.clock-section`): widget glassmorphism estilo centro de notificaciones (macOS/iOS). `display: inline-flex` en columna alineado a la izquierda, `padding: 20px 26px`, `background: rgba(255,255,255,0.5)`, `backdrop-filter: blur(24px) saturate(180%)`, `border: 1px solid rgba(255,255,255,0.6)`, `border-radius: 22px`, `box-shadow: 0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.55)`
  - Hora (`.current-time`): `font-size: 3.6rem`, `font-weight: 500`, `$sf-font`, color `$text-primary`, `letter-spacing: -2.4px`, `line-height: 1`, `font-variant-numeric: tabular-nums` + `font-feature-settings: 'tnum'`
  - Fecha (`.current-date`): `font-size: 1.02rem`, `font-weight: 500`, color `$apple-blue`, capitalizada
- **Misión/Visión**: sin fondo ni glassmorphism
  - Título (`.section-title`): `font-size: 1.25rem`, `font-weight: 600`, color `$text-primary`; ícono `22px` color `$apple-blue`
  - Texto (`.section-text`): `font-size: 1.02rem`, `line-height: 1.55`, color `$text-secondary`, `padding-left: 32px`

---

## Tarjeta de Login (`.login-card` + `.login-form`)

`.login-card`: `flex: 0 0 480px`.

```scss
.login-form {
  max-width: 400px;
  min-height: 620px;              // tarjeta alta, contenido centrado vertical
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(40px) saturate(180%);
  border-radius: 28px;
  padding: 48px 40px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  animation: cardAppear 0.8s cubic-bezier(0.28, 0.11, 0.32, 1) forwards;
}
```

`form` interno: `gap: 18px`. `cardAppear` entra desde `translateY(28px) scale(0.96)`.

### Header del formulario (`.form-header`, `margin-bottom: 40px`)
- Título: "FlexoApp" (`.app-title-text`), `font-size: 2.6rem`, `font-weight: 700`, color plano `$text-primary`, `letter-spacing: -1.2px` (sin gradiente ni animación shine)
- Subtítulo (`p`): `font-size: 1.05rem`, `font-weight: 400`, color `$text-secondary`

---

## Campos de Formulario (`.form-field`) — estilo iOS

**CRÍTICO**: Usar `::ng-deep` para penetrar la encapsulación de Angular Material MDC.
Los campos son `mat-form-field` de tipo *filled* (`.login-field`).

- `border-radius: 14px`, borde hairline `1px solid rgba(0,0,0,0.08)`, **sin** box-shadow
- Fondo del campo: `rgba(255, 255, 255, 0.7)`
- Altura del contenedor: `58px`, `padding: 0 14px 0 16px`
- Label flotante: `font-size: 0.98rem`, `font-weight: 400`, color `$text-tertiary`; al flotar `scale(0.75)` color `$apple-blue`
- Input: `font-size: 1rem`, `font-weight: 400`, color `$text-primary`, `caret-color: $apple-blue`
- Hover: borde `rgba(0,0,0,0.16)`, fondo `rgba(255,255,255,0.82)`
- Focus: borde `$apple-blue`, fondo `rgba(255,255,255,0.95)`, `box-shadow: 0 0 0 4px rgba(0,113,227,0.15)`
- Íconos suffix (`.field-suffix-icon`): `20px`, color `$text-tertiary`; botón (`.field-suffix-btn`) `border-radius: 50%`, hover color `$apple-blue` + fondo `rgba(0,113,227,0.08)`
- Errores (`.mat-mdc-form-field-error`): `font-size: 0.8rem`, `font-weight: 400`, color `#ff3b30`

### Autocompletado (anti-fondo negro)
```scss
&:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 100px rgba(255, 255, 255, 0.92) inset !important;
  -webkit-text-fill-color: #1d1d1f !important;
  transition: background-color 9999s ease-in-out 0s;
}
```

---

## Mensaje de Error (`.error-message`)

```scss
border-radius: 14px;
background: rgba(255, 59, 48, 0.1);
border: 1px solid rgba(255, 59, 48, 0.22);
color: #d70015;
font-size: 0.9rem;
font-weight: 400;
padding: 14px 18px;
```

- `align-items: flex-start` (no center) para textos largos
- `word-wrap: break-word` para que el mensaje se muestre completo
- Ícono `mat-icon` con `flex-shrink: 0`, color `#ff3b30`
- Entrada con `errorSlide 0.3s ease-out`

---

## Opciones (`.options-row`)

Fila con dos elementos en la misma línea, debajo de los campos:
- **Recordarme** (`mat-checkbox` `.remember-checkbox`) — vinculado al control `rememberMe` del form.
  - Checkbox azul de sistema: MDC vars sobreescritas a `$apple-blue` (seleccionado, hover, focus); fondo sin marcar `rgba(255,255,255,0.9)` con borde `1.5px #c7c7cc`. Label `font-size: 0.9rem`, `font-weight: 400`, color `$text-secondary`.
  - Al iniciar sesión con éxito guarda el usuario en `localStorage` (clave `flexoapp_remember_user`).
  - Al cargar el login, si hay un usuario recordado, precarga `userCode` y marca el checkbox.
- **¿Olvidaste tu contraseña?** (`a.forgot-link`) — color `$apple-blue`, `font-size: 0.9rem`, `font-weight: 400`; hover subraya. Dispara `onForgotPassword($event)` (hace `preventDefault`).

---

## Botón Login (`.login-button`) — Apple

```scss
height: 52px;
margin-top: 8px;
background: #0071e3;              // $apple-blue, sólido (sin gradiente)
color: #ffffff;
border: none;
border-radius: 14px;
font-size: 1.02rem;
font-weight: 500;
letter-spacing: -0.2px;
font-family: $sf-font;
box-shadow: 0 4px 14px rgba(0, 113, 227, 0.3);
```

- Hover: fondo `$apple-blue-hover` + `scale(1.01)` + sombra más marcada
- Active: fondo `$apple-blue-active` + `scale(0.99)`
- Disabled: fondo plano `rgba(0,0,0,0.16)`, sin sombra; label `rgba(255,255,255,0.85)`
- Spinner: ícono `refresh` con `animation: spin 1s linear infinite` (solo cuando `isLoading()` y `buttonState() === 'idle'`)

### Estados animados del botón (`buttonState`)

El botón cambia de clase y contenido según el signal `buttonState()`:

| Estado | Clase CSS | Contenido | Cuándo |
|--------|-----------|-----------|--------|
| `idle` | (ninguna) | "Iniciar Sesión" / "Bloqueado" (si `isBlocked()`) | Estado inicial |
| `walking` | `.btn-walking` | "Iniciando..." | Al enviar el formulario |
| `granted` | `.btn-granted` | ícono `check_circle` + "Acceso Concedido" | Login exitoso; fondo verde de sistema `#34c759`, `grantedPulse`. Botón deshabilitado, luego navega a `/dashboard` |
| `denied` | `.btn-denied` | vuelve al contenido por defecto | Error de login; anima `deniedShake` (sacudida horizontal); se resetea a `idle` tras ~1.3s (`triggerDenied()`) |

El botón se deshabilita cuando el formulario es inválido, `isLoading()`, `isBlocked()`, o `buttonState() === 'granted'`.

---

## Rate Limiting (Seguridad Anti Fuerza Bruta)

### Backend (`LoginRateLimiterService.cs`)
- **Singleton** con `ConcurrentDictionary` estático
- Clave: `userCode.ToLower()` (por usuario)
- **3 intentos** máximos antes de bloquear
- **5 minutos** de bloqueo tras 3 fallos
- Login exitoso resetea el contador
- Respuestas: `401` con `attemptsRemaining`, `429` con `lockedUntilSeconds`

### Frontend (`login.ts`)
- Signals: `isBlocked`, `blockCountdown`
- Status `401`: muestra "Quedan X intento(s) restantes"
- Status `429`: activa `startBlockCountdown(seconds)`
  - Deshabilita botón (texto "Bloqueado")
  - Contador regresivo mm:ss en el mensaje de error
  - NO hace requests al backend durante el bloqueo
  - Al terminar: "Puedes intentar nuevamente"

### Flujo completo
1. Intento 1 fallido → "Quedan 2 intento(s)"
2. Intento 2 fallido → "Quedan 1 intento(s)"
3. Intento 3 fallido → 429 → botón bloqueado + countdown 5:00
4. Durante bloqueo → submit retorna sin request
5. Tras 5 min → se reactiva

---

## Signals del Componente

| Signal | Tipo | Uso |
|--------|------|-----|
| `hidePassword` | `boolean` | Toggle visibilidad contraseña |
| `isLoading` | `boolean` | Spinner durante request |
| `errorMessage` | `string` | Mensaje de alerta |
| `buttonState` | `'idle' \| 'walking' \| 'granted' \| 'denied'` | Estado animado del botón login |
| `isBlocked` | `boolean` | Bloqueo por rate limit |
| `blockCountdown` | `number` | Segundos restantes de bloqueo |
| `currentTime` | `string` | Hora actual (reloj) |
| `currentDate` | `string` | Fecha actual |

---

## Auth Service (Fallback URLs)

```typescript
tryLoginWithFallback(credentials, urlIndex):
  urls = [environment.apiUrl, ...environment.fallbackUrls]
  // Solo retry en status === 0 (sin conexión) o TimeoutError
  // NO retry en 401, 429, 500
```

---

## Responsive

| Breakpoint | Cambios |
|-----------|---------|
| `≤ 1024px` | Layout vertical (columna), logo 42%, reloj `3.2rem`, `.login-form` `max-width: 100%`, `min-height: auto` |
| `≤ 768px` | Padding reducido, form `border-radius: 24px`, reloj `2.8rem` |
| `≤ 480px` | Logo 70%, reloj `2.4rem`, form `border-radius: 22px`, título `2.2rem`, botón `50px` |

---

## Reglas Irrompibles

1. **`::ng-deep`** — obligatorio para estilar los campos MDC de Material
2. **Radios Apple** — `14px` en campos, botón y alerta; `28px` en la tarjeta `.login-form`
3. **Azul de sistema `#0071e3`** — un solo acento para botón, focus, links, íconos y checkbox (sin gradientes)
4. **Tipografía `$sf-font`** — SF Pro con `letter-spacing` negativo; `font-weight` moderado (400–700), nunca `900`
5. **Rate limit por `userCode`** — cada usuario tiene su propio contador
6. **No retry en 401/429** — solo retry en `status === 0`
7. **`backdrop-filter: blur(40px) saturate(180%)`** — glassmorphism de la tarjeta
8. **Autocompletado** — siempre con `-webkit-box-shadow inset` para evitar fondo negro/azul del browser
9. **Animación `appleGradient`** — el fondo se mueve, nunca estático; los blobs (`::before/::after`) usan `blur(90px)` y flotan
10. **Bloqueo frontend** — durante countdown NO se hacen requests al backend
11. **`flex-shrink: 0`** en ícono de error — evita que se comprima
12. **Colores de sistema Apple** — error `#ff3b30`/`#d70015`, éxito `#34c759`
13. **Sin canvas/animaciones JS** — solo CSS para el fondo y blobs, sin WebGL ni canvas
