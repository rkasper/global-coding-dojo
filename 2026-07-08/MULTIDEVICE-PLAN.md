# Plan: "¿Dónde comemos en CDMX?" multi-dispositivo en tiempo real

Plan de arquitectura para convertir la app actual (un solo navegador,
`localStorage`) en una app **multi-dispositivo**: un grupo comparte una URL,
cada quien vota desde su propio celular, y todos ven los resultados en vivo.

**Estado de este documento:** plan de implementación, listo para ejecutarse en
una sesión de dojo futura. No cambia la app estática actual en `2026-07-08/`
(sigue funcionando igual, sin backend, como hasta hoy).

---

## 1. Objetivo y contexto

Hoy, `2026-07-08/index.html` funciona en un solo dispositivo: los lugares y
usuarios se guardan en `localStorage` de ese navegador, y los votos viven solo
en memoria de esa pestaña. Si dos personas abren la app en dos celulares
distintos, tienen **dos sesiones completamente independientes** — no hay
manera de que voten juntos.

El objetivo es que un grupo pueda:

1. Abrir **una URL compartida** (ej. `https://dojo.ejemplo.com/?room=ab3f9k`).
2. Cada persona se registra y vota **desde su propio celular**.
3. Todos ven la lista de lugares, quién está registrado, los conteos de votos
   y el resultado (incluida una ronda de desempate) **actualizarse al
   instante**, sin recargar la página.

## 2. Arquitectura actual (resumen)

- `decide.js` — lógica pura, sin DOM ni red: `addPlace`/`removePlace`,
  `addUser`/`removeUser`, `castVote`, `votedFor`, `tallyVotes`, `topChoices`,
  `pickRandom`. Ya corre sin cambios tanto en el navegador (`index.html`)
  como en Deno (`decide_test.ts`).
- `index.html` — todo el estado (`places`, `users`, `mode`, `votes`,
  `currentVoter`, `runoffPlaces`) vive en variables JS de una sola pestaña;
  `places`/`users` se persisten a `localStorage`, el resto se pierde al
  recargar.
- Sin servidor, sin build, sin framework.

Esta separación (lógica pura vs. UI) es el activo más importante para el
rediseño: **`decide.js` se puede reutilizar tal cual en un servidor Deno**,
como la lógica autoritativa de cada "sala" de votación.

## 3. Requisitos del sistema nuevo

- Una URL por sala (`?room=<slug>`), compartible por WhatsApp/QR.
- Sincronización **instantánea** entre todos los dispositivos de una sala
  (confirmado con el usuario: no vale con refrescar cada pocos segundos).
- Hospedaje en **DigitalOcean**, cuenta/equipo **TeamAwesomelab** (confirmado
  con el usuario — no Supabase, no Firebase, no Deno Deploy).
- Pensado para una sala activa a la vez en un evento de dojo, pero con
  `roomId` para que distintos eventos no choquen si se reutiliza el mismo
  despliegue en el futuro.

## 4. Comparación de opciones de backend

| Opción | Setup | Costo | Latencia real-time | Encaje con este repo |
|---|---|---|---|---|
| **Supabase Realtime** | Bajo/medio (cuenta nueva, Postgres administrado, cliente JS) | Tier gratis generoso | Buena (~sub-segundo) | Cuenta nueva de terceros; suele pedir npm/bundler, y este repo no tiene ninguno |
| **Firebase Realtime DB / Firestore** | Bajo/medio (cuenta Google Cloud, SDK) | Tier gratis generoso | Buena (~100-300ms) | Cuenta nueva de terceros; stack orientado a npm |
| **Deno Deploy + Deno KV + WebSocket** | Medio (mismo runtime que ya usan, deploy sin config, KV gratis incluido) | Gratis en el tier básico | Muy buena | Técnicamente el más parecido (mismo Deno, reutiliza `decide.js` igual), pero es **otro proveedor de hosting**, no DigitalOcean |
| **Ably / Pusher (pub/sub administrado)** | Bajo (SDK + canal, sin escribir server de sync) | Tier gratis cubre holgadamente unas decenas de sockets | Muy buena, con SLA | Capa de pago de terceros sobre una infraestructura (DO) que ya tienen funcionando; sigue haciendo falta un backend propio para el estado autoritativo — no aporta contra la complejidad real |
| **Servidor Deno + WebSockets nativo en DigitalOcean (recomendado)** | Medio-alto (se escribe la sala/broadcast, pero es poco código: `Deno.upgradeWebSocket` viene en el runtime, sin dependencias) | $0 incremental — reutiliza el mismo plan de App Platform que ya paga `2026-03-18/` | Muy buena (broadcast directo en el mismo proceso, sin saltos a terceros) | Total: mismo proveedor, mismo patrón ya usado (`2026-03-18/`), `decide.js` corre **sin modificar** en cliente y servidor |

