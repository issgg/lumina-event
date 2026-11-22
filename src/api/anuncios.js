import { guardarServiciosExtra, leerServiciosExtra } from "./baseDatos.js";

const CLAVE = "lumina-anuncios";

const IMAGENES = {
  musica: "musica",
  comida: "comida",
  decoracion: "decoracion",
  fotografia: "fotografia",
  mobiliario: "mobiliario",
  seguridad: "seguridad",
  detalles: "detalles",
};

function leerTodo() {
  if (typeof window === "undefined") return [];
  try {
    const datos = JSON.parse(window.localStorage.getItem(CLAVE) ?? "[]");
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function escribirTodo(lista) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    return;
  }
}

function nuevoId() {
  const azar = Math.random().toString(36).slice(2, 7);
  return `anuncio-${Date.now()}-${azar}`;
}

export function imagenDe(categoria) {
  return `assets/img/${IMAGENES[categoria] ?? "detalles"}.svg`;
}

export function fotoDe(categoria) {
  return `assets/fotos/${IMAGENES[categoria] ?? "detalles"}-1.jpg`;
}

function comoServicios(lista) {
  return lista.map((anuncio) => {
    const id = String(anuncio.id);
    return {
      id: id.startsWith("extra-") ? id : `extra-${id}`,
      categoria: anuncio.categoria,
      nombre: anuncio.nombre,
      descripcion: anuncio.descripcion,
      precio: Number(anuncio.precio) || 0,
      proveedor: anuncio.negocio || "Proveedor local",
      imagen: imagenDe(anuncio.categoria),
    };
  });
}

async function sincronizar(lista) {
  const anteriores = leerServiciosExtra().filter(
    (servicio) => !servicio.id.startsWith("extra-anuncio-"),
  );
  await guardarServiciosExtra([...anteriores, ...comoServicios(lista)]);
}

export function leerAnuncios(correo) {
  const todos = leerTodo();
  if (!correo) return todos;
  return todos.filter((anuncio) => anuncio.correo === correo);
}

export async function publicarAnunciosGuardados() {
  await sincronizar(leerTodo());
}

export async function guardarAnuncio(correo, datos) {
  const anuncio = {
    id: nuevoId(),
    correo,
    negocio: String(datos.negocio ?? "").trim(),
    categoria: datos.categoria,
    nombre: String(datos.nombre ?? "").trim(),
    descripcion: String(datos.descripcion ?? "").trim(),
    precio: Number(datos.precio) || 0,
    creadoEn: new Date().toISOString(),
  };
  const lista = [...leerTodo(), anuncio];
  escribirTodo(lista);
  await sincronizar(lista);
  return anuncio;
}

export async function borrarAnuncio(correo, id) {
  const lista = leerTodo().filter(
    (anuncio) => !(anuncio.id === id && anuncio.correo === correo),
  );
  escribirTodo(lista);
  await sincronizar(lista);
}
