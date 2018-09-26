import { addVisualLoader } from './components/visualLoader';

import GameMap from './components/GameMap';
import MapUI from './components/MapUI';

export default class Game extends Phaser.Scene {
  /**
   *  Game scene containing the main game logic
   *
   *  @extends Phaser.Scene
   */
  constructor() {
    super('game');

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
    this.load.image('uiTileset', './level0/ui.png');
    this.load.image('charactersTileset', './level0/characters.png');

    this.load.spritesheet('charactersSheet', './level0/characters.png',
      {
        frameWidth: 16,
        frameHeight: 16,
        spacing: 1
      });

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
    this.gameMap = this.add.existing(new GameMap(this));
    this.gameMap.init();

    this.mapUI = this.add.existing(new MapUI(this));
    this.mapUI.init();
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
  }
}
