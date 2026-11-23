# Mapa del sistema

## Enlaces

- Repositorio: https://github.com/issgg/lumina-event
- Demo en vivo: https://issgg.github.io/lumina-event/
- Modelo de datos: `MODELADO.md`
- Guion: `GUIÓN.md`
- Pruebas: `PRUEBAS.md`
- Bitácora de IA: `BITACORA_IA.md`
- Diario de decisiones: `DIARIO_DE_DECISIONES.md`

## Visión general

Lumina Event es una app estática hecha con React y Vite. El navegador habla con Supabase por REST. No hay servidor propio: GitHub Pages publica `dist/`.

La idea es ayudar a una persona a organizar un evento en pocos pasos: elegir salón, pasar por categorías de servicios, ver el resumen y confirmar la compra. La compra queda pendiente hasta que el administrador la apruebe.

También ayuda a otra persona a ofrecer servicios y a un administrador a revisarlos. Según el tipo de cuenta, la app muestra un menú distinto: el organizador arma el paquete, el proveedor publica anuncios y el administrador aprueba o rechaza esos anuncios antes de que lleguen al catálogo.

## Estructura de carpetas

| Parte | Archivos | Para qué sirve |
|---|---|---|
| Entrada | `src/main.jsx`, `index.html` | Arranca React y monta la app |
| Rutas y estado | `src/App.jsx` | Define las rutas, mantiene sesión, evento y servicios |
| Estilos | `src/index.css`, `src/App.css` | Paleta, tarjetas, menú y diseño adaptado |
| API | `src/api/*.js` | Lee y escribe en Supabase, maneja sesión y tiempo de espera |
| Componentes | `src/components/*.jsx` | Pantallas y piezas visuales |
| Lógica | `src/logica/*.js` | Cálculos que se pueden probar sin pantalla |
| Datos | `public/data/catalogo.json` | Datos iniciales para sembrar Supabase |
| SQL | `public/db/supabase.sql`, `public/db/migracion_*.sql` | Crea tablas, llaves y políticas; las migraciones agregan anuncios, datos de registro y compras |
| Imágenes | `public/assets/fotos/*.jpg` | Fotos locales de salones y servicios |
| Pruebas | `tests/*.test.js` | Pruebas de la lógica |
| Deploy | `.github/workflows/pages.yml` | Publica el build en GitHub Pages |

## Componentes principales

| Archivo | Qué hace |
|---|---|
| `src/components/acceso.jsx` | Elige tipo de cuenta, inicia sesión o registra con datos según organizador o proveedor |
| `src/components/layout.jsx` | Muestra encabezado, menú según el rol, pie y botón para cambiar de tema |
| `src/components/inicio.jsx` | Pantalla de bienvenida y accesos rápidos |
| `src/components/armador.jsx` | Formulario de datos del evento y guardado del borrador |
| `src/components/salon.jsx` | Muestra salones, permite ver el detalle grande y elegir uno |
| `src/components/catalogo.jsx` | Muestra una categoría a la vez con regresar, omitir y continuar |
| `src/components/tarjetaServicio.jsx` | Modal con foto, descripción y precio de cada servicio |
| `src/components/resumen.jsx` | Resume salón, servicios y costo aproximado |
| `src/components/pago.jsx` | Valida tarjeta de ejemplo, envía la compra al backend y muestra su estado |
| `src/components/administrar.jsx` | Agrega y elimina servicios manuales del catálogo |
| `src/components/aprobaciones.jsx` | Muestra anuncios pendientes y permite aprobarlos o rechazarlos |
| `src/components/compras.jsx` | Muestra compras pendientes y permite confirmarlas o rechazarlas |
| `src/components/proveedor.jsx` | Envía, muestra, corrige y quita anuncios del proveedor |

## FLUJO DE UNA PANTALLA A OTRA

```text
/#/acceso  →  /#/  →  /#/armador  →  /#/salon
    →  /#/catalogo?categoria=comida
    →  /#/catalogo?categoria=mobiliario
    →  /#/catalogo?categoria=musica
    →  /#/catalogo?categoria=decoracion
    →  /#/catalogo?categoria=fotografia
    →  /#/catalogo?categoria=detalles
    →  /#/catalogo?categoria=seguridad
    →  /#/resumen  →  /#/pago
```

Flujo del proveedor:

```text
/#/acceso  →  /#/proveedor  →  /#/proveedor/anunciar  →  /#/proveedor
```

Flujo del administrador:

```text
/#/acceso  →  /#/admin  →  aprobar o rechazar  →  /#/administrar
```

En cada categoría:

- **Regresar** vuelve a la categoría anterior; la primera vuelve al salón.
- **Omitir** pasa a la siguiente sin agregar nada.
- **Continuar** guarda el avance y pasa a la siguiente.
- La última categoría lleva al resumen.
- En el resumen, **Ajustar servicios** vuelve al catálogo.

