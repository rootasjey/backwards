import { fonts }          from '../const/config';
import { Game }           from './Game';
import MapActionsMenu     from './menus/MapActionsMenu';
import UnitActionsMenu    from './menus/UnitActionsMenu';
import WeaponSelectorMenu from './menus/WeaponSelectorMenu';
import TargetSelector     from './TargetSelector';

export default class MapUI extends Phaser.GameObjects.GameObject {
  private corners: MapUICorners = {
    topLeft     : '',
    topRight    : '',
    bottomRight : '',
    bottomLeft  : '',
  };

  private readonly cornersXY: MapUICornersXY = {
    topLeft     : { x: 1, y: 1 },
    topRight    : { x: 21, y: 1 },
    bottomRight : { x: 21, y: 21 },
    bottomLeft  : { x: 1, y: 21 },
  };

  private isUnitSelected: boolean = false;

  private readonly mapActionsMenu: MapActionsMenu;

  // @ts-expect-error : This prop is initialized in init() function.
  private panels: MapUIPanels = {};

  private readonly targetSelector: TargetSelector;

  private readonly unitActionsMenu: UnitActionsMenu;

  private readonly weaponSelectorMenu: WeaponSelectorMenu;

  /** Manage UI overlay on in-game maps. */
  constructor(scene: Phaser.Scene) {
    super(scene, 'MapUI');

    scene.add.existing(this);

    this.init();

    const { layers } = Game.gameMap;
    const { targetSelectorPanel: panelLayer, targetSelector: targetsLayer } = layers;

    this.mapActionsMenu     = new MapActionsMenu(scene, layers.unitActionsPanel);
    this.targetSelector     = new TargetSelector({ scene, panelLayer, targetsLayer });
    this.unitActionsMenu    = new UnitActionsMenu(scene, layers.unitActionsPanel);
    this.weaponSelectorMenu = new WeaponSelectorMenu(scene, layers.weaponSelectionPanel);
  }

