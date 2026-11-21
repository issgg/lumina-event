import { useState } from "react";
import { useNavigate } from "react-router";

import { TIPOS_EVENTO } from "../api/configuracion.js";
import {
  calcularTotal,
  cambiarCantidad,
  quitarServicio,
} from "../logica/carrito.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";
import { validarDatosEvento } from "../logica/validacion.js";
import Guia from "./guia.jsx";

const CAMPOS = [
  { clave: "nombre", etiqueta: "Nombre", tipo: "text", maxLength: 60 },
  { clave: "tipoEvento", etiqueta: "Tipo de evento", tipo: "select" },
  { clave: "fecha", etiqueta: "Fecha", tipo: "date" },
  { clave: "invitados", etiqueta: "Invitados", tipo: "number", min: 1, max: 10000 },
  { clave: "presupuesto", etiqueta: "Presupuesto", tipo: "number", min: 0, step: 100 },
  { clave: "horaInicio", etiqueta: "Hora de inicio", tipo: "time" },
];

export default function Armador({ evento, onActualizar, setAviso }) {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(() => ({
    nombre: evento.nombre,
    tipoEvento: evento.tipoEvento,
    fecha: evento.fecha,
    invitados: String(evento.invitados ?? ""),
    presupuesto: String(evento.presupuesto ?? ""),
    horaInicio: evento.horaInicio,
    salonId: evento.salonId,
  }));
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function guardar(eventoFormulario) {
    eventoFormulario.preventDefault();
    const resultado = validarDatosEvento(formulario, TIPOS_EVENTO, { requerirSalon: false });
    setErrores(resultado.errores);

    if (!resultado.validos) {
      setAviso(MENSAJES.datosInvalidos);
      return;
    }

    setGuardando(true);
    const nuevo = {
      ...evento,
      ...formulario,
      invitados: Number(formulario.invitados),
      presupuesto: Number(formulario.presupuesto),
    };
    try {
      const guardado = await onActualizar(nuevo, MENSAJES.guardado);
      if (guardado) navigate("/salon");
    } finally {
      setGuardando(false);
    }
  }

  function cambiarCantidadServicio(id, delta) {
    onActualizar({ ...evento, detalles: cambiarCantidad(evento.detalles, id, delta) });
  }

  function quitar(id) {
    onActualizar({ ...evento, detalles: quitarServicio(evento.detalles, id) }, MENSAJES.eliminado);
  }

  function campo(campoConfig) {
    const { clave, etiqueta, tipo } = campoConfig;
    const comun = {
      id: clave,
      value: formulario[clave],
      "aria-invalid": Boolean(errores[clave]),
      "aria-describedby": `error-${clave}`,
      onChange: (eventoCambio) => cambiar(clave, eventoCambio.target.value),
    };

    let control;
    if (tipo === "select") {
      const opciones = TIPOS_EVENTO;
      const valores = TIPOS_EVENTO;
      control = (
        <select {...comun}>
          <option value="">Selecciona una opción</option>
          {opciones.map((opcion, indice) => (
            <option key={valores[indice]} value={valores[indice]}>
              {opcion}
            </option>
          ))}
        </select>
      );
    } else {
      control = <input {...comun} type={tipo} maxLength={campoConfig.maxLength} min={campoConfig.min} max={campoConfig.max} step={campoConfig.step} />;
    }

    return (
      <label key={clave} htmlFor={clave}>
        {etiqueta}
        {control}
        <span className="error-campo" id={`error-${clave}`}>
          {errores[clave] ?? ""}
        </span>
      </label>
    );
  }

  return (
    <section className="pagina">
      <Guia paso={1} evento={evento} />

      <header className="titulo-pagina titulo-pagina-destacado">
        <div>
          <p className="etiqueta">Paso 01 · Los detalles</p>
          <h1>Primero, pongámosle nombre a tu evento.</h1>
          <p>
            Define el tipo, la fecha y cuántas personas esperas. Después elegiremos el salón y armaremos el paquete.
          </p>
        </div>
        <div className="sello-paso" aria-hidden="true">
          <span>01</span>
          <small>Datos</small>
        </div>
      </header>

      <div className="paneles">
        <form className="panel" onSubmit={guardar} noValidate>
          <h2>Datos del evento</h2>
          <div className="formulario">{CAMPOS.map(campo)}</div>
          <button className="boton boton-completo" type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar y elegir salón →"}
          </button>
        </form>

        <aside className="panel">
          <h2>Tu paquete</h2>
          {evento.detalles.length === 0 ? (
            <p className="vacio-texto">{MENSAJES.listaVacia}</p>
          ) : (
            <ul className="lista-evento">
              {evento.detalles.map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.nombre}</strong>
                    <small>{item.categoria} · {item.proveedor}</small>
                  </div>
                  <div className="controles-cantidad">
                    <button type="button" aria-label={`Quitar una unidad de ${item.nombre}`} onClick={() => cambiarCantidadServicio(item.id, -1)}>
                      −
                    </button>
                    <span>{item.cantidad}</span>
                    <button type="button" aria-label={`Agregar una unidad de ${item.nombre}`} onClick={() => cambiarCantidadServicio(item.id, 1)}>
                      +
                    </button>
                    <button type="button" className="boton-texto" onClick={() => quitar(item.id)}>
                      Quitar
                    </button>
                  </div>
                  <span className="subtotal">{formatearMoneda(item.precioUnitario * item.cantidad)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="total">
            <span>Total estimado</span>
            <strong>{formatearMoneda(calcularTotal(evento.detalles))}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
