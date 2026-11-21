import { useState } from "react";
import { Link } from "react-router";

import { cargarServicios } from "../api/catalogo.js";
import { CATEGORIAS } from "../api/configuracion.js";
import { agruparPorCategoria, calcularTotal } from "../logica/carrito.js";
import { generarCronograma } from "../logica/cronograma.js";
import { formatearMoneda } from "../logica/formato.js";
import { estadoPresupuesto, evaluarCobertura } from "../logica/paquete.js";
import { formatearNumeroTarjeta, validarPago } from "../logica/pago.js";
import Guia from "./guia.jsx";

const FORMULARIO_VACIO = { titular: "", numero: "", vencimiento: "", cvv: "" };

function formatearVencimiento(valor) {
  const limpio = String(valor ?? "").replace(/\D/g, "").slice(0, 4);
  return limpio.length > 2 ? `${limpio.slice(0, 2)}/${limpio.slice(2)}` : limpio;
}

function nombreCategoria(clave) {
  return CATEGORIAS.find((categoria) => categoria.id === clave)?.nombre ?? clave;
}

export default function Pago({ evento, onActualizar }) {
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [confirmado, setConfirmado] = useState(null);

  const total = calcularTotal(evento.detalles);
  const presupuesto = estadoPresupuesto(evento.presupuesto, total);
  const grupos = agruparPorCategoria(evento.detalles);
  const cobertura = evaluarCobertura(evento.detalles);
  const cronograma = generarCronograma(evento.detalles, evento.horaInicio);
  const salon = cargarServicios().find((servicio) => servicio.id === evento.salonId);
  const eventoConfirmado = confirmado?.evento ?? evento;
  const totalConfirmado = confirmado?.total ?? total;

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  function confirmar(eventoFormulario) {
    eventoFormulario.preventDefault();
    const resultado = validarPago(formulario);
    setErrores(resultado.errores);
    if (!resultado.validos) return;

    setConfirmado({
      referencia: `LM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      fecha: new Date().toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" }),
      total,
      evento: structuredClone(evento),
    });
    setFormulario(FORMULARIO_VACIO);
    onActualizar(evento, "Compra simulada completada. No se realizó ningún cobro.", false);
  }

  if (evento.detalles.length === 0) {
    return (
      <section className="pagina">
        <Guia paso={5} evento={evento} />
        <div className="vacio vacio-destacado">
          <p className="etiqueta">Paso 05 · Pago simulado</p>
          <h1>Tu paquete todavía está vacío.</h1>
          <p>Agrega un salón y algunos servicios antes de ver cómo quedaría el pago.</p>
          <Link className="boton" to="/salon">
            Elegir salón
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="pagina pago-pagina">
      <Guia paso={5} evento={evento} confirmado={Boolean(confirmado)} />

      <header className="titulo-pagina titulo-pagina-destacado">
        <div>
          <p className="etiqueta">Paso 05 · Cierre</p>
          <h1>Así se vería tu compra.</h1>
          <p>
            Revisa el desglose, simula el pago y obtén un comprobante de ejemplo. No se cobra ni se guarda ningún dato
            bancario.
          </p>
        </div>
        <div className="sello-paso" aria-hidden="true">
          <span>05</span>
          <small>Pago</small>
        </div>
      </header>

      <div className="pago-aviso" role="note">
        <span className="pago-aviso-icono" aria-hidden="true">
          !
        </span>
        <div>
          <strong>Simulación de compra</strong>
          <p>Usa la tarjeta de prueba 4242 4242 4242 4242. El pago no es real y no se procesa con ningún banco.</p>
        </div>
      </div>

      {confirmado ? (
        <section className="ticket" role="status" aria-live="polite">
          <header className="ticket-cabecera">
            <div className="ticket-marca">
              <span className="marca-icono">L</span>
              <div>
                <strong>Lumina Event</strong>
                <small>Comprobante de simulación</small>
              </div>
            </div>
            <div className="ticket-referencia">
              <small>Referencia</small>
              <strong>{confirmado.referencia}</strong>
            </div>
          </header>

          <div className="ticket-confirmacion">
            <span className="ticket-check" aria-hidden="true">
              ✓
            </span>
            <div>
              <h2>Listo, tu paquete quedó armado.</h2>
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
              <h3>{salon?.nombre || eventoConfirmado.nombre || "Salón por definir"}</h3>
              <p>{salon?.direccion || "Sin dirección registrada."}</p>
            </div>
            <div>
              <p className="etiqueta">Servicios</p>
              <ul className="ticket-lista">
                {eventoConfirmado.detalles.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.nombre} <small>×{item.cantidad}</small>
                    </span>
                    <strong>{formatearMoneda(item.precioUnitario * item.cantidad)}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="etiqueta">Primeros horarios</p>
              <ul className="ticket-horarios">
                {cronograma.slice(0, 4).map((actividad) => (
                  <li key={actividad.hora}>
                    <strong>{actividad.hora}</strong>
                    <span>{actividad.actividad}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <footer className="ticket-pie">
            <p>Comprobante generado el {confirmado.fecha}. Solo corresponde a una simulación.</p>
            <div className="acciones-hero">
              <Link className="boton" to="/">
                Volver al inicio
              </Link>
              <Link className="boton boton-secundario" to="/resumen">
                Ver resumen
              </Link>
            </div>
          </footer>
        </section>
      ) : (
        <div className="paneles pago-paneles">
          <form className="panel pago-formulario" onSubmit={confirmar} noValidate>
            <div className="pago-tarjeta" aria-hidden="true">
              <div className="pago-tarjeta-top">
                <span>Lumina Event</span>
                <span className="pago-chip"></span>
              </div>
              <strong>{formulario.numero || "0000 0000 0000 0000"}</strong>
              <div className="pago-tarjeta-bottom">
                <span>{formulario.titular || "NOMBRE DEL TITULAR"}</span>
                <span>{formulario.vencimiento || "MM/AA"}</span>
              </div>
            </div>

            <h2>Datos de pago simulado</h2>
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
            <button type="submit" className="boton boton-completo">
              Confirmar pago simulado · {formatearMoneda(total)}
            </button>
            <p className="pago-nota">No guardamos estos datos. La tarjeta de prueba es la única recomendada.</p>
          </form>

          <aside className="panel pago-resumen">
            <p className="etiqueta">Tu paquete</p>
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

            <div className={`presupuesto-estado ${presupuesto.estado}`}>
              <span>{presupuesto.estado === "excedido" ? "Supera tu presupuesto" : "Dentro de tu presupuesto"}</span>
              <strong>{formatearMoneda(presupuesto.diferencia)}</strong>
              <small>
                {presupuesto.estado === "excedido"
                  ? "Puedes volver al catálogo y ajustar servicios."
                  : presupuesto.estado === "sin-definir"
                    ? "Define un presupuesto para comparar."
                    : "Te quedaría este margen para detalles."}
              </small>
            </div>

            <ul className="cobertura-lista">
              {cobertura.map((item) => (
                <li key={item.categoria} className={item.completo ? "completo" : "faltante"}>
                  <span aria-hidden="true">{item.completo ? "✓" : "+"}</span>
                  {nombreCategoria(item.categoria)}
                </li>
              ))}
            </ul>

            <div className="total">
              <span>Total a pagar</span>
              <strong>{formatearMoneda(total)}</strong>
            </div>

            <div className="acciones-hero">
              <Link className="boton-texto" to="/catalogo">
                Agregar servicios
              </Link>
              <Link className="boton-texto" to="/resumen">
                Ver desglose completo
              </Link>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
