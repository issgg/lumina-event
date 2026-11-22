import { useState } from "react";
import {
  authConfigurado,
  iniciarConGoogle,
  iniciarSesionAdmin,
  iniciarSesionCorreo,
  registrarseCorreo,
} from "../api/autenticacion.js";
import { ADMIN, ROLES_REGISTRO } from "../api/configuracion.js";

function errorGuardado() {
  try {
    return window.sessionStorage.getItem("lumina-auth-error") ?? "";
  } catch {
    return "";
  }
}

function olvidarError() {
  try {
    window.sessionStorage.removeItem("lumina-auth-error");
  } catch {
    return;
  }
}

export default function Acceso({ onSesion }) {
  const [modo, setModo] = useState("entrar");
  const [rol, setRol] = useState("organizador");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState(errorGuardado);
  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);

  function cambiarModo(nuevo) {
    setModo(nuevo);
    setError("");
    setMensaje("");
    olvidarError();
  }

  function cambiarRol(nuevo) {
    setRol(nuevo);
    setError("");
    setMensaje("");
    olvidarError();
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");
    setMensaje("");
    olvidarError();

    if (clave.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (
      modo === "entrar" &&
      correo.trim().toLowerCase() === ADMIN.correo &&
      clave === ADMIN.clave
    ) {
      setOcupado(true);
      try {
        onSesion(iniciarSesionAdmin(ADMIN.correo, ADMIN.clave));
      } catch (fallo) {
        setError(fallo.message || "No se pudo completar el acceso.");
      } finally {
        setOcupado(false);
      }
      return;
    }

    setOcupado(true);
    try {
      if (modo === "entrar") {
        onSesion(await iniciarSesionCorreo(correo, clave, rol));
      } else {
        const resultado = await registrarseCorreo(correo, clave, rol);
        if (resultado.sesion) {
          onSesion(resultado.sesion);
        } else {
          setMensaje("Cuenta creada. Revisa tu correo para confirmarla y vuelve a entrar.");
          setModo("entrar");
        }
      }
    } catch (fallo) {
      setError(fallo.message || "No se pudo completar la acción.");
    } finally {
      setOcupado(false);
    }
  }

  function google() {
    setError("");
    setMensaje("");
    olvidarError();
    try {
      iniciarConGoogle(rol);
    } catch (fallo) {
      setError(fallo.message || "No se pudo abrir Google.");
    }
  }

  const esProveedor = rol === "proveedor";

  return (
    <main className="acceso">
      <div className="acceso-contenedor">
        <aside className="acceso-lado">
          <div className="acceso-marca">
            <span className="marca-icono">L</span>
            <span>Lumina Event</span>
          </div>
          <p className="acceso-kicker">Tu acceso</p>
          <h2>
            {esProveedor
              ? "Tu servicio, frente a más celebraciones."
              : "Cada celebración empieza con una buena entrada."}
          </h2>
          <p>
            {esProveedor
              ? "Anuncia lo que haces, elige una categoría y deja que los organizadores te encuentren."
              : "Un espacio para armar tu evento con calma: servicios, presupuesto y cronograma en un solo lugar."}
          </p>
          <div className="acceso-puntos">
            {esProveedor ? (
              <>
                <span>
                  <b>01</b> Elige tu categoría
                </span>
                <span>
                  <b>02</b> Cuenta qué ofreces
                </span>
                <span>
                  <b>03</b> Publícalo en el catálogo
                </span>
              </>
            ) : (
              <>
                <span>
                  <b>01</b> Explora opciones
                </span>
                <span>
                  <b>02</b> Ajusta el presupuesto
                </span>
                <span>
                  <b>03</b> Revisa el cronograma
                </span>
              </>
            )}
          </div>
        </aside>

        <section className="acceso-tarjeta">
          <p className="etiqueta">Bienvenido</p>
          <h1>{modo === "entrar" ? "Entra a tu cuenta" : "Crea tu cuenta"}</h1>
          <p className="subtitulo">
            {esProveedor
              ? "Publica tus servicios y sigue donde lo dejaste."
              : "Guarda tus eventos y continua donde lo dejaste."}
          </p>

          <div className="pestanas" aria-label="Tipo de acceso">
            <button
              type="button"
              className={modo === "entrar" ? "activo" : ""}
              onClick={() => cambiarModo("entrar")}
            >
              Entrar
            </button>
            <button
              type="button"
              className={modo === "registrar" ? "activo" : ""}
              onClick={() => cambiarModo("registrar")}
            >
              Registrarme
            </button>
          </div>

          <div className="roles-acceso" aria-label="Tipo de cuenta">
            {ROLES_REGISTRO.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className={rol === opcion.id ? "activo" : ""}
                aria-pressed={rol === opcion.id}
                onClick={() => cambiarRol(opcion.id)}
              >
                <strong>{opcion.texto}</strong>
                <span>{opcion.descripcion}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="boton boton-secundario boton-google"
            onClick={google}
            disabled={!authConfigurado || ocupado}
          >
            <span className="google-marca">G</span>
            Continuar con Google
          </button>

          {!authConfigurado && <p className="texto-aviso">Falta configurar el acceso.</p>}

          <div className="separador">
            <span>o con tu correo</span>
          </div>

          <form className="formulario-acceso" onSubmit={enviar}>
            <label>
              Correo
              <input
                type="email"
                autoComplete="email"
                value={correo}
                onChange={(evento) => setCorreo(evento.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                value={clave}
                onChange={(evento) => setClave(evento.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </label>

            {error && <p className="error-acceso">{error}</p>}
            {mensaje && <p className="mensaje-acceso">{mensaje}</p>}

            <button type="submit" className="boton" disabled={!authConfigurado || ocupado}>
              {ocupado ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
