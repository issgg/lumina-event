import { entrarAdminBackend, PREFIJO_TOKEN_ADMIN, registrarBackend } from "./backendAdmin.js";
import { rolValido } from "./configuracion.js";
import { solicitarConTiempo } from "./red.js";

const URL_BASE = String(import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
const CLAVE = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();
const CLAVE_LOCAL = "lumina-sesion";

export const authConfigurado = Boolean(URL_BASE && CLAVE);

export async function iniciarSesionAdmin(correo, clave) {
  const datos = await entrarAdminBackend(correo, clave);
  return guardarSesion(
    {
      access_token: datos.token,
      refresh_token: "",
      expires_at: datos.expires_at,
      rol: "admin",
      user: {
        email: datos.correo,
        user_metadata: { rol: "admin" },
      },
    },
    "admin",
  );
}

function ahora() {
  return Math.floor(Date.now() / 1000);
}

function normalizarSesion(datos, rolElegido) {
  if (!datos?.access_token) throw new Error("No se pudo iniciar sesión");
  const expira = Number(datos.expires_at ?? ahora() + Number(datos.expires_in ?? 3600));
  return {
    access_token: datos.access_token,
    refresh_token: datos.refresh_token ?? "",
    expires_at: expira,
    rol: rolValido(rolElegido ?? datos.rol ?? datos.user?.user_metadata?.rol),
    user: datos.user ?? null,
  };
}

function leerSesion() {
  if (typeof window === "undefined") return null;
  try {
    const texto = window.localStorage.getItem(CLAVE_LOCAL);
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

function guardarSesion(sesion, rolElegido) {
  const normalizada = normalizarSesion(sesion, rolElegido);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CLAVE_LOCAL, JSON.stringify(normalizada));
  }
  return normalizada;
}

export function limpiarSesion() {
  if (typeof window !== "undefined") window.localStorage.removeItem(CLAVE_LOCAL);
}

export function guardarRolLocal(rol, sesionActual) {
  const guardada = sesionActual ?? leerSesion();
  if (!guardada) return null;

  const nuevo = rolValido(rol);
  const user = guardada.user ?? null;
  return guardarSesion(
    {
      ...guardada,
      user: user
        ? {
            ...user,
            user_metadata: { ...(user.user_metadata ?? {}), rol: nuevo },
          }
        : user,
      rol: nuevo,
    },
    nuevo,
  );
}

export async function actualizarRol(rol, sesionActual) {
  const guardada = sesionActual ?? leerSesion();
  if (!guardada) return null;

  const nuevo = rolValido(rol);
  if (guardada.access_token.startsWith(PREFIJO_TOKEN_ADMIN)) return guardarRolLocal(nuevo, guardada);

  const datos = await solicitarAuth("/user", {
    metodo: "PATCH",
    cuerpo: { user_metadata: { rol: nuevo } },
    token: guardada.access_token,
  });

  return guardarRolLocal(nuevo, { ...guardada, user: datos ?? guardada.user });
}

async function solicitarAuth(ruta, { metodo = "GET", cuerpo, token } = {}) {
  if (!authConfigurado) throw new Error("Falta configurar Supabase");

  const respuesta = await solicitarConTiempo(`${URL_BASE}/auth/v1${ruta}`, {
    method: metodo,
    headers: {
      apikey: CLAVE,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    throw new Error(datos?.msg || datos?.message || datos?.error_description || texto || `Error ${respuesta.status}`);
  }
  return datos;
}

async function consultarUsuario(token) {
  try {
    return (await solicitarAuth("/user", { token })) ?? null;
  } catch {
    return null;
  }
}

export async function obtenerSesion() {
  const guardada = leerSesion();
  if (!guardada) return null;

  if (guardada.expires_at > ahora() + 60) {
    if (guardada.user) return guardada;
    return guardarSesion({ ...guardada, user: await consultarUsuario(guardada.access_token) });
  }

  if (!guardada.refresh_token) {
    limpiarSesion();
    return null;
  }

  try {
    const datos = await solicitarAuth("/token?grant_type=refresh_token", {
      metodo: "POST",
      cuerpo: { refresh_token: guardada.refresh_token },
    });
    return guardarSesion({ ...datos, user: datos?.user ?? guardada.user }, guardada.rol);
  } catch {
    limpiarSesion();
    return null;
  }
}

export async function iniciarSesionCorreo(correo, clave, rolElegido) {
  const datos = await solicitarAuth("/token?grant_type=password", {
    metodo: "POST",
    cuerpo: { email: correo.trim(), password: clave },
  });
  const sesion = guardarSesion(datos, rolElegido);

  try {
    if (datos?.user?.user_metadata?.rol !== sesion.rol) {
      return await actualizarRol(sesion.rol, sesion);
    }
  } catch {
    return sesion;
  }
  return sesion;
}

export async function registrarseCorreo(datosRegistro, rolElegido) {
  const rol = rolValido(rolElegido);
  const datos = await registrarBackend({ ...datosRegistro, rol });
  if (!datos?.access_token) throw new Error("No se pudo crear la sesión. Intenta entrar.");
  return { sesion: guardarSesion(datos, rol), pendiente: false };
}

export function iniciarConGoogle(rolElegido) {
  if (!authConfigurado) throw new Error("Falta configurar Supabase");
  try {
    window.sessionStorage.setItem("lumina-rol-elegido", rolValido(rolElegido));
  } catch {
    return;
  }
  const destino = `${window.location.origin}${window.location.pathname}`;
  const url = new URL(`${URL_BASE}/auth/v1/authorize`);
  url.searchParams.set("provider", "google");
  url.searchParams.set("redirect_to", destino);
  window.location.assign(url.toString());
}

export async function cerrarSesion() {
  const guardada = leerSesion();
  limpiarSesion();
  if (guardada?.access_token && !guardada.access_token.startsWith(PREFIJO_TOKEN_ADMIN)) {
    try {
      await solicitarAuth("/logout", { metodo: "POST", token: guardada.access_token });
    } catch {
      limpiarSesion();
    }
  }
}

export function capturarSesionRedireccion() {
  if (typeof window === "undefined") return;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;

  const parametros = new URLSearchParams(hash);
  const esRetorno = parametros.has("access_token") || parametros.has("error");
  if (!esRetorno) return;

  const error = parametros.get("error_description") || parametros.get("error");
  if (error) {
    try {
      window.sessionStorage.setItem("lumina-auth-error", error);
    } catch {
      limpiarSesion();
    }
  } else {
    let rolElegido;
    try {
      rolElegido = window.sessionStorage.getItem("lumina-rol-elegido") ?? undefined;
      window.sessionStorage.removeItem("lumina-rol-elegido");
    } catch {
      rolElegido = undefined;
    }
    guardarSesion(Object.fromEntries(parametros.entries()), rolElegido);
  }

  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}
