import { Link } from "react-router";

export default function Inicio() {
  return (
    <section className="hero">
      <div className="hero-texto">
        <p className="etiqueta">Planeador de eventos</p>
        <h1>Tu evento, pieza por pieza.</h1>
        <p className="subtitulo">
          Elige un salón, agrega servicios, calcula el total y obtén un cronograma inicial. Todo queda guardado en la
          base de datos y se puede consultar con SQL.
        </p>
        <div className="acciones-hero">
          <Link className="boton" to="/catalogo">
            Explorar catálogo
          </Link>
          <Link className="boton boton-secundario" to="/armador">
            Ver mi evento
          </Link>
        </div>
      </div>
      <div className="hero-tarjeta" aria-label="Resumen del sistema">
        <h2>¿Qué incluye?</h2>
        <ul>
          <li>Catálogo por categoría y búsqueda</li>
          <li>Carrito con cantidades y total</li>
          <li>Formulario con validación</li>
          <li>Cronograma y resumen final</li>
          <li>Persistencia real con SQL</li>
        </ul>
      </div>
    </section>
  );
}
