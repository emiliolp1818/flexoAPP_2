# 🚀 FlexoAPP - Guía de Inicio Rápido

## 📋 Archivos de Inicio Disponibles

### 1. `quick-start.bat` - Inicio Interactivo
- **Descripción**: Script principal con selección de modo
- **Opciones**: 
  - Modo LOCAL (solo esta máquina)
  - Modo NETWORK (accesible desde la red)
- **Uso**: Doble clic y selecciona el modo

### 2. `quick-start-network.bat` - Modo Network Directo
- **Descripción**: Inicia directamente en modo network
- **Ventaja**: Sin preguntas, directo a modo red
- **Uso**: Doble clic para acceso inmediato desde red

### 3. `stop-flexoapp.bat` - Detener Servicios
- **Descripción**: Detiene todos los servicios FlexoAPP
- **Uso**: Doble clic para parar todo

## 🌐 Diferencias entre Modos

### 🏠 Modo LOCAL
- ✅ Solo accesible desde esta computadora
- ✅ Más rápido de iniciar
- ✅ Menor consumo de recursos
- ✅ Más seguro (no expuesto en red)
- 🔗 URLs: `http://localhost:4200`

### 📱 Modo NETWORK
- ✅ Accesible desde cualquier dispositivo en la red
- ✅ Perfecto para móviles y tablets
- ✅ Ideal para demostraciones
- ✅ Permite trabajo colaborativo
- 🔗 URLs: `http://[TU-IP]:4200`

## 🔧 Requisitos del Sistema

### Dependencias Necesarias:
- ✅ .NET 8.0 SDK
- ✅ Node.js (v18 o superior)
- ✅ Angular CLI (`npm install -g @angular/cli`)

### Verificación Automática:
Los scripts verifican automáticamente que todas las dependencias estén instaladas.

## 🌐 Configuración de Red

### Para Modo Network:
1. **Firewall de Windows**: Los scripts te guiarán para configurarlo
2. **IP Automática**: Se detecta automáticamente tu IP local
3. **Puertos**: 7003 (Backend) y 4200 (Frontend)

### Dispositivos Compatibles:
- 📱 Móviles (Android/iOS)
- 💻 Tablets
- 🖥️ Otras computadoras
- 📺 Smart TVs con navegador

## 🔑 Credenciales por Defecto

```
Usuario: admin
Contraseña: admin123
```

## 🛠️ Solución de Problemas

### Backend no responde:
- Espera 30 segundos más
- Verifica que el puerto 7003 esté libre
- Revisa Windows Defender Firewall

### Frontend no carga:
- Espera que Angular termine de compilar
- Verifica que el puerto 4200 esté libre
- Prueba refrescar el navegador

### No puedo acceder desde red:
1. Ejecuta como administrador
2. Configura Windows Firewall:
   - Panel de Control > Sistema y Seguridad > Firewall de Windows Defender
   - "Permitir una aplicación o característica"
   - Busca "Node.js" y "dotnet"
   - Marca ambas casillas (Privada y Pública)

## 📊 URLs de Acceso

### Modo Local:
- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:7003
- **Swagger**: http://localhost:7003/swagger

### Modo Network:
- **Frontend**: http://[TU-IP]:4200
- **Backend**: http://[TU-IP]:7003
- **Swagger**: http://[TU-IP]:7003/swagger

## 🎯 Recomendaciones de Uso

### Usa Modo LOCAL cuando:
- Desarrolles en solitario
- Quieras máximo rendimiento
- No necesites acceso desde otros dispositivos

### Usa Modo NETWORK cuando:
- Hagas demostraciones
- Trabajes en equipo
- Quieras probar en móviles
- Necesites acceso desde múltiples dispositivos

## 🔄 Comandos Útiles

```bash
# Iniciar modo interactivo
quick-start.bat

# Iniciar directo en network
quick-start-network.bat

# Detener todos los servicios
stop-flexoapp.bat
```

## 📞 Soporte

Si tienes problemas:
1. Verifica que todas las dependencias estén instaladas
2. Ejecuta como administrador si hay problemas de permisos
3. Revisa la configuración del firewall
4. Asegúrate de estar en el directorio raíz del proyecto