**Conclusión:** dado que ya usan DigitalOcean, quieren tiempo real
instantáneo, y `decide.js` ya es 100% lógica pura y reutilizable, la opción
que gana es el servidor Deno propio con WebSockets nativos en DigitalOcean.
No agrega cuentas ni dependencias nuevas, y reutiliza directamente el patrón
de despliegue que el repo ya tiene probado en `2026-03-18/`.

## 5. ¿Se puede con WebSockets? Sí — cómo exactamente

Deno 2.x soporta WebSockets nativos sin librerías externas, vía
`Deno.upgradeWebSocket(req)` dentro del mismo handler HTTP que ya sirve los
archivos estáticos:

```ts
const { socket, response } = Deno.upgradeWebSocket(request);
// socket: WebSocket estándar (onopen/onmessage/onclose/onerror, .send(), .close())
// response: se debe devolver esta Response para completar el "upgrade"
```

Restricción a tener en cuenta: no se puede leer el body del `Request` antes de
llamar `upgradeWebSocket`, y la llamada debe ocurrir en el mismo handler que
devuelve la `Response`.

Un único `Deno.serve(handler)` sirve tanto los estáticos como `/ws`:

```ts
// server.ts (extracto)
import {
  getOrCreateRoom, applyAction, snapshot, addSocket, removeSocket, broadcast,
} from "./room.ts";

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/ws") {
    const roomId = url.searchParams.get("room");
    if (!roomId || req.headers.get("upgrade") !== "websocket") {
      return new Response("Expected WebSocket with ?room=", { status: 400 });
    }
    const { socket, response } = Deno.upgradeWebSocket(req);
    const room = getOrCreateRoom(roomId);

    socket.onopen = () => {
      addSocket(room, socket);
      socket.send(JSON.stringify({ type: "state", ...snapshot(room) }));
    };
    socket.onmessage = (event) => {
      try {
        const action = JSON.parse(event.data);
        applyAction(room, action);   // usa decide.js, sin modificarlo
        broadcast(room);              // snapshot -> todos los sockets de la sala
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "bad message" }));
      }
    };
    socket.onclose = () => removeSocket(room, socket);
    return response;
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    const html = await Deno.readFile("./static/index.html");
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  if (req.method === "GET" && url.pathname === "/decide.js") {
    const js = await Deno.readFile("./static/decide.js");
    return new Response(js, { headers: { "content-type": "application/javascript; charset=utf-8" } });
  }
  return new Response("Not Found", { status: 404 });
}

const port = parseInt(Deno.env.get("PORT") ?? "8000", 10);
Deno.serve({ port }, handler);
```

## 6. Modelo de datos / estado por sala

Estado en memoria, un `Map<roomId, RoomState>` por proceso:

```ts
// room.ts
import {
  addPlace, removePlace, addUser, removeUser, castVote,
  tallyVotes, topChoices, pickRandom,
} from "./decide.js";

const SEED = ["Tacos al pastor", "Pozole", "Tortas", "Sushi", "Pizza", "Ramen"];

export interface RoomState {
  places: string[];
  users: string[];
  mode: "random" | "vote";
  votes: Record<string, string>;
  runoffPlaces: string[] | null;
  lastPick: string | null;
  sockets: Set<WebSocket>;
}

const rooms = new Map<string, RoomState>();

export function getOrCreateRoom(id: string): RoomState {
  let room = rooms.get(id);
  if (!room) {
    room = {
      places: [...SEED], users: [], mode: "random",
      votes: {}, runoffPlaces: null, lastPick: null, sockets: new Set(),
    };
    rooms.set(id, room);
  }
  return room;
}
```

`decide.js` se reutiliza **verbatim**: no se reescribe ni se porta a
TypeScript. Este es el mayor punto de reuso del plan — la misma lógica pura
corre en el navegador (para renderizar) y en el servidor (como fuente única
de verdad).

