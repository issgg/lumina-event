import { REGLAS_CRONOGRAMA } from "../api/configuracion.js";

export function aMinutos(hora) {
  const partes = String(hora).split(":");
  const horas = Number(partes[0]);
  const minutos = Number(partes[1] ?? 0);
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return 0;
  return horas * 60 + minutos;
}

export function formatearHora(minutos) {
  const normalizado = ((minutos % 1440) + 1440) % 1440;
  const horas = Math.floor(normalizado / 60);
  const restantes = normalizado % 60;
  return `${String(horas).padStart(2, "0")}:${String(restantes).padStart(2, "0")}`;
}

export function generarCronograma(detalles = [], horaInicio = "19:00", reglas = REGLAS_CRONOGRAMA) {
  const categorias = new Set(detalles.map((item) => item.categoria));
  const base = aMinutos(horaInicio);
  return reglas
    .filter(
      (regla) =>
        regla.categoria === "general" ||
        regla.categoria === "todos" ||
        categorias.has(regla.categoria),
    )
    .map((regla) => ({
      orden: base + regla.minutos,
      hora: formatearHora(base + regla.minutos),
      actividad: regla.actividad,
      descripcion: regla.descripcion,
    }))
    .sort((a, b) => a.orden - b.orden)
    .map(({ orden, ...actividad }) => actividad);
}
