import { Link } from "react-router";

import { calcularTotal } from "../logica/carrito.js";
import { formatearMoneda } from "../logica/formato.js";

export default function Inicio({ evento = { detalles: [] } }) {
  const servicios = evento.detalles.length;
  const total = calcularTotal(evento.detalles);

  return (
    <section className="pagina inicio-pagina">
      <div className="portada">
        <div className="portada-texto">
          <p className="etiqueta">Planea tu evento</p>
          <h1>
            Tu celebración, <em>en un solo lugar.</em>
          </h1>
          <p className="subtitulo">
            Elige el salón, agrega los servicios y mira cómo queda tu paquete antes de pagar.
          </p>
          <div className="acciones-principales">
            <Link className="boton" to="/armador">
              Empezar mi evento <span aria-hidden="true">→</span>
            </Link>
            <Link className="boton boton-secundario" to="/catalogo">
              Explorar catálogo
            </Link>
          </div>
          <p className="portada-ayuda">Guarda lo que lleves y continua cuando quieras.</p>
        </div>

        <aside className="portada-tarjeta" aria-label="Resumen del evento">
          <p className="etiqueta">Tu evento</p>
          <h2>{evento.nombre || "Aún sin nombre"}</h2>
          <p className="portada-detalle">
            {evento.tipoEvento || "Tipo por definir"} · {evento.fecha || "Fecha por definir"}
          </p>
          <dl className="portada-datos">
            <div>
              <dt>Invitados</dt>
              <dd>{evento.invitados || "—"}</dd>
            </div>
            <div>
              <dt>Servicios</dt>
              <dd>{servicios}</dd>
            </div>
            <div>
              <dt>Total estimado</dt>
              <dd>{formatearMoneda(total)}</dd>
            </div>
          </dl>
          <Link className="boton-texto" to={servicios ? "/resumen" : "/armador"}>
            {servicios ? "Ver mi paquete" : "Comenzar con los datos"}
          </Link>
        </aside>
      </div>

      <div className="inicio-resumen">
        <div>
          <p className="etiqueta">Así funciona</p>
          <h2>Lo esencial, sin rodeos.</h2>
        </div>
        <div className="inicio-pasos">
          <p>Cuenta tu evento</p>
          <p>Elige el salón</p>
          <p>Arma y revisa tu paquete</p>
        </div>
      </div>
    </section>
  );
}
