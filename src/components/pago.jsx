import { useEffect, useState } from "react";
import { Link } from "react-router";

import { cargarServicios } from "../api/catalogo.js";
import { crearCompra, listarMisCompras, suscribirseCompras } from "../api/compras.js";
import { CATEGORIAS, TEXTO_ESTADO_COMPRA } from "../api/configuracion.js";
import { agruparPorCategoria, calcularTotal } from "../logica/carrito.js";
import { generarCronograma } from "../logica/cronograma.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";
import { formatearNumeroTarjeta, validarPago } from "../logica/pago.js";

const FORMULARIO_VACIO = { titular: "", numero: "", vencimiento: "", cvv: "" };

function formatearVencimiento(valor) {
  const limpio = String(valor ?? "").replace(/\D/g, "").slice(0, 4);
  return limpio.length > 2 ? `${limpio.slice(0, 2)}/${limpio.slice(2)}` : limpio;
}

function nombreCategoria(clave) {
  return CATEGORIAS.find((categoria) => categoria.id === clave)?.nombre ?? clave;
}

function mensajeEstado(estado) {
  if (estado === "aprobado") return "Compra aprobada. Tu paquete quedó confirmado.";
  if (estado === "rechazado") return "La compra fue rechazada. Revisa el motivo.";
  return "Compra enviada. Está esperando la aprobación del administrador.";
}

