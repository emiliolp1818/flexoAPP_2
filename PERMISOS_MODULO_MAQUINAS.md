# 🎯 Permisos del Módulo de Máquinas - AGREGADOS

## ✅ **7 Nuevos Permisos Implementados**

### **Categoría: Acciones del Módulo de Máquinas** (`machines_actions`)

Se han agregado 7 nuevos permisos específicos para controlar las acciones del módulo de máquinas:

#### **1. Cambios de Estado (5 permisos)**

1. **`machines.status.prealistando`**
   - **Nombre:** Cambiar estado a Prealistando
   - **Descripción:** Permite cambiar el estado de una orden a Prealistando
   - **Uso:** Controla quién puede marcar una orden como "Prealistando"

2. **`machines.status.listo`**
   - **Nombre:** Cambiar estado a Listo
   - **Descripción:** Permite cambiar el estado de una orden a Listo
   - **Uso:** Controla quién puede marcar una orden como "Listo"

3. **`machines.status.corriendo`**
   - **Nombre:** Cambiar estado a Corriendo
   - **Descripción:** Permite cambiar el estado de una orden a Corriendo
   - **Uso:** Controla quién puede marcar una orden como "Corriendo"

4. **`machines.status.terminado`**
   - **Nombre:** Cambiar estado a Terminado
   - **Descripción:** Permite cambiar el estado de una orden a Terminado
   - **Uso:** Controla quién puede marcar una orden como "Terminado"

5. **`machines.status.suspendido`**
   - **Nombre:** Cambiar estado a Suspendido
   - **Descripción:** Permite cambiar el estado de una orden a Suspendido
   - **Uso:** Controla quién puede marcar una orden como "Suspendido"

#### **2. Acciones Adicionales (2 permisos)**

6. **`machines.send_message`**
   - **Nombre:** Enviar mensaje
   - **Descripción:** Permite enviar mensajes en el módulo de máquinas
   - **Uso:** Controla quién puede enviar mensajes/notificaciones

7. **`machines.print`**
   - **Nombre:** Imprimir
   - **Descripción:** Permite imprimir órdenes de trabajo
   - **Uso:** Controla quién puede imprimir documentos

## 📊 **Resumen Total de Permisos**

### **Antes:**
- Total de permisos: 21
- Categorías: 4

### **Ahora:**
- **Total de permisos: 28** ✅
- **Categorías: 5** ✅

### **Distribución por Categoría:**

1. **Gestión de Usuarios** - 4 permisos
2. **Configuración del Sistema** - 3 permisos
3. **Acceso a Módulos** - 8 permisos
4. **Acciones Específicas** - 6 permisos
5. **Acciones del Módulo de Máquinas** - 7 permisos ⭐ **NUEVO**

## 🎨 **Visualización en la UI**

Los nuevos permisos aparecerán en la pestaña de "Permisos" en Settings como una nueva categoría expandible:

```
📋 Acciones del Módulo de Máquinas (7 permisos)
├── 🟢/🔴 Cambiar a Prealistando
├── 🟢/🔴 Cambiar a Listo
├── 🟢/🔴 Cambiar a Corriendo
├── 🟢/🔴 Cambiar a Terminado
├── 🟢/🔴 Cambiar a Suspendido
├── 🟢/🔴 Enviar mensaje
└── 🟢/🔴 Imprimir
```

## 🔧 **Archivos Modificados**

### **Backend:**
1. ✅ `CREATE_PERMISSIONS_TABLES.sql` - Agregados 7 permisos nuevos

### **Frontend:**
1. ✅ `permission.model.ts` - Agregadas 7 constantes nuevas
2. ✅ `permissions.service.ts` - Agregada nueva categoría

## 🚀 **Próximos Pasos para Implementación Funcional**

### **1. Ejecutar Script SQL** ⏳
```bash
# Esto creará los 7 nuevos permisos en la base de datos
mysql -u root -p flexoapp_bd < backend/Database/Scripts/CREATE_PERMISSIONS_TABLES.sql
```

### **2. Integrar Permisos en el Módulo de Máquinas** ⏳

Necesitarás modificar `machines.ts` para verificar permisos antes de permitir acciones:

```typescript
// Ejemplo de cómo verificar permisos en machines.ts

import { PermissionsService, PERMISSIONS } from '../../shared/services/permissions.service';

export class MachinesComponent {
  private permissionsService = inject(PermissionsService);

  // Verificar si puede cambiar a Prealistando
  canChangeToPrealistando(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_PREALISTANDO);
  }

  // Verificar si puede cambiar a Listo
  canChangeToListo(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_LISTO);
  }

  // Verificar si puede cambiar a Corriendo
  canChangeToCorriendo(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_CORRIENDO);
  }

  // Verificar si puede cambiar a Terminado
  canChangeToTerminado(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_TERMINADO);
  }

  // Verificar si puede cambiar a Suspendido
  canChangeToSuspendido(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_STATUS_SUSPENDIDO);
  }

  // Verificar si puede enviar mensajes
  canSendMessage(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_SEND_MESSAGE);
  }

  // Verificar si puede imprimir
  canPrint(): boolean {
    return this.permissionsService.hasPermission(PERMISSIONS.MACHINES_PRINT);
  }
}
```

### **3. Actualizar HTML de Máquinas** ⏳

Deshabilitar botones según permisos:

```html
<!-- Ejemplo en machines.html -->

<!-- Botón Prealistando -->
<button 
  [disabled]="!canChangeToPrealistando()"
  (click)="changeStatus(program, 'Prealistando')">
  Prealistando
</button>

<!-- Botón Listo -->
<button 
  [disabled]="!canChangeToListo()"
  (click)="changeStatus(program, 'Listo')">
  Listo
</button>

<!-- Botón Corriendo -->
<button 
  [disabled]="!canChangeToCorriendo()"
  (click)="changeStatus(program, 'Corriendo')">
  Corriendo
</button>

<!-- Botón Terminado -->
<button 
  [disabled]="!canChangeToTerminado()"
  (click)="changeStatus(program, 'Terminado')">
  Terminado
</button>

<!-- Botón Suspendido -->
<button 
  [disabled]="!canChangeToSuspendido()"
  (click)="changeStatus(program, 'Suspendido')">
  Suspendido
</button>

<!-- Botón Enviar Mensaje -->
<button 
  [disabled]="!canSendMessage()"
  (click)="sendMessage(program)">
  Enviar Mensaje
</button>

<!-- Botón Imprimir -->
<button 
  [disabled]="!canPrint()"
  (click)="printProgram(program)">
  Imprimir
</button>
```

### **4. Cargar Permisos del Usuario al Iniciar Sesión** ⏳

En el componente de login o en el servicio de autenticación:

```typescript
// En login.ts o auth.service.ts
async onLoginSuccess(user: User) {
  // Cargar permisos del usuario
  await this.permissionsService.loadCurrentUserPermissions(user.id).toPromise();
  
  // Navegar al dashboard
  this.router.navigate(['/dashboard']);
}
```

## 🎯 **Casos de Uso**

### **Ejemplo 1: Pre-alistador**
- ✅ Puede cambiar a "Prealistando"
- ✅ Puede cambiar a "Listo"
- ❌ NO puede cambiar a "Corriendo"
- ❌ NO puede cambiar a "Terminado"
- ❌ NO puede cambiar a "Suspendido"
- ✅ Puede enviar mensajes
- ❌ NO puede imprimir

### **Ejemplo 2: Operario**
- ❌ NO puede cambiar a "Prealistando"
- ❌ NO puede cambiar a "Listo"
- ✅ Puede cambiar a "Corriendo"
- ✅ Puede cambiar a "Terminado"
- ✅ Puede cambiar a "Suspendido"
- ✅ Puede enviar mensajes
- ✅ Puede imprimir

### **Ejemplo 3: Supervisor**
- ✅ Puede hacer TODO

### **Ejemplo 4: Admin**
- ✅ Puede hacer TODO
- ✅ Puede gestionar permisos de otros usuarios

## 📝 **Notas Importantes**

1. **Los permisos se verifican en el frontend** para deshabilitar botones
2. **También se deben verificar en el backend** para seguridad
3. **Los permisos se asignan por USUARIO**, no por rol
4. **El admin puede conceder/revocar permisos** desde Settings → Permisos
5. **Los cambios son inmediatos** una vez guardados

## ✅ **Estado Actual**

- ✅ Script SQL actualizado con 7 nuevos permisos
- ✅ Constantes agregadas en `permission.model.ts`
- ✅ Categoría agregada en `permissions.service.ts`
- ✅ UI de settings mostrará automáticamente la nueva categoría
- ⏳ Pendiente: Integrar verificaciones en `machines.ts`
- ⏳ Pendiente: Actualizar botones en `machines.html`
- ⏳ Pendiente: Ejecutar script SQL

¡Los permisos están listos para ser usados! 🎉
