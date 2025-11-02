# Assets

## 📋 Descripción
Carpeta de recursos estáticos de la aplicación FlexoAPP Frontend.

## 🏗️ Estructura
```
assets/
├── images/           # Imágenes y recursos gráficos
├── icons/           # Iconos de la aplicación
├── fonts/           # Fuentes personalizadas
└── README.md        # Esta documentación
```

## 🖼️ Images
- **Logos**: Logotipos de la empresa y aplicación
- **Backgrounds**: Fondos e imágenes decorativas
- **Icons**: Iconos en formato PNG/SVG
- **Charts**: Imágenes para gráficos y dashboards

## 🎨 Optimizaciones

### Formatos Recomendados
- **SVG**: Para iconos y gráficos vectoriales
- **WebP**: Para imágenes con mejor compresión
- **PNG**: Para imágenes con transparencia
- **JPG**: Para fotografías y imágenes complejas

### Lazy Loading
- Implementación de lazy loading para imágenes
- Placeholder durante la carga
- Optimización de performance

### Responsive Images
- Múltiples resoluciones para diferentes dispositivos
- Uso de srcset para imágenes adaptativas
- Optimización para retina displays

## 📱 Iconos
- **Favicon**: Icono de la aplicación en el navegador
- **PWA Icons**: Iconos para Progressive Web App
- **UI Icons**: Iconos de interfaz de usuario
- **Status Icons**: Iconos de estado y notificaciones

## 🔧 Configuración
- Rutas relativas desde `/assets/`
- Versionado automático en build
- Compresión automática en producción
- CDN ready para distribución

## 📋 Buenas Prácticas
1. **Nomenclatura**: Nombres descriptivos y consistentes
2. **Organización**: Carpetas por tipo de recurso
3. **Optimización**: Compresión antes de commit
4. **Accesibilidad**: Alt text para todas las imágenes
5. **Performance**: Lazy loading implementado