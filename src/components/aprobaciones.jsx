import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  fotoDe,
  imagenDe,
  listarAnunciosAdmin,
  revisarAnuncioAdmin,
  suscribirseAnuncios,
} from "../api/anuncios.js";
import { CATEGORIAS } from "../api/configuracion.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";
import { motivoRechazoValido } from "../logica/validacion.js";
import { elemento, grupo, resaltado } from "../movimiento.js";
import Pagina from "./pagina.jsx";

const FILTROS = [
  { id: "pendiente", texto: "Pendientes" },
  { id: "aprobado", texto: "Aprobados" },
  { id: "rechazado", texto: "Rechazados" },
  { id: "todos", texto: "Todos" },
];

const TEXTO_ESTADO = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

function nombreCategoria(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id)?.nombre ?? id;
}

function fechaTexto(valor) {
  if (!valor) return "Fecha por definir";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export default function Aprobaciones({ token, setAviso }) {
  const [anuncios, setAnuncios] = useState([]);
  const [filtro, setFiltro] = useState("pendiente");
  const [motivos, setMotivos] = useState({});
  const [ocupado, setOcupado] = useState("");
  const [sinTabla, setSinTabla] = useState(false);

  useEffect(() => {
    let activo = true;
    listarAnunciosAdmin(token)
      .then((lista) => {
        if (activo) {
          setAnuncios(lista);
          setSinTabla(false);
        }
      })
      .catch(() => {
        if (activo) {
          setAnuncios([]);
          setSinTabla(true);
        }
      });
    return () => {
      activo = false;
    };
  }, [filtro, token]);

  useEffect(
    () =>
      suscribirseAnuncios(() => {
        listarAnunciosAdmin(token)
          .then((lista) => {
            setAnuncios(lista);
            setSinTabla(false);
          })
          .catch(() => {
            setAnuncios([]);
            setSinTabla(true);
          });
      }),
    [token],
  );

  const visibles = filtro === "todos" ? anuncios : anuncios.filter((anuncio) => anuncio.estado === filtro);
  const pendientes = anuncios.filter((anuncio) => anuncio.estado === "pendiente").length;

  function cambiarMotivo(id, valor) {
    setMotivos((actual) => ({ ...actual, [id]: valor }));
  }

  async function revisar(anuncio, estado) {
    const motivo = String(motivos[anuncio.id] ?? "").trim();
    if (estado === "rechazado" && !motivoRechazoValido(motivo)) {
      setAviso(MENSAJES.adminMotivo);
      return;
    }

    setOcupado(anuncio.id);
    try {
      await revisarAnuncioAdmin(token, anuncio.id, estado, motivo);
      setMotivos((actual) => ({ ...actual, [anuncio.id]: "" }));
      setAnuncios(await listarAnunciosAdmin(token));
      if (estado === "aprobado") setAviso(MENSAJES.anuncioAprobado);
      else if (estado === "rechazado") setAviso(MENSAJES.anuncioRechazado);
      else setAviso(MENSAJES.anuncioPendiente);
    } catch {
      setAviso(MENSAJES.falloGuardado);
    } finally {
      setOcupado("");
    }
  }

  return (
    <Pagina>
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">Panel de revisión</p>
          <h1>Aprobación de anuncios</h1>
          <p>Revisa lo que envían los proveedores. Solo lo aprobado aparece en el catálogo.</p>
        </div>
        <div className="titulo-acciones">
          <p className="contador">{pendientes} por revisar</p>
        </div>
      </header>

      {sinTabla && (
        <p className="aviso aviso-error revision-aviso">
          No se pudieron cargar los anuncios. Revisa que la función lumina-admin esté desplegada y que exista la tabla anuncios.
        </p>
      )}

      <div className="barra-filtros revision-filtros">
        {FILTROS.map((opcion) => (
          <motion.button
            key={opcion.id}
            type="button"
            className={`boton boton-secundario${filtro === opcion.id ? " activo" : ""}`}
            aria-pressed={filtro === opcion.id}
            onClick={() => setFiltro(opcion.id)}
            whileTap={{ scale: 0.97 }}
          >
            {filtro === opcion.id && (
              <motion.span
                className="filtro-fondo"
                layoutId="filtro-admin-anuncios"
                transition={resaltado.layout}
              />
            )}
            <span className="filtro-texto">{opcion.texto}</span>
          </motion.button>
        ))}
      </div>

      <div className="panel">
        <div className="anuncios-cabecera">
          <h2>Solicitudes</h2>
          <span>{visibles.length} anuncios</span>
        </div>

        {visibles.length === 0 ? (
          <p className="vacio-texto">No hay anuncios en esta lista por ahora.</p>
        ) : (
          <motion.div className="lista-anuncios" variants={grupo} initial="hidden" animate="show">
            {visibles.map((anuncio) => (
              <motion.article
                className={`anuncio-tarjeta revision-tarjeta estado-${anuncio.estado}`}
                key={anuncio.id}
                variants={elemento}
                layout
              >
                <img
                  src={fotoDe(anuncio.categoria)}
                  alt=""
                  onError={(evento) => {
                    evento.currentTarget.src = imagenDe(anuncio.categoria);
                  }}
                />
                <div>
                  <div className="revision-etiquetas">
                    <span className="etiqueta">{nombreCategoria(anuncio.categoria)}</span>
                    <span className={`estado-anuncio estado-${anuncio.estado}`}>
                      {TEXTO_ESTADO[anuncio.estado]}
                    </span>
                  </div>
                  {anuncio.negocio && <small className="anuncio-negocio">{anuncio.negocio}</small>}
                  <h3>{anuncio.nombre}</h3>
                  <p>{anuncio.descripcion || "Sin descripción."}</p>
                  <small className="revision-correo">
                    {anuncio.correo || "Sin correo"} · {fechaTexto(anuncio.creadoEn)}
                  </small>
                  {anuncio.estado === "rechazado" && anuncio.motivo && (
                    <p className="revision-motivo">Motivo: {anuncio.motivo}</p>
                  )}
                  {anuncio.estado !== "aprobado" && (
                    <label className="revision-motivo-campo">
                      Motivo por si se rechaza
                      <textarea
                        rows="2"
                        maxLength={200}
                        value={motivos[anuncio.id] ?? ""}
                        placeholder="Explica qué debe corregir."
                        onChange={(evento) => cambiarMotivo(anuncio.id, evento.target.value)}
                      />
                    </label>
                  )}
                  <div className="anuncio-pie">
                    <strong>{formatearMoneda(anuncio.precio)}</strong>
                  </div>
                  <div className="revision-acciones">
                    {anuncio.estado !== "aprobado" && (
                      <button
                        type="button"
                        className="boton"
                        disabled={Boolean(ocupado)}
                        onClick={() => revisar(anuncio, "aprobado")}
                      >
                        Aprobar
                      </button>
                    )}
                    {anuncio.estado !== "rechazado" && (
                      <button
                        type="button"
                        className="boton boton-secundario"
                        disabled={Boolean(ocupado)}
                        onClick={() => revisar(anuncio, "rechazado")}
                      >
                        Rechazar
                      </button>
                    )}
                    {anuncio.estado !== "pendiente" && (
                      <button
                        type="button"
                        className="boton-texto"
                        disabled={Boolean(ocupado)}
                        onClick={() => revisar(anuncio, "pendiente")}
                      >
                        Volver a pendiente
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </Pagina>
  );
}
