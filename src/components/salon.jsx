import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";

import { cargarServicios } from "../api/catalogo.js";
import { CATEGORIAS, galeriaDe } from "../api/configuracion.js";
import { formatearMoneda } from "../logica/formato.js";
import { seleccionarSalon } from "../logica/paquete.js";
import { grupo, latido, numero } from "../movimiento.js";
import ModalDetalle from "./modalDetalle.jsx";
import Pagina from "./pagina.jsx";
import { useRevelados } from "../hooks/useCinematico.js";

const PRIMERA_CATEGORIA = CATEGORIAS.filter((item) => item.id !== "salones")[0].id;

export default function Salon({ evento, onActualizar, setAviso }) {
  const paginaRef = useRef(null);
  useRevelados(paginaRef);
  const navigate = useNavigate();
  const [orden, setOrden] = useState("recomendado");
  const [guardando, setGuardando] = useState("");
  const [avisoLocal, setAvisoLocal] = useState("");
  const [detalleSalon, setDetalleSalon] = useState(null);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const guardandoRef = useRef(false);

  const salones = cargarServicios()
    .filter((servicio) => servicio.categoria === "salones")
    .sort((primero, segundo) => {
      if (orden === "precio") return Number(primero.precio) - Number(segundo.precio);
      if (orden === "capacidad") return Number(segundo.capacidad) - Number(primero.capacidad);
      return primero.nombre.localeCompare(segundo.nombre, "es");
    });

  const seleccionado = salones.find((salon) => salon.id === evento.salonId);
  const salonDetalle = detalleSalon;
  const invitados = Number(evento.invitados) || 0;

  function abrirDetalle(salon) {
    setDetalleSalon(salon);
    setDetalleAbierto(true);
  }

  async function elegir(salon) {
    if (guardandoRef.current || seleccionado?.id === salon.id) return;

    if (Number(salon.capacidad) < invitados) {
      setAvisoLocal(`Este salón recibe hasta ${salon.capacidad} personas y tu evento tiene ${invitados}.`);
      return;
    }

    setAvisoLocal("");
    setGuardando(salon.id);
    guardandoRef.current = true;
    const actualizado = {
      ...evento,
      salonId: salon.id,
      detalles: seleccionarSalon(evento.detalles, salon),
    };
    try {
      const guardado = await onActualizar(actualizado, `Salón ${salon.nombre} elegido.`);
      if (guardado) {
        setDetalleAbierto(false);
        navigate(`/catalogo?categoria=${PRIMERA_CATEGORIA}`);
      } else {
        setAviso("No se pudo guardar el salón. Intenta otra vez.");
      }
    } finally {
      guardandoRef.current = false;
      setGuardando("");
    }
  }

  return (
    <Pagina ref={paginaRef}>
      <header className="titulo-pagina" data-reveal>
        <div>
          <p className="etiqueta">El lugar</p>
          <h1>Elige el salón de tu evento.</h1>
          <p>Revisa la capacidad y el precio. El salón aparecerá en tu resumen final.</p>
        </div>
        <div className="titulo-acciones">
          <Link className="boton boton-secundario" to="/armador">
            ← Regresar
          </Link>
          <button
            type="button"
            className="boton-texto"
            onClick={() => navigate(`/catalogo?categoria=${PRIMERA_CATEGORIA}`)}
          >
            Omitir salón
          </button>
        </div>
      </header>

      <div className="barra-filtros salon-filtros">
        <label>
          Ordenar
          <select value={orden} onChange={(eventoCambio) => setOrden(eventoCambio.target.value)}>
            <option value="recomendado">Por nombre</option>
            <option value="precio">Menor precio primero</option>
            <option value="capacidad">Mayor capacidad primero</option>
          </select>
        </label>
        <p className="contador">
          {invitados > 0 ? `Espacio para ${invitados} invitados` : "Define tus invitados para comparar capacidad"}
        </p>
      </div>

      {avisoLocal && <p className="aviso aviso-error">{avisoLocal}</p>}

      <div className="paneles salon-paneles" data-reveal>
        <motion.div className="rejilla salon-rejilla" variants={grupo} initial="hidden" animate="show">
          {salones.map((salon) => {
            const suffices = Number(salon.capacidad) >= invitados;
            const activo = seleccionado?.id === salon.id;
            return (
              <motion.article
                key={salon.id}
                className={`tarjeta salon-tarjeta ${activo ? "seleccionado" : ""}`}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0, scale: activo ? [1, 1.025, 1] : 1 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className="tarjeta-clicable"
                  role="button"
                  tabIndex={0}
                  onClick={() => abrirDetalle(salon)}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter" || evento.key === " ") {
                      evento.preventDefault();
                      abrirDetalle(salon);
                    }
                  }}
                  aria-labelledby={`salon-${salon.id}`}
                >
                  <figure className="tarjeta-imagen salon-imagen" style={{ backgroundImage: `url("${salon.imagen}")` }}>
                    <img src={salon.imagen} alt={`Salón ${salon.nombre}`} loading="lazy" />
                    <span className={`salon-badge ${suffices ? "" : "alerta"}`}>
                      {suffices ? `Hasta ${salon.capacidad} personas` : `Capacidad ${salon.capacidad}`}
                    </span>
                    <span className="tarjeta-ver">Ver detalle</span>
                    <AnimatePresence>
                      {activo && (
                        <motion.span className="salon-elegido" {...latido} exit={{ opacity: 0, scale: 0.8 }}>
                          ✓ Elegido
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </figure>
                  <div className="tarjeta-cuerpo salon-cuerpo">
                    <div className="tarjeta-cabecera">
                      <h2 id={`salon-${salon.id}`}>{salon.nombre}</h2>
                      <span className="categoria">Salón</span>
                    </div>
                    <p>{salon.direccion}</p>
                    <dl className="salon-datos">
                      <div>
                        <dt>Precio</dt>
                        <dd>{formatearMoneda(salon.precio)}</dd>
                      </div>
                      <div>
                        <dt>Proveedor</dt>
                        <dd>{salon.proveedor || "No indicado"}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div className="tarjeta-accion">
                  <button
                    type="button"
                    className={`boton boton-tarjeta ${activo ? "" : "boton-secundario"}`}
                    onClick={() => elegir(salon)}
                    disabled={activo || !suffices || guardando === salon.id}
                  >
                    {guardando === salon.id
                      ? "Guardando…"
                      : activo
                        ? "Salón elegido"
                        : suffices
                          ? "Elegir este salón"
                          : "Capacidad insuficiente"}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        <aside className="panel salon-resumen">
          <p className="etiqueta">Ubicación del evento</p>
          <motion.h2 key={seleccionado?.id ?? "vacio"} {...numero}>
            {seleccionado ? seleccionado.nombre : "Aún sin salón"}
          </motion.h2>
          <p className="subtitulo">
            {seleccionado
              ? seleccionado.direccion
              : "Elige una opción para fijar la dirección y continuar con los servicios."}
          </p>
          <dl className="nota-datos">
            <div>
              <dt>Invitados</dt>
              <dd>{invitados || "—"}</dd>
            </div>
            <div>
              <dt>Capacidad</dt>
              <dd>{seleccionado?.capacidad || "—"}</dd>
            </div>
            <div>
              <dt>Costo del salón</dt>
              <dd>{seleccionado ? formatearMoneda(seleccionado.precio) : "—"}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="boton boton-completo"
            onClick={() => navigate(`/catalogo?categoria=${PRIMERA_CATEGORIA}`)}
            disabled={!seleccionado}
          >
            Continuar a servicios
          </button>
          <button
            type="button"
            className="boton-texto"
            onClick={() => navigate(`/catalogo?categoria=${PRIMERA_CATEGORIA}`)}
          >
            Omitir salón y continuar
          </button>
        </aside>
      </div>

      <ModalDetalle
        abierto={detalleAbierto}
        onCerrar={() => setDetalleAbierto(false)}
        tituloId={`detalle-salon-${salonDetalle?.id}`}
        titulo={salonDetalle?.nombre ?? "salón"}
        galeria={salonDetalle ? galeriaDe(salonDetalle) : []}
      >
        {salonDetalle && (
          <>
            <div className="modal-contenido">
              <p className="etiqueta">Salón</p>
              <h2 id={`detalle-salon-${salonDetalle.id}`}>{salonDetalle.nombre}</h2>
              <p className="subtitulo">
                {salonDetalle.descripcion || "Sin descripción disponible para este salón."}
              </p>

              {avisoLocal && <p className="aviso aviso-error">{avisoLocal}</p>}

              <dl className="modal-datos">
                <div>
                  <dt>Precio</dt>
                  <dd>{formatearMoneda(salonDetalle.precio)}</dd>
                </div>
                <div>
                  <dt>Capacidad</dt>
                  <dd>{salonDetalle.capacidad} personas</dd>
                </div>
                <div>
                  <dt>Dirección</dt>
                  <dd>{salonDetalle.direccion || "No indicada"}</dd>
                </div>
                <div>
                  <dt>Proveedor</dt>
                  <dd>{salonDetalle.proveedor || "No indicado"}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>
                    {Number(salonDetalle.capacidad) >= invitados
                      ? "Disponible para tu evento"
                      : "Capacidad insuficiente"}
                  </dd>
                </div>
              </dl>

              <p className="modal-nota">
                {seleccionado?.id === salonDetalle.id
                  ? "Este salón ya está fijado como la ubicación principal de tu evento."
                  : "Al elegirlo, se guardará como la ubicación principal de tu evento."}
              </p>

              <div className="modal-acciones">
                <button
                  type="button"
                  className="boton"
                  onClick={() => elegir(salonDetalle)}
                  disabled={
                    seleccionado?.id === salonDetalle.id ||
                    Number(salonDetalle.capacidad) < invitados ||
                    guardando === salonDetalle.id
                  }
                >
                  {guardando === salonDetalle.id
                    ? "Guardando…"
                    : seleccionado?.id === salonDetalle.id
                      ? "Salón elegido"
                      : "Elegir este salón"}
                </button>
                <button type="button" className="boton boton-secundario" onClick={() => setDetalleAbierto(false)}>
                  Seguir comparando
                </button>
                <button
                  type="button"
                  className="boton-texto"
                  onClick={() => navigate(`/catalogo?categoria=${PRIMERA_CATEGORIA}`)}
                >
                  Omitir salón
                </button>
              </div>
            </div>
          </>
        )}
      </ModalDetalle>
    </Pagina>
  );
}
