import PF from 'pathfinding';

export default class TileUnit extends Phaser.GameObjects.GameObject {
  constructor({ tile, createUnit}) {
    const { scene } = tile.layer.tilemapLayer;

    super(scene, 'TileUnit');

    this.isAnimating = false;

    this.tile = tile;

    this.sprite = this.createUnitSprite(tile);
    this.unit = createUnit(tile.properties.unitName);

    this.tilesMovement = [];

    this.once('destroy', () => {
      this.sprite.destroy();

      this.isAnimating = undefined;
      this.tile = undefined;
      this.tilesMovement = undefined;
      this.unit = undefined;
    });
  }

  animateTileMovement() {
    let delay = 0;

    this.tilesMovement.map((tile) => {
      this.scene.tweens.add({
        alpha     : 1,
        delay     : delay,
        duration  : 500,
        targets   : tile
      });

      delay += 15;
    });

    return this;
  }

  /**
   * Add sprite animation to tile.
   */
  bringToFront() {
    this.tile.setAlpha(0);
    this.sprite.setAlpha(1);

    this.scene.tweens.timeline({
      targets: this.sprite,
      loop: -1,
      yoyo: true,

      tweens: [
        {
          scaleX: 1.4,
          scaleY: 1.4,
          duration: 500,
          ease: 'Power1'
        },
        {
          scaleX: 1.7,
          scaleY: 1.7,
          duration: 500,
          ease: 'Power1'
        }]
    });

    this.showAllowedMovement();
  }

  createUnitSprite(tile) {
    const { scene } = tile.layer.tilemapLayer;

    const { x, y } = tile.tilemap.tileToWorldXY(tile.x, tile.y);
    const id = Number.parseInt(tile.properties.spritesIds);

    const deltaToCenter = tile.height / 1.4;

    return scene.add
      .sprite(x + deltaToCenter, y + deltaToCenter, 'charactersSheet', id)
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

    return finder.findPath(startX, startY, endX, endY, grid);
  }

  /**
   * Hide the allowed movement of the last selected character.
   */
  hideAllowedMovement() {
    const layerMovement = this.scene.gameMap.layers.movement;

    this.tilesMovement.map((tile) => {
      this.scene.tweens.killTweensOf(tile);
      layerMovement.removeTileAt(tile.x, tile.y);
    });

    this.tilesMovement = [];

    return this;
  }

  /**
 * Move the selected character to the coordinates.
 * @param {Number} endX x coordinate to move the selected character to.
 * @param {Number} endY y coordinate to move the selected character to.
 */
  moveCharacterTo(endX, endY) {
    return new Promise((resolve) => {
      const { layers } = this.scene.gameMap;

      if (!layers.movement.hasTileAt(endX, endY)) {
        return resolve({ tileUnit: this, moved: false });
      }

      const { tilemap } = this.tile;
      const { x: startX, y: startY } = this.tile;
      const deltaToCenter = this.tile.height / 1.4;
      const path = this.getCharacterPath({ startX, startY }, { endX, endY });

      if (path.length === 1) { // start === end
        return resolve({ tileUnit: this, moved: false });
      }

      this.isAnimating = true;

      this.scene.tweens.timeline({
        onComplete: () => {
          this.isAnimating = false;
          resolve({ tileUnit: this, moved: true });
        },
        targets: this.sprite,
        tweens: path.map(([x, y]) => {
          return {
            x: tilemap.tileToWorldX(x) + deltaToCenter,
            y: tilemap.tileToWorldY(y) + deltaToCenter,
            duration: 100
          };
        })
      });
    });
  }

  /**
   * Remove sprite animation from tile.
   */
  sendToBack() {
    // Prevent cancelling movement animation
    if (this.isAnimating) return;

    this.tile.setAlpha(1);
    this.sprite.setAlpha(0);

    this.scene.tweens.killTweensOf(this.sprite);

    this.hideAllowedMovement();
  }

  /**
   * Show the allowed movement for the target character tile.
   * @param {Phaser.Tilemaps.Tile} tileCharacter Tile character to move.
   */
  showAllowedMovement() {
    const { tile } = this;
    const move = this.unit.get('move');

    if (!move) return this;
    if (this.tilesMovement.length > 0) return this;

    const coord = {
      x: tile.x,
      y: tile.y
    };

    const remainingMove = move + 1;

    this.findValidNeighbours(coord, remainingMove);
    this.animateTileMovement();

    return this;
  }

  tintAllowedMovement() {
    let delay = 0;

    this.tilesMovement
      .map(tile => {
        this.scene.tweens.add({
          delay     : delay,
          duration  : 25,
          targets   : tile,
          tint      : 0x358F55
        });

        delay += 25;
      });

    return this;
  }
}