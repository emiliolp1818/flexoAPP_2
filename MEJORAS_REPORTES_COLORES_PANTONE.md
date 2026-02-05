# Mejoras en Reportes - Colores Pantone y Estados

## Cambios Realizados

### 1. Historial de Estados Completo ✅

**Problema anterior:**
- El historial de estados solo mostraba "TERMINADO" y "LISTO"
- No se mostraban los estados "PREPARANDO" y "SUSPENDIDO"
- No se mostraba el motivo de suspensión

**Solución implementada:**
- ✅ Agregado estado "PREPARANDO" al historial
- ✅ Agregado estado "SUSPENDIDO" al historial
- ✅ Agregado estado "CORRIENDO" al historial
- ✅ Cuando un pedido se suspende, se muestra el motivo de suspensión debajo del estado
- ✅ Colores diferenciados para cada estado:
  - PREPARANDO: Naranja (#f97316)
  - LISTO: Verde (#16a34a)
  - CORRIENDO: Azul (#2196f3)
  - SUSPENDIDO: Rojo (#dc2626)
  - TERMINADO: Gris (#64748b)

**Archivos modificados:**
- `Frontend/src/app/shared/components/reports/reports.ts`
- `Frontend/src/app/shared/components/reports/reports.html`

---

### 2. Conteo de Colores Pantone desde Base de Datos ✅

**Problema anterior:**
- El número de colores se tomaba del campo `numeroColores` en la tabla de máquinas
- No se diferenciaban los colores Pantone de otros colores
- El conteo no era preciso

**Solución implementada:**
- ✅ Nuevo endpoint en backend: `GET /api/designs/pantone-colors/{articleF}`
- ✅ Consulta los colores desde la tabla `designs`
- ✅ Cuenta solo los colores que empiezan con "P-" (ej: P-102, P-485)
- ✅ Cache de colores Pantone en el frontend para evitar consultas repetidas
- ✅ Enriquecimiento automático de actividades al cargar reportes
- ✅ Promedio de colores calculado correctamente sumando todos los colores Pantone

**Archivos modificados:**

**Backend:**
- `backend/Repositories/IDesignRepository.cs` - Interfaz con nuevo método
- `backend/Repositories/DesignRepository.cs` - Implementación del método
- `backend/Services/IDesignService.cs` - Interfaz del servicio
- `backend/Services/DesignService.cs` - Implementación del servicio
- `backend/Controllers/DesignsController.cs` - Nuevo endpoint

**Frontend:**
- `Frontend/src/app/shared/components/reports/reports.ts` - Lógica de consulta y cache

---

## Flujo de Funcionamiento

### Historial de Estados

1. Usuario aplica filtros y hace clic en "Buscar"
2. Se cargan todas las actividades de cambio de estado (PREPARANDO, LISTO, CORRIENDO, SUSPENDIDO, TERMINADO)
3. Se agrupan por pedido (OT SAP + Artículo)
4. Se ordenan cronológicamente
5. Se muestran en la tarjeta del pedido con:
   - Fecha y hora del cambio
   - Estado con color distintivo
   - Duración (si aplica)
   - Motivo de suspensión (si el estado es SUSPENDIDO)

### Colores Pantone

1. Usuario aplica filtros y hace clic en "Buscar"
2. Se cargan las actividades de auditoría
3. Se extraen los artículos únicos de las actividades de máquinas
4. Para cada artículo único:
   - Se consulta el endpoint `/api/designs/pantone-colors/{articleF}`
   - Se obtiene la lista de colores que empiezan con "P-"
   - Se cuenta el número de colores Pantone
   - Se guarda en cache para evitar consultas repetidas
5. Al calcular estadísticas:
   - Se usa el número de colores Pantone del cache
   - Se suma el total de colores de todos los pedidos
   - Se calcula el promedio dividiendo entre el número de pedidos

---

## Ejemplo de Respuesta del Endpoint

```json
{
  "articleF": "F204567",
  "pantoneCount": 4,
  "pantoneColors": [
    "P-102",
    "P-485",
    "P-1235",
    "P-877"
  ],
  "timestamp": "2026-02-05T10:30:00Z"
}
```

---

## Beneficios

1. **Historial Completo**: Ahora se puede ver todo el ciclo de vida del pedido
2. **Motivos de Suspensión**: Transparencia sobre por qué se suspendió un pedido
3. **Conteo Preciso**: Solo se cuentan colores Pantone reales (P-XXX)
4. **Rendimiento**: Cache evita consultas repetidas a la base de datos
5. **Trazabilidad**: Mejor seguimiento del estado de los pedidos

---

## Notas Técnicas

- El cache de colores Pantone se limpia cada vez que se cargan nuevas actividades
- Si no se encuentra el diseño en la base de datos, se usa el fallback del campo `numeroColores`
- Los colores Pantone se identifican por el prefijo "P-" (case insensitive)
- El historial de estados se ordena cronológicamente (más antiguo primero)
