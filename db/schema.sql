CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    tipo VARCHAR(10) NOT NULL DEFAULT 'usuario' CHECK (tipo IN ('usuario', 'admin'))
);

CREATE TABLE proveedores (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(120)
);

CREATE TABLE categorias (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(40) NOT NULL UNIQUE,
    descripcion VARCHAR(160)
);

CREATE TABLE salones (
    id INTEGER PRIMARY KEY,
    proveedor_id INTEGER NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    direccion VARCHAR(160) NOT NULL,
    capacidad INTEGER NOT NULL CHECK (capacidad > 0),
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    horarios VARCHAR(80),
    imagen VARCHAR(160),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE servicios (
    id INTEGER PRIMARY KEY,
    categoria_id INTEGER NOT NULL,
    proveedor_id INTEGER NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    descripcion VARCHAR(200),
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    imagen VARCHAR(160),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE eventos (
    id INTEGER PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    salon_id INTEGER,
    tipo_evento VARCHAR(40) NOT NULL,
    fecha DATE NOT NULL,
    invitados INTEGER NOT NULL CHECK (invitados > 0),
    presupuesto DECIMAL(10,2) NOT NULL CHECK (presupuesto >= 0),
    hora_inicio TIME NOT NULL,
    estado VARCHAR(10) NOT NULL DEFAULT 'borrador',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (salon_id) REFERENCES salones(id)
);

CREATE TABLE detalle_evento (
    id INTEGER PRIMARY KEY,
    evento_id INTEGER NOT NULL,
    servicio_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    UNIQUE (evento_id, servicio_id),
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

CREATE TABLE cronograma (
    id INTEGER PRIMARY KEY,
    evento_id INTEGER NOT NULL,
    hora TIME NOT NULL,
    actividad VARCHAR(80) NOT NULL,
    descripcion VARCHAR(200),
    FOREIGN KEY (evento_id) REFERENCES eventos(id)
);
