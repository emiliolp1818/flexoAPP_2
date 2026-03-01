# Forzar Migración de BCM en Railway

## Opción 1: Desde el navegador (más fácil)

1. Abre la aplicación en Railway: https://flexoapp.up.railway.app
2. Inicia sesión con tu usuario
3. Abre la consola del navegador (F12)
4. Pega este código y presiona Enter:

```javascript
fetch('https://flexoapp-backend.up.railway.app/api/anilox/force-migration', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Resultado de la migración:', data);
  alert('Migración completada: ' + JSON.stringify(data));
})
.catch(err => {
  console.error('❌ Error:', err);
  alert('Error en la migración: ' + err);
});
```

## Opción 2: Verificar primero el estado

Antes de forzar la migración, verifica el estado actual:

```javascript
fetch('https://flexoapp-backend.up.railway.app/api/anilox/check-table', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('📊 Estado de la tabla:', data);
  console.log('BCM Type:', data.bcmType);
  console.log('BCM is Decimal:', data.bcmIsDecimal);
  alert('BCM Type: ' + data.bcmType + '\nIs Decimal: ' + data.bcmIsDecimal);
});
```

## Opción 3: Usando curl (desde terminal)

Primero obtén tu token de autenticación desde localStorage en el navegador:
```javascript
console.log(localStorage.getItem('token'));
```

Luego ejecuta en terminal:
```bash
curl -X POST https://flexoapp-backend.up.railway.app/api/anilox/force-migration \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

## Qué esperar

Si la migración es exitosa, verás:
```json
{
  "message": "Migración completada exitosamente",
  "before": "int(11)",
  "after": "decimal(5,2)"
}
```

Si ya está migrado:
```json
{
  "message": "No se requiere migración, bcm ya es DECIMAL",
  "currentType": "decimal(5,2)"
}
```

## Después de la migración

Una vez completada la migración, intenta subir el Excel de anilox nuevamente. Debería funcionar correctamente con valores decimales como 8.3, 3.7, etc.
