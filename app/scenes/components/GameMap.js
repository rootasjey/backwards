import { unitsFactory } from '../../objects/unitsFactory';

export default class GameMap extends Phaser.GameObjects.GameObject {
  constructor(scene) {
    super(scene, 'GameMap');

    this.cursor = {};

    this.layers = {
      carpet: { },
      characters: { },
      collision: { },
      cursor: { },
      details: { },
      floor: { },
      hiddenFloor: { },
      movement: { },
      objects: { },
      uiTileInfo: { },
    };

    this.map = {};
    this.selectedCharacter = {};
    this.tilesMovement = [];

    this.tileset = {
      characters: { },
      map: { },
      ui: { }
    };
  }

  addTilesetImages() {
    const { map, tileset } = this;

    tileset.map = map.addTilesetImage('terrain', 'mapTileset');
    tileset.characters = map.addTilesetImage('characters', 'charactersTileset');
    tileset.ui = map.addTilesetImage('ui', 'uiTileset');

    return this;
  }

  createMapCursor() {
    this.cursor = this.layers.cursor.getTileAt(0, 0);

    return this;
  }

  createDynamicLayer() {
    const { layers, map, tileset } = this;

    layers.collision = map.createDynamicLayer('Collision', tileset.map);
    layers.movement = map.createDynamicLayer('Movement', tileset.map);
    layers.characters = map.createDynamicLayer('Characters', tileset.characters);
    layers.cursor = map.createDynamicLayer('Cursor', tileset.map);
    layers.uiTileInfo = map.createDynamicLayer('UITileInfo', tileset.ui);

    return this;
  }

  createMap() {
    this.map = this.scene.make.tilemap({ key: 'level0' });

    return this;
  }

  createStaticLayers() {
    const { layers, map, tileset } = this;

    layers.floor = map.createStaticLayer('Floor', tileset.map);
    layers.hiddenFloor = map.createStaticLayer('HiddenFloor', tileset.map);
    layers.carpet = map.createStaticLayer('Carpet', tileset.map);
    layers.objects = map.createStaticLayer('Objects', tileset.map);
    layers.details = map.createStaticLayer('Details', tileset.map);

    return this;
  }

  createUnits() {
    const { scene } = this;
    const layer = this.layers.characters;

    this.createUnit = unitsFactory({
      dataHeroes: scene.cache.json.get('heroes'),
      dataUnit: scene.cache.json.get('units'),
      dataWeapons: scene.cache.json.get('weapons'),
      dataConsummables: scene.cache.json.get('consummables')
    });

    const buildUnit = (tile) => {
      tile.properties.unit = this.createUnit(tile.properties.unitName);
    };

    layer.forEachTile(buildUnit, undefined, 0, 0,
      undefined, undefined, { isNotEmpty: true });

    return this;
  }

  disableEvents() {
    const { scene } = this;

    scene.input.off('pointerdown', this.onPointerDown);
    scene.input.off('pointermove', this.onPointerMove);

    scene.input.keyboard.off('keydown_UP', this.onMoveCursorUp);
    scene.input.keyboard.off('keydown_DOWN', this.onMoveCursorDown);
    scene.input.keyboard.off('keydown_LEFT', this.onMoveCursorLeft);
    scene.input.keyboard.off('keydown_RIGHT', this.onMoveCursorRight);

    return this;
  }

  enableEvents() {
    const { scene } = this;

    scene.input.on('pointerdown', this.onPointerDown);
    scene.input.on('pointermove', this.onPointerMove);

    scene.input.keyboard.on('keydown_UP', this.onMoveCursorUp);
    scene.input.keyboard.on('keydown_DOWN', this.onMoveCursorDown);
    scene.input.keyboard.on('keydown_LEFT', this.onMoveCursorLeft);
    scene.input.keyboard.on('keydown_RIGHT', this.onMoveCursorRight);

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
      .listenToEvents();
  }

  listenToEvents() {
    const { scene } = this;

    scene.events.on('subscribeMapEvents', this.enableEvents);
    scene.events.on('unsubscribeMapEvents', this.disableEvents);

    this.enableEvents();
  }

  onMoveCursorUp() {
    const { gameMap } = this.scene;
    const { x, y } = gameMap.cursor;

    const previousY = y - 1;

    if (previousY <= gameMap.layers.cursor.layer.y) return;

    gameMap.layers.cursor.removeTileAt(x, y);
    gameMap.cursor = gameMap.layers.cursor.putTileAt(gameMap.cursor, x, previousY);

    this.scene.events.emit('cursorMoved', gameMap.cursor, this.scene);
  }

  onMoveCursorDown() {
    const { gameMap } = this.scene;
    const { x, y } = gameMap.cursor;

    const nextY = y + 1;

    if (nextY >= gameMap.layers.cursor.layer.height) return;

    gameMap.layers.cursor.removeTileAt(x, y);
    gameMap.cursor = gameMap.layers.cursor.putTileAt(gameMap.cursor, x, nextY);

    this.scene.events.emit('cursorMoved', gameMap.cursor, this.scene);
  }

  onMoveCursorLeft() {
    const { gameMap } = this.scene;
    const { x, y } = gameMap.cursor;

    const previousX = x - 1;

    if (previousX <= gameMap.layers.cursor.layer.x) return;

    gameMap.layers.cursor.removeTileAt(x, y);
    gameMap.cursor = gameMap.layers.cursor.putTileAt(gameMap.cursor, previousX, y);

    this.scene.events.emit('cursorMoved', gameMap.cursor, this.scene);
  }

