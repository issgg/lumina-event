import { useEffect, useRef, useState } from "react";

import { formatearMoneda } from "../logica/formato.js";

export default function TarjetaServicio({ servicio, agregado, onAgregar }) {
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const botonCerrar = useRef(null);
  const direccion = servicio.direccion?.trim();
  const capacidad = servicio.capacidad;

  useEffect(() => {
    if (!detalleAbierto) return;

    function cerrarConTecla(evento) {
      if (evento.key === "Escape") setDetalleAbierto(false);
    }

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", cerrarConTecla);
    botonCerrar.current?.focus();

    return () => {
      document.body.style.overflow = overflowOriginal;
      document.removeEventListener("keydown", cerrarConTecla);
    };
  }, [detalleAbierto]);

  function abrirDetalle() {
    setDetalleAbierto(true);
  }

  function agregarDesdeDetalle() {
    onAgregar(servicio);
    setDetalleAbierto(false);
  }

  return (
    <>
      <article className="tarjeta">
        <div
          className="tarjeta-clicable"
          role="button"
          tabIndex={0}
          onClick={abrirDetalle}
          onKeyDown={(evento) => {
            if (evento.key === "Enter" || evento.key === " ") {
              evento.preventDefault();
              abrirDetalle();
            }
          }}
          aria-label={`Ver detalles de ${servicio.nombre}`}
        >
          <figure className="tarjeta-imagen">
            <img src={servicio.imagen} alt={`Ilustración de ${servicio.nombre}`} loading="lazy" />
            <span className="tarjeta-ver">Ver detalle</span>
          </figure>
          <div className="tarjeta-cuerpo">
            <div className="tarjeta-cabecera">
              <h3>{servicio.nombre}</h3>
              <span className="categoria">{servicio.categoria}</span>
            </div>
            <p>{servicio.descripcion}</p>
            <p className="proveedor">{servicio.proveedor}</p>
            <p className="precio">{formatearMoneda(servicio.precio)}</p>
          </div>
        </div>
        <div className="tarjeta-accion">
          <button type="button" className="boton boton-tarjeta" onClick={() => onAgregar(servicio)} disabled={agregado}>
            {agregado ? "En tu evento" : "Agregar"}
          </button>
        </div>
      </article>

      {detalleAbierto && (
        <div className="modal-fondo" onClick={() => setDetalleAbierto(false)}>
          <div
            className="modal-tarjeta"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`detalle-${servicio.id}`}
            onClick={(evento) => evento.stopPropagation()}
          >
            <button
              type="button"
              className="modal-cerrar"
              aria-label="Cerrar detalle"
              ref={botonCerrar}
              onClick={() => setDetalleAbierto(false)}
            >
              ×
            </button>

            <div className="modal-imagen">
              <img src={servicio.imagen} alt={`Ilustración de ${servicio.nombre}`} />
            </div>

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
          </div>
        </div>
      )}
    </>
  );
}
