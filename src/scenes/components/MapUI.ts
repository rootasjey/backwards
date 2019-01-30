import ActionsMenu from '../../gameObjects/ActionsMenu';
import { Game } from '../Game';

export default class MapUI extends Phaser.GameObjects.GameObject {
  private actionsMenu: ActionsMenu;

  private config: any = {
    textStyle: { fontFamily: 'Kenney Pixel', fontSize: 30 },
  };

  private corners: MapUICorners = {
    topLeft: '',
    topRight: '',
    bottomRight: '',
    bottomLeft: '',
  };

  private cornersXY: MapUICornersXY = {
    topLeft: { x: 1, y: 1 },
    topRight: { x: 21, y: 1 },
    bottomRight: { x: 21, y: 21 },
    bottomLeft: { x: 1, y: 21 },
  };

  private panels: MapUIPanels = {};

  /**
   * Manage UI overlay on in-game maps.
   * @param {Object} scene Phaser's scene
   */
  constructor(scene: Phaser.Scene) {
    super(scene, 'MapUI');

    scene.add.existing(this);
    this.init();

    this.actionsMenu = new ActionsMenu(scene, Game.gameMap.layers.actionsPanel);
  }

  // ~~~~~~~~~~~~~~~~~
  // PUBLIC FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  /**
   * Check if the user cursor overlay a panel UI
   * with a min tile distance allowed between cursor & panel.
   * @param {Object} param0 TileCursor object
   * @param {String} panelName Panel's name to check its position.
   */
  public checkPanelPosition(tile: Phaser.Tilemaps.Tile, panelName: string) {
    const { x, y } = tile;
    const distance = 3;
    const { bounds } = this.panels[panelName];

    const isCloseBottom = Math.abs(y - bounds.bottom) <= distance;
    const isCloseLeft   = Math.abs(x - bounds.left  ) <= distance;
    const isCloseRight  = Math.abs(x - bounds.right ) <= distance;
    const isCloseTop    = Math.abs(y - bounds.top   ) <= distance;

    if (isCloseLeft && isCloseBottom) {
      this.movePanel(panelName);
      return this;
    }

    if (isCloseLeft && isCloseTop) {
      this.movePanel(panelName);
      return this;
    }

    if (isCloseRight && isCloseTop) {
      this.movePanel(panelName);
      return this;
    }

    if (isCloseRight && isCloseBottom) {
      this.movePanel(panelName);
      return this;
    }

    return this;
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  private characterTempMoved(cursor: Phaser.Tilemaps.Tile, character: Phaser.Tilemaps.Tile) {
    this.actionsMenu.show(cursor, character);
  }

  private createCharPanelText() {
    const { add }       = this.scene;
    const { charPanel } = this.panels;
    const { texts }     = charPanel;
    const { left, top } = charPanel.bounds;
    const { textStyle } = this.config;

    let { x, y } = Game.gameMap.layers.charPanel.tileToWorldXY(left, top);

    x += 20;
    y += 10;

    texts.name  = add.text(0, 0, ' hero name ', Object.assign({}, textStyle, { fontSize: 40 }));
    texts.hp    = add.text(0, 50, 'HP ', textStyle);

    charPanel.textsContainer = add
      .container(x, y, [texts.name, texts.hp])
      .setScrollFactor(0);

    return this;
  }

  private createTilePanelText() {
    const { add }       = this.scene;
    const { tilePanel } = this.panels;
    const { texts }     = tilePanel;
    const { left, top } = tilePanel.bounds;
    const { textStyle } = this.config;

    let { x, y } = Game.gameMap.layers.tilePanel.tileToWorldXY(left, top);

    x += 20;
    y += 10;

    texts.name = add.text(0, 0, ' - ', { ...textStyle, ...{ fontSize: 40 }});
    texts.def   = add.text(0, 50, 'DEF. ', textStyle);
    texts.avo   = add.text(0, 70, 'AVO. ', textStyle);

    tilePanel.textsContainer = add
      .container(x, y, [texts.name, texts.def, texts.avo])
      .setScrollFactor(0);

    return this;
  }

  private disableEvents() {
    this.scene.events.off('cursorMoved', this.updatePanels, undefined, false);
    this.scene.events.off('characterTempMoved', this.characterTempMoved, this, false);

    return this;
  }

  private enableEvents() {
    this.scene.events.on('cursorMoved', this.updatePanels);
    this.scene.events.on('characterTempMoved', this.characterTempMoved, this);

    return this;
  }

  /** Find and set a panel top/left/right/bottom boundaries. */
  private findPanelBounds(name: string = '') {
    const bounds = this.getPanelBounds(name);

    const panel = this.panels[name];
    panel.bounds = bounds;

    return this;
  }

  private getPanelBounds(name: string) {
    const bounds = {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    };

    const layer = Game.gameMap.layers[name];

    let tileToFind: Phaser.Tilemaps.Tile;

    // TODO: remove repetition (due to T.S.)
    if (layer === Phaser.Tilemaps.DynamicTilemapLayer.prototype) {
      tileToFind = layer.findTile(
        (tile: Phaser.Tilemaps.Tile) => typeof tile === 'object',
        undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true });

    } else {
      const staticLayer = layer as Phaser.Tilemaps.StaticTilemapLayer;
      tileToFind = staticLayer.findTile(
        (tile: Phaser.Tilemaps.Tile) => typeof tile === 'object',
        undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true });
    }

