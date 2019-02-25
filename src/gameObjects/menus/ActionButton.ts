export default class ActionButton extends Phaser.GameObjects.GameObject {
  private config = {
    textStyle: { color: 'black', fontFamily: 'Kenney Pixel', fontSize: 30 },
  };

  // @ts-ignore This prop. is correctly initialized in the constructor.
  private container: Phaser.GameObjects.Container;

  private coord: Coord = { x: 0, y: 0 };

  private height: number;

  private text: string = '';

  private width: number;

  constructor(scene: Phaser.Scene, config: ActionButtonConfig) {
    super(scene, 'ActionButton');

    const {
      coord,
      height,
      text,
      width,
    } = config;

    if (coord) {
      this.coord.x = typeof coord.x === 'number' ? coord.x : this.coord.x;
      this.coord.y = typeof coord.y === 'number' ? coord.y : this.coord.y;
    }

    this.height = height ? height : 30;
    this.width = width ? width : 92;

    this.text = text ? text : '';

    this.container = this.init();

    this.container.setData('actionButton', this);
  }

  // ~~~~~~~~~~~~~~~~~
  // PUBLIC FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  public getContainer() {
    return this.container;
  }

  public addHighlight() {
    const rect = this.container.list[0] as Phaser.GameObjects.Rectangle;
    rect.setFillStyle(0x000000, .2);

    return this;
  }

  public removeHighlight() {
    const rect = this.container.list[0] as Phaser.GameObjects.Rectangle;
    rect.setFillStyle(0x000000, 0);

    return this;
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  private init() {
    const { add } = this.scene;
    const { textStyle } = this.config;

    const { width, height } = this;
    const { x: textX, y: textY } = this.coord;

    const rectX = textX + (width / 2) - 10;
    const rectY = textY + (height / 2);

    const text = add.text(textX, textY, this.text, textStyle);

    const rect = add
      .rectangle(rectX, rectY, width, height)
      .setFillStyle(0x000000, 0)
      .setInteractive();

    const container = add.container(0, 0, [rect, text]);

    rect
      .on('pointerup', this.onClickRect, this)
      .on('pointerover', this.onPointerOverRect, this)
      .on('pointerout', this.onPointerOutRect, this);

    return container;
  }

  private onClickRect() {
    this.emit('click');
  }

  private onPointerOverRect() {
    this.emit('pointerover');
  }

  private onPointerOutRect() {
    this.emit('pointerout');
  }
}
