import {assert, assertEquals} from "https://deno.land/std/assert/mod.ts";
import {
  AcceptedCoins,
  balance,
  insert_coin,
  returnAllCoins,
  display,
  get_inventory,
  buyProduct
} from "./vending_machine.ts";

Deno.test(function deno_tests_work_properly() {
  assert(true);
  assertEquals(6*7, 42);
});

Deno.test(function accepts_one_coin() {
  insert_coin(AcceptedCoins.Penny);
  const valueInserted = balance();
  assertEquals(valueInserted,1);
});

Deno.test(function tracks_value_of_multiple_coins() {
  returnAllCoins();
  assertEquals(balance(), 0);
  insert_coin(AcceptedCoins.Penny);
  insert_coin(AcceptedCoins.Penny);

  let valueInserted = balance();
  assertEquals(valueInserted,2);

  insert_coin(AcceptedCoins.Penny);
  valueInserted = balance();
  assertEquals(valueInserted,3);
});

Deno.test(function accepts_all_coin_types() {
  returnAllCoins();
  insert_coin(AcceptedCoins.Dime);
  assertEquals(balance(),10);
  assertEquals(display(), "0.10");

  returnAllCoins();
  insert_coin(AcceptedCoins.Nickel);
  assertEquals(balance(),5);
  assertEquals(display(), "0.05");

  returnAllCoins();
  insert_coin(AcceptedCoins.Quarter);
  assertEquals(balance(),25);
  assertEquals(display(), "0.25");
});

Deno.test(function displays_dollars_and_cents() {
  returnAllCoins();
  assertEquals(display(),"0.00");
});

Deno.test(function display_products_available() {
  assertEquals(get_inventory(), {"soda": 10, "chips": 10, "candy": 10});
});

// TODO Purchase a product, notice that inventory decreases
// Deno.test(function inserts_amount_and_choose_product() {
//   assertEquals(get_inventory(), {"soda": 10, "chips": 10, "candy": 10});
//   const result = buyProduct(Product.candy)
//   assertEquals(get_inventory(), {"soda": 10, "chips": 10, "candy": 9})
// });

// TODO Make sure the customer added enough money to purchase the product
