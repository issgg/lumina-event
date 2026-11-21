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
| 22/11 | Agregar tiempo de espera a las llamadas | Si el servidor no responde, la app no debe quedarse cargando | Muestra un mensaje claro y permite reintentar |
| 22/11 | Evitar doble guardado | Un doble clic no debe duplicar datos | Los botones se bloquean y hay guardas extra |
| 22/11 | Dejar la bitácora al día | La rúbrica la pide dentro del repositorio | Queda lista para la pregunta de criterio |

## Qué respondería si me preguntan por una decisión

- **¿Por qué Supabase y no SQLite?** Porque el proyecto necesita guardar datos en la nube y funcionar desde el deploy.
- **¿Qué rechacé de la IA?** La barra de progreso y la idea de juntar todo en pocas pantallas.
- **¿Dónde se equivocó la IA?** Dejó `const total = total;` en el resumen. Lo detecté al revisar el archivo y lo corregí.
- **¿Qué haría diferente?** Pediría el secret de Google antes y pondría tiempo de espera en las llamadas desde el inicio.
