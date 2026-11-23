export const curva = [0.22, 1, 0.36, 1];

export const transicion = { duration: 0.45, ease: curva };
export const transicionRapida = { duration: 0.22, ease: curva };

export const pagina = {
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: transicion },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(6px)",
    transition: { duration: 0.2, ease: curva },
  },
};

export const capaRuta = {
  entrada: {
    opacity: 0,
    scale: 0.9,
    y: 46,
    x: "-3%",
    filter: "blur(18px)",
    zIndex: 1,
  },
  centro: {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0,
    filter: "blur(0px)",
    zIndex: 2,
    pointerEvents: "auto",
    transition: { type: "spring", stiffness: 190, damping: 25, mass: 0.9 },
  },
  salida: {
    opacity: 0,
    scale: 1.1,
    y: -34,
    x: "4%",
    filter: "blur(14px)",
    zIndex: 1,
    pointerEvents: "none",
    transition: { duration: 0.55, ease: curva },
  },
};

export const contenidoCapa = {
  entrada: { opacity: 0, y: 24, filter: "blur(7px)" },
  centro: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: curva, delay: 0.08 },
  },
  salida: { opacity: 0, y: -14, transition: { duration: 0.25, ease: curva } },
};

export const barrido = {
  initial: { scaleX: 0, opacity: 0.9, x: "-60%" },
  animate: { scaleX: 1, x: "60%", opacity: 0, transition: { duration: 0.85, ease: curva } },
};

export const cortina = {
  initial: { x: "-110%", opacity: 1 },
  animate: {
    x: "110%",
    opacity: [1, 1, 0],
    transition: { duration: 0.95, ease: curva, times: [0, 0.72, 1] },
  },
};

export const latido = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: [0.8, 1.08, 1],
    opacity: 1,
    transition: { duration: 0.55, ease: curva },
  },
};

export const numero = {
  initial: { opacity: 0, y: 10, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 22 } },
};

export const grupo = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
};

export const elemento = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: transicionRapida },
};

export const entrada = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: transicion },
  exit: { opacity: 0, y: -10, transition: transicionRapida },
};

export const modalFondo = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.24, ease: curva } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: curva } },
};

export const modalTarjeta = {
  initial: { opacity: 0, y: 26, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 26 },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.98,
    transition: { duration: 0.18, ease: curva },
  },
};

export const aviso = {
  initial: { opacity: 0, y: -12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: transicionRapida },
  exit: { opacity: 0, y: -8, transition: { duration: 0.16, ease: curva } },
};

export const resaltado = {
  layout: { type: "spring", stiffness: 420, damping: 34 },
};

export function variantesFila(indice) {
  return {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { ...transicionRapida, delay: Math.min(indice * 0.025, 0.25) },
    },
  };
}
