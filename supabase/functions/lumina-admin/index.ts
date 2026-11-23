type RestOpciones = {
  metodo?: string;
  filtros?: Record<string, string>;
  cuerpo?: unknown;
  prefer?: string;
};

type Anuncio = {
  id: string;
  correo: string;
  negocio: string;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  estado: string;
  motivo: string;
  creadoEn: string;
  revisadoEn: string;
};

const PREFIJO_TOKEN = "lumina-admin-";
const CATEGORIAS = [
  "salones",
  "comida",
  "mobiliario",
  "musica",
  "decoracion",
  "fotografia",
  "detalles",
  "seguridad",
];
const ESTADOS = ["pendiente", "aprobado", "rechazado"];
const CATEGORIAS_PROVEEDOR = CATEGORIAS.filter((categoria) => categoria !== "salones");
const TIPOS_EVENTO = [
  "XV años",
  "Boda",
  "Cumpleaños",
  "Graduación",
  "Evento empresarial",
  "Aniversario",
];
const IMAGENES: Record<string, string> = {
  musica: "musica",
  comida: "comida",
  decoracion: "decoracion",
  fotografia: "fotografia",
  mobiliario: "mobiliario",
  seguridad: "seguridad",
  detalles: "detalles",
};

const CABECERAS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

function obligatoria(nombre: string) {
  const valor = Deno.env.get(nombre);
  if (!valor) throw new Error(`Falta configurar ${nombre} en la función`);
  return valor;
}

function urlBase() {
  return obligatoria("SUPABASE_URL").replace(/\/+$/, "");
}

function claveServicio() {
  return obligatoria("SUPABASE_SERVICE_ROLE_KEY");
}

function clavePublica() {
  return obligatoria("SUPABASE_ANON_KEY");
}

function json(datos: unknown, estado = 200) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { ...CABECERAS, "Content-Type": "application/json" },
  });
}

function texto(valor: unknown) {
  return String(valor ?? "").trim();
}

function numero(valor: unknown) {
  const resultado = Number(valor);
  return Number.isFinite(resultado) && resultado >= 0 ? resultado : 0;
}

function categoriaValida(valor: unknown) {
  return CATEGORIAS.includes(texto(valor));
}

function estadoValido(valor: unknown) {
  return ESTADOS.includes(texto(valor));
}

function imagenDe(categoria: unknown) {
  return `assets/img/${IMAGENES[texto(categoria)] ?? "detalles"}.svg`;
}

function codificar(valor: string) {
  const bytes = new TextEncoder().encode(valor);
  let binario = "";
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte);
  });
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodificar(valor: string) {
  const normalizado = valor.replace(/-/g, "+").replace(/_/g, "/");
  const relleno = normalizado.length % 4 ? "=".repeat(4 - (normalizado.length % 4)) : "";
  const binario = atob(`${normalizado}${relleno}`);
  const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function firma(valor: string) {
  const clave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(obligatoria("ADMIN_CLAVE")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const resultado = await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(valor));
  return codificar(String.fromCharCode(...new Uint8Array(resultado)));
}

async function crearToken(correo: string) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60;
  const cuerpo = codificar(JSON.stringify({ rol: "admin", correo, exp }));
  const firmaToken = await firma(cuerpo);
  return `${PREFIJO_TOKEN}${cuerpo}.${firmaToken}`;
}

async function tokenValido(token: string) {
  if (!token.startsWith(PREFIJO_TOKEN)) return false;
  const [cuerpo, firmaRecibida, extra] = token.slice(PREFIJO_TOKEN.length).split(".");
  if (!cuerpo || !firmaRecibida || extra) return false;
  if (firmaRecibida !== await firma(cuerpo)) return false;
  try {
    const datos = JSON.parse(decodificar(cuerpo));
    return datos.rol === "admin" && Number(datos.exp) > Date.now() / 1000;
  } catch {
    return false;
  }
}

async function adminDe(req: Request) {
  const token = req.headers.get("x-admin-token") ?? "";
  return await tokenValido(token);
}

