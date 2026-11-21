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

La idea es ayudar a una persona a organizar un evento en pocos pasos: elegir salón, pasar por categorías de servicios, ver el resumen y recibir un comprobante de pago simulado.

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
| SQL | `public/db/supabase.sql` | Crea tablas, llaves y políticas |
| Imágenes | `public/assets/fotos/*.jpg` | Fotos locales de salones y servicios |
| Pruebas | `tests/*.test.js` | Pruebas de la lógica |
| Deploy | `.github/workflows/pages.yml` | Publica el build en GitHub Pages |

## Componentes principales

| Archivo | Qué hace |
|---|---|
| `src/components/acceso.jsx` | Inicia sesión o registra a la persona |
| `src/components/layout.jsx` | Muestra encabezado, menú, pie y botón para cambiar de tema |
| `src/components/inicio.jsx` | Pantalla de bienvenida y accesos rápidos |
| `src/components/armador.jsx` | Formulario de datos del evento y guardado del borrador |
| `src/components/salon.jsx` | Muestra salones, permite ver el detalle grande y elegir uno |
| `src/components/catalogo.jsx` | Muestra una categoría a la vez con regresar, omitir y continuar |
| `src/components/tarjetaServicio.jsx` | Modal con foto, descripción y precio de cada servicio |
| `src/components/resumen.jsx` | Resume salón, servicios y costo aproximado |
| `src/components/pago.jsx` | Valida tarjeta de ejemplo y muestra comprobante |
| `src/components/administrar.jsx` | Agrega y elimina servicios del catálogo |

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
| `src/api/baseDatos.js` | Siembra tablas, arma el cache `luminaDB` y calcula el cronograma |
| `src/api/autenticacion.js` | Sesión con correo, Google y renovación de token |
| `src/api/catalogo.js` | Trae catálogo y categorías desde Supabase |
| `src/api/configuracion.js` | Navegación, categorías, tipos de evento y reglas del cronograma |
| `src/api/red.js` | Corta la espera si una llamada tarda demasiado |

Tablas: `perfiles`, `salones`, `categorias`, `servicios`, `eventos`, `detalle_evento`, `cronograma`, `pagos`.

El frontend solo usa la llave pública. El `service_role` no aparece en el código.

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

Detalle y pasos para probarlos: `PRUEBAS.md`.

## DECISIONES IMPORTANTES

- Supabase en vez de SQLite: el proyecto necesita datos en la nube.
- REST con `fetch` en vez de una librería nueva: menos dependencias.
- Rutas con `HashRouter`: funciona en GitHub Pages sin configurar el servidor.
- Pago simulado: no se cobra nada ni se guardan datos de tarjeta.
- Sin barra de progreso: el flujo quedó más simple.
- Categorías por pasos: se puede regresar u omitir sin perder el avance.

Las razones completas están en `DIARIO_DE_DECISIONES.md`. El registro de trabajo con IA está en `BITACORA_IA.md`.
