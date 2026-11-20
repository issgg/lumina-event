# Pruebas de casos límite

Antes de entregar, ejecutar cada caso y marcarlo. Si algo falla, debe fallar con mensaje claro, nunca con pantalla en blanco ni error en consola.

| # | Caso que puede pedir el maestro | Dónde lo probamos | Resultado esperado | OK |
|---|---|---|---|---|
| 1 | Formulario con campos vacíos | `armador.html` → Guardar sin llenar | No guarda; mensajes junto a cada campo y foco en el primero | [ ] |
| 2 | Texto donde se espera un número | `armador.html` → invitados `abc` | "Escribe un número, por ejemplo 120" | [ ] |
| 3 | Número negativo | `armador.html` → invitados `-5` | "Debe ser mayor a 0" | [ ] |
| 4 | Texto muy largo | `armador.html` → nombre de 200 letras | `maxlength="60"` y mensaje "Máximo 60 caracteres" | [ ] |
| 5 | Buscar algo que no existe | `catalogo.html` → buscar `zzzz` | "No encontramos 'zzzz'. Prueba otra categoría" y botón limpiar | [ ] |
| 6 | Doble clic en guardar | `armador.html` → dos clics rápidos | Botón deshabilitado; el servicio no se duplica; mensaje "Ya está en tu evento" | [ ] |
| 7 | Recargar a mitad del proceso | Llenar, agregar servicios y recargar | Se restaura el borrador y avisa "Retomamos tu evento guardado" | [ ] |
| 8 | API lenta o que no responde | `catalogo.html` sin servidor o con `catalogo.json` renombrado | "Cargando catálogo…" y luego error con botón Reintentar; sin consola rota | [ ] |
| 9 | Lista vacía | `armador.html` → quitar todos los servicios | "Aún no agregaste servicios. Elige uno del catálogo" | [ ] |

## Cómo ejecutarlas rápido

```bash
python3 -m http.server 8000
```

Abrir `http://localhost:8000`. Para el caso 8, detener el servidor o renombrar temporalmente `data/catalogo.json`.

## Pruebas automáticas de lógica

```bash
npm test
```

No instala nada: usa `node:test`, incluido en Node. Cubre total, duplicados, cantidades, validación, filtro y cronograma. Resultado al 19/11/2026: **7 pruebas, 7 aprobadas**.

También se verificó que todos los `id` usados por JavaScript existen en el HTML y que el servidor local devuelve 200 para páginas, JSON, CSS, JS e imágenes.
