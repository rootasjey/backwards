import ActionButton from './ActionButton';

export default class ActionsMenu extends Phaser.GameObjects.GameObject {
  private additionalButtons?: Phaser.GameObjects.Container;

  /** All curent buttons displayed in the menu. */
  private allCurrentButtons: Phaser.GameObjects.Container[] = [];

  /** Number of buttons currently displayed in the actions menu. */
  private buttonsCount = 0;

  private config = {
    textStyle: { fontFamily: 'Kenney Pixel', fontSize: 30 },
    textOffset: { x: 18, y: 10 },
  };

  /** Keyboard cursor (for navigating buttons with keyboard arrows) */
  private cursorIndex = 0;

  /** Actions menu belonging layer. */
  private layer: Phaser.Tilemaps.DynamicTilemapLayer;

  /** Minimum number of buttons in action menu (cancel, wait, items). */
  private minButtonsCount = 3;

  private minTilesWidth = 4;

  /** Always displayed buttons (cancel, wait, items) */
  private permanentButtons: Phaser.GameObjects.Container;

  /**
   * Create an actions menu to perform unit's actions.
   * @param scene The current scene where the menu must be created.
   * @param layer The tilemap layer where the menu must be created.
   */
  constructor(scene: Phaser.Scene, layer: Phaser.Tilemaps.DynamicTilemapLayer) {
    super(scene, 'ActionsMenu');
    scene.add.existing(this);

    this.layer = layer;

    this.permanentButtons = this.createPermanentButtons();

    this.layer.setVisible(false);
    this.permanentButtons.setVisible(false);
  }

  // ~~~~~~~~~~~~~~~~~
  // PUBLIC FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  /** Hide actions' menu. */
  public hide() {
    this.layer.setVisible(false);
    this.permanentButtons.setVisible(false);

    this
      .destroyContainer()
      .disableEvents()
      .enableMapEvents()
      .reinitializeProperties();
  }

  /** Return true if actions' menu is visible. False otherwise. */
  public isVisible() {
    return this.layer.visible;
  }