## 7. Protocolo de mensajes WebSocket

**No hay mensaje explícito de "join"**: la sala se identifica por
`?room=<id>` en la URL de conexión, y el primer mensaje que manda el servidor
(`socket.onopen`) es ya el snapshot completo — eso evita una condición de
carrera donde un cliente mande acciones antes de terminar de "unirse".

Cliente → servidor (todos los mensajes son `{ type: string, ...payload }`):

| `type` | payload | efecto |
|---|---|---|
| `addPlace` | `{ name }` | `decide.addPlace` |
| `removePlace` | `{ name }` | `decide.removePlace` |
| `claimIdentity` | `{ name }` | reclama un nombre para ESTA conexión — ver nota abajo |
| `castVote` | `{ place }` | vota como la identidad reclamada por esta conexión (no por lo que mande el cliente) |
| `resetVotes` | `{}` | limpia votos + runoff |
| `setMode` | `{ mode }` | cambia el modo para todos |
| `randomPick` | `{}` | `pickRandom` en el servidor — todos ven el mismo resultado |
| `requestWinner` | `{}` | si TODOS los registrados ya votaron: corre `tallyVotes`/`topChoices`; si hay empate, arma `runoffPlaces` y limpia votos. Si falta alguien por votar, no hace nada |

**Importante:** `requestWinner` (el botón "Ver ganador" actual, incluida la
lógica de desempate/runoff) se decide **en el servidor**, no en cada cliente
por separado — así dos personas no pueden disparar rondas de desempate en
conflicto al mismo tiempo.

> **Nota de implementación (post-plan):** al construirse, `addUser`/`removeUser`
> se reemplazaron por `claimIdentity`, y `requestWinner` se endureció para
> esperar a que todos los registrados voten antes de resolver — dos
> refinamientos pedidos después de desplegar la primera versión. El servidor
> guarda qué conexión "es" cada nombre (`room.claims`) y **siempre** vota
> como esa identidad, ignorando cualquier `user` que mande el cliente — así
> nadie puede votar por otra persona. Si el nombre pedido ya está reclamado
> por otra conexión viva, se asigna una variante ("Ana" → "Ana 2"). Detalle
> completo en `../2026-07-08-live/README.md`.

Servidor → cliente: **un solo tipo de mensaje**, snapshot completo del
estado, transmitido a todos los sockets de la sala después de cada mutación
— con un campo extra, `myName`, **distinto para cada socket** (la identidad
que esa conexión tiene reclamada, o `null`):

```json
{
  "type": "state",
  "places": ["Tacos al pastor", "Pozole"],
  "users": ["Ana", "Beto"],
  "mode": "vote",
  "votes": { "Ana": "Tacos al pastor" },
  "runoffPlaces": null,
  "lastPick": null,
  "myName": "Ana"
}
```

Se prefiere el snapshot completo sobre parches/deltas: dado el tamaño de cada
sala (unas cuantas decenas de sockets como mucho), el payload es de unos
cientos de bytes, y evitar deltas elimina toda una clase de bugs de
desincronización — importante para un artefacto que además es material de
enseñanza. El cliente sigue usando `decide.js` para calcular `tallyVotes`,
`votedFor`, `topChoices` **localmente** sobre el snapshot recibido, igual que
hoy — no se duplica lógica.

Más `{ "type": "error", "message": "..." }` para mensajes malformados.

## 8. Cambios en el cliente (`index.html`)

Se elimina todo el `localStorage` y la mutación local directa. El estado del
cliente pasa a ser un espejo del último snapshot recibido:

```js
const room = new URLSearchParams(location.search).get("room");
let ws, backoff = 1000;

function connect() {
  ws = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws?room=${room}`);
  ws.onopen = () => { backoff = 1000; };
  ws.onmessage = (e) => applyState(JSON.parse(e.data));
  ws.onclose = () => setTimeout(connect, backoff = Math.min(backoff * 2, 10000));
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && (!ws || ws.readyState !== WebSocket.OPEN)) connect();
});
window.addEventListener("online", () => { if (ws?.readyState !== WebSocket.OPEN) connect(); });
connect();

function send(action) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(action));
}

