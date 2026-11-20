# Lumina Event

Sistema web para planificar y armar eventos sociales y empresariales. El módulo principal se llama **EventBuilder** y funciona como un carrito: el usuario elige un salón, agrega servicios por categoría, ve el costo aproximado y obtiene un cronograma.

## Idea

Una sola plataforma reúne salón, comida, mobiliario, música, decoración, fotografía y detalles, para que el usuario no tenga que buscar proveedor por proveedor.

## Problema

Organizar un evento implica coordinar muchos proveedores, comparar precios, revisar ubicaciones y acomodar horarios. Esa información suele estar separada, por lo que el proceso toma tiempo y el costo total no es claro.

## Objetivo

Permitir construir un paquete personalizado y obtener un resumen con servicios, precios y horarios propuestos.

## Alcance

Incluye: catálogo por categorías, selección de salón, armador tipo carrito, costo aproximado, modificación y eliminación de servicios, resumen final, cronograma, persistencia del borrador y panel básico de catálogo.

No incluye: pagos reales, contratos, facturación ni confirmaciones externas.

## Tecnologías

HTML5 semántico, CSS (Flexbox, Grid, media queries, `:focus-visible`), JavaScript ES6 (`fetch`, `async/await`, módulos), **SQLite real ejecutado en el navegador con sql.js (WASM)**, GitHub Pages. `db/schema.sql` se ejecuta tal cual; la base se exporta y se guarda en `localStorage` con la clave `lumina.db.v1` para que sobreviva recargas. `data/catalogo.json` solo se usa para sembrar las tablas la primera vez.

Para ver los datos: **F12 → Application → Local Storage → clave `lumina.db.v1`** (base exportada en base64). Para consultar tablas en la consola: `luminaDB.consultar("SELECT * FROM eventos")` o `luminaDB.servicios()`. Las pruebas ejecutan el mismo SQL con `node --test tests/*.test.js`.

## Cómo ejecutarlo

```bash
python3 -m http.server 8000
```

Después abre `http://localhost:8000`. Se necesita servidor porque el catálogo se carga con `fetch`.

## Estructura

| Carpeta / archivo | Contenido |
|---|---|
| `index.html`, `eventos.html`, `catalogo.html`, `armador.html`, `resumen.html`, `admin.html` | Páginas del sitio |
| `css/` | Estilos base y componentes |
| `js/` | Lógica: base de datos SQL, navegación, catálogo, carrito, cronograma, validación, almacenamiento, errores |
| `data/` | Catálogo JSON de siembra y configuración de menú, categorías y reglas |
| `db/` | Modelo ER y `schema.sql` ejecutado por la app |
| `vendor/` | `sql-wasm.js` y `sql-wasm.wasm` (SQLite en el navegador) |
| `MAPA.md`, `GUIÓN.md`, `BITÁCORA.md`, `PRUEBAS.md`, `KIT-VIVO.md` | Material de la presentación |

Deploy: pendiente de configurar en Settings → Pages → `main / root`.
