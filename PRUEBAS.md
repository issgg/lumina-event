# Pruebas y casos límite

Última revisión: **22/11/2026**.

Pruebas automáticas: **17/17 aprobadas** con:

```bash
npm test
```

Build verificado con:

```bash
npm run build
```

Los casos de abajo están revisados en código y en la lógica. Se pueden volver a probar en la demo en vivo: https://issgg.github.io/lumina-event/

| # | Caso límite | Cómo probarlo | Resultado esperado | Estado |
|---|---|---|---|---|
| 1 | Formulario vacío | En `/#/armador`, dejar todo vacío y guardar | Aparece “Revisa los campos marcados” y no avanza | OK |
| 2 | Número negativo | Poner `-5` en invitados | Aparece “Debe ser mayor a 0.” | OK |
| 3 | Texto donde va un número | Poner `abc` en invitados | Aparece “Escribe un número, por ejemplo 120.” | OK |
| 4 | Texto muy largo | Escribir más de 60 caracteres en nombre | El campo se corta en 60; no rompe la tarjeta. No hay aviso porque no se puede teclear más | OK |
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

## Pruebas automáticas incluidas

En `tests/logica.test.js` hay 17 pruebas:

1. No agrega el mismo servicio dos veces.
2. `cambiarCantidad` no baja de 1.
3. Quitar servicio actualiza el total.
4. Respeta el mínimo del paquete.
5. `evaluarCobertura` funciona con salón y sin salón.
6. El cronograma tiene un bloque por servicio.
7. El cronograma respeta el orden de inicio.
8. Detecta fallo de horario.
9. La validación rechaza campos vacíos y números inválidos.
10. `validarBusqueda` rechaza texto demasiado largo.
11. Luhn acepta la tarjeta de ejemplo.
12. Luhn rechaza una tarjeta inválida.
13. El proveedor tiene su propio menú y no ve salones.
14. El administrador no se ofrece en el registro y tiene menú propio.
15. Solo los estados conocidos son válidos para un anuncio.
16. Solo un anuncio aprobado puede mostrarse en el catálogo.
17. Rechazar un anuncio pide un motivo corto y no vacío.

## Tarjeta de ejemplo para el pago

- Número: `4242 4242 4242 4242`
- Vencimiento: cualquier fecha futura
- CVC: 3 dígitos

El pago es simulado. No se cobra dinero ni se guardan datos bancarios.
