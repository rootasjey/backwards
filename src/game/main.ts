import Phaser from 'phaser';

import BootScene from '../scenes/boot';
import MenuScene from '../scenes/menu';
import PlayScene from '../scenes/play';

import { Game } from '../gameObjects/Game';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  // See <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
  scale: {
    mode: Phaser.Scale.NONE,
    width: 812,
    height: 812,
  },
  type: Phaser.AUTO,
  title: 'Backwards',
  version: '0.10.0',
  url: 'https://github.com/rootasjey/backwards',
  banner: {
    background: ['#e54661', '#ffa644', '#998a2f', '#2c594f', '#002d40'],
  },
  render: {
    pixelArt: true,
  },
  loader: {
    path: 'assets/',
  },
  physics: {
    // default: false,
  },
  scene: [
    BootScene,
    MenuScene,
    PlayScene,
  ],
};

const StartGame = (parent: string) => {
  Game.instance = new Phaser.Game({
    ...config,
    parent
  });
  
  return Game.instance;
};

export default StartGame;
