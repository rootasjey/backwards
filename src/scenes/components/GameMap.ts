import gameConst        from '../../const/GameConst';
import unitConst        from '../../const/UnitConst';
import TileUnit         from '../../gameObjects/TileUnit';
import { unitsFactory } from '../../logic/unitsFactory';
import { Game }         from '../Game';

export default class GameMap extends Phaser.GameObjects.GameObject {

  // ~~~~~~~~~~~~~~~~~
  // PUBLIC PROPERTIES
  // ~~~~~~~~~~~~~~~~~

  public layers: GameMapLayers = {
    unitActionsPanel: Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    attackRange   : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    carpet        : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    units         : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    unitInfoPanel : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    collision     : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    cursor        : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    details       : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    floor         : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    hiddenFloor   : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    movement      : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    objects       : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    tileInfoPanel : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
  };

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  public map: Phaser.Tilemaps.Tilemap;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  public mapMatrix: number[][];

  public selectedUnit?: Phaser.Tilemaps.Tile;

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE PROPERTIES
  // ~~~~~~~~~~~~~~~~~

  private canDrag: boolean = false;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private createUnit: () => Unit;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private cursor: Phaser.Tilemaps.Tile;

  private lastPointedUnit?: Phaser.Tilemaps.Tile;

  private previousUnitCoord?: Coord;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private tileset: {
    map: Phaser.Tilemaps.Tileset,
    ui: Phaser.Tilemaps.Tileset,
    units: Phaser.Tilemaps.Tileset,
  };