function applyState(s) {
  places = s.places; users = s.users; mode = s.mode;
  votes = s.votes; runoffPlaces = s.runoffPlaces;
  renderUsers(); render(); renderVoterChips();
}
```

Cada manejador existente pasa de "mutar + guardar + renderizar" a "mandar una
acción":

```js
form.addEventListener("submit", (e) => {
  e.preventDefault();
  send({ type: "addPlace", name: input.value });
  input.value = ""; input.focus();
});
```

La reconexión con backoff exponencial (tope de 10s) más reconexión inmediata
en `visibilitychange`/`online` cubre el escenario real de un dojo: celulares
que bloquean pantalla o pierden señal brevemente. Se agrega un heartbeat
ligero (`send({type:"ping"})` cada ~20-25s) específicamente para no chocar
con el timeout de inactividad de DigitalOcean App Platform (ver sección 13).

## 9. Crear y compartir una sala

- El `roomId` se genera **en el cliente**, sin ida y vuelta al servidor para
  "reservarlo" — las salas se crean de forma perezosa en el servidor al
  primer `connect` de ese `roomId`. Slug corto de 6-8 caracteres con alfabeto
  sin ambigüedades (`23456789abcdefghjkmnpqrstuvwxyz`, sin `0/o/1/l/i`) vía
  `crypto.getRandomValues`.
- Si la URL no trae `?room=`: se muestra una pantalla mínima "Crear sala" en
  vez de la app. Un botón genera el slug y navega a `/?room=<slug>`.
- Dentro de una sala: una barra "Compartir" con la URL completa, botón
  "Copiar link" (`navigator.clipboard.writeText`) y un código QR para
  escanear desde el celular. Opción más simple sin dependencias:
  `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...">`
  (una línea, pero depende de un servicio externo alcanzable desde el lugar
  del evento — si se prefiere cero llamadas externas, se puede vender una
  librería JS de un solo archivo para generar el QR localmente).

## 10. Estructura de archivos nueva

Carpeta separada `2026-07-08-live/`, hermana de la `2026-07-08/` estática
actual (que **no se toca** — sigue funcionando como referencia/fallback
simple):

```
2026-07-08-live/
  Dockerfile
  deno.json
  app-spec.yaml
  server.ts
  server_test.ts
  room.ts
  room_test.ts
  static/
    index.html          # adaptado: WebSocket en vez de localStorage
    decide.js            # copiado verbatim de 2026-07-08/decide.js
  decide_test.ts          # copiado verbatim de 2026-07-08/decide_test.ts
  README.md
```

Se copian `decide.js`/`decide_test.ts` en vez de importarlos entre carpetas:
`source_dir` de DigitalOcean App Platform aísla el contexto de build a esa
subcarpeta — un import entre carpetas rompería tanto el build de Docker como,
más sutilmente, el contexto de build de App Platform — igual que ya hace
`2026-03-18/` con sus propias dependencias. Se deja un comentario de una
línea en el archivo copiado señalando su origen (`// copiado verbatim de
../2026-07-08/decide.js — mantener sincronizado a mano`).

## 11. Plan de pruebas

- `decide_test.ts` se copia **sin cambios** — no hace falta tocar nada, ese es
  justamente el beneficio de tener la lógica separada del DOM.
- `room_test.ts` — prueba `room.ts` sin red:
  - sala nueva arranca con el `SEED` de lugares y usuarios/votos vacíos.
  - `addPlace`/`removePlace`/`addUser`/`removeUser` delegan correctamente.
  - `castVote` + `requestWinner` con mayoría clara fija `lastPick` sin runoff.
  - `castVote` con empate + `requestWinner` arma `runoffPlaces` con los
    lugares empatados y limpia `votes` (replica el comportamiento actual del
    botón "Ver ganador", ahora centralizado en el servidor).
  - `resetVotes` limpia votos y runoff pero conserva usuarios/lugares.
  - dos `roomId` distintos nunca se mezclan entre sí.
- `server_test.ts` — integración, mismo estilo que
  `2026-03-18/server_test.ts` (levantar `Deno.serve(handler)` en un puerto de
  prueba, usar el cliente `WebSocket` nativo de Deno):

