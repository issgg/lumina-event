# Pruebas y casos límite

Última revisión: **22/11/2026**.

Pruebas automáticas: **13/13 aprobadas** con:

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

## Pruebas automáticas incluidas

En `tests/logica.test.js` hay 13 pruebas:

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

## Tarjeta de ejemplo para el pago

- Número: `4242 4242 4242 4242`
- Vencimiento: cualquier fecha futura
- CVC: 3 dígitos

El pago es simulado. No se cobra dinero ni se guardan datos bancarios.
