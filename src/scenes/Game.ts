import GameMap from './components/GameMap';
import MapUI from './components/MapUI';

export class Game {
  public static instance: Phaser.Game;
  public static gameMap: GameMap;
  public static mapUI: MapUI;
}
