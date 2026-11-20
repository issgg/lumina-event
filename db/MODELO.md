# Modelo de datos

Ocho tablas. Este archivo explica el modelo; `schema.sql` contiene la definición SQL.

## Tablas

| Tabla | Qué guarda | Llave primaria | Llaves foráneas |
|---|---|---|---|
| `usuarios` | Personas que usan el sistema | `id` | — |
| `proveedores` | Empresas o personas que ofrecen servicios | `id` | — |
| `categorias` | Grupos del catálogo | `id` | — |
| `salones` | Catálogo de salones | `id` | `proveedor_id → proveedores.id` |
| `servicios` | Catálogo de servicios | `id` | `categoria_id → categorias.id`, `proveedor_id → proveedores.id` |
| `eventos` | Evento que el usuario está armando | `id` | `usuario_id → usuarios.id`, `salon_id → salones.id` |
| `detalle_evento` | Servicios agregados al evento | `id` | `evento_id → eventos.id`, `servicio_id → servicios.id` |
| `cronograma` | Actividades propuestas | `id` | `evento_id → eventos.id` |

## Relaciones

- Un usuario tiene **muchos** eventos.
- Un evento tiene **un** salón y **muchos** detalles.
- Un detalle apunta a **un** servicio.
- Una categoría tiene **muchos** servicios.
- Un proveedor puede ofrecer **muchos** servicios y **muchos** salones.
- Un evento tiene **muchas** filas de cronograma.

## Campos principales

- `usuarios`: nombre, correo, tipo (`usuario` o `admin`).
- `eventos`: tipo_evento, fecha, invitados, presupuesto, hora_inicio, estado (`borrador`).
- `salones`: nombre, direccion, capacidad, precio, horarios, imagen.
- `servicios`: nombre, descripcion, precio, imagen.
- `detalle_evento`: cantidad, precio_unitario, subtotal.
- `cronograma`: hora, actividad, descripcion.

## Cómo se refleja en la app

GitHub Pages no ejecuta un servidor de base de datos, pero la app usa **SQLite real dentro del navegador** con sql.js (WASM). `inicializarBase()` en `js/base-datos.js` ejecuta este mismo `schema.sql`, siembra `categorias`, `proveedores`, `salones` y `servicios` desde `data/catalogo.json`, y guarda la base exportada en `localStorage` con la clave `lumina.db.v1`.

- Guardar el evento = `INSERT`/`UPDATE` en `eventos` + `detalle_evento` + `cronograma`.
- Recargar = reabrir la base exportada desde `localStorage`.
- El armador tipo carrito corresponde a `detalle_evento`; el `UNIQUE (evento_id, servicio_id)` evita duplicados por doble clic.
- `node --test tests/*.test.js` ejecuta el esquema y las consultas con SQLite real.
