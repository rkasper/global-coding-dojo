# Kata: Cantar la Lotería 🇲🇽

Vamos a construir el motor de un juego de Lotería Mexicana: la baraja de 54 cartas, el gritón que canta, la tabla del jugador y la detección del ganador. Todo paso a paso con TDD.

Reglas del juego, por si alguien no ha jugado:

- La baraja tiene **54 cartas**, cada una con número y nombre (`1 → "El gallo"`).
- Cada jugador tiene una **tabla de 4×4** con 16 cartas distintas.
- El gritón baraja y va **cantando** cartas una por una.
- Quien completa el patrón acordado (línea, cuatro esquinas, tabla llena…) grita **«¡Lotería!»** y gana.

---

## Nivel 1 — Una Carta

Una función que, dado un número, regresa el nombre de la carta.

```typescript
carta(1)   // "El gallo"
carta(2)   // "El diablito"
carta(54)  // "La rana"
```

### Reglas

- Los números válidos van del 1 al 54
- Un número fuera de rango lanza un error
- (Sí, puedes empezar con `if (n === 1) return "El gallo"` — es TDD, está permitido 😄)

---

## Nivel 2 — La Baraja Completa

Una función que regresa la baraja entera, en orden.

```typescript
crearBaraja()          // [1, 2, 3, ..., 54]  (o cartas, tú decides la forma)
crearBaraja().length   // 54
```

### Reglas

- Exactamente 54 cartas
- Sin repetidos
- La primera es El gallo, la última es La rana

---

## Nivel 3 — Barajar (sin perder cartas)

Barajar es aleatorio… y lo aleatorio es difícil de probar. El truco: recibe una **semilla** para que el resultado sea reproducible.

```typescript
barajar(crearBaraja(), 42)              // siempre el mismo orden para la semilla 42
barajar(crearBaraja(), 42).length       // 54
barajar(crearBaraja(), 7) !== barajar(crearBaraja(), 42)  // órdenes distintos
```

### Reglas

- Siguen siendo las mismas 54 cartas: ninguna se pierde ni se duplica
- La misma semilla siempre produce el mismo orden
- Semillas distintas producen órdenes distintos (casi siempre)

> 💡 **Pista:** la propiedad más fácil de probar no es «está bien barajado», sino «tiene las mismas 54 cartas». Empieza por ahí.

---

## Nivel 4 — La Tabla del Jugador

Una tabla de 4×4 con 16 cartas distintas, y la posibilidad de marcar una carta cuando la cantan.

```typescript
const tabla = crearTabla([1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]);

marcar(tabla, 9)    // marca la carta 9
marcar(tabla, 54)   // la carta 54 no está en esta tabla — no pasa nada
```

### Reglas

- Una tabla tiene exactamente 16 cartas, todas distintas
- Marcar una carta que no está en la tabla no es un error, simplemente no hace nada
- Marcar dos veces la misma carta es lo mismo que marcarla una vez

---

## Nivel 5 — ¡Lotería!

Detectar si una tabla ya ganó, según el patrón acordado.

```typescript
hayGanador(tabla, "linea")          // cualquier fila, columna o diagonal completa
hayGanador(tabla, "cuatroEsquinas") // las cuatro esquinas marcadas
hayGanador(tabla, "centro")         // los cuatro cuadros del centro
hayGanador(tabla, "tablaLlena")     // las 16 marcadas
```

### Reglas

- `linea`: 4 filas + 4 columnas + 2 diagonales — diez maneras de ganar
- `cuatroEsquinas`: posiciones (0,0), (0,3), (3,0), (3,3)
- `centro`: el cuadro de 2×2 en medio de la tabla
- Una tabla recién creada, sin marcas, no gana nada

> 💡 **Pista:** empieza con una sola fila. La primera. Ni siquiera todas las filas — una.

---

## Nivel 6 — El Gritón (extensiones, escoge tu aventura)

Escoge una o varias:

