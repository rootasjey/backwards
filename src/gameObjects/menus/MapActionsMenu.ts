import {
  eventName as mapEvent,
  MapActions,
} from '../../actions/map';

import ActionButton   from './ActionButton';
import ActionsMenu    from './ActionsMenu';

export default class MapActionsMenu extends ActionsMenu {
  constructor(scene: Phaser.Scene, layer: Phaser.Tilemaps.DynamicTilemapLayer) {
    super(scene, layer);
  }

  protected createAdditionalButtons() {
    return this.scene.add.container(0, 0);
  }

  protected createPermanentButtons() {
    const cancel = this.createCancelButton();
    const endTurn = this.createEndTurnButton();
    const suspend = this.createSuspendButton();

    const container = this.scene.add
      .container(0, 0, [cancel, endTurn, suspend])
      .setVisible(false);

    return container;
  }

  private createCancelButton() {
    const button = new ActionButton(this.scene, {
      text: 'cancel',
    });

    button.on('click', () => {
      this.hide();
      this.sendAction(MapActions.cancel);
    });

    return button.getContainer();
  }

  private createEndTurnButton() {
    const button = new ActionButton(this.scene, {
      coord: { x: 0, y: 30 },
      text: 'end turn',
    });

    button.on('click', () => {
      this.hide();
      this.sendAction(MapActions.endTurn);
    });

    return button.getContainer();
  }

  private createSuspendButton() {
    const button = new ActionButton(this.scene, {
      coord: { x: 0, y: 60 },
      text: 'suspend',
    });

    button.on('click', () => {
      this.hide();
      this.sendAction(MapActions.suspend);
    });

    return button.getContainer();
  }

  /** Send unit's action to the scene (through event). */
  private sendAction(action: string) {
    this.scene.events.emit(`${mapEvent}${action}`);
  }
}
