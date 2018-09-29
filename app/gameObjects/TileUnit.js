import PF from 'pathfinding';

export default class TileUnit extends Phaser.GameObjects.GameObject {
  constructor({ tile, createUnit}) {
    const { scene } = tile.layer.tilemapLayer;

    super(scene, 'TileUnit');

    this.tile = tile;

    this.sprite = this.createUnitSprite(tile);
    this.unit = createUnit(tile.properties.unitName);

    this.tilesMovement = [];
  }

  animateTileMovement() {
    const { scene } = this;
    let delay = 0;

    this.tilesMovement.map((tile) => {
      scene.tweens.add({
        targets: tile,
        alpha: 1,
        duration: 1000,
        delay: delay
      });

      delay += 15;
    });

    return this;
  }

  createUnitSprite(tile) {
    const { scene } = tile.layer.tilemapLayer;

    const { x, y } = tile.tilemap.tileToWorldXY(tile.x, tile.y);
    const id = Number.parseInt(tile.properties.spritesIds);

    // tile.setAlpha(0);
    const add = tile.height / 1.4;

    return scene.add
      .sprite(x + add, y + add, 'charactersSheet', id)
      .setScale(1.4)
      .setAlpha(0);
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

    const { layers } = this.scene.gameMap;

    const layerMovement = layers.movement;

    // 1.Bounds check
    if (x >= layerMovement.tilemap.width ||
      y >= layerMovement.tilemap.height ||
      x < 0 || y < 0) {
      return;
    }

    // 2.Collision Environment check
    if (layers.collision.hasTileAt(x, y)) return;

    // 3.Collision Character check
    const character = layers.characters.getTileAt(x, y);

    if (character &&
      character.x !== this.tile.x &&
      character.y !== this.tile.y) {
      return;
    }

    // 4.Avoid tile duplication
    if (!layerMovement.hasTileAt(x, y)) {
      const tileMovement = layerMovement.putTileAt(2569, x, y);

      // Alpha will be animate later to show movement
      tileMovement.setAlpha(0);

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

  getCharacterPath({ startX = 0, startY = 0 }, { endX = 0, endY = 0 }) {
    const { mapMatrix } = this.scene.gameMap;

    let grid = new PF.Grid(mapMatrix);
    const finder = new PF.BestFirstFinder();

    const path = finder.findPath(startX, startY, endX, endY, grid);
    console.log(path);
    return path;
  }

  /**
   * Hide the allowed movement of the last selected character.
   */
  hideAllowedMovement() {
    const layerMovement = this.scene.gameMap.layers.movement;

    this.tilesMovement.map((tile) => {
      layerMovement.removeTileAt(tile.x, tile.y);
    });

    this.tilesMovement = [];
  }

  /**
 * Move the selected character to the coordinates.
 * @param {Number} endX x coordinate to move the selected character to.
 * @param {Number} endY y coordinate to move the selected character to.
 */
  moveCharacterTo(endX, endY) {
    const { tilemap } = this.tile;
    const { layers } = this.scene.gameMap;

    if (!layers.movement.hasTileAt(endX, endY)) return;

    const { x: startX, y: startY } = this.tile;

    this.getCharacterPath({ startX, startY }, { endX, endY });

    layers.characters.removeTileAt(startX, startY);
    layers.characters.putTileAt(this.tile, endX, endY);

    this.tile.x = endX;
    this.tile.y = endY;

    // sprite anim
    // const { sprite } = this.tile.properties;
    // const { x, y } = tilemap.tileToWorldXY(endX, endY);
    // this.sprite.setPosition(x, y);

    return this;
  }

  /**
 * Show the allowed movement for the target character tile.
 * @param {Phaser.Tilemaps.Tile} tileCharacter Tile character to move.
 */
  showAllowedMovement() {
    const { tile } = this;
    const move = this.unit.get('move');

    if (!move) return;

    const coord = {
      x: tile.x,
      y: tile.y
    };

    const remainingMove = move + 1;

    this.findValidNeighbours(coord, remainingMove);
    this.animateTileMovement();

    return this;
  }
}