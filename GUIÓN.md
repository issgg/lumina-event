# Guion de presentación (12 min)

## 1. Demo — 3 min

Abrir la versión desplegada y seguir el camino feliz:

1. `/#/` → explicar la idea en 20 segundos.
2. `/#/catalogo` → filtrar por categoría, buscar, agregar salón y 4 servicios.
3. `/#/armador` → llenar datos, ver cantidades y total, guardar.
4. `/#/resumen` → ver el desglose y la tabla del cronograma.
5. Recargar y mostrar el evento recuperado: abrir **Supabase → Table Editor → eventos / detalle_evento / cronograma**; en consola, `luminaDB.modo` y `luminaDB.consultar("eventos")`.

Después el maestro pide un caso límite: ir a `PRUEBAS.md`, aplicarlo y mostrar el mensaje claro.

## 2. Mapa del sistema — 2 min

Tener abierto `MAPA.md`. Cuando pregunten dónde vive algo, responder con archivo + función y abrirlo en el editor. No explicar código línea por línea.

La explicación de la estructura:

- `src/main.jsx` es la entrada, igual que en el Pokédex.
- `src/App.jsx` define rutas y guarda el evento en memoria.
- `src/api` trae datos de Supabase y guarda la configuración.
- `src/components` son las pantallas y tarjetas.
- `src/logica` son funciones puras fáciles de probar.
- `public` contiene los archivos que Vite copia tal cual: SQL de Supabase, JSON e imágenes.

## Antes de que te toque

- Laptop con el editor en la carpeta del repo.
- `npm run dev` funcionando o la versión desplegada abierta.
- GitHub en la pestaña de commits.
- Repo congelado desde el domingo 22 de noviembre, 23:59.
