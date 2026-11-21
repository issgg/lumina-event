import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import { capturarSesionRedireccion } from "./api/autenticacion.js";

capturarSesionRedireccion();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
