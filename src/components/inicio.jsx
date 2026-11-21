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
        <p className="etiqueta">Planeador de eventos</p>
        <h1>
          Tu evento, <span>pieza por pieza.</span>
        </h1>
        <p className="subtitulo">
          Elige un salón, agrega servicios, calcula el total y obtén un cronograma inicial. Todo queda guardado en
          Supabase para que puedas retomarlo cuando quieras.
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

      <div className="hero-tarjeta" aria-label="Resumen del sistema">
        <div className="hero-tarjeta-top">
          <span className="hero-punto"></span>
          <span>Evento en curso</span>
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
          <li>Catálogo por categoría y búsqueda</li>
          <li>Carrito con cantidades y total</li>
          <li>Formulario con validación</li>
          <li>Cronograma y resumen final</li>
        </ul>
      </div>
    </section>
  );
}
