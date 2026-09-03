import {assert, assertEquals, assertNotEquals} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {BARAJA, barajar, carta, crearBaraja, crearTabla, marcar} from "./loteria.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6 * 7, 42);
});

// Nivel 1 — la primera prueba. Está en ROJO a propósito.
Deno.test(function la_carta_1_es_el_gallo() {
  assertEquals(carta(1), "El gallo");
});

Deno.test(function la_carta_2_es_el_diablito() {
  assertEquals(carta(2), "El diablito");
});

Deno.test(function todas_las_54_cartas_tienen_su_nombre() {
  assertEquals(BARAJA.length, 54);

  BARAJA.forEach((nombre, indice) => {
    const numero = indice + 1;
    assertEquals(carta(numero), nombre, `carta(${numero}) debería ser "${nombre}"`);
  });
});

// Nivel 2 — La baraja completa.
Deno.test(function la_baraja_tiene_54_cartas() {
  assertEquals(crearBaraja().length, 54);
});

Deno.test(function la_baraja_no_tiene_cartas_repetidas() {
  const baraja = crearBaraja();
  assertEquals(new Set(baraja).size, 54);
});

// Nivel 3 — Barajar.
Deno.test(function barajar_conserva_las_54_cartas() {
  const barajada = barajar(crearBaraja(), 42);

  assertEquals(barajada.length, 54);
  assertEquals(new Set(barajada).size, 54);
});

Deno.test(function la_misma_semilla_produce_el_mismo_orden() {
  assertEquals(barajar(crearBaraja(), 42), barajar(crearBaraja(), 42));
});

Deno.test(function barajar_cambia_el_orden() {
  assertNotEquals(barajar(crearBaraja(), 42), crearBaraja());
});

// Nivel 4 — La tabla del jugador.
Deno.test(function una_tabla_tiene_las_16_cartas_que_le_diste() {
  const tabla = crearTabla([1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]);

  assertEquals(tabla.cartas, [1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]);
});

Deno.test(function marcar_una_carta_la_marca_en_su_posicion() {
  const tabla = crearTabla([1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]);

  const marcada = marcar(tabla, 9);

  assertEquals(marcada.marcadas[2], true);
});
