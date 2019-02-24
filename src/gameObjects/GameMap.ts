import {
  eventName as mapEvent,
  MapActions ,
} from '../actions/map';

import {
  eventName as unitEvent,
  UnitActions,
} from '../actions/unit';

import {
  eventName as weaponSelectorEvent,
  WeaponSelectorActions,
}  from '../actions/weaponSelector';

import { colors }                 from '../const/config';
import { unitsFactory }           from '../logic/unitsFactory';
import { Game }                   from './Game';
import TileUnit                   from './TileUnit';

export default class GameMap extends Phaser.GameObjects.GameObject {

  // ~~~~~~~~~~~~~~~~~
  // PUBLIC PROPERTIES
  // ~~~~~~~~~~~~~~~~~

  public layers: GameMapLayers = {
    attackRange         : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    carpet              : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    collision           : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    cursor              : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    details             : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    floor               : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    hiddenFloor         : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    movement            : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    objects             : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    tileInfoPanel       : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    units               : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    unitActionsPanel    : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    unitInfoPanel       : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    weaponSelectionPanel: Phaser.Tilemaps.DynamicTilemapLayer.prototype,
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

  /** Last cursor coordinates on pointerdown. TODO: Use velocity w/ Phaser 3.16. */
  private cursorDownCoord?: Coord;

  private lastPointedUnit?: Phaser.Tilemaps.Tile;

  private objectLayers: GameMapObjectLayers = {
    unitsInit: Phaser.Tilemaps.ObjectLayer.prototype,
  };

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
  // PUBLIC FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  public getAllPlayersOnMap(): Player[] {
    const players: PlayerMap = {};

    const { units: unitsLayer } = this.layers;

    unitsLayer.forEachTile((tile) => {
      const properties = tile.properties as TiledObjectProperties;
      const { playerId: id, playerName: name } = properties;

      if (players[id]) { return; }

      players[id] = {
        id,
        name,
      };

    }, undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true });

    return Object.values(players);
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

  private addMapActionsListeners() {
    this.scene.events.once(`${mapEvent}${MapActions.cancel}`, this.onMapActionCancel, this);
    this.scene.events.once(`${mapEvent}${MapActions.endTurn}`, this.onMapActionEndTurn, this);
    this.scene.events.once(`${mapEvent}${MapActions.suspend}`, this.onMapActionSuspend, this);

    return this;
  }

  private addUnitActionsListeners() {
    const { events } = this.scene;

    events.once(`${unitEvent}${UnitActions.attack}`, this.onUnitActionAtk, this);
    events.once(`${unitEvent}${UnitActions.cancel}`, this.onUnitActionCancel, this);
    events.once(`${unitEvent}${UnitActions.wait}`, this.onUnitActionWait, this);

    return this;
  }

