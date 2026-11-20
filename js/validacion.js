import { MENSAJES } from "./errores.js";

export function validarBusqueda(texto) {
  const limpio = String(texto ?? "").trim();
  if (limpio.length > 60) return MENSAJES.buscarLargo;
  return "";
}

export function validarDatosEvento(datos, tiposEvento = []) {
  const errores = {};
  const nombre = String(datos.nombre ?? "").trim();
  const tipoEvento = String(datos.tipoEvento ?? "");
  const fecha = String(datos.fecha ?? "");
  const invitados = String(datos.invitados ?? "").trim();
  const presupuesto = String(datos.presupuesto ?? "").trim();
  const horaInicio = String(datos.horaInicio ?? "");
  const salonId = String(datos.salonId ?? "");

  if (!nombre) errores.nombre = MENSAJES.nombreVacio;
  else if (nombre.length > 60) errores.nombre = MENSAJES.nombreLargo;

  if (!tipoEvento) errores.tipoEvento = MENSAJES.tipoRequerido;
  else if (tiposEvento.length > 0 && !tiposEvento.includes(tipoEvento)) errores.tipoEvento = MENSAJES.tipoRequerido;

  if (!fecha) errores.fecha = MENSAJES.fechaRequerida;
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) errores.fecha = MENSAJES.fechaRequerida;
  else if (fecha < new Date().toISOString().slice(0, 10)) errores.fecha = MENSAJES.fechaPasada;

  if (!/^\d+$/.test(invitados)) errores.invitados = MENSAJES.invitadosNumero;
  else if (Number(invitados) < 1) errores.invitados = MENSAJES.invitadosPositivo;
  else if (Number(invitados) > 10000) errores.invitados = MENSAJES.invitadosMaximo;

  const numeroPresupuesto = Number(presupuesto);
  if (!presupuesto || !Number.isFinite(numeroPresupuesto) || numeroPresupuesto < 0) {
    errores.presupuesto = MENSAJES.presupuestoNumero;
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horaInicio)) errores.horaInicio = MENSAJES.horaInvalida;

  if (!salonId) errores.salonId = MENSAJES.salonRequerido;

  return { validos: Object.keys(errores).length === 0, errores };
}
