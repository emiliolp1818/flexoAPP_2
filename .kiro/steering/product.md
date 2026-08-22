# FlexoAPP - Descripción del Producto

FlexoAPP es un sistema de gestión interno para una empresa de impresión flexográfica. Gestiona el flujo de producción, el control de máquinas, el seguimiento de diseños y los reportes operativos.

## Dominios Principales

- **Máquinas**: Seguimiento en tiempo real del estado de las máquinas de producción con actualizaciones en vivo via SignalR, backup/restauración de estados y configuración por máquina.
- **Diseño**: Gestión de diseños de impresión incluyendo códigos de tintas (cod_tintas), rodillos anilox, colores Pantone y condiciones únicas.
- **Documentos**: Carga, almacenamiento y conversión a PDF de archivos relacionados con la producción.
- **Reportes**: Generación de reportes operativos con exportación a Excel y PDF.
- **Consulta de Pantones**: Consulta y análisis de pantones usados en los últimos 3 meses, con detalle de pedidos por color, KPIs de uso y exportación a Excel/PDF.
- **Gestión de Usuarios**: Acceso basado en roles con sistema de permisos granular (a nivel de módulo y de acción).
- **Dashboard**: Vista general de métricas de producción y actividad.
- **Auditoría y Registro de Actividad**: Seguimiento de acciones de usuarios para trazabilidad.

## Características Clave

- Código bilingüe: los comentarios y términos de dominio están principalmente en español.
- Desplegado en Railway (producción) con base de datos MySQL.
- Actualizaciones en tiempo real via WebSockets con SignalR para cambios de estado de máquinas.
- Multi-usuario con autenticación JWT y refresh tokens.
