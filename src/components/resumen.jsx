import { useEffect, useState } from "react";
import { Link } from "react-router";

import { cargarServicios } from "../api/catalogo.js";
import { consultarCronograma, limpiarEvento } from "../api/baseDatos.js";
import { CATEGORIAS } from "../api/configuracion.js";
import { agruparPorCategoria, calcularTotal } from "../logica/carrito.js";
import { generarCronograma } from "../logica/cronograma.js";
import { eventoVacio } from "../logica/evento.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";
import { estadoPresupuesto, evaluarCobertura } from "../logica/paquete.js";

export default function Resumen({ sesion, evento, onActualizar, setAviso }) {
  const [cronograma, setCronograma] = useState([]);
  const total = calcularTotal(evento.detalles);
  const presupuesto = estadoPresupuesto(evento.presupuesto, total);
  const cobertura = evaluarCobertura(evento.detalles);
  const grupos = agruparPorCategoria(evento.detalles);
  const salon = cargarServicios().find((servicio) => servicio.id === evento.salonId);
  const cubiertas = cobertura.filter((item) => item.completo).length;
  const faltantes = cobertura.filter((item) => !item.completo).map((item) => nombreCategoria(item.categoria));

  useEffect(() => {
    let activo = true;
    consultarCronograma(sesion)
      .then((guardado) => {
        if (activo) {
          setCronograma(guardado.length ? guardado : generarCronograma(evento.detalles, evento.horaInicio));
        }
      })
      .catch(() => {
        if (activo) setCronograma(generarCronograma(evento.detalles, evento.horaInicio));
      });
    return () => {
      activo = false;
    };
  }, [sesion, evento]);

  async function reiniciar() {
    try {
      await limpiarEvento(sesion);
      onActualizar(eventoVacio(), "Evento reiniciado.", false);
    } catch {
      setAviso(MENSAJES.falloGuardado);
    }
  }

  return (
    <section className="pagina">
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">Mi paquete</p>
          <h1>Revisa tu evento antes de pagar.</h1>
          <p>
            {evento.nombre || "Sin nombre"} · {evento.tipoEvento || "Tipo sin definir"} ·{" "}
            {evento.fecha || "Fecha sin definir"}
          </p>
        </div>
        <div className="acciones-principales">
          <Link className="boton" to="/pago">
            Simular compra <span aria-hidden="true">→</span>
          </Link>
          <Link className="boton-texto" to="/catalogo">
            Ajustar servicios
          </Link>
          <button type="button" className="boton-texto" onClick={() => onActualizar(evento, MENSAJES.guardado)}>
            Guardar
          </button>
          <button type="button" className="boton-texto" onClick={reiniciar}>
            Reiniciar
          </button>
        </div>
      </header>

      <div className="resumen-metricas">
        <div className="metrica">
          <span>Servicios</span>
          <strong>{evento.detalles.length}</strong>
        </div>
        <div className="metrica">
          <span>Ubicación</span>
          <strong>{salon?.nombre || "Salón por definir"}</strong>
        </div>
        <div className="metrica metrica-total">
          <span>Total estimado</span>
          <strong>{formatearMoneda(total)}</strong>
        </div>
      </div>

      <div className="resumen-notas">
        <p className={`nota-linea ${presupuesto.estado}`}>
          <strong>Presupuesto:</strong>{" "}
          {presupuesto.estado === "sin-definir"
            ? "Agrega un presupuesto en Datos del evento para comparar."
            : presupuesto.estado === "excedido"
              ? `Tu paquete supera el presupuesto por ${formatearMoneda(presupuesto.diferencia)}.`
              : `Te quedan ${formatearMoneda(presupuesto.diferencia)} dentro de tu presupuesto.`}
        </p>
        <p className="nota-linea">
          <strong>Cobertura:</strong> {cubiertas} de {cobertura.length} esenciales
          {faltantes.length ? ` · Faltan ${faltantes.join(", ")}` : " · Todo cubierto"}
        </p>
      </div>

      <div className="paneles resumen-paneles">
        <div className="panel">
          <h2>Lo que contrataste</h2>
          <Tabla
            columnas={["Servicio", "Categoría", "Cantidad", "Subtotal"]}
            filas={evento.detalles.map((item) => [
              item.nombre,
              nombreCategoria(item.categoria),
              item.cantidad,
              formatearMoneda(item.precioUnitario * item.cantidad),
            ])}
            mensajeVacio={MENSAJES.listaVacia}
          />
        </div>

        <div className="panel">
          <h2>Desglose por categoría</h2>
          <Tabla
            columnas={["Categoría", "Cantidad", "Subtotal"]}
            filas={grupos.map((grupo) => [
              nombreCategoria(grupo.categoria),
              grupo.cantidad,
              formatearMoneda(grupo.subtotal),
            ])}
            mensajeVacio="Aún no hay categorías."
          />
        </div>

        <div className="panel">
          <h2>Cómo se acomoda</h2>
          <Tabla
            columnas={["Hora", "Actividad", "Descripción"]}
            filas={cronograma.map((item) => [item.hora, item.actividad, item.descripcion])}
            mensajeVacio="Guarda el evento para generar el cronograma."
          />
        </div>
      </div>

      <div className="resumen-cierre">
        <div>
          <span>Total final</span>
          <strong>{formatearMoneda(total)}</strong>
        </div>
        <Link className="boton" to="/pago">
          Simular compra <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

function nombreCategoria(clave) {
  return CATEGORIAS.find((item) => item.id === clave)?.nombre ?? clave;
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