    if (!tileToFind) { return bounds; }

    const { x, y } = tileToFind;

    bounds.top = y;
    bounds.left = x;

    for (let coordX = x; layer.hasTileAt(coordX, y); coordX++) {
      bounds.right = coordX;
    }

    for (let coordY = y; layer.hasTileAt(x, coordY); coordY++) {
      bounds.bottom = coordY;
    }

    return bounds;
  }

  /**
   * Return the current pointed characters information.
   */
  private getCharPanelValues(tileCursor: Phaser.Tilemaps.Tile): CharPanelStats {
    const { x, y } = tileCursor;
    const layerCharacters = Game.gameMap.layers.characters;

    const defaultValues: CharPanelStats = {
      hp: 0,
      name: '',
    };

    let values = Object.assign({}, defaultValues);

    const tile = layerCharacters.getTileAt(x, y);

    if (tile && tile.properties && tile.properties.tileUnit) {
      const { unit } = tile.properties.tileUnit;

      values = Object.assign({}, values, {
        hp: `HP ${ unit.hp } / ${ unit.fullHP }`,
        name: tile.properties.unitName,
      });
    }

    return values;
  }

  /** Return the panels' name to create. */
  private getPanelsNames(): string[] {
    return ['tilePanel', 'charPanel'];
  }

  /** Return the next empty corner name. */
  private getNextEmptyCornerName(): string {
    let nextCorner: string = '';

    Object.keys(this.corners)
      .some((key) => {
        if (!this.corners[key]) {
          nextCorner = key;
          return true;
        }

        return false;
      });

    return nextCorner;
  }

  /** Get the next empty corner coordinates. */
  private getNextEmptyCornerXY(nextCorner: string = ''): Coord {
    return this.cornersXY[nextCorner];
  }

  /** Return the current highlighted tile information. */
  private getTilePanelValues(tileCursor: Phaser.Tilemaps.Tile) {
    const { layers } = Game.gameMap;
    const { x, y } = tileCursor;

    const defaultValues = {
      name: ' - ',
      avo: 0,
      def: 0,
    };

    let values = Object.assign({}, defaultValues);

    let tile: Phaser.Tilemaps.Tile = layers.floor.getTileAt(x, y);

    if (layers.objects.hasTileAt(x, y)) {
      tile = layers.objects.getTileAt(x, y);

    } else if (layers.hiddenFloor.hasTileAt(x, y)) {
      tile = layers.hiddenFloor.getTileAt(x, y);

    } else if (layers.carpet.hasTileAt(x, y)) {
      tile = layers.carpet.getTileAt(x, y);

    }

    if (tile) {
      const { properties } = tile;
      values = Object.assign({}, values, properties);
    }

    return Object.assign(values, {
      avo: `AVO.    ${values.avo}`,
      def: `DEF.    ${values.def}`,
    });
  }

  /** Create UI panels. */
  private init() {
    this
      .getPanelsNames()
      .map((name) => {
        this
          .initProperties(name)
          .findPanelBounds(name);
      });

    this
      .createCharPanelText()
      .createTilePanelText()
      .listenToEvents()
      .setAutoCorners()
      .toggleCharPanel()
      .getPanelsNames()
      .map((name) => this.movePanel(name));

    return this;
  }

  /** Create panel's properties. */
  private initProperties(panelName: string) {
    this.panels[panelName] = {
      bounds: {
        top     : 0,
        bottom  : 0,
        left    : 0,
        right   : 0,
      },
      texts     : {},
    };

    return this;
  }

  private listenToEvents() {
    const { events } = this.scene;

    events.on('subscribeMapUIEvents', this.enableEvents);
    events.on('unsubscribeMapUIEvents', this.disableEvents);

    this.enableEvents();

    return this;
  }

  /**
   * Move a panel from its current position to an empty one.
   * This happens when user cursor (almost) overlay panel UI.
   * @param {String} name Panel's name to move.
   */
  private movePanel(name: string = '') {
    const panel = this.panels[name];
    const panelLayer = Game.gameMap.layers[name] as Phaser.Tilemaps.DynamicTilemapLayer;

    if (!panelLayer) { return this; }

    const { bounds } = panel;

    const nextCorner = this.getNextEmptyCornerName();
    const { x, y } = this.getNextEmptyCornerXY(nextCorner);

    this.updateCorner(name, nextCorner);

    // Copy panel to a new position
    panelLayer.copy(
      bounds.left,
      bounds.top,
      bounds.right - bounds.left + 1,
      bounds.bottom - bounds.top + 1,
      x,
      y);

    // Remove old panel position
    panelLayer.forEachTile((tile) => {
      panelLayer.removeTileAt(tile.x, tile.y);
    }, undefined,
    bounds.left,
    bounds.top,
    bounds.right - bounds.left + 1,
    bounds.bottom - bounds.top + 1);

    this.findPanelBounds(name);

    const { x: textX, y: textY } = panelLayer.tileToWorldXY(x, y);

    this.updatePanelTextPosition({ x: textX, y: textY }, name);

    return this;
  }

  /** Set predefined corners according to window dimentions. */
  private setAutoCorners() {
    const { cornersXY } = this;
    const { innerHeight: height, innerWidth: width } = window;

    const rightX = width - 200;
    const bottomY = height - 140;

    const { x, y } = Game.gameMap.map.worldToTileXY(rightX, bottomY);

    cornersXY.topRight.x    = x;
    cornersXY.bottomLeft.y  = y;
    cornersXY.bottomRight.x = x;
    cornersXY.bottomRight.y = y;

    return this;
  }

  /**
   * Set new text value to targeted panel.
   * @param {String} name Panel's name.
   * @param {Object} values Key-value pairs to set.
   */
  private setTextPanel(name: string = '', values: object = {}) {
    const panel = this.panels[name];

    Object
      .entries(values)
      .forEach(([key, value]) => {
        panel.texts[key].setText(value);
      });

    return this;
  }

  /**
   * Show a chararacter's stats if the cursor is on a char.
   * If not, hide the panel.
   * @param {CharPanelStats} charStats Character's stats.
   */
  private toggleCharPanel(charStats?: CharPanelStats) {
    const { charPanel } = Game.gameMap.layers;
    const { textsContainer } = this.panels.charPanel;

    if (!textsContainer) { return this; }

    if (!charStats || charStats.name.length === 0) {
      if (charPanel.visible) { charPanel.setVisible(false); }
      if (textsContainer.visible) { textsContainer.setVisible(false); }

      return this;
    }

    if (!charPanel.visible || !textsContainer.visible) {
      charPanel.setVisible(true);
      textsContainer.setVisible(true);

      return this;
    }

    if (charPanel.visible || textsContainer.visible) {
      charPanel.setVisible(false);
      textsContainer.setVisible(false);
    }

    return this;
  }

  /**
   * Update char panel with refreshed texts values.
   * @param {Object} tileCursor Phaser tile object representing user cursor.
   */
  private updateCharPanel(tileCursor: Phaser.Tilemaps.Tile) {
    const charPanel = 'charPanel';
    const charValues = this.getCharPanelValues(tileCursor);

    if (charValues.name.length === 0) {
      this.toggleCharPanel(charValues);
      return this;
    }

    this
      .setTextPanel(charPanel, charValues)
      .checkPanelPosition(tileCursor, charPanel)
      .toggleCharPanel(charValues);

    return this;
  }

  /**
   * Set a new corner to the targeted panel.
   * @param {String} name Panel's name to update the corner.
   * @param {String} newCorner New corner's name.
   */
  private updateCorner(name: string = '', newCorner: string = '') {
    // Empty last corner
    Object
      .entries(this.corners)
      .some(([key, value]) => {
        if (value === name) {
          this.corners[key] = '';
          return true;
        }

        return false;
      });

    // Update new corner
    this.corners[newCorner] = name;

    return this;
  }

  /**
   * React to user inputs -> cursor moved.
   * @param {Phaser.Tilemaps.Tile} tileCursor Phaser tile object representing user cursor.
   */
  private updatePanels(tileCursor: Phaser.Tilemaps.Tile) {
    Game.mapUI.updateTilePanel(tileCursor);
    Game.mapUI.updateCharPanel(tileCursor);

    return this;
  }

  /**
   * Move text's panel when the panel has moved.
   * Take camera scroll into account.
   * @param {Object} param0 X/Y coordinates
   * @param {String} name Panel's name.
   */
  private updatePanelTextPosition({ x = 0, y = 0 }, name = '') {
    x = x + 20 - this.scene.cameras.main.scrollX;
    y = y + 10 - this.scene.cameras.main.scrollY;

    const { textsContainer } = this.panels[name];

    if (!textsContainer) { return this; }

    textsContainer.setPosition(x, y);

    return this;
  }

  /**
   * Update tile panel with refreshed texts values.
   * @param {Object} tileCursor Phaser tile object representing user cursor.
   */
  private updateTilePanel(tileCursor: Phaser.Tilemaps.Tile) {
    const tilePanel = 'tilePanel';
    const tileValues = this.getTilePanelValues(tileCursor);

    this
      .setTextPanel(tilePanel, tileValues)
      .checkPanelPosition(tileCursor, tilePanel);

    return this;
  }
}
