import { unitsFactory } from '../../logic/unitsFactory';
import TileUnit from '../../gameObjects/TileUnit';

export default class GameMap extends Phaser.GameObjects.GameObject {
  /**
   * Manage in-game tile maps & layers.
   * @param {Object} scene Phaser scene.
   */
  constructor(scene) {
    super(scene, 'GameMap');

    this.cursor = {};

    this.lastPointedChar;

    this.layers = {
      carpet      : {},
      characters  : {},
      charPanel   : {},
      collision   : {},
      cursor      : {},
      details     : {},
      floor       : {},
      hiddenFloor : {},
      movement    : {},
      objects     : {},
      tilePanel   : {}
    };

    this.map = {};
    this.mapMatrix = [];
    this.selectedCharacter;

    this.tileset = {
      characters: {},
      map: {},
      ui: {}
    };
  }

  addTilesetImages() {
    const { map, tileset } = this;

    tileset.characters = map.addTilesetImage('characters', 'charactersTileset');
    tileset.map        = map.addTilesetImage('terrain', 'mapTileset');
    tileset.ui         = map.addTilesetImage('ui', 'uiTileset');

    return this;
  }

  animateCursor() {
    this.scene.tweens.timeline({
      targets: this.cursor,
      duration: 1000,
      loop: -1,
      yoyo: true,

      tweens: [
        {
          alpha: .8
        },
        {
          alpha: 0
        }]
    });

    return this;
  }

  createMapCursor() {
    this.cursor = this.layers.cursor.getTileAt(0, 0);
    this.animateCursor(this.cursor);

    return this;
  }

  createDynamicLayer() {
    const { layers, map, tileset } = this;

    layers.collision  = map.createDynamicLayer('Collision', tileset.map);
    layers.movement   = map.createDynamicLayer('Movement', tileset.ui);
    layers.characters = map.createDynamicLayer('Characters', tileset.characters);
    layers.cursor     = map.createDynamicLayer('Cursor', tileset.map);
    layers.tilePanel  = map.createDynamicLayer('TilePanel', tileset.ui);
    layers.charPanel  = map.createDynamicLayer('CharPanel', tileset.ui);

    return this;
  }

  createMap() {
    this.map = this.scene.make.tilemap({ key: 'level0' });

    return this;
  }