export default function Pago({ evento, onActualizar, sesion, setAviso }) {
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [confirmado, setConfirmado] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const total = calcularTotal(evento.detalles);
  const grupos = agruparPorCategoria(evento.detalles);
  const cronograma = generarCronograma(evento.detalles, evento.horaInicio);
  const salon = cargarServicios().find((servicio) => servicio.id === evento.salonId);
  const eventoConfirmado = confirmado?.instancia?.evento ?? evento;
  const detallesConfirmados = confirmado?.instancia?.detalles ?? evento.detalles;
  const cronogramaConfirmado = confirmado?.instancia?.cronograma ?? cronograma;
  const salonConfirmado = confirmado?.instancia?.salon ?? salon;
  const totalConfirmado = confirmado?.total ?? total;

  useEffect(() => {
    if (!confirmado?.id || !sesion?.access_token) return undefined;
    return suscribirseCompras(() => {
      listarMisCompras(sesion.access_token)
        .then((lista) => {
          const actual = lista.find((compra) => compra.id === confirmado.id);
          if (actual) {
            setConfirmado((anterior) =>
              anterior && anterior.id === actual.id
                ? { ...anterior, estado: actual.estado, motivo: actual.motivo, revisadoEn: actual.revisadoEn }
                : anterior,
            );
          }
        })
        .catch(() => {});
    });
  }, [confirmado?.id, sesion?.access_token]);

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function confirmar(eventoFormulario) {
    eventoFormulario.preventDefault();
    if (procesando || confirmado) return;

    const resultado = validarPago(formulario);
    setErrores(resultado.errores);
    if (!resultado.validos) return;

    setProcesando(true);
    try {
      const creada = await crearCompra(sesion.access_token, {
        total,
        ultimos4: formulario.numero.replace(/\D/g, "").slice(-4),
        evento: {
          nombre: evento.nombre,
          tipoEvento: evento.tipoEvento,
          fecha: evento.fecha,
          invitados: evento.invitados,
          horaInicio: evento.horaInicio,
        },
        salon: salon ? { id: salon.id, nombre: salon.nombre, direccion: salon.direccion } : null,
        detalles: evento.detalles.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          categoria: item.categoria,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
        cronograma: generarCronograma(evento.detalles, evento.horaInicio),
      });

      const fecha = new Date(creada.creadoEn || Date.now());
      setConfirmado({
        ...creada,
        fecha: Number.isNaN(fecha.getTime())
          ? new Date().toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })
          : fecha.toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" }),
      });
      setFormulario(FORMULARIO_VACIO);
      onActualizar(evento, MENSAJES.compraEnviada, false);
    } catch (error) {
      setAviso(error?.message || MENSAJES.compraSinGuardar);
    } finally {
      setProcesando(false);
    }
  }

  if (evento.detalles.length === 0) {
    return (
      <section className="pagina">
        <div className="vacio vacio-destacado">
          <p className="etiqueta">Finalizar compra</p>
          <h1>Tu paquete todavía está vacío.</h1>
          <p>Agrega un salón y algunos servicios antes de confirmar la compra.</p>
          <Link className="boton" to="/salon">
            Elegir salón
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="pagina pago-pagina">
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">Finalizar compra</p>
          <h1>Confirma tu paquete.</h1>
          <p>Enviamos la compra al administrador para su aprobación. No guardamos datos bancarios.</p>
        </div>
      </header>

      {confirmado ? (
        <section className={`ticket ticket-compra estado-${confirmado.estado}`} role="status" aria-live="polite">
          <header className="ticket-cabecera">
            <div className="ticket-marca">
              <span className="marca-icono">L</span>
              <div>
                <strong>Lumina Event</strong>
                <small>Comprobante de compra</small>
              </div>
            </div>
            <div className="ticket-referencia">
              <small>Referencia</small>
              <strong>{confirmado.referencia || confirmado.id}</strong>
            </div>
          </header>

          <div className="ticket-confirmacion">
            <span className="ticket-check" aria-hidden="true">
              {confirmado.estado === "aprobado" ? "✓" : confirmado.estado === "rechazado" ? "!" : "…"}
            </span>
            <div>
              <div className="ticket-estado">
                <h2>{mensajeEstado(confirmado.estado)}</h2>
                <span className={`estado-compra estado-${confirmado.estado}`}>
                  {TEXTO_ESTADO_COMPRA[confirmado.estado] ?? "Pendiente de aprobación"}
                </span>
              </div>
              <p>
                {eventoConfirmado.tipoEvento || "Tu evento"} · {eventoConfirmado.fecha || "Fecha por definir"} ·{" "}
                {eventoConfirmado.invitados || "—"} invitados
              </p>
            </div>
            <strong className="ticket-total">{formatearMoneda(totalConfirmado)}</strong>
          </div>

          <div className="ticket-cuerpo">
            <div>
              <p className="etiqueta">Ubicación</p>
              <h3>{salonConfirmado?.nombre || eventoConfirmado.nombre || "Salón por definir"}</h3>
              <p>{salonConfirmado?.direccion || "Sin dirección registrada."}</p>
            </div>
            <div>
              <p className="etiqueta">Servicios</p>
              <ul className="ticket-lista">
                {detallesConfirmados.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.nombre} <small>×{item.cantidad}</small>
                    </span>
                    <strong>{formatearMoneda(Number(item.precioUnitario) * Number(item.cantidad))}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="etiqueta">Primeros horarios</p>
              <ul className="ticket-horarios">
                {cronogramaConfirmado.slice(0, 4).map((actividad) => (
                  <li key={actividad.hora}>
                    <strong>{actividad.hora}</strong>
                    <span>{actividad.actividad}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <footer className="ticket-pie">
            <p>
              Compra registrada el {confirmado.fecha}.{" "}
              {confirmado.estado === "aprobado"
                ? "El administrador aprobó tu paquete y quedó confirmado."
                : confirmado.estado === "rechazado"
                  ? `Motivo: ${confirmado.motivo || "Sin motivo indicado."}`
                  : "Tu paquete quedará confirmado cuando el administrador lo apruebe."}
            </p>
            <div className="acciones-principales">
              <Link className="boton" to="/resumen">
                Ver estado de mi compra
              </Link>
              <Link className="boton boton-secundario" to="/catalogo">
                Seguir armando
              </Link>
            </div>
          </footer>
        </section>
      ) : (
        <div className="paneles pago-paneles">
          <form className="panel pago-formulario" onSubmit={confirmar} noValidate>
            <div className="pago-total">
              <span>Total de tu paquete</span>
              <strong>{formatearMoneda(total)}</strong>
            </div>

            <h2>Datos de pago</h2>
            <div className="formulario pago-campos">
              <label className="completo">
                Nombre del titular
                <input
                  value={formulario.titular}
                  autoComplete="off"
                  maxLength={60}
                  onChange={(eventoCambio) => cambiar("titular", eventoCambio.target.value)}
                  aria-invalid={Boolean(errores.titular)}
                  aria-describedby="error-titular"
                />
                <span className="error-campo" id="error-titular">
                  {errores.titular ?? ""}
                </span>
              </label>
              <label className="completo">
                Número de tarjeta
                <input
                  value={formulario.numero}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="4242 4242 4242 4242"
                  onChange={(eventoCambio) => cambiar("numero", formatearNumeroTarjeta(eventoCambio.target.value))}
                  aria-invalid={Boolean(errores.numero)}
                  aria-describedby="error-numero"
                />
                <span className="error-campo" id="error-numero">
                  {errores.numero ?? ""}
                </span>
              </label>
              <label>
                Vencimiento
                <input
                  value={formulario.vencimiento}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="MM/AA"
                  onChange={(eventoCambio) => cambiar("vencimiento", formatearVencimiento(eventoCambio.target.value))}
                  aria-invalid={Boolean(errores.vencimiento)}
                  aria-describedby="error-vencimiento"
                />
                <span className="error-campo" id="error-vencimiento">
                  {errores.vencimiento ?? ""}
                </span>
              </label>
              <label>
                CVV
                <input
                  value={formulario.cvv}
                  inputMode="numeric"
                  autoComplete="off"
                  type="password"
                  maxLength={4}
                  onChange={(eventoCambio) => cambiar("cvv", eventoCambio.target.value.replace(/\D/g, ""))}
                  aria-invalid={Boolean(errores.cvv)}
                  aria-describedby="error-cvv"
                />
                <span className="error-campo" id="error-cvv">
                  {errores.cvv ?? ""}
                </span>
              </label>
            </div>
            <button type="submit" className="boton boton-completo" disabled={procesando}>
              {procesando ? "Enviando compra…" : "Confirmar compra"}
            </button>
            <p className="pago-nota">
              Validación de prueba <strong>4242 4242 4242 4242</strong>. Solo se guarda la compra, nunca los datos de la tarjeta.
            </p>
          </form>

          <aside className="panel pago-resumen">
            <p className="etiqueta">Resumen</p>
            <h2>{evento.nombre || "Evento sin nombre"}</h2>
            <p className="subtitulo">
              {evento.tipoEvento || "Tipo sin definir"} · {evento.fecha || "Fecha sin definir"} ·{" "}
              {evento.invitados || "—"} invitados
            </p>

            <dl className="pago-desglose">
              {grupos.map((grupo) => (
                <div key={grupo.categoria}>
                  <dt>
                    {nombreCategoria(grupo.categoria)} <small>×{grupo.cantidad}</small>
                  </dt>
                  <dd>{formatearMoneda(grupo.subtotal)}</dd>
                </div>
              ))}
            </dl>

            <div className="total">
              <span>Total de la compra</span>
              <strong>{formatearMoneda(total)}</strong>
            </div>

            <Link className="boton-texto" to="/resumen">
              Ver desglose completo
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
