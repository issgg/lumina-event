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

GitHub Pages no ejecuta base de datos. El `schema.sql` documenta el modelo real y la app usa la misma forma en `localStorage`: `lumina.evento.v1` guarda el evento con su arreglo de detalles y su cronograma calculado. Por eso el armador tipo carrito corresponde a `detalle_evento`.
