import { assertEquals } from "jsr:@std/assert";
import { Item, GildedRose } from "../app/gilded_rose.ts";

Deno.test("Normal item - quality degrades by 1 before sell date", () => {
  const gildedRose = new GildedRose([new Item("Normal Item", 10, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 19);
  assertEquals(items[0].sellIn, 9);
});

Deno.test("Normal item - quality degrades by 2 after sell date", () => {
  const gildedRose = new GildedRose([new Item("Normal Item", 0, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 18);
  assertEquals(items[0].sellIn, -1);
});

Deno.test("Normal item - quality degrades by 2 when sell date has passed", () => {
  const gildedRose = new GildedRose([new Item("Normal Item", -1, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 18);
  assertEquals(items[0].sellIn, -2);
});

Deno.test("Normal item - quality never goes negative", () => {
  const gildedRose = new GildedRose([new Item("Normal Item", 10, 0)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
  assertEquals(items[0].sellIn, 9);
});

Deno.test("Normal item - quality never goes negative even after sell date", () => {
  const gildedRose = new GildedRose([new Item("Normal Item", 0, 1)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
  assertEquals(items[0].sellIn, -1);
});

Deno.test("Aged Brie - quality increases by 1 before sell date", () => {
  const gildedRose = new GildedRose([new Item("Aged Brie", 10, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 21);
  assertEquals(items[0].sellIn, 9);
});

Deno.test("Aged Brie - quality increases by 2 after sell date", () => {
  const gildedRose = new GildedRose([new Item("Aged Brie", 0, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 22);
  assertEquals(items[0].sellIn, -1);
});

Deno.test("Aged Brie - quality never exceeds 50", () => {
  const gildedRose = new GildedRose([new Item("Aged Brie", 10, 50)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 50);
  assertEquals(items[0].sellIn, 9);
});

Deno.test("Aged Brie - quality increases to 50 but not beyond", () => {
  const gildedRose = new GildedRose([new Item("Aged Brie", 10, 49)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 50);
  assertEquals(items[0].sellIn, 9);
});

Deno.test("Aged Brie - quality never exceeds 50 even after sell date", () => {
  const gildedRose = new GildedRose([new Item("Aged Brie", 0, 50)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 50);
  assertEquals(items[0].sellIn, -1);
});

Deno.test("Sulfuras - quality never changes", () => {
  const gildedRose = new GildedRose([new Item("Sulfuras, Hand of Ragnaros", 10, 80)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 80);
  assertEquals(items[0].sellIn, 10);
});

Deno.test("Sulfuras - sellIn never changes", () => {
  const gildedRose = new GildedRose([new Item("Sulfuras, Hand of Ragnaros", 0, 80)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 80);
  assertEquals(items[0].sellIn, 0);
});

Deno.test("Sulfuras - never changes even with negative sellIn", () => {
  const gildedRose = new GildedRose([new Item("Sulfuras, Hand of Ragnaros", -1, 80)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 80);
  assertEquals(items[0].sellIn, -1);
});

Deno.test("Backstage passes - quality increases by 1 when sellIn > 10", () => {
  const gildedRose = new GildedRose([new Item("Backstage passes to a TAFKAL80ETC concert", 11, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 21);
  assertEquals(items[0].sellIn, 10);
});

Deno.test("Backstage passes - quality increases by 2 when sellIn = 10", () => {
  const gildedRose = new GildedRose([new Item("Backstage passes to a TAFKAL80ETC concert", 10, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 22);
  assertEquals(items[0].sellIn, 9);
});

Deno.test("Backstage passes - quality increases by 2 when sellIn is 6-10", () => {
  const gildedRose = new GildedRose([new Item("Backstage passes to a TAFKAL80ETC concert", 8, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 22);
  assertEquals(items[0].sellIn, 7);
});

Deno.test("Backstage passes - quality increases by 3 when sellIn = 5", () => {
  const gildedRose = new GildedRose([new Item("Backstage passes to a TAFKAL80ETC concert", 5, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 23);
  assertEquals(items[0].sellIn, 4);
});

Deno.test("Backstage passes - quality increases by 3 when sellIn is 1-5", () => {
  const gildedRose = new GildedRose([new Item("Backstage passes to a TAFKAL80ETC concert", 3, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 23);
  assertEquals(items[0].sellIn, 2);
});

Deno.test("Backstage passes - quality increases by 3 when sellIn = 1", () => {
  const gildedRose = new GildedRose([new Item("Backstage passes to a TAFKAL80ETC concert", 1, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 23);
  assertEquals(items[0].sellIn, 0);
});

Deno.test("Backstage passes - quality drops to 0 after concert (sellIn = 0)", () => {
  const gildedRose = new GildedRose([new Item("Backstage passes to a TAFKAL80ETC concert", 0, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
  assertEquals(items[0].sellIn, -1);
});

Deno.test("Backstage passes - quality drops to 0 after concert (sellIn < 0)", () => {
  const gildedRose = new GildedRose([new Item("Backstage passes to a TAFKAL80ETC concert", -1, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
  assertEquals(items[0].sellIn, -2);
});

Deno.test("Backstage passes - quality never exceeds 50 before concert", () => {
  const gildedRose = new GildedRose([new Item("Backstage passes to a TAFKAL80ETC concert", 5, 49)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 50);
  assertEquals(items[0].sellIn, 4);
});

Deno.test("Backstage passes - quality stays at 50 when already at max", () => {
  const gildedRose = new GildedRose([new Item("Backstage passes to a TAFKAL80ETC concert", 5, 50)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 50);
  assertEquals(items[0].sellIn, 4);
});

Deno.test("Multiple items - updates all items correctly", () => {
  const gildedRose = new GildedRose([
    new Item("Normal Item", 10, 20),
    new Item("Aged Brie", 10, 20),
    new Item("Sulfuras, Hand of Ragnaros", 10, 80),
    new Item("Backstage passes to a TAFKAL80ETC concert", 10, 20)
  ]);
  const items = gildedRose.updateQuality();

  assertEquals(items[0].quality, 19);
  assertEquals(items[0].sellIn, 9);

  assertEquals(items[1].quality, 21);
  assertEquals(items[1].sellIn, 9);

  assertEquals(items[2].quality, 80);
  assertEquals(items[2].sellIn, 10);

  assertEquals(items[3].quality, 22);
  assertEquals(items[3].sellIn, 9);
});

Deno.test("Edge case - quality at 1 degrades to 0", () => {
  const gildedRose = new GildedRose([new Item("Normal Item", 10, 1)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
});

Deno.test("Edge case - Aged Brie at quality 49 after sell date increases to 50", () => {
  const gildedRose = new GildedRose([new Item("Aged Brie", 0, 48)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 50);
});

Deno.test("Conjured item - quality degrades by 2 before sell date", () => {
  const gildedRose = new GildedRose([new Item("Conjured Mana Cake", 10, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 18);
  assertEquals(items[0].sellIn, 9);
});

Deno.test("Conjured item - quality degrades by 4 after sell date", () => {
  const gildedRose = new GildedRose([new Item("Conjured Mana Cake", 0, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 16);
  assertEquals(items[0].sellIn, -1);
});

Deno.test("Conjured item - quality degrades by 4 when sell date has passed", () => {
  const gildedRose = new GildedRose([new Item("Conjured Mana Cake", -1, 20)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 16);
  assertEquals(items[0].sellIn, -2);
});

Deno.test("Conjured item - quality never goes negative", () => {
  const gildedRose = new GildedRose([new Item("Conjured Mana Cake", 10, 0)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
  assertEquals(items[0].sellIn, 9);
});

Deno.test("Conjured item - quality never goes negative even after sell date", () => {
  const gildedRose = new GildedRose([new Item("Conjured Mana Cake", 0, 3)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
  assertEquals(items[0].sellIn, -1);
});

Deno.test("Conjured item - quality at 1 degrades to 0 before sell date", () => {
  const gildedRose = new GildedRose([new Item("Conjured Mana Cake", 10, 1)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
  assertEquals(items[0].sellIn, 9);
});

Deno.test("Conjured item - quality at 2 degrades to 0 before sell date", () => {
  const gildedRose = new GildedRose([new Item("Conjured Mana Cake", 10, 2)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
  assertEquals(items[0].sellIn, 9);
});

Deno.test("Multiple items including Conjured - updates all correctly", () => {
  const gildedRose = new GildedRose([
    new Item("Normal Item", 10, 20),
    new Item("Conjured Mana Cake", 10, 20),
    new Item("Aged Brie", 10, 20),
  ]);
  const items = gildedRose.updateQuality();

  assertEquals(items[0].quality, 19);
  assertEquals(items[0].sellIn, 9);

  assertEquals(items[1].quality, 18);
  assertEquals(items[1].sellIn, 9);

  assertEquals(items[2].quality, 21);
  assertEquals(items[2].sellIn, 9);
});