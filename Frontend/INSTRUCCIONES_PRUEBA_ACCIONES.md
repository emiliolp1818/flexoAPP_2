# 🔧 Instrucciones para Probar las Acciones de Máquinas

## ✅ Cambios Realizados

### 1. **Errores de Compilación Corregidos**
- ✅ Eliminadas funciones duplicadas `changeStatus` y `suspendProgram`
- ✅ Compilación exitosa sin errores TypeScript
- ✅ Todos los comentarios agregados en cada línea de código

### 2. **Mejoras en el Método `changeStatus`**
- ✅ Logs detallados de debugging agregados
- ✅ Validación de ID mejorada
- ✅ Notificaciones de éxito/error al usuario
- ✅ Manejo de errores HTTP mejorado

### 3. **Archivos Comentados**
- ✅ `machines.ts` - Cada línea comentada explicando su función
- ✅ `machines.html` - Cada elemento HTML comentado

---

## 🧪 Cómo Probar las Acciones

### **Paso 1: Iniciar el Backend**
```bash
cd backend
npm run start:dev
```

### **Paso 2: Iniciar el Frontend**
```bash
cd Frontend
ng serve
```

### **Paso 3: Abrir la Aplicación**
- Navegar a: `http://localhost:4200`
- Iniciar sesión con credenciales válidas

### **Paso 4: Ir al Módulo de Máquinas**
- Hacer clic en el menú "Máquinas" o navegar a `/machines`

### **Paso 5: Probar las Acciones**

#### **A. Cambiar Estado a PREPARANDO (Amarillo)**
1. Seleccionar una máquina de la lista izquierda
2. En la tabla de programación, hacer clic en el botón **amarillo** (icono de reloj)
3. **Resultado esperado:**
   - El estado cambia a "PREPARANDO"
   - Aparece notificación: "Programa en PREPARACIÓN"
   - El nombre del operario aparece debajo del estado

#### **B. Cambiar Estado a LISTO (Verde)**
1. Hacer clic en el botón **verde** (icono de check)
2. **Resultado esperado:**
   - El estado cambia a "LISTO"
   - Aparece notificación: "Programa marcado como LISTO"
   - El nombre del operario aparece debajo del estado

#### **C. Suspender Programa (Naranja)**
1. Hacer clic en el botón **naranja** (icono de pausa)
2. Se abre un diálogo modal
3. Seleccionar un motivo predefinido o escribir uno personalizado
4. Hacer clic en "Suspender"
5. **Resultado esperado:**
   - El estado cambia a "SUSPENDIDO"
   - Aparece notificación: "Programa SUSPENDIDO"
   - El motivo aparece debajo del estado
   - El nombre del operario aparece debajo del estado

#### **D. Cambiar Estado a CORRIENDO (Rojo)**
1. Hacer clic en el botón **rojo** (icono de play)
2. **Resultado esperado:**
   - El estado cambia a "CORRIENDO"
   - Aparece notificación: "Programa iniciado - CORRIENDO"
   - El nombre del operario aparece debajo del estado

#### **E. Imprimir Formato FF459**
1. Hacer clic en el botón de **impresora**
2. **Resultado esperado:**
   - Se abre una nueva ventana con el formato FF459
   - El formato contiene todos los datos del programa

---

## 🐛 Debugging - Revisar la Consola del Navegador

### **Abrir la Consola del Navegador**
- **Chrome/Edge:** Presionar `F12` o `Ctrl+Shift+I`
- **Firefox:** Presionar `F12` o `Ctrl+Shift+K`

### **Logs Esperados al Hacer Clic en un Botón**

```
🎯 changeStatus llamado con: { program: {...}, newStatus: "LISTO" }
🔄 Cambiando estado de programa F204567 a LISTO en la base de datos
📤 Enviando petición PATCH: { url: "http://localhost:3000/api/maquinas/F204567/status", dto: {...} }
📥 Respuesta recibida del servidor: { success: true, data: {...} }
✅ Estado cambiado exitosamente a LISTO en la base de datos
🔍 Índice del programa en el array: 0
🔄 Estado actualizado localmente: { programaId: "F204567", estadoAnterior: "PREPARANDO", estadoNuevo: "LISTO" }
✅ Programa marcado como LISTO { programa: "F204567", maquina: 11, fecha: "..." }
```

