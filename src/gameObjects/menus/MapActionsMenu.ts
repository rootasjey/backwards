import { MapActions } from '../../actions/map';
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
      onClick: () => {
        this.hide();
        this.sendAction(MapActions.cancel);
      },
      text: 'cancel',
    });

    return button.getContainer();
  }

  private createEndTurnButton() {
    const button = new ActionButton(this.scene, {
      coord: { x: 0, y: 30 },
      onClick: () => {
        this.hide();
        this.sendAction(MapActions.endTurn);
      },
      text: 'end turn',
    });

    return button.getContainer();
  }

  private createSuspendButton() {
    const button = new ActionButton(this.scene, {
      coord: { x: 0, y: 60 },
      onClick: () => {
        this.hide();
        this.sendAction(MapActions.suspend);
      },
      text: 'suspend',
    });

    return button.getContainer();
  }

  /** Send unit's action to the scene (through event). */
  private sendAction(action: string) {
    this.scene.events.emit(`map:${action}`);
  }
}
