import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";

import { cargarServicios } from "../api/catalogo.js";
import { consultarCronograma, limpiarEvento } from "../api/baseDatos.js";
import { listarMisCompras, suscribirseCompras } from "../api/compras.js";
import { CATEGORIAS, TEXTO_ESTADO_COMPRA } from "../api/configuracion.js";
import { agruparPorCategoria, calcularTotal } from "../logica/carrito.js";
import { generarCronograma } from "../logica/cronograma.js";
import { eventoVacio } from "../logica/evento.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";
import { estadoPresupuesto, evaluarCobertura } from "../logica/paquete.js";
import { elemento, grupo, numero } from "../movimiento.js";
import Pagina from "./pagina.jsx";
import { useRevelados } from "../hooks/useCinematico.js";

export default function Resumen({ sesion, evento, onActualizar, setAviso }) {
  const paginaRef = useRef(null);
  useRevelados(paginaRef);
  const [cronograma, setCronograma] = useState([]);
  const [ultimaCompra, setUltimaCompra] = useState(null);
  const total = calcularTotal(evento.detalles);
  const presupuesto = estadoPresupuesto(evento.presupuesto, total);
  const cobertura = evaluarCobertura(evento.detalles);
  const grupos = agruparPorCategoria(evento.detalles);
  const salon = cargarServicios().find((servicio) => servicio.id === evento.salonId);
  const cubiertas = cobertura.filter((item) => item.completo).length;
  const faltantes = cobertura.filter((item) => !item.completo).map((item) => nombreCategoria(item.categoria));
  const porcentajeCobertura = cobertura.length ? Math.round((cubiertas / cobertura.length) * 100) : 0;

  useEffect(() => {
    let activo = true;
    consultarCronograma(sesion)
      .then((guardado) => {
        if (activo) {
          setCronograma(guardado.length ? guardado : generarCronograma(evento.detalles, evento.horaInicio));
        }
      })
      .catch(() => {
        if (activo) setCronograma(generarCronograma(evento.detalles, evento.horaInicio));
      });
    return () => {
      activo = false;
    };
  }, [sesion, evento]);

  useEffect(() => {
    if (!sesion?.access_token) return undefined;
    let activo = true;
    const cargar = () => {
      listarMisCompras(sesion.access_token)
        .then((lista) => {
          if (activo) setUltimaCompra(lista[0] ?? null);
        })
        .catch(() => {
          if (activo) setUltimaCompra(null);
        });
    };
    cargar();
    const cancelar = suscribirseCompras(cargar);
    return () => {
      activo = false;
      cancelar();
    };
  }, [sesion?.access_token]);

  async function reiniciar() {
    try {
      await limpiarEvento(sesion);
      onActualizar(eventoVacio(), "Evento reiniciado.", false);
    } catch {
      setAviso(MENSAJES.falloGuardado);
    }
  }

  return (
    <Pagina ref={paginaRef}>
      <header className="titulo-pagina" data-reveal>
        <div>
          <p className="etiqueta">Mi paquete</p>
          <h1>Revisa tu evento antes de confirmar.</h1>
          <p>
            {evento.nombre || "Sin nombre"} · {evento.tipoEvento || "Tipo sin definir"} ·{" "}
            {evento.fecha || "Fecha sin definir"}
          </p>
        </div>
        <div className="acciones-principales">
          <Link className="boton" to="/pago">
            Confirmar compra <span aria-hidden="true">→</span>
          </Link>
          <Link className="boton-texto" to="/catalogo">
            Ajustar servicios
          </Link>
          <button type="button" className="boton-texto" onClick={() => onActualizar(evento, MENSAJES.guardado)}>
            Guardar
          </button>
          <button type="button" className="boton-texto" onClick={reiniciar}>
            Reiniciar
          </button>
        </div>
      </header>

      {ultimaCompra && (
        <motion.div className={`compra-estado estado-${ultimaCompra.estado}`} variants={elemento} initial="hidden" animate="show">
          <span>Última compra · {ultimaCompra.referencia || ultimaCompra.id}</span>
          <strong>{TEXTO_ESTADO_COMPRA[ultimaCompra.estado] ?? "Pendiente de aprobación"}</strong>
          <small>
            {ultimaCompra.estado === "aprobado"
              ? "Tu paquete quedó confirmado."
              : ultimaCompra.estado === "rechazado"
                ? `Motivo: ${ultimaCompra.motivo || "Sin motivo indicado."}`
                : "El administrador debe aprobarla para confirmar el paquete."}
          </small>
        </motion.div>
      )}

      <motion.div className="resumen-metricas" variants={grupo} initial="hidden" animate="show">
        <motion.div className="metrica" variants={elemento}>
          <span>Servicios</span>
          <motion.strong key={`servicios-${evento.detalles.length}`} {...numero}>
            {evento.detalles.length}
          </motion.strong>
        </motion.div>
        <motion.div className="metrica" variants={elemento}>
          <span>Ubicación</span>
          <strong>{salon?.nombre || "Salón por definir"}</strong>
        </motion.div>
        <motion.div className="metrica metrica-total" variants={elemento}>
          <span>Total estimado</span>
          <motion.strong key={`total-${total}`} {...numero}>
            {formatearMoneda(total)}
          </motion.strong>
        </motion.div>
      </motion.div>

      <div className="resumen-notas" data-reveal>
        <p className={`nota-linea ${presupuesto.estado}`}>
          <strong>Presupuesto:</strong>{" "}
          {presupuesto.estado === "sin-definir"
            ? "Agrega un presupuesto en Datos del evento para comparar."
            : presupuesto.estado === "excedido"
              ? `Tu paquete supera el presupuesto por ${formatearMoneda(presupuesto.diferencia)}.`
              : `Te quedan ${formatearMoneda(presupuesto.diferencia)} dentro de tu presupuesto.`}
        </p>
        <p className="nota-linea">
          <strong>Cobertura:</strong> {cubiertas} de {cobertura.length} esenciales
          {faltantes.length ? ` · Faltan ${faltantes.join(", ")}` : " · Todo cubierto"}
        </p>
        <div className="cobertura-barra" role="progressbar" aria-valuenow={porcentajeCobertura} aria-valuemin="0" aria-valuemax="100">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${porcentajeCobertura}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <div className="paneles resumen-paneles" data-reveal>
        <div className="panel">
          <h2>Lo que contrataste</h2>
          <Tabla
            columnas={["Servicio", "Categoría", "Cantidad", "Subtotal"]}
            filas={evento.detalles.map((item) => [
              item.nombre,
              nombreCategoria(item.categoria),
              item.cantidad,
              formatearMoneda(item.precioUnitario * item.cantidad),
            ])}
            mensajeVacio={MENSAJES.listaVacia}
          />
        </div>

        <div className="panel">
          <h2>Desglose por categoría</h2>
          <Tabla
            columnas={["Categoría", "Cantidad", "Subtotal"]}
            filas={grupos.map((grupo) => [
              nombreCategoria(grupo.categoria),
              grupo.cantidad,
              formatearMoneda(grupo.subtotal),
            ])}
            mensajeVacio="Aún no hay categorías."
          />
        </div>

        <div className="panel">
          <h2>Cómo se acomoda</h2>
          <Tabla
            columnas={["Hora", "Actividad", "Descripción"]}
            filas={cronograma.map((item) => [item.hora, item.actividad, item.descripcion])}
            mensajeVacio="Guarda el evento para generar el cronograma."
          />
        </div>
      </div>

      <div className="resumen-cierre">
        <div>
          <span>Total final</span>
          <strong>{formatearMoneda(total)}</strong>
        </div>
        <Link className="boton" to="/pago">
          Confirmar compra <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Pagina>
  );
}

function nombreCategoria(clave) {
  return CATEGORIAS.find((item) => item.id === clave)?.nombre ?? clave;
}

function Tabla({ columnas, filas, mensajeVacio }) {
  if (filas.length === 0) return <p className="vacio-texto">{mensajeVacio}</p>;

  return (
    <div className="tabla-contenedor" data-reveal>
      <table>
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th key={columna} scope="col">
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={grupo} initial="hidden" animate="show">
          {filas.map((fila, indice) => (
            <motion.tr key={indice} variants={elemento}>
              {fila.map((celda, posicion) => (
                <td key={posicion}>{celda}</td>
              ))}
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
