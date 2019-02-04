export default class ActionButton extends Phaser.GameObjects.GameObject {
  // ~~~~~~~~~~~~~~~~~
  // PUBLIC PROPERTIES
  // ~~~~~~~~~~~~~~~~~
  public onPointerOver?: () => void;

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE PROPERTIES
  // ~~~~~~~~~~~~~~~~~

  private config = {
    textStyle: { color: 'black', fontFamily: 'Kenney Pixel', fontSize: 30 },
  };

  // @ts-ignore This prop. is correctly initialized in the constructor.
  private container: Phaser.GameObjects.Container;

  private coord: Coord = { x: 0, y: 0 };

  private onClick?: () => void;

  private onPointerOut?: () => void;

  private text: string = '';

  constructor(scene: Phaser.Scene, param: ActionButtonConstrParam) {
    super(scene, 'ActionButton');

    if (!param) { return; }

    const {
      coord,
      onClick,
      onPointerOut,
      onPointerOver,
      text,
    } = param;

    if (coord) {
      this.coord.x = typeof coord.x === 'number' ? coord.x : this.coord.x;
      this.coord.y = typeof coord.y === 'number' ? coord.y : this.coord.y;
    }

    if (onClick) {
      this.onClick = onClick;
    }

    if (onPointerOver) {
      this.onPointerOver = onPointerOver;
    }

    if (onPointerOut) {
      this.onPointerOut = onPointerOut;
    }

    this.text = text ? text : '';

    this.container = this.init();

    this.container.setData('actionButton', this);

    this.once('destroy', () => {
      this.freeMemory();
    });

    this.container.once('destroy', () => {
      this.freeMemory();
    });
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

  private freeMemory() {
    this.container.setData('actionButton', undefined);

    const children = this.container.list;

    const rect = children[0] as Phaser.GameObjects.Rectangle;

    this.container
      .off('pointerover', this.onPointerOverContainer, this, false)
      .off('pointerout', this.onPointerOutContainer, this, false)
      .off('pointerup', this.onPointerUpContainer, this, false);

    rect
      .off('pointerup', this.onClickRect, this, false)
      .off('pointerover', this.onPointerOverRect, this, false)
      .off('pointerout', this.onPointerOutRect, this, false);

    const textValue = children[1] as Phaser.GameObjects.Text;

    rect.destroy();
    textValue.destroy();
    this.container.destroy();

    this.onClick = undefined;
    this.onPointerOut = undefined;
    this.onPointerOver = undefined;
  }

  private init() {
    const { add } = this.scene;
    const { textStyle } = this.config;

    const { x: textX, y: textY } = this.coord;

    const rectX = textX + 35;
    const rectY = textY + 15;

    const text = add.text(textX, textY, this.text, textStyle);

    const rect = add
      .rectangle(rectX, rectY, 92, 30)
      .setFillStyle(0x000000, 0)
      .setInteractive();

    const container = add.container(0, 0, [rect, text]);

    rect
      .on('pointerup', this.onClickRect, this)
      .on('pointerover', this.onPointerOverRect, this)
      .on('pointerout', this.onPointerOutRect, this);

    container
      .on('pointerover', this.onPointerOverContainer, this)
      .on('pointerout', this.onPointerOutContainer, this)
      .on('pointerup', this.onPointerUpContainer, this);

    return container;
  }

  private onPointerOverContainer() {
    this.container.list.map((gameObject) => { gameObject.emit('pointerover'); });
  }

  private onPointerOutContainer() {
    this.container.list.map((gameObject) => { gameObject.emit('pointerout'); });
  }

  private onPointerUpContainer() {
    this.container.list.map((gameObject) => { gameObject.emit('pointerup'); });
    this.container.list.map((gameObject) => { gameObject.emit('pointerout'); });
  }

  private onClickRect() {
    if (!this.onClick) { return; }

    this.onClick();
  }

  private onPointerOverRect() {
    if (!this.onPointerOver) { return; }

    this.onPointerOver();
  }

  private onPointerOutRect() {
    if (!this.onPointerOut) { return; }

    this.onPointerOut();
  }
}
