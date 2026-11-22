import { CATEGORIAS } from "./configuracion.js";
import { generarCronograma } from "../logica/cronograma.js";
import {
  supabaseConfigurado,
  leerTabla,
  insertarFilas,
  upsertFilas,
  actualizarFilas,
  eliminarFilas,
} from "./supabase.js";

const BASE = import.meta.env.BASE_URL || "./";
const TABLAS = [
  "usuarios",
  "proveedores",
  "categorias",
  "salones",
  "servicios",
  "anuncios",
  "eventos",
  "detalle_evento",
  "cronograma",
];

let datos = tablasVacias();
let promesa = null;

function tablasVacias() {
  return TABLAS.reduce((acumulado, tabla) => {
    acumulado[tabla] = [];
    return acumulado;
  }, {});
}

function rutaPublica(archivo) {
  return `${BASE}${archivo}`.replace(/\/+/g, "/");
}

function valorTexto(texto) {
  return String(texto ?? "");
}

async function obtenerTexto(archivo) {
  const respuesta = await fetch(rutaPublica(archivo));
  if (!respuesta.ok) throw new Error(`No se pudo leer ${archivo}`);
  return respuesta.text();
}

function filaPorId(tabla, id) {
  if (!id) return null;
  return datos[tabla].find((fila) => Number(fila.id) === Number(id)) ?? null;
}

function filaPorClave(tabla, clave) {
  if (!clave) return null;
  return datos[tabla].find((fila) => valorTexto(fila.clave) === valorTexto(clave)) ?? null;
}

function claveRemota(tabla, id) {
  return valorTexto(filaPorId(tabla, id)?.clave);
}

function categoriaIdRemota(clave) {
  return Number(filaPorClave("categorias", clave)?.id ?? 7);
}

async function proveedorIdRemota(nombre) {
  const texto = valorTexto(nombre) || "Proveedor local";
  const existente = datos.proveedores.find((fila) => fila.nombre === texto);
  if (existente) return Number(existente.id);

  const siguiente = Math.max(2000, ...datos.proveedores.map((fila) => Number(fila.id) || 0)) + 1;
  await insertarFilas("proveedores", [
    { id: siguiente, nombre: texto, telefono: null, correo: null },
  ]);
  datos.proveedores.push({ id: siguiente, nombre: texto, telefono: null, correo: null });
  return siguiente;
}

function serviciosDesdeTablas() {
  const categorias = new Map(datos.categorias.map((categoria) => [Number(categoria.id), categoria]));
  const proveedores = new Map(datos.proveedores.map((proveedor) => [Number(proveedor.id), proveedor]));
  const salones = new Map(datos.salones.map((salon) => [valorTexto(salon.clave), salon]));
  const orden = new Map(datos.categorias.map((categoria) => [valorTexto(categoria.clave), Number(categoria.id)]));

  return datos.servicios
    .map((servicio) => {
      const categoria = categorias.get(Number(servicio.categoria_id));
      const proveedor = proveedores.get(Number(servicio.proveedor_id));
      const salon = salones.get(valorTexto(servicio.clave));
      return {
        id: valorTexto(servicio.clave),
        categoria: valorTexto(categoria?.clave),
        nombre: valorTexto(servicio.nombre),
        descripcion: valorTexto(servicio.descripcion),
        precio: Number(servicio.precio) || 0,
        imagen: valorTexto(servicio.imagen),
        proveedor: valorTexto(proveedor?.nombre),
        direccion: valorTexto(salon?.direccion),
        capacidad: salon?.capacidad ?? "",
      };
    })
    .sort((primero, segundo) => {
      const diferencia = (orden.get(primero.categoria) ?? 99) - (orden.get(segundo.categoria) ?? 99);
      return diferencia || primero.nombre.localeCompare(segundo.nombre, "es");
    });
}

async function leerTablas() {
  const pares = await Promise.all(TABLAS.map(async (tabla) => [tabla, await leerTabla(tabla)]));
  datos = Object.fromEntries(pares);
}

