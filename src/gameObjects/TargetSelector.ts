import { colors, fonts } from '../const/config';
import TileUnit from './TileUnit';

export default class TargetSelector extends Phaser.GameObjects.GameObject {
  private currentTileTargetMarker?: Phaser.Tilemaps.Tile;

  private currentTileTargetMarkerIndex = 0;

  private linesTiles = {
    top: [2674, 2675, 2675, 2675, 2675, 2676],
    middle: [2704, 2705, 2705, 2705, 2705, 2706],
    bottom: [2734, 2735, 2735, 2735, 2735, 2736],
  };

  private panelLayer: Phaser.Tilemaps.DynamicTilemapLayer;

  private targetsLayer: Phaser.Tilemaps.DynamicTilemapLayer;

  private tilesMarkers: Phaser.Tilemaps.Tile[] = [];

  private tilesTargets: TileTargets = {};

  // @ts-ignore : This prop is initialized in createTargetMarker.
  private visualTargetMarker: Phaser.GameObjects.Container;

  // @ts-ignore : This prop is initialized in createTextsBattleInfo.
  private textsFightInfo: TextsFightInfo;

  constructor(config: TargetSelectorConfig) {
    super(config.scene, 'TargetSelector');

    const { panelLayer, targetsLayer } = config;

    this.panelLayer = panelLayer;
    this.targetsLayer = targetsLayer;

    this.panelLayer.setScrollFactor(0);

    this.createTargetMarker();

    this
      .createFightInfoContainer()
      .hide();
  }

  // ~~~~~~~~~~~~~~~~~
  // PUBLIC FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  public hide() {
    this.panelLayer.setVisible(false);
    this.targetsLayer.setVisible(false);
    this.textsFightInfo.container.setVisible(false);

    this
      .stopTargetAnimation()
      .cleanUpMarkers()
      .cleanUpTilesTargets()
      .disableEvents();

