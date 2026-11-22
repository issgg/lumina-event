import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  borrarAnuncio,
  fotoDe,
  guardarAnuncio,
  imagenDe,
  leerAnuncios,
  sincronizarCatalogo,
  suscribirseAnuncios,
} from "../api/anuncios.js";
import { CATEGORIAS, CATEGORIAS_PROVEEDOR } from "../api/configuracion.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";

const FORMULARIO_VACIO = {
  negocio: "",
  categoria: CATEGORIAS_PROVEEDOR[0].id,
  nombre: "",
  descripcion: "",
  precio: "",
};

function nombreCategoria(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id)?.nombre ?? id;
}

export default function Proveedor({ sesion, setAviso, formularioAbierto = false }) {
  const navegar = useNavigate();
  const correo = sesion?.user?.email ?? "sin-correo";
  const [anuncios, setAnuncios] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const lista = await leerAnuncios(correo);
        if (activo) setAnuncios(lista);
      } catch {
        if (activo) setAnuncios([]);
      }
      try {
        await sincronizarCatalogo();
      } catch {
        return;
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, [correo]);

  useEffect(
    () =>
      suscribirseAnuncios(() => {
        leerAnuncios(correo)
          .then(setAnuncios)
          .catch(() => setAnuncios([]));
      }),
    [correo],
  );

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function agregar(evento) {
    evento.preventDefault();
    setError("");

    const nombre = formulario.nombre.trim();
    const descripcion = formulario.descripcion.trim();
    const precio = Number(formulario.precio);

    if (!nombre) {
      setError(MENSAJES.anuncioNombre);
      return;
    }
    if (nombre.length > 60) {
      setError(MENSAJES.anuncioNombreLargo);
      return;
    }
    if (formulario.precio === "" || Number.isNaN(precio) || precio < 0) {
      setError(MENSAJES.anuncioPrecio);
      return;
    }
    if (descripcion.length > 160) {
      setError(MENSAJES.anuncioDescripcionLarga);
      return;
    }

    setOcupado(true);
    try {
      await guardarAnuncio(correo, { ...formulario, nombre, descripcion, precio });
      setAnuncios(await leerAnuncios(correo));
      setFormulario(FORMULARIO_VACIO);
      setAviso(MENSAJES.anuncioAgregado);
      navegar("/proveedor");
    } catch {
      setAviso(MENSAJES.anuncioSinPublicar);
    } finally {
      setOcupado(false);
    }
  }

  async function eliminar(id) {
    setOcupado(true);
    try {
      await borrarAnuncio(correo, id);
      setAnuncios(await leerAnuncios(correo));
      setAviso(MENSAJES.anuncioEliminado);
    } catch {
      setAviso(MENSAJES.anuncioSinPublicar);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="pagina">
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">Mi puesto</p>
          <h1>Anuncia lo que sabes hacer</h1>
          <p>
            Publica DJ, comida, decoración u otros servicios. Un administrador revisa cada anuncio antes de mostrarlo.
          </p>
        </div>
        {!formularioAbierto && (
          <button type="button" className="boton" onClick={() => navegar("/proveedor/anunciar")}>
            Anunciar servicio
          </button>
        )}
      </header>

      {formularioAbierto && (
        <form className="panel formulario-anuncio" onSubmit={agregar} noValidate>
          <h2>Nuevo anuncio</h2>
          <div className="formulario">
            <label>
              Nombre de tu negocio
              <input
                value={formulario.negocio}
                maxLength={60}
                onChange={(evento) => cambiar("negocio", evento.target.value)}
                placeholder="Ej. Ritmo Events"
              />
            </label>
            <label>
              Categoría
              <select
                value={formulario.categoria}
                onChange={(evento) => cambiar("categoria", evento.target.value)}
              >
                {CATEGORIAS_PROVEEDOR.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nombre del servicio
              <input
                value={formulario.nombre}
                maxLength={60}
                onChange={(evento) => cambiar("nombre", evento.target.value)}
                placeholder="Ej. DJ para XV años"
              />
            </label>
            <label>
              Precio desde
              <input
                type="number"
                min="0"
                step="100"
                value={formulario.precio}
                onChange={(evento) => cambiar("precio", evento.target.value)}
              />
            </label>
            <label className="completo">
              Qué ofreces
              <textarea
                rows="3"
                value={formulario.descripcion}
                maxLength={160}
                onChange={(evento) => cambiar("descripcion", evento.target.value)}
                placeholder="Cuéntalo en una o dos frases."
              />
            </label>
          </div>
          {error && <p className="error-acceso">{error}</p>}
          <div className="acciones-formulario">
            <button type="submit" className="boton" disabled={ocupado}>
              {ocupado ? "Publicando…" : "Publicar anuncio"}
            </button>
            <button
              type="button"
              className="boton boton-secundario"
              onClick={() => navegar("/proveedor")}
              disabled={ocupado}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="panel">
        <div className="anuncios-cabecera">
          <h2>Mis anuncios</h2>
          <span>{anuncios.length} publicados</span>
        </div>
        {anuncios.length === 0 ? (
          <p className="vacio-texto">Todavía no publicaste nada. Empieza con un servicio sencillo.</p>
        ) : (
          <div className="lista-anuncios">
            {anuncios.map((anuncio) => (
              <article className="anuncio-tarjeta" key={anuncio.id}>
                <img
                  src={fotoDe(anuncio.categoria)}
                  alt=""
                  onError={(evento) => {
                    evento.currentTarget.src = imagenDe(anuncio.categoria);
                  }}
                />
                <div>
                  <span className="etiqueta">{nombreCategoria(anuncio.categoria)}</span>
                  {anuncio.negocio && <small className="anuncio-negocio">{anuncio.negocio}</small>}
                  <h3>{anuncio.nombre}</h3>
                  <p>{anuncio.descripcion || "Sin descripción."}</p>
                  <div className="anuncio-pie">
                    <strong>{formatearMoneda(anuncio.precio)}</strong>
                    <button
                      type="button"
                      className="boton-texto"
                      onClick={() => eliminar(anuncio.id)}
                      disabled={ocupado}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
