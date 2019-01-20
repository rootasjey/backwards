import TileUnit from '../../gameObjects/TileUnit';
import { unitsFactory } from '../../logic/unitsFactory';
import { Game } from '../Game';

import gameConst from '../../const/GameConst';

export default class GameMap extends Phaser.GameObjects.GameObject {

  public layers: GameMapLayers = {
    attackRange : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    carpet      : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    characters  : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    charPanel   : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    collision   : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    cursor      : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    details     : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    floor       : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    hiddenFloor : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    movement    : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
    objects     : Phaser.Tilemaps.StaticTilemapLayer.prototype,
    tilePanel   : Phaser.Tilemaps.DynamicTilemapLayer.prototype,
  };

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  public map: Phaser.Tilemaps.Tilemap;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  public mapMatrix: number[][];

  public selectedCharacter?: Phaser.Tilemaps.Tile;

  private canDrag: boolean = false;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private createUnit: () => Unit;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private cursor: Phaser.Tilemaps.Tile;

  private lastPointedChar?: Phaser.Tilemaps.Tile;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private tileset: {
    characters: Phaser.Tilemaps.Tileset,
    map: Phaser.Tilemaps.Tileset,
    ui: Phaser.Tilemaps.Tileset,
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
      characters: map.addTilesetImage('characters', 'charactersTileset'),
      map:        map.addTilesetImage('terrain', 'mapTileset'),
      ui:         map.addTilesetImage('ui', 'uiTileset'),
    };

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

    layers.collision    = map.createDynamicLayer('Collision', tileset.map, 0, 0);
    layers.attackRange  = map.createDynamicLayer('AttackRange', tileset.ui, 0, 0);
    layers.movement     = map.createDynamicLayer('Movement', tileset.ui, 0, 0);
    layers.characters   = map.createDynamicLayer('Characters', tileset.characters, 0, 0);
    layers.cursor       = map.createDynamicLayer('Cursor', tileset.map, 0, 0);
    layers.tilePanel    = map.createDynamicLayer('TilePanel', tileset.ui, 0, 0);
    layers.charPanel    = map.createDynamicLayer('CharPanel', tileset.ui, 0, 0);

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

    // layers.details.findTile(
    //   (tile: Phaser.Tilemaps.Tile) => typeof tile === 'object',
    //   undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true });

