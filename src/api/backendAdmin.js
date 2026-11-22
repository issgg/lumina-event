import { solicitarConTiempo } from "./red.js";

const URL_BASE = String(import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
const CLAVE = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();
export const PREFIJO_TOKEN_ADMIN = "lumina-admin-";

export const backendAdminConfigurado = Boolean(URL_BASE && CLAVE);

async function solicitar(ruta, { metodo = "GET", cuerpo, tokenAdmin, tokenUsuario } = {}) {
  if (!backendAdminConfigurado) throw new Error("Falta configurar el backend");

  const respuesta = await solicitarConTiempo(`${URL_BASE}/functions/v1/lumina-admin${ruta}`, {
    method: metodo,
    headers: {
      apikey: CLAVE,
      "Content-Type": "application/json",
      ...(tokenAdmin ? { "x-admin-token": tokenAdmin } : {}),
      ...(tokenUsuario ? { Authorization: `Bearer ${tokenUsuario}` } : {}),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });

  const texto = await respuesta.text();
  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    throw new Error(datos?.error || datos?.message || texto || `Error ${respuesta.status}`);
  }
  return datos;
}

export function entrarAdminBackend(correo, clave) {
  return solicitar("/admin/login", { metodo: "POST", cuerpo: { correo, clave } });
}

export function listarAnunciosBackend(tokenAdmin) {
  return solicitar("/admin/anuncios", { tokenAdmin });
}

export function revisarAnuncioBackend(tokenAdmin, clave, estado, motivo) {
  return solicitar("/admin/revisar", {
    metodo: "POST",
    tokenAdmin,
    cuerpo: { clave, estado, motivo },
  });
}

export function listarExtrasBackend(tokenAdmin) {
  return solicitar("/admin/extras", { tokenAdmin });
}

export function guardarExtrasBackend(tokenAdmin, servicios) {
  return solicitar("/admin/extras", { metodo: "POST", tokenAdmin, cuerpo: { servicios } });
}

export function borrarExtraBackend(tokenAdmin, clave) {
  const parametros = new URLSearchParams({ clave });
  return solicitar(`/admin/extras?${parametros}`, { metodo: "DELETE", tokenAdmin });
}

export function listarAnunciosProveedor(tokenUsuario) {
  return solicitar("/proveedor/anuncios", { tokenUsuario });
}

export function guardarAnuncioBackend(tokenUsuario, datos) {
  return solicitar("/proveedor/anuncios", { metodo: "POST", tokenUsuario, cuerpo: datos });
}

export function corregirAnuncioBackend(tokenUsuario, clave, datos) {
  return solicitar("/proveedor/anuncios/corregir", {
    metodo: "POST",
    tokenUsuario,
    cuerpo: { clave, ...datos },
  });
}

export function borrarAnuncioBackend(tokenUsuario, clave) {
  const parametros = new URLSearchParams({ clave });
  return solicitar(`/proveedor/anuncios?${parametros}`, { metodo: "DELETE", tokenUsuario });
}

export function listarRecomendadosBackend() {
  return solicitar("/public/recomendados");
}
