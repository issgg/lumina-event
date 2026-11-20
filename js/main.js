import { CATEGORIAS, TIPOS_EVENTO, HORA_INICIO_PREDETERMINADA } from "../data/config.js";
import { renderizarMenu } from "./navegacion.js";
import { cargarCatalogo, filtrarServicios, renderizarTarjetas, formatearMoneda } from "./catalogo.js";
import { agregarServicio, quitarServicio, cambiarCantidad, calcularTotal, agruparPorCategoria } from "./carrito.js";
import { generarCronograma } from "./cronograma.js";
import { validarDatosEvento, validarBusqueda } from "./validacion.js";
import { MENSAJES, mostrarMensaje } from "./errores.js";
import {
  eventoVacio,
  guardarEvento,
  leerEvento,
  limpiarEvento,
  leerServiciosExtra,
  guardarServiciosExtra
} from "./almacenamiento.js";

const AVISOS = {
  catalogo: "aviso-catalogo",
  armador: "aviso-armador",
  resumen: "aviso-resumen",
  admin: "aviso-admin"
};

let serviciosBase = [];
let serviciosExtras = [];

function todosLosServicios() {
  return [...serviciosBase, ...serviciosExtras];
}

async function cargarServicios() {
  serviciosBase = (await cargarCatalogo()) ?? [];
  serviciosExtras = leerServiciosExtra();
  return todosLosServicios();
}

function persistir(evento, pagina) {
  const guardado = guardarEvento(evento);
  if (!guardado) mostrarMensaje(AVISOS[pagina], MENSAJES.falloGuardado, "error");
  return guardado;
}

function rellenarSelect(select, opciones) {
  if (!select) return;
  select.replaceChildren();
  for (const opcion of opciones) {
    const elemento = document.createElement("option");
    elemento.value = opcion.value;
    elemento.textContent = opcion.texto;
    select.append(elemento);
  }
}

function crearBoton(texto, alHacerClic, clase = "boton boton-secundario") {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = clase;
  boton.textContent = texto;
  boton.addEventListener("click", alHacerClic);
  return boton;
}

async function configurarCatalogo() {
  const servicios = await cargarServicios();
  const categoria = document.getElementById("filtro-categoria");
  const busqueda = document.getElementById("buscar-servicio");
  const rejilla = document.getElementById("rejilla-catalogo");
  const contador = document.getElementById("contador-evento");
  const evento = leerEvento() ?? eventoVacio();

  rellenarSelect(categoria, [
    { value: "todos", texto: "Todas las categorías" },
    ...CATEGORIAS.map((item) => ({ value: item.id, texto: item.nombre }))
  ]);

  const actualizarContador = () => {
    if (contador) contador.textContent = `${evento.detalles.length} servicio(s) en tu evento`;
  };

  const pintar = () => {
    const problema = validarBusqueda(busqueda.value);
    if (problema) {
      mostrarMensaje(AVISOS.catalogo, problema, "error");
      return;
    }
    const lista = filtrarServicios(servicios, categoria.value, busqueda.value);
    renderizarTarjetas(lista, rejilla, (servicio) => {
      const resultado = agregarServicio(evento.detalles, servicio);
      evento.detalles = resultado.detalles;
      persistir(evento, "catalogo");
      mostrarMensaje(AVISOS.catalogo, resultado.mensaje, resultado.agregado ? "ok" : "error");
      actualizarContador();
    });
  };

  categoria.addEventListener("change", pintar);
  busqueda.addEventListener("input", pintar);
  document.getElementById("btn-limpiar")?.addEventListener("click", () => {
    busqueda.value = "";
    categoria.value = "todos";
    pintar();
  });
  document.getElementById("btn-reintentar")?.addEventListener("click", () => location.reload());

  pintar();
  actualizarContador();
}

