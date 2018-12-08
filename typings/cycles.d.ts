interface CharPanelStats {
  hp: number;
  name: string;
}

interface Consumable {
  /**
   * Item description.
   */
  desc: string;
  effect: {
    target: string;
    value: number;
  };
  name: string;
  range: string;
  type: string;
  usage: number;
  /**
   * Cost value.
   */
  value: number;
}

interface Coord {
  x: number;
  y: number;
}

interface DataConsummables {
  [key: string]: any;
}

interface UnitsFactoryParameters {
  dataConsummables: any;
  dataHeroes: any;
  dataUnits: any;
  dataWeapons: any;
}

interface GameMapLayers {
  [index: string]: Phaser.Tilemaps.DynamicTilemapLayer | Phaser.Tilemaps.StaticTilemapLayer;
}

interface IInventory {
  // items: number;
  maxItems: number;
  getItems: InventoryGetItemsFun;
}

interface InventoryFactoryParameters {
  dataConsummables: any;
  dataWeapons: any;
}

interface InventoryGetItemsFun {
  (): (Consumable|Weapon)[];
}

interface InventoryRawItem {
  name: string;
  usage: number;
}

declare enum MagicalWeapons {
  staff,
  tome
}

interface MagicalWeaponTriangleCorrespondance {
  [key: string]: string;
  anima: string;
  dark: string;
  light: string;
}

interface MapUICorners {
  [key: string]: string;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

interface MapUICornersXY {
  [key: string]: Coord;
  topLeft: Coord;
  topRight: Coord;
  bottomLeft: Coord;
  bottomRight: Coord;
}

interface MapUIPanels {
  [key: string]: MapUIPanel;
}

interface MapUIPanel {
  bounds: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  }
  texts: any;
  textsContainer?: Phaser.GameObjects.Container;
}

declare enum PhysicalWeapons {
  axe,
  bow,
  lance,
  sword
}
interface PhysicalWeaponTriangleCorrespondance {
  [key: string]: string;
  axe: string;
  lance: string;
  sword: string;
}

interface UnitData {
  class: string;
  desc: string;
  gender: string;
  inventory: InventoryRawItem[];
  level: number;
  name: string;
  skills: object;
  stats: {
    base: UnitState;
    growth: UnitState;
  },
  wexp: WeaponExp;
  wrank: WeaponRank;
}

interface UnitStats {
  cons: number;
  def: number;
  fullHP: number;
  hp: number;
  lck: number;
  mag: number;
  move: number;
  res: number;
  skl: number;
  spd: number;
  str: number;
}

interface UnitDataConstructor {
  createInventory: UnitCreateInventoryFun;
  unitData: UnitData;
}

interface UnitCreateInventoryFun {
  (items: InventoryRawItem[]): IInventory;
}

interface UnitState {
  // ~~~~~~~~~~~~~~~
  // Fighting stats
  // ~~~~~~~~~~~~~~~

  /**
   * How sturdly this unit is.
   * Affects resistance for special types of damage (poisons, illness).
   * Used to determine if this unit can save another.
   */
  cons: number;

  /**
   * Decrease physical damage taken.
   */
  def: number;

  /**
   * Full Health Point.
   */
  fullHP: number;

  /**
   * Health Points.
   */
  hp: number;

  /**
   * Magical damage.
   */
  mag: number;

  /**
   * Affects critical hit.
   */
  lck: number;

  /**
   * Decrease magical damage taken.
   */
  res: number;

  /**
   * Affects unit's rate and critical hit rate.
   */
  skl: number;

  /**
   * Affects the number of strikes the unit can make,
   * alongside her/his hability to evade a foe attack.
   */
  spd: number;

  /**
   * Physical damage.
   */
  str: number;

  /**
   * Weapons' exp
   */
  wexp: WeaponExp;

  /**
   * The unit must have a rank at or higher than
   * a weapon rank to us it in battle.
   */
  wrank: WeaponRank;

  // ~~~~~~~~~~~~
  // Properties
  // ~~~~~~~~~~~~

  /**
   * Unit's class.
   */
  class: string;

  /**
   * Level up when it reaches 100.
   */
  experience: number;

  /**
   * Uniq identifier.
   */
  id: string;

  /**
   * Unit's inventory.
   */
  inventory: IInventory;

  /**
   * From 1 to 20. After each level up, abilities points are distributed.
   */
  level: number;

  /**
   * Amount of cells the unit can move to.
   */
  move: number;

  /**
   * Unit's name.
   */
  name: string;

  /**
   * Current weapon wield.
   * This weapon will be used if the unit attacks.
   */
  weapon?: Weapon;
}

interface Weapon {
  atk: number;
  /**
   * Critical rate.
   */
  ctr: number;
  damageType: string;
  desc: string;
  hit: number;
  weaponType: string;
  name: string;
  range: string;
  rank: string;
  type: string;
  usage: number;
  value: number;
  weight: number;
}

declare enum WeaponDamageType {
  magical,
  physical
}

interface WeaponExp {
  anima: number;
  axe: number;
  bows: number;
  dark: number;
  lance: number;
  light: number;
  sword: number;
}

interface WeaponRank {
  [key: string]: string;
  anima: string;
  axe: string;
  bow: string;
  dark: string;
  lance: string;
  light: string;
  sword: string;
}

declare enum WeaponRanks {
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E'
}

interface WeaponRankBonus {
  atk: number;
  hit: number;
  recovery: number;
}

interface WeaponTriangleBonus {
  atk: number;
  hit: number;
}

interface WeaponTriangleCorrespondance {
  [key: string]: MagicalWeaponTriangleCorrespondance | PhysicalWeaponTriangleCorrespondance;
  physical: PhysicalWeaponTriangleCorrespondance,
  magical: MagicalWeaponTriangleCorrespondance
}