  /** Show actions' menu. */
  public show(cursor: Phaser.Tilemaps.Tile, character: Phaser.Tilemaps.Tile) {
    this.layer.setVisible(true);

    const { x, y } = this.getMenuCoord(cursor);
    const { layer } = this;

    this.buttonsCount = this.minButtonsCount; // + unit's actions
    const { buttonsCount: itemsCount } = this;

    this
      .disableMapEvents()
      .createContainer({ coord: { x, y }, itemsCount })
      .showButtons(layer.tileToWorldXY(x, y))
      .highlightFirstButton()
      .enableEvents();
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  private createContainer(param: CreateContainerParam) {
    const { coord: { x, y }, itemsCount } = param;
    const middleLineCount = Math.max(0, itemsCount - 2);

    let bottomY = y + middleLineCount;

    this.createTopLine(x, y);

    for (let index = 0; index < itemsCount; index++) {
      this.createMiddleLine(x, y + index + 1);
      bottomY++;
    }

    this.createBottomLine(x, bottomY);

    return this;
  }

  private createTopLine(x: number, y: number) {
    // : 2668 - middle: 2669 - right: 2670
    const model = [2668, 2669, 2669, 2670];

    model
      .map((value, index) => {
        this.layer.putTileAt(value, x + index, y);
      });
  }

  private createMiddleLine(x: number, y: number) {
    // left: 2698 - middle: 2699 - right: 2700
    const model = [2698, 2699, 2699, 2700];

    model
      .map((value, index) => {
        this.layer.putTileAt(value, x + index, y);
      });
  }

  private createBottomLine(x: number, y: number) {
    // left: 2728 - middle: 2729 - ight: 2730
    const model = [2728, 2729, 2729, 2730];

    model
      .map((value, index) => {
        this.layer.putTileAt(value, x + index, y);
      });
  }

  private createPermanentButtons() {
    const cancel = this.createCancelButton();
    const items = this.createItemsButton();
    const wait = this.createWaitButton();

    const container = this.scene.add
      .container(0, 0, [cancel, wait, items])
      .setVisible(false);

    return container;
  }

  private createCancelButton() {
    const button = new ActionButton(this.scene, {
      onClick: () => { this.hide(); },
      text: 'cancel',
    });

    return button.getContainer();
  }

  private createItemsButton() {
    const button = new ActionButton(this.scene, {
      coord: { x: 0, y: 60 },
      onClick: () => { this.hide(); },
      text: 'items',
    });

    return button.getContainer();
  }

  private createWaitButton() {
    const button = new ActionButton(this.scene, {
      coord: { x: 0, y: 30 },
      onClick: () => { this.hide(); },
      text: 'wait',
    });

    return button.getContainer();
  }

  private destroyContainer() {
    this.layer.forEachTile((tile) => {
      this.layer.removeTileAt(tile.x, tile.y);
      tile.destroy();

    }, undefined, undefined, undefined,
      undefined, undefined, { isNotEmpty: true });

    return this;
  }

  private disableEvents() {
    const { input } = this.scene;

    input.keyboard.off('keydown_UP', this.keydownUP, this, false);
    input.keyboard.off('keydown_DOWN', this.keydownDOWN, this, false);
    input.keyboard.off('keydown_ENTER', this.keydownENTER, this, false);

    return this;
  }

  private disableMapEvents() {
    this.scene.events.emit('unsubscribeMapEvents');
    return this;
  }

  private enableEvents() {
    const { input } = this.scene;

    input.keyboard.on('keydown_UP', this.keydownUP, this);
    input.keyboard.on('keydown_DOWN', this.keydownDOWN, this);
    input.keyboard.on('keydown_ENTER', this.keydownENTER, this);

    return this;
  }

  private enableMapEvents() {
    // NOTE: pointerup fires too soon after re-enabling GameMap events.
    setTimeout(() => {
      this.scene.events.emit('subscribeMapEvents');
    }, 100);

    return this;
  }

  private getMenuCoord(cursor: Phaser.Tilemaps.Tile) {
    const panelWidth = this.minTilesWidth;
    const panelHeight = this.minButtonsCount + 2;

    let x = cursor.x + 1;
    let y = cursor.y + 1;

    if ((x + panelWidth) > this.layer.tilemap.width) {
      x = x - (panelWidth + 1);
    }

    if ((y + panelHeight) > this.layer.tilemap.height) {
      y = y - panelHeight;
    }

    return { x, y };
  }

  private highlightFirstButton() {
    const firstButton = this.allCurrentButtons[0];
    firstButton.emit('pointerover');

    return this;
  }

  private keydownDOWN() {
    const previousButtonOvered = this.allCurrentButtons[this.cursorIndex];
    previousButtonOvered.emit('pointerout');

    const cursor = this.cursorIndex + 1;
    this.cursorIndex = cursor % this.buttonsCount;

    const buttonOvered = this.allCurrentButtons[this.cursorIndex];

    buttonOvered.emit('pointerover');
  }

  private keydownENTER() {
    const buttonOver = this.allCurrentButtons[this.cursorIndex];
    buttonOver.emit('pointerup');

    this.hide();
  }

  private keydownUP() {
    const previousButtonOvered = this.allCurrentButtons[this.cursorIndex];
    previousButtonOvered.emit('pointerout');

    const cursor = this.cursorIndex - 1;
    this.cursorIndex = cursor < 0 ? this.buttonsCount - 1 : cursor;

    const buttonOvered = this.allCurrentButtons[this.cursorIndex];

    buttonOvered.emit('pointerover');
  }

  private reinitializeProperties() {
    this.buttonsCount = 0;
    this.allCurrentButtons = [];

    // IDEA: Remember the last selected entry
    this.cursorIndex = 0;
  }

  /** Show buttons to the cursor location. */
  private showButtons(coord: Coord) {
    const { textOffset } = this.config;
    const x = coord.x + textOffset.x;
    const y = coord.y + textOffset.y;

    this.permanentButtons
      .setVisible(true)
      .setPosition(x, y);

    this.allCurrentButtons = this.permanentButtons.list as Phaser.GameObjects.Container[];

    return this;
  }

}
