import BootScene from './scenes/boot';
import MenuScene from './scenes/menu';
import PlayScene from './scenes/play';

import { Game } from './gameObjects/Game';

Game.instance = new Phaser.Game({
  // See <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
  scale: {
    mode: Phaser.Scale.ENVELOP,
    width: 812,
    height: 812,
  },
  // zoom: 1,
  // resolution: 1,
  type: Phaser.AUTO,
  // parent: null,
  // canvas: null,
  // canvasStyle: null,
  // seed: null,
  title: 'cycles',
  url: 'https://github.com/rootasjey/cycles',
  version: '0.7.0',
  // input: {
  //   keyboard: true,
  //   mouse: true,
  //   touch: true,
  //   gamepad: false
  // },
  // disableContextMenu: false,
  // banner: false
  banner: {
    // hidePhaser: false,
    // text: 'white',
    background: ['#e54661', '#ffa644', '#998a2f', '#2c594f', '#002d40'],
  },
  // fps: {
  //   min: 10,
  //   target: 60,
  //   forceSetTimeout: false,
  // },
  // antialias: false,
  render: {
    // antialias: true,
    pixelArt: true,
    // roundPixels: true,
  },
  // transparent: false,
  // clearBeforeRender: true,
  // backgroundColor: 0x000000, // black
  loader: {
    // baseURL: '',
    path: 'assets/',
    // maxParallelDownloads: 32,
    // crossOrigin: 'anonymous',
    // timeout: 0
  },
  physics: {
    // default: 'arcade',
    // arcade: {
    //   gravity: {
    //     y: 180
    //   }
    // }
    default: false,
  },
  scene: [
    BootScene,
    MenuScene,
    PlayScene,
  ],
});
