import { useEffect, useState } from "react";

import { listarComprasAdmin, revisarCompraAdmin, suscribirseCompras } from "../api/compras.js";
import { TEXTO_ESTADO_COMPRA } from "../api/configuracion.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";
import { motivoRechazoValido } from "../logica/validacion.js";

const FILTROS = [
  { id: "pendiente", texto: "Pendientes" },
  { id: "aprobado", texto: "Confirmadas" },
  { id: "rechazado", texto: "Rechazadas" },
  { id: "todos", texto: "Todas" },
];

function fechaTexto(valor) {
  if (!valor) return "Fecha por definir";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

function instanciaDe(compra) {
  return compra.instancia && typeof compra.instancia === "object" ? compra.instancia : {};
}

export default function Compras({ token, setAviso }) {
  const [compras, setCompras] = useState([]);
  const [filtro, setFiltro] = useState("pendiente");
  const [motivos, setMotivos] = useState({});
  const [ocupado, setOcupado] = useState("");
  const [sinTabla, setSinTabla] = useState(false);

  useEffect(() => {
    let activo = true;
    listarComprasAdmin(token)
      .then((lista) => {
        if (activo) {
          setCompras(lista);
          setSinTabla(false);
        }
      })
      .catch(() => {
        if (activo) {
          setCompras([]);
          setSinTabla(true);
        }
      });
    return () => {
      activo = false;
    };
  }, [token]);

  useEffect(
    () =>
      suscribirseCompras(() => {
        listarComprasAdmin(token)
          .then((lista) => {
            setCompras(lista);
            setSinTabla(false);
          })
          .catch(() => {
            setCompras([]);
            setSinTabla(true);
          });
      }),
    [token],
  );

  const visibles = filtro === "todos" ? compras : compras.filter((compra) => compra.estado === filtro);
  const pendientes = compras.filter((compra) => compra.estado === "pendiente").length;

  function cambiarMotivo(id, valor) {
    setMotivos((actual) => ({ ...actual, [id]: valor }));
  }

  async function revisar(compra, estado) {
    const motivo = String(motivos[compra.id] ?? "").trim();
    if (estado === "rechazado" && !motivoRechazoValido(motivo)) {
      setAviso(MENSAJES.compraMotivo);
      return;
    }

    setOcupado(compra.id);
    try {
      await revisarCompraAdmin(token, compra.id, estado, motivo);
      setMotivos((actual) => ({ ...actual, [compra.id]: "" }));
      setCompras(await listarComprasAdmin(token));
      if (estado === "aprobado") setAviso(MENSAJES.compraAprobada);
      else if (estado === "rechazado") setAviso(MENSAJES.compraRechazada);
      else setAviso(MENSAJES.compraPendiente);
    } catch {
      setAviso(MENSAJES.compraRevisionFallida);
    } finally {
      setOcupado("");
    }
  }

  return (
    <section className="pagina">
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">Panel de compras</p>
          <h1>Aprobación de compras</h1>
          <p>
            Las compras llegan pendientes. Solo cuando las apruebes quedarán confirmadas para el cliente.
          </p>
        </div>
        <div className="titulo-acciones">
          <p className="contador">{pendientes} por revisar</p>
        </div>
      </header>

      {sinTabla && (
        <p className="aviso aviso-error revision-aviso">
          No se pudieron cargar las compras. Revisa que la función lumina-admin esté desplegada y que exista la tabla compras.
        </p>
      )}

      <div className="barra-filtros revision-filtros">
        {FILTROS.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            className={`boton boton-secundario${filtro === opcion.id ? " activo" : ""}`}
            aria-pressed={filtro === opcion.id}
            onClick={() => setFiltro(opcion.id)}
          >
            {opcion.texto}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="anuncios-cabecera">
          <h2>Compras recientes</h2>
          <span>{visibles.length} compras</span>
        </div>

        {visibles.length === 0 ? (
          <p className="vacio-texto">No hay compras en esta lista por ahora.</p>
        ) : (
          <div className="lista-compras">
            {visibles.map((compra) => {
              const instancia = instanciaDe(compra);
              const evento = instancia.evento ?? {};
              const detalles = Array.isArray(instancia.detalles) ? instancia.detalles : [];
              const salon = instancia.salon ?? null;
              return (
                <article className={`compra-tarjeta estado-${compra.estado}`} key={compra.id}>
                  <div className="compra-cabecera">
                    <div>
                      <span className="etiqueta">{fechaTexto(compra.creadoEn)}</span>
                      <h3>{compra.referencia || compra.id}</h3>
                      <small>{compra.correo || "Sin correo"}</small>
                    </div>
                    <span className={`estado-compra estado-${compra.estado}`}>
                      {TEXTO_ESTADO_COMPRA[compra.estado] ?? "Pendiente de aprobación"}
                    </span>
                  </div>

                  <div className="compra-datos">
                    <div>
                      <span>Total</span>
                      <strong>{formatearMoneda(compra.total)}</strong>
                    </div>
                    <div>
                      <span>Pago</span>
                      <strong>Tarjeta{compra.ultimos4 ? ` ···· ${compra.ultimos4}` : ""}</strong>
                    </div>
                    <div>
                      <span>Evento</span>
                      <strong>{evento.nombre || "Evento sin nombre"}</strong>
                    </div>
                    <div>
                      <span>Ubicación</span>
                      <strong>{salon?.nombre || "Salón por definir"}</strong>
                    </div>
                  </div>

                  <ul className="compra-servicios">
                    {detalles.map((item) => (
                      <li key={item.id}>
                        <span>{item.nombre} ×{item.cantidad}</span>
                        <strong>{formatearMoneda(Number(item.subtotal) || Number(item.precioUnitario) * Number(item.cantidad))}</strong>
                      </li>
                    ))}
                  </ul>

                  {compra.estado === "rechazado" && compra.motivo && (
                    <p className="revision-motivo">Motivo: {compra.motivo}</p>
                  )}

                  {compra.estado !== "aprobado" && (
                    <label className="revision-motivo-campo">
                      Motivo por si se rechaza
                      <textarea
                        rows="2"
                        maxLength={200}
                        value={motivos[compra.id] ?? ""}
                        placeholder="Explica qué debe revisar el cliente."
                        onChange={(evento) => cambiarMotivo(compra.id, evento.target.value)}
                      />
                    </label>
                  )}

                  <div className="revision-acciones">
                    {compra.estado !== "aprobado" && (
                      <button
                        type="button"
                        className="boton"
                        disabled={Boolean(ocupado)}
                        onClick={() => revisar(compra, "aprobado")}
                      >
                        Aprobar compra
                      </button>
                    )}
                    {compra.estado === "pendiente" && (
                      <button
                        type="button"
                        className="boton boton-secundario"
                        disabled={Boolean(ocupado)}
                        onClick={() => revisar(compra, "rechazado")}
                      >
                        Rechazar
                      </button>
                    )}
                    {compra.estado === "rechazado" && (
                      <button
                        type="button"
                        className="boton-texto"
                        disabled={Boolean(ocupado)}
                        onClick={() => revisar(compra, "pendiente")}
                      >
                        Volver a pendiente
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
