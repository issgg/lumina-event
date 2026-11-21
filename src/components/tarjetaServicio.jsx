import { formatearMoneda } from "../logica/formato.js";

export default function TarjetaServicio({ servicio, agregado, onAgregar }) {
  return (
    <article className="tarjeta">
      <figure className="tarjeta-imagen">
        <img src={servicio.imagen} alt={`Ilustración de ${servicio.nombre}`} loading="lazy" />
      </figure>
      <div className="tarjeta-cuerpo">
        <div className="tarjeta-cabecera">
          <h3>{servicio.nombre}</h3>
          <span className="categoria">{servicio.categoria}</span>
        </div>
        <p>{servicio.descripcion}</p>
        <p className="proveedor">{servicio.proveedor}</p>
        <p className="precio">{formatearMoneda(servicio.precio)}</p>
        <button type="button" className="boton boton-tarjeta" onClick={() => onAgregar(servicio)} disabled={agregado}>
          {agregado ? "En tu evento" : "Agregar"}
        </button>
      </div>
    </article>
  );
}
