export function formatearNumeroTarjeta(valor) {
  const limpio = String(valor ?? "").replace(/\D/g, "").slice(0, 16);
  return limpio.replace(/(.{4})/g, "$1 ").trim();
}

function pasarLuhn(numero) {
  let suma = 0;
  let duplicar = false;
  for (let indice = numero.length - 1; indice >= 0; indice -= 1) {
    let digito = Number(numero[indice]);
    if (duplicar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    duplicar = !duplicar;
  }
  return suma % 10 === 0;
}

function vencimientoValido(texto, hoy) {
  const coincidencia = /^(\d{2})\/(\d{2})$/.exec(texto);
  if (!coincidencia) return false;
  const mes = Number(coincidencia[1]);
  const anio = 2000 + Number(coincidencia[2]);
  if (mes < 1 || mes > 12) return false;
  if (anio > hoy.getFullYear()) return true;
  return anio === hoy.getFullYear() && mes >= hoy.getMonth() + 1;
}

export function validarPago(datos, hoy = new Date()) {
  const errores = {};
  const titular = String(datos.titular ?? "").trim();
  const numero = String(datos.numero ?? "").replace(/[\s-]/g, "");
  const vencimiento = String(datos.vencimiento ?? "").trim();
  const cvv = String(datos.cvv ?? "").trim();

  if (titular.length < 3) errores.titular = "Escribe el nombre del titular.";
  if (!/^\d{16}$/.test(numero) || !pasarLuhn(numero)) errores.numero = "Revisa los 16 dígitos de la tarjeta.";
  if (!vencimientoValido(vencimiento, hoy)) errores.vencimiento = "Usa una fecha MM/AA futura.";
  if (!/^\d{3,4}$/.test(cvv)) errores.cvv = "El CVV debe tener 3 o 4 dígitos.";

  return { validos: Object.keys(errores).length === 0, errores };
}
