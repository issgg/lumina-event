import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router";

import { inicializarBase, guardarEvento, leerEvento } from "./api/baseDatos.js";
import { eventoVacio } from "./logica/evento.js";
import { MENSAJES } from "./logica/mensajes.js";
import Layout from "./components/layout.jsx";
import Inicio from "./components/inicio.jsx";
import Catalogo from "./components/catalogo.jsx";
import Armador from "./components/armador.jsx";
import Resumen from "./components/resumen.jsx";
import Administrar from "./components/administrar.jsx";

import "./App.css";

export default function App() {
  const [listo, setListo] = useState(false);
  const [errorBase, setErrorBase] = useState("");
  const [evento, setEvento] = useState(eventoVacio());
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    inicializarBase()
      .then(async () => {
        const guardado = await leerEvento();
        if (guardado) {
          setEvento(guardado);
          setAviso(MENSAJES.recuperado);
        }
        setListo(true);
      })
      .catch(() => {
        setErrorBase(MENSAJES.errorBase);
        setListo(true);
      });
  }, []);

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

  return (
    <Routes>
      <Route path="/" element={<Layout aviso={aviso} />}>
        <Route index element={<Inicio />} />
        <Route
          path="catalogo"
          element={<Catalogo evento={evento} onActualizar={actualizarEvento} setAviso={setAviso} />}
        />
        <Route
          path="armador"
          element={<Armador evento={evento} onActualizar={actualizarEvento} setAviso={setAviso} />}
        />
        <Route
          path="resumen"
          element={<Resumen evento={evento} onActualizar={actualizarEvento} setAviso={setAviso} />}
        />
        <Route path="administrar" element={<Administrar setAviso={setAviso} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
