import {assert, assertEquals} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {carta} from "./loteria.ts";

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

// La baraja completa, en orden. Esto es la especificación: la carta N es
// BARAJA_ESPERADA[N - 1].
// (Sobre la 26, ver la nota del README — el nombre lo decide el grupo.)
const BARAJA_ESPERADA = [
  "El gallo", "El diablito", "La dama", "El catrín",
  "El paraguas", "La sirena", "La escalera", "La botella",
  "El barril", "El árbol", "El melón", "El valiente",
  "El gorrito", "La muerte", "La pera", "La bandera",
  "El bandolón", "El violoncello", "La garza", "El pájaro",
  "La mano", "La bota", "La luna", "El cotorro",
  "El borracho", "El negrito", "El corazón", "La sandía",
  "El tambor", "El camarón", "Las jaras", "El músico",
  "La araña", "El soldado", "La estrella", "El cazo",
  "El mundo", "El apache", "El nopal", "El alacrán",
  "La rosa", "La calavera", "La campana", "El cantarito",
  "El venado", "El sol", "La corona", "La chalupa",
  "El pino", "El pescado", "La palma", "La maceta",
  "El arpa", "La rana",
];

Deno.test(function todas_las_54_cartas_tienen_su_nombre() {
  assertEquals(BARAJA_ESPERADA.length, 54);

  BARAJA_ESPERADA.forEach((nombre, indice) => {
    const numero = indice + 1;
    assertEquals(carta(numero), nombre, `carta(${numero}) debería ser "${nombre}"`);
  });
});
