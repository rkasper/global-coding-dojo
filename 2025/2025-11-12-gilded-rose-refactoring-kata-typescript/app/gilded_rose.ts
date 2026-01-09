export class Item {
    name: string;
    sellIn: number;
    quality: number;

    constructor(name: string, sellIn: number, quality: number) {
        this.name = name;
        this.sellIn = sellIn;
        this.quality = quality;
    }
}

export class GildedRose {
    items: Array<Item>;

    constructor(items = [] as Array<Item>) {
        this.items = items;
    }

    updateQuality() {
        for (let i = 0; i < this.items.length; i++) {
            this.updateItem(this.items[i]);
        }

        return this.items;
    }

    private updateItem(item: Item): void {
        if (this.isSulfuras(item)) {
            this.updateSulfuras(item);
        } else if (this.isAgedBrie(item)) {
            this.updateAgedBrie(item);
        } else if (this.isBackstagePass(item)) {
            this.updateBackstagePass(item);
        } else if (this.isConjured(item)) {
            this.updateConjuredItem(item);
        } else {
            this.updateNormalItem(item);
        }
    }

    private isSulfuras(item: Item): boolean {
        return item.name === 'Sulfuras, Hand of Ragnaros';
    }

    private isAgedBrie(item: Item): boolean {
        return item.name === 'Aged Brie';
    }

    private isBackstagePass(item: Item): boolean {
        return item.name === 'Backstage passes to a TAFKAL80ETC concert';
    }

    private isConjured(item: Item): boolean {
        return item.name.startsWith('Conjured');
    }

    private updateSulfuras(_item: Item): void {
        // Sulfuras never changes
    }

    private updateAgedBrie(item: Item): void {
        this.increaseQuality(item);
        this.decreaseSellIn(item);

        if (item.sellIn < 0) {
            this.increaseQuality(item);
        }
    }

    private updateBackstagePass(item: Item): void {
        this.increaseQuality(item);

        if (item.sellIn < 11) {
            this.increaseQuality(item);
        }

        if (item.sellIn < 6) {
            this.increaseQuality(item);
        }

        this.decreaseSellIn(item);

        if (item.sellIn < 0) {
            item.quality = 0;
        }
    }

    private updateNormalItem(item: Item): void {
        this.decreaseQuality(item);
        this.decreaseSellIn(item);

        if (item.sellIn < 0) {
            this.decreaseQuality(item);
        }
    }

    private updateConjuredItem(item: Item): void {
        this.decreaseQuality(item);
        this.decreaseQuality(item);
        this.decreaseSellIn(item);

        if (item.sellIn < 0) {
            this.decreaseQuality(item);
            this.decreaseQuality(item);
        }
    }

    private increaseQuality(item: Item): void {
        if (item.quality < 50) {
            item.quality = item.quality + 1;
        }
    }

    private decreaseQuality(item: Item): void {
        if (item.quality > 0) {
            item.quality = item.quality - 1;
        }
    }

    private decreaseSellIn(item: Item): void {
        item.sellIn = item.sellIn - 1;
    }
}
