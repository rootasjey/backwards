import GameMap        from './GameMap';
import MapUI          from './MapUI';
import Turn           from './Turn';
import TurnVisualizer from './TurnVisualizer';

export class Game {
  public static instance: Phaser.Game;
  public static gameMap: GameMap;
  public static mapUI: MapUI;
  public static turn: Turn;
  public static turnVisualizer: TurnVisualizer;
}
