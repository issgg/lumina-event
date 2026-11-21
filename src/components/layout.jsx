import { NavLink, Outlet } from "react-router";
import { NAVEGACION } from "../api/configuracion.js";

export default function Layout({ aviso }) {
  return (
    <div className="aplicacion">
      <header className="encabezado">
        <NavLink to="/" className="marca">
          <span className="marca-icono">✦</span>
          <span>Lumina Event</span>
        </NavLink>
        <nav aria-label="Navegación principal">
          {NAVEGACION.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => (isActive ? "enlace activo" : "enlace")}
            >
              {item.texto}
            </NavLink>
          ))}
        </nav>
      </header>

      {aviso && <p className="aviso">{aviso}</p>}

      <main className="contenido">
        <Outlet />
      </main>

      <footer className="pie">
        <p>Lumina Event · Datos con SQL · Proyecto de Aplicaciones Web</p>
      </footer>
    </div>
  );
}
