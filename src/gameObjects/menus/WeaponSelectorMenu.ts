import {
  eventName as weaponSelectorEvent,
  WeaponSelectorActions,
} from '../../actions/weaponSelector';

import TileUnit from '../TileUnit';
import ActionButton from './ActionButton';
import ActionsMenu from './ActionsMenu';

export default class WeaponSelectorMenu extends ActionsMenu {
  protected linesTiles = {
    top     : [2674, 2675, 2675, 2675, 2675, 2675, 2675, 2676],
    middle  : [2704, 2705, 2705, 2705, 2705, 2705, 2705, 2706],
    bottom  : [2734, 2735, 2735, 2735, 2735, 2735, 2735, 2736],
  };

  private buttonWidth: number = 200;

  constructor(scene: Phaser.Scene, layer: Phaser.Tilemaps.DynamicTilemapLayer) {
    super(scene, layer);
  }

  protected createAdditionalButtons() {
    const container = this.scene.add.container(0, 0);

    const { tile } = this;

    if (tile) {
      const tileUnit = tile.properties.tileUnit as TileUnit;
      const unit = tileUnit.getUnit();
      const weapons = unit.inventory.getWeapons();

      const weaponButtons = weapons.map((weapon, index) => {
        const coord = { x: 0, y: (index + 1) * 30 };
        return this.createWeaponButton({ coord, index, weapon });
      });

      container.add(weaponButtons);
    }

    return container;
  }

  protected createPermanentButtons() {
    const container = this.scene.add.container(0, 0);

    const cancel = this.createCancelButton();

    container.add(cancel);

    return container;
  }

  protected onPointerUpOutside() {
    this
      .hide()
      .sendAction(WeaponSelectorActions.cancel);
  }

  private createCancelButton() {
    const button = new ActionButton(this.scene, {
      text: 'cancel',
      width: 200,
    });

    button.on('click', () => {
      this
        .hide()
        .sendAction(WeaponSelectorActions.cancel);
    });

    return button.getContainer();
  }

  private createWeaponButton(config: CreateWeaponButtonConfig) {
    const { coord, index, weapon } = config;

    const button = new ActionButton(this.scene, {
      coord,
      text: `${weapon.name}         x${weapon.usage}`,
      width: this.buttonWidth,
    });

    button
      .on('click', () => {
        this.hide();
      })
      .on('cusorchanged', () => {
        const { tile } = this;

        if (!tile) { return; }

        const tileUnit = tile.properties.tileUnit as TileUnit;
        tileUnit.showWeaponRange(index);
      });

    return button.getContainer();
  }

  /** Send attack's action to the scene (through event). */
  private sendAction(action: string) {
    this.scene.events.emit(`${weaponSelectorEvent}${action}`, this.tile);
    return this;
  }
}
