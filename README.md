# Lumina Event

Sistema web para planificar y armar eventos sociales y empresariales. El módulo principal se llama **EventBuilder** y funciona como un carrito: el usuario elige un salón, pasa por categorías de servicios, ve el costo aproximado y obtiene un cronograma.

## Enlaces de entrega

- Repositorio de GitHub: https://github.com/issgg/lumina-event
- Proyecto desplegado: https://issgg.github.io/lumina-event/
- Bitácora de IA: `BITACORA_IA.md`
- Diario de decisiones: `DIARIO_DE_DECISIONES.md`
- Mapa del sistema: `MAPA.md`
- Guion de presentación: `GUIÓN.md`
- Casos límite: `PRUEBAS.md`

## Idea

Una sola plataforma reúne salón, comida, mobiliario, música, decoración, fotografía y detalles, para que el usuario no tenga que buscar proveedor por proveedor.

El flujo es sencillo: datos del evento, salón, categorías de servicios, resumen y pago simulado. En cada categoría se puede **regresar**, **omitir** o **continuar**.

También hay tres tipos de cuenta. El **organizador** arma su paquete con el flujo anterior. El **proveedor** anuncia lo que ofrece, por ejemplo DJ, comida o decoración. El **administrador** revisa esos anuncios y aprueba o rechaza cada uno. Organizador y proveedor se eligen al entrar y se pueden cambiar desde el encabezado sin cerrar sesión; el administrador valida sus credenciales en el backend y tiene menú propio. El botón **Anunciar servicio** abre directo el formulario del proveedor.

## Paleta

La paleta busca un look elegante y tranquilo:

- **Marfil:** fondo general, para que leer no canse.
- **Verde profundo:** botones principales y paneles importantes.
- **Terracota apagado:** etiquetas y pequeños acentos.
- **Latón:** bordes de selección y detalles finos.
- **Arena clara:** superficies suaves y resúmenes.

El modo oscuro viene por defecto. En el encabezado, el botón **Ver claro** permite cambiar y la preferencia queda guardada.

## Tecnologías

React + Vite, React Router con `HashRouter`, CSS propio, JavaScript ES6 y **Supabase** como base alojada. No se instaló una librería nueva: `src/api/supabase.js` usa el REST de Supabase con `fetch`. La app sigue siendo estática: GitHub Pages publica `dist/` y el navegador habla con Supabase.

No hay modo local: si faltan las variables de entorno, la app muestra un error claro. `public/data/catalogo.json` solo siembra Supabase la primera vez.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite. Para production:

```bash
npm run build
npm run preview
```

Para probar la lógica:

```bash
npm test
```

## Conectar Supabase

1. Crear proyecto gratuito en Supabase.
2. Pegar `public/db/supabase.sql` en **SQL Editor → New query → Run**.
3. Si el proyecto ya estaba creado, pegar también `public/db/migracion_anuncios.sql` para agregar la tabla de anuncios. Sin esta migración el resto de la app sigue abriendo, pero revisar y enviar anuncios no funcionará.
4. Copiar `.env.example` a `.env.local` y rellenar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` del proyecto.
5. Reiniciar Vite. La primera carga siembra las 8 tablas base desde `public/data/catalogo.json`; la novena tabla es `anuncios`.

El `anon key` es público y debe ir en el frontend; el `service_role` **nunca** se pone aquí. Las políticas RLS del SQL permiten el acceso de demostración; para producción habría que reducirlas.

## Backend

La app usa una Edge Function de Supabase llamada `lumina-admin` en `supabase/functions/lumina-admin/index.ts`. El frontend no guarda credenciales de administrador: el formulario solo envía lo que escribe la persona y la función valida `ADMIN_CORREO` y `ADMIN_CLAVE` desde secretos de Supabase. La función usa `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`, que Supabase entrega al entorno de la función; el `service_role` sigue sin aparecer en el navegador.

Para desplegarla:

1. Instalar Supabase CLI e iniciar sesión con `supabase login`.
2. Desde la raíz del repo, ejecutar `supabase link --project-ref dakdafqbgliyuqnqaduf`.
3. Definir los secretos con `supabase secrets set ADMIN_CORREO=... ADMIN_CLAVE=...`, usando el correo y la contraseña privados del administrador.
4. Ejecutar en **SQL Editor** el archivo `public/db/migracion_registro.sql` para agregar los campos del registro.
5. Ejecutar `supabase functions deploy lumina-admin`.
6. Confirmar en **Edge Functions → Logs** que la función responde.

`supabase/config.toml` deja `verify_jwt = false` porque la función valida por ella misma: token firmado para administrador y token de Supabase Auth para proveedor.

## Inicio de sesión

La pantalla de acceso permite entrar o registrarse con correo y contraseña. Antes de entrar se elige el tipo de cuenta: **Armar mi evento** u **Anunciar servicios**. El registro ya no pide confirmar el correo: la Edge Function crea al usuario en Supabase Auth con `email_confirm: true`, guarda sus datos en `usuarios` y, si es proveedor, en `proveedores`, y devuelve la sesión lista para usar.

El registro pide nombre, teléfono, correo, contraseña y repetir contraseña. El organizador elige además el tipo de evento que planea; el proveedor agrega nombre del negocio, categoría principal y una descripción corta. La sesión se guarda en `localStorage`, conserva ese rol y se renueva sola cuando todavía hay un `refresh_token`. El administrador no aparece en el registro ni tiene un botón visible: entra escribiendo sus credenciales privadas en el formulario normal y la Edge Function las valida.

Los anuncios del proveedor se guardan en la tabla `anuncios` de Supabase con estado `pendiente`, `aprobado` o `rechazado`. El proveedor llama a la función con su token de Supabase; el administrador llama con su token firmado. El administrador ve los pendientes en `/#/admin`; si rechaza, escribe un motivo y el proveedor puede corregir y reenviar. Solo los aprobados se copian al catálogo como servicios `extra-`; por eso aparecen en el Inicio y en las categorías. Esa copia la hace la función, no el navegador. El proveedor no publica salones porque esos tienen dirección y capacidad aparte.

