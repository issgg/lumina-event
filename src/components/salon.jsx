import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import { cargarServicios } from "../api/catalogo.js";
import { formatearMoneda } from "../logica/formato.js";
import { seleccionarSalon } from "../logica/paquete.js";

export default function Salon({ evento, onActualizar, setAviso }) {
  const navigate = useNavigate();
  const [orden, setOrden] = useState("recomendado");
  const [guardando, setGuardando] = useState("");
  const [avisoLocal, setAvisoLocal] = useState("");
  const [detalleAbierto, setDetalleAbierto] = useState(null);
  const botonCerrar = useRef(null);

  const salones = cargarServicios()
    .filter((servicio) => servicio.categoria === "salones")
    .sort((primero, segundo) => {
      if (orden === "precio") return Number(primero.precio) - Number(segundo.precio);
      if (orden === "capacidad") return Number(segundo.capacidad) - Number(primero.capacidad);
      return primero.nombre.localeCompare(segundo.nombre, "es");
    });

  const seleccionado = salones.find((salon) => salon.id === evento.salonId);
  const salonDetalle = salones.find((salon) => salon.id === detalleAbierto);
  const invitados = Number(evento.invitados) || 0;

  useEffect(() => {
    if (!detalleAbierto) return;

    function cerrarConTecla(evento) {
      if (evento.key === "Escape") setDetalleAbierto(null);
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

  async function elegir(salon) {
    if (Number(salon.capacidad) < invitados) {
      setAvisoLocal(`Este salón recibe hasta ${salon.capacidad} personas y tu evento tiene ${invitados}.`);
      return;
    }

    setAvisoLocal("");
    setGuardando(salon.id);
    const actualizado = {
      ...evento,
      salonId: salon.id,
      detalles: seleccionarSalon(evento.detalles, salon),
    };
    const guardado = await onActualizar(actualizado, `Salón ${salon.nombre} elegido.`);
    setGuardando("");
    if (guardado) {
      setDetalleAbierto(null);
      navigate("/catalogo");
    } else {
      setAviso("No se pudo guardar el salón. Intenta otra vez.");
    }
  }

  return (
    <section className="pagina">
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">El lugar</p>
          <h1>Elige el salón de tu evento.</h1>
          <p>Revisa la capacidad y el precio. El salón aparecerá en tu resumen final.</p>
        </div>
        <div className="titulo-acciones">
          <Link className="boton-texto" to="/armador">
            Cambiar datos del evento
          </Link>
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

      <div className="paneles salon-paneles">
        <div className="rejilla salon-rejilla">
          {salones.map((salon) => {
            const suffices = Number(salon.capacidad) >= invitados;
            const activo = seleccionado?.id === salon.id;
            return (
              <article key={salon.id} className={`tarjeta salon-tarjeta ${activo ? "seleccionado" : ""}`}>
                <div
                  className="tarjeta-clicable"
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetalleAbierto(salon.id)}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter" || evento.key === " ") {
                      evento.preventDefault();
                      setDetalleAbierto(salon.id);
                    }
                  }}
                  aria-label={`Ver detalles del salón ${salon.nombre}`}
                >
                  <figure className="tarjeta-imagen salon-imagen">
                    <img src={salon.imagen} alt={`Salón ${salon.nombre}`} loading="lazy" />
                    <span className={`salon-badge ${suffices ? "" : "alerta"}`}>
                      {suffices ? `Hasta ${salon.capacidad} personas` : `Capacidad ${salon.capacidad}`}
                    </span>
                    <span className="tarjeta-ver">Ver detalle</span>
                  </figure>
                  <div className="tarjeta-cuerpo salon-cuerpo">
                    <div className="tarjeta-cabecera">
                      <h2>{salon.nombre}</h2>
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
                    disabled={!suffices || guardando === salon.id}
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
              </article>
            );
          })}
        </div>

        <aside className="panel salon-resumen">
          <p className="etiqueta">Ubicación del evento</p>
          <h2>{seleccionado ? seleccionado.nombre : "Aún sin salón"}</h2>
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
            onClick={() => navigate("/catalogo")}
            disabled={!seleccionado}
          >
            Continuar a servicios
          </button>
        </aside>
      </div>

      {salonDetalle && (
        <div className="modal-fondo" onClick={() => setDetalleAbierto(null)}>
          <div
            className="modal-tarjeta"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`detalle-salon-${salonDetalle.id}`}
            onClick={(evento) => evento.stopPropagation()}
          >
            <button
              type="button"
              className="modal-cerrar"
              aria-label="Cerrar detalle"
              ref={botonCerrar}
              onClick={() => setDetalleAbierto(null)}
            >
              ×
            </button>

            <div className="modal-imagen">
              <img src={salonDetalle.imagen} alt={`Salón ${salonDetalle.nombre}`} />
            </div>

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
                    Number(salonDetalle.capacidad) < invitados || guardando === salonDetalle.id
                  }
                >
                  {guardando === salonDetalle.id
                    ? "Guardando…"
                    : seleccionado?.id === salonDetalle.id
                      ? "Salón elegido"
                      : "Elegir este salón"}
                </button>
                <button type="button" className="boton boton-secundario" onClick={() => setDetalleAbierto(null)}>
                  Seguir comparando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
