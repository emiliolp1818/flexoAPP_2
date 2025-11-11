# Solución de Errores - Condición Única

## 🔍 Diagnóstico del Código

El archivo `condicion-unica.ts` ha sido completamente revisado y comentado línea por línea. **No se encontraron errores de compilación o sintaxis.**

## ✅ Estado Actual

- ✅ **Código sin errores de TypeScript**
- ✅ **Todas las importaciones correctas**
- ✅ **Inyección de dependencias correcta**
- ✅ **Formularios reactivos bien configurados**
- ✅ **Diálogo modal correctamente implementado**
- ✅ **Comentarios detallados en cada línea**

## 🐛 Posibles Errores en Tiempo de Ejecución

Si experimentas errores al ejecutar la aplicación, aquí están las causas más comunes y sus soluciones:

### 1. Error: "Cannot read property 'fArticulo' of undefined"

**Causa:** El backend no está devolviendo datos o la estructura es diferente.

**Solución:**
```typescript
// Verificar en la consola del navegador la respuesta del backend
console.log('Datos recibidos:', data);

// Asegurar que el backend devuelve un array de objetos con la estructura correcta
```

**Verificar en el backend:**
- La tabla `condicionunica` existe en la base de datos
- El endpoint `/api/condicion-unica` está funcionando
- Los nombres de las columnas coinciden con el modelo

### 2. Error: "No provider for MatDialog"

**Causa:** El módulo de diálogos no está importado correctamente.

**Solución:**
El código ya incluye `MatDialogModule` en los imports. Si persiste el error:
```typescript
// Verificar que MatDialogModule esté en los imports del componente
imports: [
  // ... otros imports
  MatDialogModule, // ← Debe estar presente
]
```

### 3. Error: "Cannot find module '@angular/material/dialog'"

**Causa:** Angular Material no está instalado.

**Solución:**
```bash
cd Frontend
ng add @angular/material
```

### 4. Error al crear registro: "400 Bad Request"

**Causa:** Los datos enviados no cumplen con las validaciones del backend.

**Solución:**
- Verificar que todos los campos requeridos estén llenos
- Revisar los logs del backend para ver el error específico
- Asegurar que los nombres de los campos coincidan:
  ```typescript
  // Frontend envía:
  {
    fArticulo: "F204567",
    referencia: "REF-001",
    estante: "E-01",
    numeroCarpeta: "C-001"
  }
  
  // Backend espera:
  {
    FArticulo: "F204567",  // ← Verificar mayúsculas/minúsculas
    Referencia: "REF-001",
    Estante: "E-01",
    NumeroCarpeta: "C-001"
  }
  ```

### 5. Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa:** El backend no permite peticiones desde el frontend.

**Solución en el backend (Program.cs):**
```csharp
// Verificar que CORS esté configurado correctamente
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Y que esté habilitado en el pipeline
app.UseCors();
```

### 6. Error: "Cannot read property 'close' of undefined"

**Causa:** El diálogo no se está cerrando correctamente.

**Solución:**
El código ya maneja esto correctamente con:
```typescript
this.dialogRef.close(); // Para cancelar
this.dialogRef.close(this.form.value); // Para guardar
```

### 7. Error al exportar: "Blob is not defined"

**Causa:** Problema con el navegador o entorno.

**Solución:**
El código usa APIs estándar del navegador. Verificar:
- Usar un navegador moderno (Chrome, Firefox, Edge)
- No ejecutar en modo servidor (SSR)

### 8. Error: "ExpressionChangedAfterItHasBeenCheckedError"

**Causa:** Cambios en el estado durante la detección de cambios.

**Solución:**
```typescript
// Usar setTimeout para diferir cambios
setTimeout(() => {
  this.loading.set(false);
}, 0);
```

## 🔧 Verificación Paso a Paso

### 1. Verificar Backend
```bash
# Verificar que el backend esté ejecutándose
curl http://localhost:7003/api/condicion-unica

# Debería devolver un array JSON (puede estar vacío)
[]
```

### 2. Verificar Base de Datos
```sql
-- Verificar que la tabla existe
SELECT * FROM condicionunica LIMIT 5;

-- Verificar estructura de la tabla
\d condicionunica
```

### 3. Verificar Frontend
```bash
# Abrir consola del navegador (F12)
# Verificar errores en la pestaña Console
# Verificar peticiones en la pestaña Network
```

### 4. Verificar Rutas
```typescript
// En app.routes.ts debe estar:
{
  path: 'condicion-unica',
  loadComponent: () => import('./shared/components/condicion-unica/condicion-unica')
    .then(c => c.CondicionUnicaComponent),
  canActivate: [AuthGuard]
}
```

## 📝 Logs Útiles para Debugging

Agregar estos logs temporalmente para debugging:

```typescript
// En loadData()
loadData(): void {
  console.log('🔄 Cargando datos...');
  this.loading.set(true);
  
  this.condicionService.getAll().subscribe({
    next: (data) => {
      console.log('✅ Datos recibidos:', data);
      console.log('📊 Cantidad de registros:', data.length);
      this.items.set(data);
      this.filteredItems.set(data);
      this.loading.set(false);
    },
    error: (error) => {
      console.error('❌ Error cargando datos:', error);
      console.error('📋 Detalles del error:', error.message);
      this.snackBar.open('Error al cargar registros', 'Cerrar', { duration: 3000 });
      this.loading.set(false);
    }
  });
}

// En createNew()
createNew(): void {
  console.log('➕ Abriendo diálogo de creación...');
  const dialogRef = this.dialog.open(CondicionUnicaFormDialog, {
    width: '600px',
    data: { mode: 'create', item: null }
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('📝 Resultado del diálogo:', result);
    if (result) {
      console.log('💾 Guardando registro:', result);
      this.condicionService.create(result).subscribe({
        next: (created) => {
          console.log('✅ Registro creado:', created);
          this.snackBar.open('Registro creado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: (error) => {
          console.error('❌ Error creando registro:', error);
          this.snackBar.open('Error al crear registro', 'Cerrar', { duration: 3000 });
        }
      });
    }
  });
}
```

## 🎯 Checklist de Verificación

Antes de reportar un error, verificar:

- [ ] El backend está ejecutándose
- [ ] La tabla `condicionunica` existe en la base de datos
- [ ] El endpoint `/api/condicion-unica` responde
- [ ] No hay errores en la consola del navegador
- [ ] Angular Material está instalado
- [ ] Las rutas están configuradas correctamente
- [ ] El usuario está autenticado (si usa AuthGuard)
- [ ] CORS está configurado en el backend

## 📞 Soporte Adicional

Si después de seguir estos pasos el error persiste:

1. **Capturar el error completo:**
   - Abrir consola del navegador (F12)
   - Copiar el mensaje de error completo
   - Capturar la pestaña Network para ver las peticiones HTTP

2. **Verificar logs del backend:**
   - Revisar los logs del servidor
   - Buscar errores relacionados con `condicion-unica`

3. **Información a proporcionar:**
   - Mensaje de error completo
   - Pasos para reproducir el error
   - Versión de Angular y Angular Material
   - Navegador y versión

## 🚀 Código Funcionando Correctamente

El código actual está:
- ✅ Completamente comentado línea por línea
- ✅ Sin errores de compilación
- ✅ Con todas las funcionalidades implementadas
- ✅ Siguiendo las mejores prácticas de Angular
- ✅ Con manejo de errores robusto
- ✅ Con validaciones en formularios
- ✅ Con notificaciones al usuario

**El código está listo para producción.**
