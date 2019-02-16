import { Game } from './Game';
import TileUnit from './TileUnit';

export default class Turn {
  // ~~~~~~~~~~~~~~~~~
  // PUBLIC PROPERTIES
  // ~~~~~~~~~~~~~~~~~

  /** Current turn number since the beggining of the party. */
  public get turnNumber(): number {
    return this.TURN_NUMBER;
  }

  /** Current active player. */
  public get currentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE PROPERTIES
  // ~~~~~~~~~~~~~~~~~

  private currentPlayerIndex = 0;

  /** All players in the current game. */
  private players: Player[];

  private TURN_NUMBER = 1;

  constructor(param: TurnConstructorParam) {
    const { players } = param;
    this.players = players;
  }

  // ~~~~~~~~~~~~~~~~~
  // PUBLIC FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  /**
   * End the current active player's turn.
   * Start the next player's turn.
   */
  public next() {
    this.markCurrentPlayerUnitsAsPlayed();

    const previousPlayerIndex = this.currentPlayerIndex;
    const nextPlayerIndex = (previousPlayerIndex + 1) % this.players.length;

    this.currentPlayerIndex = nextPlayerIndex;

    this.markCurrentPlayerUnitsAsUnplayed();

    if (this.currentPlayerIndex === 0) {
      this.TURN_NUMBER++;
      // console.debug(`turn: ${this.TURN_NUMBER}`);
    }

    return this;
  }

  /**
   * Start a new serie of turns (representing a party)
   * until the goal is reached or failed.
   */
  public start() {
    this
      .markAllUnitsAsPlayed()
      .markCurrentPlayerUnitsAsUnplayed();

    return this;
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  /**
   * To execute at the beggining of the game.
   * So on the next mark/unmark, only diff processing will be necessary.
   */
  private markAllUnitsAsPlayed() {
    const { units } = Game.gameMap.layers;

    units.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (!tile.properties.tileUnit) { return; }

      const tileUnit = tile.properties.tileUnit as TileUnit;
      tileUnit.markAsPlayed();

    }, undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true });

    return this;
  }

  private markCurrentPlayerUnitsAsPlayed() {
    const { id } = this.players[this.currentPlayerIndex];
    const { units } = Game.gameMap.layers;

    units.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (!tile.properties.tileUnit) { return; }

      const tileUnit = tile.properties.tileUnit as TileUnit;
      const { player } = tileUnit;

      if (player.id !== id) { return; }

      tileUnit.markAsPlayed();

    }, undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true });

    return this;
  }

  private markCurrentPlayerUnitsAsUnplayed() {
    const { id } = this.players[this.currentPlayerIndex];
    const { units } = Game.gameMap.layers;

    units.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (!tile.properties.tileUnit) { return; }

      const tileUnit = tile.properties.tileUnit as TileUnit;
      const { player } = tileUnit;

      if (player.id !== id) { return; }

      tileUnit.markAsUnplayed();

    }, undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true });

    return this;
  }
}
