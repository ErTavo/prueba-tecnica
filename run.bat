@echo off
cls
echo ========================================
echo    MP DICRI - Sistema de Evidencias
echo    Iniciando 3 contenedores separados
echo ========================================
echo.

echo [1/5] Deteniendo contenedores existentes...
docker-compose down > nul 2>&1

echo [2/5] Construyendo e iniciando servicios...
docker-compose up -d --build

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudieron iniciar los contenedores
    echo Verifica que Docker Desktop este ejecutandose
    pause
    exit /b 1
)

echo [3/5] Esperando a que SQL Server este listo...
:wait_sql
timeout /t 5 > nul
netstat -an | find "1433" > nul
if %ERRORLEVEL% NEQ 0 (
    echo    Esperando SQL Server...
    goto wait_sql
)
echo    SQL Server listo!

echo [4/5] Inicializando base de datos con usuarios de prueba...
timeout /t 5 > nul
docker exec -i mp-dicri-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "huk3ym65ac8%%P" -C -Q "IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'MP_DICRI') BEGIN CREATE DATABASE MP_DICRI; END" > nul 2>&1

docker exec -i mp-dicri-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "huk3ym65ac8%%P" -C -d MP_DICRI -Q "IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Usuarios' AND xtype='U') BEGIN CREATE TABLE Usuarios (Id INT IDENTITY(1,1) PRIMARY KEY, Nombre NVARCHAR(100) NOT NULL, Usuario NVARCHAR(50) UNIQUE NOT NULL, Contraseña NVARCHAR(255) NOT NULL, Rol NVARCHAR(20) NOT NULL CHECK (Rol IN ('Tecnico', 'Supervisor', 'Admin')), FechaCreacion DATETIME2 DEFAULT GETDATE(), Activo BIT DEFAULT 1); END" > nul 2>&1

docker exec -i mp-dicri-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "huk3ym65ac8%%P" -C -d MP_DICRI -Q "IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Expedientes' AND xtype='U') BEGIN CREATE TABLE Expedientes (Id INT IDENTITY(1,1) PRIMARY KEY, NumeroExpediente NVARCHAR(50) UNIQUE NOT NULL, Titulo NVARCHAR(200) NOT NULL, Descripcion NVARCHAR(MAX), Estado NVARCHAR(20) DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'En Proceso', 'Completado', 'Cerrado')), FechaCreacion DATETIME2 DEFAULT GETDATE(), CreadoPor INT, FOREIGN KEY (CreadoPor) REFERENCES Usuarios(Id)); END" > nul 2>&1

docker exec -i mp-dicri-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "huk3ym65ac8%%P" -C -d MP_DICRI -Q "IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Indicios' AND xtype='U') BEGIN CREATE TABLE Indicios (Id INT IDENTITY(1,1) PRIMARY KEY, ExpedienteId INT NOT NULL, Descripcion NVARCHAR(500) NOT NULL, TecnicoId INT NOT NULL, Color NVARCHAR(50), Tamano NVARCHAR(50), Peso DECIMAL(10,3), Ubicacion NVARCHAR(200), Estado NVARCHAR(20) DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'En Revision', 'Aprobado', 'Rechazado')), Observaciones NVARCHAR(MAX), JustificacionRechazo NVARCHAR(1000), RevisadoPor INT, FechaRevision DATETIME2, FechaCreacion DATETIME2 DEFAULT GETDATE(), FOREIGN KEY (ExpedienteId) REFERENCES Expedientes(Id), FOREIGN KEY (TecnicoId) REFERENCES Usuarios(Id), FOREIGN KEY (RevisadoPor) REFERENCES Usuarios(Id)); END" > nul 2>&1

docker exec -i mp-dicri-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "huk3ym65ac8%%P" -C -d MP_DICRI -Q "IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'tecnico1') BEGIN INSERT INTO Usuarios (Nombre, Usuario, Contraseña, Rol) VALUES ('Juan Perez', 'tecnico1', 'password123', 'Tecnico'); END" > nul 2>&1

docker exec -i mp-dicri-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "huk3ym65ac8%%P" -C -d MP_DICRI -Q "IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'supervisor1') BEGIN INSERT INTO Usuarios (Nombre, Usuario, Contraseña, Rol) VALUES ('Maria Garcia', 'supervisor1', 'password123', 'Supervisor'); END" > nul 2>&1

docker exec -i mp-dicri-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "huk3ym65ac8%%P" -C -d MP_DICRI -Q "IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Usuario = 'admin1') BEGIN INSERT INTO Usuarios (Nombre, Usuario, Contraseña, Rol) VALUES ('Carlos Admin', 'admin1', 'password123', 'Admin'); END" > nul 2>&1

echo    Base de datos inicializada!

echo [5/5] Verificando servicios...
timeout /t 3 > nul

netstat -an | find "3001" > nul
if %ERRORLEVEL% EQU 0 (
    echo    Backend: OK
) else (
    echo    Backend: ERROR
)

netstat -an | find "3000" > nul
if %ERRORLEVEL% EQU 0 (
    echo    Frontend: OK
) else (
    echo    Frontend: ERROR
)

echo.
echo ========================================
echo          SISTEMA INICIADO
echo ========================================
echo.
echo  Frontend:    http://localhost:3000
echo  Backend API: http://localhost:3001
echo  API Docs:    http://localhost:3001/api-docs
echo  Health:      http://localhost:3001/health
echo  SQL Server:  localhost:1433
echo.
echo ========================================
echo         USUARIOS DE PRUEBA
echo ========================================
echo.
echo  tecnico1    / password123   (Tecnico)
echo  supervisor1 / password123   (Supervisor)
echo  admin1      / password123   (Admin)
echo.
echo ========================================
echo           COMANDOS UTILES
echo ========================================
echo.
echo  Ver logs:     docker-compose logs -f
echo  Parar todo:   docker-compose down
echo  Reiniciar:    docker-compose restart
echo  Estado:       docker-compose ps
echo.
pause
