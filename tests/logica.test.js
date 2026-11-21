import test from "node:test";
import assert from "node:assert/strict";

import { agregarServicio, quitarServicio, cambiarCantidad, calcularTotal, agruparPorCategoria } from "../src/logica/carrito.js";
import { validarDatosEvento, validarBusqueda } from "../src/logica/validacion.js";
import { filtrarServicios, normalizar } from "../src/logica/filtros.js";
import { generarCronograma, aMinutos, formatearHora } from "../src/logica/cronograma.js";
import { MENSAJES } from "../src/logica/mensajes.js";

const servicio = { id: "dj", nombre: "DJ", categoria: "musica", precio: 8000 };

test("agregar un servicio no crea duplicados con doble clic", () => {
  const primero = agregarServicio([], servicio);
  const segundo = agregarServicio(primero.detalles, servicio);
  assert.equal(primero.agregado, true);
  assert.equal(segundo.agregado, false);
  assert.equal(segundo.detalles.length, 1);
  assert.equal(segundo.mensaje, MENSAJES.yaAgregado);
});

test("quitar y cambiar cantidad mantienen límites", () => {
  const { detalles } = agregarServicio([], servicio);
  assert.equal(cambiarCantidad(detalles, "dj", -5)[0].cantidad, 1);
  assert.equal(cambiarCantidad(detalles, "dj", 200)[0].cantidad, 99);
  assert.deepEqual(quitarServicio(detalles, "dj"), []);
});

test("el total convierte texto a número y respeta cantidades", () => {
  const detalles = [
    { id: "a", precioUnitario: "450", cantidad: 2 },
    { id: "b", precioUnitario: 250, cantidad: 1 },
  ];
  assert.equal(calcularTotal(detalles), 1150);
  assert.equal(calcularTotal([]), 0);
});

test("la agrupación por categoría suma subtotales", () => {
  const detalles = [
    { id: "a", categoria: "musica", precioUnitario: 8000, cantidad: 1 },
    { id: "b", categoria: "musica", precioUnitario: 1000, cantidad: 2 },
  ];
  assert.deepEqual(agruparPorCategoria(detalles), [{ categoria: "musica", subtotal: 10000, cantidad: 3 }]);
});

test("la validación rechaza campos vacíos, texto, negativos y nombres largos", () => {
  const base = {
    nombre: "Ana", tipoEvento: "Boda", fecha: "2099-01-01",
    invitados: "120", presupuesto: "80000", horaInicio: "19:00", salonId: "salon",
  };
  assert.equal(validarDatosEvento({ ...base, nombre: "" }).errores.nombre, MENSAJES.nombreVacio);
  assert.equal(validarDatosEvento({ ...base, invitados: "abc" }).errores.invitados, MENSAJES.invitadosNumero);
  assert.equal(validarDatosEvento({ ...base, invitados: "-5" }).errores.invitados, MENSAJES.invitadosNumero);
  assert.equal(validarDatosEvento({ ...base, nombre: "a".repeat(200) }).errores.nombre, MENSAJES.nombreLargo);
  assert.equal(validarDatosEvento({ ...base, fecha: "2020-01-01" }).errores.fecha, MENSAJES.fechaPasada);
  assert.equal(validarDatosEvento(base, ["Boda"]).validos, true);
});

test("la búsqueda ignora acentos y mayúsculas y limita la longitud", () => {
  const servicios = [
    { id: "d", nombre: "Decoración temática", descripcion: "Flores", proveedor: "Estudio", categoria: "decoracion" },
    { id: "j", nombre: "DJ y sonido", descripcion: "Bocinas", proveedor: "Ultra", categoria: "musica" },
  ];
  assert.equal(normalizar("DÉCORACION"), "decoracion");
  assert.equal(filtrarServicios(servicios, "todos", "decoracion").length, 1);
  assert.deepEqual(filtrarServicios(servicios, "todos", "zzzz"), []);
  assert.equal(filtrarServicios(servicios, "musica", "").length, 1);
  assert.equal(validarBusqueda("a".repeat(200)), MENSAJES.buscarLargo);
});

test("el cronograma usa solo categorías seleccionadas y cruza medianoche", () => {
  const cronograma = generarCronograma([{ categoria: "musica" }], "19:00");
  assert.deepEqual(cronograma.map((item) => item.hora), ["16:00", "19:00", "01:00"]);
  assert.equal(cronograma[0].actividad, "Montaje de sonido");
  assert.equal(generarCronograma([], "19:00").length, 2);
  assert.equal(aMinutos("19:00"), 1140);
  assert.equal(formatearHora(-10), "23:50");
});
