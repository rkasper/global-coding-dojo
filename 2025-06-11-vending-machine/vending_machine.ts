let amount_collected: number = 0;

export enum AcceptedCoins {
  Penny = 1,
  Nickel = 5,
  Dime = 10,
  Quarter = 25
}

export type Inventory = {"soda": 10, "chips": 10, "candy": 10};

export function insert_coin(coin: AcceptedCoins): void {
  amount_collected += coin;
}

export function balance() : number {
  return amount_collected;
}

export function returnAllCoins() : void {
  amount_collected = 0;
}

export function  display() : string {
  return (balance() / 100).toFixed(2);
}

export function get_inventory(): Inventory {
  return {"soda": 10, "chips": 10, "candy": 10};
}

// export function buyProduct() {
//
// }
