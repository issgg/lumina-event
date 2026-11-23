create table if not exists public.anuncios (
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

alter table public.anuncios enable row level security;

drop policy if exists anon_all_anuncios on public.anuncios;
create policy anon_all_anuncios on public.anuncios for all to anon, authenticated using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant all on public.anuncios to anon, authenticated;
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
