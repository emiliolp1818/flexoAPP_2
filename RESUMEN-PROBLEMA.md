# 🔴 PROBLEMA: No se puede agregar información en Condición Única

## 📊 Error Detectado

```
Error creando registro: HttpErrorResponse {
  status: 500,
  statusText: 'Internal Server Error',
  url: 'http://localhost:7003/api/condicion-unica'
}
```

## 🔍 Diagnóstico

| Componente | Estado | Detalles |
|------------|--------|----------|
| ✅ Frontend | OK | Código correcto, formulario funcional |
| ✅ Backend | OK | API corriendo en puerto 7003 |
| ✅ CORS | OK | Configurado correctamente |
| ✅ Código TypeScript | OK | Servicio y componente bien implementados |
| ✅ Código C# | OK | Controlador y repositorio correctos |
| ✅ DbContext | OK | Entidad CondicionUnica registrada |
| ❌ **Tabla MySQL** | **ERROR** | **Tabla `condicionunica` NO EXISTE** |

## 🎯 Causa Raíz

**La tabla `condicionunica` no existe en la base de datos MySQL `flexoapp_bd`**

Cuando intentas crear un registro:
1. Frontend envía POST a `/api/condicion-unica`
2. Backend recibe la petición y valida los datos ✅
3. Repositorio intenta insertar en la tabla `condicionunica`
4. **MySQL retorna error: "Table 'flexoapp_bd.condicionunica' doesn't exist"**
5. Backend retorna error 500 al frontend
6. Frontend muestra: "Error al crear registro"

## ✅ Solución Rápida

### Paso 1: Crear la tabla
```powershell
.\crear-tabla-condicionunica.ps1
```

### Paso 2: Reiniciar el backend
```bash
cd backend
dotnet run
```

### Paso 3: Probar el módulo
1. Abrir http://localhost:4200
2. Ir a Condición Única
3. Hacer clic en "Nuevo Registro"
4. Llenar el formulario
5. Hacer clic en "Crear"
6. ✅ Debe mostrar: "Registro creado exitosamente"

## 📝 Archivos Creados para la Solución

| Archivo | Descripción |
|---------|-------------|
| `crear-tabla-condicionunica.sql` | Script SQL para crear la tabla |
| `crear-tabla-condicionunica.ps1` | Script PowerShell para ejecutar el SQL |
| `test-condicion-unica.ps1` | Script para probar todos los endpoints |
| `diagnostico-condicion-unica.md` | Guía completa de diagnóstico |
| `SOLUCION-CONDICION-UNICA.md` | Solución detallada con comentarios |

## 🔧 Comandos Útiles

### Verificar que la tabla existe
```sql
USE flexoapp_bd;
SHOW TABLES LIKE 'condicionunica';
```

### Ver estructura de la tabla
```sql
DESCRIBE condicionunica;
```

### Ver registros
```sql
SELECT * FROM condicionunica;
```

### Probar endpoint del backend
```
http://localhost:7003/api/condicion-unica/test
```

## 📚 Código con Comentarios Detallados

Todos los archivos del módulo ya tienen **comentarios detallados en cada línea**:

### Frontend
- ✅ `condicion-unica.ts` - 500+ líneas de comentarios explicativos
- ✅ `condicion-unica.html` - Comentarios en cada sección del template
- ✅ `condicion-unica.service.ts` - Comentarios en cada método
- ✅ `condicion-unica.model.ts` - Comentarios en cada propiedad

### Backend
- ✅ `CondicionUnicaController.cs` - Comentarios en cada endpoint
- ✅ `CondicionUnicaRepository.cs` - Comentarios en cada operación
- ✅ `CondicionUnica.cs` - Comentarios en cada campo
- ✅ `FlexoAPPDbContext.cs` - Comentarios en la configuración

## 🎓 Explicación del Flujo

```
Usuario → Frontend → Service → Backend → Repository → MySQL
   ↓         ↓          ↓          ↓          ↓          ↓
Formulario  HTTP     POST      Validar   INSERT    Tabla
           Request  /api/...   Datos     INTO      condicionunica
```

**Problema:** La tabla `condicionunica` no existe, por lo que el INSERT falla

**Solución:** Crear la tabla con el script SQL

## ✅ Después de Aplicar la Solución

```
✅ Tabla creada en MySQL
✅ Backend puede insertar registros
✅ Frontend puede crear, editar y eliminar
✅ Búsqueda funciona correctamente
✅ Exportar a Excel funciona
✅ Todos los endpoints operativos
```

## 🚀 Próximos Pasos

1. ✅ Ejecutar `.\crear-tabla-condicionunica.ps1`
2. ✅ Reiniciar el backend
3. ✅ Probar crear un registro
4. ✅ Verificar que funciona correctamente

## 📞 ¿Necesitas Ayuda?

Si después de crear la tabla el problema persiste:
1. Verifica los logs del backend
2. Revisa la consola del navegador (F12)
3. Comprueba que la tabla existe: `SHOW TABLES;`
4. Ejecuta el script de prueba: `.\test-condicion-unica.ps1`
