# Dashboard API

> Endpoints que alimentan el módulo Dashboard (KPIs, gráficas y ranking).

**Controlador**: `backend/Controllers/DashboardController.cs`
**Ruta base**: `/api/dashboard`
**Autorización**: `[AllowAnonymous]` (los endpoints no requieren token actualmente)

Todos los endpoints devuelven `200 OK`. Ante errores internos, la mayoría degrada de forma segura devolviendo `200 OK` con una estructura vacía o con valores en cero, salvo donde se indica `500`.

---

## Endpoints

### `GET /api/dashboard/stats`

Métricas globales para las KPI cards.

Respuesta:

```json
{
  "totalUsers": 0,
  "newUsersThisMonth": 0,
  "readyOrders": 0,
  "readyToday": 0,
  "totalDesigns": 0,
  "newDesignsThisWeek": 0,
  "averageSetupTime": 0.0,
  "totalSetupChanges": 0
}
```

- `averageSetupTime`: promedio en minutos de la transición `PREPARANDO → LISTO`, calculado sobre los últimos 30 días.
- `readyToday`: máquinas en estado `LISTO` actualizadas hoy.

---

### `GET /api/dashboard/average-time-by-user`

Tiempo promedio de prealistamiento (`PREPARANDO → LISTO`) agrupado por usuario, ordenado ascendente por `averageTime`.

Respuesta: arreglo de `{ userId, userCode, userName, averageTime, totalChanges, minTime, maxTime }` (minutos).

---

### `GET /api/dashboard/top-pantones`

Top 10 pantones más usados en el mes actual (pedidos `LISTO`/`TERMINADO`/`TERMINADA` desde `maquinas_backup`). Excluye colores base de hexacromía y lacas/barnices.

Respuesta: arreglo de `{ name, count }`.

---

### `GET /api/dashboard/monthly-production`

Kilos y metros producidos en el mes corriente (se reinicia al cambiar de mes).

```json
{ "totalKilos": 0.0, "totalMetros": 0.0, "totalPedidos": 0, "month": "Septiembre 2026" }
```

---

### `GET /api/dashboard/kpi-trends`

Tendencia de los últimos 7 días para las mini-gráficas de las KPI cards.

```json
{
  "setupTrend":   [{ "value": 0, "day": "Lun", "date": "10/09" }],
  "readyTrend":   [{ "value": 0, "day": "Lun", "date": "10/09" }],
  "designsTrend": [{ "value": 0, "day": "Lun", "date": "10/09" }]
}
```

- `setupTrend`: tiempo promedio de prealistamiento por día (minutos).
- `readyTrend`: cantidad de órdenes que quedaron `LISTO` por día.
- `designsTrend`: diseños modificados por día.

---

### `GET /api/dashboard/best-time-week`

Ranking semanal (Lunes → hoy) de los 5 mejores usuarios por tiempo promedio de preparación por pantón. Solo incluye transiciones `PREPARANDO → LISTO` con duración ≥ 5 minutos.

Respuesta: arreglo de `{ userId, userCode, userName, totalTime, totalPantones, avgTimePerPantone, totalChanges, profileImage }`, ordenado ascendente por `avgTimePerPantone`.

---

### `GET /api/dashboard/shift-efficiency`

Eficiencia por turno de los últimos 7 días. Turnos: T1 (6-14), T2 (14-22), T3 (22-6).

> **Nota**: `Activities.Timestamp` ya se almacena en hora local de Colombia (vía `DateTimeHelper.Now`), por lo que no debe reconvertirse desde UTC.

Respuesta: arreglo por día de `{ day, date, totalCount, shifts: [{ shift, label, count, avgTime }] }`.

---

### `GET /api/dashboard/daily-preparation`

Cantidad de pedidos que quedaron `LISTO` por día en los últimos 7 días.

Respuesta: arreglo de `{ date, dayName, count }`. Devuelve `500` con `{ error }` ante fallo.

---

### `GET /api/dashboard/weekly-preparation`

Preparación por quincena del mes actual (días 1-15 y 16-fin de mes).

```json
{
  "month": "Septiembre 2026",
  "weeks": [
    {
      "week": 1,
      "label": "Quincena 1",
      "rangeStart": "01/09",
      "rangeEnd": "15/09",
      "total": 0,
      "days": [{ "date": "01/09", "day": 1, "dayName": "Dom", "count": 0 }]
    }
  ]
}
```

Devuelve `500` con `{ error }` ante fallo.

---

## Consumo en el Frontend

`Frontend/src/app/core/services/dashboard.service.ts` consume estos endpoints con caché en memoria:

- `stats` → `GET /dashboard/stats`
- `kpi` → `GET /dashboard/kpi-trends`
- `ranking` → `GET /dashboard/best-time-week`

Ver la guía de diseño del módulo en la documentación del dashboard.
