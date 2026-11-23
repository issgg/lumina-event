# Pruebas y casos límite

Última revisión: **22/11/2026**.

Pruebas automáticas: **42/42 aprobadas** con:

```bash
npm test
```

Build verificado con:

```bash
npm run build
```

GitHub Pages ejecuta `npm test` antes de `npm run build` en `.github/workflows/pages.yml`.

Los casos de abajo están revisados en código y en la lógica. Se pueden volver a probar en la demo en vivo: https://issgg.github.io/lumina-event/

| # | Caso límite | Cómo probarlo | Resultado esperado | Estado |
|---|---|---|---|---|
| 1 | Formulario vacío | En `/#/armador`, dejar todo vacío y guardar | Aparece “Revisa los campos marcados” y no avanza | OK |
| 2 | Número negativo | Poner `-5` en invitados | Aparece “Debe ser mayor a 0.” | OK |
| 3 | Texto donde va un número | Poner `abc` en invitados | Aparece “Escribe un número, por ejemplo 120.” | OK |
| 4 | Texto muy largo | Escribir 200 letras en nombre | El campo se corta en 60; no rompe la tarjeta. No hay aviso porque no se puede teclear más | OK |
| 5 | Búsqueda sin resultados | Buscar `zzzzz` en el catálogo | Aparece “No encontramos servicios con ese nombre. Prueba otra categoría.” y un botón para limpiar | OK |
| 6 | Doble clic en guardar | Hacer doble clic rápido en **Guardar y continuar** | Se guarda una sola vez; el botón se bloquea | OK |
| 7 | Recarga a mitad | Guardar datos y recargar la página | Aparece “Retomamos tu evento guardado.” | OK |
| 8 | Lista vacía | Entrar al resumen sin agregar servicios | Aparece “Aún no agregaste servicios. Elige uno del catálogo.” | OK |
| 9 | Tarjeta inválida | En `/#/pago`, poner `1234 1234 1234 1234` | Aparece “Revisa los datos de la tarjeta.” | OK |
| 10 | Servidor lento o sin red | Desactivar red o delays largos y cargar datos | La app deja de esperar, muestra “No se pudo conectar con la base de datos. Recarga la página.” y ofrece reintentar | OK |
| 11 | Precio vacío en administrar | En `/#/administrar`, dejar precio vacío y agregar | Aparece “Escribe un precio mayor o igual a cero.” y no se agrega | OK |
| 12 | Salón ya elegido | Elegir salón y mirar el botón en tarjeta y modal | El botón dice “Salón elegido” y queda deshabilitado | OK |
| 13 | Cambio de tema | Abrir la app y probar el botón **Ver claro / Ver oscuro** | El tema cambia y se recuerda al recargar | OK |
| 14 | Proveedor sin anuncios | Entrar como proveedor con una cuenta nueva | Aparece “Todavía no publicaste nada” y el botón **Anunciar servicio** | OK |
| 15 | Anuncio inválido | Dejar nombre vacío o precio negativo y publicar | Aparece el mensaje claro y no se publica | OK |
| 16 | Cambio de rol sin salir | Probar **Anunciar servicio** y **Armar mi evento** en el encabezado | El menú cambia, la sesión se mantiene y ninguna ruta ajena se abre | OK |
| 17 | Botón Anunciar servicio lento | Activar modo proveedor con Supabase lento o sin red | El formulario abre al instante; si no se pudo sincronizar aparece un aviso, pero no se bloquea | OK |
| 18 | Acceso del administrador | Escribir las credenciales privadas en el formulario normal de acceso | La Edge Function valida los datos, entra en `/#/admin`, ve el menú de revisión y no aparece ningún botón ni dato admin en la pantalla | OK |
| 19 | Rechazo sin motivo | En `/#/admin`, intentar rechazar sin escribir motivo | Aparece “Escribe un motivo para rechazar el anuncio.” y no cambia el estado | OK |
| 20 | Anuncio pendiente | Enviar un anuncio como proveedor y abrir Inicio y catálogo | No aparece en ninguno de los dos hasta que el administrador lo apruebe | OK |
| 21 | Corregir anuncio rechazado | Rechazar con motivo, volver como proveedor y usar **Corregir** | Se abre el formulario con los datos; al guardar vuelve a `pendiente` y el motivo se borra | OK |
| 22 | Extras manuales y anuncios | Agregar un servicio en `/#/administrar` con un anuncio aprobado | El servicio manual y el anuncio aprobado siguen en el catálogo | OK |
| 23 | Falta la tabla `anuncios` | Abrir la app con Supabase sin correr la migración | La app abre igual; el panel de revisión muestra un aviso sobre la función y la tabla | OK |
| 24 | Falta la Edge Function | Abrir `/#/admin` con la función `lumina-admin` sin desplegar | Aparece el aviso del panel y no se muestran credenciales ni botones admin en el login | OK |
| 25 | Registro sin confirmación | Crear una cuenta con un correo de prueba en `/#/acceso` | Entra directo, sin pantalla de “revisa tu correo” ni correo enviado | OK |
| 26 | Registro por rol | Crear organizador y proveedor con teléfono y campos propios | Organizador pide datos de persona; proveedor pide negocio, categoría y descripción; ambos guardan los datos | OK |
| 27 | Cuentas separadas | Armar un evento con una cuenta, cerrar sesión y entrar con otra | La cuenta nueva empieza vacía; al volver a la primera aparece solo su evento | OK |
| 28 | Orden del registro | Abrir **Registrarme** y mirar los campos | Aparecen nombre, teléfono, correo, contraseña y confirmación, en ese orden | OK |
| 29 | Función anterior activa | Crear organizador antes de desplegar la función actualizada | Se crea igual, sin selector de tipo de evento; el tipo se elige después en el armador | OK |
| 30 | Compra pendiente | Confirmar un paquete con la tarjeta de prueba | Aparece en `/#/compras` y el cliente ve pendiente | OK |
| 31 | Cliente sin paquete confirmado | Abrir `/#/resumen` apenas se envió la compra | No aparece como confirmada antes de la aprobación | OK |
| 32 | Aprobar compra | Aprobar la solicitud en el panel admin | El cliente ve confirmada la compra al recargar | OK |
| 33 | Rechazo con motivo | Rechazar sin escribir motivo | Muestra el error y no cambia el estado | OK |
| 34 | Servicio sin foto | Abrir el detalle de un servicio con imagen SVG o sin foto | Aparece una galería con fotos de la categoría y la foto grande se ve | OK |
| 35 | Flechas del modal | Abrir un modal y usar `←` / `→`, luego `Escape` | Cambia la foto y el contador; al cerrar vuelve el foco al botón | OK |
| 36 | Barra inferior del catálogo | Entrar al catálogo y hacer scroll | La barra queda fija y opaca, sin transparencias | OK |
| 37 | Video de inicio | Abrir la portada en el deploy | Se ve el video local; si falla, queda el póster como fondo | OK |
| 38 | Teléfono | Probar el flujo a 390 px de ancho | La barra compacta no tapa contenido y el stepper se desplaza | OK |
| 39 | Acceso sin Google | Abrir `/#/acceso` | Solo aparece el formulario de correo; no hay botón de Google | OK |

