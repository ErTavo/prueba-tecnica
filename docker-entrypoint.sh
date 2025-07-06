#!/bin/bash

# Configurar variables de entorno para SQL Server
export PATH="$PATH:/opt/mssql-tools/bin"

echo "Configurando SQL Server..."

# Configurar SQL Server por primera vez
/opt/mssql/bin/mssql-conf -n setup accept-eula

echo "Iniciando SQL Server..."

# Iniciar SQL Server en segundo plano
/opt/mssql/bin/sqlservr &

# Esperar a que SQL Server esté completamente listo
echo "Esperando a que SQL Server arranque..."
sleep 20

# Verificar que SQL Server esté funcionando con reintentos más agresivos
max_attempts=30
attempt=1

until /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" > /dev/null 2>&1; do
  if [ $attempt -eq $max_attempts ]; then
    echo "Error: SQL Server no pudo iniciarse después de $max_attempts intentos."
    exit 1
  fi
  echo "Intento $attempt/$max_attempts: SQL Server aún no está listo..."
  sleep 5
  attempt=$((attempt + 1))
done

echo "SQL Server está listo y funcionando."

# Ejecutar scripts de inicialización de base de datos
if [ -f /app/init-db.sh ]; then
  echo "Ejecutando inicialización de base de datos..."
  chmod +x /app/init-db.sh
  /app/init-db.sh
fi

echo "Iniciando aplicación backend..."
cd /app/backend
node server.js
