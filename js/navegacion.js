import { NAVEGACION } from "../data/config.js";

export function renderizarMenu() {
  const navs = document.querySelectorAll("nav[data-menu]");
  const pagina = document.body.dataset.pagina ?? "";

  for (const nav of navs) {
    const lista = document.createElement("ul");
    lista.className = "menu";

    for (const enlace of NAVEGACION) {
      const item = document.createElement("li");
      const ancla = document.createElement("a");
      ancla.href = enlace.href;
      ancla.textContent = enlace.texto;
      if (enlace.href === pagina) ancla.setAttribute("aria-current", "page");
      item.append(ancla);
      lista.append(item);
    }

    nav.replaceChildren(lista);
  }
}
