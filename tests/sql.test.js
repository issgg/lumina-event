import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const iniciar = require("../vendor/sql-wasm.js");
const rutaWasm = fileURLToPath(new URL("../vendor/sql-wasm.wasm", import.meta.url));
const esquema = readFileSync(fileURLToPath(new URL("../db/schema.sql", import.meta.url)), "utf8");

test("schema.sql crea las 8 tablas en SQLite real", async () => {
  const SQL = await iniciar({ locateFile: () => rutaWasm });
  const db = new SQL.Database();
  db.run(esquema);
  const tablas = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")[0].values.flat();
  assert.equal(tablas.length, 8);
  assert.ok(tablas.includes("detalle_evento"));
  assert.ok(tablas.includes("cronograma"));
});

test("las consultas con llaves foráneas y el UNIQUE funcionan", async () => {
  const SQL = await iniciar({ locateFile: () => rutaWasm });
  const db = new SQL.Database();
  db.run(esquema);
  db.run("INSERT INTO categorias (id, clave, nombre) VALUES (1, 'salones', 'Salones')");
  db.run("INSERT INTO proveedores (id, nombre) VALUES (1, 'Proveedor local')");
  db.run("INSERT INTO servicios (clave, categoria_id, proveedor_id, nombre, precio, imagen) VALUES ('s1', 1, 1, 'Salón', 100, 'a.svg')");
  db.run("INSERT OR IGNORE INTO servicios (clave, categoria_id, proveedor_id, nombre, precio, imagen) VALUES ('s1', 1, 1, 'Salón', 100, 'a.svg')");

  const filas = db.exec(`
    SELECT s.clave AS id, c.clave AS categoria, s.precio
    FROM servicios s JOIN categorias c ON c.id = s.categoria_id
  `);
  assert.equal(filas[0].values.length, 1);
  assert.deepEqual(filas[0].values[0], ["s1", "salones", 100]);
});

test("la base se puede exportar y volver a abrir", async () => {
  const SQL = await iniciar({ locateFile: () => rutaWasm });
  const db = new SQL.Database();
  db.run(esquema);
  db.run("INSERT INTO usuarios (id, nombre, correo, tipo) VALUES (1, 'Ana', 'ana@ejemplo.mx', 'usuario')");
  const restaurada = new SQL.Database(db.export());
  const filas = restaurada.exec("SELECT nombre FROM usuarios WHERE id = 1");
  assert.equal(filas[0].values[0][0], "Ana");
});
