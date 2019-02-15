import GameMap  from './GameMap';
import MapUI    from './MapUI';
import Turn from './Turn';

export class Game {
  public static instance: Phaser.Game;
  public static gameMap: GameMap;
  public static mapUI: MapUI;
  public static turn: Turn;
}