    return this;
  }

  private createUnits() {
    const { json } = this.scene.cache;
    const layer = this.layers.characters as Phaser.Tilemaps.DynamicTilemapLayer;

    this.createUnit = unitsFactory({
      dataConsummables  : json.get('consummables'),
      dataHeroes        : json.get('heroes'),
      dataUnits          : json.get('units'),
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

  /**
   * Drag the camera with pointer down.
   * @param {Object} pointer Phaser pointer.
   */
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

    input.on('pointerup', this.onPointerUp);
    input.on('pointerdown', this.onPointerDown);
    input.on('pointermove', this.onPointerMove);

    input.keyboard.on('keydown_UP', this.onMoveCursorUp);
    input.keyboard.on('keydown_DOWN', this.onMoveCursorDown);
    input.keyboard.on('keydown_LEFT', this.onMoveCursorLeft);
    input.keyboard.on('keydown_RIGHT', this.onMoveCursorRight);

    return this;
  }

  /**
   * Fix some layers so they won't scroll with the camera.
   */
  private fixLayers() {
    const { layers } = this;

    layers.tilePanel.setScrollFactor(0);
    layers.charPanel.setScrollFactor(0);

    return this;
  }

  private getBinaryCellType(x: number, y: number) {
    const { layers } = this;

    if (layers.collision.hasTileAt(x, y) ||
      layers.characters.hasTileAt(x, y)) {

      return 1;
    }

    return 0;
  }

  /**
   * Highlight and animate current pointed character.
   * @param {Number} x x coordinate in tile units.
   * @param {Number} y y coordinate in tile units.
   */
  private highlightChar(x: number = 0, y: number = 0) {
    if (this.layers.characters.hasTileAt(x, y)) {
      this.lastPointedChar = this.layers.characters.getTileAt(x, y);

      const tileUnit = this.lastPointedChar
        .properties.tileUnit as TileUnit;

      tileUnit.bringToFront();

      return this;
    }

    if (this.lastPointedChar &&
        this.lastPointedChar !== this.selectedCharacter) {

      const tileUnit = this.lastPointedChar
        .properties.tileUnit as TileUnit;

      tileUnit.sendToBack();

      this.lastPointedChar = undefined;
    }

    return this;
  }

  /**
   * Initialize map, layers, units and events.
   */
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

  /**
   * Fired when a character receives a pointer event.
   */
  private interactWithCharacter() {
    const { x, y } = this.cursor;

    if (this.selectedCharacter) {
      this.updateCharacterPosition(x, y);
      this.cursor.tint = gameConst.colors.tileMovementPassive;
      return;
    }

    if (!this.layers.characters.hasTileAt(x, y)) {
      return;
    }

    this.selectedCharacter = this.layers
      .characters.getTileAt(x, y);

    const tileUnit = this.selectedCharacter.properties.tileUnit as TileUnit;
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

    events.on('subscribeMapEvents', this.enableEvents);
    events.on('unsubscribeMapEvents', this.disableEvents);

    this.enableEvents();
  }

  /**
   * Move camera if cursor is on map edge.
   * @param {Number} x The x coordinate.
   * @param {Number} y The y coordinate.
   */
  private moveCamera(x: number = 0, y: number = 0) {
    const { x: worldX, y: worldY } = this.map.tileToWorldXY(x, y);

    if (window.innerWidth - worldX < 60 || window.innerHeight - worldY < 60
      || worldX < 60 || worldY < 60) {

      this.scene.cameras.main.pan(worldX, worldY, 500);
    }

    return this;
  }

  private onMoveCursorDown() {
    const { gameMap } = Game;
    const { x, y } = gameMap.cursor;

    const nextY = y + 1;

    if (nextY >= gameMap.layers.cursor.layer.height) { return; }

    gameMap.moveCursorTo(x, nextY);
  }

  private onMoveCursorLeft() {
    const { gameMap } = Game;
    const { x, y } = gameMap.cursor;

    const previousX = x - 1;

    if (previousX < gameMap.layers.cursor.layer.x) { return; }

    gameMap.moveCursorTo(previousX, y);
  }

  private onMoveCursorRight() {
    const { gameMap } = Game;
    const { x, y } = gameMap.cursor;

    const nextX = x + 1;

    if (nextX >= gameMap.layers.cursor.layer.width) { return; }

    gameMap.moveCursorTo(nextX, y);
  }

  private onMoveCursorUp() {
    const { gameMap } = Game;
    const { x, y } = gameMap.cursor;

    const previousY = y - 1;

    if (previousY < gameMap.layers.cursor.layer.y) {
      return;
    }

    gameMap.moveCursorTo(x, previousY);
  }

  private onPointerDown() {
    Game.gameMap.canDrag = true;
  }

  private onPointerUp() {
    const { gameMap } = Game;

    gameMap.canDrag = false;
    gameMap.interactWithCharacter();
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    const { gameMap } = Game;
    const cursorLayer = gameMap.layers.cursor;

    const x = pointer.x + this.scene.cameras.main.scrollX;
    const y = pointer.y + this.scene.cameras.main.scrollY;

    // Out of boundaries
    if (x >= cursorLayer.displayWidth ||
      y >= cursorLayer.displayHeight) {
      return;
    }

    const { x: tileX, y: tileY } = cursorLayer.worldToTileXY(x, y);

    if (!cursorLayer.hasTileAt(tileX, tileY)) {
      gameMap.moveCursorTo(tileX, tileY);
    }

    gameMap.dragCamera(pointer);
  }

  private moveCursorTo(x = 0, y = 0) {
    const cursorLayer = this.layers.cursor as Phaser.Tilemaps.DynamicTilemapLayer;

    this.killCursorAnimation();

    cursorLayer.removeTileAt(this.cursor.x, this.cursor.y);
    this.cursor = cursorLayer.putTileAt(this.cursor, x, y);

    this
      .animateCursor()
      .highlightChar(x, y)
      .moveCamera(x, y);

    this.scene.events.emit('cursorMoved', this.cursor, this.scene);
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

  /**
   * Handle character's movement on layer.
   * @param {Number} x The x coordinate to move char to.
   * @param {Number} y The y coordinate to move char to.
   */
  private updateCharacterPosition(x: number = 0, y: number = 0) {
    const { createUnit } = this;
    const characters = this.layers.characters as Phaser.Tilemaps.DynamicTilemapLayer;

    if (!this.selectedCharacter) {
      return;
    }

    const tileUnit = this.selectedCharacter.properties.tileUnit as TileUnit;
    const { x: charX, y: charY } = this.selectedCharacter;

    tileUnit
      .moveCharacterTo(x, y)
      .then((result: any) => {
        const unit = result.tileUnit as TileUnit;
        unit.unselect();
        return result;
      })
      .then((result) => {
        if (!result.moved) { return; }
        if (!this.selectedCharacter) { return; }

        const tile = characters
          .putTileAt(this.selectedCharacter, x, y)
          .setAlpha(1);

        const { scene } = this;

        tile.properties.tileUnit = new TileUnit({ scene, tile, createUnit });

        this.updateMapMatrix({ added: tile, removed: this.selectedCharacter });

        characters.removeTileAt(charX, charY);

        tileUnit.destroy();
        this.selectedCharacter.destroy();

      })
      .finally(() => {
        this.selectedCharacter = undefined;
        this.lastPointedChar = undefined;
      });

    return this;
  }

  /**
   * Update matrix cells (which one is (un-)reachable).
   * @param {Object} collisions Added & removed collisions.
   */
  private updateMapMatrix(collisions: updateMapMatrixParam) {
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
