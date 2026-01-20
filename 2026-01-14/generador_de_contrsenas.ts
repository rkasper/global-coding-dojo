interface Opciones {
  length: number;
  lowercase?: boolean;
  uppercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  excludeAmbiguous?: boolean;
  pronounceable?: boolean;
}

export function crea_contrasena(param: number | Opciones): string {
  const minusculas = "abcdefghijklmnopqrstuvwxyz";
  const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  const simbolos = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  // Si es número, usar comportamiento anterior (todo incluido)
  if (typeof param === "number") {
    const todas = minusculas + mayusculas + numeros + simbolos;
    let contrasena = "";
    contrasena += minusculas[Math.floor(Math.random() * minusculas.length)];
    contrasena += mayusculas[Math.floor(Math.random() * mayusculas.length)];
    contrasena += numeros[Math.floor(Math.random() * numeros.length)];
    contrasena += simbolos[Math.floor(Math.random() * simbolos.length)];
    for (let i = 4; i < param; i++) {
      contrasena += todas[Math.floor(Math.random() * todas.length)];
    }
    return contrasena.split("").sort(() => Math.random() - 0.5).join("");
  }

  // Si es objeto, usar las opciones
  const opciones = param;

  // Si es pronunciable, alternar consonante-vocal
  if (opciones.pronounceable) {
    const vocales = "aeiou";
    const consonantes = "bcdfghjklmnpqrstvwxyz";
    let contrasena = "";
    for (let i = 0; i < opciones.length; i++) {
      if (i % 2 === 0) {
        // Posición par: consonante
        contrasena += consonantes[Math.floor(Math.random() * consonantes.length)];
      } else {
        // Posición impar: vocal
        contrasena += vocales[Math.floor(Math.random() * vocales.length)];
      }
    }
    return contrasena;
  }

  let caracteres = "";
  if (opciones.lowercase) caracteres += minusculas;
  if (opciones.uppercase) caracteres += mayusculas;
  if (opciones.numbers) caracteres += numeros;
  if (opciones.symbols) caracteres += simbolos;

  // Excluir caracteres confusos: 0, O, 1, l, I
  if (opciones.excludeAmbiguous) {
    caracteres = caracteres.replace(/[0O1lI]/g, "");
  }

  let contrasena = "";
  for (let i = 0; i < opciones.length; i++) {
    contrasena += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return contrasena;
}