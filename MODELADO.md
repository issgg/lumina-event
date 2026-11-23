# Modelo de datos

Nueve tablas. Este archivo explica el modelo; `public/db/supabase.sql` contiene la definición SQL y `public/db/migracion_anuncios.sql` agrega la tabla de anuncios a proyectos ya creados. `anuncios` es opcional en el arranque: si falta, el resto de la app sigue funcionando.

## Tablas

| Tabla | Qué guarda | Llave primaria | Llaves foráneas |
|---|---|---|---|
| `usuarios` | Personas que usan el sistema | `id` | — |
| `proveedores` | Empresas o personas que ofrecen servicios | `id` | — |
| `categorias` | Grupos del catálogo | `id` | — |
| `salones` | Catálogo de salones | `id` | `proveedor_id → proveedores.id` |
| `servicios` | Catálogo de servicios | `id` | `categoria_id → categorias.id`, `proveedor_id → proveedores.id` |
| `anuncios` | Servicios enviados por proveedores y revisados por el administrador | `id` | — |
| `eventos` | Evento que el usuario está armando | `id` | `usuario_id → usuarios.id`, `salon_id → salones.id` |
| `detalle_evento` | Servicios agregados al evento | `id` | `evento_id → eventos.id`, `servicio_id → servicios.id` |
| `cronograma` | Actividades propuestas | `id` | `evento_id → eventos.id` |

## Relaciones

- Un usuario tiene **muchos** eventos.
- Un evento tiene **un** salón y **muchos** detalles.
- Un detalle apunta a **un** servicio.
- Una categoría tiene **muchos** servicios.
- Un proveedor puede ofrecer **muchos** servicios y **muchos** salones.
- Un proveedor puede enviar **muchos** anuncios; cada anuncio tiene **un** estado.
- Solo un anuncio aprobado se copia al catálogo como servicio `extra-`.
- Un evento tiene **muchas** filas de cronograma.

## Campos principales

- `usuarios`: nombre, correo, tipo (`usuario` o `admin`) y telefono del registro.
- `proveedores`: nombre del negocio, telefono, correo, descripcion y categoria principal.
- `eventos`: tipo_evento, fecha, invitados, presupuesto, hora_inicio, estado (`borrador`).
- `salones`: nombre, direccion, capacidad, precio, horarios, imagen.
- `servicios`: nombre, descripcion, precio, imagen.
- `anuncios`: clave, correo, negocio, categoria, nombre, descripcion, precio, imagen, estado (`pendiente`, `aprobado` o `rechazado`), motivo, creado_en, revisado_en.
- `detalle_evento`: cantidad, precio_unitario, subtotal.
- `cronograma`: hora, actividad, descripcion.

## Cómo se refleja en la app

`inicializarBase()` usa **Supabase** siempre: `src/api/supabase.js` llama a `/rest/v1/<tabla>`, `public/db/supabase.sql` crea las 9 tablas con RLS y la primera carga siembra el catálogo base desde `public/data/catalogo.json`. Los datos se ven en Table Editor y se consultan en consola con `luminaDB.consultar("servicios")` o `luminaDB.consultar("anuncios")`.

Si faltan `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`, la app no inventa una base local: muestra el error de inicio.

- Guardar el evento = `upsert` en `eventos` + borrado e `insert` en `detalle_evento` y `cronograma`.
- Recargar = leer el evento desde Supabase.
- El armador tipo carrito corresponde a `detalle_evento`; el `UNIQUE (evento_id, servicio_id)` evita duplicados por doble clic.
- `node --test tests/*.test.js` ejecuta las pruebas de lógica pura.
