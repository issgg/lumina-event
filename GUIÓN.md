# Guion de presentación

Duración sugerida: **3 minutos**. Usar lenguaje sencillo y mostrar la app en vivo desde:

https://issgg.github.io/lumina-event/

También dejar abiertos el repo y la bitácora:

- Repo: https://github.com/issgg/lumina-event
- Bitácora: `BITACORA_IA.md`

## 1. Presentación (20 segundos)

> "Lumina Event es una app para armar eventos en un solo lugar. Sirve para elegir salón, comida, mobiliario y otros servicios sin ir de proveedor en proveedor. Muestra el costo aproximado y un cronograma sencillo."

## 2. Idea y tecnologías (30 segundos)

> "La app usa React con Vite. Los datos viven en Supabase y el sitio se publica con GitHub Pages en cada push a `main`."

Mostrar en `README.md` los enlaces de entrega y la estructura de carpetas.

## 3. Inicio y acceso (25 segundos)

Abrir `/#/acceso`.

> "Primero se inicia sesión con correo. La sesión se guarda y se renueva sola. El acceso con Google queda pendiente porque falta el secreto en Supabase, pero el botón avisa en vez de romperse."

## 4. Datos del evento (30 segundos)

Ir a `/#/armador`.

- Llenar nombre, tipo, fecha, invitados, presupuesto y hora.
- Mostrar que los campos vacíos marcan error.
- Guardar.

> "Esta pantalla valida los datos antes de continuar. Si algo falta o está mal, aparece un mensaje claro."

## 5. Salón (30 segundos)

Ir a `/#/salon`.

- Clic en **Ver detalle** de un salón.
- Mostrar el modal grande con foto, descripción, precio y capacidad.
- Elegir salón.

> "Antes de elegir se puede ver la tarjeta en grande. El salón elegido queda deshabilitado para no guardarlo dos veces."

## 6. Servicios por categoría (40 segundos)

Ir a `/#/catalogo?categoria=comida`.

- Mostrar que solo aparece una categoría.
- Agregar un servicio.
- Clic en **Omitir** para pasar a la siguiente.
- Clic en **Regresar** para volver.
- Clic en otra tarjeta para ver el modal.

> "El catálogo va por pasos: comida, mobiliario, música, decoración, fotografía, detalles y seguridad. En cada paso se puede regresar u omitir. El avance se guarda, así que al recargar se retoma."

## 7. Resumen y pago simulado (25 segundos)

Ir a `/#/resumen` y después a `/#/pago`.

> "El resumen junta salón, servicios y costo aproximado. Desde ahí se puede volver a ajustar servicios. El pago es simulado: valida una tarjeta de ejemplo y muestra comprobante, pero no cobra ni guarda datos bancarios."

Tarjeta de ejemplo: `4242 4242 4242 4242`, cualquier fecha futura y CVC de 3 dígitos.

## 8. Cierre (20 segundos)

> "Para terminar, la bitácora cuenta qué pidí a la IA y qué rechacé, y el diario explica por qué tomé cada decisión. También hay una tabla de casos límite con los resultados."

Abrir `DIARIO_DE_DECISIONES.md` y `PRUEBAS.md`.

## Qué decir si preguntan

- **¿Dónde viven los datos?** En Supabase; se ven en Table Editor y en la consola con `luminaDB`.
- **¿Qué es lo más complicado?** El cálculo del cronograma, porque respeta horarios y tiempos de cada servicio.
- **¿Qué cambiaste después de probar?** Quité la barra de progreso porque hacía la app más complicada.
- **¿Qué propuso la IA y rechazaste?** Juntar todo en pocas pantallas y el cobro real.
- **¿Qué pasa si Supabase no responde?** La app deja de esperar, muestra un aviso y permite reintentar.

## Antes de que te toque

- Confirmar que la demo abre: https://issgg.github.io/lumina-event/
- Tener abiertos `README.md`, `MAPA.md`, `BITACORA_IA.md` y `PRUEBAS.md`.
- Repasar los enlaces del repo y del deploy.
- Probar una vez el flujo completo con la tarjeta de ejemplo.
