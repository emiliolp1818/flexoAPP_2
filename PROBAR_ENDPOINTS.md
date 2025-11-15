# PROBAR ENDPOINTS DE MAQUINAS

## 1. Verificar que el backend esté corriendo

Abre en el navegador:
```
http://localhost:7003/health
```

Deberías ver un JSON con status: "ok"

## 2. Probar endpoint de máquinas

Abre en el navegador:
```
http://localhost:7003/api/maquinas
```

Deberías ver un JSON con los programas de máquinas.

## 3. Probar endpoint de prueba

Abre en el navegador:
```
http://localhost:7003/api/maquinas/test
```

Esto creará un registro de prueba.

## 4. Ver máquina específica

Abre en el navegador:
```
http://localhost:7003/api/maquinas/machine/15
```

Deberías ver los programas de la máquina 15.

---

## Si no funciona:

1. Verifica que el backend esté corriendo (dotnet run)
2. Verifica que MySQL esté corriendo
3. Verifica que la tabla maquinas exista
4. Revisa los logs del backend en la terminal
5. Revisa la consola del navegador (F12)
