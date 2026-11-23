import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

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
import { elemento, grupo, transicion } from "../movimiento.js";
import Pagina from "./pagina.jsx";
import { useRevelados } from "../hooks/useCinematico.js";

const Paso = motion.create(Link);

function nombreCategoria(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id)?.nombre ?? id;
}

export default function Inicio({ evento = { detalles: [] }, sesion }) {
  const paginaRef = useRef(null);
  useRevelados(paginaRef);
  const servicios = evento.detalles.length;
  const total = calcularTotal(evento.detalles);
  const [recomendados, setRecomendados] = useState([]);
  const [ultimaCompra, setUltimaCompra] = useState(null);
  const reducirMovimiento = useReducedMotion();
  const inclinacionX = useMotionValue(0);
  const inclinacionY = useMotionValue(0);
  const rotarX = useSpring(useTransform(inclinacionY, [-0.5, 0.5], [7, -7]), { stiffness: 180, damping: 20 });
  const rotarY = useSpring(useTransform(inclinacionX, [-0.5, 0.5], [-8, 8]), { stiffness: 180, damping: 20 });

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
    <Pagina className="inicio-pagina" ref={paginaRef}>
      <div className="portada">
        <div className="portada-video" aria-hidden="true">
          <video autoPlay muted loop playsInline preload="auto" poster="/hero-poster.jpg">
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <span className="portada-velo portada-velo-lateral" />
          <span className="portada-velo portada-velo-inferior" />
          <span className="portada-velo portada-velo-grano" />
        </div>

        <motion.div className="portada-texto" data-hero variants={grupo} initial="hidden" animate="show">
          <motion.p className="etiqueta" variants={elemento}>
            Lumina Event · Estudio de celebraciones
          </motion.p>
          <motion.h1 variants={elemento}>
            Tu celebración, <em>en un solo lugar.</em>
          </motion.h1>
          <motion.p className="subtitulo" variants={elemento}>
            Elige el salón, agrega los servicios y mira cómo queda tu paquete antes de pagar.
          </motion.p>
          <motion.div className="acciones-principales acciones-hero" variants={elemento}>
            <Link className="boton" to="/armador">
              Empezar mi evento <span aria-hidden="true">→</span>
            </Link>
            <Link className="boton boton-secundario" to="/catalogo">
              Explorar catálogo
            </Link>
          </motion.div>
          <motion.p className="portada-ayuda" variants={elemento}>
            Guarda lo que lleves y continua cuando quieras.
          </motion.p>
        </motion.div>

        <motion.aside
          className="portada-tarjeta"
          aria-label="Resumen del evento"
          initial={{ opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { ...transicion, delay: 0.12 } }}
          whileHover={{ y: -8 }}
          onMouseMove={(evento) => {
            if (reducirMovimiento) return;
            const rect = evento.currentTarget.getBoundingClientRect();
            inclinacionX.set((evento.clientX - rect.left) / rect.width - 0.5);
            inclinacionY.set((evento.clientY - rect.top) / rect.height - 0.5);
          }}
          onMouseLeave={() => {
            inclinacionX.set(0);
            inclinacionY.set(0);
          }}
          style={reducirMovimiento ? undefined : { rotateX: rotarX, rotateY: rotarY, transformPerspective: 1000 }}
        >
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
        </motion.aside>
      </div>

      <div className="inicio-resumen" data-reveal>
        <div>
          <p className="etiqueta">Así funciona</p>
          <h2>Lo esencial, sin rodeos.</h2>
        </div>
        <motion.nav className="inicio-pasos" aria-label="Comenzar" data-reveal variants={grupo} initial="hidden" animate="show">
          <Paso className="paso" to="/armador" variants={elemento} whileHover={{ y: -6 }}>
            <span>01</span>
            <strong>Cuenta tu evento</strong>
            <small>Fecha, invitados y presupuesto</small>
          </Paso>
          <Paso className="paso" to="/salon" variants={elemento} whileHover={{ y: -6 }}>
            <span>02</span>
            <strong>Elige el salón</strong>
            <small>Espacios con capacidad y horarios</small>
          </Paso>
          <Paso className="paso" to="/catalogo" variants={elemento} whileHover={{ y: -6 }}>
            <span>03</span>
            <strong>Arma tu paquete</strong>
            <small>Servicios, total y cronograma</small>
          </Paso>
        </motion.nav>
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
          <motion.div className="lista-anuncios" variants={grupo} initial="hidden" animate="show">
            {recomendados.map((anuncio) => (
              <motion.article className="anuncio-tarjeta" key={anuncio.id} variants={elemento} whileHover={{ y: -5 }}>
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
              </motion.article>
            ))}
          </motion.div>
        </section>
      )}
    </Pagina>
  );
}
