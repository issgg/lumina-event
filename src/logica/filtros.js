export function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filtrarServicios(servicios, categoria = "todos", texto = "") {
  const busqueda = normalizar(texto.trim()).slice(0, 60);
  return servicios.filter((servicio) => {
    const coincideCategoria = categoria === "todos" || servicio.categoria === categoria;
    const coincideTexto =
      !busqueda ||
      normalizar(`${servicio.nombre} ${servicio.descripcion ?? ""} ${servicio.proveedor ?? ""}`).includes(busqueda);
    return coincideCategoria && coincideTexto;
  });
}
