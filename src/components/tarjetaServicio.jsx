import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { galeriaDe } from "../api/configuracion.js";
import { formatearMoneda } from "../logica/formato.js";
import { latido } from "../movimiento.js";
import ModalDetalle from "./modalDetalle.jsx";

export default function TarjetaServicio({ servicio, agregado, onAgregar }) {
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const direccion = servicio.direccion?.trim();
  const capacidad = servicio.capacidad;

  function agregarDesdeDetalle() {
    onAgregar(servicio);
    setDetalleAbierto(false);
  }

  return (
    <>
      <motion.article
        className={`tarjeta ${agregado ? "agregada" : ""}`}
        layout
        whileHover={{ y: -6 }}
        animate={agregado ? { scale: [1, 1.035, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div
          className="tarjeta-clicable"
          role="button"
          tabIndex={0}
          onClick={() => setDetalleAbierto(true)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
              evento.preventDefault();
              setDetalleAbierto(true);
            }
          }}
          aria-labelledby={`servicio-${servicio.id}`}
        >
          <figure className="tarjeta-imagen" style={{ backgroundImage: `url("${servicio.imagen}")` }}>
            <img src={servicio.imagen} alt={`Ilustración de ${servicio.nombre}`} loading="lazy" />
            <span className="tarjeta-ver">Ver detalle</span>
            <AnimatePresence>
              {agregado && (
                <motion.span className="tarjeta-agregado" {...latido} exit={{ opacity: 0, scale: 0.8 }}>
                  ✓ En tu paquete
                </motion.span>
              )}
            </AnimatePresence>
          </figure>
          <div className="tarjeta-cuerpo">
            <div className="tarjeta-cabecera">
              <h3 id={`servicio-${servicio.id}`}>{servicio.nombre}</h3>
              <span className="categoria">{servicio.categoria}</span>
            </div>
            <p>{servicio.descripcion}</p>
            <p className="proveedor">{servicio.proveedor}</p>
            <p className="precio">{formatearMoneda(servicio.precio)}</p>
          </div>
        </div>
        <div className="tarjeta-accion">
          <motion.button
            type="button"
            className="boton boton-tarjeta"
            onClick={() => onAgregar(servicio)}
            disabled={agregado}
            whileTap={{ scale: 0.97 }}
          >
            {agregado ? "En tu evento" : "Agregar"}
          </motion.button>
        </div>
      </motion.article>

      <ModalDetalle
        abierto={detalleAbierto}
        onCerrar={() => setDetalleAbierto(false)}
        tituloId={`detalle-${servicio.id}`}
        titulo={servicio.nombre}
        galeria={galeriaDe(servicio)}
      >
        <div className="modal-contenido">
          <p className="etiqueta">{servicio.categoria}</p>
          <h2 id={`detalle-${servicio.id}`}>{servicio.nombre}</h2>
          <p className="subtitulo">
            {servicio.descripcion || "Sin descripción disponible para esta opción."}
          </p>

          <dl className="modal-datos">
            <div>
              <dt>Precio por unidad</dt>
              <dd>{formatearMoneda(servicio.precio)}</dd>
            </div>
            <div>
              <dt>Proveedor</dt>
              <dd>{servicio.proveedor || "No indicado"}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>En catálogo</dd>
            </div>
            {direccion && (
              <div>
                <dt>Dirección</dt>
                <dd>{direccion}</dd>
              </div>
            )}
            {capacidad !== "" && capacidad !== undefined && capacidad !== null && (
              <div>
                <dt>Capacidad</dt>
                <dd>{capacidad} personas</dd>
              </div>
            )}
          </dl>

          <p className="modal-nota">
            Se agregará con cantidad 1 y podrás ajustarla después en el armador del evento.
          </p>

          <div className="modal-acciones">
            <button type="button" className="boton" onClick={agregarDesdeDetalle} disabled={agregado}>
              {agregado ? "Ya está en tu evento" : "Agregar a mi evento"}
            </button>
            <button type="button" className="boton boton-secundario" onClick={() => setDetalleAbierto(false)}>
              Seguir explorando
            </button>
          </div>
        </div>
      </ModalDetalle>
    </>
  );
}
