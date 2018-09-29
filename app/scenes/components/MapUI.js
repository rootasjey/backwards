export default class MapUI extends Phaser.GameObjects.GameObject {
  /**
   * Manage UI overlay on in-game maps.
   * @param {Object} scene Phaser's scene
   */
  constructor(scene) {
    super(scene, 'MapUI');

    this.config = {
      textStyle: { fontFamily: 'Kenney Pixel', fontSize: 30 }
    };

    this.corners = {
      topLeft     : '',
      topRight    : '',
      bottomRight : '',
      bottomLeft  : '',
    };

    this.cornersXY = {
      topLeft     : { x: 1,   y: 1  },
      topRight    : { x: 21,  y: 1  },
      bottomRight : { x: 21,  y: 21 },
      bottomLeft  : { x: 1,   y: 21 },
    };

    this.panels = {};
  }

  /**
   * Check if the user cursor overlay a panel UI
   * with a min tile distance allowed between cursor & panel.
   * @param {Object} param0 TileCursor object
   * @param {String} panelName Panel's name to check its position.
   */
  checkPanelPosition({ x, y }, panelName) {
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

  createCharPanelText() {
    const { add, gameMap }  = this.scene;
    const { charPanel }     = this.panels;
    const { texts }         = charPanel;
    const { left, top }     = charPanel.bounds;
    const { textStyle }     = this.config;

    let { x, y } = gameMap.layers.charPanel.tileToWorldXY(left, top);

    x += 20;
    y += 10;

    texts.name  = add.text(0, 0, ' hero name ', Object.assign({}, textStyle, { fontSize: 40 }));
    texts.hp    = add.text(0, 50, 'HP ', textStyle);

    charPanel.textsContainer = add.container(x, y, [texts.name, texts.hp]);

    return this;
  }

  createTilePanelText() {
    const { add, gameMap }  = this.scene;
    const { tilePanel }     = this.panels;
    const { texts }         = tilePanel;
    const { left, top }     = tilePanel.bounds;
    const { textStyle }     = this.config;

    let { x, y } = gameMap.layers.tilePanel.tileToWorldXY(left, top);

    x += 20;
    y += 10;

    texts.name  = add.text(0, 0, ' - ', Object.assign({}, textStyle, { fontSize: 40 }));
    texts.def   = add.text(0, 50, 'DEF. ', textStyle);
    texts.avo   = add.text(0, 70, 'AVO. ', textStyle);

    tilePanel.textsContainer = add.container(x, y, [texts.name, texts.def, texts.avo]);

    return this;
  }

  disableEvents() {
    this.scene.events.off('cursorMoved', this.updatePanels);

    return this;
  }

  enableEvents() {
    this.scene.events.on('cursorMoved', this.updatePanels);

    return this;
  }

  /**
   * Find and set a panel top/left/right/bottom boundaries.
   * @param {String} name Panel's name.
   */
  findPanelBounds(name = '') {
    const { [name]: layer } = this.scene.gameMap.layers;
    const { bounds } = this.panels[name];

    const { x, y } = layer.findTile(
      tile => typeof tile === 'object',
      undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true });

    bounds.top  = y;
    bounds.left = x;

    for (let coordX = x; layer.hasTileAt(coordX, y); coordX++) {
      bounds.right = coordX;
    }

    for (let coordY = y; layer.hasTileAt(x, coordY); coordY++) {
      bounds.bottom = coordY;
    }

    return this;
  }

  /**
 * Return the current pointed characters information.
 * @param {Object} param0 XY coordinates.
 * @param {GameMap} param1 GameMap containing layers.
 */
  getCharPanelValues({ x = 0, y = 0 }, { layers = {} }) {
    const defaultValues = {
      hp: 0,
      name: ''
    };

    let values = Object.assign({}, defaultValues);

    let tile = {};

    if (layers.characters.hasTileAt(x, y)) {
      tile = layers.characters.getTileAt(x, y);
    }

    if (tile.properties && tile.properties.tileUnit) {
      const { unit } = tile.properties.tileUnit;

      values = Object.assign({}, values, {
        hp: `HP ${ unit.get('hp') } / ${ unit.get('fullHP') }`,
        name: unit.get('name')
      });
    }

    return values;
  }

  /**
   * Return the panels' name to create.
   * @returns {Array<String>} Array of panels' name.
   */
  getPanelsNames() {
    return ['tilePanel', 'charPanel'];
  }

  /**
  * Return the next empty corner name.
  * @returns {String} Next empty corner's name.
  */
  getNextEmptyCornerName() {
    let nextCorner;

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

  /**
   * Get the next empty corner coordinates.
   * @returns {Object} Contains x/y numbers representing coordinates.
   */
  getNextEmptyCornerXY(nextCorner = '') {
    return this.cornersXY[nextCorner];
  }

  /**
   * Return the current highlighted tile information.
   * @return {Object} tile information.
   */
  getTilePanelValues({ x, y }, { layers }) {
    const defaultValues = {
      name: ' - ',
      avo: 0,
      def: 0
    };

    let values = Object.assign({}, defaultValues);

    let tile = {};

    if (layers.objects.hasTileAt(x, y)) {
      tile = layers.objects.getTileAt(x, y);

    } else if (layers.hiddenFloor.hasTileAt(x, y)) {
      tile = layers.hiddenFloor.getTileAt(x, y);

    } else if (layers.carpet.hasTileAt(x, y)) {
      tile = layers.carpet.getTileAt(x, y);

    } else if (layers.floor.hasTileAt(x, y)) {
      tile = layers.floor.getTileAt(x, y);
    }

    if (tile) {
      const { properties } = tile;
      values = Object.assign({}, values, properties);
    }

    return Object.assign(values, {
      avo: `AVO.    ${values.avo}`,
      def: `DEF.    ${values.def}`
    });
  }

  /**
   * Create UI panels.
   */
  init() {
    this
      .getPanelsNames()
      .map(name => {
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
      .map(name => this.movePanel(name));

    return this;
  }

  /**
   * Create panel's properties.
   * @param {String} name Panel's name.
   */
  initProperties(name) {
    this.panels[name] = {
      bounds: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      texts: {}
    };

    return this;
  }

  listenToEvents() {
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
  movePanel(name = '') {
    const panel = this.panels[name];
    const panelLayer = this.scene.gameMap.layers[name];

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

    this.updatePanelTextPosition({ x: textX + 20, y: textY + 10 }, name);

    return this;
  }

  /**
   * Set predefined corners according to window dimentions.
   */
  setAutoCorners() {
    const { cornersXY } = this;
    const { innerHeight: height, innerWidth: width } = window;

    const rightX = width - 200;
    const bottomY = height - 140;

    const { x, y } = this.scene.gameMap.map.worldToTileXY(rightX, bottomY);

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
  setTextPanel(name = '', values = {}) {
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
   * @param {Object} charStats Character's stats.
   */
  toggleCharPanel(charStats = {}) {
    const { charPanel } = this.scene.gameMap.layers;
    const { textsContainer } = this.panels.charPanel;

    if (charStats.name) {
      if (!charPanel.visible || !textsContainer.visible) {
        charPanel.setVisible(true);
        textsContainer.setVisible(true);
      }

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
   * @param {Object} scene Phaser scene where the event fired.
   */
  updateCharPanel(tileCursor = {}, scene = {}) {
    const charPanel = 'charPanel';
    const { gameMap } = scene;
    const charValues = this.getCharPanelValues(tileCursor, gameMap);

    if (!charValues.name) {
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
  updateCorner(name = '', newCorner = '') {
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
   * @param {Object} tileCursor Phaser tile object representing user cursor.
   * @param {Object} scene Phaser scene where the event fired.
   */
  updatePanels(tileCursor = {}, scene = {}) {
    scene.mapUI.updateTilePanel(tileCursor, scene);
    scene.mapUI.updateCharPanel(tileCursor, scene);

    return this;
  }

  /**
   * Move text's panel when the panel has moved.
   * @param {Object} param0 X/Y coordinates
   * @param {String} name Panel's name.
   */
  updatePanelTextPosition({ x = 0, y = 0 }, name = '') {
    this.panels[name].textsContainer.setPosition(x, y);

    return this;
  }

  /**
   * Update tile panel with refreshed texts values.
   * @param {Object} tileCursor Phaser tile object representing user cursor.
   * @param {Object} scene Phaser scene where the event fired.
   */
  updateTilePanel(tileCursor = {}, scene = {}) {
    const tilePanel = 'tilePanel';
    const { gameMap } = scene;
    const tileValues = this.getTilePanelValues(tileCursor, gameMap);

    this
      .setTextPanel(tilePanel, tileValues)
      .checkPanelPosition(tileCursor, tilePanel);

    return this;
  }
}
