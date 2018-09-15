import { addVisualLoader } from './components/addVisualLoader';
import { unitsFactory } from '../objects/unitsFactory';

export default class Game extends Phaser.Scene {
  /**
   *  Game scene containing the main game logic
   *
   *  @extends Phaser.Scene
   */
  constructor() {
    super('game');

    this.createUnit;
    this.cursor;

    this.layers = {
      carpet      : {},
      characters  : {},
      collision   : {},
      cursor      : {},
      floor       : {},
      movement    : {},
      objects     : {}
    };

    this.progressBar;
    this.progressBgRect;
    this.progressRect;

    this.selectedCharacter;
    this.tilesMovement = [];

    addVisualLoader(this);
  }

  preload() {
    this.load.on('progress', this.onLoadProgress, this);
    this.load.on('complete', this.onLoadComplete, this);
    this.createProgressBar();

    this.load.json('consummables', './data/consumables.json');
    this.load.json('heroes', './data/heroes.json');
    this.load.json('units', './data/unitsClasses.json');
    this.load.json('weapons', './data/weapons.json');

    this.load.image('mapTileset', './level0/terrain.png');
    this.load.image('charactersTileset', './level0/characters.png');
    this.load.tilemapTiledJSON('level0', './level0/level0.json');
  }

  init() {
    this.addFonts();
  }

  addFonts() {
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    styleElement.classList.add('toto');

    const { sheet } = styleElement;
    const styles = '@font-face { font-family: "Kenney Pixel"; src: url("assets/fonts/Kenney Pixel.ttf") format("truetype") }';

    sheet.insertRule(styles, 0);
    sheet.addRule('body', 'font-family: "Kenney Pixel"');
  }

  /**
   *  Called when a scene is initialized. Method responsible for setting up
   *  the game objects of the scene.
   *
   *  @protected
   *  @param {object} data Initialization parameters.
   */
  create(/* data */) {
    const map = this.make.tilemap({ key: 'level0' });
    const mapTilesset = map.addTilesetImage('terrain', 'mapTileset');
    const charactersTileset = map.addTilesetImage('characters', 'charactersTileset');

    const layers = this.layers;

    layers.floor    = map.createStaticLayer('Floor', mapTilesset);
    layers.carpet   = map.createStaticLayer('Carpet', mapTilesset);
    layers.objects  = map.createStaticLayer('Objects', mapTilesset);
    const details   = map.createStaticLayer('Details', mapTilesset);

    layers.collision  = map.createDynamicLayer('Collision', mapTilesset);
    layers.movement   = map.createDynamicLayer('Movement', mapTilesset);
    layers.characters = map.createDynamicLayer('Characters', charactersTileset);
    layers.cursor     = map.createDynamicLayer('Cursor', mapTilesset);

    // Sscale
    //-------
    const { height, width } = window.game.config;

    layers.floor.setDisplaySize(height, width);
    layers.carpet.setDisplaySize(height, width);
    layers.objects.setDisplaySize(height, width);
    details.setDisplaySize(height, width);

    layers.collision.setDisplaySize(height, width);
    layers.movement.setDisplaySize(height, width);
    layers.characters.setDisplaySize(height, width);
    layers.cursor.setDisplaySize(height, width);

    this.cursor = layers.cursor.getTileAt(0, 0);

    this.buildUnitOnMap(layers.characters);

    this.handleKeyboard();
  }

  buildUnitOnMap(layer = {}) {
    this.createUnit = unitsFactory({
      dataHeroes: this.cache.json.get('heroes'),
      dataUnit: this.cache.json.get('units'),
      dataWeapons: this.cache.json.get('weapons'),
      dataConsummables: this.cache.json.get('consummables')
    });

    const buildUnit = (tile) => {
      tile.properties.unit = this.createUnit(tile.properties.unitName);
      // console.log(tile);
      // console.log(tile.properties.unit);
    };

    layer.forEachTile(buildUnit, undefined, 0, 0,
      undefined, undefined, { isNotEmpty: true });
  }

  /**
   *  Called when a scene is updated. Updates to game logic, physics and game
   *  objects are handled here.
   *
   *  @protected
   *  @param {number} t Current internal clock time.
   *  @param {number} dt Time elapsed since last update.
   */
  update(/* t, dt */) {
    this.handleMouseCursor();
  }

