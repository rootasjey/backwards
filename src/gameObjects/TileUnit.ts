import * as PF    from 'pathfinding';
import { colors } from '../const/config';
import { Unit }   from '../logic/Unit';
import { Game }   from './Game';

export default class TileUnit extends Phaser.GameObjects.GameObject {
  // ~~~~~~~~~~~~~~~~~
  // PUBLIC PROPERTIES
  // ~~~~~~~~~~~~~~~~~

  /** Which player own this unit. */
  public get player(): Player {
    return this.PLAYER;
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE PROPERTIES
  // ~~~~~~~~~~~~~~~~~

  /**
   * Coordinates where tiles attack shouldn't be put
   * (Due to gap in attack range).
   */
  private coordGap: CoordHash = {};

  /** True if the tile is being animated (sprite movement). */
  private isAnimating: boolean = false;

  /** Can this unit perform actions during the current turn. */
  private played: boolean = false;

  private PLAYER: Player;

  /** Tile's sprite. */
  private sprite: Phaser.GameObjects.Sprite;

  /** Unit's tile (where the unit is localized on the map). */
  private tile: Phaser.Tilemaps.Tile;

  /** Tiles showing this unit's attack range. */
  private tilesAtkRange: Phaser.Tilemaps.Tile[] = [];

  /** Tiles showing this unit's movement range. */
  private tilesMove: Phaser.Tilemaps.Tile[] = [];

  /** * Tiles representing this unit's path toward its destination. */
  private tilesPath: Phaser.Tilemaps.Tile[] = [];

  /** The unit associated. */
  private unit: Unit;

  /**
   * A combination of unit & tile.
   * This object can perform actions (e.g. attack, move).
   */
  constructor(param: TileUnitConstructorParam) {
    super(param.scene, 'TileUnit');

    const { createUnit, tile } = param;

    this.sprite = this.createUnitSprite(tile);
    this.unit = createUnit(tile.properties.unitName); // TODO: PR in Phaser for properties: any
    this.tile = tile;

    this.PLAYER = {
      id: tile.properties.playerId,
      name: tile.properties.playerName,
    };

    this.once('destroy', () => {
      this.sprite.destroy();
      this.tile.properties.tileUnit = undefined;
    });
  }

  // ~~~~~~~~~~~~~~~~~
  // PUBLIC FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  /** Add sprite animation to tile. */
  public bringToFront() {
    if (this.played) { return this; }

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
          ease: 'Power1',
        },
        {
          scaleX: 1.7,
          scaleY: 1.7,
          duration: 500,
          ease: 'Power1',
        }],
    });

    return this
      .showMovement()
      .showAtkRange();
  }

  public canMoveTo(coord: Coord) {
    const { movement } = Game.gameMap.layers;
    const { x, y } = coord;

    if (movement.hasTileAt(x, y)) {
      return true;
    }

    return false;
  }

  public getUnit() {
    return this.unit;
  }

  public getWeaponsHittingOpponent() {
    const weapons = this.unit.inventory.getWeapons();

    return weapons
      .filter((...[, weaponIndex]) => {
        this
          .hideAttackRange()
          .addSelfTileMove()
          .findAtkRange({ weaponIndex })
          .hideMovement();

        return this.isCurrentAtkInRangeOfOpponent();
      });
  }

  public getWeaponTargetsMarkers(weapon: Weapon) {
    this
      .addSelfTileMove()
      .findAtkRange({ weapon })
      .hideMovement();

    const { units: layerUnits } = Game.gameMap.layers;

    return this.tilesAtkRange
      .filter((atkTile) => {
        const { x, y } = atkTile;

        if (!layerUnits.hasTileAt(x, y)) {
          return false;
        }

        const otherUnit = layerUnits.getTileAt(x, y);
        const otherTileUnit = otherUnit.properties.tileUnit as TileUnit;

        return otherTileUnit.player.id !== this.player.id;
      });
  }

  public getWeaponTargets(weapon: Weapon) {
    const { units: layerUnits } = Game.gameMap.layers;

    return this.tilesAtkRange
      .filter((atkTile) => {
        const { x, y } = atkTile;

        if (!layerUnits.hasTileAt(x, y)) {
          return false;
        }

        const otherUnit = layerUnits.getTileAt(x, y);
        const otherTileUnit = otherUnit.properties.tileUnit as TileUnit;

        return otherTileUnit.player.id !== this.player.id;
      })
      .map((markerTile) => {
        const { x, y } = markerTile;
        return layerUnits.getTileAt(x, y);
      });
  }

  /** Return true if this unit can perform actions during the current turn. */
  public hasPlayed() {
    return this.played;
  }

  public isEnemyInAtkRange(): boolean {
    this
      .addSelfTileMove()
      .findAtkRange();

    const { units: layerUnits } = Game.gameMap.layers;

    return this.tilesAtkRange
      .filter((atkTile) => {
        const { x, y } = atkTile;

        if (!layerUnits.hasTileAt(x, y)) {
          return false;
        }

        const otherUnit = layerUnits.getTileAt(x, y);
        const otherTileUnit = otherUnit.properties.tileUnit as TileUnit;

        return otherTileUnit.player.id !== this.player.id;
      })
      .some((atkEnemyTile) => {
        if (atkEnemyTile) { return true; }
        return false;
      });
  }

  /** This unit won't be able to perform more actions (during the current turn). */
  public markAsPlayed() {
    this.sendToBack();
    this.played = true;
    this.tile.setAlpha(.5);

    return this;
  }

  /** This unit can now perform actions (during the current turn). */
  public markAsUnplayed() {
    this.played = false;
    this.tile.setAlpha(1);

    return this;
  }

  /** Move the unit to the coordinates (in tiles). */
  public moveTo(endX: number, endY: number):
    Promise<{moved: boolean, tileUnit: TileUnit}> {
    return new Promise((resolve) => {
      const { layers } = Game.gameMap;

      if (!layers.movement.hasTileAt(endX, endY)) {
        return resolve({ tileUnit: this, moved: false });
      }

      const { layer: { tilemapLayer },
        x: startX, y: startY } = this.tile;

      const path = this.getUnitPath({ startX, startY }, { endX, endY });

      if (path.length === 1) { // start === end
        return resolve({ tileUnit: this, moved: false });
      }

      this.isAnimating = true;
      const deltaToCenter = this.tile.height / 1.4;

      this.scene.tweens.timeline({
        onComplete: () => {
          this.isAnimating = false;
          resolve({ tileUnit: this, moved: true });
        },
        targets: this.sprite,
        tweens: path.map(([x, y]) => {
          return {
            x: tilemapLayer.tileToWorldX(x) + deltaToCenter,
            y: tilemapLayer.tileToWorldY(y) + deltaToCenter,
            duration: 100,
          };
        }),
      });
    });
  }

  /** Remove sprite animation from tile. */
  public sendToBack() {
    // Prevent cancelling movement animation
    if (this.isAnimating || this.played) { return this; }

    this.tile.setAlpha(1);
    this.sprite.setAlpha(0);

    this.scene.tweens.killTweensOf(this.sprite);

    this
      .hideMovement()
      .hideAttackRange();
  }

  /** Select this unit. */
  public select() {
    this
      .focusMovement()
      .focusAtkRange();

    this.scene.events.on('cursorMoved', this.onCursorMoved);

    return this;
  }

  /** Show unit's attack range (consider all current weapons in inventory). */
  public showAtkRange() {
    if (this.tilesMove.length === 0) {
      this.addSelfTileMove();
    }

    this.findAtkRange();

    this.fadeInTiles({
      tiles: this.tilesAtkRange,
      options: { alpha: .3 },
    });

    return this;
  }

  public showWeaponRange(weapon: Weapon) {
    this
      .addSelfTileMove()
      .findAtkRange({ weapon })
      .hideMovement()
      .focusAtkRange();

    return this;
  }

  /** Unselect this unit. */
  public unselect() {
    this
      .hideMovement()
      .hideAttackRange();

    this.scene.events.off('cursorMoved', this.onCursorMoved, undefined, false);

    return this;
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  /** Add a single tile under the unit if the unit cannot move. */
  private addSelfTileMove() {
    const { x, y } = this.tile;
    const { layers } = Game.gameMap;

    const layerMovement = layers.movement as Phaser.Tilemaps.DynamicTilemapLayer;

    if (!layerMovement.hasTileAt(x, y)) {
      const tileMovement = layerMovement.putTileAt(2569, x, y);

      tileMovement.setAlpha(0);

      this.tilesMove.push(tileMovement);
    }

    return this;
  }

  /** Create the associated sprite to this unit. */
  private createUnitSprite(tile: Phaser.Tilemaps.Tile) {
    const { scene } = this;

    const { x, y } = tile.layer.tilemapLayer.tileToWorldXY(tile.x, tile.y);
    const id = Number.parseInt(tile.properties.spriteId, 10);

    const deltaToCenter = tile.height / 1.4;

    return scene.add
      .sprite(x + deltaToCenter, y + deltaToCenter, 'unitsSpriteSheet', id)
      .setScale(1.4)
      .setAlpha(0);
  }

  private isCurrentAtkInRangeOfOpponent() {
    return this.tilesAtkRange
      .some((tile) => {
        const { x, y } = tile;
        const { units: unitsLayer } = Game.gameMap.layers;

        if (!unitsLayer.hasTileAt(x, y)) { return false; }

        const unit = unitsLayer.getTileAt(x, y);
        const tileUnit = unit.properties.tileUnit as TileUnit;

        // NOTE: may need some changes for NPC
        return this.player !== tileUnit.player;
      });
  }

  /** Return a unit's tiles path from a start to an end. */
  private getUnitPath({ startX = 0, startY = 0 }, { endX = 0, endY = 0 }) {
    const { mapMatrix } = Game.gameMap;

    const grid = new PF.Grid(mapMatrix);
    const finder = new PF.BestFirstFinder();

    return finder.findPath(startX, startY, endX, endY, grid);
  }

  /** Reveal the passed array tiles (with animation). */
  private fadeInTiles(params: fadeInTilesParams) {
    const { options, tiles } = params;

    let alpha = .5;
    let delay = 0;
    let delayStep = 10;
    let duration = 250;

    if (options) {
      alpha     = options.alpha ? options.alpha : alpha;
      delay     = options.delay ? options.delay : delay;
      delayStep = options.delayStep ? options.delayStep : delayStep;
      duration  = options.duration ? options.duration : duration;
    }

    tiles.map((tile) => {
      this.scene.tweens.add({
        alpha,
        delay,
        duration,
        targets: tile,
      });

      delay += delayStep;
    });

    return this;
  }

  /** Put attack tiles at this unit's range. Uses recursiveFindAtkRange. */
  private findAtkRange(config?: weaponRangeConfig) {
    this.hideAttackRange();

    let range;

    if (!config) {
      range = this.unit.getAllWeaponsRange();

    } else {
      const { weapon, weaponIndex } = config;

      range = typeof weaponIndex === 'number' ?
        this.unit.getWeaponRange({ weaponIndex }) :
        this.unit.getWeaponRange({ weapon });
    }

    const { move } = this.unit;

    if (range.min === 0 && range.max === 0) {
      return this;
    }

    let gap = (range.min - 1) - move;
    gap = Math.max(0, gap);

    let remainingRange = (range.max + 1) - range.min;

    // NOTE: may be a simpler way to handle this case.
    if (gap === 0) {
      remainingRange = range.max + 1;

    } else {
      // Adding +1 because it starts from the (self) unit's tile.
      // A gap of 1 tile would only allow to mark the unit's tile.
      gap += 1;
    }

    // Take other possibilities w/ move
    if (remainingRange === 1) {
      remainingRange += move;
    }

    this.recursiveFindGap({
      coord: { x: this.tile.x, y: this.tile.y },
      remainingMove: gap,
    });

    this.tilesMove
      .filter((tileMovement) => {
        return this.isEdgeTile(tileMovement);
      })
      .map((edgeTile, index, arr) => {
        this.recursiveFindAtkRange({
          coord: { x: edgeTile.x, y: edgeTile.y },
          gap,
          remainingMove: remainingRange,
        });
      });

    return this;
  }

  /** Animate tiles attack range opacity to 1. */
  private focusAtkRange() {
    this.fadeInTiles({
      tiles: this.tilesAtkRange,
      options: { alpha: .7 },
    });

    return this;
  }

  /** Animate tiles movement opacity to 1. */
  private focusMovement() {
    let delay = 0;

    // Double check tile's movement.
    // Can happens if the cursor didn't move on unit before click.
    if (this.tilesMove.length === 0) {
      this.bringToFront();
      delay = 500;
    }

    this.fadeInTiles({
      tiles: this.tilesMove,
      options: { alpha: 1, duration: 25, delay },
    });

    return this;
  }

  /** Hide the allowed movement of the last selected unit. */
  private hideMovement() {
    const layerMovement = Game.gameMap.layers.movement;

    this.tilesMove.map((tile) => {
      this.scene.tweens.killTweensOf(tile);
      layerMovement.removeTileAt(tile.x, tile.y);
    });

    this.tilesMove = [];

    return this;
  }

  /** Hide the attack range of the last selected unit. */
  private hideAttackRange() {
    const layerAtkRange = Game.gameMap.layers.attackRange;

    this.tilesAtkRange.map((tile) => {
      this.scene.tweens.killTweensOf(tile);
      layerAtkRange.removeTileAt(tile.x, tile.y);
    });

    this.tilesAtkRange = [];
    this.coordGap = {};

    return this;
  }

  /** Return true if the passed tile is on any edge. */
  private isEdgeTile(tile: Phaser.Tilemaps.Tile) {
    const coordArray = [
      { x: tile.x, y: tile.y + 1 }, // bottom
      { x: tile.x - 1, y: tile.y }, // left
      { x: tile.x + 1, y: tile.y }, // right
      { x: tile.x, y: tile.y - 1 }, // top
    ];

    const isEdge = coordArray
      .some((coord) => {
        const { tilemap, tilemapLayer } = tile;

        // boundaries check
        if (coord.x > tilemap.width ||
          coord.y > tilemap.height ||
          coord.x < 0 || coord.y < 0) {
          return false;
        }

        if (!tilemapLayer.hasTileAt(coord.x, coord.y)) {
          return true;
        }

        return false;
      });

    return isEdge;
  }

  /** Fired when this current unit is selected and pointer has moved. */
  private onCursorMoved(cursor: Phaser.Input.Pointer) {
    const movement = Game.gameMap.layers.movement as Phaser.Tilemaps.DynamicTilemapLayer;
    const { selectedUnit } = Game.gameMap;

    if (!selectedUnit ||
      !selectedUnit.properties ||
      !selectedUnit.properties.tileUnit) {
      return;
    }

    const tileUnit = selectedUnit.properties.tileUnit as TileUnit;

    const { x: startX, y: startY } = tileUnit.tile;
    const { x: endX, y: endY } = cursor;

    const inRange = tileUnit.tilesMove
      .some((tile) => tile.x === endX && tile.y === endY);

    if (!inRange) { return; }

    const {
      tileMovementActive: activeColor,
      tileMovementPassive: passiveColor,
    } = colors;

    // Revert back past movement tiles to their original tint
    tileUnit.tilesPath.map((tile) => {
      // NOTE: moving cursor fast outside reachable
      // movement result in null result.
      if (!tile) { return; }

      tile.tint = passiveColor;
    });

    tileUnit.tilesPath = tileUnit
      .getUnitPath({ startX, startY }, { endX, endY })
      .map(([x, y]) => movement.getTileAt(x, y))
      .map((tile) => {
        // NOTE: moving cursor fast outside reachable
        // movement result in null result.
        if (!tile) { return tile; }

        tile.tint = activeColor;
        return tile;
      });
  }

  /** Recursively add tiles which show attack range. */
  private recursiveFindAtkRange(params: findTilesParams) {
    const { coord: { x, y }, remainingMove } = params;

    const gap = params.gap ? params.gap : 0;

    if (remainingMove === 0) { return; }

    const { layers } = Game.gameMap;

    const layerAtkRange = layers.attackRange;

    // 1.Bounds check
    if (x >= layerAtkRange.tilemap.width ||
      y >= layerAtkRange.tilemap.height ||
      x < 0 || y < 0) {
      return;
    }

    // 2.Collision Environment check
    if (layers.collision.hasTileAt(x, y)) { return; }

    // 3.Avoid tile duplication
    if (!layerAtkRange.hasTileAt(x, y) &&
      !layers.movement.hasTileAt(x, y) &&
      !this.coordGap[`${x},${y}`] &&
      gap < 1) {

      const tileAtkRange = layerAtkRange.putTileAt(2569, x, y);
      tileAtkRange.tint = colors.tileAttack;

      // Alpha will be animated later to show atk range
      tileAtkRange.setAlpha(0);

      this.tilesAtkRange.push(tileAtkRange);
    }

    const newRemainingMove = gap > 0 ? remainingMove : remainingMove - 1;

    const newGap = gap > 0 ? gap - 1 : 0;

    const coordUp = { x, y: y - 1 };
    const coordDown = { x, y: y + 1 };
    const coordLeft = { x: x - 1, y };
    const coordRight = { x: x + 1, y };

    this.recursiveFindAtkRange({ coord: coordUp, remainingMove: newRemainingMove, gap: newGap });
    this.recursiveFindAtkRange({ coord: coordDown, remainingMove: newRemainingMove, gap: newGap });
    this.recursiveFindAtkRange({ coord: coordLeft, remainingMove: newRemainingMove, gap: newGap });
    this.recursiveFindAtkRange({ coord: coordRight, remainingMove: newRemainingMove, gap: newGap });
  }

  /** Recursively mark tiles which should be considered as gap. */
  private recursiveFindGap(param: findTilesParams) {
    const { coord: { x, y }, remainingMove } = param;

    if (remainingMove === 0) { return; }

    const { layers } = Game.gameMap;
    const layerAtkRange = layers.attackRange;

    // 1.Bounds check
    if (x >= layerAtkRange.tilemap.width ||
      y >= layerAtkRange.tilemap.height ||
      x < 0 || y < 0) {
      return;
    }

    // 2.Collision Environment check
    if (layers.collision.hasTileAt(x, y)) { return; }

    // 3.Avoid tile duplication
    if (!this.coordGap[`${x},${y}`]) {
      this.coordGap[`${x},${y}`] = { x, y };
    }

    const newRemainingMove = remainingMove - 1;

    const coordUp = { x, y: y - 1 };
    const coordDown = { x, y: y + 1 };
    const coordLeft = { x: x - 1, y };
    const coordRight = { x: x + 1, y };

    this.recursiveFindGap({ coord: coordUp, remainingMove: newRemainingMove });
    this.recursiveFindGap({ coord: coordDown, remainingMove: newRemainingMove });
    this.recursiveFindGap({ coord: coordLeft, remainingMove: newRemainingMove });
    this.recursiveFindGap({ coord: coordRight, remainingMove: newRemainingMove });
  }

  /** Find the adjacent allowed movement and add the tiles found to a layer and an array. */
  private recursiveFindMovement(params: findTilesParams) {
    const { coord: { x, y }, remainingMove } = params;

    if (remainingMove === 0) { return; }

    const { layers } = Game.gameMap;

    const layerMovement = layers.movement as Phaser.Tilemaps.DynamicTilemapLayer;

    // 1.Bounds check
    if (x >= layerMovement.tilemap.width ||
      y >= layerMovement.tilemap.height ||
      x < 0 || y < 0) {
      return;
    }

    // 2.Collision Environment check
    if (layers.collision.hasTileAt(x, y)) { return; }

    // 3.Collision unit check
    const unit = layers.units.getTileAt(x, y);

    if (unit &&
      unit.x !== this.tile.x &&
      unit.y !== this.tile.y) {
      return;
    }

    // 4.Avoid tile duplication
    if (!layerMovement.hasTileAt(x, y)) {
      const tileMovement = layerMovement.putTileAt(2569, x, y);

      // Alpha will be animated later to show movement
      tileMovement.setAlpha(0);

      this.tilesMove.push(tileMovement);
    }

    const newRemainingMove = remainingMove - 1;

    const coordUp = { x, y: y - 1 };
    const coordDown = { x, y: y + 1 };
    const coordLeft = { x: x - 1, y };
    const coordRight = { x: x + 1, y };

    this.recursiveFindMovement({ coord: coordUp, remainingMove: newRemainingMove });
    this.recursiveFindMovement({ coord: coordDown, remainingMove: newRemainingMove });
    this.recursiveFindMovement({ coord: coordLeft, remainingMove: newRemainingMove });
    this.recursiveFindMovement({ coord: coordRight, remainingMove: newRemainingMove });
  }

  /** Show the allowed movement for the target unit tile. */
  private showMovement() {
    const { tile } = this;
    const move = this.unit.move;

    if (this.tilesMove.length > 0) { return this; }

    const coord = {
      x: tile.x,
      y: tile.y,
    };

    if (!move) {
      return this.addSelfTileMove();
    }

    const remainingMove = move + 1;

    this.recursiveFindMovement({ coord, remainingMove });
    this.fadeInTiles({ tiles: this.tilesMove });

    return this;
  }
}
