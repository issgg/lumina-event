import { Link } from "react-router";

import { evaluarCobertura } from "../logica/paquete.js";

const PASOS = [
  { ruta: "/armador", texto: "Datos" },
  { ruta: "/salon", texto: "Salón" },
  { ruta: "/catalogo", texto: "Servicios" },
  { ruta: "/resumen", texto: "Revisión" },
  { ruta: "/pago", texto: "Pago" },
];

export default function Guia({ paso, evento, confirmado = false }) {
  const detalles = evento?.detalles ?? [];
  const cobertura = evaluarCobertura(detalles);
  const datosListos = Boolean(
    evento?.tipoEvento && evento?.fecha && Number(evento?.invitados) > 0 && Number(evento?.presupuesto) > 0,
  );
  const salonListo = Boolean(evento?.salonId);
  const serviciosListos = cobertura.some(
    (item) => item.categoria !== "salones" && item.completo,
  );
  const listos = [datosListos, salonListo, serviciosListos, datosListos && salonListo, confirmado];

  return (
    <section className="guia" aria-label="Ruta de planeación">
      <div className="guia-cabecera">
        <div>
          <p className="guia-etiqueta">Ruta de planeación</p>
          <h2 className="guia-titulo">Tu evento, paso a paso</h2>
        </div>
        <p className="guia-contador">
          <strong>{String(paso).padStart(2, "0")}</strong>
          <span>/ 05</span>
        </p>
      </div>

      <ol className="guia-lista">
        {PASOS.map((item, indice) => {
          const numero = indice + 1;
          const estado = numero === paso ? "actual" : listos[indice] && numero < paso ? "listo" : "pendiente";
          return (
            <li key={item.ruta} className={`guia-item ${estado}`}>
              <Link
                to={item.ruta}
                className="guia-enlace"
                aria-current={numero === paso ? "step" : undefined}
              >
                <span className="guia-numero">{estado === "listo" ? "✓" : String(numero).padStart(2, "0")}</span>
                <span className="guia-texto">{item.texto}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div
        className="guia-barra"
        role="progressbar"
        aria-label="Avance del evento"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={paso}
      >
        <span style={{ width: `${paso * 20}%` }}></span>
      </div>
    </section>
  );
}
