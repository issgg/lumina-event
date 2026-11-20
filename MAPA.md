# Mapa del sistema

Guía para responder "¿dónde vive esto?" sin explicar línea por línea.

| Si te preguntan por... | Abrir | Buscar |
|---|---|---|
| El menú y las opciones de navegación | `data/config.js` | `NAVEGACION` |
| Cómo se pinta el menú en todas las páginas | `js/navegacion.js` | `renderizarMenu` |
| Los servicios, precios y proveedores en la app | `js/base-datos.js` | `consultarServicios()` (consulta SQL) |
| Los datos de siembra del catálogo | `data/catalogo.json` | arreglo `servicios` |
| La definición de las 8 tablas | `db/schema.sql` | `CREATE TABLE` |
| SQLite en el navegador | `js/base-datos.js`, `vendor/sql-wasm.js` | `inicializarBase()` |
| La base guardada entre recargas | `localStorage` | clave `lumina.db.v1` |
| Ver tablas en la consola | `js/base-datos.js` | `window.luminaDB.consultar(sql)` |
| Las categorías del catálogo y sus nombres | `data/config.js` | `CATEGORIAS` |
| La carga del catálogo y el estado "Cargando" | `js/catalogo.js` | `cargarCatalogo` (llama a SQL) |
| La búsqueda y el filtro por categoría | `js/catalogo.js` | `filtrarServicios` |
| El estado vacío de búsqueda | `js/errores.js` | `sinResultados` |
| Agregar, quitar o cambiar cantidad | `js/carrito.js` | `agregarServicio`, `quitarServicio`, `cambiarCantidad` |
| El cálculo del total | `js/carrito.js` | `calcularTotal` |
| Evitar el doble clic en guardar | `js/almacenamiento.js` | `guardarEvento` y `boton.disabled` en `js/main.js` |
| Recuperar el evento después de recargar | `js/base-datos.js` | `leerEvento` (SELECT + base exportada) |
| Las reglas del formulario | `js/validacion.js` | `validarDatosEvento` |
| Los mensajes de error | `js/errores.js` | `MENSAJES` |
| Los horarios del cronograma | `data/config.js` | `REGLAS_CRONOGRAMA` |
| La generación del cronograma | `js/cronograma.js` | `generarCronograma` |
| La tabla final del cronograma | `resumen.html` | `<table id="tabla-cronograma">` |
| El panel del administrador | `admin.html` + `js/main.js` | bloque `admin` |
| Las tablas SQL y relaciones | `db/schema.sql`, `db/MODELO.md` | 8 tablas ejecutadas por `inicializarBase` |
| El cronograma guardado en SQL | `db/schema.sql` | tabla `cronograma` |
| Los casos límite probados | `PRUEBAS.md` | tabla de 9 casos |
| La explicación de la presentación | `GUIÓN.md` | momentos 1 a 4 |

Respuesta corta que conviene usar: "Eso vive en **[archivo]**, en la función **[nombre]**; lo abro y lo muestro".
