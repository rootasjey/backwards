import { ItemTypes } from '../const/items';

export class Inventory {
  private _MAXITEMS = 5;
  private items: Array<Weapon | Consumable>;

  /**
   * Create a new inventory
   * @param {Array} items Items which should be added to the inventory.
   */
  constructor(data: any) {
    this.items = data.items as Array<Weapon | Consumable>;
  }

  public count() { return this.items.length; }

  get maxItems() {
    return this._MAXITEMS;
  }

  /**
   * add
   */
  public add(item: (Weapon | Consumable)) {
    if (this.count() >= this.maxItems) {
      return this;
    }

    this.items.push(item);
    return this;
  }

  /**
   * Return inventory's items.
   */
  public getItems() {
    return this.items;
  }

  public getWeapons() {
    const weapons: Weapon[] = [];

    this.items.filter((item) => {
      if (item.itemType === ItemTypes.weapon) {
        const weapon = item as Weapon;
        weapons.push(weapon);
      }
    });

    return weapons;
  }

  /**
   * Remove the passed item.
   */
  public remove(item: Consumable | Weapon) {
    this.getItems()
      .some((currItem, index) => {
        if (currItem === item) {
          this.getItems().splice(index, 1);
          return true;
        }

        return false;
      });

    return this;
  }
}
