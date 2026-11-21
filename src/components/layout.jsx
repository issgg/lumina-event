import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { NAVEGACION } from "../api/configuracion.js";

export default function Layout({ aviso, sesion, onCerrarSesion }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const correo = sesion?.user?.email ?? sesion?.user?.user_metadata?.email ?? "Invitado";
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <div className="aplicacion">
      <header className="encabezado">
        <NavLink to="/" className="marca" onClick={cerrarMenu}>
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
            {NAVEGACION.map((item) => (
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
      </footer>
    </div>
  );
}
