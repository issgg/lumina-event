import { useEffect, useState } from "react";
import { Link } from "react-router";

import { cargarServicios } from "../api/catalogo.js";
import { CATEGORIAS } from "../api/configuracion.js";
import { agregarServicio } from "../logica/carrito.js";
import { filtrarServicios } from "../logica/filtros.js";
import { MENSAJES } from "../logica/mensajes.js";
import { validarBusqueda } from "../logica/validacion.js";
import TarjetaServicio from "./tarjetaServicio.jsx";

const CATEGORIAS_DISPONIBLES = CATEGORIAS.filter((item) => item.id !== "salones");

export default function Catalogo({ evento, onActualizar, setAviso }) {
  const [servicios, setServicios] = useState([]);
  const [categoria, setCategoria] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setServicios(cargarServicios().filter((servicio) => servicio.categoria !== "salones"));
  }, []);

  const errorBusqueda = validarBusqueda(busqueda);
  const visibles = filtrarServicios(servicios, categoria, busqueda);

  function agregar(servicio) {
    const resultado = agregarServicio(evento.detalles, servicio);
    if (!resultado.agregado) {
      setAviso(resultado.mensaje);
      return;
    }
    onActualizar({ ...evento, detalles: resultado.detalles }, resultado.mensaje);
  }

  function limpiar() {
    setBusqueda("");
    setCategoria("todos");
  }

  return (
    <section className="pagina">
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">Servicios</p>
          <h1>Arma tu paquete.</h1>
          <p>Explora por categoría y agrega solo lo que necesitas. El total se actualiza al instante.</p>
        </div>
        <div className="titulo-acciones">
          <p className="contador">{evento.detalles.length} servicio(s) en tu evento</p>
          <Link className="boton boton-secundario" to="/resumen">
            Ver mi paquete
          </Link>
        </div>
      </header>

      <div className="barra-filtros">
        <label>
          Categoría
          <select value={categoria} onChange={(eventoCambio) => setCategoria(eventoCambio.target.value)}>
            <option value="todos">Todas las categorías</option>
            {CATEGORIAS_DISPONIBLES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="buscador">
          Buscar
          <input
            type="search"
            value={busqueda}
            maxLength={60}
            placeholder="Ej. DJ, flores, pastel…"
            onChange={(eventoCambio) => setBusqueda(eventoCambio.target.value)}
          />
        </label>
        <button type="button" className="boton boton-secundario" onClick={limpiar}>
          Limpiar
        </button>
      </div>

      {errorBusqueda && <p className="aviso aviso-error">{errorBusqueda}</p>}

      {visibles.length === 0 ? (
        <div className="vacio">
          <p>{MENSAJES.sinResultados}</p>
          <button type="button" className="boton" onClick={limpiar}>
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="rejilla">
          {visibles.map((servicio) => (
            <TarjetaServicio
              key={servicio.id}
              servicio={servicio}
              agregado={evento.detalles.some((item) => item.id === servicio.id)}
              onAgregar={agregar}
            />
          ))}
        </div>
      )}

      {evento.detalles.length > 0 && (
        <div className="catalogo-pie">
          <p>Ya armaste {evento.detalles.length} servicio(s).</p>
          <Link className="boton" to="/resumen">
            Ver mi paquete <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </section>
  );
}
