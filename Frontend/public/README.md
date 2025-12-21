# 📦 Assets Públicos (Public)

Documentación de los assets públicos de FlexoAPP Frontend.

---

## 📂 Estructura

```
public/
├── images/                 # Imágenes de la aplicación
│   ├── logos/              # Logos en diferentes versiones
│   ├── icons/              # Iconos y avatares
│   ├── backgrounds/        # Imágenes de fondo
│   └── templates/          # Imágenes para templates
│
└── templates/              # Templates HTML
    └── print-ff459.html    # Template de impresión FF459
```

---

## 🖼️ Imágenes

### Logos

Todas las versiones de logos se mantienen para uso en diferentes contextos de la aplicación:

#### Logos Disponibles
- `logo.png` - Logo principal (795 KB)
- `logo2.0.png` - Versión 2.0 (2 MB)
- `logo2.1.png` - Versión 2.1 (1.1 MB)
- `logo2.3.png` - Versión 2.3 optimizada (50 KB) ⭐ Recomendada
- `logo2.4.png` - Versión 2.4 (1.4 MB)
- `logp2.2.png` - Versión 2.2 pequeña (17 KB) ⭐ Recomendada

**Uso recomendado:**
- **Web:** `logo2.3.png` o `logp2.2.png` (optimizados)
- **Impresión:** `logo2.0.png` o `logo2.4.png` (alta calidad)
- **Email/Documentos:** `logo2.3.png` (balance calidad/tamaño)

### Iconos

#### favicon.jpg
- **Tamaño:** 10 KB
- **Uso:** Icono del navegador (favicon)
- **Formato:** JPG
- **Dimensiones:** Optimizado para navegadores

#### usuario.2.0.png
- **Tamaño:** 1.5 MB
- **Uso:** Avatar de usuario por defecto
- **Formato:** PNG
- **Nota:** Considerar optimizar para web

### Fondos

#### fonfo.png
- **Tamaño:** 2.1 MB
- **Uso:** Imagen de fondo
- **Formato:** PNG
- **Nota:** Archivo pesado, considerar optimizar o usar versión comprimida

### Templates

#### ff459.png
- **Tamaño:** 2 KB
- **Uso:** Icono/preview del formato FF459
- **Formato:** PNG
- **Optimizado:** ✅

#### ff459 copy.png
- **Tamaño:** 3 KB
- **Uso:** Copia de respaldo del formato FF459
- **Formato:** PNG

---

## 📄 Templates HTML

### print-ff459.html
**Ubicación:** `public/templates/print-ff459.html`

**Propósito:**
Template HTML para impresión del formato FF459 (formato específico de la industria flexográfica).

**Características:**
- Diseño optimizado para impresión
- Estilos inline para compatibilidad
- Campos dinámicos para datos
- Compatible con conversión a PDF

**Uso:**
```typescript
// En el componente
const templateUrl = 'templates/print-ff459.html';
// Cargar y procesar template
```

---

## 🎨 Uso de Assets en la Aplicación

### En HTML
```html
<!-- Logo -->
<img src="logo2.3.png" alt="FlexoAPP Logo">

<!-- Favicon -->
<link rel="icon" type="image/jpeg" href="favicon.jpg">

<!-- Avatar por defecto -->
<img src="usuario.2.0.png" alt="User Avatar">
```

### En CSS/SCSS
```scss
.background {
  background-image: url('/fonfo.png');
}

.logo {
  content: url('/logo2.3.png');
}
```

### En TypeScript
```typescript
const logoUrl = 'logo2.3.png';
const templateUrl = 'templates/print-ff459.html';
```

---

## 📊 Tamaños de Archivos

