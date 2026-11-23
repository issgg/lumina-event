import { useEffect, useState } from "react";
import { Link } from "react-router";

import {
  fotoDe,
  imagenDe,
  leerAnunciosAprobados,
  suscribirseAnuncios,
} from "../api/anuncios.js";
import { listarMisCompras, suscribirseCompras } from "../api/compras.js";
import { CATEGORIAS, TEXTO_ESTADO_COMPRA } from "../api/configuracion.js";
import { calcularTotal } from "../logica/carrito.js";
import { formatearMoneda } from "../logica/formato.js";

function nombreCategoria(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id)?.nombre ?? id;
}

export default function Inicio({ evento = { detalles: [] }, sesion }) {
  const servicios = evento.detalles.length;
  const total = calcularTotal(evento.detalles);
  const [recomendados, setRecomendados] = useState([]);
  const [ultimaCompra, setUltimaCompra] = useState(null);

  useEffect(() => {
    let activo = true;
    const cargar = () => {
      leerAnunciosAprobados()
        .then((lista) => {
          if (activo) setRecomendados(lista.slice(0, 3));
        })
        .catch(() => {
          if (activo) setRecomendados([]);
        });
    };
    cargar();
    const cancelar = suscribirseAnuncios(cargar);
    return () => {
      activo = false;
      cancelar();
    };
  }, []);

  useEffect(() => {
    if (!sesion?.access_token) return undefined;
    let activo = true;
    const cargar = () => {
      listarMisCompras(sesion.access_token)
        .then((lista) => {
          if (activo) setUltimaCompra(lista[0] ?? null);
        })
        .catch(() => {
          if (activo) setUltimaCompra(null);
        });
    };
    cargar();
    const cancelar = suscribirseCompras(cargar);
    return () => {
      activo = false;
      cancelar();
    };
  }, [sesion?.access_token]);

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
          {ultimaCompra && (
            <p className={`portada-compra estado-${ultimaCompra.estado}`}>
              Última compra · {ultimaCompra.referencia || ultimaCompra.id} ·{" "}
              <strong>{TEXTO_ESTADO_COMPRA[ultimaCompra.estado] ?? "Pendiente de aprobación"}</strong>
            </p>
          )}
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
          <nav className="inicio-pasos" aria-label="Comenzar">
            <Link className="paso" to="/armador">
              <span>01</span>
              <strong>Cuenta tu evento</strong>
              <small>Fecha, invitados y presupuesto</small>
            </Link>
            <Link className="paso" to="/salon">
              <span>02</span>
              <strong>Elige el salón</strong>
              <small>Espacios con capacidad y horarios</small>
            </Link>
            <Link className="paso" to="/catalogo">
              <span>03</span>
              <strong>Arma tu paquete</strong>
              <small>Servicios, total y cronograma</small>
            </Link>
          </nav>
        </div>

      {recomendados.length > 0 && (
        <section className="recomendados">
          <div className="anuncios-cabecera">
            <div>
              <p className="etiqueta">Recomendados para ti</p>
              <h2>Ideas aprobadas por nuestro equipo</h2>
            </div>
            <Link className="boton-texto" to="/catalogo">
              Ver catálogo
            </Link>
          </div>
          <div className="lista-anuncios">
            {recomendados.map((anuncio) => (
              <article className="anuncio-tarjeta" key={anuncio.id}>
                <img
                  src={fotoDe(anuncio.categoria)}
                  alt=""
                  onError={(evento) => {
                    evento.currentTarget.src = imagenDe(anuncio.categoria);
                  }}
                />
                <div>
                  <span className="etiqueta">{nombreCategoria(anuncio.categoria)}</span>
                  {anuncio.negocio && <small className="anuncio-negocio">{anuncio.negocio}</small>}
                  <h3>{anuncio.nombre}</h3>
                  <p>{anuncio.descripcion || "Sin descripción."}</p>
                  <div className="anuncio-pie">
                    <strong>{formatearMoneda(anuncio.precio)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