En todos los casos la app muestra un aviso, impide la acción o se recupera: no queda en blanco, no lanza un error en consola y no duplica datos.

## Pruebas automáticas incluidas

En `tests/logica.test.js` hay 42 pruebas automáticas:

1. Agregar un servicio no crea duplicados con doble clic.
2. Quitar y cambiar cantidad mantienen límites.
3. El total convierte texto a número y respeta cantidades.
4. La agrupación por categoría suma subtotales con precisión.
5. La validación rechaza campos vacíos, texto, negativos y nombres largos.
6. La búsqueda ignora acentos y mayúsculas y limita la longitud.
7. El cronograma usa solo categorías seleccionadas y cruza medianoche.
8. Elegir salón reemplaza cualquier salón previo y lo pone al inicio.
9. La cobertura marca lo que falta del paquete guiado.
10. El presupuesto indica si sobra o se excede.
11. La validación del pago acepta una tarjeta de prueba y rechaza datos inválidos.
12. Los datos del evento pueden guardarse antes de elegir salón.
13. El proveedor tiene su propio menú y no ve salones.
14. El administrador no se ofrece en el registro y tiene menú propio.
15. Los estados de anuncio aceptan los tres valores y rechazan otros.
16. Solo un anuncio aprobado puede mostrarse en el catálogo.
17. Rechazar un anuncio pide un motivo corto y no vacío.
18. Una compra solo queda confirmada cuando el admin la aprueba.
19. El registro de organizador pide datos reales y contraseña coincidente.
20. El registro de proveedor pide negocio y categoría.
21. La galería usa la foto principal y completa ocho imágenes.
22. La galería cae a fotos de categoría cuando la imagen es SVG.
23. Un precio inválido no contamina el total.
24. Quitar un servicio elimina todas sus apariciones.
25. Un delta inválido no cambia la cantidad.
26. `calcularTotal` ignora inválidos sin perder válidos.
27. Agrupar por categoría redondea y tolera inválidos.
28. Normalizar elimina acentos y mayúsculas.
29. La búsqueda encuentra por descripción y proveedor.
30. La búsqueda demasiado larga se corta sin lanzar.
31. `aMinutos` devuelve cero para hora inválida.
32. `formatearHora` envuelve minutos negativos y mayores a un día.
33. `generarCronograma` sin servicios conserva reglas generales.
34. Seleccionar salón inválido no modifica detalles.
35. La cobertura ignora categorías duplicadas.
36. Un total inválido se trata como cero.
37. Un presupuesto exacto queda dentro sin diferencia.
38. El registro de proveedor rechaza descripciones largas.
39. Los datos del evento marcan fecha pasada y hora inválida.
40. `formatearNumeroTarjeta` elimina letras y limita a 16.
41. `validarPago` sin datos devuelve errores sin lanzar.
42. La galería acepta rutas que empiezan con `/`.

Además, en pantalla se revisan estos casos:

- Una compra recién enviada aparece pendiente en el panel admin.
- Aprobar una compra la confirma para el cliente.
- Rechazar una compra exige un motivo corto y no vacío.

## Tarjeta de ejemplo para la compra

- Número: `4242 4242 4242 4242`
- Vencimiento: cualquier fecha futura
- CVC: 3 dígitos

La compra se registra en Supabase y queda pendiente de aprobación. No se cobra dinero ni se guardan datos bancarios.
