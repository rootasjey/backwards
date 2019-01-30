export default class ActionButton extends Phaser.GameObjects.GameObject {
  private config = {
    textStyle: { color: 'black', fontFamily: 'Kenney Pixel', fontSize: 30 },
  };

  // @ts-ignore This prop. is correctly initialized in the constructor.
  private container: Phaser.GameObjects.Container;

  private coord: Coord = { x: 0, y: 0 };

  private onClick?: () => void;

  private text: string = '';

  constructor(scene: Phaser.Scene, param: ActionButtonConstrParam) {
    super(scene, 'ActionButton');

    if (!param) { return; }

    const { coord, onClick, text } = param;

    if (coord) {
      this.coord.x = typeof coord.x === 'number' ? coord.x : this.coord.x;
      this.coord.y = typeof coord.y === 'number' ? coord.y : this.coord.y;
    }

    if (onClick) {
      this.onClick = onClick;
    }

    this.text = text ? text : '';

    this.container = this.init();
  }

  public getContainer() {
    return this.container;
  }

  private init() {
    const { add } = this.scene;
    const { textStyle } = this.config;

    const { x: textX, y: textY } = this.coord;

    const rectX = textX + 35;
    const rectY = textY + 15;

    const cancel = add.text(textX, textY, this.text, textStyle);

    const rect = add
      .rectangle(rectX, rectY, 92, 30)
      .setFillStyle(0x000000, 0)
      .setInteractive();

    rect
      .on('pointerup', () => {
        if (this.onClick) {
          this.onClick();
        }
      })
      .on('pointerover', () => {
        rect.setFillStyle(0x000000, .2);
      })
      .on('pointerout', () => {
        rect.setFillStyle(0x000000, 0);
      });

    const container = add.container(0, 0, [rect, cancel]);

    container.on('pointerover', () => {
      container.list.map((gameObject) => { gameObject.emit('pointerover'); });
    });

    container.on('pointerout', () => {
      container.list.map((gameObject) => { gameObject.emit('pointerout'); });
    });

    container.on('pointerup', () => {
      container.list.map((gameObject) => { gameObject.emit('pointerup'); });
      container.list.map((gameObject) => { gameObject.emit('pointerout'); });
    });

    return container;
  }
}