  // ~~~~~~~~~~~~~~~~~
  // PUBLIC FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  /**
   * Check if the user cursor overlay a panel UI
   * with a min tile distance allowed between cursor & panel.
   */
  public checkPanelPosition(tile: Phaser.Tilemaps.Tile, panelName: string) {
    if (!tile) { return this; }

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

  private createUnitInfoPanelText() {
    const { add }           = this.scene;
    const { unitInfoPanel } = this.panels;
    const { texts }         = unitInfoPanel;
    const { left, top }     = unitInfoPanel.bounds;
    const { normal }        = fonts.styles;

    let { x, y } = Game.gameMap.layers.unitInfoPanel.tileToWorldXY(left, top);

    x += 20;
    y += 10;

    texts.name  = add.text(0, 0, ' hero name ', Object.assign({}, normal, { fontSize: 40 }));
    texts.hp    = add.text(0, 50, 'HP ', normal);

    unitInfoPanel.textsContainer = add
      .container(x, y, [texts.name, texts.hp])
      .setScrollFactor(0);

    return this;
  }

  private createTileInfoPanelText() {
    const { add }           = this.scene;
    const { tileInfoPanel } = this.panels;
    const { texts }         = tileInfoPanel;
    const { left, top }     = tileInfoPanel.bounds;
    const { normal }        = fonts.styles;

    let { x, y } = Game.gameMap.layers.tileInfoPanel.tileToWorldXY(left, top);

    x += 20;
    y += 10;

    texts.name = add.text(0, 0, ' - ', { ...normal, ...{ fontSize: 40 } });
    texts.def   = add.text(0, 50, 'DEF. ', normal);
    texts.avo   = add.text(0, 70, 'AVO. ', normal);

    tileInfoPanel.textsContainer = add
      .container(x, y, [texts.name, texts.def, texts.avo])
      .setScrollFactor(0);

    return this;
  }

  private disableEvents() {
    const { events } = this.scene;

    events.off('cursorMoved',         this.updatePanels,        this);
    events.off('openUnitActions',     this.openUnitActions,     this);
    events.off('openMapActions',      this.openMapActions,      this);
    events.off('openTargetSelector',  this.openTargetSelector,  this);
    events.off('openWeaponSelector',  this.openWeaponSelector,  this);
    events.off('showPanelsInfo',      this.onShowPanelsInfo,    this);
    events.off('hidePanelsInfo',      this.onHidePanelsInfo,    this);

    return this;
  }

  private enableEvents() {
    const { events } = this.scene;

    events.on('cursorMoved',        this.updatePanels,        this);
    events.on('openUnitActions',    this.openUnitActions,     this);
    events.on('openMapActions',     this.openMapActions,      this);
    events.on('openTargetSelector', this.openTargetSelector,  this);
    events.on('openWeaponSelector', this.openWeaponSelector,  this);
    events.on('hidePanelsInfo',     this.onHidePanelsInfo,    this);
    events.on('showPanelsInfo',     this.onShowPanelsInfo,    this);

    return this;
  }

  /** Find and set a panel top/left/right/bottom boundaries. */
  private findPanelBounds(name: string = '') {
    const bounds = this.getPanelBounds(name);

    const panel = this.panels[name];
    panel.bounds = bounds;

    return this;
  }

  /** Prevent camera scroll */
  private fixUILayers() {
    const { layers } = Game.gameMap;

    layers.tileInfoPanel.setScrollFactor(0);
    layers.unitInfoPanel.setScrollFactor(0);

    return this;
  }

  private getPanelBounds(name: string) {
    const bounds = {
      bottom: 0,
      left  : 0,
      right : 0,
      top   : 0,
    };

    const layer = Game.gameMap.layers[name] as Phaser.Tilemaps.DynamicTilemapLayer;

    const tileToFind = layer.findTile(
      (tile: Phaser.Tilemaps.Tile) => typeof tile === 'object',
      undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true });

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
  private getUnitInfoPanelValues(tileCursor: Phaser.Tilemaps.Tile): UnitInfoPanelStats {
    const defaultValues: UnitInfoPanelStats = {
      hp  : 0,
      name: '',
    };

    if (!tileCursor) { return defaultValues; }

    const { x, y } = tileCursor;
    const layerCharacters = Game.gameMap.layers.units;

    let values = Object.assign({}, defaultValues);

    const tile = layerCharacters.getTileAt(x, y);

    if (tile?.properties && tile.properties.tileUnit) {
      const { unit } = tile.properties.tileUnit;

      values = Object.assign({}, values, {
        hp  : `HP ${unit.hp} / ${unit.fullHP}`,
        name: tile.properties.unitName,
      });
    }

    return values;
  }

  /** Return the panels' name to create. */
  private getPanelsNames(): string[] {
    return ['tileInfoPanel', 'unitInfoPanel'];
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
  private getTileInfoPanelValues(tileCursor: Phaser.Tilemaps.Tile): TileInfoPanelValues {
    const defaultValues = {
      name: ' - ',
      avo : 0,
      def : 0,
    };

    const { layers } = Game.gameMap;

    if (!tileCursor) {
      return Object.assign(defaultValues, {
        avo: `AVO.    ${defaultValues.avo}`,
        def: `DEF.    ${defaultValues.def}`,
      });
    }

    const { x, y } = tileCursor;

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
      .fixUILayers()
      .getPanelsNames()
      .map((name) => {
        this
          .initProperties(name)
          .findPanelBounds(name);
      });

    this
      .createUnitInfoPanelText()
      .createTileInfoPanelText()
      .listenToEvents()
      .setAutoCorners()
      .toggleUnitInfoPanel()
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
   */
  private movePanel(name: string) {
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

  private onHidePanelsInfo() {
    this.isUnitSelected = true;

    const { layers } = Game.gameMap;

    layers.tileInfoPanel.setVisible(false);
    layers.unitInfoPanel.setVisible(false);

    const tileInfoPanelContainer = this.panels.tileInfoPanel.textsContainer;
    const unitInfoPanelContainer = this.panels.unitInfoPanel.textsContainer;

    if (tileInfoPanelContainer) {
      tileInfoPanelContainer.setVisible(false);
    }

    if (unitInfoPanelContainer) {
      unitInfoPanelContainer.setVisible(false);
    }
  }

  private onShowPanelsInfo() {
    this.isUnitSelected = false;

    const { layers } = Game.gameMap;

    layers.tileInfoPanel.setVisible(true);
    layers.unitInfoPanel.setVisible(true);

    const tileInfoPanelContainer = this.panels.tileInfoPanel.textsContainer;
    const unitInfoPanelContainer = this.panels.unitInfoPanel.textsContainer;

    if (tileInfoPanelContainer) {
      tileInfoPanelContainer.setVisible(true);
    }

    if (unitInfoPanelContainer) {
      unitInfoPanelContainer.setVisible(true);
    }
  }

  private openMapActions(cursor: Phaser.Tilemaps.Tile) {
    this.mapActionsMenu.show(cursor);
  }

  private openUnitActions(cursor: Phaser.Tilemaps.Tile, tile: Phaser.Tilemaps.Tile) {
    this.unitActionsMenu.show(cursor, { tile });
  }

  private openTargetSelector(config: OpenTargetSelectorEventConfig) {
    this.targetSelector.show(config);
  }

  private openWeaponSelector(cursor: Phaser.Tilemaps.Tile, tile: Phaser.Tilemaps.Tile) {
    this.weaponSelectorMenu.show(cursor, { tile });
  }

  /** Set predefined corners according to window dimentions. */
  private setAutoCorners() {
    const { cornersXY } = this;
    const { innerHeight: windowsHeight, innerWidth: windowWidth } = window;

    const { displayHeight, displayWidth } = Game.gameMap.layers.tileInfoPanel;

    const height = windowsHeight > displayHeight ? displayHeight : windowsHeight;
    const width = windowWidth > displayWidth ? displayWidth : windowWidth;

    let { x, y } = Game.gameMap.map.worldToTileXY(width, height);

    x -= 9;
    y -= 5;

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
   */
  private toggleUnitInfoPanel(charStats?: UnitInfoPanelStats) {
    const { unitInfoPanel } = Game.gameMap.layers;
    const { textsContainer } = this.panels.unitInfoPanel;

    if (!textsContainer) { return this; }

    if (!charStats || charStats.name.length === 0) {
      if (unitInfoPanel.visible) { unitInfoPanel.setVisible(false); }
      if (textsContainer.visible) { textsContainer.setVisible(false); }

      return this;
    }

    if (!unitInfoPanel.visible || !textsContainer.visible) {
      unitInfoPanel.setVisible(true);
      textsContainer.setVisible(true);

      return this;
    }

    if (unitInfoPanel.visible || textsContainer.visible) {
      unitInfoPanel.setVisible(false);
      textsContainer.setVisible(false);
    }

    return this;
  }

  /** Set a new corner to the targeted panel. */
  private updateCorner(panelName: string, newCorner: string) {
    // Empty last corner
    Object
      .entries(this.corners)
      .some(([key, value]) => {
        if (value === panelName) {
          this.corners[key] = '';
          return true;
        }

        return false;
      });

    this.corners[newCorner] = panelName;

    return this;
  }

  /** React to user inputs -> cursor moved. */
  private updatePanels(tileCursor: Phaser.Tilemaps.Tile) {
    if (this.isUnitSelected) { return; }

    this.updateTileInfoPanel(tileCursor);
    this.updateUnitInfoPanel(tileCursor);

    return this;
  }

  /**
   * Move text's panel when the panel has moved.
   * Takes camera scroll into account.
   */
  private updatePanelTextPosition({ x = 0, y = 0 }, panelName = '') {
    x = x + 20 - this.scene.cameras.main.scrollX;
    y = y + 10 - this.scene.cameras.main.scrollY;

    const { textsContainer } = this.panels[panelName];

    if (!textsContainer) { return this; }

    textsContainer.setPosition(x, y);

    return this;
  }

  /** Update tile panel with refreshed texts values. */
  private updateTileInfoPanel(tileCursor: Phaser.Tilemaps.Tile) {
    const panelName = 'tileInfoPanel';
    const panelValues = this.getTileInfoPanelValues(tileCursor);

    this
      .setTextPanel(panelName, panelValues)
      .checkPanelPosition(tileCursor, panelName);

    return this;
  }

  /** Update char panel with refreshed texts values. */
  private updateUnitInfoPanel(tileCursor: Phaser.Tilemaps.Tile) {
    const panelName = 'unitInfoPanel';
    const panelValues = this.getUnitInfoPanelValues(tileCursor);

    if (panelValues.name.length === 0) {
      this.toggleUnitInfoPanel(panelValues);
      return this;
    }

    this
      .setTextPanel(panelName, panelValues)
      .checkPanelPosition(tileCursor, panelName)
      .toggleUnitInfoPanel(panelValues);

    return this;
  }
}