async function configurarArmador() {
  const servicios = await cargarServicios();
  const evento = leerEvento() ?? eventoVacio();
  const lista = document.getElementById("lista-evento");
  const total = document.getElementById("total-evento");
  const salon = document.getElementById("salon");
  const tipo = document.getElementById("tipo-evento");
  const campos = {
    nombre: document.getElementById("nombre"),
    tipoEvento: tipo,
    fecha: document.getElementById("fecha"),
    invitados: document.getElementById("invitados"),
    presupuesto: document.getElementById("presupuesto"),
    horaInicio: document.getElementById("hora-inicio"),
    salonId: salon
  };
  const ids = {
    nombre: "nombre",
    tipoEvento: "tipo-evento",
    fecha: "fecha",
    invitados: "invitados",
    presupuesto: "presupuesto",
    horaInicio: "hora-inicio",
    salonId: "salon"
  };

  rellenarSelect(salon, servicios
    .filter((servicio) => servicio.categoria === "salones")
    .map((servicio) => ({ value: servicio.id, texto: `${servicio.nombre} · ${formatearMoneda(servicio.precio)}` })));
  rellenarSelect(tipo, TIPOS_EVENTO.map((nombre) => ({ value: nombre, texto: nombre })));

  if (!evento.horaInicio) evento.horaInicio = HORA_INICIO_PREDETERMINADA;
  for (const [clave, nodo] of Object.entries(campos)) {
    if (nodo) nodo.value = evento[clave] ?? "";
  }
  if (leerEvento()) mostrarMensaje(AVISOS.armador, MENSAJES.recuperado, "ok");

  const pintar = () => {
    lista.replaceChildren();
    if (evento.detalles.length === 0) {
      const aviso = document.createElement("p");
      aviso.className = "aviso";
      aviso.textContent = MENSAJES.listaVacia;
      lista.append(aviso);
    }

    for (const item of evento.detalles) {
      const fila = document.createElement("li");
      fila.dataset.id = item.id;

      const texto = document.createElement("div");
      const titulo = document.createElement("strong");
      titulo.textContent = item.nombre;
      const detalle = document.createElement("p");
      detalle.textContent = `${item.categoria} · ${item.proveedor}`;
      texto.append(titulo, detalle);

      const controles = document.createElement("div");
      controles.className = "acciones";
      const cantidad = document.createElement("span");
      cantidad.textContent = `Cantidad: ${item.cantidad}`;

      controles.append(
        crearBoton("−", () => {
          evento.detalles = cambiarCantidad(evento.detalles, item.id, -1);
          persistir(evento, "armador");
          pintar();
        }),
        cantidad,
        crearBoton("+", () => {
          evento.detalles = cambiarCantidad(evento.detalles, item.id, 1);
          persistir(evento, "armador");
          pintar();
        }),
        crearBoton("Quitar", () => {
          evento.detalles = quitarServicio(evento.detalles, item.id);
          persistir(evento, "armador");
          mostrarMensaje(AVISOS.armador, MENSAJES.eliminado, "ok");
          pintar();
        })
      );

      fila.append(texto, controles);
      lista.append(fila);
    }

    total.textContent = formatearMoneda(calcularTotal(evento.detalles));
  };

  document.getElementById("formulario-evento")?.addEventListener("submit", (eventoFormulario) => {
    eventoFormulario.preventDefault();
    const datos = Object.fromEntries(
      Object.entries(campos).map(([clave, nodo]) => [clave, nodo?.value ?? ""])
    );
    const resultado = validarDatosEvento(datos, TIPOS_EVENTO);

    for (const clave of Object.keys(ids)) {
      const nodoError = document.getElementById(`error-${clave}`);
      if (nodoError) nodoError.textContent = resultado.errores[clave] ?? "";
      if (campos[clave]) {
        if (resultado.errores[clave]) campos[clave].setAttribute("aria-invalid", "true");
        else campos[clave].removeAttribute("aria-invalid");
      }
    }

    if (!resultado.validos) {
      mostrarMensaje(AVISOS.armador, MENSAJES.datosInvalidos, "error");
      const primera = Object.keys(resultado.errores)[0];
      campos[primera]?.focus();
      return;
    }

    Object.assign(evento, datos);
    evento.invitados = Number(datos.invitados);
    evento.presupuesto = Number(datos.presupuesto);

    const boton = document.getElementById("btn-guardar-armador");
    if (boton) boton.disabled = true;
    persistir(evento, "armador");
    mostrarMensaje(AVISOS.armador, MENSAJES.guardado, "ok");
    window.setTimeout(() => {
      if (boton) boton.disabled = false;
    }, 500);
  });

  pintar();
}

