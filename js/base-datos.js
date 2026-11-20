import { CATEGORIAS } from "../data/config.js";
import { generarCronograma } from "./cronograma.js";

const CLAVE_DB = "lumina.db.v1";
let base = null;

function aBase64(bytes) {
  let binario = "";
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario);
}

function deBase64(texto) {
  const binario = atob(texto);
  const bytes = new Uint8Array(binario.length);
  for (let indice = 0; indice < binario.length; indice += 1) {
    bytes[indice] = binario.charCodeAt(indice);
  }
  return bytes;
}

function filas(resultado) {
  if (!resultado || resultado.length === 0) return [];
  const { columns, values } = resultado[0];
  return values.map((fila) => Object.fromEntries(columns.map((columna, indice) => [columna, fila[indice]])));
}

function valorTexto(texto) {
  return String(texto ?? "");
}

function persistirBase() {
  if (!base || typeof localStorage === "undefined") return false;
  try {
    localStorage.setItem(CLAVE_DB, aBase64(base.export()));
    return true;
  } catch {
    return false;
  }
}

async function obtenerTexto(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`No se pudo leer ${ruta}`);
  return respuesta.text();
}

async function sembrarBase() {
  const catalogo = JSON.parse(await obtenerTexto("data/catalogo.json"));
  const servicios = catalogo.servicios ?? [];
  const categoriaIds = new Map(CATEGORIAS.map((categoria, indice) => [categoria.id, indice + 1]));

  base.run("INSERT INTO usuarios (id, nombre, correo, tipo) VALUES (1, 'Usuario Lumina', 'usuario@lumina.local', 'usuario')");
  base.run("INSERT INTO proveedores (id, nombre) VALUES (1, 'Proveedor local')");

  CATEGORIAS.forEach((categoria, indice) => {
    base.run("INSERT INTO categorias (id, clave, nombre, descripcion) VALUES (?, ?, ?, ?)", [
      indice + 1, categoria.id, categoria.nombre, categoria.descripcion
    ]);
  });

  const proveedorIds = new Map();
  const nombres = [...new Set(servicios.map((servicio) => servicio.proveedor).filter(Boolean))];
  nombres.forEach((nombre, indice) => {
    proveedorIds.set(nombre, indice + 2);
    base.run("INSERT INTO proveedores (id, nombre) VALUES (?, ?)", [indice + 2, nombre]);
  });

  for (const servicio of servicios.filter((item) => item.categoria === "salones")) {
    base.run(
      "INSERT INTO salones (clave, proveedor_id, nombre, direccion, capacidad, precio, horarios, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        servicio.id,
        proveedorIds.get(servicio.proveedor) ?? 1,
        servicio.nombre,
        servicio.direccion ?? "",
        Math.max(1, Number(servicio.capacidad) || 1),
        Number(servicio.precio) || 0,
        "10:00 - 02:00",
        servicio.imagen ?? ""
      ]
    );
  }

  for (const servicio of servicios) {
    base.run(
      "INSERT INTO servicios (clave, categoria_id, proveedor_id, nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        servicio.id,
        categoriaIds.get(servicio.categoria) ?? 7,
        proveedorIds.get(servicio.proveedor) ?? 1,
        servicio.nombre,
        servicio.descripcion ?? "",
        Number(servicio.precio) || 0,
        servicio.imagen ?? ""
      ]
    );
  }
}

export async function inicializarBase() {
  if (base) return base;
  const iniciar = globalThis.initSqlJs;
  if (typeof iniciar !== "function") throw new Error("SQLite no disponible");

  const SQL = await iniciar({ locateFile: () => "vendor/sql-wasm.wasm" });
  const guardado = typeof localStorage !== "undefined" ? localStorage.getItem(CLAVE_DB) : null;

  if (guardado) {
    base = new SQL.Database(deBase64(guardado));
    exponerDepuracion();
    return base;
  }

  base = new SQL.Database();
  base.run(await obtenerTexto("db/schema.sql"));
  await sembrarBase();
  persistirBase();
  exponerDepuracion();
  return base;
}

function exponerDepuracion() {
  if (typeof window === "undefined") return;
  window.luminaDB = {
    consultar: (sql, parametros = []) => filas(base.exec(sql, parametros)),
    servicios: consultarServicios,
    cronograma: consultarCronograma
  };
}

export function consultarServicios() {
  if (!base) throw new Error("Base de datos no inicializada");
  return filas(base.exec(`
    SELECT s.clave AS id, c.clave AS categoria, s.nombre, s.descripcion,
           s.precio, s.imagen, p.nombre AS proveedor, sa.direccion, sa.capacidad
    FROM servicios s
    JOIN categorias c ON c.id = s.categoria_id
    LEFT JOIN proveedores p ON p.id = s.proveedor_id
    LEFT JOIN salones sa ON sa.clave = s.clave
    ORDER BY c.id, s.nombre
  `)).map((servicio) => ({ ...servicio, precio: Number(servicio.precio) }));
}

function claveDe(tablaClave, id) {
  if (!id) return "";
  const resultado = base.exec(`SELECT clave FROM ${tablaClave} WHERE id = ?`, [id]);
  return resultado.length ? String(resultado[0].values[0][0]) : "";
}

