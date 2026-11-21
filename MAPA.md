# Mapa del sistema

Guía para responder "¿dónde vive esto?" sin explicar línea por línea.

| Si te preguntan por... | Abrir | Buscar |
|---|---|---|
| La entrada de la app | `src/main.jsx` | `createRoot`, `HashRouter` |
| Las rutas y el estado del evento | `src/App.jsx` | `<Routes>`, `actualizarEvento` |
| La pantalla de acceso | `src/components/acceso.jsx` | `enviar`, `google` |
| Correo, Google y sesión | `src/api/autenticacion.js` | `obtenerSesion`, `iniciarConGoogle` |
| El menú y el aviso general | `src/components/layout.jsx` | `NAVEGACION`, `<Outlet />` |
| Las opciones del menú | `src/api/configuracion.js` | `NAVEGACION` |
| Las categorías del catálogo | `src/api/configuracion.js` | `CATEGORIAS` |
| Los tipos de evento | `src/api/configuracion.js` | `TIPOS_EVENTO` |
| Las reglas del cronograma | `src/api/configuracion.js` | `REGLAS_CRONOGRAMA` |
| La página de inicio | `src/components/inicio.jsx` | `hero` |
| La página del catálogo | `src/components/catalogo.jsx` | `filtrarServicios`, `agregar` |
| La tarjeta de cada servicio | `src/components/tarjetaServicio.jsx` | `TarjetaServicio` |
| Traer servicios desde la capa de datos | `src/api/catalogo.js` | `cargarServicios` |
| El armador tipo carrito | `src/components/armador.jsx` | `guardar`, `cambiarCantidadServicio` |
| El resumen y las tablas | `src/components/resumen.jsx` | `Tabla`, `consultarCronograma` |
| El panel del administrador | `src/components/administrar.jsx` | `agregar`, `eliminar` |
| Conectar con Supabase | `src/api/baseDatos.js` | `inicializarBase` |
| Llamadas REST a Supabase | `src/api/supabase.js` | `solicitar` |
| Esquema de 8 tablas | `public/db/supabase.sql` | `create table` |
| El modelo explicado | `MODELADO.md` | tablas y relaciones |
| Los datos de siembra | `public/data/catalogo.json` | arreglo `servicios` |
| Variables de conexión | `.env.local` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Consultar tablas en consola | `src/api/baseDatos.js` | `window.luminaDB.consultar(tabla)` |
| Agregar, quitar y cantidades | `src/logica/carrito.js` | `agregarServicio`, `quitarServicio` |
| El total y los subtotales | `src/logica/carrito.js` | `calcularTotal`, `agruparPorCategoria` |
| La búsqueda y el filtro | `src/logica/filtros.js` | `normalizar`, `filtrarServicios` |
| La validación del formulario | `src/logica/validacion.js` | `validarDatosEvento` |
| Los mensajes | `src/logica/mensajes.js` | `MENSAJES` |
| La generación de horarios | `src/logica/cronograma.js` | `generarCronograma` |
| Los estilos generales | `src/index.css` | variables y botones |
| Los estilos por pantalla | `src/App.css` | `.hero`, `.panel`, `.rejilla` |
| Los casos límite probados | `PRUEBAS.md` | tabla de 10 casos |

Respuesta corta: "Eso vive en **[archivo]**, en la función **[nombre]**; lo abro y lo muestro".
