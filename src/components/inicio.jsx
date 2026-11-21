import { Link } from "react-router";

import { calcularTotal } from "../logica/carrito.js";
import { formatearMoneda } from "../logica/formato.js";

export default function Inicio({ evento = { detalles: [] } }) {
  const servicios = evento.detalles.length;
  const total = calcularTotal(evento.detalles);
  const progreso = Math.min(100, Math.max(8, servicios * 14));

  return (
    <section className="hero">
      <div className="hero-texto">
        <p className="etiqueta">Estudio de eventos</p>
        <h1>
          Tu evento, <em>pieza por pieza.</em>
        </h1>
        <p className="subtitulo">
          Elige el lugar, suma servicios y mira cómo toma forma el presupuesto. Guarda el avance y vuelve a él cuando
          quieras.
        </p>
        <div className="acciones-hero">
          <Link className="boton" to="/catalogo">
            Explorar catálogo <span aria-hidden="true">→</span>
          </Link>
          <Link className="boton boton-secundario" to="/armador">
            Ver mi evento
          </Link>
        </div>
      </div>

      <div className="hero-tarjeta" aria-label="Resumen del evento">
        <div className="hero-tarjeta-top">
          <span className="hero-punto"></span>
          <span>Ficha 01</span>
          <span className="hero-estado">Borrador</span>
        </div>
        <h2>{evento.nombre || "Tu celebración"}</h2>
        <div className="hero-progreso" aria-hidden="true">
          <span style={{ width: `${progreso}%` }}></span>
        </div>
        <div className="hero-mini-grid">
          <div className="hero-mini">
            <small>Servicios</small>
            <strong>{servicios}</strong>
          </div>
          <div className="hero-mini">
            <small>Categorías</small>
            <strong>{new Set(evento.detalles.map((item) => item.categoria)).size}</strong>
          </div>
          <div className="hero-mini">
            <small>Total estimado</small>
            <strong>{formatearMoneda(total)}</strong>
          </div>
          <div className="hero-mini">
            <small>Invitados</small>
            <strong>{evento.invitados || "—"}</strong>
          </div>
        </div>
        <ul>
          <li>Elegir servicios por categoría</li>
          <li>Ajustar cantidades y total</li>
          <li>Revisar el cronograma</li>
          <li>Guardar el borrador</li>
        </ul>
      </div>
    </section>
  );
}
