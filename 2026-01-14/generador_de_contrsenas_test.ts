import {assert, assertEquals, assertNotEquals} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {crea_contrasena} from "./generador_de_contrsenas.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6 * 7, 42);
});

Deno.test(function crea_contrasena_de_x_letras() {
  const contrasena = crea_contrasena(5);
  assertEquals(contrasena.length, 5);
});

Deno.test(function crea_contrasena_aleatoria() {
  const contrasena = crea_contrasena(5);
  const contrasena2 = crea_contrasena(5);
  assertNotEquals(contrasena, contrasena2);
});

Deno.test(function crea_contrasena_con_mayuscula_y_minuscula() {
  const contrasena = crea_contrasena(10);
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneMinuscula = /[a-z]/.test(contrasena);
  assertEquals(tieneMayuscula, true);
  assertEquals(tieneMinuscula, true);
});

Deno.test(function crea_contrasena_con_al_menos_un_numero() {
  const contrasena = crea_contrasena(10);
  const tieneNumero = /[0-9]/.test(contrasena);
  assertEquals(tieneNumero, true);
});

Deno.test(function crea_contrasena_con_al_menos_un_simbolo() {
  const contrasena = crea_contrasena(10);
  const tieneSimbolo = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(contrasena);
  assertEquals(tieneSimbolo, true);
});

// NIVEL 5 - Configuración de Opciones
Deno.test(function crea_pin_solo_numeros() {
  const pin = crea_contrasena({ length: 4, numbers: true });
  assertEquals(pin.length, 4);
  const soloNumeros = /^[0-9]+$/;
  assertEquals(soloNumeros.test(pin), true);
});

Deno.test(function crea_contrasena_solo_letras() {
  const contrasena = crea_contrasena({ length: 8, lowercase: true, uppercase: true });
  assertEquals(contrasena.length, 8);
  const soloLetras = /^[a-zA-Z]+$/;
  assertEquals(soloLetras.test(contrasena), true);
});

Deno.test(function crea_contrasena_todas_opciones() {
  const contrasena = crea_contrasena({
    length: 16, lowercase: true, uppercase: true, numbers: true, symbols: true
  });
  assertEquals(contrasena.length, 16);
  assertEquals(/[a-z]/.test(contrasena), true);  // tiene minúscula
  assertEquals(/[A-Z]/.test(contrasena), true);  // tiene mayúscula
  assertEquals(/[0-9]/.test(contrasena), true);  // tiene número
  assertEquals(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(contrasena), true);  // tiene símbolo
});

// NIVEL 7a - Excluir caracteres confusos
Deno.test(function crea_contrasena_sin_caracteres_confusos() {
  const contrasena = crea_contrasena({
    length: 50, lowercase: true, uppercase: true, numbers: true, excludeAmbiguous: true
  });
  const caracteresConfusos = /[0O1lI]/;
  assertEquals(caracteresConfusos.test(contrasena), false);  // NO debe tener 0, O, 1, l, I
});

// NIVEL 7b - Contraseña pronunciable
Deno.test(function crea_contrasena_pronunciable() {
  const contrasena = crea_contrasena({ length: 8, pronounceable: true });
  assertEquals(contrasena.length, 8);

  // Debe alternar consonante-vocal-consonante-vocal...
  const vocales = "aeiou";
  const consonantes = "bcdfghjklmnpqrstvwxyz";

  for (let i = 0; i < contrasena.length; i++) {
    const letra = contrasena[i];
    if (i % 2 === 0) {
      // Posición par: debe ser consonante
      assertEquals(consonantes.includes(letra), true);
    } else {
      // Posición impar: debe ser vocal
      assertEquals(vocales.includes(letra), true);
    }
  }
});
