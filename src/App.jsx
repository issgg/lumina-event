import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router";

import { inicializarBase, guardarEvento, leerEvento } from "./api/baseDatos.js";
import { actualizarRol, cerrarSesion, obtenerSesion } from "./api/autenticacion.js";
import { RUTA_POR_ROL } from "./api/configuracion.js";
import { eventoVacio } from "./logica/evento.js";
import { MENSAJES } from "./logica/mensajes.js";
import Acceso from "./components/acceso.jsx";
import Layout from "./components/layout.jsx";
import Inicio from "./components/inicio.jsx";
import Catalogo from "./components/catalogo.jsx";
import Armador from "./components/armador.jsx";
import Salon from "./components/salon.jsx";
import Resumen from "./components/resumen.jsx";
import Pago from "./components/pago.jsx";
import Administrar from "./components/administrar.jsx";
import Proveedor from "./components/proveedor.jsx";

import "./App.css";

export default function App() {
  const navegar = useNavigate();
  const [sesion, setSesion] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [listo, setListo] = useState(false);
  const [errorBase, setErrorBase] = useState("");
  const [evento, setEvento] = useState(eventoVacio());
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let activo = true;
    obtenerSesion()
      .then((encontrada) => {
        if (activo) setSesion(encontrada);
      })
      .catch(() => {
        if (activo) setSesion(null);
      })
      .finally(() => {
        if (activo) setVerificandoSesion(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!sesion) return;
    inicializarBase()
      .then(async () => {
        const guardado = await leerEvento();
        if (guardado) {
          setEvento(guardado);
          setAviso(MENSAJES.recuperado);
        }
        setListo(true);
      })
      .catch((error) => {
        setErrorBase(error?.name === "ErrorDeRed" ? error.message : MENSAJES.errorBase);
        setListo(true);
      });
  }, [sesion]);

  async function actualizarEvento(nuevo, mensaje = "", guardar = true) {
    setEvento(nuevo);
    if (!guardar) {
      if (mensaje) setAviso(mensaje);
      return true;
    }
    try {
      const guardado = await guardarEvento(nuevo);
      if (!guardado) {
        setAviso(MENSAJES.falloGuardado);
        return false;
      }
      if (mensaje) setAviso(mensaje);
      return true;
    } catch {
      setAviso(MENSAJES.falloGuardado);
      return false;
    }
  }

  async function salir() {
    await cerrarSesion();
    setSesion(null);
    setEvento(eventoVacio());
    setAviso("");
  }

  async function cambiarRol(nuevo) {
    try {
      const actualizada = await actualizarRol(nuevo, sesion);
      if (!actualizada) return;
      setSesion(actualizada);
      setAviso(
        actualizada.rol === "proveedor" ? MENSAJES.modoProveedor : MENSAJES.modoOrganizador,
      );
      navegar(RUTA_POR_ROL[actualizada.rol] ?? "/");
    } catch {
      setAviso(MENSAJES.datosInvalidos);
    }
  }

  if (verificandoSesion) {
    return (
      <main className="estado">
        <p>Verificando acceso…</p>
      </main>
    );
  }

  if (!sesion) {
    return <Acceso onSesion={setSesion} />;
  }

  if (!listo) {
    return (
      <main className="estado">
        <p>Cargando Lumina Event…</p>
      </main>
    );
  }

  if (errorBase) {
    return (
      <main className="estado">
        <h1>No se pudo iniciar la base</h1>
        <p>{errorBase}</p>
        <button type="button" className="boton" onClick={() => location.reload()}>
          Reintentar
        </button>
      </main>
    );
  }

  const esProveedor = sesion?.rol === "proveedor";

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout
            aviso={aviso}
            sesion={sesion}
            onCerrarSesion={salir}
            onCambiarRol={cambiarRol}
          />
        }
      >
        {esProveedor ? (
          <>
            <Route index element={<Navigate to="/proveedor" replace />} />
            <Route path="proveedor" element={<Proveedor sesion={sesion} setAviso={setAviso} />} />
            <Route
              path="proveedor/anunciar"
              element={<Proveedor sesion={sesion} setAviso={setAviso} formularioAbierto />}
            />
            <Route path="*" element={<Navigate to="/proveedor" replace />} />
          </>
        ) : (
          <>
            <Route index element={<Inicio evento={evento} />} />
            <Route
              path="catalogo"
              element={<Catalogo evento={evento} onActualizar={actualizarEvento} setAviso={setAviso} />}
            />
            <Route
              path="armador"
              element={<Armador evento={evento} onActualizar={actualizarEvento} setAviso={setAviso} />}
            />
            <Route
              path="salon"
              element={<Salon evento={evento} onActualizar={actualizarEvento} setAviso={setAviso} />}
            />
            <Route
              path="resumen"
              element={<Resumen evento={evento} onActualizar={actualizarEvento} setAviso={setAviso} />}
            />
            <Route
              path="pago"
              element={<Pago evento={evento} onActualizar={actualizarEvento} />}
            />
            <Route path="administrar" element={<Administrar setAviso={setAviso} />} />
            <Route path="proveedor" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Route>
    </Routes>
  );
}
