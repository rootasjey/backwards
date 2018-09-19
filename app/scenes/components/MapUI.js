export default class MapUI extends Phaser.GameObjects.GameObject {
  constructor(scene) {
    super(scene, 'MapUI');

    this.texts = {
      avo: { },
      def: { },
      name: { }
    };

    this.location = 'right';

    this.coord = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };
  }

  createTileInfoUI() {
    const { left, top } = this.coord;

    const { x, y } = this.scene.gameMap.layers.uiTileInfo.tileToWorldXY(left, top);
    const pixelX = x + 20;
    const pixelY = y + 10;

    const style = { fontFamily: 'Kenney Pixel', fontSize: 30 };

    this.texts.name = this.scene.add.text(pixelX, pixelY, ' - ', Object.assign({}, style, { fontSize: 40 }));
    this.texts.def = this.scene.add.text(pixelX, pixelY + 50, 'DEF. ', style);
    this.texts.avo = this.scene.add.text(pixelX, pixelY + 70, 'AVO. ', style);

    return this;
  }

  findTileInfoUIBounds() {
    const { uiTileInfo } = this.scene.gameMap.layers;
    let { coord } = this;

    const { x, y } = uiTileInfo.findTile(
      tile => typeof tile === 'object',
      undefined, undefined, undefined, undefined, undefined, { isNotEmpty: true });

    coord.top = y;
    coord.left = x;

    for (let coordX = x; uiTileInfo.hasTileAt(coordX, y); coordX++) {
      coord.right = coordX;
    }

    for (let coordY = y; uiTileInfo.hasTileAt(x, coordY); coordY++) {
      coord.bottom = coordY;
    }

    return this;
  }

  listenToEvents() {
    const { scene } = this;

    scene.events.on('subscribeMapUIEvents', this.enableEvents);
    scene.events.on('unsubscribeMapUIEvents', this.disableEvents);

    this.enableEvents();
  }

  enableEvents() {
    this.scene.events.on('cursorMoved', this.updateTileInfo);
  }

  disableEvents() {
    this.scene.events.off('cursorMoved', this.updateTileInfo);
  }

  init() {
    this.findTileInfoUIBounds()
      .createTileInfoUI()
      .listenToEvents();
  }

  /**
   * Display tile information
   * along side characters and objects info.
   */
  updateTileInfo(tileCursor, scene) {
    const { gameMap, mapUI } = scene;

    const info = mapUI.getTileInfo(tileCursor, gameMap);

    mapUI
      .drawTileInfo(info)
      .checkTileInfoXY(tileCursor, gameMap.layers.uiTileInfo);
  }

  /**
   * Return the current highlighted tile information.
   * @return {Object} tile information.
   */
  getTileInfo({x, y}, {layers}) {
    const defaultTileValues = {
      name: ' - ',
      avo: 0,
      def: 0
    };

    let tileValues = Object.assign({}, defaultTileValues);

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
      tileValues = Object.assign({}, tileValues, properties);
    }

    return tileValues;
  }

  /**
   * Draw tile information to the screen.
   * @param {Object} info Tile information.
   */
  drawTileInfo(info = {}) {
    this.texts.name.setText(info.name);
    this.texts.def.setText('DEF. ' + info.def);
    this.texts.avo.setText('AVO. ' + info.avo);

    return this;
  }

  /**
   * Check tile info XY coord.
   */
  checkTileInfoXY({ x, y }, uiTileInfo) {
    const { coord } = this;
    const distance = 3;

    const isCloseLeft = Math.abs(x - coord.left) <= distance;
    const isCloseRight = Math.abs(x - coord.right) <= distance;
    const isCloseTop = Math.abs(y - coord.top) <= distance;
    const isCloseBottom = Math.abs(y - coord.bottom) <= distance;

    if (isCloseLeft && isCloseBottom) {
      this.movePanel(uiTileInfo);
      return;
    }

    if (isCloseLeft && isCloseTop) {
      this.movePanel(uiTileInfo);
      return;
    }

    if (isCloseRight && isCloseTop) {
      this.movePanel(uiTileInfo);
      return;
    }

    if (isCloseRight && isCloseBottom) {
      this.movePanel(uiTileInfo);
      return;
    }
  }

  movePanel(uiTileInfo) {
    const { coord } = this;
    let newStartX = 0;
    let newStartY = 0;

    let { location } = this;

    if (location === 'left') {
      newStartX = 21;
      newStartY = 1;

      this.location = 'right';
    }

    if (location === 'right') {
      newStartX = 1;
      newStartY = 1;

      this.location = 'left';
    }

    uiTileInfo.copy(
      coord.left,
      coord.top,
      coord.right - coord.left + 1,
      coord.bottom - coord.top + 1,
      newStartX,
      newStartY);

    uiTileInfo.forEachTile((tile) => {
      uiTileInfo.removeTileAt(tile.x, tile.y);

    }, undefined,
    coord.left,
    coord.top,
    coord.right - coord.left + 1,
    coord.bottom - coord.top + 1);

    this.findTileInfoUIBounds();

    this.updateTileInfoTextPosition(uiTileInfo);
  }

  updateTileInfoTextPosition(uiTileInfo) {
    const { left, top } = this.coord;

    const { x, y } = uiTileInfo.tileToWorldXY(left, top);
    const pixelX = x + 20;
    const pixelY = y + 10;

    this.texts.name.setPosition(pixelX, pixelY);
    this.texts.def.setPosition(pixelX, pixelY + 50);
    this.texts.avo.setPosition(pixelX, pixelY + 70);
  }
}
