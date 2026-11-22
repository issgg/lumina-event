# Diario de decisiones

Aquí explico por qué tomé cada decisión. Está escrito en lenguaje sencillo para poder defenderlo en la presentación.

| Fecha | Decisión | Por qué | Resultado |
|---|---|---|---|
| 19/11 | Separar el proyecto en `api`, `components` y `logica` | Así es más fácil encontrar cada parte cuando me pregunten dónde vive algo | El mapa del sistema quedó claro |
| 19/11 | Dejar la lógica del carrito y del cronograma en funciones puras | Se pueden probar sin abrir la pantalla | Hay pruebas automáticas de esas funciones |
| 20/11 | Usar Supabase con REST en vez de SQLite | La entrega pedía una base alojada y el proyecto debe funcionar en el deploy | Los datos se guardan y se recuperan al recargar |
| 20/11 | Poner solo la llave pública en el frontend | El `service_role` nunca debe viajar al navegador | No hay secretos expuestos |
| 20/11 | Publicar con GitHub Pages | Es gratis y se actualiza con cada push a `main` | La versión desplegada queda lista para la demo |
| 20/11 | Dejar Google OAuth pendiente | Falta el `Client Secret` en Supabase | El botón existe, pero muestra aviso si no está configurado |
| 21/11 | Agregar fotos locales al catálogo | El sistema se entiende mejor al ver cada servicio | Las tarjetas muestran imágenes sin depender de internet |
| 21/11 | Probar una ruta guiada con barra de progreso | Quería ordenar el flujo | La rechacé: hacía la app más pesada y confusa |
| 21/11 | Simplificar las pantallas | El usuario quiere una app fácil, no más complicada | Quedó una acción principal por pantalla y menú más corto |
| 21/11 | Conservar las rutas actuales | Así puedo decir en la presentación dónde vive cada parte | La navegación sigue siendo predecible |
| 21/11 | Abrir cada tarjeta en grande | Antes de elegir, la persona debe ver bien de qué se trata | El modal muestra foto, descripción, precio y datos |
| 21/11 | Pasar por categorías una a una | Salón y luego todas las categorías juntas era demasiado | Ahora hay regresar, omitir y continuar en cada categoría |
| 21/11 | Hacer que el pago sea simulado | No queremos cobrar ni guardar datos bancarios | El comprobante es de ejemplo y no hace cargos |
| 21/11 | Paleta marfil, verde profundo, terracota apagado y latón | Se ve más elegante y mantiene buen contraste | Botones en verde, acentos en terracota y selección en latón |
| 21/11 | Modo oscuro por defecto con botón para volver al claro | El usuario pidió que el oscuro se vea mejor que todo en claro | Fondo verde oscuro, texto marfil, botones latón y preferencia guardada |
| 22/11 | Agregar tiempo de espera a las llamadas | Si el servidor no responde, la app no debe quedarse cargando | Muestra un mensaje claro y permite reintentar |
| 22/11 | Evitar doble guardado | Un doble clic no debe duplicar datos | Los botones se bloquean y hay guardas extra |
| 22/11 | Dejar la bitácora al día | La rúbrica la pide dentro del repositorio | Queda lista para la pregunta de criterio |
| 22/11 | Dos tipos de cuenta | El usuario pidió otro tipo enfocado en anunciar lo que ofrece | Organizador y proveedor tienen menús distintos, sin mezclar tareas |
| 22/11 | Guardar el rol en la sesión | Para no perder el contexto al recargar o renovar el token | El rol elegido al entrar se conserva y también se puede cambiar desde el encabezado |
| 22/11 | Anuncios como servicios `extra-` | Primero reutilicé el catálogo para no correr SQL otra vez | Después cambié: los envíos van a `anuncios` y solo los aprobados se copian como `extra-` |
| 22/11 | El proveedor no publica salones | Los salones tienen dirección, capacidad y modal propio | El proveedor elige solo categorías de servicios |
| 22/11 | Cambio de rol sin esperar a Supabase | El botón de anunciar parecía no responder si la llamada tardaba | El menú y la ruta cambian al instante; la sincronización va en segundo plano |
| 22/11 | Tercer rol de administrador | El usuario pidió revisar lo que publican los proveedores | El administrador tiene menú propio, no aparece en el registro y usa credenciales fijas de demo |
| 22/11 | Tabla `anuncios` con estados | Necesitábamos saber qué anuncio está pendiente, aprobado o rechazado | Supabase guarda el estado y el motivo; hay una migración SQL para proyectos ya creados |
| 22/11 | Solo anuncios aprobados en el catálogo | No queremos mostrar ofertas sin revisar | El Inicio y el catálogo leen lo aprobado; el proveedor ve el estado y puede corregir rechazos |
| 22/11 | Motivo obligatorio al rechazar | El proveedor debe saber qué corregir | El panel pide un motivo corto y el anuncio vuelve a `pendiente` al guardarse |

## Qué respondería si me preguntan
 por una decisión

- **¿Por qué Supabase y no SQLite?** Porque el proyecto necesita guardar datos en la nube y funcionar desde el deploy.
- **¿Qué rechacé de la IA?** La barra de progreso y la idea de juntar todo en pocas pantallas.
- **¿Dónde se equivocó la IA?** Dejó `const total = total;` en el resumen. Lo detecté al revisar el archivo y lo corregí.
- **¿Por qué el proveedor no ve el armador?** Porque su trabajo es anunciar servicios, no elegir salón ni armar paquetes.
- **¿Cómo aparecen los anuncios en el catálogo?** El proveedor los envía a la tabla `anuncios`; el administrador los aprueba y solo entonces se copian como servicios `extra-`.
- **¿Por qué hay un administrador fijo?** Es una demo: así se puede probar la revisión sin depender de otro registro ni de permisos complejos.
- **¿Qué pasa si rechazan mi anuncio?** Aparece el motivo en **Mis anuncios** y el botón **Corregir** lo devuelve a revisión.
- **¿Qué haría diferente?** Pediría el secret de Google antes y pondría tiempo de espera en las llamadas desde el inicio.
