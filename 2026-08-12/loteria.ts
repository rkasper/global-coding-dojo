import {randomSeeded, shuffle} from "jsr:@std/random@0.1.0";

const BARAJA = [
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

export function carta(numero: number): string {
  return BARAJA[numero - 1];
}

export function crearBaraja(): number[] {
  return BARAJA.map((_nombre, indice) => indice + 1);
}

export function barajar(baraja: number[], semilla: number): number[] {
  return shuffle(baraja, {prng: randomSeeded(BigInt(semilla))});
}

// Las marcas van en paralelo a las cartas: marcadas[i] dice si cartas[i]
// ya fue cantada.
export type Tabla = {
  cartas: number[];
  marcadas: boolean[];
};

export function crearTabla(cartas: number[]): Tabla {
  return {
    cartas: [...cartas],
    marcadas: cartas.map(() => false),
  };
}

export function marcar(tabla: Tabla, numero: number): Tabla {
  const posicion = tabla.cartas.indexOf(numero);

  return {
    ...tabla,
    marcadas: tabla.marcadas.map((marcada, i) => marcada || i === posicion),
  };
}