  /**
   * Manage in-game tile maps & layers.
   * @param {Object} scene Phaser scene.
   */
  constructor(scene: Phaser.Scene) {
    super(scene, 'GameMap');

    scene.add.existing(this);

    this.init();
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  private addTilesetImages() {
    const { map } = this;

    this.tileset = {
      map   : map.addTilesetImage('terrain', 'mapTileset'),
      ui    : map.addTilesetImage('ui', 'uiTileset'),
      units : map.addTilesetImage('units', 'unitsTileset'),
    };

    return this;
  }

  private addUnitActionListeners() {
    this.scene.events.once(`unit:${unitConst.action.wait}`, this.onUnitActionWait, this);
    this.scene.events.once(`unit:${unitConst.action.cancel}`, this.onUnitActionCancel, this);

    return this;
  }

  private animateCursor() {
    this.scene.tweens.timeline({
      targets: this.cursor,
      duration: 1000,
      loop: -1,
      yoyo: true,

      tweens: [
        {
          alpha: .8,
        },
        {
          alpha: 0,
        }],
    });

    return this;
  }

  private createMapCursor() {
    this.cursor = this.layers.cursor.getTileAt(0, 0);
    this.animateCursor();

    return this;
  }

  private createDynamicLayer() {
    const { layers, map, tileset } = this;

    layers.collision        = map.createDynamicLayer('Collision', tileset.map, 0, 0);
    layers.attackRange      = map.createDynamicLayer('AttackRange', tileset.ui, 0, 0);
    layers.movement         = map.createDynamicLayer('Movement', tileset.ui, 0, 0);
    layers.units            = map.createDynamicLayer('Units', tileset.units, 0, 0);
    layers.cursor           = map.createDynamicLayer('Cursor', tileset.map, 0, 0);
    layers.tileInfoPanel    = map.createDynamicLayer('TileInfoPanel', tileset.ui, 0, 0);
    layers.unitInfoPanel    = map.createDynamicLayer('UnitInfoPanel', tileset.ui, 0, 0);
    layers.unitActionsPanel = map.createDynamicLayer('UnitActionsPanel', tileset.ui, 0, 0);

    return this;
  }

  private createMap() {
    this.map = this.scene.make.tilemap({ key: 'level0' });

    return this;
  }

  private createMapMatrix() {
    const { height, width } = this.map;
    const matrix = [];

    for (let y = 0; y < height; y++) {
      const row = [];

      for (let x = 0; x < width; x++) {
        row.push(this.getBinaryCellType(x, y));
      }

      matrix.push(row);
    }

    this.mapMatrix = matrix;
    return this;
  }

  private createStaticLayers() {
    const { layers, map, tileset } = this;

    layers.floor        = map.createStaticLayer('Floor', tileset.map, 0, 0);
    layers.hiddenFloor  = map.createStaticLayer('HiddenFloor', tileset.map, 0, 0);
    layers.carpet       = map.createStaticLayer('Carpet', tileset.map, 0, 0);
    layers.objects      = map.createStaticLayer('Objects', tileset.map, 0, 0);
    layers.details      = map.createStaticLayer('Details', tileset.map, 0, 0);

    return this;
  }

  private createUnits() {
    const { json } = this.scene.cache;
    const layer = this.layers.units;

    this.createUnit = unitsFactory({
      dataConsummables  : json.get('consummables'),
      dataHeroes        : json.get('heroes'),
      dataUnits         : json.get('units'),
      dataWeapons       : json.get('weapons'),
    });

    const { createUnit } = this;

    const createTileUnit = (tile: Phaser.Tilemaps.Tile) => {
      tile.properties.tileUnit = new TileUnit({ scene: this.scene, tile, createUnit });
    };

    layer.forEachTile(createTileUnit, undefined, 0, 0,
      undefined, undefined, { isNotEmpty: true });

    return this;
  }

  private disableEvents() {
    const { input } = this.scene;

    input.off('pointerup', this.onPointerUp, undefined, false);
    input.off('pointerdown', this.onPointerDown, undefined, false);
    input.off('pointermove', this.onPointerMove, undefined, false);

    input.keyboard.off('keydown_UP', this.onMoveCursorUp, undefined, false);
    input.keyboard.off('keydown_DOWN', this.onMoveCursorDown, undefined, false);
    input.keyboard.off('keydown_LEFT', this.onMoveCursorLeft, undefined, false);
    input.keyboard.off('keydown_RIGHT', this.onMoveCursorRight, undefined, false);

    return this;
  }

  /** Drag the camera with pointer down. */
  private dragCamera(pointer: Phaser.Input.Pointer) {
    if (!this.canDrag) { return; }

    const { x, y } = pointer.position;
    const { x: prevX, y: prevY } = pointer.prevPosition;

    const deltaX = x - prevX;
    const deltaY = y - prevY;

    const camX = this.scene.cameras.main.scrollX;
    const camY = this.scene.cameras.main.scrollY;

    this.scene.cameras.main.setScroll(camX - deltaX, camY - deltaY);

    return this;
  }

  private enableEvents() {
    const { input } = this.scene;

    input.on('pointerup', this.onPointerUp, this);
    input.on('pointerdown', this.onPointerDown, this);
    input.on('pointermove', this.onPointerMove, this);

    input.keyboard.on('keydown_UP', this.onMoveCursorUp, this);
    input.keyboard.on('keydown_DOWN', this.onMoveCursorDown, this);
    input.keyboard.on('keydown_LEFT', this.onMoveCursorLeft, this);
    input.keyboard.on('keydown_RIGHT', this.onMoveCursorRight, this);

    return this;
  }

  /**
   * Fix some layers so they won't scroll with the camera.
   */
  private fixLayers() {
    const { layers } = this;

    layers.tileInfoPanel.setScrollFactor(0);
    layers.unitInfoPanel.setScrollFactor(0);

    return this;
  }

  private getBinaryCellType(x: number, y: number) {
    const { layers } = this;

    if (layers.collision.hasTileAt(x, y) ||
      layers.units.hasTileAt(x, y)) {

      return 1;
    }

    return 0;
  }

  /** Highlight and animate current pointed unit (in tile unit). */
  private highlightUnit(x: number = 0, y: number = 0) {
    if (this.layers.units.hasTileAt(x, y)) {
      this.lastPointedUnit = this.layers.units.getTileAt(x, y);

      const tileUnit = this.lastPointedUnit
        .properties.tileUnit as TileUnit;

      tileUnit.bringToFront();

      return this;
    }

    if (this.lastPointedUnit &&
        this.lastPointedUnit !== this.selectedUnit) {

      const tileUnit = this.lastPointedUnit
        .properties.tileUnit as TileUnit;

      tileUnit.sendToBack();

      this.lastPointedUnit = undefined;
    }

    return this;
  }

  /** Initialize map, layers, units and events. */
  private init() {
    this.createMap()
      .addTilesetImages()
      .createStaticLayers()
      .createDynamicLayer()
      .scaleToGameSize()
      .fixLayers()
      .createMapCursor()
      .createUnits()
      .createMapMatrix()
      .listenToEvents();
  }

  /** Fired when a unit receives a pointer event. */
  private interactWithUnit() {
    const { x, y } = this.cursor;

    if (this.selectedUnit) {
      this.updateUnitPosition({ coord: {x, y} });
      this.cursor.tint = gameConst.colors.tileMovementPassive;
      return;
    }

    if (!this.layers.units.hasTileAt(x, y)) {
      return;
    }

    this.selectedUnit = this.layers
      .units.getTileAt(x, y);

    const tileUnit = this.selectedUnit.properties.tileUnit as TileUnit;
    tileUnit.select();

    this.cursor.tint = gameConst.colors.tileMovementActive;
  }

  /**
   * Kill previous cursor animation.
   * => cursor blink
   */
  private killCursorAnimation() {
    this.scene.tweens.killTweensOf(this.cursor);
    return this;
  }

  private listenToEvents() {
    const { events } = this.scene;

    events.on('subscribeMapEvents', this.enableEvents, this);
    events.on('unsubscribeMapEvents', this.disableEvents, this);

    this.enableEvents();
  }

  /**
   * Move camera if cursor is on map edge.
   * @param {Number} x The x coordinate.
   * @param {Number} y The y coordinate.
   */
  private moveCamera(x: number, y: number) {
    const { x: worldX, y: worldY } = this.map.tileToWorldXY(x, y);

    if (window.innerWidth - worldX < 60 || window.innerHeight - worldY < 60
      || worldX < 60 || worldY < 60) {

      this.scene.cameras.main.pan(worldX, worldY, 500);
    }

    return this;
  }

  private moveCursorTo(x: number, y: number) {
    const cursorLayer = this.layers.cursor;

    this.killCursorAnimation();

    cursorLayer.removeTileAt(this.cursor.x, this.cursor.y);
    this.cursor = cursorLayer.putTileAt(this.cursor, x, y);

    this
      .animateCursor()
      .highlightUnit(x, y)
      .moveCamera(x, y);

    this.scene.events.emit('cursorMoved', this.cursor, this.scene);
  }

  private onMoveCursorDown() {
    const { x, y } = this.cursor;

    const nextY = y + 1;

    if (nextY >= this.layers.cursor.layer.height) { return; }

    this.moveCursorTo(x, nextY);
  }

  private onMoveCursorLeft() {
    const { x, y } = this.cursor;

    const previousX = x - 1;

    if (previousX < this.layers.cursor.layer.x) { return; }

    this.moveCursorTo(previousX, y);
  }

  private onMoveCursorRight() {
    const { x, y } = this.cursor;

    const nextX = x + 1;

    if (nextX >= this.layers.cursor.layer.width) { return; }

    this.moveCursorTo(nextX, y);
  }

  private onMoveCursorUp() {
    const { x, y } = this.cursor;

    const previousY = y - 1;

    if (previousY < this.layers.cursor.layer.y) {
      return;
    }

    this.moveCursorTo(x, previousY);
  }

  private onPointerDown() {
    this.canDrag = true;
  }

  private onPointerUp() {
    this.canDrag = false;
    this.interactWithUnit();
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    const cursorLayer = this.layers.cursor;

    const x = pointer.x + this.scene.cameras.main.scrollX;
    const y = pointer.y + this.scene.cameras.main.scrollY;

    // Out of boundaries
    if (x >= cursorLayer.displayWidth ||
      y >= cursorLayer.displayHeight) {
      return;
    }

    const { x: tileX, y: tileY } = cursorLayer.worldToTileXY(x, y);

    if (!cursorLayer.hasTileAt(tileX, tileY)) {
      this.moveCursorTo(tileX, tileY);
    }

    this.dragCamera(pointer);
  }

  private onUnitActionWait(addedTile: Phaser.Tilemaps.Tile) {
    this.removeUnitActionListeners();
    console.log('wait...');

  }

  private onUnitActionCancel(addedTile: Phaser.Tilemaps.Tile) {
    if (!this.previousUnitCoord) { return; }

    this.removeUnitActionListeners();

    const { createUnit, scene } = this;
    const unitsLayer = this.layers.units;

    const { x: addedX, y: addedY } = addedTile;
    const { x: prevX, y: prevY } = this.previousUnitCoord;

    const tile = unitsLayer.putTileAt(addedTile, prevX, prevY);

    const tileUnit = addedTile.properties.tileUnit as TileUnit;

    tileUnit.destroy();
    addedTile.destroy();

    tile.properties.tileUnit = new TileUnit({ scene, tile, createUnit });

    this.updateMapMatrix({ added: tile, removed: addedTile });

    unitsLayer.removeTileAt(addedX, addedY);

    this.previousUnitCoord = undefined;

    this.moveCursorTo(prevX, prevY);
  }

  private removeUnitActionListeners() {
    this.scene.events.off(`unit:${unitConst.action.wait}`, this.onUnitActionWait, this, false);
    this.scene.events.off(`unit:${unitConst.action.cancel}`, this.onUnitActionCancel, this, false);

    return this;
  }

  private scaleToGameSize() {
    const { height, width } = Game.instance.config;

    const h = parseInt(height as string, 10);
    const w = parseInt(width as string, 10);

    Object
      .values(this.layers)
      .map((layer) => layer.setDisplaySize(h, w));

    return this;
  }

  /** Move a unit to a {x,y} coordinates in tiles.
   *  When the silent options is true, no actions menu will open after the unit moves.
   */
  private updateUnitPosition(param: UpdateUnitPositionParam) {
    const { coord: { x, y }, dontShowMenu } = param;

    const { createUnit, scene } = this;
    const unitsLayer = this.layers.units as Phaser.Tilemaps.DynamicTilemapLayer;

    if (!this.selectedUnit) {
      return this;
    }

    const tileUnit = this.selectedUnit.properties.tileUnit as TileUnit;
    const { x: unitX, y: unitY } = this.selectedUnit;

    if (!tileUnit.canMoveTo({x, y})) {
      tileUnit.unselect();

      this.selectedUnit = undefined;
      this.lastPointedUnit = undefined;

      return this;
    }

    tileUnit
      .moveTo(x, y)
      .then((result) => {
        const unit = result.tileUnit as TileUnit;
        unit.unselect();
        return result;
      })
      .then((result) => {
        if (!result.moved || !this.selectedUnit) {
          return { tile: this.selectedUnit };
        }

        this.previousUnitCoord = { x: this.selectedUnit.x, y: this.selectedUnit.y };

        const tile = unitsLayer
        .putTileAt(this.selectedUnit, x, y)
        .setAlpha(1);

        tileUnit.destroy();
        this.selectedUnit.destroy();

        tile.properties.tileUnit = new TileUnit({ scene, tile, createUnit });

        this.updateMapMatrix({ added: tile, removed: this.selectedUnit });

        unitsLayer.removeTileAt(unitX, unitY);

        return { tile };

      })
      .then((result) => {
        const { tile } = result;
        this.addUnitActionListeners();
        this.scene.events.emit('openUnitActions', this.cursor, tile);
      })
      .finally(() => {
        this.selectedUnit = undefined;
        this.lastPointedUnit = undefined;
      });

    return this;
  }

  /**
   * Update matrix cells (which one is (un-)reachable).
   * @param {Object} collisions Added & removed collisions.
   */
  private updateMapMatrix(collisions: UpdateMapMatrixParam) {
    const { added, removed } = collisions;

    if (added) {
      const { x, y } = added;
      this.mapMatrix[y][x] = 1;
    }

    if (removed) {
      const { x, y } = removed;
      this.mapMatrix[y][x] = 0;
    }

    return this;
  }
}
