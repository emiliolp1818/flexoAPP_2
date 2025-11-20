# Environments

## 📋 Descripción
Configuraciones de ambiente para la aplicación FlexoAPP Frontend.

## 🏗️ Estructura
```
environments/
├── environment.ts         # Desarrollo
├── environment.prod.ts    # Producción
├── environment.network.ts # Red/Testing
└── README.md             # Esta documentación
```

## 🔧 Configuraciones

### Development (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000',
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  retryAttempts: 3
};
```

### Production (environment.prod.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.flexoapp.com/api',
  socketUrl: 'https://api.flexoapp.com',
  enableLogging: false,
  enableDebugMode: false,
  cacheTimeout: 30 * 60 * 1000, // 30 minutos
  retryAttempts: 5
};
```

### Network/Testing (environment.network.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://192.168.1.100:5000/api',
  socketUrl: 'http://192.168.1.100:5000',
  enableLogging: true,
  enableDebugMode: true,
  cacheTimeout: 10 * 60 * 1000, // 10 minutos
  retryAttempts: 3
};
```

## 🌐 Variables de Configuración

### API Configuration
- **apiUrl**: URL base del backend
- **socketUrl**: URL para WebSocket connections
- **apiVersion**: Versión de la API
- **timeout**: Timeout para peticiones HTTP

### Feature Flags
- **enableLogging**: Habilitar logging en consola
- **enableDebugMode**: Modo debug para desarrollo
- **enableAnalytics**: Habilitar analytics
- **enablePWA**: Funcionalidades PWA

### Performance Settings
- **cacheTimeout**: Tiempo de vida del caché
- **retryAttempts**: Intentos de reintento HTTP
- **debounceTime**: Tiempo de debounce para búsquedas
- **pageSize**: Tamaño de página por defecto

### Security Settings
- **tokenExpiration**: Tiempo de expiración de tokens
- **refreshThreshold**: Umbral para refresh de tokens
- **maxFileSize**: Tamaño máximo de archivos
- **allowedFileTypes**: Tipos de archivo permitidos

## 🔄 Uso en Componentes

```typescript
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  getData() {
    return this.http.get(`${this.apiUrl}/data`);
  }
}
```

## 🛠️ Build Configuration

### Angular.json
```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts"
        }
      ]
    },
    "network": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.network.ts"
        }
      ]
    }
  }
}
```

### Build Commands
```bash
# Desarrollo
ng build

# Producción
ng build --configuration=production

# Network/Testing
ng build --configuration=network
```

## 🔐 Seguridad

### Variables Sensibles
- No incluir credenciales en el código
- Usar variables de entorno del servidor
- Configurar CORS apropiadamente
- Validar URLs y endpoints

### Best Practices
1. **Separación**: Configuraciones específicas por ambiente
2. **Validación**: Validar configuraciones en tiempo de ejecución
3. **Documentación**: Documentar todas las variables
4. **Versionado**: No versionar credenciales sensibles
5. **Testing**: Probar configuraciones en cada ambiente

## 📋 Checklist de Deployment

### Pre-deployment
- [ ] Verificar URLs de producción
- [ ] Confirmar configuraciones de seguridad
- [ ] Validar feature flags
- [ ] Probar conectividad con backend

### Post-deployment
- [ ] Verificar funcionamiento en producción
- [ ] Monitorear logs de errores
- [ ] Confirmar métricas de performance
- [ ] Validar funcionalidades críticas