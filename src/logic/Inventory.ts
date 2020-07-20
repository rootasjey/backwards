import { ItemTypes } from '../const/items';

export class Inventory {
  private readonly _MAXITEMS = 5;
  private readonly items: Array<Weapon | Consumable>;

  constructor(data: any) {
    this.items = data.items as Array<Weapon | Consumable>;
  }

  public count() { return this.items.length; }

  get maxItems() {
    return this._MAXITEMS;
  }

  public add(item: (Weapon | Consumable)) {
    if (this.count() >= this.maxItems) {
      return this;
    }

    this.items.push(item);
    return this;
  }

  /** Return inventory's items. */
  public getItems() {
    return this.items;
  }

  public getWeapon(index: number = 1) {
    const weapons = this.getWeapons();

    if (index < 0 || index > weapons.length) {
      index = 1;
      console.warn('The index specified it out of boundaries. Returning the first weapon found starting 0 index.');
    }

    return weapons[index];
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

  public moveWeaponToTop(weapon: Weapon) {
    let index = 0;

    this.items
      .some((item, itemIndex) => {
        if (item.name === weapon.name && item.usage === weapon.usage) {
          index = itemIndex;
          return true;
        }

        return false;
      });

    this.items.splice(index, 1);
    this.items.splice(0, 0, weapon);

    return this;
  }

  /** Remove the passed item. */
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
