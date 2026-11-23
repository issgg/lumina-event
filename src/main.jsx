import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import { MotionConfig } from "framer-motion";
import "lenis/dist/lenis.css";
import "./index.css";
import App from "./App.jsx";
import { capturarSesionRedireccion } from "./api/autenticacion.js";

capturarSesionRedireccion();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <App />
      </HashRouter>
    </MotionConfig>
  </StrictMode>,
);
