import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  borrarExtraManual,
  guardarExtrasManuales,
  leerExtrasManuales,
} from "../api/anuncios.js";
import { CATEGORIAS } from "../api/configuracion.js";
import { formatearMoneda } from "../logica/formato.js";
import { MENSAJES } from "../logica/mensajes.js";
import { elemento, grupo } from "../movimiento.js";
import Pagina from "./pagina.jsx";

const FORMULARIO_VACIO = {
  nombre: "",
  categoria: CATEGORIAS[0].id,
  proveedor: "",
  descripcion: "",
  precio: "",
};

export default function Administrar({ token, setAviso }) {
  const [extras, setExtras] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

  useEffect(() => {
    let activo = true;
    leerExtrasManuales(token)
      .then((lista) => {
        if (activo) setExtras(lista);
      })
      .catch(() => {
        if (activo) setExtras([]);
      });
    return () => {
      activo = false;
    };
  }, [token]);

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function agregar(eventoFormulario) {
    eventoFormulario.preventDefault();
    const nombre = formulario.nombre.trim();
    const textoPrecio = String(formulario.precio ?? "").trim();
    const precio = Number(textoPrecio);

    if (!nombre) {
      setAviso(MENSAJES.adminNombre);
      return;
    }
    if (!textoPrecio || !Number.isFinite(precio) || precio < 0) {
      setAviso(MENSAJES.adminPrecio);
      return;
    }

    try {
      setExtras(
        await guardarExtrasManuales(token, [
          ...extras,
          {
            id: `extra-${Date.now()}`,
            nombre,
            categoria: formulario.categoria,
            proveedor: formulario.proveedor.trim() || "Proveedor local",
            descripcion: formulario.descripcion.trim(),
            precio,
            imagen: "assets/img/detalles.svg",
          },
        ]),
      );
      setFormulario(FORMULARIO_VACIO);
      setAviso(MENSAJES.adminAgregado);
    } catch {
      setAviso(MENSAJES.falloGuardado);
    }
  }

  async function eliminar(id) {
    try {
      setExtras(await borrarExtraManual(token, id));
      setAviso(MENSAJES.adminEliminado);
    } catch {
      setAviso(MENSAJES.falloGuardado);
    }
  }

  return (
    <Pagina>
      <header className="titulo-pagina">
        <div>
          <p className="etiqueta">Panel básico</p>
          <h1>Administrar catálogo</h1>
          <p>Los servicios nuevos quedan disponibles en el catálogo.</p>
        </div>
      </header>

      <motion.div className="paneles" variants={grupo} initial="hidden" animate="show">
        <motion.form className="panel" onSubmit={agregar} variants={elemento}>
          <h2>Agregar servicio</h2>
          <div className="formulario">
            <label>
              Nombre
              <input value={formulario.nombre} maxLength={80} onChange={(eventoCambio) => cambiar("nombre", eventoCambio.target.value)} />
            </label>
            <label>
              Categoría
              <select value={formulario.categoria} onChange={(eventoCambio) => cambiar("categoria", eventoCambio.target.value)}>
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Proveedor
              <input value={formulario.proveedor} maxLength={80} onChange={(eventoCambio) => cambiar("proveedor", eventoCambio.target.value)} />
            </label>
            <label>
              Precio
              <input type="number" min="0" step="100" value={formulario.precio} onChange={(eventoCambio) => cambiar("precio", eventoCambio.target.value)} />
            </label>
            <label className="completo">
              Descripción
              <textarea rows="3" value={formulario.descripcion} maxLength={200} onChange={(eventoCambio) => cambiar("descripcion", eventoCambio.target.value)} />
            </label>
          </div>
          <button className="boton" type="submit">
            Guardar servicio
          </button>
        </motion.form>

        <motion.aside className="panel" variants={elemento}>
          <h2>Servicios agregados</h2>
          {extras.length === 0 ? (
            <p className="vacio-texto">No hay servicios agregados por el administrador.</p>
          ) : (
            <ul className="lista-evento">
              {extras.map((servicio) => (
                <motion.li key={servicio.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <div>
                    <strong>{servicio.nombre}</strong>
                    <small>{servicio.categoria} · {servicio.proveedor}</small>
                  </div>
                  <span className="subtotal">{formatearMoneda(servicio.precio)}</span>
                  <button type="button" className="boton-texto" onClick={() => eliminar(servicio.id)}>
                    Eliminar
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.aside>
      </motion.div>
    </Pagina>
  );
}
