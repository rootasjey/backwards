import ActionButton from './ActionButton';

export default abstract class ActionsMenu extends Phaser.GameObjects.GameObject {
  // ~~~~~~~~~~~~~~~~~
  // PROTECTED PROPERTIES
  // ~~~~~~~~~~~~~~~~~

  protected linesTiles = {
    top     : [2668, 2669, 2669, 2670],
    middle  : [2698, 2699, 2699, 2700],
    bottom  : [2728, 2729, 2729, 2730],
  };

  /** Unit tile (facultative). */
  protected tile?: Phaser.Tilemaps.Tile;

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE PROPERTIES
  // ~~~~~~~~~~~~~~~~~

  private additionalButtons?: Phaser.GameObjects.Container;

  /** All curent buttons displayed in the menu. */
  private allCurrentButtons: Phaser.GameObjects.Container[] = [];

  /** Number of buttons currently displayed in the actions menu. */
  private buttonsCount = 0;

  private textOffset = { x: 18, y: 10 };

  /** Keyboard cursor (for navigating buttons with keyboard arrows) */
  private cursorIndex = 0;

  /** Layer where to create menu. */
  private layer: Phaser.Tilemaps.DynamicTilemapLayer;

  /** Always displayed buttons. */
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
      .destroyAdditionalButtons()
      .disableEvents()
      .removeOverEventButtons()
      .enableMapEvents()
      .reinitializeProperties();

