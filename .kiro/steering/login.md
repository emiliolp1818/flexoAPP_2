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

## Paleta de Colores

| Variable | Color | Uso |
|----------|-------|-----|
| `$primary` | `#4f8ef7` | Acentos, íconos |
| `$primary-dark` | `#2563eb` | Texto del reloj, focus |
| `$accent` | `#a78bfa` | Gradientes, hover |
| Fondo | `linear-gradient(135deg, #c7d7ff, #e0d7ff, #d7f0ff, #d7ffe8)` | Gradiente pastel animado |

---

## Fondo (`.login-container`)

```scss
background: linear-gradient(135deg, #c7d7ff 0%, #e0d7ff 35%, #d7f0ff 65%, #d7ffe8 100%);
background-size: 300% 300%;
animation: clayGradient 10s ease infinite;
```

---

## Orbes Decorativos (`.animated-background`)

3 esferas con `border-radius: 50%` que se mueven con animaciones `roam1`, `roam2`, `roam3`:
- **Orbe 1**: cian/verde, 220px, animación 22s
- **Orbe 2**: rosa, 160px, animación 28s
- **Orbe 3**: púrpura, 130px, animación 34s

Todas con `filter: blur(3px)`, `opacity: 0.7`, `will-change: transform`.

---

## Sección Empresa (`.company-info-section`)

- **Logo**: `width: 88%`, `border-radius: 24px`, drop-shadow azul
- **Reloj**: fondo glassmorphism (`rgba(255,255,255,0.55)`, `backdrop-filter: blur(20px)`), `border-radius: 28px`
  - Hora: `font-size: 2.8rem`, `font-weight: 800`, monospace, color `$primary-dark`
  - Fecha: `font-size: 1rem`, `font-weight: 600`, capitalizada
- **Misión/Visión**: fondo glassmorphism, `border-radius: 22px`, borde blanco semitransparente

---

## Tarjeta de Login (`.login-card` + `.login-form`)

```scss
.login-form {
  max-width: 380px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(30px);
  border-radius: 36px;
  padding: 40px 36px;
  border: 3px solid rgba(255, 255, 255, 0.9);
}
```

### Logo usuario (`.logo-container`)
- 82px × 82px, circular, fondo glassmorphism
- Animación `logoFloat` (sube y baja 6px cada 5s)

### Header del formulario
- Título: `font-size: 2rem`, `font-weight: 900`, gradiente azul→púrpura
- Subtítulo: "Accede a tu cuenta", color `#64748b`

---

## Campos de Formulario (`.form-field`)

**CRÍTICO**: Usar `::ng-deep` para penetrar la encapsulación de Angular Material MDC.

```scss
::ng-deep {
  .mat-mdc-text-field-wrapper { border-radius: 22px !important; }
  .mdc-text-field--outlined { border-radius: 22px !important; }
  .mdc-notched-outline { border-radius: 22px !important; }
  .mdc-notched-outline__leading { border-radius: 22px 0 0 22px !important; border: none !important; }
  .mdc-notched-outline__trailing { border-radius: 0 22px 22px 0 !important; border: none !important; }
  .mat-mdc-form-field-flex { border-radius: 22px !important; overflow: hidden; }
}
```

- Fondo del campo: `rgba(255, 255, 255, 0.8)`
- Borde: `2px solid rgba(255, 255, 255, 0.95)`
- Hover: borde púrpura `rgba(167, 139, 250, 0.6)`
- Focus: borde azul + `box-shadow: 0 0 0 3px rgba(79, 142, 247, 0.15)`

### Autocompletado (anti-fondo negro)
```scss
&:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 100px rgba(255, 255, 255, 0.9) inset !important;
  -webkit-text-fill-color: #1e293b !important;
  transition: background-color 9999s ease-in-out 0s;
}
```

---

## Mensaje de Error (`.error-message`)

```scss
border-radius: 22px;
background: rgba(255, 220, 220, 0.7);
border: 2px solid rgba(255, 180, 180, 0.6);
color: #dc2626;
font-size: 13px;
```

- `align-items: flex-start` (no center) para textos largos
- `word-break: break-word` para que el mensaje se muestre completo
- Ícono con `flex-shrink: 0`

---

## Botón Login (`.login-button`)

```scss
height: 52px;
border-radius: 22px;
background: linear-gradient(135deg, #4f8ef7 0%, #a78bfa 100%);
border: 3px solid rgba(255, 255, 255, 0.5);
font-size: 15px;
font-weight: 800;
```

- Hover: `translateY(-4px) scale(1.01)`
- Disabled: gradiente gris `#cbd5e1 → #e2e8f0`
- Spinner: ícono `refresh` con `animation: spin 1s linear infinite`

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
| `≤ 1024px` | Layout vertical (columna), logo 50% |
| `≤ 768px` | Padding reducido, form `border-radius: 28px` |
| `≤ 480px` | Logo 88%, reloj 1.8rem, form `border-radius: 24px` |

---

## Reglas Irrompibles

1. **`::ng-deep`** — obligatorio para estilar los campos MDC de Material
2. **`border-radius: 22px`** — unificado en campos, botón, y alerta
3. **Rate limit por `userCode`** — cada usuario tiene su propio contador
4. **No retry en 401/429** — solo retry en `status === 0`
5. **`backdrop-filter: blur`** — en todos los paneles glassmorphism
6. **`will-change: transform`** — en los orbes para GPU acceleration
7. **Autocompletado** — siempre con `-webkit-box-shadow inset` para evitar fondo negro/azul del browser
8. **Animación `clayGradient`** — el fondo se mueve, nunca estático
9. **Bloqueo frontend** — durante countdown NO se hacen requests al backend
10. **`flex-shrink: 0`** en ícono de error — evita que se comprima
11. **Sin canvas/animaciones JS** — solo CSS para orbes decorativos, sin WebGL ni canvas
