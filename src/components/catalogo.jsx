import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import {
  leerAnunciosAprobados,
  servicioDeAnuncio,
  suscribirseAnuncios,
} from "../api/anuncios.js";
import { cargarServicios } from "../api/catalogo.js";
import { CATEGORIAS } from "../api/configuracion.js";
import { agregarServicio } from "../logica/carrito.js";
import { filtrarServicios } from "../logica/filtros.js";
import { MENSAJES } from "../logica/mensajes.js";
import { validarBusqueda } from "../logica/validacion.js";
import TarjetaServicio from "./tarjetaServicio.jsx";

const CATEGORIAS_FLUJO = CATEGORIAS.filter((item) => item.id !== "salones");
const PRIMERA_CATEGORIA = CATEGORIAS_FLUJO[0].id;

export default function Catalogo({ evento, onActualizar, setAviso }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const categoriaParam = searchParams.get("categoria");
  const indiceParam = CATEGORIAS_FLUJO.findIndex((item) => item.id === categoriaParam);
  const indice = indiceParam >= 0 ? indiceParam : 0;
  const categoria = CATEGORIAS_FLUJO[indice];
  const anterior = indice > 0 ? CATEGORIAS_FLUJO[indice - 1] : null;
  const siguiente = indice < CATEGORIAS_FLUJO.length - 1 ? CATEGORIAS_FLUJO[indice + 1] : null;
  const esUltima = indice === CATEGORIAS_FLUJO.length - 1;

  useEffect(() => {
    let activo = true;
    const cargar = () => {
      const base = cargarServicios().filter(
        (servicio) =>
          servicio.categoria !== "salones" && !String(servicio.id).startsWith("extra-anuncio-"),
      );
      if (activo) setServicios(base);
      leerAnunciosAprobados()
        .then((lista) => {
          if (activo) setServicios([...base, ...lista.map(servicioDeAnuncio)]);
        })
        .catch(() => {});
    };
    cargar();
    const cancelar = suscribirseAnuncios(cargar);
    return () => {
      activo = false;
      cancelar();
    };
  }, []);

  useEffect(() => {
    if (indiceParam < 0) {
      setSearchParams({ categoria: PRIMERA_CATEGORIA }, { replace: true });
    }
    setBusqueda("");
  }, [categoriaParam, indiceParam, setSearchParams]);

  const errorBusqueda = validarBusqueda(busqueda);
  const visibles = filtrarServicios(servicios, categoria.id, busqueda);
  const seleccionadosCategoria = evento.detalles.filter((item) => item.categoria === categoria.id).length;

  function agregar(servicio) {
    const resultado = agregarServicio(evento.detalles, servicio);
    if (!resultado.agregado) {
      setAviso(resultado.mensaje);
      return;
    }
    onActualizar({ ...evento, detalles: resultado.detalles }, resultado.mensaje);
  }

  function irACategoria(id) {
    setBusqueda("");
    setSearchParams({ categoria: id });
  }

  function avanzar() {
    if (siguiente) irACategoria(siguiente.id);
    else navigate("/resumen");
  }

  function retroceder() {
    setBusqueda("");
    if (anterior) irACategoria(anterior.id);
    else navigate("/salon");
  }

  return (
    <section className="pagina">
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">Servicios · {categoria.nombre}</p>
          <h1>{categoria.nombre}.</h1>
          <p>{categoria.descripcion}</p>
        </div>
        <div className="titulo-acciones">
          <p className="contador">{evento.detalles.length} servicio(s) en tu evento</p>
          <Link className="boton-texto" to="/resumen">
            Ver mi paquete
          </Link>
        </div>
      </header>

      <div className="catalogo-pista">
        <p>
          Ahora: <strong>{categoria.nombre}</strong>
          {siguiente ? ` · Después: ${siguiente.nombre}` : " · Última categoría"}
        </p>
        <p className="contador">{seleccionadosCategoria} en esta categoría</p>
      </div>

      <div className="barra-filtros">
        <label className="buscador">
          Buscar en {categoria.nombre}
          <input
            type="search"
            value={busqueda}
            maxLength={60}
            placeholder={`Ej. ${categoria.nombre.toLowerCase()}…`}
            onChange={(eventoCambio) => setBusqueda(eventoCambio.target.value)}
          />
        </label>
        <button type="button" className="boton boton-secundario" onClick={() => setBusqueda("")}>
          Limpiar búsqueda
        </button>
      </div>

      {errorBusqueda && <p className="aviso aviso-error">{errorBusqueda}</p>}

      {visibles.length === 0 ? (
        <div className="vacio">
          <p>{MENSAJES.sinResultados}</p>
          <button type="button" className="boton" onClick={() => setBusqueda("")}>
            Limpiar búsqueda
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

      <div className="flujo-acciones">
        <button type="button" className="boton boton-secundario" onClick={retroceder}>
          ← {anterior ? `Regresar a ${anterior.nombre}` : "Regresar al salón"}
        </button>
        <div className="acciones-principales">
          <button type="button" className="boton-texto" onClick={avanzar}>
            {esUltima ? "Omitir y ver resumen" : "Omitir esta categoría"}
          </button>
          <button type="button" className="boton" onClick={avanzar}>
            {esUltima ? "Terminar y ver resumen" : `Continuar a ${siguiente.nombre}`} →
          </button>
        </div>
      </div>
    </section>
  );
}