function configurarResumen() {
  const evento = leerEvento() ?? eventoVacio();
  const cuerpo = document.getElementById("cuerpo-servicios");
  const cuerpoGrupos = document.getElementById("cuerpo-grupos");
  const cuerpoCronograma = document.getElementById("cuerpo-cronograma");

  const agregarFila = (destino, valores) => {
    if (!destino) return;
    const fila = document.createElement("tr");
    for (const valor of valores) {
      const celda = document.createElement("td");
      celda.textContent = String(valor);
      fila.append(celda);
    }
    destino.append(fila);
  };

  cuerpo?.replaceChildren();
  cuerpoGrupos?.replaceChildren();
  cuerpoCronograma?.replaceChildren();

  for (const item of evento.detalles) {
    agregarFila(cuerpo, [item.nombre, item.categoria, item.cantidad, formatearMoneda(item.precioUnitario * item.cantidad)]);
  }
  for (const grupo of agruparPorCategoria(evento.detalles)) {
    agregarFila(cuerpoGrupos, [grupo.categoria, grupo.cantidad, formatearMoneda(grupo.subtotal)]);
  }
  for (const actividad of generarCronograma(evento.detalles, evento.horaInicio)) {
    agregarFila(cuerpoCronograma, [actividad.hora, actividad.actividad, actividad.descripcion]);
  }

  const total = document.getElementById("total-final");
  if (total) total.textContent = formatearMoneda(calcularTotal(evento.detalles));
  if (evento.detalles.length === 0) mostrarMensaje(AVISOS.resumen, MENSAJES.listaVacia, "error");

  document.getElementById("btn-guardar-resumen")?.addEventListener("click", (eventoClic) => {
    const boton = eventoClic.currentTarget;
    boton.disabled = true;
    persistir(evento, "resumen");
    mostrarMensaje(AVISOS.resumen, MENSAJES.guardado, "ok");
    window.setTimeout(() => {
      boton.disabled = false;
    }, 500);
  });

  document.getElementById("btn-reiniciar")?.addEventListener("click", () => {
    limpiarEvento();
    location.reload();
  });
}

async function configurarAdmin() {
  const servicios = await cargarServicios();
  const lista = document.getElementById("lista-admin");
  const categoria = document.getElementById("admin-categoria");

  rellenarSelect(categoria, CATEGORIAS.map((item) => ({ value: item.id, texto: item.nombre })));

  const pintar = () => {
    lista.replaceChildren();
    const extras = leerServiciosExtra();
    if (extras.length === 0) {
      const aviso = document.createElement("p");
      aviso.className = "aviso";
      aviso.textContent = "No hay servicios agregados por el administrador.";
      lista.append(aviso);
    }
    for (const servicio of extras) {
      const fila = document.createElement("li");
      fila.dataset.id = servicio.id;
      const texto = document.createElement("span");
      texto.textContent = `${servicio.nombre} · ${formatearMoneda(servicio.precio)}`;
      fila.append(
        texto,
        crearBoton("Eliminar", () => {
          guardarServiciosExtra(leerServiciosExtra().filter((item) => item.id !== servicio.id));
          mostrarMensaje(AVISOS.admin, MENSAJES.adminEliminado, "ok");
          pintar();
        })
      );
      lista.append(fila);
    }
  };

  document.getElementById("formulario-admin")?.addEventListener("submit", (eventoFormulario) => {
    eventoFormulario.preventDefault();
    const nombre = document.getElementById("admin-nombre").value.trim();
    const precio = Number(document.getElementById("admin-precio").value);
    if (!nombre) {
      mostrarMensaje(AVISOS.admin, MENSAJES.adminNombre, "error");
      return;
    }
    if (!Number.isFinite(precio) || precio < 0) {
      mostrarMensaje(AVISOS.admin, MENSAJES.adminPrecio, "error");
      return;
    }
    const extras = leerServiciosExtra();
    const servicio = {
      id: `extra-${Date.now()}`,
      categoria: categoria.value,
      nombre,
      proveedor: document.getElementById("admin-proveedor").value.trim(),
      descripcion: document.getElementById("admin-descripcion").value.trim(),
      precio,
      imagen: "assets/img/detalles.svg"
    };
    guardarServiciosExtra([...extras, servicio]);
    mostrarMensaje(AVISOS.admin, MENSAJES.adminAgregado, "ok");
    eventoFormulario.currentTarget.reset();
    pintar();
  });

  pintar();
  const total = document.getElementById("total-catalogo");
  if (total) total.textContent = `${servicios.length} servicios disponibles`;
}

document.addEventListener("DOMContentLoaded", async () => {
  renderizarMenu();
  const pagina = document.body.dataset.pagina;
  if (pagina === "catalogo") await configurarCatalogo();
  if (pagina === "armador") await configurarArmador();
  if (pagina === "resumen") configurarResumen();
  if (pagina === "admin") await configurarAdmin();
});
