import { useState } from "react";
import { useNavigate } from "react-router";

import { TIPOS_EVENTO } from "../api/configuracion.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";
import { validarDatosEvento } from "../logica/validacion.js";

const CAMPOS = [
  { clave: "nombre", etiqueta: "Nombre del evento", tipo: "text", maxLength: 60 },
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
      control = (
        <select {...comun}>
          <option value="">Selecciona una opción</option>
          {TIPOS_EVENTO.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      );
    } else {
      control = (
        <input
          {...comun}
          type={tipo}
          maxLength={campoConfig.maxLength}
          min={campoConfig.min}
          max={campoConfig.max}
          step={campoConfig.step}
        />
      );
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
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">Datos del evento</p>
          <h1>Empecemos por lo básico.</h1>
          <p>Con estos datos podremos buscar un salón que sí se ajuste a tu celebración.</p>
        </div>
      </header>

      <div className="paneles paneles-formulario">
        <form className="panel" onSubmit={guardar} noValidate>
          <h2>Tu evento</h2>
          <div className="formulario">{CAMPOS.map(campo)}</div>
          <div className="acciones-formulario">
            <button className="boton" type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar y continuar"}
            </button>
            <span className="acciones-nota">Después elegirás el salón.</span>
          </div>
        </form>

        <aside className="panel panel-nota">
          <p className="etiqueta">Lo que llevas</p>
          <h2>{formulario.nombre || "Evento sin nombre"}</h2>
          <dl className="nota-datos">
            <div>
              <dt>Tipo</dt>
              <dd>{formulario.tipoEvento || "Por definir"}</dd>
            </div>
            <div>
              <dt>Invitados</dt>
              <dd>{formulario.invitados || "—"}</dd>
            </div>
            <div>
              <dt>Presupuesto</dt>
              <dd>
                {formulario.presupuesto ? formatearMoneda(Number(formulario.presupuesto)) : "Sin definir"}
              </dd>
            </div>
          </dl>
          <p className="vacio-texto">Nada se pierde: puedes volver a editar estos datos cuando quieras.</p>
        </aside>
      </div>
    </section>
  );
}
