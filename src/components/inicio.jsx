import { Link } from "react-router";

import { calcularTotal } from "../logica/carrito.js";
import { formatearMoneda } from "../logica/formato.js";
import Guia from "./guia.jsx";

const PASOS_DESTACADOS = [
  { numero: "01", titulo: "Datos y salón", texto: "Defines el evento y fijas la ubicación principal." },
  { numero: "02", titulo: "Paquete", texto: "Agregas servicios y ajustas cantidades desde el catálogo." },
  { numero: "03", titulo: "Cierre", texto: "Revisas desglose, cronograma y pago simulado." },
];

export default function Inicio({ evento = { detalles: [] } }) {
  const servicios = evento.detalles.length;
  const total = calcularTotal(evento.detalles);
  const progreso = Math.min(100, Math.max(8, servicios * 14));

  return (
    <section className="pagina inicio-pagina">
      <Guia paso={1} evento={evento} />

      <div className="hero">
        <div className="hero-texto">
          <p className="etiqueta">Estudio de eventos</p>
          <h1>
            Tu evento, <em>pieza por pieza.</em>
          </h1>
          <p className="subtitulo">
            No solo guardamos tu paquete: te guiamos desde los primeros datos hasta el pago simulado, con desglose,
            presupuesto y cronograma.
          </p>
          <div className="acciones-hero">
            <Link className="boton" to="/armador">
              Empezar la ruta <span aria-hidden="true">→</span>
            </Link>
            <Link className="boton boton-secundario" to="/catalogo">
              Ver catálogo
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
            <li>Ver el pago simulado</li>
          </ul>
        </div>
      </div>

      <div className="pasos-destacados">
        <div className="pasos-destacados-cabecera">
          <p className="etiqueta">Cómo funciona</p>
          <h2>Una ruta clara, sin perderte.</h2>
        </div>
        <div className="pasos-grid">
          {PASOS_DESTACADOS.map((paso) => (
            <article key={paso.numero} className="paso-destacado">
              <span aria-hidden="true">{paso.numero}</span>
              <h3>{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
