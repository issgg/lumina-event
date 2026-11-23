alter table public.usuarios add column if not exists telefono varchar(20);
alter table public.usuarios add column if not exists tipo_evento varchar(40);
alter table public.proveedores add column if not exists descripcion varchar(200);
alter table public.proveedores add column if not exists categoria varchar(20);

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
