import { useState } from "react";
import {
  authConfigurado,
  iniciarConGoogle,
  iniciarSesionCorreo,
  registrarseCorreo,
} from "../api/autenticacion.js";

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

  async function enviar(evento) {
    evento.preventDefault();
    setError("");
    setMensaje("");
    olvidarError();

    if (clave.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setOcupado(true);
    try {
      if (modo === "entrar") {
        onSesion(await iniciarSesionCorreo(correo, clave));
      } else {
        const resultado = await registrarseCorreo(correo, clave);
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
      iniciarConGoogle();
    } catch (fallo) {
      setError(fallo.message || "No se pudo abrir Google.");
    }
  }

  return (
    <main className="acceso">
      <section className="acceso-tarjeta">
        <p className="etiqueta">Lumina Event</p>
        <h1>{modo === "entrar" ? "Entra a tu cuenta" : "Crea tu cuenta"}</h1>
        <p className="subtitulo">Guarda tus eventos y continua donde lo dejaste.</p>

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

        <button
          type="button"
          className="boton boton-secundario boton-google"
          onClick={google}
          disabled={!authConfigurado || ocupado}
        >
          <span className="google-marca">G</span>
          Continuar con Google
        </button>

        {!authConfigurado && <p className="texto-aviso">Falta configurar Supabase.</p>}

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
    </main>
  );
}
