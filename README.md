# MP DICRI - Sistema de Gestión de Expedientes e Indicios

Sistema completo para la gestión de expedientes e indicios del Ministerio Público - División Criminal (DICRI).

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker Desktop instalado y funcionando
- Git para clonar el repositorio

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd mp-dicri-app
```

### 2. Levantar el Sistema con Docker
```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build

# Verificar que los contenedores estén funcionando
docker-compose ps
```

### 3. Verificar el Sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

---

## 🗄️ Configuración de Base de Datos

### Credenciales de Acceso
- **Host**: localhost
- **Puerto**: 1433
- **Usuario**: sa
- **Contraseña**: huk3ym65ac8%P
- **Base de Datos**: MP_DICRI

### Usuarios Iniciales del Sistema

Una vez que el sistema esté funcionando, agregar los siguientes usuarios ejecutando estos scripts SQL:

#### 1. Usuario Técnico
```sql
INSERT INTO Usuarios (Nombre, Usuario, Contraseña, Rol, Activo, FechaCreacion) 
VALUES (
    'Juan Pérez Técnico', 
    'tecnico1', 
    '$2b$10$LQDZOjgD7z8K9mV7XeA.HePm7VhF.1Z5oVo2G.5K2J8mE3fA7bGKu', -- password123
    'Tecnico', 
    1, 
    GETDATE()
);
```

#### 2. Usuario Supervisor  
```sql
INSERT INTO Usuarios (Nombre, Usuario, Contraseña, Rol, Activo, FechaCreacion) 
VALUES (
    'María García Supervisor', 
    'supervisor1', 
    '$2b$10$LQDZOjgD7z8K9mV7XeA.HePm7VhF.1Z5oVo2G.5K2J8mE3fA7bGKu', -- password123
    'Supervisor', 
    1, 
    GETDATE()
);
```

#### 3. Usuario Administrador
```sql
INSERT INTO Usuarios (Nombre, Usuario, Contraseña, Rol, Activo, FechaCreacion) 
VALUES (
    'Carlos Rodríguez Admin', 
    'admin1', 
    '$2b$10$LQDZOjgD7z8K9mV7XeA.HePm7VhF.1Z5oVo2G.5K2J8mE3fA7bGKu', -- password123
    'Admin', 
    1, 
    GETDATE()
);
```

### Credenciales de Login
| Usuario | Contraseña | Rol | Permisos |
|---------|------------|-----|----------|
| `tecnico1` | `password123` | Técnico | Crear/editar indicios y expedientes |
| `supervisor1` | `password123` | Supervisor | Aprobar/rechazar + permisos de técnico |
| `admin1` | `password123` | Admin | Acceso completo al sistema |

---

## 🐳 Comandos Docker Útiles

### Gestión del Sistema
```bash
# Ver estado de los contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Reiniciar un servicio
docker-compose restart backend

# Parar el sistema
docker-compose down

# Parar y eliminar volúmenes (CUIDADO: elimina datos de DB)
docker-compose down -v

# Reconstruir e iniciar
docker-compose up -d --build
```

### Acceso a Contenedores
```bash
# Acceder al contenedor de backend
docker-compose exec backend bash

# Acceder al contenedor de base de datos
docker-compose exec database bash

# Ejecutar comandos SQL directamente
docker-compose exec database sqlcmd -S localhost -U sa -P huk3ym65ac8%P
```

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Base de       │
│   React.js      │◄──►│   Node.js       │◄──►│   Datos         │
│   Puerto: 3000  │    │   Express       │    │   SQL Server    │
│                 │    │   Puerto: 3001  │    │   Puerto: 1433  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tecnologías
- **Frontend**: React 19 + Material-UI
- **Backend**: Node.js + Express.js
- **Base de Datos**: SQL Server 2022 Express
- **Orquestación**: Docker Compose
- **Testing**: Jest (98 tests pasando)
- **Cobertura**: 51.56% enfocada en lógica de negocio

---

## 📚 Documentación

### API Endpoints Principales
- `GET /health` - Health check del sistema
- `POST /api/usuarios/login` - Autenticación de usuarios
- `GET /api/usuarios` - Gestión de usuarios
- `GET /api/expedientes` - Gestión de expedientes
- `GET /api/indicios` - Gestión de evidencias

### Documentación Técnica
Para documentación detallada del desarrollo y arquitectura, consultar:
- `DOCUMENTACION_TECNICA.md` - Documentación completa del proyecto
- `SWAGGER-README.md` - Documentación de la API
- `swagger-documentation.json` - Especificación OpenAPI

---

## 🔧 Solución de Problemas

### El sistema no inicia
```bash
# Verificar que Docker esté funcionando
docker --version
docker-compose --version

# Ver logs de errores
docker-compose logs
```

### Error de conexión a base de datos
```bash
# Verificar que el contenedor de DB esté funcionando
docker-compose ps database

# Reiniciar el servicio de base de datos
docker-compose restart database
```

### El frontend no carga
```bash
# Verificar que el puerto 3000 esté disponible
netstat -an | findstr :3000

# Reconstruir el contenedor del frontend
docker-compose up -d --build frontend
```

---

## 🧪 Testing

```bash
# Ejecutar tests desde el contenedor de backend
docker-compose exec backend npm test

# Ejecutar tests con cobertura
docker-compose exec backend npm run test:coverage
```

---

## 👥 Soporte

Para consultas técnicas o reportes de bugs:
1. Revisar la documentación técnica completa
2. Verificar logs del sistema
3. Contactar al equipo de desarrollo

---

**Versión**: 2.0  
**Última actualización**: Julio 2025  
**Estado**: Producción
