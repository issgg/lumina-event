import { HORA_INICIO_PREDETERMINADA } from "../api/configuracion.js";

export function eventoVacio() {
  return {
    nombre: "",
    tipoEvento: "",
    fecha: "",
    invitados: "",
    presupuesto: "",
    horaInicio: HORA_INICIO_PREDETERMINADA,
    salonId: "",
    detalles: [],
  };
}
