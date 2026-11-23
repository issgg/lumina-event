import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { modalFondo, modalTarjeta } from "../movimiento.js";

const SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ModalDetalle({ abierto, onCerrar, tituloId, titulo = "detalle", galeria = [], children }) {
  const [fotoActual, setFotoActual] = useState(0);
  const claveGaleria = galeria.join("|");
  const indiceFoto = galeria.length ? Math.min(fotoActual, galeria.length - 1) : 0;
  const contenedor = useRef(null);
  const botonCerrar = useRef(null);
  const cerrarRef = useRef(onCerrar);
  const anterior = useRef(null);
  const overflowOriginal = useRef("");
  const abiertoRef = useRef(abierto);
  const temporizador = useRef(null);
  cerrarRef.current = onCerrar;
  abiertoRef.current = abierto;

  useEffect(() => {
    if (abierto) setFotoActual(0);
  }, [abierto, claveGaleria]);

  useEffect(() => {
    if (!abierto) return undefined;

    window.clearTimeout(temporizador.current);
    anterior.current = document.activeElement;
    overflowOriginal.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const cuadro = requestAnimationFrame(() => botonCerrar.current?.focus());

    function manejarTeclas(evento) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        cerrarRef.current();
        return;
      }
      if (evento.key !== "Tab" || !contenedor.current) return;

      const enfocables = Array.from(contenedor.current.querySelectorAll(SELECTOR)).filter(
        (nodo) => nodo.offsetParent !== null,
      );
      if (!enfocables.length) return;

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", manejarTeclas);
    return () => {
      cancelAnimationFrame(cuadro);
      document.removeEventListener("keydown", manejarTeclas);
      document.body.style.overflow = overflowOriginal.current;
      abiertoRef.current = false;
      window.clearTimeout(temporizador.current);
      temporizador.current = window.setTimeout(() => {
        const destino = anterior.current;
        if (destino && typeof destino.focus === "function") destino.focus();
      }, 320);
    };
  }, [abierto]);

  function devolverFoco() {
    window.clearTimeout(temporizador.current);
    document.body.style.overflow = overflowOriginal.current;
    const destino = anterior.current;
    if (destino && typeof destino.focus === "function") destino.focus();
  }

  return createPortal(
    <AnimatePresence onExitComplete={devolverFoco}>
      {abierto && (
        <motion.div
          className="modal-fondo"
          {...modalFondo}
          data-lenis-prevent
          onMouseDown={(evento) => {
            if (evento.target !== evento.currentTarget) return;
            if (
              evento.clientX > evento.currentTarget.clientWidth ||
              evento.clientY > evento.currentTarget.clientHeight
            ) {
              return;
            }
            cerrarRef.current();
          }}
        >
          <motion.div
            className="modal-tarjeta"
            ref={contenedor}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            {...modalTarjeta}
          >
            <button
              type="button"
              className="modal-cerrar"
              aria-label="Cerrar detalle"
              ref={botonCerrar}
              onClick={() => cerrarRef.current()}
            >
              ×
            </button>
            {galeria.length > 0 && (
              <div
                className="modal-imagen modal-galeria"
                role="group"
                aria-label={`Galería de fotos de ${titulo}`}
                tabIndex={0}
                onKeyDown={(evento) => {
                  if (evento.key === "ArrowRight") {
                    evento.preventDefault();
                    setFotoActual((actual) => (actual + 1) % galeria.length);
                  }
                  if (evento.key === "ArrowLeft") {
                    evento.preventDefault();
                    setFotoActual((actual) => (actual - 1 + galeria.length) % galeria.length);
                  }
                }}
              >
                <div className="modal-galeria-principal">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={galeria[indiceFoto]}
                      className="modal-galeria-foto"
                      role="img"
                      aria-label={`${titulo} · foto ${indiceFoto + 1} de ${galeria.length}`}
                      style={{ backgroundImage: `url("${galeria[indiceFoto]}")` }}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                    />
                  </AnimatePresence>
                  <span className="modal-foto-contador">
                    {indiceFoto + 1} / {galeria.length}
                  </span>
                </div>
                {galeria.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="modal-foto-nav anterior"
                      aria-label="Foto anterior"
                      onClick={() => setFotoActual((actual) => (actual - 1 + galeria.length) % galeria.length)}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="modal-foto-nav siguiente"
                      aria-label="Foto siguiente"
                      onClick={() => setFotoActual((actual) => (actual + 1) % galeria.length)}
                    >
                      ›
                    </button>
                    <div className="modal-miniaturas">
                      {galeria.map((foto, indice) => (
                        <button
                          type="button"
                          key={foto}
                          className={`modal-miniatura ${indice === indiceFoto ? "activa" : ""}`}
                          style={{ backgroundImage: `url("${foto}")` }}
                          aria-label={`Ver foto ${indice + 1}`}
                          aria-current={indice === indiceFoto}
                          onClick={() => setFotoActual(indice)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