export function guardarEvento(evento) {
  if (!base) return false;
  base.run("INSERT OR IGNORE INTO usuarios (id, nombre, correo, tipo) VALUES (1, 'Usuario Lumina', 'usuario@lumina.local', 'usuario')");
  base.run("UPDATE usuarios SET nombre = ? WHERE id = 1", [valorTexto(evento.nombre) || "Usuario Lumina"]);

  const salon = base.exec("SELECT id FROM salones WHERE clave = ?", [valorTexto(evento.salonId)]);
  const salonId = salon.length ? salon[0].values[0][0] : null;
  const invitados = Math.max(1, Number(evento.invitados) || 1);
  const presupuesto = Math.max(0, Number(evento.presupuesto) || 0);

  base.run(`
    INSERT INTO eventos (id, usuario_id, salon_id, tipo_evento, fecha, invitados, presupuesto, hora_inicio, estado)
    VALUES (1, 1, ?, ?, ?, ?, ?, ?, 'borrador')
    ON CONFLICT(id) DO UPDATE SET
      salon_id = excluded.salon_id,
      tipo_evento = excluded.tipo_evento,
      fecha = excluded.fecha,
      invitados = excluded.invitados,
      presupuesto = excluded.presupuesto,
      hora_inicio = excluded.hora_inicio
  `, [
    salonId,
    valorTexto(evento.tipoEvento),
    valorTexto(evento.fecha),
    invitados,
    presupuesto,
    valorTexto(evento.horaInicio) || "19:00"
  ]);

  base.run("DELETE FROM detalle_evento WHERE evento_id = 1");
  for (const item of evento.detalles ?? []) {
    const servicio = base.exec("SELECT id FROM servicios WHERE clave = ?", [valorTexto(item.id)]);
    if (!servicio.length) continue;
    const precio = Number(item.precioUnitario) || 0;
    const cantidad = Math.max(1, Number(item.cantidad) || 1);
    base.run(
      "INSERT OR IGNORE INTO detalle_evento (evento_id, servicio_id, cantidad, precio_unitario, subtotal) VALUES (1, ?, ?, ?, ?)",
      [servicio[0].values[0][0], cantidad, precio, precio * cantidad]
    );
  }

  base.run("DELETE FROM cronograma WHERE evento_id = 1");
  for (const actividad of generarCronograma(evento.detalles ?? [], evento.horaInicio)) {
    base.run("INSERT INTO cronograma (evento_id, hora, actividad, descripcion) VALUES (1, ?, ?, ?)", [
      actividad.hora, actividad.actividad, actividad.descripcion
    ]);
  }

  return persistirBase();
}

export function leerEvento() {
  if (!base) return null;
  const eventos = filas(base.exec(`
    SELECT e.*, u.nombre AS nombre_usuario
    FROM eventos e
    JOIN usuarios u ON u.id = e.usuario_id
    WHERE e.id = 1
  `));
  if (eventos.length === 0) return null;

  const fila = eventos[0];
  const detalles = filas(base.exec(`
    SELECT s.clave AS id, s.nombre, c.clave AS categoria, COALESCE(p.nombre, '') AS proveedor,
           d.precio_unitario, d.cantidad
    FROM detalle_evento d
    JOIN servicios s ON s.id = d.servicio_id
    JOIN categorias c ON c.id = s.categoria_id
    LEFT JOIN proveedores p ON p.id = s.proveedor_id
    WHERE d.evento_id = 1
  `)).map((detalle) => ({
    ...detalle,
    precioUnitario: Number(detalle.precio_unitario),
    cantidad: Number(detalle.cantidad)
  }));

  return {
    nombre: fila.nombre_usuario,
    tipoEvento: fila.tipo_evento,
    fecha: fila.fecha,
    invitados: fila.invitados,
    presupuesto: fila.presupuesto,
    horaInicio: fila.hora_inicio,
    salonId: claveDe("salones", fila.salon_id),
    detalles
  };
}

export function limpiarEvento() {
  if (!base) return;
  base.run("DELETE FROM detalle_evento WHERE evento_id = 1");
  base.run("DELETE FROM cronograma WHERE evento_id = 1");
  base.run("DELETE FROM eventos WHERE id = 1");
  persistirBase();
}

export function leerServiciosExtra() {
  if (!base) return [];
  return filas(base.exec(`
    SELECT s.clave AS id, c.clave AS categoria, s.nombre, s.descripcion,
           s.precio, s.imagen, p.nombre AS proveedor
    FROM servicios s
    JOIN categorias c ON c.id = s.categoria_id
    LEFT JOIN proveedores p ON p.id = s.proveedor_id
    WHERE s.clave LIKE 'extra-%'
  `)).map((servicio) => ({ ...servicio, precio: Number(servicio.precio) }));
}

export function guardarServiciosExtra(servicios) {
  if (!base) return false;
  base.run("DELETE FROM servicios WHERE clave LIKE 'extra-%'");
  for (const servicio of servicios) {
    const categoria = base.exec("SELECT id FROM categorias WHERE clave = ?", [valorTexto(servicio.categoria)]);
    base.run(
      "INSERT INTO servicios (clave, categoria_id, proveedor_id, nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        valorTexto(servicio.id),
        categoria.length ? categoria[0].values[0][0] : 7,
        1,
        valorTexto(servicio.nombre),
        valorTexto(servicio.descripcion),
        Number(servicio.precio) || 0,
        valorTexto(servicio.imagen) || "assets/img/detalles.svg"
      ]
    );
  }
  return persistirBase();
}

export function consultarCronograma() {
  if (!base) return [];
  return filas(base.exec("SELECT hora, actividad, descripcion FROM cronograma WHERE evento_id = 1 ORDER BY id"));
}
