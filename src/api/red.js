export const TIEMPO_ESPERA_MS = 8000;

export class ErrorDeRed extends Error {
  constructor() {
    super("La conexión tardó demasiado. Revisa tu internet e intenta otra vez.");
    this.name = "ErrorDeRed";
  }
}

export async function solicitarConTiempo(url, opciones = {}) {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_ESPERA_MS);

  try {
    return await fetch(url, { ...opciones, signal: control.signal });
  } catch (error) {
    if (error?.name === "AbortError") throw new ErrorDeRed();
    throw error;
  } finally {
    clearTimeout(temporizador);
  }
}
