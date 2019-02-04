import 'phaser';
import { hexColors } from '../const/config';

const Rectangle = Phaser.Geom.Rectangle;

export default class BootScene extends Phaser.Scene {

  private progressBar?: Phaser.GameObjects.Graphics;
  private progressBgRect?: Phaser.Geom.Rectangle;
  private progressRect?: Phaser.Geom.Rectangle;

  constructor() {
    super('boot');
  }

  public preload() {
    this.load.on('progress', this.onLoadProgress, this);
    this.load.on('complete', this.onLoadComplete, this);
    this.createProgressBar();
  }

  public create() {
    // this.registry.set('score', 0);
    // this.scene.start('menu');
    this.scene.start('game');
  }

  // extend:

  public createProgressBar() {
    const main = this.cameras.main;
    this.progressBgRect = new Rectangle(0, 0, 0.5 * main.width, 50);
    Rectangle.CenterOn(this.progressBgRect, 0.5 * main.width, 0.5 * main.height);
    this.progressRect = Rectangle.Clone(this.progressBgRect);
    this.progressBar = this.add.graphics();
  }

  public onLoadComplete(loader: any, totalComplete: number, totalFailed: number) {
    // console.debug('complete', totalComplete);
    // console.debug('failed', totalFailed);
    if (!this.progressBar) { return; }
    this.progressBar.destroy();
  }

  public onLoadProgress(progress: number) {
    // console.debug('progress', progress);
    if (!this.progressBar ||
        !this.progressBgRect ||
        !this.progressRect) { return; }

    const { darkGray, red, white } = hexColors;

    this.progressRect.width = progress * this.progressBgRect.width;
    this.progressBar
      .clear()
      .fillStyle(darkGray)
      .fillRectShape(this.progressBgRect)
      .fillStyle(this.load.totalFailed ? red : white)
      .fillRectShape(this.progressRect);
  }
}