  onMoveCursorRight() {
    const { gameMap } = this.scene;
    const { x, y } = gameMap.cursor;

    const nextX = x + 1;

    if (nextX >= gameMap.layers.cursor.layer.width) return;

    gameMap.layers.cursor.removeTileAt(x, y);
    gameMap.cursor = gameMap.layers.cursor.putTileAt(gameMap.cursor, nextX, y);

    this.scene.events.emit('cursorMoved', gameMap.cursor, this.scene);
  }

  onPointerDown() {
    this.scene.gameMap.interactWithCharacter();
  }

  onPointerMove(pointer) {
    const cursorLayer = this.scene.gameMap.layers.cursor;
    let tileCursor = this.scene.gameMap.cursor;

    const { x, y } = pointer;

    // Out of boundaries
    if (x >= cursorLayer.displayWidth ||
      y >= cursorLayer.displayHeight) {
      return;
    }

    if (!cursorLayer.hasTileAtWorldXY(x, y)) {
      cursorLayer.removeTileAt(tileCursor.x, tileCursor.y);
      this.scene.gameMap.cursor = cursorLayer.putTileAtWorldXY(tileCursor, x, y);

      this.scene.events.emit('cursorMoved', this.scene.gameMap.cursor, this.scene);
    }
  }

  /**
   * Fired when a character receives a pointer event.
   */
  interactWithCharacter() {
    const { x, y } = this.cursor;

    if (this.selectedCharacter) {
      this.moveCharacterTo(x, y);

      this.tilesMovement =
        this.hideAllowedMovement(this.layers.movement, this.tilesMovement);

      this.selectedCharacter = null;
      return;
    }

    const tileCharacter = this.layers.characters.getTileAt(x, y);

    if (!tileCharacter) return;

    this.selectedCharacter = tileCharacter;
    this.showAllowedMovement(tileCharacter);
  }

  /**
   * Move the selected character to the coordinates.
   * @param {Number} x x coordinate to move the selected character to.
   * @param {Number} y y coordinate to move the selected character to.
   */
  moveCharacterTo(x, y) {
    if (!this.layers.movement.hasTileAt(x, y)) return;

    const selectedMovementTile = this.layers.movement.getTileAt(x, y);

    this.layers.characters.removeTileAt(this.selectedCharacter.x, this.selectedCharacter.y);
    this.layers.characters.putTileAt(this.selectedCharacter,
      selectedMovementTile.x, selectedMovementTile.y);
  }

  /**
   * Hide the allowed movement of the last selected character.
   * @param {Phaser.Tilemaps.DynamicTilemapLayer|Phaser.Tilemaps.StaticTilemapLayer} layer Layer to remove the tiles from.
   * @param {Array<Phaser.Tilemaps.Tile>} tilesArray Array containing the tiles to remove.
   */
  hideAllowedMovement(layer, tilesArray) {
    tilesArray.map((tile) => {
      layer.removeTileAt(tile.x, tile.y);
    });

    return [];
  }

  /**
   * Show the allowed movement for the target character tile.
   * @param {Phaser.Tilemaps.Tile} tileCharacter Tile character to move.
   */
  showAllowedMovement(tileCharacter) {
    const { unit } = tileCharacter.properties;
    const move = unit.get('move');

    if (!move) return;

    const coord = {
      x: tileCharacter.x,
      y: tileCharacter.y
    };

    const remainingMove = move + 1;

    this.findValidNeighbours(coord, remainingMove);
  }

  /**
   * Find the adjacent allowed movement and add the tiles found to a layer and an array.
   * @param {coordinates} param0 Coordinate to check the adjacent tile movement.
   * @param {Number} param0.x X coordinate.
   * @param {Number} param0.y Y coordinate.
   * @param {Number} remainingMove Max character's movement.
   */
  findValidNeighbours({ x, y }, remainingMove) {
    if (remainingMove === 0) return;

    // 1.Bounds check
    if (x >= this.layers.movement.tilemap.width ||
      y >= this.layers.movement.tilemap.height ||
      x < 0 || y < 0) {
      return;
    }

    // 2.Collision Environment check
    if (this.layers.collision.hasTileAt(x, y)) return;

    // 3.Collision Character check
    const character = this.layers.characters.getTileAt(x, y);

    if (character &&
      character.x !== this.selectedCharacter.x &&
      character.y !== this.selectedCharacter.y) {
      return;
    }

    // 4.Avoid tile duplication
    if (!this.layers.movement.hasTileAt(x, y)) {
      const tileMovement = this.layers.movement.putTileAt(this.cursor, x, y);
      this.tilesMovement.push(tileMovement);
    }

    const newRemainingMove = remainingMove - 1;

    const coordUp = { x, y: y - 1 };
    const coordDown = { x, y: y + 1 };
    const coordLeft = { x: x - 1, y };
    const coordRight = { x: x + 1, y };

    this.findValidNeighbours(coordUp, newRemainingMove);
    this.findValidNeighbours(coordDown, newRemainingMove);
    this.findValidNeighbours(coordLeft, newRemainingMove);
    this.findValidNeighbours(coordRight, newRemainingMove);
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
