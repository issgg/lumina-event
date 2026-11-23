const CATEGORIAS_ESENCIALES = [
  "salones",
  "comida",
  "mobiliario",
  "musica",
  "decoracion",
  "fotografia",
];

export function seleccionarSalon(detalles, salon) {
  if (!salon?.id) return detalles;
  const sinSalones = detalles.filter((item) => item.categoria !== "salones");
  return [
    {
      id: salon.id,
      nombre: salon.nombre,
      categoria: "salones",
      proveedor: salon.proveedor ?? "",
      precioUnitario: Number(salon.precio) || 0,
      cantidad: 1,
    },
    ...sinSalones,
  ];
}

export function evaluarCobertura(detalles) {
  const presentes = new Set(detalles.map((item) => item.categoria));
  return CATEGORIAS_ESENCIALES.map((categoria) => ({
    categoria,
    completo: presentes.has(categoria),
  }));
}

export function estadoPresupuesto(presupuesto, total) {
  const limite = Number(presupuesto) || 0;
  if (limite <= 0) return { estado: "sin-definir", diferencia: 0 };
  const totalSeguro = Number(total);
  const diferencia = Math.round((limite - (Number.isFinite(totalSeguro) ? totalSeguro : 0)) * 100) / 100;
  return diferencia >= 0
    ? { estado: "dentro", diferencia }
    : { estado: "excedido", diferencia: Math.abs(diferencia) };
}