async function sembrar() {
  const catalogo = JSON.parse(await obtenerTexto("data/catalogo.json"));
  const servicios = catalogo.servicios ?? [];
  const categoriaIds = new Map(CATEGORIAS.map((categoria, indice) => [categoria.id, indice + 1]));
  const nombres = [...new Set(servicios.map((servicio) => servicio.proveedor).filter(Boolean))];
  const proveedorIds = new Map(nombres.map((nombre, indice) => [nombre, indice + 2]));

  await insertarFilas("usuarios", [
    { id: 1, nombre: "Usuario Lumina", correo: "usuario@lumina.local", tipo: "usuario" },
  ]);
  await insertarFilas("proveedores", [
    { id: 1, nombre: "Proveedor local", telefono: null, correo: null },
    ...nombres.map((nombre, indice) => ({ id: indice + 2, nombre, telefono: null, correo: null })),
  ]);
  await insertarFilas(
    "categorias",
    CATEGORIAS.map((categoria, indice) => ({
      id: indice + 1,
      clave: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? "",
    })),
  );
  await insertarFilas(
    "salones",
    servicios
      .filter((servicio) => servicio.categoria === "salones")
      .map((servicio, indice) => ({
        id: indice + 1,
        clave: servicio.id,
        proveedor_id: proveedorIds.get(servicio.proveedor) ?? 1,
        nombre: servicio.nombre,
        direccion: servicio.direccion ?? "",
        capacidad: Math.max(1, Number(servicio.capacidad) || 1),
        precio: Number(servicio.precio) || 0,
        horarios: "10:00 - 02:00",
        imagen: servicio.imagen ?? "",
      })),
  );
  await insertarFilas(
    "servicios",
    servicios.map((servicio, indice) => ({
      id: indice + 1,
      clave: servicio.id,
      categoria_id: categoriaIds.get(servicio.categoria) ?? 7,
      proveedor_id: proveedorIds.get(servicio.proveedor) ?? 1,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion ?? "",
      precio: Number(servicio.precio) || 0,
      imagen: servicio.imagen ?? "",
    })),
  );
}

async function crearBase() {
  await leerTablas();
  if (datos.servicios.length === 0) {
    await sembrar();
    await leerTablas();
  }
  exponerDepuracion();
  return datos;
}

function consultarCronograma() {
  return datos.cronograma
    .filter((actividad) => Number(actividad.evento_id) === 1)
    .sort((primero, segundo) => Number(primero.id) - Number(segundo.id))
    .map(({ hora, actividad, descripcion }) => ({
      hora: valorTexto(hora),
      actividad: valorTexto(actividad),
      descripcion: valorTexto(descripcion),
    }));
}

function consultarServicios() {
  return serviciosDesdeTablas();
}

function leerServiciosExtra() {
  return serviciosDesdeTablas().filter((servicio) => servicio.id.startsWith("extra-"));
}

function leerEvento() {
  const fila = filaPorId("eventos", 1);
  if (!fila) return null;
  const detalles = datos.detalle_evento
    .filter((detalle) => Number(detalle.evento_id) === 1)
    .map((detalle) => {
      const servicio = filaPorId("servicios", detalle.servicio_id);
      if (!servicio) return null;
      return {
        id: valorTexto(servicio.clave),
        nombre: valorTexto(servicio.nombre),
        categoria: claveRemota("categorias", servicio.categoria_id),
        proveedor: valorTexto(filaPorId("proveedores", servicio.proveedor_id)?.nombre),
        precioUnitario: Number(detalle.precio_unitario) || 0,
        cantidad: Number(detalle.cantidad) || 0,
      };
    })
    .filter(Boolean);

  return {
    nombre: valorTexto(filaPorId("usuarios", fila.usuario_id)?.nombre),
    tipoEvento: valorTexto(fila.tipo_evento),
    fecha: valorTexto(fila.fecha),
    invitados: fila.invitados === null || fila.invitados === undefined ? "" : Number(fila.invitados),
    presupuesto: fila.presupuesto === null || fila.presupuesto === undefined ? "" : Number(fila.presupuesto),
    horaInicio: valorTexto(fila.hora_inicio),
    salonId: claveRemota("salones", fila.salon_id),
    detalles,
  };
}

