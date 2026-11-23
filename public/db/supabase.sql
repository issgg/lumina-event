create table if not exists usuarios (
  id integer primary key,
  nombre varchar(60) not null,
  correo varchar(120) not null unique,
  tipo varchar(10) not null default 'usuario' check (tipo in ('usuario', 'admin')),
  telefono varchar(20),
  tipo_evento varchar(40)
);

create table if not exists proveedores (
  id integer primary key,
  nombre varchar(80) not null,
  telefono varchar(20),
  correo varchar(120),
  descripcion varchar(200),
  categoria varchar(20)
);

create table if not exists categorias (
  id integer primary key,
  clave varchar(20) not null unique,
  nombre varchar(40) not null unique,
  descripcion varchar(160)
);

create table if not exists salones (
  id integer primary key,
  clave varchar(40) not null unique,
  proveedor_id integer not null references proveedores(id),
  nombre varchar(80) not null,
  direccion varchar(160) not null,
  capacidad integer not null check (capacidad > 0),
  precio decimal(10,2) not null check (precio >= 0),
  horarios varchar(80),
  imagen varchar(160)
);

create table if not exists servicios (
  id integer primary key,
  clave varchar(40) not null unique,
  categoria_id integer not null references categorias(id),
  proveedor_id integer not null references proveedores(id),
  nombre varchar(80) not null,
  descripcion varchar(200),
  precio decimal(10,2) not null check (precio >= 0),
  imagen varchar(160)
);

create table if not exists anuncios (
  id bigint generated always as identity primary key,
  clave varchar(80) not null unique,
  correo varchar(120) not null,
  negocio varchar(80) not null default '',
  categoria varchar(20) not null,
  nombre varchar(80) not null,
  descripcion varchar(200),
  precio decimal(10,2) not null default 0 check (precio >= 0),
  imagen varchar(160),
  estado varchar(12) not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  motivo varchar(200),
  creado_en timestamptz not null default now(),
  revisado_en timestamptz
);

create table if not exists compras (
  id bigint generated always as identity primary key,
  clave varchar(80) not null unique,
  correo varchar(120) not null,
  total decimal(10,2) not null check (total >= 0),
  moneda varchar(3) not null default 'MXN',
  estado varchar(12) not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  motivo varchar(200),
  metodo varchar(20) not null default 'tarjeta',
  ultimos4 varchar(4),
  instancia jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now(),
  revisado_en timestamptz
);

create index if not exists compras_correo_creado_idx on compras (correo, creado_en desc);
create index if not exists compras_estado_idx on compras (estado);

create table if not exists eventos (
  id integer primary key,
  usuario_id integer not null references usuarios(id),
  salon_id integer references salones(id),
  tipo_evento varchar(40) not null,
  fecha text not null,
  invitados integer not null check (invitados > 0),
  presupuesto decimal(10,2) not null check (presupuesto >= 0),
  hora_inicio text not null,
  estado varchar(10) not null default 'borrador'
);

create table if not exists detalle_evento (
  id integer primary key,
  evento_id integer not null references eventos(id),
  servicio_id integer not null references servicios(id),
  cantidad integer not null default 1 check (cantidad > 0),
  precio_unitario decimal(10,2) not null,
  subtotal decimal(10,2) not null,
  unique (evento_id, servicio_id)
);

create table if not exists cronograma (
  id integer primary key,
  evento_id integer not null references eventos(id),
  hora text not null,
  actividad varchar(80) not null,
  descripcion varchar(200)
);

alter table usuarios enable row level security;
alter table proveedores enable row level security;
alter table categorias enable row level security;
alter table salones enable row level security;
alter table servicios enable row level security;
alter table anuncios enable row level security;
alter table compras enable row level security;
alter table eventos enable row level security;
alter table detalle_evento enable row level security;
alter table cronograma enable row level security;

drop policy if exists anon_all_usuarios on usuarios;
create policy anon_all_usuarios on usuarios for all to anon, authenticated using (true) with check (true);

drop policy if exists anon_all_proveedores on proveedores;
create policy anon_all_proveedores on proveedores for all to anon, authenticated using (true) with check (true);

drop policy if exists anon_all_categorias on categorias;
create policy anon_all_categorias on categorias for all to anon, authenticated using (true) with check (true);

drop policy if exists anon_all_salones on salones;
create policy anon_all_salones on salones for all to anon, authenticated using (true) with check (true);

drop policy if exists anon_all_servicios on servicios;
create policy anon_all_servicios on servicios for all to anon, authenticated using (true) with check (true);

drop policy if exists anon_all_anuncios on anuncios;
create policy anon_all_anuncios on anuncios for all to anon, authenticated using (true) with check (true);

drop policy if exists anon_all_eventos on eventos;
create policy anon_all_eventos on eventos for all to anon, authenticated using (true) with check (true);

drop policy if exists anon_all_detalle_evento on detalle_evento;
create policy anon_all_detalle_evento on detalle_evento for all to anon, authenticated using (true) with check (true);

drop policy if exists anon_all_cronograma on cronograma;
create policy anon_all_cronograma on cronograma for all to anon, authenticated using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
