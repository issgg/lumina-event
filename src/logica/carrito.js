import { MENSAJES } from "./mensajes.js";

function numeroSeguro(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

export function agregarServicio(detalles, servicio) {
  if (detalles.some((item) => item.id === servicio.id)) {
    return { detalles, agregado: false, mensaje: MENSAJES.yaAgregado };
  }
  const nuevo = {
    id: servicio.id,
    nombre: servicio.nombre,
    categoria: servicio.categoria,
    proveedor: servicio.proveedor ?? "",
    precioUnitario: numeroSeguro(servicio.precio),
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
    const deltaSeguro = numeroSeguro(delta);
    const cantidad = Math.min(99, Math.max(1, numeroSeguro(item.cantidad) + deltaSeguro));
    return { ...item, cantidad };
  });
}

export function calcularTotal(detalles) {
  const total = detalles.reduce(
    (suma, item) => suma + numeroSeguro(item.precioUnitario) * numeroSeguro(item.cantidad),
    0,
  );
  return Math.round(total * 100) / 100;
}

export function agruparPorCategoria(detalles) {
  const grupos = new Map();
  for (const item of detalles) {
    const actual = grupos.get(item.categoria) ?? { categoria: item.categoria, subtotal: 0, cantidad: 0 };
    actual.subtotal += numeroSeguro(item.precioUnitario) * numeroSeguro(item.cantidad);
    actual.cantidad += numeroSeguro(item.cantidad);
    grupos.set(item.categoria, actual);
  }
  return [...grupos.values()].map((grupo) => ({
    ...grupo,
    subtotal: Math.round(grupo.subtotal * 100) / 100,
  }));
}
