import { solicitarConTiempo } from "./red.js";

const URL_BASE = String(import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
const CLAVE = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

export const supabaseConfigurado = Boolean(URL_BASE && CLAVE);

function consulta(filtros) {
  const parametros = new URLSearchParams();
  Object.entries(filtros ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null) parametros.set(clave, String(valor));
  });
  const texto = parametros.toString();
  return texto ? `?${texto}` : "";
}

async function solicitar(tabla, { metodo = "GET", filtros, cuerpo, prefer } = {}) {
  if (!supabaseConfigurado) throw new Error("Supabase no está configurado");

  const respuesta = await solicitarConTiempo(`${URL_BASE}/rest/v1/${tabla}${consulta(metodo === "GET" ? { select: "*", ...filtros } : filtros)}`, {
    method: metodo,
    headers: {
      apikey: CLAVE,
      Authorization: `Bearer ${CLAVE}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Supabase ${tabla} (${respuesta.status}): ${detalle}`);
  }

  if (respuesta.status === 204) return [];
  return respuesta.json();
}

export function leerTabla(tabla, filtros) {
  return solicitar(tabla, { filtros });
}

export function insertarFilas(tabla, filas) {
  if (filas.length === 0) return Promise.resolve([]);
  return solicitar(tabla, { metodo: "POST", cuerpo: filas, prefer: "return=representation" });
}

export function upsertFilas(tabla, filas) {
  if (filas.length === 0) return Promise.resolve([]);
  return solicitar(tabla, {
    metodo: "POST",
    cuerpo: filas,
    prefer: "resolution=merge-duplicates,return=representation",
  });
}

export function actualizarFilas(tabla, filtros, cambios) {
  return solicitar(tabla, { metodo: "PATCH", filtros, cuerpo: cambios, prefer: "return=minimal" });
}

export function eliminarFilas(tabla, filtros) {
  return solicitar(tabla, { metodo: "DELETE", filtros, prefer: "return=minimal" });
}
