import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  borrarAnuncio,
  corregirAnuncio,
  fotoDe,
  guardarAnuncio,
  imagenDe,
  leerAnuncios,
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

const TEXTO_ESTADO = {
  pendiente: "En revisión",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

function nombreCategoria(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id)?.nombre ?? id;
}

export default function Proveedor({ sesion, setAviso, formularioAbierto = false }) {
  const navegar = useNavigate();
  const token = sesion?.access_token ?? "";
  const [anuncios, setAnuncios] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [editando, setEditando] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let activo = true;
    leerAnuncios(token)
      .then((lista) => {
        if (activo) setAnuncios(lista);
      })
      .catch(() => {
        if (activo) setAnuncios([]);
      });
    return () => {
      activo = false;
    };
  }, [token]);

  useEffect(
    () =>
      suscribirseAnuncios(() => {
        leerAnuncios(token)
          .then(setAnuncios)
          .catch(() => setAnuncios([]));
      }),
    [token],
  );

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  function abrirEdicion(anuncio) {
    setError("");
    setEditando(anuncio.id);
    setFormulario({
      negocio: anuncio.negocio,
      categoria: anuncio.categoria,
      nombre: anuncio.nombre,
      descripcion: anuncio.descripcion,
      precio: String(anuncio.precio),
    });
    navegar("/proveedor/anunciar");
  }

  function cancelar() {
    setError("");
    setEditando("");
    setFormulario(FORMULARIO_VACIO);
    navegar("/proveedor");
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
      const datos = { ...formulario, nombre, descripcion, precio };
      if (editando) await corregirAnuncio(token, editando, datos);
      else await guardarAnuncio(token, datos);
      setAnuncios(await leerAnuncios(token));
      setFormulario(FORMULARIO_VACIO);
      setEditando("");
      setAviso(editando ? MENSAJES.anuncioCorregido : MENSAJES.anuncioAgregado);
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
      await borrarAnuncio(token, id);
      setAnuncios(await leerAnuncios(token));
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
          <button
            type="button"
            className="boton"
            onClick={() => {
              setEditando("");
              setFormulario(FORMULARIO_VACIO);
              setError("");
              navegar("/proveedor/anunciar");
            }}
          >
            Anunciar servicio
          </button>
        )}
      </header>

      {formularioAbierto && (
        <form className="panel formulario-anuncio" onSubmit={agregar} noValidate>
          <h2>{editando ? "Corregir anuncio" : "Nuevo anuncio"}</h2>
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
              {ocupado ? "Enviando…" : editando ? "Guardar corrección" : "Enviar a revisión"}
            </button>
            <button
              type="button"
              className="boton boton-secundario"
              onClick={cancelar}
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
          <span>{anuncios.length} enviados</span>
        </div>
        {anuncios.length === 0 ? (
          <p className="vacio-texto">Todavía no publicaste nada. Empieza con un servicio sencillo.</p>
        ) : (
          <div className="lista-anuncios">
            {anuncios.map((anuncio) => (
              <article
                className={`anuncio-tarjeta estado-${anuncio.estado}`}
                key={anuncio.id}
              >
                <img
                  src={fotoDe(anuncio.categoria)}
                  alt=""
                  onError={(evento) => {
                    evento.currentTarget.src = imagenDe(anuncio.categoria);
                  }}
                />
                <div>
                  <div className="revision-etiquetas">
                    <span className="etiqueta">{nombreCategoria(anuncio.categoria)}</span>
                    <span className={`estado-anuncio estado-${anuncio.estado}`}>
                      {TEXTO_ESTADO[anuncio.estado] ?? "En revisión"}
                    </span>
                  </div>
                  {anuncio.negocio && <small className="anuncio-negocio">{anuncio.negocio}</small>}
                  <h3>{anuncio.nombre}</h3>
                  <p>{anuncio.descripcion || "Sin descripción."}</p>
                  {anuncio.estado === "rechazado" && anuncio.motivo && (
                    <p className="revision-motivo">Motivo: {anuncio.motivo}</p>
                  )}
                  <div className="anuncio-pie">
                    <strong>{formatearMoneda(anuncio.precio)}</strong>
                    {anuncio.estado === "rechazado" && (
                      <button
                        type="button"
                        className="boton-texto"
                        onClick={() => abrirEdicion(anuncio)}
                        disabled={ocupado}
                      >
                        Corregir
                      </button>
                    )}
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
