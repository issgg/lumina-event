# Bitácora de IA

Aquí anoto cuándo usé la IA, qué pedí y qué revisé yo después.

| Fecha | Parte | Lo que pedí | Lo que hizo la IA | Lo que revisé yo |
|---|---|---|---|---|
| 19/11 | Estructura y lógica | Armar catálogo, carrito, validación y cronograma | Propuso archivos en `src/api`, `src/components` y `src/logica` | Revisé que las funciones fueran claras y corrí las pruebas |
| 19/11 | Pruebas | Crear pruebas de la lógica | Propuso casos de duplicados, cantidades y fechas | Corrí `npm test` y corregí lo que falló |
| 20/11 | Base de datos | Pasar de SQLite a Supabase | Propuso REST con `fetch` y un archivo SQL | Revisé que no apareciera `service_role` en el frontend |
| 20/11 | Deploy | Publicar en GitHub Pages | Propuso un workflow de Actions | Confirmé que la URL respondiera |
| 21/11 | Diseño | Mejorar diseño y responsividad | Propuso paleta crema, verde y terracota, y menú móvil | Revisé clases, build y que no se rompiera en pantallas pequeñas |
| 21/11 | Flujo guiado | Agregar ruta por pasos y pago de prueba | Propuso barra de progreso, números de paso y comprobante | Probé el flujo y sentí que la barra estorbaba |
| 21/11 | Simplificación | Quitar progreso y hacer todo más fácil | Propuso pantallas simples y una sola acción principal | Encontré un error en `resumen.jsx` y lo corregí |
| 21/11 | Tarjetas | Abrir la tarjeta en grande | Propuso un modal con foto, descripción y datos | Revisé cierre con Escape, foco y botones |
| 21/11 | Categorías | Ir por categorías con regresar y omitir | Propuso un parámetro `?categoria=` en la URL | Revisé que el salón mande a la primera categoría y que la última mande al resumen |
| 21/11 | Paleta | Hacer el diseño más elegante, sobre todo los colores | Propuso marfil, verde profundo, terracota apagado y latón | Revisé contraste y apliqué variables en `index.css` y `App.css` |
| 21/11 | Modo oscuro | Que el modo oscuro se vea mejor que todo en claro | Propuso fondo verde oscuro, texto marfil, botones latón y un botón para cambiar de tema | Revisé contraste, guardé la preferencia y dejé el oscuro por defecto |
| 22/11 | Entrega y casos límite | Revisar si cumplía la rúbrica | Señaló bitácora faltante, docs viejos y riesgos de red | Agregué esta bitácora, actualicé docs y corregí los casos límite |
| 22/11 | Tipo proveedor | Agregar otro usuario que anuncie DJ, comida y otros servicios | Propuso rol en el acceso, sesión con rol y menú distinto | Revisé que el proveedor no vea el armador y que el rol no se pierda al recargar |
| 22/11 | Anuncios | Crear una pantalla sencilla para publicar ofertas | Propuso guardar los anuncios como servicios `extra-` del catálogo | Verifiqué que no se borren los servicios del administrador y que el precio inválido no pase |
| 22/11 | Botón de anunciar | El botón del encabezado parecía no responder | Propuso cambiar el rol en local y navegar antes de sincronizar con Supabase | Revisé que abra el formulario directo y que una falla de red solo muestre aviso |
| 22/11 | Tercer rol | Pedir un administrador que revise lo que publican los proveedores | Propuso acceso fijo de demo, menú propio y rutas separadas | Revisé que no aparezca en el registro y que no pueda cambiar de rol |
| 22/11 | Estados de anuncio | Guardar aprobación o rechazo en Supabase | Propuso la tabla `anuncios` con `pendiente`, `aprobado` y `rechazado` | Revisé la migración SQL, las políticas y que solo lo aprobado se copie al catálogo |
| 22/11 | Panel de revisión | Necesitar una pantalla clara para decidir | Propuso filtros, motivo de rechazo y botones de aprobar/rechazar | Revisé que el motivo sea obligatorio y que el proveedor pueda corregir y reenviar |
| 22/11 | Pruebas y docs | Cerrar la entrega con tres roles | Amplió pruebas a 17 y actualizó guion, mapa y modelo | Corrí diff, pruebas, build y confirmé los assets del deploy |
| 22/11 | Registro sin correo | Quitar la confirmación porque los correos son inventados | Propuso crear usuarios desde Supabase Auth con `email_confirm: true` desde la Edge Function | Verifiqué que no haya mensaje de confirmación y que la sesión se devuelva lista |
| 22/11 | Registro más completo | Pedir más datos que correo y contraseña para ambos roles | Propuso campos por rol y validación compartida entre frontend y backend | Corrí pruebas y build; dejé una migración SQL para las columnas nuevas |
| 22/11 | Datos compartidos entre cuentas | El usuario vio el borrador anterior al crear otra cuenta | Señaló que todo estaba fijo en id 1 | Cambié el guardado para usar el id de cada usuario y limpiar la pantalla al cambiar de sesión |
| 22/11 | Compra real con aprobación | El usuario pidió que la compra llegara al admin y no quedara confirmada antes de la revisión | Propuse la tabla `compras`, endpoints autenticados y un panel con aprobar/rechazar | Verifiqué que el total se recalcula en el backend y que el cliente ve el estado actualizado |
| 22/11 | Contraste | El usuario vio textos que no se leían en algunas pantallas | Señaló botones desactivados, etiquetas doradas y paneles verdes | Cambié colores a variables legibles, corregí estados disabled y volví a correr pruebas y build |
| 22/11 | Diseño y animaciones | El usuario pidió un diseño menos aburrido y un menú de comienzo mejor | Propuso entradas suaves, hover en tarjetas y tres accesos rápidos en el inicio | Añadí animaciones, transiciones y `prefers-reduced-motion`; revisé responsive y build |

## Cosas que la IA propuso y yo rechacé

- **Barra de progreso con pasos 01/05:** la quité porque hacía la app más complicada.
- **Juntar todo en pocas pantallas:** no lo acepté; mantuve las rutas actuales para saber dónde estaba cada parte.
- **Cobro con pasarela externa:** no lo acepté. La compra se registra en Supabase y pasa por aprobación, pero no se cobra dinero ni se guardan datos bancarios.
- **SQLite en el navegador:** la dejé atrás porque el proyecto debía usar Supabase.
- **Google OAuth sin secret:** lo dejé pendiente. Sin `Client Secret` la app muestra un mensaje claro y no se rompe.
- **Administrador en el registro:** no lo acepté. El registro deja solo organizador y proveedor; el administrador valida sus credenciales en una Edge Function.
- **Todo en el frontend:** no lo acepté. El usuario pidió backend, así que los secretos y las escrituras privadas pasaron a `lumina-admin`.
- **Publicar anuncios sin revisión:** no lo acepté. Ahora pasan por `pendiente`, y solo los aprobados llegan al catálogo.
- **Pedir confirmación de correo:** lo quité. Los correos son de prueba y no hay buzón real que revisar.

## Cómo revisé el trabajo de la IA

- Corrí `npm test` y `npm run build`.
- Miré el diff antes de cada commit.
- Confirmé que el deploy sirviera los assets nuevos.
- Probé mentalmente los casos límite con la tabla de `PRUEBAS.md`.
