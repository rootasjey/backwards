import CONST from 'data/const';
const Rectangle = Phaser.Geom.Rectangle;

export const addVisualLoader = (scene) => {
  return Object.assign(scene, {
    createProgressBar() {
      const main = this.cameras.main;
      this.progressBgRect = new Rectangle(0, 0, 0.5 * main.width, 50);
      Rectangle.CenterOn(this.progressBgRect, 0.5 * main.width, 0.5 * main.height);
      this.progressRect = Rectangle.Clone(this.progressBgRect);
      this.progressBar = this.add.graphics();
    },

    onLoadComplete(loader, totalComplete, totalFailed) {
      console.debug('complete', totalComplete);
      console.debug('failed', totalFailed);
      this.progressBar.destroy();
    },

    onLoadProgress(progress) {
      console.debug('progress', progress);
      this.progressRect.width = progress * this.progressBgRect.width;
      this.progressBar
        .clear()
        .fillStyle(CONST.hexColors.darkGray)
        .fillRectShape(this.progressBgRect)
        .fillStyle(this.load.totalFailed ? CONST.hexColors.red : CONST.hexColors.white)
        .fillRectShape(this.progressRect);
    }
  });
};