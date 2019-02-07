import { Game }         from '../gameObjects/Game';
import GameMap          from '../gameObjects/GameMap';
import MapUI            from '../gameObjects/MapUI';
import { VisualLoader } from '../gameObjects/VisualLoader';

export default class Play extends Phaser.Scene {
  private visualLoader: VisualLoader;

  /**
   *  Game scene containing the main game logic
   *  @extends Phaser.Scene
   */
  constructor() {
    super('game');

    this.visualLoader = new VisualLoader(this);
  }

  public preload() {
    this.load.on('progress', this.visualLoader.onLoadProgress, this);
    this.load.on('complete', this.visualLoader.onLoadComplete, this);

    this.visualLoader.createProgressBar();

    this.load.json('consummables', './data/consumables.json');
    this.load.json('heroes', './data/heroes.json');
    this.load.json('units', './data/unitsClasses.json');
    this.load.json('weapons', './data/weapons.json');

    this.load.image('mapTileset', './level0/terrain.png');
    this.load.image('uiTileset', './level0/ui.png');
    this.load.image('unitsTileset', './level0/units.png');

    this.load.spritesheet('unitsSpriteSheet', './level0/units.png',
      {
        frameWidth: 16,
        frameHeight: 16,
        spacing: 1,
      });

    this.load.tilemapTiledJSON('level0', './level0/level0.json');
  }

  public init() {
    this.addFonts();
  }

  public addFonts() {
    const styleElement = document.createElement('style');

    if (!document.head) { return; }

    document.head.appendChild(styleElement);
    styleElement.classList.add('toto');

    const sheet = styleElement.sheet as CSSStyleSheet;
    const styles = '@font-face { font-family: "Kenney Pixel";' +
      'src: url("assets/fonts/Kenney Pixel.ttf") format("truetype") }';

    if (!sheet) { return; }

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
  public create(/* data */) {
    Game.gameMap = new GameMap(this);
    Game.mapUI = new MapUI(this);

    this.setCameraBorders();
  }

  public setCameraBorders() {
    const { displayHeight, displayWidth } = Game.gameMap.layers.floor;
    this.cameras.main.setBounds(0, 0, displayHeight + 60, displayWidth + 60);
  }

  /**
   *  Called when a scene is updated. Updates to game logic, physics and game
   *  objects are handled here.
   *
   *  @protected
   *  @param {number} t Current internal clock time.
   *  @param {number} dt Time elapsed since last update.
   */
  // public update(/* t, dt */) {
  // }
}
