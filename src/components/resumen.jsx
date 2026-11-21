import { useEffect, useState } from "react";

import { consultarCronograma, limpiarEvento } from "../api/baseDatos.js";
import { agruparPorCategoria, calcularTotal } from "../logica/carrito.js";
import { generarCronograma } from "../logica/cronograma.js";
import { eventoVacio } from "../logica/evento.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";

export default function Resumen({ evento, onActualizar, setAviso }) {
  const [cronograma, setCronograma] = useState([]);

  useEffect(() => {
    const guardado = consultarCronograma();
    setCronograma(guardado.length ? guardado : generarCronograma(evento.detalles, evento.horaInicio));
  }, [evento]);

  async function reiniciar() {
    try {
      await limpiarEvento();
      onActualizar(eventoVacio(), "Evento reiniciado.", false);
    } catch {
      setAviso(MENSAJES.falloGuardado);
    }
  }

  return (
    <section className="pagina">
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">Paso 3</p>
          <h1>Resumen del evento</h1>
          <p>{evento.nombre || "Sin nombre"} · {evento.tipoEvento || "Tipo sin definir"} · {evento.fecha || "Fecha sin definir"}</p>
        </div>
        <div className="acciones-hero">
          <button type="button" className="boton" onClick={() => onActualizar(evento, MENSAJES.guardado)}>
            Guardar en la base
          </button>
          <button type="button" className="boton boton-peligro" onClick={reiniciar}>
            Reiniciar
          </button>
        </div>
      </header>

      <div className="panel">
        <h2>Servicios seleccionados</h2>
        <Tabla
          columnas={["Servicio", "Categoría", "Cantidad", "Subtotal"]}
          filas={evento.detalles.map((item) => [
            item.nombre,
            item.categoria,
            item.cantidad,
            formatearMoneda(item.precioUnitario * item.cantidad),
          ])}
          mensajeVacio={MENSAJES.listaVacia}
        />
      </div>

      <div className="paneles">
        <div className="panel">
          <h2>Subtotales por categoría</h2>
          <Tabla
            columnas={["Categoría", "Cantidad", "Subtotal"]}
            filas={agruparPorCategoria(evento.detalles).map((grupo) => [
              grupo.categoria,
              grupo.cantidad,
              formatearMoneda(grupo.subtotal),
            ])}
            mensajeVacio="Aún no hay categorías."
          />
          <div className="total">
            <span>Total final</span>
            <strong>{formatearMoneda(calcularTotal(evento.detalles))}</strong>
          </div>
        </div>

        <div className="panel">
          <h2>Cronograma</h2>
          <Tabla
            columnas={["Hora", "Actividad", "Descripción"]}
            filas={cronograma.map((item) => [item.hora, item.actividad, item.descripcion])}
            mensajeVacio="Guarda el evento para generar el cronograma."
          />
        </div>
      </div>
    </section>
  );
}

function Tabla({ columnas, filas, mensajeVacio }) {
  if (filas.length === 0) return <p className="vacio-texto">{mensajeVacio}</p>;

  return (
    <div className="tabla-contenedor">
      <table>
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th key={columna} scope="col">
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, indice) => (
            <tr key={indice}>
              {fila.map((celda, posicion) => (
                <td key={posicion}>{celda}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
