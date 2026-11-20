const CLAVE_EVENTO = "lumina.evento.v1";
const CLAVE_EXTRAS = "lumina.servicios.v1";

export function eventoVacio() {
  return {
    nombre: "",
    tipoEvento: "",
    fecha: "",
    invitados: "",
    presupuesto: "",
    horaInicio: "19:00",
    salonId: "",
    detalles: []
  };
}

function disponible() {
  return typeof localStorage !== "undefined";
}

export function guardarEvento(evento) {
  if (!disponible()) return false;
  try {
    localStorage.setItem(CLAVE_EVENTO, JSON.stringify(evento));
    return true;
  } catch {
    return false;
  }
}

export function leerEvento() {
  if (!disponible()) return null;
  try {
    const texto = localStorage.getItem(CLAVE_EVENTO);
    if (!texto) return null;
    const evento = JSON.parse(texto);
    if (!evento || typeof evento !== "object" || !Array.isArray(evento.detalles)) return null;
    return evento;
  } catch {
    return null;
  }
}

export function limpiarEvento() {
  if (!disponible()) return;
  try {
    localStorage.removeItem(CLAVE_EVENTO);
  } catch {
    return;
  }
}

export function leerServiciosExtra() {
  if (!disponible()) return [];
  try {
    const texto = localStorage.getItem(CLAVE_EXTRAS);
    if (!texto) return [];
    const servicios = JSON.parse(texto);
    return Array.isArray(servicios) ? servicios : [];
  } catch {
    return [];
  }
}

export function guardarServiciosExtra(servicios) {
  if (!disponible()) return false;
  try {
    localStorage.setItem(CLAVE_EXTRAS, JSON.stringify(servicios));
    return true;
  } catch {
    return false;
  }
}