  private addWeaponSelectorListeners() {
    const { events } = this.scene;

    events.once(`${weaponSelectorEvent}${WeaponSelectorActions.cancel}`, this.onWeaponSelectorCancel, this);

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

  private createDynamicLayers() {
    const { layers, map, tileset } = this;

    layers.collision            = map.createDynamicLayer('Collision', tileset.map, 0, 0);
    layers.attackRange          = map.createDynamicLayer('AttackRange', tileset.ui, 0, 0);
    layers.movement             = map.createDynamicLayer('Movement', tileset.ui, 0, 0);
    layers.units                = map.createDynamicLayer('Units', tileset.units, 0, 0);
    layers.cursor               = map.createDynamicLayer('Cursor', tileset.map, 0, 0);
    layers.tileInfoPanel        = map.createDynamicLayer('TileInfoPanel', tileset.ui, 0, 0);
    layers.unitInfoPanel        = map.createDynamicLayer('UnitInfoPanel', tileset.ui, 0, 0);
    layers.unitActionsPanel     = map.createDynamicLayer('UnitActionsPanel', tileset.ui, 0, 0);
    layers.weaponSelectionPanel = map.createDynamicLayer('WeaponSelectionPanel', tileset.ui, 0, 0);

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

  private createObjectLayers() {
    this.objectLayers.unitsInit = this.map.getObjectLayer('UnitsInit');

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

    input.off('pointerup', this.onPointerUp, this, false);
    input.off('pointerdown', this.onPointerDown, this, false);
    input.off('pointermove', this.onPointerMove, this, false);

    input.keyboard.off('keydown-UP', this.onMoveCursorUp, this, false);
    input.keyboard.off('keydown-DOWN', this.onMoveCursorDown, this, false);
    input.keyboard.off('keydown-LEFT', this.onMoveCursorLeft, this, false);
    input.keyboard.off('keydown-RIGHT', this.onMoveCursorRight, this, false);

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

    input.keyboard.on('keydown-UP', this.onMoveCursorUp, this);
    input.keyboard.on('keydown-DOWN', this.onMoveCursorDown, this);
    input.keyboard.on('keydown-LEFT', this.onMoveCursorLeft, this);
    input.keyboard.on('keydown-RIGHT', this.onMoveCursorRight, this);

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
  private highlightUnit(x: number, y: number) {
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
      .createDynamicLayers()
      .createObjectLayers()
      .initializeUnitsObjectLayer()
      .scaleToGameSize()
      .fixLayers()
      .createMapCursor()
      .createUnits()
      .createMapMatrix()
      .listenToEvents();
  }

  private initializeUnitsObjectLayer() {
    const { units: unitsLayer } = this.layers;

    this.objectLayers.unitsInit.objects
      .filter((object) => object.type === 'unit')
      .map((object) => {
        const tiledObject = object as TiledObject;
        const { properties: { tileId }, x, y } = tiledObject;

        const tile = unitsLayer.putTileAtWorldXY(tileId, x, y);
        tile.properties = { ...{}, ...tiledObject.properties };
      });

    return this;
  }

  /** Fired when a unit receives a pointer event. */
  private interactWithUnit() {
    const { x, y } = this.cursor;

    if (this.selectedUnit) {
      this.updateUnitPosition({ coord: {x, y} });
      this.cursor.tint = colors.tileMovementPassive;
      return;
    }

    if (!this.layers.units.hasTileAt(x, y)) {
      return;
    }

    this.selectedUnit = this.layers
      .units.getTileAt(x, y);

    const tileUnit = this.selectedUnit.properties.tileUnit as TileUnit;
    tileUnit.select();

    this.cursor.tint = colors.tileMovementActive;
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

  private onMapActionCancel() {
    this.removeMapActionsListeners();
  }

  private onMapActionEndTurn() {
    this.removeMapActionsListeners();

    this.previousUnitCoord = undefined;

    Game.turn.next();

    const { currentPlayer, turnNumber } = Game.turn;

    Game.turnVisualizer.showNext({ player: currentPlayer, turnNumber });
  }

  private onMapActionSuspend() {
    this.removeMapActionsListeners();
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

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    this.canDrag = true;

    this.cursorDownCoord = { x: pointer.x, y: pointer.y };
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    this.canDrag = false;
    this.interactWithUnit();
    this.tryShowMapMenu(pointer);
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

  private onUnitActionAtk(unit: Phaser.Tilemaps.Tile) {
    this
      .removeUnitActionsListeners()
      .addWeaponSelectorListeners();

    this.scene.events.emit('openWeaponSelector', this.cursor, unit);
  }

  private onUnitActionCancel(addedTile: Phaser.Tilemaps.Tile) {
    this.removeUnitActionsListeners();

    const tileUnit = addedTile.properties.tileUnit as TileUnit;
    tileUnit.sendToBack();

    if (!this.previousUnitCoord) {
      this.moveCursorTo(addedTile.x, addedTile.y);
      return;
    }

    const { createUnit, scene } = this;
    const unitsLayer = this.layers.units;

    const { x: addedX, y: addedY } = addedTile;
    const { x: prevX, y: prevY } = this.previousUnitCoord;

    const tile = unitsLayer.putTileAt(addedTile, prevX, prevY);

    tileUnit.destroy();
    addedTile.destroy();

    tile.properties.tileUnit = new TileUnit({ scene, tile, createUnit });

    this.updateMapMatrix({ added: tile, removed: addedTile });

    unitsLayer.removeTileAt(addedX, addedY);

    this.previousUnitCoord = undefined;

    this.moveCursorTo(prevX, prevY);
  }

  private onUnitActionWait(addedTile: Phaser.Tilemaps.Tile) {
    this.removeUnitActionsListeners();

    const tileUnit = addedTile.properties.tileUnit as TileUnit;

    tileUnit.markAsPlayed();
  }

  private onWeaponSelectorCancel(unit: Phaser.Tilemaps.Tile) {
    this.removeWeaponSelectorListeners();

    this.addUnitActionsListeners();

    setTimeout(() => {
      // NOTE: pointerup fires too soon after listening outside UnitActions' clicks.
      this.scene.events.emit('openUnitActions', this.cursor, unit);
    }, 10);
  }

  private removeMapActionsListeners() {
    this.scene.events.off(`${mapEvent}${MapActions.cancel}`, this.onMapActionCancel, this);
    this.scene.events.off(`${mapEvent}${MapActions.endTurn}`, this.onMapActionEndTurn, this);
    this.scene.events.off(`${mapEvent}${MapActions.suspend}`, this.onMapActionSuspend, this);

    return this;
  }

  private removeUnitActionsListeners() {
    const { events } = this.scene;

    events.off(`${unitEvent}${UnitActions.attack}`, this.onUnitActionAtk, this);
    events.off(`${unitEvent}${UnitActions.cancel}`, this.onUnitActionCancel, this);
    events.off(`${unitEvent}${UnitActions.wait}`, this.onUnitActionWait, this);

    return this;
  }

  private removeWeaponSelectorListeners() {
    const { events } = this.scene;

    events.off(
      `${weaponSelectorEvent}${WeaponSelectorActions.cancel}`,
      this.onWeaponSelectorCancel,
      this,
    );

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

  /** Show map menu if cursor is not on unit. */
  private tryShowMapMenu(pointer: Phaser.Input.Pointer) {
    const { cursor } = this;
    const { x, y } = this.cursor;

    if (!this.cursorDownCoord ||
      this.selectedUnit ||
      this.layers.units.hasTileAt(x, y)) {
      return;
    }

    const distX = Math.abs(pointer.x - this.cursorDownCoord.x);
    const distY = Math.abs(pointer.y - this.cursorDownCoord.y);

    // NOTE: may need adjustments
    if (distX > 10 || distY > 10) { return; }

    this.addMapActionsListeners();

    this.scene.events.emit('openMapActions', cursor);
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

        this.addUnitActionsListeners();
        this.scene.events.emit('openUnitActions', this.cursor, tile);

        if (tile) {
          const tileUnitResult = tile.properties.tileUnit as TileUnit;
          tileUnitResult.showAtkRange();
        }
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