### Resumen
| Archivo | Tamaño | Optimizado | Uso Recomendado |
|---------|--------|------------|-----------------|
| logo.png | 795 KB | ❌ | Impresión |
| logo2.0.png | 2 MB | ❌ | Impresión alta calidad |
| logo2.1.png | 1.1 MB | ❌ | Impresión |
| logo2.3.png | 50 KB | ✅ | Web (recomendado) |
| logo2.4.png | 1.4 MB | ❌ | Impresión |
| logp2.2.png | 17 KB | ✅ | Web pequeño (recomendado) |
| favicon.jpg | 10 KB | ✅ | Favicon |
| usuario.2.0.png | 1.5 MB | ❌ | Avatar (optimizar) |
| fonfo.png | 2.1 MB | ❌ | Fondo (optimizar) |
| ff459.png | 2 KB | ✅ | Icono FF459 |
| ff459 copy.png | 3 KB | ✅ | Backup FF459 |

**Total:** ~9.9 MB

---

## 🔧 Optimización Recomendada

### Imágenes a Optimizar
1. **usuario.2.0.png** (1.5 MB)
   - Reducir a ~100 KB
   - Usar herramientas de compresión
   - Considerar formato WebP

2. **fonfo.png** (2.1 MB)
   - Reducir a ~200-300 KB
   - Usar compresión con pérdida aceptable
   - Considerar formato WebP

3. **Logos grandes** (logo.png, logo2.0.png, logo2.1.png, logo2.4.png)
   - Mantener para impresión
   - Crear versiones optimizadas para web si es necesario

---

## 📝 Convenciones de Naming

### Futuros Assets
Al agregar nuevos assets, seguir estas convenciones:

**Logos:**
- `logo-[version]-[size].png`
- Ejemplo: `logo-3.0-small.png`

**Iconos:**
- `icon-[nombre]-[size].png`
- Ejemplo: `icon-user-64.png`

**Fondos:**
- `bg-[nombre]-[variante].png`
- Ejemplo: `bg-main-light.png`

**Templates:**
- `template-[nombre].html`
- Ejemplo: `template-invoice.html`

---

## 🚀 Mejores Prácticas

### Imágenes
- ✅ Usar formatos optimizados (WebP cuando sea posible)
- ✅ Mantener versiones de diferentes tamaños
- ✅ Comprimir imágenes antes de subir
- ✅ Usar lazy loading para imágenes grandes
- ✅ Proporcionar alt text descriptivo

### Templates
- ✅ Estilos inline para compatibilidad
- ✅ Diseño responsive
- ✅ Optimizado para impresión
- ✅ Validar HTML

### Organización
- ✅ Agrupar por tipo (logos, icons, etc.)
- ✅ Naming consistente
- ✅ Documentar uso de cada asset
- ✅ Eliminar assets no utilizados

---

## 🔍 Verificación de Uso

### Comandos Útiles
```bash
# Buscar referencias a un asset
grep -r "logo2.3.png" src/

# Listar todos los assets
ls -lh public/

# Verificar tamaños
du -sh public/*
```

---

## 📦 Assets en Producción

### Build de Producción
Los assets en `public/` se copian automáticamente al build de producción.

### Optimización Automática
Angular CLI optimiza automáticamente:
- Minificación de HTML
- Compresión de assets
- Cache busting

### CDN (Futuro)
Considerar mover assets grandes a CDN:
- Logos de alta resolución
- Imágenes de fondo
- Videos (si se agregan)

---

## 🔗 Referencias

### Herramientas de Optimización
- **TinyPNG:** https://tinypng.com/
- **ImageOptim:** https://imageoptim.com/
- **Squoosh:** https://squoosh.app/

### Formatos Recomendados
- **Logos:** PNG (transparencia) o SVG (escalable)
- **Fotos:** JPG o WebP
- **Iconos:** SVG o PNG
- **Fondos:** JPG o WebP

---

## 📝 Notas Importantes

1. **Logos:** Todas las versiones se mantienen para uso futuro. Serán renombradas y optimizadas según necesidades del proyecto.

2. **Optimización:** Se recomienda optimizar imágenes grandes (usuario.2.0.png, fonfo.png) para mejorar rendimiento web.

3. **Organización:** Considerar crear subcarpetas (logos/, icons/, backgrounds/) para mejor organización cuando el número de assets crezca.

4. **Versionado:** Mantener versiones anteriores de logos hasta confirmar cuál será la versión final.

---

**Última actualización:** 21 de Diciembre de 2025
