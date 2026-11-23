import { CATEGORIAS_PROVEEDOR } from "../api/configuracion.js";
import { MENSAJES } from "./mensajes.js";

export function validarRegistro(rol, datos) {
  const nombre = String(datos?.nombre ?? "").trim();
  const correo = String(datos?.correo ?? "").trim().toLowerCase();
  const telefono = String(datos?.telefono ?? "").trim();
  const clave = String(datos?.clave ?? "");
  const repetirClave = String(datos?.repetirClave ?? "");
  const negocio = String(datos?.negocio ?? "").trim();
  const categoria = String(datos?.categoria ?? "").trim();
  const descripcion = String(datos?.descripcion ?? "").trim();

  if (rol !== "organizador" && rol !== "proveedor") return MENSAJES.registroRol;
  if (!nombre || nombre.length > 60) return MENSAJES.registroNombre;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return MENSAJES.registroCorreo;
  if (!/^\d[\d\s()+-]{6,19}$/.test(telefono)) return MENSAJES.registroTelefono;
  if (clave.length < 6) return MENSAJES.registroClave;
  if (clave !== repetirClave) return MENSAJES.registroClaveDistinta;

  if (rol === "proveedor") {
    if (!negocio || negocio.length > 80) return MENSAJES.registroNegocio;
    if (!CATEGORIAS_PROVEEDOR.some((item) => item.id === categoria)) return MENSAJES.registroCategoria;
    if (descripcion.length > 200) return MENSAJES.registroDescripcion;
  }

  return "";
}

export function validarBusqueda(texto) {
  const limpio = String(texto ?? "").trim();
  if (limpio.length > 60) return MENSAJES.buscarLargo;
  return "";
}

export function estadoAnuncioValido(estado) {
  return ["pendiente", "aprobado", "rechazado"].includes(estado);
}

export function anuncioPublicable(anuncio) {
  return Boolean(anuncio) && anuncio.estado === "aprobado";
}

export function motivoRechazoValido(motivo) {
  const limpio = String(motivo ?? "").trim();
  return limpio.length > 0 && limpio.length <= 200;
}

export function validarDatosEvento(datos, tiposEvento = [], opciones = {}) {
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

  if (!/^-?\d+$/.test(invitados)) errores.invitados = MENSAJES.invitadosNumero;
  else if (Number(invitados) < 1) errores.invitados = MENSAJES.invitadosPositivo;
  else if (Number(invitados) > 10000) errores.invitados = MENSAJES.invitadosMaximo;

  const numeroPresupuesto = Number(presupuesto);
  if (!presupuesto || !Number.isFinite(numeroPresupuesto) || numeroPresupuesto < 0) {
    errores.presupuesto = MENSAJES.presupuestoNumero;
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horaInicio)) errores.horaInicio = MENSAJES.horaInvalida;

  if (opciones.requerirSalon !== false && !salonId) errores.salonId = MENSAJES.salonRequerido;

  return { validos: Object.keys(errores).length === 0, errores };
}
