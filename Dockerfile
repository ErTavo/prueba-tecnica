# Dockerfile para el Backend Node.js
FROM node:18-alpine

# Instalar herramientas necesarias para compilar dependencias nativas
RUN apk add --no-cache python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json del backend
COPY backend/package*.json ./

# Instalar dependencias (esto compilará bcrypt para Linux)
RUN npm ci --only=production

# Copiar código fuente del backend (excluyendo node_modules)
COPY backend/src ./src
COPY backend/server.js ./

# Exponer puerto del backend
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando para iniciar el servidor
CMD ["node", "server.js"]