- **Los versos**: cada carta tiene su verso tradicional. `versoDe(1)` → `"El que le cantó a San Pedro no le volverá a cantar."` (Hay una lista abajo para empezar.)
- **Partida completa**: baraja, canta carta por carta, y regresa en qué turno ganó cada jugador.
- **Varios jugadores**: N tablas a la vez — ¿quién grita «¡Lotería!» primero? ¿Qué pasa si empatan?
- **Tabla aleatoria**: genera una tabla válida de 16 cartas distintas a partir de una semilla.
- **Tramposo**: dada una tabla y el orden de la baraja, ¿en qué turno *exactamente* va a ganar? (Muy útil para probar el resto.)
- **En pantalla**: dibuja la tabla en la terminal con las cartas marcadas — se ve increíble en la pantalla grande.

---

## Tips para TDD

1. **Una prueba que falle a la vez.** El ciclo rojo-verde-refactor ya te da el tamaño del paso.
2. **Empieza por la carta 1.** No por las 54.
3. **Lo aleatorio se prueba con semillas**, o probando propiedades («tiene 54 cartas») en vez de resultados exactos.
4. **La tabla es datos, no clase.** Resiste la tentación de la clase hasta que de verdad te estorbe.
5. **Refactoriza en verde**, nunca en rojo.

## Comandos

```bash
deno test
deno test --watch
```

---

## Datos de Referencia

### Las 54 cartas

```
 1 El gallo          19 La garza          37 El mundo
 2 El diablito       20 El pájaro         38 El apache
 3 La dama           21 La mano           39 El nopal
 4 El catrín         22 La bota           40 El alacrán
 5 El paraguas       23 La luna           41 La rosa
 6 La sirena         24 El cotorro        42 La calavera
 7 La escalera       25 El borracho       43 La campana
 8 La botella        26 El negrito        44 El cantarito
 9 El barril         27 El corazón        45 El venado
10 El árbol          28 La sandía         46 El sol
11 El melón          29 El tambor         47 La corona
12 El valiente       30 El camarón        48 La chalupa
13 El gorrito        31 Las jaras         49 El pino
14 La muerte         32 El músico         50 El pescado
15 La pera           33 La araña          51 La palma
16 La bandera        34 El soldado        52 La maceta
17 El bandolón       35 La estrella       53 El arpa
18 El violoncello    36 El cazo           54 La rana
```

### Algunos versos (para el Nivel 6)

| # | Carta | Verso |
|---|-------|-------|
| 1 | El gallo | El que le cantó a San Pedro no le volverá a cantar. |
| 2 | El diablito | Pórtate bien cuatito, si no te lleva el coloradito. |
| 5 | El paraguas | Para el sol y para el agua. |
| 6 | La sirena | Con los cantos de sirena, no te vayas a marear. |
| 7 | La escalera | Súbeme paso a pasito, no quieras pegar brinquitos. |
| 10 | El árbol | El que a buen árbol se arrima, buena sombra le cobija. |
| 23 | La luna | El farol de los enamorados. |
| 27 | El corazón | No me extrañes corazón, que regreso en el camión. |
| 30 | El camarón | Camarón que se duerme, se lo lleva la corriente. |
| 35 | La estrella | La guía de los marineros. |
| 46 | El sol | La cobija de los pobres. |
| 52 | La maceta | El que nace pa' maceta, no sale del corredor. |
| 54 | La rana | Al ver a la verde rana, qué brinco pegó tu hermana. |

---

## Para el Facilitador

- **Rotación**: 4 minutos por persona (como dice el deck de hoy)
- **Nivel sugerido para empezar**: Nivel 1 — la primera prueba la puede escribir quien nunca ha hecho TDD
- **Meta realista para 2 horas**: Niveles 1–4, quizás entrar al 5
- **Grupos mixtos**: los Niveles 1–2 son buenos para quien va empezando; el 3 (semillas) y el 5 (patrones) tienen jugo para quien ya tiene años programando
- **Atajo**: copiar las 54 cartas a mano quema 10 minutos de mob. Pídanle a Claude que teclee la lista de golpe — eso son datos, no lógica, y no vale la pena hacerlo por TDD
- **Nota sobre la carta 26**: el nombre tradicional es «El negrito». Si el grupo prefiere, las barajas modernas usan «El valiente moreno» o simplemente lo dejan como número — decídanlo entre todos al empezar, no a medio turno