```ts
Deno.test("addPlace se transmite a todos los sockets de la misma sala", async () => {
  const server = Deno.serve({ port: 8099 }, handler);
  const a = new WebSocket("ws://localhost:8099/ws?room=t1");
  const b = new WebSocket("ws://localhost:8099/ws?room=t1");
  await Promise.all([once(a, "open"), once(b, "open")]);
  await once(a, "message"); await once(b, "message"); // snapshots iniciales
  a.send(JSON.stringify({ type: "addPlace", name: "Birria" }));
  const msg = JSON.parse((await once(b, "message")).data);
  assertEquals(msg.places.includes("Birria"), true);
  a.close(); b.close();
  await server.shutdown();
});
```

  Otros casos: `GET /` y `GET /decide.js` siguen devolviendo 200; JSON
  malformado en el socket devuelve un mensaje `error` en vez de tumbar el
  handler; un payload demasiado grande se rechaza; `GET /ws` sin `?room=`
  devuelve 400 en vez de hacer el upgrade. Usar
  `sanitizeResources: false, sanitizeOps: false` igual que
  `2026-03-18/server_test.ts`, y cerrar sockets + `server.shutdown()` siempre
  en un `finally`.

## 12. Persistencia

El estado es **solo en memoria**: el `Map` de salas vive en el heap de un
solo proceso Deno. Un redeploy (`deploy_on_push: true`) o cualquier reinicio
del contenedor **borra todas las salas**. Es un trade-off aceptable e
intencional para un evento de una sola noche, pero se documenta como riesgo
operativo: no hacer push de commits a mitad del evento a menos que perder los
votos sea aceptable, y tener en cuenta que App Platform también puede
reiniciar el contenedor por razones fuera de nuestro control (fallos de
health-check, mantenimiento de la plataforma).

Ruta de mejora futura señalada pero **explícitamente fuera de alcance ahora**:
snapshot periódico a un archivo JSON o SQLite sobrevive un crash del proceso,
pero no un redeploy (el filesystem de App Platform también es efímero entre
deploys). Persistencia real necesitaría una base de datos administrada de
DigitalOcean o un bucket de Spaces — claramente fuera de alcance para este
caso de uso.

## 13. Despliegue en DigitalOcean (cuenta TeamAwesomelab)

Confirmado: App Platform soporta tráfico WebSocket sobre el mismo
`http_port`, expuesto como `wss://` en el puerto 443 — no requiere ninguna
bandera especial además del `http_port` ya usado. Dos restricciones dan forma
al diseño:

- **Sin sticky sessions para WS** en el balanceador de carga de App Platform.
  Como el estado de la sala vive en memoria de un solo proceso,
  **`instance_count` debe quedarse en 1** — es una restricción arquitectónica
  dura, no un parámetro de rendimiento. Si algún día se sube por encima de 1,
  una reconexión de un cliente podría caer en una instancia sin el estado de
  esa sala.
- **Timeout de inactividad de ~30-120s** en la capa del balanceador/HTTP. Se
  mitiga con el heartbeat de ~20-25s del cliente (sección 8) — cualquier
  tráfico reinicia el timer de inactividad, no solo los frames de control WS.
- En un redeploy/SIGTERM las conexiones reciben un cierre limpio, así que la
  reconexión con backoff del cliente se recupera sola una vez que la nueva
  instancia está arriba (con la pérdida de estado ya señalada en la sección 12).

`app-spec.yaml`:

```yaml
name: dojo-cdmx-live
region: nyc
services:
  - name: dojo-cdmx-live
    github:
      repo: rkasper/global-coding-dojo
      branch: main
      deploy_on_push: true
    source_dir: /2026-07-08-live
    dockerfile_path: 2026-07-08-live/Dockerfile
    http_port: 8000
    instance_count: 1          # DEBE quedarse en 1: estado en memoria, sin sticky sessions para WS
    instance_size_slug: apps-s-1vcpu-0.5gb
    routes:
      - path: /
```

`Dockerfile`: prácticamente idéntico a `2026-03-18/Dockerfile` — no hace
falta ninguna bandera de permiso nueva (el upgrade de WebSocket viaja sobre
el `--allow-net` que ya se concede), solo copiar con los nombres de archivo
de la nueva carpeta.

**Crear la app bajo el equipo TeamAwesomelab:**

- Vía consola web de DigitalOcean: seleccionar el equipo **TeamAwesomelab**
  en el selector de cuenta/equipo *antes* de darle a "Create App", luego
  apuntar al repo `rkasper/global-coding-dojo` con `source_dir:
  /2026-07-08-live`.
