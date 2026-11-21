# Bitácora de IA

Aquí anoto cuándo usé la IA, qué pedí y qué revisé yo después.

| Fecha | Parte | Lo que pedí | Lo que hizo la IA | Lo que revisé yo |
|---|---|---|---|---|
| 19/11 | Estructura y lógica | Armar catálogo, carrito, validación y cronograma | Propuso archivos en `src/api`, `src/components` y `src/logica` | Revisé que las funciones fueran claras y corrí las pruebas |
| 19/11 | Pruebas | Crear pruebas de la lógica | Propuso casos de duplicados, cantidades y fechas | Corrí `npm test` y corregí lo que falló |
| 20/11 | Base de datos | Pasar de SQLite a Supabase | Propuso REST con `fetch` y un archivo SQL | Revisé que no apareciera `service_role` en el frontend |
| 20/11 | Deploy | Publicar en GitHub Pages | Propuso un workflow de Actions | Confirmé que la URL respondiera |
| 21/11 | Diseño | Mejorar diseño y responsividad | Propuso paleta crema, verde y terracota, y menú móvil | Revisé clases, build y que no se rompiera en pantallas pequeñas |
| 21/11 | Flujo guiado | Agregar ruta por pasos y pago simulado | Propuso barra de progreso, números de paso y comprobante | Probé el flujo y sentí que la barra estorbaba |
| 21/11 | Simplificación | Quitar progreso y hacer todo más fácil | Propuso pantallas simples y una sola acción principal | Encontré un error en `resumen.jsx` y lo corregí |
| 21/11 | Tarjetas | Abrir la tarjeta en grande | Propuso un modal con foto, descripción y datos | Revisé cierre con Escape, foco y botones |
| 21/11 | Categorías | Ir por categorías con regresar y omitir | Propuso un parámetro `?categoria=` en la URL | Revisé que el salón mande a la primera categoría y que la última mande al resumen |
| 21/11 | Paleta | Hacer el diseño más elegante, sobre todo los colores | Propuso marfil, verde profundo, terracota apagado y latón | Revisé contraste y apliqué variables en `index.css` y `App.css` |
| 22/11 | Entrega y casos límite | Revisar si cumplía la rúbrica | Señaló bitácora faltante, docs viejos y riesgos de red | Agregué esta bitácora, actualicé docs y corregí los casos límite |

## Cosas que la IA propuso y yo rechacé

- **Barra de progreso con pasos 01/05:** la quité porque hacía la app más complicada.
- **Juntar todo en pocas pantallas:** no lo acepté; mantuve las rutas actuales para saber dónde estaba cada parte.
- **Cobro real:** no lo acepté. El pago es solo una simulación y no guarda datos bancarios.
- **SQLite en el navegador:** la dejé atrás porque el proyecto debía usar Supabase.
- **Google OAuth sin secret:** lo dejé pendiente. Sin `Client Secret` la app muestra un mensaje claro y no se rompe.

## Cómo revisé el trabajo de la IA

- Corrí `npm test` y `npm run build`.
- Miré el diff antes de cada commit.
- Confirmé que el deploy sirviera los assets nuevos.
- Probé mentalmente los casos límite con la tabla de `PRUEBAS.md`.
