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

HTML5 semántico, CSS (Flexbox, Grid, media queries, `:focus-visible`), JavaScript ES6 (`fetch`, `async/await`, módulos), JSON local, `localStorage` y GitHub Pages. El diseño relacional SQL está documentado en `db/`.

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
| `js/` | Lógica: navegación, catálogo, carrito, cronograma, validación, almacenamiento, errores |
| `data/` | Catálogo JSON y configuración de menú, categorías y reglas |
| `db/` | Modelo ER y `schema.sql` |
| `MAPA.md`, `GUIÓN.md`, `BITÁCORA.md`, `PRUEBAS.md`, `KIT-VIVO.md` | Material de la presentación |

Deploy: pendiente de configurar en Settings → Pages → `main / root`.