    return this;
  }

  public show(config: OpenTargetSelectorEventConfig) {
    const { markers, targets, attackerTile, weapon } = config;

    this.panelLayer.setVisible(true);
    this.targetsLayer.setVisible(true);
    this.textsFightInfo.container.setVisible(true);

    this.markTargets(markers);

    this.currentTileTargetMarker = this.tilesMarkers[this.currentTileTargetMarkerIndex];

    this
      .startTargetMarkerAnimation()
      .initTilesTargets(targets)
      .updateTextsFightInfo(attackerTile, weapon)
      .enableEvents();

    return this;
  }

  private initTilesTargets(targets: Phaser.Tilemaps.Tile[]) {
    targets.map((target) => {
      this.tilesTargets[`${target.x},${target.y}`] = target;
    });

    return this;
  }

  private cleanUpTilesTargets() {
    for (const [key] of Object.entries(this.tilesTargets)) {
      delete this.tilesTargets[key];
    }

    this.tilesTargets = {};

    return this;
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  private cleanUpMarkers() {
    this.tilesMarkers
      .map((marker) => {
        this.targetsLayer.removeTileAt(marker.x, marker.y);
      });

    this.tilesMarkers = [];

    return this;
  }

  private createBottomLine(x: number, y: number) {
    const columns = this.linesTiles.bottom;

    columns
      .map((value, index) => {
        this.panelLayer.putTileAt(value, x + index, y);
      });

    return this;
  }

  private createFightInfoContainer() {
    const x = 1;
    const y = 1;
    let middleY = 0;

    this.createTopLine(x, y);

    for (middleY = 1; middleY < 5; middleY++) {
      this.createMiddleLine(x, y + middleY);
    }

    this.createBottomLine(x, y + middleY);

    let { x: textX, y: textY } = this.panelLayer.tilemap.tileToWorldXY(x, y);

    textX += 20;
    textY += 20;

    this.createFightInfoTexts(textX, textY);

    return this;
  }

  private createMiddleLine(x: number, y: number) {
    const columns = this.linesTiles.middle;

    columns
      .map((value, index) => {
        this.panelLayer.putTileAt(value, x + index, y);
      });

    return this;
  }

  private createTargetMarker() {
    const circle = this.scene.add.circle(0, 0, 30);
    circle.setStrokeStyle(5, 0xe74c3c);

    this.visualTargetMarker = this.scene.add.container(10, 10, [circle]);

    return this;
  }

  private createFightInfoTexts(x: number, y: number) {
    const { add } = this.scene;
    const style = { ...fonts.styles.normal, ...{ color: 'black' }};

    const attackerName  = add.text(0, 0, '',  { ...style, ...{ fontSize: 40 } });
    const attackerHP    = add.text(0, 40, '', style);
    const attackerMt    = add.text(0, 60, '', style);
    const attackerHit   = add.text(0, 80, '', style);

    const container = add.container(x, y,
      [
        attackerName,
        attackerHP,
        attackerMt,
        attackerHit,
      ],
    ).setScrollFactor(0, 0);

    this.textsFightInfo = {
      attackerName,
      attackerHP,
      attackerHit,
      attackerMt,
      container,
    };

    return this;
  }

  private createTopLine(x: number, y: number) {
    const columns = this.linesTiles.top;

    columns
      .map((value, index) => {
        this.panelLayer.putTileAt(value, x + index, y);
      });

    return this;
  }

  private disableEvents() {
    const { input } = this.scene;

    input.off('pointerup', this.onPointerUpOutside, this);

    return this;
  }

  private disableMapEvents() {
    this.scene.events.emit('unsubscribeMapEvents');
    return this;
  }

  private enableEvents() {
    const { input } = this.scene;

    // NOTE: Fired too early if not deffered.
    setTimeout(() => {
      input.on('pointerup', this.onPointerUpOutside, this);
    }, 100);

    return this;
  }

  private enableMapEvents() {
    // NOTE: pointerup fires too soon after re-enabling GameMap events.
    setTimeout(() => {
      this.scene.events.emit('subscribeMapEvents');
    }, 10);

    return this;
  }

  private markTargets(targets: Phaser.Tilemaps.Tile[]) {
    targets
      .map((tile) => {
        const marker = this.targetsLayer.putTileAt(2569, tile.x, tile.y);
        marker.tint = colors.tileAttack;
        marker.setAlpha(.5);

        this.tilesMarkers.push(marker);
      });

    return this;
  }

  private onPointerUpOutside() {
    this.hide();
  }

  private startTargetMarkerAnimation() {
    const tile = this.currentTileTargetMarker;

    if (!tile) { return this; }

    this.visualTargetMarker.setVisible(true);
    this.visualTargetMarker.setAlpha(1);

    const circle = this.visualTargetMarker.list[0] as Phaser.GameObjects.Ellipse;

    let { x: worldX, y: worldY } = this.panelLayer.tileToWorldXY(tile.x, tile.y);

    worldX -= this.scene.cameras.main.scrollX;
    worldY -= this.scene.cameras.main.scrollY;

    this.visualTargetMarker.setPosition(worldX + 13, worldY + 13);

    this.scene.tweens.add({
      targets: circle,
      scaleX: .7,
      scaleY: .7,
      duration: 500,
    });

    this.scene.tweens.add({
      targets: circle,
      scaleX: .8,
      scaleY: .8,
      duration: 1000,
      delay: 600,
      yoyo: true,
      repeat: -1,
    });

    return this;
  }

  private stopTargetAnimation() {
    this.visualTargetMarker.setVisible(false);
    this.visualTargetMarker.setAlpha(0);

    if (this.currentTileTargetMarker) {
      this.scene.tweens.killTweensOf(this.currentTileTargetMarker);
    }

    return this;
  }

  private switchToNextTarget() {
    this.currentTileTargetMarkerIndex = (this.currentTileTargetMarkerIndex + 1) % this.tilesMarkers.length;
    this.currentTileTargetMarker = this.tilesMarkers[this.currentTileTargetMarkerIndex];
  }

  private updateTargetMarker() {
    // update circle
  }

  private updateTextsFightInfo(unit: Phaser.Tilemaps.Tile, weapon: Weapon) {
    if (!this.currentTileTargetMarker) {
      throw new Error('Ghost opponent is not allowed.');
    }

    const { x, y } = this.currentTileTargetMarker;

    const opponentTile = this.tilesTargets[`${x},${y}`];

    const opponentTileUnit = opponentTile.properties.tileUnit as TileUnit;
    const opponentUnit = opponentTileUnit.getUnit();

    const attackerTileUnit = unit.properties.tileUnit as TileUnit;

    const attackerNameValue = attackerTileUnit.getUnit().name;
    const attackerHPValue = attackerTileUnit.getUnit().hp;
    const attackerMightValue = attackerTileUnit.getUnit().getAtk(opponentUnit);
    const attackerHitValue = attackerTileUnit.getUnit().getAccuracy(opponentUnit);

    const { attackerName, attackerHP, attackerMt, attackerHit } = this.textsFightInfo;

    attackerName.setText(attackerNameValue);
    attackerHP.setText(`HP    ${attackerHPValue}`);
    attackerMt.setText(`Mt    ${attackerMightValue}`);
    attackerHit.setText(`HIT  ${attackerHitValue}`);

    return this;
  }
}
