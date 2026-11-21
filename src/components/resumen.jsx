import { useEffect, useState } from "react";
import { Link } from "react-router";

import { consultarCronograma, limpiarEvento } from "../api/baseDatos.js";
import { CATEGORIAS } from "../api/configuracion.js";
import { agruparPorCategoria, calcularTotal } from "../logica/carrito.js";
import { generarCronograma } from "../logica/cronograma.js";
import { eventoVacio } from "../logica/evento.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";
import { estadoPresupuesto, evaluarCobertura } from "../logica/paquete.js";
import Guia from "./guia.jsx";

export default function Resumen({ evento, onActualizar, setAviso }) {
  const [cronograma, setCronograma] = useState([]);
  const total = total;
  const presupuesto = estadoPresupuesto(evento.presupuesto, total);
  const cobertura = evaluarCobertura(evento.detalles);
  const nombreCategoria = (clave) => CATEGORIAS.find((item) => item.id === clave)?.nombre ?? clave;

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
      <Guia paso={4} evento={evento} />

      <header className="titulo-pagina titulo-pagina-destacado">
        <div>
          <p className="etiqueta">Paso 04 · La revisión</p>
          <h1>Todo tu evento, de un vistazo.</h1>
          <p>
            {evento.nombre || "Sin nombre"} · {evento.tipoEvento || "Tipo sin definir"} ·{" "}
            {evento.fecha || "Fecha sin definir"}
          </p>
        </div>
        <div className="acciones-hero">
          <Link className="boton" to="/pago">
            Simular compra →
          </Link>
          <button type="button" className="boton boton-secundario" onClick={() => onActualizar(evento, MENSAJES.guardado)}>
            Guardar
          </button>
          <button type="button" className="boton boton-peligro" onClick={reiniciar}>
            Reiniciar
          </button>
        </div>
      </header>

      <div className={`presupuesto-estado ${presupuesto.estado}`}>
        <span>
          {presupuesto.estado === "excedido"
            ? "Tu paquete supera el presupuesto"
            : presupuesto.estado === "sin-definir"
              ? "Presupuesto sin definir"
              : "Tu paquete está dentro del presupuesto"}
        </span>
        <strong>{formatearMoneda(presupuesto.diferencia)}</strong>
        <small>
          {presupuesto.estado === "excedido"
            ? "Vuelve al catálogo para ajustar servicios."
            : presupuesto.estado === "sin-definir"
              ? "Agrega un presupuesto en el paso 01 para comparar."
              : "Este es el margen que te queda para detalles."}
        </small>
      </div>

      <div className="resumen-metricas">
        <div className="metrica">
          <span>Servicios</span>
          <strong>{evento.detalles.length}</strong>
        </div>
        <div className="metrica">
          <span>Categorías</span>
          <strong>{agruparPorCategoria(evento.detalles).length}</strong>
        </div>
        <div className="metrica metrica-total">
          <span>Total final</span>
          <strong>{formatearMoneda(total)}</strong>
        </div>
      </div>

      <div className="panel cobertura-panel">
        <div className="cobertura-cabecera">
          <div>
            <p className="etiqueta">Lista de la ruta</p>
            <h2>Lo que ya está cubierto</h2>
          </div>
          <p className="contador">
            {cobertura.filter((item) => item.completo).length} de {cobertura.length} esenciales
          </p>
        </div>
        <ul className="cobertura-lista cobertura-lista-amplia">
          {cobertura.map((item) => (
            <li key={item.categoria} className={item.completo ? "completo" : "faltante"}>
              <span aria-hidden="true">{item.completo ? "✓" : "+"}</span>
              {nombreCategoria(item.categoria)}
            </li>
          ))}
        </ul>
      </div>

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
            <strong>{formatearMoneda(total)}</strong>
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
