import { guardarServiciosExtra, leerServiciosExtra } from "./baseDatos.js";
import { anuncioPublicable, estadoAnuncioValido } from "../logica/validacion.js";
import {
  actualizarFilas,
  eliminarFilas,
  insertarFilas,
  leerTabla,
} from "./supabase.js";

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
    id: texto(fila.clave),
    correo: texto(fila.correo),
    negocio: texto(fila.negocio),
    categoria: texto(fila.categoria),
    nombre: texto(fila.nombre),
    descripcion: texto(fila.descripcion),
    precio: Number(fila.precio) || 0,
    imagen: texto(fila.imagen) || imagenDe(fila.categoria),
    estado: estadoAnuncioValido(fila.estado) ? fila.estado : "pendiente",
    motivo: texto(fila.motivo),
    creadoEn: texto(fila.creado_en),
    revisadoEn: texto(fila.revisado_en),
  };
}

function nuevoClave() {
  const azar = Math.random().toString(36).slice(2, 7);
  return `anuncio-${Date.now()}-${azar}`;
}

export function imagenDe(categoria) {
  return `assets/img/${IMAGENES[categoria] ?? "detalles"}.svg`;
}

export function fotoDe(categoria) {
  return `assets/fotos/${IMAGENES[categoria] ?? "detalles"}-1.jpg`;
}

function comoServicio(anuncio) {
  const id = texto(anuncio.id);
  return {
    id: id.startsWith("extra-") ? id : `extra-${id}`,
    categoria: anuncio.categoria,
    nombre: anuncio.nombre,
    descripcion: anuncio.descripcion,
    precio: Number(anuncio.precio) || 0,
    proveedor: anuncio.negocio || "Proveedor local",
    imagen: imagenDe(anuncio.categoria),
  };
}

export async function listarAnuncios(filtros = {}) {
  const filas = await leerTabla("anuncios", filtros);
  return filas
    .map(desdeFila)
    .sort((primero, segundo) => segundo.creadoEn.localeCompare(primero.creadoEn));
}

export function leerAnuncios(correo) {
  return listarAnuncios(correo ? { correo: `eq.${correo}` } : {});
}

export function leerAnunciosPendientes() {
  return listarAnuncios({ estado: "eq.pendiente" });
}

export function leerAnunciosAprobados() {
  return listarAnuncios({ estado: "eq.aprobado" });
}

export function leerExtrasManuales() {
  return leerServiciosExtra().filter((servicio) => !servicio.id.startsWith("extra-anuncio-"));
}

export async function sincronizarCatalogo() {
  const aprobados = (await leerAnunciosAprobados()).filter(anuncioPublicable);
  const manuales = leerExtrasManuales();
  await guardarServiciosExtra([...manuales, ...aprobados.map(comoServicio)]);
  notificar();
}

export async function publicarAnunciosGuardados() {
  return sincronizarCatalogo();
}

export async function guardarExtrasManuales(servicios) {
  const aprobados = (await leerAnunciosAprobados()).filter(anuncioPublicable);
  await guardarServiciosExtra([...servicios, ...aprobados.map(comoServicio)]);
  notificar();
}

export async function guardarAnuncio(correo, datos) {
  const fila = {
    clave: nuevoClave(),
    correo: texto(correo),
    negocio: texto(datos.negocio ?? "").trim(),
    categoria: texto(datos.categoria),
    nombre: texto(datos.nombre ?? "").trim(),
    descripcion: texto(datos.descripcion ?? "").trim(),
    precio: Number(datos.precio) || 0,
    imagen: imagenDe(datos.categoria),
    estado: "pendiente",
    motivo: null,
  };
  await insertarFilas("anuncios", [fila]);
  notificar();
  return desdeFila(fila);
}

export async function corregirAnuncio(clave, datos) {
  await actualizarFilas(
    "anuncios",
    { clave: `eq.${clave}` },
    {
      negocio: texto(datos.negocio ?? "").trim(),
      categoria: texto(datos.categoria),
      nombre: texto(datos.nombre ?? "").trim(),
      descripcion: texto(datos.descripcion ?? "").trim(),
      precio: Number(datos.precio) || 0,
      imagen: imagenDe(datos.categoria),
      estado: "pendiente",
      motivo: null,
      revisado_en: null,
    },
  );
  await sincronizarCatalogo();
}

export async function revisarAnuncio(clave, estado, motivo = "") {
  if (!estadoAnuncioValido(estado)) throw new Error("Estado de anuncio no válido");
  await actualizarFilas(
    "anuncios",
    { clave: `eq.${clave}` },
    {
      estado,
      motivo: estado === "rechazado" ? texto(motivo).trim().slice(0, 200) : null,
      revisado_en: new Date().toISOString(),
    },
  );
  await sincronizarCatalogo();
}

export async function borrarAnuncio(correo, clave) {
  await eliminarFilas("anuncios", { clave: `eq.${clave}`, correo: `eq.${correo}` });
  await sincronizarCatalogo();
}
