export const NAVEGACION = [
  { href: "index.html", texto: "Inicio" },
  { href: "eventos.html", texto: "Eventos" },
  { href: "catalogo.html", texto: "Catálogo" },
  { href: "armador.html", texto: "Armador" },
  { href: "resumen.html", texto: "Resumen" },
  { href: "admin.html", texto: "Administrar" }
];

export const CATEGORIAS = [
  { id: "salones", nombre: "Salones", descripcion: "Espacios con dirección, capacidad y horarios" },
  { id: "comida", nombre: "Comida", descripcion: "Menús y servicio de banquete" },
  { id: "mobiliario", nombre: "Mobiliario", descripcion: "Mesas, sillas, manteles y carpas" },
  { id: "musica", nombre: "Música", descripcion: "DJ, sonido e iluminación" },
  { id: "decoracion", nombre: "Decoración", descripcion: "Temáticas, flores y mesa principal" },
  { id: "fotografia", nombre: "Fotografía y video", descripcion: "Sesión, fotos y video del evento" },
  { id: "detalles", nombre: "Detalles", descripcion: "Pastel, invitaciones y recuerdos" },
  { id: "seguridad", nombre: "Seguridad", descripcion: "Personal y control de acceso" }
];

export const TIPOS_EVENTO = [
  "XV años",
  "Boda",
  "Cumpleaños",
  "Graduación",
  "Evento empresarial",
  "Aniversario"
];

export const REGLAS_CRONOGRAMA = [
  { categoria: "decoracion", minutos: -300, actividad: "Llegada de decoración", descripcion: "Montaje de temática, mesa principal y área para fotografías." },
  { categoria: "mobiliario", minutos: -240, actividad: "Instalación de mobiliario", descripcion: "Colocación de mesas, sillas, manteles y acomodo del salón." },
  { categoria: "musica", minutos: -180, actividad: "Montaje de sonido", descripcion: "Instalación de bocinas, luces y prueba de audio." },
  { categoria: "comida", minutos: -120, actividad: "Preparación de comida", descripcion: "Llegada del proveedor y revisión del área de banquete." },
  { categoria: "salones", minutos: -60, actividad: "Recepción en el salón", descripcion: "Apertura del salón y entrada de invitados." },
  { categoria: "seguridad", minutos: -30, actividad: "Arribo de seguridad", descripcion: "Revisión de accesos y acomodo del personal." },
  { categoria: "general", minutos: 0, actividad: "Inicio del evento", descripcion: "Comienzo oficial de la celebración." },
  { categoria: "detalles", minutos: 180, actividad: "Pastel y recuerdos", descripcion: "Momento del pastel y entrega de recuerdos." },
  { categoria: "fotografia", minutos: 200, actividad: "Fotografías principales", descripcion: "Sesión de fotos y video con los invitados." },
  { categoria: "todos", minutos: 360, actividad: "Cierre y desmontaje", descripcion: "Final del evento y retiro del equipo contratado." }
];

export const HORA_INICIO_PREDETERMINADA = "19:00";
