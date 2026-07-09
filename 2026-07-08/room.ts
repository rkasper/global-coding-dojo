// Estado de cada sala de votación. Vive en memoria (ver MULTIDEVICE-PLAN.md
// sección 12): un redeploy o reinicio del contenedor borra todas las salas.

import {
  addPlace,
  castVote,
  findCanonical,
  normalize,
  pickRandom,
  removePlace,
  tallyVotes,
  topChoices,
  uniqueName,
  votedFor,
} from "./static/decide.js";

const SEED = ["Tacos al pastor", "Pozole", "Tortas", "Sushi", "Pizza", "Ramen"];

export type Mode = "random" | "vote";

export interface RoomState {
  places: string[];
  users: string[];
  mode: Mode;
  votes: Record<string, string>;
  runoffPlaces: string[] | null;
  lastPick: string | null;
  sockets: Set<WebSocket>;
  // Qué nombre "posee" cada conexión viva ahora mismo. Un nombre solo puede
  // estar aquí ligado a UN socket a la vez — así se puede votar solo como
  // uno mismo (ver applyAction/"castVote") sin depender de lo que el
  // cliente diga que es. Se libera al desconectar (removeSocket), pero el
  // nombre se queda en `users` para que el registro de "quién viene" no
  // desaparezca por una desconexión momentánea.
  claims: Map<string, WebSocket>;
}

export interface Action {
  type: string;
  [key: string]: unknown;
}

const rooms = new Map<string, RoomState>();

export function getOrCreateRoom(id: string): RoomState {
  let room = rooms.get(id);
  if (!room) {
    room = {
      places: [...SEED],
      users: [],
      mode: "random",
      votes: {},
      runoffPlaces: null,
      lastPick: null,
      sockets: new Set(),
      claims: new Map(),
    };
    rooms.set(id, room);
  }
  return room;
}

export function roomCount(): number {
  return rooms.size;
}

export function addSocket(room: RoomState, socket: WebSocket): void {
  room.sockets.add(socket);
}

export function removeSocket(room: RoomState, socket: WebSocket): void {
  room.sockets.delete(socket);
  for (const [name, owner] of room.claims) {
    if (owner === socket) room.claims.delete(name);
  }
}

// Qué nombre reclamó esta conexión, o null si todavía no se ha registrado.
function nameOf(room: RoomState, socket: WebSocket): string | null {
  for (const [name, owner] of room.claims) {
    if (owner === socket) return name;
  }
  return null;
}

// Snapshot compartido: todo el estado excepto los sockets (que no son
// serializables y son un detalle del servidor, no del dominio).
export function snapshot(room: RoomState) {
  return {
    places: room.places,
    users: room.users,
    mode: room.mode,
    votes: room.votes,
    runoffPlaces: room.runoffPlaces,
    lastPick: room.lastPick,
  };
}

// Snapshot personalizado para UN socket: además del estado compartido,
// incluye `myName` — la identidad que esa conexión tiene reclamada (o
// null). Es lo único que difiere entre clientes.
export function snapshotFor(room: RoomState, socket: WebSocket) {
  return { ...snapshot(room), myName: nameOf(room, socket) };
}

export function broadcast(room: RoomState): void {
  for (const socket of room.sockets) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "state", ...snapshotFor(room, socket) }));
    }
  }
}

// Aplica una acción de cliente al estado de la sala, usando exclusivamente
// las funciones puras de decide.js. No hace nada con acciones desconocidas.
export function applyAction(room: RoomState, socket: WebSocket, action: Action): void {
  switch (action.type) {
    case "addPlace":
      room.places = addPlace(room.places, String(action.name ?? ""));
      break;
    case "removePlace":
      room.places = removePlace(room.places, String(action.name ?? ""));
      break;
    case "claimIdentity": {
      const requested = normalize(String(action.name ?? ""));
      if (requested === "") break;

      const existing = findCanonical(room.users, requested);
      let finalName: string;

      if (!existing) {
        // Nombre nuevo: se registra tal cual.
        finalName = requested;
        room.users = [...room.users, finalName];
      } else {
        const owner = room.claims.get(existing);
        if (!owner || owner === socket) {
          // Nadie más lo tiene reclamado ahora mismo (o soy yo reconectando):
          // recupero mi propio nombre tal cual.
          finalName = existing;
        } else {
          // Ocupado por otra conexión viva: me asignan una variante.
          finalName = uniqueName(room.users, requested);
          room.users = [...room.users, finalName];
        }
      }

      // Si esta conexión ya tenía otro nombre reclamado, se libera.
      for (const [name, own] of room.claims) {
        if (own === socket && name !== finalName) room.claims.delete(name);
      }
      room.claims.set(finalName, socket);
      break;
    }
    case "castVote": {
      // Siempre se vota como quien está conectado, sin importar qué mande
      // el cliente: así nadie puede votar en nombre de otra persona.
      const me = nameOf(room, socket);
      if (!me) break; // todavía no se ha registrado
      room.votes = castVote(room.votes, me, String(action.place ?? ""));
      break;
    }
    case "resetVotes":
      room.votes = {};
      room.runoffPlaces = null;
      room.lastPick = null;
      break;
    case "setMode":
      room.mode = action.mode === "vote" ? "vote" : "random";
      break;
    case "randomPick":
      room.lastPick = pickRandom(room.places);
      break;
    case "requestWinner": {
      // No se resuelve nada hasta que TODOS los registrados hayan votado.
      const everyoneVoted = room.users.length > 0 &&
        room.users.every((user) => votedFor(room.votes, user) !== null);
      if (!everyoneVoted) break;

      // Se decide en el servidor (no en cada cliente) para que dos personas
      // no puedan disparar rondas de desempate en conflicto al mismo tiempo.
      const { winner, tie, counts } = tallyVotes(Object.values(room.votes));
      if (tie) {
        room.runoffPlaces = topChoices(counts);
        room.votes = {};
        room.lastPick = null;
      } else {
        room.runoffPlaces = null;
        room.lastPick = winner;
      }
      break;
    }
    default:
      // Acción desconocida: se ignora silenciosamente: el servidor mantiene
      // el estado tal cual estaba, el emisor recibirá igualmente el próximo
      // broadcast si algo más cambia.
      break;
  }
}
