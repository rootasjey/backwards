interface ActionButtonConfig {
  coord?: Coord;
  height?: number;
  text?: string;
  width?: number;
}

interface ActionsMenuShowOptions {
  tile?: Phaser.Tilemaps.Tile;
}

interface Bounds {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

interface Consumable {
  /** Item description. */
  desc: string;
  effect: {
    target: string;
    value: number;
  };

  itemType: ItemTypes;
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

interface CoordHash {
  [key: string] : Coord;
}

interface CreateContainerParam {
  itemsCount: number;
  coord: Coord;
}

interface CreateUnitFightStatsTextsConfig {
  x: number;
  y: number;
  // textsStats: TextsUnitFightStats;
}

interface CreateWeaponButtonConfig {
  coord?: Coord;
  weapon: Weapon;
}

interface DataConsummables {
  [key: string]: any;
}

interface weaponRangeConfig {
  weapon?: Weapon;
  weaponIndex?: number;
}

interface fadeInTilesParams {
  options?: fadeInTilesParamsOptions;
  tiles: Phaser.Tilemaps.Tile[];
}

interface findTilesParams {
  /**
   * Tile x/y coordinates
   */
  coord: Coord;

  /**
   * Number of tiles to skip.
   */
  gap?: number;

  /**
   * Remaining allowed cell to inspect.
   */
  remainingMove: number;
}

interface fadeInTilesParamsOptions {
  alpha?: number;
  delay?: number;
  delayStep?: number;
  duration?: number;
  opacity?: number;
}

interface GameMapLayers {
  [index: string]     : Phaser.Tilemaps.DynamicTilemapLayer | Phaser.Tilemaps.StaticTilemapLayer;
  attackRange         : Phaser.Tilemaps.DynamicTilemapLayer;
  carpet              : Phaser.Tilemaps.StaticTilemapLayer;
  collision           : Phaser.Tilemaps.DynamicTilemapLayer;
  cursor              : Phaser.Tilemaps.DynamicTilemapLayer;
  details             : Phaser.Tilemaps.StaticTilemapLayer;
  floor               : Phaser.Tilemaps.StaticTilemapLayer;
  hiddenFloor         : Phaser.Tilemaps.StaticTilemapLayer;
  movement            : Phaser.Tilemaps.DynamicTilemapLayer;
  objects             : Phaser.Tilemaps.StaticTilemapLayer;
  targetSelector      : Phaser.Tilemaps.DynamicTilemapLayer;
  targetSelectorPanel : Phaser.Tilemaps.DynamicTilemapLayer;
  tileInfoPanel       : Phaser.Tilemaps.DynamicTilemapLayer;
  units               : Phaser.Tilemaps.DynamicTilemapLayer;
  unitActionsPanel    : Phaser.Tilemaps.DynamicTilemapLayer;
  unitInfoPanel       : Phaser.Tilemaps.DynamicTilemapLayer;
  weaponSelectionPanel: Phaser.Tilemaps.DynamicTilemapLayer;
}

interface GameMapObjectLayers {
  unitsInit: Phaser.Tilemaps.ObjectLayer;
}

interface InventoryShape {
  count: () => number;
  getItems: () => (Consumable|Weapon)[];
  getWeapon: (index: number) => Weapon;
  getWeapons: () => Weapon[];
  maxItems: number;
  moveWeaponToTop: (weapon: Weapon) => InventoryShape;
  remove: (item: Consumable | Weapon) => InventoryShape;
}

interface InventoryFactoryParam {
  dataConsummables: any;
  dataWeapons: any;
}

interface InventoryRawItem {
  name: string;
  usage: number;
}

declare enum ItemTypes {
  consumable = 'consumable',
  weapon = 'weapon',
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
  tileInfoPanel: MapUIPanel;
  unitInfoPanel: MapUIPanel;
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

interface moveTilesGroupParam {
  /** The grouped tiles bounds. */
  bounds?: Bounds;

  /** x, y destination coordinates in tiles. */
  dest: Coord;

  /** Layer on which to move the tiles. */
  layer: Phaser.Tilemaps.DynamicTilemapLayer;
}

interface OpenTargetSelectorEventConfig {
  markers: Phaser.Tilemaps.Tile[];
  targets: Phaser.Tilemaps.Tile[];
  attackerTile: Phaser.Tilemaps.Tile;
  weapon: Weapon;
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

interface Player {
  id: number;
  name: string;
}

interface PlayerMap {
  [key: number]: Player;
}

interface ShowTurnParam {
  player: Player;
  turnNumber: number;
}

interface TargetSelectorConfig {
  scene: Phaser.Scene;
  panelLayer: Phaser.Tilemaps.DynamicTilemapLayer;
  targetsLayer: Phaser.Tilemaps.DynamicTilemapLayer;
}

interface TextsFightStats {
  container: Phaser.GameObjects.Container;
  me: TextsUnitFightStats;
  opponent: TextsUnitFightStats;
}

interface TextsUnitFightStats {
  /** Unit starting the fight. */
  name: Phaser.GameObjects.Text;
  hp: Phaser.GameObjects.Text;
  mt: Phaser.GameObjects.Text;
  hit: Phaser.GameObjects.Text;
  container: Phaser.GameObjects.Container;
}

// TODO: Open an issue (and PR) on phaser => wrong type.
interface TiledObject extends Phaser.GameObjects.GameObject {
  gid: number;
  id: number;
  name: string;
  properties: TiledObjectProperties;
  type: string;
  x: number;
  y: number;
}

interface TiledObjectProperties {
  playerId: number;
  playerName: string;
  spriteId: number;
  tileId: number;
  unitName: string;
}

interface TileTargets {
  [key: string]: Phaser.Tilemaps.Tile;
}

interface TileUnitConstructorParam {
  createUnit: Function /*(hero: string) => Unit*/;
  scene: Phaser.Scene;
  tile: Phaser.Tilemaps.Tile;
}

interface TurnConstructorParam {
  players: Player[];
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
    base: UnitStats;
    growth: UnitStats;
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

interface UnitConfig {
  createInventory: UnitCreateInventoryFun;
  unitData: UnitData;
}

interface UnitCreateInventoryFun {
  (items: InventoryRawItem[]): InventoryShape;
}

interface UnitInfoPanelStats {
  hp: number;
  name: string;
}

interface UnitsFactoryParam {
  dataConsummables: any;
  dataHeroes: any;
  dataUnits: any;
  dataWeapons: any;
}

interface UpdateUnitPositionParam {
  /** Coordinates where to move unit. */
  coord: Coord;

  /** Do not show actions menu if true. */
  dontShowMenu?: boolean;
}

interface UpdateMapMatrixParam {
  added: Phaser.Tilemaps.Tile;
  removed: Phaser.Tilemaps.Tile;
}

interface Weapon {
  atk: number;

  /**
   * Critical rate.
   */
  crt: number;
  damageType: string;
  desc: string;
  hit: number;
  itemType: ItemTypes;
  name: string;
  range: string;
  rank: string;
  type: string;
  usage: number;
  value: number;
  weaponType: string;
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
