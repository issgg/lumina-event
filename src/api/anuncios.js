import {
  borrarAnuncioBackend,
  borrarExtraBackend,
  corregirAnuncioBackend,
  guardarAnuncioBackend,
  guardarExtrasBackend,
  listarAnunciosBackend,
  listarAnunciosProveedor,
  listarExtrasBackend,
  listarRecomendadosBackend,
  revisarAnuncioBackend,
} from "./backendAdmin.js";
import { estadoAnuncioValido } from "../logica/validacion.js";

const EVENTO = "lumina-anuncios";

const IMAGENES = {
  musica: "musica",
  comida: "comida",
  decoracion: "decoracion",
  fotografia: "fotografia",
  mobiliario: "mobiliario",
  seguridad: "seguridad",
  detalles: "detalles",
};

function notificar() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO));
}

export function suscribirseAnuncios(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENTO, callback);
  return () => window.removeEventListener(EVENTO, callback);
}

function texto(valor) {
  return String(valor ?? "");
}

function desdeFila(fila) {
  return {
    id: texto(fila.id ?? fila.clave),
    correo: texto(fila.correo),
    negocio: texto(fila.negocio),
    categoria: texto(fila.categoria),
    nombre: texto(fila.nombre),
    descripcion: texto(fila.descripcion),
    precio: Number(fila.precio) || 0,
    imagen: texto(fila.imagen) || imagenDe(fila.categoria),
    estado: estadoAnuncioValido(fila.estado) ? fila.estado : "pendiente",
    motivo: texto(fila.motivo),
    creadoEn: texto(fila.creadoEn ?? fila.creado_en),
    revisadoEn: texto(fila.revisadoEn ?? fila.revisado_en),
  };
}

function ordenar(lista) {
  return lista
    .map(desdeFila)
    .sort((primero, segundo) => segundo.creadoEn.localeCompare(primero.creadoEn));
}

export function imagenDe(categoria) {
  return `assets/img/${IMAGENES[categoria] ?? "detalles"}.svg`;
}

export function fotoDe(categoria) {
  return `assets/fotos/${IMAGENES[categoria] ?? "detalles"}-1.jpg`;
}

export function servicioDeAnuncio(anuncio) {
  const normalizado = desdeFila(anuncio);
  const id = normalizado.id;
  return {
    id: id.startsWith("extra-") ? id : `extra-${id}`,
    categoria: normalizado.categoria,
    nombre: normalizado.nombre,
    descripcion: normalizado.descripcion,
    precio: normalizado.precio,
    proveedor: normalizado.negocio || "Proveedor local",
    imagen: imagenDe(normalizado.categoria),
  };
}

export async function leerAnuncios(tokenUsuario) {
  return ordenar(await listarAnunciosProveedor(tokenUsuario));
}

export async function listarAnunciosAdmin(tokenAdmin) {
  return ordenar(await listarAnunciosBackend(tokenAdmin));
}

export async function leerAnunciosAprobados() {
  return ordenar(await listarRecomendadosBackend());
}

export function leerExtrasManuales(tokenAdmin) {
  return listarExtrasBackend(tokenAdmin);
}

export function guardarExtrasManuales(tokenAdmin, servicios) {
  const resultado = guardarExtrasBackend(tokenAdmin, servicios);
  resultado.then(notificar).catch(() => {});
  return resultado;
}

export function borrarExtraManual(tokenAdmin, clave) {
  const resultado = borrarExtraBackend(tokenAdmin, clave);
  resultado.then(notificar).catch(() => {});
  return resultado;
}

export async function guardarAnuncio(tokenUsuario, datos) {
  const fila = {
    negocio: texto(datos.negocio ?? "").trim(),
    categoria: texto(datos.categoria),
    nombre: texto(datos.nombre ?? "").trim(),
    descripcion: texto(datos.descripcion ?? "").trim(),
    precio: Number(datos.precio) || 0,
  };
  const creado = await guardarAnuncioBackend(tokenUsuario, fila);
  notificar();
  return desdeFila(creado);
}

export async function corregirAnuncio(tokenUsuario, clave, datos) {
  const fila = {
    negocio: texto(datos.negocio ?? "").trim(),
    categoria: texto(datos.categoria),
    nombre: texto(datos.nombre ?? "").trim(),
    descripcion: texto(datos.descripcion ?? "").trim(),
    precio: Number(datos.precio) || 0,
  };
  await corregirAnuncioBackend(tokenUsuario, clave, fila);
  notificar();
}

export async function revisarAnuncioAdmin(tokenAdmin, clave, estado, motivo = "") {
  if (!estadoAnuncioValido(estado)) throw new Error("Estado de anuncio no válido");
  await revisarAnuncioBackend(tokenAdmin, clave, estado, motivo);
  notificar();
}

export async function borrarAnuncio(tokenUsuario, clave) {
  await borrarAnuncioBackend(tokenUsuario, clave);
  notificar();
}
