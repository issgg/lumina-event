# Pruebas de casos límite

Antes de entregar, ejecutar cada caso y marcarlo. Si algo falla, debe fallar con mensaje claro, nunca con pantalla en blanco ni error en consola.

| # | Caso que puede pedir el maestro | Dónde lo probamos | Resultado esperado | OK |
|---|---|---|---|---|
| 1 | Formulario con campos vacíos | `/#/armador` → Guardar sin llenar | No guarda; mensajes junto a cada campo y aviso general | [ ] |
| 2 | Texto donde se espera un número | `/#/armador` → invitados `abc` | "Escribe un número, por ejemplo 120" | [ ] |
| 3 | Número negativo | `/#/armador` → invitados `-5` | "Debe ser mayor a 0" | [ ] |
| 4 | Texto muy largo | `/#/armador` → nombre de 200 letras | `maxLength={60}` y mensaje "Máximo 60 caracteres" | [ ] |
| 5 | Buscar algo que no existe | `/#/catalogo` → buscar `zzzz` | "No encontramos servicios con ese nombre…" y botón limpiar | [ ] |
| 6 | Doble clic en agregar | `/#/catalogo` → dos clics en el mismo servicio | Botón queda "En tu evento"; no se duplica | [ ] |
| 7 | Recargar a mitad del proceso | Llenar, agregar servicios y recargar | Se restaura el borrador desde Supabase y avisa "Retomamos tu evento guardado" | [ ] |
| 8 | Supabase no responde | Apagar el proyecto de Supabase o borrar `.env.local` | Pantalla "No se pudo iniciar la base" con botón Reintentar; sin pantalla en blanco | [ ] |
| 9 | Lista vacía | `/#/armador` → quitar todos los servicios | "Aún no agregaste servicios. Elige uno del catálogo" | [ ] |
| 10 | Doble guardado con el mismo servicio | Agregar el mismo servicio dos veces y guardar | `UNIQUE (evento_id, servicio_id)` impide el duplicado en `detalle_evento` | [ ] |

## Cómo ejecutarlas rápido

```bash
npm install
npm run dev
```

Antes de probar, copiar `.env.example` a `.env.local` y pegar la URL y el anon key de Supabase. Para el caso 8, borrar `.env.local` o apagar el proyecto. Para ver la base: Supabase → Table Editor.

## Pruebas automáticas

```bash
npm test
```

Cubre total, duplicados, cantidades, validación, filtro y cronograma. Resultado al 20/11/2026: **7 pruebas, 7 aprobadas** y `npm run build` correcto con Supabase.

La compilación de producción se verifica con:

```bash
npm run build
```
