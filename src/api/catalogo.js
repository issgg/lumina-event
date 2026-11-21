import { consultarServicios } from "./baseDatos.js";

export function cargarServicios() {
  return consultarServicios();
}
