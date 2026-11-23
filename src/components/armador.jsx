import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

import { TIPOS_EVENTO } from "../api/configuracion.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";
import { validarDatosEvento } from "../logica/validacion.js";
import { elemento, grupo, numero } from "../movimiento.js";
import Pagina from "./pagina.jsx";
import { useRevelados } from "../hooks/useCinematico.js";

const CAMPOS = [
  { clave: "nombre", etiqueta: "Nombre del evento", tipo: "text", maxLength: 60 },
  { clave: "tipoEvento", etiqueta: "Tipo de evento", tipo: "select" },
  { clave: "fecha", etiqueta: "Fecha", tipo: "date" },
  { clave: "invitados", etiqueta: "Invitados", tipo: "number", min: 1, max: 10000 },
  { clave: "presupuesto", etiqueta: "Presupuesto", tipo: "number", min: 0, step: 100 },
  { clave: "horaInicio", etiqueta: "Hora de inicio", tipo: "time" },
];

const PASOS = ["Datos", "Salón", "Servicios", "Confirmar"];

export default function Armador({ evento, onActualizar, setAviso }) {
  const paginaRef = useRef(null);
  useRevelados(paginaRef);
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
    if (guardando) return;
    setGuardando(true);

    const resultado = validarDatosEvento(formulario, TIPOS_EVENTO, { requerirSalon: false });
    setErrores(resultado.errores);

    if (!resultado.validos) {
      setAviso(MENSAJES.datosInvalidos);
      setGuardando(false);
      return;
    }

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
      <motion.label key={clave} htmlFor={clave} variants={elemento} whileFocus={{ y: -2 }}>
        {etiqueta}
        {control}
        <span className="error-campo" id={`error-${clave}`}>
          {errores[clave] ?? ""}
        </span>
      </motion.label>
    );
  }

  return (
    <Pagina ref={paginaRef}>
      <header className="titulo-pagina" data-reveal>
        <div>
          <p className="etiqueta">Datos del evento</p>
          <h1>Empecemos por lo básico.</h1>
          <p>Con estos datos podremos buscar un salón que sí se ajuste a tu celebración.</p>
        </div>
      </header>

      <motion.ol className="flujo-progreso" data-reveal variants={grupo} initial="hidden" animate="show" aria-label="Progreso del evento">
        {PASOS.map((paso, indice) => (
          <motion.li key={paso} variants={elemento} className={indice === 0 ? "actual" : ""}>
            <motion.span className="flujo-linea" initial={{ scaleX: 0 }} animate={{ scaleX: indice === 0 ? 1 : 0.2 }} transition={{ duration: 0.6, delay: indice * 0.08 }} />
            <span className="flujo-numero">0{indice + 1}</span>
            <span>{paso}</span>
          </motion.li>
        ))}
      </motion.ol>

      <motion.div className="paneles paneles-formulario" data-reveal variants={grupo} initial="hidden" animate="show">
        <motion.form className="panel" onSubmit={guardar} noValidate variants={elemento}>
          <h2>Tu evento</h2>
          <div className="formulario">{CAMPOS.map(campo)}</div>
          <div className="acciones-formulario">
            <button className="boton" type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Continuar al salón"} <span aria-hidden="true">→</span>
            </button>
            <span className="acciones-nota">Después elegirás el salón.</span>
          </div>
        </motion.form>

        <motion.aside className="panel panel-nota" variants={elemento}>
          <p className="etiqueta">Lo que llevas</p>
          <h2>{formulario.nombre || "Evento sin nombre"}</h2>
            <dl className="nota-datos">
              <div>
                <dt>Tipo</dt>
                <dd>{formulario.tipoEvento || "Por definir"}</dd>
              </div>
              <div>
                <dt>Invitados</dt>
                <motion.dd key={formulario.invitados || "vacio"} {...numero}>
                  {formulario.invitados || "—"}
                </motion.dd>
              </div>
              <div>
                <dt>Presupuesto</dt>
                <motion.dd key={formulario.presupuesto || "vacio"} {...numero}>
                  {formulario.presupuesto ? formatearMoneda(Number(formulario.presupuesto)) : "Sin definir"}
                </motion.dd>
              </div>
            </dl>

          <p className="vacio-texto">Nada se pierde: puedes volver a editar estos datos cuando quieras.</p>
        </motion.aside>
      </motion.div>
    </Pagina>
  );
}
