# Pruebas de API - Módulo Cod Tintas

## Endpoints Disponibles

### 1. Obtener todos los registros
```http
GET http://localhost:5000/api/cod-tintas
Authorization: Bearer {token}
```

### 2. Obtener por ID
```http
GET http://localhost:5000/api/cod-tintas/1
Authorization: Bearer {token}
```

### 3. Crear registro
```http
POST http://localhost:5000/api/cod-tintas
Authorization: Bearer {token}
Content-Type: application/json

{
  "articulo": "F12345",
  "descripcion": "Bolsa impresa 3 colores",
  "colores": [
    