# 🛠️ FlexoAPP - Especificaciones Detalladas del Sistema

Este documento centraliza toda la información técnica, funcional y de infraestructura del proyecto **FlexoAPP**, un sistema integral de gestión para procesos flexográficos.

---

## 🏗️ Arquitectura General

El sistema sigue una arquitectura **Client-Server** moderna con desacoplamiento total entre el Frontend y el Backend.

### **Tecnologías Core**
- **Frontend**: [Angular v20+](https://angular.dev/) (Framework SPA).
- **Backend**: [ASP.NET Core 8.0](https://dotnet.microsoft.com/) (Web API).
- **Base de Datos**: [MySQL 8.0+](https://www.mysql.com/) (Relacional).
- **Infraestructura**: 
  - **Render**: Hosting de API y Frontend.
  - **Railway**: Hosting de Base de Datos MySQL.

---

## 🎨 Frontend (Angular)

### **Lenguajes y Herramientas**
- **TypeScript**: Lógica de negocio y componentes.
- **HTML5/SCSS**: Estructura y diseño premium con animaciones.
- **Angular Material**: Componentes de UI (Dialogs, Tables, Tabs, etc.).
- **RxJS**: Manejo de flujos de datos asíncronos.
- **Angular Signals**: Gestión reactiva de estado (moderno).

### **Librerías Funcionales (En Uso)**
| Librería | Propósito | Estado |
| :--- | :--- | :--- |
| `@angular/*` | Core del framework (Animations, Forms, Router, etc.). | ✅ Funcional |
| `@ngrx/store` | Gestión de estado global. | ✅ Funcional |
| `@ngx-translate/core` | Soporte multi-idioma (i18n). | ✅ Funcional |
| `chart.js` / `ng2-charts` | Gráficos y estadísticas del sistema. | ✅ Funcional |
| `exceljs` | Manipulación avanzada de archivos Excel (Importación/Exportación). | ✅ Funcional |
| `jspdf` / `jspdf-autotable` | Generación de reportes PDF desde el navegador. | ✅ Funcional |
| `mammoth` | Conversión de documentos Word a HTML para previsualización. | ✅ Funcional |
| `ngx-toastr` | Notificaciones flotantes de sistema. | ✅ Funcional |
| `rxjs` | Programación reactiva. | ✅ Funcional |
| `zone.js` | Detección de cambios de Angular. | ✅ Funcional |

### **Librerías Identificadas como NO Usadas (O candidatos a remoción)**
| Librería | Observación |
| :--- | :--- |
| `m` | Identificada en `package.json` pero sin importaciones en el código. Posible error de instalación o residuo. |
| `socket.io-client` | El sistema utiliza **SignalR** (Backend .NET) en su lugar. No se encontraron conexiones activas de Socket.io. |

---

## ⚙️ Backend (ASP.NET Core)

### **Lenguajes y Herramientas**
- **C# 12 / .NET 8**: Lenguaje principal.
- **Entity Framework Core**: ORM para gestión de datos MySQL.
- **LINQ**: Consultas de datos eficientes.
- **JWT**: Seguridad basada en Tokens.

### **Librerías Funcionales (En Uso)**
| Librería | Propósito | Estado |
| :--- | :--- | :--- |
| `Pomelo.EntityFrameworkCore.MySql` | Proveedor de BD para MySQL. | ✅ Funcional |
| `QuestPDF` | Generación de reportes PDF de alta calidad (Backend). | ✅ Funcional |
| `Serilog` | Registro estructurado de logs (Consola y Archivos). | ✅ Funcional |
| `BCrypt.Net-Next` | Hashing seguro de contraseñas. | ✅ Funcional |
| `AutoMapper` | Mapeo automático entre Entidades y DTOs. | ✅ Funcional |
| `MiniProfiler` | Monitorización de rendimiento de queries y endpoints. | ✅ Funcional |
| `ClosedXML` / `EPPlus` | Procesamiento de archivos Excel complejos. | ✅ Funcional |
| `SignalR` | Comunicación en tiempo real (Hubs). | ✅ Funcional |
| `Swashbuckle` | Documentación interactiva de la API con Swagger. | ✅ Funcional |

### **Librerías Identificadas como NO Usadas / Candidatos a Remoción**
| Librería | Observación |
| :--- | :--- |
| `AspNetCore.HealthChecks.SqlServer` | El sistema usa MySQL. Este paquete para SQL Server no es necesario. |
| `AspNetCore.HealthChecks.Redis` | El sistema no utiliza Redis para caché o sesión. |
| `Aspose.Cells` / `Aspose.Words` | Librerías de pago. Aunque registradas, se prefiere el uso de ClosedXML/QuestPDF para evitar licencias. |

---

## 🚀 Funcionalidades Principales

### **1. Seguridad y Autenticación**
- Sistema de Login basado en JWT (JSON Web Tokens).
- Gestión de Refresh Tokens para persistencia de sesión.
- **Sistema de Permisos Granular**: 21 permisos específicos categorizados (Usuarios, Módulos, Acciones, Sistema).
- Roles definidos: `Admin`, `Supervisor`, `Prealistador`, `Matizador`, `Operario`, `Retornos`.

### **2. Gestión de Diseños Flexográficos**
- CRUD completo de diseños.
- Importación masiva desde Excel mediante `ExcelJS`.
- Gestión de colores Pantone por diseño (hasta 10 colores).
- Previsualización de imágenes de perfil y diseños.

### **3. Módulo de Máquinas y Operaciones**
- Control de programación de máquinas.
- **Cálculo Automático de Tinta**: Fórmula avanzada que considera metros, ancho, volumen de anilox, eficiencia y densidad.
- Gestión de Anilox por máquina.

### **4. Auditoría y Reportes**
- **Activity Logger**: Registro automático de toda acción crítica en el sistema.
- Generación de reportes de auditoría detallados.
- Visualización de estadísticas de uso y rendimiento.
- Exportación de cualquier tabla a Excel/PDF.

### **5. Infraestructura y Despliegue**
- Configuración para despliegue continuo en **Render** y **Railway**.
- Manejo de variables de entorno seguras.
- Compresión de respuestas (Brotli/Gzip) para optimización de red.
- Conexión persistente con MySQL mediante Connection Pooling.

---

## 📐 Fórmulas Críticas

### **Cálculo de Consumo de Tinta (Kg)**
```
Kilos = ((Metros × (AnchoMm / 1000)) × Volumen_Anilox × Densidad × (Eficiencia / 100)) / 1000 + Carga_Muerta
```
*Donde `Carga_Muerta` es la tinta remanente específica de cada máquina.*

---

## 📂 Estructura de Proyecto

```text
flexoAPP/
├── backend/                # Proyecto ASP.NET Core
│   ├── Controllers/        # Endpoints de API
│   ├── Data/               # Contexto y Migraciones
│   ├── Models/             # Entidades y DTOs
│   ├── Services/           # Lógica de Negocio
│   └── uploads/            # Almacenamiento de archivos
└── Frontend/               # Proyecto Angular
    ├── src/
    │   ├── app/
    │   │   ├── auth/       # Login, Settings, Profile
    │   │   ├── core/       # Servicios, Guards, Interceptors
    │   │   └── shared/     # Componentes, Pipes, Models
    │   └── environments/   # Configuración Render/Local
    └── package.json        # Dependencias Frontend
```

---
*Última actualización: 16 de Febrero, 2026*