  handleKeyboard() {
    this.input.keyboard.on('keydown_UP', () => {
      const { x, y } = this.cursor;
      const previousY = y - 1;

      if (previousY <= this.layers.cursor.layer.y) return;

      this.layers.cursor.removeTileAt(x, y);
      this.cursor = this.layers.cursor.putTileAt(this.cursor, x, previousY);

      this.updateTileInfo();
    });

    this.input.keyboard.on('keydown_DOWN', () => {
      const { x, y } = this.cursor;
      const nextY = y + 1;

      if (nextY >= this.layers.cursor.layer.height) return;

      this.layers.cursor.removeTileAt(x, y);
      this.cursor = this.layers.cursor.putTileAt(this.cursor, x, nextY);

      this.updateTileInfo();
    });

    this.input.keyboard.on('keydown_LEFT', () => {
      const { x, y } = this.cursor;
      const previousX = x - 1;

      if (previousX <= this.layers.cursor.layer.x) return;

      this.layers.cursor.removeTileAt(x, y);
      this.cursor = this.layers.cursor.putTileAt(this.cursor, previousX, y);

      this.updateTileInfo();
    });

    this.input.keyboard.on('keydown_RIGHT', () => {
      const { x, y } = this.cursor;
      const nextX = x + 1;

      if (nextX <= this.layers.cursor.layer.x) return;

      this.layers.cursor.removeTileAt(x, y);
      this.cursor = this.layers.cursor.putTileAt(this.cursor, nextX, y);

      this.updateTileInfo();
    });

    this.input.keyboard.on('keyup_X', () => this.interactWithCharacter());
  }

  handleMouseCursor() {
    if (this.input.activePointer.isDown) {
      this.onPointerDown();
    }

    if (!this.input.activePointer.justMoved) return;

    const { x, y } = this.input.activePointer;

    // Out of boundaries
    if (x >= this.layers.cursor.displayWidth ||
      y >= this.layers.cursor.displayHeight) {
      return;
    }

    if (!this.layers.cursor.hasTileAtWorldXY(x, y)) {
      this.layers.cursor.removeTileAt(this.cursor.x, this.cursor.y);
      this.cursor = this.layers.cursor.putTileAtWorldXY(this.cursor, x, y);

      this.updateTileInfo();
    }
  }

  /**
   * Display tile information
   * along side characters and objects info.
   */
  updateTileInfo() {
    const info = this.getTileInfo();
    this.drawTileInfo(info);
  }

  /**
   * Return the current highlighted tile information.
   * @return {Object} tile information.
   */
  getTileInfo() {
    const defaultTileValues = {
      name: ' - ',
      avo: 0,
      def: 0
    };

    let tileValues = Object.assign({}, defaultTileValues);

    const tile = this.layers.floor.getTileAt(this.cursor.x, this.cursor.y);

    if (tile) {
      const { properties } = tile;
      tileValues = Object.assign({}, tileValues, properties);
    }

    return tileValues;
  }

  /**
   * Draw tile information to the screen.
   * @param {Object} info Tile information.
   */
  drawTileInfo(info = {}) {
    const { width } = window.game.config;

    const dim = {
      height  : 130,
      width   : 140,
      x       : width - 150,
      y       : 10
    };

    // Need Phaser v3.13
    // this.add.rectangle(width - 100, height - 200, 200, 200, 0x6666ff);

    this.add.graphics()
      .fillStyle(0xFFFF, .8)
      .fillRect(dim.x - 10, dim.y - 10, dim.width + 20, dim.height + 20)
      .fillStyle(0x6666ff, .8)
      .fillRect(dim.x, dim.y, dim.width, dim.height);

    const style = { fontFamily: 'Kenney Pixel', fontSize: 30 };
    const x = width - 100;
    const y = 30;

    this.add.text(x, y, info.name, style);
    this.add.text(x, y + 50, 'DEF. ' + info.def, style);
    this.add.text(x, y + 70, 'AVO. ' + info.avo, style);
  }

  /**
   * Event callback fired when the user interacts with the map.
   * @param {Phaser.Tilemap.Tile} pointedTile current tile under the cursor.
   */
  onPointerDown() {
    this.input.manager.activePointer.isDown = false;

    this.interactWithCharacter();
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
}
