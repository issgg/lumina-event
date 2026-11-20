export const MENSAJES = {
  cargando: "Cargando catálogo…",
  errorCarga: "No se pudo cargar el catálogo. Revisa la conexión e intenta de nuevo.",
  errorBase: "No se pudo iniciar la base de datos SQLite. Recarga la página o intenta de nuevo.",
  sinResultados: "No encontramos servicios con ese nombre. Prueba otra categoría.",
  listaVacia: "Aún no agregaste servicios. Elige uno del catálogo.",
  yaAgregado: "Ya está en tu evento.",
  agregado: "Servicio agregado a tu evento.",
  eliminado: "Servicio eliminado de tu evento.",
  guardado: "Borrador guardado.",
  recuperado: "Retomamos tu evento guardado.",
  falloGuardado: "No se pudo guardar en este navegador. El evento sigue en pantalla.",
  datosInvalidos: "Revisa los campos marcados.",
  nombreVacio: "Escribe tu nombre.",
  nombreLargo: "Máximo 60 caracteres.",
  tipoRequerido: "Elige un tipo de evento.",
  fechaRequerida: "Elige una fecha.",
  fechaPasada: "La fecha debe ser futura.",
  invitadosNumero: "Escribe un número, por ejemplo 120.",
  invitadosPositivo: "Debe ser mayor a 0.",
  invitadosMaximo: "El máximo es 10000 invitados.",
  presupuestoNumero: "Escribe un presupuesto válido.",
  horaInvalida: "Escribe una hora válida.",
  salonRequerido: "Elige un salón para el evento.",
  buscarLargo: "La búsqueda es demasiado larga.",
  adminNombre: "Escribe el nombre del servicio.",
  adminPrecio: "Escribe un precio mayor o igual a cero.",
  adminAgregado: "Servicio agregado al catálogo local.",
  adminEliminado: "Servicio eliminado del catálogo local."
};

export function mostrarMensaje(id, texto, tipo = "") {
  const nodo = typeof document === "undefined" ? null : document.getElementById(id);
  if (!nodo) return;
  nodo.textContent = texto;
  nodo.className = `aviso${tipo ? ` aviso-${tipo}` : ""}`;
}
