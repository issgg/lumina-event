import {
  guardarEvento as guardarEventoSQL,
  leerEvento as leerEventoSQL,
  limpiarEvento as limpiarEventoSQL,
  leerServiciosExtra as leerServiciosExtraSQL,
  guardarServiciosExtra as guardarServiciosExtraSQL
} from "./base-datos.js";

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

export function guardarEvento(evento) {
  return guardarEventoSQL(evento);
}

export function leerEvento() {
  return leerEventoSQL();
}

export function limpiarEvento() {
  limpiarEventoSQL();
}

export function leerServiciosExtra() {
  return leerServiciosExtraSQL();
}

export function guardarServiciosExtra(servicios) {
  return guardarServiciosExtraSQL(servicios);
}