Para habilitar Google:

1. En Supabase, entrar a **Authentication → Providers → Google** y activarlo.
2. Agregar las URLs permitidas:
   - `http://localhost:4173/**`
   - `https://issgg.github.io/lumina-event/**`
3. Pegar el `Client ID` y el `Client Secret` de Google OAuth en Supabase.

Si no está el `Client Secret`, el botón de Google muestra un aviso y la app sigue funcionando con correo.

## Estructura

La organización es la misma idea del proyecto Pokédex: `src/api` para traer datos, `src/components` para componentes, `App.jsx` para rutas y estado, `main.jsx` como entrada, y `public/` para archivos que se sirven directo.

```text
LuminaEvent/
├─ .env.example
├─ .env.production
├─ .github/workflows/pages.yml
├─ BITACORA_IA.md
├─ DIARIO_DE_DECISIONES.md
├─ GUIÓN.md
├─ MAPA.md
├─ MODELADO.md
├─ PRUEBAS.md
├─ index.html
├─ vite.config.js
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ App.css
│  ├─ index.css
│  ├─ api/
│  │  ├─ anuncios.js
│  │  ├─ autenticacion.js
│  │  ├─ baseDatos.js
│  │  ├─ catalogo.js
│  │  ├─ configuracion.js
│  │  ├─ red.js
│  │  └─ supabase.js
│  ├─ components/
│  │  ├─ acceso.jsx
│  │  ├─ layout.jsx
│  │  ├─ inicio.jsx
│  │  ├─ armador.jsx
│  │  ├─ salon.jsx
│  │  ├─ catalogo.jsx
│  │  ├─ tarjetaServicio.jsx
│  │  ├─ resumen.jsx
│  │  ├─ pago.jsx
│  │  ├─ administrar.jsx
│  │  ├─ aprobaciones.jsx
│  │  └─ proveedor.jsx
│  └─ logica/
│     ├─ carrito.js
│     ├─ paquete.js
│     ├─ pago.js
│     ├─ cronograma.js
│     ├─ validacion.js
│     ├─ filtros.js
│     ├─ formato.js
│     ├─ evento.js
│     └─ mensajes.js
├─ public/
│  ├─ .nojekyll
│  ├─ data/catalogo.json
│  ├─ db/migracion_anuncios.sql
│  ├─ db/supabase.sql
│  └─ assets/fotos/*.jpg
└─ tests/
```

## Base de datos en la presentación

En la consola del navegador:

```js
luminaDB.modo
luminaDB.consultar("servicios")
luminaDB.consultar("anuncios")
luminaDB.consultar("eventos")
luminaDB.consultar("detalle_evento")
luminaDB.cronograma()
luminaDB.tablas()
```

`luminaDB.consultar("servicios")` devuelve las filas en caché y los datos también se ven en **Table Editor**. Si no hay `.env.local`, la pantalla muestra "No se pudo iniciar la base" con botón Reintentar.

## Deploy

El workflow `.github/workflows/pages.yml` compila y publica `dist/` en GitHub Pages en cada push a `main`. También se puede lanzar desde **Actions → Desplegar pagina → Run workflow**.

El build usa `.env.production` con la URL y la `publishable key` de Supabase. Esa key es pública y viaja en el bundle del navegador; nunca se pone `service_role`. El backend se despliega aparte con `supabase functions deploy lumina-admin` siguiendo la sección **Backend**.

Para activarlo:

1. En GitHub, entrar a **Settings → Pages**.
2. Elegir **Source: GitHub Actions**.
3. Hacer push a `main` o ejecutar el workflow manualmente.

La URL será `https://issgg.github.io/lumina-event/`. El `base: "./"` de `vite.config.js` permite que funcione en una URL de proyecto. Las variables `VITE_SUPABASE_*` deben existir **antes de compilar**, por eso están en `.env.production`.
