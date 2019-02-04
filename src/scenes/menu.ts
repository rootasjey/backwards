import { colors, fonts } from '../const/config';

export default class MenuScene extends Phaser.Scene {

  constructor() {
    super('menu');
  }

  public init(data: any) {
    // console.debug('init', this.scene.key, data, this);
  }

  public create() {
    const sky = this.add.image(400, 300, 'sky');
    sky.alpha = 0.5;

    this.add.text(400, 300, 'START', {
      fill: colors.white,
      fontFamily: fonts.family,
      fontSize: 48,
    })
      .setOrigin(0.5)
      .setShadow(0, 1, colors.aqua, 10);

    this.add.text(400, 450, 'Last Score: ' + this.registry.get('score'), {
      fill: colors.gold,
      fontFamily: fonts.family,
      fontSize: 24,
    })
      .setOrigin(0.5)
      .setShadow(0, 1, colors.black, 5);

    this.input.on('pointerup', this.start, this);
  }

  public start() {
    this.scene.start('default');
  }

}
