import CONST from 'data/const';
const Rectangle = Phaser.Geom.Rectangle;

export default class Game extends Phaser.Scene {
  /**
   *  Game scene containing the main game logic
   *
   *  @extends Phaser.Scene
   */
  constructor() {
    super('game');

    this.progressBar = null;
    this.progressBgRect = null;
    this.progressRect = null;

    this.map = null;
    this.currentTilesMovement = [];
    this.lastSelectedChar = null;
    this.layerField = null;
    this.layerItems = null;
    this.scaleFactor = 0;
    this.tileset = null;

    this.layerCharacters = null;

    this.layerCollision = null;
    this.layerCursor = null;
    this.layerMovement = null;
    this.highlightCursor = null;
    this.selectedCharacter = null;
  }

  preload() {
    this.load.on('progress', this.onLoadProgress, this);
    this.load.on('complete', this.onLoadComplete, this);
    this.createProgressBar();

    this.load.image('mapTileset', 'roguelikeSheet_transparent.png');
    this.load.image('charactersTileset', 'roguelikeChar_transparent.png');
    this.load.tilemapTiledJSON('sampleMap1', 'sampleMap1.json');
  }

  /**
   *  Called when a scene is initialized. Method responsible for setting up
   *  the game objects of the scene.
   *
   *  @protected
   *  @param {object} data Initialization parameters.
   */
  create(/* data */) {
    // Build Map
    // ---------
    const map = this.make.tilemap({ key: 'sampleMap1' });

    const mapTilesset = map.addTilesetImage(
      'roguelikeSheet_transparent', 'mapTileset');

    const charactersTileset = map.addTilesetImage(
      'roguelikeChar_transparent', 'charactersTileset');

    const floor = map.createStaticLayer('Floor', mapTilesset);
    const carpet = map.createStaticLayer('Carpet', mapTilesset);
    const objects = map.createStaticLayer('Objects', mapTilesset);
    const details = map.createStaticLayer('Details', mapTilesset);

    this.layerCollision = map.createDynamicLayer('Collision', mapTilesset);
    this.layerMovement = map.createDynamicLayer('Movement', mapTilesset);
    this.layerCharacters = map.createDynamicLayer('Characters', charactersTileset);
    this.layerCursor = map.createDynamicLayer('Cursor', mapTilesset);

    // Sscale
    //-------
    floor.setDisplaySize(window.innerHeight, window.innerWidth);
    carpet.setDisplaySize(window.innerHeight, window.innerWidth);
    objects.setDisplaySize(window.innerHeight, window.innerWidth);
    details.setDisplaySize(window.innerHeight, window.innerWidth);

    this.layerCollision.setDisplaySize(window.innerHeight, window.innerWidth);
    this.layerMovement.setDisplaySize(window.innerHeight, window.innerWidth);
    this.layerCharacters.setDisplaySize(window.innerHeight, window.innerWidth);
    this.layerCursor.setDisplaySize(window.innerHeight, window.innerWidth);

    // // MARKER
    // // ------
    // this.marker = this.add.graphics();
    // this.marker.lineStyle(1, 0xffffff, 1);
    // this.marker.strokeRect(0, 0, this.map.tileWidth * this.scaleFactor, this.map.tileHeight * this.scaleFactor);
    this.highlightCursor = this.layerCursor.getTileAt(0, 0);
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

  handleMouseCursor() {
    const { x, y } = this.input.activePointer;

    // Out of boundaries
    if (x >= this.layerCursor.displayWidth ||
      y >= this.layerCursor.displayHeight) {
      return;
    }

    if (!this.layerCursor.hasTileAtWorldXY(x, y)) {
      this.layerCursor.removeTileAt(this.highlightCursor.x, this.highlightCursor.y);
      this.highlightCursor = this.layerCursor.putTileAtWorldXY(this.highlightCursor, x, y);
    }

    if (this.input.manager.activePointer.isDown) {
      this.onPointerDown();
    }
  }

  /**
   * Display the tile information if any
   * along side characters and objects info.
   */
  showTileInfo() {

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
    const { x, y } = this.input.activePointer;

    if (this.selectedCharacter) {
      this.moveCharacterTo(x, y);

      this.currentTilesMovement =
        this.hideAllowedMovement(this.layerMovement, this.currentTilesMovement);

      this.selectedCharacter = null;
      return;
    }

    const tileCharacter = this.layerCharacters.getTileAtWorldXY(x, y);

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
    if (!this.layerMovement.hasTileAtWorldXY(x, y)) return;

    const selectedMovementTile = this.layerMovement.getTileAtWorldXY(x, y);

    this.layerCharacters.removeTileAt(this.selectedCharacter.x, this.selectedCharacter.y);
    this.layerCharacters.putTileAt(this.selectedCharacter,
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
    const { move } = tileCharacter.properties;

    if (move === 0) return;

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
    if (x >= this.layerMovement.tilemap.width ||
      y >= this.layerMovement.tilemap.height ||
      x < 0 || y < 0) {
      return;
    }

    // 2.Collision Environment check
    if (this.layerCollision.hasTileAt(x, y)) return;

    // 3.Collision Character check
    const character = this.layerCharacters.getTileAt(x, y);

    if (character &&
      character.x !== this.selectedCharacter.x &&
      character.y !== this.selectedCharacter.y) {
      return;
    }

    // 4.Avoid tile duplication
    if (!this.layerMovement.hasTileAt(x, y)) {
      const tileMovement = this.layerMovement.putTileAt(this.highlightCursor, x, y);
      this.currentTilesMovement.push(tileMovement);
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

  // Loading methods
  createProgressBar() {
    const main = this.cameras.main;
    this.progressBgRect = new Rectangle(0, 0, 0.5 * main.width, 50);
    Rectangle.CenterOn(this.progressBgRect, 0.5 * main.width, 0.5 * main.height);
    this.progressRect = Rectangle.Clone(this.progressBgRect);
    this.progressBar = this.add.graphics();
  }

  onLoadComplete(loader, totalComplete, totalFailed) {
    console.debug('complete', totalComplete);
    console.debug('failed', totalFailed);
    this.progressBar.destroy();
  }

  onLoadProgress(progress) {
    console.debug('progress', progress);
    this.progressRect.width = progress * this.progressBgRect.width;
    this.progressBar
      .clear()
      .fillStyle(CONST.hexColors.darkGray)
      .fillRectShape(this.progressBgRect)
      .fillStyle(this.load.totalFailed ? CONST.hexColors.red : CONST.hexColors.white)
      .fillRectShape(this.progressRect);
  }
}
