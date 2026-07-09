# ¿Dónde comemos en CDMX? 🌮

Dojo del **8 de julio de 2026** — CDMX (presencial).

Una app real, funcional y desplegable: un grupo propone lugares para comer y la
app **decide por el grupo** (al azar o por votación). El objetivo del dojo es
llevarla a producción esta misma noche y que **todos los niveles (0 a avanzado)**
tengan algo que aportar.

## Arranque rápido (1 minuto)

La app ya funciona. No necesita build ni instalar nada.

```bash
# Ábrela directamente en el navegador…
open index.html

# …o levanta un servidor local (recomendado, para que carguen los módulos JS):
python3 -m http.server 8000   # luego abre http://localhost:8000
```

Corre las pruebas de la lógica:

```bash
deno test --allow-read
```

## Arquitectura

Hay una separación intencional para que se pueda hacer **TDD** sobre la lógica
sin tocar el navegador:

| Archivo            | Qué es                                                              |
| ------------------ | ------------------------------------------------------------------ |
| `decide.js`        | **Lógica pura** (lugares, usuarios, votos, elegir al azar).        |
| `decide_test.ts`   | Pruebas Deno de esa lógica. **Escribe la prueba primero.**         |
| `index.html`       | La interfaz. Importa `decide.js` y guarda todo en `localStorage`.  |

> Regla del dojo: la lógica nueva vive en `decide.js` **con su prueba en
> `decide_test.ts`**. La UI solo llama a esas funciones.

## Modo votación (ya funciona)

1. Cada persona se **registra por su nombre** en «👥 ¿Quién viene?» (sin login,
   solo texto — se guarda en `localStorage`).
2. Se cambia a «🗳️ Votación».
3. Cada quien toca su propio chip en «¿Quién vota ahora?» y luego «Votar» en
   el lugar que quiere. **Un voto por persona** — votar de nuevo cambia su voto.
4. «🏆 Ver ganador» calcula el resultado con `tallyVotes`. **Si hay empate, no
   se rompe al azar:** se abre una nueva ronda de votación *solo entre los
   lugares empatados* (`topChoices`) — vuelven a votar únicamente esas
   opciones hasta que quede un ganador claro. Puede repetirse varias rondas.
5. «Reiniciar votos» borra los votos, cierra cualquier ronda de desempate y
   vuelve a votar entre todos los lugares (los usuarios registrados se quedan).

La lógica vive en `castVote`, `votedFor`, `addUser`/`removeUser` (mismas reglas
que `addPlace`/`removePlace`: sin duplicados, sin distinguir mayúsculas/acentos).

## Requisitos por nivel

Elige una tarjeta según tu nivel. Todas son independientes: se pueden repartir
entre parejas de *pair programming*.

### 🟢 Nivel 0 — empieza aquí
- [ ] Cambia los lugares iniciales (`SEED`) por tus antojos favoritos de CDMX.
- [ ] Cambia colores, título o emoji en `index.html`.
- [ ] Agrega un botón «Limpiar lista».

### 🟡 Intermedio
- [ ] Evita repetir el último lugar elegido dos veces seguidas (modo azar).
- [ ] Muestra cuántos de los registrados ya votaron (`X de Y`).
- [ ] Impide entrar a modo votación si no hay nadie registrado.

### 🟠 Avanzado
- [ ] **Compartir por link:** codifica la lista en la URL para pasarla por WhatsApp.
- [ ] **Cercanía:** usa `navigator.geolocation` + un mapa/link a Google Maps.
- [ ] Ruleta animada girando entre los lugares antes de revelar la elección.
- [x] **Tiempo real / multi-dispositivo:** implementado en `../2026-07-08-live/`
      — servidor Deno con WebSockets nativos desplegado en DigitalOcean, cada
      quien vota desde su celular compartiendo una URL de sala. Ver el plan
      completo en [`MULTIDEVICE-PLAN.md`](./MULTIDEVICE-PLAN.md).

## Despliegue a producción 🚀

Como es HTML + JS estático, el deploy es trivial. Cualquiera sirve:

- **Netlify Drop:** arrastra esta carpeta a <https://app.netlify.com/drop>. Listo.
- **GitHub Pages:** activa Pages sobre esta carpeta.
- **Vercel:** `vercel` en esta carpeta.

Comparte el link con el grupo y **úsenla para decidir la cena de hoy**. 🎉