## API Y BASE DE DATOS

| Archivo | Qué hace |
|---|---|
| `src/api/supabase.js` | Lee, inserta, actualiza y borra filas con REST |
| `src/api/baseDatos.js` | Siembra tablas, guarda evento, servicios y cronograma por cuenta, y arma el cache `luminaDB` |
| `src/api/autenticacion.js` | Sesión con correo, Google, renovación de token y rol guardado |
| `src/api/anuncios.js` | Envía anuncios, revisiones y extras a la Edge Function; expone los aprobados al catálogo |
| `src/api/backendAdmin.js` | Cliente de la Edge Function `lumina-admin` |
| `src/api/catalogo.js` | Trae catálogo y categorías desde Supabase |
| `src/api/configuracion.js` | Roles, navegación por rol, categorías, tipos de evento y reglas del cronograma |
| `src/api/red.js` | Corta la espera si una llamada tarda demasiado |
| `supabase/functions/lumina-admin/index.ts` | Backend: crea cuentas confirmadas, valida admin, guarda anuncios, revisa solicitudes y sincroniza el catálogo |
| `public/db/migracion_registro.sql` | Agrega las columnas nuevas de teléfono, tipo de evento, negocio, categoría y descripción |

Tablas: `usuarios`, `proveedores`, `categorias`, `salones`, `servicios`, `anuncios`, `eventos`, `detalle_evento`, `cronograma`.

El frontend solo usa la llave pública. El `service_role` vive solo en el entorno de la Edge Function y no aparece en el bundle. Las credenciales del administrador tampoco: se guardan como secretos `ADMIN_CORREO` y `ADMIN_CLAVE` de Supabase.

## LÓGICA

| Archivo | Qué hace |
|---|---|
| `src/logica/carrito.js` | Agrega, quita y cuenta servicios |
| `src/logica/paquete.js` | Elige salón, evalúa cobertura y calcula presupuesto |
| `src/logica/pago.js` | Valida la tarjeta con Luhn; nunca guarda datos bancarios |
| `src/logica/cronograma.js` | Arma la línea de tiempo usando las reglas de `configuracion.js` |
| `src/logica/validacion.js` | Revisa datos del evento y búsqueda |
| `src/logica/filtros.js` | Busca sin distinguir tildes |
| `src/logica/formato.js` | Formatea dinero, fechas y horas |
| `src/logica/evento.js` | Crea un evento vacío |
| `src/logica/mensajes.js` | Textos claros para errores y avisos |

## CASOS LÍMITE CUBIERTOS

- Formulario vacío: muestra errores en los campos y no avanza.
- Búsqueda sin resultados: muestra aviso y botón para limpiar.
- Negativos y texto en números: muestran mensaje claro.
- Texto muy largo: se corta con `maxLength` para no romper la tarjeta.
- Doble clic en guardar o pagar: el botón se bloquea y hay guardas extra.
- Recarga a mitad del proceso: se retoma el borrador desde Supabase.
- Servidor lento: se corta la espera y se muestra mensaje para reintentar.
- Listas vacías: muestran mensajes en vez de pantallas en blanco.
- Cambio de rol: se cambia desde el encabezado sin cerrar sesión, el menú se ajusta y **Anunciar servicio** abre el formulario aunque Supabase tarde.
- Anuncio sin nombre o con precio negativo: muestra mensaje y no se publica.
- Proveedor sin anuncios: muestra un texto invitando a publicar el primero.
- Anuncio rechazado: aparece con su motivo y el proveedor puede corregirlo y reenviarlo.
- Anuncio pendiente o rechazado: no aparece en el Inicio ni en el catálogo.

Detalle y pasos para probarlos: `PRUEBAS.md`.

## DECISIONES IMPORTANTES

- Supabase en vez de SQLite: el proyecto necesita datos en la nube.
- REST con `fetch` en vez de una librería nueva: menos dependencias.
- Rutas con `HashRouter`: funciona en GitHub Pages sin configurar el servidor.
- Compra con aprobación: se guarda en `compras` como `pendiente`; solo pasa a `aprobado` cuando el admin la revisa. No se cobra dinero ni se guardan datos de tarjeta.
- Sin barra de progreso: el flujo quedó más simple.
- Categorías por pasos: se puede regresar u omitir sin perder el avance.
- Tres tipos de cuenta: el menú cambia según el rol para no mezclar armar paquetes, anunciar servicios y revisar anuncios.
- Tabla `anuncios`: guarda el estado de cada envío; solo los aprobados se copian como servicios `extra-` al catálogo.

Las razones completas están en `DIARIO_DE_DECISIONES.md`. El registro de trabajo con IA está en `BITACORA_IA.md`.
