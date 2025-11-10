# 🧪 Test de Login Directo

## Test con curl (Windows PowerShell)

Abre PowerShell y ejecuta:

```powershell
$body = @{
    userCode = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://flexoapp-backend.onrender.com/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## Test con curl (si tienes curl instalado)

```bash
curl -X POST https://flexoapp-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"userCode\":\"admin\",\"password\":\"admin123\"}"
```

## Test desde el navegador

Abre la consola del navegador (F12) y ejecuta:

```javascript
fetch('https://flexoapp-backend.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userCode: 'admin', password: 'admin123' })
})
  .then(r => r.text())
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e));
```

## Qué buscar

### Si funciona (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": "1",
    "userCode": "admin",
    "firstName": "Administrador"
  }
}
```

### Si falla (500 Error):
```json
{
  "message": "Error interno del servidor",
  "error": "mensaje de error específico"
}
```

---

**Comparte el resultado de cualquiera de estos tests junto con los logs del backend.**
