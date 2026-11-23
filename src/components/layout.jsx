import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import {
  NAVEGACION,
  NAVEGACION_ADMIN,
  NAVEGACION_PROVEEDOR,
  RUTA_POR_ROL,
} from "../api/configuracion.js";

export default function Layout({ aviso, sesion, onCerrarSesion, onCambiarRol }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [tema, setTema] = useState(() => document.documentElement.dataset.tema || "oscuro");
  const correo = sesion?.user?.email ?? sesion?.user?.user_metadata?.email ?? "Invitado";
  const rol = sesion?.rol;
  const esAdmin = rol === "admin";
  const esProveedor = rol === "proveedor";
  const enlaces = esAdmin
    ? NAVEGACION_ADMIN
    : esProveedor
      ? NAVEGACION_PROVEEDOR
      : NAVEGACION;
  const rolSiguiente = esProveedor ? "organizador" : "proveedor";
  const cerrarMenu = () => setMenuAbierto(false);

  function alternarTema() {
    const nuevo = tema === "oscuro" ? "claro" : "oscuro";
    document.documentElement.dataset.tema = nuevo;
    setTema(nuevo);
    try {
      localStorage.setItem("lumina-tema", nuevo);
    } catch {
      return;
    }
  }

  return (
    <div className="aplicacion">
      <header className="encabezado">
        <NavLink to={RUTA_POR_ROL[rol] ?? "/"} className="marca" onClick={cerrarMenu}>
          <span className="marca-icono">L</span>
          <span>Lumina Event</span>
        </NavLink>
        <div className="encabezado-derecha">
          <button
            type="button"
            className="menu-movil"
            aria-expanded={menuAbierto}
            aria-controls="nav-principal"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <span className="menu-lineas" aria-hidden="true">
              <i></i>
              <i></i>
              <i></i>
            </span>
          </button>
          <nav
            id="nav-principal"
            aria-label="Navegación principal"
            className={menuAbierto ? "abierto" : undefined}
          >
            {enlaces.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => (isActive ? "enlace activo" : "enlace")}
                onClick={cerrarMenu}
              >
                {item.texto}
              </NavLink>
            ))}
          </nav>
          <span className="rol-etiqueta">
            {esAdmin ? "Administrador" : esProveedor ? "Proveedor" : "Organizador"}
          </span>
          {!esAdmin && (
            <button type="button" className="boton-rol" onClick={() => onCambiarRol(rolSiguiente)}>
              {esProveedor ? "Armar mi evento" : "Anunciar servicio"}
            </button>
          )}
          <button
            type="button"
            className="boton-tema"
            onClick={alternarTema}
            aria-label={tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {tema === "oscuro" ? "Ver claro" : "Ver oscuro"}
          </button>
          <div className="usuario">
            <span className="usuario-avatar" aria-hidden="true">
              {correo.charAt(0).toUpperCase()}
            </span>
            <span title={correo}>{correo}</span>
            <button type="button" className="boton-texto" onClick={onCerrarSesion}>
              Salir
            </button>
          </div>
        </div>
      </header>

      {aviso && <p className="aviso">{aviso}</p>}

      <main className="contenido">
        <Outlet />
      </main>

      <footer className="pie">
        <p>Lumina Event</p>
        {esAdmin ? (
          <>
            <Link className="pie-enlace" to="/compras">
              Revisar compras
            </Link>
            <Link className="pie-enlace" to="/administrar">
              Catálogo manual
            </Link>
          </>
        ) : esProveedor ? (
          <Link className="pie-enlace" to="/proveedor/anunciar">
            Anunciar
          </Link>
        ) : (
          <span>Eventos con calma</span>
        )}
      </footer>
    </div>
  );
}
