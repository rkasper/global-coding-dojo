// copiado verbatim de ../2026-07-08/decide.js — mantener sincronizado a mano
//
// ¿Dónde comemos en CDMX? — Lógica pura (sin DOM, fácil de probar)
//
// Todas estas funciones son "puras": misma entrada => misma salida, sin efectos
// secundarios. Por eso corre sin cambios en el navegador, en Deno (pruebas) y
// ahora también en el servidor (room.ts), como fuente única de verdad.

/**
 * Normaliza el nombre de un lugar: recorta espacios y colapsa espacios internos.
 */
export function normalize(name) {
  return String(name ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Agrega un lugar a la lista. Ignora vacíos y duplicados (sin distinguir
 * mayúsculas/acentos). Devuelve una lista NUEVA (no modifica la original).
 */
export function addPlace(list, name) {
  return addItem(list, name);
}

/**
 * Quita un lugar de la lista (comparación sin mayúsculas/acentos).
 */
export function removePlace(list, name) {
  return removeItem(list, name);
}

/**
 * Registra un usuario por nombre. Misma regla que los lugares: ignora
 * vacíos y no duplica (sin distinguir mayúsculas/acentos).
 */
export function addUser(list, name) {
  return addItem(list, name);
}

/**
 * Da de baja a un usuario registrado.
 */
export function removeUser(list, name) {
  return removeItem(list, name);
}

/**
 * Elige un lugar al azar. El generador `rng` se puede inyectar para pruebas
 * deterministas (por defecto Math.random). Devuelve null si la lista está vacía.
 */
export function pickRandom(list, rng = Math.random) {
  if (list.length === 0) return null;
  const index = Math.floor(rng() * list.length);
  return list[index];
}

/**
 * Registra el voto de una persona: un voto por usuario. Votar de nuevo
 * reemplaza su voto anterior. `votes` es un mapa { usuario: lugar }.
 * Ignora si el usuario o el lugar vienen vacíos. Devuelve un mapa NUEVO.
 */
export function castVote(votes, user, place) {
  const person = normalize(user);
  const choice = normalize(place);
  if (person === "" || choice === "") return { ...votes };
  return { ...votes, [person]: choice };
}

/**
 * Por qué lugar votó un usuario, o null si todavía no ha votado.
 */
export function votedFor(votes, user) {
  const person = normalize(user);
  const key = Object.keys(votes).find((k) => sameName(k, person));
  return key ? votes[key] : null;
}

/**
 * Cuenta votos y determina al ganador.
 * @param {string[]} votes - arreglo de nombres votados (uno por persona).
 * @returns {{winner: string|null, counts: Record<string, number>, tie: boolean}}
 */
export function tallyVotes(votes) {
  const counts = {};
  for (const v of votes) {
    const clean = normalize(v);
    if (clean === "") continue;
    counts[clean] = (counts[clean] ?? 0) + 1;
  }

  let winner = null;
  let max = 0;
  let tie = false;
  for (const [name, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      winner = name;
      tie = false;
    } else if (count === max) {
      tie = true;
    }
  }

  return { winner, counts, tie };
}

/**
 * Devuelve todos los lugares con la mayor cantidad de votos (los empatados).
 * Lista vacía si no hay votos.
 */
export function topChoices(counts) {
  let max = 0;
  for (const count of Object.values(counts)) {
    if (count > max) max = count;
  }
  if (max === 0) return [];
  return Object.keys(counts).filter((name) => counts[name] === max);
}

// --- helpers ---

// Agrega un elemento a una lista de nombres, sin duplicar ni admitir vacíos.
// Compartido por addPlace y addUser: misma regla, dos listas distintas.
function addItem(list, name) {
  const clean = normalize(name);
  if (clean === "") return [...list];
  const exists = list.some((p) => sameName(p, clean));
  return exists ? [...list] : [...list, clean];
}

// Quita un elemento de una lista de nombres (comparación sin mayúsculas/acentos).
function removeItem(list, name) {
  const clean = normalize(name);
  return list.filter((p) => !sameName(p, clean));
}

// Compara nombres ignorando mayúsculas y acentos ("Tacos" == "tacos" == "tácos").
function sameName(a, b) {
  return fold(a) === fold(b);
}

function fold(s) {
  return normalize(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
