import {
  crearCompraBackend,
  listarComprasAdminBackend,
  listarMisComprasBackend,
  revisarCompraBackend,
} from "./backendAdmin.js";
import { estadoCompraValido } from "../logica/validacion.js";

const EVENTO = "lumina-compras";

function notificar() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENTO));
}

export function suscribirseCompras(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENTO, callback);
  return () => window.removeEventListener(EVENTO, callback);
}

function texto(valor) {
  return String(valor ?? "");
}

export function desdeFilaCompra(fila) {
  return {
    id: texto(fila.id ?? fila.clave),
    correo: texto(fila.correo),
    total: Number(fila.total) || 0,
    estado: estadoCompraValido(fila.estado) ? fila.estado : "pendiente",
    motivo: texto(fila.motivo),
    metodo: texto(fila.metodo) || "tarjeta",
    ultimos4: texto(fila.ultimos4),
    creadoEn: texto(fila.creadoEn ?? fila.creado_en),
    revisadoEn: texto(fila.revisadoEn ?? fila.revisado_en),
    instancia: fila.instancia && typeof fila.instancia === "object" ? fila.instancia : {},
  };
}

export async function crearCompra(tokenUsuario, datos) {
  const creada = await crearCompraBackend(tokenUsuario, datos);
  notificar();
  return desdeFilaCompra(creada);
}

export async function listarMisCompras(tokenUsuario) {
  const filas = await listarMisComprasBackend(tokenUsuario);
  return filas.map(desdeFilaCompra);
}

export async function listarComprasAdmin(tokenAdmin) {
  const filas = await listarComprasAdminBackend(tokenAdmin);
  return filas.map(desdeFilaCompra);
}

export async function revisarCompraAdmin(tokenAdmin, clave, estado, motivo = "") {
  if (!estadoCompraValido(estado)) throw new Error("Estado de compra no válido");
  await revisarCompraBackend(tokenAdmin, clave, estado, motivo);
  notificar();
}
