# Multi-stage build para optimizar el tamaño de la imagen
FROM node:18-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir la aplicación para producción con configuración render
RUN npm run build -- --configuration=render

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=build /app/dist/flexoapp /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]