async function guardarEvento(evento) {
  const nombre = valorTexto(evento.nombre) || "Usuario Lumina";
  if (!filaPorId("usuarios", 1)) {
    await insertarFilas("usuarios", [
      { id: 1, nombre, correo: "usuario@lumina.local", tipo: "usuario" },
    ]);
  } else {
    await actualizarFilas("usuarios", { id: "eq.1" }, { nombre });
  }

  const salon = filaPorClave("salones", valorTexto(evento.salonId));
  const filaEvento = {
    id: 1,
    usuario_id: 1,
    salon_id: salon ? Number(salon.id) : null,
    tipo_evento: valorTexto(evento.tipoEvento),
    fecha: valorTexto(evento.fecha),
    invitados: Math.max(1, Number(evento.invitados) || 1),
    presupuesto: Math.max(0, Number(evento.presupuesto) || 0),
    hora_inicio: valorTexto(evento.horaInicio) || "19:00",
    estado: "borrador",
  };
  await upsertFilas("eventos", [filaEvento]);

  await eliminarFilas("detalle_evento", { evento_id: "eq.1" });
  const detalles = (evento.detalles ?? [])
    .map((item) => {
      const servicio = filaPorClave("servicios", valorTexto(item.id));
      if (!servicio) return null;
      const precio = Number(item.precioUnitario) || 0;
      const cantidad = Math.max(1, Number(item.cantidad) || 1);
      return {
        evento_id: 1,
        servicio_id: Number(servicio.id),
        cantidad,
        precio_unitario: precio,
        subtotal: precio * cantidad,
      };
    })
    .filter(Boolean)
    .map((detalle, indice) => ({ ...detalle, id: indice + 1 }));
  if (detalles.length) await insertarFilas("detalle_evento", detalles);

  await eliminarFilas("cronograma", { evento_id: "eq.1" });
  const actividades = generarCronograma(evento.detalles ?? [], evento.horaInicio).map((actividad, indice) => ({
    id: indice + 1,
    evento_id: 1,
    hora: actividad.hora,
    actividad: actividad.actividad,
    descripcion: actividad.descripcion ?? "",
  }));
  if (actividades.length) await insertarFilas("cronograma", actividades);

  datos.usuarios = filaPorId("usuarios", 1)
    ? datos.usuarios.map((usuario) => (Number(usuario.id) === 1 ? { ...usuario, nombre } : usuario))
    : [...datos.usuarios, { id: 1, nombre, correo: "usuario@lumina.local", tipo: "usuario" }];
  datos.eventos = [filaEvento, ...datos.eventos.filter((fila) => Number(fila.id) !== 1)];
  datos.detalle_evento = detalles;
  datos.cronograma = actividades;
  return true;
}

async function limpiarEvento() {
  await eliminarFilas("detalle_evento", { evento_id: "eq.1" });
  await eliminarFilas("cronograma", { evento_id: "eq.1" });
  await eliminarFilas("eventos", { id: "eq.1" });
  datos.detalle_evento = [];
  datos.cronograma = [];
  datos.eventos = datos.eventos.filter((fila) => Number(fila.id) !== 1);
  return true;
}

async function guardarServiciosExtra(servicios) {
  const idsExtras = datos.servicios
    .filter((servicio) => valorTexto(servicio.clave).startsWith("extra-"))
    .map((servicio) => Number(servicio.id))
    .filter(Boolean);

  if (idsExtras.length) {
    await eliminarFilas("detalle_evento", { servicio_id: `in.(${idsExtras.join(",")})` });
    datos.detalle_evento = datos.detalle_evento.filter(
      (detalle) => !idsExtras.includes(Number(detalle.servicio_id)),
    );
  }
  await eliminarFilas("servicios", { clave: "like.extra-%" });

  const filasExtras = [];
  for (const [indice, servicio] of servicios.entries()) {
    filasExtras.push({
      id: 1000 + indice,
      clave: valorTexto(servicio.id),
      categoria_id: categoriaIdRemota(valorTexto(servicio.categoria)),
      proveedor_id: await proveedorIdRemota(valorTexto(servicio.proveedor) || "Proveedor local"),
      nombre: valorTexto(servicio.nombre),
      descripcion: valorTexto(servicio.descripcion),
      precio: Number(servicio.precio) || 0,
      imagen: valorTexto(servicio.imagen) || "assets/img/detalles.svg",
    });
  }
  if (filasExtras.length) await insertarFilas("servicios", filasExtras);

  datos.servicios = [
    ...datos.servicios.filter((servicio) => !valorTexto(servicio.clave).startsWith("extra-")),
    ...filasExtras,
  ];
  return true;
}

function exponerDepuracion() {
  if (typeof window === "undefined") return;
  window.luminaDB = {
    modo: "supabase",
    consultar: (tabla) => {
      const nombre = valorTexto(tabla);
      if (!(nombre in datos)) throw new Error(`Tabla desconocida. Usa una de: ${TABLAS.join(", ")}`);
      return datos[nombre].map((fila) => ({ ...fila }));
    },
    servicios: consultarServicios,
    cronograma: consultarCronograma,
    tablas: () => structuredClone(datos),
  };
}

export function inicializarBase() {
  if (datos.servicios.length) return Promise.resolve(datos);
  if (!supabaseConfigurado) {
    return Promise.reject(new Error("Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local"));
  }
  if (!promesa) promesa = crearBase();
  return promesa;
}

export { consultarServicios, consultarCronograma, leerServiciosExtra };

export { leerEvento, guardarEvento, limpiarEvento, guardarServiciosExtra };
