import { useEffect, useState } from "react";
import { Link } from "react-router";

import { cargarServicios } from "../api/catalogo.js";
import { CATEGORIAS } from "../api/configuracion.js";
import { agregarServicio } from "../logica/carrito.js";
import { filtrarServicios } from "../logica/filtros.js";
import { MENSAJES } from "../logica/mensajes.js";
import { validarBusqueda } from "../logica/validacion.js";
import TarjetaServicio from "./tarjetaServicio.jsx";
import Guia from "./guia.jsx";

export default function Catalogo({ evento, onActualizar, setAviso }) {
  const [servicios, setServicios] = useState([]);
  const [categoria, setCategoria] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setServicios(cargarServicios());
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
      <Guia paso={3} evento={evento} />

      <header className="titulo-pagina titulo-pagina-destacado">
        <div>
          <p className="etiqueta">Paso 03 · Los servicios</p>
          <h1>Completa tu paquete.</h1>
          <p>
            Explora por categoría, compara proveedores y agrega solo lo que necesitas. Tu paquete se actualiza al
            instante.
          </p>
        </div>
        <div className="titulo-acciones">
          <p className="contador">{evento.detalles.length} servicio(s) en tu evento</p>
          <Link className="boton boton-secundario" to="/resumen">
            Ir a mi paquete →
          </Link>
        </div>
      </header>

      <div className="barra-filtros">
        <label>
          Categoría
          <select value={categoria} onChange={(eventoCambio) => setCategoria(eventoCambio.target.value)}>
            <option value="todos">Todas las categorías</option>
            {CATEGORIAS.map((item) => (
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
            placeholder="Ej. salón, DJ, flores…"
            onChange={(eventoCambio) => setBusqueda(eventoCambio.target.value)}
          />
        </label>
        <button type="button" className="boton boton-secundario" onClick={limpiar}>
          Limpiar
        </button>
      </div>

      <div className="paso-ayuda">
        <span className="paso-ayuda-numero" aria-hidden="true">
          03
        </span>
        <p>
          <strong>Consejo de la ruta:</strong> cubre primero comida, mobiliario, música, decoración y fotografía.
          Los detalles y la seguridad puedes ajustarlos al final.
        </p>
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
    </section>
  );
}
