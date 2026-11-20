import { MENSAJES, mostrarMensaje } from "./errores.js";

export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export async function cargarCatalogo() {
  mostrarMensaje("estado-catalogo", MENSAJES.cargando);
  try {
    const respuesta = await fetch("data/catalogo.json");
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const datos = await respuesta.json();
    if (!Array.isArray(datos.servicios)) throw new Error("formato inválido");
    mostrarMensaje("estado-catalogo", "Catálogo listo.", "ok");
    return datos.servicios;
  } catch {
    mostrarMensaje("estado-catalogo", MENSAJES.errorCarga, "error");
    return null;
  }
}

export function filtrarServicios(servicios, categoria = "todos", texto = "") {
  const busqueda = normalizar(texto.trim()).slice(0, 60);
  return servicios.filter((servicio) => {
    const coincideCategoria = categoria === "todos" || servicio.categoria === categoria;
    const coincidenceTexto = !busqueda || normalizar(
      `${servicio.nombre} ${servicio.descripcion ?? ""} ${servicio.proveedor ?? ""}`
    ).includes(busqueda);
    return coincideCategoria && coincidenceTexto;
  });
}

export function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Number(valor) || 0);
}

export function renderizarTarjetas(servicios, destino, alAgregar) {
  if (!destino) return;
  destino.replaceChildren();

  if (servicios.length === 0) {
    const aviso = document.createElement("p");
    aviso.className = "aviso";
    aviso.textContent = MENSAJES.sinResultados;
    destino.append(aviso);
    return;
  }

  for (const servicio of servicios) {
    const articulo = document.createElement("article");
    articulo.className = "tarjeta";

    const imagen = document.createElement("img");
    imagen.src = servicio.imagen ?? "assets/img/detalles.svg";
    imagen.alt = `Servicio ${servicio.nombre}`;
    imagen.loading = "lazy";

    const titulo = document.createElement("h3");
    titulo.textContent = servicio.nombre;

    const descripcion = document.createElement("p");
    descripcion.textContent = servicio.descripcion ?? "";

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = formatearMoneda(servicio.precio);

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton";
    boton.textContent = "Agregar";
    boton.dataset.id = servicio.id;
    boton.addEventListener("click", () => alAgregar(servicio));

    articulo.append(imagen, titulo, descripcion, precio, boton);
    destino.append(articulo);
  }
}
