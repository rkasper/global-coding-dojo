// Estado de cada sala de votación. Vive en memoria (ver MULTIDEVICE-PLAN.md
// sección 12): un redeploy o reinicio del contenedor borra todas las salas.

import {
  addPlace,
  addUser,
  castVote,
  pickRandom,
  removePlace,
  removeUser,
  tallyVotes,
  topChoices,
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
}

// Snapshot enviado al cliente: todo el estado excepto los sockets (que no
// son serializables y son un detalle del servidor, no del dominio).
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

export function broadcast(room: RoomState): void {
  const message = JSON.stringify({ type: "state", ...snapshot(room) });
  for (const socket of room.sockets) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  }
}

// Aplica una acción de cliente al estado de la sala, usando exclusivamente
// las funciones puras de decide.js. No hace nada con acciones desconocidas.
export function applyAction(room: RoomState, action: Action): void {
  switch (action.type) {
    case "addPlace":
      room.places = addPlace(room.places, String(action.name ?? ""));
      break;
    case "removePlace":
      room.places = removePlace(room.places, String(action.name ?? ""));
      break;
    case "addUser":
      room.users = addUser(room.users, String(action.name ?? ""));
      break;
    case "removeUser":
      room.users = removeUser(room.users, String(action.name ?? ""));
      break;
    case "castVote":
      room.votes = castVote(
        room.votes,
        String(action.user ?? ""),
        String(action.place ?? ""),
      );
      break;
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
