# Changelog

Todos los cambios notables de FlexoAPP se documentan aquí.

---

## [Unreleased]

### UI — Capa global de tema oscuro para todos los módulos

Se añadió una capa de estilos que extiende el tema oscuro a todos los módulos, incluso a los que usaban colores claros hardcodeados en sus `.scss` de componente (fondos `#ffffff` / `#f1f5f9` / `#f8fafc`, textos `#1e293b` / `#64748b` / `#94a3b8`).

**Cómo funciona:**
- El bloque se activa solo cuando el `body` está en modo oscuro, mediante los selectores `body.theme-dark` y `body[data-theme="dark"]` (ambos aplicados por `ThemeService`).
- Remapea superficies, headers, tarjetas, tablas estilo Excel, sidebars, inputs (fuera de Material) y textos a una paleta oscura equivalente al Apple dark, atacando patrones repetidos en lugar de tocar cada componente.
- Cubre: dashboard, machines, diseño, reports, documento, consulta, información y profile.

**No afecta:**
- **Settings** mantiene su propio bloque oscuro en `settings.scss`.
- **Login** conserva su fondo Apple claro por diseño (pantalla completa).

**Archivo modificado:** `Frontend/src/styles/themes.scss`

Cambio puramente visual; no altera lógica ni la API.

### Autenticación — Contraseña temporal para restablecimiento

Se añadió un mecanismo de contraseña temporal que permite dar acceso a un usuario sin invalidar su contraseña original.

**Cómo funciona:**
- Un administrador genera una contraseña temporal mediante `IAuthService.ResetTempPasswordAsync(userId, expiryMinutes = 30)`, que devuelve la temporal en texto plano (para mostrarla una sola vez).
- La temporal se guarda hasheada con BCrypt y es válida solo durante una ventana corta (30 min por defecto). La contraseña original **no** se modifica y sigue siendo válida.
- Al iniciar sesión / cambiar contraseña, el backend acepta tanto la contraseña real como la temporal si aún no expiró.
- Cuando el usuario fija una nueva contraseña, la temporal se limpia (`TempPassword` y `TempPasswordExpiresAt` pasan a `null`).

**Nuevas columnas en la entidad `User` (tabla `users`):**

| Columna | Tipo | Descripción |
|---|---|---|
| `TempPassword` | `VARCHAR(255)` NULL | Hash BCrypt de la contraseña temporal |
| `TempPasswordExpiresAt` | `DATETIME` NULL (UTC) | Momento de expiración de la temporal |

> Requiere agregar ambas columnas a la tabla `users` en la base de datos (migración EF o `ALTER TABLE`).

**Aviso en el perfil (frontend):**
- Cuando el usuario ingresa con una contraseña temporal, se le redirige al perfil con el parámetro de consulta `mustChangePassword=1` (o `temp=1`).
- `ProfileComponent` detecta ese parámetro, activa el aviso `mustChangePassword` y muestra un snackbar (`status-preparando-snackbar`, ~12s) indicándole que cambie su contraseña de inmediato usando la temporal como "Contraseña actual".

**Nuevo permiso:**
- Se añadió el permiso `users.reset_password` ("Restablecer contraseña", categoría `users`) al catálogo de permisos sembrado en `Program.cs`. Permite generar una contraseña temporal para restablecer el acceso de un usuario.

**Archivos modificados:**
- `backend/Models/Entities/User.cs` — nuevas propiedades `TempPassword` y `TempPasswordExpiresAt`.
- `backend/Services/Interfaces/IAuthService.cs` — método `ResetTempPasswordAsync`.
- `backend/Services/Implementations/AuthService.cs` — generación/validación/limpieza de la temporal.
- `Frontend/src/app/shared/components/profile/profile.ts` — aviso de cambio obligatorio al ingresar con contraseña temporal (signal `mustChangePassword` + snackbar).

### Diseño — Diálogo "Crear / Editar Color Pantone" con estilo Apple

Se rediseñó el diálogo de creación y edición de colores Pantone (`CreatePantoneDialogComponent`) para unificarlo con el resto del módulo de Diseño y el Login bajo el Apple Design System:

- Tipografía SF Pro con `letter-spacing` negativo y glassmorphism (`backdrop-filter: blur(40px) saturate(180%)`).
- Azul de sistema `#0071e3` como acento único (tabs activos, focus de campos, botón principal, íconos).
- Radios Apple: `22px` en el panel del diálogo y la tarjeta, `14px` en campos, `12px` en botones y tabs.
- Selector de modo tipo *segmented control* de iOS: **Paleta de Color** / **Valores L\*a\*b\***.
- Campos Material (MDC) restilizados con `::ng-deep` (borde hairline, fondo translúcido, foco azul con halo).
- Alineación de campos: los campos de texto (input, placeholder y valor del select) se alinean a la izquierda; los campos numéricos (R/G/B, L\*a\*b\*, HEX) permanecen centrados. Al enfocar (o con valor), la etiqueta flotante se ancla arriba-izquierda con `scale(0.75)`.
- Botón principal sólido azul con estados hover/active/disabled; botón cancelar plano.

**Archivo añadido:** `Frontend/src/app/shared/components/diseño/create_pantone/create-pantone-dialog.scss`

Cambio puramente visual; no altera la lógica de creación/edición de colores ni la API.

### Diseño — Campos de Cod Tintas por color (inline)

Se añadieron tres campos editables directamente en cada tarjeta de color del editor de diseños:

| Campo | Icono | Descripción |
|---|---|---|
| **Cód. Tinta** | `colorize` | Código de tinta asociado al color |
| **Cobertura** | `percent` | Porcentaje de cobertura (0–100, paso 0.01) |
| **Cód. Anilox** | `grid_on` | Código de anilox asociado al color |

Los campos se renderizan como `.cod-tinta-fields-inline` dentro del bloque de colores, únicamente cuando existe un registro `codTintaRecord.colores[i]` ligado al diseño en edición (`editingDesign()`).

**Métodos de componente invocados:**
- `updateCodTintaOnDesignColor(design, colorIndex, value)` — actualiza el código de tinta del color en posición `i`.
- `updateCoberturaOnDesignColor(design, colorIndex, value | null)` — actualiza la cobertura; si el campo queda vacío se guarda `null`.
- `updateCodAniloxOnDesignColor(design, colorIndex, value)` — actualiza el código de anilox del color en posición `i`.

**Archivo modificado:** `Frontend/src/app/shared/components/diseño/diseno.html`
