# SOLUCION AL ERROR 500 - Tabla maquinas no existe

## El Problema
El frontend muestra error 500 porque la tabla `maquinas` no existe en la base de datos MySQL.

## Solucion en 3 Pasos

### PASO 1: Crear la tabla en MySQL

1. Abre **MySQL Workbench**
2. Conectate a tu servidor local (localhost:3306)
3. Abre el archivo: `backend/Database/EJECUTAR_ESTO_PRIMERO.sql`
4. Ejecuta el script completo (boton de rayo o Ctrl+Shift+Enter)
5. Deberias ver el mensaje: "Tabla maquinas creada exitosamente"

### PASO 2: Detener el backend si esta ejecutandose

Si el backend esta corriendo, detenlo:
- Presiona Ctrl+C en la terminal donde esta corriendo
- O cierra la terminal

### PASO 3: Iniciar el backend

```bash
cd backend
dotnet run
```

Deberia iniciar sin errores en http://localhost:7003

### PASO 4: Recargar el frontend

1. Recarga la pagina del navegador (F5)
2. El modulo de maquinas deberia cargar sin errores
3. Veras el mensaje: "La maquina 11 no tiene programas asignados" (esto es normal, la tabla esta vacia)

---

## Verificar que funciona

### Probar endpoint de prueba:
Abre en el navegador o Postman:
```
http://localhost:7003/api/maquinas/test
```

Deberia crear un registro de prueba y retornar:
```json
{
  "success": true,
  "message": "Registro de prueba creado exitosamente",
  "data": { ... }
}
```

### Ver todos los registros:
```
http://localhost:7003/api/maquinas
```

Deberia retornar:
```json
{
  "success": true,
  "message": "1 registros de maquinas obtenidos exitosamente",
  "data": [ ... ]
}
```

---

## Si sigue sin funcionar

1. Verifica que MySQL este ejecutandose
2. Verifica que la base de datos `flexoapp_bd` exista
3. Verifica que la tabla `users` exista (requerida para las foreign keys)
4. Revisa los logs del backend en la terminal

---

## Cargar archivo Excel

Una vez que todo funcione:

1. Ve al modulo de maquinas en el frontend
2. Haz clic en "Cargar Programacion"
3. Selecciona tu archivo Excel
4. El archivo debe tener estas columnas en orden:
   - MQ (numero de maquina)
   - ARTICULO F
   - OT SAP
   - CLIENTE
   - REFERENCIA
   - TD
   - N COLORES
   - KILOS
   - FECHA TINTAS EN MAQUINA
   - SUSTRATOS

---

Fecha: 2025-11-14