async function usuarioDe(req: Request) {
  const autorizacion = req.headers.get("authorization") ?? "";
  const token = autorizacion.match(/^Bearer\s+(.+)$/i)?.[1] ?? "";
  if (!token) return null;

  const respuesta = await fetch(`${urlBase()}/auth/v1/user`, {
    headers: {
      apikey: clavePublica(),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!respuesta.ok) return null;

  const datos = await respuesta.json();
  const correo = texto(datos.email).toLowerCase();
  return correo ? { token, correo } : null;
}

async function rest(tabla: string, opciones: RestOpciones = {}) {
  const url = new URL(`${urlBase()}/rest/v1/${tabla}`);
  for (const [campo, valor] of Object.entries(opciones.filtros ?? {})) {
    url.searchParams.set(campo, valor);
  }

  const clave = claveServicio();
  const respuesta = await fetch(url, {
    method: opciones.metodo ?? "GET",
    headers: {
      apikey: clave,
      Authorization: `Bearer ${clave}`,
      "Content-Type": "application/json",
      ...(opciones.prefer ? { Prefer: opciones.prefer } : {}),
    },
    body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
  });

  const contenido = await respuesta.text();
  let datos: unknown = null;
  try {
    datos = contenido ? JSON.parse(contenido) : null;
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    const mensaje =
      (datos as { message?: string; error?: string } | null)?.message ??
      (datos as { error?: string } | null)?.error ??
      contenido ??
      `Error ${respuesta.status}`;
    throw new Error(mensaje);
  }
  return datos as Record<string, unknown>[];
}

function desdeFila(fila: Record<string, unknown>): Anuncio {
  const estado = texto(fila.estado);
  return {
    id: texto(fila.clave),
    correo: texto(fila.correo),
    negocio: texto(fila.negocio),
    categoria: texto(fila.categoria),
    nombre: texto(fila.nombre),
    descripcion: texto(fila.descripcion),
    precio: numero(fila.precio),
    imagen: texto(fila.imagen) || imagenDe(fila.categoria),
    estado: estadoValido(estado) ? estado : "pendiente",
    motivo: texto(fila.motivo),
    creadoEn: texto(fila.creado_en),
    revisadoEn: texto(fila.revisado_en),
  };
}

function datosAnuncio(cuerpo: Record<string, unknown>) {
  if (!categoriaValida(cuerpo.categoria)) throw new Error("Categoría no válida");
  const nombre = texto(cuerpo.nombre);
  if (!nombre || nombre.length > 80) throw new Error("Nombre no válido");
  const descripcion = texto(cuerpo.descripcion).slice(0, 200);
  const negocio = texto(cuerpo.negocio).slice(0, 80);
  return {
    negocio,
    categoria: texto(cuerpo.categoria),
    nombre,
    descripcion,
    precio: numero(cuerpo.precio),
    imagen: imagenDe(cuerpo.categoria),
  };
}

async function leerCuerpo(req: Request) {
  try {
    const datos = await req.json();
    return datos && typeof datos === "object" ? (datos as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function datosRegistro(cuerpo: Record<string, unknown>) {
  const rol = texto(cuerpo.rol);
  const nombre = texto(cuerpo.nombre);
  const correo = texto(cuerpo.correo).toLowerCase();
  const telefono = texto(cuerpo.telefono);
  const clave = String(cuerpo.clave ?? "");
  const repetirClave = String(cuerpo.repetirClave ?? "");
  const negocio = texto(cuerpo.negocio);
  const categoria = texto(cuerpo.categoria);
  const descripcion = texto(cuerpo.descripcion).slice(0, 200);
  const tipoEvento = texto(cuerpo.tipoEvento);

  if (rol !== "organizador" && rol !== "proveedor") throw new Error("Elige un tipo de cuenta.");
  if (!nombre || nombre.length > 60) throw new Error("Escribe tu nombre, máximo 60 caracteres.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) throw new Error("Escribe un correo válido.");
  if (!/^\d[\d\s()+-]{6,19}$/.test(telefono)) throw new Error("Escribe un teléfono válido.");
  if (clave.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
  if (clave !== repetirClave) throw new Error("Las contraseñas no coinciden.");

  if (rol === "proveedor") {
    if (!negocio || negocio.length > 80) throw new Error("Escribe el nombre de tu negocio.");
    if (!CATEGORIAS_PROVEEDOR.includes(categoria)) throw new Error("Elige una categoría válida.");
  } else {
    if (!TIPOS_EVENTO.includes(tipoEvento)) throw new Error("Elige el tipo de evento que planeas.");
  }

  return {
    rol,
    nombre,
    correo,
    telefono,
    clave,
    negocio,
    categoria,
    descripcion,
    tipoEvento,
  };
}

async function siguienteId(tabla: string) {
  const filas = await rest(tabla);
  return Math.max(1000, ...filas.map((fila) => Number(fila.id) || 0)) + 1;
}

async function crearUsuarioAuth(datos: ReturnType<typeof datosRegistro>) {
  const clave = claveServicio();
  const respuesta = await fetch(`${urlBase()}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: clave,
      Authorization: `Bearer ${clave}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: datos.correo,
      password: datos.clave,
      email_confirm: true,
      user_metadata: {
        rol: datos.rol,
        nombre: datos.nombre,
        telefono: datos.telefono,
        negocio: datos.negocio,
        categoria: datos.categoria,
        descripcion: datos.descripcion,
        tipo_evento: datos.tipoEvento,
      },
    }),
  });

  const contenido = await respuesta.text();
  let datosRespuesta: Record<string, unknown> | null = null;
  try {
    datosRespuesta = contenido ? (JSON.parse(contenido) as Record<string, unknown>) : null;
  } catch {
    datosRespuesta = null;
  }

  if (!respuesta.ok) {
    const mensaje = String(datosRespuesta?.msg ?? datosRespuesta?.message ?? "");
    if (respuesta.status === 422 || mensaje.toLowerCase().includes("registered")) {
      throw new Error("Ya existe una cuenta con ese correo.");
    }
    throw new Error(mensaje || "No se pudo crear la cuenta.");
  }
  return datosRespuesta ?? {};
}

async function borrarUsuarioAuth(id: string) {
  const clave = claveServicio();
  await fetch(`${urlBase()}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { apikey: clave, Authorization: `Bearer ${clave}` },
  });
}

async function iniciarSesionPassword(correo: string, clave: string) {
  const respuesta = await fetch(`${urlBase()}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: clavePublica(), "Content-Type": "application/json" },
    body: JSON.stringify({ email: correo, password: clave }),
  });
  const contenido = await respuesta.text();
  let datos: Record<string, unknown> = {};
  try {
    datos = contenido ? (JSON.parse(contenido) as Record<string, unknown>) : {};
  } catch {
    datos = {};
  }
  if (!respuesta.ok) throw new Error("La cuenta se creó, pero no se pudo iniciar sesión. Intenta entrar.");
  return datos;
}

async function registrarCuenta(cuerpo: Record<string, unknown>) {
  const datos = datosRegistro(cuerpo);
  const existentes = await rest("usuarios", { filtros: { correo: `eq.${datos.correo}` } });
  if (existentes.length) throw new Error("Ya existe una cuenta con ese correo.");

  let creado: Record<string, unknown> | null = null;
  try {
    creado = await crearUsuarioAuth(datos);
    await rest("usuarios", {
      metodo: "POST",
      cuerpo: [
        {
          id: await siguienteId("usuarios"),
          nombre: datos.nombre,
          correo: datos.correo,
          tipo: "usuario",
          telefono: datos.telefono,
          tipo_evento: datos.rol === "organizador" ? datos.tipoEvento : null,
        },
      ],
      prefer: "return=representation",
    });

    if (datos.rol === "proveedor") {
      await rest("proveedores", {
        metodo: "POST",
        cuerpo: [
          {
            id: await siguienteId("proveedores"),
            nombre: datos.negocio,
            telefono: datos.telefono,
            correo: datos.correo,
            descripcion: datos.descripcion,
            categoria: datos.categoria,
          },
        ],
        prefer: "return=representation",
      });
    }

    const sesion = await iniciarSesionPassword(datos.correo, datos.clave);
    return {
      access_token: sesion.access_token,
      refresh_token: sesion.refresh_token,
      expires_at: sesion.expires_at,
      expires_in: sesion.expires_in,
      user: sesion.user ?? creado,
      rol: datos.rol,
    };
  } catch (error) {
    if (creado?.id) await borrarUsuarioAuth(String(creado.id)).catch(() => {});
    throw error;
  }
}

function rutaDe(req: Request) {
  const partes = new URL(req.url).pathname.split("/");
  const indice = partes.indexOf("lumina-admin");
  const utiles = indice >= 0 ? partes.slice(indice + 1) : partes.filter(Boolean);
  return `/${utiles.filter(Boolean).join("/")}`;
}

async function proveedores() {
  return await rest("proveedores");
}

async function proveedorPara(nombre: string, lista: Record<string, unknown>[], siguiente: number) {
  const buscado = nombre.toLowerCase();
  const existente = lista.find((item) => texto(item.nombre).toLowerCase() === buscado);
  if (existente) return Number(existente.id);

  let id = siguiente;
  while (lista.some((item) => Number(item.id) === id)) id += 1;
  const [creado] = await rest("proveedores", {
    metodo: "POST",
    cuerpo: [{ id, nombre: nombre.slice(0, 80), telefono: "", correo: "" }],
    prefer: "return=representation",
  });
  lista.push(creado);
  return Number(creado.id);
}

async function sincronizar(manuales?: Record<string, unknown>[]) {
  const todosLosExtras = await rest("servicios", { filtros: { clave: "like.extra-%" } });
  const fuenteManuales = manuales ?? todosLosExtras.filter(
    (item) => !texto(item.clave).startsWith("extra-anuncio-"),
  );

  const aprobados = (await rest("anuncios", { filtros: { estado: "eq.aprobado" } }))
    .map(desdeFila)
    .filter((anuncio) => anuncio.estado === "aprobado" && anuncio.nombre);

  const categorias = await rest("categorias");
  const proveedoresLista = await proveedores();
  const siguienteProveedor = Math.max(2000, ...proveedoresLista.map((item) => Number(item.id) || 0)) + 1;
  const filas: Record<string, unknown>[] = [];

  for (const manual of fuenteManuales) {
    filas.push({
      id: 1000 + filas.length,
      clave: texto(manual.clave) || `extra-${Date.now()}-${filas.length}`,
      categoria_id: Number(manual.categoria_id) || Number(categorias[0]?.id) || 7,
      proveedor_id: Number(manual.proveedor_id) || Number(proveedoresLista[0]?.id) || 1,
      nombre: texto(manual.nombre).slice(0, 80) || "Servicio",
      descripcion: texto(manual.descripcion).slice(0, 200),
      precio: numero(manual.precio),
      imagen: texto(manual.imagen) || "assets/img/detalles.svg",
    });
  }

  for (const anuncio of aprobados) {
    const categoria = categorias.find((item) => texto(item.clave) === anuncio.categoria);
    const proveedorId = await proveedorPara(
      anuncio.negocio || "Proveedor local",
      proveedoresLista,
      siguienteProveedor,
    );
    filas.push({
      id: 1000 + filas.length,
      clave: `extra-${anuncio.id}`,
      categoria_id: Number(categoria?.id) || Number(categorias[0]?.id) || 7,
      proveedor_id: proveedorId,
      nombre: anuncio.nombre.slice(0, 80),
      descripcion: anuncio.descripcion.slice(0, 200),
      precio: anuncio.precio,
      imagen: anuncio.imagen || imagenDe(anuncio.categoria),
    });
  }

  const ids = todosLosExtras.map((item) => Number(item.id)).filter(Boolean);
  if (ids.length) {
    await rest("detalle_evento", {
      metodo: "DELETE",
      filtros: { servicio_id: `in.(${ids.join(",")})` },
    });
  }
  if (ids.length) {
    await rest("servicios", { metodo: "DELETE", filtros: { id: `in.(${ids.join(",")})` } });
  }
  if (filas.length) {
    await rest("servicios", { metodo: "POST", cuerpo: filas, prefer: "return=representation" });
  }
}

async function extrasParaFrontend() {
  const extras = await rest("servicios", { filtros: { clave: "like.extra-%" } });
  const manuales = extras.filter((item) => !texto(item.clave).startsWith("extra-anuncio-"));
  const categorias = await rest("categorias");
  const proveedoresLista = await proveedores();

  return manuales.map((item) => ({
    id: texto(item.clave),
    nombre: texto(item.nombre),
    categoria: texto(categorias.find((categoria) => Number(categoria.id) === Number(item.categoria_id))?.clave) || "detalles",
    proveedor: texto(proveedoresLista.find((proveedor) => Number(proveedor.id) === Number(item.proveedor_id))?.nombre) || "Proveedor local",
    descripcion: texto(item.descripcion),
    precio: numero(item.precio),
    imagen: texto(item.imagen) || "assets/img/detalles.svg",
  }));
}

async function filasDeExtras(servicios: unknown[]) {
  const categorias = await rest("categorias");
  const proveedoresLista = await proveedores();
  const siguienteProveedor = Math.max(2000, ...proveedoresLista.map((item) => Number(item.id) || 0)) + 1;

  const filas: Record<string, unknown>[] = [];
  for (const servicio of servicios) {
    const datos = servicio && typeof servicio === "object" ? (servicio as Record<string, unknown>) : {};
    if (!texto(datos.nombre)) continue;
    const categoria = categorias.find((item) => texto(item.clave) === texto(datos.categoria));
    const proveedorId = await proveedorPara(
      texto(datos.proveedor) || "Proveedor local",
      proveedoresLista,
      siguienteProveedor,
    );
    filas.push({
      clave: texto(datos.id) || `extra-${Date.now()}-${filas.length}`,
      categoria_id: Number(categoria?.id) || Number(categorias[0]?.id) || 7,
      proveedor_id: proveedorId,
      nombre: texto(datos.nombre).slice(0, 80),
      descripcion: texto(datos.descripcion).slice(0, 200),
      precio: numero(datos.precio),
      imagen: texto(datos.imagen) || "assets/img/detalles.svg",
    });
  }
  return filas;
}

async function manejar(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CABECERAS });

  const ruta = rutaDe(req);
  const metodo = req.method;
  const cuerpo = await leerCuerpo(req);

  if (ruta === "/admin/login" && metodo === "POST") {
    const correo = texto(cuerpo.correo).toLowerCase();
    const clave = String(cuerpo.clave ?? "");
    const correoEsperado = texto(Deno.env.get("ADMIN_CORREO")).toLowerCase();
    const claveEsperada = Deno.env.get("ADMIN_CLAVE") ?? "";

    if (!correoEsperado || !claveEsperada) {
      return json({ error: "Falta configurar el acceso de administrador en la función" }, 500);
    }
    if (correo !== correoEsperado || clave !== claveEsperada) {
      return json({ error: "Datos incorrectos" }, 401);
    }

    const token = await crearToken(correoEsperado);
    return json({
      token,
      correo: correoEsperado,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });
  }

  if (ruta === "/registro" && metodo === "POST") {
    try {
      return json(await registrarCuenta(cuerpo));
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : "No se pudo crear la cuenta.";
      return json({ error: mensaje }, 400);
    }
  }

  if (ruta.startsWith("/admin/") && !(await adminDe(req))) {
    return json({ error: "Sesión de administrador no válida" }, 401);
  }

  if (ruta === "/admin/anuncios" && metodo === "GET") {
    const filas = await rest("anuncios");
    return json(filas.map(desdeFila));
  }

  if (ruta === "/admin/revisar" && metodo === "POST") {
    const clave = texto(cuerpo.clave);
    const estado = texto(cuerpo.estado);
    const motivo = texto(cuerpo.motivo).slice(0, 200);
    if (!clave || !estadoValido(estado)) return json({ error: "Revisión no válida" }, 400);
    if (estado === "rechazado" && !motivo) return json({ error: "Falta el motivo del rechazo" }, 400);

    await rest("anuncios", {
      metodo: "PATCH",
      filtros: { clave: `eq.${clave}` },
      cuerpo: {
        estado,
        motivo: estado === "rechazado" ? motivo : null,
        revisado_en: new Date().toISOString(),
      },
    });
    await sincronizar();
    return json({ ok: true });
  }

  if (ruta === "/admin/extras" && metodo === "GET") {
    return json(await extrasParaFrontend());
  }

  if (ruta === "/admin/extras" && metodo === "POST") {
    const servicios = Array.isArray(cuerpo.servicios) ? cuerpo.servicios : [];
    await sincronizar(await filasDeExtras(servicios));
    return json(await extrasParaFrontend());
  }

  if (ruta === "/admin/extras" && metodo === "DELETE") {
    const url = new URL(req.url);
    const clave = texto(url.searchParams.get("clave"));
    const actuales = await extrasParaFrontend();
    await sincronizar(await filasDeExtras(actuales.filter((item) => item.id !== clave)));
    return json(await extrasParaFrontend());
  }

  if (ruta === "/public/recomendados" && metodo === "GET") {
    const filas = await rest("anuncios", { filtros: { estado: "eq.aprobado" } });
    return json(filas.map(desdeFila).filter((anuncio) => anuncio.nombre));
  }

  if (ruta.startsWith("/proveedor/")) {
    const usuario = await usuarioDe(req);
    if (!usuario) return json({ error: "Inicia sesión como proveedor" }, 401);

    if (ruta === "/proveedor/anuncios" && metodo === "GET") {
      const filas = await rest("anuncios", { filtros: { correo: `eq.${usuario.correo}` } });
      return json(filas.map(desdeFila));
    }

    if (ruta === "/proveedor/anuncios" && metodo === "POST") {
      const datos = datosAnuncio(cuerpo);
      const clave = `anuncio-${Date.now()}-${crypto.randomUUID().slice(0, 5)}`;
      const [fila] = await rest("anuncios", {
        metodo: "POST",
        cuerpo: [{ clave, correo: usuario.correo, ...datos, estado: "pendiente", motivo: null }],
        prefer: "return=representation",
      });
      return json(desdeFila(fila));
    }

    if (ruta === "/proveedor/anuncios/corregir" && metodo === "POST") {
      const clave = texto(cuerpo.clave);
      const filas = await rest("anuncios", {
        filtros: { clave: `eq.${clave}`, correo: `eq.${usuario.correo}` },
      });
      if (!filas.length) return json({ error: "Anuncio no encontrado" }, 404);

      const datos = datosAnuncio(cuerpo);
      await rest("anuncios", {
        metodo: "PATCH",
        filtros: { clave: `eq.${clave}`, correo: `eq.${usuario.correo}` },
        cuerpo: { ...datos, estado: "pendiente", motivo: null, revisado_en: null },
      });
      await sincronizar();
      return json({ ok: true });
    }

    if (ruta === "/proveedor/anuncios" && metodo === "DELETE") {
      const url = new URL(req.url);
      const clave = texto(url.searchParams.get("clave"));
      await rest("anuncios", {
        metodo: "DELETE",
        filtros: { clave: `eq.${clave}`, correo: `eq.${usuario.correo}` },
      });
      await sincronizar();
      return json({ ok: true });
    }
  }

  return json({ error: "Ruta no encontrada" }, 404);
}

Deno.serve(async (req) => {
  try {
    return await manejar(req);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Error interno" }, 500);
  }
});
