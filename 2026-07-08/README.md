# ¿Dónde comemos en CDMX? 🌮

Dojo del **8 de julio de 2026** — CDMX (presencial). Una app real, en
producción: un grupo comparte una sala por URL y decide dónde comer, cada
quien vota desde su propio celular, viendo resultados en vivo.

> Empezó como un kata de un solo dispositivo (`localStorage`, sin backend) y
> evolucionó a esta versión multi-dispositivo con WebSockets. El plan de esa
> evolución, con todas las opciones de backend evaluadas, está en
> [`MULTIDEVICE-PLAN.md`](./MULTIDEVICE-PLAN.md).

## Arranque rápido

```bash
deno task dev    # Sirve la app en http://localhost:8000
deno task test   # Corre todas las pruebas (decide.js, room.ts, servidor con WebSockets reales)
```

Abre `http://localhost:8000` sin `?room=` para crear una sala nueva; te
manda a `http://localhost:8000/?room=<slug>`. Comparte esa URL — cualquiera
que la abra entra a la misma sala.

## Arquitectura

Hay una separación intencional para que se pueda hacer **TDD** sobre la
lógica sin tocar el navegador ni la red:

| Archivo | Qué es |
| --- | --- |
| `static/decide.js` | **Lógica pura** (lugares, usuarios, votos, elegir al azar) — corre sin cambios en el navegador y en el servidor. |
| `decide_test.ts` | Pruebas Deno de esa lógica. **Escribe la prueba primero.** |
| `room.ts` | Estado de cada sala en memoria; aplica las acciones de los clientes usando las funciones de `decide.js`. |
| `room_test.ts` | Pruebas de `room.ts` sin red (altas/bajas, identidad, empates, "esperar a todos"). |
| `server.ts` | Un único `Deno.serve` que sirve los estáticos y atiende `/ws?room=<id>` con `Deno.upgradeWebSocket`. |
| `server_test.ts` | Pruebas de integración con clientes `WebSocket` reales. |
| `static/index.html` | El cliente: se conecta por WebSocket, manda acciones y vuelve a dibujar la UI con cada snapshot del servidor. |

> Regla del dojo: la lógica nueva vive en `decide.js` **con su prueba en
> `decide_test.ts`**. La UI y el servidor solo llaman a esas funciones.

## Modo votación

1. Cada persona se **registra por su nombre** en «👥 ¿Quién viene?» desde su
   propio celular (sin login). Si el nombre ya está tomado por otro
   dispositivo conectado, el servidor asigna una variante ("Ana" → "Ana 2");
   ver "Identidad por dispositivo" abajo.
2. Se cambia a «🗳️ Votación» — el modo es compartido, lo que elige una
   persona lo ven todos al instante.
3. Cada quien vota **como sí mismo**: no hay selector de "quién vota ahora",
   el botón "Votar" siempre registra tu propio voto. Un voto por persona —
   votar de nuevo cambia tu voto.
4. «🏆 Ver ganador» no resuelve nada hasta que **todos los registrados** hayan
   votado (se muestra "Faltan X de Y por votar" mientras tanto; ver
   "Esperar a que todos voten" abajo). Si hay empate, no se rompe al azar:
   se abre una ronda de votación *solo entre los lugares empatados*, hasta
   que quede un ganador claro. Puede repetirse varias rondas.
5. «Reiniciar votos» borra los votos y cierra cualquier ronda de desempate
   (los usuarios registrados se quedan).

### Identidad por dispositivo

Cada conexión reclama un nombre con `claimIdentity` y el servidor guarda qué
socket "es" cada nombre (`room.claims`). Un voto siempre se registra como
quien está conectado — el servidor ignora cualquier otro nombre que un
cliente intente mandar en `castVote`, así nadie puede votar por otra
persona. Si el nombre pedido ya está reclamado por OTRA conexión viva, se
asigna una variante ("Ana" → "Ana 2"); si es la misma conexión reconectando
(o el dueño original ya se desconectó), recupera su propio nombre tal cual.
El nombre confirmado se guarda en `localStorage` del navegador para que un
recargo de página vuelva a reclamar la misma identidad automáticamente.

### Esperar a que todos voten

`requestWinner` (el botón "🏆 Ver ganador") no resuelve nada — ni gana nadie,
ni se abre una ronda de desempate — hasta que **cada persona registrada**
tenga un voto puesto. Si alguien se registra a mitad de una votación,
también tiene que votar antes de que se pueda declarar un resultado.

## Requisitos por nivel

Elige una tarjeta según tu nivel. Todas son independientes: se pueden
repartir entre parejas de *pair programming*.

### 🟢 Nivel 0 — empieza aquí
- [ ] Cambia los lugares iniciales (`SEED` en `room.ts`) por tus antojos
      favoritos de CDMX.
- [ ] Cambia colores, título o emoji en `static/index.html`.
- [ ] Agrega un botón «Limpiar lista» (modo azar).

### 🟡 Intermedio
- [ ] Evita repetir el último lugar elegido dos veces seguidas (modo azar).
- [ ] Impide entrar a modo votación si no hay nadie registrado.
- [ ] `room.ts` ya tiene `roomCount()` sin usar — expón un endpoint
      `GET /status` que reporte cuántas salas activas hay ahora mismo.

### 🟠 Avanzado
- [ ] **Cercanía:** usa `navigator.geolocation` + un mapa/link a Google Maps.
- [ ] Ruleta animada girando entre los lugares antes de revelar la elección.
- [ ] Persistencia ligera: snapshot periódico a un archivo o SQLite para
      sobrevivir un reinicio del contenedor (ver "Persistencia" abajo para
      los límites reales de esto en DigitalOcean App Platform).

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
`rkasper/global-coding-dojo` con `source_dir: /2026-07-08`.

`instance_count` debe quedarse en `1` — el estado vive en memoria de un solo
proceso y App Platform no da sticky sessions para WebSockets entre
instancias.

**Antes del evento:** desplegar y probar desde un celular real por datos
móviles que `wss://` conecta y que la conexión sobrevive varios minutos con
la pantalla bloqueada (el cliente manda un heartbeat cada ~20s para esto).
