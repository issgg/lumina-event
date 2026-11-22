import test from "node:test";
import assert from "node:assert/strict";

import { agregarServicio, quitarServicio, cambiarCantidad, calcularTotal, agruparPorCategoria } from "../src/logica/carrito.js";
import { validarDatosEvento, validarBusqueda } from "../src/logica/validacion.js";
import { filtrarServicios, normalizar } from "../src/logica/filtros.js";
import { generarCronograma, aMinutos, formatearHora } from "../src/logica/cronograma.js";
import { seleccionarSalon, evaluarCobertura, estadoPresupuesto } from "../src/logica/paquete.js";
import { validarPago, formatearNumeroTarjeta } from "../src/logica/pago.js";
import { MENSAJES } from "../src/logica/mensajes.js";
import { CATEGORIAS_PROVEEDOR, NAVEGACION_ADMIN, NAVEGACION_PROVEEDOR, ROLES_REGISTRO, RUTA_ACCION_POR_ROL, RUTA_POR_ROL, rolValido } from "../src/api/configuracion.js";

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
  assert.equal(validarDatosEvento({ ...base, invitados: "-5" }).errores.invitados, MENSAJES.invitadosPositivo);
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

test("elegir salón reemplaza cualquier salón previo y lo pone al inicio", () => {
  const previos = [
    { id: "salon-viejo", categoria: "salones", precioUnitario: 100, cantidad: 1 },
    { id: "dj", categoria: "musica", precioUnitario: 8000, cantidad: 1 },
  ];
  const resultado = seleccionarSalon(previos, {
    id: "salon-nuevo",
    nombre: "Salón Nuevo",
    categoria: "salones",
    precio: 20000,
    proveedor: "Proveedor",
  });
  assert.equal(resultado.length, 2);
  assert.equal(resultado[0].id, "salon-nuevo");
  assert.equal(resultado[0].precioUnitario, 20000);
  assert.equal(resultado[1].id, "dj");
});

test("la cobertura marca lo que falta del paquete guiado", () => {
  const cobertura = evaluarCobertura([
    { categoria: "salones" },
    { categoria: "musica" },
    { categoria: "musica" },
  ]);
  assert.deepEqual(cobertura[0], { categoria: "salones", completo: true });
  assert.deepEqual(cobertura[1], { categoria: "comida", completo: false });
  assert.deepEqual(cobertura[3], { categoria: "musica", completo: true });
});

test("el presupuesto indica si sobra o se excede", () => {
  assert.deepEqual(estadoPresupuesto(80000, 71000), { estado: "dentro", diferencia: 9000 });
  assert.deepEqual(estadoPresupuesto(50000, 71000), { estado: "excedido", diferencia: 21000 });
  assert.deepEqual(estadoPresupuesto("", 71000), { estado: "sin-definir", diferencia: 0 });
});

test("la validación del pago simulado acepta una tarjeta de prueba y rechaza datos inválidos", () => {
  const hoy = new Date(2026, 10, 21);
  const valido = {
    titular: "Ana Pérez",
    numero: formatearNumeroTarjeta("4242424242424242"),
    vencimiento: "12/29",
    cvv: "123",
  };
  assert.equal(formatearNumeroTarjeta("4242424242424242"), "4242 4242 4242 4242");
  assert.equal(validarPago(valido, hoy).validos, true);
  assert.ok(validarPago({ ...valido, numero: "4242 4242 4242 4241" }, hoy).errores.numero);
  assert.ok(validarPago({ ...valido, vencimiento: "10/26" }, hoy).errores.vencimiento);
  assert.ok(validarPago({ ...valido, cvv: "12" }, hoy).errores.cvv);
});

test("los datos del evento pueden guardarse antes de elegir salón", () => {
  const base = {
    nombre: "Ana", tipoEvento: "Boda", fecha: "2099-01-01",
    invitados: "120", presupuesto: "80000", horaInicio: "19:00", salonId: "",
  };
  assert.equal(validarDatosEvento(base, ["Boda"]).errores.salonId, MENSAJES.salonRequerido);
  assert.equal(validarDatosEvento(base, ["Boda"], { requerirSalon: false }).validos, true);
});

test("el proveedor tiene su propio menú y no ve salones", () => {
  assert.equal(rolValido("proveedor"), "proveedor");
  assert.equal(rolValido("otro"), "organizador");
  assert.equal(RUTA_POR_ROL.proveedor, "/proveedor");
  assert.equal(RUTA_ACCION_POR_ROL.proveedor, "/proveedor/anunciar");
  assert.deepEqual(NAVEGACION_PROVEEDOR.map((item) => item.to), ["/proveedor", "/proveedor/anunciar"]);
  assert.equal(CATEGORIAS_PROVEEDOR.some((categoria) => categoria.id === "salones"), false);
});

test("el administrador no se ofrece en el registro y tiene menú propio", () => {
  assert.equal(rolValido("admin"), "admin");
  assert.equal(ROLES_REGISTRO.some((rol) => rol.id === "admin"), false);
  assert.equal(RUTA_POR_ROL.admin, "/admin");
  assert.deepEqual(NAVEGACION_ADMIN.map((item) => item.to), ["/admin", "/administrar"]);
});
