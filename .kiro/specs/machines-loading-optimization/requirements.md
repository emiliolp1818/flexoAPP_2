# Requirements Document

## Introduction

Optimización del rendimiento de carga del módulo de Máquinas en FlexoAPP. Actualmente, al navegar desde el Dashboard al módulo de Máquinas, la secuencia de inicialización ejecuta múltiples llamadas HTTP de forma secuencial (bloqueante), resultando en tiempos de carga percibidos por el usuario como excesivos. Además, no existe retroalimentación visual significativa durante la espera — solo un spinner simple que no comunica el progreso real.

Esta feature aborda dos ejes: (1) reducir el tiempo total de carga mediante paralelización y caché entre navegaciones, y (2) implementar un indicador de progreso animado (0%–100%) que muestre al usuario qué fase de carga está en curso.

## Glossary

- **Machines_Component**: Componente Angular standalone (`MachinesComponent`) que gestiona la vista de máquinas de producción.
- **Loading_Orchestrator**: Servicio o lógica interna que coordina las fases de carga, reporta progreso y gestiona la caché de datos entre navegaciones.
- **Progress_Indicator**: Componente visual overlay que muestra una barra de progreso animada de 0% a 100% con etiquetas descriptivas de cada fase.
- **Data_Cache**: Almacenamiento en memoria (a nivel de servicio singleton) que persiste datos entre navegaciones para evitar recargas innecesarias.
- **Loading_Phase**: Una etapa discreta dentro de la secuencia de inicialización (ej. "Cargando lineaturas", "Cargando anilox", "Cargando programaciones").
- **BCM_Data**: Datos de lineaturas únicas (BCM) obtenidos del servicio Anilox.
- **Anilox_Data**: Datos de rodillos anilox por máquina (11 llamadas HTTP paralelas).
- **Machine_Configs**: Configuraciones de carga muerta por máquina (11 llamadas HTTP paralelas).
- **Programs_Data**: Datos de programaciones/pedidos de todas las máquinas (llamada principal al backend).
- **Auxiliary_Data**: Datos complementarios no bloqueantes (carpeta/estante, printType, alertas de color).
- **TTI**: Time To Interactive — tiempo desde la navegación hasta que el usuario puede interactuar con la tabla de programación.

## Requirements

### Requirement 1: Paralelización de Carga Inicial

**User Story:** Como operador de producción, quiero que el módulo de máquinas cargue los datos lo más rápido posible, para no perder tiempo esperando al navegar desde el dashboard.

#### Acceptance Criteria

1. WHEN el Machines_Component se inicializa, THE Loading_Orchestrator SHALL ejecutar la carga de BCM_Data, Anilox_Data y Machine_Configs en paralelo (las tres peticiones HTTP se disparan sin esperar la resolución de las anteriores).
2. WHEN las tres cargas paralelas (BCM_Data, Anilox_Data, Machine_Configs) se completan exitosamente, THE Loading_Orchestrator SHALL iniciar la carga de Programs_Data.
3. IF una o más de las cargas paralelas de Phase 1 (BCM_Data, Anilox_Data, Machine_Configs) falla, THEN THE Loading_Orchestrator SHALL continuar con la carga de Programs_Data utilizando valores por defecto para los datos fallidos, y registrar el error en consola.
4. WHEN la carga de Programs_Data se completa, THE Loading_Orchestrator SHALL renderizar la tabla con los datos de programas disponibles y disparar la carga de Auxiliary_Data (carpeta/estante, printType, alertas) de forma concurrente, de modo que la tabla sea visible e interactiva antes de que Auxiliary_Data termine de cargar.
5. IF la carga de Programs_Data falla, THEN THE Loading_Orchestrator SHALL mostrar la tabla vacía, presentar una notificación de error al usuario y detener la carga de Auxiliary_Data.
6. THE Loading_Orchestrator SHALL completar el tiempo desde la inicialización del componente hasta que la tabla sea visible con datos (TTI) en un tiempo no superior al 70% del tiempo que toma la secuencia secuencial actual medida en las mismas condiciones de red y servidor.

### Requirement 2: Caché de Datos Entre Navegaciones

**User Story:** Como operador de producción, quiero que al volver al módulo de máquinas desde otra sección, los datos se muestren inmediatamente sin recargar todo desde cero.

#### Acceptance Criteria