  createMapMatrix() {
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

  createStaticLayers() {
    const { layers, map, tileset } = this;

    layers.floor        = map.createStaticLayer('Floor', tileset.map);
    layers.hiddenFloor  = map.createStaticLayer('HiddenFloor', tileset.map);
    layers.carpet       = map.createStaticLayer('Carpet', tileset.map);
    layers.objects      = map.createStaticLayer('Objects', tileset.map);
    layers.details      = map.createStaticLayer('Details', tileset.map);

    return this;
  }

  createUnits() {
    const { json } = this.scene.cache;
    const layer = this.layers.characters;

    this.createUnit = unitsFactory({
      dataConsummables  : json.get('consummables'),
      dataHeroes        : json.get('heroes'),
      dataUnit          : json.get('units'),
      dataWeapons       : json.get('weapons')
    });

    const { createUnit } = this;

    const createTileUnit = (tile) => {
      tile.properties.tileUnit = new TileUnit({ tile, createUnit });
    };

    layer.forEachTile(createTileUnit, undefined, 0, 0,
      undefined, undefined, { isNotEmpty: true });

    return this;
  }

  disableEvents() {
    const { input } = this.scene;

    input.off('pointerdown', this.onPointerDown);
    input.off('pointermove', this.onPointerMove);

    input.keyboard.off('keydown_UP', this.onMoveCursorUp);
    input.keyboard.off('keydown_DOWN', this.onMoveCursorDown);
    input.keyboard.off('keydown_LEFT', this.onMoveCursorLeft);
    input.keyboard.off('keydown_RIGHT', this.onMoveCursorRight);

    return this;
  }

  enableEvents() {
    const { input } = this.scene;

    input.on('pointerdown', this.onPointerDown);
    input.on('pointermove', this.onPointerMove);

    input.keyboard.on('keydown_UP', this.onMoveCursorUp);
    input.keyboard.on('keydown_DOWN', this.onMoveCursorDown);
    input.keyboard.on('keydown_LEFT', this.onMoveCursorLeft);
    input.keyboard.on('keydown_RIGHT', this.onMoveCursorRight);

    return this;
  }

  getBinaryCellType(x, y) {
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
  highlightChar(x = 0, y = 0) {
    if (this.layers.characters.hasTileAt(x, y)) {
      this.lastPointedChar = this.layers.characters.getTileAt(x, y);
      const { tileUnit } = this.lastPointedChar.properties;

      tileUnit.bringToFront();
      return this;
    }

    if (this.lastPointedChar &&
        this.lastPointedChar !== this.selectedCharacter) {

      this.lastPointedChar.properties.tileUnit.sendToBack();
      this.lastPointedChar = undefined;
    }

    return this;
  }

  /**
   * Initialize map, layers, units and events.
   */
  init() {
    this.createMap()
      .addTilesetImages()
      .createStaticLayers()
      .createDynamicLayer()
      .scaleToGameSize()
      .createMapCursor()
      .createUnits()
      .createMapMatrix()
      .listenToEvents();
  }

  /**
   * Fired when a character receives a pointer event.
   */
  interactWithCharacter() {
    const { x, y } = this.cursor;

    if (this.selectedCharacter) {
      const { tileUnit } = this.selectedCharacter.properties;
      const { characters } = this.layers;
      const { createUnit } = this;

      tileUnit
        .moveCharacterTo(x, y)
        .then(unit => unit.hideAllowedMovement())
        .then(() => {
          const tile = characters
            .putTileAt(this.selectedCharacter, x, y)
            .setAlpha(1);

          tile.properties.tileUnit = new TileUnit({ tile, createUnit });

          characters.removeTileAt(this.selectedCharacter.x, this.selectedCharacter.y);

          tileUnit.destroy();
          this.selectedCharacter.destroy();
          this.selectedCharacter = undefined;
          this.lastPointedChar = undefined;
        });

      return;
    }

    const tileCharacter = this.layers.characters.getTileAt(x, y);

    if (!tileCharacter) return;

    this.selectedCharacter = tileCharacter;

    this.selectedCharacter.properties
      .tileUnit.showAllowedMovement();
  }

  /**
   * Kill previous cursor animation.
   * => cursor blink
   */
  killCursorAnimation() {
    this.scene.tweens.killTweensOf(this.cursor);
    return this;
  }

  listenToEvents() {
    const { events } = this.scene;

    events.on('subscribeMapEvents', this.enableEvents);
    events.on('unsubscribeMapEvents', this.disableEvents);

    this.enableEvents();
  }

  onMoveCursorDown() {
    const { gameMap } = this.scene;
    const { x, y } = gameMap.cursor;

    const nextY = y + 1;

    if (nextY >= gameMap.layers.cursor.layer.height) return;

    gameMap.moveCursorTo(x, nextY);
  }

  onMoveCursorLeft() {
    const { gameMap } = this.scene;
    const { x, y } = gameMap.cursor;

    const previousX = x - 1;

    if (previousX <= gameMap.layers.cursor.layer.x) return;

    gameMap.moveCursorTo(previousX, y);
  }

  onMoveCursorRight() {
    const { gameMap } = this.scene;
    const { x, y } = gameMap.cursor;

    const nextX = x + 1;

    if (nextX >= gameMap.layers.cursor.layer.width) return;

    gameMap.moveCursorTo(nextX, y);
  }

  onMoveCursorUp() {
    const { gameMap } = this.scene;
    const { x, y } = gameMap.cursor;

    const previousY = y - 1;

    if (previousY <= gameMap.layers.cursor.layer.y) return;

    gameMap.moveCursorTo(x, previousY);
  }

  onPointerDown() {
    this.scene.gameMap.interactWithCharacter();
  }

  onPointerMove(pointer) {
    const cursorLayer = this.scene.gameMap.layers.cursor;
    const { x, y } = pointer;

    // Out of boundaries
    if (x >= cursorLayer.displayWidth ||
      y >= cursorLayer.displayHeight) {
      return;
    }

    const { x: tileX, y: tileY } = cursorLayer.worldToTileXY(x, y);

    if (!cursorLayer.hasTileAt(tileX, tileY)) {
      this.scene.gameMap.moveCursorTo(tileX, tileY);
    }
  }

  moveCursorTo(x = 0, y = 0) {
    const cursorLayer = this.layers.cursor;

    this.killCursorAnimation();

    cursorLayer.removeTileAt(this.cursor.x, this.cursor.y);
    this.cursor = cursorLayer.putTileAt(this.cursor, x, y);

    this.animateCursor(this.cursor);

    this.scene.events.emit('cursorMoved', this.cursor, this.scene);

    this.highlightChar(x, y);
  }

  scaleToGameSize() {
    const { height, width } = window.game.config;
    const { layers } = this;

    Object
      .values(layers)
      .map((layer) => layer.setDisplaySize(height, width));

    return this;
  }
}