- Vía `doctl`: autenticar con un token de la cuenta TeamAwesomelab
  (`doctl auth init --context teamawesomelab` la primera vez, o
  `doctl auth switch --context teamawesomelab` si ya existe ese contexto),
  y luego `doctl apps create --spec 2026-07-08-live/app-spec.yaml`.

**Verificación recomendada el día antes del evento** (no solo confiar en este
documento): desplegar con este `app-spec.yaml`, conectar desde un celular
real por datos móviles, y confirmar específicamente (a) que `wss://` conecta,
y (b) que una conexión sobrevive 5-10 minutos con la pantalla bloqueada
(heartbeat activo). Si App Platform no coopera con WebSockets de larga
duración, el plan B documentado es un Droplet con Caddy o nginx como proxy
WebSocket (`proxy_set_header Upgrade $http_upgrade; proxy_set_header
Connection "upgrade";` en nginx, o unas 10 líneas de Caddyfile con HTTPS
automático) frente al mismo `server.ts`.

## 14. Costo

Reutiliza el mismo plan/cuenta que ya paga `2026-03-18/`
(`apps-s-1vcpu-0.5gb`), bajo la cuenta TeamAwesomelab. Sin costo incremental
de terceros — ninguna opción del punto 4 aparte de esta agrega una cuenta o
factura nueva.

## 15. Seguridad básica

- Sin login: apropiado para una herramienta entre conocidos en un dojo.
- Slug de sala no adivinable (sección 9) — nunca IDs secuenciales, para que
  alguien externo no pueda enumerar salas activas.
- La sanitización de texto ya la cubre `normalize()` (recorta/colapsa
  espacios) — no es escape de HTML, pero el render actual ya usa
  `textContent` (no `innerHTML`) para todo texto de usuario, así que XSS no
  es un problema mientras se mantenga esa convención en el nuevo render
  dirigido por WebSocket. Se señala como recordatorio de "no regresar", no
  como trabajo nuevo.
- Un par de líneas de endurecimiento razonable: limitar el tamaño de mensaje
  entrante (rechazar/cerrar si `event.data.length > 2000`) y una limitación
  de frecuencia trivial por socket (ignorar mensajes más rápidos que ~50ms
  entre sí), para que un cliente con un bug no pueda inundar de broadcasts a
  toda la sala.

## 16. Requisitos por nivel (para repartir en un dojo futuro)

### 🟢 Nivel 0
- Cambiar el `SEED` de lugares default en `room.ts`.
- Ajustar textos/colores de la pantalla "Crear sala".
- Agregar el heartbeat del cliente (`setInterval` + `send({type:"ping"})`).

### 🟡 Intermedio
- Implementar `room_test.ts` (altas/bajas, empate → runoff, reset, aislamiento
  entre salas).
- Implementar la reconexión con backoff + `visibilitychange`/`online` en el
  cliente.
- Agregar el botón "Copiar link" y el código QR.

### 🟠 Avanzado
- Implementar `server.ts` completo (`Deno.upgradeWebSocket`, broadcast,
  manejo de `/ws`).
- Escribir `server_test.ts` con clientes `WebSocket` reales.
- Preparar y probar el despliegue en DigitalOcean (`app-spec.yaml`, `doctl`,
  verificación desde un celular real).
- Agregar el límite de tamaño de mensaje y la limitación de frecuencia por
  socket.

## 17. Seguimiento al implementarse

Cuando esto se construya, actualizar la línea en
`2026-07-08/README.md` bajo "🟠 Avanzado" que hoy dice *"Tiempo real: que
varias personas voten desde su teléfono y se sincronice (Supabase Realtime o
Firebase)"* para que en su lugar apunte a este documento
(`2026-07-08/MULTIDEVICE-PLAN.md`) y a la carpeta `2026-07-08-live/`.

---

## Archivos de referencia usados para este plan

- `2026-07-08/decide.js`, `2026-07-08/index.html`, `2026-07-08/decide_test.ts` — base de la app actual.
- `2026-03-18/server.ts`, `2026-03-18/server_test.ts`, `2026-03-18/app-spec.yaml`, `2026-03-18/Dockerfile`, `2026-03-18/deno.json` — patrón de despliegue Deno + Docker + DigitalOcean ya probado en este repo, replicado aquí.