1. WHEN el usuario navega fuera del Machines_Component y regresa, THE Data_Cache SHALL proveer los datos previamente cargados de BCM_Data, Anilox_Data y Machine_Configs sin realizar nuevas llamadas HTTP.
2. IF existen datos válidos en Data_Cache al inicializar Machines_Component, THEN THE Loading_Orchestrator SHALL renderizar los datos cacheados de BCM_Data, Anilox_Data y Machine_Configs en un máximo de 100 milisegundos tras la inicialización del componente, y SHALL iniciar la recarga de Programs_Data en segundo plano.
3. WHILE los datos de Programs_Data se recargan en segundo plano, THE Machines_Component SHALL mantener visible la tabla con los datos anteriores hasta que la nueva respuesta esté disponible.
4. IF la recarga en segundo plano de Programs_Data falla por error de red o timeout tras 15 segundos, THEN THE Machines_Component SHALL mantener los datos cacheados visibles y mostrar una notificación indicando que no se pudo actualizar.
5. WHEN el usuario cierra sesión o la sesión expira, THE Data_Cache SHALL limpiar todos los datos almacenados de BCM_Data, Anilox_Data, Machine_Configs y Programs_Data.
6. IF el usuario no ha navegado al Machines_Component durante un período de 5 minutos, THEN THE Data_Cache SHALL invalidar todos los datos almacenados, requiriendo nuevas llamadas HTTP en la próxima visita.

### Requirement 3: Indicador de Progreso Animado

**User Story:** Como operador de producción, quiero ver un indicador visual atractivo que me muestre cuánto falta para que la pantalla esté lista, para no sentir que la aplicación se congeló.

#### Acceptance Criteria

1. WHEN el Machines_Component inicia una carga completa (sin caché disponible), THE Progress_Indicator SHALL mostrar un overlay con una barra de progreso que avanza de 0% a 100%, permaneciendo visible un mínimo de 1500ms incluso si la carga finaliza antes.
2. THE Progress_Indicator SHALL mostrar el porcentaje numérico actual con una transición CSS animada de 300ms con easing ease-out entre cada cambio de valor.
3. WHEN cada Loading_Phase se completa, THE Progress_Indicator SHALL actualizar el porcentaje de forma proporcional al peso asignado a cada fase.
4. THE Progress_Indicator SHALL mostrar una etiqueta descriptiva de la fase en curso con un máximo de 60 caracteres (ej. "Cargando configuración de máquinas...", "Cargando programaciones...").
5. WHEN todas las Loading_Phases se completan (100%), THE Progress_Indicator SHALL desaparecer con una animación de fade-out en un máximo de 400ms.
6. THE Progress_Indicator SHALL usar el estilo claymorphism/glassmorphism consistente con el diseño existente de la aplicación (bordes redondeados de 24px, backdrop-filter blur de 20px, bordes semitransparentes de 3px con rgba(255,255,255,0.85)).
7. IF una Loading_Phase falla durante la carga, THEN THE Progress_Indicator SHALL continuar avanzando al siguiente peso de fase, completar el progreso hasta 100%, y desaparecer normalmente permitiendo que el componente maneje el error de datos faltantes.

### Requirement 4: Distribución de Pesos por Fase

**User Story:** Como operador de producción, quiero que la barra de progreso refleje de forma realista cuánto tarda cada paso, para que el avance no se sienta engañoso.

#### Acceptance Criteria

1. THE Loading_Orchestrator SHALL asignar los siguientes pesos fijos a cada Loading_Phase: BCM_Data = 10%, Anilox_Data + Machine_Configs = 25%, Programs_Data = 50%, selección de máquina + configuración de SignalR = 15%.
2. WHEN la carga de BCM_Data se completa, THE Progress_Indicator SHALL avanzar al 10%.
3. WHEN tanto la carga de Anilox_Data como la de Machine_Configs se completan (ambas requeridas), THE Progress_Indicator SHALL avanzar al 35%.
4. WHEN la carga de Programs_Data se completa, THE Progress_Indicator SHALL avanzar al 85%.
5. WHEN la selección de máquina por defecto y la conexión al hub de SignalR se completan, THE Progress_Indicator SHALL avanzar al 100%.
6. THE Progress_Indicator SHALL animar cada transición entre porcentajes con una duración entre 200ms y 500ms usando una función de temporización ease-out (CSS `ease-out` o equivalente cubic-bezier).
7. WHILE una Loading_Phase está en curso, THE Progress_Indicator SHALL mantener el porcentaje del último hito completado sin mostrar avance intermedio artificial dentro de la fase.

### Requirement 5: Indicador de Fases Descriptivo

**User Story:** Como operador de producción, quiero que el indicador me diga qué está haciendo la aplicación en cada momento, para sentirme informado durante la espera.

#### Acceptance Criteria

1. WHEN la Loading_Phase de BCM_Data está en curso, THE Progress_Indicator SHALL mostrar el texto "Cargando lineaturas...".
2. WHEN la Loading_Phase de Anilox_Data está en curso, THE Progress_Indicator SHALL mostrar el texto "Cargando datos de anilox...".
3. WHEN la Loading_Phase de Machine_Configs está en curso, THE Progress_Indicator SHALL mostrar el texto "Cargando configuración de máquinas...".
4. WHEN la Loading_Phase de Programs_Data está en curso, THE Progress_Indicator SHALL mostrar el texto "Cargando programaciones...".
5. WHEN la Loading_Phase final (selección + SignalR) está en curso, THE Progress_Indicator SHALL mostrar el texto "Preparando vista...".
6. WHEN el texto de fase cambia de una Loading_Phase a la siguiente, THE Progress_Indicator SHALL aplicar una transición de opacidad (fade) con una duración de 300ms.
7. WHEN todas las Loading_Phases se completan exitosamente, THE Progress_Indicator SHALL ocultarse y ceder el paso a la vista principal del módulo.
8. IF una Loading_Phase falla por error de red o del servidor, THEN THE Progress_Indicator SHALL mostrar un mensaje indicando que la carga falló en esa fase y ofrecer una acción para reintentar la carga completa.

