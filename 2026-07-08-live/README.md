# ¿Dónde comemos en CDMX? — en vivo, multi-dispositivo

Versión en tiempo real de `../2026-07-08/`: en vez de vivir en un solo
navegador, el estado vive en un servidor Deno con WebSockets, así que un
grupo entero puede compartir una URL y votar cada quien desde su celular,
viendo resultados en vivo.

Ver el plan completo de arquitectura en
[`../2026-07-08/MULTIDEVICE-PLAN.md`](../2026-07-08/MULTIDEVICE-PLAN.md).

## Arranque rápido

```bash
deno task dev    # Sirve la app en http://localhost:8000
deno task test   # Corre todas las pruebas (decide.js, room.ts, servidor con WebSockets reales)
```

Abre `http://localhost:8000` sin `?room=` para crear una sala nueva; te
manda a `http://localhost:8000/?room=<slug>`. Comparte esa URL — cualquiera
que la abra entra a la misma sala.

## Cómo funciona

- `static/decide.js` — la misma lógica pura de `../2026-07-08/decide.js`
  (copiada verbatim), reutilizada **sin cambios** tanto en el navegador
  como en el servidor.
- `room.ts` — el estado de cada sala (`Map<roomId, RoomState>` en memoria),
  aplicando las acciones de los clientes con las funciones de `decide.js`.
- `server.ts` — un único `Deno.serve` que sirve los archivos estáticos y
  atiende `/ws?room=<id>` con `Deno.upgradeWebSocket`. Cada mutación se
  transmite como snapshot completo a todos los sockets de esa sala.
- `static/index.html` — el cliente: se conecta por WebSocket, manda acciones
  (`addPlace`, `castVote`, `requestWinner`, etc.) y vuelve a dibujar la UI
  cada vez que llega un snapshot del servidor.

El desempate sigue funcionando igual que en la versión de un solo
dispositivo: si hay empate, se abre una ronda de votación **solo entre los
lugares empatados** — nunca se decide al azar. Ahora esa decisión la toma el
servidor (no cada cliente), para que dos personas no puedan disparar rondas
de desempate en conflicto al mismo tiempo.

## Persistencia

El estado vive **solo en memoria**. Un redeploy o un reinicio del contenedor
borra todas las salas — ver la sección 12 del plan para el detalle y el
porqué es un trade-off aceptable para un evento de una sola noche.

## Docker

```bash
docker build -t dojo-cdmx-live .
docker run -p 8000:8000 dojo-cdmx-live
```

## Despliegue en DigitalOcean (cuenta TeamAwesomelab)

```bash
# la primera vez:
doctl auth init --context teamawesomelab
# si ya existe el contexto:
doctl auth switch --context teamawesomelab

doctl apps create --spec app-spec.yaml
```

O desde la consola web: selecciona el equipo **TeamAwesomelab** en el
selector de cuenta antes de "Create App", y apunta al repo
`rkasper/global-coding-dojo` con `source_dir: /2026-07-08-live`.

`instance_count` debe quedarse en `1` — el estado vive en memoria de un solo
proceso y App Platform no da sticky sessions para WebSockets entre
instancias.

**Antes del evento:** desplegar y probar desde un celular real por datos
móviles que `wss://` conecta y que la conexión sobrevive varios minutos con
la pantalla bloqueada (el cliente manda un heartbeat cada ~20s para esto).
