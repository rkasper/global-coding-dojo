import { assertEquals } from "jsr:@std/assert";
import { Item, Gilded_rose } from '../app/gilded_rose.ts';

// To add new feature to legacy code:
// 1) Add unit tests that pin down the legacy code
//    a) Use the requirements doc as our guide
//    b) Use code coverage tools: LOC and branch coverage
//    c) Ask Claude: did we add all the tests we need?
//    d) other tooling: mutation testing, approval tests, etc.
// 2) Refactor legacy code - make it better
// 3) Add the new feature

// Mob programming
// 1 driver, many navigators
// driver: the one person typing in the IDE
// navigators: help the driver (and all of us) reach our destination safely

Deno.test('Gilded Rose - should foo', () => {
    const gildedRose = new Gilded_rose([ new Item('foo', 0, 0) ]);
    const items = gildedRose.updateQuality();
    assertEquals(items[0].name, 'foo');
});

Deno.test('Gilded Rose - should reduce sellin by 1', () => {
  const gildedRose = new Gilded_rose([ new Item('foo', 10, 0) ]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].sellIn, 9);
});

Deno.test('Gilded Rose - should reduce quality by 1', () => {
  const gildedRose = new Gilded_rose([ new Item('foo', 10, 10) ]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 9);
});

Deno.test('Gilded Rose - should degrade quality twice as fast when sell by date has passed', () => {
  const gildedRose = new Gilded_rose([ new Item('foo', 0, 10) ]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 8);
});

Deno.test('Gilded Rose - should not have negative quality', () => {
  const gildedRose = new Gilded_rose([ new Item('foo', 10, 0) ]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
});

Deno.test('Item does not constraint the quality to 50', () => {
  const item = new Item('foo', 10, 51);
  assertEquals(item.quality, 51);
});

Deno.test('Aged Brie actually increases in Quality the older it gets', () => {
  const gildedRose = new Gilded_rose([new Item('Aged Brie', 10, 10)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 11);
});

Deno.test('Aged Brie does not increase in Quality beyond 50', () => {
  const gildedRose = new Gilded_rose([new Item('Aged Brie', 10, 50)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 50);
});

Deno.test('"Sulfuras", being a legendary item, never has to be sold or decreases in Quality', () => {
  const gildedRose = new Gilded_rose([new Item('Sulfuras, Hand of Ragnaros', 10, 40)]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 40);
  assertEquals(items[0].sellIn, 10);
});

Deno.test('Sulfuras Quality can be anything', () => {
  const item = new Item('Sulfuras, Hand of Ragnaros', 10, 100);
  assertEquals(item.quality, 100);
});

Deno.test('"Backstage passes" are special', () => {
  const gildedRose = new Gilded_rose([
    new Item('Backstage passes to a TAFKAL80ETC concert', 0, 40),
    new Item('Backstage passes to a TAFKAL80ETC concert', 1, 40),
    new Item('Backstage passes to a TAFKAL80ETC concert', 5, 40),
    new Item('Backstage passes to a TAFKAL80ETC concert', 6, 40),
    new Item('Backstage passes to a TAFKAL80ETC concert', 10, 40),
    new Item('Backstage passes to a TAFKAL80ETC concert', 11, 40),
  ]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 0);
  assertEquals(items[1].quality, 43);
  assertEquals(items[2].quality, 43);
  assertEquals(items[3].quality, 42);
  assertEquals(items[4].quality, 42);
  assertEquals(items[5].quality, 41);
});

Deno.test('Backstage passes Quality increases by 2 when there are 10 days or less', () => {
  const gildedRose = new Gilded_rose([
    new Item('Backstage passes to a TAFKAL80ETC concert', 6, 40),
    new Item('Backstage passes to a TAFKAL80ETC concert', 10, 40)
  ]);
  const items = gildedRose.updateQuality();
  assertEquals(items[0].quality, 42);
  assertEquals(items[1].quality, 42);
})

// Quality increases by 3 when there are 5 days or less
// Quality drops to 0 after the concert


// # Global Coding Dojo Notes
//
// ## References and Tools
//
// [Global Coding Dojo](https://github.com/rkasper/global-coding-dojo)
//
// [Mob Time](https://mobtime.hadrienmp.fr/)
//
// [Emily Bache](https://sw-development-is.social/@emilybache)
//
// [Mentimeter](https://www.menti.com/)
//
// [JetBrains ToolBox App](https://www.jetbrains.com/toolbox-app/)
//
// [Online Ensemble Coding Checklist](https://gitlab.com/grantneufeld/DeveloperDocs/-/blob/main/Ensemble/online_ensemble_coding_checklist.md)
