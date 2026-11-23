create table if not exists public.compras (
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

create index if not exists compras_correo_creado_idx on public.compras (correo, creado_en desc);
create index if not exists compras_estado_idx on public.compras (estado);

alter table public.compras enable row level security;

grant usage on schema public to service_role;
grant all on public.compras to service_role;
grant all on all sequences in schema public to service_role;