### Requirement 6: Comportamiento en Carga con Caché Parcial

**User Story:** Como operador de producción, quiero que si algunos datos ya están cacheados, la barra salte esas fases y arranque más adelante, para que el progreso sea honesto.

#### Acceptance Criteria

1. WHEN existen datos de BCM_Data en Data_Cache pero no existen datos de Anilox_Data ni Machine_Configs, THE Progress_Indicator SHALL iniciar en 10% y mostrar la etiqueta correspondiente a la fase de Anilox_Data.
2. WHEN existen datos de BCM_Data, Anilox_Data y Machine_Configs en Data_Cache, THE Progress_Indicator SHALL iniciar en 35% y mostrar la etiqueta correspondiente a la fase de Programs_Data, omitiendo las etiquetas de las fases previas.
3. WHEN existen datos de BCM_Data, Anilox_Data, Machine_Configs y Programs_Data en Data_Cache, THE Loading_Orchestrator SHALL omitir el Progress_Indicator completo y mostrar únicamente un spinner circular centrado con el texto "Actualizando datos..." mientras refresca Programs_Data en segundo plano, durante un máximo de 3 segundos antes de mostrar la tabla con datos cacheados.
4. IF existen datos de Anilox_Data y Machine_Configs en Data_Cache pero no existen datos de BCM_Data, THEN THE Progress_Indicator SHALL iniciar en 0% y ejecutar solo la fase de BCM_Data antes de saltar a 35% al completarse.

### Requirement 7: Manejo de Errores Durante la Carga

**User Story:** Como operador de producción, quiero que si un paso de carga falla, la aplicación continúe con lo que pueda y me avise, en lugar de quedarse colgada.

#### Acceptance Criteria

1. IF una Loading_Phase individual falla (error HTTP o timeout de 15 segundos sin respuesta), THEN THE Loading_Orchestrator SHALL continuar con la siguiente fase, registrar el error en consola, y avanzar el Progress_Indicator al porcentaje objetivo de la fase fallida como si se hubiera completado.
2. IF la carga de Programs_Data falla, THEN THE Progress_Indicator SHALL mostrar un mensaje de error indicando que la carga de programaciones no se completó, con un botón de reintentar que ejecute únicamente la carga de Programs_Data. IF el reintento falla tras 3 intentos máximos, THEN THE Progress_Indicator SHALL mostrar un mensaje indicando que no se pudo conectar con el servidor y ofrecer la opción de recargar la página.
3. IF una fase no crítica falla (Auxiliary_Data), THEN THE Loading_Orchestrator SHALL completar la carga normalmente, el Progress_Indicator SHALL avanzar al 100%, y las columnas dependientes de datos auxiliares (Carpeta, T IMP, alertas) SHALL mostrarse vacías sin bloquear la interacción con la tabla.
4. IF la carga de BCM_Data o Anilox_Data falla, THEN THE Loading_Orchestrator SHALL usar arreglos vacíos como valores por defecto para los datos no obtenidos y continuar la secuencia de carga.

### Requirement 8: Rendimiento de la Animación del Indicador

**User Story:** Como operador de producción, quiero que el indicador de progreso sea fluido y no cause lag adicional al navegador.

#### Acceptance Criteria

1. THE Progress_Indicator SHALL renderizar animaciones usando exclusivamente propiedades CSS que activan composición GPU (transform, opacity), sin modificar propiedades que disparen layout o paint (width, height, top, left, margin, padding, border-width, background-color).
2. WHILE la barra de progreso está visible y animándose, THE Progress_Indicator SHALL mantener un frame rate mínimo de 30fps medido durante cualquier ventana continua de 1 segundo, incluso cuando la tabla de programación contiene hasta 200 filas renderizadas simultáneamente.
3. THE Progress_Indicator SHALL declarar `will-change: transform, opacity` en los elementos animados únicamente mientras la animación esté activa, y remover dicha declaración dentro de los 500ms posteriores a la finalización de la animación.
4. WHEN el valor de uploadProgress() pasa a null (carga completada o cancelada), THE Machines_Component SHALL remover del DOM el elemento overlay del indicador de progreso dentro de un máximo de 100ms.
5. IF la animación del Progress_Indicator genera un frame que excede 33ms de duración (por debajo de 30fps), THEN THE Progress_Indicator SHALL reducir la complejidad de la animación desactivando la animación progressShimmer del gradiente y manteniendo únicamente la transición de width.
