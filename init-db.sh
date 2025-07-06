#!/bin/bash

echo "Ejecutando script de inicialización de base de datos..."

# Esperar un poco más para asegurar que SQL Server esté completamente listo
sleep 5

# Ejecutar el script SQL con mayor timeout y mejor manejo de errores
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -i /app/init.sql -t 60

if [ $? -eq 0 ]; then
    echo "Base de datos inicializada exitosamente."
else
    echo "Error al inicializar la base de datos."
    exit 1
fi

