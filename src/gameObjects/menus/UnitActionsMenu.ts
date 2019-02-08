import { UnitActions }  from '../../actions/unit';
import ActionButton     from './ActionButton';
import ActionsMenu      from './ActionsMenu';

export default class UnitActionsMenu extends ActionsMenu {
  constructor(scene: Phaser.Scene, layer: Phaser.Tilemaps.DynamicTilemapLayer) {
    super(scene, layer);
  }

  protected createAdditionalButtons() {
    return this.scene.add.container(0, 0);
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

  private createCancelButton() {
    const button = new ActionButton(this.scene, {
      onClick: () => {
        this.
          hide()
          .sendAction(UnitActions.cancel);
      },
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
      onClick: () => {
        this.hide();
        this.sendAction(UnitActions.wait);
      },
      text: 'wait',
    });

    return button.getContainer();
  }

  /** Send unit's action to the scene (through event). */
  private sendAction(action: string) {
    this.scene.events.emit(`unit:${action}`, this.tile);
  }
}
