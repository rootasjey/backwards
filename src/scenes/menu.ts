import CONST from '../data/const';

export default class MenuScene extends Phaser.Scene {

  constructor() {
    super('menu');
  }

  public init(data: any) {
    console.debug('init', this.scene.key, data, this);
  }

  public create() {
    const sky = this.add.image(400, 300, 'sky');
    sky.alpha = 0.5;

    this.add.text(400, 300, 'START', {
      fill: CONST.colors.white,
      fontFamily: CONST.fonts.default,
      fontSize: 48
    })
      .setOrigin(0.5)
      .setShadow(0, 1, CONST.colors.aqua, 10);

    this.add.text(400, 450, 'Last Score: ' + this.registry.get('score'), {
      fill: CONST.colors.gold,
      fontFamily: CONST.fonts.default,
      fontSize: 24
    })
      .setOrigin(0.5)
      .setShadow(0, 1, CONST.colors.black, 5);

    this.input.on('pointerup', this.start, this);
  }

  public start() {
    this.scene.start('default');
  }

}
