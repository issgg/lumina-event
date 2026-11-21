import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { cargarServicios } from "../api/catalogo.js";
import { formatearMoneda } from "../logica/formato.js";
import { seleccionarSalon } from "../logica/paquete.js";
import Guia from "./guia.jsx";

export default function Salon({ evento, onActualizar, setAviso }) {
  const navigate = useNavigate();
  const [orden, setOrden] = useState("recomendado");
  const [guardando, setGuardando] = useState("");
  const [avisoLocal, setAvisoLocal] = useState("");

  const salones = cargarServicios()
    .filter((servicio) => servicio.categoria === "salones")
    .sort((primero, segundo) => {
      if (orden === "precio") return Number(primero.precio) - Number(segundo.precio);
      if (orden === "capacidad") return Number(segundo.capacidad) - Number(primero.capacidad);
      return primero.nombre.localeCompare(segundo.nombre, "es");
    });

  const seleccionado = salones.find((salon) => salon.id === evento.salonId);
  const invitados = Number(evento.invitados) || 0;

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
    if (guardado) navigate("/catalogo");
    else setAviso("No se pudo guardar el salón. Intenta otra vez.");
  }

  return (
    <section className="pagina">
      <Guia paso={2} evento={evento} />

      <header className="titulo-pagina titulo-pagina-destacado">
        <div>
          <p className="etiqueta">Paso 02 · El lugar</p>
          <h1>Elige dónde va a suceder todo.</h1>
          <p>
            El salón define la ubicación principal del evento y aparecerá en tu resumen final. Revisa capacidad y
            precio antes de continuar.
          </p>
        </div>
        <div className="sello-paso" aria-hidden="true">
          <span>02</span>
          <small>Salón</small>
        </div>
      </header>

      <div className="barra-filtros salon-filtros">
        <label>
          Ordenar salones
          <select value={orden} onChange={(eventoCambio) => setOrden(eventoCambio.target.value)}>
            <option value="recomendado">Por nombre</option>
            <option value="precio">Menor precio primero</option>
            <option value="capacidad">Mayor capacidad primero</option>
          </select>
        </label>
        <p className="contador">
          {invitados > 0 ? `Buscando espacio para ${invitados} invitados` : "Define tus invitados para comparar capacidad"}
        </p>
      </div>

      {avisoLocal && <p className="aviso aviso-error">{avisoLocal}</p>}

      <div className="paneles salon-paneles">
        <div className="rejilla salon-rejilla">
          {salones.map((salon) => {
            const suffices = Number(salon.capacidad) >= invitados;
            const activo = seleccionado?.id === salon.id;
            return (
              <article key={salon.id} className={`salon-tarjeta ${activo ? "seleccionado" : ""}`}>
                <figure className="salon-imagen">
                  <img src={salon.imagen} alt={`Salón ${salon.nombre}`} loading="lazy" />
                  <span className={`salon-badge ${suffices ? "" : "alerta"}`}>
                    {suffices ? `Hasta ${salon.capacidad} personas` : `Capacidad ${salon.capacidad}`}
                  </span>
                </figure>
                <div className="salon-cuerpo">
                  <h2>{salon.nombre}</h2>
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
                  <button
                    type="button"
                    className={`boton ${activo ? "" : "boton-secundario"}`}
                    onClick={() => elegir(salon)}
                    disabled={!suffices || guardando === salon.id}
                  >
                    {guardando === salon.id
                      ? "Guardando…"
                      : activo
                        ? "Salón elegido"
                        : suffices
                          ? "Elegir este salón"
                          : "No alcanza para tus invitados"}
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
              : "Selecciona una opción para fijar la dirección y continuar con los servicios."}
          </p>
          <dl className="salon-resumen-datos">
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
            Continuar a servicios →
          </button>
          <Link className="boton-texto" to="/armador">
            Volver a los datos
          </Link>
        </aside>
      </div>
    </section>
  );
}
