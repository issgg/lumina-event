import { MENSAJES } from "./mensajes.js";

export function agregarServicio(detalles, servicio) {
  if (detalles.some((item) => item.id === servicio.id)) {
    return { detalles, agregado: false, mensaje: MENSAJES.yaAgregado };
  }
  const nuevo = {
    id: servicio.id,
    nombre: servicio.nombre,
    categoria: servicio.categoria,
    proveedor: servicio.proveedor ?? "",
    precioUnitario: Number(servicio.precio) || 0,
    cantidad: 1,
  };
  return { detalles: [...detalles, nuevo], agregado: true, mensaje: MENSAJES.agregado };
}

export function quitarServicio(detalles, id) {
  return detalles.filter((item) => item.id !== id);
}

export function cambiarCantidad(detalles, id, delta) {
  return detalles.map((item) => {
    if (item.id !== id) return item;
    const cantidad = Math.min(99, Math.max(1, Number(item.cantidad) + delta));
    return { ...item, cantidad };
  });
}

export function calcularTotal(detalles) {
  const total = detalles.reduce(
    (suma, item) => suma + Number(item.precioUnitario) * Number(item.cantidad),
    0,
  );
  return Math.round((Number.isFinite(total) ? total : 0) * 100) / 100;
}

export function agruparPorCategoria(detalles) {
  const grupos = new Map();
  for (const item of detalles) {
    const actual = grupos.get(item.categoria) ?? { categoria: item.categoria, subtotal: 0, cantidad: 0 };
    actual.subtotal += Number(item.precioUnitario) * Number(item.cantidad);
    actual.cantidad += Number(item.cantidad);
    grupos.set(item.categoria, actual);
  }
  return [...grupos.values()].map((grupo) => ({
    ...grupo,
    subtotal: Math.round(grupo.subtotal * 100) / 100,
  }));
}
