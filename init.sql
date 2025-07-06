-- Verificar si la base de datos existe, si no, crearla
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'MP_DICRI')
BEGIN
    CREATE DATABASE MP_DICRI;
END
GO

USE MP_DICRI;
GO

-- Crear tabla Usuarios si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Usuarios' AND xtype='U')
BEGIN
    CREATE TABLE Usuarios (
        Id INT PRIMARY KEY IDENTITY,
        Nombre NVARCHAR(100),
        Usuario NVARCHAR(50) UNIQUE,
        Contraseña NVARCHAR(255),
        Rol NVARCHAR(20)
    );
END
GO

-- Crear tabla Expedientes si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Expedientes' AND xtype='U')
BEGIN
    CREATE TABLE Expedientes (
        Id INT PRIMARY KEY IDENTITY,
        Codigo NVARCHAR(50) UNIQUE,
        FechaRegistro DATETIME,
        TecnicoId INT FOREIGN KEY REFERENCES Usuarios(Id),
        Estado NVARCHAR(20),
        JustificacionRechazo NVARCHAR(255)
    );
END
GO

-- Crear tabla Indicios si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Indicios' AND xtype='U')
BEGIN
    CREATE TABLE Indicios (
        Id INT PRIMARY KEY IDENTITY,
        ExpedienteId INT FOREIGN KEY REFERENCES Expedientes(Id),
        Descripcion NVARCHAR(255),
        Color NVARCHAR(50),
        Tamano NVARCHAR(50),
        Peso FLOAT,
        Ubicacion NVARCHAR(100),
        TecnicoId INT FOREIGN KEY REFERENCES Usuarios(Id),
        FechaRegistro DATETIME
    );
END
GO

-- Crear tabla HistorialEstados si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HistorialEstados' AND xtype='U')
BEGIN
    CREATE TABLE HistorialEstados (
        Id INT PRIMARY KEY IDENTITY,
        ExpedienteId INT FOREIGN KEY REFERENCES Expedientes(Id),
        Estado NVARCHAR(20),
        FechaCambio DATETIME,
        UsuarioId INT FOREIGN KEY REFERENCES Usuarios(Id)
    );
END
GO

-- Insertar datos de prueba si no existen
IF NOT EXISTS (SELECT * FROM Usuarios)
BEGIN
    INSERT INTO Usuarios (Nombre, Usuario, Contraseña, Rol) VALUES 
    ('Administrador', 'admin', 'admin123', 'Administrador'),
    ('Técnico 1', 'tecnico1', 'tech123', 'Técnico'),
    ('Técnico 2', 'tecnico2', 'tech123', 'Técnico');
END
GO

PRINT 'Base de datos MP_DICRI inicializada correctamente.'
GO

-- ==== ACTUALIZACIÓN DE LA TABLA INDICIOS ====
-- Verificar si existe la columna Tamano (con ñ) y renombrarla a Tamano
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Indicios' AND COLUMN_NAME = 'Tamano')
BEGIN
    -- Renombrar la columna Tamano a Tamano
    EXEC sp_rename 'Indicios.Tamano', 'Tamano', 'COLUMN';
    PRINT 'Columna Tamano renombrada a Tamano';
END
ELSE
BEGIN
    PRINT 'La columna Tamano no existe o ya fue renombrada';
END
GO

-- Agregar columna Estado si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Indicios' AND COLUMN_NAME = 'Estado')
BEGIN
    ALTER TABLE Indicios ADD Estado NVARCHAR(50) DEFAULT 'Pendiente';
    PRINT 'Columna Estado agregada a tabla Indicios';
END
ELSE
BEGIN
    PRINT 'La columna Estado ya existe en la tabla Indicios';
END
GO

-- Agregar columna JustificacionRechazo si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Indicios' AND COLUMN_NAME = 'JustificacionRechazo')
BEGIN
    ALTER TABLE Indicios ADD JustificacionRechazo NVARCHAR(MAX) NULL;
    PRINT 'Columna JustificacionRechazo agregada a tabla Indicios';
END
ELSE
BEGIN
    PRINT 'La columna JustificacionRechazo ya existe en la tabla Indicios';
END
GO

-- Actualizar registros existentes para que tengan estado 'Pendiente' si es NULL
UPDATE Indicios SET Estado = 'Pendiente' WHERE Estado IS NULL;
GO

PRINT 'Actualización de tabla Indicios completada';
GO
