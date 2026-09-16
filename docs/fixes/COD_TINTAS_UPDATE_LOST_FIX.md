# Fix: Cambios de Cod Tintas perdidos durante guardado en vuelo

## 🐛 Problema

Al editar rápidamente los campos de un registro de Cod Tintas (código de tinta,
cobertura, código de anilox, carpeta/estante) desde el panel inline de la tabla de
diseños, algunos cambios **no se guardaban**. El síntoma típico: el código de tinta de
un color (p. ej. "P 186") no llegaba a persistir en `cod_tintas`, por lo que el módulo
de máquinas lo mostraba/imprimía vacío.

## 🔍 Causa Raíz

El método `updateCodTintaRecord()` en `diseno.ts` usa un debounce por registro más un
flag `codTintasUpdatePending` que indica que ya hay un PUT en vuelo hacia
`PUT /api/cod-tintas/{id}`.

Cuando llegaba una nueva edición **mientras ese PUT estaba en curso**, el método hacía
`return` de inmediato y **descartaba silenciosamente** el cambio. Ese último valor nunca
se reprogramaba para guardarse, así que se perdía.

```ts
// ANTES (cambio perdido)
if (this.codTintasUpdatePending.get(recordId)) {
  console.log('⏳ Actualización en progreso ... esperando...');
  return; // ❌ el cambio nunca se vuelve a intentar
}
```

## ✅ Solución

En lugar de descartar el cambio, se **reprograma** un reintento cuando hay un PUT en
vuelo. Se agenda un `setTimeout` de 300 ms que vuelve a llamar a `updateCodTintaRecord`;
para entonces el PUT anterior normalmente ya terminó (limpia el flag `pending`) y el
cambio se persiste.

```ts
// DESPUÉS (el cambio se reintenta hasta persistir)
if (this.codTintasUpdatePending.get(recordId)) {
  const retryTimer = setTimeout(() => this.updateCodTintaRecord(record), 300);
  this.codTintasUpdateTimers.set(recordId, retryTimer);
  return;
}
```

El reintento se registra en `codTintasUpdateTimers`, por lo que se integra con el
debounce existente: una edición más nueva cancela el reintento pendiente antes de
reprogramar, evitando llamadas duplicadas.

## 🎯 Resultado Esperado

- Las ediciones rápidas y consecutivas de un mismo registro ya no se pierden.
- El último valor editado siempre termina persistido en `cod_tintas`.
- El módulo de máquinas recibe los códigos de tinta reales (ya no aparecen vacíos por
  esta causa).

## 📝 Archivos Modificados

1. **Frontend/src/app/shared/components/diseño/diseno.ts**
   - `updateCodTintaRecord()`: reprograma un reintento en lugar de descartar el cambio
     cuando hay una actualización en vuelo.

## 📚 Referencias

- Implementación del módulo: `docs/COD_TINTAS_IMPLEMENTATION.md`
- Endpoint afectado: `PUT /api/cod-tintas/{id}` (`backend/Controllers/CodTintasController.cs`)

---

**Fecha:** 2026-09-15
**Estado:** ✅ Resuelto