---

## ❌ Posibles Errores y Soluciones

### **Error 1: "No se puede conectar con el servidor"**
**Causa:** El backend no está ejecutándose
**Solución:**
```bash
cd backend
npm run start:dev
```

### **Error 2: "Programa no encontrado en la base de datos"**
**Causa:** El ID del programa no existe en la tabla `machine_programs`
**Solución:**
1. Verificar que hay datos en la base de datos
2. Ejecutar el script de inserción de datos de prueba:
```bash
cd backend/Database
# Ejecutar 02_insertar_datos_prueba.sql en MySQL Workbench
```

### **Error 3: "Estado inválido o datos incorrectos"**
**Causa:** El DTO enviado no tiene el formato correcto
**Solución:**
- Revisar la consola del navegador para ver el DTO enviado
- Verificar que el backend espera el formato: `{ estado: string, observaciones: string | null }`

### **Error 4: "Error interno del servidor"**
**Causa:** Error en el backend al procesar la petición
**Solución:**
1. Revisar los logs del backend en la terminal
2. Verificar que la tabla `machine_programs` existe
3. Verificar que el usuario de la base de datos tiene permisos

### **Error 5: Los botones no hacen nada**
**Causa:** Posible error de JavaScript no capturado
**Solución:**
1. Abrir la consola del navegador (F12)
2. Buscar errores en rojo
3. Verificar que aparece el log: `🎯 changeStatus llamado con:`
4. Si no aparece el log, verificar que el HTML tiene los eventos `(click)` correctos

---

## 📊 Verificar en la Base de Datos

### **Consulta SQL para Verificar Cambios**
```sql
-- Ver todos los programas con su estado actual
SELECT 
    articulo,
    estado,
    observaciones,
    last_action_by,
    last_action_at,
    updated_at
FROM machine_programs
ORDER BY updated_at DESC;
```

### **Consulta SQL para Ver Historial de un Programa**
```sql
-- Reemplazar 'F204567' con el artículo que estás probando
SELECT * FROM machine_programs 
WHERE articulo = 'F204567';
```

---

## 🎯 Checklist de Pruebas

- [ ] Backend ejecutándose en `http://localhost:3000`
- [ ] Frontend ejecutándose en `http://localhost:4200`
- [ ] Usuario autenticado correctamente
- [ ] Módulo de máquinas cargado
- [ ] Máquina seleccionada de la lista
- [ ] Tabla de programación visible
- [ ] Botón PREPARANDO funciona (amarillo)
- [ ] Botón LISTO funciona (verde)
- [ ] Botón SUSPENDER funciona (naranja) y abre diálogo
- [ ] Botón CORRIENDO funciona (rojo)
- [ ] Botón IMPRIMIR funciona
- [ ] Notificaciones aparecen en pantalla
- [ ] Nombre del operario aparece debajo del estado
- [ ] Cambios se reflejan en la base de datos

---

## 📝 Notas Importantes

1. **Cada acción debe mostrar una notificación** en la parte inferior de la pantalla
2. **El nombre del operario** debe aparecer debajo del estado después de cada cambio
3. **Los logs en la consola** son esenciales para debugging
4. **Si un botón está deshabilitado** (gris), significa que el programa ya está en ese estado
5. **El diálogo de suspensión** requiere ingresar un motivo antes de confirmar

---

## 🆘 Soporte

Si las acciones siguen sin funcionar después de seguir estas instrucciones:

1. **Revisar la consola del navegador** (F12) para ver errores
2. **Revisar los logs del backend** en la terminal
3. **Verificar la conexión a la base de datos**
4. **Verificar que el token de autenticación es válido**
5. **Limpiar caché del navegador** (Ctrl+Shift+Delete)
6. **Reiniciar backend y frontend**

---

## ✅ Resultado Final Esperado

Después de hacer clic en cualquier botón de acción:

1. ✅ Aparece un spinner de carga brevemente
2. ✅ El estado del programa cambia visualmente en la tabla
3. ✅ Aparece una notificación de éxito en la parte inferior
4. ✅ El nombre del operario aparece debajo del estado
5. ✅ Los logs aparecen en la consola del navegador
6. ✅ El cambio se guarda en la base de datos
7. ✅ El botón del nuevo estado se deshabilita (gris)
