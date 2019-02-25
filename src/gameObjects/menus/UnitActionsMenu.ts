import {
  eventName as unitEvent,
  UnitActions,
}  from '../../actions/unit';

import TileUnit         from '../TileUnit';
import ActionButton     from './ActionButton';
import ActionsMenu      from './ActionsMenu';

export default class UnitActionsMenu extends ActionsMenu {
  constructor(scene: Phaser.Scene, layer: Phaser.Tilemaps.DynamicTilemapLayer) {
    super(scene, layer);
  }

  protected createAdditionalButtons() {
    const container = this.scene.add.container(0, 0);

    if (!this.tile) { return container; }

    const tileUnit = this.tile.properties.tileUnit as TileUnit;
    const canAttack = tileUnit.isEnemyInAtkRange();

    if (canAttack) {
      const attack = this.createAtkButton();
      container.add(attack);
    }

    return container;
  }

  protected createPermanentButtons() {
    const cancel = this.createCancelButton();
    const items = this.createItemsButton();
    const wait = this.createWaitButton();

    const container = this.scene.add
      .container(0, 0, [cancel, wait, items])
      .setVisible(false);

    return container;
  }

  protected onPointerUpOutside() {
    this
      .hide()
      .sendAction(UnitActions.cancel);
  }

  private createAtkButton() {
    const button = new ActionButton(this.scene, {
      coord: { x: 0, y: 90 },
      text: 'attack',
    });

    button.on('click', () => {
      this.hide();

      setTimeout(() => {
        this.sendAction(UnitActions.attack);
      }, 20);
    });

    return button.getContainer();
  }

  private createCancelButton() {
    const button = new ActionButton(this.scene, {
      text: 'cancel',
    });

    button.on('click', () => {
      this
        .hide()
        .sendAction(UnitActions.cancel);
    });

    return button.getContainer();
  }

  private createItemsButton() {
    const button = new ActionButton(this.scene, {
      coord: { x: 0, y: 60 },
      text: 'items',
    });

    button.on('click', () => { this.hide(); });

    return button.getContainer();
  }

  private createWaitButton() {
    const button = new ActionButton(this.scene, {
      coord: { x: 0, y: 30 },
      text: 'wait',
    });

    button.on('click', () => {
      this
        .hide()
        .sendAction(UnitActions.wait);
    });

    return button.getContainer();
  }

  /** Send unit's action to the scene (through event). */
  private sendAction(action: string) {
    this.scene.events.emit(`${unitEvent}${action}`, this.tile);
  }
}