    return this;
  }

  /** Return true if actions' menu is visible. False otherwise. */
  public isVisible() {
    return this.layer.visible;
  }

  /** Show actions' menu. */
  public show(cursor: Phaser.Tilemaps.Tile, options?: ActionsMenuShowOptions) {
    if (options) {
      const { tile } = options;
      this.tile = tile;
    }

    this.layer.setVisible(true);

    let containerButtons = this.permanentButtons.list as Phaser.GameObjects.Container[];

    this.additionalButtons = this.createAdditionalButtons();

    if (this.additionalButtons) {
      const containerAddButtons = this.additionalButtons.list as Phaser.GameObjects.Container[];
      containerButtons = containerButtons.concat(containerAddButtons);
    }

    this.allCurrentButtons = containerButtons;

    this.buttonsCount = containerButtons.length;

    const { x, y } = this.getMenuCoord(cursor);
    const { layer } = this;

    this
      .disableMapEvents()
      .createContainer({ coord: { x, y }, itemsCount: this.buttonsCount })
      .showButtons(layer.tileToWorldXY(x, y))
      .highlightFirstButton()
      .enableEvents();
  }

  // ~~~~~~~~~~~~~~~~~
  // PROTECTED FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  protected abstract createAdditionalButtons(): Phaser.GameObjects.Container;

  protected abstract createPermanentButtons(): Phaser.GameObjects.Container;

  protected onPointerUpOutside(event: Phaser.Events.EventEmitter) {
    this.hide();
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  private addOverEventButtons() {
    this.allCurrentButtons
      .map((button, index) => {
        const actionButton = button.getData('actionButton') as ActionButton;

        actionButton.onPointerOver = () => { this.cursorIndexChanged(index); };
      });

    return this;
  }

  private createContainer(param: CreateContainerParam) {
    const { coord: { x, y }, itemsCount } = param;

    this.createTopLine(x, y);

    for (let index = 0; index < itemsCount; index++) {
      this.createMiddleLine(x, y + index + 1);
    }

    this.createBottomLine(x, y + itemsCount);

    return this;
  }

  private createTopLine(x: number, y: number) {
    const columns = this.linesTiles.top;

    columns
      .map((value, index) => {
        this.layer.putTileAt(value, x + index, y);
      });
  }

  private createMiddleLine(x: number, y: number) {
    const columns = this.linesTiles.middle;

    columns
      .map((value, index) => {
        this.layer.putTileAt(value, x + index, y);
      });
  }

  private createBottomLine(x: number, y: number) {
    const columns = this.linesTiles.bottom;

    columns
      .map((value, index) => {
        this.layer.putTileAt(value, x + index, y);
      });
  }

  private cursorIndexChanged(newIndex: number) {
    if (this.cursorIndex === newIndex) { return; }

    const previousButtonOvered = this.allCurrentButtons[this.cursorIndex];

    const prevActionButton = previousButtonOvered.getData('actionButton') as ActionButton;
    prevActionButton.removeHighlight();

    this.cursorIndex = newIndex;

    const buttonOvered = this.allCurrentButtons[this.cursorIndex];

    const actionButton = buttonOvered.getData('actionButton') as ActionButton;
    actionButton.addHighlight();
  }

  private destroyAdditionalButtons() {
    if (!this.additionalButtons) { return this; }

    const children = this.additionalButtons.list as Phaser.GameObjects.Container[];

    children
      .map((button) => {
        button.destroy();
      });

    return this;
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

    input.keyboard.off('keydown-UP', this.onKeydownUP, this);
    input.keyboard.off('keydown-DOWN', this.onKeydownDOWN, this);
    input.keyboard.off('keydown-ENTER', this.onKeydownENTER, this);

    input.off('pointerup', this.onPointerUpOutside, this);

    return this;
  }

  private disableMapEvents() {
    this.scene.events.emit('unsubscribeMapEvents');
    return this;
  }

  private enableEvents() {
    const { input } = this.scene;

    input.keyboard.on('keydown-UP', this.onKeydownUP, this);
    input.keyboard.on('keydown-DOWN', this.onKeydownDOWN, this);
    input.keyboard.on('keydown-ENTER', this.onKeydownENTER, this);

    input.on('pointerup', this.onPointerUpOutside, this);

    return this;
  }

  private enableMapEvents() {
    // NOTE: pointerup fires too soon after re-enabling GameMap events.
    setTimeout(() => {
      this.scene.events.emit('subscribeMapEvents');
    }, 10);

    return this;
  }

  private getMenuCoord(cursor: Phaser.Tilemaps.Tile) {
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;

    const panelTilesWidth = this.getPanelWidth();
    const panelTilesHeight = this.buttonsCount + 2;

    let tileX = cursor.x + 1;
    let tileY = cursor.y + 1;

    const cursorPixels = cursor.tilemap.tileToWorldXY(tileX, tileY);
    const windowPixels = new Phaser.Math.Vector2(windowWidth, windowHeight);

    const panelPixelsWidth = cursor.width * panelTilesWidth;
    const panelPixelsHeight = cursor.height * panelTilesHeight;

    // NOTE: too handy with the right edge.
    if (cursorPixels.x + panelPixelsWidth + 42 > windowPixels.x) {
      tileX = tileX - (panelTilesWidth + 1);
    }

    if (cursorPixels.y + panelPixelsHeight > windowPixels.y) {
      tileY = tileY - panelTilesHeight;
    }

    return { x: tileX, y: tileY };
  }

  private getPanelWidth() {
    let maxTilesWidth = 0;

    for (const [, columns] of Object.entries(this.linesTiles)) {
      maxTilesWidth = columns.length > maxTilesWidth ? columns.length : maxTilesWidth;
    }

    return maxTilesWidth;
  }

  private highlightFirstButton() {
    const firstButton = this.allCurrentButtons[0];

    if (!firstButton) { return this; }

    const firstActionButton = firstButton.getData('actionButton') as ActionButton;
    firstActionButton.addHighlight();

    return this;
  }

  private onKeydownDOWN() {
    const newIndex = (this.cursorIndex + 1) % this.buttonsCount;

    this.cursorIndexChanged(newIndex);
  }

  private onKeydownENTER() {
    const buttonOver = this.allCurrentButtons[this.cursorIndex];

    const actionButton = buttonOver.getData('actionButton') as ActionButton;
    actionButton.removeHighlight();

    buttonOver.emit('pointerup');
  }

  private onKeydownUP() {
    const previousIndex = this.cursorIndex - 1;
    const newIndex = previousIndex < 0 ? this.buttonsCount - 1 : previousIndex;

    this.cursorIndexChanged(newIndex);
  }

  private reinitializeProperties() {
    this.buttonsCount = 0;
    this.allCurrentButtons = [];

    // IDEA: Remember the last selected entry
    this.cursorIndex = 0;

    return this;
  }

  /** Show buttons to the cursor location. */
  private showButtons(coord: Coord) {
    const { textOffset } = this;
    const x = coord.x + textOffset.x;
    const y = coord.y + textOffset.y;

    this.permanentButtons
      .setVisible(true)
      .setPosition(x, y);

    if (this.additionalButtons) {
      this.additionalButtons
        .setPosition(x, y + this.permanentButtons.displayHeight);
    }

    this.addOverEventButtons();

    return this;
  }

  private removeOverEventButtons() {
    this.allCurrentButtons
      .map((button) => {
        const actionButton = button.getData('actionButton') as ActionButton;
        if (!actionButton) { return; }

        actionButton.removeHighlight();
        actionButton.onPointerOver = undefined;
      });

    return this;
  }

}
